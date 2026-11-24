# Event and font provenance

- Event layout, color specification, and GDG logo: [Tracks @ DevFest 2026 presentation template](https://docs.google.com/presentation/d/1bTHqCd-ZdfXplMtFIISS_kdRjTVPBkOh85B0rB5ohEM/edit).
- Local inspection reference: [the exported template PDF](../../research/event-template.pdf), [its color/typography text](../../research/event-template-text.txt), and [the rendered title reference](../../research/template-title.png).
- Google Sans, weights 400 and 700: [official Google Fonts stylesheet](https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;700&display=swap).
- Roboto Mono, weights 300 and 400: [official Google Fonts stylesheet](https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300;400&display=swap).

The original stylesheet responses and font download URLs are preserved under `research/snapshots/google-sans.txt` and `research/snapshots/roboto-mono.txt`.
The font files use the TrueType format supplied by the service, and the CSS declares that format explicitly.
The upstream SIL Open Font License files are included as `google-sans-LICENSE.txt` and `roboto-mono-LICENSE.txt`, retrieved from the official [Google Fonts repository](https://github.com/google/fonts).
The GDG logo is a cropped rendering of the supplied template, not an AI-generated approximation.
Use the organizer’s supplied branding only in its intended event context.

## WebMCP diagrams, DevTools captures, extension screenshots & talk illustrations (`slides/assets/webmcp/`)

- Official Chrome for Developers WebMCP flow diagrams (`contact-flow.jpg`, `email-flow.jpg`, `webmcp-sequence.png`): sourced from [WebMCP documentation on developer.chrome.com](https://developer.chrome.com/docs/ai/webmcp) (Creative Commons Attribution 4.0 License).
- Official Chrome DevTools WebMCP panel captures (`devtools-webmcp-pane.png`, `devtools-available-tools.png`, `devtools-manual-test.png`): sourced from [Inspect WebMCP tools in Chrome DevTools](https://developer.chrome.com/docs/devtools/application/webmcp) (Creative Commons Attribution 4.0 License).
- Official WebMCP example extension screenshots (`ext-tools.png`, `ext-chat.png`, `ext-permission.png`, `ext-consequential.png`): sourced from [GoogleChromeLabs/webmcp-extension](https://github.com/GoogleChromeLabs/webmcp-extension) (`docs/screenshots/`, Apache-2.0 License).
- Conference talk meme illustrations (`meme-dom-scraping.jpg`, `meme-permission-fatigue.jpg`, `meme-prompt-injection.jpg`, `meme-nondeterministic-evals.jpg`): original zero-text illustrations generated for this DevFest talk, paired with localized HTML captions in `slides/full-talk.js` and `locales/talk.en.json`.
