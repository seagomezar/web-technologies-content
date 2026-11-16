import argparse
import asyncio
import csv
import json
import logging
import os
import random
import re
import sys
from contextlib import asynccontextmanager
from datetime import datetime, timezone

import pynmea2
import serial
import serial_asyncio
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


class Broadcaster:
    def __init__(self):
        self.subscribers: set[asyncio.Queue] = set()

    async def publish(self, message: str):
        for queue in list(self.subscribers):
            await queue.put(message)

    async def subscribe(self):
        queue: asyncio.Queue = asyncio.Queue()
        self.subscribers.add(queue)
        try:
            while True:
                yield await queue.get()
        finally:
            self.subscribers.discard(queue)


broadcaster = Broadcaster()


async def broadcast_data(data: str):
    await broadcaster.publish(data)


class BinaryParser:
    """Scaffold for VBox Binary Protocol Parser."""

    def __init__(self):
        self.buffer = bytearray()

    def parse(self, data: bytes):
        if data:
            yield {
                "class": "BINARY",
                "data": data.hex().upper(),
            }


# Global settings for runtime / mock mode
mock_settings = {
    "enabled": True,
    "mode": "nmea",
    "use_serial": False,
    "serial_port": "/dev/ttyUSB0",
    "serial_baud": 115200,
    "binary_mode": False,
    "track_data": [],
    "track_index": 0,
}


def parse_vbox_coord(coord_str: str) -> float:
    """
    Parses VBOX coordinate string like '38°9.631176 N' or '122°27.228036 W'
    to signed decimal degrees.
    """
    try:
        match = re.match(r"(\d+)°([\d\.]+)\s+([NSEW])", coord_str.strip())
        if not match:
            return 0.0

        degrees = int(match.group(1))
        minutes = float(match.group(2))
        direction = match.group(3)

        decimal_degrees = degrees + (minutes / 60.0)
        if direction in ["S", "W"]:
            decimal_degrees = -decimal_degrees

        return decimal_degrees
    except Exception as e:
        logger.error(f"Error parsing coordinate {coord_str}: {e}")
        return 0.0


def resolve_csv_path(filepath: str) -> str:
    """Resolve SampleStream2024.csv across cwd, script directory, and parent directory."""
    if os.path.exists(filepath):
        return filepath

    script_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.join(script_dir, os.path.basename(filepath)),
        os.path.join(script_dir, "SampleStream2024.csv"),
        os.path.join(script_dir, "..", "SampleStream2024.csv"),
    ]
    for candidate in candidates:
        if os.path.exists(candidate):
            return candidate
    return filepath


def load_track_data(filepath: str = "SampleStream2024.csv"):
    """Loads track data from VBOX CSV (handling UTF-8 BOM cleanly)."""
    data = []
    try:
        resolved = resolve_csv_path(filepath)
        if not os.path.exists(resolved):
            logger.error(f"CSV file not found at {resolved}")
            return []

        logger.info(f"Loading track data from {resolved}...")

        with open(resolved, "r", encoding="utf-8-sig", errors="ignore") as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                try:
                    lat = parse_vbox_coord(row["Latitude"])
                    lon = parse_vbox_coord(row["Longitude"])
                    speed_kmh = float(row["Speed (km/h)"] or 0)
                    heading = float(row["Heading (Degrees)"] or 0)
                    alt = float(row.get("Height (m)") or 0)

                    if lat == 0.0 and lon == 0.0:
                        continue

                    data.append(
                        {
                            "lat": lat,
                            "lon": lon,
                            "alt": alt,
                            "speed_kmh": speed_kmh,
                            "heading": heading,
                        }
                    )
                    count += 1
                except (ValueError, KeyError):
                    continue

            logger.info(f"Loaded {count} track points.")
            return data

    except Exception as e:
        logger.error(f"Failed to load track data: {e}")
        return []


async def mock_gps_generator(mode: str = "nmea"):
    """Generates 10Hz mock GPSD TPV telemetry from SampleStream2024.csv."""
    logger.info(f"Starting Mock GPS Generator in {mode} mode")

    mock_settings["track_data"] = load_track_data("SampleStream2024.csv")

    if not mock_settings["track_data"]:
        logger.warning("No track data loaded. Falling back to static point.")
        mock_settings["track_data"] = [
            {"lat": 38.16052, "lon": -122.45380, "alt": 32.0, "speed_kmh": 0, "heading": 0}
        ]

    while True:
        if not mock_settings["enabled"]:
            await asyncio.sleep(0.5)
            continue

        idx = mock_settings["track_index"]
        track_data = mock_settings["track_data"]

        if idx >= len(track_data):
            idx = 0
            mock_settings["track_index"] = 0

        point = track_data[idx]
        mock_settings["track_index"] = idx + 1

        if mode == "binary":
            dummy_bytes = random.randbytes(16)
            data = json.dumps(
                {
                    "class": "BINARY",
                    "data": dummy_bytes.hex().upper(),
                    "device": "/dev/mock",
                }
            )
        else:
            speed_ms = point["speed_kmh"] / 3.6
            current_time = datetime.now(timezone.utc).isoformat()

            tpv = {
                "class": "TPV",
                "device": "/dev/mock",
                "mode": 3,
                "time": current_time,
                "lat": point["lat"],
                "lon": point["lon"],
                "alt": point.get("alt", 0),
                "speed": speed_ms,
                "track": point["heading"],
                "climb": 0,
                "epx": 0.5,
                "epy": 0.5,
                "epv": 1.0,
            }
            data = json.dumps(tpv)

        await broadcast_data(data)
        await asyncio.sleep(0.1)  # 10Hz


