# Streaming Telemetry Server

## Overview

Python **FastAPI** service that streams **10Hz GPSD TPV (or binary) telemetry** over **Server-Sent Events (SSE)** for the **"Building Trustable AI at 100 MPH"** codelab. Supports zero-hardware mock CSV replay (`SampleStream2024.csv`) and live USB serial NMEA/binary GPS ingestion.

## Modes

- **Mock mode (default for Codelab & Cloud Run)**: Replays `SampleStream2024.csv` (11,539 real VBOX GPS frames at 10Hz) over SSE at `/events`.
- **Serial GPS mode**: Reads live NMEA sentences from a USB GPS receiver (e.g. VK-162) via `--serial --port <PORT> --baud 9600` (CLI `--baud` defaults to `115200` if omitted; passing a non-default `--port` without `--mock` also activates serial mode).
- **Binary mode (`--binary`)**: Emits `{"class": "BINARY", "data": "<HEX>", "device": ...}` frames in either mock (16 random bytes per tick) or serial mode.

## Local Setup (Zero Cloud Billing Needed)

```bash
cd streaming-telemetry-server
python -m venv .venv

# Activate virtual environment:
# macOS / Linux:
source .venv/bin/activate
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt
python ingest.py --mock
```

Test the live SSE stream in your browser or terminal:
- Browser / Koru Live Session SSE URL: `http://localhost:8000/events` (also aliased at `/stream`)
- Terminal: `curl -N http://localhost:8000/events`
- Unit tests: `python -m unittest test_nmea_parsing.py`

## Deploy to Google Cloud Run (Codelab Step 5)

From the `trustable-ai-codelab` parent folder:

```bash
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

gcloud run deploy streaming-telemetry-server \
  --source streaming-telemetry-server \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

Append `/events` to the deployed Cloud Run URL:
`https://streaming-telemetry-server-<PROJECT_NUMBER>.us-central1.run.app/events`

## Tear Down (Codelab Step 10)

```bash
gcloud run services delete streaming-telemetry-server \
  --region us-central1 \
  --platform managed
```

## Interface

- `[ingest.py:app]`: FastAPI ASGI application (`'Trustable AI Streaming Telemetry Server'`) configured with `[ingest.py:lifespan]` async context manager and permissive `CORSMiddleware` (`allow_origins=['*']`).
- `[ingest.py:mock_settings]`: Module-level runtime configuration and state dict (`enabled`, `track_data`, `track_index`, `use_serial`, `serial_port`, `baud_rate`, `mode`).
- `[ingest.py:root]`: `GET /` health/discovery endpoint returning `{'service': 'streaming-telemetry-server', 'status': 'ok', 'mock_enabled': bool, 'points_loaded': int, 'sse_endpoint': '/events'}`.
- `[ingest.py:get_state]`: `GET /state` endpoint returning `{'mock_enabled': bool, 'points_loaded': int, 'track_index': int}`.
- `[ingest.py:update_mock_state]` & `[ingest.py:MockUpdate]`: `POST /mock` endpoint accepting `MockUpdate` (`enabled: bool`) to toggle mock broadcasting and returning `{'status': 'ok', 'mock_enabled': bool}`.
- `[ingest.py:message_stream]`: `GET /events` and `GET /stream` SSE endpoints returning `EventSourceResponse` streams of JSON-serialized GPSD `'TPV'` or `'BINARY'` payloads.
- `[ingest.py:Broadcaster]` / `[ingest.py:broadcaster]` / `[ingest.py:broadcast_data]`: Async pub/sub fan-out dispatcher managing per-client `asyncio.Queue` subscriptions.
- `[ingest.py:parse_vbox_coord]`, `[ingest.py:resolve_csv_path]`, `[ingest.py:load_track_data]`: VBOX coordinate and UTF-8-BOM CSV ingestion helpers loading `SampleStream2024.csv` into `{lat, lon, alt, speed_kmh, heading}` records.
- `[ingest.py:parse_nmea_sentence]`, `[ingest.py:BinaryParser]`, `[ingest.py:serial_reader]`, `[ingest.py:mock_gps_generator]`: NMEA RMC/GGA parser, binary hex parser scaffold, live `serial_asyncio` reader, and 10Hz mock telemetry generator.
- CLI flags & runtime config: `[ingest.py:--mock]`, `[ingest.py:--serial]`, `[ingest.py:--binary]`, `[ingest.py:--port]` (default `'/dev/ttyUSB0'`), `[ingest.py:--baud]` (default `115200`), `[.env.example:HOST]` (read via `os.getenv('HOST', '0.0.0.0')` in `__main__`), `[.env.example:PORT]` (read via `os.getenv('PORT', 8000)` in `__main__`), `[Procfile:web]` (`python ingest.py --mock`), and `[requirements.txt:fastapi]` runtime dependencies.

