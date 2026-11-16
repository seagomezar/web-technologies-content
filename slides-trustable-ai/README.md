# Workshop Deck: Building Trustable AI at 100 MPH (DevFest Pereira 2026)

English · [Español](./README.es.md)

## Overview

Complete **37-slide** interactive facilitator presentation (90-minute plan) styled in the official **Web @DevFest Pereira 2026** visual theme to lead all 12 steps of Google's official [**Building Trustable AI at 100 MPH**](https://codelabs.developers.google.com/codelabs/trustable-at-100-mph?hl=en) Codelab, co-authored by **Sebastián Gómez**, Krupa Galiya, Todd Kerpelman, and Ocupop.

> **Updated Official Workshop Repository:** [**https://github.com/seagomezar/trustable-ai-codelab**](https://github.com/seagomezar/trustable-ai-codelab) *(highlighted directly on Slide 2 to replace the offline upstream Codelab link).*

Architecturally, this package is a zero-bundler, offline-capable HTML/JavaScript slide deck (`index.html`, `deck.js`), synchronized dual-window facilitator console (`presenter.html`, `presenter.js`), bilingual slide dataset (`workshop-en.js`, `workshop-es.js`, `workshop.js`, `i18n.js`), and interactive 10 Hz Split-Brain telemetry cockpit simulator (`live-sim.html`).

### Key Entry Points

- [`index.html?lang=en`](./index.html) — Main 37-slide workshop presentation (works over local HTTP and directly via offline `file://` URLs; defaults to Spanish unless `?lang=en`).
- [`presenter.html?lang=en`](./presenter.html) — Synchronized Facilitator / Presenter console with a 90-minute timer, current & next slide previews, and per-step speaker scripts (press **`P`** inside the deck).
- [`live-sim.html?lang=en`](./live-sim.html) — Interactive Split-Brain cockpit simulator embedded on Slide 18 and runnable standalone (5 coach personas, `0.6g` rain toggle, Physics ON/OFF, live Friction Circle).
- [`../workshops/trustable-ai-codelab/`](../workshops/trustable-ai-codelab/README.md) & [`github.com/seagomezar/trustable-ai-codelab`](https://github.com/seagomezar/trustable-ai-codelab) — Repaired, tested, and 2026-modernized workshop codebase (`streaming-telemetry-server` FastAPI SSE + `koru-application` React/Vite + `@google/genai ^3.3.0`).

### Keyboard & Pointer Controls

- **`→` / `Space` / `PageDown` / `Enter`:** advance code focus / build step, then next slide (`↓` also advances; `Home` / `End` jump to first / last slide).
- **`←` / `PageUp` / `Backspace`:** previous step or slide (`↑` also steps back).
- **`Shift + →` / `Shift + ←`:** jump across whole slides.
- **`P`:** open synchronized Presenter View.
- **`F`:** toggle fullscreen.
- **`C`:** hide or show bottom control bar.
- **Click / Swipe:** click `#viewport` background or single-finger horizontal swipe (`|dx| > 45`, `|dx| > |dy| * 1.4`) to advance/rewind without intercepting interactive controls or `.sim-frame-wrap`.
- **Presenter Remote Keys (`presenter.js`):** `ArrowRight` / `PageDown` / `Space` (`next`), `ArrowLeft` / `PageUp` (`previous`).

### Customizing City or Duration

```text
slides-trustable-ai/index.html?lang=en&city=Pereira%202026&minutes=90
```

## Interface

- **HTML Entry Points & Static Assets**:
  - [`./index.html`](./index.html) — Main slide deck shell loading `../i18n.css`, `theme.css`, `deck.css` and exposing `#viewport`, `#key-help`, `#progress`, `.controlbar`, `#previous`, `#next`, `#presenter`, and `#fullscreen` `[index.html:#viewport]`.
  - [`./presenter.html`](./presenter.html) — Facilitator console shell loading `../i18n.css`, `theme.css`, `../slides/presenter.css?v=1` and exposing `#pres-title`, `#connection`, `.clock`, `#wall-clock`, `#elapsed`, `#remaining`, `#position`, `#current-preview`, `#next-preview`, `#previous`, `#next`, `#clock`, `#reset`, `#plan`, `#script-heading`, `#script`, `#next-heading`, `#next-title`, `#next-note`, `#schedule-summary`, `#schedule`, `#sources-summary`, and `#sources` `[presenter.html:#current-preview]`.
  - [`./live-sim.html`](./live-sim.html) — Standalone and Slide 18 iframe-embeddable Split-Brain cockpit simulator loading `theme.css` and exposing `[data-coach="superaj"|"aj"|"rachel"|"tony"|"garmin"]`, `#btn-rain`, `#btn-phys`, `#btn-pause`, `#track-path`, `#car-dot`, `#car-ring`, `#fc-outer`, `#fc-dot`, `#feed`, and telemetry/label mounts (`#sim-title`, `#sim-controls`, `#fc-svg`, `#lbl-gauges`, `#lbl-track`, `#lbl-feed`, `#grip-tag`, `#active-persona`, `#val-speed`, `#unit-speed`, `#bar-thr`, `#val-thr`, `#bar-brk`, `#val-brk`, `#val-glat`, `#val-glong`, `#val-usage`, `#sector-name`) `[live-sim.html:phases]`.
  - `assets/` — Static local fonts (`Google Sans`, `Roboto Mono`), SVG badges, and workshop screenshots documented in [`./assets/SOURCES.md`](./assets/SOURCES.md) and [`./assets/SOURCES.es.md`](./assets/SOURCES.es.md) `[assets/SOURCES.md]`.
- **Browser Globals**:
  - `window.I18N` — `{ lang: 'en' | 'es', url(href, targetLang = lang): string }` localization helper `[i18n.js:window.I18N]`.
  - `window.WORKSHOP_EN` — English 37-slide deck dataset `{ title, plannedMinutes: 90, defaults: { city: 'Pereira 2026' }, sources, slides }` `[workshop-en.js:window.WORKSHOP_EN]`.
  - `window.WORKSHOP_ES` — Spanish 37-slide deck dataset `{ title, plannedMinutes: 90, defaults: { city: 'Pereira 2026' }, sources, slides }` `[workshop-es.js:window.WORKSHOP_ES]`.
  - `window.TALK` — Active localized deck payload bound to `window.WORKSHOP_EN` when `window.I18N.lang === 'en'` or `window.WORKSHOP_ES` otherwise `[workshop.js:window.TALK]`.
  - `window.deck` — Imperative controller `{ next(), previous(), nextSlide(), previousSlide(), navigate(index, step = 0, animate = true), getState(), openPresenter(), clock(action) }` `[deck.js:window.deck]`.
- **URL Query & Hash Parameters**:
  - `?lang` — Selects `'en'` when `lang=en`, defaulting to `'es'` otherwise `[i18n.js:lang]` `[live-sim.html:es]`.
  - `?city` — Overrides `TALK.defaults.city` (`'Pereira 2026'`) on title slides and presenter preview URLs `[deck.js:city]` `[presenter.js:preview]`.
  - `?minutes` — Overrides `TALK.plannedMinutes` (`90`) when `Number(minutes) > 0` in `deck.js` (`presenter.js` evaluates `Number(params.get('minutes')) || TALK.plannedMinutes` until synced via `'deck-state'`) `[deck.js:planned]` `[presenter.js:planned]`.
  - `?session` — Overrides the `BroadcastChannel` channel name (default `'sg-trustable-ai-workshop'`) `[deck.js:channelName]` `[presenter.js:session]`.
  - `#<slide>.<step>` — 1-based slide index and 0-based build step hash parsed by `parse()` and pushed by `navigate()` `[deck.js:parse]` `[deck.js:navigate]`.
- **Slide Renderer Kinds**:
  - `body(slide)` renders **16** slide `kind` variants: `'title'`, `'closing'`, `'section'`, `'roadmap'`, `'diagram'`, `'comparison'`, `'splitbrain'`, `'code'`, `'terminal'`, `'physics'`, `'personas'`, `'visual'`, `'simulator'`, `'steps'`, `'domains'`, and `'statement'` `[deck.js:body]` `[workshop-en.js:window.WORKSHOP_EN.slides]` `[workshop-es.js:window.WORKSHOP_ES.slides]`.
- **Presenter Sync Protocol (`BroadcastChannel` & `postMessage`)**:
  - Deck-to-presenter broadcast: `{ type: 'deck-state', state: { index, step, startedAt, pausedAt, pausedMs }, slideCount, plannedMinutes, city, session }` `[deck.js:announce]` `[presenter.js:receive]`.
  - Presenter-to-deck commands: `{ type: 'presenter-ready', id }` and `{ type: 'deck-command', id, command: 'next' | 'previous' | 'clock' | 'reset-clock' | 'goto', index?, step? }` `[presenter.js:send]` `[deck.js:receive]`.

## Invariants

- **Deferred Script Execution Order**: Both `index.html` and `presenter.html` load `<script defer>` tags strictly in sequence (`i18n.js` -> `workshop-es.js` -> `workshop-en.js` -> `workshop.js` -> `deck.js` / `presenter.js`) so `window.I18N` and `window.TALK` are populated before consumer IIFEs execute `[index.html:script]` `[presenter.html:script]`.
- **Locale Resolution & Same-Origin Rewriting**: Locale resolves to `'en'` if and only if `?lang=en` (defaulting to `'es'`), and `I18N.url()` wraps `new URL(href, location.href)` in `try/catch` (returning `href` unchanged on malformed inputs) and mutates URLs only when `target.origin === location.origin` and `/\.html$|\/$/.test(target.pathname)` `[i18n.js:lang]` `[i18n.js:url]` `[workshop.js:window.TALK]`.
- **Bilingual 37-Slide & 90-Minute Parity**: `window.WORKSHOP_EN.slides` and `window.WORKSHOP_ES.slides` both contain exactly 37 slide objects whose `minutes` values are positive integers summing to `90` (`plannedMinutes === 90`), matching the 4 roadmap phases (`18 + 24 + 26 + 22 = 90`) `[workshop-en.js:window.WORKSHOP_EN.slides]` `[workshop-es.js:window.WORKSHOP_ES.slides]`.
- **Build-Step & Facilitator-Note Alignment**: Every slide satisfies `slide.notes.length === slide.builds.length + 1`, and every `'code'` / `'terminal'` slide satisfies `codeFocus.length === stepCallouts.length === builds.length + 1` with 1-based line indices bounded by `slide.code` line count `[workshop-en.js:window.WORKSHOP_EN.slides]` `[workshop-es.js:window.WORKSHOP_ES.slides]`.
- **Index Clamping, Input Guards, & State Isolation**: `parse()` and `navigate()` clamp `index` to `[0, slides.length - 1]` and `step` to `[0, slides[index].builds.length]`, while `deck.getState()` returns a shallow clone (`{ ...state }`); `deck.js` ignores `Alt`/`Ctrl`/`Meta` chords, `INPUT`/`TEXTAREA`/`SELECT` targets, `Enter`/`Space` on `a,button`, and `#viewport` clicks on `a,button,input,select,textarea,iframe,.sim-frame-wrap` or text selections, `presenter.js` ignores `Alt`/`Ctrl`/`Meta` chords and `INPUT`/`TEXTAREA`/`SELECT`/`BUTTON`/`SUMMARY` targets, and unrevealed `.pending` build items plus presenter `.preview` wrappers carry `inert` `[deck.js:parse]` `[deck.js:keydown]` `[presenter.js:keydown]`.
- **Command Deduplication & Origin Verification**: Inbound `deck-command` messages carrying `id` are deduplicated via `seenCommands` (FIFO-capped at 128 entries) `[deck.js:seenCommands]`, and `window` `message` listeners enforce `e.source` matching plus `e.origin === location.origin` whenever `location.origin !== 'null'` (preserving offline `file://` transport) `[deck.js:window]` `[presenter.js:window]`.
- **Preview Channel Isolation, Reduced Motion, & Background Throttling**: Presenter preview iframes override `session` to `${session}-preview-${frame.id}` so embedded decks never pollute the live session channel `[presenter.js:preview]`; `document.startViewTransition` (with directional `types: ['forward' | 'backward' | 'step']` and graceful fallback) and the 1500 ms `'splitbrain'` lane cycle are disabled when `matchMedia('(prefers-reduced-motion: reduce)').matches`, `live-sim.html` defaults `paused` to `matchMedia('(prefers-reduced-motion: reduce)').matches` while keeping `#btn-pause` interactive, and recurring timers suspend updates while `document.hidden` is `true` `[deck.js:navigate]` `[deck.js:syncAnim]` `[presenter.js:tick]` `[live-sim.html:reduceMotion]`.
- **Offline Self-Containment & Bounded Radio Feed**: All fonts, stylesheets, images, and scripts resolve locally with zero external runtime network requests (`slide.code` snippets are inert display strings) `[workshop-en.js:window.WORKSHOP_EN.slides]` `[workshop-es.js:window.WORKSHOP_ES.slides]`, and `#feed` in `live-sim.html` builds messages via DOM text nodes (no `innerHTML`) and caps visible radio messages at 4 DOM nodes across 5 contiguous track phases covering `[0.00, 1.00]` `[live-sim.html:pushMsg]` `[live-sim.html:phases]`.

## Side Effects

- **Global Namespace & Document Lang Mutation**: Assigns `window.I18N` `[i18n.js:window.I18N]`, `window.WORKSHOP_ES` `[workshop-es.js:window.WORKSHOP_ES]`, `window.WORKSHOP_EN` `[workshop-en.js:window.WORKSHOP_EN]`, `window.TALK` `[workshop.js:window.TALK]`, and `window.deck` `[deck.js:window.deck]`, and sets `document.documentElement.lang` (`'en'` or `'es'`) `[i18n.js:lang]` `[live-sim.html:es]`.
- **History API Wrapping, Directional Transitions, & Focus Routing**: Wraps `history.pushState` and `history.replaceState` to synchronize injected `<nav class="language-switch">` links (`aria-current="page"` on the active locale) `[i18n.js:DOMContentLoaded]`, pushes `#<index+1>.<step>` URL hashes via `history.pushState`, triggers directional `document.startViewTransition`, and routes programmatic focus to `<article class="slide" tabindex="-1">` `[deck.js:navigate]`.
- **Deck, Presenter, & Simulator DOM Rendering**: `deck.js` sets `--scale` on `document.documentElement`, updates `--slide-bg` and `.embedded-preview` / `.hide-controls` on `document.body`, localizes shell controls for English and injects `#slide-select` and polite `role="status"` `#step-status` into `.controlbar`, rewrites `#viewport.innerHTML` (mounting `<iframe class="sim-frame" src="live-sim.html?lang=...">` on `'simulator'` slides), and updates `document.title` and `#progress` width `[deck.js:scale]` `[deck.js:paint]`; `presenter.js` relabels UI headings/titles for English and renders `#script`, `#plan`, `#schedule`, `#sources`, and `#next-*` `[presenter.js:render]`; `live-sim.html` syncs `[aria-pressed]` persona toggles, drives `--level` CSS custom properties for compositor `scaleY()` pedal bars, and seeds `#feed` at startup via `emitForPhase(1)` and `emitForPhase(2)` `[live-sim.html:emitForPhase]`.
- **Cross-Window Broadcasts, Popups & Fullscreen**: Opens popup window `'sg-trustable-ai-presenter'` (`1380x900`) via `window.open` `[deck.js:openPresenter]`, exchanges sync messages over `BroadcastChannel` and `postMessage` `[deck.js:announce]` `[presenter.js:send]`, and invokes `document.documentElement.requestFullscreen()` / `document.exitFullscreen()` `[deck.js:keydown]`.
- **Background Interval & Timeout Timers**: Schedules a 1500 ms `setInterval` cycling `.sb-lane.active` on `'splitbrain'` slides `[deck.js:syncAnim]`, a 500 ms `setInterval` updating `#wall-clock`, `#elapsed`, `#remaining`, and `.clock.overrun` plus a 3000 ms connection-status `setTimeout` in Presenter View `[presenter.js:tick]`, and a 100 ms `setInterval` animating SVG track position, telemetry bars, friction circle `#fc-dot`, and `#feed` callouts in the simulator `[live-sim.html:pushMsg]`.

## Verification

- Run repository suite: `npm test`
- Run Trustable AI workshop deck & offline verification: `node scripts/verify-trustable-ai-workshop.mjs`
