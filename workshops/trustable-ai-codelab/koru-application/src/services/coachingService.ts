import { GoogleGenAI } from '@google/genai';
import type {
  TelemetryFrame,
  CoachAction,
  Corner,
  HotCooldownState,
  ColdPathState,
} from '../types';
import { COACHES, DEFAULT_COACH, DECISION_MATRIX, RACING_PHYSICS_KNOWLEDGE } from '../utils/coachingKnowledge';
import { THUNDERHILL_EAST, SONOMA_CORNERS } from '../data/trackData';
import { createMachine, type InspectableMachine } from '../utils/stateMachine';

type CoachingCallback = (msg: { path: 'hot' | 'cold' | 'feedforward'; action?: CoachAction; text: string }) => void;

export interface CoachingServiceSnapshot {
  readonly hotCooldownState: HotCooldownState;
  readonly coldState: ColdPathState;
  readonly activeCornerId: number | null;
  readonly coachId: string;
  readonly lastHotAction: CoachAction | null;
  readonly hasApiKey: boolean;
}

type HotGateEvents = {
  ENTER_COOLDOWN: undefined;
  EXPIRE_COOLDOWN: undefined;
};

type ColdGateEvents = {
  DISPATCH_COLD: undefined;
  SETTLE_COLD: undefined;
  EXPIRE_COLD: undefined;
};

const ALL_CORNERS: Corner[] = [...THUNDERHILL_EAST.corners, ...SONOMA_CORNERS];

/**
 * Split-brain coaching engine:
 * - HOT: heuristic rules with humanized text (<50ms)
 * - COLD: Gemini Cloud (gemini-3.8-flash) with cooldown (2-5s)
 * - FEEDFORWARD: geofence-based corner advice (<150m)
 */
export class CoachingService {
  private coachId: string = DEFAULT_COACH;
  private listeners: CoachingCallback[] = [];
  private lastColdTime = 0;
  private lastHotAction: CoachAction | null = null;
  private lastHotTime = 0;
  private lastCorner: Corner | null = null;
  private coldCooldownMs = 15000;
  private hotCooldownMs = 1500;
  private apiKey: string | null = null;

  private readonly hotGateMachine = createMachine<
    HotCooldownState,
    Record<string, never>,
    HotGateEvents
  >({
    id: 'coaching-hot-gate',
    initial: 'ready',
    context: {},
    states: {
      ready: {
        on: {
          ENTER_COOLDOWN: 'cooldown',
        },
      },
      cooldown: {
        on: {
          EXPIRE_COOLDOWN: 'ready',
        },
      },
    },
  });

  private readonly coldGateMachine = createMachine<
    ColdPathState,
    Record<string, never>,
    ColdGateEvents
  >({
    id: 'coaching-cold-gate',
    initial: 'idle',
    context: {},
    states: {
      idle: {
        on: {
          DISPATCH_COLD: 'in_flight',
        },
      },
      in_flight: {
        on: {
          SETTLE_COLD: 'cooldown',
        },
      },
      cooldown: {
        on: {
          EXPIRE_COLD: 'idle',
        },
      },
    },
  });

  setCoach(id: string) { this.coachId = id; }
  getCoach() { return COACHES[this.coachId] || COACHES[DEFAULT_COACH]; }
  setApiKey(key: string) { this.apiKey = key || null; }
  onCoaching(cb: CoachingCallback) {
    this.listeners.push(cb);
    return () => { this.listeners = this.listeners.filter(l => l !== cb); };
  }

  private syncCooldownGates(now = Date.now()) {
    if (
      this.hotGateMachine.getState() === 'cooldown' &&
      now - this.lastHotTime >= this.hotCooldownMs
    ) {
      this.hotGateMachine.send('EXPIRE_COOLDOWN');
    }

    if (
      this.coldGateMachine.getState() === 'cooldown' &&
      now - this.lastColdTime >= this.coldCooldownMs
    ) {
      this.coldGateMachine.send('EXPIRE_COLD');
    }
  }

