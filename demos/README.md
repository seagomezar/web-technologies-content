# Interactive Browser Demos (`demos`)

## Overview

Collection of 21 standalone browser demo HTML entry pages and 1 cross-origin `Permissions-Policy` probe page (`iframe-probe.html`) for the Web AI Lab. Every page loads parent localization catalogs (`../locale-data.js`, `../i18n.js`, `../i18n.css`) and local demo styles (`assets/lab.css`); the 21 interactive demo templates also load `../content-data.js`, bind `<body data-demo="<slug>">`, and expose `<div class="intro">` (`#topic`, `#title`, `#hook`), `#status`, and `#app` (plus `#lesson` and `#sources` on the 20 standard shells) for hydration by the shared runtime and feature controllers in [assets](./assets/README.md).

## Interface

- `[iframe-probe.html:report]` / `[iframe-probe.html:policy]` / `[iframe-probe.html:allowed]` / `[iframe-probe.html:#result]` — Cross-origin `Permissions-Policy` probe document (`?lang=en|es`) inspecting `(document.permissionsPolicy || document.featurePolicy)?.allowsFeature('language-model')`, rendering `{ kind: 'ai-policy-probe', origin, secureContext, languageModelExposed, languageModelPolicyAllowed, inferenceRequested: false }` into `<pre id="result">`, and posting the payload to its embedder via `parent.postMessage`.
- `[abstention-lab.html:#app]` .. `[voice-remix.html:#app]` — Shared DOM mount contract across the 20 `lang="en"` demo shells exposing `<div class="intro">` (`#topic`, `#title`, `#hook`), `#status` (`role="status"`), `#app`, `#lesson`, and `#sources` for hydration by `[assets/lab.js:window.Lab]`.
- `[reading-route.html:#app]` / `[reading-route.html:#status]` — WebMCP reading-list shell starting with static `<html lang="es">` (localized to `'en'` at runtime by `../i18n.js?v=12` unless `?lang=es` is passed), hardcoded `<span class="pill">WebMCP · document.modelContext</span>`, `<div class="intro">` (`#topic`, `#title`, `#hook`), hidden `#status` (`class="status sr-only" role="status" hidden`), and `#app` with `?v=12` asset query strings (omitting `#lesson` and `#sources`).
- **Query Parameters**: `?lang=en|es` (`[../i18n.js:lang]`), `?embed=1` (`[assets/lab.js:embed]`), and on WebMCP demos `?webmcp=0|1` and `?forceModal=1` (`[assets/webmcp.js:getModelContext]`, `[assets/webmcp.js:hasWebMCP]`).
- `[issue-router.html:data-demo]` / `[comment-airlock.html:data-demo]` / `[abstention-lab.html:data-demo]` — Structured decision entry pages mounting `[assets/decisions.js:id]` (`issue-router`, `comment-airlock`, `abstention-lab`).
- `[bilingual-relay.html:data-demo]` / `[language-radar.html:data-demo]` / `[proofread-review.html:data-demo]` — Language API entry pages mounting `[assets/languages.js:id]` (`bilingual-relay`, `language-radar`, `proofread-review`).
- `[model-concierge.html:data-demo]` / `[stream-garden.html:data-demo]` / `[iframe-passport.html:data-demo]` — Session lifecycle, `AbortController` streaming, and cross-origin policy entry pages mounting `[assets/lifecycle.js:id]` (`model-concierge`, `stream-garden`, `iframe-passport`).
- `[latency-lens.html:data-demo]` / `[preference-kitchen.html:data-demo]` / `[context-backpack.html:data-demo]` — Streaming latency profiling, `Summarizer` option validation, and token counting entry pages mounting `[assets/performance.js:id]` (`latency-lens`, `preference-kitchen`, `context-backpack`).
- `[voice-remix.html:data-demo]` / `[release-kitchen.html:data-demo]` / `[recipe-arena.html:data-demo]` — Prompt template, `[R1]`–`[Rn]` citation checking, and `Summarizer` vs. `LanguageModel` comparison entry pages mounting `[assets/recipes.js:id]` (`voice-remix`, `release-kitchen`, `recipe-arena`).
- `[meaning-compass.html:data-demo]` / `[duplicate-constellation.html:data-demo]` / `[evidence-window.html:data-demo]` — `SemanticEmbedder` vs. lexical overlap ranking, pairwise similarity, and threshold-gated RAG entry pages mounting `[assets/retrieval.js:id]` (`meaning-compass`, `duplicate-constellation`, `evidence-window`).
- `[reading-route.html:data-demo]` / `[consent-cart.html:data-demo]` / `[tool-observatory.html:data-demo]` — WebMCP tool-registration entry pages mounting `[assets/webmcp.js:id]` (`reading-route`, `consent-cart`, `tool-observatory`) and exposing `[assets/webmcp.js:window.addToRoute]` plus registered `modelContext` tools (`add_to_route`, `request_demo_ticket_confirmation`, `find_demo`, `inspect_state`).
- **Subdirectories**:
  - [assets](./assets/README.md) — Shared `window.Lab` DOM/Built-in AI session adapter (`lab.js`), WebMCP tool registration helpers (`webmcp.js`), and interactive demo controllers (`decisions.js`, `languages.js`, `lifecycle.js`, `performance.js`, `recipes.js`, `retrieval.js`).

