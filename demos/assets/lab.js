/* Shared helpers, finite state machine engine, and Chrome Built-in AI adapters for the interactive demos. */
(() => {
  const $ = (q, root = document) => root.querySelector(q);
  const $$ = (q, root = document) => [...root.querySelectorAll(q)];
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const id = document.body.dataset.demo;
  if (window.self !== window.top || new URLSearchParams(location.search).get('embed') === '1') {
    document.body.classList.add('is-embedded');
  }
  const topic = CONTENT_TOPICS.find(t => t.demos.some(d => d.id === id));
  const demo = topic?.demos.find(d => d.id === id);
  if (!demo) return;
  document.documentElement.style.setProperty('--accent', topic.color);
  document.title = demo.title + ' | ' + I18N.text('Web AI Lab');
  if ($('#title')) $('#title').textContent = demo.title;
  if ($('#hook')) $('#hook').textContent = demo.hook;
  if ($('#topic')) $('#topic').textContent = topic.title;
  if ($('#lesson')) $('#lesson').textContent = demo.lesson;
  if ($('#sources')) $('#sources').innerHTML = topic.sources.map((u, i) => `<li><a href="${esc(u)}" target="_blank" rel="noreferrer">Reference ${i + 1}: ${esc(new URL(u).hostname + new URL(u).pathname)}</a></li>`).join('');
  const introNode = $('.intro');
  if (introNode && !$('#demo-guide') && id !== 'reading-route') {
    const nav = document.createElement('nav');
    nav.id = 'demo-guide';
    nav.className = 'demo-switcher';
    nav.setAttribute('aria-label', 'Module demos');
    const siblings = topic.demos.map((d, i) => `<a class="sibling-pill ${d.id === id ? 'active' : ''}" href="${I18N.url(d.id + '.html')}" ${d.id === id ? 'aria-current="page"' : ''}>${i + 1}. ${esc(d.title)}</a>`).join('');
    nav.innerHTML = `<div class="sibling-links">${siblings}</div><p class="demo-step-hint"><strong>${I18N.text('Try:')}</strong> ${esc(demo.action)}</p>`;
    introNode.append(nav);
  }
  const app = $('#app');
  const status = (message, error = false) => {
    const node = $('#status');
    if (!node) return;
    node.textContent = I18N.text(message);
    node.classList.toggle('error', error);
  };
  const panel = (title, body, extra = '') => `<section class="panel ${extra}"><h2>${title}</h2>${body}</section>`;
  const output = (title = 'Output') => panel(title, '<span class="result-label" id="mode-label">Ready</span><div id="result" class="output" aria-live="polite">Run an action to inspect the output.</div>');
  const result = (value, label) => {
    if ($('#mode-label')) $('#mode-label').textContent = label;
    $('#result').textContent = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  };

  const machines = new Map();
  function bindMachine(element, machine, busyStates) {
    if (!element || !machine) return () => {};
    const sync = snap => {
      element.dataset.machine = snap.id;
      element.dataset.state = snap.state;
      const busy = busyStates ? busyStates.includes(snap.state) : Boolean(machine.isBusy(snap.state));
      element.setAttribute('aria-busy', busy ? 'true' : 'false');
    };
    sync(machine.getSnapshot());
    return machine.subscribe(sync);
  }

  function createMachine({ id: machineId, initial, context = {}, states = {}, onTransition, host = null, busyStates = null }) {
    if (!machineId || typeof machineId !== 'string') throw new Error('Machine id is required.');
    if (!states[initial]) throw new Error(`Unknown initial state "${initial}" for machine "${machineId}".`);
    let current = initial;
    let ctx = { ...context };
    const listeners = new Set();
    const hostSyncs = new Set();
    const resolveRule = (rule, payload, strict = true) => {
      if (!rule) return null;
      const list = Array.isArray(rule) ? rule : [rule];
      for (const item of list) {
        const candidate = typeof item === 'string' ? { target: item } : item;
        if (!candidate.guard) return candidate;
        try {
          if (candidate.guard({ ...ctx }, payload, { state: current })) return candidate;
        } catch (err) {
          if (strict || !(err instanceof TypeError)) throw err;
        }
      }
      return null;
    };
    const isBusy = stateName => busyStates ? busyStates.includes(stateName) : Boolean(states[stateName]?.busy);
    const can = function (event, payload) {
      return Boolean(resolveRule(states[current]?.on?.[event], payload, arguments.length > 1));
    };
    const getAllowedEvents = () => Object.keys(states[current]?.on || {}).filter(ev => can(ev));
    const getSnapshot = () => ({ id: machineId, state: current, context: { ...ctx }, allowedEvents: getAllowedEvents() });
    const machine = {
      id: machineId,
      isBusy,
      getState: () => current,
      getContext: () => ({ ...ctx }),
      can,
      getSnapshot,
      subscribe(fn) {
        listeners.add(fn);
        return () => listeners.delete(fn);
      },
      send(event, payload) {
        const matched = resolveRule(states[current]?.on?.[event], payload);
        if (!matched) return { ...getSnapshot(), changed: false };
        const next = matched.target ?? current;
        if (!states[next]) throw new Error(`Unknown target state "${next}" in machine "${machineId}".`);
        const prev = current;
        const meta = { event, from: prev, to: next, payload };
        if (typeof matched.assign === 'function') {
          ctx = { ...ctx, ...matched.assign({ ...ctx }, payload, meta) };
        } else if (matched.assign && typeof matched.assign === 'object') {
          ctx = { ...ctx, ...matched.assign };
        }
        if (next !== prev) states[prev]?.exit?.({ ...ctx }, payload, meta);
        current = next;
        const snap = getSnapshot();
        for (const syncHost of hostSyncs) syncHost(snap);
        if (next !== prev) states[current]?.entry?.({ ...ctx }, payload, meta);
        matched.effect?.({ ...ctx }, payload, meta);
        onTransition?.(snap, meta);
        for (const fn of [...listeners]) fn(snap, meta);
        return { ...snap, changed: true };
      }
    };
    machines.set(machineId, machine);
    if (host) {
      const sync = snap => {
        host.dataset.machine = snap.id;
        host.dataset.state = snap.state;
        const busy = busyStates ? busyStates.includes(snap.state) : isBusy(snap.state);
        host.setAttribute('aria-busy', busy ? 'true' : 'false');
      };
      hostSyncs.add(sync);
      sync(machine.getSnapshot());
    }
    return machine;
  }

  const inspectMachines = () => Object.fromEntries([...machines.entries()].map(([k, m]) => [k, m.getSnapshot()]));

  let runSeq = 0;
  const run = (selector, callback, options = {}) => {
    const el = $(selector);
    if (!el) return null;
    const rawKey = selector.replace(/[^a-zA-Z0-9_-]/g, '') || String(++runSeq);
    const machineId = machines.has(`run:${rawKey}`) ? `run:${rawKey}:${++runSeq}` : `run:${rawKey}`;
    const runner = createMachine({
      id: machineId,
      initial: 'idle',
      host: el,
      context: { selector, runs: 0, lastError: null },
      states: {
        idle: { on: { RUN: { target: 'running', assign: ctx => ({ runs: ctx.runs + 1, lastError: null }) } } },
        running: {
          busy: true,
          on: {
            SUCCEED: 'succeeded',
            FAIL: { target: 'error', assign: (_, err) => ({ lastError: err }) }
          }
        },
        succeeded: {
          on: {
            RUN: { target: 'running', assign: ctx => ({ runs: ctx.runs + 1, lastError: null }) },
            RESET: 'idle'
          }
        },
        error: {
          on: {
            RUN: { target: 'running', assign: ctx => ({ runs: ctx.runs + 1, lastError: null }) },
            RESET: 'idle'
          }
        }
      }
    });
    el.addEventListener('click', async event => {
      if (!runner.can('RUN')) return;
      const btn = event.currentTarget;
      runner.send('RUN');
      btn.disabled = true;
      try {
        await callback(event);
        runner.send('SUCCEED');
      } catch (error) {
        const message = `${error.name || 'Error'}: ${I18N.text(error.message)}`;
        runner.send('FAIL', message);
        status(message, true);
      } finally {
        btn.disabled = Boolean(options.disabledWhen?.());
      }
    });
    return runner;
  };

  const nativeOptions = {
    LanguageModel: { expectedInputs: [{ type: 'text', languages: ['en'] }], expectedOutputs: [{ type: 'text', languages: ['en'] }] },
    Summarizer: { type: 'key-points', format: 'plain-text', length: 'short', expectedInputLanguages: ['en'], outputLanguage: 'en' },
    Proofreader: { expectedInputLanguages: ['en'] }
  };

  const sessionPool = createMachine({
    id: 'ai-session-pool',
    initial: 'idle',
    context: { activeCount: 0, createdTotal: 0, destroyedTotal: 0, lastApi: null, downloadPercent: null, lastError: null },
    states: {
      idle: {
        on: {
          CREATE_START: { target: 'creating', assign: (_, apiName) => ({ lastApi: apiName, downloadPercent: null, lastError: null }) }
        }
      },
      creating: {
        busy: true,
        on: {
          CREATE_START: { target: 'creating', assign: (_, apiName) => ({ lastApi: apiName }) },
          DOWNLOAD_PROGRESS: { target: 'creating', assign: (_, pct) => ({ downloadPercent: pct }) },
          SESSION_OPEN: { target: 'active', assign: ctx => ({ activeCount: ctx.activeCount + 1, createdTotal: ctx.createdTotal + 1, downloadPercent: 100 }) },
          CREATE_ERROR: [
            { target: 'active', guard: ctx => ctx.activeCount > 0, assign: (_, err) => ({ lastError: err }) },
            { target: 'error', assign: (_, err) => ({ lastError: err }) }
          ]
        }
      },
      active: {
        on: {
          CREATE_START: { target: 'creating', assign: (_, apiName) => ({ lastApi: apiName, downloadPercent: null, lastError: null }) },
          SESSION_RELEASE: [
            { target: 'active', guard: ctx => ctx.activeCount > 1, assign: ctx => ({ activeCount: ctx.activeCount - 1, destroyedTotal: ctx.destroyedTotal + 1 }) },
            { target: 'idle', assign: ctx => ({ activeCount: 0, destroyedTotal: ctx.destroyedTotal + 1 }) }
          ],
          PAGEHIDE_CLEANUP: {
            target: 'idle',
            assign: (ctx, releasedCount) => ({ activeCount: 0, destroyedTotal: ctx.destroyedTotal + releasedCount })
          }
        }
      },
      error: {
        on: {
          CREATE_START: { target: 'creating', assign: (_, apiName) => ({ lastApi: apiName, downloadPercent: null, lastError: null }) },
          PAGEHIDE_CLEANUP: 'idle'
        }
      }
    }
  });

  async function available(name, options = {}) {
    const api = globalThis[name];
    if (!api || typeof api.availability !== 'function') return 'not exposed';
    return api.availability({ ...nativeOptions[name], ...options });
  }

  async function create(name, options = {}, signal) {
    sessionPool.send('CREATE_START', name);
    try {
      const api = globalThis[name];
      if (!api || typeof api.create !== 'function') throw new Error(`${name} is not exposed in this browser.`);
      const opts = { ...nativeOptions[name], ...options };
      const state = await api.availability(opts);
      if (state === 'unavailable') throw new Error(`${name} reports unavailable for these options.`);
      status(`${name}: ${state}. Creating session…`);
      const session = await api.create({
        ...opts,
        ...(signal ? { signal } : {}),
        monitor(m) {
          m.addEventListener('downloadprogress', e => {
            const pct = Math.round(e.loaded * 100);
            sessionPool.send('DOWNLOAD_PROGRESS', pct);
            status(`${name} download: ${pct}%.`);
          });
        }
      });
      sessionPool.send('SESSION_OPEN');
      status(`${name} session active.`);
      return session;
    } catch (error) {
      sessionPool.send('CREATE_ERROR', error.message);
      throw error;
    }
  }

  const sessions = new Set();
  async function withSession(name, options, callback, signal) {
    const session = await create(name, options, signal);
    sessions.add(session);
    try {
      return await callback(session);
    } finally {
      session.destroy?.();
      if (sessions.delete(session)) sessionPool.send('SESSION_RELEASE');
    }
  }

  addEventListener('pagehide', () => {
    let released = 0;
    for (const s of sessions) {
      s.destroy?.();
      released++;
    }
    sessions.clear();
    if (released) sessionPool.send('PAGEHIDE_CLEANUP', released);
  });

  const prompt = (text, options = {}) => withSession('LanguageModel', {}, s => s.prompt(text, options));
  const words = s => new Set(s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').match(/[a-z0-9]+/g) || []);
  function overlap(a, b) {
    const x = words(a), y = words(b);
    return x.size && y.size ? [...x].filter(w => y.has(w)).length / Math.sqrt(x.size * y.size) : 0;
  }
  function cosine(a, b) {
    if (!a?.length || a.length !== b?.length) throw new Error('Embedding dimensions differ.');
    let d = 0, x = 0, y = 0;
    for (let i = 0; i < a.length; i++) {
      d += a[i] * b[i];
      x += a[i] * a[i];
      y += b[i] * b[i];
    }
    return x && y ? d / Math.sqrt(x * y) : 0;
  }
  const download = (name, data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  window.Lab = {
    $, $$, esc, id, topic, demo, app, status, panel, output, result, run,
    createMachine, bindMachine, machines, inspectMachines,
    available, create, withSession, prompt, words, overlap, cosine, download
  };
})();
