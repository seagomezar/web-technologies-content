"""Retry failed TLS reads with macOS system curl and its certificate store."""
import concurrent.futures
import hashlib
import json
import subprocess
from pathlib import Path
from bs4 import BeautifulSoup

root = Path(__file__).resolve().parents[1]
path = root / 'research/source-audit.json'
audit = json.loads(path.read_text())

def retry(row):
    if row.get('status') != 'fetch failed':
        return row
    try:
        proc = subprocess.run(['/usr/bin/curl', '--silent', '--show-error', '--location', '--max-time', '25',
                               '--write-out', '\n%{http_code}\n%{url_effective}', row['url']], capture_output=True, text=True, timeout=28)
        if proc.returncode:
            row['system_curl_error'] = proc.stderr.strip()
            return row
        body, status, final = proc.stdout.rsplit('\n', 2)
        soup = BeautifulSoup(body, 'html.parser')
        row.update(http_status=int(status), final_url=final, title=soup.title.get_text(' ', strip=True) if soup.title else '')
        for tag in soup(['script', 'style', 'nav', 'footer', 'header']):
            tag.decompose()
        text = (soup.find('article') or soup.find('main') or soup).get_text('\n', strip=True)
        snap = root / 'research/snapshots' / (hashlib.sha256(row['url'].encode()).hexdigest()[:12] + '.txt')
        snap.write_text(text)
        row['snapshot'] = str(snap.relative_to(root))
        row['status'] = 'retrieved via system TLS' if int(status) == 200 else 'HTTP error'
        row.pop('error', None)
        if 'accounts.google.com' in final or ('groups.google.com' in final and len(text) < 4000):
            row['status'] = 'group shell or authentication required; email body not verified'
        print(row['status'], row['url'], len(text), flush=True)
    except Exception as e:
        row['retry_error'] = str(e)
    return row

with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    audit['links'] = list(pool.map(retry, audit['links']))
path.write_text(json.dumps(audit, ensure_ascii=False, indent=2) + '\n')
