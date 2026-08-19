#!/usr/bin/env python3
"""Crawl gamesounds.xyz directory listings for candidate sound files.

Read-only. Caches every listing to disk so re-runs cost no requests.
"""
import os, re, sys, json, time, urllib.parse, urllib.request

BASE = "https://gamesounds.xyz/"
WS = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(WS, "cache")
os.makedirs(CACHE, exist_ok=True)

HREF = re.compile(r'href="([^"]+)"', re.I)
AUDIO = re.compile(r'\.(wav|mp3|ogg|flac|aif|aiff)$', re.I)


def fetch(d):
    """Fetch one directory listing, cached."""
    key = urllib.parse.quote(d, safe="") or "_root"
    path = os.path.join(CACHE, key[:180] + ".html")
    if os.path.exists(path):
        return open(path, encoding="utf-8", errors="replace").read()
    # the root listing is the bare URL — "?dir=" with an empty value 404s
    url = BASE + ("?dir=" + urllib.parse.quote(d) if d else "")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (audit)"})
    try:
        html = urllib.request.urlopen(req, timeout=45).read().decode("utf-8", "replace")
    except Exception as e:
        sys.stderr.write("FAIL %s: %s\n" % (d[:70], e))
        html = ""
    open(path, "w", encoding="utf-8").write(html)
    time.sleep(0.25)
    return html


def parse(d):
    """Return (subdirs, files) for a directory."""
    html = fetch(d)
    subs, files = [], []
    for h in HREF.findall(html):
        if h.startswith("?dir="):
            sub = urllib.parse.unquote(h[5:])
            if sub != d and sub.startswith(d) and sub.count("/") == d.count("/") + (1 if d else 0):
                subs.append(sub)
        elif AUDIO.search(h) and not h.startswith(("http", "//", "?")):
            files.append(urllib.parse.unquote(h))
    return sorted(set(subs)), sorted(set(files))


if __name__ == "__main__":
    mode = sys.argv[1]
    if mode == "libs":
        # list every publisher-library across all Sonniss bundles
        roots, _ = parse("")
        out = []
        for r in roots:
            if "Sonniss" not in r:
                continue
            subs, _ = parse(r)
            out += subs
        print("\n".join(out))
    elif mode == "files":
        # every audio file under the directories named on stdin
        for line in sys.stdin:
            d = line.strip()
            if not d:
                continue
            subs, files = parse(d)
            for f in files:
                print(f)
            for s in subs:                      # one level deeper
                _, f2 = parse(s)
                for f in f2:
                    print(f)
