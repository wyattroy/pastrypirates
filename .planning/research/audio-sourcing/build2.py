#!/usr/bin/env python3
"""Round-2 build. Same pipeline as build.py, plus OpenGameArt as a third source.

OGA entries arrive as absolute http URLs or, for packs that ship as a zip, as local file:// paths
pointing into the extracted cache — so fetch has to handle three shapes, not one.
"""
import os, re, sys, json, base64, urllib.parse, urllib.request

WS = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, WS)
import build as B
from manifest2 import SLOTS, KNOWN_GAPS

URLMAP = {}


def load_index():
    rows = list(B.load_index())
    p = os.path.join(WS, "oga-files.txt")
    if os.path.exists(p):
        for line in open(p):
            parts = line.rstrip("\n").split("\t")
            if len(parts) != 3:
                continue
            slug, url, lic = parts
            base = os.path.basename(urllib.parse.unquote(url))
            # macOS AppleDouble stubs get bundled into zips and are NOT audio — they decode as
            # garbage or silence. Filter them here rather than discovering it in the gallery.
            if base.startswith("._") or base.startswith(".DS"):
                continue
            rel = "OpenGameArt/%s/%s" % (slug, base)
            URLMAP[rel] = url
            rows.append((rel, "OpenGameArt", lic))
    return rows


def fetch(rel, cap=B.HEAD_BYTES):
    src = URLMAP.get(rel)
    if not src:
        return B.fetch(rel, cap)
    if src.startswith("file://"):
        return src[7:]
    safe = "oga_" + re.sub(r"[^A-Za-z0-9._-]", "_", os.path.basename(src))[:100]
    dest = os.path.join(B.RAW, safe)
    if os.path.exists(dest) and os.path.getsize(dest) > 1024:
        return dest
    try:
        req = urllib.request.Request(src, headers={"User-Agent": "Mozilla/5.0 (audit)"})
        data = urllib.request.urlopen(req, timeout=90).read()
    except Exception as e:
        sys.stderr.write("OGA fetch fail %s: %s\n" % (src[-50:], e))
        return None
    open(dest, "wb").write(data)
    return dest


def main():
    index = load_index()
    sys.stderr.write("index rows: %d (incl. %d OpenGameArt)\n" % (len(index), len(URLMAP)))
    out = []
    for slot in SLOTS:
        amb = slot.get("amb", False)
        secs = 6.0 if amb else 2.5
        cands, used = [], set()
        for pat in slot["pats"]:
            pl = pat.lower()
            hit = next(((r, s, l) for r, s, l in index if pl in r.lower() and r not in used), None)
            if not hit:
                sys.stderr.write("  no match: %s / %s\n" % (slot["id"], pat))
                continue
            rel, src, lic = hit
            used.add(rel)
            local = fetch(rel)
            if not local:
                continue
            m = B.measure(local)
            pv = os.path.join(B.PRE, "r2_" + slot["id"] + "_" + str(len(cands)) + ".mp3")
            if not B.preview(local, pv, secs, m["lufs"]):
                big = fetch(rel, 24 * 1024 * 1024)
                if not (big and B.preview(big, pv, secs, m["lufs"])):
                    sys.stderr.write("  preview fail: %s\n" % rel[-46:])
                    continue
                m = B.measure(big)
            b64 = base64.b64encode(open(pv, "rb").read()).decode()
            cands.append(dict(name=os.path.basename(urllib.parse.unquote(rel)),
                              lib=rel.split("/")[-2] if "/" in rel else "",
                              src=src, lic=lic, dur=m["dur"], lufs=m["lufs"], peak=m["peak"],
                              env=B.envelope(pv), audio=b64, kb=round(len(b64) / 1024)))
        sys.stderr.write("%-12s %d candidates\n" % (slot["id"], len(cands)))
        out.append(dict(id=slot["id"], tier=slot["tier"], title=slot["title"], why=slot["why"],
                        said=slot.get("said"), length=slot["len"], amb=amb,
                        gap=KNOWN_GAPS.get(slot["id"]), cands=cands))
    json.dump(dict(slots=out, audition_lufs=B.AUDITION_LUFS),
              open(os.path.join(WS, "gallery2.json"), "w"))
    sys.stderr.write("\nTOTAL %d candidates, %d KB\n"
                     % (sum(len(s["cands"]) for s in out),
                        sum(c["kb"] for s in out for c in s["cands"])))


if __name__ == "__main__":
    main()
