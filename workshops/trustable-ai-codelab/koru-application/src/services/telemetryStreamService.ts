import type { TelemetryFrame, GpsSSEPoint, SSEConnectionStatus } from '../types';
import { parseTelemetryCSV } from '../utils/telemetryParser';

type TelemetryCallback = (frame: TelemetryFrame) => void;

/**
 * Singleton service that connects to a GPS SSE stream (or replays a mock file)
 * and emits enriched TelemetryFrames with derived G-forces and virtual sensors.
 */
export class TelemetryStreamService {
  private static instance: TelemetryStreamService;
  private eventSource: EventSource | null = null;
  private listeners: TelemetryCallback[] = [];
  private replayTimer: ReturnType<typeof setTimeout> | null = null;
  private prevPoint: GpsSSEPoint | null = null;
  private prevTime = 0;
  private status: SSEConnectionStatus = 'disconnected';
  private statusListeners: ((s: SSEConnectionStatus) => void)[] = [];

  static getInstance(): TelemetryStreamService {
    if (!TelemetryStreamService.instance) {
      TelemetryStreamService.instance = new TelemetryStreamService();
    }
    return TelemetryStreamService.instance;
  }

  getStatus(): SSEConnectionStatus { return this.status; }

  onStatus(cb: (s: SSEConnectionStatus) => void) {
    this.statusListeners.push(cb);
    return () => { this.statusListeners = this.statusListeners.filter(l => l !== cb); };
  }

  private setStatus(s: SSEConnectionStatus) {
    this.status = s;
    this.statusListeners.forEach(cb => cb(s));
  }

  onFrame(cb: TelemetryCallback) {
    this.listeners.push(cb);
    return () => { this.listeners = this.listeners.filter(l => l !== cb); };
  }

  private emit(frame: TelemetryFrame) {
    this.listeners.forEach(cb => cb(frame));
  }

