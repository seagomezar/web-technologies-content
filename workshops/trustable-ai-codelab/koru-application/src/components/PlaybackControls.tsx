import { useId, type CSSProperties } from 'react';
import { Play, Pause, SkipBack, SkipForward, Gauge } from 'lucide-react';

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  currentFrame: number;
  totalFrames: number;
  onSeek: (frame: number) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  currentTime?: string;
}

const SPEED_OPTIONS = [0.1, 0.25, 0.5, 1, 2, 5, 10];

export default function PlaybackControls({
  isPlaying,
  onPlayPause,
  currentFrame,
  totalFrames,
  onSeek,
  speed,
  onSpeedChange,
  currentTime,
}: PlaybackControlsProps) {
  const sliderId = useId();
  const speedSelectId = useId();
  const maxFrame = Math.max(0, totalFrames - 1);
  const progressText = currentTime || formatFrame(currentFrame, totalFrames);

  return (
    <div className="playback-controls">
      <div className="playback-buttons">
        <button
          type="button"
          className="icon-btn"
          aria-label="Rewind 100 frames"
          onClick={() => onSeek(Math.max(0, currentFrame - 100))}
        >
          <SkipBack size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="play-btn"
          aria-label={isPlaying ? 'Pause replay' : 'Play replay'}
          onClick={onPlayPause}
        >
          {isPlaying ? <Pause size={20} aria-hidden="true" /> : <Play size={20} aria-hidden="true" />}
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label="Advance 100 frames"
          onClick={() => onSeek(Math.min(totalFrames - 1, currentFrame + 100))}
        >
          <SkipForward size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="playback-slider">
        <label htmlFor={sliderId} className="visually-hidden">
          Replay timeline
        </label>
        <input
          id={sliderId}
          type="range"
          min={0}
          max={totalFrames - 1}
          value={currentFrame}
          aria-valuetext={`Frame ${currentFrame + 1} of ${totalFrames} (${progressText})`}
          onChange={e => onSeek(parseInt(e.target.value, 10))}
          className="slider"
          style={
            {
              '--attr-min': 0,
              '--attr-max': Math.max(1, maxFrame),
              '--control-value': currentFrame,
            } as CSSProperties
          }
        />
        <div className="playback-info">
          <span>{progressText}</span>
          <span>{currentFrame + 1} / {totalFrames}</span>
        </div>
      </div>

      <div className="speed-selector">
        <Gauge size={14} aria-hidden="true" />
        <label htmlFor={speedSelectId} className="visually-hidden">
          Playback speed
        </label>
        <select
          id={speedSelectId}
          value={speed}
          onChange={e => onSpeedChange(parseFloat(e.target.value))}
          className="speed-select"
        >
          {SPEED_OPTIONS.map(s => (
            <option key={s} value={s}>{s}×</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function formatFrame(current: number, total: number): string {
  const pct = total > 0 ? ((current / total) * 100).toFixed(1) : '0.0';
  return `${pct}%`;
}
