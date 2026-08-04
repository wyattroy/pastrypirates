#!/usr/bin/env python3
"""Assemble v2/ into ONE self-contained HTML page.

Run order:  bundle.py  ->  inline_assets.py  ->  assemble.py

The artifact host serves the page under a strict CSP: no external stylesheet, script, font or
image, and no fetch. So everything has to be in the file — the modules are flattened into IIFE
namespaces by bundle.py, and every image the page can display is a WebP data URI produced by
inline_assets.py and looked up at runtime through `window.__PPASSETS`.

This used to be done by hand in a session, which is how the page shipped once without the event
registry in it. It is a script now so the same three commands always produce the same page.
"""
import json, pathlib, re, sys

ROOT = pathlib.Path("/home/user/pastrypirates")
SCR = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else pathlib.Path(
    "/tmp/claude-0/-home-user-pastrypirates/c9013cf3-8ba9-52b4-bcd5-b2ae34d292ec/scratchpad/bundle")
OUT = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else SCR.parent / "pp2.html"

page = (ROOT / "v2/index.html").read_text()
js = (SCR / "bundle.js").read_text()
assets = json.loads((SCR / "assets.json").read_text())

style = re.search(r"<style>(.*?)</style>", page, re.S).group(1)
body = re.search(r"<body>(.*?)(?=<script)", page, re.S)
body = body.group(1) if body else re.search(r"<body>(.*?)</body>", page, re.S).group(1)

# The page's own <script> is a module — it imports `start` and wires the setup buttons. The bundle
# has already flattened the modules away, so the import line is dropped and `start` is bound to what
# the bundle exposes. Missing this is silent: the page renders perfectly and no button does anything.
setup = ""
for m in re.finditer(r'<script[^>]*>(.*?)</script>', page, re.S):
    s = re.sub(r'^\s*import\s+.*?;\s*$', '', m.group(1), flags=re.M | re.S)
    setup += s
if "startV2" not in setup:
    setup = "const start = window.startV2;\n" + setup

missing = sorted({u for u in re.findall(r'assets/[\w./-]+\.png', js + body) if u not in assets})

# First bytes of the file, so the encoding sniffer sees it inside its 1024-byte window. The page has
# no <head> of its own — the host wraps it — and without this the em-dashes and emoji that the whole
# voice depends on come out as mojibake anywhere the response lacks an explicit charset.
html = (f'<meta charset="utf-8">\n'
        f"<style>{style}</style>\n{body}\n"
        f"<script>window.__PPASSETS={json.dumps(assets)};</script>\n"
        f"<script>{js}\n{setup}</script>\n")
OUT.write_text(html)

print(f"assembled {OUT}  {len(html)//1024} KB   ({len(assets)} inlined assets)")
for must in ("startV2", "setupBtns", "M_events", "flipCoin"):
    if must not in html:
        print(f"!! '{must}' is not in the assembled page"); sys.exit(1)
if missing:
    print("!! referenced but NOT inlined — these render blank under the artifact CSP:")
    for u in missing:
        print("   ", u)
    sys.exit(1)
