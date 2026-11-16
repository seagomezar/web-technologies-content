import { useState, useCallback, useId } from 'react';
import { useGeminiCloud } from '../hooks/useGeminiCloud';
import { parseTelemetryCSV } from '../utils/telemetryParser';
import TelemetryCharts from '../components/TelemetryCharts';
import { THUNDERHILL_EAST } from '../data/trackData';
import type { TelemetryFrame } from '../types';
import { BarChart3, Upload, Loader, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AnalysisProps {
  apiKey?: string | null;
}

export default function Analysis({ apiKey }: AnalysisProps) {
  const [lap1Frames, setLap1Frames] = useState<TelemetryFrame[]>([]);
  const [lap2Frames, setLap2Frames] = useState<TelemetryFrame[]>([]);
  const [comparisonResult, setComparisonResult] = useState('');
  const { generateFeedback, status } = useGeminiCloud(apiKey);
  const lapAInputId = useId();
  const lapBInputId = useId();

  const handleFile = useCallback((setter: (f: TelemetryFrame[]) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const parsed = parseTelemetryCSV(reader.result as string);
        setter(parsed);
      };
      reader.readAsText(file);
    }, []);

  const handleLoadSamples = useCallback(async () => {
    try {
      const [resA, resB] = await Promise.all([
        fetch('/sample-lap-a.csv'),
        fetch('/sample-lap-b.csv'),
      ]);
      const [csvA, csvB] = await Promise.all([resA.text(), resB.text()]);
      setLap1Frames(parseTelemetryCSV(csvA));
      setLap2Frames(parseTelemetryCSV(csvB));
      setComparisonResult('');
    } catch (err) {
      console.error('Failed to load sample laps:', err);
    }
  }, []);

  const handleCompare = useCallback(async () => {
    if (lap1Frames.length === 0 || lap2Frames.length === 0) return;

    const summarize = (frames: TelemetryFrame[], label: string) => {
      const speeds = frames.map(f => f.speed);
      const maxSpeed = Math.max(...speeds);
      const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
      const maxBrake = Math.max(...frames.map(f => f.brake));
      const maxGLat = Math.max(...frames.map(f => Math.abs(f.gLat)));
      return `${label}: MaxSpeed=${maxSpeed.toFixed(0)}km/h AvgSpeed=${avgSpeed.toFixed(0)}km/h MaxBrake=${maxBrake.toFixed(0)}% MaxGLat=${maxGLat.toFixed(2)}g Frames=${frames.length}`;
    };

    const context = `Compare these two laps on ${THUNDERHILL_EAST.name}:

${summarize(lap1Frames, 'Lap A')}

${summarize(lap2Frames, 'Lap B')}

Lap A sample (every 20th frame):
${lap1Frames.filter((_, i) => i % 20 === 0).slice(0, 30).map(f =>
  `Speed:${f.speed.toFixed(0)}km/h Thr:${f.throttle.toFixed(0)}% Brk:${f.brake.toFixed(0)}% GLat:${f.gLat.toFixed(2)}`
).join('\n')}

Lap B sample (every 20th frame):
${lap2Frames.filter((_, i) => i % 20 === 0).slice(0, 30).map(f =>
  `Speed:${f.speed.toFixed(0)}km/h Thr:${f.throttle.toFixed(0)}% Brk:${f.brake.toFixed(0)}% GLat:${f.gLat.toFixed(2)}`
).join('\n')}

Compare sector by sector. Identify where the biggest time differences come from.`;

    const result = await generateFeedback('pro', context);
    setComparisonResult(result);
  }, [lap1Frames, lap2Frames, generateFeedback]);

  return (
    <div className="page analysis">
      <header className="page-header">
        <h1><BarChart3 size={18} aria-hidden="true" /> Lap Analysis</h1>
        <button type="button" className="upload-btn" onClick={handleLoadSamples}>
          <Sparkles size={14} aria-hidden="true" />
          <span>Load Sample Laps A &amp; B</span>
        </button>
      </header>

      {status.error && (
        <div role="alert" className="analysis-result error-banner">
          <p>{status.error}</p>
        </div>
      )}

      <div className="analysis-upload-grid">
        <div className="analysis-upload">
          <label htmlFor={lapAInputId} className="upload-btn upload-lap">
            <Upload size={14} aria-hidden="true" />
            <span>Lap A {lap1Frames.length > 0 ? `(${lap1Frames.length} frames)` : ''}</span>
            <input
              id={lapAInputId}
              type="file"
              accept=".csv,.txt"
              onChange={handleFile(setLap1Frames)}
              className="visually-hidden"
            />
          </label>
        </div>
        <div className="analysis-upload">
          <label htmlFor={lapBInputId} className="upload-btn upload-lap">
            <Upload size={14} aria-hidden="true" />
            <span>Lap B {lap2Frames.length > 0 ? `(${lap2Frames.length} frames)` : ''}</span>
            <input
              id={lapBInputId}
              type="file"
              accept=".csv,.txt"
              onChange={handleFile(setLap2Frames)}
              className="visually-hidden"
            />
          </label>
        </div>
        <button
          type="button"
          className="analyze-btn"
          onClick={handleCompare}
          disabled={lap1Frames.length === 0 || lap2Frames.length === 0 || status.state === 'loading'}
        >
          {status.state === 'loading' ? <><Loader size={14} className="spin" aria-hidden="true" /> Comparing...</> : 'Compare Laps'}
        </button>
      </div>

      <div className="analysis-charts">
        {lap1Frames.length > 0 && (
          <div className="analysis-lap">
            <h2>Lap A</h2>
            <TelemetryCharts frames={lap1Frames} maxPoints={500} />
          </div>
        )}
        {lap2Frames.length > 0 && (
          <div className="analysis-lap">
            <h2>Lap B</h2>
            <TelemetryCharts frames={lap2Frames} maxPoints={500} />
          </div>
        )}
      </div>

      {comparisonResult && (
        <div className="analysis-result">
          <h2>AI Lap Comparison</h2>
          <ReactMarkdown>{comparisonResult}</ReactMarkdown>
        </div>
      )}

      {lap1Frames.length === 0 && lap2Frames.length === 0 && (
        <div className="empty-state">
          <BarChart3 size={40} aria-hidden="true" />
          <h2>Compare Two Laps</h2>
          <p>Upload two CSV files or click &ldquo;Load Sample Laps A &amp; B&rdquo; above to compare telemetry side-by-side</p>
        </div>
      )}
    </div>
  );
}
