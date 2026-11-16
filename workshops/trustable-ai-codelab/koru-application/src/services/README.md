# Services

## Overview

Stateful runtime services powering telemetry ingestion, Split-Brain AI coaching orchestration, cloud LLM interactions, and low-latency audio cue playback. Combines deterministic `<50ms` heuristic evaluation, Haversine GPS corner feedforward alerts, rate-limited `@google/genai` cloud inference, and 10Hz Server-Sent Events (`EventSource`) / mock file streaming.

## Interface

- `[audioService.ts:AudioService]`: Exported audio cue manager class using Web Audio API `AudioContext` with browser Web Speech API fallback:
  - `[audioService.ts:AudioService.init]`: `async init(): Promise<void>` — initializes `AudioContext` (catching failures via `console.warn`) and preloads `/audio/{action}.mp3` clips for all 13 non-neutral actions listed in `[audioService.ts:ACTIONS]`.
  - `[audioService.ts:AudioService.play]`: `play(action: CoachAction): boolean` — plays cached buffer (or calls `speakFallback` via `[audioService.ts:FALLBACK_PHRASES]` / normalized action words when unbuffered) for all 13 non-neutral actions outside cooldown.
  - `[audioService.ts:AudioService.speak]`: `speak(text: string): void` — synthesizes speech via `window.speechSynthesis` (`rate: 1.2`, `pitch: 0.9`).
  - `[audioService.ts:AudioService.destroy]`: `destroy(): void` — closes `AudioContext` and clears decoded audio buffers.
- `[coachingService.ts:CoachingService]`: Exported Split-Brain coaching engine coordinating hot, feedforward, and cold coaching paths:
  - `[coachingService.ts:CoachingService.setCoach]` / `[coachingService.ts:CoachingService.getCoach]`: Sets active persona ID and retrieves `CoachPersona` (falling back to `COACHES[DEFAULT_COACH]`).
  - `[coachingService.ts:CoachingService.setApiKey]`: `setApiKey(key: string): void` — configures Gemini API key (or `null` if empty).
  - `[coachingService.ts:CoachingService.onCoaching]`: `onCoaching(cb: (msg: { path: 'hot' | 'cold' | 'feedforward'; action?: CoachAction; text: string }) => void): () => void` — subscribes to coaching events and returns an unsubscribe callback.
  - `[coachingService.ts:CoachingService.processFrame]`: `processFrame(frame: TelemetryFrame): void` — executes synchronous hot-path heuristics, synchronous corner geofence feedforward, and asynchronous cold-path cloud reasoning.
- `[geminiService.ts:GeminiService]`: Exported `@google/genai` service wrapper (`constructor(apiKey: string)`):
  - `[geminiService.ts:GeminiService.generateCoaching]`: `async generateCoaching(contextString: string): Promise<string>` — requests real-time strategy feedback using `'gemini-3.8-flash'`.
  - `[geminiService.ts:GeminiService.analyzeLap]`: `async analyzeLap(lapData: string): Promise<string>` — runs post-session lap analysis using `'gemini-4-argon'` with automatic `'gemini-3.8-flash'` fallback.
- `[telemetryStreamService.ts:TelemetryStreamService]`: Exported singleton-capable 10Hz telemetry ingestion service:
  - `[telemetryStreamService.ts:TelemetryStreamService.getInstance]`: `static getInstance(): TelemetryStreamService` — returns lazily initialized singleton instance.
  - `[telemetryStreamService.ts:TelemetryStreamService.getStatus]` / `[telemetryStreamService.ts:TelemetryStreamService.onStatus]` / `[telemetryStreamService.ts:TelemetryStreamService.onFrame]`: Exposes connection state (`SSEConnectionStatus`) and pub/sub listener registration returning unsubscribe callbacks.
  - `[telemetryStreamService.ts:TelemetryStreamService.connect]` / `[telemetryStreamService.ts:TelemetryStreamService.disconnect]`: Opens live `EventSource` streams or `.txt` (JSON-lines) / `.csv` (`parseTelemetryCSV`) file replays and tears down active connections/timers.

## Invariants

