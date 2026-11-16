# Koru Application Source (`src`)

## Overview

Application root package for the Koru React 19 + TypeScript racing coach simulator. Defines the shared domain and finite-state-machine type system (`types.ts`), global design tokens and layout styles (`index.css`), React DOM bootstrapper (`main.tsx`), and browser-persisted Gemini API key state, client-side routing, and `window.__KORU_MACHINES__` AX registry initialization (`App.tsx`), coordinating six feature subpackages covering UI components, track geofence data, hooks, route pages, runtime services, and shared utilities.

## Interface

- `[types.ts:TelemetryFrame]`: Exported interface for normalized 10Hz telemetry samples (`time`, `latitude`, `longitude`, `speed` in `km/h`, `throttle`, `brake`, `gLat`, `gLong`, plus optional `altitude`, `rpm`, `steering`, `gear`, `distance`).
- `[types.ts:GpsSSEPoint]`: Exported interface for raw GPSD SSE `TPV` / telemetry points (`time`, `lat`, `lon`, `speed` in `m/s` or `km/h` when `> 200`, plus optional `alt`, `climb`, `track`, `mode`, `brake`, `throttle`, `rpm`, `gear`, `steering`, `gLat`, `gLong`).
- `[types.ts:Corner]`: Exported interface `{ id: number; name: string; entryDist: number; apexDist: number; exitDist: number; lat: number; lon: number; advice: string }`.
- `[types.ts:Sector]` & `[types.ts:Track]`: Exported interfaces `{ id: number; name: string; startDist: number; endDist: number }` and `{ name: string; length: number; sectors: Sector[]; corners: Corner[]; mapPoints: { x: number; y: number }[]; recordLap: number; center?: { lat: number; lng: number }; zoom?: number }`.
- `[types.ts:Lap]` & `[types.ts:Session]`: Exported interfaces `{ id: string; lapNumber: number; time: number; valid: boolean; frames: TelemetryFrame[]; sectors: number[]; isComplete: boolean }` and `{ id: string; trackName: string; date: string; laps: Lap[]; bestLapId: string; weather: 'Sunny' | 'Cloudy' | 'Rain'; trackTemp: number }`.
- `[types.ts:CoachPersona]`: Exported interface `{ id: string; name: string; style: string; systemPrompt: string; icon: string }`.
- `[types.ts:CoachAction]`: Exported 15-member coaching directive string literal union (`'THRESHOLD' | 'TRAIL_BRAKE' | 'BRAKE' | 'WAIT' | 'TURN_IN' | 'COMMIT' | 'ROTATE' | 'APEX' | 'THROTTLE' | 'PUSH' | 'FULL_THROTTLE' | 'STABILIZE' | 'MAINTAIN' | 'COAST' | 'DONT_BE_A_WUSS'`).
- `[types.ts:SSEConnectionStatus]`, `[types.ts:TelemetryStreamMode]`, `[types.ts:TelemetryStreamState]`, `[types.ts:ReplayTransportState]`, `[types.ts:ReplayAnalysisState]`, `[types.ts:LapComparisonState]`, `[types.ts:TTSProvider]`, `[types.ts:TTSPhase]`, `[types.ts:CloudModel]`, `[types.ts:GeminiCloudPhase]`, `[types.ts:HotCooldownState]`, & `[types.ts:ColdPathState]`: Exported closed string literal unions typing external SSE statuses, explicit route/service/hook state machines, TTS backends/phases, Gemini cloud model tiers/phases, and Split-Brain cooldown gates.
- `[App.tsx:App]`: Default-exported root React router component initializing `window.__KORU_MACHINES__` via `[utils/stateMachine.ts:ensureKoruMachineRegistry]`, rendering `Landing` eagerly at `'/'`, and wrapping lazy-loaded `'/dashboard'`, `'/live'`, `'/replay'`, and `'/analysis'` routes (`React.lazy` + `Suspense`) with a skip link, `Navbar`, `[App.tsx:RouteTitleSync]`, and shared `apiKey` state.
- `[main.tsx:root]` & `[index.css::root]`: Side-effect browser module entrypoint (zero exports) importing `./index.css` (`:root` dark `color-scheme` design tokens, scrollbar/slider properties, and global layout classes) and mounting `<StrictMode><App /></StrictMode>` onto `#root`.
- Child Subpackage Contracts:
  - [Components](./components/README.md): Presentational React UI gauges, charts, track map, navbar, playback controls, and coach feed.
  - [Track Data](./data/README.md): Thunderhill Raceway (East) circuit model and Sonoma Raceway GPS geofence corners.
  - [Hooks](./hooks/README.md): React hooks for `@google/genai` cloud inference, 8-second predictive lookahead, and persona TTS state machines.
  - [Pages](./pages/README.md): Route views (`Landing`, `Dashboard`, `LiveSession`, `Replay`, `Analysis`) with explicit transport/stream/comparison state machines.
  - [Services](./services/README.md): Stateful SSE/mock telemetry stream, Split-Brain coaching engine, Gemini wrapper, and Web Audio cue services.
  - [Utilities](./utils/README.md): Typed `createMachine` / `useMachine` / `window.__KORU_MACHINES__` foundation, PCM-to-WAV audio helpers, `COACHES`, `DECISION_MATRIX`, `RACING_PHYSICS_KNOWLEDGE`, and CSV parser.