  /** Connect to a live SSE endpoint or replay a mock .txt / .csv file */
  connect(url: string) {
    this.disconnect();

    const cleanPath = url.split(/[?#]/)[0].toLowerCase();
    if (cleanPath.endsWith('.txt') || cleanPath.endsWith('.csv')) {
      void this.replayFile(url);
      return;
    }

    this.setStatus('connecting');
    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => this.setStatus('connected');
    this.eventSource.onerror = () => this.setStatus('error');

    this.eventSource.addEventListener('TPV', (e) => {
      try {
        const data = JSON.parse(e.data);
        const point = this.parseSSEPoint(data);
        if (point) this.processPoint(point);
      } catch { /* skip bad frames */ }
    });

    this.eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        const point = this.parseSSEPoint(data);
        if (point) this.processPoint(point);
      } catch {
        // Try CSV fallback
        const fields = e.data.split(',');
        if (fields.length >= 6) {
          const point: GpsSSEPoint = {
            time: parseFloat(fields[0]) || Date.now() / 1000,
            lat: parseFloat(fields[1]),
            lon: parseFloat(fields[2]),
            speed: parseFloat(fields[3]),
            alt: parseFloat(fields[4]) || undefined,
            track: parseFloat(fields[5]) || undefined,
          };
          if (!isNaN(point.lat) && !isNaN(point.lon)) this.processPoint(point);
        }
      }
    };
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.replayTimer) {
      clearTimeout(this.replayTimer);
      this.replayTimer = null;
    }
    this.prevPoint = null;
    this.prevTime = 0;
    this.setStatus('disconnected');
  }

  private parseSSEPoint(data: Record<string, unknown>): GpsSSEPoint | null {
    const lat = Number(data.lat);
    const lon = Number(data.lon);
    if (isNaN(lat) || isNaN(lon)) return null;
    return {
      time: data.time as string | number,
      lat, lon,
      speed: Number(data.speed) || 0,
      alt: Number(data.alt) || undefined,
      track: Number(data.track) || undefined,
      brake: data.brake !== undefined ? Number(data.brake) : undefined,
      throttle: data.throttle !== undefined ? Number(data.throttle) : undefined,
      rpm: Number(data.rpm) || undefined,
      gear: Number(data.gear) || undefined,
      steering: Number(data.steering) || undefined,
      gLat: data.gLat !== undefined ? Number(data.gLat) : undefined,
      gLong: data.gLong !== undefined ? Number(data.gLong) : undefined,
    };
  }

  private async replayFile(url: string) {
    this.setStatus('connecting');
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch ${url}`);
      const text = await res.text();
      if (this.status !== 'connecting') return;

      const lines = text.trim().split(/\r?\n/).filter(l => l.trim() && !l.trim().startsWith('<'));
      if (lines.length === 0) throw new Error('Empty telemetry replay file');

      const cleanPath = url.split(/[?#]/)[0].toLowerCase();
      const isCsv = cleanPath.endsWith('.csv') || !lines[0].trim().startsWith('{');

      if (isCsv) {
        const frames = parseTelemetryCSV(text);
        if (frames.length === 0) throw new Error('No valid CSV telemetry frames found');
        this.setStatus('connected');

        let i = 0;
        const playNextCsv = () => {
          if (i >= frames.length) {
            i = 0; // Loop replay
            this.prevPoint = null;
          }
          this.emit(frames[i]);
          i++;
          this.replayTimer = setTimeout(playNextCsv, 100); // ~10hz
        };
        playNextCsv();
        return;
      }

      this.setStatus('connected');

      let i = 0;
      const playNext = () => {
        if (i >= lines.length) {
          i = 0; // Loop replay
          this.prevPoint = null;
        }
        try {
          const data = JSON.parse(lines[i]);
          const point = this.parseSSEPoint(data);
          if (point) this.processPoint(point);
        } catch { /* skip bad lines */ }
        i++;
        this.replayTimer = setTimeout(playNext, 100); // ~10hz
      };
      playNext();
    } catch (err) {
      console.error('Replay file load failed:', err);
      this.setStatus('error');
    }
  }

  private processPoint(point: GpsSSEPoint) {
    const parsedIso = typeof point.time === 'string' ? Date.parse(point.time) / 1000 : NaN;
    const now = typeof point.time === 'number' ? point.time : (!isNaN(parsedIso) ? parsedIso : Date.now() / 1000);
    const rawDt = this.prevPoint ? now - this.prevTime : 0.1;
    const dt = rawDt > 0.02 && rawDt < 2.0 ? rawDt : 0.1;
    const speedKmh = point.speed > 200 ? point.speed : point.speed * 3.6;
    const speedMs = speedKmh / 3.6;

    // Derive heading from consecutive points (fallback to GPS course)
    let heading = point.track ?? 0;
    if (this.prevPoint && point.track === undefined) {
      const dLat = point.lat - this.prevPoint.lat;
      const dLon = point.lon - this.prevPoint.lon;
      if (Math.abs(dLat) > 1e-7 || Math.abs(dLon) > 1e-7) {
        heading = Math.atan2(dLon, dLat) * (180 / Math.PI);
      }
    }

    // Derive G-forces if not provided
    let gLat = point.gLat ?? 0;
    let gLong = point.gLong ?? 0;
    if (this.prevPoint && point.gLat === undefined) {
      const prevSpeedMs = (this.prevPoint.speed > 200 ? this.prevPoint.speed : this.prevPoint.speed * 3.6) / 3.6;
      gLong = (speedMs - prevSpeedMs) / (dt * 9.81);
      const prevHeading = this.prevPoint.track ?? heading;
      const dHeading = ((heading - prevHeading + 540) % 360) - 180;
      const yawRate = (dHeading * Math.PI / 180) / dt;
      gLat = (speedMs * yawRate) / 9.81;
    }

    // Clamp G-forces
    gLat = Math.max(-3, Math.min(3, gLat));
    gLong = Math.max(-3, Math.min(3, gLong));

    // Virtual brake/throttle from G-forces (only when telemetry device has no dedicated sensors)
    let brake = point.brake ?? 0;
    let throttle = point.throttle ?? 0;
    if (point.brake === undefined && point.throttle === undefined) {
      brake = gLong < -0.25 ? Math.min(100, Math.abs(gLong) * 110) : 0;
      throttle = gLong > 0.12 ? Math.min(100, gLong * 160) : (speedKmh > 95 && gLong >= -0.08 ? 65 : 0);
    }
    // 🔬 EXERCISE (swap brake/throttle — works for ALL data sources): uncomment below
    // [brake, throttle] = [throttle, brake];

    const frame: TelemetryFrame = {
      time: now,
      latitude: point.lat,
      longitude: point.lon,
      altitude: point.alt,
      speed: speedKmh,
      rpm: point.rpm,
      throttle,
      brake,
      steering: point.steering,
      gLat,
      gLong,
      gear: point.gear,
    };

    this.prevPoint = { ...point, track: heading };
    this.prevTime = now;
    // 📡 PROBE 1 — trace a frame entering the pipeline:
    // console.log('FRAME', { speed: frame.speed.toFixed(1), gLat: frame.gLat.toFixed(2), brake: frame.brake.toFixed(0) });
    this.emit(frame);
  }
}
