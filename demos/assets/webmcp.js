(() => {
  const { $, $$, esc, id, app, status, panel, output, result, run } = Lab;
  const definitions = [];
  const getModelContext = () => {
    const params = new URLSearchParams(location.search);
    if (params.get('webmcp') === '0' || params.get('forceModal') === '1') return null;
    if ('modelContext' in document && document.modelContext) return document.modelContext;
    if ('modelContext' in navigator && navigator.modelContext) return navigator.modelContext;
    return null;
  };
  const hasWebMCP = () => {
    const params = new URLSearchParams(location.search);
    if (params.get('webmcp') === '0' || params.get('forceModal') === '1') return false;
    if (params.get('webmcp') === '1') return true;
    const mc = getModelContext();
    return Boolean(mc && typeof mc.registerTool === 'function');
  };
  const card = (name, description, inputSchema, execute, annotations = {}) => ({
    name,
    description: I18N.text(description),
    inputSchema,
    annotations: {
      readOnlyHint: false,
      untrustedContentHint: false,
      consequentialHint: false,
      ...annotations
    },
    execute
  });
  async function register(tool) {
    definitions.push(tool);
    const mc = getModelContext();
    if (mc?.registerTool) {
      try {
        await mc.registerTool(tool);
        status('Native WebMCP tool registered on document.modelContext.');
      } catch (e) {
        status(`WebMCP registration error: ${e.message}`, true);
      }
    } else {
      status('document.modelContext not detected.');
    }
  }
  const schema = properties => ({
    type: 'object',
    properties,
    required: Object.keys(properties)
  });

  if (id === 'reading-route') {
    const es = I18N.lang === 'es';
    const copy = es ? {
      pageTitle: 'Lista de lectura · Blog posts por leer',
      pageHook: 'Agrega artículos desde la interfaz o pídele al agente que actualice tu lista en vivo mediante WebMCP (add_to_route).',
      pageEyebrow: 'WebMCP · Estado compartido entre UI y agente',
      bannerLabel: 'Pídele al agente:',
      bannerPrompt: '«Quiero que agregues a mi lista de blog posts por leer el artículo sobre "modelos pequeños"»',
      apiActivePill: '● WebMCP activo · add_to_route',
      simModePill: '⚙ Modo simulación · Activar WebMCP',
      catalogTitle: 'Artículos del blog',
      filterPlaceholder: 'Filtrar por título o etiqueta (ej. modelos pequeños)...',
      filterAria: 'Filtrar artículos del blog',
      featuredBadge: 'Destacado',
      addBtn: '+ Agregar a por leer',
      addedBtn: '✓ En tu lista',
      removeBtn: 'Quitar',
      noMatch: 'No hay artículos que coincidan con el filtro.',
      routeTitle: 'Lista de lectura · Blog posts por leer',
      badgeReady: 'Sincronizado · add_to_route',
      badgeUpdatedTool: '✓ Añadido vía add_to_route',
      badgeUpdatedUi: '✓ Lista actualizada',
      countLabel: 'por leer',
      minutesLabel: 'min en total',
      emptyTitle: 'Tu lista de blog posts por leer está vacía',
      emptySub: 'Usa el botón «+ Agregar a por leer» o pídele al agente que agregue el artículo sobre «modelos pequeños».',
      newTagTool: 'Vía add_to_route',
      newTagUi: 'Recién agregado',
      toastAdded: title => `✓ «${title}» se agregó a tu lista de blog posts por leer.`,
      toastDuplicate: title => `ℹ️ «${title}» ya está en tu lista por leer.`,
      toastRemoved: title => `Se quitó «${title}» de tu lista por leer.`,
      toastError: msg => `⚠️ ${msg}`,
      modalBadge: 'Configuración del entorno · WebMCP',
      modalTitle: 'Activa WebMCP para usar este demo',
      modalLead: 'No se detectó la API de WebMCP (document.modelContext / navigator.modelContext) en este navegador. Sigue estos pasos para habilitarla:',
      step1Title: '1. Abrir',
      step1Sub: 'Copia la dirección y ábrela en una pestaña nueva de Chrome:',
      copyFlagBtn: 'Copiar URL de la flag',
      copiedFlagBtn: '✓ ¡Copiado! (chrome://flags)',
      step2Title: '2. Buscar y habilitar la flag requerida por el demo',
      step2Sub: 'Busca y activa la flag:',
      step3Title: '3. Reiniciar el navegador y recargar el demo',
      step3Sub: 'Pulsa «Relaunch» en Chrome y vuelve a cargar esta página.',
      closeModalBtn: 'Ver demo en modo simulación / Cerrar'
    } : {
      pageTitle: 'Reading List · Blog posts to read',
      pageHook: 'Add articles from the UI or ask the agent to update your reading list live via WebMCP (add_to_route).',
      pageEyebrow: 'WebMCP · Shared UI & Agent State',
      bannerLabel: 'Ask the agent:',
      bannerPrompt: '“I want you to add the article about \'small models\' to my blog posts reading list”',
      apiActivePill: '● WebMCP active · add_to_route',
      simModePill: '⚙ Simulation mode · Enable WebMCP',
      catalogTitle: 'Blog Articles',
      filterPlaceholder: 'Filter by title or tag (e.g. small models)...',
      filterAria: 'Filter blog articles',
      featuredBadge: 'Featured',
      addBtn: '+ Add to reading list',
      addedBtn: '✓ In your list',
      removeBtn: 'Remove',
      noMatch: 'No matching articles found.',
      routeTitle: 'Reading List · Blog posts to read',
      badgeReady: 'Synced · add_to_route',
      badgeUpdatedTool: '✓ Added via add_to_route',
      badgeUpdatedUi: '✓ List updated',
      countLabel: 'to read',
      minutesLabel: 'total min',
      emptyTitle: 'Your blog posts reading list is empty',
      emptySub: 'Click “+ Add to reading list” or ask the agent to add the article about “small models”.',
      newTagTool: 'Via add_to_route',
      newTagUi: 'Just added',
      toastAdded: title => `✓ “${title}” was added to your reading list.`,
      toastDuplicate: title => `ℹ️ “${title}” is already in your reading list.`,
      toastRemoved: title => `Removed “${title}” from your reading list.`,
      toastError: msg => `⚠️ ${msg}`,
      modalBadge: 'Environment setup · WebMCP',
      modalTitle: 'Enable WebMCP to use this demo',
      modalLead: 'The WebMCP API (document.modelContext / navigator.modelContext) was not detected in this browser. Follow these steps to enable it:',
      step1Title: '1. Open',
      step1Sub: 'Copy the URL and open it in a new Chrome tab:',
      copyFlagBtn: 'Copy flag URL',
      copiedFlagBtn: '✓ Copied! (chrome://flags)',
      step2Title: '2. Search for and enable the flag required by the demo',
      step2Sub: 'Search for and enable:',
      step3Title: '3. Relaunch the browser and reload the demo',
      step3Sub: 'Click “Relaunch” in Chrome and reload this page.',
      closeModalBtn: 'View demo in simulation mode / Close'
    };

    if ($('#title')) $('#title').textContent = copy.pageTitle;
    if ($('#hook')) $('#hook').textContent = copy.pageHook;
    if ($('#topic')) $('#topic').textContent = copy.pageEyebrow;
    document.title = `${copy.pageTitle} | ${es ? 'Laboratorio de IA en Chrome y WebMCP' : 'Web AI Lab'}`;

    const articles = [
      {
        id: 'models',
        title: 'Small models, thoughtful design',
        displayTitle: es ? 'Modelos pequeños, diseño cuidadoso' : 'Small models, thoughtful design',
        tags: 'browser RAG WebGPU',
        displayTags: es ? 'navegador · RAG · WebGPU' : 'browser · RAG · WebGPU',
        minutes: 9,
        featured: true
      },
      {
        id: 'browserdj',
        title: 'Inside BrowserDJ',
        displayTitle: es ? 'Dentro de BrowserDJ' : 'Inside BrowserDJ',
        tags: 'music procedural edge AI',
        displayTags: es ? 'música procedural · IA local' : 'procedural music · edge AI',
        minutes: 12
      },
      {
        id: 'patterns',
        title: 'From prompts to patterns',
        displayTitle: es ? 'De prompts a patrones' : 'From prompts to patterns',
        tags: 'architecture context engineering',
        displayTags: es ? 'arquitectura · ingeniería de contexto' : 'architecture · context engineering',
        minutes: 7
      },
      {
        id: 'ownership',
        title: 'Ownership beyond the code',
        displayTitle: es ? 'Responsabilidad más allá del código' : 'Ownership beyond the code',
        tags: 'engineering leadership',
        displayTags: es ? 'liderazgo de ingeniería' : 'engineering leadership',
        minutes: 8
      }
    ];

    const trail = [];
    let lastAddedId = null;
    let lastAddedSource = null;
    let toastTimer = null;
    const webmcpActive = hasWebMCP();

    const geminiSvg = `<svg class="guide-gemini-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><defs><linearGradient id="rr-gemini-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1b72e8"/><stop offset="52%" stop-color="#9b72cb"/><stop offset="100%" stop-color="#d96570"/></linearGradient></defs><path fill="url(#rr-gemini-grad)" d="M12 1.8c.5 5.4 4.8 9.7 10.2 10.2-5.4.5-9.7 4.8-10.2 10.2-.5-5.4-4.8-9.7-10.2-10.2C7.2 11.5 11.5 7.2 12 1.8Z"/></svg>`;

    app.classList.add('reading-route-app');
    app.innerHTML = `
      <div class="reading-guide-banner full" id="agent-guide-banner">
        <div class="guide-prompt-text">
          ${geminiSvg}
          <span><strong>${esc(copy.bannerLabel)}</strong> <em class="guide-quote">${esc(copy.bannerPrompt)}</em></span>
        </div>
        <button type="button" id="webmcp-env-pill" class="guide-env-pill ${webmcpActive ? 'is-active' : 'is-sim'}">
          ${esc(webmcpActive ? copy.apiActivePill : copy.simModePill)}
        </button>
      </div>
      <section class="panel reading-panel catalog-panel">
        <div class="panel-head-row">
          <h2>${esc(copy.catalogTitle)}</h2>
          <input id="filter" class="compact-filter" type="search" placeholder="${esc(copy.filterPlaceholder)}" aria-label="${esc(copy.filterAria)}">
        </div>
        <div id="catalog" class="catalog-grid"></div>
      </section>
      <section class="panel reading-panel route-panel">
        <div class="panel-head-row">
          <h2>${esc(copy.routeTitle)}</h2>
          <span id="route-status-badge" class="route-status-badge">${esc(copy.badgeReady)}</span>
        </div>
        <div class="reading-metrics-bar">
          <div class="reading-metric-pill"><span id="count" class="metric-num">0</span> <span>${esc(copy.countLabel)}</span></div>
          <div class="reading-metric-pill"><span id="minutes" class="metric-num">0</span> <span>${esc(copy.minutesLabel)}</span></div>
        </div>
        <div id="trail" class="reading-trail-list" aria-live="polite"></div>
        <div id="route-toast" class="route-toast" role="status" aria-live="polite" hidden></div>
      </section>
    `;

    // Build Onboarding Modal for when WebMCP API/Flag is not active
    let modal = $('#webmcp-modal');
    if (!modal) {
      modal = document.createElement('dialog');
      modal.id = 'webmcp-modal';
      modal.className = 'onboarding-modal';
      modal.setAttribute('aria-labelledby', 'onboarding-modal-title');
      modal.innerHTML = `
        <div class="onboarding-modal-card">
          <span class="onboarding-eyebrow">${esc(copy.modalBadge)}</span>
          <h2 id="onboarding-modal-title">${esc(copy.modalTitle)}</h2>
          <p class="onboarding-lead">${esc(copy.modalLead)}</p>
          <ol class="onboarding-steps">
            <li>
              <div class="step-body">
                <strong>${esc(copy.step1Title)} <code>chrome://flags</code></strong>
                <span>${esc(copy.step1Sub)}</span>
              </div>
              <button type="button" id="copy-flag-btn" class="copy-flag-btn" data-flag-url="chrome://flags">
                ${esc(copy.copyFlagBtn)}
              </button>
            </li>
            <li>
              <div class="step-body">
                <strong>${esc(copy.step2Title)}</strong>
                <span>${esc(copy.step2Sub)} (<code>Developer Trial / Experimental Web Platform Features / WebMCP</code>)</span>
              </div>
            </li>
            <li>
              <div class="step-body">
                <strong>${esc(copy.step3Title)}</strong>
                <span>${esc(copy.step3Sub)}</span>
              </div>
            </li>
          </ol>
          <div class="onboarding-actions">
            <button type="button" id="close-onboarding-btn" class="secondary onboarding-close-btn">
              ${esc(copy.closeModalBtn)}
            </button>
          </div>
        </div>
      `;
      document.body.append(modal);
    }

    const openModal = () => {
      if (!modal.open) {
        if (typeof modal.showModal === 'function') {
          try { modal.showModal(); } catch { modal.setAttribute('open', ''); }
        } else {
          modal.setAttribute('open', '');
        }
      }
    };
    const closeModal = () => {
      if (typeof modal.close === 'function' && modal.open) modal.close();
      else modal.removeAttribute('open');
    };

    const copyTextToClipboard = async textToCopy => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(textToCopy);
          return true;
        }
      } catch {}
      const ta = document.createElement('textarea');
      ta.value = textToCopy;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.append(ta);
      ta.select();
      try { document.execCommand('copy'); } catch {}
      ta.remove();
      return true;
    };

    $('#copy-flag-btn').addEventListener('click', async e => {
      const btn = e.currentTarget;
      const urlToCopy = btn.dataset.flagUrl || 'chrome://flags';
      btn.textContent = copy.copiedFlagBtn;
      btn.classList.add('is-copied');
      btn.dataset.copied = 'true';
      await copyTextToClipboard(urlToCopy);
      setTimeout(() => {
        btn.textContent = copy.copyFlagBtn;
        btn.classList.remove('is-copied');
      }, 2400);
    });

    $('#close-onboarding-btn').addEventListener('click', closeModal);
    modal.addEventListener('click', e => {
      if (e.target === modal) closeModal();
    });
    $('#webmcp-env-pill').addEventListener('click', () => {
      if (!webmcpActive) openModal();
    });

    if (!webmcpActive) {
      openModal();
    }

    function showToast(message, tone = 'ok') {
      const toast = $('#route-toast');
      if (!toast) return;
      toast.textContent = message;
      toast.className = `route-toast is-visible tone-${tone}`;
      toast.hidden = false;
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.classList.remove('is-visible');
        toast.hidden = true;
      }, 3200);
    }

    function updateBadge(textLabel, highlight = false) {
      const badge = $('#route-status-badge');
      if (!badge) return;
      badge.textContent = textLabel;
      badge.classList.toggle('is-highlighted', highlight);
    }

    function render() {
      const q = ($('#filter')?.value || '').toLowerCase().trim();
      const filtered = articles.filter(a =>
        `${a.title} ${a.displayTitle} ${a.tags} ${a.displayTags}`.toLowerCase().includes(q)
      );
      $('#catalog').innerHTML = filtered.map(a => {
        const inList = trail.includes(a.id);
        return `
          <article class="item catalog-card ${inList ? 'is-in-route' : ''} ${a.featured ? 'is-featured' : ''}">
            <div class="catalog-card-top">
              <h3>${esc(a.displayTitle)}</h3>
              ${a.featured ? `<span class="featured-pill">${esc(copy.featuredBadge)}</span>` : ''}
            </div>
            <p class="small catalog-meta">${esc(a.displayTags)} · ${a.minutes} min</p>
            <button type="button" class="catalog-add-btn ${inList ? 'secondary is-added' : ''}" data-add="${a.id}" ${inList ? 'disabled' : ''}>
              ${esc(inList ? copy.addedBtn : copy.addBtn)}
            </button>
          </article>
        `;
      }).join('') || `<p class="small">${esc(copy.noMatch)}</p>`;

      if (trail.length === 0) {
        $('#trail').innerHTML = `
          <div class="reading-empty-state">
            <strong>${esc(copy.emptyTitle)}</strong>
            <p>${esc(copy.emptySub)}</p>
          </div>
        `;
      } else {
        $('#trail').innerHTML = trail.map((key, i) => {
          const a = articles.find(item => item.id === key);
          const isNew = key === lastAddedId;
          const tagLabel = lastAddedSource === 'ui' ? copy.newTagUi : copy.newTagTool;
          return `
            <div class="item row reading-route-item ${isNew ? 'is-just-added' : ''}" data-route-item="${esc(key)}">
              <div class="route-item-info">
                <span class="route-item-index">${i + 1}</span>
                <div>
                  <strong class="route-item-title">${esc(a.displayTitle)}</strong>
                  <span class="route-item-meta">${a.minutes} min</span>
                </div>
                ${isNew ? `<span class="route-new-badge">${esc(tagLabel)}</span>` : ''}
              </div>
              <button type="button" class="secondary route-remove-btn" data-remove="${esc(key)}">${esc(copy.removeBtn)}</button>
            </div>
          `;
        }).join('');
      }

      $('#count').textContent = String(trail.length);
      $('#minutes').textContent = String(trail.reduce((n, key) => n + articles.find(a => a.id === key).minutes, 0));

      $$('[data-add]').forEach(b => {
        b.onclick = () => add({ articleId: b.dataset.add }, 'ui');
      });
      $$('[data-remove]').forEach(b => {
        b.onclick = () => {
          const removedId = b.dataset.remove;
          const removedArticle = articles.find(a => a.id === removedId);
          const idx = trail.indexOf(removedId);
          if (idx !== -1) trail.splice(idx, 1);
          if (lastAddedId === removedId) lastAddedId = null;
          render();
          updateBadge(copy.badgeReady, false);
          if (removedArticle) showToast(copy.toastRemoved(removedArticle.displayTitle), 'info');
        };
      });
    }

    function add(args, source = 'tool') {
      if (!args || typeof args.articleId !== 'string') {
        const err = { error: 'articleId must be a string.', code: 'INVALID_ARGUMENT', retryable: true };
        showToast(copy.toastError(err.error), 'warn');
        return err;
      }
      const rawId = args.articleId.trim().toLowerCase();
      const a = articles.find(item =>
        item.id === rawId ||
        item.title.toLowerCase() === rawId ||
        item.displayTitle.toLowerCase() === rawId ||
        (rawId.includes('modelo') && item.id === 'models') ||
        (rawId.includes('small model') && item.id === 'models') ||
        (rawId.includes('browserdj') && item.id === 'browserdj') ||
        (rawId.includes('patron') && item.id === 'patterns') ||
        (rawId.includes('pattern') && item.id === 'patterns') ||
        (rawId.includes('ownership') && item.id === 'ownership') ||
        (rawId.includes('responsabilidad') && item.id === 'ownership')
      );
      if (!a) {
        const err = { error: 'Unknown articleId. Valid values: models, browserdj, patterns, ownership.', code: 'UNKNOWN_ARTICLE', retryable: true };
        showToast(copy.toastError(err.error), 'warn');
        return err;
      }
      if (trail.includes(a.id)) {
        showToast(copy.toastDuplicate(a.displayTitle), 'info');
        return { status: 'already-added', article: a.title };
      }
      trail.push(a.id);
      lastAddedId = a.id;
      lastAddedSource = source;
      render();
      updateBadge(source === 'ui' ? copy.badgeUpdatedUi : copy.badgeUpdatedTool, true);
      showToast(copy.toastAdded(a.displayTitle), 'ok');
      return { status: 'added', article: a.title, route: [...trail] };
    }

    $('#filter').oninput = render;
    window.addToRoute = (args, source = 'tool') => add(args, source);
    render();
    register(
      card(
        'add_to_route',
        'Add an article to the reading route (lista de blog posts por leer). Articles: "models" (Small models, thoughtful design / Modelos pequeños, diseño cuidadoso), "browserdj" (Inside BrowserDJ / Dentro de BrowserDJ), "patterns" (From prompts to patterns / De prompts a patrones), "ownership" (Ownership beyond the code / Responsabilidad más allá del código).',
        {
          type: 'object',
          properties: {
            articleId: {
              type: 'string',
              description: 'Article ID: "models" (modelos pequeños / small models), "browserdj", "patterns", or "ownership".'
            }
          }
        },
        args => add(args, 'tool')
      )
    );
  }

  if (id === 'consent-cart') {
    let pending = null, order = 0, finishReview = null;
    app.innerHTML = panel('1. Stage Tool Request', '<p class="small">Tool: <code>request_demo_ticket_confirmation</code> (<code>consequentialHint: true</code>)</p><label for="qty">Quantity (1–4)</label><input id="qty" type="number" min="1" max="4" value="2"><button id="stage">Stage request</button>') + panel('2. User Confirmation Gate', '<div id="pending" class="output">No pending request.</div><div class="actions"><button id="confirm" disabled>Confirm</button><button id="reject" class="secondary" disabled>Reject</button></div><pre id="ledger" aria-live="polite">No confirmed requests.</pre>');
    function prepare({ quantity }) { if (!Number.isInteger(quantity) || quantity < 1 || quantity > 4) return { error: 'quantity must be an integer between 1 and 4.', code: 'INVALID_QUANTITY', retryable: true }; if (pending) return { error: 'Resolve the pending request first.', code: 'REVIEW_PENDING', retryable: true }; pending = { quantity }; $('#pending').textContent = `Pending confirmation: ${quantity} ticket(s).`; $('#confirm').disabled = false; $('#reject').disabled = false; status('Request staged; Promise is waiting for user confirmation.'); return { status: 'awaiting-user-review', quantity }; }
    run('#stage', () => prepare({ quantity: Number($('#qty').value) }));
    $('#confirm').onclick = () => { if (!pending) return; order++; const quantity = pending.quantity; $('#ledger').textContent = `Confirmed #${order}: ${quantity} ticket(s).`; pending = null; $('#pending').textContent = 'No pending request.'; $('#confirm').disabled = true; $('#reject').disabled = true; finishReview?.({ status: 'confirmed', quantity }); finishReview = null; status('Request confirmed; Promise resolved.'); };
    $('#reject').onclick = () => { pending = null; $('#pending').textContent = 'Request rejected.'; $('#confirm').disabled = true; $('#reject').disabled = true; finishReview?.({ status: 'rejected' }); finishReview = null; status('Request rejected.'); };
    async function requestReview(args, { signal } = {}) { if (signal?.aborted) return { status: 'cancelled' }; const prepared = prepare(args); if (prepared.error) return prepared; return new Promise(resolve => { const cancel = () => { pending = null; $('#pending').textContent = 'Request cancelled.'; $('#confirm').disabled = true; $('#reject').disabled = true; finishReview?.({ status: 'cancelled' }); finishReview = null; }; finishReview = value => { signal?.removeEventListener('abort', cancel); resolve(value); }; signal?.addEventListener('abort', cancel, { once: true }); }); }
    register(card('request_demo_ticket_confirmation', 'Stage a ticket request and wait for explicit user confirmation.', schema({ quantity: { type: 'integer', minimum: 1, maximum: 4 } }), requestReview, { consequentialHint: true }));
  }

  if (id === 'tool-observatory') {
    app.innerHTML = panel('Registered Tools & Arguments', '<label><input type="checkbox" id="show-debug">Show debugging tools (<code>debugging: true</code>)</label><div id="tools"></div><label for="tool">Select tool</label><select id="tool"></select><div class="presets"><span>Presets:</span><button type="button" class="secondary" data-preset=\'{"query":"browser"}\'>Valid query</button><button type="button" class="secondary" data-preset=\'{"query":""}\'>Empty query</button><button type="button" class="secondary" data-preset="broken JSON">Malformed JSON</button></div><label for="args">JSON arguments</label><textarea id="args">{"query":"browser"}</textarea><button id="invoke">Execute tool</button>') + output('Execution Trace');
    const tools = [card('find_demo', 'Search modules in the catalog.', schema({ query: { type: 'string' } }), ({ query }) => { if (typeof query !== 'string' || !query.trim()) return { error: 'Provide a non-empty query string.', code: 'INVALID_QUERY', retryable: true }; return { matches: CONTENT_TOPICS.filter(t => (t.title + ' ' + t.subtitle).toLowerCase().includes(query.toLowerCase())).map(t => ({ id: t.id, title: t.title })) }; }, { readOnlyHint: true }), card('inspect_state', 'Return internal application state for debugging.', { type: 'object', properties: {} }, () => ({ time: new Date().toISOString(), topicCount: CONTENT_TOPICS.length, source: 'local-debug-state' }), { readOnlyHint: true, debugging: true })];
    function render() { const list = tools.filter(t => $('#show-debug').checked || !t.annotations.debugging); $('#tools').innerHTML = list.map(t => `<div class="item"><h3>${t.name}</h3><p>${t.description}</p><pre>${esc(JSON.stringify({ annotations: t.annotations, inputSchema: t.inputSchema }, null, 2))}</pre></div>`).join(''); $('#tool').innerHTML = list.map(t => `<option>${t.name}</option>`).join(''); }
    $('#show-debug').onchange = render; $('#tool').onchange = () => $('#args').value = $('#tool').value === 'find_demo' ? '{"query":"browser"}' : '{}';
    $$('[data-preset]').forEach(b => b.onclick = () => { $('#args').value = b.dataset.preset; $('#invoke').click(); });
    run('#invoke', async () => { const t = tools.find(t => t.name === $('#tool').value); const args = JSON.parse($('#args').value); if (!args || typeof args !== 'object' || Array.isArray(args)) throw new Error('Arguments must be a JSON object.'); const begin = performance.now(); const response = await t.execute(args); result({ tool: t.name, annotations: t.annotations, arguments: args, response, durationMs: Math.round((performance.now() - begin) * 100) / 100 }, 'Direct callback execution'); status(response.error ? 'Tool returned a structured error.' : 'Tool executed.', Boolean(response.error)); }); render(); tools.forEach(register);
  }
})();
