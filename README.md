# Web AI content studio

English · [Español](README.es.md)

Seven content proposals for sebastian-gomez.com, each with three original HTML demos, plus an English and Spanish WebMCP talk with 16 slides and a 30-minute plan.
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

Use the **English / Español** selector on every page, or add `?lang=en` / `?lang=es`.
English is the default when no language is specified.
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
- **Click the slide background:** advance, without intercepting demo links or controls.

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
