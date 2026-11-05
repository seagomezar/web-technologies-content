"""Generate one directly openable HTML entry point for every hand-authored demo."""
from pathlib import Path
import json, subprocess

root = Path(__file__).resolve().parents[1]
raw = subprocess.check_output(['node','-e',"global.window=global;require('./content-data.js');process.stdout.write(JSON.stringify(CONTENT_TOPICS))"],cwd=root,text=True,encoding='utf-8')
topics = json.loads(raw)
for topic in topics:
    for demo in topic['demos']:
        html = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="{demo['hook']}"><title>{demo['title']} | Web AI Lab</title><link rel="stylesheet" href="../i18n.css"><script defer src="../locale-data.js"></script><script defer src="../i18n.js"></script><link rel="icon" href="data:,"><link rel="stylesheet" href="assets/lab.css"><script defer src="../content-data.js"></script><script defer src="assets/lab.js"></script><script defer src="assets/{topic['id']}.js"></script></head>
<body data-demo="{demo['id']}"><header><a class="brand" href="../index.html">← All Demos · Web AI Lab</a><span class="pill">{topic['stage']}</span></header><main><div class="intro"><div class="eyebrow" id="topic"></div><h1 id="title">{demo['title']}</h1><p id="hook"></p></div><div id="status" class="status" role="status">Ready.</div><div id="app" class="grid"></div><details><summary>Implementation note &amp; specification links</summary><p id="lesson"></p><ul id="sources" class="source-list"></ul></details></main><footer><a href="https://www.sebastian-gomez.com">sebastian-gomez.com</a> · <a href="../index.html">All 21 Demos</a> · <a href="../slides/index.html">WebMCP Talk</a> · <a href="../research/topic-review.md">API Notes</a></footer></body></html>'''
        (root / 'demos' / f"{demo['id']}.html").write_text(html, encoding='utf-8')
(root / 'content-manifest.json').write_text(json.dumps(topics,ensure_ascii=False,indent=2)+'\n', encoding='utf-8')
print(f"Built {sum(len(t['demos']) for t in topics)} HTML entry points.")

es=json.loads((root/'locales/es.json').read_text(encoding='utf-8'))
def translate(value):
    if isinstance(value,str):return es.get(value,value)
    if isinstance(value,list):return [translate(v) for v in value]
    if isinstance(value,dict):return {k:translate(v) for k,v in value.items()}
    return value
(root/'content-manifest.es.json').write_text(json.dumps(translate(topics),ensure_ascii=False,indent=2)+'\n', encoding='utf-8')
