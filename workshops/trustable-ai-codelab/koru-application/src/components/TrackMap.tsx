import type { Track, TelemetryFrame } from '../types';

interface TrackMapProps {
  track: Track;
  currentFrame?: TelemetryFrame;
}

export default function TrackMap({ track, currentFrame }: TrackMapProps) {
  const padding = 40;

  // Find bounds
  const xs = track.mapPoints.map(p => p.x);
  const ys = track.mapPoints.map(p => p.y);
  const minX = Math.min(...xs) - padding;
  const maxX = Math.max(...xs) + padding;
  const minY = Math.min(...ys) - padding;
  const maxY = Math.max(...ys) + padding;
  const width = maxX - minX;
  const height = maxY - minY;

  // Build polyline string
  const polyline = track.mapPoints.map(p => `${p.x - minX},${p.y - minY}`).join(' ');

  // Smoothly interpolate car dot position along mapPoints
  let carX = 0;
  let carY = 0;
  let showCar = false;
  if (currentFrame && track.mapPoints.length > 1) {
    const pos = ((currentFrame.time * 0.6) % track.mapPoints.length + track.mapPoints.length) % track.mapPoints.length;
    const idx0 = Math.floor(pos);
    const idx1 = (idx0 + 1) % track.mapPoints.length;
    const t = pos - idx0;
    const p0 = track.mapPoints[idx0];
    const p1 = track.mapPoints[idx1];
    carX = (p0.x + (p1.x - p0.x) * t) - minX;
    carY = (p0.y + (p1.y - p0.y) * t) - minY;
    showCar = true;
  }

  return (
    <div className="track-map">
      <h3 className="chart-title">{track.name}</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="track-svg" role="img" aria-label={`${track.name} circuit map`}>
        {/* Track outline */}
        <polyline
          points={polyline}
          fill="none"
          stroke="#334155"
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Track center line */}
        <polyline
          points={polyline}
          fill="none"
          stroke="#6366f1"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.6}
        />

        {/* Corner labels */}
        {track.corners.map((c) => {
          const ptIdx = Math.floor((c.apexDist / track.length) * track.mapPoints.length);
          const pt = track.mapPoints[Math.min(ptIdx, track.mapPoints.length - 1)];
          if (!pt) return null;
          return (
            <g key={c.id}>
              <circle cx={pt.x - minX} cy={pt.y - minY} r={6} fill="#f59e0b" opacity={0.8} />
              <text
                x={pt.x - minX + 10}
                y={pt.y - minY + 4}
                fill="#f59e0b"
                fontSize={11}
                fontWeight="bold"
              >
                {c.name}
              </text>
            </g>
          );
        })}

        {/* Car dot */}
        {showCar && (
          <>
            <circle cx={carX} cy={carY} r={10} fill="#22c55e" opacity={0.3} />
            <circle cx={carX} cy={carY} r={5} fill="#22c55e" />
          </>
        )}
      </svg>
    </div>
  );
}
