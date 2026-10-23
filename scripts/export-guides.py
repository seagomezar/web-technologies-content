"""Read the document bodies, not just Google Docs' JavaScript shell."""
import concurrent.futures
import json
from pathlib import Path
import requests

root = Path(__file__).resolve().parents[1]
p = root / 'research/source-audit.json'
audit = json.loads(p.read_text())
ids = {
    '1RnSlXRAy8ffdbehvCcH7msBwmTvsxHJJQiwcw374tMw': 'expert-models',
    '1ZB6MW8UDczm4V6ej5MorZWqFCYWwLhUs5HKxEdjP35c': 'semantic-embedder',
    '1g7bv9LHSqFWqeQUM2C6EQ5PiZ8UWTz8UibxnlD4ipDE': 'mtp',
    '1rpaV4la7WtpLr4Ueb0NttJVETlVL_5a9TNHsrBMBkWk': 'gemma4',
}

def export(item):
    ident, name = item
    url = f'https://docs.google.com/document/d/{ident}/export?format=txt'
    result = {'url': url, 'guide': name}
    try:
        response = requests.get(url, timeout=(8, 35))
        result.update(http_status=response.status_code, final_url=response.url)
        if response.ok and 'text/plain' in response.headers.get('content-type', ''):
            path = root / 'research/snapshots' / f'guide-{name}.txt'
            path.write_text(response.content.decode('utf-8-sig'))
            result.update(status='body reviewed', snapshot=str(path.relative_to(root)))
        else:
            result['status'] = 'export unavailable'
    except Exception as exc:
        result.update(status='export failed', error=str(exc))
    return result

with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    exports = list(pool.map(export, ids.items()))
for link in audit['links']:
    for ident, name in ids.items():
        if ident in link['url']:
            link['status'] = 'Google Docs shell only; see export evidence'
audit['guide_exports'] = exports
p.write_text(json.dumps(audit, ensure_ascii=False, indent=2) + '\n')
for r in exports:
    print(r)
    if 'snapshot' in r:
        print((root / r['snapshot']).read_text())
