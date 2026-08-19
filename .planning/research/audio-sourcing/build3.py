#!/usr/bin/env python3
"""Round-3 build. Adds a third source: locally ASSEMBLED files in raw/ (the drumrolls)."""
import os, re, sys, json, base64, urllib.parse

WS = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, WS)
import build as B
import build2 as B2
from manifest3 import SLOTS, KNOWN_GAPS

BUILT = ["roll_timpani.wav", "roll_handdrum.wav", "roll_deep.wav"]


def load_index():
    rows = B2.load_index()          # Kenney + Sonniss + OpenGameArt (populates B2.URLMAP)
    for fn in BUILT:
        p = os.path.join(B.RAW, fn)
        if os.path.exists(p):
            rel = "Assembled/built-by-claude/" + fn
            B2.URLMAP[rel] = "file://" + p
            rows.append((rel, "Assembled", "Built from a CC0 / royalty-free strike"))
    return rows


def main():
    index = load_index()
    sys.stderr.write("index rows: %d\n" % len(index))
    out = []
    for slot in SLOTS:
        secs = slot.get("secs", 2.5)
        cands, used = [], set()
        for pat in slot["pats"]:
            pl = pat.lower()
            hit = next(((r, s, l) for r, s, l in index if pl in r.lower() and r not in used), None)
            if not hit:
                sys.stderr.write("  no match: %s / %s\n" % (slot["id"], pat))
                continue
            rel, src, lic = hit
            used.add(rel)
            local = B2.fetch(rel)
            if not local:
                continue
            m = B.measure(local)
            pv = os.path.join(B.PRE, "r3_" + slot["id"] + "_" + str(len(cands)) + ".mp3")
            if not B.preview(local, pv, secs, m["lufs"]):
                sys.stderr.write("  preview fail: %s\n" % rel[-46:])
                continue
            b64 = base64.b64encode(open(pv, "rb").read()).decode()
            cands.append(dict(name=os.path.basename(urllib.parse.unquote(rel)),
                              lib=rel.split("/")[-2] if "/" in rel else "",
                              src=src, lic=lic, dur=m["dur"], lufs=m["lufs"], peak=m["peak"],
                              env=B.envelope(pv), audio=b64, kb=round(len(b64) / 1024),
                              built=(src == "Assembled")))
        sys.stderr.write("%-10s %d candidates\n" % (slot["id"], len(cands)))
        out.append(dict(id=slot["id"], tier=slot["tier"], title=slot["title"], why=slot["why"],
                        said=slot.get("said"), spec=slot.get("spec"), length=slot["len"],
                        amb=False, gap=KNOWN_GAPS.get(slot["id"]), cands=cands))
    json.dump(dict(slots=out, audition_lufs=B.AUDITION_LUFS),
              open(os.path.join(WS, "gallery3.json"), "w"))
    sys.stderr.write("\nTOTAL %d candidates, %d KB\n"
                     % (sum(len(s["cands"]) for s in out),
                        sum(c["kb"] for s in out for c in s["cands"])))


if __name__ == "__main__":
    main()
