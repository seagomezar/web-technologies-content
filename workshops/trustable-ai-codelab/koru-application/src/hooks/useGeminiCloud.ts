import { useState, useCallback, useEffect, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { RACING_PHYSICS_KNOWLEDGE } from '../utils/coachingKnowledge';
import type { CloudModel, GeminiCloudPhase } from '../types';
import { useMachine } from '../utils/stateMachine';

export interface CloudStatus {
  state: 'idle' | 'loading' | 'error' | 'success';
  phase: GeminiCloudPhase;
  error?: string;
  hasKey: boolean;
}

interface GeminiCloudContext {
  readonly hasKey: boolean;
  readonly activeModel: string | null;
  readonly error?: string;
  readonly requestId: number;
}

interface GeminiCloudPublicContext {
  readonly hasKey: boolean;
  readonly activeModel: string | null;
  readonly error?: string;
}

type GeminiCloudEvents = {
  SYNC_KEY: { hasKey: boolean };
  REQUEST_PRIMARY: { model: string; requestId: number };
  RETRY_FALLBACK: { model: string; requestId: number };
  SUCCEED: { requestId: number };
  FAIL: { error: string; hasKey: boolean; requestId: number };
};

function toLegacyCloudState(
  phase: GeminiCloudPhase,
): 'idle' | 'loading' | 'error' | 'success' {
  switch (phase) {
    case 'unconfigured':
    case 'idle':
      return 'idle';
    case 'requesting_primary':
    case 'retrying_fallback':
      return 'loading';
    case 'succeeded':
      return 'success';
    case 'error':
      return 'error';
  }
}

function formatGeminiCloudContext(
  ctx: Readonly<GeminiCloudContext>,
): GeminiCloudPublicContext {
  return {
    hasKey: ctx.hasKey,
    activeModel: ctx.activeModel,
    error: ctx.error,
  };
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
  const [localKey, setLocalKey] = useState<string | null>(() =>
    localStorage.getItem('gemini_api_key'),
  );
  const [manualOverride, setManualOverride] = useState<{
    baseExternal: string | null | undefined;
    key: string | null;
  } | null>(null);

  const apiKey =
    manualOverride && manualOverride.baseExternal === externalApiKey
      ? manualOverride.key
      : externalApiKey !== undefined
        ? externalApiKey
        : localKey;

  const { state: phase, context, send, machine } = useMachine<
    GeminiCloudPhase,
    GeminiCloudContext,
    GeminiCloudEvents,
    GeminiCloudPublicContext
  >(
    () => {
      const initialHasKey = Boolean(
        externalApiKey ?? localStorage.getItem('gemini_api_key'),
      );
      return {
        id: 'gemini-cloud',
        initial: initialHasKey ? 'idle' : 'unconfigured',
        context: {
          hasKey: initialHasKey,
          activeModel: null,
          error: undefined,
          requestId: 0,
        },
        states: {
          unconfigured: {
            on: {
              SYNC_KEY: {
                target: (_ctx, payload) => (payload.hasKey ? 'idle' : 'unconfigured'),
                assign: (ctx, payload) => ({
                  ...ctx,
                  hasKey: payload.hasKey,
                  error: undefined,
                }),
              },
              REQUEST_PRIMARY: {
                target: 'requesting_primary',
                assign: (_ctx, payload) => ({
                  hasKey: true,
                  activeModel: payload.model,
                  error: undefined,
                  requestId: payload.requestId,
                }),
              },
              FAIL: {
                target: 'error',
                assign: (_ctx, payload) => ({
                  hasKey: payload.hasKey,
                  activeModel: null,
                  error: payload.error,
                  requestId: payload.requestId,
                }),
              },
            },
          },
          idle: {
            on: {
              SYNC_KEY: {
                target: (_ctx, payload) => (payload.hasKey ? 'idle' : 'unconfigured'),
                assign: (ctx, payload) => ({
                  ...ctx,
                  hasKey: payload.hasKey,
                  error: undefined,
                }),
              },
              REQUEST_PRIMARY: {
                target: 'requesting_primary',
                assign: (_ctx, payload) => ({
                  hasKey: true,
                  activeModel: payload.model,
                  error: undefined,
                  requestId: payload.requestId,
                }),
              },
              FAIL: {
                target: 'error',
                assign: (_ctx, payload) => ({
                  hasKey: payload.hasKey,
                  activeModel: null,
                  error: payload.error,
                  requestId: payload.requestId,
                }),
              },
            },
          },
          requesting_primary: {
            on: {
              SYNC_KEY: {
                target: 'requesting_primary',
                assign: (ctx, payload) => ({ ...ctx, hasKey: payload.hasKey }),
              },
              RETRY_FALLBACK: {
                guard: (ctx, payload) => payload.requestId === ctx.requestId,
                target: 'retrying_fallback',
                assign: (ctx, payload) => ({ ...ctx, activeModel: payload.model }),
              },
              SUCCEED: {
                guard: (ctx, payload) => payload.requestId === ctx.requestId,
                target: 'succeeded',
                assign: ctx => ({ ...ctx, activeModel: null, error: undefined }),
              },
              FAIL: {
                guard: (ctx, payload) => payload.requestId >= ctx.requestId,
                target: 'error',
                assign: (_ctx, payload) => ({
                  hasKey: payload.hasKey,
                  activeModel: null,
                  error: payload.error,
                  requestId: payload.requestId,
                }),
              },
            },
          },
          retrying_fallback: {
            on: {
              SYNC_KEY: {
                target: 'retrying_fallback',
                assign: (ctx, payload) => ({ ...ctx, hasKey: payload.hasKey }),
              },
              SUCCEED: {
                guard: (ctx, payload) => payload.requestId === ctx.requestId,
                target: 'succeeded',
                assign: ctx => ({ ...ctx, activeModel: null, error: undefined }),
              },
              FAIL: {
                guard: (ctx, payload) => payload.requestId >= ctx.requestId,
                target: 'error',
                assign: (_ctx, payload) => ({
                  hasKey: payload.hasKey,
                  activeModel: null,
                  error: payload.error,
                  requestId: payload.requestId,
                }),
              },
            },
          },
          succeeded: {
            on: {
              SYNC_KEY: {
                target: (_ctx, payload) => (payload.hasKey ? 'succeeded' : 'unconfigured'),
                assign: (ctx, payload) => ({ ...ctx, hasKey: payload.hasKey }),
              },
              REQUEST_PRIMARY: {
                target: 'requesting_primary',
                assign: (_ctx, payload) => ({
                  hasKey: true,
                  activeModel: payload.model,
                  error: undefined,
                  requestId: payload.requestId,
                }),
              },
              FAIL: {
                target: 'error',
                assign: (_ctx, payload) => ({
                  hasKey: payload.hasKey,
                  activeModel: null,
                  error: payload.error,
                  requestId: payload.requestId,
                }),
              },
            },
          },
          error: {
            on: {
              SYNC_KEY: {
                target: (ctx, payload) => {
                  if (payload.hasKey && !ctx.hasKey) return 'idle';
                  if (!payload.hasKey && ctx.hasKey) return 'unconfigured';
                  return 'error';
                },
                assign: (ctx, payload) => ({
                  ...ctx,
                  hasKey: payload.hasKey,
                  error:
                    payload.hasKey !== ctx.hasKey ? undefined : ctx.error,
                }),
              },
              REQUEST_PRIMARY: {
                target: 'requesting_primary',
                assign: (_ctx, payload) => ({
                  hasKey: true,
                  activeModel: payload.model,
                  error: undefined,
                  requestId: payload.requestId,
                }),
              },
              FAIL: {
                target: 'error',
                assign: (_ctx, payload) => ({
                  hasKey: payload.hasKey,
                  activeModel: null,
                  error: payload.error,
                  requestId: payload.requestId,
                }),
              },
            },
          },
        },
      };
    },
    { formatContext: formatGeminiCloudContext },
  );

  useEffect(() => {
    send('SYNC_KEY', { hasKey: Boolean(apiKey) });
  }, [apiKey, send]);

  const setApiKey = useCallback(
    (key: string) => {
      if (key) {
        localStorage.setItem('gemini_api_key', key);
        setLocalKey(key);
        setManualOverride({ baseExternal: externalApiKey, key });
        send('SYNC_KEY', { hasKey: true });
      } else {
        localStorage.removeItem('gemini_api_key');
        setLocalKey(null);
        setManualOverride({ baseExternal: externalApiKey, key: null });
        send('SYNC_KEY', { hasKey: false });
      }
    },
    [externalApiKey, send],
  );

  const generateFeedback = useCallback(
    async (model: CloudModel, contextString: string) => {
      const requestId = machine.getContext().requestId + 1;
      const effectiveKey = apiKey || localStorage.getItem('gemini_api_key');
      if (!effectiveKey) {
        send('FAIL', {
          error: 'API Key missing — add your Gemini API key via the Settings gear',
          hasKey: false,
          requestId,
        });
        return '';
      }

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

      send('REQUEST_PRIMARY', { model: targetModel, requestId });

      const client = new GoogleGenAI({ apiKey: effectiveKey });

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
            send('RETRY_FALLBACK', { model: 'gemini-3.8-flash', requestId });
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

        send('SUCCEED', { requestId });
        return text;
      } catch (err: unknown) {
        console.error('Gemini Cloud failed:', err);
        send('FAIL', {
          error: (err as Error).message,
          hasKey: true,
          requestId,
        });
        return '';
      }
    },
    [apiKey, machine, send],
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

  const status: CloudStatus = useMemo(
    () => ({
      state: toLegacyCloudState(phase),
      phase,
      error: context.error,
      hasKey: context.hasKey,
    }),
    [phase, context.error, context.hasKey],
  );

  const getSnapshot = useCallback(() => machine.getSnapshot(), [machine]);

  return { status, generateFeedback, generateAudio, setApiKey, apiKey, getSnapshot };
};
