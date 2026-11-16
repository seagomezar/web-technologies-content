import type {
  TelemetryFrame,
  GpsSSEPoint,
  SSEConnectionStatus,
  TelemetryStreamMode,
  TelemetryStreamState,
} from '../types';
import { parseTelemetryCSV } from '../utils/telemetryParser';
import {
  createMachine,
  type InspectableMachine,
  type KoruMachineSnapshot,
} from '../utils/stateMachine';

type TelemetryCallback = (frame: TelemetryFrame) => void;

export interface TelemetryStreamContext {
  readonly mode: TelemetryStreamMode | null;
  readonly url: string;
  readonly error?: string;
  readonly sessionId: number;
}

export interface TelemetryStreamPublicContext {
  readonly mode: TelemetryStreamMode | null;
  readonly url: string;
  readonly error?: string;
}

type TelemetryStreamEvents = {
  CONNECT: { mode: TelemetryStreamMode; url: string; sessionId: number };
  SSE_OPEN: { sessionId: number };
  REPLAY_READY: { sessionId: number };
  FAIL: { error: string; sessionId: number };
  DISCONNECT: undefined;
};

export type TelemetryStreamEvent = keyof TelemetryStreamEvents & string;

function toSSEConnectionStatus(state: TelemetryStreamState): SSEConnectionStatus {
  if (state === 'streaming_sse' || state === 'replaying_file') {
    return 'connected';
  }
  return state;
}

/**
 * Singleton service that connects to a GPS SSE stream (or replays a mock file)
 * and emits enriched TelemetryFrames with derived G-forces and virtual sensors.
 */
export class TelemetryStreamService {
  private static instance: TelemetryStreamService;
  private eventSource: EventSource | null = null;
  private listeners: TelemetryCallback[] = [];
  private replayTimer: ReturnType<typeof setTimeout> | null = null;
  private replayAbortController: AbortController | null = null;
  private prevPoint: GpsSSEPoint | null = null;
  private prevTime = 0;
  private nextSessionId = 0;
  private statusListeners: ((s: SSEConnectionStatus) => void)[] = [];

  private readonly machine = createMachine<
    TelemetryStreamState,
    TelemetryStreamContext,
    TelemetryStreamEvents
  >({
    id: 'telemetry-stream',
    initial: 'disconnected',
    context: {
      mode: null,
      url: '',
      error: undefined,
      sessionId: 0,
    },
    states: {
      disconnected: {
        on: {
          CONNECT: {
            target: 'connecting',
            assign: (_ctx, payload) => ({
              mode: payload.mode,
              url: payload.url,
              error: undefined,
              sessionId: payload.sessionId,
            }),
          },
          DISCONNECT: 'disconnected',
        },
      },
      connecting: {
        on: {
          SSE_OPEN: {
            guard: (ctx, payload) =>
              ctx.mode === 'sse' && payload.sessionId === ctx.sessionId,
            target: 'streaming_sse',
          },
          REPLAY_READY: {
            guard: (ctx, payload) =>
              ctx.mode === 'file' && payload.sessionId === ctx.sessionId,
            target: 'replaying_file',
          },
          FAIL: {
            guard: (ctx, payload) => payload.sessionId === ctx.sessionId,
            target: 'error',
            assign: (ctx, payload) => ({
              ...ctx,
              error: payload.error,
            }),
          },
          DISCONNECT: {
            target: 'disconnected',
            assign: ctx => ({
              mode: null,
              url: '',
              error: undefined,
              sessionId: ctx.sessionId,
            }),
          },
          CONNECT: {
            target: 'connecting',
            assign: (_ctx, payload) => ({
              mode: payload.mode,
              url: payload.url,
              error: undefined,
              sessionId: payload.sessionId,
            }),
          },
        },
      },
      streaming_sse: {
        on: {
          SSE_OPEN: {
            guard: (ctx, payload) =>
              ctx.mode === 'sse' && payload.sessionId === ctx.sessionId,
            target: 'streaming_sse',
          },
          FAIL: {
            guard: (ctx, payload) => payload.sessionId === ctx.sessionId,
            target: 'error',
            assign: (ctx, payload) => ({
              ...ctx,
              error: payload.error,
            }),
          },
          DISCONNECT: {
            target: 'disconnected',
            assign: ctx => ({
              mode: null,
              url: '',
              error: undefined,
              sessionId: ctx.sessionId,
            }),
          },
          CONNECT: {
            target: 'connecting',
            assign: (_ctx, payload) => ({
              mode: payload.mode,
              url: payload.url,
              error: undefined,
              sessionId: payload.sessionId,
            }),
          },
        },
      },
      replaying_file: {
        on: {
          FAIL: {
            guard: (ctx, payload) => payload.sessionId === ctx.sessionId,
            target: 'error',
            assign: (ctx, payload) => ({
              ...ctx,
              error: payload.error,
            }),
          },
          DISCONNECT: {
            target: 'disconnected',
            assign: ctx => ({
              mode: null,
              url: '',
              error: undefined,
              sessionId: ctx.sessionId,
            }),
          },
          CONNECT: {
            target: 'connecting',
            assign: (_ctx, payload) => ({
              mode: payload.mode,
              url: payload.url,
              error: undefined,
              sessionId: payload.sessionId,
            }),
          },
        },
      },
      error: {
        on: {
          SSE_OPEN: {
            guard: (ctx, payload) =>
              ctx.mode === 'sse' && payload.sessionId === ctx.sessionId,
            target: 'streaming_sse',
            assign: ctx => ({
              ...ctx,
              error: undefined,
            }),
          },
          DISCONNECT: {
            target: 'disconnected',
            assign: ctx => ({
              mode: null,
              url: '',
              error: undefined,
              sessionId: ctx.sessionId,
            }),
          },
          CONNECT: {
            target: 'connecting',
            assign: (_ctx, payload) => ({
              mode: payload.mode,
              url: payload.url,
              error: undefined,
              sessionId: payload.sessionId,
            }),
          },
        },
      },
    },
    onTransition: ({ to }) => {
      const externalStatus = toSSEConnectionStatus(to);
      this.statusListeners.forEach(cb => cb(externalStatus));
    },
  });