  /** Inspectable snapshot of Split-Brain hot cooldown, cold in-flight/cooldown gate, and active corner geofence */
  getSnapshot = (): CoachingServiceSnapshot => {
    this.syncCooldownGates(Date.now());
    return Object.freeze({
      hotCooldownState: this.hotGateMachine.getState(),
      coldState: this.coldGateMachine.getState(),
      activeCornerId: this.lastCorner?.id ?? null,
      coachId: this.coachId,
      lastHotAction: this.lastHotAction,
      hasApiKey: Boolean(this.apiKey),
    });
  };

  asInspectableMachine(
    id = 'coaching-gate',
  ): InspectableMachine<ColdPathState, keyof ColdGateEvents & string, CoachingServiceSnapshot> {
    return {
      id,
      getSnapshot: () => {
        const snapshot = this.getSnapshot();
        const coldSnap = this.coldGateMachine.getSnapshot();
        return {
          id,
          state: snapshot.coldState,
          allowedEvents: coldSnap.allowedEvents,
          context: snapshot,
        };
      },
    };
  }

  private emit(msg: Parameters<CoachingCallback>[0]) {
    this.listeners.forEach(cb => cb(msg));
  }

  /** Called on every telemetry frame */
  processFrame(frame: TelemetryFrame) {
    // 🧠 PROBE 2 — frame entering the coaching engine:
    // console.log('COACHING', { speed: frame.speed.toFixed(1), brake: frame.brake.toFixed(0), throttle: frame.throttle.toFixed(0) });
    this.runHotPath(frame);
    this.runFeedforward(frame);
    void this.runColdPath(frame);
  }

  // ── HOT PATH: instant heuristic commands ───────────────

  private runHotPath(frame: TelemetryFrame) {
    const now = Date.now();
    this.syncCooldownGates(now);
    if (this.hotGateMachine.getState() === 'cooldown') return;

    const data = {
      brake: frame.brake,
      throttle: frame.throttle,
      gLat: frame.gLat,
      gLong: frame.gLong,
      speed: frame.speed,
    };

    for (const rule of DECISION_MATRIX) {
      if (rule.check(data)) {
        if (rule.action === 'STABILIZE' || rule.action === 'MAINTAIN') return;
        if (rule.action === this.lastHotAction) return;

        this.lastHotAction = rule.action;
        this.lastHotTime = now;
        this.hotGateMachine.send('ENTER_COOLDOWN');

        const text = this.humanizeAction(rule.action, frame);
        // ⚡ PROBE 3 — reflex path firing:
        // console.log('Reflex', { action: rule.action, text, coach: this.coachId });
        this.emit({ path: 'hot', action: rule.action, text });
        return;
      }
    }
  }

