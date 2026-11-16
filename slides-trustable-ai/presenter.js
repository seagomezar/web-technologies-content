(() => {
  const $ = q => document.querySelector(q);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clean = s => String(s ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const params = new URLSearchParams(location.search);
  const session = params.get('session') || 'sg-trustable-ai-workshop';
  const es = I18N.lang === 'es';
  let channel, state = { index: 0, step: 0, startedAt: null, pausedAt: null, pausedMs: 0 };
  let planned = Number(params.get('minutes')) || TALK.plannedMinutes;
  let connected = false;

  try { channel = new BroadcastChannel(session); } catch {}

  if (!es) {
    $('#pres-title').textContent = TALK.title;
    $('#previous').textContent = '← Previous';
    $('#next').textContent = 'Next →';
    $('#reset').textContent = 'Reset timer';
    $('#script-heading').textContent = 'Facilitator script & steps';
    $('#next-heading').textContent = 'Next slide';
    $('#schedule-summary').textContent = `Slide schedule (${planned} min)`;
    $('#sources-summary').textContent = 'Workshop links & sources';
  }

  function send(message) {
    const data = { ...message, id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}` };
    channel?.postMessage(data);
    if (opener && !opener.closed) opener.postMessage(data, location.origin === 'null' ? '*' : location.origin);
  }
  const command = (cmd, extra = {}) => send({ type: 'deck-command', command: cmd, ...extra });

  function preview(frame, index, step) {
    const hash = `#${index + 1}.${step}`;
    if (frame.dataset.index === String(index)) {
      try { frame.contentWindow.location.hash = hash; return; } catch {}
    }
    const u = new URL('index.html', location.href);
    u.searchParams.set('lang', I18N.lang);
    u.searchParams.set('session', `${session}-preview-${frame.id}`);
    u.searchParams.set('city', params.get('city') || TALK.defaults.city);
    u.hash = hash;
    frame.src = u.href;
    frame.dataset.index = String(index);
  }

  const total = TALK.slides.reduce((s, x) => s + x.minutes, 0);
  const format = seconds => {
    const sign = seconds < 0 ? '−' : '';
    const v = Math.abs(Math.round(seconds));
    return sign + String(Math.floor(v / 60)).padStart(2, '0') + ':' + String(v % 60).padStart(2, '0');
  };

  function render() {
    const slide = TALK.slides[state.index];
    const next = TALK.slides[state.index + 1];
    $('#position').textContent = es
      ? `Diapositiva ${state.index + 1}/${TALK.slides.length} · paso ${state.step}/${slide.builds.length}`
      : `Slide ${state.index + 1}/${TALK.slides.length} · step ${state.step}/${slide.builds.length}`;
    preview($('#current-preview'), state.index, state.step);

    if (next) {
      $('#next-preview').parentElement.hidden = false;
      preview($('#next-preview'), state.index + 1, 0);
      $('#next-title').textContent = clean(next.title);
      $('#next-note').textContent = next.notes[0];
    } else {
      $('#next-preview').parentElement.hidden = true;
      $('#next-title').textContent = es ? 'Fin del workshop' : 'End of workshop';
      $('#next-note').textContent = es ? 'Espacio para preguntas, revisión de retos y cierre.' : 'Open Q&A, challenge showcase, and wrap-up.';
    }

    $('#script').innerHTML = slide.notes
      .map((note, i) => `<li class="${i === state.step ? 'active' : ''}" ${i === state.step ? 'aria-current="step"' : ''}><strong>${i === 0 ? (es ? 'Entrada' : 'Opening') : esc(slide.builds[i - 1] || (es ? 'Paso' : 'Step'))}</strong>${esc(note)}</li>`)
      .join('');

    const before = TALK.slides.slice(0, state.index).reduce((s, x) => s + x.minutes, 0) * planned / total;
    const duration = slide.minutes * planned / total;
    $('#plan').textContent = es
      ? `Plan: entrar en ${format(before * 60)} · dedicar ${format(duration * 60)} · cerrar en ${format((before + duration) * 60)}.`
      : `Plan: enter at ${format(before * 60)} · spend ${format(duration * 60)} · finish at ${format((before + duration) * 60)}.`;

    $('#schedule').innerHTML = TALK.slides
      .map((s, i) => `<li class="${i === state.index ? 'active' : ''}"><button data-goto="${i}">${String(i + 1).padStart(2, '0')} · ${esc(clean(s.title))} (${format(s.minutes * planned / total * 60)})</button></li>`)
      .join('');
    document.querySelectorAll('[data-goto]').forEach(b => {
      b.onclick = () => command('goto', { index: Number(b.dataset.goto) });
    });
    tick();
  }

  function tick() {
    const now = Date.now();
    $('#wall-clock').textContent = new Date(now).toLocaleTimeString(es ? 'es-CO' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const elapsed = state.startedAt ? ((state.pausedAt || now) - state.startedAt - state.pausedMs) / 1000 : 0;
    $('#elapsed').textContent = format(elapsed);
    $('#remaining').textContent = `Plan ${format(planned * 60 - elapsed)}`;
    $('.clock').classList.toggle('overrun', elapsed > planned * 60);
    $('#clock').textContent = !state.startedAt
      ? (es ? 'Iniciar reloj' : 'Start timer')
      : state.pausedAt
        ? (es ? 'Continuar reloj' : 'Resume timer')
        : (es ? 'Pausar reloj' : 'Pause timer');
  }

  function receive(data) {
    if (data?.type !== 'deck-state') return;
    connected = true;
    state = data.state;
    planned = data.plannedMinutes;
    $('#connection').textContent = es
      ? 'Conectado · controla con teclado/clicker en la presentación o desde aquí'
      : 'Connected · control from main deck keyboard/clicker or buttons below';
    render();
  }

  if (channel) channel.onmessage = e => receive(e.data);
  addEventListener('message', e => {
    if (e.source !== opener) return;
    if (location.origin !== 'null' && e.origin !== location.origin) return;
    receive(e.data);
  });

  $('#previous').onclick = () => command('previous');
  $('#next').onclick = () => command('next');
  $('#clock').onclick = () => command('clock');
  $('#reset').onclick = () => command('reset-clock');

  addEventListener('keydown', e => {
    if (/INPUT|TEXTAREA|SELECT|BUTTON/.test(e.target.tagName)) return;
    if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); command('next'); }
    if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); command('previous'); }
  });

  $('#sources').innerHTML = TALK.sources.map(s => `<li><a href="${esc(s.url)}" target="_blank" rel="noreferrer">${esc(s.title)}</a></li>`).join('');
  render();
  send({ type: 'presenter-ready' });
  setInterval(tick, 500);
  setTimeout(() => {
    if (!connected) {
      $('#connection').textContent = es
        ? 'Sin conexión directa: abre esta vista presionando P desde la presentación.'
        : 'Not connected yet: press P from the main slide deck to sync.';
    }
  }, 3000);
})();
