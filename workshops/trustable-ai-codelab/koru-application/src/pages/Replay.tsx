import { useState, useRef, useCallback, useEffect, useId } from 'react';
import { parseTelemetryCSV } from '../utils/telemetryParser';
import { CoachingService } from '../services/coachingService';
import { useGeminiCloud } from '../hooks/useGeminiCloud';
import { useTTS } from '../hooks/useTTS';
import { usePredictiveCoaching } from '../hooks/usePredictiveCoaching';
import { registerKoruMachine, useMachine } from '../utils/stateMachine';
import TelemetryCharts from '../components/TelemetryCharts';
import PlaybackControls from '../components/PlaybackControls';
import GaugeCluster from '../components/GaugeCluster';
import TrackMap from '../components/TrackMap';
import CoachPanel, { type CoachMessage } from '../components/CoachPanel';
import { THUNDERHILL_EAST } from '../data/trackData';
import type {
  TelemetryFrame,
  TTSProvider,
  ReplayTransportState,
  ReplayAnalysisState,
} from '../types';
import { Upload, Sparkles, Loader } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ReplayProps {
  apiKey: string | null;
}

interface ReplayTransportContext {
  readonly currentIdx: number;
  readonly totalFrames: number;
  readonly speed: number;
}

type ReplayTransportEvents = {
  LOAD: { totalFrames: number };
  TOGGLE_PLAY: undefined;
  PLAY: undefined;
  PAUSE: undefined;
  TICK: undefined;
  SEEK: { index: number };
  SET_SPEED: { speed: number };
  RESET: undefined;
};

interface ReplayAnalysisContext {
  readonly result: string;
  readonly error?: string;
  readonly requestId: number;
}

interface ReplayAnalysisPublicContext {
  readonly hasResult: boolean;
  readonly error?: string;
}

type ReplayAnalysisEvents = {
  ANALYZE: { requestId: number };
  RESOLVE: { result: string; requestId: number };
  FAIL: { error: string; requestId: number };
  RESET: undefined;
};

function clampFrameIndex(index: number, totalFrames: number): number {
  if (totalFrames <= 0) return 0;
  return Math.max(0, Math.min(totalFrames - 1, index));
}

function formatAnalysisContext(
  ctx: Readonly<ReplayAnalysisContext>,
): ReplayAnalysisPublicContext {
  return {
    hasResult: ctx.result.length > 0,
    error: ctx.error,
  };
}