  static getInstance(): TelemetryStreamService {
    if (!TelemetryStreamService.instance) {
      TelemetryStreamService.instance = new TelemetryStreamService();
    }
    return TelemetryStreamService.instance;
  }

  getStatus(): SSEConnectionStatus {
    return toSSEConnectionStatus(this.machine.getState());
  }

  getStreamState(): TelemetryStreamState {
    return this.machine.getState();
  }

  getMode(): TelemetryStreamMode | null {
    return this.machine.getContext().mode;
  }

  getSnapshot = (): KoruMachineSnapshot<
    TelemetryStreamState,
    TelemetryStreamEvent,
    Readonly<TelemetryStreamContext>
  > => {
    return this.machine.getSnapshot();
  };

  subscribe = (listener: () => void): (() => void) => {
    return this.machine.subscribe(listener);
  };

  asInspectableMachine(
    id = 'telemetry-stream',
  ): InspectableMachine<TelemetryStreamState, TelemetryStreamEvent, TelemetryStreamPublicContext> {
    return {
      id,
      getSnapshot: () => {
        const snap = this.machine.getSnapshot();
        return {
          id,
          state: snap.state,
          allowedEvents: snap.allowedEvents,
          context: {
            mode: snap.context.mode,
            url: snap.context.url,
            error: snap.context.error,
          },
        };
      },
    };
  }