## Invariants

- `[main.tsx:root]`: Requires DOM element `#root` (`document.getElementById('root')!`) to exist in `index.html` at module evaluation time.
- `[App.tsx:handleApiKeyChange]`: Coerces empty API key strings to `null` in React state (`setApiKey(key || null)`) and removes `'gemini_api_key'` from `localStorage` instead of storing `""`.
- `[App.tsx:App]` & `[App.tsx:RouteTitleSync]`: Initializes `window.__KORU_MACHINES__` eagerly on module evaluation (before lazy route chunks load), renders `'/'` (`Landing`) standalone without `Navbar`, updates `document.title` per route (`[App.tsx:ROUTE_TITLES]`), and under `'/*'` wraps lazy-loaded `'/dashboard'`, `'/live'`, `'/replay'`, and `'/analysis'` inside a skip link + `Navbar` + `<main id="main-content" className="main-content">` (`<Suspense>` boundary, rendering an empty `<main>` under `Navbar` for any other unmatched URL path).
- `[types.ts:Session]`, `[types.ts:CoachAction]`, `[types.ts:SSEConnectionStatus]`, `[types.ts:TelemetryStreamState]`, `[types.ts:ReplayTransportState]`, `[types.ts:ReplayAnalysisState]`, `[types.ts:LapComparisonState]`, `[types.ts:TTSProvider]`, `[types.ts:TTSPhase]`, `[types.ts:CloudModel]`, `[types.ts:GeminiCloudPhase]`, `[types.ts:HotCooldownState]`, & `[types.ts:ColdPathState]`: Constrain weather conditions, coaching actions, state-machine phases, TTS providers, and LLM tiers to closed TypeScript string literal unions (no TypeScript `enum`s, satisfying `erasableSyntaxOnly: true`).

## Side Effects

- `[main.tsx:root]` & `[index.css::root]`: Imports `./index.css`, queries `document.getElementById('root')!`, creates a React DOM root, and mounts `<StrictMode><App /></StrictMode>` on module load.
- `[App.tsx:App]`, `[App.tsx:RouteTitleSync]`, & `[App.tsx:handleApiKeyChange]`: Initializes `window.__KORU_MACHINES__`, reads, writes, and deletes `window.localStorage` key `'gemini_api_key'`, binds `BrowserRouter` to `window.location` / browser history, updates `document.title` on route transitions, and dynamically imports route chunks via `React.lazy`.

## Verification

- Run: `npm run build` and `npm run lint` (in `workshops/trustable-ai-codelab/koru-application`)
