import { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { RACING_PHYSICS_KNOWLEDGE } from '../utils/coachingKnowledge';
import type { CloudModel } from '../types';

interface CloudStatus {
  state: 'idle' | 'loading' | 'error' | 'success';
  error?: string;
  hasKey: boolean;
}

function base64ToBlob(base64: string, mimeType = 'audio/wav'): Blob {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

export const useGeminiCloud = (externalApiKey?: string | null) => {
  const [apiKey, setAutoApiKey] = useState<string | null>(() =>
    externalApiKey ?? localStorage.getItem('gemini_api_key') ?? null
  );

  const [status, setStatus] = useState<CloudStatus>({
    state: 'idle',
    hasKey: !!apiKey,
  });

  useEffect(() => {
    if (externalApiKey !== undefined) {
      setAutoApiKey(externalApiKey);
      setStatus(prev => ({ ...prev, hasKey: !!externalApiKey }));
    }
  }, [externalApiKey]);

  const setApiKey = useCallback((key: string) => {
    if (key) {
      localStorage.setItem('gemini_api_key', key);
      setAutoApiKey(key);
      setStatus(prev => ({ ...prev, hasKey: true }));
    } else {
      localStorage.removeItem('gemini_api_key');
      setAutoApiKey(null);
      setStatus(prev => ({ ...prev, hasKey: false }));
    }
  }, []);

  const generateFeedback = useCallback(
    async (model: CloudModel, contextString: string) => {
      const effectiveKey = apiKey || localStorage.getItem('gemini_api_key');
      if (!effectiveKey) {
        setStatus({ state: 'error', hasKey: false, error: 'API Key missing — add your Gemini API key via the Settings gear' });
        return '';
      }

      setStatus(prev => ({ ...prev, state: 'loading', error: undefined, hasKey: true }));

      const client = new GoogleGenAI({ apiKey: effectiveKey });
      const targetModel = model === 'pro' ? 'gemini-4-argon' : 'gemini-3.8-flash';
      const systemInstruction = model === 'pro'
        ? 'You are an Elite Driver Coach.'
        : 'You are a Race Engineer.';

      const prompt = model === 'pro'
        ? `${RACING_PHYSICS_KNOWLEDGE}

### EXAMPLES:
**Bad:** "You went too fast. Slow down." -> Too generic.
**Good:** "In Turn 2, telemetry shows a sudden lift. Keep 10-20% 'maintenance throttle'. Physics: Lift-Off Oversteer."

Analyze:
${contextString}

**Directive:** [Max 10 words]
### Analysis
[Detailed markdown with **Physics Diagnosis**, **Telemetry**, **Fix**]`
        : `${RACING_PHYSICS_KNOWLEDGE}

INPUT: ${contextString}

TASK: Identify the biggest time loss. Explain the error.

**Directive:** [Short instruction]
### Analysis
[Explanation]`;

      try {
        let text = '';
        try {
          const interaction = await client.interactions.create({
            model: targetModel,
            system_instruction: systemInstruction,
            input: prompt,
          });
          text = interaction.output_text || '';
        } catch (primaryErr) {
          if (targetModel !== 'gemini-3.8-flash') {
            const fallback = await client.interactions.create({
              model: 'gemini-3.8-flash',
              system_instruction: systemInstruction,
              input: prompt,
            });
            text = fallback.output_text || '';
          } else {
            throw primaryErr;
          }
        }

        setStatus(prev => ({ ...prev, state: 'success' }));
        return text;
      } catch (err: unknown) {
        console.error('Gemini Cloud failed:', err);
        setStatus(prev => ({ ...prev, state: 'error', error: (err as Error).message }));
        return '';
      }
    },
    [apiKey]
  );

  const generateAudio = useCallback(async (text: string, voiceName = 'Zephyr'): Promise<Blob | null> => {
    const effectiveKey = apiKey || localStorage.getItem('gemini_api_key');
    if (!effectiveKey) return null;
    try {
      const client = new GoogleGenAI({ apiKey: effectiveKey, httpOptions: { apiVersion: 'v1beta' } });
      const interaction = await client.interactions.create({
        model: 'gemini-3.8-flash-lite-tts',
        input: [{
          type: 'user_input',
          content: [{
            type: 'text',
            text,
            annotations: [{
              type: 'speech_metadata',
              style: 'clear, calm motorsport radio callout',
            }],
          }],
        }],
        response_format: { type: 'audio' },
        generation_config: {
          speech_config: [{ voice: voiceName }],
        },
      });

      if (interaction.output_audio?.data) {
        return base64ToBlob(interaction.output_audio.data, interaction.output_audio.mime_type || 'audio/wav');
      }
      return null;
    } catch (e) {
      console.error('Audio gen failed:', e);
      return null;
    }
  }, [apiKey]);

  return { status, generateFeedback, generateAudio, setApiKey, apiKey };
};
