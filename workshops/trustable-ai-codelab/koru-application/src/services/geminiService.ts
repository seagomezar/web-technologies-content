import { GoogleGenAI } from '@google/genai';
import { RACING_PHYSICS_KNOWLEDGE } from '../utils/coachingKnowledge';

/**
 * Gemini Cloud wrapper using the Google GenAI Interactions API.
 */
export class GeminiService {
  private apiKey: string;

  constructor(apiKey: string) { this.apiKey = apiKey; }

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
    try {
      const interaction = await client.interactions.create({
        model,
        system_instruction: systemInstruction,
        input: prompt,
      });
      return interaction.output_text || '';
    } catch (err) {
      if (model !== 'gemini-3.8-flash') {
        try {
          const fallback = await client.interactions.create({
            model: 'gemini-3.8-flash',
            system_instruction: systemInstruction,
            input: prompt,
          });
          return fallback.output_text || '';
        } catch (fallbackErr) {
          console.error('GeminiService fallback error:', fallbackErr);
          return '';
        }
      }
      console.error('GeminiService error:', err);
      return '';
    }
  }
}
