import { useCallback, useEffect, useId } from 'react';
import { useGeminiCloud } from '../hooks/useGeminiCloud';
import { parseTelemetryCSV } from '../utils/telemetryParser';
import { useMachine, type StateNodeConfig } from '../utils/stateMachine';
import TelemetryCharts from '../components/TelemetryCharts';
import { THUNDERHILL_EAST } from '../data/trackData';
import type { LapComparisonState, TelemetryFrame } from '../types';
import { BarChart3, Upload, Loader, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AnalysisProps {
  apiKey?: string | null;
}

interface LapComparisonContext {
  readonly lap1Frames: TelemetryFrame[];
  readonly lap2Frames: TelemetryFrame[];
  readonly comparisonResult: string;
  readonly error?: string;
  readonly requestId: number;
}

interface LapComparisonPublicContext {
  readonly lap1FrameCount: number;
  readonly lap2FrameCount: number;
  readonly hasComparisonResult: boolean;
  readonly error?: string;
}

type LapComparisonEvents = {
  LOAD_LAP_1: { frames: TelemetryFrame[] };
  LOAD_LAP_2: { frames: TelemetryFrame[] };
  LOAD_SAMPLES: { lap1Frames: TelemetryFrame[]; lap2Frames: TelemetryFrame[] };
  COMPARE: { requestId: number };
  COMPARE_SUCCESS: { result: string; requestId: number };
  COMPARE_ERROR: { error: string; requestId: number };
  CLEAR_ERROR: undefined;
};

function resolveLapLoadState(lap1Count: number, lap2Count: number): LapComparisonState {
  if (lap1Count > 0 && lap2Count > 0) return 'ready';
  if (lap1Count > 0) return 'partial_lap1';
  if (lap2Count > 0) return 'partial_lap2';
  return 'empty';
}

const UPLOAD_TRANSITIONS: NonNullable<
  StateNodeConfig<LapComparisonState, LapComparisonContext, LapComparisonEvents>['on']
> = {
  LOAD_LAP_1: {
    target: (ctx, payload) =>
      resolveLapLoadState(payload.frames.length, ctx.lap2Frames.length),
    assign: (ctx, payload) => ({
      lap1Frames: payload.frames,
      lap2Frames: ctx.lap2Frames,
      comparisonResult: '',
      error: undefined,
      requestId: ctx.requestId + 1,
    }),
  },
  LOAD_LAP_2: {
    target: (ctx, payload) =>
      resolveLapLoadState(ctx.lap1Frames.length, payload.frames.length),
    assign: (ctx, payload) => ({
      lap1Frames: ctx.lap1Frames,
      lap2Frames: payload.frames,
      comparisonResult: '',
      error: undefined,
      requestId: ctx.requestId + 1,
    }),
  },
  LOAD_SAMPLES: {
    target: (_ctx, payload) =>
      resolveLapLoadState(payload.lap1Frames.length, payload.lap2Frames.length),
    assign: (ctx, payload) => ({
      lap1Frames: payload.lap1Frames,
      lap2Frames: payload.lap2Frames,
      comparisonResult: '',
      error: undefined,
      requestId: ctx.requestId + 1,
    }),
  },
};

function formatLapComparisonContext(
  ctx: Readonly<LapComparisonContext>,
): LapComparisonPublicContext {
  return {
    lap1FrameCount: ctx.lap1Frames.length,
    lap2FrameCount: ctx.lap2Frames.length,
    hasComparisonResult: ctx.comparisonResult.length > 0,
    error: ctx.error,
  };
}

export default function Analysis({ apiKey }: AnalysisProps) {
  const {
    state: comparisonState,
    context,
    send,
    machine,
  } = useMachine<
    LapComparisonState,
    LapComparisonContext,
    LapComparisonEvents,
    LapComparisonPublicContext
  >(
    () => ({
      id: 'lap-comparison',
      initial: 'empty',
      context: {
        lap1Frames: [],
        lap2Frames: [],
        comparisonResult: '',
        error: undefined,
        requestId: 0,
      },
      states: {
        empty: {
          on: {
            ...UPLOAD_TRANSITIONS,
          },
        },
        partial_lap1: {
          on: {
            ...UPLOAD_TRANSITIONS,
          },
        },
        partial_lap2: {
          on: {
            ...UPLOAD_TRANSITIONS,
          },
        },
        ready: {
          on: {
            ...UPLOAD_TRANSITIONS,
            COMPARE: {
              enabled: ctx =>
                ctx.lap1Frames.length > 0 && ctx.lap2Frames.length > 0,
              guard: ctx =>
                ctx.lap1Frames.length > 0 && ctx.lap2Frames.length > 0,
              target: 'comparing',
              assign: (ctx, payload) => ({
                ...ctx,
                error: undefined,
                requestId: payload.requestId,
              }),
            },
          },
        },
        comparing: {
          on: {
            ...UPLOAD_TRANSITIONS,
            COMPARE_SUCCESS: {
              guard: (ctx, payload) => payload.requestId === ctx.requestId,
              target: 'compared',
              assign: (ctx, payload) => ({
                ...ctx,
                comparisonResult: payload.result,
                error: undefined,
              }),
            },
            COMPARE_ERROR: {
              guard: (ctx, payload) => payload.requestId === ctx.requestId,
              target: 'error',
              assign: (ctx, payload) => ({
                ...ctx,
                comparisonResult: '',
                error: payload.error,
              }),
            },
          },
        },
        compared: {
          on: {
            ...UPLOAD_TRANSITIONS,
            COMPARE: {
              enabled: ctx =>
                ctx.lap1Frames.length > 0 && ctx.lap2Frames.length > 0,
              guard: ctx =>
                ctx.lap1Frames.length > 0 && ctx.lap2Frames.length > 0,
              target: 'comparing',
              assign: (ctx, payload) => ({
                ...ctx,
                error: undefined,
                requestId: payload.requestId,
              }),
            },
          },
        },
        error: {
          on: {
            ...UPLOAD_TRANSITIONS,
            CLEAR_ERROR: {
              target: ctx =>
                resolveLapLoadState(ctx.lap1Frames.length, ctx.lap2Frames.length),
              assign: ctx => ({
                ...ctx,
                error: undefined,
              }),
            },
            COMPARE: {
              enabled: ctx =>
                ctx.lap1Frames.length > 0 && ctx.lap2Frames.length > 0,
              guard: ctx =>
                ctx.lap1Frames.length > 0 && ctx.lap2Frames.length > 0,
              target: 'comparing',
              assign: (ctx, payload) => ({
                ...ctx,
                error: undefined,
                requestId: payload.requestId,
              }),
            },
          },
        },
      },
    }),
    { formatContext: formatLapComparisonContext },
  );

  const { generateFeedback, status, getSnapshot: getCloudSnapshot } = useGeminiCloud(apiKey);
  const lapAInputId = useId();
  const lapBInputId = useId();

  useEffect(() => {
    if (apiKey && machine.getState() === 'error') {
      send('CLEAR_ERROR');
    }
  }, [apiKey, machine, send]);

  const handleFile = useCallback(
    (eventType: 'LOAD_LAP_1' | 'LOAD_LAP_2') =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';
        const reader = new FileReader();
        reader.onload = () => {
          const parsed = parseTelemetryCSV(reader.result as string);
          send(eventType, { frames: parsed });
        };
        reader.readAsText(file);
      },
    [send],
  );

  const handleLoadSamples = useCallback(async () => {
    try {
      const [resA, resB] = await Promise.all([
        fetch('/sample-lap-a.csv'),
        fetch('/sample-lap-b.csv'),
      ]);
      const [csvA, csvB] = await Promise.all([resA.text(), resB.text()]);
      send('LOAD_SAMPLES', {
        lap1Frames: parseTelemetryCSV(csvA),
        lap2Frames: parseTelemetryCSV(csvB),
      });
    } catch (err) {
      console.error('Failed to load sample laps:', err);
    }
  }, [send]);

  const { lap1Frames, lap2Frames, comparisonResult } = context;

  const handleCompare = useCallback(async () => {
    if (
      lap1Frames.length === 0 ||
      lap2Frames.length === 0 ||
      machine.getState() === 'comparing'
    ) {
      return;
    }

    const requestId = machine.getContext().requestId + 1;
    if (!send('COMPARE', { requestId })) return;

    const summarize = (frames: TelemetryFrame[], label: string) => {
      const speeds = frames.map(f => f.speed);
      const maxSpeed = Math.max(...speeds);
      const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
      const maxBrake = Math.max(...frames.map(f => f.brake));
      const maxGLat = Math.max(...frames.map(f => Math.abs(f.gLat)));
      return `${label}: MaxSpeed=${maxSpeed.toFixed(0)}km/h AvgSpeed=${avgSpeed.toFixed(0)}km/h MaxBrake=${maxBrake.toFixed(0)}% MaxGLat=${maxGLat.toFixed(2)}g Frames=${frames.length}`;
    };

    const promptContext = `Compare these two laps on ${THUNDERHILL_EAST.name}:

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

    const result = await generateFeedback('pro', promptContext);
    if (result) {
      send('COMPARE_SUCCESS', { result, requestId });
    } else {
      const cloudErr = getCloudSnapshot().context.error;
      send('COMPARE_ERROR', {
        error: cloudErr || 'Lap comparison could not complete',
        requestId,
      });
    }
  }, [lap1Frames, lap2Frames, generateFeedback, getCloudSnapshot, machine, send]);

  const activeError =
    comparisonState === 'error'
      ? status.error || context.error
      : undefined;

  const canCompare =
    comparisonState === 'ready' ||
    comparisonState === 'compared' ||
    comparisonState === 'error';

  return (
    <div
      className="page analysis"
      data-machine="lap-comparison"
      data-state={comparisonState}
      aria-busy={comparisonState === 'comparing' || undefined}
    >
      <header className="page-header">
        <h1><BarChart3 size={18} aria-hidden="true" /> Lap Analysis</h1>
        <button type="button" className="upload-btn" onClick={handleLoadSamples}>
          <Sparkles size={14} aria-hidden="true" />
          <span>Load Sample Laps A &amp; B</span>
        </button>
      </header>

      {activeError && (
        <div role="alert" className="analysis-result error-banner">
          <p>{activeError}</p>
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
              onChange={handleFile('LOAD_LAP_1')}
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
              onChange={handleFile('LOAD_LAP_2')}
              className="visually-hidden"
            />
          </label>
        </div>
        <button
          type="button"
          className="analyze-btn"
          onClick={handleCompare}
          disabled={!canCompare}
        >
          {comparisonState === 'comparing' ? <><Loader size={14} className="spin" aria-hidden="true" /> Comparing...</> : 'Compare Laps'}
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

      {comparisonState === 'empty' && (
        <div className="empty-state">
          <BarChart3 size={40} aria-hidden="true" />
          <h2>Compare Two Laps</h2>
          <p>Upload two CSV files or click &ldquo;Load Sample Laps A &amp; B&rdquo; above to compare telemetry side-by-side</p>
        </div>
      )}
    </div>
  );
}
