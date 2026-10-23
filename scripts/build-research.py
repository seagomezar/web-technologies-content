"""Render the editorial review from explicit row judgments and the URL audit."""
import json
import re
from pathlib import Path

root=Path(__file__).resolve().parents[1]
audit=json.loads((root/'research/source-audit.json').read_text())
topics=json.loads((root/'content-manifest.json').read_text())
prompt='https://developer.chrome.com/docs/ai/prompt-api'
task='https://developer.chrome.com/docs/ai/task-api-polyfill'
expert='https://docs.google.com/document/d/1RnSlXRAy8ffdbehvCcH7msBwmTvsxHJJQiwcw374tMw/edit'
embedding='https://docs.google.com/document/d/1ZB6MW8UDczm4V6ej5MorZWqFCYWwLhUs5HKxEdjP35c/edit'
mtp='https://docs.google.com/document/d/1g7bv9LHSqFWqeQUM2C6EQ5PiZ8UWTz8UibxnlD4ipDE/edit'
gemma='https://docs.google.com/document/d/1rpaV4la7WtpLr4Ueb0NttJVETlVL_5a9TNHsrBMBkWk/edit'
polyfill='https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/writer-rewriter-polyfills'
judgments={
8:('Writer/Rewriter consultation','Proposal corroborated; archive link mismatch',f'The linked document is the expert-model guide, not the consultation. The [polyfill repository]({polyfill}) independently describes the proposed removal. Do not announce completed deprecation or infer the final decision from today’s consultation deadline.','recipes',[polyfill,task]),
9:('Task APIs as prompt recipes','Corroborated design explanation',f'The [official task-polyfill article]({task}) and linked prompt-builder code support comparing custom prompts with task abstractions. A polyfill does not automatically establish equivalent quality or universal browser availability.','recipes',[task,'https://github.com/GoogleChromeLabs/web-ai-demos/blob/main/built-in-ai-task-apis-polyfills/summarizer-prompt-builder.js']),
10:('Summarizer and Proofreader expert models','Guide body read; developer-trial constraints',f'The [EPP guide]({expert}) documents the specialist preview. Proofreader has no preference option and its expert preview is English-only. Separate this preview from the baseline Summarizer API.','performance, languages',[expert,'https://developer.chrome.com/docs/ai/proofreader-api']),
11:('Speed preference limitations','Guide body read; material caveat',f'The [expert-model guide]({expert}) limits speed output to English, key-points/tldr, and short/medium length; markdown behaves like plain text. Incompatible combinations can report unavailable or fail creation.','performance',[expert]),
12:('On-device text embeddings','Guide and explainer read; developer trial',f'The [testing guide]({embedding}) uses SemanticEmbedder and taskType on embed(), not create(). The July 31 revision adds download-progress support after 153.0.7979.0. Recompute an index in the same space; dimensions alone do not prove compatibility.','retrieval',[embedding,'https://github.com/explainers-by-googlers/embedding-api']),
13:('Gemma 4 multi-token prediction','Guide body read; email percentage is not a benchmark',f'The [October 21 guide]({mtp}) requires Canary 156.0.8064.0+ and the MTP flag. Prompt needs most-predictable sampling; Summarizer speed uses a different model. Measure warm generation and cold preparation separately. The CSV’s +20–30% is not a result measured here.','performance',[mtp]),
14:('WebMCP developer tools','Docs and linked repositories reviewed', 'The extension, types, and skills repository support an article about designing, exposing, and inspecting tools. A skills repository is a source to review, not an instruction to install or execute it. The extension’s local-server mode can send data to a hosted model; WebMCP itself is not an on-device model.','webmcp',['https://developer.chrome.com/docs/ai/webmcp','https://github.com/GoogleChromeLabs/webmcp-extension','https://github.com/webmachinelearning/webmcp-types','https://github.com/GoogleChromeLabs/webmcp-tools/tree/main/webmcp-skills']),
15:('Decisions / Semantic If and deprecation reminder','Intent-to-prototype only; no verified callable contract','The CSV announces exploration, and its technical link targets Writer/Rewriter polyfills. No reviewed source supplies a Decisions API callable contract. Treat the proposed decision article as an explicitly conceptual Prompt API experiment, with structured output and an abstention lane.','decisions, recipes',[prompt,polyfill]),
16:('New static API entry points','Historical migration; current shapes confirmed',f'The current [Prompt API guide]({prompt}) uses self.LanguageModel with static availability() and create(). Explain migration through a maintained capability helper; avoid obsolete window.ai examples.','lifecycle',[prompt]),
17:('Gemma 4 developer trial','Guide body read; avoid general shipping claim',f'The [August guide]({gemma}) specifies Canary 153.0.8009.0+ and a flag. Up to 70% is a reported observation, not a guaranteed gain. The guide describes function calling as future work rather than proof it is already exposed. Browser-managed built-in inference is a different integration from a site-managed LiteRT/WebGPU model.','performance',[gemma]),
18:('Origin-trial feedback, Proofreader, Chromebook Plus, summit','Historical program bundle; refresh each product status','The origin-trial explainer describes enrollment, not perpetual availability. Current Proofreader documentation still labels a developer trial. Do not advertise the 2025 summit as an upcoming event or generalize Chromebook Plus support to every Chromebook.','languages, lifecycle',['https://developer.chrome.com/docs/web-platform/origin-trials','https://developer.chrome.com/docs/ai/proofreader-api',prompt,'https://rsvp.withgoogle.com/events/web-ai-summit-2025']),
19:('Built-in AI do and don’t','Public UX guidance reviewed','The public guide supports a lifecycle article: deliberate preparation, progress, user control, and understandable failure states. Use runtime detection and a useful ordinary interface instead of implying universal model support.','lifecycle',['https://developer.chrome.com/docs/ai/built-in-ai-dos-donts']),
20:('Historical 6,144-token context window','Historical fact; not a current invariant',f'The 2024 email records a limit at that time. Current [Prompt documentation]({prompt}) exposes contextWindow, contextUsage, and measureContextUsage. Ask the active session rather than hard-coding 6,144.','performance',[prompt]),
21:('AI in cross-origin iframes','Current delegation pattern confirmed','Current documentation specifies per-API policy tokens, such as language-model and proofreader. MDN explains the allow attribute, and the linked Proofreader PR supplies design history. A two-port local probe tests the boundary without requesting a model download.','lifecycle',[prompt,'https://developer.chrome.com/docs/ai/proofreader-api','https://github.com/webmachinelearning/proofreader-api/pull/14','https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#allow']),
22:('Historical 1,024-token prompt caveat removed','Historical change; still bounded by session context',f'Removing that historical per-prompt caveat does not mean unlimited input. Measure the assembled prompt against the runtime session window using the [current API]({prompt}).','performance',[prompt]),
23:('WebMCP debugging annotation','Merged specification change verified; version assertion kept separate','PR #253 is merged and current type definitions include debugging. The Chromium Dash link only returned an app shell, so the claimed first Chrome build was not independently verified from that URL. The observatory filters intended developer tools rather than treating debugging as a permissions system.','webmcp',['https://github.com/webmachinelearning/webmcp/pull/253','https://github.com/webmachinelearning/webmcp-types']),
24:('TypeScript types updated','Historical announcement; maintained package verified',f'Current [Chrome documentation]({prompt}) recommends @types/dom-chromium-ai. WebMCP has a separate types package. Types should match the tested browser contract; installing types does not add runtime support.','lifecycle',[prompt,'https://github.com/webmachinelearning/webmcp-types']),
25:('Debugging local models','Current diagnostic destination corroborated',f'Current [Prompt documentation]({prompt}) links chrome://on-device-internals for model information. Use that with console errors and recorded configuration; it is an internal diagnostic page rather than a callable web API.','lifecycle, performance',[prompt]),
26:('Untested-language workaround','Historical workaround; replace in new content',f'The issue URL returned only a JavaScript shell, so its resolution was not verified. The [current Prompt guide]({prompt}) documents expected input/output languages and NotSupportedError. New demos declare supported languages and preserve failures; they do not reproduce the old safety-classifier flag workaround.','languages, lifecycle',[prompt,'https://issues.chromium.org/issues/392661409']),
27:('WebMCP consequentialHint','Current type contract and discussion reviewed','The types define consequentialHint for consequential real-world actions; issue #176 provides its motivation. This is metadata for the consuming agent, not application authorization. Enforce the review boundary in application code and test rejection as well as confirmation. The linked Chromium Dash page did not expose the commit body.','webmcp',['https://github.com/webmachinelearning/webmcp-types','https://github.com/webmachinelearning/webmcp/issues/176','https://github.com/GoogleChromeLabs/webmcp-extension']),
}

