import { GoogleGenAI } from '@google/genai';
import { RACING_PHYSICS_KNOWLEDGE } from '../utils/coachingKnowledge';
import { createMachine, type KoruMachineSnapshot } from '../utils/stateMachine';

export type GeminiServiceState =
  | 'idle'
  | 'requesting_primary'
  | 'retrying_fallback'
  | 'succeeded'
  | 'error';

interface GeminiServiceContext {
  readonly activeModel: string | null;
  readonly error?: string;
}

type GeminiServiceEvents = {
  REQUEST_PRIMARY: { model: string };
  RETRY_FALLBACK: { model: string };
  SUCCEED: undefined;
  FAIL: { error: string };
};

/**
 * Gemini Cloud wrapper using the Google GenAI Interactions API.
 */
export class GeminiService {
  private apiKey: string;

  private readonly machine = createMachine<
    GeminiServiceState,
    GeminiServiceContext,
    GeminiServiceEvents
  >({
    id: 'gemini-service',
    initial: 'idle',
    context: {
      activeModel: null,
      error: undefined,
    },
    states: {
      idle: {
        on: {
          REQUEST_PRIMARY: {
            target: 'requesting_primary',
            assign: (_ctx, payload) => ({ activeModel: payload.model, error: undefined }),
          },
        },
      },
      requesting_primary: {
        on: {
          RETRY_FALLBACK: {
            target: 'retrying_fallback',
            assign: (_ctx, payload) => ({ activeModel: payload.model, error: undefined }),
          },
          SUCCEED: {
            target: 'succeeded',
            assign: ctx => ({ ...ctx, error: undefined }),
          },
          FAIL: {
            target: 'error',
            assign: (_ctx, payload) => ({ activeModel: null, error: payload.error }),
          },
        },
      },
      retrying_fallback: {
        on: {
          SUCCEED: {
            target: 'succeeded',
            assign: ctx => ({ ...ctx, error: undefined }),
          },
          FAIL: {
            target: 'error',
            assign: (_ctx, payload) => ({ activeModel: null, error: payload.error }),
          },
        },
      },
      succeeded: {
        on: {
          REQUEST_PRIMARY: {
            target: 'requesting_primary',
            assign: (_ctx, payload) => ({ activeModel: payload.model, error: undefined }),
          },
        },
      },
      error: {
        on: {
          REQUEST_PRIMARY: {
            target: 'requesting_primary',
            assign: (_ctx, payload) => ({ activeModel: payload.model, error: undefined }),
          },
        },
      },
    },
  });

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getSnapshot = (): KoruMachineSnapshot<
    GeminiServiceState,
    keyof GeminiServiceEvents & string,
    Readonly<GeminiServiceContext>
  > => {
    return this.machine.getSnapshot();
  };

  /** Generate coaching feedback with Gemini 3.8 Flash */
  async generateCoaching(contextString: string): Promise<string> {
    const prompt = `Reference the racing physics knowledge below to diagnose the user's telemetry.

${RACING_PHYSICS_KNOWLEDGE}

INPUT DATA:
${contextString}

TASK:
1. Identify the corner with the biggest time loss.
2. Explain the error using physics principles.

OUTPUT FORMAT:
**Directive:** [Short, actionable instruction]
### Analysis
[Detailed explanation using markdown]`;

    return this.callApi('gemini-3.8-flash', 'You are a Race Engineer.', prompt);
  }

  /** Deep lap analysis with Gemini 4 Argon (fallback to Gemini 3.8 Flash) */
  async analyzeLap(lapData: string): Promise<string> {
    const prompt = `${RACING_PHYSICS_KNOWLEDGE}

### EXAMPLES OF EXPERT ANALYSIS:
**Bad:** "You went too slow. Speed up." -> Too generic.
**Good:** "In Turn 2, the telemetry shows a sudden throttle lift. Keep 10-20% 'maintenance throttle' to keep the rear planted. Physics: Lift-Off Oversteer (Weight Transfer Rule #2)."

### LAP DATA:
${lapData}

Analyze the lap. For each issue found:
**Directive:** [Max 10 words]
### Analysis
**Physics Diagnosis:** [explanation]
**Telemetry Evidence:** [data reference]
**Fix:** [actionable instruction]`;

    return this.callApi('gemini-4-argon', 'You are an Elite Driver Coach analyzing a full lap.', prompt);
  }

  private async callApi(model: string, systemInstruction: string, prompt: string): Promise<string> {
    const client = new GoogleGenAI({ apiKey: this.apiKey });
    this.machine.send('REQUEST_PRIMARY', { model });
    try {
      const interaction = await client.interactions.create({
        model,
        system_instruction: systemInstruction,
        input: prompt,
      });
      this.machine.send('SUCCEED');
      return interaction.output_text || '';
    } catch (err) {
      if (model !== 'gemini-3.8-flash') {
        this.machine.send('RETRY_FALLBACK', { model: 'gemini-3.8-flash' });
        try {
          const fallback = await client.interactions.create({
            model: 'gemini-3.8-flash',
            system_instruction: systemInstruction,
            input: prompt,
          });
          this.machine.send('SUCCEED');
          return fallback.output_text || '';
        } catch (fallbackErr) {
          console.error('GeminiService fallback error:', fallbackErr);
          const msg = fallbackErr instanceof Error ? fallbackErr.message : 'Fallback request failed';
          this.machine.send('FAIL', { error: msg });
          return '';
        }
      }
      console.error('GeminiService error:', err);
      const msg = err instanceof Error ? err.message : 'Primary request failed';
      this.machine.send('FAIL', { error: msg });
      return '';
    }
  }
}
