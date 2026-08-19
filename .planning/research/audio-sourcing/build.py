#!/usr/bin/env python3
"""Resolve manifest slots to real files, fetch, measure, and build audition previews.

Every download is byte-capped: Sonniss masters are 96kHz/24-bit and can run to hundreds of MB,
so we range-request only the head of each file. A WAV header plus partial PCM decodes fine.

Previews are loudness-MATCHED to a fixed target so that judging is not biased by whichever
candidate happens to be mastered louder. The TRUE measured loudness is reported separately.
"""
import os, re, sys, json, base64, urllib.parse, urllib.request, subprocess, shutil

WS = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(WS, "raw"); PRE = os.path.join(WS, "preview")
os.makedirs(RAW, exist_ok=True); os.makedirs(PRE, exist_ok=True)
BASE = "https://gamesounds.xyz/"
HEAD_BYTES = 6 * 1024 * 1024          # ~10s of 96k/24bit stereo — plenty to audition
AUDITION_LUFS = -20.0                 # every preview normalised here, for fair comparison

sys.path.insert(0, WS)
from manifest import SLOTS, KNOWN_GAPS


def load_index():
    rows = []
    # sonniss-all.txt is round 1 + round 2 merged; fall back to round 1 alone if it is absent
    son = "sonniss-all.txt" if os.path.exists(os.path.join(WS, "sonniss-all.txt")) \
          else "sonniss-files.txt"
    for fn, src, lic in (("kenney-index.txt", "Kenney", "CC0"),
                         (son, "Sonniss GDC", "Royalty-free (games)")):
        p = os.path.join(WS, fn)
        if not os.path.exists(p):
            continue
        for line in open(p):
            rel = urllib.parse.unquote(line.strip())
            if rel:
                rows.append((rel, src, lic))
    return rows


def fetch(rel, cap=HEAD_BYTES):
    """Range-limited download. Returns local path or None.

    `cap` is raised on retry for field recordings whose opening minutes are silence — the goose,
    raven and owl all fetched as pure silence at the default cap.
    """
    safe = re.sub(r"[^A-Za-z0-9._-]", "_", rel.split("/")[-1])[:110]
    if cap != HEAD_BYTES:
        safe = "big_" + safe
    dest = os.path.join(RAW, safe)
    if os.path.exists(dest) and os.path.getsize(dest) > 2048:
        return dest
    url = BASE + urllib.parse.quote(rel)
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (sfx audition build)",
        "Range": "bytes=0-%d" % cap})
    try:
        data = urllib.request.urlopen(req, timeout=90).read()
    except Exception as e:
        sys.stderr.write("FETCH FAIL %s: %s\n" % (rel[-60:], e))
        return None
    if len(data) < 2048:
        return None
    open(dest, "wb").write(data)
    return dest


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def measure(path):
    """True duration + integrated loudness + peak of the (possibly truncated) source."""
    d = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "csv=p=0", path]).stdout.strip()
    try:
        dur = float(d)
    except ValueError:
        dur = 0.0
    r = run(["ffmpeg", "-hide_banner", "-nostats", "-i", path,
             "-af", "ebur128=peak=true", "-f", "null", "-"]).stderr
    def grab(pat):
        m = re.findall(pat, r)
        try:
            return float(m[-1])
        except (IndexError, ValueError):
            return None
    return dict(dur=round(dur, 2), lufs=grab(r"I:\s+(-?\d+\.\d+)\s+LUFS"),
                peak=grab(r"Peak:\s+(-?\d+\.\d+)\s+dBFS"))


def envelope(path, buckets=64):
    """Peak envelope for the waveform drawing — shows attack and tail before he plays it."""
    # binary capture — NOT run(), which decodes as text and dies on raw PCM
    proc = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", "8000",
                           "-f", "s16le", "-"], capture_output=True)
    raw = proc.stdout
    n = len(raw) // 2
    if n < buckets:
        return []
    import array
    a = array.array("h"); a.frombytes(raw[:n * 2])
    step = n // buckets
    out = []
    for i in range(buckets):
        chunk = a[i * step:(i + 1) * step] or [0]
        out.append(min(100, int(max(abs(min(chunk)), abs(max(chunk))) / 32768 * 100)))
    return out