## Invariants

- `[ingest.py:Broadcaster.subscribe]`: Always removes subscriber `asyncio.Queue` instances in a `finally` block on client disconnect, while `[ingest.py:Broadcaster.publish]` iterates over a `list(self.subscribers)` snapshot.
- `[ingest.py:parse_vbox_coord]` & `[ingest.py:load_track_data]`: Coordinates must match `(\d+)°([\d\.]+)\s+([NSEW])` (negating `'S'` and `'W'`, returning `0.0` on mismatch); CSV rows with `lat == 0.0 and lon == 0.0` or parse errors are skipped.
- `[ingest.py:mock_gps_generator]`: Guarantees non-empty `mock_settings['track_data']` via a static Sonoma coordinate fallback, wraps `track_index` modulo `len(track_data)`, emits 16 random hex bytes as `{'class': 'BINARY', ...}` when `mode == 'binary'` or converts `speed_kmh` to m/s (`/ 3.6`) into a `'TPV'` dict when `mode == 'nmea'`, emits at `0.1` s intervals (10Hz) when enabled, and idles at `0.5` s intervals without advancing `track_index` when disabled.
- `[ingest.py:update_mock_state]`: Setting `enabled=False` resets `mock_settings['track_index']` to `0`.
- `[ingest.py:parse_nmea_sentence]`: Emits `'TPV'` dicts exclusively for `RMC` and `GGA` sentences (converting knots to m/s via `* 0.514444` and setting `mode=3` when `msg.is_valid` else `1`), returning `None` for all other sentence types or malformed lines.
- `[ingest.py:lifespan]` & `[ingest.py:use_serial]`: Evaluates `use_serial = args.serial or (args.port != '/dev/ttyUSB0' and not args.mock)` in `__main__` (remaining `False` under direct ASGI `ingest:app` import); `lifespan` spawns exactly one background task (`serial_reader` when `use_serial` is `True`, otherwise `mock_gps_generator`) and cancels it on shutdown.

## Side Effects

- `[ingest.py:logging.basicConfig]`: Configures process-wide `INFO` logging and module-level singletons (`broadcaster`, `mock_settings`, `app`) on import.
- `[ingest.py:lifespan]` & `[ingest.py:load_track_data]`: Spawns/cancels the background `asyncio` producer task; when running `mock_gps_generator` (`use_serial == False`), reads `SampleStream2024.csv` synchronously from disk on generator startup.
- `[ingest.py:mock_gps_generator]` & `[ingest.py:update_mock_state]`: Mutates global `mock_settings` state (`enabled`, `track_data`, `track_index`) and broadcasts JSON frames to connected SSE client queues.
- `[ingest.py:serial_reader]`: Opens hardware serial ports via `serial_asyncio.open_serial_connection` and terminates the process with `sys.exit(1)` on `serial.SerialException`.
- `[ingest.py:load_dotenv]`: Loads `.env` environment variables in `__main__` and binds an HTTP server via `uvicorn.run` on `host:port`.

## Verification

- Run: `python -m unittest test_nmea_parsing.py` (in `workshops/trustable-ai-codelab/streaming-telemetry-server`)