- `[audioService.ts:NEUTRAL_ACTIONS]` / `[audioService.ts:AudioService.play]`: Suppresses `'STABILIZE'` and `'MAINTAIN'` (always returning `false`) and enforces `[audioService.ts:AudioService.minInterval]` (`1500` ms) against repeating identical `lastAction` cues.
- `[audioService.ts:AudioService.preloadAll]`, `[audioService.ts:ACTIONS]`, & `[audioService.ts:FALLBACK_PHRASES]`: `ACTIONS` enumerates all 13 non-neutral `CoachAction` literals (including `'COAST'` and `'DONT_BE_A_WUSS'`), decoding and caching HTTP responses only when `res.ok` is true and `content-type` starts with `'audio/'`, while `[audioService.ts:AudioService.speakFallback]` speaks explicit `FALLBACK_PHRASES` for `'COAST'` and `'DONT_BE_A_WUSS'` and `action.replace(/_/g, ' ').toLowerCase()` otherwise.
- `[coachingService.ts:CoachingService.getCoach]`: Resolves unknown `coachId` values to `COACHES[DEFAULT_COACH]` (`'superaj'`).
- `[coachingService.ts:CoachingService.runHotPath]` & `[coachingService.ts:CoachingService.humanizeAction]`: Enforces `[coachingService.ts:CoachingService.hotCooldownMs]` (`1500` ms), evaluates `DECISION_MATRIX` in order stopping at first match, suppresses `'STABILIZE'`/`'MAINTAIN'`, updates `lastHotAction`/`lastHotTime` to deduplicate consecutive identical triggers, and formats persona callouts using `km/h` speed bands (`fast`: `speed > 110`, `med`: `60 < speed <= 110`).
- `[coachingService.ts:CoachingService.runColdPath]`: Skips execution when `apiKey` is `null`, stamps `[coachingService.ts:CoachingService.coldCooldownMs]` (`15000` ms, `lastColdTime`) prior to async dispatch, formats telemetry speed in `km/h`, and emits only when `interaction.output_text` is non-empty.
- `[coachingService.ts:CoachingService.runFeedforward]` / `[coachingService.ts:CoachingService.findNearestCorner]`: Updates `lastCorner` and emits corner advice only when Haversine distance to a corner in `ALL_CORNERS` (`THUNDERHILL_EAST.corners` + `SONOMA_CORNERS`) is `< 150` meters and `nearest !== lastCorner`.
- `[geminiService.ts:GeminiService.callApi]`: Never throws on SDK errors; retries once with `'gemini-3.8-flash'` when the primary model differs, and returns `''` on failure or empty output.
- `[telemetryStreamService.ts:TelemetryStreamService.connect]` & `[telemetryStreamService.ts:TelemetryStreamService.replayFile]`: Always calls `disconnect()` before connecting; strips query/hash suffixes and lowercases paths to route `.txt` and `.csv` URLs to `replayFile` (bailing out if `status !== 'connecting'` after `fetch`, parsing CSV payloads via `parseTelemetryCSV` when the URL ends in `'.csv'` or the first non-HTML line does not start with `'{'`, preserving the `JSON.parse` -> `parseSSEPoint` -> `processPoint` path for JSON-lines `.txt` files, streaming on a `100` ms loop with `prevPoint = null` reset on wrap, and setting `'error'` if empty) and routes all other URLs to `EventSource`.
- `[telemetryStreamService.ts:TelemetryStreamService.parseSSEPoint]` / `[telemetryStreamService.ts:TelemetryStreamService.processPoint]`: Drops frames with `NaN` `lat`/`lon` (and CSV `onmessage` lines with `< 6` fields); clamps `dt` to `0.1` s when outside `(0.02, 2.0)` s; multiplies speeds `<= 200` by `3.6` (storing km/h in `TelemetryFrame.speed`); clamps `gLat`/`gLong` to `[-3, 3]`; synthesizes virtual `brake`/`throttle` in `[0, 100]` only when both raw inputs are `undefined`.

## Side Effects

- `[audioService.ts:AudioService.init]` / `[audioService.ts:AudioService.preloadAll]` / `[audioService.ts:AudioService.play]` / `[audioService.ts:AudioService.destroy]`: Creates and closes browser `AudioContext` (logging `console.warn` on `AudioContext` failure), fetches `/audio/${action}.mp3` over HTTP, outputs audio via `AudioContext.destination` or `window.speechSynthesis`, and mutates `lastPlayTime`/`lastAction`.
- `[coachingService.ts:CoachingService.runHotPath]`, `[coachingService.ts:CoachingService.runColdPath]`, `[coachingService.ts:CoachingService.runFeedforward]`, & `[geminiService.ts:GeminiService.callApi]`: Mutate internal cooldown/corner tracking fields (`lastHotAction`, `lastHotTime`, `lastColdTime`, `lastCorner`), instantiate `@google/genai` `GoogleGenAI` clients, send HTTPS requests via `client.interactions.create` (`'gemini-3.8-flash'`, `'gemini-4-argon'`), log errors to `console.error`, and invoke subscribed coaching listeners via `[coachingService.ts:CoachingService.emit]`.
- `[telemetryStreamService.ts:TelemetryStreamService.connect]` / `[telemetryStreamService.ts:TelemetryStreamService.replayFile]` / `[telemetryStreamService.ts:TelemetryStreamService.disconnect]`: Opens/closes browser `EventSource` SSE connections, performs `fetch(url)` requests (logging `console.error` on replay load failure), schedules/clears `100` ms `setTimeout` timers, mutates singleton stream state, and invokes status/frame listeners.

## Verification

- Run: `npm run build` and `npm run lint` (in `workshops/trustable-ai-codelab/koru-application`)