lines=['# Content research and editorial recommendations','','English · [Español](topic-review.es.md)','',
'Checked on 2026-10-23 against the supplied CSV, accessible Google documentation, repository sources, and the live website.','',
'## Scope and evidence quality','',
'The CSV contains six metadata rows, a header on line 7, and 20 communications on lines 8–27.','The archive timeline and message subjects describe history; they do not establish the present support status of an API.','The audit attempted every one of the 62 distinct normalized archive URLs, plus 17 supplementary research URLs and four Google Docs text exports.','Mail actions and the Google-internal balance profile were classified without sending mail or trying to enter internal systems.','All four Google Docs bodies were retrieved through text export after their normal HTML pages returned only editor shells.','The 20 individual Google Groups message URLs returned thin group shells; the supplied CSV remains the evidence for those email bodies.','Chromium Dash and the linked language-error issue also returned app shells, so their technical bodies and exact browser-build claims remain unverified.','Feedback forms and event pages were inspected as context, without submitting anything.','The full per-URL outcomes are in [link-inventory.md](link-inventory.md) and [source-audit.json](source-audit.json).','',
'## How this adds to the existing website','',
'The live homepage and second archive page were read, along with the full small-model and BrowserDJ articles.','They establish existing coverage of browser inference, lexical in-memory RAG, WebGPU/LiteRT, procedural interfaces, agent architecture patterns, and engineering leadership.','This is a focused review of those recent pages, not a claim that the entire website archive has no coverage of the recommended subjects.','',
'- [Small models and thoughtful design](https://www.sebastian-gomez.com/en/post/modelos-pequenos-buen-diseno-ia-navegador-litert-lm): follow with observable semantic retrieval and source review, rather than repeating the RAG introduction.','- [BrowserDJ architecture](https://www.sebastian-gomez.com/en/post/el-borde-es-inevitable-browserdj-ai-gemma-antigravity): follow with measured latency and explicit integration differences between browser-managed models and site-managed runtimes.','- [Recent website articles](https://www.sebastian-gomez.com/en) and [the next archive page](https://www.sebastian-gomez.com/en/posts/page/2): connect practical tools and evaluated recipes with the existing preference for architecture over terminology.','',
'One editorial improvement would be to replace absolute statements about eliminating hallucinations, guaranteed privacy, or instantaneous responses with conditions and measured evidence.','Grounding reduces some failures, but a source identifier check does not establish factual support; the new evidence and timing demos make those limits visible.','',
'## Recommended content, in publication order','',
'The order reflects editorial judgment about novelty, usefulness on the website, and strength of accessible evidence.','It is not a measured SEO forecast or a claim about search volume.','Proposals 1–6 are implementation topics; proposal 7 is an explicitly conceptual experiment pending a verifiable Decisions API contract.','']
for t in topics:
    lines += [f"### {t['rank']}. {t['title']}",'',f"**Angle:** {t['angle']}",'',f"**Website value:** {t['value']}",'',f"**Format:** {t['format']}",'',f"**Status:** {t['stage']}",'','Suggested article structure:','']
    lines += [f'{i}. {s}' for i,s in enumerate(t['outline'],1)]
    lines += ['','Three HTML demos:','']
    for d in t['demos']:
        lines += [f"- [{d['title']}](../demos/{d['id']}.html): {d['hook']}",f"  Try: {d['action']}",f"  Teaches: {d['lesson']}"]
    lines += ['',f"CSV traceability: lines {', '.join(map(str,t['rows']))}.",'','Primary sources: '+', '.join(f'[source {i}]({u})' for i,u in enumerate(t['sources'],1))+'.','']