  onStatus(cb: (s: SSEConnectionStatus) => void) {
    this.statusListeners.push(cb);
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== cb);
    };
  }

  onFrame(cb: TelemetryCallback) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private emit(frame: TelemetryFrame) {
    this.listeners.forEach(cb => cb(frame));
  }

  private teardownTransport() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.replayAbortController) {
      this.replayAbortController.abort();
      this.replayAbortController = null;
    }
    if (this.replayTimer) {
      clearTimeout(this.replayTimer);
      this.replayTimer = null;
    }
    this.prevPoint = null;
    this.prevTime = 0;
  }

  /** Connect to a live SSE endpoint or replay a mock .txt / .csv file */
  connect(url: string) {
    this.teardownTransport();
    const sessionId = ++this.nextSessionId;

    const cleanPath = url.split(/[?#]/)[0].toLowerCase();
    if (cleanPath.endsWith('.txt') || cleanPath.endsWith('.csv')) {
      this.machine.send('CONNECT', { mode: 'file', url, sessionId });
      void this.replayFile(url, sessionId);
      return;
    }

    this.machine.send('CONNECT', { mode: 'sse', url, sessionId });
    const es = new EventSource(url);
    this.eventSource = es;

    es.onopen = () => {
      this.machine.send('SSE_OPEN', { sessionId });
    };
    es.onerror = () => {
      this.machine.send('FAIL', { error: `SSE stream error for ${url}`, sessionId });
    };

    es.addEventListener('TPV', (e) => {
      try {
        const data = JSON.parse(e.data);
        const point = this.parseSSEPoint(data);
        if (point) this.processPoint(point);
      } catch { /* skip bad frames */ }
    });

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        const point = this.parseSSEPoint(data);
        if (point) this.processPoint(point);
      } catch {
        // Try CSV fallback
        const fields = e.data.split(',');
        if (fields.length >= 6) {
          const point: GpsSSEPoint = {
            time: parseFloat(fields[0]) || Date.now() / 1000,
            lat: parseFloat(fields[1]),
            lon: parseFloat(fields[2]),
            speed: parseFloat(fields[3]),
            alt: parseFloat(fields[4]) || undefined,
            track: parseFloat(fields[5]) || undefined,
          };
          if (!isNaN(point.lat) && !isNaN(point.lon)) this.processPoint(point);
        }
      }
    };
  }

  disconnect() {
    this.nextSessionId++;
    this.teardownTransport();
    this.machine.send('DISCONNECT');
  }

  private parseSSEPoint(data: Record<string, unknown>): GpsSSEPoint | null {
    const lat = Number(data.lat);
    const lon = Number(data.lon);
    if (isNaN(lat) || isNaN(lon)) return null;
    return {
      time: data.time as string | number,
      lat, lon,
      speed: Number(data.speed) || 0,
      alt: Number(data.alt) || undefined,
      track: Number(data.track) || undefined,
      brake: data.brake !== undefined ? Number(data.brake) : undefined,
      throttle: data.throttle !== undefined ? Number(data.throttle) : undefined,
      rpm: Number(data.rpm) || undefined,
      gear: data.gear !== undefined ? Number(data.gear) : undefined,
      steering: data.steering !== undefined ? Number(data.steering) : undefined,
      gLat: data.gLat !== undefined ? Number(data.gLat) : undefined,
      gLong: data.gLong !== undefined ? Number(data.gLong) : undefined,
    };
  }

  private async replayFile(url: string, sessionId: number) {
    const abortController = new AbortController();
    this.replayAbortController = abortController;

    try {
      const res = await fetch(url, { signal: abortController.signal });
      if (!res.ok) throw new Error(`Failed to fetch ${url}`);
      const text = await res.text();
      if (
        abortController.signal.aborted ||
        this.machine.getState() !== 'connecting' ||
        this.machine.getContext().sessionId !== sessionId
      ) {
        return;
      }

      const lines = text.trim().split(/\r?\n/).filter(l => l.trim() && !l.trim().startsWith('<'));
      if (lines.length === 0) throw new Error('Empty telemetry replay file');

      const cleanPath = url.split(/[?#]/)[0].toLowerCase();
      const isCsv = cleanPath.endsWith('.csv') || !lines[0].trim().startsWith('{');

      if (isCsv) {
        const frames = parseTelemetryCSV(text);
        if (frames.length === 0) throw new Error('No valid CSV telemetry frames found');
        if (!this.machine.send('REPLAY_READY', { sessionId })) return;

        let i = 0;
        const playNextCsv = () => {
          if (
            this.machine.getState() !== 'replaying_file' ||
            this.machine.getContext().sessionId !== sessionId
          ) {
            return;
          }
          if (i >= frames.length) {
            i = 0; // Loop replay
            this.prevPoint = null;
          }
          this.emit(frames[i]);
          i++;
          this.replayTimer = setTimeout(playNextCsv, 100); // ~10hz
        };
        playNextCsv();
        return;
      }

      if (!this.machine.send('REPLAY_READY', { sessionId })) return;

      let i = 0;
      const playNext = () => {
        if (
          this.machine.getState() !== 'replaying_file' ||
          this.machine.getContext().sessionId !== sessionId
        ) {
          return;
        }
        if (i >= lines.length) {
          i = 0; // Loop replay
          this.prevPoint = null;
        }
        try {
          const data = JSON.parse(lines[i]);
          const point = this.parseSSEPoint(data);
          if (point) this.processPoint(point);
        } catch { /* skip bad lines */ }
        i++;
        this.replayTimer = setTimeout(playNext, 100); // ~10hz
      };
      playNext();
    } catch (err) {
      if (abortController.signal.aborted || (err instanceof DOMException && err.name === 'AbortError')) {
        return;
      }
      if (this.machine.getContext().sessionId !== sessionId) {
        return;
      }
      console.error('Replay file load failed:', err);
      const message = err instanceof Error ? err.message : 'Replay file load failed';
      this.machine.send('FAIL', { error: message, sessionId });
    } finally {
      if (this.replayAbortController === abortController) {
        this.replayAbortController = null;
      }
    }
  }

  private processPoint(point: GpsSSEPoint) {
    const parsedIso = typeof point.time === 'string' ? Date.parse(point.time) / 1000 : NaN;
    const now = typeof point.time === 'number' ? point.time : (!isNaN(parsedIso) ? parsedIso : Date.now() / 1000);
    const rawDt = this.prevPoint ? now - this.prevTime : 0.1;
    const dt = rawDt > 0.02 && rawDt < 2.0 ? rawDt : 0.1;
    const speedKmh = point.speed > 200 ? point.speed : point.speed * 3.6;
    const speedMs = speedKmh / 3.6;

    // Derive heading from consecutive points (fallback to GPS course)
    let heading = point.track ?? 0;
    if (this.prevPoint && point.track === undefined) {
      const dLat = point.lat - this.prevPoint.lat;
      const dLon = point.lon - this.prevPoint.lon;
      if (Math.abs(dLat) > 1e-7 || Math.abs(dLon) > 1e-7) {
        heading = Math.atan2(dLon, dLat) * (180 / Math.PI);
      }
    }

    // Derive G-forces if not provided
    let gLat = point.gLat ?? 0;
    let gLong = point.gLong ?? 0;
    if (this.prevPoint && point.gLat === undefined) {
      const prevSpeedMs = (this.prevPoint.speed > 200 ? this.prevPoint.speed : this.prevPoint.speed * 3.6) / 3.6;
      gLong = (speedMs - prevSpeedMs) / (dt * 9.81);
      const prevHeading = this.prevPoint.track ?? heading;
      const dHeading = ((heading - prevHeading + 540) % 360) - 180;
      const yawRate = (dHeading * Math.PI / 180) / dt;
      gLat = (speedMs * yawRate) / 9.81;
    }

    // Clamp G-forces
    gLat = Math.max(-3, Math.min(3, gLat));
    gLong = Math.max(-3, Math.min(3, gLong));

    // Virtual brake/throttle from G-forces (only when telemetry device has no dedicated sensors)
    let brake = point.brake ?? 0;
    let throttle = point.throttle ?? 0;
    if (point.brake === undefined && point.throttle === undefined) {
      brake = gLong < -0.25 ? Math.min(100, Math.abs(gLong) * 110) : 0;
      throttle = gLong > 0.12 ? Math.min(100, gLong * 160) : (speedKmh > 95 && gLong >= -0.08 ? 65 : 0);
    }
    // 🔬 EXERCISE (swap brake/throttle — works for ALL data sources): uncomment below
    // [brake, throttle] = [throttle, brake];

    const frame: TelemetryFrame = {
      time: now,
      latitude: point.lat,
      longitude: point.lon,
      altitude: point.alt,
      speed: speedKmh,
      rpm: point.rpm,
      throttle,
      brake,
      steering: point.steering,
      gLat,
      gLong,
      gear: point.gear,
    };

    this.prevPoint = { ...point, track: heading };
    this.prevTime = now;
    // 📡 PROBE 1 — trace a frame entering the pipeline:
    // console.log('FRAME', { speed: frame.speed.toFixed(1), gLat: frame.gLat.toFixed(2), brake: frame.brake.toFixed(0) });
    this.emit(frame);
  }
}
