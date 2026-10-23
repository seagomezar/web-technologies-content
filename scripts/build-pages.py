"""Generate one directly openable HTML entry point for every hand-authored demo."""
from pathlib import Path
import json, subprocess

root = Path(__file__).resolve().parents[1]
raw = subprocess.check_output(['node','-e',"global.window=global;require('./content-data.js');process.stdout.write(JSON.stringify(CONTENT_TOPICS))"],cwd=root,text=True)
topics = json.loads(raw)
for topic in topics:
    for demo in topic['demos']:
        html = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="{demo['hook']}"><title>{demo['title']} | Web AI Lab</title><link rel="stylesheet" href="../i18n.css"><script defer src="../locale-data.js"></script><script defer src="../i18n.js"></script><link rel="icon" href="data:,"><link rel="stylesheet" href="assets/lab.css"><script defer src="../content-data.js"></script><script defer src="assets/lab.js"></script><script defer src="assets/{topic['id']}.js"></script></head>
<body data-demo="{demo['id']}"><header><a class="brand" href="../index.html">SG / Web AI Lab</a><span class="pill">Local experiment · 2026-10-23</span></header><main><div class="intro"><div class="eyebrow" id="topic"></div><h1 id="title">{demo['title']}</h1><p id="hook"></p></div><div class="notice">Native AI runs only after you press an explicitly labeled button. The browser may download a model. Educational baselines and rehearsals are labeled and never stand in for model results.</div><p class="small sample-language">The interface follows your language choice. Technical API examples and native model inputs or outputs retain their declared language, usually English. JSON keys, tool identifiers, and flags are unchanged.</p><div id="status" class="status" role="status">Ready. No model download has started.</div><div id="app" class="grid"></div><details><summary>What this demonstrates and how to run it</summary><p id="lesson"></p><p>Serve with <code>npm run serve</code>, then open <code>http://localhost:8080</code>. Current Chrome, eligible desktop hardware, sufficient disk space, supported languages, and model availability are required for native AI. Check the linked source for trial flags. A first model download requires a network connection. Afterward, availability can change with the browser profile and device.</p><p>SemanticEmbedder needs the reviewed Canary developer trial. Proofreader and experimental performance settings also need their respective trials. WebMCP is registered only if <code>document.modelContext</code> exists; local tool consoles call the same functions without claiming an agent connection. No hosted model fallback is configured.</p><ul id="sources" class="source-list"></ul></details></main><footer>Designed as a companion to <a href="https://www.sebastian-gomez.com">sebastian-gomez.com</a>. Original demo code. Source status is documented in <a href="../research/topic-review.md">the topic review</a>.</footer></body></html>'''
        (root / 'demos' / f"{demo['id']}.html").write_text(html)
(root / 'content-manifest.json').write_text(json.dumps(topics,ensure_ascii=False,indent=2)+'\n')
print(f"Built {sum(len(t['demos']) for t in topics)} HTML entry points.")

es=json.loads((root/'locales/es.json').read_text())
def translate(value):
    if isinstance(value,str):return es.get(value,value)
    if isinstance(value,list):return [translate(v) for v in value]
    if isinstance(value,dict):return {k:translate(v) for k,v in value.items()}
    return value
(root/'content-manifest.es.json').write_text(json.dumps(translate(topics),ensure_ascii=False,indent=2)+'\n')
