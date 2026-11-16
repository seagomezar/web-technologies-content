import { useCallback, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { TTSPhase, TTSProvider } from '../types';
import { useMachine } from '../utils/stateMachine';

// Gemini prebuilt voice per persona
const PERSONA_GEMINI_VOICE: Record<string, string> = {
  aj:      'Fenrir',   // assertive, clipped male
  rachel:  'Kore',     // calm, precise female
  tony:    'Puck',     // upbeat, energetic
  garmin:  'Charon',   // neutral, flat
  superaj: 'Zephyr',   // balanced, adaptive
};

// Gemini 3.8 TTS speech_metadata style per persona
const PERSONA_SPEECH_STYLE: Record<string, string> = {
  aj:      'clipped, urgent race engineer radio command',
  rachel:  'calm, precise vehicle-dynamics instructor',
  tony:    'energetic, encouraging pit crew coach',
  garmin:  'neutral, clinical telemetry readout',
  superaj: 'focused, confident adaptive motorsport coach',
};

// Browser TTS tuning per persona
const PERSONA_BROWSER_CONFIG: Record<string, { rate: number; pitch: number }> = {
  aj:      { rate: 1.3, pitch: 0.7 },  // fast, low — blunt commands
  rachel:  { rate: 1.0, pitch: 1.1 },  // measured, slightly higher — clinical
  tony:    { rate: 1.4, pitch: 1.3 },  // fast, high — hype energy
  garmin:  { rate: 0.9, pitch: 0.6 },  // slow, flat — robotic data readout
  superaj: { rate: 1.1, pitch: 0.9 },  // default
};

export interface TTSMachineContext {
  readonly provider: TTSProvider;
  readonly coachId: string;
  readonly activeRunId: number;
}

interface TTSPublicContext {
  readonly provider: TTSProvider;
  readonly coachId: string;
}

type TTSMachineEvents = {
  SET_PROVIDER: { provider: TTSProvider };
  SET_COACH: { coachId: string };
  START_GEMINI: { runId: number };
  AUDIO_READY: { runId: number };
  FALLBACK_BROWSER: { runId: number };
  START_BROWSER: { runId: number };
  FINISH: { runId: number };
  CANCEL: undefined;
};

interface ActivePlaybackResources {
  objectUrl: string | null;
  audio: HTMLAudioElement | null;
  utterance: SpeechSynthesisUtterance | null;
}

function formatTTSContext(ctx: Readonly<TTSMachineContext>): TTSPublicContext {
  return {
    provider: ctx.provider,
    coachId: ctx.coachId,
  };
}

export const useTTS = (apiKey: string | null, coachId: string = 'superaj') => {
  const { state: ttsPhase, context, send, machine } = useMachine<
    TTSPhase,
    TTSMachineContext,
    TTSMachineEvents,
    TTSPublicContext
  >(
    () => ({
      id: 'tts-pipeline',
      initial: 'idle',
      context: {
        provider: 'browser',
        coachId,
        activeRunId: 0,
      },
      states: {
        idle: {
          on: {
            SET_PROVIDER: {
              target: 'idle',
              assign: (ctx, payload) => ({ ...ctx, provider: payload.provider }),
            },
            SET_COACH: {
              target: 'idle',
              assign: (ctx, payload) => ({ ...ctx, coachId: payload.coachId }),
            },
            START_GEMINI: {
              target: 'synthesizing_gemini',
              assign: (ctx, payload) => ({ ...ctx, activeRunId: payload.runId }),
            },
            START_BROWSER: {
              target: 'speaking_browser_fallback',
              assign: (ctx, payload) => ({ ...ctx, activeRunId: payload.runId }),
            },
            CANCEL: 'idle',
          },
        },
        synthesizing_gemini: {
          on: {
            SET_PROVIDER: {
              target: 'synthesizing_gemini',
              assign: (ctx, payload) => ({ ...ctx, provider: payload.provider }),
            },
            SET_COACH: {
              target: 'synthesizing_gemini',
              assign: (ctx, payload) => ({ ...ctx, coachId: payload.coachId }),
            },
            AUDIO_READY: {
              guard: (ctx, payload) => payload.runId === ctx.activeRunId,
              target: 'playing_audio',
            },
            FALLBACK_BROWSER: {
              guard: (ctx, payload) => payload.runId === ctx.activeRunId,
              target: 'speaking_browser_fallback',
            },
            FINISH: {
              guard: (ctx, payload) => payload.runId === ctx.activeRunId,
              target: 'idle',
            },
            CANCEL: {
              target: 'idle',
              assign: ctx => ({ ...ctx, activeRunId: ctx.activeRunId + 1 }),
            },
          },
        },
        playing_audio: {
          on: {
            SET_PROVIDER: {
              target: 'playing_audio',
              assign: (ctx, payload) => ({ ...ctx, provider: payload.provider }),
            },
            SET_COACH: {
              target: 'playing_audio',
              assign: (ctx, payload) => ({ ...ctx, coachId: payload.coachId }),
            },
            FALLBACK_BROWSER: {
              guard: (ctx, payload) => payload.runId === ctx.activeRunId,
              target: 'speaking_browser_fallback',
            },
            FINISH: {
              guard: (ctx, payload) => payload.runId === ctx.activeRunId,
              target: 'idle',
            },
            CANCEL: {
              target: 'idle',
              assign: ctx => ({ ...ctx, activeRunId: ctx.activeRunId + 1 }),
            },
          },
        },
        speaking_browser_fallback: {
          on: {
            SET_PROVIDER: {
              target: 'speaking_browser_fallback',
              assign: (ctx, payload) => ({ ...ctx, provider: payload.provider }),
            },
            SET_COACH: {
              target: 'speaking_browser_fallback',
              assign: (ctx, payload) => ({ ...ctx, coachId: payload.coachId }),
            },
            FINISH: {
              guard: (ctx, payload) => payload.runId === ctx.activeRunId,
              target: 'idle',
            },
            CANCEL: {
              target: 'idle',
              assign: ctx => ({ ...ctx, activeRunId: ctx.activeRunId + 1 }),
            },
          },
        },
      },
    }),
    { formatContext: formatTTSContext },
  );

  const playbackResourcesRef = useRef<ActivePlaybackResources>({
    objectUrl: null,
    audio: null,
    utterance: null,
  });

  const cleanupPlaybackResources = useCallback(() => {
    const resources = playbackResourcesRef.current;
    if (resources.audio) {
      resources.audio.onended = null;
      resources.audio.onerror = null;
      resources.audio.pause();
      resources.audio.removeAttribute('src');
      resources.audio = null;
    }
    if (resources.objectUrl) {
      URL.revokeObjectURL(resources.objectUrl);
      resources.objectUrl = null;
    }
    if (resources.utterance) {
      resources.utterance.onend = null;
      resources.utterance.onerror = null;
      resources.utterance = null;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, []);

  useEffect(() => {
    send('SET_COACH', { coachId });
  }, [coachId, send]);

  useEffect(() => {
    return () => {
      cleanupPlaybackResources();
      machine.send('CANCEL');
    };
  }, [cleanupPlaybackResources, machine]);

  const setProvider = useCallback(
    (provider: TTSProvider) => {
      send('SET_PROVIDER', { provider });
    },
    [send],
  );

  const playBlobAudio = useCallback(
    (blob: Blob): Promise<void> =>
      new Promise((resolve, reject) => {
        cleanupPlaybackResources();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        playbackResourcesRef.current.objectUrl = url;
        playbackResourcesRef.current.audio = audio;

        const release = () => {
          if (playbackResourcesRef.current.audio === audio) {
            playbackResourcesRef.current.audio = null;
          }
          if (playbackResourcesRef.current.objectUrl === url) {
            URL.revokeObjectURL(url);
            playbackResourcesRef.current.objectUrl = null;
          }
        };

        audio.onended = () => {
          release();
          resolve();
        };
        audio.onerror = () => {
          release();
          reject(new Error('Playback failed'));
        };
        audio.play().catch(err => {
          release();
          reject(err);
        });
      }),
    [cleanupPlaybackResources],
  );

  const speakBrowser = useCallback(
    (text: string, config: { rate: number; pitch: number }): Promise<void> =>
      new Promise(resolve => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
          resolve();
          return;
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = config.rate;
        utterance.pitch = config.pitch;
        playbackResourcesRef.current.utterance = utterance;

        const release = () => {
          if (playbackResourcesRef.current.utterance === utterance) {
            playbackResourcesRef.current.utterance = null;
          }
          resolve();
        };

        utterance.onend = release;
        utterance.onerror = release;
        window.speechSynthesis.speak(utterance);
      }),
    [],
  );

  const speak = useCallback(
    async (text: string) => {
      if (!text.trim() || machine.getState() !== 'idle') return;

      const currentCtx = machine.getContext();
      const runId = currentCtx.activeRunId + 1;
      const voice = PERSONA_GEMINI_VOICE[coachId] ?? 'Zephyr';
      const style = PERSONA_SPEECH_STYLE[coachId] ?? 'focused motorsport coach';
      const browserConfig = PERSONA_BROWSER_CONFIG[coachId] ?? { rate: 1.1, pitch: 0.9 };

      if (currentCtx.provider === 'gemini') {
        if (!send('START_GEMINI', { runId })) return;

        try {
          const blob = await synthesizeGeminiAudio(text, apiKey, voice, style);
          if (machine.getContext().activeRunId !== runId) return;

          if (blob) {
            if (!send('AUDIO_READY', { runId })) return;
            await playBlobAudio(blob);
          }
          send('FINISH', { runId });
        } catch (err) {
          if (machine.getContext().activeRunId !== runId) return;
          console.error('TTS error, falling back to browser:', err);
          if (send('FALLBACK_BROWSER', { runId })) {
            await speakBrowser(text, browserConfig);
            send('FINISH', { runId });
          }
        }
        return;
      }

      if (!send('START_BROWSER', { runId })) return;
      try {
        await speakBrowser(text, browserConfig);
      } finally {
        send('FINISH', { runId });
      }
    },
    [apiKey, coachId, machine, playBlobAudio, send, speakBrowser],
  );

  return {
    provider: context.provider,
    isSpeaking: ttsPhase !== 'idle',
    ttsPhase,
    setProvider,
    speak,
  };
};

// ── Provider implementations ────────────────────────────────

async function synthesizeGeminiAudio(
  text: string,
  apiKey: string | null,
  voice: string,
  style: string,
): Promise<Blob | null> {
  if (!apiKey) throw new Error('API key required');
  const client = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: 'v1beta' } });

  const interaction = await client.interactions.create({
    model: 'gemini-3.8-flash-lite-tts',
    input: [{
      type: 'user_input',
      content: [{
        type: 'text',
        text,
        annotations: [{
          type: 'speech_metadata',
          style,
        }],
      }],
    }],
    response_format: { type: 'audio' },
    generation_config: {
      speech_config: [{ voice }],
    },
  });

  if (interaction.output_audio?.data) {
    const binaryString = window.atob(interaction.output_audio.data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type: interaction.output_audio.mime_type || 'audio/wav' });
  }

  return null;
}
