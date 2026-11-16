import type { CoachAction } from '../types';
import { createMachine, type KoruMachineSnapshot } from '../utils/stateMachine';

const ACTIONS: CoachAction[] = [
  'THRESHOLD', 'TRAIL_BRAKE', 'BRAKE', 'WAIT',
  'TURN_IN', 'COMMIT', 'ROTATE', 'APEX',
  'THROTTLE', 'PUSH', 'FULL_THROTTLE',
  'COAST', 'DONT_BE_A_WUSS',
];

const NEUTRAL_ACTIONS: CoachAction[] = ['STABILIZE', 'MAINTAIN'];

const FALLBACK_PHRASES: Partial<Record<CoachAction, string>> = {
  COAST: 'No coasting, pick a pedal',
  DONT_BE_A_WUSS: "Don't hesitate, send it",
};

export type AudioServiceState =
  | 'uninitialized'
  | 'initializing'
  | 'ready'
  | 'speech_fallback'
  | 'closed';

interface AudioServiceContext {
  readonly bufferedActions: number;
  readonly lastAction: CoachAction | null;
}

type AudioServiceEvents = {
  INIT_START: undefined;
  INIT_READY: { bufferedActions: number };
  INIT_FALLBACK: undefined;
  RECORD_PLAY: { action: CoachAction };
  CLOSE: undefined;
};

/**
 * Pre-cached MP3 audio service with AudioContext for instant playback.
 * Falls back to Web Speech API if AudioContext or optional MP3 clips are unavailable.
 */
export class AudioService {
  private audioCtx: AudioContext | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();
  private lastAction: CoachAction | null = null;
  private lastPlayTime = 0;
  private minInterval = 1500; // ms anti-spam

  private readonly machine = createMachine<
    AudioServiceState,
    AudioServiceContext,
    AudioServiceEvents
  >({
    id: 'audio-service',
    initial: 'uninitialized',
    context: {
      bufferedActions: 0,
      lastAction: null,
    },
    states: {
      uninitialized: {
        on: {
          INIT_START: 'initializing',
          RECORD_PLAY: {
            target: 'speech_fallback',
            assign: (ctx, payload) => ({ ...ctx, lastAction: payload.action }),
          },
          CLOSE: 'closed',
        },
      },
      initializing: {
        on: {
          INIT_READY: {
            target: 'ready',
            assign: (ctx, payload) => ({ ...ctx, bufferedActions: payload.bufferedActions }),
          },
          INIT_FALLBACK: 'speech_fallback',
          RECORD_PLAY: {
            target: 'initializing',
            assign: (ctx, payload) => ({ ...ctx, lastAction: payload.action }),
          },
          CLOSE: 'closed',
        },
      },
      ready: {
        on: {
          RECORD_PLAY: {
            target: 'ready',
            assign: (ctx, payload) => ({ ...ctx, lastAction: payload.action }),
          },
          CLOSE: {
            target: 'closed',
            assign: ctx => ({ ...ctx, bufferedActions: 0 }),
          },
        },
      },
      speech_fallback: {
        on: {
          INIT_START: 'initializing',
          RECORD_PLAY: {
            target: 'speech_fallback',
            assign: (ctx, payload) => ({ ...ctx, lastAction: payload.action }),
          },
          CLOSE: 'closed',
        },
      },
      closed: {
        on: {
          INIT_START: 'initializing',
        },
      },
    },
  });

  getSnapshot = (): KoruMachineSnapshot<
    AudioServiceState,
    keyof AudioServiceEvents & string,
    Readonly<AudioServiceContext>
  > => {
    return this.machine.getSnapshot();
  };

  async init() {
    this.machine.send('INIT_START');
    try {
      this.audioCtx = new AudioContext();
      await this.preloadAll();
      this.machine.send('INIT_READY', { bufferedActions: this.buffers.size });
    } catch (err) {
      console.warn('AudioContext not available, using Speech API fallback:', err);
      this.machine.send('INIT_FALLBACK');
    }
  }

  private async preloadAll() {
    if (!this.audioCtx) return;
    for (const action of ACTIONS) {
      try {
        const res = await fetch(`/audio/${action}.mp3`);
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.startsWith('audio/')) {
          const arrayBuffer = await res.arrayBuffer();
          const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
          this.buffers.set(action, audioBuffer);
        }
      } catch { /* clip not found — fallback will handle it */ }
    }
  }

  /** Play a coaching action sound. Returns true if played. */
  play(action: CoachAction): boolean {
    if (NEUTRAL_ACTIONS.includes(action)) return false;

    const now = Date.now();
    if (action === this.lastAction && now - this.lastPlayTime < this.minInterval) return false;

    this.lastAction = action;
    this.lastPlayTime = now;
    this.machine.send('RECORD_PLAY', { action });

    const buffer = this.buffers.get(action);
    if (buffer && this.audioCtx) {
      const source = this.audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioCtx.destination);
      source.start(0);
      return true;
    }

    this.speakFallback(action);
    return true;
  }

  /** Speak arbitrary text with Web Speech API */
  speak(text: string) {
    // 🔊 PROBE 5 — audio output (end of pipeline):
    // console.log('SPEAK', { chars: text.length, preview: text.slice(0, 60) });
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.2;
      utterance.pitch = 0.9;
      speechSynthesis.speak(utterance);
    }
  }

  private speakFallback(action: CoachAction) {
    const friendly = FALLBACK_PHRASES[action] ?? action.replace(/_/g, ' ').toLowerCase();
    this.speak(friendly);
  }

  destroy() {
    void this.audioCtx?.close();
    this.buffers.clear();
    this.machine.send('CLOSE');
  }
}
