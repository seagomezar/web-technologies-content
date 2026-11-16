import Papa from 'papaparse';
import type { TelemetryFrame } from '../types';

/** Parse DMS coordinates like "35°29.340126 N" to decimal */
function parseCoordinate(coord: string): number {
  const match = coord.match(/(\d+)°([\d.]+)\s*([NSEW])/);
  if (!match) return parseFloat(coord) || 0;
  const degrees = parseInt(match[1], 10);
  const minutes = parseFloat(match[2]);
  const direction = match[3];
  let decimal = degrees + minutes / 60;
  if (direction === 'S' || direction === 'W') decimal = -decimal;
  return decimal;
}

/** Get numeric value from a row for any of the candidate column names */
function getVal(row: Record<string, string>, ...keys: string[]): number {
  for (const key of keys) {
    const v = row[key];
    if (v !== undefined && v !== '') {
      const n = parseFloat(v);
      if (!isNaN(n)) return n;
    }
  }
  return 0;
}

/** Get string value from a row */
function getStr(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== '') return row[key];
  }
  return '';
}

export function parseTelemetryCSV(csvText: string): TelemetryFrame[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  if (result.errors.length > 0) {
    console.warn('CSV parse warnings:', result.errors.slice(0, 3));
  }

  const frames: TelemetryFrame[] = [];

  for (const row of result.data) {
    const latStr = getStr(row, 'Latitude', 'lat', 'GPS_Lat');
    const lonStr = getStr(row, 'Longitude', 'lon', 'lng', 'GPS_Lon');

    if (!latStr && !lonStr) continue;

    const latitude = latStr.includes('°') ? parseCoordinate(latStr) : parseFloat(latStr) || 0;
    const longitude = lonStr.includes('°') ? parseCoordinate(lonStr) : parseFloat(lonStr) || 0;

    if (latitude === 0 && longitude === 0) continue;

    const rawBrakePct = getVal(row, 'Brake Position (%)', 'Brake', 'brake');
    const rawBrakeBar = getVal(row, 'Brake Pressure (bar)');
    const gLong = getVal(row, 'Lateral acceleration (g)') !== undefined
      ? getVal(row, 'Longitudinal acceleration (g)', 'G_Long', 'gLong')
      : 0;
    const gLat = getVal(row, 'Lateral acceleration (g)', 'G_Lat', 'gLat');

    let brake = rawBrakePct > 0 ? rawBrakePct : Math.min(100, rawBrakeBar * 2.5);
    if (brake < 2 && gLong < -0.3) {
      brake = Math.min(100, Math.abs(gLong) * 100);
    }

    let throttle = getVal(row, 'Throttle Position (%)', 'Throttle', 'throttle');
    if (throttle === 0 && gLong > 0.15) {
      throttle = Math.min(100, gLong * 150);
    }

    const rawGear = getVal(row, 'Gear', 'Gear ((null))', 'gear');
    const gear = rawGear > 0 && rawGear < 10 ? rawGear : undefined;

    const rawSteer = getVal(row, 'Steering Angle (Degrees)', 'Steering', 'steering');
    const steering = rawSteer > -900 && rawSteer < 900 && rawSteer !== 0 ? rawSteer : undefined;

    frames.push({
      time: getVal(row, 'Time', 'Elapsed time (s)', 'time', 'Time (s)'),
      distance: getVal(row, 'Distance (m)', 'distance') || undefined,
      latitude,
      longitude,
      altitude: getVal(row, 'Height (m)', 'Altitude', 'alt', 'GPS_Alt') || undefined,
      speed: getVal(row, 'Speed (km/h)', 'Speed', 'speed', 'GPS_Speed'),
      rpm: getVal(row, 'Engine Speed (rpm)', 'RPM', 'rpm') || undefined,
      throttle: Math.max(0, Math.min(100, throttle)),
      brake: Math.max(0, Math.min(100, brake)),
      steering,
      gLat,
      gLong,
      gear,
    });
  }

  return frames;
}
