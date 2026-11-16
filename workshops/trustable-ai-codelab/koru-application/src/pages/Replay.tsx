import { useState, useRef, useCallback, useEffect } from 'react';
import { parseTelemetryCSV } from '../utils/telemetryParser';
import { CoachingService } from '../services/coachingService';
import { useGeminiCloud } from '../hooks/useGeminiCloud';
import { useTTS } from '../hooks/useTTS';
import { usePredictiveCoaching } from '../hooks/usePredictiveCoaching';
import TelemetryCharts from '../components/TelemetryCharts';
import PlaybackControls from '../components/PlaybackControls';
import GaugeCluster from '../components/GaugeCluster';
import TrackMap from '../components/TrackMap';
import CoachPanel, { type CoachMessage } from '../components/CoachPanel';
import { THUNDERHILL_EAST } from '../data/trackData';
import type { TelemetryFrame, TTSProvider } from '../types';
import { Upload, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ReplayProps {
  apiKey: string | null;
}

export default function Replay({ apiKey }: ReplayProps) {
  const [frames, setFrames] = useState<TelemetryFrame[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [activeCoach, setActiveCoach] = useState('superaj');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [analysisResult, setAnalysisResult] = useState('');

  const { generateFeedback, status: cloudStatus } = useGeminiCloud(apiKey);
  const { speak, setProvider, provider } = useTTS(apiKey, activeCoach);
  const { analyzeLap, checkLookahead } = usePredictiveCoaching();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const coachRef = useRef(new CoachingService());

  useEffect(() => {
    coachRef.current.setApiKey(apiKey || '');
  }, [apiKey]);

  useEffect(() => {
    coachRef.current.setCoach(activeCoach);
  }, [activeCoach]);

  const audioEnabledRef = useRef(audioEnabled);
  useEffect(() => { audioEnabledRef.current = audioEnabled; }, [audioEnabled]);

  const speakRef = useRef(speak);
  useEffect(() => { speakRef.current = speak; }, [speak]);

  useEffect(() => {
    const unsub = coachRef.current.onCoaching(msg => {
      const coachMsg: CoachMessage = {
        id: `coach-${Date.now()}-${Math.random()}`,
        path: msg.path,
        text: msg.text,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, coachMsg]);

      if (audioEnabledRef.current && msg.text) {
        void speakRef.current(msg.text);
      }
    });
    return unsub;
  }, []);

  const loadParsedFrames = useCallback((parsed: TelemetryFrame[], idealReference?: TelemetryFrame[]) => {
    setFrames(parsed);
    setCurrentIdx(0);
    setIsPlaying(false);
    setMessages([]);
    setAnalysisResult('');
    if (idealReference && idealReference.length > 0) {
      analyzeLap(parsed, idealReference);
    }
  }, [analyzeLap]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const parsed = parseTelemetryCSV(text);
      loadParsedFrames(parsed);
    };
    reader.readAsText(file);
  }, [loadParsedFrames]);

  const handleLoadSample = useCallback(async () => {
    try {
      const [resA, resB] = await Promise.all([
        fetch('/sample-lap-b.csv'),
        fetch('/sample-lap-a.csv'),
      ]);
      const [csvRecent, csvIdeal] = await Promise.all([resA.text(), resB.text()]);
      loadParsedFrames(parseTelemetryCSV(csvRecent), parseTelemetryCSV(csvIdeal));
    } catch (err) {
      console.error('Failed to load sample lap:', err);
    }
  }, [loadParsedFrames]);

  const evaluateFrameAt = useCallback((idx: number, allFrames: TelemetryFrame[]) => {
    const frame = allFrames[idx];
    if (!frame) return;

    coachRef.current.processFrame(frame);

    const zone = checkLookahead(frame);
    if (zone) {
      const msg: CoachMessage = {
        id: `pred-${Date.now()}`,
        path: 'feedforward',
        text: `Ahead: ${zone.cornerName} — ${zone.advice} (lost ${Math.abs(zone.speedDelta).toFixed(0)} km/h last lap)`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, msg]);
      if (audioEnabledRef.current) void speakRef.current(msg.text);
    }
  }, [checkLookahead]);

  const handleSeek = useCallback((idx: number) => {
    setCurrentIdx(idx);
    evaluateFrameAt(idx, frames);
  }, [evaluateFrameAt, frames]);

  useEffect(() => {
    if (isPlaying && frames.length > 0) {
      const intervalMs = Math.max(10, 100 / speed);
      timerRef.current = setInterval(() => {
        setCurrentIdx(prev => {
          if (prev >= frames.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const nextIdx = prev + 1;
          evaluateFrameAt(nextIdx, frames);
          return nextIdx;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, frames, speed, evaluateFrameAt]);

  const handleAnalyze = useCallback(async () => {
    if (frames.length === 0) return;
    const start = Math.max(0, currentIdx - 100);
    const end = Math.min(frames.length - 1, currentIdx + 100);
    const slice = frames.slice(start, end);
    const context = slice.map((f, i) =>
      `[${i}] Speed:${f.speed.toFixed(0)}km/h Thr:${f.throttle.toFixed(0)}% Brk:${f.brake.toFixed(0)}% GLat:${f.gLat.toFixed(2)} GLong:${f.gLong.toFixed(2)}`
    ).join('\n');
    const result = await generateFeedback('flash', context);
    setAnalysisResult(result);
    if (result) {
      const msg: CoachMessage = {
        id: `cloud-${Date.now()}`,
        path: 'cold',
        text: result,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, msg]);
    }
  }, [frames, currentIdx, generateFeedback]);

  const currentFrame = frames[currentIdx] || null;

  return (
    <div className="page replay">
      <header className="page-header">
        <h1>Replay</h1>
        <div className="replay-controls">
          <button type="button" className="upload-btn" onClick={handleLoadSample}>
            <Sparkles size={14} />
            <span>Load Sample Lap</span>
          </button>
          <label className="upload-btn">
            <Upload size={14} />
            <span>Upload CSV</span>
            <input type="file" accept=".csv,.txt" onChange={handleFileUpload} hidden />
          </label>
          <button
            className="analyze-btn"
            onClick={handleAnalyze}
            disabled={frames.length === 0 || cloudStatus.state === 'loading'}
          >
            {cloudStatus.state === 'loading' ? 'Analyzing...' : 'AI Analyze'}
          </button>
          <select
            className="tts-select"
            value={provider}
            onChange={e => setProvider(e.target.value as TTSProvider)}
          >
            <option value="browser">Browser TTS</option>
            <option value="gemini">Gemini TTS</option>
          </select>
        </div>
      </header>

      {cloudStatus.error && (
        <div className="analysis-card" style={{ marginBottom: 12, borderColor: 'rgba(248, 113, 113, 0.4)' }}>
          <p style={{ color: '#f87171', fontSize: 13 }}>{cloudStatus.error}</p>
        </div>
      )}

      {frames.length === 0 ? (
        <div className="empty-state">
          <Upload size={40} />
          <h2>Upload Telemetry Data</h2>
          <p>Drop a CSV file from your OBD/VBOX datalogger or click &ldquo;Load Sample Lap&rdquo; above</p>
        </div>
      ) : (
        <>
          <PlaybackControls
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            currentFrame={currentIdx}
            totalFrames={frames.length}
            onSeek={handleSeek}
            speed={speed}
            onSpeedChange={setSpeed}
          />

          <div className="replay-grid">
            <div className="replay-left">
              <GaugeCluster frame={currentFrame} />
              <TrackMap track={THUNDERHILL_EAST} currentFrame={currentFrame ?? undefined} />
            </div>
            <div className="replay-center">
              <TelemetryCharts frames={frames.slice(Math.max(0, currentIdx - 100), currentIdx + 1)} />
              {analysisResult && (
                <div className="analysis-card">
                  <h3>AI Analysis</h3>
                  <ReactMarkdown>{analysisResult}</ReactMarkdown>
                </div>
              )}
            </div>
            <div className="replay-right">
              <CoachPanel
                messages={messages}
                activeCoach={activeCoach}
                onCoachChange={setActiveCoach}
                audioEnabled={audioEnabled}
                onAudioToggle={() => setAudioEnabled(!audioEnabled)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
