import { useState, useEffect, useRef, useCallback, useId, useSyncExternalStore } from 'react';
import { TelemetryStreamService } from '../services/telemetryStreamService';
import { CoachingService } from '../services/coachingService';
import { AudioService } from '../services/audioService';
import { useTTS } from '../hooks/useTTS';
import { registerKoruMachine } from '../utils/stateMachine';
import { THUNDERHILL_EAST } from '../data/trackData';
import TelemetryCharts from '../components/TelemetryCharts';
import TrackMap from '../components/TrackMap';
import CoachPanel, { type CoachMessage } from '../components/CoachPanel';
import GaugeCluster from '../components/GaugeCluster';
import type { TelemetryFrame, SSEConnectionStatus, TTSProvider } from '../types';
import { Radio, Unplug } from 'lucide-react';

interface LiveSessionProps {
  apiKey: string | null;
}

export default function LiveSession({ apiKey }: LiveSessionProps) {
  const [frames, setFrames] = useState<TelemetryFrame[]>([]);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [activeCoach, setActiveCoach] = useState('superaj');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [sseUrl, setSseUrl] = useState('');

  const sseInputId = useId();
  const ttsSelectId = useId();

  const [stream] = useState(() => TelemetryStreamService.getInstance());
  const [coach] = useState(() => new CoachingService());
  const [audio] = useState(() => new AudioService());

  const streamSnapshot = useSyncExternalStore(
    stream.subscribe,
    stream.getSnapshot,
    stream.getSnapshot,
  );
  const status: SSEConnectionStatus =
    streamSnapshot.state === 'streaming_sse' || streamSnapshot.state === 'replaying_file'
      ? 'connected'
      : streamSnapshot.state;

  const { speak, setProvider, provider, ttsPhase } = useTTS(apiKey, activeCoach);

  useEffect(() => {
    const unregisterStream = registerKoruMachine(stream.asInspectableMachine('telemetry-stream'));
    const unregisterCoach = registerKoruMachine(coach.asInspectableMachine('coaching-gate'));
    void audio.init();
    return () => {
      unregisterCoach();
      unregisterStream();
      stream.disconnect();
      audio.destroy();
    };
  }, [audio, coach, stream]);

  useEffect(() => {
    coach.setApiKey(apiKey || '');
  }, [apiKey, coach]);

  const audioEnabledRef = useRef(audioEnabled);
  useEffect(() => { audioEnabledRef.current = audioEnabled; }, [audioEnabled]);

  const speakRef = useRef(speak);
  useEffect(() => { speakRef.current = speak; }, [speak]);

  useEffect(() => {
    const unsubFrame = stream.onFrame((frame) => {
      setFrames(prev => [...prev.slice(-500), frame]);
      coach.processFrame(frame);
    });

    const unsubCoach = coach.onCoaching(msg => {
      const coachMsg: CoachMessage = {
        id: `${Date.now()}-${Math.random()}`,
        path: msg.path,
        text: msg.text,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, coachMsg]);

      if (audioEnabledRef.current && msg.text) {
        void speakRef.current(msg.text);
      }
    });

    return () => { unsubFrame(); unsubCoach(); };
  }, [coach, stream]);

  const handleConnect = useCallback(() => {
    if (status === 'connected' || status === 'connecting') {
      stream.disconnect();
    } else {
      const url = sseUrl.trim() || '/mock-telemetry.txt';
      stream.connect(url);
    }
  }, [status, sseUrl, stream]);

  const handleQuickPreset = useCallback((presetUrl: string) => {
    setSseUrl(presetUrl);
    stream.connect(presetUrl);
  }, [stream]);

  const handleCoachChange = useCallback((id: string) => {
    setActiveCoach(id);
    coach.setCoach(id);
  }, [coach]);

  const currentFrame = frames[frames.length - 1] || null;

  return (
    <div
      className="page live-session"
      data-machine="telemetry-stream"
      data-state={streamSnapshot.state}
      aria-busy={status === 'connecting' || undefined}
    >
      <header className="page-header">
        <h1><Radio size={20} aria-hidden="true" /> Live Session</h1>
        <div className="live-controls">
          <button
            type="button"
            className="coach-pill"
            onClick={() => handleQuickPreset('http://localhost:8000/events')}
          >
            Local :8000/events
          </button>
          <button
            type="button"
            className="coach-pill"
            onClick={() => handleQuickPreset('/mock-telemetry.txt')}
          >
            Built-in Demo
          </button>
          <label htmlFor={sseInputId} className="visually-hidden">
            Telemetry stream URL or file path
          </label>
          <input
            id={sseInputId}
            type="text"
            placeholder="SSE URL or .txt / .csv file path"
            value={sseUrl}
            onChange={e => setSseUrl(e.target.value)}
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            className="sse-input"
          />
          <button
            type="button"
            className={`connect-btn ${status === 'connected' ? 'connected' : status === 'connecting' ? 'connecting' : ''}`}
            onClick={handleConnect}
          >
            {status === 'connected'
              ? <><Unplug size={14} aria-hidden="true" /> Disconnect</>
              : status === 'connecting'
                ? <><Unplug size={14} aria-hidden="true" /> Cancel</>
                : <><Radio size={14} aria-hidden="true" /> Connect</>}
          </button>
          <span
            className={`status-badge status-${status}`}
            data-stream-mode={streamSnapshot.context.mode ?? undefined}
            role="status"
          >
            {status}
          </span>
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

      <div className="live-grid">
        {/* Left: Gauges + Track */}
        <div className="live-left">
          <h2 className="visually-hidden">Vehicle gauges and track map</h2>
          <GaugeCluster frame={currentFrame} />
          <TrackMap track={THUNDERHILL_EAST} currentFrame={currentFrame ?? undefined} />
        </div>

        {/* Center: Charts */}
        <div className="live-center">
          <h2 className="visually-hidden">Telemetry traces</h2>
          <TelemetryCharts frames={frames} />
        </div>

        {/* Right: Coach */}
        <div className="live-right">
          <CoachPanel
            messages={messages}
            activeCoach={activeCoach}
            onCoachChange={handleCoachChange}
            audioEnabled={audioEnabled}
            onAudioToggle={() => setAudioEnabled(!audioEnabled)}
            ttsPhase={ttsPhase}
          />
        </div>
      </div>
    </div>
  );
}