def parse_nmea_sentence(line: str):
    """Parses an NMEA sentence (RMC/GGA) and returns a GPSD TPV dict or None."""
    try:
        msg = pynmea2.parse(line)
        if isinstance(msg, (pynmea2.types.talker.RMC, pynmea2.types.talker.GGA)):
            lat = getattr(msg, "latitude", 0.0)
            lon = getattr(msg, "longitude", 0.0)
            speed_knots = getattr(msg, "spd_over_grnd", 0.0)
            speed_ms = float(speed_knots or 0) * 0.514444
            heading = getattr(msg, "true_course", 0.0)
            current_time = datetime.now(timezone.utc).isoformat()

            return {
                "class": "TPV",
                "device": "/dev/serial",
                "mode": 3 if msg.is_valid else 1,
                "time": current_time,
                "lat": lat,
                "lon": lon,
                "alt": float(getattr(msg, "altitude", 0.0) or 0.0),
                "speed": speed_ms,
                "track": float(heading or 0.0),
            }
    except pynmea2.ParseError:
        pass
    except Exception as e:
        logger.error(f"Error parsing NMEA: {e}")
    return None


async def serial_reader(port: str, baud: int, binary_mode: bool = False):
    """Reads data from the serial port and broadcasts it."""
    logger.info(f"Starting Serial Reader on {port} at {baud} baud (Binary: {binary_mode})")
    parser = BinaryParser() if binary_mode else None

    try:
        reader, _ = await serial_asyncio.open_serial_connection(url=port, baudrate=baud)
        while True:
            if binary_mode and parser is not None:
                chunk = await reader.read(1024)
                if chunk:
                    for packet in parser.parse(chunk):
                        await broadcast_data(json.dumps(packet))
            else:
                line = await reader.readline()
                if line:
                    decoded_line = line.decode("utf-8", errors="ignore").strip()
                    if decoded_line:
                        parsed = parse_nmea_sentence(decoded_line)
                        if parsed:
                            await broadcast_data(json.dumps(parsed))
    except serial.SerialException as e:
        logger.error(f"Could not open serial port {port}: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Error in serial reader: {e}")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    if mock_settings["use_serial"]:
        task = asyncio.create_task(
            serial_reader(
                mock_settings["serial_port"],
                mock_settings["serial_baud"],
                mock_settings["binary_mode"],
            )
        )
    else:
        mode = "binary" if mock_settings["binary_mode"] else "nmea"
        task = asyncio.create_task(mock_gps_generator(mode))
    try:
        yield
    finally:
        task.cancel()


app = FastAPI(title="Trustable AI Streaming Telemetry Server", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MockUpdate(BaseModel):
    enabled: bool


@app.get("/")
async def root():
    return {
        "service": "streaming-telemetry-server",
        "status": "ok",
        "mock_enabled": mock_settings["enabled"],
        "points_loaded": len(mock_settings["track_data"]),
        "sse_endpoint": "/events",
    }


@app.get("/state")
async def get_state():
    return {
        "mock_enabled": mock_settings["enabled"],
        "points_loaded": len(mock_settings["track_data"]),
        "track_index": mock_settings["track_index"],
    }


@app.post("/mock")
async def update_mock_state(update: MockUpdate):
    mock_settings["enabled"] = update.enabled
    if not update.enabled:
        mock_settings["track_index"] = 0
        logger.info("Mock Data Disabled & Reset")
    else:
        logger.info("Mock Data Enabled")
    return {"status": "ok", "mock_enabled": mock_settings["enabled"]}


@app.get("/events")
@app.get("/stream")
async def message_stream(request: Request):
    """Server-Sent Events (SSE) telemetry endpoint."""

    async def event_generator():
        async for message in broadcaster.subscribe():
            if await request.is_disconnected():
                break
            yield {"data": message}

    return EventSourceResponse(event_generator())


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="VBox Streamer Backend")
    parser.add_argument("--mock", action="store_true", help="Run in mock mode (default unless --serial is passed)")
    parser.add_argument("--serial", action="store_true", help="Read live NMEA from serial GPS dongle")
    parser.add_argument("--binary", action="store_true", help="Enable binary protocol mode")
    parser.add_argument("--port", type=str, default="/dev/ttyUSB0", help="Serial port")
    parser.add_argument("--baud", type=int, default=115200, help="Baud rate")

    args = parser.parse_args()

    import uvicorn
    from dotenv import load_dotenv

    load_dotenv()

    # Use serial only when explicitly requested (--serial or custom --port without --mock)
    use_serial = args.serial or (args.port != "/dev/ttyUSB0" and not args.mock)
    mock_settings["use_serial"] = use_serial
    mock_settings["serial_port"] = args.port
    mock_settings["serial_baud"] = args.baud
    mock_settings["binary_mode"] = args.binary

    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")

    uvicorn.run(app, host=host, port=port)
