(() => {
  if (window.self !== window.top) document.body.classList.add('embedded-preview');
  const slides = TALK.slides;
  const params = new URLSearchParams(location.search);
  const city = params.get('city') || TALK.defaults.city;
  const planned = Number(params.get('minutes')) > 0 ? Number(params.get('minutes')) : TALK.plannedMinutes;
  const viewport = document.querySelector('#viewport');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clean = s => String(s ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const channelName = params.get('session') || 'sg-trustable-ai-workshop';
  let state = { index: 0, step: 0, startedAt: null, pausedAt: null, pausedMs: 0 };
  let presenter = null, touchStartX = null, touchStartY = null;
  const seenCommands = new Set();
  const reducedMotionMedia = matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => reducedMotionMedia.matches;
  let channel;
  try { channel = new BroadcastChannel(channelName); } catch {}

  const CLOCK_TRANSITIONS = Object.freeze({
    idle: Object.freeze({ TOGGLE: 'running', START: 'running', PAUSE: 'idle', RESET: 'idle' }),
    running: Object.freeze({ TOGGLE: 'paused', START: 'running', PAUSE: 'paused', RESET: 'idle' }),
    paused: Object.freeze({ TOGGLE: 'running', START: 'running', PAUSE: 'paused', RESET: 'idle' }),
  });
  function normalizeClockEvent(action) {
    if (!action || action === 'toggle' || action === 'clock' || action === 'TOGGLE') return 'TOGGLE';
    if (action === 'start' || action === 'start-clock' || action === 'START') return 'START';
    if (action === 'pause' || action === 'pause-clock' || action === 'PAUSE') return 'PAUSE';
    if (action === 'reset' || action === 'reset-clock' || action === 'RESET') return 'RESET';
    return null;
  }
  function deriveClock(s, plannedMinutes, now = Date.now()) {
    const clockState = !s.startedAt ? 'idle' : s.pausedAt ? 'paused' : 'running';
    const elapsed = s.startedAt ? Math.max(0, ((s.pausedAt || now) - s.startedAt - (s.pausedMs || 0)) / 1000) : 0;
    return { clockState, elapsed, overrun: plannedMinutes > 0 && elapsed >= plannedMinutes * 60 };
  }
  function transitionClock(s, action, now = Date.now()) {
    const event = normalizeClockEvent(action);
    const current = !s.startedAt ? 'idle' : s.pausedAt ? 'paused' : 'running';
    const next = event ? CLOCK_TRANSITIONS[current][event] : current;
    if (next === current) return s;
    if (next === 'idle') return { ...s, startedAt: null, pausedAt: null, pausedMs: 0 };
    if (current === 'idle' && next === 'running') return { ...s, startedAt: now, pausedAt: null, pausedMs: 0 };
    if (current === 'running' && next === 'paused') return { ...s, pausedAt: now };
    if (current === 'paused' && next === 'running') return { ...s, pausedMs: (s.pausedMs || 0) + Math.max(0, now - s.pausedAt), pausedAt: null };
    return s;
  }
  function syncClockBodyState() {
    const snap = deriveClock(state, planned);
    document.body.dataset.clockState = snap.clockState;
    document.body.dataset.clockOverrun = String(snap.overrun);
    return snap;
  }

  const ANIMATION_TRANSITIONS = Object.freeze({
    inactive: Object.freeze({ SYNC_SLIDE: ['inactive', 'playing', 'paused_user', 'paused_hidden', 'reduced_motion'], TAB_HIDDEN: 'inactive', TAB_VISIBLE: 'inactive', MOTION_CHANGE: 'inactive' }),
    playing: Object.freeze({ SYNC_SLIDE: ['inactive', 'playing'], USER_TOGGLE: 'paused_user', USER_PAUSE: 'paused_user', USER_PLAY: 'playing', TAB_HIDDEN: 'paused_hidden', TAB_VISIBLE: 'playing', MOTION_CHANGE: ['playing', 'reduced_motion'] }),
    paused_user: Object.freeze({ SYNC_SLIDE: ['inactive', 'paused_user'], USER_TOGGLE: ['playing', 'paused_hidden'], USER_PAUSE: 'paused_user', USER_PLAY: ['playing', 'paused_hidden'], TAB_HIDDEN: 'paused_user', TAB_VISIBLE: 'paused_user', MOTION_CHANGE: 'paused_user' }),
    paused_hidden: Object.freeze({ SYNC_SLIDE: ['inactive', 'paused_hidden'], USER_TOGGLE: 'paused_user', USER_PAUSE: 'paused_user', USER_PLAY: 'paused_hidden', TAB_HIDDEN: 'paused_hidden', TAB_VISIBLE: ['playing', 'reduced_motion'], MOTION_CHANGE: ['paused_hidden', 'reduced_motion'] }),
    reduced_motion: Object.freeze({ SYNC_SLIDE: ['inactive', 'reduced_motion'], USER_TOGGLE: ['playing', 'paused_hidden'], USER_PAUSE: 'paused_user', USER_PLAY: ['playing', 'paused_hidden'], TAB_HIDDEN: 'reduced_motion', TAB_VISIBLE: 'reduced_motion', MOTION_CHANGE: ['playing', 'paused_hidden', 'reduced_motion'] }),
  });
  const TRANSITION_TRANSITIONS = Object.freeze({
    idle: Object.freeze({ START: 'transitioning', SKIP: 'idle', FINISH: 'idle', FAIL: 'idle' }),
    transitioning: Object.freeze({ START: 'transitioning', SKIP: 'idle', FINISH: 'idle', FAIL: 'idle' }),
  });
  let sbAnim = { active: 0, userIntent: 'auto', state: 'inactive', timer: null };
  let transitionMachine = { state: 'idle', direction: 'none', handle: null };
  const isAmbientSlide = (slide, step = state.step) => Boolean(slide && slide.kind === 'splitbrain' && step === 0);

  function parse() {
    const match = location.hash.match(/^#(\d+)(?:\.(\d+))?$/);
    const index = Math.max(0, Math.min(slides.length - 1, (Number(match?.[1]) || 1) - 1));
    return { index, step: Math.max(0, Math.min(slides[index].builds.length, Number(match?.[2]) || 0)) };
  }

  function scale() {
    document.documentElement.style.setProperty('--scale', Math.min(innerWidth / 1600, innerHeight / 900));
  }

  function stopAnim() {
    if (sbAnim.timer) { clearInterval(sbAnim.timer); sbAnim.timer = null; }
  }

  function syncPauseBtnLabel() {
    const btn = viewport.querySelector('.flow-pause');
    if (!btn) return;
    const es = I18N.lang === 'es';
    const running = sbAnim.state === 'playing';
    btn.innerHTML = `<span aria-hidden="true">${running ? '⏸' : '▶'}</span><span>${running ? (es ? 'Pausar animación' : 'Pause animation') : (es ? 'Reanudar animación' : 'Play animation')}</span>`;
  }

  function startAnim() {
    if (sbAnim.timer) return;
    sbAnim.timer = setInterval(() => {
      const s = slides[state.index];
      if (!isAmbientSlide(s) || document.hidden || sbAnim.state !== 'playing') {
        sendAnimation(document.hidden ? 'TAB_HIDDEN' : 'SYNC_SLIDE');
        return;
      }
      sbAnim.active = (sbAnim.active + 1) % 4;
      viewport.querySelectorAll('.sb-lane').forEach((el, idx) => el.classList.toggle('active', idx === sbAnim.active));
    }, 1500);
  }

  function sendAnimation(event) {
    if (event === 'USER_TOGGLE') sbAnim.userIntent = sbAnim.state === 'playing' ? 'pause' : 'play';
    else if (event === 'USER_PAUSE') sbAnim.userIntent = 'pause';
    else if (event === 'USER_PLAY') sbAnim.userIntent = 'play';
    else if (event === 'MOTION_CHANGE' && sbAnim.userIntent === 'play' && reduced()) sbAnim.userIntent = 'auto';
    const ambient = isAmbientSlide(slides[state.index]);
    const next = !ambient
      ? 'inactive'
      : sbAnim.userIntent === 'pause'
        ? 'paused_user'
        : (reduced() && sbAnim.userIntent !== 'play')
          ? 'reduced_motion'
          : document.hidden
            ? 'paused_hidden'
            : 'playing';
    sbAnim.state = next;
    document.body.dataset.animationState = next;
    document.body.classList.toggle('flow-paused', next !== 'playing');
    if (next === 'playing') startAnim();
    else stopAnim();
    syncPauseBtnLabel();
    return next;
  }

  function sendTransition(event, direction = 'none', handle = null) {
    if ((event === 'SKIP' || event === 'START') && transitionMachine.handle) {
      try { transitionMachine.handle.skipTransition(); } catch {}
    }
    const next = TRANSITION_TRANSITIONS[transitionMachine.state][event] || transitionMachine.state;
    transitionMachine = {
      state: next,
      direction: next === 'transitioning' ? direction : 'none',
      handle: next === 'transitioning' ? handle : null,
    };
    document.body.dataset.transitionState = transitionMachine.state;
  }

  function codeLine(line) {
    const tokens = line.split(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\/\/.*$|#.*$|\b(?:async|await|const|let|function|if|else|return|new|try|catch|for|of|export|import|from|class|private|def|while|True|False|true|false|gcloud|git|npm|python|curl)\b)/g);
    return tokens.map(tok => {
      if (!tok) return '';
      const kind = /^["'`]/.test(tok)
        ? 'string'
        : (tok.startsWith('//') || tok.startsWith('#'))
          ? 'comment'
          : /^(async|await|const|let|function|if|else|return|new|try|catch|for|of|export|import|from|class|private|def|while|True|False|true|false|gcloud|git|npm|python|curl)$/.test(tok)
            ? 'keyword'
            : '';
      return kind ? `<span class="code-${kind}">${esc(tok)}</span>` : esc(tok);
    }).join('');
  }

  function flowPauseMarkup(es) {
    const running = sbAnim.state === 'playing';
    return `<button type="button" class="flow-pause"><span aria-hidden="true">${running ? '⏸' : '▶'}</span><span>${running ? (es ? 'Pausar animación' : 'Pause animation') : (es ? 'Reanudar animación' : 'Play animation')}</span></button>`;
  }

  function wsHeader(slide) {
    const pillTone = slide.pillTone || '';
    const timeHtml = slide.timeBadge ? `<span class="time-pill">${esc(slide.timeBadge)}</span>` : '';
    const rightHtml = isAmbientSlide(slide)
      ? `<span class="ws-header-meta">${flowPauseMarkup(I18N.lang === 'es')}${timeHtml}</span>`
      : timeHtml;
    return `<header class="ws-header"><div class="ws-header-row"><span class="step-pill ${esc(pillTone)}">${esc(slide.eyebrow || '')}</span>${rightHtml}</div><h2>${slide.title}</h2><p class="subhead">${slide.subtitle || ''}</p></header>`;
  }

  function stepBanner(slide) {
    const total = slide.builds.length;
    const callout = slide.stepCallouts?.[state.step] || '';
    if (!callout && !total) return '';
    return `<div class="code-step-banner"><span class="step-index">${state.step + 1}/${total + 1}</span><span class="step-callout">${esc(callout || slide.builds[state.step - 1] || '')}</span></div>`;
  }

  function renderPhysicsSvg(es) {
    return `<svg viewBox="0 0 230 230" width="220" height="220" role="img" aria-label="${es ? 'Diagrama del círculo de fricción' : 'Friction Circle diagram'}">
      <circle cx="115" cy="115" r="96" fill="#f8fafc" stroke="#1e1e1e" stroke-width="2.5"/>
      <circle cx="115" cy="115" r="64" fill="none" stroke="#94a3b8" stroke-dasharray="4 4"/>
      <path d="M 115 19 A 96 96 0 0 1 211 115" fill="none" stroke="#34a853" stroke-width="6"/>
      <line x1="19" y1="115" x2="211" y2="115" stroke="#1e1e1e" stroke-width="1.5"/>
      <line x1="115" y1="19" x2="115" y2="211" stroke="#1e1e1e" stroke-width="1.5"/>
      <line x1="115" y1="115" x2="180" y2="48" stroke="#4285f4" stroke-width="3.5"/>
      <circle cx="180" cy="48" r="6" fill="#4285f4" stroke="#1e1e1e" stroke-width="1.5"/>
      <circle cx="195" cy="34" r="6" fill="#ea4335" stroke="#1e1e1e" stroke-width="1.5"/>
      <text x="115" y="13" text-anchor="middle" font-family="Roboto Mono" font-size="11" font-weight="700">${es ? 'FRENO 100%' : '100% BRAKE'}</text>
      <text x="115" y="226" text-anchor="middle" font-family="Roboto Mono" font-size="11" font-weight="700">${es ? 'ACELERADOR' : 'THROTTLE'}</text>
      <text x="172" y="108" font-family="Roboto Mono" font-size="10.5" font-weight="700">G-Lat</text>
      <text x="120" y="78" font-family="Google Sans" font-size="11.5" font-weight="700" fill="#0d652d">Trail Brake</text>
      <text x="226" y="25" text-anchor="end" font-family="Google Sans" font-size="10.5" font-weight="700" fill="#b91c1c">${es ? 'Subviraje' : 'Understeer'}</text>
    </svg>`;
  }

  function body(slide) {
    const es = I18N.lang === 'es';

    if (slide.kind === 'title' || slide.kind === 'closing') {
      return `<div class="title-wrap">
        <div class="title-copy">
          <div class="title-kicker">
            <span class="step-pill">${esc(slide.eyebrow)}</span>
            ${slide.timeBadge ? `<span class="time-pill">${esc(slide.timeBadge)}</span>` : ''}
          </div>
          <h1>${slide.title}</h1>
          <p class="subhead">${slide.subtitle}</p>
          <div class="coauthors">${slide.coauthors}</div>
          ${slide.links?.length ? `<div class="resource-links">${slide.links.map(l => `<a class="resource-pill" href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join('')}</div>` : ''}
        </div>
        <div class="speaker-col">
          <div class="speaker-photo-row">
            <img class="speaker-photo" src="${esc(slide.photo)}" width="225" height="285"${slide.kind === 'title' ? ' fetchpriority="high"' : ''} alt="${esc(slide.speakerName)}">
            ${slide.codelabBadge ? `<img class="codelab-badge-img" src="${esc(slide.codelabBadge)}" width="122" height="122" alt="Official Racing Coach Codelab Badge">` : ''}
          </div>
          <img class="speaker-badge" src="${esc(slide.badge)}" alt="Google Developer Expert · Web Technologies">
          <div class="speaker-meta">${esc(slide.speakerName)}<span>${esc(slide.speakerRole)}</span>${slide.speakerSite ? `<a class="speaker-site" href="${esc(slide.speakerSiteUrl || 'https://' + slide.speakerSite)}" target="_blank" rel="noopener">${esc(slide.speakerSite)}</a>` : ''}${slide.speakerTitle ? `<span class="speaker-title">${esc(slide.speakerTitle)}</span>` : ''}</div>
        </div>
      </div>`;
    }

    if (slide.kind === 'section') {
      return `${wsHeader(slide)}<div class="ws-body"><div class="section-wrap" style="position:static;height:100%">
        <div class="section-hero ${esc(slide.heroTone || 'blue')}">
          <span class="time-pill" style="align-self:flex-start">${esc(slide.blockTag)}</span>
          <h1>${slide.heroTitle}</h1>
          <p>${slide.heroBody}</p>
        </div>
        <div class="section-goals">
          <h3>${esc(slide.goalsTitle)}</h3>
          ${slide.goals.map((g, i) => `<div class="goal-item ${i > 0 && slide.builds.length ? 'build' : ''} ${slide.builds.length && i > state.step ? 'pending' : ''}"${slide.builds.length && i > state.step ? ' inert' : ''}><span class="goal-num">0${i + 1}</span><span>${g}</span></div>`).join('')}
        </div>
      </div></div>`;
    }

    if (slide.kind === 'roadmap') {
      return `${wsHeader(slide)}<div class="ws-body"><div class="roadmap-grid">
        ${slide.phases.map((p, i) => `<div class="roadmap-col ${esc(p.color)} ${i > 0 && slide.builds.length ? 'build' : ''} ${slide.builds.length && i > state.step ? 'pending' : ''}"${slide.builds.length && i > state.step ? ' inert' : ''}>
          <div class="roadmap-head"><strong>${esc(p.title)}</strong><span class="time-pill">${esc(p.time)}</span></div>
          <ul class="roadmap-list">${p.steps.map(st => `<li><b>${esc(st.step)}</b>${esc(st.label)}</li>`).join('')}</ul>
        </div>`).join('')}
      </div></div>`;
    }

    if (slide.kind === 'diagram') {
      return `${wsHeader(slide)}<div class="ws-body">
        <div class="diagram-row">
          ${slide.diagram.map((d, i) => `${i ? `<span class="arrow ${d.step ? 'build' : ''} ${d.step > state.step ? 'pending' : ''}" aria-hidden="true">→</span>` : ''}
          <div class="diagram-card ${esc(d.color)} ${d.step ? 'build' : ''} ${d.step > state.step ? 'pending' : ''}"${d.step > state.step ? ' inert' : ''}>
            <div class="diagram-card-top">
              ${d.tag ? `<span class="card-tag">${esc(d.tag)}</span>` : ''}
              <strong>${d.title}</strong>
              <span class="diagram-label">${d.body}</span>
            </div>
            ${d.foot ? `<div class="diagram-foot">${esc(d.foot)}</div>` : ''}
          </div>`).join('')}
        </div>
        ${slide.takeaway ? `<div class="takeaway-bar"><strong>${es ? 'CLAVE' : 'KEY'}</strong><span>${slide.takeaway}</span></div>` : ''}
      </div>`;
    }

    if (slide.kind === 'comparison') {
      return `${wsHeader(slide)}<div class="ws-body">
        ${slide.contextBar ? `<div class="comp-context">${slide.contextBar}</div>` : ''}
        <div class="comp-grid">
          ${slide.cards.map((c, i) => `<div class="comp-card ${esc(c.tone)} ${i > 0 && slide.builds.length ? 'build' : ''} ${slide.builds.length && i > state.step ? 'pending' : ''}"${slide.builds.length && i > state.step ? ' inert' : ''}>
            <div class="comp-head"><strong>${c.title}</strong><span class="verdict-pill">${esc(c.verdict)}</span></div>
            <div class="comp-quote">${c.quote}</div>
            <ul class="comp-points">${c.points.map(pt => `<li>${pt}</li>`).join('')}</ul>
          </div>`).join('')}
        </div>
        ${slide.takeaway ? `<div class="takeaway-bar"><strong>${es ? 'LECCIÓN' : 'TAKEAWAY'}</strong><span>${slide.takeaway}</span></div>` : ''}
      </div>`;
    }

    if (slide.kind === 'splitbrain') {
      const highlightIdx = state.step > 0 ? Math.min(3, state.step - 1) : sbAnim.active;
      return `${wsHeader(slide)}<div class="ws-body"><div class="sb-grid">
        <div class="sb-source">
          <div><span class="card-tag">10Hz SSE STREAM</span><h3 style="margin-top:8px">${esc(slide.source.title)}</h3><p style="font-size:15.5px;line-height:1.3;margin-top:6px">${esc(slide.source.body)}</p></div>
          <pre class="sb-mini-code">${esc(slide.source.sample)}</pre>
        </div>
        <div class="sb-arrow" aria-hidden="true">⇉</div>
        <div class="sb-paths">
          ${slide.lanes.map((l, idx) => `<div class="sb-lane ${esc(l.tone)} ${idx === highlightIdx ? 'active' : ''}">
            <div class="sb-lane-id">${esc(l.name)}<span>${esc(l.sub)}</span></div>
            <div class="sb-lane-desc">${l.desc}</div>
            <span class="sb-lat">${esc(l.latency)}</span>
          </div>`).join('')}
        </div>
        <div class="sb-arrow" aria-hidden="true">⇉</div>
        <div class="sb-sink">
          <div><span class="card-tag">TRUSTED UX</span><h3 style="margin-top:8px">${esc(slide.sink.title)}</h3><p style="font-size:15.5px;line-height:1.3;margin-top:6px">${esc(slide.sink.body)}</p></div>
          <div class="tip-box" style="background:#fff;font-size:14px">${slide.sink.footer}</div>
        </div>
      </div></div>`;
    }

    if (slide.kind === 'code' || slide.kind === 'terminal') {
      const isTerm = slide.kind === 'terminal';
      const focus = slide.codeFocus?.[state.step] || [];
      const lines = slide.code.split('\n');
      const compact = lines.length > 16 ? ' compact' : '';
      return `<div class="code-copy">
        <span class="step-pill ${esc(slide.pillTone || '')}">${esc(slide.eyebrow || '')}</span>
        <h2>${slide.title}</h2>
        <p class="subhead">${slide.subtitle || ''}</p>
        ${slide.filePath ? `<span class="file-badge"><span aria-hidden="true">📄 </span>${esc(slide.filePath)}</span>` : ''}
        ${slide.checklist?.length ? `<ul class="term-steps">${slide.checklist.map((item, idx) => `<li><b>0${idx + 1}</b>${item}</li>`).join('')}</ul>` : ''}
        ${slide.tip ? `<div class="tip-box ${esc(slide.tipTone || '')}">${slide.tip}</div>` : ''}
      </div>
      <div class="code-example">
        <div class="code-label-row">
          <span class="code-label">${esc(slide.codeLabel || '')}</span>
          ${slide.timeBadge ? `<span class="time-pill">${esc(slide.timeBadge)}</span>` : ''}
        </div>
        <pre class="code-window${compact}${isTerm ? ' terminal-win' : ''}"><code lang="en">${lines.map((ln, i) => `<span class="code-line${focus.includes(i + 1) ? ' is-focused' : ''}" data-line="${i + 1}">${codeLine(ln)}</span>`).join('\n')}</code></pre>
        ${stepBanner(slide)}
      </div>`;
    }

    if (slide.kind === 'physics') {
      return `${wsHeader(slide)}<div class="ws-body"><div class="physics-grid">
        <div class="physics-card">
          ${renderPhysicsSvg(es)}
          <div style="display:flex;flex-direction:column;gap:8px">
            <span class="card-tag">${esc(slide.left.tag)}</span>
            <h3 style="font-size:23px">${esc(slide.left.title)}</h3>
            <p style="font-size:16px;line-height:1.32">${slide.left.body}</p>
            <div class="tip-box green" style="font-size:14.5px">${slide.left.fix}</div>
          </div>
        </div>
        <div class="physics-card right">
          <div>
            <span class="card-tag">${esc(slide.right.tag)}</span>
            <h3 style="font-size:23px;margin-top:8px">${esc(slide.right.title)}</h3>
            <p style="font-size:16px;line-height:1.3;margin-top:4px">${slide.right.body}</p>
          </div>
          <div class="wt-row">
            ${slide.right.boxes.map(b => `<div class="wt-box"><span class="box-title">${esc(b.title)}</span>${b.text}</div>`).join('')}
          </div>
          <div class="tip-box red" style="font-size:14.5px;background:#fff">${slide.right.warning}</div>
        </div>
      </div></div>`;
    }

    if (slide.kind === 'personas') {
      return `${wsHeader(slide)}<div class="ws-body">
        <div class="personas-grid">
          ${slide.personas.map((p, i) => `<div class="persona-card ${i > 0 && slide.builds.length ? 'build' : ''} ${slide.builds.length && i > state.step ? 'pending' : ''}"${slide.builds.length && i > state.step ? ' inert' : ''}>
            <div class="persona-top">
              <div class="persona-avatar">${esc(p.icon)}</div>
              <div><div class="persona-name">${esc(p.name)}</div><div class="persona-style">${esc(p.style)}</div></div>
            </div>
            <div class="persona-quote">“${esc(p.quote)}”</div>
            <div class="persona-tts"><strong>Gemini TTS:</strong> ${esc(p.voice)}<br><strong>Browser:</strong> ${esc(p.browser)}</div>
          </div>`).join('')}
        </div>
        ${slide.takeaway ? `<div class="takeaway-bar"><strong>UX = TRUST</strong><span>${slide.takeaway}</span></div>` : ''}
      </div>`;
    }

    if (slide.kind === 'visual') {
      return `${wsHeader(slide)}<div class="ws-body"><div class="visual-grid">
        <div class="visual-frame"><img src="${esc(slide.image)}" fetchpriority="high" alt="${esc(slide.imageAlt || slide.title)}"></div>
        <div class="visual-notes">
          ${slide.callouts.map((c, i) => `<div class="visual-note ${i > 0 && slide.builds.length ? 'build' : ''} ${slide.builds.length && i > state.step ? 'pending' : ''}"${slide.builds.length && i > state.step ? ' inert' : ''}><span class="note-title">${esc(c.title)}</span>${c.body}</div>`).join('')}
        </div>
      </div></div>`;
    }

    if (slide.kind === 'simulator') {
      const simSrc = `live-sim.html?lang=${I18N.lang}`;
      return `${wsHeader(slide)}<div class="ws-body"><div class="sim-frame-wrap"><iframe class="sim-frame" src="${esc(simSrc)}" title="${esc(slide.title)}"></iframe></div></div>`;
    }

    if (slide.kind === 'steps') {
      return `${wsHeader(slide)}<div class="ws-body">
        <div class="diagram-row">
          ${slide.items.map((it, i) => `<div class="diagram-card ${['blue', 'yellow', 'green', 'red'][i % 4]} ${slide.builds.length && i > 0 ? 'build' : ''} ${slide.builds.length && i > state.step ? 'pending' : ''}"${slide.builds.length && i > state.step ? ' inert' : ''}>
            <div class="diagram-card-top">
              <span class="card-tag">${esc(it.tag || `0${i + 1}`)}</span>
              <strong>${it.title}</strong>
              <span class="diagram-label">${it.body}</span>
            </div>
            ${it.foot ? `<div class="diagram-foot">${esc(it.foot)}</div>` : ''}
          </div>`).join('')}
        </div>
        ${slide.takeaway ? `<div class="takeaway-bar"><strong>${es ? 'PREGUNTA' : 'PROMPT'}</strong><span>${slide.takeaway}</span></div>` : ''}
      </div>`;
    }

    if (slide.kind === 'domains') {
      return `${wsHeader(slide)}<div class="ws-body">
        <table class="domain-table">
          <thead><tr>${slide.headers.map(h => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>
          <tbody>
            ${slide.rows.map((r, i) => `<tr class="${slide.builds.length && i > state.step ? 'build pending' : ''}"${slide.builds.length && i > state.step ? ' inert' : ''}>${r.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
        ${slide.takeaway ? `<div class="takeaway-bar"><strong>4 PREGUNTAS</strong><span>${slide.takeaway}</span></div>` : ''}
      </div>`;
    }

    if (slide.kind === 'statement') {
      return `${wsHeader(slide)}<div class="ws-body">
        ${slide.specs?.length ? `<dl class="spec-list">${slide.specs.map(s => `<div class="spec-row"><dt>${esc(s.term)}</dt><dd>${s.detail}</dd></div>`).join('')}</dl>` : ''}
        ${slide.links?.length ? `<div class="resource-links">${slide.links.map(l => `<a class="resource-pill" href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join('')}</div>` : ''}
      </div>`;
    }

    return `${wsHeader(slide)}`;
  }

  function ensureControls() {
    const bar = document.querySelector('.controlbar');
    if (!bar || bar.querySelector('#slide-select')) return;
    if (I18N.lang === 'en') {
      viewport.setAttribute('aria-label', `${TALK.title} · DevFest ${city}`);
      bar.setAttribute('aria-label', 'Slide controls');
      const keyHelp = document.querySelector('#key-help');
      if (keyHelp) keyHelp.textContent = '← → / Space · Shift+← → skip slide · P presenter · F fullscreen · C controls';
      document.querySelector('#previous')?.setAttribute('aria-label', 'Previous slide');
      document.querySelector('#next')?.setAttribute('aria-label', 'Next slide');
      const presBtn = document.querySelector('#presenter');
      if (presBtn) presBtn.textContent = 'Presenter (P)';
      const fsBtn = document.querySelector('#fullscreen');
      if (fsBtn) fsBtn.textContent = 'Fullscreen (F)';
    }
    const select = document.createElement('select');
    select.id = 'slide-select';
    select.setAttribute('aria-label', I18N.lang === 'es' ? 'Ir a la diapositiva' : 'Jump to slide');
    select.innerHTML = slides.map((s, i) => `<option value="${i}">${String(i + 1).padStart(2, '0')} · ${esc(clean(s.title))}</option>`).join('');
    select.addEventListener('change', e => { navigate(Number(e.target.value), 0); e.target.blur(); });
    const stepBadge = document.createElement('span');
    stepBadge.id = 'step-status';
    stepBadge.className = 'step-status';
    stepBadge.setAttribute('role', 'status');
    stepBadge.setAttribute('aria-live', 'polite');
    stepBadge.setAttribute('aria-atomic', 'true');
    const nextBtn = bar.querySelector('#next');
    bar.insertBefore(select, nextBtn);
    bar.insertBefore(stepBadge, nextBtn);
  }

  function paint() {
    ensureControls();
    syncClockBodyState();
    sendAnimation('SYNC_SLIDE');
    const slide = slides[state.index];
    document.body.style.setProperty('--slide-bg', slide.background || 'var(--paper)');
    const stepSuffix = slide.builds.length ? ` · ${I18N.lang === 'es' ? 'paso' : 'step'} ${state.step}/${slide.builds.length}` : '';
    viewport.innerHTML = `<article class="slide" tabindex="-1" aria-label="${state.index + 1} / ${slides.length} · ${esc(clean(slide.title))}">
      <div class="panel-shape" aria-hidden="true"></div>
      <div class="lockup" aria-label="Web @DevFest ${esc(city)}"><span class="brace" aria-hidden="true">{</span><div class="lockup-copy">Web<br><strong>@DevFest</strong><div class="city">${esc(city)}</div></div><span class="brace" aria-hidden="true">}</span></div>
      <div class="slide-content">${body(slide)}</div>
      <span class="slide-number"><span>${String(state.index + 1).padStart(2, '0')} / ${slides.length}${stepSuffix}</span><span aria-hidden="true">·</span><a href="https://www.sebastian-gomez.com/" target="_blank" rel="noopener">www.sebastian-gomez.com</a></span>
      <img class="gdg-logo" src="assets/gdg-logo.png" width="636" height="192" alt="Google Developer Groups">
    </article>`;
    document.title = `${state.index + 1}. ${clean(slide.title)} | ${TALK.title}`;
    const progress = document.querySelector('#progress');
    if (progress) {
      const stepFraction = slide.builds.length ? state.step / (slide.builds.length + 1) : 0;
      progress.style.width = `${((state.index + stepFraction + 1) / slides.length) * 100}%`;
    }
    const select = document.querySelector('#slide-select');
    if (select) select.value = String(state.index);
    const stepBadge = document.querySelector('#step-status');
    if (stepBadge) stepBadge.textContent = slide.builds.length ? `${I18N.lang === 'es' ? 'Paso' : 'Step'} ${state.step}/${slide.builds.length}` : `${state.index + 1}/${slides.length}`;
    const prevBtn = document.querySelector('#previous'), nextBtn = document.querySelector('#next');
    const prevFocused = prevBtn === document.activeElement, nextFocused = nextBtn === document.activeElement;
    if (prevBtn) prevBtn.disabled = state.index === 0 && state.step === 0;
    if (nextBtn) nextBtn.disabled = state.index === slides.length - 1 && state.step >= slide.builds.length;
    if (prevFocused && prevBtn?.disabled && nextBtn && !nextBtn.disabled) nextBtn.focus();
    if (nextFocused && nextBtn?.disabled && prevBtn && !prevBtn.disabled) prevBtn.focus();
    announce();
  }

  function announce() {
    const message = { type: 'deck-state', state: { ...state }, slideCount: slides.length, plannedMinutes: planned, city, session: channelName };
    channel?.postMessage(message);
    if (presenter && !presenter.closed) presenter.postMessage(message, location.origin === 'null' ? '*' : location.origin);
  }

  function navigate(index, step = 0, animate = true) {
    stopAnim();
    const prevIndex = state.index;
    index = Math.max(0, Math.min(slides.length - 1, index));
    step = Math.max(0, Math.min(slides[index].builds.length, step));
    const direction = index > prevIndex ? 'forward' : index < prevIndex ? 'backward' : 'step';
    const hadSlideFocus = viewport.contains(document.activeElement);
    state = { ...state, index, step };
    const hash = `#${index + 1}.${step}`;
    if (location.hash !== hash) history.pushState(null, '', hash);
    sendTransition('SKIP');
    const routeFocus = () => {
      if (window.self === window.top && (hadSlideFocus || (animate && (!document.activeElement || document.activeElement === document.body)))) {
        viewport.querySelector('.slide')?.focus({ preventScroll: true });
      }
    };
    if (animate && !reduced() && document.startViewTransition) {
      let t;
      try {
        t = document.startViewTransition({ update: paint, types: [direction] });
      } catch {
        try { t = document.startViewTransition(paint); } catch { sendTransition('FAIL'); paint(); routeFocus(); return; }
      }
      sendTransition('START', direction, t);
      t.finished.catch(() => {}).finally(() => {
        if (transitionMachine.handle === t) sendTransition('FINISH');
        routeFocus();
      });
    } else {
      sendTransition('FINISH');
      paint();
      routeFocus();
    }
  }

  const fsElement = () => document.fullscreenElement || document.webkitFullscreenElement || null;
  function syncFullscreenState() {
    document.querySelector('#fullscreen')?.setAttribute('aria-pressed', String(Boolean(fsElement())));
  }
  function toggleFullscreen() {
    try {
      if (fsElement()) {
        const exit = document.exitFullscreen?.bind(document) || document.webkitExitFullscreen?.bind(document);
        exit?.()?.catch?.(() => {});
      } else {
        const el = document.documentElement;
        const req = el.requestFullscreen?.bind(el) || el.webkitRequestFullscreen?.bind(el);
        req?.()?.catch?.(() => {});
      }
    } catch {}
  }

  function next() {
    const s = slides[state.index];
    if (state.step < s.builds.length) navigate(state.index, state.step + 1);
    else if (state.index < slides.length - 1) navigate(state.index + 1, 0);
  }
  function previous() {
    if (state.step > 0) navigate(state.index, state.step - 1);
    else if (state.index > 0) navigate(state.index - 1, slides[state.index - 1].builds.length);
  }
  function nextSlide() {
    if (state.index < slides.length - 1) navigate(state.index + 1, 0);
    else navigate(state.index, slides[state.index].builds.length);
  }
  function previousSlide() {
    if (state.step > 0) navigate(state.index, 0);
    else if (state.index > 0) navigate(state.index - 1, 0);
  }

  function openPresenter() {
    const u = new URL('presenter.html', location.href);
    u.searchParams.set('lang', I18N.lang);
    u.searchParams.set('session', channelName);
    u.searchParams.set('minutes', String(planned));
    u.searchParams.set('city', city);
    presenter = window.open(u.href, 'sg-trustable-ai-presenter', 'popup,width=1380,height=900');
    if (presenter) setTimeout(announce, 300);
  }

  function clock(action) {
    state = transitionClock(state, action, Date.now());
    syncClockBodyState();
    announce();
  }

  function toggleAnimation() {
    if (!isAmbientSlide(slides[state.index])) return sbAnim.state;
    return sendAnimation('USER_TOGGLE');
  }

  function getAllowedCommands(clockState) {
    const slide = slides[state.index];
    const cmds = ['navigate', 'goto', 'clock', 'openPresenter'];
    if (state.index > 0 || state.step > 0) cmds.push('previous', 'previousSlide');
    if (state.index < slides.length - 1 || state.step < slide.builds.length) cmds.push('next', 'nextSlide');
    if (clockState === 'idle') cmds.push('start-clock');
    else if (clockState === 'running') cmds.push('pause-clock', 'reset-clock');
    else cmds.push('start-clock', 'reset-clock');
    if (isAmbientSlide(slide)) cmds.push('toggleAnimation');
    return cmds;
  }

  function getState() {
    const { clockState, overrun } = deriveClock(state, planned);
    return {
      ...state,
      clockState,
      overrun,
      animationState: sbAnim.state,
      transitionState: transitionMachine.state,
      allowedCommands: getAllowedCommands(clockState),
    };
  }

  function getTransitions() {
    return { clock: CLOCK_TRANSITIONS, animation: ANIMATION_TRANSITIONS, transition: TRANSITION_TRANSITIONS };
  }

  function receive(message) {
    if (message?.type === 'presenter-ready') announce();
    if (message?.type === 'deck-command') {
      if (message.id && seenCommands.has(message.id)) return;
      if (message.id) {
        seenCommands.add(message.id);
        if (seenCommands.size > 128) seenCommands.delete(seenCommands.values().next().value);
      }
      const c = message.command;
      if (c === 'next') next();
      if (c === 'previous') previous();
      if (c === 'clock' || c === 'toggle-clock') clock('toggle');
      if (c === 'start-clock') clock('start');
      if (c === 'pause-clock') clock('pause');
      if (c === 'reset-clock') clock('reset');
      if (c === 'goto' && Number.isInteger(message.index)) navigate(message.index, message.step || 0);
    }
  }

  channel?.addEventListener('message', e => receive(e.data));
  document.addEventListener('visibilitychange', () => sendAnimation(document.hidden ? 'TAB_HIDDEN' : 'TAB_VISIBLE'));
  reducedMotionMedia.addEventListener?.('change', () => sendAnimation('MOTION_CHANGE'));
  document.addEventListener('fullscreenchange', syncFullscreenState);
  document.addEventListener('webkitfullscreenchange', syncFullscreenState);
  addEventListener('message', e => {
    if (e.source !== presenter) return;
    if (location.origin !== 'null' && e.origin !== location.origin) return;
    receive(e.data);
  });

  addEventListener('keydown', e => {
    if (e.isComposing || e.altKey || e.ctrlKey || e.metaKey || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (['Enter', ' '].includes(e.key) && e.target.closest('a,button,summary')) return;
    if (e.shiftKey && e.key === 'ArrowRight') { e.preventDefault(); nextSlide(); return; }
    if (e.shiftKey && e.key === 'ArrowLeft') { e.preventDefault(); previousSlide(); return; }
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); next(); }
    if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); previous(); }
    if (e.key === 'Home') { e.preventDefault(); navigate(0); }
    if (e.key === 'End') { e.preventDefault(); navigate(slides.length - 1); }
    if (e.key.toLowerCase() === 'p') openPresenter();
    if (e.key.toLowerCase() === 'c') document.body.classList.toggle('hide-controls');
    if (e.key.toLowerCase() === 'f') toggleFullscreen();
  });

  viewport.addEventListener('click', e => {
    const pauseBtn = e.target.closest('.flow-pause');
    if (pauseBtn) {
      sendAnimation('USER_TOGGLE');
      return;
    }
    if (e.target.closest('a,button,input,select,textarea,iframe,.sim-frame-wrap')) return;
    if (window.getSelection?.()?.toString()) return;
    next();
  });

  viewport.addEventListener('touchstart', e => {
    if (e.touches.length === 1) { touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; }
  }, { passive: true });
  viewport.addEventListener('touchend', e => {
    if (touchStartX === null || e.changedTouches.length !== 1) return;
    const dx = e.changedTouches[0].clientX - touchStartX, dy = e.changedTouches[0].clientY - touchStartY;
    touchStartX = null; touchStartY = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) { if (dx < 0) next(); else previous(); }
  }, { passive: true });

  document.querySelector('#previous')?.addEventListener('click', e => { previous(); if (e.detail > 0) e.currentTarget.blur(); });
  document.querySelector('#next')?.addEventListener('click', e => { next(); if (e.detail > 0) e.currentTarget.blur(); });
  document.querySelector('#presenter')?.addEventListener('click', openPresenter);
  document.querySelector('#fullscreen')?.addEventListener('click', e => {
    toggleFullscreen();
    if (e.detail > 0) e.currentTarget.blur();
  });

  addEventListener('hashchange', () => { sendTransition('SKIP'); state = { ...state, ...parse() }; paint(); });
  addEventListener('popstate', () => { sendTransition('SKIP'); state = { ...state, ...parse() }; paint(); });
  addEventListener('resize', scale);

  state = { ...state, ...parse() };
  scale();
  sendTransition('FINISH');
  paint();
  window.deck = { next, previous, nextSlide, previousSlide, navigate, getState, getTransitions, openPresenter, clock, toggleAnimation };
})();
