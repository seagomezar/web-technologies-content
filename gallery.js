(() => {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
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

  function createMachine({ id, initial, context = {}, states = {}, onTransition, host = null, busyStates = null }) {
    if (!id || typeof id !== 'string') throw new Error('Machine id is required.');
    if (!states[initial]) throw new Error(`Unknown initial state "${initial}" for machine "${id}".`);
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
    const getSnapshot = () => ({ id, state: current, context: { ...ctx }, allowedEvents: getAllowedEvents() });
    const machine = {
      id,
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
        if (!states[next]) throw new Error(`Unknown target state "${next}" in machine "${id}".`);
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
    machines.set(id, machine);
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
  window.Lab = Object.assign(window.Lab || {}, { createMachine, bindMachine, machines, inspectMachines });

  const filterInput = document.querySelector('#filter');
  const topicsHost = document.querySelector('#topics');
  let announceTimer = null;
  let lastAnnouncement = '';

  const settleRules = [
    { target: 'all', guard: ctx => !ctx.query },
    { target: 'empty', guard: ctx => ctx.matchCount === 0 },
    { target: 'filtered' }
  ];

  const assignQuery = (_, payload) => ({
    query: payload.query,
    matchCount: payload.matchCount,
    totalCount: CONTENT_TOPICS.length
  });

  const filterMachine = createMachine({
    id: 'gallery-filter',
    initial: 'all',
    host: topicsHost,
    context: { query: '', matchCount: CONTENT_TOPICS.length, totalCount: CONTENT_TOPICS.length },
    states: {
      all: {
        on: {
          INPUT: { target: 'debouncing', assign: assignQuery },
          SYNC: settleRules.map(r => ({ ...r, assign: assignQuery }))
        }
      },
      debouncing: {
        busy: true,
        on: {
          INPUT: { target: 'debouncing', assign: assignQuery },
          SETTLE: settleRules
        }
      },
      filtered: {
        on: {
          INPUT: { target: 'debouncing', assign: assignQuery },
          SYNC: settleRules.map(r => ({ ...r, assign: assignQuery }))
        }
      },
      empty: {
        on: {
          INPUT: { target: 'debouncing', assign: assignQuery },
          SYNC: settleRules.map(r => ({ ...r, assign: assignQuery }))
        }
      }
    }
  });

  function renderCards(topics) {
    topicsHost.innerHTML = topics.map(t => `<article class="topic-card" id="${t.id}" style="border-top:6px solid ${t.color}"><span class="eyebrow">Module ${t.rank.toString().padStart(2, '0')}</span><h2>${t.title}</h2><p><strong>${t.subtitle}</strong></p><span class="pill" style="background:${t.color}">${t.stage}</span><p>${t.angle}</p><h3>Interactive Demos</h3><ol>${t.demos.map(d => `<li class="demo-entry"><a href="${I18N.url('demos/' + d.id + '.html')}"><strong>${d.title}</strong></a><p>${d.hook}</p><p class="small">${d.action}</p></li>`).join('')}</ol><details><summary>Implementation notes &amp; docs</summary><ol>${t.outline.map(s => `<li>${s}</li>`).join('')}</ol><ul>${t.sources.map((u, i) => `<li><a href="${esc(u)}" target="_blank" rel="noreferrer">Reference ${i + 1}: ${esc(new URL(u).hostname + new URL(u).pathname)}</a></li>`).join('')}</ul></details></article>`).join('') || '<p>No matching module or demo.</p>';
  }

  function render(announce = false) {
    const q = filterInput.value.toLowerCase();
    const topics = CONTENT_TOPICS.filter(t => JSON.stringify(t).toLowerCase().includes(q));
    renderCards(topics);
    const payload = { query: q.trim(), matchCount: topics.length };
    if (announce) {
      filterMachine.send('INPUT', payload);
      clearTimeout(announceTimer);
      announceTimer = setTimeout(() => {
        filterMachine.send('SETTLE', payload);
        const live = document.querySelector('#filter-status');
        if (!live) return;
        let msg = I18N.lang === 'es' ? `${topics.length} módulo(s) mostrado(s).` : `${topics.length} module(s) shown.`;
        if (msg === lastAnnouncement) msg += '\u00A0';
        lastAnnouncement = msg;
        live.textContent = msg;
      }, 250);
    } else {
      filterMachine.send('SYNC', payload);
    }
  }

  filterInput.addEventListener('input', () => render(true));
  addEventListener('pagehide', () => clearTimeout(announceTimer));
  render(false);
})();
