# Pages

## Overview

Top-level route view components for the Koru racing coach web application, covering the marketing landing page, track overview dashboard, real-time 10Hz SSE/mock live coaching session, interactive telemetry CSV replay with predictive lookahead, and two-lap AI sector comparison.

## Interface

- `[Analysis.tsx:Analysis]`: Default-exported React page component (`(props: { apiKey?: string | null }) => JSX.Element`) providing dual-lap CSV upload/sample loading, stacked telemetry chart comparison, and Gemini `'pro'` lap delta analysis.
- `[Dashboard.tsx:Dashboard]`: Default-exported stateless React page component (`() => JSX.Element`) rendering quick-start route cards (`/live`, `/replay`, `/analysis`), `THUNDERHILL_EAST` circuit metrics and map, and a Split-Brain coaching architecture summary.
- `[Landing.tsx:Landing]`: Default-exported stateless React marketing page component (`() => JSX.Element`) presenting hero navigation (`/dashboard`, `/live`), Split-Brain architecture pillars, workflow steps, and coach persona cards.
- `[LiveSession.tsx:LiveSession]`: Default-exported React page component (`(props: { apiKey: string | null }) => JSX.Element`) orchestrating live SSE or built-in mock telemetry streaming, gauges, track map, rolling charts, 3-path `CoachingService` coaching (`'hot'`, `'feedforward'`, `'cold'`), and TTS audio playback.
- `[Replay.tsx:Replay]`: Default-exported React page component (`(props: { apiKey: string | null }) => JSX.Element`) providing CSV/sample lap scrubbing, variable-speed timer playback, 3-path `CoachingService` coaching plus `usePredictiveCoaching` mistake-zone lookahead alerts, and windowed Gemini `'flash'` telemetry analysis.

## Invariants

- `[Analysis.tsx:handleFile]` / `[Replay.tsx:handleFileUpload]`: Ignore change events lacking `e.target.files?.[0]`; file inputs constrain extensions via `accept=".csv,.txt"`; `Analysis.tsx:handleLoadSamples` clears `comparisonResult` to `''` whereas `Analysis.tsx:handleFile` retains prior `comparisonResult`.
- `[Analysis.tsx:handleCompare]`: Executes only when both `lap1Frames.length > 0` and `lap2Frames.length > 0`; formats `MaxSpeed`/`AvgSpeed` and 20th-frame samples in `km/h` (`filter((_, i) => i % 20 === 0).slice(0, 30)`) before invoking `generateFeedback('pro', context)` and caps rendered chart history at `maxPoints={500}`.
- `[Dashboard.tsx:Dashboard]`: Binds statically to `THUNDERHILL_EAST`, converts `track.length` from meters to miles via `track.length / 1609.34`, and formats lap times as `M:SS.d` in `[Dashboard.tsx:formatLapTime]`.
- `[LiveSession.tsx:LiveSession]`: Initializes `status` to `'disconnected'`, `activeCoach` to `'superaj'`, `audioEnabled` to `true`, and `sseUrl` to `''`; bounds rolling telemetry state to at most 501 frames (`[...prev.slice(-500), frame]`) and speaks coaching events only when both `audioEnabledRef.current` and `msg.text` are truthy.
- `[LiveSession.tsx:handleConnect]`: Calls `disconnect()` when `status === 'connected'`, otherwise connects to `sseUrl.trim() || '/mock-telemetry.txt'`.
- `[Replay.tsx:Replay]`: Initializes `currentIdx = 0`, `isPlaying = false`, `speed = 1`, `activeCoach = 'superaj'`, and `audioEnabled = true`; clamps playback interval delay to `Math.max(10, 100 / speed)` ms, slices chart data to `frames.slice(Math.max(0, currentIdx - 100), currentIdx + 1)`, and halts playback when `currentIdx >= frames.length - 1`.
- `[Replay.tsx:loadParsedFrames]`: Resets `currentIdx`, `isPlaying`, `messages`, and `analysisResult` on load, running `analyzeLap` only when `idealReference` is non-empty (enabled in `[Replay.tsx:handleLoadSample]`, omitted in `[Replay.tsx:handleFileUpload]`).
- `[Replay.tsx:evaluateFrameAt]`: Exits early when `allFrames[idx]` is undefined; emits predictive lookahead alerts (`lost ${Math.abs(zone.speedDelta).toFixed(0)} km/h last lap`) with `path: 'feedforward'` and triggers TTS only when `audioEnabledRef.current` is `true`.
- `[Replay.tsx:handleAnalyze]`: Requires `frames.length > 0`, extracts window `frames.slice(Math.max(0, currentIdx - 100), Math.min(frames.length - 1, currentIdx + 100))` formatted in `km/h` for `generateFeedback('flash', context)`, and appends a `path: 'cold'` message only when `result` is non-empty.

## Side Effects

- `[Analysis.tsx:handleFile]` / `[Replay.tsx:handleFileUpload]`: Reads local user-selected files asynchronously via browser `FileReader.readAsText`.
- `[Analysis.tsx:handleLoadSamples]` / `[Replay.tsx:handleLoadSample]`: Fetches static sample telemetry assets (`/sample-lap-a.csv`, `/sample-lap-b.csv`) over HTTP `fetch` and logs errors via `console.error`.
- `[Analysis.tsx:handleCompare]` / `[Replay.tsx:handleAnalyze]`: Invokes `useGeminiCloud(apiKey).generateFeedback` (`'pro'` / `'flash'`) for cloud LLM inference.
- `[LiveSession.tsx:LiveSession]`: Acquires singleton `TelemetryStreamService.getInstance()`, instantiates `CoachingService` and `AudioService`, runs `audio.init()` on mount, subscribes to stream and coaching callbacks (triggering `useTTS.speak`), syncs `apiKey` to `CoachingService.setApiKey`, and calls `stream.disconnect()` and `audio.destroy()` on unmount.
- `[LiveSession.tsx:handleConnect]` / `[LiveSession.tsx:handleQuickPreset]`: Opens and closes SSE or mock file streams via `TelemetryStreamService.connect` and `TelemetryStreamService.disconnect`.
- `[Replay.tsx:Replay]` / `[Replay.tsx:evaluateFrameAt]`: Manages `setInterval`/`clearInterval` playback timers, mutates `CoachingService` state (`setApiKey`, `setCoach`, `processFrame`), updates predictive lookahead state (`checkLookahead`), and invokes `useTTS.speak`.

## Verification

- Run: `npm run build` and `npm run lint` (in `workshops/trustable-ai-codelab/koru-application`)
