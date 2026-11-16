(() => {
  if (document.getElementById('advocu-autofill-panel')) {
    document.getElementById('advocu-autofill-panel').remove();
  }

  const SESSIONS = [
    {
      id: '1-EN',
      lang: 'English',
      title: 'Beyond Fragile DOM Scraping: Exposing Typed Page Tools to Browser Agents with WebMCP',
      shortAbstract: 'Instead of relying on brittle DOM scraping, WebMCP (document.modelContext) lets you expose existing web app functions as JSON Schema-typed tools for browser agents. Through 3 live demos, learn how to share validation and rendering state between UI buttons and registerTool(), return structured errors (retryable: true) for self-healing agents, and pause critical actions inside a pending Promise until the user confirms on screen.',
      fullAbstract: `Browser agents often rely on brittle DOM scraping and fragile CSS selectors to interact with web apps. When a layout changes, the agent breaks—and autonomous clicks can trigger unintended actions without human oversight.

In this session, we explore how WebMCP (document.modelContext) replaces fragile screen-scraping with contract-driven browser tools. Instead of forcing agents to reverse-engineer your UI, you will learn how to expose existing app functions as typed, JSON Schema-validated tools via registerTool().

Through three live browser demos, we will cover production patterns for agent-ready web apps:
- Shared UI & Agent State (reading-route.html): Wiring UI buttons and registerTool() to the exact same validation and rendering callbacks for zero state drift.
- Structured Errors & Self-Recovery (tool-observatory.html): Returning structured error payloads (retryable: true) so agents can deterministically fix invalid inputs.
- Human-in-the-Loop Confirmation (consent-cart.html): Pausing critical agent actions inside a pending Promise until the user explicitly confirms on screen.

Attendees will leave with practical patterns and ready-to-run demos to make any web app safely operable by browser agents.`
    },
    {
      id: '1-ES',
      lang: 'Spanish',
      title: 'Más allá del scraping del DOM: Herramientas tipadas para agentes del navegador con WebMCP',
      shortAbstract: 'En lugar de depender de un scraping frágil del DOM, WebMCP (document.modelContext) expone funciones de tu web como herramientas tipadas con JSON Schema para agentes del navegador. Con 3 demos en vivo, veremos cómo compartir el mismo estado y validación entre botones de UI y registerTool(), devolver errores estructurados (retryable: true) para autorrecuperación y pausar acciones críticas en una Promise hasta recibir confirmación humana.',
      fullAbstract: `Hoy en día, los agentes del navegador dependen de un scraping frágil del DOM y selectores CSS que se rompen ante cualquier cambio de interfaz, además del riesgo de ejecutar clics autónomos sin supervisión humana.

En esta charla exploraremos cómo WebMCP (document.modelContext) reemplaza el scraping frágil por herramientas tipadas en el navegador. En lugar de forzar al agente a adivinar tu interfaz, aprenderás a exponer funciones que ya existen en tu app web mediante registerTool() y contratos JSON Schema.

A través de tres demos en vivo, veremos patrones de producción para aplicaciones web listas para agentes:
- Estado compartido entre UI y agente (reading-route.html): Cómo conectar tus botones y registerTool() al mismo callback de validación y renderizado sin desincronización.
- Errores estructurados y autorrecuperación (tool-observatory.html): Cómo devolver errores con retryable: true para que el agente corrija parámetros inválidos de forma determinista.
- Confirmación humana (consent-cart.html): Cómo pausar acciones críticas en una Promise hasta que el usuario confirme explícitamente en pantalla.

Te llevarás patrones de arquitectura listos para producción y demos reutilizables para integrar WebMCP hoy mismo.`
    },
    {
      id: '2-EN',
      lang: 'English',
      title: 'Production-Ready Built-in AI: Session Lifecycles, AbortSignals, and Cross-Origin Permissions',
      shortAbstract: 'Building reliable apps with Chrome\'s Built-in AI requires more than calling prompt(). Through 3 live demos, we dive into production engineering for local AI: probing availability() across all 6 APIs without triggering unintended model downloads, gating session creation on user gestures with downloadprogress, cancelling streaming responses via AbortController while freeing memory (session.destroy()), and delegating access across iframes via Permissions-Policy.',
      fullAbstract: `Shipping Chrome's Built-in AI APIs in production requires mastering session lifecycles, memory management, and origin boundaries—not just calling prompt().

In this technical session, we explore the production engineering behind local browser AI: how to inspect model readiness without triggering accidental multi-gigabyte downloads, initiate sessions cleanly from user gestures, cancel in-flight streams safely, and embed AI widgets across origins.

Through three live demos, we will cover:
- Non-Intrusive Capability Probing (model-concierge.html): Inspecting availability() across all 6 Built-in AI APIs and tracking downloadprogress only after explicit user intent.
- Streaming Control & Memory Hygiene (stream-garden.html): Cancelling incremental streaming responses cleanly with AbortController and releasing on-device resources via session.destroy().
- Cross-Origin Delegation (iframe-passport.html): Testing real cross-origin embeds using Permissions-Policy: language-model and allow="language-model" in iframes.

Attendees will leave with battle-tested lifecycle patterns to keep local AI apps fast, memory-safe, and embeddable.`
    },
    {
      id: '2-ES',
      lang: 'Spanish',
      title: 'IA local en producción: Ciclo de vida de sesiones, AbortController y Permissions-Policy en Chrome',
      shortAbstract: 'Llevar las APIs de IA integrada de Chrome a producción requiere dominar su ciclo de vida. En 3 demos en vivo veremos cómo consultar availability() en las 6 APIs sin disparar descargas involuntarias, iniciar sesiones desde gestos del usuario monitoreando downloadprogress, cancelar respuestas en streaming con AbortController liberando memoria (session.destroy()) y delegar permisos entre orígenes en iframes mediante Permissions-Policy: language-model.',
      fullAbstract: `Llevar las APIs de IA integrada de Chrome a producción exige mucho más que llamar a prompt(): requiere gestionar memoria, descargas del modelo y permisos entre orígenes.

En esta charla exploraremos la ingeniería de producción detrás de la IA local en el navegador: cómo consultar disponibilidad sin disparar descargas involuntarias, iniciar sesiones a partir de un gesto del usuario, cancelar respuestas en streaming liberando recursos y delegar permisos en iframes.

A través de tres demos en vivo, veremos:
- Inspección segura de capacidades (model-concierge.html): Cómo consultar availability() en las 6 APIs de IA integrada y monitorear downloadprogress tras la intención del usuario.
- Control de streaming y memoria (stream-garden.html): Generación incremental, corte limpio con AbortController y liberación de memoria con session.destroy().
- Delegación entre orígenes (iframe-passport.html): Prueba real entre dos orígenes usando cabeceras Permissions-Policy: language-model y el atributo allow="language-model".

Te llevarás patrones listos para producción para construir experiencias de IA local rápidas, seguras en memoria y embebibles.`
    },
    {
      id: '3-EN',
      lang: 'English',
      title: 'Zero-Server Grounded RAG: On-Device Embeddings and Evidence Gates in the Browser',
      shortAbstract: 'Learn how to build a 100% in-browser, auditable RAG pipeline using Chrome\'s SemanticEmbedder and LanguageModel APIs. Across 3 live demos, we compare lexical keyword search against local semantic vectors using taskType (retrieval-document, retrieval-query, semantic-similarity), detect duplicate notes with pairwise cosine similarity matrices, and block LanguageModel.prompt() calls when no chunk passes the minimum evidence threshold to prevent hallucinations.',
      fullAbstract: `Can you build a hallucination-resistant RAG pipeline 100% inside the browser with zero server calls? With on-device embeddings and local language models, you can—if your retrieval layer is auditable and strictly gated.

In this session, we dive into SemanticEmbedder, task-specific embeddings (retrieval-document, retrieval-query, semantic-similarity), cosine similarity scoring, and deterministic evidence thresholds before invoking LanguageModel.prompt().

Through three live demos, we will explore:
- Semantic vs. Lexical Retrieval (meaning-compass.html): Comparing keyword matching against local vector embeddings to see where semantic retrieval wins.
- Pairwise Deduplication Matrices (duplicate-constellation.html): Visualizing cosine similarity matrices across user notes with interactive threshold sliders.
- Evidence-Gated RAG (evidence-window.html): Enforcing a minimum similarity gate that blocks LanguageModel.prompt() when evidence is weak, and requiring strict [A]–[F] chunk citations when answered.

Walk away with a complete blueprint for private, offline-capable, and verifiable RAG right in the browser.`
    },
    {
      id: '3-ES',
      lang: 'Spanish',
      title: 'RAG 100 % en el navegador: Embeddings en el dispositivo y umbrales de evidencia contra alucinaciones',
      shortAbstract: 'Aprende a construir un pipeline RAG 100 % en el navegador y auditable con SemanticEmbedder y LanguageModel. Con 3 demos en vivo, compararemos búsqueda léxica frente a vectores semánticos locales usando taskType (retrieval-document, retrieval-query, semantic-similarity), detectaremos duplicados con matrices de similitud coseno y bloquearemos LanguageModel.prompt() cuando ningún fragmento supere el umbral mínimo de evidencia para evitar alucinaciones.',
      fullAbstract: `¿Es posible construir un pipeline RAG resistente a alucinaciones 100 % dentro del navegador y sin servidores? Con embeddings en el dispositivo y modelos locales sí, siempre que la recuperación sea auditable y controlada por umbrales.

En esta charla profundizaremos en SemanticEmbedder, similitud coseno, configuración de taskType (retrieval-document, retrieval-query, semantic-similarity) y compuertas de evidencia antes de invocar a LanguageModel.prompt().

A través de tres demos en vivo, veremos:
- Búsqueda semántica vs. léxica (meaning-compass.html): Comparativa directa entre coincidencia por palabras y vectores semánticos generados localmente.
- Detección de duplicados (duplicate-constellation.html): Matrices de similitud por pares y calibración visual de umbrales interactivos.
- RAG con compuerta de evidencia (evidence-window.html): Cómo bloquear la llamada a LanguageModel.prompt() cuando ningún fragmento supera el umbral mínimo y exigir citas trazables [A]–[F].

Te llevarás una arquitectura práctica para crear buscadores y asistentes locales privados, verificables y libres de alucinaciones.`
    },
    {
      id: '4-EN',
      lang: 'English',
      title: 'Profiling On-Device Web AI: Streaming Telemetry, Speed Constraints, and Context Budgets',
      shortAbstract: 'Stop guessing how fast local browser AI really is. In this session with 3 live demos, learn how to benchmark on-device models (Gemma 4 / Multi-Token Prediction / Summarizer) without misleading metrics: separate cold start (setupMs), time-to-first-chunk (firstChunkMs), and generation speed (generationMs) in promptStreaming(), validate supported option combinations for Summarizer preference: "speed", and track token budgets with measureContextUsage().',
      fullAbstract: `Measuring performance for on-device browser models requires a different playbook than cloud APIs. A single wall-clock timer hides whether latency comes from cold model loading, prompt prefill, or token decoding.

In this session, we instrument Chrome's Built-in AI APIs (Gemma 4, Multi-Token Prediction, and Summarizer) to capture actionable telemetry, validate option constraints, and prevent silent context window overflows.

Through three live demos, we will cover:
- Granular Streaming Telemetry (latency-lens.html): Separating cold setup cost (setupMs), time to first chunk (firstChunkMs), and decoding throughput (generationMs) in promptStreaming() with JSON export.
- Summarizer Speed Constraints (preference-kitchen.html): Validating which option combinations actually support preference: "speed" in Summarizer before runtime failures occur.
- Context Window Budgeting (context-backpack.html): Measuring real token consumption with session.measureContextUsage() against session.contextWindow.

Attendees will leave with profiling tools and budgeting patterns to build predictably fast local AI interfaces.`
    },
    {
      id: '4-ES',
      lang: 'Spanish',
      title: 'Perfilado de rendimiento en IA local: Telemetría de streaming, modo speed y presupuesto de contexto',
      shortAbstract: 'Aprende a medir el rendimiento real de modelos locales en el navegador (Gemma 4 / Multi-Token Prediction / Summarizer) sin métricas engañosas. En 3 demos en vivo separaremos el costo de inicialización (setupMs), el tiempo al primer fragmento (firstChunkMs) y la generación (generationMs) en promptStreaming(), validaremos qué opciones soporta preference: "speed" en Summarizer y mediremos el consumo exacto de tokens con session.measureContextUsage().',
      fullAbstract: `Medir el rendimiento de modelos locales en el navegador con un simple cronómetro oculta dónde está el verdadero cuello de botella: la carga en frío del modelo, el procesamiento del prompt o la velocidad de decodificación.

En esta charla instrumentaremos las APIs de IA local (Gemma 4, Multi-Token Prediction y Summarizer) para obtener telemetría real, validar restricciones de opciones y gestionar el presupuesto de la ventana de contexto.

A través de tres demos en vivo, veremos:
- Telemetría de streaming (latency-lens.html): Cómo separar inicialización en frío (setupMs), tiempo al primer fragmento (firstChunkMs) y velocidad de generación (generationMs) con exportación JSON.
- Restricciones del modo speed (preference-kitchen.html): Cómo validar qué combinaciones de opciones soporta realmente preference: "speed" en Summarizer.
- Presupuesto de contexto (context-backpack.html): Medición nativa del consumo de tokens con session.measureContextUsage() frente a session.contextWindow.

Te llevarás herramientas de perfilado y patrones prácticos para optimizar la latencia y memoria de tus apps con IA local.`
    },
    {
      id: '5-EN',
      lang: 'English',
      title: 'Task APIs vs. Prompt API: Parameterized Templates and Deterministic Citation Auditing',
      shortAbstract: 'When should you use Chrome\'s specialized Task APIs (like Summarizer) versus building custom prompt templates on top of LanguageModel.prompt()? Through 3 live demos, learn how to isolate untrusted user data from system instructions, parameterize tone and target audience, compare Summarizer.summarize() side-by-side against LanguageModel.prompt(), and run deterministic regex post-validation to verify every output cites valid source IDs ([R1]–[R3]).',
      fullAbstract: `When building with browser AI, developers face a key architectural choice: rely on specialized Task APIs like Summarizer, or build a custom templating layer on top of the general-purpose LanguageModel API?

In this session, we establish clear decision criteria and engineering safeguards for both approaches—showing how to structure parameterized prompt builders, isolate untrusted input data, and verify model outputs with deterministic code.

Through three live browser demos, we will explore:
- Parameterized Prompt Builders (voice-remix.html): Separating system instructions from untrusted content while dynamically injecting tone and audience constraints.
- Deterministic Citation Auditing (release-kitchen.html): Generating release changelogs and running regex post-validation to ensure every source ID ([R1]–[R3]) is cited without hallucinated references.
- Task API vs. Prompt API Arena (recipe-arena.html): Side-by-side evaluation of Summarizer.summarize() versus custom LanguageModel.prompt() pipelines.

Leave with a clear framework for choosing the right API and auditing generated text in production.`
    },
    {
      id: '5-ES',
      lang: 'Spanish',
      title: 'Task APIs vs. Prompt API: Plantillas parametrizadas y auditoría determinista de citas en el navegador',
      shortAbstract: '¿Cuándo conviene usar una API de tarea específica del navegador (Summarizer) y cuándo construir plantillas propias sobre LanguageModel.prompt()? Con 3 demos en vivo aprenderás a separar datos no confiables de las instrucciones del sistema, parametrizar tono y audiencia, comparar lado a lado Summarizer.summarize() frente a LanguageModel.prompt(), y auditar con expresiones regulares que el texto generado cite todos los identificadores ([R1]–[R3]).',
      fullAbstract: `Al desarrollar con IA en el navegador surge una decisión clave de arquitectura: ¿cuándo usar una API de tarea específica como Summarizer y cuándo construir una capa propia de plantillas sobre LanguageModel?

En esta charla veremos criterios prácticos y defensas de ingeniería para ambos caminos: cómo separar datos no confiables de las instrucciones del sistema, parametrizar el estilo de salida y auditar el resultado con código determinista.

A través de tres demos en vivo, exploraremos:
- Constructores de prompts parametrizados (voice-remix.html): Reescritura controlada por tono y audiencia aislando el contenido de entrada de las instrucciones del sistema.
- Auditoría determinista de citas (release-kitchen.html): Generador de changelogs con post-validación por regex que verifica que se citen todos los identificadores [R1]–[R3] sin inventar referencias.
- Comparativa lado a lado (recipe-arena.html): Evaluación práctica entre Summarizer.summarize() y LanguageModel.prompt().

Te llevarás patrones claros para elegir la API correcta y garantizar salidas verificables en tus aplicaciones web.`
    },
    {
      id: '6-EN',
      lang: 'English',
      title: 'Human-Centric Multilingual UX: Built-in Translator, LanguageDetector, and Proofreader APIs',
      shortAbstract: 'Great AI writing tools assist users without silently overwriting their voice. In this session with 3 live demos, we explore UX and engineering patterns for Chrome\'s Translator, LanguageDetector, and Proofreader APIs: checking language-pair support via Translator.availability({ sourceLanguage, targetLanguage }), visualizing LanguageDetector confidence distributions on short or code-switched text, and staging Proofreader edits for user approval.',
      fullAbstract: `Multilingual and writing-assistance features fail when they silently overwrite the author's original words or misclassify short, code-switched messages (like Spanglish).

In this session, we combine Chrome's Built-in Translator, LanguageDetector, and Proofreader APIs with non-destructive interface patterns that keep the human author in full control.

Through three live browser demos, we will cover:
- Bidirectional Translation Preserving Originals (bilingual-relay.html): Verifying language-pair support with Translator.availability({ sourceLanguage, targetLanguage }) and translating Spanish <-> English side-by-side without losing source text.
- Confidence Radar for Code-Switching (language-radar.html): Visualizing LanguageDetector confidence distributions on short inputs and mixed-language text before triggering automatic pipelines.
- Staged Proofreading Review (proofread-review.html): Presenting Proofreader grammar corrections as pending diffs (accept/reject) instead of mutating user input in place.

Walk away with UX patterns and ready-to-use code for respectful, local-first multilingual web apps.`
    },
    {
      id: '6-ES',
      lang: 'Spanish',
      title: 'Flujos multilingües en el navegador: Translator, LanguageDetector y Proofreader sin destruir el texto',
      shortAbstract: 'Las mejores interfaces de asistencia de escritura ayudan sin sobrescribir silenciosamente la voz del autor. En 3 demos en vivo exploraremos Translator, LanguageDetector y Proofreader en el navegador: cómo comprobar soporte por par de idiomas con Translator.availability(), visualizar la distribución de confianza de LanguageDetector en textos cortos o con spanglish, y presentar las correcciones de Proofreader como cambios en espera (aceptar/descartar).',
      fullAbstract: `Las funciones de traducción y corrección gramatical suelen fallar en experiencia de usuario cuando reemplazan silenciosamente lo que escribió el autor o asumen un único idioma en textos cortos o con spanglish (code-switching).

En esta charla exploraremos patrones de interfaz y arquitectura para combinar las APIs nativas Translator, LanguageDetector y Proofreader manteniendo siempre el control en manos del usuario.

A través de tres demos en vivo, veremos:
- Traducción bidireccional no destructiva (bilingual-relay.html): Cómo comprobar soporte por par de idiomas con Translator.availability({ sourceLanguage, targetLanguage }) y traducir español <-> inglés conservando el original.
- Radar de confianza lingüística (language-radar.html): Cómo visualizar la distribución de probabilidad de LanguageDetector en textos cortos o con mezcla de idiomas.
- Revisión controlada de correcciones (proofread-review.html): Cómo presentar las sugerencias de Proofreader como cambios en espera (aceptar/descartar) sin sobrescribir el texto.

Te llevarás patrones de UI listos para crear experiencias multilingües locales, rápidas y respetuosas con el usuario.`
    },
    {
      id: '7-EN',
      lang: 'English',
      title: 'Structured JSON Output & Abstention Routing: Reliable Classification with Built-in Web AI',
      shortAbstract: 'Forcing an on-device model to guess on ambiguous inputs leads to costly misclassifications. Through 3 live demos, learn how to use LanguageModel.prompt(text, { responseConstraint }) with JSON Schema to build high-precision classifiers and moderators: always include an explicit abstention route ("review"), combine fast deterministic rules (URLs, length) with schema-constrained inference, and measure auto-coverage versus error rates across thresholds.',
      fullAbstract: `When using local language models to classify support tickets or pre-moderate user comments, forcing the model to pick a binary label on ambiguous inputs guarantees avoidable errors.

In this session, we explore how to combine deterministic rules, JSON Schema response constraints, and explicit abstention paths ("review") using Chrome's LanguageModel API.

Through three live browser demos, we will cover:
- Schema-Constrained Routing with Abstention (issue-router.html): Using LanguageModel.prompt(text, { responseConstraint }) with JSON Schema to route tickets into billing | technical | review instead of guessing on edge cases.
- Hybrid Pre-Moderation Airlock (comment-airlock.html): Combining fast deterministic checks (URL count, text length, banned patterns) before and alongside schema-constrained model evaluation.
- Coverage vs. Error Tradeoff Lab (abstention-lab.html): Evaluating how adjusting your abstention threshold shifts automation coverage versus classification error rates across 8 benchmark cases.

Attendees will leave with practical patterns for trustworthy, schema-safe classification pipelines in the browser.`
    },
    {
      id: '7-ES',
      lang: 'Spanish',
      title: 'Salida JSON estructurada, premoderación híbrida y enrutamiento con abstención en IA del navegador',
      shortAbstract: 'Forzar a un modelo local a adivinar ante entradas ambiguas dispara los errores de clasificación. Con 3 demos en vivo aprenderás a usar LanguageModel.prompt(text, { responseConstraint }) con JSON Schema para clasificar tickets y premoderar contenido: cómo incluir siempre una vía explícita de abstención ("review"), combinar reglas deterministas rápidas (URLs, longitud) con el modelo y medir el balance entre cobertura automática y tasa de error.',
      fullAbstract: `Cuando usamos modelos locales para clasificar tickets de soporte o premoderar comentarios, obligar al modelo a elegir una categoría cuando hay ambigüedad garantiza errores evitables en producción.

En esta charla veremos cómo combinar reglas deterministas, restricciones JSON Schema mediante responseConstraint y rutas explícitas de abstención ("review") con la API LanguageModel del navegador.

A través de tres demos en vivo, exploraremos:
- Enrutamiento con JSON Schema y abstención (issue-router.html): Cómo usar LanguageModel.prompt(text, { responseConstraint }) para clasificar tickets en billing | technical | review sin adivinar en casos dudosos.
- Premoderación híbrida (comment-airlock.html): Cómo combinar filtros deterministas rápidos (URLs, longitud) antes y junto a la evaluación estructurada del modelo.
- Laboratorio de cobertura vs. error (abstention-lab.html): Evaluación sobre 8 casos de prueba para medir cómo cambia la tasa de error al ajustar el umbral de abstención.

Te llevarás patrones de ingeniería listos para construir clasificadores locales confiables, auditables y seguros.`
    }
  ];

  function setNativeValue(el, value) {
    const proto = Object.getPrototypeOf(el);
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (setter) {
      setter.call(el, value);
    } else {
      el.value = value;
    }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  function checkByLabelText(labelsToMatch) {
    const allLabels = Array.from(document.querySelectorAll('label, mat-checkbox, .checkbox, span, div'));
    for (const text of labelsToMatch) {
      const target = allLabels.find(el => el.textContent && el.textContent.trim() === text);
      if (target) {
        const input = target.querySelector('input[type="checkbox"]') || target.closest('label, mat-checkbox')?.querySelector('input[type="checkbox"]');
        if (input && !input.checked) {
          input.click();
        } else if (!input) {
          target.click();
        }
      }
    }
  }

  function fillPage(session, useShort) {
    const abstractText = useShort ? session.shortAbstract : session.fullAbstract;

    // 1. Checkboxes on Step 1 or Step 3
    checkByLabelText(['Talk', 'Demo', 'Intermediate', 'Advance', 'In-person', 'Virtual', 'Up to 30 minutes', '30-60 minutes']);

    // 2. Title input on Step 2
    const inputs = Array.from(document.querySelectorAll('input[type="text"], input:not([type])'));
    const titleInput = inputs.find(i => i.offsetParent !== null && !i.readOnly);
    if (titleInput) {
      titleInput.focus();
      setNativeValue(titleInput, session.title);
    }

    // 3. Rich text editor (Quill / ProseMirror / contenteditable / textarea)
    const editor = document.querySelector('[contenteditable="true"], .ql-editor, .ProseMirror, textarea');
    if (editor) {
      editor.focus();
      if (editor.tagName === 'TEXTAREA') {
        setNativeValue(editor, abstractText);
      } else {
        editor.innerHTML = abstractText
          .split('\n\n')
          .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
          .join('');
        editor.dispatchEvent(new InputEvent('input', { bubbles: true, data: abstractText }));
        editor.dispatchEvent(new Event('change', { bubbles: true }));
        editor.dispatchEvent(new Event('blur', { bubbles: true }));
      }
    }

    statusEl.textContent = `✅ Filled ${session.id} (${useShort ? '<500 chars' : '<1200 chars'}) — Title: ${session.title.slice(0, 32)}...`;
  }

  const panel = document.createElement('div');
  panel.id = 'advocu-autofill-panel';
  panel.style.cssText = 'position:fixed;top:12px;right:12px;z-index:999999;background:#0f172a;color:#f8fafc;padding:14px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.45);font-family:system-ui,sans-serif;width:360px;border:1px solid #334155;font-size:13px;';

  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
      <strong style="font-size:14px;color:#38bdf8;">⚡ Advocu 14-Session Auto-Filler</strong>
      <button id="adv-close" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:16px;">✕</button>
    </div>
    <select id="adv-select" style="width:100%;padding:7px;border-radius:6px;background:#1e293b;color:#fff;border:1px solid #475569;margin-bottom:8px;">
      ${SESSIONS.map((s, idx) => `<option value="${idx}">[${s.id}] ${s.title}</option>`).join('')}
    </select>
    <div style="display:flex;gap:6px;margin-bottom:8px;">
      <button id="adv-fill-short" style="flex:1;padding:8px;background:#2563eb;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:600;">Fill (&lt;500 chars)</button>
      <button id="adv-fill-full" style="flex:1;padding:8px;background:#059669;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:600;">Fill (&lt;1200 chars)</button>
    </div>
    <div style="display:flex;gap:6px;margin-bottom:8px;">
      <button id="adv-copy-title" style="flex:1;padding:6px;background:#334155;color:#e2e8f0;border:none;border-radius:6px;cursor:pointer;">Copy Title</button>
      <button id="adv-copy-short" style="flex:1;padding:6px;background:#334155;color:#e2e8f0;border:none;border-radius:6px;cursor:pointer;">Copy &lt;500</button>
      <button id="adv-copy-full" style="flex:1;padding:6px;background:#334155;color:#e2e8f0;border:none;border-radius:6px;cursor:pointer;">Copy &lt;1200</button>
    </div>
    <div id="adv-status" style="font-size:12px;color:#93c5fd;min-height:18px;">Select a talk and click Fill on any step!</div>
  `;

  document.body.appendChild(panel);
  const selectEl = panel.querySelector('#adv-select');
  const statusEl = panel.querySelector('#adv-status');

  panel.querySelector('#adv-close').onclick = () => panel.remove();
  panel.querySelector('#adv-fill-short').onclick = () => fillPage(SESSIONS[selectEl.value], true);
  panel.querySelector('#adv-fill-full').onclick = () => fillPage(SESSIONS[selectEl.value], false);
  panel.querySelector('#adv-copy-title').onclick = () => {
    navigator.clipboard.writeText(SESSIONS[selectEl.value].title);
    statusEl.textContent = '📋 Copied Title!';
  };
  panel.querySelector('#adv-copy-short').onclick = () => {
    navigator.clipboard.writeText(SESSIONS[selectEl.value].shortAbstract);
    statusEl.textContent = `📋 Copied Short Abstract (${SESSIONS[selectEl.value].shortAbstract.length} chars)!`;
  };
  panel.querySelector('#adv-copy-full').onclick = () => {
    navigator.clipboard.writeText(SESSIONS[selectEl.value].fullAbstract);
    statusEl.textContent = `📋 Copied Full Abstract (${SESSIONS[selectEl.value].fullAbstract.length} chars)!`;
  };
})();