lines += ['## Every communication reviewed','', '| CSV line | Date | Topic | Finding | Proposal |','| --- | --- | --- | --- | --- |']
for row in audit['messages']:
    n=row['csv_line'];title,finding,detail,topic,sources=judgments[n]
    lines.append(f"| {n} | {row['date'][:10]} | {title} | {finding} | {topic} |")
lines+=['']
for row in audit['messages']:
    n=row['csv_line'];title,finding,detail,topic,sources=judgments[n]
    lines += [f'### CSV line {n}: {title}','',f'**Conclusion:** {finding}.',detail,'','Evidence: '+', '.join(f'[source {i}]({u})' for i,u in enumerate(sources,1))+'.','']
lines += ['## Slide brief and working assumptions','',
'The attached brief was read before construction.','Its requested artifact is an HTML deck, so no PowerPoint deck was created.','The structure question was asked before building, followed separately by language and duration questions.','Working defaults are one WebMCP talk and 30 minutes with three demos; both English and Spanish content and speaker notes are available through the language selector. The structure and duration remain configurable rather than presented as user-confirmed choices.','The first three slide mockups were rendered and shown before expanding the deck.','The event city is not supplied and remains visibly labeled as pending; use the city query parameter when the event is known.','',
'The event template was exported and visually inspected, including its color and typography specification and title/content layouts.','The theme uses the verified #f0f0f0 off-white, white outlined notched panels, the track lockup, the extracted GDG logo, local Google Sans Bold and Roboto Mono Light, and the template’s primary, halftone, and pastel colors.','The template PDF, font source CSS, and rendered reference are kept locally as research evidence.','',
'No website publishing, messaging, form submission, origin-trial registration, or account changes were performed.','']
def prose_lines(items):
    return '\n'.join(line if line.startswith('|') else re.sub(r'(?<=[.!?]) +(?=[A-Z])','\n',line) for line in items)

