# Web AI content studio

English · [Español](README.es.md)

Seven content proposals for sebastian-gomez.com, each with three original HTML demos, plus an English and Spanish WebMCP talk with 20 slides and a 30-minute plan.
The source review covers all 20 CSV communications and accounts for all 62 distinct normalized archive URLs.

## Open the work

```sh
npm run serve
```

Open [the gallery](http://localhost:8080), [the talk](http://localhost:8080/slides/index.html), or [the three opening mockups](http://localhost:8080/slides/mockups.html).
The small Python server listens only on the loopback interface.
Port 8081 supplies a second local origin for the iframe policy demo.

The deck also opens directly from `slides/index.html` with no internet connection.
All scripts, fonts, and logo assets are local.
The iframe demo needs the two-origin server; native AI needs a compatible secure context, browser, device, and model.

## Languages

Use the **English / Español** selector on the gallery, demos, and slide decks, or add `?lang=en` / `?lang=es`.
English is the default in the Web AI Lab gallery, demos, and WebMCP deck when no language is specified (`slides-trustable-ai/` defaults to Spanish unless `?lang=en` is passed, and `slides-trustable-ai/live-sim.html` switches via `?lang=en` / `?lang=es`).
Links carry the language between the gallery, demos, slides, presenter, and iframe probe.
Switching languages preserves the current slide and build in the URL.
The complete editorial review, link inventory, CSV judgments, and setup guide have parallel Spanish versions.
Technical identifiers, original external sources, licenses, and machine-readable evidence retain their original form.
Native examples that declare English inputs or outputs remain labeled English; switching the interface does not change the tested model contract.
The translation and detection demos intentionally preserve their multilingual samples.

## What to read

- [Editorial recommendations and every topic review](research/topic-review.md)
- [Every archive link and its evidence status](research/link-inventory.md)
- [Machine-readable audit and guide export evidence](research/source-audit.json)
- [CSV row judgments](research/row-review.json)
- [Tidy reviewed CSV](output/spreadsheet/reviewed-topics.csv)
- [Browser verification results](review/verification.json)
- [Code examples and native API checks](review/slide-code-verification.json)
- [Rendered slide contact sheet](review/deck-contact-sheet-en.jpg)

The top recommendation is **Your website has tools, too**, a WebMCP article and talk about reusing ordinary page actions for agents.
The next chapters cover local-model lifecycle, semantic retrieval, performance measurement, prompt recipes, multilingual UX, and decisions with an explicit review lane.
The last proposal is a concept experiment using the documented Prompt API; it does not call or invent a Decisions API.

## Native AI setup

No page automatically creates a model, and no hosted model fallback is configured.
Native actions are explicitly labeled.
The browser may download a model when a visitor requests native processing.
An educational word-overlap baseline, rule evaluation, or streaming rehearsal is always labeled separately from native inference.

Check the live documentation linked from each demo before changing flags or promising support.
The research describes the state reviewed on 2026-10-23, and preview contracts can change.

| Feature | Reviewed setup and limitation |
| --- | --- |
| Prompt and Summarizer | Runtime feature detection and `availability()`; eligible browser, hardware, storage, and model required. |
| WebMCP | Local development flag `chrome://flags/#enable-webmcp-testing`, or the documented origin trial; the demos use `document.modelContext`. |
| SemanticEmbedder | Reviewed desktop Canary developer trial, above 153.0.7979.0, with `chrome://flags/#semantic-embedder-api`; task hints go on `embed()`. |
| Summarizer preference | Reviewed expert-model trial uses `chrome://flags/#summarizer-api-performance-preference`; speed supports a restricted English output configuration. |
| Proofreader | Reviewed developer trial uses `chrome://flags/#proofreader-api`; the expert preview is English-only. |
| Gemma 4 | Reviewed Canary trial uses `chrome://flags/#gemma4-for-built-in-ai`; this is distinct from a site-managed WebGPU/LiteRT integration. |
| MTP | Reviewed guide requires 156.0.8064.0+ and `chrome://flags/#on-device-model-speculative-decoding` or `#built-in-ai-mtp`; Prompt also needs `samplingMode: "most-predictable"`. |
| Translator and LanguageDetector | Check the API and the requested language pair; support and downloaded model state are device-specific. |

Latency Lens records actual session setup, first-chunk latency, full generation duration, characters, and characters per second.
It does not equate chunks with tokens or claim to detect whether MTP is active.
Record device, browser, flags, input, and sampling settings manually and compare repeated equivalent runs across browser restarts.
No performance improvement percentages are fabricated.

## Slide controls and customization

Six slides include JavaScript excerpts for registration, schemas, recoverable errors, explicit review, debugging annotations, and support detection.
Code line highlights advance with the clicker and stay synchronized with the presenter script.
Each example links to its working demo and complete source.
Excerpts omit surrounding application setup; the presenter notes identify helper dependencies and the complete demos include validation and cancellation.

- **Right / Down / Space / Enter / PageDown:** next build, then next slide.
- **Left / Up / PageUp / Backspace:** previous build or slide.
- **Home / End:** first or last slide.
- **P:** open the presenter window.
- **F:** fullscreen.
- **C:** show or hide the controls.
- **Shift + Right / Shift + Left:** next or previous whole slide, plus `#slide-select`, slide background click, or horizontal touch-swipe to advance without intercepting demo links or controls.

The address stores the slide and build, for example `#3.2`.
Reloading restores both.
The presenter window has the current slide, the next slide, the script with its current build highlighted, wall time, elapsed time, remaining planned time, and pause/reset controls.
Keep the deck open while using the presenter window.
Offline local-file mode uses opener messaging as well as a channel; serving the folder is preferable when using independent windows.

The structure, language, and duration questions were asked separately before expanding the deck.
The current choices are working defaults, not claimed user confirmations: one hands-on talk, 30 minutes, with three demos.
The event city has not been supplied, so its pill visibly says `City to be confirmed` or `Ciudad por confirmar`.
Set the actual city and adjusted clock plan in the address:

```text
slides/index.html?lang=en&city=Bogot%C3%A1&minutes=30
```

The city example above is a configuration example, not a claim about the event location.
Changing `minutes` scales the per-slide clock plan; edit the talk content to make a substantively shorter or longer talk.
Use a distinct `session` query value if running multiple talks at the same time.

- `slides/theme.css`: organizer colors, fonts, lockup, outlined panels, and branding.
- `slides/deck.css`: scaling, content layout, transitions, and navigation controls.
- `slides/talk.js`: opening slides, metadata, and initial script.
- `slides/full-talk.js`: the rest of the talk and per-slide timing.
- `slides/talk-i18n.js`: startup English/Spanish localization pass over `window.TALK`.
- `slides/deck.js`: keyboard/clicker behavior, address state, and presenter transport.
- `slides/presenter.*`: presenter interface and planned clock.

The appearance was recreated from the supplied DevFest 2026 template after inspecting its exported PDF.
Google Sans Bold headlines and Roboto Mono Light subheads are stored locally.
The logo was extracted from the supplied organizer template, and the colors follow its specification.
Brand and font provenance is recorded in [slides/assets/SOURCES.md](slides/assets/SOURCES.md).

## Verification

```sh
npm install
npm test
node scripts/verify-slide-code.mjs
```

The test suite uses Playwright with an installed Google Chrome and, for the native WebMCP check, Google Chrome Canary.
It can start its own local server if one is not already running.
The Canary check enables experimental web platform features only in a temporary test profile and does not change your installed browser profile.

The suite checks all 21 demos on desktop and mobile, important visible interactions, second-origin policy behavior, model session cleanup, slide/build navigation, presenter sync, clock controls, offline fonts, and reduced motion.
Native AI adapter tests use explicit contract doubles to check wiring and resource handling.
Those tests do not establish model output quality, hardware performance, successful model downloads, semantic retrieval quality, or the real-world behavior of an external agent.
The verification JSON separately records actual API availability and native WebMCP discovery in the test browsers.
Additional checks cover [the offline presenter](review/offline-presenter.json) and [keyboard activation of focused links and controls](review/keyboard-verification.json).

The research scripts preserve the original CSV unchanged.
`scripts/research.py` fetches evidence, `scripts/export-guides.py` reads the four guide bodies through text export, and `scripts/repair-evidence.py` retries failed TLS reads with the macOS system certificate store.
Run `python3 scripts/build-locales.py` after editing the authored locale catalogs in `locales/`.
Use `scripts/build-pages.py` and `scripts/build-research.py` to regenerate the HTML entry points and research views after editing their source data.
Run `uv run --with pandas python scripts/export-review-csv.py` for the independent tabular validation and tidy CSV export.

Run `node scripts/verify-languages.mjs` to check both languages, translated proposal coverage, demo interactions, presenter notes, offline switching, and layout.

Nothing has been deployed to the personal website, and no email, feedback form, or origin-trial enrollment was submitted.

## DevFest Pereira 2026 Workshop: Building Trustable AI at 100 MPH

- [Workshop Slide Deck (37 slides, ES/EN)](slides-trustable-ai/index.html?lang=en)
- [Facilitator Presenter View (90-minute plan)](slides-trustable-ai/presenter.html?lang=en)
- [Interactive Split-Brain Simulator](slides-trustable-ai/live-sim.html?lang=en)
- [Updated Official GitHub Repository (`seagomezar/trustable-ai-codelab`)](https://github.com/seagomezar/trustable-ai-codelab)
- [Modernized Local Codebase (FastAPI SSE + Koru React + Gemini 3.8)](workshops/trustable-ai-codelab/README.md)
- Automated workshop verification: `node scripts/verify-trustable-ai-workshop.mjs`

---

## System Overview

`sebastian-gomez-web-ai-content-lab` is an offline-capable bilingual (English/Spanish) web studio, browser AI demo gallery, slide presentation runtime, source-reviewed editorial archive, and full-stack workshop repository. The root gallery (`index.html`, `gallery.js`, `content-data.js`, `i18n.js`, `locale-data.js`) indexes 7 reviewed Chrome Built-in AI and WebMCP proposals across 21 standalone HTML demos (`demos/`), two zero-bundler offline slide decks with dual-window `BroadcastChannel` / `postMessage` presenter consoles (`slides/` and `slides-trustable-ai/`), Python/Node build and Playwright verification pipelines (`scripts/`), and the modernized FastAPI SSE + React 19 Split-Brain racing coach workshop (`workshops/`).

## Local Interface & Invariants

### Root Interface

- `[package.json:name]` — Private package `"sebastian-gomez-web-ai-content-lab"` (`v1.0.0`) with devDependency `@playwright/test@1.58.2` (`[package.json:devDependencies.@playwright/test]`).
- `[package.json:scripts.serve]` — CLI script running `"python3 scripts/serve.py"`.
- `[package.json:scripts.test]` — CLI script running `"node scripts/verify.mjs"`.
- `[index.html:#filter]` & `[index.html:#topics]` — Gallery search `<input id="filter">` and `<div id="topics" class="cards">` mount target hydrated by `[gallery.js:render]`.
- `[locale-data.js:window.LOCALES]`, `[locale-data.js:window.LOCALE_PATTERNS]`, & `[locale-data.js:window.TALK_EN]` — Compiled browser globals holding exact EN/ES string maps, regex translation pairs, and the English WebMCP talk dataset.
- `[i18n.js:window.I18N]` — Global localization API `{ lang, text, translateData, url }` resolving `lang` (`'en' | 'es'`), translating strings/objects, and localizing same-origin URLs.
- `[content-data.js:window.CONTENT_TOPICS]` — Global array of 7 topic descriptors (`'webmcp'`, `'lifecycle'`, `'retrieval'`, `'performance'`, `'recipes'`, `'languages'`, `'decisions'`; ranks `1`–`7`) defining 3 demos each (21 total), outlines, CSV row numbers, and source URLs.

### Root Invariants

- `[package.json:private]` — Remains `true` with zero runtime `dependencies` at the root level.
- `[index.html:head]` — Deferred scripts must execute in strict sequence (`locale-data.js` -> `i18n.js` -> `content-data.js` -> `gallery.js`) so `window.LOCALES`/`window.LOCALE_PATTERNS` precede `i18n.js`, `window.I18N` precedes `content-data.js`, and both `CONTENT_TOPICS` and `I18N` precede `gallery.js`.
- `[i18n.js:lang]` — Active language is binary: `new URLSearchParams(location.search).get('lang') === 'es'` resolves to `'es'`; all other or missing values resolve to `'en'`.
- `[i18n.js:I18N.text]` — Looks up trimmed strings in `window.LOCALES?.[lang]`, falling back to `window.LOCALE_PATTERNS?.[lang]` regex pairs with recursive `text()` substitution on `$1..$n` capture groups while preserving outer whitespace.
- `[i18n.js:I18N.translateData]` — Translates string values inside arrays and plain objects recursively without mutating object keys or non-string primitives.
- `[i18n.js:I18N.url]` — Leaves cross-origin URLs (`target.origin !== location.origin`) unchanged; swaps `.md` / `.es.md` suffixes for `/README(.es).md`, `/topic-review(.es).md`, and `/link-inventory(.es).md`, and sets `?lang=<targetLang>` only when `pathname` ends with `.html` or `/`.
- `[i18n.js:localize]` — Skips hash-only anchor `href` attributes (`!a.startsWith('#')`), skips text nodes matching `'script,style,code,pre:not(#ledger),textarea,[data-original],.language-switch'`, translates `placeholder`, `title`, `aria-label`, `alt`, and `content` attributes, and pins missing `<option value>` attributes to pre-localized `textContent` before translating option labels.
- `[gallery.js:render]` — Requires `#filter`, `#topics`, `CONTENT_TOPICS`, and `I18N.url`, and requires every entry in `t.sources` to be a valid absolute URL for `new URL(u)` (HTML-escaped via `[gallery.js:esc]`).

### Root Side Effects

- `[locale-data.js:window.LOCALES]` — Assigns `window.LOCALES`, `window.LOCALE_PATTERNS`, and `window.TALK_EN` on load.
- `[i18n.js:window.I18N]` & `[i18n.js:DOMContentLoaded]` — Assigns `window.I18N`, sets `document.documentElement.lang`, appends `<nav class="language-switch">`, binds `hashchange`/`popstate` listeners (`[i18n.js:sync]`), wraps `history.pushState` and `history.replaceState`, localizes DOM text/attributes/links, and attaches a subtree `MutationObserver` on `document.body` watching `attributeFilter: ['placeholder', 'title', 'aria-label', 'href']`.
- `[content-data.js:window.CONTENT_TOPICS]` — Defines `window.CONTENT_TOPICS` and overwrites it in place via `I18N.translateData(CONTENT_TOPICS)` when `window.I18N?.lang === 'es'`.
- `[gallery.js:render]` — Binds an `input` listener on `#filter` and renders module cards into `#topics.innerHTML`.

## Subdirectories & System Boundaries

- **Interactive Browser Demos (`demos`)**: [./demos/README.md](./demos/README.md) (and [./demos/assets/README.md](./demos/assets/README.md)) — 21 standalone Chrome Built-in AI and WebMCP HTML demo entry pages plus the cross-origin `Permissions-Policy` probe (`iframe-probe.html`), backed by `window.Lab` session adapters and feature controllers in `demos/assets/`.
- **Build, Serving & Verification Scripts (`scripts`)**: [./scripts/README.md](./scripts/README.md) — Dual-origin loopback HTTP server (`serve.py` on `:8080` and `:8081`), Playwright Built-in AI contract doubles (`native-contracts.mjs`), automated browser/localization/code/workshop verifiers (`verify*.mjs`), locale/page/research compilers (`build-*.py`), source-audit tools, and Advocu session autofill helper.
- **WebMCP Talk Deck (`slides`)**: [./slides/README.md](./slides/README.md) — Offline-capable, bilingual 20-slide HTML presentation runtime (`deck.js`, `talk.js`, `full-talk.js`, `talk-i18n.js`) and synchronized speaker presenter console (`presenter.js`) for the 30-minute WebMCP talk.
- **Trustable AI Workshop Deck (`slides-trustable-ai`)**: [./slides-trustable-ai/README.md](./slides-trustable-ai/README.md) — Zero-bundler, offline-capable 37-slide bilingual facilitator presentation, presenter console, and embedded 10Hz Split-Brain cockpit simulator (`live-sim.html`) for the 90-minute DevFest Pereira 2026 workshop.
- **Technical Workshops (`workshops`)**: [./workshops/README.md](./workshops/README.md) (and [./workshops/trustable-ai-codelab/README.md](./workshops/trustable-ai-codelab/README.md)) — Full-stack "Building Trustable AI at 100 MPH" codelab pairing the Python FastAPI 10Hz GPSD SSE telemetry server (`streaming-telemetry-server`) with the React 19 + TypeScript + `@google/genai` Koru Split-Brain racing coach application (`koru-application`).
- **Non-Code Catalogs, Research & Evidence Assets**: Authored locale JSON catalogs (`./locales/en.json`, `./locales/es.json`), source-reviewed research reports (`./research/topic-review.md`, `./research/link-inventory.md`, `./research/source-audit.json`), reviewed CSV exports (`./output/spreadsheet/reviewed-topics.csv`), and Playwright verification artifacts (`./review/verification.json`).

## Global Invariants

- **Strict Deferred Script Ordering Across Static Entry Points**: Root gallery (`[index.html:head]`), demos (`[demos/abstention-lab.html:script]` .. `[demos/voice-remix.html:script]`), and slide decks (`[slides/index.html:script]`, `[slides-trustable-ai/index.html:script]`) rely on deterministic `<script defer>` execution order so localization and catalog globals (`window.LOCALES`, `window.I18N`, `window.CONTENT_TOPICS`, `window.TALK`) exist before consumer IIFEs execute.
- **Explicit User Action & Deterministic Session Teardown**: No page creates an on-device AI session automatically on load; `[demos/assets/lab.js:withSession]` and `[demos/assets/lab.js:sessions]` destroy every created Built-in AI session in `finally` and on `pagehide`, verified across 17 Playwright workflows (`window.__created === window.__destroyed > 0` in `[scripts/verify.mjs:ready]`).
- **Offline Self-Containment & Origin-Checked Messaging**: Both slide decks (`slides/` and `slides-trustable-ai/`) load all fonts, styles, images, and scripts locally with zero external runtime network requests under `offline: true` `file://` verification (`[scripts/verify.mjs:ready]`, `[scripts/verify-trustable-ai-workshop.mjs:report]`); `[demos/iframe-probe.html:parent.postMessage]` scopes outbound `targetOrigin` to `new URL(document.referrer).origin`, and inbound `window` `message` listeners (`[demos/assets/lifecycle.js:iframe-passport]`, `[slides/deck.js:window]`, `[slides/presenter.js:window]`, `[slides-trustable-ai/deck.js:window]`, `[slides-trustable-ai/presenter.js:window]`) enforce `event.source` and `event.origin` checks while isolating presenter preview `BroadcastChannel` sessions.
- **Cross-Stack Workshop Telemetry & Split-Brain Safety**: `[workshops/trustable-ai-codelab/streaming-telemetry-server/ingest.py:mock_gps_generator]` and `[workshops/trustable-ai-codelab/koru-application/src/services/telemetryStreamService.ts:TelemetryStreamService.processPoint]` preserve the 10Hz GPSD `'TPV'` SSE wire schema (m/s converted to km/h, G-forces clamped to `[-3, 3]`), while hot-path heuristics (`DECISION_MATRIX`) and `<150` m GPS geofence feedforward execute locally without cloud dependency.

## Global Side Effects

- **Loopback Dual-Origin HTTP Serving & Playwright Automation**: `[scripts/serve.py:servers]` binds `127.0.0.1:8080` and `127.0.0.1:8081`; `scripts/verify*.mjs` conditionally spawn `serve.py`, launch Chromium / Chrome Canary, and write JSON reports and PNG screenshots into `review/`.
- **Generated Repository Artifacts**: `scripts/build-locales.py`, `scripts/build-pages.py`, `scripts/build-research.py`, `scripts/export-review-csv.py`, and `scripts/package-deliverables.py` overwrite `locale-data.js`, `content-manifest{.json,.es.json}`, `demos/<id>.html`, `research/*`, `output/spreadsheet/*`, and `deliverables/web-ai-content-studio.zip`.
- **Browser AI, WebMCP, Storage, Audio & Cloud Calls**: Demo pages invoke Chrome Built-in AI `availability()`/`create()` APIs, register tools on `document.modelContext` / `navigator.modelContext` (`[demos/assets/webmcp.js:register]`), and trigger client JSON downloads; the Koru workshop application reads/writes `localStorage` (`'gemini_api_key'`), opens `EventSource` SSE streams (`:8000/events`), calls `@google/genai` `Interactions API` endpoints (`gemini-3.8-flash`, `gemini-4-argon`, `gemini-3.8-flash-lite-tts`), and outputs Web Audio / Web Speech cues.

## System Verification

- Run primary repository verification suite: `npm test`
- Run slide code, localization, and workshop deck verifiers:
  - `node scripts/verify-slide-code.mjs`
  - `node scripts/verify-languages.mjs`
  - `node scripts/verify-trustable-ai-workshop.mjs`
- Run workshop subpackage checks:
  - `npm run build` and `npm run lint` (in `workshops/trustable-ai-codelab/koru-application`)
  - `python -m unittest test_nmea_parsing.py` (in `workshops/trustable-ai-codelab/streaming-telemetry-server`)
