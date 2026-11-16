# Components

## Overview

Presentational React UI components for the Koru racing coach simulator. This package renders real-time vehicle gauges, synchronized Recharts telemetry traces, 2D SVG track maps with named corner markers, replay transport controls, top-bar route navigation with Gemini API key settings, and the multi-path coaching message feed, reflecting explicit `[data-machine][data-state]` attributes on interactive panels.

## Interface

- `[CoachPanel.tsx:CoachPanel]`: Default-exported React component (`(props: { messages: CoachMessage[]; activeCoach: string; onCoachChange: (id: string) => void; audioEnabled: boolean; onAudioToggle: () => void; ttsPhase?: TTSPhase }) => JSX.Element`) rendering persona selector pills, audio toggle, and scrolling coaching feed with `data-machine="tts-pipeline"` and `data-state={ttsPhase}`.
- `[CoachPanel.tsx:CoachMessage]`: Exported interface (`{ id: string; path: 'hot' | 'cold' | 'feedforward'; text: string; timestamp: number }`) representing a rendered coaching event.
- `[GaugeCluster.tsx:GaugeCluster]`: Default-exported React component (`(props: { frame: TelemetryFrame | null }) => JSX.Element`) displaying digital speed (`km/h`), gear, optional RPM, throttle/brake progress bars, and lateral/longitudinal G-forces.
- `[Navbar.tsx:Navbar]`: Default-exported React component (`(props: { apiKey: string | null; onApiKeyChange: (key: string) => void }) => JSX.Element`) rendering navigation links (`/dashboard`, `/live`, `/replay`, `/analysis`), Gemini key connection badge, and top-layer `[popover="auto"]` API key settings panel with key-visibility toggle.
- `[PlaybackControls.tsx:PlaybackControls]`: Default-exported React component (`(props: { isPlaying: boolean; onPlayPause: () => void; currentFrame: number; totalFrames: number; onSeek: (frame: number) => void; speed: number; onSpeedChange: (speed: number) => void; currentTime?: string; transportState?: ReplayTransportState }) => JSX.Element`) rendering transport buttons, frame timeline scrubber, and playback speed selector with `data-machine="replay-transport"` and `data-state`.
- `[TelemetryCharts.tsx:TelemetryCharts]`: Default-exported React component (`(props: { frames: TelemetryFrame[]; maxPoints?: number }) => JSX.Element`) rendering three stacked Recharts `AreaChart` / `LineChart` panels for speed (`Speed (km/h)`), throttle/brake (`Throttle / Brake (%)`), and lateral/longitudinal G-forces.
- `[TrackMap.tsx:TrackMap]`: Default-exported React component (`(props: { track: Track; currentFrame?: TelemetryFrame }) => JSX.Element`) rendering a 2D SVG circuit polyline, named corner markers (`{c.name}`), and animated vehicle position dot.

## Invariants

- `[CoachPanel.tsx:CoachPanel]`: Defaults `ttsPhase` to `'idle'`, sets `data-machine="tts-pipeline"` and `data-state={ttsPhase}` on `.coach-panel`, falls back to `COACHES[DEFAULT_COACH]` when `COACHES[activeCoach]` is falsy, and displays at most the latest 20 messages in reverse chronological order (`messages.slice(-20).reverse()`).
- `[CoachPanel.tsx:CoachMessage]`: Restricts `path` strictly to the union `'hot' | 'cold' | 'feedforward'`.
- `[GaugeCluster.tsx:GaugeCluster]`: Defaults numeric channels to `0` when `frame` is `null` (and coerces optional `frame.rpm` and `frame.gear` from `undefined` to `0` via `?? 0` when `frame` is non-null); renders rounded `speed` labeled `'km/h'`, renders gear as `'N'` when `gear <= 0`, and omits the RPM readout unless `rpm > 0`.
- `[Navbar.tsx:Navbar]` & `[Navbar.tsx:SUPPORTS_POPOVER]`: Initializes local `keyInput` state once from `apiKey || ''` on mount without re-syncing on subsequent `apiKey` prop changes; binds static `NavLink` routes to `/dashboard`, `/live`, `/replay`, and `/analysis`; uses native `popover="auto"` / `popoverTarget` when `Object.hasOwn(HTMLElement.prototype, 'popover')` is true (falling back to controlled `hidden` + `Escape` handling otherwise) and restores focus to `triggerRef` after saving.
- `[PlaybackControls.tsx:PlaybackControls]`: Derives `resolvedState` from `transportState` (falling back deterministically to `'empty' | 'playing' | 'ended' | 'paused'` from `totalFrames`, `isPlaying`, and `currentFrame`), sets `data-machine="replay-transport"` and `data-state={resolvedState}` on `.playback-controls`, labels the play button `'Restart replay'` when `resolvedState === 'ended'`, clamps skip-back seeks to `Math.max(0, currentFrame - 100)`, skip-forward seeks to `Math.min(totalFrames - 1, currentFrame + 100)`, and range input bounds to `[0, totalFrames - 1]`, while syncing `--attr-min`, `--attr-max` (`Math.max(1, totalFrames - 1)`), and `--control-value` CSS custom properties for active track progress styling.
- `[PlaybackControls.tsx:SPEED_OPTIONS]`: Restricts selectable playback speed multipliers to `[0.1, 0.25, 0.5, 1, 2, 5, 10]`.
- `[PlaybackControls.tsx:formatFrame]`: Guards progress percentage against division by zero by returning `'0.0%'` when `total <= 0`.
- `[TelemetryCharts.tsx:TelemetryCharts]`: Defaults `maxPoints` to `200`, slices input data to `frames.slice(-maxPoints)`, returns `<div className="chart-empty">No telemetry data</div>` when `data.length === 0`, labels the speed panel `'Speed (km/h)'`, and fixes Y-axis domains to `[0, 'auto']` (speed), `[0, 100]` (throttle/brake), and `[-2, 2]` (G-forces).
- `[TrackMap.tsx:TrackMap]`: Pads `track.mapPoints` SVG `viewBox` bounds by `40` units per side; clamps corner apex indices via `Math.min(ptIdx, track.mapPoints.length - 1)` and skips markers when `!pt`; renders the vehicle marker only when `currentFrame` is defined and `track.mapPoints.length > 1`, wrapping index modulo `len` via `((currentFrame.time * 0.6) % len + len) % len`.

## Side Effects

- None (`[CoachPanel.tsx:CoachPanel]`, `[GaugeCluster.tsx:GaugeCluster]`, `[Navbar.tsx:Navbar]`, `[PlaybackControls.tsx:PlaybackControls]`, `[TelemetryCharts.tsx:TelemetryCharts]`, and `[TrackMap.tsx:TrackMap]` perform no direct network, storage, or global state mutations, delegating actions via prop callbacks).

## Verification

- Run: `npm run build` and `npm run lint` (in `workshops/trustable-ai-codelab/koru-application`)
