import type { CoachAction } from '../types';

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

  async init() {
    try {
      this.audioCtx = new AudioContext();
      await this.preloadAll();
    } catch (err) {
      console.warn('AudioContext not available, using Speech API fallback:', err);
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
  }
}
