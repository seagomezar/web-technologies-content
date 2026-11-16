// Workshop Oficial: Construyendo IA Confiable a 100 MPH — Español (DevFest Pereira 2026)
window.WORKSHOP_ES = {
  title: 'Construyendo IA Confiable a 100 MPH · Workshop DevFest Pereira 2026',
  plannedMinutes: 90,
  defaults: { city: 'Pereira 2026' },
  sources: [
    { title: 'Sebastián Gómez — Sitio Web & Blog', url: 'https://www.sebastian-gomez.com/' },
    { title: 'Codelab Oficial de Google: Building Trustable AI at 100 MPH', url: 'https://codelabs.developers.google.com/codelabs/trustable-at-100-mph?hl=en' },
    { title: 'Repositorio Oficial Actualizado (GitHub): seagomezar/trustable-ai-codelab', url: 'https://github.com/seagomezar/trustable-ai-codelab' },
    { title: 'Google AI Studio (API Keys de Gemini)', url: 'https://aistudio.google.com/app/apikey' },
    { title: 'Documentación oficial Gemini API (@google/genai Interactions)', url: 'https://ai.google.dev/gemini-api/docs' },
    { title: 'Google Cloud Run — Streaming SSE sin servidor', url: 'https://cloud.google.com/run/docs' }
  ],
  slides: [
    // 01 — Portada
    {
      kind: 'title',
      eyebrow: 'CODELAB OFICIAL DE GOOGLE · WORKSHOP PRÁCTICO',
      timeBadge: '90 MIN · 12 PASOS',
      title: 'IA Confiable a 100 MPH',
      subtitle: 'Arquitectura Split-Brain, física vehicular, guardrails determinísticos y voz expresiva en tiempo real con Gemini 3.8.',
      coauthors: 'Coautores del Codelab Oficial: <strong>Sebastián Gómez</strong> (<a href="https://www.sebastian-gomez.com/" target="_blank" rel="noopener">www.sebastian-gomez.com</a>) · Krupa Galiya · Todd Kerpelman · <em>Ocupop (Koru)</em>',
      photo: 'assets/sebastian-gomez.jpg',
      codelabBadge: 'assets/codelab-badge.svg',
      badge: 'assets/gde-web-badge.svg',
      speakerName: 'Sebastián Gómez',
      speakerRole: 'Google Developer Expert · Web Technologies',
      speakerSite: 'www.sebastian-gomez.com',
      speakerSiteUrl: 'https://www.sebastian-gomez.com/',
      speakerTitle: 'Engineering Manager en Twilio',
      builds: [],
      minutes: 2,
      notes: [
        'Bienvenida a DevFest Pereira 2026. Cuenta en 60 segundos cómo nació este Codelab oficial de Google junto a Krupa Galiya, Todd Kerpelman y el equipo de ingeniería de Ocupop usando telemetría real de pista, y pasa enseguida a la diapositiva 2 para compartir el enlace actualizado de GitHub. Recuerda que presionando P se abre la Vista del Facilitador sincronizada.'
      ]
    },

    // 02 — Aviso Importante: Nuevo Repositorio Oficial del Taller
    {
      kind: 'comparison',
      eyebrow: 'AVISO IMPORTANTE · REPOSITORIO DEL TALLER',
      pillTone: 'yellow',
      timeBadge: '1 MIN · USA ESTE ENLACE',
      title: 'El repositorio original del Codelab ya no funciona',
      subtitle: 'Como ese enlace dejó de existir, usa por favor este repositorio actualizado durante todo el taller.',
      contextBar: '<span>CLONAR AHORA → <b>git clone https://github.com/seagomezar/trustable-ai-codelab.git</b></span><span>Actualizado 2026</span>',
      cards: [
        {
          tone: 'bad',
          title: 'Enlace Antiguo en el Codelab',
          verdict: '404 · NO FUNCIONA',
          quote: '<s>https://github.com/ocupop/trustable-ai-codelab</s>',
          points: [
            'El repositorio citado en el <strong>Paso 5 del Codelab</strong> fue retirado y devuelve error <strong>404</strong>.',
            'No intentes ejecutar el <code>git clone</code> que aparece escrito en la guía original.',
            'Además usaba dependencias previas a la nueva <code>Interactions API</code> de Gemini.'
          ]
        },
        {
          tone: 'good',
          title: 'Usa Este Repositorio Actualizado',
          verdict: 'ACTIVO · UP TO DATE',
          quote: '<a href="https://github.com/seagomezar/trustable-ai-codelab" target="_blank" rel="noopener">https://github.com/seagomezar/trustable-ai-codelab ↗</a>',
          points: [
            'Código completo al día: <code>streaming-telemetry-server</code> + <code>koru-application</code>.',
            'Listo para desplegar en <strong>Google Cloud Run (recomendado)</strong> con fallback local incluido.'
          ]
        }
      ],
      takeaway: 'En el Paso 5 reemplaza el enlace viejo por <a href="https://github.com/seagomezar/trustable-ai-codelab" target="_blank" rel="noopener">https://github.com/seagomezar/trustable-ai-codelab</a>.',
      builds: [],
      minutes: 1,
      notes: [
        'Haz una pausa clara aquí para que toda la sala tome foto o abra https://github.com/seagomezar/trustable-ai-codelab. Explica que el repo original de Ocupop citado en el Codelab ya no existe, así que publicaste este repositorio actualizado con todos los parches 2026 para desplegar en Google Cloud Run (recomendado) y con fallback local listo.'
      ]
    },

    // 03 — Hoja de ruta completa
    {
      kind: 'roadmap',
      eyebrow: 'MAPA DEL TALLER · 4 BLOQUES',
      pillTone: 'blue',
      timeBadge: '00:00 → 90:00',
      title: '12 pasos desde el GPS crudo hasta la cabina',
      subtitle: 'Seguiremos exactamente los 12 pasos del Codelab oficial con experimentos en vivo sobre el código.',
      phases: [
        {
          title: '01 · Fundamentos',
          time: '18 min',
          color: 'blue',
          steps: [
            { step: 'PASOS 1–2', label: 'Visión general, Google Cloud, API keys y fallback local' },
            { step: 'PASO 3', label: 'Por qué importa la IA confiable a 118 mph en Curva 1' },
            { step: 'PASO 4', label: 'Arquitectura Split-Brain de 4 rutas (Hot/Cold/Geo/Pred)' }
          ]
        },
        {
          title: '02 · Telemetría Viva',
          time: '24 min',
          color: 'yellow',
          steps: [
            { step: 'PASO 5A–B', label: 'Despliegue FastAPI SSE en Cloud Run (y fallback :8000)' },
            { step: 'PASO 5C–D', label: 'Inspección del stream TPV 10Hz en navegador y curl' },
            { step: 'PASO 6', label: 'Simulador Koru en vivo (:5173) y cabina interactiva' }
          ]
        },
        {
          title: '03 · Física y Reglas',
          time: '26 min',
          color: 'green',
          steps: [
            { step: 'PASO 7', label: 'Sensores virtuales: G-Lat, G-Long, freno y acelerador' },
            { step: 'PASO 8A', label: 'Círculo de Fricción y DECISION_MATRIX determinística' },
            { step: 'PASO 8B', label: 'Grounding físico en Gemini 3.8 Flash (Interactions API)' }
          ]
        },
        {
          title: '04 · Voz y Dominios',
          time: '22 min',
          color: 'red',
          steps: [
            { step: 'PASO 9', label: '5 personas de coach y voz expresiva Gemini TTS' },
            { step: 'PASO 10', label: 'Observabilidad con 3 sondas en DevTools y limpieza' },
            { step: 'PASOS 11–12', label: 'Retos (Gemini Nano, lluvia) y transferencia industrial' }
          ]
        }
      ],
      builds: ['Bloque 02: Telemetría 10Hz', 'Bloque 03: Física y Guardrails', 'Bloque 04: Voz, DevTools y Retos'],
      minutes: 2,
      notes: [
        'Presenta el Bloque 01: primero entendemos por qué un chatbot tradicional falla cuando el usuario viaja a 100+ mph y cómo dividimos el cerebro del sistema.',
        'Bloque 02: levantaremos el servidor Python FastAPI que emite telemetría VBOX real a 10Hz por Server-Sent Events y conectaremos Koru.',
        'Bloque 03: romperemos intencionalmente los sensores virtuales y el prompt de física para sentir la diferencia entre alucinación e ingeniería confiable.',
        'Bloque 04: ajustaremos personalidad/voz, trazaremos cada frame en Chrome DevTools y llevaremos esta arquitectura a salud, manufactura y logística.'
      ]
    },

    // 03 — Paso 1: Qué construiremos hoy
    {
      kind: 'diagram',
      eyebrow: 'PASO 1 DEL CODELAB · VISIÓN GENERAL',
      pillTone: 'blue',
      timeBadge: '3 MIN',
      title: 'Qué vas a construir y probar hoy',
      subtitle: 'Un coach de automovilismo en tiempo real conectado a telemetría GPS de pista a 10 cuadros por segundo.',
      diagram: [
        {
          tag: 'ENTRADA 10Hz',
          title: 'Telemetría VBOX SSE',
          body: '11.539 muestras reales en <code>SampleStream2024.csv</code> transmitidas cada 100 ms vía HTTP SSE.',
          foot: 'Cloud Run SSE (/events) · fallback :8000',
          color: 'blue'
        },
        {
          tag: 'FÍSICA + REGLAS',
          title: 'Motor Split-Brain Koru',
          body: 'Deriva fuerzas G al vuelo y dispara reflejos determinísticos en <strong>&lt;50 ms</strong> más geocercas.',
          foot: 'telemetryStreamService + DECISION_MATRIX',
          color: 'yellow',
          step: 1
        },
        {
          tag: 'ESTRATEGIA IA',
          title: 'Gemini 3.8 Flash',
          body: 'Razonamiento táctico anclado en el Círculo de Fricción y transferencia de peso cada 15 s.',
          foot: '@google/genai ^3.3.0 · Interactions API',
          color: 'green',
          step: 2
        },
        {
          tag: 'CABINA HUMANA',
          title: '5 Personas + Voz TTS',
          body: 'Comandos cortos (&lt;12 palabras) con <code>gemini-3.8-flash-lite-tts</code> o Web Speech API.',
          foot: 'Tony · Rachel · AJ · Garmin · Super AJ',
          color: 'red',
          step: 3
        }
      ],
      takeaway: 'La IA no conduce el auto: entrega la instrucción correcta, en el tono correcto, antes del punto de frenado.',
      builds: ['Motor Split-Brain local', 'Razonamiento con Gemini 3.8 Flash', '5 Personas y salida de voz'],
      minutes: 2,
      notes: [
        'Explica la fuente de datos: son vueltas reales capturadas con GPS de 10Hz (10 muestras por segundo), no datos sintéticos aleatorios.',
        'Enfatiza que el navegador calcula vectores físicos y evalúa reglas determinísticas sin esperar red.',
        'Gemini 3.8 Flash entra en la Ruta Fría (Cold Path) para explicar el porqué físico sin bloquear alertas urgentes.',
        'Finalmente, la capa de UX convierte decisiones técnicas en radio de pista audible sin mirar la pantalla.'
      ]
    },

    // 05 — Paso 2: Google Cloud Run (Recomendado) + Fallback Local
    {
      kind: 'comparison',
      eyebrow: 'PASO 2 DEL CODELAB · INFRAESTRUCTURA Y SEGURIDAD',
      pillTone: 'yellow',
      timeBadge: '3 MIN',
      title: 'Google Cloud Run (Recomendado) + Fallback Local',
      subtitle: 'Desplegaremos el servidor SSE en Google Cloud como en producción, dejando un respaldo local listo por si hace falta.',
      contextBar: '<span>Repo oficial: <b>github.com/seagomezar/trustable-ai-codelab</b></span><span>gcloud CLI · Python 3.10+ · Node 20+</span>',
      cards: [
        {
          tone: 'good',
          title: 'Modo A · Google Cloud Run (Recomendado)',
          verdict: 'RECOMENDADO · CLOUD',
          quote: 'Publica el servidor de telemetría en Cloud Run y conéctate por HTTPS en tiempo real.',
          points: [
            'Usa tus créditos de Google Cloud del taller + tu API Key de Google AI Studio.',
            'Arquitectura serverless real con limpieza guiada en el Paso 10 para dejar cargos en $0.',
            '<strong>Seguridad:</strong> jamás subas <code>GEMINI_API_KEY</code> ni <code>.env</code> a GitHub (vive solo en ⚙️ Settings).'
          ]
        },
        {
          tone: 'neutral',
          title: 'Modo B · Fallback Local (Contingencia)',
          verdict: 'FALLBACK · SIN BILLING',
          quote: '¿Sin facturación activa en GCP o red restringida? Corre FastAPI en localhost:8000 o usa Built-in Demo.',
          points: [
            '¿No te funcionan los créditos de GCP o el Wi-Fi? Corre el servidor directo en tu laptop (<code>localhost:8000</code>) sin costo.',
            'El preset <strong>Built-in Demo</strong> reproduce 1.200 frames 10Hz incluso sin Python ni internet.',
            'Voz con <strong>Gemini 3.8 TTS</strong> y fallback automático a Web Speech API del navegador.'
          ]
        }
      ],
      takeaway: 'Recomendamos desplegar en Cloud Run para vivir la arquitectura completa; si algo bloquea tu cuenta GCP, el fallback local te mantiene al día.',
      builds: ['Plan de respaldo (Fallback) en local'],
      minutes: 2,
      notes: [
        'Presenta Google Cloud Run como el camino principal y recomendado del Codelab: aprenderán a configurar SSE sin throttling en infraestructura serverless real y a proteger sus API keys.',
        'Luego presenta el Modo B únicamente como red de seguridad (fallback): si alguien tiene problemas con créditos/billing de GCP o Wi-Fi, puede correr ingest.py en localhost:8000 y no perderse ni un minuto del taller.'
      ]
    },

    // 05 — Paso 3: Por qué importa la IA Confiable
    {
      kind: 'comparison',
      eyebrow: 'PASO 3 DEL CODELAB · EL PROBLEMA A 118 MPH',
      pillTone: 'red',
      timeBadge: '3 MIN',
      title: 'Curva 1 a 190 km/h: IA Ingenua vs. IA Confiable',
      subtitle: 'A 118 mph recorres 53 metros cada segundo. Una respuesta verbosa o tardía llega después del trompo.',
      contextBar: '<span>TELEMETRÍA ENTRANTE → <b>{ "corner": 1, "speed_mph": 118, "brake_pct": 12, "rearGrip": "low" }</b></span><span>Presupuesto: &lt;250 ms</span>',
      cards: [
        {
          tone: 'bad',
          title: 'Chatbot LLM Ingenuo',
          verdict: 'PELIGROSO · 3.4s LATENCIA',
          quote: '“Parece que entras rápido a la Curva 1 con poco agarre trasero; considera frenar suavemente o soltar el acelerador…”',
          points: [
            '<strong>38 palabras:</strong> tardas 11 segundos en escucharlo; a 118 mph ya saliste de la pista.',
            '<strong>Física peligrosa:</strong> “soltar el acelerador” en apoyo transfiere peso adelante y provoca trompo.',
            '<strong>Tono dubitativo:</strong> “parece que / considera” destruye la confianza bajo estrés.'
          ]
        },
        {
          tone: 'good',
          title: 'Coach de IA Confiable (Koru)',
          verdict: 'CONFIABLE · 35ms HOT PATH',
          quote: '“¡Frena firme en recta! Suelta suave al girar: cuida el eje trasero.”',
          points: [
            '<strong>Latencia separada:</strong> alerta refleja instantánea (&lt;50 ms) antes de consultar la nube.',
            '<strong>Anclaje físico:</strong> respeta transferencia de peso y límite del Círculo de Fricción.',
            '<strong>Carga cognitiva mínima:</strong> imperativo, accionable y adaptado al piloto.'
          ]
        }
      ],
      takeaway: 'Confiabilidad = Velocidad adecuada + Exactitud física + Guardrails determinísticos + Voz concisa.',
      builds: ['Respuesta de un Coach de IA Confiable'],
      minutes: 3,
      notes: [
        'Lee en voz alta la respuesta del chatbot ingenuo tomándote el tiempo real. Haz notar cuántos metros avanzó el auto mientras el modelo decía "Parece que...".',
        'Revela la tarjeta derecha: señala que soltar de golpe el acelerador con rearGrip: low causa lift-off oversteer. La IA confiable combina reglas rápidas con física real.'
      ]
    },

    // 06 — Divisor Bloque 01
    {
      kind: 'section',
      background: 'var(--pastel-blue)',
      eyebrow: 'BLOQUE 01 · ARQUITECTURA',
      pillTone: 'blue',
      timeBadge: 'PASO 4 · 10 MIN',
      title: 'Separar reflejos de estrategia',
      subtitle: 'Cuando la física va a 10Hz y el LLM tarda segundos, un solo bucle asíncrono no basta.',
      heroTone: 'blue',
      blockTag: 'PASO 4 DEL CODELAB',
      heroTitle: 'Arquitectura Split-Brain de Alta Velocidad',
      heroBody: 'Inspirada en el sistema nervioso humano: la médula espinal retira la mano del fuego en milisegundos; la corteza prefrontal analiza después qué aprendimos.',
      goalsTitle: 'Lo que dominaremos en este bloque',
      goals: [
        'Por qué desacoplar la <strong>Ruta Caliente (&lt;50 ms)</strong> de la <strong>Ruta Fría (2–5 s)</strong> evita bloqueos mortales.',
        'Cómo <strong>anticipar curvas (&lt;150 m antes)</strong> con coordenadas GPS y advertir riesgos antes de girar.',
        'Reglas rápidas se ejecutan al instante; Gemini corre en segundo plano <strong>sin <code>await</code></strong> (<code>void</code>) para no congelar el flujo.'
      ],
      builds: ['Geocercas y predicción', 'Patrón no bloqueante en TypeScript'],
      minutes: 2,
      notes: [
        'Usa la analogía biológica: nadie espera una reflexión filosófica para frenar ante un obstáculo. Así funciona Koru.',
        'Adelanta las geocercas: además de reaccionar al error, anunciamos la curva 150 metros antes.',
        'Y muestra que en código esto se traduce en no hacer await del LLM dentro del loop de 10Hz.'
      ]
    },

    // 07 — Paso 4: Arquitectura Split-Brain de 4 rutas
    {
      kind: 'splitbrain',
      eyebrow: 'PASO 4 DEL CODELAB · MOTOR DE 4 RUTAS',
      pillTone: 'blue',
      timeBadge: '4 MIN',
      title: 'Cuatro rutas paralelas sobre el mismo frame de 10Hz',
      subtitle: 'Cada muestra GPS alimenta cuatro lazos con presupuestos de latencia y responsabilidades distintas.',
      source: {
        title: 'Frame Crudo + Derivado',
        body: 'Llega cada 100 ms desde FastAPI SSE o el reproductor local.',
        sample: '{\n  "speed": 126.4,\n  "gLat": 1.14,\n  "gLong": -0.85,\n  "brake": 92\n}'
      },
      lanes: [
        {
          tone: 'hot',
          name: '1. HOT PATH',
          sub: 'Reflejo local',
          desc: 'Evalúa <code>DECISION_MATRIX</code> en memoria. Cero red, cero alucinación en alertas críticas.',
          latency: '< 50 ms'
        },
        {
          tone: 'cold',
          name: '2. COLD PATH',
          sub: 'Gemini 3.8 Flash',
          desc: 'Explica técnica y física con persona activa y cooldown de 15 s para no saturar.',
          latency: '2 – 5 s'
        },
        {
          tone: 'feed',
          name: '3. FEEDFORWARD',
          sub: 'Geocerca Haversine',
          desc: 'Detecta curvas a <strong>&lt;150 m</strong> (Thunderhill / Sonoma) y anticipa la referencia.',
          latency: '150 m antes'
        },
        {
          tone: 'pred',
          name: '4. PREDICTIVE',
          sub: 'Tendencia / Delta',
          desc: 'Compara vueltas A vs B y fatiga/consistencia con <code>gemini-4-argon</code> en post-sesión.',
          latency: 'Ventana 8s+'
        }
      ],
      sink: {
        title: 'Radio de Cabina',
        body: 'Prioriza seguridad sobre estrategia y sintetiza voz con el estilo del coach.',
        footer: '<strong>Regla clave:</strong> el Cold Path <em>enriquece</em> al piloto, pero jamás bloquea al Hot Path.'
      },
      builds: ['1. Hot Path (<50 ms)', '2. Cold Path (Gemini 3.8 Flash)', '3. Feedforward (<150 m)', '4. Predictive / Post-vuelta'],
      minutes: 3,
      notes: [
        'Observa la animación automática de las cuatro rutas y luego recórrelas una por una con las flechas.',
        'Ruta 1 (Hot): vive 100% en TypeScript local con cooldown de 1.5s; si frenas tarde, grita ahora mismo.',
        'Ruta 2 (Cold): llama a Gemini 3.8 Flash con cooldown de 15s para dar coaching profundo cuando hay margen.',
        'Ruta 3 (Feedforward): usa distancia Haversine contra las coordenadas de cada curva para hablar antes del giro.',
        'Ruta 4 (Predictive / Analysis): cruza telemetría histórica entre dos vueltas para encontrar décimas ocultas.'
      ]
    },

    // 08 — Paso 4 Código: reflexPath vs strategyPath
    {
      kind: 'code',
      eyebrow: 'PASO 4 · PATRÓN ARQUITECTÓNICO EN CÓDIGO',
      pillTone: 'blue',
      timeBadge: '3 MIN',
      title: 'Nunca hagas await de la nube en un lazo de 10Hz',
      subtitle: 'En coachingService.ts separamos la ejecución síncrona determinística del disparo asíncrono hacia Gemini.',
      filePath: 'koru-application/src/services/coachingService.ts:40',
      checklist: [
        '<code>runHotPath(frame)</code> corre síncrono en microsegundos.',
        '<code>runFeedforward(frame)</code> verifica geocercas Haversine (&lt;150 m).',
        '<code>void this.runColdPath(frame)</code> no bloquea el hilo de telemetría.'
      ],
      tip: 'Si pusieras <code>await runColdPath(frame)</code>, congelarías 20–50 frames de GPS esperando una respuesta HTTP.',
      codeLabel: 'Despacho Split-Brain por frame (10 veces por segundo)',
      code: `processFrame(frame: TelemetryFrame) {
  // 1. Reflejo determinístico inmediato (<50ms, sin red)
  this.runHotPath(frame);

  // 2. Anticipación espacial por geocerca GPS (<150m)
  this.runFeedforward(frame);

  // 3. Estrategia asíncrona con Gemini 3.8 Flash (no bloqueante)
  void this.runColdPath(frame);
}

private runHotPath(frame: TelemetryFrame) {
  if (Date.now() - this.lastHotTime < this.hotCooldownMs) return;
  for (const rule of DECISION_MATRIX) {
    if (rule.check(frame)) {
      this.emit({ path: "hot", text: this.humanizeAction(rule.action, frame) });
      return;
    }
  }
}`,
      codeFocus: [
        [1, 3, 6, 9],
        [2, 3, 12, 13, 14, 15, 16, 17],
        [8, 9]
      ],
      stepCallouts: [
        'Cada 100 ms entra un TelemetryFrame y dispara las tres rutas activas sin bloquearse entre sí.',
        'El Hot Path filtra por cooldown (1.5 s) y recorre reglas puras en memoria: latencia determinística.',
        'El operador void deja explícito que Gemini corre en segundo plano con su propio cooldown de 15 s.'
      ],
      builds: ['Foco en el Hot Path determinístico', 'Disparo asíncrono con void'],
      minutes: 2,
      notes: [
        'Muestra cómo 9 líneas en processFrame resumen toda la filosofía del Codelab.',
        'Pregunta a la sala qué pasaría con ESLint no-floating-promises y el render de React si hiciéramos await en un stream de 10Hz.',
        'Subraya que este mismo patrón aplica a videojuegos, trading, robótica web y monitoreo médico.'
      ]
    },

    // 09 — Divisor Bloque 02
    {
      kind: 'section',
      background: 'var(--pastel-yellow)',
      eyebrow: 'BLOQUE 02 · TELEMETRÍA EN VIVO',
      pillTone: 'yellow',
      timeBadge: 'PASOS 5 Y 6 · 24 MIN',
      title: 'Encendiendo el servidor 10Hz y la cabina Koru',
      subtitle: 'Hora de abrir la terminal: pondremos a fluir coordenadas reales de pista hacia el navegador.',
      heroTone: 'yellow',
      blockTag: 'MANOS AL CÓDIGO · PASOS 5–6',
      heroTitle: 'De un CSV VBOX de pista a Google Cloud Run SSE',
      heroBody: 'Desplegaremos el emisor FastAPI en Google Cloud Run (con fallback local en :8000), inspeccionaremos los paquetes TPV crudos y conectaremos la interfaz React de Koru.',
      goalsTitle: 'Metas prácticas de los próximos 24 minutos',
      goals: [
        'Desplegar <code>streaming-telemetry-server</code> en <strong>Cloud Run</strong> (o fallback local) y validar <code>/events</code> a 10Hz.',
        'Entender por qué el formato GPSD <code>TPV</code> crudo aún no es “AI-Ready”.',
        'Correr <code>koru-application</code> en <code>localhost:5173</code> y escuchar al coach en vivo.'
      ],
      builds: ['Inspeccionar paquetes TPV crudos', 'Conectar cabina Koru en localhost:5173'],
      minutes: 2,
      notes: [
        'Pide a todos abrir dos pestañas de terminal: la primera para desplegar streaming-telemetry-server en Google Cloud Run y la segunda para koru-application.',
        'Recuerda que si alguien no tiene proyecto GCP activo, en la misma lámina tendrá los comandos de fallback local en :8000.',
        'Meta del bloque: todos deben ver el auto moviéndose en el mapa y mensajes llegando al panel derecho.'
      ]
    },

    // 10 — Paso 5: Pipeline de Streaming de Telemetría
    {
      kind: 'diagram',
      eyebrow: 'PASO 5 DEL CODELAB · PIPELINE DE INGESTA',
      pillTone: 'yellow',
      timeBadge: '2 MIN',
      title: 'Cómo viaja la telemetría desde el auto hasta el navegador',
      subtitle: 'El servidor soporta tanto telemetría celular real desde pista como simulación determinística desde CSV.',
      diagram: [
        {
          tag: 'ORIGEN',
          title: 'SampleStream2024.csv',
          body: '11.539 filas capturadas con VBOX GPS (latitud, longitud, altitud y velocidad en km/h).',
          foot: 'UTF-8 BOM limpio · bucle infinito',
          color: 'yellow'
        },
        {
          tag: 'GENERADOR 10Hz',
          title: 'mock_gps_generator()',
          body: 'Convierte coordenadas DMM a grados decimales, velocidad a m/s y duerme <code>0.1s</code>.',
          foot: 'ingest.py · asyncio task',
          color: 'blue',
          step: 1
        },
        {
          tag: 'FAN-OUT',
          title: 'Broadcaster Queue',
          body: 'Cada cliente conectado recibe su propia <code>asyncio.Queue</code> sin bloquear a los demás.',
          foot: 'Soporta decenas de alumnos a la vez',
          color: 'green',
          step: 2
        },
        {
          tag: 'TRANSPORTE WEB',
          title: 'GET /events (SSE)',
          body: 'Flujo unidireccional <code>text/event-stream</code> con reconexión nativa vía <code>EventSource</code>.',
          foot: 'Más simple y liviano que WebSockets',
          color: 'red',
          step: 3
        }
      ],
      takeaway: '¿Por qué SSE y no WebSockets? La telemetría fluye del auto hacia la cabina; EventSource reconecta solo sobre HTTP estándar.',
      builds: ['Generador asíncrono a 10Hz', 'Broadcaster multi-cliente', 'Endpoint HTTP SSE /events'],
      minutes: 2,
      notes: [
        'Explica que en pista real el Raspberry Pi del auto hacía POST a /stream; para el taller, mock_gps_generator reproduce exactamente esa sesión.',
        'Menciona las correcciones que hicimos para 2026: resolución de ruta absoluta del CSV, lectura utf-8-sig para el BOM y lifespan moderno de FastAPI.',
        'Destaca Broadcaster: un solo servidor en Cloud Run puede alimentar a todo el salón de clases simultáneamente.',
        'SSE evita handshakes complejos y pasa limpio por proxies corporativos y Cloud Run.'
      ]
    },

    // 12 — Paso 5A: Clonar repositorio actualizado + preparación GCP
    {
      kind: 'terminal',
      eyebrow: 'PASO 5A · PREPARACIÓN EN GOOGLE CLOUD',
      pillTone: 'yellow',
      timeBadge: '3 MIN',
      title: 'Clona el repo actualizado y habilita Google Cloud',
      subtitle: 'Clonamos github.com/seagomezar/trustable-ai-codelab y activamos las APIs de Cloud Run.',
      filePath: 'trustable-ai-codelab/streaming-telemetry-server',
      checklist: [
        'Clona <code>seagomezar/trustable-ai-codelab</code> y entra a <code>streaming-telemetry-server</code>.',
        'Configura tu <code>PROJECT_ID</code> en <code>gcloud</code> y habilita Cloud Run + Cloud Build.',
        'Ejecuta los 5 tests unitarios (si usarás fallback local, salta el paso 3).'
      ],
      tip: 'Recuerda: NO uses el enlace viejo del Codelab; usa <code>https://github.com/seagomezar/trustable-ai-codelab</code>.',
      codeLabel: 'Terminal 1 — Clonar repo + preparar Google Cloud (Recomendado)',
      code: `# 1. Clonar el nuevo repositorio oficial del taller
git clone https://github.com/seagomezar/trustable-ai-codelab.git
cd trustable-ai-codelab/streaming-telemetry-server

# 2. Verificar parser NMEA + carga de 11,539 puntos VBOX
python -m unittest test_nmea_parsing.py

# 3. Configurar Google Cloud (Ruta Recomendada):
gcloud config set project TU_PROJECT_ID
gcloud services enable run.googleapis.com \\
  cloudbuild.googleapis.com \\
  artifactregistry.googleapis.com`,
      codeFocus: [
        [1, 2, 3, 5, 6],
        [8, 9, 10, 11, 12]
      ],
      stepCallouts: [
        'Clonamos seagomezar/trustable-ai-codelab y validamos que Python pase los 5 tests en ~0.2s.',
        'Habilita Cloud Run, Cloud Build y Artifact Registry en tu proyecto de Google Cloud (o pasa al fallback local).'
      ],
      builds: ['Configurar proyecto y APIs en Google Cloud'],
      minutes: 2,
      notes: [
        'Guía a toda la sala a clonar https://github.com/seagomezar/trustable-ai-codelab.git y configurar su proyecto en gcloud.',
        'Solo quienes no cuenten con proyecto GCP activo pueden omitir gcloud services enable y usar el fallback local en la siguiente lámina.'
      ]
    },

    // 13 — Paso 5B: Desplegar en Cloud Run (Recomendado) o Fallback Local
    {
      kind: 'terminal',
      eyebrow: 'PASO 5B · DESPLIEGUE DEL STREAM SSE',
      pillTone: 'yellow',
      timeBadge: '4 MIN',
      title: 'Despliega en Google Cloud Run (o usa fallback local)',
      subtitle: 'Recomendado: publica el servidor SSE en Cloud Run con URL HTTPS; usa localhost:8000 solo como respaldo.',
      filePath: 'streaming-telemetry-server/ingest.py',
      checklist: [
        '<strong>Recomendado (Cloud Run):</strong> despliega con <code>--no-cpu-throttling</code> para sostener el bucle 10Hz.',
        'Copia la URL HTTPS generada y agrégale <code>/events</code> al final.',
        '<strong>Fallback Local:</strong> sin GCP, activa <code>.venv</code> y corre <code>python ingest.py --mock</code>.'
      ],
      tipTone: 'green',
      tip: '¿Por qué <code>--no-cpu-throttling</code> y <code>--max-instances 1</code>? Mantienen vivo el generador 10Hz de fondo en un único auto compartido.',
      codeLabel: 'Terminal 1 — Despliegue en Cloud Run (Recomendado) + Fallback',
      code: `# OPCIÓN A (RECOMENDADA): Despliegue en Google Cloud Run
gcloud run deploy telemetry-server --source . \\
  --region us-central1 --allow-unauthenticated \\
  --no-cpu-throttling --max-instances 1 --timeout 3600
# -> URL lista: https://telemetry-server-xxx.a.run.app/events

# OPCIÓN B (FALLBACK LOCAL si no tienes GCP activo):
python -m venv .venv
# Windows: .venv\\Scripts\\Activate.ps1 | Unix: source .venv/bin/activate
pip install -r requirements.txt
python ingest.py --mock
# -> Fallback local en http://localhost:8000/events`,
      codeFocus: [
        [1, 2, 3, 4, 5],
        [7, 8, 10, 11, 12]
      ],
      stepCallouts: [
        'Cloud Run compila desde código fuente y publica un endpoint HTTPS listo para compartir.',
        'Fallback de contingencia: Uvicorn sirve exactamente el mismo stream SSE en http://localhost:8000/events.'
      ],
      builds: ['Comandos de Fallback Local (:8000)'],
      minutes: 4,
      notes: [
        'Explica primero los tres flags clave de arquitectura en Cloud Run: --no-cpu-throttling (mantiene vivo asyncio.sleep(0.1)), --max-instances 1 (todos ven el mismo auto) y --timeout 3600 (1 hora de SSE continuo).',
        'Mientras Cloud Build construye el contenedor (~90s), muestra la Opción B en la mitad inferior para cualquiera que necesite el fallback local.'
      ]
    },

    // 13 — Paso 5C: Código interno de ingest.py
    {
      kind: 'code',
      eyebrow: 'PASO 5C · DENTRO DEL SERVIDOR FASTAPI',
      pillTone: 'yellow',
      timeBadge: '3 MIN',
      title: 'Cómo ingest.py emite objetos GPSD TPV cada 100 ms',
      subtitle: 'Observa exactamente qué campos salen del servidor antes de que el frontend haga cualquier cálculo.',
      filePath: 'streaming-telemetry-server/ingest.py:130',
      checklist: [
        'Convierte velocidad de <code>km/h</code> a <code>m/s</code> (estándar GPSD).',
        'Empaqueta solo <code>class</code>, <code>mode</code>, <code>lat</code>, <code>lon</code>, <code>speed</code> y <code>time</code>.',
        'No envía fuerzas G, ni pedal de freno, ni nombre de la curva.'
      ],
      tip: 'Fíjate en lo que FALTA: el servidor envía posición cruda. ¡Si mandas esto directo a un LLM cada 100 ms, solo verá números flotantes sin contexto!',
      codeLabel: 'Generador 10Hz y endpoint SSE en FastAPI',
      code: `tpv = {
    "class": "TPV",
    "device": "mock_csv",
    "mode": 3,
    "time": datetime.now(timezone.utc).isoformat(),
    "lat": round(lat, 7),
    "lon": round(lon, 7),
    "alt": round(alt, 1),
    "speed": round(speed_ms, 2)  # metros por segundo
}
await broadcaster.broadcast(json.dumps(tpv))
await asyncio.sleep(0.1)         # 10 cuadros por segundo (10Hz)

@app.get("/events")
async def sse_events(request: Request):
    return StreamingResponse(event_generator(), media_type="text/event-stream")`,
      codeFocus: [
        [1, 6, 7, 8, 9],
        [11, 12, 14, 15, 16]
      ],
      stepCallouts: [
        'El paquete TPV (Time-Position-Velocity) solo trae lat/lon, altitud y rapidez escalar en m/s.',
        'Cada 0.1s se publica a todas las colas suscritas en /events como líneas "data: {...}\\n\\n".'
      ],
      builds: ['Broadcast 10Hz y StreamingResponse SSE'],
      minutes: 2,
      notes: [
        'Haz zoom mental sobre las líneas 6 a 9: lat, lon, alt y speed en metros por segundo. Nada más.',
        'Pregunta rápida al público: ¿Con solo latitud, longitud y velocidad actual, cómo sabrías si el piloto está frenando o doblando al límite? Eso prepara el Paso 7.'
      ]
    },

    // 14 — Paso 5D: Verificación visual del stream SSE
    {
      kind: 'visual',
      eyebrow: 'PASO 5D · VERIFICACIÓN DEL STREAM',
      pillTone: 'yellow',
      timeBadge: '2 MIN',
      title: 'Comprobando /events en el navegador o con curl -N',
      subtitle: 'Antes de abrir React, verifica que tu tubería de 10Hz esté latiendo sin cortes.',
      image: 'assets/5s-1.png',
      imageAlt: 'Salida en vivo de paquetes data TPV en el endpoint /events',
      callouts: [
        {
          title: '1. Abre tu URL /events en Chrome',
          body: 'Abre <code>https://telemetry-server-...run.app/events</code> (o <code>localhost:8000/events</code> en fallback) para ver líneas <code>TPV</code> a 10Hz.'
        },
        {
          title: '2. Prueba desde terminal con curl -N',
          body: 'Ejecuta <code>curl -N https://TU_CLOUD_RUN_URL/events</code> (o <code>http://localhost:8000/events</code>; <code>-N</code> desactiva el buffer).'
        },
        {
          title: '3. ¿Por qué esto NO es AI-Ready?',
          body: '10 JSONs crudos por segundo ahogan la ventana de contexto y no expresan carga de neumáticos ni intención del piloto.'
        }
      ],
      builds: ['Prueba en terminal con curl -N', 'Diagnóstico: datos crudos vs. datos listos para IA'],
      minutes: 2,
      notes: [
        'Pide a los asistentes abrir su URL HTTPS de Cloud Run terminada en /events (o localhost:8000/events si usaron fallback) y levantar la mano cuando vean correr los objetos TPV.',
        'Muestra el comando curl -N para quienes prefieren validar desde consola.',
        'Conecta con la tesis del taller: tener streaming en tiempo real no significa tener datos listos para razonar.'
      ]
    },

    // 16 — Paso 6A: Ejecutar koru-application
    {
      kind: 'terminal',
      eyebrow: 'PASO 6A DEL CODELAB · FRONTEND KORU',
      pillTone: 'yellow',
      timeBadge: '5 MIN',
      title: 'Inicia el simulador Koru y conecta a Cloud Run',
      subtitle: 'En una segunda terminal levantamos la cabina React + TypeScript + Vite en localhost:5173.',
      filePath: 'trustable-ai-codelab/koru-application',
      checklist: [
        'Ejecuta <code>npm install && npm run dev</code> en <code>koru-application</code>.',
        'Abre <code>http://localhost:5173</code> y pega tu API Key en <strong>⚙️ Settings</strong>.',
        'Pega tu URL HTTPS de <strong>Cloud Run <code>/events</code></strong> (o usa el fallback <strong>Local :8000/events</strong>).'
      ],
      tipTone: 'green',
      tip: 'Si alguien no desplegó en GCP, incluimos botones de fallback en 1 clic: <code>Local :8000/events</code> y <code>Built-in Demo</code>.',
      codeLabel: 'Terminal 2 — Levantar cabina Koru y conectar stream',
      code: `# En una segunda terminal: levantar el frontend Koru
cd trustable-ai-codelab/koru-application

npm install
npm run dev

# 1. Abrir en Chrome: http://localhost:5173
# 2. Clic en ⚙️ (arriba derecha) -> pegar Gemini API Key -> Save
# 3. En Live: pegar https://TU_CLOUD_RUN_URL/events -> Connect
#    (Fallback local: clic en "Local :8000/events" o "Built-in Demo")`,
      codeFocus: [
        [2, 4, 5],
        [7, 8, 9, 10]
      ],
      stepCallouts: [
        'Vite arranca en menos de 1 segundo sobre http://localhost:5173 con Hot Module Replacement activo.',
        'Conecta a tu URL HTTPS de Cloud Run (/events); usa los botones de fallback solo si corriste en local.'
      ],
      builds: ['Configurar API Key y conectar a Cloud Run'],
      minutes: 4,
      notes: [
        'Camina por el salón durante estos 4 minutos para asegurar que todos conecten Koru a su endpoint HTTPS de Cloud Run.',
        'Si algún asistente tuvo inconvenientes con GCP, indícale los botones de fallback Local :8000/events o Built-in Demo para que continúe al mismo ritmo.'
      ]
    },

    // 17 — Paso 6B: Tour visual por la cabina verificada de Koru
    {
      kind: 'visual',
      eyebrow: 'PASO 6B · ANATOMÍA DE LA CABINA KORU',
      pillTone: 'yellow',
      timeBadge: '3 MIN',
      title: 'Qué estás viendo en tiempo real en Koru',
      subtitle: 'Captura verificada recibiendo el stream SSE 10Hz a 78 MPH con mensajes HOT y FEEDFORWARD activos.',
      image: 'assets/koru-live-verified.png',
      imageAlt: 'Interfaz verificada de Koru corriendo telemetría en vivo a 78 MPH',
      callouts: [
        {
          title: 'Telemetría + Círculo G (Izquierda)',
          body: 'Velocímetro en MPH, barras virtuales de acelerador/freno y el punto vivo dentro del Círculo de Fricción 2G.'
        },
        {
          title: 'Mapa GPS + Trazas (Centro)',
          body: 'Posición interpolada sobre el trazado de Sonoma/Thunderhill y gráficas históricas de velocidad y pedales.'
        },
        {
          title: 'AI Coach Radio (Derecha)',
          body: 'Selector de las 5 personas, switch Browser/Gemini TTS y badges de color: <strong>HOT</strong>, <strong>FEEDFORWARD</strong> y <strong>COLD</strong>.'
        }
      ],
      builds: ['Mapa GPS e historial de trazas', 'Panel de Radio con rutas etiquetadas'],
      minutes: 2,
      notes: [
        'Orienta visualmente a los asistentes sobre su propia pantalla usando los tres bloques: izquierda física instantánea, centro contexto espacial, derecha decisiones del coach.',
        'Pídeles cambiar entre Super AJ, AJ y Rachel mientras el auto gira para notar cómo cambian las frases del Hot Path al instante.',
        'Señala las etiquetas de colores en cada mensaje: así auditamos qué subsistema habló y por qué.'
      ]
    },

    // 17 — Paso 6C: Simulador interactivo embebido en las diapositivas
    {
      kind: 'simulator',
      eyebrow: 'DEMO INTERACTIVA EN VIVO · SIN SALIR DEL DECK',
      pillTone: 'blue',
      timeBadge: '3 MIN',
      title: 'Laboratorio en vivo: prueba Personas, Lluvia (0.6g) y Física ON/OFF',
      subtitle: 'Haz clic dentro del simulador para cambiar de coach, activar pista mojada o apagar el grounding físico.',
      builds: [],
      minutes: 3,
      notes: [
        'Interactúa directamente sobre esta diapositiva frente a la audiencia: 1) Cambia de Super AJ a AJ y luego a Garmin para contrastar estilos. 2) Activa el botón Lluvia 0.6g y muestra cómo se contrae el anillo verde del Círculo de Fricción disparando alertas tempranas. 3) Apaga Física OFF para anticipar lo que romperemos en código en el Bloque 03.'
      ]
    },

    // 18 — Divisor Bloque 03
    {
      kind: 'section',
      background: 'var(--pastel-green)',
      eyebrow: 'BLOQUE 03 · DATOS AI-READY Y GUARDRAILS',
      pillTone: 'green',
      timeBadge: 'PASOS 7 Y 8 · 26 MIN',
      title: 'Transformar coordenadas en física y reglas seguras',
      subtitle: 'Ahora abriremos el editor para modificar sensores y prompts y ver cómo reacciona el coach en caliente.',
      heroTone: 'green',
      blockTag: 'EXPERIMENTOS EN VIVO · PASOS 7–8',
      heroTitle: 'Ingeniería de Datos + Física de Dominio + Guardrails',
      heroBody: 'Un modelo es tan confiable como las señales que recibe y los límites determinísticos que rodean su razonamiento.',
      goalsTitle: 'Tres experimentos prácticos que haremos ahora',
      goals: [
        '<strong>Paso 7:</strong> anular fuerzas G y limitar velocidad a 30 mph en <code>telemetryStreamService.ts</code>.',
        '<strong>Paso 8A:</strong> auditar el Círculo de Fricción y los umbrales de <code>DECISION_MATRIX</code>.',
        '<strong>Paso 8B:</strong> borrar <code>RACING_PHYSICS_KNOWLEDGE</code> y ver degradarse a Gemini 3.8 Flash.'
      ],
      builds: ['Círculo de Fricción y DECISION_MATRIX', 'Experimento de ablación física en Gemini'],
      minutes: 2,
      notes: [
        'Invita a todos a abrir VS Code o su editor en la carpeta koru-application/src.',
        'Adelanta que revisaremos tanto las reglas determinísticas como las leyes físicas del neumático.',
        'Explica la metodología científica del bloque: haremos ablaciones controladas (apagar una señal o una regla a la vez) y revertiremos con Ctrl+Z.'
      ]
    },

    // 19 — Paso 7: De GPS crudo a sensores virtuales AI-Ready
    {
      kind: 'diagram',
      eyebrow: 'PASO 7 DEL CODELAB · INGENIERÍA DE SEÑALES',
      pillTone: 'green',
      timeBadge: '3 MIN',
      title: 'Cómo processPoint() crea sensores virtuales desde GPS',
      subtitle: 'Nuestro CSV solo tiene latitud, longitud y velocidad. El navegador deduce la dinámica vehicular entre pares de muestras.',
      diagram: [
        {
          tag: '1. RUMBO (HEADING)',
          title: 'atan2(Δlon, Δlat)',
          body: 'Compara el punto actual con <code>prevPoint</code> (hace 0.1 s) para calcular hacia dónde apunta el auto.',
          foot: 'Grados -180° a +180°',
          color: 'blue'
        },
        {
          tag: '2. G LONGITUDINAL',
          title: 'Δvelocidad / (dt · 9.81)',
          body: 'Desaceleración negativa indica frenada; aceleración positiva indica empuje longitudinal.',
          foot: 'Frenada / Aceleración en Gs',
          color: 'yellow',
          step: 1
        },
        {
          tag: '3. G LATERAL',
          title: '(v · yawRate) / 9.81',
          body: 'Velocidad multiplicada por la tasa de giro mide cuánta carga lateral soportan las llantas.',
          foot: 'Carga en curva (-3G a +3G)',
          color: 'green',
          step: 2
        },
        {
          tag: '4. PEDALES VIRTUALES',
          title: 'Brake % y Throttle %',
          body: 'Si el hardware no trae sensores CAN-bus, estima presión de freno y acelerador desde <code>gLong</code>.',
          foot: 'TelemetryFrame listo para IA',
          color: 'red',
          step: 3
        }
      ],
      takeaway: 'Nunca envíes telemetría cruda a un agente: calcula primero las magnitudes que determinan la decisión.',
      builds: ['Cálculo de G-Longitudinal', 'Cálculo de G-Lateral centrípeta', 'Estimación de pedales virtuales'],
      minutes: 3,
      notes: [
        'Explica cómo dos puntos GPS separados 100 ms bastan para obtener el vector de rumbo.',
        'La derivada de la rapidez respecto al tiempo dividida por 9.81 m/s² nos entrega las Gs de frenado o aceleración.',
        'Y rapidez por velocidad angular (yawRate) nos da la aceleración centrípeta G-Lat: el corazón del coaching en curva.',
        'Gracias a esta capa, tanto las reglas locales como Gemini leen "Brake 85%, G-Lat 1.2G" en lugar de latitudes indescifrables.'
      ]
    },

    // 20 — Paso 7 Experimento A: Anular fuerzas G
    {
      kind: 'code',
      eyebrow: 'PASO 7 · EXPERIMENTO PRÁCTICO A',
      pillTone: 'green',
      timeBadge: '4 MIN',
      title: 'Experimento 1: ¿Qué pasa si el coach queda ciego a las Gs?',
      subtitle: 'Abre telemetryStreamService.ts alrededor de la línea 188, fuerza gLat y gLong a cero y mira la cabina.',
      filePath: 'src/services/telemetryStreamService.ts:188',
      checklist: [
        'Localiza <code>// Clamp G-forces</code> en <code>processPoint()</code>.',
        'Agrega temporalmente <code>gLat = 0; gLong = 0;</code> y guarda.',
        'Observa el Círculo G congelado y luego revierte el cambio (<code>Ctrl+Z</code>).'
      ],
      tipTone: 'red',
      tip: 'Resultado inmediato: desaparecen <code>THRESHOLD</code>, <code>TRAIL_BRAKE</code> y <code>COMMIT</code>. Sin fuerzas G, el coach cree que vas paseando en línea recta.',
      codeLabel: 'Experimento temporal — Cegar sensores de carga (¡revertir después!)',
      code: `    // Derive G-forces if not provided
    if (this.prevPoint && point.gLat === undefined) {
      gLong = (speedMs - prevSpeedMs) / (dt * 9.81);
      const yawRate = (dHeading * Math.PI / 180) / dt;
      gLat = (speedMs * yawRate) / 9.81;
    }

    // Clamp G-forces
    gLat = Math.max(-3, Math.min(3, gLat));
    gLong = Math.max(-3, Math.min(3, gLong));

    // 🧪 EXPERIMENTO PASO 7A: anular fuerzas G temporalmente
    gLat = 0;
    gLong = 0;`,
      codeFocus: [
        [2, 3, 4, 5],
        [12, 13, 14]
      ],
      stepCallouts: [
        'Aquí nacen las fuerzas G reales a partir de delta de velocidad y velocidad angular.',
        'Al sobrescribirlas con 0, el punto azul del Círculo G muere en el centro y el coaching en curva calla.'
      ],
      builds: ['Sobrescribir gLat = 0 y gLong = 0'],
      minutes: 3,
      notes: [
        'Haz este cambio en vivo o pide a la audiencia hacerlo en la línea 190 de telemetryStreamService.ts.',
        'Muestra cómo el auto sigue recorriendo el mapa a 78+ mph, pero el coach pierde toda noción de riesgo en curva. Recuerda pedirles hacer Ctrl+Z antes de pasar al siguiente experimento.'
      ]
    },

    // 21 — Paso 7 Experimento B: Limitar velocidad a 30 mph
    {
      kind: 'code',
      eyebrow: 'PASO 7 · EXPERIMENTO PRÁCTICO B',
      pillTone: 'green',
      timeBadge: '4 MIN',
      title: 'Experimento 2: Engañar al pipeline limitando a ~30 MPH',
      subtitle: 'En la línea 163 limita speedKmh a 48 y observa cómo cambian tanto el Hot Path como Gemini.',
      filePath: 'src/services/telemetryStreamService.ts:163',
      checklist: [
        'Cambia el cálculo de <code>speedKmh</code> usando <code>Math.min(..., 48)</code>.',
        'Mira cómo caen también <code>gLat</code> y el tono de urgencia del coach.',
        '<strong>¡Importante!</strong> Restaura la línea original antes de avanzar al Paso 8.'
      ],
      tip: 'Curiosidad real: en una copia estudiantil del repositorio este cambio había quedado guardado por accidente y hacía que el auto nunca pasara de 48.',
      codeLabel: 'Experimento temporal — Tope artificial de velocidad (revertir con Ctrl+Z)',
      code: `  private processPoint(point: GpsSSEPoint) {
    const rawDt = this.prevPoint ? now - this.prevTime : 0.1;
    const dt = rawDt > 0.02 && rawDt < 2.0 ? rawDt : 0.1;

    // Línea original:
    // const speedKmh = point.speed > 200 ? point.speed : point.speed * 3.6;

    // 🧪 EXPERIMENTO PASO 7B: limitar a 48 (~30 mph)
    let speedKmh = point.speed > 200 ? point.speed : point.speed * 3.6;
    speedKmh = Math.min(speedKmh, 48);
    const speedMs = speedKmh / 3.6;`,
      codeFocus: [
        [5, 6],
        [8, 9, 10, 11]
      ],
      stepCallouts: [
        'En condiciones normales convertimos m/s del servidor TPV multiplicando por 3.6.',
        'Al topar en 48, fast (speed > 80) jamás se cumple y si frenas dispara DONT_BE_A_WUSS por frenar a baja velocidad.'
      ],
      builds: ['Aplicar tope Math.min(speedKmh, 48)'],
      minutes: 3,
      notes: [
        'Cuenta la anécdota real al revisar el ZIP descargado: tenía exactamente este Math.min(speedKmh, 48) olvidado de una sesión previa, y por eso limpiamos la línea base.',
        'Verifica con la sala que todos hayan revertido ambos experimentos de telemetryStreamService.ts antes de pasar al Paso 8.'
      ]
    },

    // 22 — Paso 8: Física del Círculo de Fricción y Transferencia de Peso
    {
      kind: 'physics',
      eyebrow: 'PASO 8 DEL CODELAB · CONOCIMIENTO DE DOMINIO',
      pillTone: 'green',
      timeBadge: '4 MIN',
      title: 'La física que un LLM generalista no aplica sin ayuda',
      subtitle: 'Dos leyes gobiernan cada instrucción válida en pista: presupuesto total de agarre y balance de masas.',
      left: {
        tag: 'LEY 1 · CÍRCULO DE FRICCIÓN',
        title: '100% de agarre compartido',
        body: 'El neumático reparte su tracción entre frenar y girar: <code>√(G_long² + G_lat²) ≤ μ_max</code>. Si usas 100% frenando, tienes <strong>0% para doblar</strong> (subviraje).',
        fix: '<strong>Solución — Trail Braking:</strong> liberar freno progresivamente a medida que abres dirección hacia el vértice.'
      },
      right: {
        tag: 'LEY 2 · TRANSFERENCIA DE PESO',
        title: 'El pedal mueve la carga entre ejes',
        body: 'Cada cambio en el pedal altera qué llantas tienen agarre disponible en milisegundos:',
        boxes: [
          {
            title: 'Frenada → Peso Adelante',
            text: 'Sube el agarre delantero (ideal para inscribir la trompa), pero <strong>se descarga el eje trasero</strong>.'
          },
          {
            title: 'Acelerador → Peso Atrás',
            text: 'Planta las ruedas traseras a la salida de la curva, pero aligera la dirección delantera.'
          }
        ],
        warning: '<strong>Error fatal de IA ingenua:</strong> pedir “levanta el pie de golpe” en plena curva descarga atrás y causa trompo (<em>lift-off oversteer</em>).'
      },
      builds: ['Círculo de Fricción y Trail Braking', 'Transferencia de peso y sobreviraje'],
      minutes: 3,
      notes: [
        'Tómate 3 minutos para disfrutar esta diapositiva visual: es el puente entre ingeniería de software y mundo físico.',
        'Señala en el diagrama SVG izquierdo el punto azul (Trail Brake sobre el arco verde óptimo) frente al punto rojo fuera del círculo (Understeer: el auto sigue derecho).',
        'En la tarjeta derecha recuerda el Paso 3: ahora todos entienden matemáticamente por qué "suelta el acelerador en mitad de la Curva 1" era un consejo peligroso.'
      ]
    },

    // 23 — Paso 8A: Guardrails determinísticos en DECISION_MATRIX
    {
      kind: 'code',
      eyebrow: 'PASO 8A · GUARDRAILS DETERMINÍSTICOS',
      pillTone: 'green',
      timeBadge: '3 MIN',
      title: 'Reglas explícitas donde nunca debes “adivinar”',
      subtitle: 'DECISION_MATRIX codifica umbrales verificables que funcionan igual hoy, mañana y sin internet.',
      filePath: 'src/utils/coachingKnowledge.ts:70',
      checklist: [
        'Evalúa predicados booleanos puros sobre cada <code>TelemetryFrame</code>.',
        'Garantiza latencia cero y comportamiento 100% auditable por ingenieros.',
        'Separa el <em>qué hacer</em> (<code>CoachAction</code>) de <em>cómo decirlo</em> (persona).'
      ],
      tipTone: 'green',
      tip: 'Principio clave: si una regla de seguridad se escribe en un <code>if</code> de una línea, <strong>no la delegues a un prompt probabilístico</strong>.',
      codeLabel: 'Matriz de decisión determinística en TypeScript',
      code: `export const DECISION_MATRIX: DecisionRule[] = [
  {
    action: "THRESHOLD",
    condition: "Heavy braking with strong decel",
    check: (f) => f.brake > 50 && f.gLong < -0.8,
  },
  {
    action: "TRAIL_BRAKE",
    condition: "Light braking while cornering",
    check: (f) => f.brake > 10 && Math.abs(f.gLat) > 0.4,
  },
  {
    action: "COMMIT",
    condition: "High lateral G but low throttle",
    check: (f) => Math.abs(f.gLat) > 1.0 && f.throttle < 20,
  },
  {
    action: "COAST",
    condition: "No throttle and no brake — coasting (bad!)",
    check: (f) => f.throttle < 10 && f.brake < 10 && f.speed > 60,
  },
];`,
      codeFocus: [
        [2, 3, 4, 5, 7, 8, 9, 10],
        [12, 13, 14, 15, 17, 18, 19, 20]
      ],
      stepCallouts: [
        'THRESHOLD y TRAIL_BRAKE detectan frenada pura vs. frenada combinada con apoyo lateral.',
        'COMMIT y COAST capturan dudas del piloto: ir flotando sin pedales por encima de 60 descarga la plataforma.'
      ],
      builds: ['Reglas de compromiso y detección de coasting'],
      minutes: 3,
      notes: [
        'Muestra la limpieza arquitectónica de DECISION_MATRIX: un ingeniero de pista puede leer y firmar estos umbrales sin saber nada de LLMs.',
        'Además, observa que devuelve un enum tipado (CoachAction), imposible de inyectar con texto arbitrario.'
      ]
    },

    // 24 — Paso 8B: Experimento vaciando RACING_PHYSICS_KNOWLEDGE
    {
      kind: 'code',
      eyebrow: 'PASO 8B · EXPERIMENTO DE ABLACIÓN EN GEMINI',
      pillTone: 'green',
      timeBadge: '4 MIN',
      title: 'Experimento 3: Vaciar el conocimiento físico del prompt',
      subtitle: 'En coachingKnowledge.ts línea 115 reemplaza RACING_PHYSICS_KNOWLEDGE por cadena vacía y compara el Cold Path.',
      filePath: 'src/utils/coachingKnowledge.ts:115',
      checklist: [
        'Comenta o vacía temporalmente <code>RACING_PHYSICS_KNOWLEDGE = ``</code>.',
        'Espera un mensaje <strong>COLD</strong> de Gemini: se vuelve genérico (“ve con cuidado”).',
        'Restaura el bloque con Círculo de Fricción + curvas específicas de pista.'
      ],
      tipTone: 'red',
      tip: 'Sin anclaje de dominio, el modelo recurre a clichés de manejo urbano que contradicen la conducción deportiva en circuito.',
      codeLabel: 'Grounding de dominio inyectado al Cold Path',
      code: `// 🧪 EXPERIMENTO PASO 8B: prueba vaciar esta constante a \`\` y comparar
export const RACING_PHYSICS_KNOWLEDGE = \`
CORE PRINCIPLES:
1. **The Friction Circle:** A tire has 100% grip.
   - Turning while 100% braking = Understeer (Plowing).
   - Fix: "Trail braking" (release brake as steering increases).

2. **Weight Transfer:**
   - Braking shifts weight forward (Front grip UP, Rear grip DOWN).
   - Error: Lifting off throttle mid-corner -> Oversteer (Spin risk).

THUNDERHILL EAST SPECIFICS:
- **Turn 2 (Carousel):** Patience is key. Late apex for early throttle.
- **Turn 9 (Crest):** Road drops away. Brake *before* the crest.
\`;`,
      codeFocus: [
        [1, 2],
        [4, 5, 6, 8, 9, 10],
        [12, 13, 14]
      ],
      stepCallouts: [
        'Vaciar esta constante demuestra cuánto aporta el contexto experto frente al peso base del modelo.',
        'Las reglas explícitas de causa-efecto evitan que Gemini sugiera levantar el pie en mitad del apoyo.',
        'Los datos topográficos locales (como la cresta ciega de Turn 9) son imposibles de deducir solo desde lat/lon.'
      ],
      builds: ['Principios causales de física', 'Conocimiento específico de curvas y topografía'],
      minutes: 3,
      notes: [
        'Pide a quienes tengan API Key configurada hacer la prueba: vaciar la constante, observar un mensaje COLD y restaurarla.',
        'Muestra cómo los principios causales anclan el vocabulario técnico del modelo.',
        'Resalta Turn 9 (Crest): cuando el asfalto cae tras una loma, la fuerza normal disminuye y las llantas pierden agarre; ningún GPS plano te advierte eso si no inyectas conocimiento del terreno.'
      ]
    },

    // 25 — Paso 8C: Actualización SDK 2026 con @google/genai Interactions API
    {
      kind: 'code',
      eyebrow: 'PASO 8C · MODERNIZACIÓN SDK GEMINI 2026',
      pillTone: 'blue',
      timeBadge: '3 MIN',
      title: 'Cold Path actualizado a @google/genai + Interactions API',
      subtitle: 'Migramos el Codelab desde modelos 2.5 heredados hacia gemini-3.8-flash con client.interactions.create.',
      filePath: 'src/services/coachingService.ts:260',
      checklist: [
        'Paquete actualizado a <code>@google/genai ^3.3.0</code>.',
        '<code>system_instruction</code> separa la identidad del coach de los datos del frame.',
        'Sin parámetros obsoletos de muestreo: razonamiento limpio y baja latencia.'
      ],
      tipTone: 'green',
      tip: 'En <code>Analysis.tsx</code> usamos además <code>gemini-4-argon</code> para comparar dos vueltas completas (con fallback automático a <code>gemini-3.8-flash</code>).',
      codeLabel: 'Llamada moderna a Gemini 3.8 Flash en coachingService.ts',
      code: `const prompt = \`\${RACING_PHYSICS_KNOWLEDGE}
Current Telemetry:
Speed: \${frame.speed.toFixed(1)} mph | Brake: \${frame.brake.toFixed(0)}%
G-Lat: \${frame.gLat.toFixed(2)} | G-Long: \${frame.gLong.toFixed(2)}
Location: \${cornerName} - \${cornerAdvice}
Give a short coaching instruction + brief physics explanation.\`;

const client = new GoogleGenAI({ apiKey: this.apiKey });
const interaction = await client.interactions.create({
  model: "gemini-3.8-flash",
  system_instruction: coach.systemPrompt,
  input: prompt,
});
const text = interaction.output_text || "";
if (text) this.emit({ path: "cold", text });`,
      codeFocus: [
        [1, 2, 3, 4, 5, 6],
        [8, 9, 10, 11, 12, 13],
        [14, 15]
      ],
      stepCallouts: [
        'El prompt combina física invariante + telemetría instantánea + geocerca actual.',
        'client.interactions.create unifica llamadas multimodales, estado y configuración del sistema.',
        'interaction.output_text entrega la respuesta limpia lista para UI y síntesis de voz.'
      ],
      builds: ['Llamada unificada client.interactions.create', 'Lectura directa de output_text'],
      minutes: 3,
      notes: [
        'Explica por qué esta actualización era clave para mañana en DevFest: el código original usaba gemini-2.5-flash con generateContent antiguo.',
        'Con @google/genai 3.3.0 e Interactions API separamos limpiamente system_instruction del input dinámico.',
        'Y interaction.output_text evita parseos frágiles de candidatos anidados.'
      ]
    },

    // 26 — Divisor Bloque 04
    {
      kind: 'section',
      background: 'var(--pastel-red)',
      eyebrow: 'BLOQUE 04 · PERSONAS, VOZ Y PRODUCCIÓN',
      pillTone: 'red',
      timeBadge: 'PASOS 9 A 12 · 22 MIN',
      title: 'La última milla de la confianza es humana',
      subtitle: 'Un cálculo perfecto comunicado con el tono equivocado hace que el piloto apague la radio.',
      heroTone: 'red',
      blockTag: 'TRAMO FINAL · PASOS 9–12',
      heroTitle: 'Personalidad Adaptativa, Voz Expresiva y Observabilidad',
      heroBody: 'Cerraremos el taller ajustando personas y síntesis de voz, instrumentando trazas en Chrome DevTools y proyectando esta arquitectura a tu propia industria.',
      goalsTitle: 'Lo que completaremos en el cierre',
      goals: [
        '<strong>Paso 9:</strong> comparar las 5 personas, romper a AJ con cortesía excesiva y probar Gemini TTS.',
        '<strong>Paso 10:</strong> activar las 3 sondas <code>console.log</code> en DevTools y limpiar recursos Cloud.',
        '<strong>Pasos 11–12:</strong> retos avanzados (Gemini Nano, lluvia) y los 5 Pilares de IA Confiable.'
      ],
      builds: ['Observabilidad en DevTools y limpieza GCP', 'Retos de ingeniería y 5 Pilares finales'],
      minutes: 2,
      notes: [
        'Energiza a la sala para los últimos 20 minutos: aquí es donde la ingeniería se siente viva porque el sistema empieza a hablarnos.',
        'Recuerda tener el volumen de las laptops moderado o audífonos listos para probar el motor de voz y DevTools.',
        'Cerraremos conectando este patrón con los problemas reales de arquitectura de cada asistente.'
      ]
    },

    // 27 — Paso 9: Matriz de las 5 personas de coaching
    {
      kind: 'personas',
      eyebrow: 'PASO 9 DEL CODELAB · DISEÑO DE INTERACCIÓN',
      pillTone: 'red',
      timeBadge: '3 MIN',
      title: 'Misma física, cinco estilos cognitivos distintos',
      subtitle: 'Cada piloto procesa diferente la presión a 100 MPH; por eso separamos la verdad física de la entrega verbal.',
      personas: [
        {
          icon: 'TY',
          name: 'Tony',
          style: 'Motivacional · Sensaciones',
          quote: 'Breathe off the brake — feel the car rotate!',
          voice: 'Puck (enérgica)',
          browser: 'rate 1.4 · pitch 1.3'
        },
        {
          icon: 'RC',
          name: 'Rachel',
          style: 'Técnica · Dinámica pura',
          quote: 'Trail off the brake — front is loaded, ease G-vector.',
          voice: 'Kore (precisa)',
          browser: 'rate 1.0 · pitch 1.1'
        },
        {
          icon: 'AJ',
          name: 'AJ',
          style: 'Ingeniero · Órdenes secas',
          quote: 'Trail. Ease. Throttle. Now.',
          voice: 'Fenrir (firme)',
          browser: 'rate 1.3 · pitch 0.7'
        },
        {
          icon: 'GM',
          name: 'Garmin',
          style: 'Clínico · Datos y deltas',
          quote: 'Trail braking. G-Long: -0.62. Release linearly.',
          voice: 'Charon (neutra)',
          browser: 'rate 0.9 · pitch 0.6'
        },
        {
          icon: 'SA',
          name: 'Super AJ',
          style: 'Adaptativo según riesgo',
          quote: 'Release the brake slowly as you turn — balance the car!',
          voice: 'Zephyr (equilibrada)',
          browser: 'rate 1.1 · pitch 0.9'
        }
      ],
      takeaway: 'Super AJ cambia automáticamente de tono: imperativo en peligro de trompo, técnico en línea, motivador si dudas.',
      builds: ['Rachel: clínica y física', 'AJ: comandos ultra cortos', 'Garmin: telemetría numérica', 'Super AJ: adaptativo por tipo de error'],
      minutes: 3,
      notes: [
        'Tony sirve para pilotos novatos que necesitan confianza para comprometerse con el agarre.',
        'Rachel habla como instructora de ingeniería vehicular: ideal para entender qué hace el chasis.',
        'AJ usa menos de 12 palabras, cero explicaciones: perfecto cuando vas al límite absoluto.',
        'Garmin entrega números puros y deltas de tiempo sin emoción.',
        'Y Super AJ demuestra personalización contextual: adapta el estilo según si el problema es seguridad, técnica o confianza.'
      ]
    },

    // 28 — Paso 9 Experimento: AJ excesivamente educado
    {
      kind: 'code',
      eyebrow: 'PASO 9 · EXPERIMENTO DE UX Y CARGA COGNITIVA',
      pillTone: 'red',
      timeBadge: '3 MIN',
      title: 'Experimento 4: El desastre del “AJ excesivamente amable”',
      subtitle: 'Edita coachingKnowledge.ts línea 31 para volver a AJ ultra cortés y siente cómo arruina el timing.',
      filePath: 'src/utils/coachingKnowledge.ts:27',
      checklist: [
        'Cambia el <code>systemPrompt</code> de <code>aj</code> pidiéndole disculparse e insistir con cortesía.',
        'Selecciona a <strong>AJ</strong> en Koru y escucha la salida de Gemini.',
        'Revierte para recuperar <code>Keep responses under 12 words</code>.'
      ],
      tipTone: 'red',
      tip: '“Si no es mucha molestia, frena cuando te quede cómodo” es físicamente correcto… ¡pero letalmente lento a 100 MPH!',
      codeLabel: 'Experimento de personalidad en coachingKnowledge.ts',
      code: `  aj: {
    id: "aj",
    name: "AJ",
    style: "Direct, blunt commands",
    icon: "AJ",
    // Original: "You are AJ, a no-nonsense race engineer... under 12 words."
    // 🧪 EXPERIMENTO PASO 9: vuelve a AJ excesivamente educado
    systemPrompt: \`You are AJ, an excessively polite, apologetic butler.
Always say "please", "if convenient", and apologize for interrupting.
Example: "Pardon me, brake gently whenever it feels convenient for you."
Keep responses around 35 flowery words.\`,
  },`,
      codeFocus: [
        [6],
        [7, 8, 9, 10, 11]
      ],
      stepCallouts: [
        'El prompt original impone <12 palabras y prohíbe explicaciones largas.',
        'Al cambiar solo el tono, la física sigue ahí pero la utilidad operativa colapsa por latencia verbal.'
      ],
      builds: ['Inyectar prompt excesivamente cortés'],
      minutes: 3,
      notes: [
        'Este es siempre el experimento que más risas saca en el taller: cuando AJ pide perdón antes de una horquilla, toda la sala entiende de golpe qué significa "presupuesto de atención del usuario".',
        'Recuérdales revertir con Ctrl+Z después de escucharlo.'
      ]
    },

    // 29 — Paso 9B: Voz expresiva con Gemini 3.8 TTS + Fallback
    {
      kind: 'code',
      eyebrow: 'PASO 9B · SÍNTESIS DE VOZ RESILIENTE',
      pillTone: 'red',
      timeBadge: '3 MIN',
      title: 'Voz expresiva con gemini-3.8-flash-lite-tts + Fallback local',
      subtitle: 'Usamos anotaciones speech_metadata para controlar cadencia de radio y degradamos sin silencio si falla la red.',
      filePath: 'src/hooks/useTTS.ts:87',
      checklist: [
        '5 voces preconstruidas: <code>Fenrir</code>, <code>Kore</code>, <code>Puck</code>, <code>Charon</code> y <code>Zephyr</code>.',
        '<code>annotations: [{ type: "speech_metadata", style }]</code> guía la entonación.',
        '<code>catch</code> cae automáticamente a <code>window.speechSynthesis</code>.'
      ],
      tipTone: 'green',
      tip: 'En sistemas críticos nunca permitas que un fallo de API deje mudo al canal de alerta: el fallback local mantiene viva la cabina.',
      codeLabel: 'Síntesis de audio Gemini 3.8 TTS con respaldo Web Speech',
      code: `const interaction = await client.interactions.create({
  model: "gemini-3.8-flash-lite-tts",
  input: [{
    type: "user_input",
    content: [{
      type: "text",
      text,
      annotations: [{ type: "speech_metadata", style }],
    }],
  }],
  response_format: { type: "audio" },
  generation_config: { speech_config: [{ voice }] },
});

// En speak(): resiliencia automática si no hay red o cuota
try {
  await speakGemini(text, apiKey, voice, style);
} catch {
  await speakBrowser(text, browserConfig);
}`,
      codeFocus: [
        [1, 2, 8, 11, 12],
        [15, 16, 17, 18, 19, 20]
      ],
      stepCallouts: [
        'gemini-3.8-flash-lite-tts recibe el estilo vocal de cada coach vía speech_metadata y devuelve WAV en base64.',
        'Si no hay API Key, wifi inestable del evento o límite de cuota, Browser TTS responde en 0 ms.'
      ],
      builds: ['Patrón de resiliencia con fallback a Browser TTS'],
      minutes: 2,
      notes: [
        'Muestra cómo el código actualizado usa gemini-3.8-flash-lite-tts mediante la misma Interactions API.',
        'Resalta el bloque try/catch: en un DevFest con Wi-Fi compartido, ese fallback marca la diferencia entre una demo rota y una aplicación profesional.'
      ]
    },

    // 30 — Paso 10: Observabilidad de punta a punta en DevTools
    {
      kind: 'code',
      eyebrow: 'PASO 10 DEL CODELAB · OBSERVABILIDAD',
      pillTone: 'blue',
      timeBadge: '4 MIN',
      title: 'Audita las 3 capas descomentando nuestras sondas',
      subtitle: 'La confianza también exige observabilidad: ver cada frame entrar, disparar reflejos y recibir estrategia.',
      filePath: 'telemetryStreamService.ts & coachingService.ts',
      checklist: [
        '<strong>Sonda 1:</strong> descomenta <code>PROBE 1</code> (<code>FRAME</code> a 10Hz).',
        '<strong>Sonda 3:</strong> descomenta <code>PROBE 3</code> (<code>Reflex</code> &lt;50 ms).',
        '<strong>Sonda 4:</strong> descomenta <code>PROBE 4</code> (<code>Strategy</code> cada 15 s).'
      ],
      tip: 'Abre Chrome DevTools (<code>F12</code> → Console) y filtra por <code>Reflex|Strategy</code> con expresiones regulares.',
      codeLabel: 'Las 3 sondas listas en el código para descomentar',
      code: `// 1️⃣ telemetryStreamService.ts:219 — Entrada del pipeline (10 veces/seg)
console.log("FRAME", {
  speed: frame.speed.toFixed(1),
  gLat: frame.gLat.toFixed(2),
  brake: frame.brake.toFixed(0),
});

// 2️⃣ coachingService.ts:71 — Ruta Caliente determinística (<50ms)
console.log("Reflex", { action: rule.action, text, coach: this.coachId });

// 3️⃣ coachingService.ts:277 — Ruta Fría asíncrona (Gemini 3.8 Flash)
console.log("Strategy", {
  coach: coach.id,
  chars: text.length,
  preview: text.slice(0, 60),
});`,
      codeFocus: [
        [1, 2, 3, 4, 5, 6],
        [8, 9],
        [11, 12, 13, 14, 15, 16]
      ],
      stepCallouts: [
        'FRAME confirma que la física derivada se actualiza puntualmente cada 100 ms.',
        'Reflex muestra qué regla exacta de DECISION_MATRIX se activó y en qué milisegundo.',
        'Strategy evidencia el desacoplamiento temporal: decenas de frames ocurren mientras Gemini razona.'
      ],
      builds: ['Sonda Reflex del Hot Path', 'Sonda Strategy del Cold Path'],
      minutes: 3,
      notes: [
        'Guía a los asistentes a descomentar PROBE 1 en telemetryStreamService.ts y abrir la consola con F12.',
        'Descomenta PROBE 3 para observar con qué rapidez saltan las reglas determinísticas.',
        'Ver en vivo ~150 logs de FRAME y varios Reflex entre cada log de Strategy fija para siempre en la mente por qué existe el Split-Brain.'
      ]
    },

    // 32 — Paso 10B: Inspección visual DevTools + Limpieza Cloud Run
    {
      kind: 'terminal',
      eyebrow: 'PASO 10B · CONSOLA Y LIMPIEZA DE GOOGLE CLOUD',
      pillTone: 'blue',
      timeBadge: '2 MIN',
      title: 'Verifica la traza en DevTools y apaga Cloud Run',
      subtitle: 'Como desplegamos en Cloud Run con --no-cpu-throttling, eliminamos el servicio al cerrar para dejar cargos en $0.',
      filePath: 'Limpieza responsable en Google Cloud',
      checklist: [
        'Confirma en DevTools → Network el stream <code>events</code> tipo <code>eventsource</code>.',
        'Elimina el servicio <code>telemetry-server</code> en Cloud Run y la imagen en Artifact Registry.',
        'Detén <code>vite</code> con <code>Ctrl+C</code> (y <code>ingest.py</code> si usaste el fallback local).'
      ],
      tipTone: 'red',
      tip: 'Recuerda que <code>--no-cpu-throttling</code> mantiene CPU asignada mientras la instancia esté activa: ¡ejecuta siempre el teardown!',
      codeLabel: 'Comandos de limpieza en Google Cloud Run (+ nota fallback)',
      code: `# 1. Eliminar el servicio de streaming en Google Cloud Run
gcloud run services delete telemetry-server \\
  --region us-central1 --quiet

# 2. Listar y limpiar imágenes del contenedor en Artifact Registry
gcloud artifacts repositories list --location us-central1

gcloud artifacts repositories delete cloud-run-source-deploy \\
  --location us-central1 --quiet

# 3. Detener Vite (y el fallback local si lo usaste): Ctrl+C`,
      codeFocus: [
        [1, 2, 3],
        [5, 6, 8, 9]
      ],
      stepCallouts: [
        'Elimina primero el servicio telemetry-server para detener de inmediato el cómputo sin throttling.',
        'Borra el repositorio de imágenes generado por --source para dejar consumo cero en almacenamiento.'
      ],
      builds: ['Limpieza de Artifact Registry'],
      minutes: 2,
      notes: [
        'Buena ciudadanía de workshops en Google Cloud: guía a todos a ejecutar el delete cuando terminen sus pruebas para dejar la factura en $0.00.',
        'Si aún quieren probar los retos del Paso 11 en vivo, pueden esperar 5 minutos antes de correr estos dos comandos.'
      ]
    },

    // 32 — Paso 11: Cuatro Retos de Ingeniería
    {
      kind: 'steps',
      eyebrow: 'PASO 11 DEL CODELAB · RETOS AVANZADOS',
      pillTone: 'yellow',
      timeBadge: '4 MIN',
      title: 'Cuatro desafíos para llevar el prototipo más lejos',
      subtitle: 'Elige uno para experimentar ahora o como hackeo posterior al taller.',
      items: [
        {
          tag: 'RETO 01 · EDGE AI',
          title: 'Gemini Nano en Chrome',
          body: 'Usa la Prompt API integrada de Chrome (<code>LanguageModel.create()</code>) como ruta intermedia sin red (~250 ms).',
          foot: 'Cero costo · 100% local en GPU'
        },
        {
          tag: 'RETO 02 · CLIMA',
          title: 'Modo Lluvia (0.6x Grip)',
          body: 'Añade un toggle que escale los umbrales G de <code>DECISION_MATRIX</code> por <code>0.6</code> e informe pista mojada al prompt.',
          foot: 'Física dinámica adaptable'
        },
        {
          tag: 'RETO 03 · SFT',
          title: 'Fine-Tuning Supervisado',
          body: 'Exporta pares <code>(TelemetryFrame, instrucción ideal)</code> de vueltas récord para afinar un modelo ligero.',
          foot: 'Estilo consistente en <10 tokens'
        },
        {
          tag: 'RETO 04 · DOMINIOS',
          title: 'Transfiere la Arquitectura',
          body: 'Reemplaza <code>TelemetryFrame</code> y <code>DECISION_MATRIX</code> por sensores de tu propia industria.',
          foot: 'Salud · Planta · Flotas · Energía'
        }
      ],
      takeaway: '¿Dónde vive hoy un “chatbot lento” en tu empresa que en realidad debería ser una arquitectura Split-Brain?',
      builds: ['Reto 02: Modo Lluvia 0.6x', 'Reto 03: Fine-Tuning con vueltas expertas', 'Reto 04: Adaptación a tu industria'],
      minutes: 3,
      notes: [
        'Conecta el Reto 01 con el track Web de este mismo repositorio: Chrome Built-in AI permite correr inferencia local entre el Hot Path y la nube.',
        'El Reto 02 toma 5 minutos implementarlo: multiplicar los umbrales de gLat y gLong por 0.6 simula asfalto mojado.',
        'El Reto 03 muestra cómo recolectar datasets de oro desde sesiones reales.',
        'Y el Reto 04 abre la conversación final del taller: esto nunca trató solo de autos de carrera.'
      ]
    },

    // 33 — Paso 11B: Matriz de transferencia a otras industrias
    {
      kind: 'domains',
      eyebrow: 'PASO 11B · MÁS ALLÁ DE LA PISTA',
      pillTone: 'green',
      timeBadge: '3 MIN',
      title: 'El mismo patrón Split-Brain en industrias críticas',
      subtitle: 'Cambia el sensor de entrada, pero conserva las cuatro capas de confiabilidad.',
      headers: ['Industria', 'Stream de Alta Frecuencia', 'Hot Path Determinístico (<50 ms)', 'Cold Path Gemini (2–5 s)'],
      rows: [
        [
          'Salud / UCI',
          'ECG, SpO₂ y presión arterial continua',
          'Umbral de hipoxia o arritmia → alarma inmediata en cama',
          'Correlaciona historial farmacológico y tendencia de 30 min para el médico'
        ],
        [
          'Manufactura',
          'Vibración MEMS, corriente y temperatura CNC',
          'Paro de emergencia si vibración supera límite mecánico',
          'Diagnostica desgaste de rodamiento y sugiere ventana de mantenimiento'
        ],
        [
          'Logística / Flotas',
          'CAN-bus, telemetría GPS y cámara ADAS',
          'Alerta instantánea de distancia de frenado o microsueño',
          'Coaching eficiente de combustible y ruta según topografía y carga'
        ],
        [
          'Red Eléctrica / FinOps',
          'Frecuencia de red (60Hz) o telemetría APM de pagos',
          'Circuit breaker / balanceo automático ante pico súbito',
          'Análisis de causa raíz (RCA) accionable para el ingeniero de guardia'
        ]
      ],
      takeaway: '1) ¿Cuál es tu frame 10Hz?  2) ¿Qué jamás debe alucinar?  3) ¿Qué física ancla al modelo?  4) ¿Cuántas palabras tolera tu usuario?',
      builds: ['Manufactura e Industria 4.0', 'Flotas y seguridad vial', 'Energía, pagos y SRE en tiempo real'],
      minutes: 2,
      notes: [
        'Empieza por Salud / UCI: signos vitales continuos donde una alarma jamás puede esperar a la nube.',
        'En Manufactura CNC, el Hot Path protege la máquina en milisegundos y Gemini diagnostica el rodamiento.',
        'En Flotas y Logística es literalmente primo hermano de nuestro caso en pista.',
        'Lee las 4 preguntas de diseño de la barra inferior: son la plantilla que pueden llevarse el lunes a su equipo de arquitectura.'
      ]
    },

    // 34 — Paso 12: Cierre — Los 5 Pilares de la IA Confiable
    {
      kind: 'diagram',
      eyebrow: 'PASO 12 DEL CODELAB · SÍNTESIS FINAL',
      pillTone: 'green',
      timeBadge: '2 MIN',
      title: 'Los 5 Pilares para construir IA Confiable',
      subtitle: 'Lo que aprendimos hoy a 100 MPH aplica a cualquier producto con modelos generativos en producción.',
      diagram: [
        {
          tag: 'PILAR 1',
          title: 'Datos AI-Ready',
          body: 'Transforma flujos crudos en vectores con significado físico antes de razonar.',
          foot: 'Paso 7 · Sensores virtuales',
          color: 'blue'
        },
        {
          tag: 'PILAR 2',
          title: 'Split-Brain',
          body: 'Desacopla reflejos urgentes (&lt;50 ms) del razonamiento profundo en nube.',
          foot: 'Paso 4 · Hot vs Cold Path',
          color: 'yellow',
          step: 1
        },
        {
          tag: 'PILAR 3',
          title: 'Dominio Real',
          body: 'Inyecta leyes causales y contexto local que el LLM no puede adivinar.',
          foot: 'Paso 8 · Círculo de Fricción',
          color: 'green',
          step: 2
        },
        {
          tag: 'PILAR 4',
          title: 'Guardrails + UX',
          body: 'Reglas determinísticas auditables y voz adaptada a la carga cognitiva humana.',
          foot: 'Pasos 8, 9 y 10 · Confianza total',
          color: 'red',
          step: 3
        }
      ],
      takeaway: 'La confianza no se pide en un prompt: se diseña en la arquitectura completa alrededor del modelo.',
      builds: ['Pilar 2: Arquitectura Split-Brain', 'Pilar 3: Conocimiento experto de dominio', 'Pilar 4 & 5: Guardrails determinísticos y UX humana'],
      minutes: 2,
      notes: [
        'Pilar 1: convierte telemetría cruda en señales AI-Ready con significado físico.',
        'Pilar 2: separa el presupuesto de latencia urgente del razonamiento profundo.',
        'Pilar 3: ancla el modelo con leyes causales y topografía real.',
        'Lee la frase clave final: "La confianza no se pide en un prompt: se diseña en la arquitectura completa alrededor del modelo."'
      ]
    },

    // 36 — Recursos, enlaces e insignia oficial
    {
      kind: 'statement',
      eyebrow: 'RECURSOS Y BADGE OFICIAL',
      pillTone: 'yellow',
      timeBadge: '1 MIN',
      title: 'Todo listo para seguir experimentando en casa',
      subtitle: 'Completa el quiz final en Google Codelabs para reclamar la insignia oficial en tu perfil de Google Developer.',
      specs: [
        { term: 'Repositorio Actualizado', detail: '<a href="https://github.com/seagomezar/trustable-ai-codelab" target="_blank" rel="noopener"><code>https://github.com/seagomezar/trustable-ai-codelab</code></a> (reemplaza el enlace antiguo)' },
        { term: 'Codelab Oficial', detail: '<a href="https://codelabs.developers.google.com/codelabs/trustable-at-100-mph?hl=en" target="_blank" rel="noopener"><code>codelabs.developers.google.com/codelabs/trustable-at-100-mph</code></a>' },
        { term: 'Modelos Utilizados', detail: '<code>gemini-3.8-flash</code> · <code>gemini-4-argon</code> · <code>gemini-3.8-flash-lite-tts</code> (<code>@google/genai ^3.3.0</code>)' },
        { term: 'Sitio Web y Redes', detail: '<a href="https://www.sebastian-gomez.com/" target="_blank" rel="noopener"><code>www.sebastian-gomez.com</code></a> · <a href="https://www.linkedin.com/in/sebastian-gomez-software/" target="_blank" rel="noopener">LinkedIn</a> · <a href="https://x.com/sebasgojs" target="_blank" rel="noopener"><code>@sebasgojs</code></a> · <a href="https://github.com/seagomezar" target="_blank" rel="noopener"><code>github: seagomezar</code></a>' }
      ],
      links: [
        { label: 'Repositorio GitHub Actualizado', href: 'https://github.com/seagomezar/trustable-ai-codelab' },
        { label: 'Abrir Codelab Oficial', href: 'https://codelabs.developers.google.com/codelabs/trustable-at-100-mph?hl=en' },
        { label: 'Obtener Gemini API Key', href: 'https://aistudio.google.com/app/apikey' },
        { label: 'www.sebastian-gomez.com', href: 'https://www.sebastian-gomez.com/' }
      ],
      builds: [],
      minutes: 1,
      notes: [
        'Invita a todos a guardar https://github.com/seagomezar/trustable-ai-codelab con estrella y reclamar la insignia oficial "Official Racing Coach" en su perfil de Google Developer respondiendo el quiz final del Codelab.'
      ]
    },

    // 37 — Cierre y Preguntas
    {
      kind: 'closing',
      eyebrow: '¡BANDERA A CUADROS! · DEVFEST PEREIRA 2026',
      timeBadge: 'PREGUNTAS Y DEMO ABIERTA',
      title: '¡Gracias, Pereira!',
      subtitle: 'Construyamos sistemas de IA veloces, físicamente honestos y dignos de confianza humana.',
      coauthors: '🌐 <a href="https://www.sebastian-gomez.com/" target="_blank" rel="noopener"><strong>www.sebastian-gomez.com</strong></a> · 💼 <a href="https://www.linkedin.com/in/sebastian-gomez-software/" target="_blank" rel="noopener"><strong>linkedin.com/in/sebastian-gomez-software</strong></a><br>𝕏 <a href="https://x.com/sebasgojs" target="_blank" rel="noopener"><strong>x.com/sebasgojs</strong></a> · 💻 GitHub: <a href="https://github.com/seagomezar" target="_blank" rel="noopener"><strong>seagomezar</strong></a> · Repo: <a href="https://github.com/seagomezar/trustable-ai-codelab" target="_blank" rel="noopener"><code>seagomezar/trustable-ai-codelab</code></a>',
      links: [
        { label: 'www.sebastian-gomez.com', href: 'https://www.sebastian-gomez.com/' },
        { label: 'LinkedIn', href: 'https://www.linkedin.com/in/sebastian-gomez-software/' },
        { label: 'X · @sebasgojs', href: 'https://x.com/sebasgojs' },
        { label: 'GitHub · seagomezar', href: 'https://github.com/seagomezar' }
      ],
      photo: 'assets/sebastian-gomez.jpg',
      codelabBadge: 'assets/codelab-badge.svg',
      badge: 'assets/gde-web-badge.svg',
      speakerName: 'Sebastián Gómez',
      speakerRole: 'Google Developer Expert · Web Technologies',
      speakerSite: 'www.sebastian-gomez.com',
      speakerSiteUrl: 'https://www.sebastian-gomez.com/',
      speakerTitle: 'Engineering Manager en Twilio',
      builds: [],
      minutes: 2,
      notes: [
        'Agradece a los organizadores de GDG Pereira y abre el micrófono para preguntas, revisión de experimentos de los asistentes e intercambio de ideas sobre sus propios casos de uso.'
      ]
    }
  ]
};
