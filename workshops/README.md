# Workshops

## Overview

Hands-on technical workshop and codelab implementations accompanying the repository's web and AI talks. Houses full-stack reference applications and streaming services used in live developer labs.

## Subdirectories & Boundaries

- **Trustable AI Codelab**: [./trustable-ai-codelab/README.md](./trustable-ai-codelab/README.md) — End-to-end "Building Trustable AI at 100 MPH" workshop combining a Python FastAPI 10Hz GPSD Server-Sent Events telemetry backend (`streaming-telemetry-server`) with the React 19 + TypeScript + `@google/genai` Split-Brain Koru racing coach simulator (`koru-application`).

## Interface

- `[trustable-ai-codelab/streaming-telemetry-server/ingest.py:app]`: FastAPI 10Hz telemetry server exposing `GET /`, `GET /state`, `POST /mock`, SSE streams `GET /events` and `GET /stream` (`[trustable-ai-codelab/streaming-telemetry-server/ingest.py:message_stream]`), CLI flags `--mock`, `--serial`, `--binary`, `--port`, `--baud`, and `HOST`/`PORT` env vars (`[trustable-ai-codelab/streaming-telemetry-server/.env.example:PORT]`).
- `[trustable-ai-codelab/koru-application/package.json:scripts.dev]`, `scripts.build`, `scripts.lint`, & `scripts.preview`: Vite + TypeScript frontend scripts mounting `[trustable-ai-codelab/koru-application/src/App.tsx:App]`.

## Invariants

- `[trustable-ai-codelab/streaming-telemetry-server/ingest.py:mock_gps_generator]` & `[trustable-ai-codelab/koru-application/src/services/telemetryStreamService.ts:TelemetryStreamService.processPoint]`: Maintain GPSD `'TPV'` JSON schema compatibility across the SSE boundary (10Hz emission in m/s converted to km/h with G-forces clamped to `[-3, 3]`).
- `[trustable-ai-codelab/koru-application/src/services/coachingService.ts:CoachingService.processFrame]`: Preserves deterministic local operation for hot-path (`DECISION_MATRIX`) and GPS geofence feedforward (`< 150` m) coaching independent of Gemini API key availability or cloud latency.

## Side Effects

- `[trustable-ai-codelab/streaming-telemetry-server/ingest.py:load_track_data]` & `[trustable-ai-codelab/streaming-telemetry-server/ingest.py:serial_reader]`: Reads `SampleStream2024.csv` in mock mode or opens USB serial GPS hardware (calling `sys.exit(1)` on `serial.SerialException`) and serves HTTP/SSE streams via `uvicorn.run` in `__main__`.
- `[trustable-ai-codelab/koru-application/src/App.tsx:App]`, `[trustable-ai-codelab/koru-application/src/services/telemetryStreamService.ts:TelemetryStreamService.connect]`, `[trustable-ai-codelab/koru-application/src/services/coachingService.ts:CoachingService.runColdPath]`, `[trustable-ai-codelab/koru-application/src/hooks/useGeminiCloud.ts:useGeminiCloud]`, `[trustable-ai-codelab/koru-application/src/hooks/useTTS.ts:useTTS]`, & `[trustable-ai-codelab/koru-application/src/services/audioService.ts:AudioService]`: Read/write `localStorage` (`'gemini_api_key'`), open `EventSource`/`fetch` telemetry streams, call `@google/genai` `Interactions API` endpoints, and output browser audio via Web Audio API, `HTMLAudioElement`, and `window.speechSynthesis`.

## Verification

- Repository suite: `npm test` and `node scripts/verify-trustable-ai-workshop.mjs` (from repository root)
- Koru frontend: `npm run build` and `npm run lint` (in `workshops/trustable-ai-codelab/koru-application`)
- Telemetry server: `python -m unittest test_nmea_parsing.py` (in `workshops/trustable-ai-codelab/streaming-telemetry-server`)
