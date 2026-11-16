# Utilities

## Overview

Shared pure utilities and domain knowledge constants for the Koru racing coach simulator. Encapsulates PCM-to-WAV binary header encoding for Gemini TTS audio chunks, the 5 AI coach personas, the deterministic `<50ms` `DECISION_MATRIX` heuristic table, `RACING_PHYSICS_KNOWLEDGE` prompt guardrails, and resilient VBOX/CSV telemetry parsing via PapaParse.

## Interface

- `[audioUtils.ts:WavConversionOptions]`: Exported interface `{ numChannels: number; sampleRate: number; bitsPerSample: number }`.
- `[audioUtils.ts:parseMimeType]`: Exported function `(mimeType: string) => WavConversionOptions` extracting PCM audio format parameters from MIME strings.
- `[audioUtils.ts:createWavHeader]`: Exported function `(dataLength: number, options: WavConversionOptions) => Uint8Array` building a 44-byte RIFF/WAVE PCM header.
- `[audioUtils.ts:convertToWav]`: Exported function `(rawDataChunks: string[], mimeType: string) => Uint8Array` decoding base64 PCM chunks and prepending a WAV header.
- `[coachingKnowledge.ts:COACHES]`: Exported `Record<string, CoachPersona>` defining 5 coach personas keyed by ID (`'tony'`, `'rachel'`, `'aj'`, `'garmin'`, `'superaj'`).
- `[coachingKnowledge.ts:DEFAULT_COACH]`: Exported constant `'superaj'`.
- `[coachingKnowledge.ts:DecisionRule]`: Exported interface `{ action: CoachAction; condition: string; check: (frame: { brake: number; throttle: number; gLat: number; gLong: number; speed: number }) => boolean }`.
- `[coachingKnowledge.ts:DECISION_MATRIX]`: Exported `DecisionRule[]` array of 8 ordered deterministic rules (`'THRESHOLD'`, `'TRAIL_BRAKE'`, `'COMMIT'`, `'THROTTLE'`, `'PUSH'`, `'COAST'`, `'DONT_BE_A_WUSS'`, `'FULL_THROTTLE'`).
- `[coachingKnowledge.ts:RACING_PHYSICS_KNOWLEDGE]`: Exported prompt guardrail string encoding Friction Circle, Weight Transfer, Racing Line, and Thunderhill East corner guidance.
- `[telemetryParser.ts:parseTelemetryCSV]`: Exported function `(csvText: string) => TelemetryFrame[]` parsing VBOX and generic CSV telemetry logs via `papaparse`.

## Invariants

- `[audioUtils.ts:parseMimeType]`: Defaults to `{ numChannels: 1, sampleRate: 24000, bitsPerSample: 16 }`, keeping `numChannels = 1`, overriding `bitsPerSample` from `'L<bits>'` subtypes when `!isNaN(bits)`, and overriding `sampleRate` from `'rate=<hz>'` parameters via `parseInt(value, 10)` (without a `NaN` guard).
- `[audioUtils.ts:createWavHeader]` / `[audioUtils.ts:convertToWav]`: Always emits a 44-byte little-endian PCM (`audioFormat = 1`) RIFF/WAVE header and returns a `Uint8Array` of exact length `44 + dataLength` (requiring `window.atob` for base64 decoding).
- `[coachingKnowledge.ts:DEFAULT_COACH]` / `[coachingKnowledge.ts:COACHES]`: `DEFAULT_COACH` (`'superaj'`) is guaranteed to exist in `COACHES`, every record key matches `CoachPersona.id`, persona examples reference `km/h` speed deltas, and every persona `systemPrompt` enforces a word-count ceiling (`<12` to `<20` words).
- `[coachingKnowledge.ts:DECISION_MATRIX]`: Evaluates `TelemetryFrame.speed` thresholds (`45`, `60`, `80` `km/h`) in strict first-match order where specific rules precede broader overlapping rules (e.g., `'COMMIT'` precedes `'THROTTLE'`, `'COAST'` precedes `'DONT_BE_A_WUSS'`).
- `[telemetryParser.ts:parseTelemetryCSV]` & `[telemetryParser.ts:parseCoordinate]`: Drops rows only when *both* raw `latStr` and `lonStr` are empty or *both* parsed `latitude` and `longitude` equal `0`; parses DMS strings containing `'°'` via `/(\d+)°([\d.]+)\s*([NSEW])/` with `parseFloat(coord) || 0` fallback; clamps `throttle`/`brake` to `[0, 100]`, falling back to `'Brake Pressure (bar)'` (`Math.min(100, rawBrakeBar * 2.5)`) when percentage brake `<= 0` before synthesizing virtual pedals from `gLong`; validates ranges on optional `gear` (`0 < rawGear < 10`) and `steering` (`-900 < rawSteer < 900 && rawSteer !== 0`) while mapping only `0` to `undefined` via `getVal(...) || undefined` on `distance`, `altitude`, and `rpm`.

## Side Effects

- `[telemetryParser.ts:parseTelemetryCSV]`: Logs up to 3 CSV parse warnings via `console.warn('CSV parse warnings:', result.errors.slice(0, 3))` when `Papa.parse` reports `result.errors.length > 0`.

## Verification

- Run: `npm run build` and `npm run lint` (in `workshops/trustable-ai-codelab/koru-application`)
