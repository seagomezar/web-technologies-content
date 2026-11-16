import { NavLink } from 'react-router-dom';
import { Gauge, Radio, PlayCircle, BarChart3, Settings, Eye, EyeOff } from 'lucide-react';
import { useState, useId, useRef } from 'react';

interface NavbarProps {
  apiKey: string | null;
  onApiKeyChange: (key: string) => void;
}

const SUPPORTS_POPOVER =
  typeof HTMLElement !== 'undefined' && Object.hasOwn(HTMLElement.prototype, 'popover');

export default function Navbar({ apiKey, onApiKeyChange }: NavbarProps) {
  const [legacyOpen, setLegacyOpen] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [keyInput, setKeyInput] = useState(apiKey || '');

  const popoverId = useId();
  const keyInputId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const links = [
    { to: '/dashboard', icon: Gauge, label: 'Dashboard' },
    { to: '/live', icon: Radio, label: 'Live' },
    { to: '/replay', icon: PlayCircle, label: 'Replay' },
    { to: '/analysis', icon: BarChart3, label: 'Analysis' },
  ];

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onApiKeyChange(keyInput);
    if (SUPPORTS_POPOVER) {
      popoverRef.current?.hidePopover();
    } else {
      setLegacyOpen(false);
    }
    triggerRef.current?.focus();
  };

  return (
    <nav className="navbar" aria-label="Primary">
      <div className="navbar-brand">
        <span className="navbar-logo" aria-hidden="true">●</span>
        <span className="navbar-title">koru</span>
      </div>

      <div className="navbar-links">
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
          >
            <l.icon size={16} aria-hidden="true" />
            <span>{l.label}</span>
          </NavLink>
        ))}
      </div>

      <div
        className="navbar-actions"
        onKeyDown={e => {
          if (!SUPPORTS_POPOVER && legacyOpen && e.key === 'Escape') {
            setLegacyOpen(false);
            triggerRef.current?.focus();
          }
        }}
      >
        <div className={`api-status ${apiKey ? 'connected' : 'disconnected'}`} role="status">
          {apiKey ? '● Gemini' : '○ No Key'}
        </div>
        <button
          ref={triggerRef}
          type="button"
          className="icon-btn settings-trigger"
          aria-label="Gemini API key settings"
          {...(SUPPORTS_POPOVER
            ? { popoverTarget: popoverId }
            : {
                'aria-expanded': legacyOpen,
                'aria-controls': popoverId,
                onClick: () => setLegacyOpen(open => !open),
              })}
        >
          <Settings size={18} aria-hidden="true" />
        </button>

        <div
          ref={popoverRef}
          id={popoverId}
          className="settings-dropdown"
          {...(SUPPORTS_POPOVER ? { popover: 'auto' } : { hidden: !legacyOpen })}
        >
          <form className="settings-form" onSubmit={handleSave}>
            <label htmlFor={keyInputId}>Gemini API Key</label>
            <div className="settings-input-row">
              <input
                id={keyInputId}
                name="geminiApiKey"
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                placeholder="AIza..."
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                enterKeyHint="done"
                className="settings-input"
              />
              <button
                type="button"
                className="icon-btn key-visibility-btn"
                aria-label="Show API key"
                aria-pressed={showKey}
                onClick={() => setShowKey(prev => !prev)}
              >
                {showKey ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
              </button>
            </div>
            <button type="submit" className="settings-btn">
              Save
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
