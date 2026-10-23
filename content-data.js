/* Editorial choices, checked against sources on 2026-10-23. */
window.CONTENT_TOPICS = [
  {
    id: 'webmcp', rank: 1, color: '#c3ecf6', title: 'Your website has tools, too',
    subtitle: 'WebMCP: a shared interface for people and agents', stage: 'Experimental platform; publish as a practical lab',
    angle: 'Turn a personal website into a useful collaborator: an agent can find a talk, prepare a reading route, and stage an action while the visitor sees every change.',
    value: 'Adds an agent interaction chapter to your existing browser AI work. The reading-route demo could become a real feature on your site.',
    format: 'Architecture article + 30-minute hands-on talk + a reusable tool-design checklist',
    outline: ['Start with a visitor goal: find three things to read before a talk.', 'Connect a structured tool to the same function used by a button.', 'Validate arguments, return useful errors, and keep state visible.', 'Explain consequentialHint and debugging without treating annotations as authorization.'],
    rows: [14, 23, 27],
    sources: ['https://developer.chrome.com/docs/ai/webmcp', 'https://github.com/GoogleChromeLabs/webmcp-extension', 'https://github.com/webmachinelearning/webmcp-types', 'https://github.com/webmachinelearning/webmcp/pull/253', 'https://github.com/webmachinelearning/webmcp/issues/176'],
    demos: [
      {id:'reading-route', title:'Reading Route', hook:'Build a personal reading trail with a typed page tool.', action:'Add an article through the tool console, then remove it through the ordinary interface.', lesson:'An agent and a human share application state.'},
      {id:'consent-cart', title:'The Last Click', hook:'A playful ticket cart where a tool prepares an action and a person completes it.', action:'Stage a ticket request, reject it, then stage another and confirm it.', lesson:'A consequential hint describes behavior; application code still enforces review.'},
      {id:'tool-observatory', title:'Tool Observatory', hook:'Inspect tool schemas, annotations, and error traces in a miniature flight recorder.', action:'Filter debugging tools, run valid JSON, and try malformed arguments.', lesson:'Tools need useful errors, a clear audience, and observable behavior.'}
    ]
  },
  {
    id:'lifecycle', rank:2, color:'#ccf6c5', title:'AI starts before the first token',
    subtitle:'Model lifecycle, graceful degradation, and embedded demos', stage:'Current APIs with device and browser constraints',
    angle:'The feature is the entire journey: capability detection, a deliberate download, progress, cancellation, and an ordinary usable interface when the model is absent.',
    value:'Turns the architectural thesis in your small-model article into a production-focused companion people can copy and test.',
    format:'Implementation guide + failure-state gallery + reusable lifecycle helper',
    outline:['Detect APIs without starting a download.', 'Request model creation from a user action.', 'Stream, cancel, and release sessions.', 'Test cross-origin policy and publish accurate setup instructions.'],
    rows:[16,18,19,21,24,25,26],
    sources:['https://developer.chrome.com/docs/ai/built-in-ai-dos-donts','https://developer.chrome.com/docs/ai/prompt-api','https://developer.chrome.com/docs/ai/session-management','https://github.com/webmachinelearning/proofreader-api/pull/14'],
    demos:[
      {id:'model-concierge',title:'Model Concierge',hook:'An airport-style departure board for local AI capabilities.',action:'Inspect the actual browser, then explicitly prepare one model.',lesson:'Availability is a state machine, not a boolean.'},
      {id:'stream-garden',title:'Stream Garden',hook:'Grow an answer one chunk at a time, then prune it with Cancel.',action:'Run the labeled rehearsal, cancel midway, then try native streaming.',lesson:'Cancellation and session cleanup belong in the user experience.'},
      {id:'iframe-passport',title:'Iframe Passport',hook:'Two local origins reveal whether an embedded AI feature has permission.',action:'Load the second-origin frame with and without language-model delegation.',lesson:'A working top-level API does not guarantee that an embedded demo works.'}
    ]
  },
  {
    id:'retrieval',rank:3,color:'#ffe7a5',title:'Search by meaning, answer with evidence',
    subtitle:'SemanticEmbedder, retrieval, and source-grounded answers',stage:'SemanticEmbedder developer trial; desktop Canary setup',
    angle:'Upgrade your existing in-memory RAG story by making retrieval observable: compare words with meaning, inspect neighbors, and show precisely what evidence an answer can use.',
    value:'A concrete follow-up to your browser RAG article rather than another introduction to RAG. The search demo is a candidate for your website archive.',
    format:'Deep technical article + searchable notebook + retrieval evaluation examples',
    outline:['Build an in-memory index with retrieval-document embeddings.', 'Embed queries with retrieval-query and compare with cosine similarity.', 'Keep embedding spaces consistent and reindex when the model changes.', 'Show source passages and refuse an answer when evidence is weak.'],
    rows:[12],
    sources:['https://docs.google.com/document/d/1ZB6MW8UDczm4V6ej5MorZWqFCYWwLhUs5HKxEdjP35c/edit','https://github.com/explainers-by-googlers/embedding-api'],
    demos:[
      {id:'meaning-compass',title:'Meaning Compass',hook:'Search a miniature article archive by a question rather than a keyword.',action:'Compare the explicit word-overlap baseline with live native embeddings.',lesson:'Use retrieval task hints and expose the ranking.'},
      {id:'duplicate-constellation',title:'Duplicate Constellation',hook:'Move a similarity threshold and watch related notes connect.',action:'Add a note, compare word overlap, and compute native semantic similarities.',lesson:'Similarity is continuous and thresholds require evidence.'},
      {id:'evidence-window',title:'Evidence Window',hook:'See the passages offered to a grounded answer before asking the model.',action:'Retrieve sources, choose the evidence floor, then request a cited draft.',lesson:'Retrieval quality and answer quality need separate inspection.'}
    ]
  },
  {
    id:'performance',rank:4,color:'#f8d8d8',title:'Faster, at which step?',
    subtitle:'Measure local inference before promising a speedup',stage:'Gemma 4, MTP, and preference settings are developer trials',
    angle:'Separate model preparation, first chunk, total generation, and output quality. Reproduce the experiment rather than repeating an announcement percentage.',
    value:'Adds reproducible measurement to the performance claims around BrowserDJ and local models, giving the site a reference-quality lab.',
    format:'Benchmark article + downloadable measurements + experiment protocol',
    outline:['Record the device, browser, flags, sampling mode, and input.', 'Separate setup time from first-chunk and total generation time.', 'Compare equivalent configurations across browser restarts.', 'Inspect quality as well as medians; do not equate speed preference with MTP.'],
    rows:[10,11,13,17,20,22,25],
    sources:['https://docs.google.com/document/d/1g7bv9LHSqFWqeQUM2C6EQ5PiZ8UWTz8UibxnlD4ipDE/edit','https://docs.google.com/document/d/1rpaV4la7WtpLr4Ueb0NttJVETlVL_5a9TNHsrBMBkWk/edit','https://docs.google.com/document/d/1RnSlXRAy8ffdbehvCcH7msBwmTvsxHJJQiwcw374tMw/edit','https://developer.chrome.com/docs/ai/prompt-api'],
    demos:[
      {id:'latency-lens',title:'Latency Lens',hook:'A flight recorder for model setup, first chunk, and completed output.',action:'Run actual native trials, export JSON, and compare labeled browser configurations.',lesson:'A single completion time cannot explain a faster experience.'},
      {id:'preference-kitchen',title:'Preference Kitchen',hook:'An option mixer that explains why speed and capability recipes differ.',action:'Try an incompatible speed recipe, fix it, and run the native Summarizer.',lesson:'The speed expert has a restricted option set and does not use MTP.'},
      {id:'context-backpack',title:'Context Backpack',hook:'Pack source notes into the real session context budget.',action:'Select notes and measure their actual context usage when the API is present.',lesson:'Query runtime context capacity instead of hard-coding historical limits.'}
    ]
  },
  {
    id:'recipes',rank:5,color:'#c3ecf6',title:'From rigid APIs to recipes you can evaluate',
    subtitle:'Writing workflows over the foundational Prompt API',stage:'Migration design; deprecation remains an archive proposal',
    angle:'Build a small prompt-recipe layer with explicit inputs, output contracts, and evaluation. Keep the writer in control of facts and style.',
    value:'Extends your pattern-versus-jargon article with a practical example of when a thin abstraction earns its complexity.',
    format:'Migration walkthrough + recipe cards + quality review rubric',
    outline:['Describe the archive consultation as a proposal, not a completed deprecation.', 'Compare task APIs, prompt builders, and app-owned recipes.', 'Separate content facts from style preferences.', 'Evaluate generated drafts with observable checks and human review.'],
    rows:[8,9,15],
    sources:['https://developer.chrome.com/docs/ai/task-api-polyfill','https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/writer-rewriter-polyfills','https://github.com/GoogleChromeLabs/web-ai-demos/blob/main/built-in-ai-task-apis-polyfills/summarizer-prompt-builder.js','https://developer.chrome.com/docs/ai/prompt-api'],
    demos:[
      {id:'voice-remix',title:'Voice Remix',hook:'Turn a style choice into an inspectable writing recipe.',action:'Adjust tone and audience, inspect the prompt, and generate a native draft.',lesson:'App-owned style is clearer when the recipe is visible.'},
      {id:'release-kitchen',title:'Release Kitchen',hook:'Turn three verified changes into a short release note with fact checks.',action:'Edit the facts, choose a format, draft, and inspect missing identifiers.',lesson:'A fluent draft still needs a check against the input facts.'},
      {id:'recipe-arena',title:'Recipe Arena',hook:'Compare a task summary and a custom prompt on the same source.',action:'Run both native paths and score their outputs yourself.',lesson:'Evaluate abstraction choices on the same task and evidence.'}
    ]
  },
  {
    id:'languages',rank:6,color:'#ccf6c5',title:'Your user should not have to switch languages',
    subtitle:'Language detection, translation, and reviewed proofreading',stage:'Detector and Translator documented; Proofreader developer trial',
    angle:'A bilingual support experience that keeps the original message visible and gives the writer control over translation and corrections.',
    value:'Connects your Spanish-speaking audience with your work on communication products, using a useful product flow instead of another chat wrapper.',
    format:'Product-engineering article + bilingual support mini-apps',
    outline:['Keep the original text and make translation an explicit action.', 'Detect language but expose uncertainty on short mixed text.', 'Check language-pair availability before promising a translation.', 'Keep proofreading English-only for the reviewed expert preview and review edits.'],
    rows:[10,18,26],
    sources:['https://developer.chrome.com/docs/ai/language-detection','https://developer.chrome.com/docs/ai/translator-api','https://developer.chrome.com/docs/ai/proofreader-api','https://docs.google.com/document/d/1RnSlXRAy8ffdbehvCcH7msBwmTvsxHJJQiwcw374tMw/edit'],
    demos:[
      {id:'bilingual-relay',title:'Bilingual Relay',hook:'A two-lane support conversation with the original always visible.',action:'Translate a Spanish message to English or reverse the language pair.',lesson:'Translation should preserve context and writer control.'},
      {id:'language-radar',title:'Language Radar',hook:'A confidence board for messages that mix languages.',action:'Compare long, short, and mixed messages with the native detector.',lesson:'Confidence needs interpretation; it is not a guarantee.'},
      {id:'proofread-review',title:'The Red Pen',hook:'Review a local proofreader’s suggestions before applying them.',action:'Proofread English text, inspect the proposed correction, then accept or reject it.',lesson:'Corrections belong to the author, not an automatic rewrite.'}
    ]
  },
  {
    id:'decisions',rank:7,color:'#ffe7a5',title:'A semantic if needs an escape route',
    subtitle:'Structured decisions, abstention, and evaluation',stage:'Concept exploration using Prompt API; no Decisions API implementation claimed',
    angle:'Use the archive’s intent-to-prototype as a question: how should an application behave when a model cannot make a reliable categorical decision?',
    value:'Adds an evidence-driven design essay to your pattern series, with measurable behavior instead of announcing an API that has no verified callable contract.',
    format:'Exploratory article + decision review board + a small evaluation set',
    outline:['Distinguish an intent-to-prototype from a shipped API.', 'Use structured Prompt API output for today’s experiment.', 'Separate model judgment from deterministic business rules.', 'Evaluate incorrect decisions and abstentions; never call a model score calibrated confidence.'],
    rows:[15],
    sources:['https://developer.chrome.com/docs/ai/prompt-api','https://developer.chrome.com/docs/ai/task-api-polyfill'],
    demos:[
      {id:'issue-router',title:'Issue Switchboard',hook:'Route a support issue while keeping an explicit review lane.',action:'Compare a transparent keyword baseline and a structured native model decision.',lesson:'An abstention is a valid output.'},
      {id:'comment-airlock',title:'Comment Airlock',hook:'Preview a moderation decision without publishing or deleting anything.',action:'Change the comment and escalation rules, then inspect the proposed route.',lesson:'A model recommendation and an application action are separate steps.'},
      {id:'abstention-lab',title:'Abstention Lab',hook:'Compare coverage and error on a labeled set of ambiguous messages.',action:'Adjust a word-margin threshold, inspect errors, then evaluate native decisions.',lesson:'Measure selective coverage and accepted errors without inventing confidence.'}
    ]
  }
];

if (window.I18N?.lang === "es") window.CONTENT_TOPICS = I18N.translateData(CONTENT_TOPICS);