def best_offset(path, seconds):
    """Start time of the most energetic window.

    Field recordings (ocean, wind, birds, thunder) routinely open with many seconds of near
    silence, so a naive first-N-seconds preview makes a good sound audition as nothing — the
    owl flyby came back with a peak of 0. Back off slightly from the window start so a
    transient attack is not clipped off the front.
    """
    proc = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", "4000",
                           "-f", "s16le", "-"], capture_output=True)
    raw = proc.stdout
    import array
    a = array.array("h"); a.frombytes(raw[:len(raw) // 2 * 2])
    rate, win = 4000, int(seconds * 4000)
    if len(a) <= win:
        return 0.0
    step = max(1, win // 8)
    best, best_at = -1, 0
    for i in range(0, len(a) - win, step):
        e = sum(abs(v) for v in a[i:i + win:16])
        if e > best:
            best, best_at = e, i
    return max(0.0, best_at / rate - 0.1)


def preview(path, out, seconds, lufs):
    """Trim from the loudest region, level-match EXACTLY, fade, encode small mono mp3.

    Not loudnorm: single-pass loudnorm under-corrects badly on clips this short (measured spread
    -20.4 to -26.6 LUFS against a -20 target), and an uneven audition biases which candidate
    sounds best for reasons that have nothing to do with the sound. So: measure the trimmed clip,
    then apply one flat gain, capped so the peak still lands below -1 dBFS. Dynamics untouched.
    """
    off = best_offset(path, seconds)
    tmp = out + ".tmp.wav"
    run(["ffmpeg", "-y", "-v", "error", "-ss", "%.2f" % off, "-t", str(seconds), "-i", path,
         "-ac", "1", "-ar", "32000", tmp])
    if not os.path.exists(tmp):
        return False
    # RMS, not broadcast loudness. EBU R128 integrates over a 400ms gated window, so ANY clip
    # shorter than that reads as silence — which wrongly threw out most of the Kenney one-shots
    # (clicks, wood impacts, chip lays) at 0.1-0.3s each. volumedetect is length-independent, and
    # matching RMS is the right call for one-shots anyway.
    vd = run(["ffmpeg", "-hide_banner", "-nostats", "-i", tmp,
              "-af", "volumedetect", "-f", "null", "-"]).stderr
    def g(pat):
        mm = re.findall(pat, vd)
        return float(mm[-1]) if mm else None
    i, pk = g(r"mean_volume:\s+(-?\d+\.?\d*) dB"), g(r"max_volume:\s+(-?\d+\.?\d*) dB")
    if i is None or pk is None or pk < -60:   # genuinely silent stretch — unusable, drop it
        os.remove(tmp)
        return False
    m = dict(dur=float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                            "-of", "csv=p=0", tmp]).stdout.strip() or seconds))
    # Reach the target, then LIMIT — do not cap the gain by peak. Percussive material (impacts,
    # coins, a cannon) has a huge crest factor, so a peak-capped gain leaves it 10+ dB under
    # everything else: measured spread was 12.7 dB, which is exactly the bias this is meant to
    # remove. A limiter holds the ceiling instead, at a small and equal cost to the transients.
    gain = AUDITION_LUFS - i
    fade = max(0.05, min(0.25, seconds * 0.12))
    af = "volume=%.2fdB,alimiter=limit=0.79,afade=t=out:st=%.2f:d=%.2f" % (
        gain, max(0.01, min(seconds, m["dur"]) - fade), fade)
    run(["ffmpeg", "-y", "-v", "error", "-i", tmp, "-af", af,
         "-ac", "1", "-ar", "32000", "-b:a", "48k", out])

    # CLOSED LOOP. Predicting the limiter's effect on RMS is guesswork — measured open-loop, the
    # spread across the gallery was still 13.2 dB. So measure what actually came out and correct
    # once. Two passes converge every file to within a decibel of the others, which is the whole
    # point: he should be choosing a sound, not the loudest master.
    for _ in range(2):
        if not os.path.exists(out):
            break
        vd2 = run(["ffmpeg", "-hide_banner", "-nostats", "-i", out,
                   "-af", "volumedetect", "-f", "null", "-"]).stderr
        mm = re.findall(r"mean_volume:\s+(-?\d+\.?\d*) dB", vd2)
        if not mm:
            break
        resid = AUDITION_LUFS - float(mm[-1])
        if abs(resid) < 1.0:
            break
        gain += resid
        af = "volume=%.2fdB,alimiter=limit=0.79,afade=t=out:st=%.2f:d=%.2f" % (
            gain, max(0.01, min(seconds, m["dur"]) - fade), fade)
        run(["ffmpeg", "-y", "-v", "error", "-i", tmp, "-af", af,
             "-ac", "1", "-ar", "32000", "-b:a", "48k", out])
    os.remove(tmp)
    return os.path.exists(out) and os.path.getsize(out) > 512


def main():
    index = load_index()
    sys.stderr.write("index rows: %d\n" % len(index))
    slots_out = []
    for slot in SLOTS:
        amb = slot.get("amb", False)
        secs = 6.0 if amb else 2.5
        cands, used = [], set()
        for pat in slot["pats"]:
            pl = pat.lower()
            hit = next(((rel, src, lic) for rel, src, lic in index
                        if pl in rel.lower() and rel not in used), None)
            if not hit:
                sys.stderr.write("  no match: %s / %s\n" % (slot["id"], pat))
                continue
            rel, src, lic = hit
            used.add(rel)
            local = fetch(rel)
            if not local:
                continue
            m = measure(local)
            pv = os.path.join(PRE, slot["id"] + "_" + str(len(cands)) + ".mp3")
            if not preview(local, pv, secs, m["lufs"]):
                # silent head — one retry with a much larger range before giving up
                big = fetch(rel, 24 * 1024 * 1024)
                if big and preview(big, pv, secs, m["lufs"]):
                    local = big
                    m = measure(big)
                    sys.stderr.write("  recovered on deep fetch: %s\n" % rel[-46:])
                else:
                    sys.stderr.write("  preview fail (silent): %s\n" % rel[-46:])
                    continue
            b64 = base64.b64encode(open(pv, "rb").read()).decode()
            cands.append(dict(
                name=rel.split("/")[-1], lib=rel.split("/")[-2] if "/" in rel else "",
                src=src, lic=lic, dur=m["dur"], lufs=m["lufs"], peak=m["peak"],
                env=envelope(pv), audio=b64, kb=round(len(b64) / 1024)))
        sys.stderr.write("%-12s %d candidates\n" % (slot["id"], len(cands)))
        slots_out.append(dict(
            id=slot["id"], tier=slot["tier"], title=slot["title"], why=slot["why"],
            said=slot.get("said"), length=slot["len"], amb=amb,
            gap=KNOWN_GAPS.get(slot["id"]), cands=cands))
    json.dump(dict(slots=slots_out, audition_lufs=AUDITION_LUFS),
              open(os.path.join(WS, "gallery.json"), "w"))
    tot = sum(len(s["cands"]) for s in slots_out)
    kb = sum(c["kb"] for s in slots_out for c in s["cands"])
    sys.stderr.write("\nTOTAL %d candidates across %d slots, %d KB of audio\n"
                     % (tot, len(slots_out), kb))


if __name__ == "__main__":
    main()
