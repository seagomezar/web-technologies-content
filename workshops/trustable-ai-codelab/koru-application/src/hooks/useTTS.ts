import { useState, useCallback, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { TTSProvider } from '../types';

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

interface TTSState {
  provider: TTSProvider;
  isSpeaking: boolean;
}

export const useTTS = (apiKey: string | null, coachId: string = 'superaj') => {
  const [state, setState] = useState<TTSState>({ provider: 'browser', isSpeaking: false });
  const isFetchingRef = useRef(false);

  const setProvider = useCallback((provider: TTSProvider) => {
    setState(prev => ({ ...prev, provider }));
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!text.trim() || isFetchingRef.current) return;

    setState(prev => ({ ...prev, isSpeaking: true }));
    isFetchingRef.current = true;

    const voice = PERSONA_GEMINI_VOICE[coachId] ?? 'Zephyr';
    const style = PERSONA_SPEECH_STYLE[coachId] ?? 'focused motorsport coach';
    const browserConfig = PERSONA_BROWSER_CONFIG[coachId] ?? { rate: 1.1, pitch: 0.9 };

    try {
      if (state.provider === 'gemini') {
        await speakGemini(text, apiKey, voice, style);
      } else {
        await speakBrowser(text, browserConfig);
      }
    } catch (err) {
      console.error('TTS error, falling back to browser:', err);
      await speakBrowser(text, browserConfig);
    } finally {
      isFetchingRef.current = false;
      setState(prev => ({ ...prev, isSpeaking: false }));
    }
  }, [state.provider, apiKey, coachId]);

  return { ...state, setProvider, speak };
};

// ── Provider implementations ────────────────────────────────

function speakBrowser(text: string, config: { rate: number; pitch: number }): Promise<void> {
  return new Promise(resolve => {
    if (!('speechSynthesis' in window)) { resolve(); return; }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = config.rate;
    utterance.pitch = config.pitch;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    speechSynthesis.speak(utterance);
  });
}

async function speakGemini(text: string, apiKey: string | null, voice: string, style: string): Promise<void> {
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
    const blob = new Blob([bytes], { type: interaction.output_audio.mime_type || 'audio/wav' });
    await playBlobAudio(blob);
  }
}

// ── Playback helpers ────────────────────────────────────────

function playBlobAudio(blob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
    audio.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Playback failed')); };
    audio.play().catch(err => { URL.revokeObjectURL(url); reject(err); });
  });
}