## Invariants

- `[abstention-lab.html:data-demo]` .. `[voice-remix.html:data-demo]` — Across all 21 interactive demo entry pages, `<body data-demo="<slug>">` matches the HTML filename stem `<slug>.html` 1-to-1 and must resolve to a demo entry in `CONTENT_TOPICS` before `[assets/lab.js:demo]` initializes `window.Lab`.
- `[abstention-lab.html:script]` .. `[voice-remix.html:script]` — Deferred `<script defer>` tags must close cleanly and execute in strict sequence (`../locale-data.js` -> `../i18n.js` -> `../content-data.js` -> `assets/lab.js` -> `assets/<module>.js`) so `window.Lab` is defined before the feature controller runs.
- `[iframe-probe.html:report]` / `[iframe-probe.html:allowed]` — `report.kind` is always `'ai-policy-probe'` and `report.inferenceRequested` is always `false`; `allowed` defaults to `'Policy inspection is not exposed'` and captures `allowsFeature('language-model')` exceptions as error message strings without throwing.
- `[iframe-probe.html:parent.postMessage]` — Emits `postMessage` only when `parent !== self && document.referrer` is truthy, restricts `targetOrigin` to `new URL(document.referrer).origin` (never `'*'`), and catches cross-origin/referrer URL errors so standalone or referrer-free loads still render `#result`.
- `[reading-route.html:script]` / `[reading-route.html:#status]` — Starts with `<html lang="es">` (overridden to `'en'` by `../i18n.js?v=12` unless `?lang=es`), hardcodes `<span class="pill">WebMCP · document.modelContext</span>`, marks `#status` `hidden`, omits `<details>` (`#lesson` / `#sources`), and appends `?v=12` cache-busting query strings to local stylesheet/script URLs.

## Side Effects

- `[iframe-probe.html:#result]` / `[iframe-probe.html:parent.postMessage]` — Synchronously writes JSON probe output to `<pre id="result">` on parse, dispatches `parent.postMessage(report, new URL(document.referrer).origin)` when embedded with a valid referrer, and executes deferred `../locale-data.js` + `../i18n.js` (updating `document.documentElement.lang`, localizing `<h2>Second-origin passport</h2>`, and appending `<nav class="language-switch">`).
- `[abstention-lab.html:script]` .. `[voice-remix.html:script]` — Executes deferred `../locale-data.js`, `../i18n.js`, `../content-data.js`, `assets/lab.js`, and the page's `assets/*.js` feature controller on load, mutating page metadata/DOM mounts, toggling `body.is-embedded` via `[assets/lab.js:embed]`, destroying active Built-in AI sessions on `pagehide` via `[assets/lab.js:sessions]`, and registering WebMCP tools on `document.modelContext` / `navigator.modelContext` via `[assets/webmcp.js:register]`.

## Verification

- Run: `npm test`
