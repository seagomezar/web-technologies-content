# Content research and editorial recommendations

English · [Español](topic-review.es.md)

Checked on 2026-10-23 against the supplied CSV, accessible Google documentation, repository sources, and the live website.

## Scope and evidence quality

The CSV contains six metadata rows, a header on line 7, and 20 communications on lines 8–27.
The archive timeline and message subjects describe history; they do not establish the present support status of an API.
The audit attempted every one of the 62 distinct normalized archive URLs, plus 17 supplementary research URLs and four Google Docs text exports.
Mail actions and the Google-internal balance profile were classified without sending mail or trying to enter internal systems.
All four Google Docs bodies were retrieved through text export after their normal HTML pages returned only editor shells.
The 20 individual Google Groups message URLs returned thin group shells; the supplied CSV remains the evidence for those email bodies.
Chromium Dash and the linked language-error issue also returned app shells, so their technical bodies and exact browser-build claims remain unverified.
Feedback forms and event pages were inspected as context, without submitting anything.
The full per-URL outcomes are in [link-inventory.md](link-inventory.md) and [source-audit.json](source-audit.json).

## How this adds to the existing website

The live homepage and second archive page were read, along with the full small-model and BrowserDJ articles.
They establish existing coverage of browser inference, lexical in-memory RAG, WebGPU/LiteRT, procedural interfaces, agent architecture patterns, and engineering leadership.
This is a focused review of those recent pages, not a claim that the entire website archive has no coverage of the recommended subjects.

