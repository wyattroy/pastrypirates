#!/usr/bin/env python3
"""Pull audio file URLs + verified licence from OpenGameArt content pages.

The browse filter already asks for CC0, but a submission can carry several licences at once, so
the licence is re-read from each page and anything that is not unambiguously CC0/public-domain is
dropped. This game ships on a live public domain — a wrong licence is not a small mistake.
"""
import re, sys, os, time, subprocess, urllib.request, urllib.parse

CACHE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cache-oga")
os.makedirs(CACHE, exist_ok=True)
AUD = re.compile(r'href="(https://opengameart\.org/sites/default/files/[^"]+\.(?:wav|ogg|mp3))"', re.I)


def page(slug):
    p = os.path.join(CACHE, slug[:150] + ".html")
    if os.path.exists(p):
        return open(p, encoding="utf-8", errors="replace").read()
    try:
        req = urllib.request.Request("https://opengameart.org/content/" + slug,
                                     headers={"User-Agent": "Mozilla/5.0 (audit)"})
        h = urllib.request.urlopen(req, timeout=45).read().decode("utf-8", "replace")
    except Exception as e:
        sys.stderr.write("OGA FAIL %s: %s\n" % (slug, e))
        h = ""
    open(p, "w", encoding="utf-8").write(h)
    time.sleep(0.3)
    return h


def licences(html):
    """Every licence badge on the page."""
    out = set()
    for m in re.findall(r'(CC0|CC-BY-SA 4\.0|CC-BY-SA 3\.0|CC-BY 4\.0|CC-BY 3\.0|GPL \d|OGA-BY[^<"]*)', html):
        out.add(m.strip())
    return out


if __name__ == "__main__":
    for slug in [l.strip() for l in sys.stdin if l.strip()]:
        h = page(slug)
        if not h:
            continue
        lic = licences(h)
        # STRICT: the licence set must be exactly {CC0}. A page listing CC0 *and* CC-BY-SA or GPL
        # gives no way to tell which file carries which — and guessing wrong on a game that ships
        # on a live public domain is not a small mistake. Ambiguous packs are dropped whole.
        if lic != {"CC0"}:
            sys.stderr.write("SKIP (licence not purely CC0): %-40s %s\n" % (slug, sorted(lic)))
            continue
        files = sorted(set(AUD.findall(h)))
        for f in files:
            print("%s\t%s\t%s" % (slug, f, "CC0"))
        # packs that ship as a zip instead of loose files — fetch and index the contents
        zips = sorted(set(re.findall(
            r'href="(https://opengameart\.org/sites/default/files/[^"]+\.zip)"', h, re.I)))
        nz = 0
        for z in zips:
            local = os.path.join(CACHE, slug + "_" + os.path.basename(urllib.parse.unquote(z)))
            if not os.path.exists(local):
                try:
                    req = urllib.request.Request(z, headers={"User-Agent": "Mozilla/5.0 (audit)"})
                    d = urllib.request.urlopen(req, timeout=90).read()
                    if len(d) > 40 * 1024 * 1024:      # bound it — no runaway downloads
                        continue
                    open(local, "wb").write(d)
                except Exception as e:
                    sys.stderr.write("  zip fail %s: %s\n" % (slug, e))
                    continue
            out = os.path.join(CACHE, "x_" + slug)
            if not os.path.isdir(out):
                os.makedirs(out, exist_ok=True)
                subprocess.run(["unzip", "-qq", "-o", "-j", local, "-d", out],
                               capture_output=True)
            for fn in sorted(os.listdir(out)):
                if fn.lower().endswith((".wav", ".ogg", ".mp3")):
                    print("%s\tfile://%s\t%s" % (slug, os.path.join(out, fn), "CC0"))
                    nz += 1
        sys.stderr.write("%-46s %2d loose + %2d zipped   %s\n" % (slug, len(files), nz, sorted(lic)))
