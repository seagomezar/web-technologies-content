import { COACHES, DEFAULT_COACH } from '../utils/coachingKnowledge';
import { MessageCircle, Volume2, VolumeX } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { TTSPhase } from '../types';

interface CoachMessage {
  id: string;
  path: 'hot' | 'cold' | 'feedforward';
  text: string;
  timestamp: number;
}

interface CoachPanelProps {
  messages: CoachMessage[];
  activeCoach: string;
  onCoachChange: (id: string) => void;
  audioEnabled: boolean;
  onAudioToggle: () => void;
  ttsPhase?: TTSPhase;
}

export default function CoachPanel({
  messages,
  activeCoach,
  onCoachChange,
  audioEnabled,
  onAudioToggle,
  ttsPhase = 'idle',
}: CoachPanelProps) {
  const coach = COACHES[activeCoach] || COACHES[DEFAULT_COACH];

  return (
    <div
      className="coach-panel"
      data-machine="tts-pipeline"
      data-state={ttsPhase}
    >
      {/* Coach selector */}
      <div className="coach-header">
        <div className="coach-info">
          <span className="coach-icon" aria-hidden="true">{coach.icon}</span>
          <div>
            <h2 className="coach-name">{coach.name}</h2>
            <span className="coach-style">{coach.style}</span>
          </div>
        </div>

        <div className="coach-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={onAudioToggle}
            aria-label="Voice coaching audio"
            aria-pressed={audioEnabled}
          >
            {audioEnabled ? <Volume2 size={16} aria-hidden="true" /> : <VolumeX size={16} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Coach selector pills */}
      <div className="coach-selector">
        {Object.values(COACHES).map(c => (
          <button
            key={c.id}
            type="button"
            className={`coach-pill ${c.id === activeCoach ? 'active' : ''}`}
            aria-pressed={c.id === activeCoach}
            onClick={() => onCoachChange(c.id)}
          >
            <span aria-hidden="true">{c.icon}</span> {c.name}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="coach-messages">
        {messages.length === 0 ? (
          <div className="coach-empty">
            <MessageCircle size={24} aria-hidden="true" />
            <p>Waiting for telemetry data...</p>
          </div>
        ) : (
          messages.slice(-20).reverse().map(msg => (
            <div key={msg.id} className={`coach-msg coach-msg-${msg.path}`}>
              <div className="coach-msg-badge">{msg.path.toUpperCase()}</div>
              <div className="coach-msg-text">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
              <div className="coach-msg-time">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export type { CoachMessage };