  /** Convert action enum to coaching phrase — context-aware and persona-specific */
  private humanizeAction(action: CoachAction, frame: TelemetryFrame): string {
    const coach = this.getCoach();
    const speed = frame.speed;
    const gLat = Math.abs(frame.gLat);
    const gLong = frame.gLong;
    const brake = frame.brake;
    const throttle = frame.throttle;

    const fast = speed > 110;
    const med  = speed > 60 && speed <= 110;
    const highBrake  = brake > 70;
    const lightBrake = brake > 0 && brake <= 40;
    const highCornerLoad = gLat > 1.2;
    const highThrottle   = throttle > 70;

    // ── AJ: terse telemetry commands ────────────────────────
    if (coach.id === 'aj') {
      switch (action) {
        case 'THRESHOLD':    return highBrake ? 'Max brake. Hold.' : 'More brake. Now.';
        case 'TRAIL_BRAKE':  return highCornerLoad ? 'Trail. Ease.' : 'Trail off. Release.';
        case 'BRAKE':        return fast ? 'Brake hard.' : 'Brake.';
        case 'WAIT':         return 'Hold. Wait.';
        case 'TURN_IN':      return fast ? 'Late turn. Now.' : 'Turn.';
        case 'COMMIT':       return 'Commit. Go.';
        case 'ROTATE':       return highCornerLoad ? 'Rotate. Less wheel.' : 'Rotate.';
        case 'APEX':         return 'Apex. Hit it.';
        case 'THROTTLE':     return 'Throttle. Now.';
        case 'PUSH':         return fast ? 'Flat. Stay flat.' : 'Push. More speed.';
        case 'FULL_THROTTLE':return 'Flat.';
        case 'STABILIZE':    return 'Stabilize.';
        case 'MAINTAIN':     return 'Maintain.';
        case 'COAST':        return 'Pick a pedal.';
        case 'DONT_BE_A_WUSS': return 'Send it.';
      }
    }

    // ── Rachel: physics-grounded ─────────────────────────────
    if (coach.id === 'rachel') {
      switch (action) {
        case 'THRESHOLD':    return highBrake
          ? 'Maximum decel — you\'re saturating the friction circle.'
          : 'More brake pedal — you have front traction available.';
        case 'TRAIL_BRAKE':  return highCornerLoad
          ? 'Trail off the brake — front is loaded, ease the G-vector.'
          : 'Trail brake into the corner — transfer weight to the front axle.';
        case 'BRAKE':        return fast
          ? 'Brake now — shift weight forward, load the fronts.'
          : 'Light brake — set platform balance for the corner.';
        case 'WAIT':         return 'Patience — wait for weight to settle before turning.';
        case 'TURN_IN':      return lightBrake
          ? 'Turn in — you\'re still on brakes, use the understeer to your advantage.'
          : 'Turn in — front is free, commit to the line.';
        case 'COMMIT':       return highCornerLoad
          ? 'Committed — you\'re near the friction limit, maintain the line.'
          : 'Commit to the corner — trust available grip.';
        case 'ROTATE':       return 'Ease the wheel — let yaw momentum rotate the car.';
        case 'APEX':         return 'Clip the apex — tighten the radius, minimum speed point.';
        case 'THROTTLE':     return highCornerLoad
          ? 'Progressive throttle — don\'t overwhelm the rear on exit.'
          : 'Build throttle — shift weight rearward, drive off the corner.';
        case 'PUSH':         return fast
          ? 'You\'re at speed — max longitudinal, full friction circle forward.'
          : 'Straight — extend throttle application, chase the exit.';
        case 'FULL_THROTTLE':return 'Full throttle — max longitudinal G, rear is planted.';
        case 'STABILIZE':    return 'Neutral inputs — let the platform settle.';
        case 'MAINTAIN':     return 'Platform balanced — maintain this G-vector.';
        case 'COAST':        return `Coasting at ${speed.toFixed(0)} km/h — no G-vector. Pick a pedal to load the tires.`;
        case 'DONT_BE_A_WUSS': return 'The friction circle has margin — commit, the data says so.';
      }
    }

    // ── Tony: motivational, feel-based ──────────────────────
    if (coach.id === 'tony') {
      switch (action) {
        case 'THRESHOLD':    return highBrake
          ? 'Yes! Hammer those brakes — own the stop!'
          : 'More brake — you\'ve got more stopping left!';
        case 'TRAIL_BRAKE':  return 'Breathe off the brake — feel the car rotate!';
        case 'BRAKE':        return fast
          ? 'Brake! Brake! Brake! Trust the tires!'
          : 'Brake now — set it up clean!';
        case 'WAIT':         return 'Hold it — patience is speed here!';
        case 'TURN_IN':      return 'Turn in — commit, you\'ve got grip!';
        case 'COMMIT':       return highCornerLoad
          ? 'You\'re committed — hold it, trust the car!'
          : 'Commit! Don\'t second-guess yourself!';
        case 'ROTATE':       return 'Let it breathe — feel the rear come around!';
        case 'APEX':         return 'Clip that apex — laser focus!';
        case 'THROTTLE':     return highCornerLoad
          ? 'Careful on the throttle — feed it in!'
          : 'Gas! Get on it — drive off that corner!';
        case 'PUSH':         return fast
          ? `${speed.toFixed(0)} km/h and climbing — stay flat, push it!`
          : 'Clear road ahead — push harder, more speed!';
        case 'FULL_THROTTLE':return 'Full send — floor it, don\'t lift!';
        case 'STABILIZE':    return 'Easy — breathe, hold it steady!';
        case 'MAINTAIN':     return 'That\'s it! Keep that pace — you\'re flying!';
        case 'COAST':        return 'Don\'t coast — commit to a pedal, stay sharp!';
        case 'DONT_BE_A_WUSS': return 'Stop lifting! Trust it — send it!';
      }
    }

    // ── Garmin: data-focused, clinical numbers ───────────────
    if (coach.id === 'garmin') {
      switch (action) {
        case 'THRESHOLD':    return highBrake
          ? `${brake.toFixed(0)}% brake — holding threshold. Maintain.`
          : `${brake.toFixed(0)}% brake — ${(100 - brake).toFixed(0)}% capacity unused. Apply more.`;
        case 'TRAIL_BRAKE':  return `Trail braking. G-Long: ${gLong.toFixed(2)}. Release linearly.`;
        case 'BRAKE':        return fast
          ? `Brake point. ${speed.toFixed(0)} km/h — target -${Math.abs(gLong).toFixed(1)}G decel.`
          : `Brake. Entry speed ${speed.toFixed(0)} km/h.`;
        case 'WAIT':         return 'Patience zone. Hold position. Delta neutral.';
        case 'TURN_IN':      return `Turn-in. Speed: ${speed.toFixed(0)} km/h. G-Lat target: 1.2+.`;
        case 'COMMIT':       return `Committed. G-Lat: ${frame.gLat.toFixed(2)}. Hold the line.`;
        case 'ROTATE':       return 'Rotation phase. Yaw in progress. Reduce steering input.';
        case 'APEX':         return `Apex. Minimum speed: ${speed.toFixed(0)} km/h. Begin exit.`;
        case 'THROTTLE':     return highCornerLoad
          ? `Throttle — ${throttle.toFixed(0)}%. G-Lat ${gLat.toFixed(2)} — progressive only.`
          : `Throttle. ${throttle.toFixed(0)}% — room to extend.`;
        case 'PUSH':         return `Straight. ${speed.toFixed(0)} km/h — +${(0.3 + (145 - Math.min(speed, 145)) * 0.01).toFixed(1)}s potential. Stay flat.`;
        case 'FULL_THROTTLE':return `Full throttle. G-Long: ${gLong.toFixed(2)}. Max longitudinal.`;
        case 'STABILIZE':    return 'Inputs neutral. G-forces stabilizing.';
        case 'MAINTAIN':     return `On delta. ${speed.toFixed(0)} km/h. Maintain.`;
        case 'COAST':        return `Coasting — ${speed.toFixed(0)} km/h. Zero G-vector. Losing time.`;
        case 'DONT_BE_A_WUSS': return `G-Lat headroom: ${(2.0 - gLat).toFixed(1)}G unused. Commit.`;
      }
    }

    // ── Super AJ: adaptive, hobby-driver-friendly ────────────
    switch (action) {
      case 'THRESHOLD':    return highBrake
        ? 'Good — keep that brake pressure!'
        : 'Squeeze harder on the brakes — you\'ve got more stopping power!';
      case 'TRAIL_BRAKE':  return fast
        ? 'Release the brake slowly as you turn — don\'t let go all at once!'
        : 'Ease off the brake as you turn in — balance the car.';
      case 'BRAKE':        return fast
        ? 'Brake now — you\'re carrying too much speed!'
        : 'Start braking — set up the corner entry.';
      case 'WAIT':         return 'Be patient — wait for the car to settle before turning!';
      case 'TURN_IN':      return lightBrake
        ? 'Turn in while trailing the brake — use that front grip!'
        : 'Turn in now — commit to the line!';
      case 'COMMIT':       return highCornerLoad
        ? 'Stay committed — you\'re on the limit, hold it!'
        : 'Trust the car — commit to the corner!';
      case 'ROTATE':       return 'Less steering, more patience — let the car rotate naturally.';
      case 'APEX':         return med
        ? 'Hit that apex tight — clip it!'
        : 'Apex — get close to the inside!';
      case 'THROTTLE':     return highCornerLoad
        ? 'Feed in the throttle gently — don\'t overwhelm the rear!'
        : 'Get on the gas — drive off the corner!';
      case 'PUSH':         return fast
        ? `${speed.toFixed(0)} km/h — stay flat, don't lift!`
        : 'Nice straight — push it harder!';
      case 'FULL_THROTTLE':return 'Floor it — full throttle now!';
      case 'STABILIZE':    return 'Smooth inputs — hold it steady.';
      case 'MAINTAIN':     return 'Looking good — keep that pace!';
      case 'COAST':        return `Coasting at ${speed.toFixed(0)} km/h — pick a pedal, stay committed!`;
      case 'DONT_BE_A_WUSS': return highThrottle
        ? 'You\'re on throttle — now commit fully, don\'t lift!'
        : 'Stop hesitating — trust the grip and send it!';
    }
  }