export default function Replay({ apiKey }: ReplayProps) {
  const [frames, setFrames] = useState<TelemetryFrame[]>([]);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [activeCoach, setActiveCoach] = useState('superaj');
  const [audioEnabled, setAudioEnabled] = useState(true);

  const csvUploadId = useId();
  const ttsSelectId = useId();

  const {
    state: transportState,
    context: transportCtx,
    send: sendTransport,
    machine: transportMachine,
  } = useMachine<ReplayTransportState, ReplayTransportContext, ReplayTransportEvents>(
    () => ({
      id: 'replay-transport',
      initial: 'empty',
      context: {
        currentIdx: 0,
        totalFrames: 0,
        speed: 1,
      },
      states: {
        empty: {
          on: {
            LOAD: {
              target: (_ctx, payload) => (payload.totalFrames > 0 ? 'paused' : 'empty'),
              assign: (ctx, payload) => ({
                ...ctx,
                currentIdx: 0,
                totalFrames: Math.max(0, payload.totalFrames),
              }),
            },
            SET_SPEED: {
              target: 'empty',
              assign: (ctx, payload) => ({ ...ctx, speed: payload.speed }),
            },
            RESET: {
              target: 'empty',
              assign: ctx => ({ ...ctx, currentIdx: 0, totalFrames: 0 }),
            },
          },
        },
        paused: {
          on: {
            PLAY: {
              target: ctx => (ctx.totalFrames <= 1 ? 'ended' : 'playing'),
              assign: ctx => ({
                ...ctx,
                currentIdx:
                  ctx.totalFrames > 1 && ctx.currentIdx >= ctx.totalFrames - 1
                    ? 0
                    : ctx.currentIdx,
              }),
            },
            TOGGLE_PLAY: {
              target: ctx => (ctx.totalFrames <= 1 ? 'ended' : 'playing'),
              assign: ctx => ({
                ...ctx,
                currentIdx:
                  ctx.totalFrames > 1 && ctx.currentIdx >= ctx.totalFrames - 1
                    ? 0
                    : ctx.currentIdx,
              }),
            },
            SEEK: {
              target: (ctx, payload) => {
                const idx = clampFrameIndex(payload.index, ctx.totalFrames);
                return idx >= ctx.totalFrames - 1 ? 'ended' : 'paused';
              },
              assign: (ctx, payload) => ({
                ...ctx,
                currentIdx: clampFrameIndex(payload.index, ctx.totalFrames),
              }),
            },
            SET_SPEED: {
              target: 'paused',
              assign: (ctx, payload) => ({ ...ctx, speed: payload.speed }),
            },
            LOAD: {
              target: (_ctx, payload) => (payload.totalFrames > 0 ? 'paused' : 'empty'),
              assign: (ctx, payload) => ({
                ...ctx,
                currentIdx: 0,
                totalFrames: Math.max(0, payload.totalFrames),
              }),
            },
            RESET: {
              target: 'empty',
              assign: ctx => ({ ...ctx, currentIdx: 0, totalFrames: 0 }),
            },
          },
        },
        playing: {
          on: {
            PAUSE: 'paused',
            TOGGLE_PLAY: 'paused',
            TICK: {
              target: ctx =>
                ctx.currentIdx + 1 >= ctx.totalFrames - 1 ? 'ended' : 'playing',
              assign: ctx => ({
                ...ctx,
                currentIdx: clampFrameIndex(ctx.currentIdx + 1, ctx.totalFrames),
              }),
            },
            SEEK: {
              target: (ctx, payload) => {
                const idx = clampFrameIndex(payload.index, ctx.totalFrames);
                return idx >= ctx.totalFrames - 1 ? 'ended' : 'playing';
              },
              assign: (ctx, payload) => ({
                ...ctx,
                currentIdx: clampFrameIndex(payload.index, ctx.totalFrames),
              }),
            },
            SET_SPEED: {
              target: 'playing',
              assign: (ctx, payload) => ({ ...ctx, speed: payload.speed }),
            },
            LOAD: {
              target: (_ctx, payload) => (payload.totalFrames > 0 ? 'paused' : 'empty'),
              assign: (ctx, payload) => ({
                ...ctx,
                currentIdx: 0,
                totalFrames: Math.max(0, payload.totalFrames),
              }),
            },
            RESET: {
              target: 'empty',
              assign: ctx => ({ ...ctx, currentIdx: 0, totalFrames: 0 }),
            },
          },
        },
        ended: {
          on: {
            PLAY: {
              target: ctx => (ctx.totalFrames > 1 ? 'playing' : 'ended'),
              assign: ctx => ({ ...ctx, currentIdx: 0 }),
            },
            TOGGLE_PLAY: {
              target: ctx => (ctx.totalFrames > 1 ? 'playing' : 'ended'),
              assign: ctx => ({ ...ctx, currentIdx: 0 }),
            },
            SEEK: {
              target: (ctx, payload) => {
                const idx = clampFrameIndex(payload.index, ctx.totalFrames);
                return idx >= ctx.totalFrames - 1 ? 'ended' : 'paused';
              },
              assign: (ctx, payload) => ({
                ...ctx,
                currentIdx: clampFrameIndex(payload.index, ctx.totalFrames),
              }),
            },
            SET_SPEED: {
              target: 'ended',
              assign: (ctx, payload) => ({ ...ctx, speed: payload.speed }),
            },
            LOAD: {
              target: (_ctx, payload) => (payload.totalFrames > 0 ? 'paused' : 'empty'),
              assign: (ctx, payload) => ({
                ...ctx,
                currentIdx: 0,
                totalFrames: Math.max(0, payload.totalFrames),
              }),
            },
            RESET: {
              target: 'empty',
              assign: ctx => ({ ...ctx, currentIdx: 0, totalFrames: 0 }),
            },
          },
        },
      },
    }),
  );

  const {
    state: analysisState,
    context: analysisCtx,
    send: sendAnalysis,
    machine: analysisMachine,
  } = useMachine<
    ReplayAnalysisState,
    ReplayAnalysisContext,
    ReplayAnalysisEvents,
    ReplayAnalysisPublicContext
  >(
    () => ({
      id: 'replay-analysis',
      initial: 'idle',
      context: {
        result: '',
        error: undefined,
        requestId: 0,
      },
      states: {
        idle: {
          on: {
            ANALYZE: {
              target: 'analyzing',
              assign: (_ctx, payload) => ({
                result: '',
                error: undefined,
                requestId: payload.requestId,
              }),
            },
            RESET: {
              target: 'idle',
              assign: ctx => ({
                result: '',
                error: undefined,
                requestId: ctx.requestId + 1,
              }),
            },
          },
        },
        analyzing: {
          on: {
            RESOLVE: {
              guard: (ctx, payload) => payload.requestId === ctx.requestId,
              target: 'ready',
              assign: (ctx, payload) => ({
                ...ctx,
                result: payload.result,
                error: undefined,
              }),
            },
            FAIL: {
              guard: (ctx, payload) => payload.requestId === ctx.requestId,
              target: 'error',
              assign: (ctx, payload) => ({
                ...ctx,
                result: '',
                error: payload.error,
              }),
            },
            RESET: {
              target: 'idle',
              assign: ctx => ({
                result: '',
                error: undefined,
                requestId: ctx.requestId + 1,
              }),
            },
          },
        },
        ready: {
          on: {
            ANALYZE: {
              target: 'analyzing',
              assign: (_ctx, payload) => ({
                result: '',
                error: undefined,
                requestId: payload.requestId,
              }),
            },
            RESET: {
              target: 'idle',
              assign: ctx => ({
                result: '',
                error: undefined,
                requestId: ctx.requestId + 1,
              }),
            },
          },
        },
        error: {
          on: {
            ANALYZE: {
              target: 'analyzing',
              assign: (_ctx, payload) => ({
                result: '',
                error: undefined,
                requestId: payload.requestId,
              }),
            },
            RESET: {
              target: 'idle',
              assign: ctx => ({
                result: '',
                error: undefined,
                requestId: ctx.requestId + 1,
              }),
            },
          },
        },
      },
    }),
    { formatContext: formatAnalysisContext },
  );

  const { generateFeedback, status: cloudStatus, getSnapshot: getCloudSnapshot } = useGeminiCloud(apiKey);
  const { speak, setProvider, provider, ttsPhase } = useTTS(apiKey, activeCoach);
  const { analyzeLap, checkLookahead, reset: resetPredictive } = usePredictiveCoaching();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [coach] = useState(() => new CoachingService());

  useEffect(() => {
    return registerKoruMachine(coach.asInspectableMachine('coaching-gate'));
  }, [coach]);

  useEffect(() => {
    coach.setApiKey(apiKey || '');
    if (apiKey && analysisMachine.getState() === 'error') {
      sendAnalysis('RESET');
    }
  }, [analysisMachine, apiKey, coach, sendAnalysis]);

  useEffect(() => {
    coach.setCoach(activeCoach);
  }, [activeCoach, coach]);

  const audioEnabledRef = useRef(audioEnabled);
  useEffect(() => { audioEnabledRef.current = audioEnabled; }, [audioEnabled]);

  const speakRef = useRef(speak);
  useEffect(() => { speakRef.current = speak; }, [speak]);

  useEffect(() => {
    const unsub = coach.onCoaching(msg => {
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
  }, [coach]);

  const loadParsedFrames = useCallback((parsed: TelemetryFrame[], idealReference?: TelemetryFrame[]) => {
    setFrames(parsed);
    sendTransport('LOAD', { totalFrames: parsed.length });
    sendAnalysis('RESET');
    setMessages([]);
    if (idealReference && idealReference.length > 0) {
      analyzeLap(parsed, idealReference);
    } else {
      resetPredictive();
    }
  }, [analyzeLap, resetPredictive, sendAnalysis, sendTransport]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

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

    coach.processFrame(frame);

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
  }, [checkLookahead, coach]);

  const handlePlayPause = useCallback(() => {
    const wasEnded = transportMachine.getState() === 'ended';
    const transitioned = sendTransport('TOGGLE_PLAY');
    if (transitioned && wasEnded && transportMachine.getState() === 'playing') {
      evaluateFrameAt(0, frames);
    }
  }, [evaluateFrameAt, frames, sendTransport, transportMachine]);

  const handleSeek = useCallback((idx: number) => {
    sendTransport('SEEK', { index: idx });
    const clampedIdx = clampFrameIndex(idx, frames.length);
    evaluateFrameAt(clampedIdx, frames);
  }, [evaluateFrameAt, frames, sendTransport]);

  const handleSpeedChange = useCallback((nextSpeed: number) => {
    sendTransport('SET_SPEED', { speed: nextSpeed });
  }, [sendTransport]);

  const isPlaying = transportState === 'playing';
  const currentIdx = transportCtx.currentIdx;
  const speed = transportCtx.speed;

  useEffect(() => {
    if (isPlaying && frames.length > 0) {
      const intervalMs = Math.max(10, 100 / speed);
      timerRef.current = setInterval(() => {
        const prevIdx = transportMachine.getContext().currentIdx;
        const ticked = sendTransport('TICK');
        if (ticked) {
          const nextIdx = transportMachine.getContext().currentIdx;
          if (nextIdx !== prevIdx) {
            evaluateFrameAt(nextIdx, frames);
          }
        }
      }, intervalMs);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, frames, speed, evaluateFrameAt, sendTransport, transportMachine]);

  const handleAnalyze = useCallback(async () => {
    if (frames.length === 0 || analysisMachine.getState() === 'analyzing') return;

    const requestId = analysisMachine.getContext().requestId + 1;
    sendAnalysis('ANALYZE', { requestId });

    const start = Math.max(0, currentIdx - 100);
    const end = Math.min(frames.length - 1, currentIdx + 100);
    const slice = frames.slice(start, end);
    const context = slice.map((f, i) =>
      `[${i}] Speed:${f.speed.toFixed(0)}km/h Thr:${f.throttle.toFixed(0)}% Brk:${f.brake.toFixed(0)}% GLat:${f.gLat.toFixed(2)} GLong:${f.gLong.toFixed(2)}`
    ).join('\n');

    const result = await generateFeedback('flash', context);
    if (result) {
      const applied = sendAnalysis('RESOLVE', { result, requestId });
      if (applied) {
        const msg: CoachMessage = {
          id: `cloud-${Date.now()}`,
          path: 'cold',
          text: result,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, msg]);
      }
    } else {
      const cloudErr = getCloudSnapshot().context.error;
      sendAnalysis('FAIL', {
        error: cloudErr || 'Window analysis could not complete',
        requestId,
      });
    }
  }, [analysisMachine, currentIdx, frames, generateFeedback, getCloudSnapshot, sendAnalysis]);

  const currentFrame = frames[currentIdx] || null;
  const activeError =
    analysisState === 'error'
      ? cloudStatus.error || analysisCtx.error
      : undefined;

  return (
    <div
      className="page replay"
      data-machine="replay-transport"
      data-state={transportState}
      aria-busy={analysisState === 'analyzing' || undefined}
    >
      <header className="page-header">
        <h1>Replay</h1>
        <div className="replay-controls">
          <button type="button" className="upload-btn" onClick={handleLoadSample}>
            <Sparkles size={14} aria-hidden="true" />
            <span>Load Sample Lap</span>
          </button>
          <label htmlFor={csvUploadId} className="upload-btn">
            <Upload size={14} aria-hidden="true" />
            <span>Upload CSV</span>
            <input
              id={csvUploadId}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="visually-hidden"
            />
          </label>
          <button
            type="button"
            className="analyze-btn"
            data-machine="replay-analysis"
            data-state={analysisState}
            onClick={handleAnalyze}
            disabled={transportState === 'empty' || analysisState === 'analyzing'}
          >
            {analysisState === 'analyzing'
              ? <><Loader size={14} className="spin" aria-hidden="true" /> Analyzing...</>
              : 'AI Analyze'}
          </button>
          <label htmlFor={ttsSelectId} className="visually-hidden">
            Voice synthesis provider
          </label>
          <select
            id={ttsSelectId}
            className="tts-select"
            value={provider}
            onChange={e => setProvider(e.target.value as TTSProvider)}
          >
            <option value="browser">Browser TTS</option>
            <option value="gemini">Gemini TTS</option>
          </select>
        </div>
      </header>

      {activeError && (
        <div
          role="alert"
          className="analysis-card error-banner"
          data-machine="replay-analysis"
          data-state={analysisState}
        >
          <p>{activeError}</p>
        </div>
      )}

      {transportState === 'empty' ? (
        <div className="empty-state">
          <Upload size={40} aria-hidden="true" />
          <h2>Upload Telemetry Data</h2>
          <p>Drop a CSV file from your OBD/VBOX datalogger or click &ldquo;Load Sample Lap&rdquo; above</p>
        </div>
      ) : (
        <>
          <PlaybackControls
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            currentFrame={currentIdx}
            totalFrames={frames.length}
            onSeek={handleSeek}
            speed={speed}
            onSpeedChange={handleSpeedChange}
            transportState={transportState}
          />

          <div className="replay-grid">
            <div className="replay-left">
              <h2 className="visually-hidden">Vehicle gauges and track map</h2>
              <GaugeCluster frame={currentFrame} />
              <TrackMap track={THUNDERHILL_EAST} currentFrame={currentFrame ?? undefined} />
            </div>
            <div className="replay-center">
              <h2 className="visually-hidden">Telemetry traces</h2>
              <TelemetryCharts frames={frames.slice(Math.max(0, currentIdx - 100), currentIdx + 1)} />
              {analysisCtx.result && (
                <div
                  className="analysis-card"
                  data-machine="replay-analysis"
                  data-state={analysisState}
                >
                  <h2>AI Analysis</h2>
                  <ReactMarkdown>{analysisCtx.result}</ReactMarkdown>
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
                ttsPhase={ttsPhase}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