(root/'research/topic-review.md').write_text(prose_lines(lines))

out=['# Archive link inventory','','English · [Español](link-inventory.es.md)','','Every distinct normalized archive URL is accounted for below.','A retrieved shell is explicitly weaker evidence than a readable technical body.','The originals, dates, retries, and supplementary URLs are preserved in [source-audit.json](source-audit.json).','','| CSV lines | Link | Classification / result | Evidence notes |','| --- | --- | --- | --- |']
for r in audit['links']:
    if not r['csv_lines']:continue
    status=r['status'];note=r.get('note','')
    if 'chromiumdash' in r['url'] or '/issues/392661409' in r['url']:
        status='JavaScript app shell only';note='Commit or issue body not verified.'
    if r['kind']=='feedback':note='Feedback destination; no response submitted and no technical claim inferred.'
    if r['kind']=='signature':note='Signature/profile/comic context; excluded as product evidence.'
    if '/origintrials/' in r['url']:note='SPA page; original trial fragment retained in originals in JSON; exact trial status not verified from this response.'
    if r['url'].startswith('https://docs.google.com/document/'):
        ident=r['url'].split('/d/')[1].split('/')[0]
        export=next((e for e in audit['guide_exports'] if ident in e['url']),None)
        if export and export.get('snapshot'):status='Document body read through export';note=f"[Export evidence]({Path(export['snapshot']).name})";note=f"[Export evidence](snapshots/{Path(export['snapshot']).name})"
    out.append(f"| {', '.join(map(str,r['csv_lines']))} | [{r.get('title') or r['url']}]({r['url']}) | {r['kind']}: {status} | {note} |")
