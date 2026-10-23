"""Two local origins for the gallery, offline deck, and cross-origin policy lab."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from threading import Thread
import os

root=Path(__file__).resolve().parents[1]
os.chdir(root)
class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control','no-cache')
        super().end_headers()

servers=[ThreadingHTTPServer(('127.0.0.1',port),Handler) for port in (8080,8081)]
for s in servers:
    Thread(target=s.serve_forever,daemon=True).start()
print('Content lab: http://localhost:8080\nIframe second origin: http://localhost:8081',flush=True)
try:
    import signal
    signal.pause()
except KeyboardInterrupt:
    for s in servers:s.shutdown()
