"""Audit every archive link; save readable evidence without publishing email bodies."""
import concurrent.futures
import csv
import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'research'
rows = list(csv.reader(next(ROOT.glob('*.csv')).open(newline='', encoding='utf-8-sig')))
start = next(i for i, r in enumerate(rows) if 'Full Body' in r)
headers = rows[start]
messages = []
links = {}
for i, values in enumerate(rows[start + 1:], start + 2):
    row = dict(zip(headers, values))
    urls = [u.strip() for u in row['URLs in Body'].split(',') if u.strip()]
    messages.append({'csv_line': i, 'date': row['Date'], 'subject': row['Subject'], 'urls': urls})
    for original in urls:
        url = original
        if not re.match(r'(?i)^(https?://|mailto:)', url):
            url = 'https://' + url
        url = re.sub(r'(?i)^https?://', lambda m: m.group().lower(), url)
        parsed = urlparse(url)
        url = parsed._replace(netloc=parsed.netloc.lower(), fragment='').geturl()
        entry = links.setdefault(url, {'url': url, 'csv_lines': [], 'originals': []})
        entry['csv_lines'].append(i)
        if original not in entry['originals']:
            entry['originals'].append(original)

extra = [
    'https://www.sebastian-gomez.com/en',
    'https://www.sebastian-gomez.com/en/posts/page/2',
    'https://www.sebastian-gomez.com/en/post/modelos-pequenos-buen-diseno-ia-navegador-litert-lm',
    'https://www.sebastian-gomez.com/en/post/el-borde-es-inevitable-browserdj-ai-gemma-antigravity',
    'https://developer.chrome.com/docs/ai/prompt-api',
    'https://developer.chrome.com/docs/ai/summarizer-api',
    'https://developer.chrome.com/docs/ai/proofreader-api',
    'https://developer.chrome.com/docs/ai/translator-api',
    'https://developer.chrome.com/docs/ai/language-detection',
    'https://developer.chrome.com/docs/ai/built-in',
    'https://developer.chrome.com/docs/ai/session-management',
    'https://developer.chrome.com/docs/ai/debugging',
    'https://developer.chrome.com/docs/ai/built-in-apis',
    'https://raw.githubusercontent.com/webmachinelearning/webmcp/main/README.md',
    'https://raw.githubusercontent.com/webmachinelearning/webmcp/main/docs/proposal.md',
    'https://raw.githubusercontent.com/webmachinelearning/prompt-api/main/README.md',
    'https://raw.githubusercontent.com/explainers-by-googlers/embedding-api/main/README.md',
    'https://docs.google.com/presentation/d/1bTHqCd-ZdfXplMtFIISS_kdRjTVPBkOh85B0rB5ohEM/edit',
]
for u in extra:
    links.setdefault(u, {'url': u, 'csv_lines': [], 'originals': [u]})

def fetch(entry):
    url = entry['url']
    host = urlparse(url).hostname or ''
    if url.startswith('mailto:'):
        return {**entry, 'kind': 'mail action', 'status': 'not requested', 'note': 'Not a documentation page; no email sent.'}
    if host == 'balance':
        return {**entry, 'kind': 'internal signature', 'status': 'unresolvable internal host', 'note': 'Google-internal profile URL; no public evidence.'}
    entry['kind'] = ('signature' if host in ['blog.tomayac.com', 'toot.cafe', 'xkcd.com'] else
                     'feedback' if host in ['forms.gle', 'goo.gle'] else
                     'mailing-list' if host == 'groups.google.com' else 'source')
    key = hashlib.sha256(url.encode()).hexdigest()[:12]
    path = OUT / 'snapshots' / f'{key}.txt'
    try:
        response = requests.get(url, timeout=(8, 22), headers={'User-Agent': 'Mozilla/5.0 (compatible; content-research/1.0)'})
        entry.update(http_status=response.status_code, final_url=response.url)
        soup = BeautifulSoup(response.text, 'html.parser')
        entry['title'] = soup.title.get_text(' ', strip=True) if soup.title else ''
        for el in soup(['script', 'style', 'nav', 'footer', 'header']):
            el.decompose()
        article = soup.find('article') or soup.find('main') or soup
        content = article.get_text('\n', strip=True)
        if response.headers.get('content-type', '').startswith('text/plain'):
            content = response.text
        path.write_text(content, encoding='utf-8')
        entry['snapshot'] = str(path.relative_to(ROOT))
        entry['status'] = 'retrieved' if response.ok else 'HTTP error'
        if 'accounts.google.com' in response.url or (host == 'groups.google.com' and ('Sign in' in content and len(content) < 2500)):
            entry['status'] = 'authentication or group access required'
        if host == 'docs.google.com' and ('Sign in' in content and len(content) < 2500):
            entry['status'] = 'authentication required'
        if response.ok and len(content) < 200:
            entry['note'] = 'Thin response; not sufficient to verify technical claims.'
    except Exception as exc:
        entry.update(status='fetch failed', error=f'{type(exc).__name__}: {exc}')
    print(f"{entry['status']}: {url}", flush=True)
    return entry

OUT.mkdir(exist_ok=True)
(OUT / 'snapshots').mkdir(exist_ok=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
    results = list(pool.map(fetch, links.values()))
data = {'checked_at': datetime.now(timezone.utc).isoformat(), 'message_count': len(messages),
        'csv': next(ROOT.glob('*.csv')).name, 'messages': messages, 'links': results}
(OUT / 'source-audit.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
print(f'Saved {len(messages)} messages and {len(results)} unique URLs.')