out += ['','## Supplementary sources','','These were used to compare historical messages with current documentation and website content.','']
out += [f"- [{r.get('title') or r['url']}]({r['url']}): {r['status']}." for r in audit['links'] if not r['csv_lines']]
(root/'research/link-inventory.md').write_text(prose_lines(out)+'\n')
(root/'research/row-review.json').write_text(json.dumps([{'csv_line':n,'topic':v[0],'finding':v[1],'analysis':v[2],'proposals':v[3].split(', '),'sources':v[4]} for n,v in judgments.items()],ensure_ascii=False,indent=2)+'\n')
print('Rendered 20 row reviews, 62 archive URL outcomes, and seven editorial proposals.')

# Render a complete parallel Spanish report from authored translations.
es=json.loads((root/'locales/es.json').read_text())
def tr(v):
    if isinstance(v,str):return es.get(v,v)
    if isinstance(v,list):return [tr(x) for x in v]
    if isinstance(v,dict):return {k:tr(x) for k,x in v.items()}
    return v
spanish_rows=json.loads((root/'locales/research.es.json').read_text())
assert len(spanish_rows)==len(judgments)==20
localized=[]
for (n,v),(title,finding,analysis) in zip(judgments.items(),spanish_rows):
    localized.append({'csv_line':n,'topic':title,'finding':finding,'analysis':analysis,'proposals':v[3].split(', '),'sources':v[4]})
(root/'research/row-review.es.json').write_text(json.dumps(localized,ensure_ascii=False,indent=2)+'\n')
spanish=[(root/'locales/research-intro.es.md').read_text(),'']
for t in tr(topics):
    spanish += [f"### {t['rank']}. {t['title']}",'',f"**Enfoque:** {t['angle']}",'',f"**Valor para el sitio:** {t['value']}",'',f"**Formato:** {t['format']}",'',f"**Estado:** {t['stage']}",'','Estructura sugerida:','']
    spanish += [f'{i}. {s}' for i,s in enumerate(t['outline'],1)]+['','Tres demos HTML:','']
    for d in t['demos']:
        spanish += [f"- [{d['title']}](../demos/{d['id']}.html?lang=es): {d['hook']}",f"  Prueba: {d['action']}",f"  Enseña: {d['lesson']}"]
    spanish += ['',f"Trazabilidad del CSV: líneas {', '.join(map(str,t['rows']))}.",'','Fuentes primarias: '+', '.join(f'[fuente {i}]({u})' for i,u in enumerate(t['sources'],1))+'.','']
spanish += ['## Revisión de cada comunicación','','| Línea CSV | Fecha | Tema | Conclusión | Propuesta |','| --- | --- | --- | --- | --- |']
for row,original in zip(localized,audit['messages']):
    spanish.append(f"| {row['csv_line']} | {original['date'][:10]} | {row['topic']} | {row['finding']} | {', '.join(row['proposals'])} |")
spanish+=['']
for row in localized:
    spanish += [f"### Línea CSV {row['csv_line']}: {row['topic']}",'',f"**Conclusión:** {row['finding']}.",row['analysis'],'','Evidencia: '+', '.join(f'[fuente {i}]({u})' for i,u in enumerate(row['sources'],1))+'.','']
spanish += [(root/'locales/research-footer.es.md').read_text()]
(root/'research/topic-review.es.md').write_text(prose_lines(spanish)+'\n')
# Preserve original external titles and URLs; translate the authored evidence classifications.
inventory=prose_lines(out)+'\n'
terms=json.loads((root/'locales/inventory.es.json').read_text())
for a,b in sorted(terms.items(),key=lambda pair:-len(pair[0])):inventory=inventory.replace(a,b)
(root/'research/link-inventory.es.md').write_text(inventory)
