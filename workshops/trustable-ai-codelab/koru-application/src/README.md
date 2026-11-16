# Koru Application Source (`src`)

## Overview

Application root package for the Koru React 19 + TypeScript racing coach simulator. Defines the shared domain type system (`types.ts`), global design tokens and layout styles (`index.css`), React DOM bootstrapper (`main.tsx`), and browser-persisted Gemini API key state and client-side routing (`App.tsx`), coordinating six feature subpackages covering UI components, track geofence data, hooks, route pages, runtime services, and shared utilities.

## Interface

- `[types.ts:TelemetryFrame]`: Exported interface for normalized 10Hz telemetry samples (`time`, `latitude`, `longitude`, `speed` in `km/h`, `throttle`, `brake`, `gLat`, `gLong`, plus optional `altitude`, `rpm`, `steering`, `gear`, `distance`).
- `[types.ts:GpsSSEPoint]`: Exported interface for raw GPSD SSE `TPV` / telemetry points (`time`, `lat`, `lon`, `speed` in `m/s` or `km/h` when `> 200`, plus optional `alt`, `climb`, `track`, `mode`, `brake`, `throttle`, `rpm`, `gear`, `steering`, `gLat`, `gLong`).
- `[types.ts:Corner]`: Exported interface `{ id: number; name: string; entryDist: number; apexDist: number; exitDist: number; lat: number; lon: number; advice: string }`.
- `[types.ts:Sector]` & `[types.ts:Track]`: Exported interfaces `{ id: number; name: string; startDist: number; endDist: number }` and `{ name: string; length: number; sectors: Sector[]; corners: Corner[]; mapPoints: { x: number; y: number }[]; recordLap: number; center?: { lat: number; lng: number }; zoom?: number }`.
- `[types.ts:Lap]` & `[types.ts:Session]`: Exported interfaces `{ id: string; lapNumber: number; time: number; valid: boolean; frames: TelemetryFrame[]; sectors: number[]; isComplete: boolean }` and `{ id: string; trackName: string; date: string; laps: Lap[]; bestLapId: string; weather: 'Sunny' | 'Cloudy' | 'Rain'; trackTemp: number }`.
- `[types.ts:CoachPersona]`: Exported interface `{ id: string; name: string; style: string; systemPrompt: string; icon: string }`.
- `[types.ts:CoachAction]`: Exported 15-member coaching directive string literal union (`'THRESHOLD' | 'TRAIL_BRAKE' | 'BRAKE' | 'WAIT' | 'TURN_IN' | 'COMMIT' | 'ROTATE' | 'APEX' | 'THROTTLE' | 'PUSH' | 'FULL_THROTTLE' | 'STABILIZE' | 'MAINTAIN' | 'COAST' | 'DONT_BE_A_WUSS'`).
- `[types.ts:SSEConnectionStatus]`, `[types.ts:TTSProvider]`, `[types.ts:CloudModel]`: Exported string literal unions constraining SSE connection states (`'disconnected' | 'connecting' | 'connected' | 'error'`), TTS backends (`'browser' | 'gemini'`), and Gemini cloud model tiers (`'flash' | 'pro'`).
- `[App.tsx:App]`: Default-exported root React router component rendering `Landing` at `'/'` and wrapping `'/dashboard'`, `'/live'`, `'/replay'`, and `'/analysis'` with `Navbar` and shared `apiKey` state.
- `[main.tsx:root]` & `[index.css::root]`: Side-effect browser module entrypoint (zero exports) importing `./index.css` (`:root` design tokens and global layout classes) and mounting `<StrictMode><App /></StrictMode>` onto `#root`.
- Child Subpackage Contracts:
  - [Components](./components/README.md): Presentational React UI gauges, charts, track map, navbar, playback controls, and coach feed.
  - [Track Data](./data/README.md): Thunderhill Raceway (East) circuit model and Sonoma Raceway GPS geofence corners.
  - [Hooks](./hooks/README.md): React hooks for `@google/genai` cloud inference, 8-second predictive lookahead, and persona TTS.
  - [Pages](./pages/README.md): Route views (`Landing`, `Dashboard`, `LiveSession`, `Replay`, `Analysis`).
  - [Services](./services/README.md): Stateful SSE/mock telemetry stream, Split-Brain coaching engine, Gemini wrapper, and Web Audio cue service.
  - [Utilities](./utils/README.md): PCM-to-WAV audio helpers, `COACHES`, `DECISION_MATRIX`, `RACING_PHYSICS_KNOWLEDGE`, and CSV parser.

## Invariants

- `[main.tsx:root]`: Requires DOM element `#root` (`document.getElementById('root')!`) to exist in `index.html` at module evaluation time.
- `[App.tsx:handleApiKeyChange]`: Coerces empty API key strings to `null` in React state (`setApiKey(key || null)`) and removes `'gemini_api_key'` from `localStorage` instead of storing `""`.
- `[App.tsx:App]`: Renders `'/'` (`Landing`) standalone without `Navbar`, while `'/*'` wraps `'/dashboard'`, `'/live'`, `'/replay'`, and `'/analysis'` inside `Navbar` + `<main className="main-content">` (rendering an empty `<main>` under `Navbar` for any other unmatched URL path).
- `[types.ts:Session]`, `[types.ts:CoachAction]`, `[types.ts:SSEConnectionStatus]`, `[types.ts:TTSProvider]`, `[types.ts:CloudModel]`: Constrain weather conditions, coaching actions, stream connection states, TTS providers, and LLM tiers to closed TypeScript string literal unions.

## Side Effects

- `[main.tsx:root]` & `[index.css:@import]`: Imports `./index.css` (requesting `Inter` and `JetBrains Mono` from `https://fonts.googleapis.com`), queries `document.getElementById('root')!`, creates a React DOM root, and mounts `<StrictMode><App /></StrictMode>` on module load.
- `[App.tsx:App]` & `[App.tsx:handleApiKeyChange]`: Reads, writes, and deletes `window.localStorage` key `'gemini_api_key'` and binds `BrowserRouter` to `window.location` / browser history.

## Verification

- Run: `npm run build` and `npm run lint` (in `workshops/trustable-ai-codelab/koru-application`)
