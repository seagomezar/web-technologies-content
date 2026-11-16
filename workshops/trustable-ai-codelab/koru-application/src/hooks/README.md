# Hooks

## Overview

Custom React hooks encapsulating cloud LLM coaching and audio interactions (`@google/genai`), GPS distance-aligned lap delta and 8-second predictive lookahead coaching, and expressive persona text-to-speech synthesis with automatic browser Web Speech API fallback.

## Interface

- `[useGeminiCloud.ts:useGeminiCloud]`: Exported React hook `(externalApiKey?: string | null) => { status: { state: 'idle' | 'loading' | 'error' | 'success'; error?: string; hasKey: boolean }; generateFeedback: (model: CloudModel, contextString: string) => Promise<string>; generateAudio: (text: string, voiceName?: string) => Promise<Blob | null>; setApiKey: (key: string) => void; apiKey: string | null }`.
- `[usePredictiveCoaching.ts:usePredictiveCoaching]`: Exported React hook `() => { analyzeLap: (recentLap: TelemetryFrame[], idealLap: TelemetryFrame[]) => MistakeZone[]; checkLookahead: (currentFrame: TelemetryFrame) => MistakeZone | null; getMistakeZones: () => MistakeZone[] }` where file-local `MistakeZone` has shape `{ distance: number; speedDelta: number; cornerName: string; advice: string }`.
- `[useTTS.ts:useTTS]`: Exported React hook `(apiKey: string | null, coachId = 'superaj') => { provider: TTSProvider; isSpeaking: boolean; setProvider: (provider: TTSProvider) => void; speak: (text: string) => Promise<void> }` initializing `{ provider: 'browser', isSpeaking: false }` and mapping personas `'aj'`, `'rachel'`, `'tony'`, `'garmin'`, and `'superaj'` to Gemini voices (`'Fenrir'`, `'Kore'`, `'Puck'`, `'Charon'`, `'Zephyr'`), speech styles (`[useTTS.ts:PERSONA_SPEECH_STYLE]`), and browser `{ rate, pitch }` configs (`[useTTS.ts:PERSONA_BROWSER_CONFIG]`).

## Invariants

- `[useGeminiCloud.ts:useGeminiCloud]`: Resolves initial `apiKey` as `externalApiKey ?? localStorage.getItem('gemini_api_key') ?? null` and re-synchronizes `apiKey` and `status.hasKey` whenever `externalApiKey !== undefined`.
- `[useGeminiCloud.ts:generateFeedback]`: Requires a non-empty `effectiveKey` (`apiKey || localStorage.getItem('gemini_api_key')`), returning `''` and setting `status.state = 'error'` when absent; maps `model === 'pro'` to `'gemini-4-argon'` and `'flash'` to `'gemini-3.8-flash'`, retrying once with `'gemini-3.8-flash'` if `'gemini-4-argon'` fails, and returning `''` on unhandled error.
- `[useGeminiCloud.ts:generateAudio]`: Defaults `voiceName` to `'Zephyr'` and audio MIME type to `'audio/wav'`; returns `null` without throwing when `effectiveKey` is missing, `interaction.output_audio?.data` is absent, or the API call fails.
- `[usePredictiveCoaching.ts:alignByDistance]`: Accumulates Haversine distance (`R = 6371000` meters) across sequential frames and buckets speeds to the nearest 5 meters (`Math.round(cumDist / 5) * 5`).
- `[usePredictiveCoaching.ts:analyzeLap]`: Flags a `MistakeZone` at shared 5m buckets where `recentSpeed - idealSpeed < -15` (`km/h`, falling back to `` `${dist}m` `` and `` `Lost ${Math.abs(delta).toFixed(0)} km/h here` `` when no `THUNDERHILL_EAST.corners` apex lies within `< 150` m), deduplicates per `cornerName` keeping the most negative `speedDelta`, and resets `lastTriggeredRef.current = null`.
- `[usePredictiveCoaching.ts:checkLookahead]`: Converts `currentFrame.speed` from `km/h` to `m/s` (`currentFrame.speed / 3.6`), triggers only when `0 < (zone.distance - (currentFrame.distance || 0)) < (currentFrame.speed / 3.6) * 8`, and suppresses consecutive repeat alerts for the same `zone.cornerName` via `lastTriggeredRef`.
- `[useTTS.ts:speak]`: Returns immediately if `!text.trim()` or `isFetchingRef.current` is `true`; falls back to `'Zephyr'` / `'focused motorsport coach'` / `{ rate: 1.1, pitch: 0.9 }` for unknown `coachId` values (whereas default `'superaj'` uses `'focused, confident adaptive motorsport coach'`); falls back to `[useTTS.ts:speakBrowser]` when `[useTTS.ts:speakGemini]` throws; always resets `isFetchingRef.current = false` and `isSpeaking = false` in `finally`.
- `[useTTS.ts:speakGemini]`: Throws `Error('API key required')` if `apiKey` is falsy.
- `[useTTS.ts:speakBrowser]`: Resolves cleanly without rejecting when `!('speechSynthesis' in window)` or `SpeechSynthesisUtterance.onerror` fires.
- `[useTTS.ts:playBlobAudio]`: Always revokes temporary object URLs via `URL.revokeObjectURL(url)` on `onended`, `onerror`, or `play()` rejection.

## Side Effects

- `[useGeminiCloud.ts:useGeminiCloud]` / `[useGeminiCloud.ts:setApiKey]`: Reads, writes, and removes `localStorage` key `'gemini_api_key'`.
- `[useGeminiCloud.ts:generateFeedback]`: Issues HTTPS requests to `@google/genai` `client.interactions.create` (`'gemini-4-argon'` / `'gemini-3.8-flash'` grounded in `RACING_PHYSICS_KNOWLEDGE`) and logs failures via `console.error`.
- `[useGeminiCloud.ts:generateAudio]` / `[useTTS.ts:speakGemini]`: Issues HTTPS requests to `@google/genai` (`apiVersion: 'v1beta'`) `client.interactions.create` (`'gemini-3.8-flash-lite-tts'`), decodes base64 audio payloads via `window.atob`, and logs failures via `console.error` (`[useGeminiCloud.ts:generateAudio]`, `[useTTS.ts:speak]`).
- `[usePredictiveCoaching.ts:analyzeLap]` / `[usePredictiveCoaching.ts:checkLookahead]`: Mutates mutable React refs `mistakeZonesRef.current` and `lastTriggeredRef.current`.
- `[useTTS.ts:playBlobAudio]`: Allocates and revokes Blob URLs (`URL.createObjectURL` / `URL.revokeObjectURL`) and plays audio through browser `HTMLAudioElement`.
- `[useTTS.ts:speakBrowser]`: Invokes browser `window.speechSynthesis.speak` with `SpeechSynthesisUtterance`.

## Verification

- Run: `npm run build` and `npm run lint` (in `workshops/trustable-ai-codelab/koru-application`)