  // ── COLD PATH: Gemini Cloud detailed analysis ──────────

  private async runColdPath(frame: TelemetryFrame) {
    const now = Date.now();
    this.syncCooldownGates(now);
    if (this.coldGateMachine.getState() !== 'idle') return;
    if (!this.apiKey) return;

    this.lastColdTime = now;
    this.coldGateMachine.send('DISPATCH_COLD');
    const coach = this.getCoach();

    const cornerName = this.lastCorner?.name || 'straight';
    const cornerAdvice = this.lastCorner?.advice || '';

    const prompt = `${RACING_PHYSICS_KNOWLEDGE}

Current Telemetry:
Speed: ${frame.speed.toFixed(1)} km/h | Brake: ${frame.brake.toFixed(0)}% | Throttle: ${frame.throttle.toFixed(0)}%
G-Lat: ${frame.gLat.toFixed(2)} | G-Long: ${frame.gLong.toFixed(2)}
Location: ${cornerName} - ${cornerAdvice}

Give a short coaching instruction followed by a brief physics-based explanation.`;

    try {
      const client = new GoogleGenAI({ apiKey: this.apiKey });
      const interaction = await client.interactions.create({
        model: 'gemini-3.8-flash',
        system_instruction: coach.systemPrompt,
        input: prompt,
      });
      const text = interaction.output_text || '';
      // ☁️ PROBE 4 — Strategy path (Gemini) responding:
      // console.log('Strategy', { coach: coach.id, chars: text.length, preview: text.slice(0, 60) });
      if (text) this.emit({ path: 'cold', text });
    } catch (err) {
      console.error('Strategy path failed:', err);
    } finally {
      this.coldGateMachine.send('SETTLE_COLD');
      this.syncCooldownGates(Date.now());
    }
  }

  // ── FEEDFORWARD: geofence-based corner advice ──────────

  private runFeedforward(frame: TelemetryFrame) {
    const nearest = this.findNearestCorner(frame.latitude, frame.longitude, ALL_CORNERS);

    if (nearest && nearest !== this.lastCorner) {
      this.lastCorner = nearest;
      this.emit({
        path: 'feedforward',
        text: `📍 ${nearest.name}: ${nearest.advice}`,
      });
    }
  }

  private findNearestCorner(lat: number, lon: number, corners: Corner[]): Corner | null {
    for (const c of corners) {
      const dist = this.haversine(lat, lon, c.lat, c.lon);
      if (dist < 150) return c;
    }
    return null;
  }

  private haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2
      + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
      * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