- [Small models and thoughtful design](https://www.sebastian-gomez.com/en/post/modelos-pequenos-buen-diseno-ia-navegador-litert-lm): follow with observable semantic retrieval and source review, rather than repeating the RAG introduction.
- [BrowserDJ architecture](https://www.sebastian-gomez.com/en/post/el-borde-es-inevitable-browserdj-ai-gemma-antigravity): follow with measured latency and explicit integration differences between browser-managed models and site-managed runtimes.
- [Recent website articles](https://www.sebastian-gomez.com/en) and [the next archive page](https://www.sebastian-gomez.com/en/posts/page/2): connect practical tools and evaluated recipes with the existing preference for architecture over terminology.

One editorial improvement would be to replace absolute statements about eliminating hallucinations, guaranteed privacy, or instantaneous responses with conditions and measured evidence.
Grounding reduces some failures, but a source identifier check does not establish factual support; the new evidence and timing demos make those limits visible.

## Recommended content, in publication order

The order reflects editorial judgment about novelty, usefulness on the website, and strength of accessible evidence.
It is not a measured SEO forecast or a claim about search volume.
Proposals 1–6 are implementation topics; proposal 7 is an explicitly conceptual experiment pending a verifiable Decisions API contract.

### 1.
Your website has tools, too

**Angle:** Turn a personal website into a useful collaborator: an agent can find a talk, prepare a reading route, and stage an action while the visitor sees every change.

**Website value:** Adds an agent interaction chapter to your existing browser AI work.
The reading-route demo could become a real feature on your site.

**Format:** Architecture article + 30-minute hands-on talk + a reusable tool-design checklist

**Status:** Experimental platform; publish as a practical lab

Suggested article structure:

1.
Start with a visitor goal: find three things to read before a talk.
2.
Connect a structured tool to the same function used by a button.
3.
Validate arguments, return useful errors, and keep state visible.
4.
Explain consequentialHint and debugging without treating annotations as authorization.

Three HTML demos:

- [Reading Route](../demos/reading-route.html): Build a personal reading trail with a typed page tool.
  Try: Add an article through the tool console, then remove it through the ordinary interface.
  Teaches: An agent and a human share application state.
- [The Last Click](../demos/consent-cart.html): A playful ticket cart where a tool prepares an action and a person completes it.
  Try: Stage a ticket request, reject it, then stage another and confirm it.
  Teaches: A consequential hint describes behavior; application code still enforces review.
- [Tool Observatory](../demos/tool-observatory.html): Inspect tool schemas, annotations, and error traces in a miniature flight recorder.
  Try: Filter debugging tools, run valid JSON, and try malformed arguments.
  Teaches: Tools need useful errors, a clear audience, and observable behavior.

CSV traceability: lines 14, 23, 27.

Primary sources: [source 1](https://developer.chrome.com/docs/ai/webmcp), [source 2](https://github.com/GoogleChromeLabs/webmcp-extension), [source 3](https://github.com/webmachinelearning/webmcp-types), [source 4](https://github.com/webmachinelearning/webmcp/pull/253), [source 5](https://github.com/webmachinelearning/webmcp/issues/176).

### 2.
AI starts before the first token

**Angle:** The feature is the entire journey: capability detection, a deliberate download, progress, cancellation, and an ordinary usable interface when the model is absent.

**Website value:** Turns the architectural thesis in your small-model article into a production-focused companion people can copy and test.

**Format:** Implementation guide + failure-state gallery + reusable lifecycle helper

**Status:** Current APIs with device and browser constraints

Suggested article structure:

1.
Detect APIs without starting a download.
2.
Request model creation from a user action.
3.
Stream, cancel, and release sessions.
4.
Test cross-origin policy and publish accurate setup instructions.

Three HTML demos:

- [Model Concierge](../demos/model-concierge.html): An airport-style departure board for local AI capabilities.
  Try: Inspect the actual browser, then explicitly prepare one model.
  Teaches: Availability is a state machine, not a boolean.
- [Stream Garden](../demos/stream-garden.html): Grow an answer one chunk at a time, then prune it with Cancel.
  Try: Run the labeled rehearsal, cancel midway, then try native streaming.
  Teaches: Cancellation and session cleanup belong in the user experience.
- [Iframe Passport](../demos/iframe-passport.html): Two local origins reveal whether an embedded AI feature has permission.
  Try: Load the second-origin frame with and without language-model delegation.
  Teaches: A working top-level API does not guarantee that an embedded demo works.

CSV traceability: lines 16, 18, 19, 21, 24, 25, 26.

Primary sources: [source 1](https://developer.chrome.com/docs/ai/built-in-ai-dos-donts), [source 2](https://developer.chrome.com/docs/ai/prompt-api), [source 3](https://developer.chrome.com/docs/ai/session-management), [source 4](https://github.com/webmachinelearning/proofreader-api/pull/14).

### 3.
Search by meaning, answer with evidence

**Angle:** Upgrade your existing in-memory RAG story by making retrieval observable: compare words with meaning, inspect neighbors, and show precisely what evidence an answer can use.

**Website value:** A concrete follow-up to your browser RAG article rather than another introduction to RAG.
The search demo is a candidate for your website archive.

**Format:** Deep technical article + searchable notebook + retrieval evaluation examples

**Status:** SemanticEmbedder developer trial; desktop Canary setup

Suggested article structure:

1.
Build an in-memory index with retrieval-document embeddings.
2.
Embed queries with retrieval-query and compare with cosine similarity.
3.
Keep embedding spaces consistent and reindex when the model changes.
4.
Show source passages and refuse an answer when evidence is weak.

Three HTML demos:

- [Meaning Compass](../demos/meaning-compass.html): Search a miniature article archive by a question rather than a keyword.
  Try: Compare the explicit word-overlap baseline with live native embeddings.
  Teaches: Use retrieval task hints and expose the ranking.
- [Duplicate Constellation](../demos/duplicate-constellation.html): Move a similarity threshold and watch related notes connect.
  Try: Add a note, compare word overlap, and compute native semantic similarities.
  Teaches: Similarity is continuous and thresholds require evidence.
- [Evidence Window](../demos/evidence-window.html): See the passages offered to a grounded answer before asking the model.
  Try: Retrieve sources, choose the evidence floor, then request a cited draft.
  Teaches: Retrieval quality and answer quality need separate inspection.

CSV traceability: lines 12.

Primary sources: [source 1](https://docs.google.com/document/d/1ZB6MW8UDczm4V6ej5MorZWqFCYWwLhUs5HKxEdjP35c/edit), [source 2](https://github.com/explainers-by-googlers/embedding-api).

### 4.
Faster, at which step?

**Angle:** Separate model preparation, first chunk, total generation, and output quality.
Reproduce the experiment rather than repeating an announcement percentage.

**Website value:** Adds reproducible measurement to the performance claims around BrowserDJ and local models, giving the site a reference-quality lab.

**Format:** Benchmark article + downloadable measurements + experiment protocol

**Status:** Gemma 4, MTP, and preference settings are developer trials

Suggested article structure:

1.
Record the device, browser, flags, sampling mode, and input.
2.
Separate setup time from first-chunk and total generation time.
3.
Compare equivalent configurations across browser restarts.
4.
Inspect quality as well as medians; do not equate speed preference with MTP.

Three HTML demos:

- [Latency Lens](../demos/latency-lens.html): A flight recorder for model setup, first chunk, and completed output.
  Try: Run actual native trials, export JSON, and compare labeled browser configurations.
  Teaches: A single completion time cannot explain a faster experience.
- [Preference Kitchen](../demos/preference-kitchen.html): An option mixer that explains why speed and capability recipes differ.
  Try: Try an incompatible speed recipe, fix it, and run the native Summarizer.
  Teaches: The speed expert has a restricted option set and does not use MTP.
- [Context Backpack](../demos/context-backpack.html): Pack source notes into the real session context budget.
  Try: Select notes and measure their actual context usage when the API is present.
  Teaches: Query runtime context capacity instead of hard-coding historical limits.

CSV traceability: lines 10, 11, 13, 17, 20, 22, 25.

Primary sources: [source 1](https://docs.google.com/document/d/1g7bv9LHSqFWqeQUM2C6EQ5PiZ8UWTz8UibxnlD4ipDE/edit), [source 2](https://docs.google.com/document/d/1rpaV4la7WtpLr4Ueb0NttJVETlVL_5a9TNHsrBMBkWk/edit), [source 3](https://docs.google.com/document/d/1RnSlXRAy8ffdbehvCcH7msBwmTvsxHJJQiwcw374tMw/edit), [source 4](https://developer.chrome.com/docs/ai/prompt-api).

### 5.
From rigid APIs to recipes you can evaluate

**Angle:** Build a small prompt-recipe layer with explicit inputs, output contracts, and evaluation.
Keep the writer in control of facts and style.

**Website value:** Extends your pattern-versus-jargon article with a practical example of when a thin abstraction earns its complexity.

**Format:** Migration walkthrough + recipe cards + quality review rubric

**Status:** Migration design; deprecation remains an archive proposal

Suggested article structure:

1.
Describe the archive consultation as a proposal, not a completed deprecation.
2.
Compare task APIs, prompt builders, and app-owned recipes.
3.
Separate content facts from style preferences.
4.
Evaluate generated drafts with observable checks and human review.

Three HTML demos:

- [Voice Remix](../demos/voice-remix.html): Turn a style choice into an inspectable writing recipe.
  Try: Adjust tone and audience, inspect the prompt, and generate a native draft.
  Teaches: App-owned style is clearer when the recipe is visible.
- [Release Kitchen](../demos/release-kitchen.html): Turn three verified changes into a short release note with fact checks.
  Try: Edit the facts, choose a format, draft, and inspect missing identifiers.
  Teaches: A fluent draft still needs a check against the input facts.
- [Recipe Arena](../demos/recipe-arena.html): Compare a task summary and a custom prompt on the same source.
  Try: Run both native paths and score their outputs yourself.
  Teaches: Evaluate abstraction choices on the same task and evidence.

CSV traceability: lines 8, 9, 15.

Primary sources: [source 1](https://developer.chrome.com/docs/ai/task-api-polyfill), [source 2](https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/writer-rewriter-polyfills), [source 3](https://github.com/GoogleChromeLabs/web-ai-demos/blob/main/built-in-ai-task-apis-polyfills/summarizer-prompt-builder.js), [source 4](https://developer.chrome.com/docs/ai/prompt-api).

### 6.
Your user should not have to switch languages

**Angle:** A bilingual support experience that keeps the original message visible and gives the writer control over translation and corrections.

**Website value:** Connects your Spanish-speaking audience with your work on communication products, using a useful product flow instead of another chat wrapper.

**Format:** Product-engineering article + bilingual support mini-apps

**Status:** Detector and Translator documented; Proofreader developer trial

Suggested article structure:

1.
Keep the original text and make translation an explicit action.
2.
Detect language but expose uncertainty on short mixed text.
3.
Check language-pair availability before promising a translation.
4.
Keep proofreading English-only for the reviewed expert preview and review edits.

Three HTML demos:

- [Bilingual Relay](../demos/bilingual-relay.html): A two-lane support conversation with the original always visible.
  Try: Translate a Spanish message to English or reverse the language pair.
  Teaches: Translation should preserve context and writer control.
- [Language Radar](../demos/language-radar.html): A confidence board for messages that mix languages.
  Try: Compare long, short, and mixed messages with the native detector.
  Teaches: Confidence needs interpretation; it is not a guarantee.
- [The Red Pen](../demos/proofread-review.html): Review a local proofreader’s suggestions before applying them.
  Try: Proofread English text, inspect the proposed correction, then accept or reject it.
  Teaches: Corrections belong to the author, not an automatic rewrite.

CSV traceability: lines 10, 18, 26.

Primary sources: [source 1](https://developer.chrome.com/docs/ai/language-detection), [source 2](https://developer.chrome.com/docs/ai/translator-api), [source 3](https://developer.chrome.com/docs/ai/proofreader-api), [source 4](https://docs.google.com/document/d/1RnSlXRAy8ffdbehvCcH7msBwmTvsxHJJQiwcw374tMw/edit).

### 7.
A semantic if needs an escape route

**Angle:** Use the archive’s intent-to-prototype as a question: how should an application behave when a model cannot make a reliable categorical decision?

**Website value:** Adds an evidence-driven design essay to your pattern series, with measurable behavior instead of announcing an API that has no verified callable contract.

**Format:** Exploratory article + decision review board + a small evaluation set

**Status:** Concept exploration using Prompt API; no Decisions API implementation claimed

Suggested article structure:

1.
Distinguish an intent-to-prototype from a shipped API.
2.
Use structured Prompt API output for today’s experiment.
3.
Separate model judgment from deterministic business rules.
4.
Evaluate incorrect decisions and abstentions; never call a model score calibrated confidence.

Three HTML demos:

- [Issue Switchboard](../demos/issue-router.html): Route a support issue while keeping an explicit review lane.
  Try: Compare a transparent keyword baseline and a structured native model decision.
  Teaches: An abstention is a valid output.
- [Comment Airlock](../demos/comment-airlock.html): Preview a moderation decision without publishing or deleting anything.
  Try: Change the comment and escalation rules, then inspect the proposed route.
  Teaches: A model recommendation and an application action are separate steps.
- [Abstention Lab](../demos/abstention-lab.html): Compare coverage and error on a labeled set of ambiguous messages.
  Try: Adjust a word-margin threshold, inspect errors, then evaluate native decisions.
  Teaches: Measure selective coverage and accepted errors without inventing confidence.

CSV traceability: lines 15.

Primary sources: [source 1](https://developer.chrome.com/docs/ai/prompt-api), [source 2](https://developer.chrome.com/docs/ai/task-api-polyfill).

## Every communication reviewed

| CSV line | Date | Topic | Finding | Proposal |
| --- | --- | --- | --- | --- |
| 8 | 2026-09-22 | Writer/Rewriter consultation | Proposal corroborated; archive link mismatch | recipes |
| 9 | 2026-09-23 | Task APIs as prompt recipes | Corroborated design explanation | recipes |
| 10 | 2026-06-01 | Summarizer and Proofreader expert models | Guide body read; developer-trial constraints | performance, languages |
| 11 | 2026-06-04 | Speed preference limitations | Guide body read; material caveat | performance |
| 12 | 2026-07-15 | On-device text embeddings | Guide and explainer read; developer trial | retrieval |
| 13 | 2026-10-20 | Gemma 4 multi-token prediction | Guide body read; email percentage is not a benchmark | performance |
| 14 | 2026-10-15 | WebMCP developer tools | Docs and linked repositories reviewed | webmcp |
| 15 | 2026-10-05 | Decisions / Semantic If and deprecation reminder | Intent-to-prototype only; no verified callable contract | decisions, recipes |
| 16 | 2025-04-01 | New static API entry points | Historical migration; current shapes confirmed | lifecycle |
| 17 | 2026-08-25 | Gemma 4 developer trial | Guide body read; avoid general shipping claim | performance |
| 18 | 2025-09-17 | Origin-trial feedback, Proofreader, Chromebook Plus, summit | Historical program bundle; refresh each product status | languages, lifecycle |
| 19 | 2026-07-28 | Built-in AI do and don’t | Public UX guidance reviewed | lifecycle |
| 20 | 2024-12-04 | Historical 6,144-token context window | Historical fact; not a current invariant | performance |
| 21 | 2025-07-10 | AI in cross-origin iframes | Current delegation pattern confirmed | lifecycle |
| 22 | 2024-11-28 | Historical 1,024-token prompt caveat removed | Historical change; still bounded by session context | performance |
| 23 | 2026-09-22 | WebMCP debugging annotation | Merged specification change verified; version assertion kept separate | webmcp |
| 24 | 2025-05-22 | TypeScript types updated | Historical announcement; maintained package verified | lifecycle |
| 25 | 2025-01-30 | Debugging local models | Current diagnostic destination corroborated | lifecycle, performance |
| 26 | 2024-11-29 | Untested-language workaround | Historical workaround; replace in new content | languages, lifecycle |
| 27 | 2026-09-04 | WebMCP consequentialHint | Current type contract and discussion reviewed | webmcp |

### CSV line 8: Writer/Rewriter consultation

**Conclusion:** Proposal corroborated; archive link mismatch.
The linked document is the expert-model guide, not the consultation.
The [polyfill repository](https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/writer-rewriter-polyfills) independently describes the proposed removal.
Do not announce completed deprecation or infer the final decision from today’s consultation deadline.

Evidence: [source 1](https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/writer-rewriter-polyfills), [source 2](https://developer.chrome.com/docs/ai/task-api-polyfill).

### CSV line 9: Task APIs as prompt recipes

**Conclusion:** Corroborated design explanation.
The [official task-polyfill article](https://developer.chrome.com/docs/ai/task-api-polyfill) and linked prompt-builder code support comparing custom prompts with task abstractions.
A polyfill does not automatically establish equivalent quality or universal browser availability.

Evidence: [source 1](https://developer.chrome.com/docs/ai/task-api-polyfill), [source 2](https://github.com/GoogleChromeLabs/web-ai-demos/blob/main/built-in-ai-task-apis-polyfills/summarizer-prompt-builder.js).

### CSV line 10: Summarizer and Proofreader expert models

**Conclusion:** Guide body read; developer-trial constraints.
The [EPP guide](https://docs.google.com/document/d/1RnSlXRAy8ffdbehvCcH7msBwmTvsxHJJQiwcw374tMw/edit) documents the specialist preview.
Proofreader has no preference option and its expert preview is English-only.
Separate this preview from the baseline Summarizer API.

Evidence: [source 1](https://docs.google.com/document/d/1RnSlXRAy8ffdbehvCcH7msBwmTvsxHJJQiwcw374tMw/edit), [source 2](https://developer.chrome.com/docs/ai/proofreader-api).

### CSV line 11: Speed preference limitations

**Conclusion:** Guide body read; material caveat.
The [expert-model guide](https://docs.google.com/document/d/1RnSlXRAy8ffdbehvCcH7msBwmTvsxHJJQiwcw374tMw/edit) limits speed output to English, key-points/tldr, and short/medium length; markdown behaves like plain text.
Incompatible combinations can report unavailable or fail creation.

Evidence: [source 1](https://docs.google.com/document/d/1RnSlXRAy8ffdbehvCcH7msBwmTvsxHJJQiwcw374tMw/edit).

### CSV line 12: On-device text embeddings

**Conclusion:** Guide and explainer read; developer trial.
The [testing guide](https://docs.google.com/document/d/1ZB6MW8UDczm4V6ej5MorZWqFCYWwLhUs5HKxEdjP35c/edit) uses SemanticEmbedder and taskType on embed(), not create().
The July 31 revision adds download-progress support after 153.0.7979.0.
Recompute an index in the same space; dimensions alone do not prove compatibility.

Evidence: [source 1](https://docs.google.com/document/d/1ZB6MW8UDczm4V6ej5MorZWqFCYWwLhUs5HKxEdjP35c/edit), [source 2](https://github.com/explainers-by-googlers/embedding-api).

### CSV line 13: Gemma 4 multi-token prediction

**Conclusion:** Guide body read; email percentage is not a benchmark.
The [October 21 guide](https://docs.google.com/document/d/1g7bv9LHSqFWqeQUM2C6EQ5PiZ8UWTz8UibxnlD4ipDE/edit) requires Canary 156.0.8064.0+ and the MTP flag.
Prompt needs most-predictable sampling; Summarizer speed uses a different model.
Measure warm generation and cold preparation separately.
The CSV’s +20–30% is not a result measured here.

Evidence: [source 1](https://docs.google.com/document/d/1g7bv9LHSqFWqeQUM2C6EQ5PiZ8UWTz8UibxnlD4ipDE/edit).

### CSV line 14: WebMCP developer tools

**Conclusion:** Docs and linked repositories reviewed.
The extension, types, and skills repository support an article about designing, exposing, and inspecting tools.
A skills repository is a source to review, not an instruction to install or execute it.
The extension’s local-server mode can send data to a hosted model; WebMCP itself is not an on-device model.

Evidence: [source 1](https://developer.chrome.com/docs/ai/webmcp), [source 2](https://github.com/GoogleChromeLabs/webmcp-extension), [source 3](https://github.com/webmachinelearning/webmcp-types), [source 4](https://github.com/GoogleChromeLabs/webmcp-tools/tree/main/webmcp-skills).

### CSV line 15: Decisions / Semantic If and deprecation reminder

**Conclusion:** Intent-to-prototype only; no verified callable contract.
The CSV announces exploration, and its technical link targets Writer/Rewriter polyfills.
No reviewed source supplies a Decisions API callable contract.
Treat the proposed decision article as an explicitly conceptual Prompt API experiment, with structured output and an abstention lane.

Evidence: [source 1](https://developer.chrome.com/docs/ai/prompt-api), [source 2](https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/writer-rewriter-polyfills).

### CSV line 16: New static API entry points

**Conclusion:** Historical migration; current shapes confirmed.
The current [Prompt API guide](https://developer.chrome.com/docs/ai/prompt-api) uses self.LanguageModel with static availability() and create().
Explain migration through a maintained capability helper; avoid obsolete window.ai examples.

Evidence: [source 1](https://developer.chrome.com/docs/ai/prompt-api).

### CSV line 17: Gemma 4 developer trial

**Conclusion:** Guide body read; avoid general shipping claim.
The [August guide](https://docs.google.com/document/d/1rpaV4la7WtpLr4Ueb0NttJVETlVL_5a9TNHsrBMBkWk/edit) specifies Canary 153.0.8009.0+ and a flag.
Up to 70% is a reported observation, not a guaranteed gain.
The guide describes function calling as future work rather than proof it is already exposed.
Browser-managed built-in inference is a different integration from a site-managed LiteRT/WebGPU model.

Evidence: [source 1](https://docs.google.com/document/d/1rpaV4la7WtpLr4Ueb0NttJVETlVL_5a9TNHsrBMBkWk/edit).

### CSV line 18: Origin-trial feedback, Proofreader, Chromebook Plus, summit

**Conclusion:** Historical program bundle; refresh each product status.
The origin-trial explainer describes enrollment, not perpetual availability.
Current Proofreader documentation still labels a developer trial.
Do not advertise the 2025 summit as an upcoming event or generalize Chromebook Plus support to every Chromebook.

Evidence: [source 1](https://developer.chrome.com/docs/web-platform/origin-trials), [source 2](https://developer.chrome.com/docs/ai/proofreader-api), [source 3](https://developer.chrome.com/docs/ai/prompt-api), [source 4](https://rsvp.withgoogle.com/events/web-ai-summit-2025).

### CSV line 19: Built-in AI do and don’t

**Conclusion:** Public UX guidance reviewed.
The public guide supports a lifecycle article: deliberate preparation, progress, user control, and understandable failure states.
Use runtime detection and a useful ordinary interface instead of implying universal model support.

Evidence: [source 1](https://developer.chrome.com/docs/ai/built-in-ai-dos-donts).

### CSV line 20: Historical 6,144-token context window

**Conclusion:** Historical fact; not a current invariant.
The 2024 email records a limit at that time.
Current [Prompt documentation](https://developer.chrome.com/docs/ai/prompt-api) exposes contextWindow, contextUsage, and measureContextUsage.
Ask the active session rather than hard-coding 6,144.

Evidence: [source 1](https://developer.chrome.com/docs/ai/prompt-api).

### CSV line 21: AI in cross-origin iframes

**Conclusion:** Current delegation pattern confirmed.
Current documentation specifies per-API policy tokens, such as language-model and proofreader.
MDN explains the allow attribute, and the linked Proofreader PR supplies design history.
A two-port local probe tests the boundary without requesting a model download.

Evidence: [source 1](https://developer.chrome.com/docs/ai/prompt-api), [source 2](https://developer.chrome.com/docs/ai/proofreader-api), [source 3](https://github.com/webmachinelearning/proofreader-api/pull/14), [source 4](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#allow).

### CSV line 22: Historical 1,024-token prompt caveat removed

**Conclusion:** Historical change; still bounded by session context.
Removing that historical per-prompt caveat does not mean unlimited input.
Measure the assembled prompt against the runtime session window using the [current API](https://developer.chrome.com/docs/ai/prompt-api).

Evidence: [source 1](https://developer.chrome.com/docs/ai/prompt-api).

### CSV line 23: WebMCP debugging annotation

**Conclusion:** Merged specification change verified; version assertion kept separate.
PR #253 is merged and current type definitions include debugging.
The Chromium Dash link only returned an app shell, so the claimed first Chrome build was not independently verified from that URL.
The observatory filters intended developer tools rather than treating debugging as a permissions system.

Evidence: [source 1](https://github.com/webmachinelearning/webmcp/pull/253), [source 2](https://github.com/webmachinelearning/webmcp-types).

### CSV line 24: TypeScript types updated

**Conclusion:** Historical announcement; maintained package verified.
Current [Chrome documentation](https://developer.chrome.com/docs/ai/prompt-api) recommends @types/dom-chromium-ai.
WebMCP has a separate types package.
Types should match the tested browser contract; installing types does not add runtime support.

Evidence: [source 1](https://developer.chrome.com/docs/ai/prompt-api), [source 2](https://github.com/webmachinelearning/webmcp-types).

### CSV line 25: Debugging local models

**Conclusion:** Current diagnostic destination corroborated.
Current [Prompt documentation](https://developer.chrome.com/docs/ai/prompt-api) links chrome://on-device-internals for model information.
Use that with console errors and recorded configuration; it is an internal diagnostic page rather than a callable web API.

Evidence: [source 1](https://developer.chrome.com/docs/ai/prompt-api).

### CSV line 26: Untested-language workaround

**Conclusion:** Historical workaround; replace in new content.
The issue URL returned only a JavaScript shell, so its resolution was not verified.
The [current Prompt guide](https://developer.chrome.com/docs/ai/prompt-api) documents expected input/output languages and NotSupportedError.
New demos declare supported languages and preserve failures; they do not reproduce the old safety-classifier flag workaround.

Evidence: [source 1](https://developer.chrome.com/docs/ai/prompt-api), [source 2](https://issues.chromium.org/issues/392661409).

### CSV line 27: WebMCP consequentialHint

**Conclusion:** Current type contract and discussion reviewed.
The types define consequentialHint for consequential real-world actions; issue #176 provides its motivation.
This is metadata for the consuming agent, not application authorization.
Enforce the review boundary in application code and test rejection as well as confirmation.
The linked Chromium Dash page did not expose the commit body.

Evidence: [source 1](https://github.com/webmachinelearning/webmcp-types), [source 2](https://github.com/webmachinelearning/webmcp/issues/176), [source 3](https://github.com/GoogleChromeLabs/webmcp-extension).

## Slide brief and working assumptions

The attached brief was read before construction.
Its requested artifact is an HTML deck, so no PowerPoint deck was created.
The structure question was asked before building, followed separately by language and duration questions.
Working defaults are one WebMCP talk and 30 minutes with three demos; both English and Spanish content and speaker notes are available through the language selector.
The structure and duration remain configurable rather than presented as user-confirmed choices.
The first three slide mockups were rendered and shown before expanding the deck.
The event city is not supplied and remains visibly labeled as pending; use the city query parameter when the event is known.

The event template was exported and visually inspected, including its color and typography specification and title/content layouts.
The theme uses the verified #f0f0f0 off-white, white outlined notched panels, the track lockup, the extracted GDG logo, local Google Sans Bold and Roboto Mono Light, and the template’s primary, halftone, and pastel colors.
The template PDF, font source CSS, and rendered reference are kept locally as research evidence.

No website publishing, messaging, form submission, origin-trial registration, or account changes were performed.
