// Official Workshop: Building Trustable AI at 100 MPH — English (DevFest Pereira 2026)
window.WORKSHOP_EN = {
  title: 'Building Trustable AI at 100 MPH · DevFest Pereira 2026 Workshop',
  plannedMinutes: 90,
  defaults: { city: 'Pereira 2026' },
  sources: [
    { title: 'Sebastián Gómez — Website & Blog', url: 'https://www.sebastian-gomez.com/' },
    { title: 'Official Google Codelab: Building Trustable AI at 100 MPH', url: 'https://codelabs.developers.google.com/codelabs/trustable-at-100-mph?hl=en' },
    { title: 'Updated Official Repository (GitHub): seagomezar/trustable-ai-codelab', url: 'https://github.com/seagomezar/trustable-ai-codelab' },
    { title: 'Google AI Studio (Gemini API Keys)', url: 'https://aistudio.google.com/app/apikey' },
    { title: 'Official Gemini API Docs (@google/genai Interactions)', url: 'https://ai.google.dev/gemini-api/docs' },
    { title: 'Google Cloud Run — Serverless SSE Streaming', url: 'https://cloud.google.com/run/docs' }
  ],
  slides: [
    // 01 — Title
    {
      kind: 'title',
      eyebrow: 'OFFICIAL GOOGLE CODELAB · HANDS-ON WORKSHOP',
      timeBadge: '90 MIN · 12 STEPS',
      title: 'Trustable AI at 100 MPH',
      subtitle: 'Split-Brain architecture, vehicle physics, deterministic guardrails, and expressive real-time voice with Gemini 3.8.',
      coauthors: 'Official Codelab Co-Authors: <strong>Sebastián Gómez</strong> (<a href="https://www.sebastian-gomez.com/" target="_blank" rel="noopener">www.sebastian-gomez.com</a>) · Krupa Galiya · Todd Kerpelman · <em>Ocupop (Koru)</em>',
      photo: 'assets/sebastian-gomez.jpg',
      codelabBadge: 'assets/codelab-badge.svg',
      badge: 'assets/gde-web-badge.svg',
      speakerName: 'Sebastián Gómez',
      speakerRole: 'Google Developer Expert · Web Technologies',
      speakerSite: 'www.sebastian-gomez.com',
      speakerSiteUrl: 'https://www.sebastian-gomez.com/',
      speakerTitle: 'Engineering Manager at Twilio',
      builds: [],
      minutes: 2,
      notes: [
        'Welcome everyone to DevFest Pereira 2026. Share the 60-second backstory of co-authoring this official Google Codelab with Krupa Galiya, Todd Kerpelman, and the Ocupop engineering team using real track telemetry, then advance right away to Slide 2 for the updated GitHub repo URL. Remind facilitators that pressing P opens Presenter View.'
      ]
    },

    // 02 — Important Notice: Updated Official Workshop Repository
    {
      kind: 'comparison',
      eyebrow: 'IMPORTANT NOTICE · WORKSHOP REPOSITORY',
      pillTone: 'yellow',
      timeBadge: '1 MIN · USE THIS LINK',
      title: 'The original Codelab repo link no longer works',
      subtitle: 'Since that link is no longer active, please use this updated repository throughout today’s workshop.',
      contextBar: '<span>CLONE NOW → <b>git clone https://github.com/seagomezar/trustable-ai-codelab.git</b></span><span>Updated 2026</span>',
      cards: [
        {
          tone: 'bad',
          title: 'Old Link in the Codelab',
          verdict: '404 · OFFLINE',
          quote: '<s>https://github.com/ocupop/trustable-ai-codelab</s>',
          points: [
            'The repository linked in <strong>Step 5 of the Codelab</strong> was removed and returns <strong>404</strong>.',
            'Skip the original <code>git clone</code> URL printed in the published guide.',
            'It also targeted older dependencies prior to the Gemini <code>Interactions API</code>.'
          ]
        },
        {
          tone: 'good',
          title: 'Use This Updated Repository',
          verdict: 'ACTIVE · UP TO DATE',
          quote: '<a href="https://github.com/seagomezar/trustable-ai-codelab" target="_blank" rel="noopener">https://github.com/seagomezar/trustable-ai-codelab ↗</a>',
          points: [
            'Complete, tested code: <code>streaming-telemetry-server</code> + <code>koru-application</code>.',
            'Ready for <strong>Google Cloud Run deployment (recommended)</strong> with a local fallback included.'
          ]
        }
      ],
      takeaway: 'In Step 5, replace the broken URL with <a href="https://github.com/seagomezar/trustable-ai-codelab" target="_blank" rel="noopener">https://github.com/seagomezar/trustable-ai-codelab</a>.',
      builds: [],
      minutes: 1,
      notes: [
        'Pause here so every attendee can open or clone https://github.com/seagomezar/trustable-ai-codelab. Explain that because the original Ocupop repo is offline, you published this updated repository ready for Google Cloud Run deployment (recommended) with a built-in local fallback.'
      ]
    },

    // 03 — Workshop Roadmap
    {
      kind: 'roadmap',
      eyebrow: 'WORKSHOP ROADMAP · 4 BLOCKS',
      pillTone: 'blue',
      timeBadge: '00:00 → 90:00',
      title: '12 steps from raw 10Hz GPS to cockpit radio',
      subtitle: 'We follow all 12 official Codelab steps end-to-end with live code experiments.',
      phases: [
        {
          title: '01 · Foundations',
          time: '18 min',
          color: 'blue',
          steps: [
            { step: 'STEPS 1–2', label: 'Overview, Google Cloud setup, API keys & local fallback' },
            { step: 'STEP 3', label: 'Why trustable AI matters entering Turn 1 at 118 mph' },
            { step: 'STEP 4', label: '4-Path Split-Brain architecture (Hot/Cold/Geo/Pred)' }
          ]
        },
        {
          title: '02 · Live Telemetry',
          time: '24 min',
          color: 'yellow',
          steps: [
            { step: 'STEP 5A–B', label: 'Deploy FastAPI SSE on Cloud Run (with :8000 fallback)' },
            { step: 'STEP 5C–D', label: 'Inspecting raw 10Hz TPV stream in browser & curl' },
            { step: 'STEP 6', label: 'Running Koru simulator (:5173) & live cockpit tour' }
          ]
        },
        {
          title: '03 · Physics & Rules',
          time: '26 min',
          color: 'green',
          steps: [
            { step: 'STEP 7', label: 'Virtual sensors: G-Lat, G-Long, brake & throttle' },
            { step: 'STEP 8A', label: 'Friction Circle & deterministic DECISION_MATRIX' },
            { step: 'STEP 8B', label: 'Physics grounding in Gemini 3.8 Flash (Interactions)' }
          ]
        },
        {
          title: '04 · Voice & Domains',
          time: '22 min',
          color: 'red',
          steps: [
            { step: 'STEP 9', label: '5 coach personas & expressive Gemini 3.8 TTS' },
            { step: 'STEP 10', label: 'End-to-end DevTools probes & Cloud teardown' },
            { step: 'STEPS 11–12', label: 'Challenges (Gemini Nano, rain) & domain transfer' }
          ]
        }
      ],
      builds: ['Block 02: 10Hz Live Telemetry', 'Block 03: Physics & Guardrails', 'Block 04: Voice, DevTools & Challenges'],
      minutes: 2,
      notes: [
        'Introduce Block 01: why standard chatbots fail when the user travels 53 meters per second, and how we split the brain.',
        'Block 02: spin up the Python FastAPI telemetry broadcaster streaming real 10Hz VBOX laps over SSE into Koru.',
        'Block 03: intentionally break virtual sensors and physics prompts so everyone feels the difference between hallucination and grounded engineering.',
        'Block 04: tune personas and voice, trace frames in Chrome DevTools, and map this architecture to healthcare, manufacturing, and fleets.'
      ]
    },

    // 03 — Step 1: Overview
    {
      kind: 'diagram',
      eyebrow: 'CODELAB STEP 1 · OVERVIEW',
      pillTone: 'blue',
      timeBadge: '3 MIN',
      title: 'What you will build and test today',
      subtitle: 'A real-time motorsport coaching system driven by 10-frames-per-second track GPS telemetry.',
      diagram: [
        {
          tag: '10Hz INPUT',
          title: 'VBOX SSE Telemetry',
          body: '11,539 real track samples in <code>SampleStream2024.csv</code> streamed every 100 ms over HTTP SSE.',
          foot: 'Cloud Run SSE (/events) · fallback :8000',
          color: 'blue'
        },
        {
          tag: 'PHYSICS + RULES',
          title: 'Koru Split-Brain Engine',
          body: 'Derives G-forces on the fly and fires deterministic reflexes in <strong>&lt;50 ms</strong> plus geofences.',
          foot: 'telemetryStreamService + DECISION_MATRIX',
          color: 'yellow',
          step: 1
        },
        {
          tag: 'AI STRATEGY',
          title: 'Gemini 3.8 Flash',
          body: 'Tactical coaching grounded in the Friction Circle and weight transfer every 15 seconds.',
          foot: '@google/genai ^3.3.0 · Interactions API',
          color: 'green',
          step: 2
        },
        {
          tag: 'HUMAN COCKPIT',
          title: '5 Personas + TTS Voice',
          body: 'Crisp commands (&lt;12 words) spoken via <code>gemini-3.8-flash-lite-tts</code> or Web Speech API.',
          foot: 'Tony · Rachel · AJ · Garmin · Super AJ',
          color: 'red',
          step: 3
        }
      ],
      takeaway: 'AI does not drive the car: it delivers the right command, in the right tone, before the braking marker.',
      builds: ['Local Split-Brain engine', 'Gemini 3.8 Flash strategy', '5 Personas & voice output'],
      minutes: 2,
      notes: [
        'Explain the dataset: real laps recorded at 10Hz (10 samples per second), not synthetic random numbers.',
        'Highlight that the browser derives physics vectors and evaluates deterministic safety rules with zero network wait.',
        'Gemini 3.8 Flash powers the Cold Path to explain the underlying physics without blocking urgent alerts.',
        'Finally, the UX layer turns telemetry actions into eyes-free pit radio tailored to the driver.'
      ]
    },

    // 05 — Step 2: Google Cloud Run (Recommended) + Local Fallback
    {
      kind: 'comparison',
      eyebrow: 'CODELAB STEP 2 · INFRASTRUCTURE & KEY SECURITY',
      pillTone: 'yellow',
      timeBadge: '3 MIN',
      title: 'Google Cloud Run (Recommended) + Local Fallback',
      subtitle: 'Deploy the SSE broadcaster on Google Cloud like production, keeping a local fallback ready if needed.',
      contextBar: '<span>Official repo: <b>github.com/seagomezar/trustable-ai-codelab</b></span><span>gcloud CLI · Python 3.10+ · Node 20+</span>',
      cards: [
        {
          tone: 'good',
          title: 'Mode A · Google Cloud Run (Recommended)',
          verdict: 'RECOMMENDED · CLOUD',
          quote: 'Deploy the telemetry server on Cloud Run and stream live data over HTTPS.',
          points: [
            'Use your Google Cloud workshop credits + a Gemini API Key from Google AI Studio.',
            'Real serverless architecture with guided Step 10 teardown so billing ends at $0.',
            '<strong>Security:</strong> never commit <code>GEMINI_API_KEY</code> or <code>.env</code> to Git (lives only in ⚙️ Settings).'
          ]
        },
        {
          tone: 'neutral',
          title: 'Mode B · Local Fallback (Contingency)',
          verdict: 'FALLBACK · NO BILLING',
          quote: 'No active GCP billing or restricted Wi-Fi? Run FastAPI on localhost:8000 or use Built-in Demo.',
          points: [
            'GCP credits or Wi-Fi not working? Run the server right on your laptop (<code>localhost:8000</code>) at zero cost.',
            'The <strong>Built-in Demo</strong> preset replays 1,200 bundled 10Hz frames even offline.',
            'Resilient voice via <strong>Gemini 3.8 TTS</strong> with automatic Web Speech fallback.'
          ]
        }
      ],
      takeaway: 'Deploy to Google Cloud Run for the full production architecture; use the local fallback only if GCP access is blocked.',
      builds: ['Local contingency fallback'],
      minutes: 2,
      notes: [
        'Present Google Cloud Run as the primary recommended path: attendees learn real serverless SSE tuning (--no-cpu-throttling) and proper API key hygiene.',
        'Introduce Mode B strictly as the safety-net fallback so anyone with a GCP billing or network issue can still complete every experiment locally.'
      ]
    },

    // 05 — Step 3: Why Trustable AI Matters
    {
      kind: 'comparison',
      eyebrow: 'CODELAB STEP 3 · THE PROBLEM AT 118 MPH',
      pillTone: 'red',
      timeBadge: '3 MIN',
      title: 'Turn 1 at 118 MPH: Naive AI vs. Trustable AI',
      subtitle: 'At 118 mph you travel 53 meters every second. Verbose or ungrounded advice arrives after the spin.',
      contextBar: '<span>INCOMING TELEMETRY → <b>{ "corner": 1, "speed_mph": 118, "brake_pct": 12, "rearGrip": "low" }</b></span><span>Budget: &lt;250 ms</span>',
      cards: [
        {
          tone: 'bad',
          title: 'Naive LLM Chatbot',
          verdict: 'UNSAFE · 3.4s LATENCY',
          quote: '“It looks like you are entering Turn 1 fast with low rear grip; consider braking gently or lifting off the throttle…”',
          points: [
            '<strong>38 words:</strong> takes 11 seconds to speak aloud—at 118 mph you are already in the gravel.',
            '<strong>Bad physics:</strong> abruptly lifting off throttle unloads the rear axle and triggers a spin.',
            '<strong>Hedging tone:</strong> “it looks like / consider” erodes human trust under stress.'
          ]
        },
        {
          tone: 'good',
          title: 'Trustable AI Coach (Koru)',
          verdict: 'TRUSTED · 35ms HOT PATH',
          quote: '“Brake firm in a straight line! Smooth release on turn-in—protect rear grip.”',
          points: [
            '<strong>Split latency:</strong> deterministic reflex fires in &lt;50 ms without waiting on cloud.',
            '<strong>Physics-grounded:</strong> respects weight transfer and the Friction Circle limit.',
            '<strong>Low cognitive load:</strong> imperative, actionable, matched to driver persona.'
          ]
        }
      ],
      takeaway: 'Trustability = Right Latency + Domain Physics + Deterministic Guardrails + Human-Centered Voice.',
      builds: ['Trustable AI Coach response'],
      minutes: 3,
      notes: [
        'Read the naive chatbot quote out loud at normal speaking pace so the room feels how long 11 seconds is at 118 mph.',
        'Reveal the right card: point out that lifting abruptly with rearGrip: low causes lift-off oversteer. Trustable AI combines instant rules with real physics.'
      ]
    },

    // 06 — Block 01 Section Divider
    {
      kind: 'section',
      background: 'var(--pastel-blue)',
      eyebrow: 'BLOCK 01 · ARCHITECTURE',
      pillTone: 'blue',
      timeBadge: 'STEP 4 · 10 MIN',
      title: 'Decoupling reflexes from strategy',
      subtitle: 'When physics ticks at 10Hz and cloud LLMs take seconds, a single async loop is a design bug.',
      heroTone: 'blue',
      blockTag: 'CODELAB STEP 4',
      heroTitle: 'High-Velocity Split-Brain Architecture',
      heroBody: 'Modeled after the human nervous system: your spinal cord pulls your hand off a hot stove in milliseconds; your cortex reflects afterward on why it happened.',
      goalsTitle: 'What we will master in this block',
      goals: [
        'Why decoupling the <strong>Hot Path (&lt;50 ms)</strong> from the <strong>Cold Path (2–5 s)</strong> prevents stalls.',
        'How <strong>GPS proximity (&lt;150 m)</strong> anticipates corners and warns before turn-in.',
        'Fast rules run immediately; Gemini runs in the background <strong>without <code>await</code></strong> (<code>void</code>) so the stream never freezes.'
      ],
      builds: ['Geofence feedforward & prediction', 'Non-blocking TypeScript dispatch'],
      minutes: 2,
      notes: [
        'Use the nervous-system analogy: nobody waits for deep reasoning before pulling back from danger.',
        'Introduce spatial anticipation: coaching before a corner is much calmer than yelling mid-corner.',
        'Show how this maps directly to never awaiting an LLM inside a 10Hz telemetry loop.'
      ]
    },

    // 07 — Step 4: 4-Path Split-Brain Architecture
    {
      kind: 'splitbrain',
      eyebrow: 'CODELAB STEP 4 · 4-PATH ENGINE',
      pillTone: 'blue',
      timeBadge: '4 MIN',
      title: 'Four parallel paths fed by the same 10Hz frame',
      subtitle: 'Every GPS sample feeds four loops with distinct latency budgets and responsibilities.',
      source: {
        title: 'Raw + Derived Frame',
        body: 'Arrives every 100 ms from FastAPI SSE or local replay.',
        sample: '{\n  "speed": 126.4,\n  "gLat": 1.14,\n  "gLong": -0.85,\n  "brake": 92\n}'
      },
      lanes: [
        {
          tone: 'hot',
          name: '1. HOT PATH',
          sub: 'Local reflex',
          desc: 'Evaluates <code>DECISION_MATRIX</code> in memory. Zero network, zero hallucination on safety calls.',
          latency: '< 50 ms'
        },
        {
          tone: 'cold',
          name: '2. COLD PATH',
          sub: 'Gemini 3.8 Flash',
          desc: 'Delivers physics-grounded coaching in active persona with a 15s cooldown.',
          latency: '2 – 5 s'
        },
        {
          tone: 'feed',
          name: '3. FEEDFORWARD',
          sub: 'Haversine Geofence',
          desc: 'Detects upcoming corners within <strong>&lt;150 m</strong> (Thunderhill / Sonoma) ahead of braking.',
          latency: '150 m ahead'
        },
        {
          tone: 'pred',
          name: '4. PREDICTIVE',
          sub: 'Trend / Lap Delta',
          desc: 'Compares Lap A vs Lap B deltas and consistency with <code>gemini-4-argon</code> post-session.',
          latency: '8s+ window'
        }
      ],
      sink: {
        title: 'Cockpit Radio UX',
        body: 'Prioritizes safety reflexes and synthesizes voice in the chosen persona.',
        footer: '<strong>Golden rule:</strong> the Cold Path <em>enriches</em> the driver, but never blocks the Hot Path.'
      },
      builds: ['1. Hot Path (<50 ms)', '2. Cold Path (Gemini 3.8 Flash)', '3. Feedforward (<150 m)', '4. Predictive / Post-lap'],
      minutes: 3,
      notes: [
        'Let the automatic lane highlight run for a moment, then step through each of the four lanes.',
        'Lane 1 (Hot): 100% deterministic TypeScript with a 1.5s cooldown—urgent brake/throttle calls happen immediately.',
        'Lane 2 (Cold): Gemini 3.8 Flash with a 15s cooldown—explains technique without spamming the driver.',
        'Lane 3 (Feedforward): Haversine distance against corner coordinates triggers proactive turn advice.',
        'Lane 4 (Predictive / Analysis): multi-lap comparison uncovering hidden tenths across corners.'
      ]
    },

    // 08 — Step 4 Code: reflexPath vs strategyPath
    {
      kind: 'code',
      eyebrow: 'STEP 4 · ARCHITECTURAL PATTERN IN CODE',
      pillTone: 'blue',
      timeBadge: '3 MIN',
      title: 'Never await cloud inference inside a 10Hz loop',
      subtitle: 'In coachingService.ts, deterministic checks run synchronously while Gemini fires asynchronously.',
      filePath: 'koru-application/src/services/coachingService.ts:40',
      checklist: [
        '<code>runHotPath(frame)</code> executes synchronously in microseconds.',
        '<code>runFeedforward(frame)</code> checks Haversine geofences (&lt;150 m).',
        '<code>void this.runColdPath(frame)</code> never stalls incoming telemetry.'
      ],
      tip: 'Putting <code>await runColdPath(frame)</code> here would freeze 20–50 GPS frames waiting for one HTTP round-trip.',
      codeLabel: 'Per-frame Split-Brain dispatch (10 times per second)',
      code: `processFrame(frame: TelemetryFrame) {
  // 1. Instant deterministic reflex (<50ms, zero network)
  this.runHotPath(frame);

  // 2. Spatial lookahead via GPS geofence (<150m)
  this.runFeedforward(frame);

  // 3. Non-blocking async strategy via Gemini 3.8 Flash
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
        'Every 100 ms a TelemetryFrame enters processFrame and triggers all three real-time paths.',
        'Hot Path enforces a 1.5s cooldown and evaluates pure in-memory predicates.',
        'The explicit void operator dispatches Gemini in the background under a 15s cooldown.'
      ],
      builds: ['Deterministic Hot Path loop', 'Non-blocking void Cold Path'],
      minutes: 2,
      notes: [
        'Point out how 9 lines in processFrame capture the entire Split-Brain philosophy.',
        'Ask attendees what would happen to UI smoothness if they awaited a 3-second HTTP call inside a 100ms event handler.',
        'Highlight that this exact pattern applies to games, robotics, industrial IoT, and live trading.'
      ]
    },

    // 09 — Block 02 Section Divider
    {
      kind: 'section',
      background: 'var(--pastel-yellow)',
      eyebrow: 'BLOCK 02 · LIVE TELEMETRY',
      pillTone: 'yellow',
      timeBadge: 'STEPS 5 & 6 · 24 MIN',
      title: 'Booting the 10Hz server and Koru cockpit',
      subtitle: 'Open your terminals: time to stream real race-track coordinates into the browser.',
      heroTone: 'yellow',
      blockTag: 'HANDS-ON · STEPS 5–6',
      heroTitle: 'From Track VBOX CSV to Google Cloud Run SSE',
      heroBody: 'We will deploy the FastAPI broadcaster on Google Cloud Run (with a local :8000 fallback), inspect raw TPV packets, and connect the Koru React cockpit.',
      goalsTitle: 'Hands-on goals for the next 24 minutes',
      goals: [
        'Deploy <code>streaming-telemetry-server</code> to <strong>Cloud Run</strong> (or local fallback) and verify 10Hz <code>/events</code>.',
        'Understand why raw GPSD <code>TPV</code> JSON is not yet “AI-Ready”.',
        'Run <code>koru-application</code> on <code>localhost:5173</code> and hear live coaching.'
      ],
      builds: ['Inspect raw TPV packets', 'Connect Koru cockpit on localhost:5173'],
      minutes: 2,
      notes: [
        'Ask everyone to open two terminal tabs: Terminal 1 to deploy streaming-telemetry-server on Google Cloud Run and Terminal 2 for koru-application.',
        'Remind attendees that local :8000 fallback commands are also shown right below on the slide if needed.',
        'Block milestone: everyone sees the car moving around the track and live radio messages arriving.'
      ]
    },

    // 10 — Step 5: Telemetry Streaming Pipeline
    {
      kind: 'diagram',
      eyebrow: 'CODELAB STEP 5 · INGESTION PIPELINE',
      pillTone: 'yellow',
      timeBadge: '2 MIN',
      title: 'How telemetry flows from track CSV to the browser',
      subtitle: 'The server supports both live cellular track uploads and deterministic 10Hz replay from CSV.',
      diagram: [
        {
          tag: 'SOURCE',
          title: 'SampleStream2024.csv',
          body: '11,539 rows captured by VBOX GPS (latitude, longitude, altitude, and speed in km/h).',
          foot: 'Clean UTF-8 BOM · endless loop',
          color: 'yellow'
        },
        {
          tag: '10Hz GENERATOR',
          title: 'mock_gps_generator()',
          body: 'Converts DMM coordinates to decimal degrees, speed to m/s, and sleeps <code>0.1s</code>.',
          foot: 'ingest.py · asyncio task',
          color: 'blue',
          step: 1
        },
        {
          tag: 'FAN-OUT',
          title: 'Broadcaster Queue',
          body: 'Each connected listener gets its own <code>asyncio.Queue</code> without blocking peers.',
          foot: 'Scales to dozens of workshop laptops',
          color: 'green',
          step: 2
        },
        {
          tag: 'WEB TRANSPORT',
          title: 'GET /events (SSE)',
          body: 'Unidirectional <code>text/event-stream</code> with native auto-reconnect via <code>EventSource</code>.',
          foot: 'Lighter & simpler than WebSockets',
          color: 'red',
          step: 3
        }
      ],
      takeaway: 'Why SSE over WebSockets? Telemetry flows one way (car → pit wall), and EventSource reconnects automatically over HTTP.',
      builds: ['10Hz async generator', 'Multi-client Broadcaster', 'HTTP SSE /events endpoint'],
      minutes: 2,
      notes: [
        'Explain that on race day a Raspberry Pi in the car POSTs to /stream; in the workshop, mock_gps_generator replays that exact capture.',
        'Mention our 2026 fixes: path-safe CSV resolution, utf-8-sig BOM handling, and modern FastAPI lifespan.',
        'Highlight Broadcaster: one Cloud Run instance can feed the entire workshop room at once.',
        'SSE avoids WebSocket proxy headaches and works natively with browser EventSource.'
      ]
    },

    // 12 — Step 5A: Clone Updated Repo & Configure Google Cloud
    {
      kind: 'terminal',
      eyebrow: 'STEP 5A · GOOGLE CLOUD PREPARATION',
      pillTone: 'yellow',
      timeBadge: '3 MIN',
      title: 'Clone the updated repo & enable Google Cloud APIs',
      subtitle: 'Clone github.com/seagomezar/trustable-ai-codelab and enable Cloud Run services.',
      filePath: 'trustable-ai-codelab/streaming-telemetry-server',
      checklist: [
        'Clone <code>seagomezar/trustable-ai-codelab</code> and enter <code>streaming-telemetry-server</code>.',
        'Set your <code>PROJECT_ID</code> in <code>gcloud</code> and enable Cloud Run + Cloud Build.',
        'Run the 5 unit tests (if using the local fallback, skip step 3).'
      ],
      tip: 'Reminder: skip the broken URL in the Codelab—clone <code>https://github.com/seagomezar/trustable-ai-codelab</code>.',
      codeLabel: 'Terminal 1 — Clone repo + configure Google Cloud (Recommended)',
      code: `# 1. Clone the updated official workshop repository
git clone https://github.com/seagomezar/trustable-ai-codelab.git
cd trustable-ai-codelab/streaming-telemetry-server

# 2. Verify NMEA parser + 11,539-row VBOX CSV loader
python -m unittest test_nmea_parsing.py

# 3. Configure Google Cloud (Recommended Path):
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com \\
  cloudbuild.googleapis.com \\
  artifactregistry.googleapis.com`,
      codeFocus: [
        [1, 2, 3, 5, 6],
        [8, 9, 10, 11, 12]
      ],
      stepCallouts: [
        'Clone seagomezar/trustable-ai-codelab and confirm Python passes all 5 unit tests in ~0.2s.',
        'Enable Cloud Run, Cloud Build, and Artifact Registry on your GCP project (or proceed to local fallback).'
      ],
      builds: ['Configure Google Cloud project & APIs'],
      minutes: 2,
      notes: [
        'Guide the room to clone https://github.com/seagomezar/trustable-ai-codelab.git and configure their gcloud project.',
        'Only attendees without an active GCP project should skip step 3 and use the local fallback on the next slide.'
      ]
    },

    // 13 — Step 5B: Deploy to Cloud Run (Recommended) or Local Fallback
    {
      kind: 'terminal',
      eyebrow: 'STEP 5B · DEPLOYING THE SSE STREAM',
      pillTone: 'yellow',
      timeBadge: '4 MIN',
      title: 'Deploy to Google Cloud Run (or use local fallback)',
      subtitle: 'Recommended: deploy to Cloud Run for a public HTTPS SSE URL; use localhost:8000 only as fallback.',
      filePath: 'streaming-telemetry-server/ingest.py',
      checklist: [
        '<strong>Recommended (Cloud Run):</strong> deploy with <code>--no-cpu-throttling</code> to keep the 10Hz task ticking.',
        'Copy your generated HTTPS URL and append <code>/events</code>.',
        '<strong>Local Fallback:</strong> without GCP, activate <code>.venv</code> and run <code>python ingest.py --mock</code>.'
      ],
      tipTone: 'green',
      tip: 'Why <code>--no-cpu-throttling</code> & <code>--max-instances 1</code>? They keep the background 10Hz generator alive on one shared car.',
      codeLabel: 'Terminal 1 — Cloud Run deploy (Recommended) + Local Fallback',
      code: `# OPTION A (RECOMMENDED): Deploy to Google Cloud Run
gcloud run deploy telemetry-server --source . \\
  --region us-central1 --allow-unauthenticated \\
  --no-cpu-throttling --max-instances 1 --timeout 3600
# -> Live URL: https://telemetry-server-xxx.a.run.app/events

# OPTION B (LOCAL FALLBACK if GCP is unavailable):
python -m venv .venv
# Windows: .venv\\Scripts\\Activate.ps1 | Unix: source .venv/bin/activate
pip install -r requirements.txt
python ingest.py --mock
# -> Local fallback at http://localhost:8000/events`,
      codeFocus: [
        [1, 2, 3, 4, 5],
        [7, 8, 10, 11, 12]
      ],
      stepCallouts: [
        'Cloud Run builds from source and publishes an HTTPS SSE endpoint ready for Koru.',
        'Contingency fallback: Uvicorn serves the exact same 10Hz SSE stream at http://localhost:8000/events.'
      ],
      builds: ['Local Fallback commands (:8000)'],
      minutes: 4,
      notes: [
        'Lead with the three Cloud Run SSE flags: --no-cpu-throttling (keeps asyncio.sleep(0.1) alive), --max-instances 1 (single shared car state), and --timeout 3600 (long-lived SSE).',
        'While Cloud Build compiles the container (~90s), highlight Option B below for anyone needing the local fallback.'
      ]
    },

    // 13 — Step 5C: Inside ingest.py
    {
      kind: 'code',
      eyebrow: 'STEP 5C · INSIDE THE FASTAPI SERVER',
      pillTone: 'yellow',
      timeBadge: '3 MIN',
      title: 'How ingest.py emits GPSD TPV packets every 100 ms',
      subtitle: 'Inspect the exact JSON fields leaving the server before the frontend computes any physics.',
      filePath: 'streaming-telemetry-server/ingest.py:130',
      checklist: [
        'Converts CSV speed from <code>km/h</code> to <code>m/s</code> (GPSD standard).',
        'Emits only <code>class</code>, <code>mode</code>, <code>lat</code>, <code>lon</code>, <code>speed</code>, and <code>time</code>.',
        'Contains zero G-forces, zero brake pressure, and zero corner names.'
      ],
      tip: 'Notice what is MISSING: the server streams raw position. Feeding raw lat/lon to an LLM 10 times a second just wastes tokens!',
      codeLabel: '10Hz generator & FastAPI SSE endpoint',
      code: `tpv = {
    "class": "TPV",
    "device": "mock_csv",
    "mode": 3,
    "time": datetime.now(timezone.utc).isoformat(),
    "lat": round(lat, 7),
    "lon": round(lon, 7),
    "alt": round(alt, 1),
    "speed": round(speed_ms, 2)  # meters per second
}
await broadcaster.broadcast(json.dumps(tpv))
await asyncio.sleep(0.1)         # 10 frames per second (10Hz)

@app.get("/events")
async def sse_events(request: Request):
    return StreamingResponse(event_generator(), media_type="text/event-stream")`,
      codeFocus: [
        [1, 6, 7, 8, 9],
        [11, 12, 14, 15, 16]
      ],
      stepCallouts: [
        'A TPV (Time-Position-Velocity) packet carries only lat/lon, altitude, and scalar speed in m/s.',
        'Every 0.1s it broadcasts to all active /events queues as "data: {...}\\n\\n" chunks.'
      ],
      builds: ['10Hz broadcast & SSE StreamingResponse'],
      minutes: 2,
      notes: [
        'Zoom in on lines 6–9: lat, lon, alt, and speed in m/s. Nothing else.',
        'Ask the audience: given only latitude, longitude, and scalar speed, how do we know whether the driver is trail-braking or coasting? That sets up Step 7.'
      ]
    },

    // 14 — Step 5D: Visual Stream Verification
    {
      kind: 'visual',
      eyebrow: 'STEP 5D · STREAM VERIFICATION',
      pillTone: 'yellow',
      timeBadge: '2 MIN',
      title: 'Verifying /events in Chrome or with curl -N',
      subtitle: 'Before launching React, confirm your 10Hz telemetry pipe is ticking smoothly.',
      image: 'assets/5s-1.png',
      imageAlt: 'Live TPV data packets streaming on the /events endpoint',
      callouts: [
        {
          title: '1. Open your /events URL in Chrome',
          body: 'Open <code>https://telemetry-server-...run.app/events</code> (or <code>localhost:8000/events</code> on fallback) to see 10Hz <code>TPV</code> lines.'
        },
        {
          title: '2. Or test from terminal with curl -N',
          body: 'Run <code>curl -N https://YOUR_CLOUD_RUN_URL/events</code> (or <code>http://localhost:8000/events</code>; <code>-N</code> disables buffering).'
        },
        {
          title: '3. Why is this NOT AI-Ready yet?',
          body: '10 raw JSON blobs/sec flood context windows without expressing tire load or driver intent.'
        }
      ],
      builds: ['Terminal check with curl -N', 'Diagnosis: raw stream vs. AI-ready telemetry'],
      minutes: 2,
      notes: [
        'Have attendees open their Cloud Run HTTPS /events URL (or localhost:8000/events if using fallback) and give a thumbs-up once TPV lines appear.',
        'Show curl -N for terminal verification.',
        'Reinforce the core lesson: having real-time streaming does not mean your data is shaped for reasoning.'
      ]
    },

    // 16 — Step 6A: Running koru-application
    {
      kind: 'terminal',
      eyebrow: 'CODELAB STEP 6A · KORU FRONTEND',
      pillTone: 'yellow',
      timeBadge: '5 MIN',
      title: 'Launch Koru simulator and connect to Cloud Run',
      subtitle: 'In a second terminal, start the React + TypeScript + Vite cockpit on localhost:5173.',
      filePath: 'trustable-ai-codelab/koru-application',
      checklist: [
        'Run <code>npm install && npm run dev</code> inside <code>koru-application</code>.',
        'Open <code>http://localhost:5173</code> and save your API Key in <strong>⚙️ Settings</strong>.',
        'Paste your <strong>Cloud Run HTTPS <code>/events</code></strong> URL (or use the <strong>Local :8000/events</strong> fallback).'
      ],
      tipTone: 'green',
      tip: 'If anyone skipped GCP deployment, 1-click fallback buttons (<code>Local :8000/events</code> & <code>Built-in Demo</code>) are built right in.',
      codeLabel: 'Terminal 2 — Start Koru cockpit & connect stream',
      code: `# In a second terminal: start the Koru frontend
cd trustable-ai-codelab/koru-application

npm install
npm run dev

# 1. Open in Chrome: http://localhost:5173
# 2. Click ⚙️ (top-right) -> paste Gemini API Key -> Save
# 3. In Live: paste https://YOUR_CLOUD_RUN_URL/events -> Connect
#    (Local fallback: click "Local :8000/events" or "Built-in Demo")`,
      codeFocus: [
        [2, 4, 5],
        [7, 8, 9, 10]
      ],
      stepCallouts: [
        'Vite boots in under a second at http://localhost:5173 with instant Hot Module Replacement.',
        'Connect to your Cloud Run HTTPS /events endpoint; use the fallback presets only if running locally.'
      ],
      builds: ['Configure API Key & connect to Cloud Run'],
      minutes: 4,
      notes: [
        'Give the room 4 minutes to run npm install && npm run dev and connect Koru to their Cloud Run HTTPS endpoint.',
        'Point anyone using the fallback to the Local :8000/events or Built-in Demo buttons so everyone moves forward together.'
      ]
    },

    // 17 — Step 6B: Annotated Koru Cockpit Tour
    {
      kind: 'visual',
      eyebrow: 'STEP 6B · KORU COCKPIT ANATOMY',
      pillTone: 'yellow',
      timeBadge: '3 MIN',
      title: 'Reading the live Koru telemetry & coach dashboard',
      subtitle: 'Verified capture receiving the live 10Hz SSE stream at 78 MPH with active HOT and FEEDFORWARD calls.',
      image: 'assets/koru-live-verified.png',
      imageAlt: 'Verified Koru cockpit streaming live telemetry at 78 MPH',
      callouts: [
        {
          title: 'Gauges + G-Circle (Left)',
          body: 'Live speed, virtual throttle/brake bars, and the real-time load dot inside the 2G Friction Circle.'
        },
        {
          title: 'GPS Map + Traces (Center)',
          body: 'Smoothly interpolated car marker on Sonoma/Thunderhill plus rolling speed and pedal charts.'
        },
        {
          title: 'AI Coach Radio (Right)',
          body: '5 persona selector, Browser/Gemini TTS toggle, and color-coded <strong>HOT</strong>, <strong>FEEDFORWARD</strong>, and <strong>COLD</strong> badges.'
        }
      ],
      builds: ['GPS track map & rolling traces', 'Labeled AI Coach Radio feed'],
      minutes: 2,
      notes: [
        'Walk attendees across the three columns on their screens: left = instant vehicle physics, center = spatial context, right = split-brain coach output.',
        'Have them switch between Super AJ, AJ, and Rachel mid-lap to hear how Hot Path phrasing adapts immediately.',
        'Highlight the path badges on every message—transparent attribution builds operator trust.'
      ]
    },

    // 17 — Step 6C: Embedded Interactive Simulator
    {
      kind: 'simulator',
      eyebrow: 'LIVE INTERACTIVE DEMO · EMBEDDED IN SLIDES',
      pillTone: 'blue',
      timeBadge: '3 MIN',
      title: 'Live Lab: test Personas, Rain (0.6g), and Physics ON/OFF',
      subtitle: 'Click directly inside the simulator below to switch coaches, wet the track, or disable physics grounding.',
      builds: [],
      minutes: 3,
      notes: [
        'Demo directly inside this slide: 1) Switch from Super AJ to AJ and Garmin to contrast verbal density. 2) Toggle Rain 0.6g to watch the green Friction Circle shrink and trigger earlier alerts. 3) Flip Physics OFF to preview the failure mode we are about to trigger in code in Block 03.'
      ]
    },

    // 18 — Block 03 Section Divider
    {
      kind: 'section',
      background: 'var(--pastel-green)',
      eyebrow: 'BLOCK 03 · AI-READY DATA & GUARDRAILS',
      pillTone: 'green',
      timeBadge: 'STEPS 7 & 8 · 26 MIN',
      title: 'Reshaping coordinates into physics and safe rules',
      subtitle: 'Time to open your code editor, mutate sensors and prompts, and observe the live behavior shift.',
      heroTone: 'green',
      blockTag: 'LIVE EXPERIMENTS · STEPS 7–8',
      heroTitle: 'Signal Engineering + Domain Physics + Guardrails',
      heroBody: 'An AI system is only as trustworthy as the physical signals it perceives and the deterministic boundaries around it.',
      goalsTitle: 'Three live experiments we will run now',
      goals: [
        '<strong>Step 7:</strong> zero out G-forces and cap speed to 30 mph in <code>telemetryStreamService.ts</code>.',
        '<strong>Step 8A:</strong> audit the Friction Circle and <code>DECISION_MATRIX</code> thresholds.',
        '<strong>Step 8B:</strong> wipe <code>RACING_PHYSICS_KNOWLEDGE</code> and watch Gemini 3.8 Flash degrade.'
      ],
      builds: ['Friction Circle & DECISION_MATRIX', 'Physics ablation experiment in Gemini'],
      minutes: 2,
      notes: [
        'Ask everyone to open koru-application/src in VS Code or their preferred editor.',
        'Preview how deterministic thresholds and tire physics reinforce each other.',
        'Explain our method: controlled ablations—break one signal or knowledge block at a time, observe Koru via HMR, then Undo (Ctrl+Z).'
      ]
    },

    // 19 — Step 7: Reshaping Raw 10Hz GPS into Virtual Sensors
    {
      kind: 'diagram',
      eyebrow: 'CODELAB STEP 7 · SIGNAL ENGINEERING',
      pillTone: 'green',
      timeBadge: '3 MIN',
      title: 'How processPoint() derives virtual sensors from GPS',
      subtitle: 'Our CSV only has lat, lon, and speed. The browser computes vehicle dynamics across consecutive 100 ms pairs.',
      diagram: [
        {
          tag: '1. HEADING',
          title: 'atan2(Δlon, Δlat)',
          body: 'Compares current GPS point against <code>prevPoint</code> (0.1s ago) to compute travel bearing.',
          foot: 'Degrees -180° to +180°',
          color: 'blue'
        },
        {
          tag: '2. LONGITUDINAL G',
          title: 'Δspeed / (dt · 9.81)',
          body: 'Negative acceleration reveals braking load; positive acceleration reveals forward thrust.',
          foot: 'Braking / Accel in Gs',
          color: 'yellow',
          step: 1
        },
        {
          tag: '3. LATERAL G',
          title: '(v · yawRate) / 9.81',
          body: 'Velocity times heading rate-of-change measures centripetal cornering load on the tires.',
          foot: 'Cornering load (-3G to +3G)',
          color: 'green',
          step: 2
        },
        {
          tag: '4. VIRTUAL PEDALS',
          title: 'Brake % & Throttle %',
          body: 'When hardware lacks CAN-bus pedal sensors, estimates brake and throttle % from <code>gLong</code>.',
          foot: 'AI-Ready TelemetryFrame',
          color: 'red',
          step: 3
        }
      ],
      takeaway: 'Never feed raw sensor coordinates to an agent: compute domain-meaningful state vectors first.',
      builds: ['Longitudinal G derivation', 'Centripetal Lateral G derivation', 'Virtual brake & throttle estimation'],
      minutes: 3,
      notes: [
        'Walk through the math intuitively: two GPS points 100ms apart give us direction of travel.',
        'Change in speed divided by 9.81 m/s² gives longitudinal G-forces.',
        'Speed multiplied by yaw rate gives centripetal lateral G—the single most important number for corner coaching.',
        'Now both DECISION_MATRIX and Gemini see "Brake 85%, G-Lat 1.2G" instead of raw floating-point coordinates.'
      ]
    },

    // 20 — Step 7 Experiment A: Zeroing G-forces
    {
      kind: 'code',
      eyebrow: 'STEP 7 · HANDS-ON EXPERIMENT A',
      pillTone: 'green',
      timeBadge: '4 MIN',
      title: 'Experiment 1: What happens when you blind G-forces?',
      subtitle: 'Open telemetryStreamService.ts around line 188, force gLat and gLong to 0, and watch the cockpit.',
      filePath: 'src/services/telemetryStreamService.ts:188',
      checklist: [
        'Find <code>// Clamp G-forces</code> inside <code>processPoint()</code>.',
        'Temporarily add <code>gLat = 0; gLong = 0;</code> and save.',
        'Watch the G-Circle freeze, then revert your edit (<code>Ctrl+Z</code>).'
      ],
      tipTone: 'red',
      tip: 'Immediate effect: <code>THRESHOLD</code>, <code>TRAIL_BRAKE</code>, and <code>COMMIT</code> vanish. Blinded to load, the coach thinks every corner is a straight!',
      codeLabel: 'Temporary edit — Blind G-force sensors (revert afterward!)',
      code: `    // Derive G-forces if not provided
    if (this.prevPoint && point.gLat === undefined) {
      gLong = (speedMs - prevSpeedMs) / (dt * 9.81);
      const yawRate = (dHeading * Math.PI / 180) / dt;
      gLat = (speedMs * yawRate) / 9.81;
    }

    // Clamp G-forces
    gLat = Math.max(-3, Math.min(3, gLat));
    gLong = Math.max(-3, Math.min(3, gLong));

    // 🧪 STEP 7A EXPERIMENT: temporarily zero out G-forces
    gLat = 0;
    gLong = 0;`,
      codeFocus: [
        [2, 3, 4, 5],
        [12, 13, 14]
      ],
      stepCallouts: [
        'Real G-forces are derived right above from speed deltas and yaw rate.',
        'Overwriting them with 0 pins the G-Circle dot at center and silences cornering safety calls.'
      ],
      builds: ['Overwrite gLat = 0 and gLong = 0'],
      minutes: 3,
      notes: [
        'Perform this edit live and give attendees 2 minutes to see the G-dot freeze while the car still flies around the map.',
        'Remind everyone to hit Ctrl+Z and save before moving to Experiment B.'
      ]
    },

    // 21 — Step 7 Experiment B: Capping speed at 30 mph
    {
      kind: 'code',
      eyebrow: 'STEP 7 · HANDS-ON EXPERIMENT B',
      pillTone: 'green',
      timeBadge: '4 MIN',
      title: 'Experiment 2: Capping pipeline speed at ~30 MPH',
      subtitle: 'At line 163, clamp speedKmh to 48 and observe how both Hot Path and Gemini shift behavior.',
      filePath: 'src/services/telemetryStreamService.ts:163',
      checklist: [
        'Clamp <code>speedKmh</code> with <code>Math.min(speedKmh, 48)</code>.',
        'Notice how lateral G drops too (since <code>gLat</code> scales with speed).',
        '<strong>Important:</strong> revert to the original line before Step 8.'
      ],
      tip: 'Fun fact: a student snapshot of the repo actually had this exact <code>Math.min(..., 48)</code> left behind, locking the car under 48!',
      codeLabel: 'Temporary edit — Artificial speed cap (revert with Ctrl+Z)',
      code: `  private processPoint(point: GpsSSEPoint) {
    const rawDt = this.prevPoint ? now - this.prevTime : 0.1;
    const dt = rawDt > 0.02 && rawDt < 2.0 ? rawDt : 0.1;

    // Original baseline:
    // const speedKmh = point.speed > 200 ? point.speed : point.speed * 3.6;

    // 🧪 STEP 7B EXPERIMENT: cap speed at 48 (~30 mph)
    let speedKmh = point.speed > 200 ? point.speed : point.speed * 3.6;
    speedKmh = Math.min(speedKmh, 48);
    const speedMs = speedKmh / 3.6;`,
      codeFocus: [
        [5, 6],
        [8, 9, 10, 11]
      ],
      stepCallouts: [
        'Normally we convert m/s from the TPV stream by multiplying by 3.6.',
        'Clamping to 48 suppresses high-speed braking urgency and triggers timid-driver rules instead.'
      ],
      builds: ['Apply Math.min(speedKmh, 48) cap'],
      minutes: 3,
      notes: [
        'Share the real debugging story: when inspecting the downloaded archive, this exact Math.min(..., 48) mutation from Step 7 was still active!',
        'Double-check that everyone restores clean telemetryStreamService.ts before continuing.'
      ]
    },

    // 22 — Step 8: Physics of the Friction Circle & Weight Transfer
    {
      kind: 'physics',
      eyebrow: 'CODELAB STEP 8 · DOMAIN EXPERTISE',
      pillTone: 'green',
      timeBadge: '4 MIN',
      title: 'The vehicle physics a general LLM misses without grounding',
      subtitle: 'Two physical laws govern every valid racing call: total tire grip budget and axle load transfer.',
      left: {
        tag: 'LAW 1 · THE FRICTION CIRCLE',
        title: '100% shared tire budget',
        body: 'A tire splits finite grip between braking and turning: <code>√(G_long² + G_lat²) ≤ μ_max</code>. Using 100% grip for braking leaves <strong>0% for turning</strong> (understeer).',
        fix: '<strong>Fix — Trail Braking:</strong> progressively bleed off brake pressure as steering angle increases toward the apex.'
      },
      right: {
        tag: 'LAW 2 · WEIGHT TRANSFER',
        title: 'Pedals shift grip between axles',
        body: 'Every pedal input shifts normal load across the chassis in milliseconds:',
        boxes: [
          {
            title: 'Braking → Weight Forward',
            text: 'Front tire grip goes UP (helps turn-in), while <strong>rear axle grip drops</strong>.'
          },
          {
            title: 'Throttle → Weight Rearward',
            text: 'Plants the rear tires on corner exit, while lightening the front axle.'
          }
        ],
        warning: '<strong>Classic naive-AI error:</strong> telling a driver to “lift off throttle abruptly” mid-corner unloads the rear and causes a spin (<em>lift-off oversteer</em>).'
      },
      builds: ['Friction Circle & Trail Braking', 'Weight Transfer & Lift-off Oversteer'],
      minutes: 3,
      notes: [
        'Spend 3 full minutes here: this visual connects software rules to real-world mechanics.',
        'On the left SVG, contrast the blue dot riding the green Trail Brake arc vs. the red dot outside the circle (plowing/understeer).',
        'On the right card, tie back to Step 3: now everyone sees mathematically why "lift off the throttle in Turn 1" could spin the car.'
      ]
    },

    // 23 — Step 8A: Deterministic Guardrails in DECISION_MATRIX
    {
      kind: 'code',
      eyebrow: 'STEP 8A · DETERMINISTIC GUARDRAILS',
      pillTone: 'green',
      timeBadge: '3 MIN',
      title: 'Explicit rules where an LLM must never guess',
      subtitle: 'DECISION_MATRIX encodes verifiable physical thresholds that behave identically offline or online.',
      filePath: 'src/utils/coachingKnowledge.ts:70',
      checklist: [
        'Evaluates pure boolean predicates on every <code>TelemetryFrame</code>.',
        'Delivers sub-millisecond latency and 100% engineer-auditable behavior.',
        'Separates <em>what action is needed</em> (<code>CoachAction</code>) from <em>how it is spoken</em>.'
      ],
      tipTone: 'green',
      tip: 'Rule of thumb: if a safety boundary fits in a one-line <code>if</code> statement, <strong>do not delegate it to a probabilistic prompt</strong>.',
      codeLabel: 'Deterministic decision matrix in TypeScript',
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
        'THRESHOLD and TRAIL_BRAKE distinguish straight-line stopping from combined corner entry load.',
        'COMMIT and COAST catch driver hesitation—coasting above 60 leaves the chassis unbalanced.'
      ],
      builds: ['Commitment & anti-coasting rules'],
      minutes: 3,
      notes: [
        'Emphasize auditability: a race engineer can review and sign off on these exact numbers without knowing anything about prompt engineering.',
        'Notice it outputs a strongly typed CoachAction enum—impossible to prompt-inject or hallucinate.'
      ]
    },

    // 24 — Step 8B: Ablation Experiment on RACING_PHYSICS_KNOWLEDGE
    {
      kind: 'code',
      eyebrow: 'STEP 8B · GEMINI ABLATION EXPERIMENT',
      pillTone: 'green',
      timeBadge: '4 MIN',
      title: 'Experiment 3: Wiping physics knowledge from Gemini',
      subtitle: 'In coachingKnowledge.ts line 115, set RACING_PHYSICS_KNOWLEDGE to an empty string and compare Cold Path calls.',
      filePath: 'src/utils/coachingKnowledge.ts:115',
      checklist: [
        'Temporarily empty <code>RACING_PHYSICS_KNOWLEDGE = ``</code>.',
        'Trigger a <strong>COLD</strong> message: advice turns generic (“slow down carefully”).',
        'Restore the Friction Circle + track-specific corner notes.'
      ],
      tipTone: 'red',
      tip: 'Without domain grounding, LLMs revert to street-driving platitudes that can destabilize a race car at the limit.',
      codeLabel: 'Domain grounding injected into the Cold Path',
      code: `// 🧪 STEP 8B EXPERIMENT: empty this constant to \`\` and compare!
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
        'Blanking this string proves how much value structured domain context adds to base model weights.',
        'Explicit cause-and-effect rules prevent Gemini from recommending mid-corner throttle lifts.',
        'Track topography notes (like Turn 9 dropping away over a blind crest) cannot be guessed from 2D lat/lon.'
      ],
      builds: ['Causal vehicle dynamics rules', 'Track-specific topography & corners'],
      minutes: 3,
      notes: [
        'Have attendees with an API key test blanking the constant for one Cold Path cycle, then restore it.',
        'Notice how causal physics rules anchor the model’s reasoning vocabulary.',
        'Point out Turn 9 (Crest): as the road drops away, vertical tire load drops—local physical context is irreplaceable.'
      ]
    },

    // 25 — Step 8C: 2026 SDK Modernization (@google/genai Interactions)
    {
      kind: 'code',
      eyebrow: 'STEP 8C · 2026 GEMINI SDK UPGRADE',
      pillTone: 'blue',
      timeBadge: '3 MIN',
      title: 'Cold Path powered by @google/genai Interactions API',
      subtitle: 'We upgraded the Codelab from legacy 2.5 calls to gemini-3.8-flash via client.interactions.create.',
      filePath: 'src/services/coachingService.ts:260',
      checklist: [
        'Upgraded to <code>@google/genai ^3.3.0</code>.',
        '<code>system_instruction</code> cleanly isolates persona rules from telemetry input.',
        'Zero legacy sampling tweaks—fast, grounded default reasoning.'
      ],
      tipTone: 'green',
      tip: 'In <code>Analysis.tsx</code>, two-lap telemetry comparison uses <code>gemini-4-argon</code> (with automatic fallback to <code>gemini-3.8-flash</code>).',
      codeLabel: 'Modern Gemini 3.8 Flash call in coachingService.ts',
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
        'The prompt fuses invariant physics + instant sensor state + active geofence corner.',
        'client.interactions.create provides a unified interface across text, reasoning, and TTS.',
        'interaction.output_text returns clean coaching text ready for UI display and voice synthesis.'
      ],
      builds: ['Unified client.interactions.create call', 'Direct output_text extraction'],
      minutes: 3,
      notes: [
        'Explain why we modernized this before DevFest: the original codebase used deprecated 2.5 generateContent calls.',
        'With @google/genai 3.3.0 Interactions API, system_instruction cleanly separates persona from prompt state.',
        'And interaction.output_text eliminates brittle nested candidate parsing.'
      ]
    },

    // 26 — Block 04 Section Divider
    {
      kind: 'section',
      background: 'var(--pastel-red)',
      eyebrow: 'BLOCK 04 · PERSONAS, VOICE & PRODUCTION',
      pillTone: 'red',
      timeBadge: 'STEPS 9 TO 12 · 22 MIN',
      title: 'The last mile of trust is human UX',
      subtitle: 'Accurate math delivered in the wrong tone makes a driver turn off the radio.',
      heroTone: 'red',
      blockTag: 'FINAL STRETCH · STEPS 9–12',
      heroTitle: 'Adaptive Personas, Expressive Voice & Observability',
      heroBody: 'We finish by tuning coach personalities and TTS voices, tracing every path in Chrome DevTools, and mapping Split-Brain AI to your own domain.',
      goalsTitle: 'What we will complete in the final block',
      goals: [
        '<strong>Step 9:</strong> compare all 5 personas, break AJ with excessive politeness, and test Gemini TTS.',
        '<strong>Step 10:</strong> enable the 3 DevTools <code>console.log</code> probes and tear down Cloud resources.',
        '<strong>Steps 11–12:</strong> engineering challenges (Gemini Nano, rain) & the 5 Pillars of Trustable AI.'
      ],
      builds: ['DevTools observability & GCP teardown', 'Challenges & 5 Pillars wrap-up'],
      minutes: 2,
      notes: [
        'Rally energy for the home stretch: this is where code turns into an audible pit-wall companion.',
        'Remind attendees to set laptop volume comfortably or plug in headphones for TTS and open DevTools.',
        'We will close by translating this pattern to everyone’s real production systems.'
      ]
    },

    // 27 — Step 9: Five Coach Personas Matrix
    {
      kind: 'personas',
      eyebrow: 'CODELAB STEP 9 · INTERACTION DESIGN',
      pillTone: 'red',
      timeBadge: '3 MIN',
      title: 'Same underlying physics, five cognitive delivery styles',
      subtitle: 'Different drivers process stress differently at 100 MPH—so we decouple physical truth from verbal persona.',
      personas: [
        {
          icon: 'TY',
          name: 'Tony',
          style: 'Motivational · Feel-based',
          quote: 'Breathe off the brake — feel the car rotate!',
          voice: 'Puck (upbeat)',
          browser: 'rate 1.4 · pitch 1.3'
        },
        {
          icon: 'RC',
          name: 'Rachel',
          style: 'Technical · Vehicle dynamics',
          quote: 'Trail off the brake — front is loaded, ease G-vector.',
          voice: 'Kore (precise)',
          browser: 'rate 1.0 · pitch 1.1'
        },
        {
          icon: 'AJ',
          name: 'AJ',
          style: 'Race Engineer · Blunt',
          quote: 'Trail. Ease. Throttle. Now.',
          voice: 'Fenrir (clipped)',
          browser: 'rate 1.3 · pitch 0.7'
        },
        {
          icon: 'GM',
          name: 'Garmin',
          style: 'Clinical · Pure deltas',
          quote: 'Trail braking. G-Long: -0.62. Release linearly.',
          voice: 'Charon (neutral)',
          browser: 'rate 0.9 · pitch 0.6'
        },
        {
          icon: 'SA',
          name: 'Super AJ',
          style: 'Adaptive per error type',
          quote: 'Release the brake slowly as you turn — balance the car!',
          voice: 'Zephyr (balanced)',
          browser: 'rate 1.1 · pitch 0.9'
        }
      ],
      takeaway: 'Super AJ adapts automatically: urgent on spin risk, physics-based on line errors, encouraging on hesitation.',
      builds: ['Rachel: clinical dynamics', 'AJ: terse commands', 'Garmin: data & deltas', 'Super AJ: context-adaptive'],
      minutes: 3,
      notes: [
        'Tony helps hesitant drivers commit when grip is available.',
        'Rachel speaks like a chassis dynamics instructor explaining load transfer.',
        'AJ enforces <12 words and zero explanations—ideal at maximum cognitive load.',
        'Garmin strips emotion completely in favor of numbers and lap deltas.',
        'Super AJ switches persona mode dynamically depending on whether the issue is safety, technique, or confidence.'
      ]
    },

    // 28 — Step 9 Experiment: Excessively Polite AJ
    {
      kind: 'code',
      eyebrow: 'STEP 9 · UX & COGNITIVE LOAD EXPERIMENT',
      pillTone: 'red',
      timeBadge: '3 MIN',
      title: 'Experiment 4: The “Excessively Polite AJ” disaster',
      subtitle: 'Edit coachingKnowledge.ts line 31 to make AJ apologetic and wordy—feel how timing collapses.',
      filePath: 'src/utils/coachingKnowledge.ts:27',
      checklist: [
        'Rewrite <code>aj.systemPrompt</code> to apologize and say “whenever convenient”.',
        'Select <strong>AJ</strong> in Koru and listen to Gemini’s Cold Path output.',
        'Undo (<code>Ctrl+Z</code>) to restore <code>Keep responses under 12 words</code>.'
      ],
      tipTone: 'red',
      tip: '“Pardon me, brake whenever convenient” is physically polite—and completely useless past the braking board!',
      codeLabel: 'Persona experiment in coachingKnowledge.ts',
      code: `  aj: {
    id: "aj",
    name: "AJ",
    style: "Direct, blunt commands",
    icon: "AJ",
    // Original: "You are AJ, a no-nonsense race engineer... under 12 words."
    // 🧪 STEP 9 EXPERIMENT: make AJ excessively polite
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
        'The baseline prompt strictly caps output under 12 words with zero filler.',
        'Changing tone alone destroys operational usability because spoken audio is a serial bottleneck.'
      ],
      builds: ['Inject overly polite butler prompt'],
      minutes: 3,
      notes: [
        'This experiment always gets laughs across the room—hearing AJ apologize halfway through a hairpin makes human attention bandwidth unforgettable.',
        'Have everyone revert with Ctrl+Z once they hear it.'
      ]
    },

    // 29 — Step 9B: Expressive Voice with Gemini 3.8 TTS + Fallback
    {
      kind: 'code',
      eyebrow: 'STEP 9B · RESILIENT VOICE SYNTHESIS',
      pillTone: 'red',
      timeBadge: '3 MIN',
      title: 'Expressive voice via gemini-3.8-flash-lite-tts + Fallback',
      subtitle: 'We steer vocal delivery with speech_metadata annotations and fail over seamlessly to Browser TTS.',
      filePath: 'src/hooks/useTTS.ts:87',
      checklist: [
        '5 prebuilt voices: <code>Fenrir</code>, <code>Kore</code>, <code>Puck</code>, <code>Charon</code>, and <code>Zephyr</code>.',
        '<code>annotations: [{ type: "speech_metadata", style }]</code> shapes radio urgency.',
        '<code>catch</code> automatically falls back to <code>window.speechSynthesis</code>.'
      ],
      tipTone: 'green',
      tip: 'Mission-critical UX rule: never let a network hiccup mute safety alerts—always wire an offline voice fallback.',
      codeLabel: 'Gemini 3.8 TTS synthesis with automatic Web Speech fallback',
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

// Inside speak(): resilient fallback on offline Wi-Fi or quota limits
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
        'gemini-3.8-flash-lite-tts takes persona delivery style via speech_metadata and returns WAV audio.',
        'If conference Wi-Fi drops or no API key is set, tuned Browser TTS speaks in 0 ms.'
      ],
      builds: ['Resilient fallback to Browser SpeechSynthesis'],
      minutes: 2,
      notes: [
        'Highlight how TTS uses the exact same client.interactions.create pattern with response_format: audio.',
        'Point out the try/catch fallback: on shared venue Wi-Fi, graceful degradation keeps every demo working.'
      ]
    },

    // 30 — Step 10: End-to-End Observability in DevTools
    {
      kind: 'code',
      eyebrow: 'CODELAB STEP 10 · OBSERVABILITY',
      pillTone: 'blue',
      timeBadge: '4 MIN',
      title: 'Trace all 3 layers live by uncommenting our probes',
      subtitle: 'Trustable systems are observable: watch frames enter, trigger reflexes, and resolve cloud strategy.',
      filePath: 'telemetryStreamService.ts & coachingService.ts',
      checklist: [
        '<strong>Probe 1:</strong> uncomment <code>PROBE 1</code> (<code>FRAME</code> at 10Hz).',
        '<strong>Probe 3:</strong> uncomment <code>PROBE 3</code> (<code>Reflex</code> &lt;50 ms).',
        '<strong>Probe 4:</strong> uncomment <code>PROBE 4</code> (<code>Strategy</code> every 15s).'
      ],
      tip: 'Open Chrome DevTools (<code>F12</code> → Console) and filter with <code>/Reflex|Strategy/</code>.',
      codeLabel: 'Three ready-to-uncomment telemetry probes',
      code: `// 1️⃣ telemetryStreamService.ts:219 — Pipeline ingress (10 frames/sec)
console.log("FRAME", {
  speed: frame.speed.toFixed(1),
  gLat: frame.gLat.toFixed(2),
  brake: frame.brake.toFixed(0),
});

// 2️⃣ coachingService.ts:71 — Deterministic Hot Path (<50ms)
console.log("Reflex", { action: rule.action, text, coach: this.coachId });

// 3️⃣ coachingService.ts:277 — Async Cold Path (Gemini 3.8 Flash)
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
        'FRAME confirms derived G-forces and virtual pedals tick reliably every 100 ms.',
        'Reflex shows the exact DECISION_MATRIX rule triggered with zero latency.',
        'Strategy proves temporal decoupling: ~150 frames stream cleanly between cloud responses.'
      ],
      builds: ['Hot Path Reflex probe', 'Cold Path Strategy probe'],
      minutes: 3,
      notes: [
        'Guide attendees to uncomment PROBE 1 in telemetryStreamService.ts and open Chrome DevTools Console.',
        'Uncomment PROBE 3 to see deterministic rules fire in real time.',
        'Watching 150 FRAME logs and multiple instant Reflex calls scroll past while Strategy thinks makes Split-Brain concrete forever.'
      ]
    },

    // 32 — Step 10B: DevTools Network Check & Cloud Run Teardown
    {
      kind: 'terminal',
      eyebrow: 'STEP 10B · CONSOLE & GOOGLE CLOUD TEARDOWN',
      pillTone: 'blue',
      timeBadge: '2 MIN',
      title: 'Inspect DevTools Network & tear down Cloud Run',
      subtitle: 'Since we deployed to Cloud Run with --no-cpu-throttling, delete the service when finished so billing stays at $0.',
      filePath: 'Responsible Google Cloud teardown',
      checklist: [
        'Check DevTools → Network for the persistent <code>eventsource</code> stream.',
        'Delete the <code>telemetry-server</code> Cloud Run service and Artifact Registry image.',
        'Stop <code>vite</code> with <code>Ctrl+C</code> (plus <code>ingest.py</code> if you used the local fallback).'
      ],
      tipTone: 'red',
      tip: 'Remember: <code>--no-cpu-throttling</code> allocates active CPU while an instance stays warm—always tear down!',
      codeLabel: 'Google Cloud Run teardown commands (+ fallback note)',
      code: `# 1. Delete the Google Cloud Run streaming service
gcloud run services delete telemetry-server \\
  --region us-central1 --quiet

# 2. List and delete source-deploy images in Artifact Registry
gcloud artifacts repositories list --location us-central1

gcloud artifacts repositories delete cloud-run-source-deploy \\
  --location us-central1 --quiet

# 3. Stop Vite (and local fallback if used): press Ctrl+C`,
      codeFocus: [
        [1, 2, 3],
        [5, 6, 8, 9]
      ],
      stepCallouts: [
        'Delete telemetry-server first to immediately stop always-on CPU allocation.',
        'Remove the cloud-run-source-deploy repository for zero container storage charges.'
      ],
      builds: ['Artifact Registry cleanup'],
      minutes: 2,
      notes: [
        'Good cloud workshop hygiene: walk everyone through deleting the Cloud Run service and container artifacts so their GCP bill ends at $0.00.',
        'If attendees want 5 minutes to try the Step 11 challenges live first, remind them to run these two commands right afterward.'
      ]
    },

    // 32 — Step 11: Four Engineering Challenges
    {
      kind: 'steps',
      eyebrow: 'CODELAB STEP 11 · EXTENDED CHALLENGES',
      pillTone: 'yellow',
      timeBadge: '4 MIN',
      title: 'Four challenges to push this architecture further',
      subtitle: 'Pick one to hack on right now or take home after DevFest.',
      items: [
        {
          tag: 'CHALLENGE 01 · EDGE AI',
          title: 'Chrome Gemini Nano',
          body: 'Wire Chrome’s built-in Prompt API (<code>LanguageModel.create()</code>) as a ~250 ms warm path.',
          foot: 'Zero cost · Local on-device GPU'
        },
        {
          tag: 'CHALLENGE 02 · WEATHER',
          title: 'Rain Mode (0.6x Grip)',
          body: 'Add a wet-track toggle scaling <code>DECISION_MATRIX</code> G-thresholds by <code>0.6</code> and updating the prompt.',
          foot: 'Dynamic environmental physics'
        },
        {
          tag: 'CHALLENGE 03 · SFT',
          title: 'Supervised Fine-Tuning',
          body: 'Export <code>(TelemetryFrame, ideal call)</code> pairs from pro laps to fine-tune a compact model.',
          foot: 'Consistent <10-token phrasing'
        },
        {
          tag: 'CHALLENGE 04 · DOMAINS',
          title: 'Port to Your Industry',
          body: 'Swap <code>TelemetryFrame</code> and <code>DECISION_MATRIX</code> for live streams in your own product.',
          foot: 'Health · Factory · Fleet · Grid'
        }
      ],
      takeaway: 'Where in your company are you forcing a slow chatbot onto a problem that actually needs a Split-Brain?',
      builds: ['Challenge 02: Rain Mode 0.6x', 'Challenge 03: Fine-tuning on pro laps', 'Challenge 04: Cross-industry port'],
      minutes: 3,
      notes: [
        'Tie Challenge 01 to the Built-in Web AI demos in this same repository: Gemini Nano fits right between Hot and Cold paths.',
        'Challenge 02 takes 5 minutes: multiply G thresholds by 0.6 just like we previewed in the embedded simulator.',
        'Challenge 03 shows how deterministic systems help curate clean SFT training sets.',
        'Challenge 04 sets up our closing discussion: racing is a lens for every high-velocity domain.'
      ]
    },

    // 33 — Step 11B: Cross-Domain Architecture Matrix
    {
      kind: 'domains',
      eyebrow: 'STEP 11B · BEYOND MOTORSPORT',
      pillTone: 'green',
      timeBadge: '3 MIN',
      title: 'Applying Split-Brain Trustable AI across industries',
      subtitle: 'Swap the input sensor, keep the exact same four reliability layers.',
      headers: ['Domain', 'High-Frequency Stream', 'Deterministic Hot Path (<50 ms)', 'Gemini Cold Path (2–5 s)'],
      rows: [
        [
          'Healthcare / ICU',
          'Continuous ECG, SpO₂ & arterial pressure',
          'Hypoxia or arrhythmia threshold → instant bedside alarm',
          'Correlates medication history & 30-min vitals trend for clinicians'
        ],
        [
          'Manufacturing',
          'MEMS vibration, spindle current & thermal',
          'Emergency E-stop when vibration exceeds mechanical limit',
          'Diagnoses bearing wear pattern & schedules maintenance window'
        ],
        [
          'Fleet & Logistics',
          'CAN-bus, GPS telemetry & ADAS camera',
          'Immediate following-distance or drowsiness alert',
          'Fuel-efficiency & grade-aware coaching tailored to route load'
        ],
        [
          'Power Grid / SRE',
          '60Hz grid frequency or payment APM traces',
          'Automated circuit breaker / load shedding on spike',
          'Actionable root-cause summary (RCA) for the on-call engineer'
        ]
      ],
      takeaway: '1) What is your 10Hz frame?  2) What must never hallucinate?  3) What physics grounds the LLM?  4) How many words can users absorb?',
      builds: ['Smart Manufacturing & CNC', 'Connected Fleets & ADAS', 'Energy Grids, Payments & SRE'],
      minutes: 2,
      notes: [
        'Start with Healthcare / ICU: continuous bedside vitals where alarms can never wait on cloud latency.',
        'In CNC Manufacturing, the Hot Path triggers mechanical E-stop while Gemini diagnoses bearing wear.',
        'Connected Fleets & ADAS share almost the exact telemetry schema we used today.',
        'Point to the 4 design questions at the bottom—that is the architectural checklist attendees can bring to work on Monday.'
      ]
    },

    // 34 — Step 12: Wrap-Up — The 5 Pillars of Trustable AI
    {
      kind: 'diagram',
      eyebrow: 'CODELAB STEP 12 · FINAL WRAP-UP',
      pillTone: 'green',
      timeBadge: '2 MIN',
      title: 'The 5 Pillars of Building Trustable AI',
      subtitle: 'Everything we tested at 100 MPH generalizes to any production generative AI system.',
      diagram: [
        {
          tag: 'PILLAR 1',
          title: 'AI-Ready Data',
          body: 'Reshape raw streams into physically meaningful state vectors before reasoning.',
          foot: 'Step 7 · Virtual sensors',
          color: 'blue'
        },
        {
          tag: 'PILLAR 2',
          title: 'Split-Brain',
          body: 'Decouple sub-50 ms reflexes from multi-second cloud model reasoning.',
          foot: 'Step 4 · Hot vs Cold Path',
          color: 'yellow',
          step: 1
        },
        {
          tag: 'PILLAR 3',
          title: 'Domain Grounding',
          body: 'Inject causal laws and local context that general weights cannot guess.',
          foot: 'Step 8 · Friction Circle',
          color: 'green',
          step: 2
        },
        {
          tag: 'PILLAR 4 & 5',
          title: 'Guardrails + UX',
          body: 'Auditable deterministic boundaries plus voice matched to human cognitive load.',
          foot: 'Steps 8, 9 & 10 · Earned trust',
          color: 'red',
          step: 3
        }
      ],
      takeaway: 'You cannot prompt your way into trust—you engineer trust in the architecture surrounding the model.',
      builds: ['Pillar 2: Split-Brain latency', 'Pillar 3: Domain expertise', 'Pillars 4 & 5: Guardrails & human UX'],
      minutes: 2,
      notes: [
        'Pillar 1: reshape raw streams into AI-ready physical state vectors.',
        'Pillar 2: split urgent reflex budgets from multi-second cloud reasoning.',
        'Pillar 3: ground the model in causal laws and local topography.',
        'Land the closing quote: "You cannot prompt your way into trust—you engineer trust in the architecture surrounding the model."'
      ]
    },

    // 36 — Workshop Resources & Official Badge
    {
      kind: 'statement',
      eyebrow: 'RESOURCES & OFFICIAL BADGE',
      pillTone: 'yellow',
      timeBadge: '1 MIN',
      title: 'Everything you need to keep hacking at home',
      subtitle: 'Complete the short quiz on Google Codelabs to claim the official Racing Coach badge on your Developer Profile.',
      specs: [
        { term: 'Updated Repository', detail: '<a href="https://github.com/seagomezar/trustable-ai-codelab" target="_blank" rel="noopener"><code>https://github.com/seagomezar/trustable-ai-codelab</code></a> (replaces broken upstream link)' },
        { term: 'Official Codelab', detail: '<a href="https://codelabs.developers.google.com/codelabs/trustable-at-100-mph?hl=en" target="_blank" rel="noopener"><code>codelabs.developers.google.com/codelabs/trustable-at-100-mph</code></a>' },
        { term: 'Gemini Models', detail: '<code>gemini-3.8-flash</code> · <code>gemini-4-argon</code> · <code>gemini-3.8-flash-lite-tts</code> (<code>@google/genai ^3.3.0</code>)' },
        { term: 'Website & Socials', detail: '<a href="https://www.sebastian-gomez.com/" target="_blank" rel="noopener"><code>www.sebastian-gomez.com</code></a> · <a href="https://www.linkedin.com/in/sebastian-gomez-software/" target="_blank" rel="noopener">LinkedIn</a> · <a href="https://x.com/sebasgojs" target="_blank" rel="noopener"><code>@sebasgojs</code></a> · <a href="https://github.com/seagomezar" target="_blank" rel="noopener"><code>github: seagomezar</code></a>' }
      ],
      links: [
        { label: 'Updated GitHub Repository', href: 'https://github.com/seagomezar/trustable-ai-codelab' },
        { label: 'Open Official Codelab', href: 'https://codelabs.developers.google.com/codelabs/trustable-at-100-mph?hl=en' },
        { label: 'Get Gemini API Key', href: 'https://aistudio.google.com/app/apikey' },
        { label: 'www.sebastian-gomez.com', href: 'https://www.sebastian-gomez.com/' }
      ],
      builds: [],
      minutes: 1,
      notes: [
        'Encourage everyone to star https://github.com/seagomezar/trustable-ai-codelab and complete the final quiz on codelabs.developers.google.com to earn the "Official Racing Coach" badge on their Google Developer Profile.'
      ]
    },

    // 37 — Closing & Q&A
    {
      kind: 'closing',
      eyebrow: 'CHECKERED FLAG! · DEVFEST PEREIRA 2026',
      timeBadge: 'OPEN Q&A & LIVE DEMO',
      title: 'Thank You, Pereira!',
      subtitle: 'Let’s build AI systems that are fast, physically grounded, and worthy of human trust.',
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
      speakerTitle: 'Engineering Manager at Twilio',
      builds: [],
      minutes: 2,
      notes: [
        'Thank the GDG Pereira organizers and open the floor for Q&A, attendee experiment demos, and architecture discussions.'
      ]
    }
  ]
};
