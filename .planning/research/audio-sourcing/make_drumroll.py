#!/usr/bin/env python3
"""Assemble a drumroll from a single real drum strike.

No free library has a drumroll — the Sonniss mirror only samples a handful of files per library,
and OpenGameArt has none. But a roll IS repeated strikes, so one can be built from a single one:
schedule the strike on an accelerating grid, ramp the level into a crescendo, and land a full-
strength hit on the beat the reveal happens.

This is an ASSEMBLED asset, not a recording, and it is labelled as such in the gallery. I cannot
hear it — the shape is right by construction (accelerando + crescendo + terminal accent) but
whether it convinces is Wyatt's call.

Timing is not a guess: 4/src/ui/stage.js:578 holds every narration line for
`Math.max(2550, ...)` ms, and "Drumroll..." is short enough to take that floor. So the roll runs
2.55s and the accent lands at the end of it, exactly as the box fades to the winner.
"""
import array, math, os, subprocess, sys

WS = os.path.dirname(os.path.abspath(__file__))
RATE = 32000
TOTAL = 2.55            # the measured narration hold
ACCENT_AT = 2.42        # terminal hit, just before the box fades


def decode(path):
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(RATE),
                        "-f", "s16le", "-"], capture_output=True)
    a = array.array("h")
    a.frombytes(p.stdout[:len(p.stdout) // 2 * 2])
    return a


def stroke_from(a, ms=140):
    """The attack of the source hit, windowed out with a short decay so copies don't collide."""
    # find the loudest sample and start a little before it, so the transient is intact
    peak_at = max(range(0, min(len(a), RATE)), key=lambda i: abs(a[i])) if len(a) else 0
    start = max(0, peak_at - int(0.004 * RATE))
    n = int(RATE * ms / 1000)
    s = a[start:start + n]
    if len(s) < n:
        s = s + array.array("h", [0] * (n - len(s)))
    out = array.array("h", [0] * n)
    for i in range(n):
        env = (1.0 - i / n) ** 1.7        # fast decay so a dense roll stays articulate
        out[i] = int(s[i] * env)
    return out


def build(src, dest, start_hz=9.0, end_hz=26.0):
    a = decode(src)
    if not len(a):
        return False
    st = stroke_from(a)
    n = int(RATE * (TOTAL + 0.25))
    buf = [0.0] * n

    t, i = 0.0, 0
    while t < ACCENT_AT:
        frac = t / ACCENT_AT
        # crescendo, and alternate hands so it doesn't sound machine-stamped
        amp = (0.28 + 0.62 * frac ** 1.4) * (1.0 if i % 2 == 0 else 0.82)
        off = int(t * RATE)
        for k in range(len(st)):
            if off + k < n:
                buf[off + k] += st[k] * amp
        hz = start_hz + (end_hz - start_hz) * frac ** 1.25
        t += 1.0 / hz
        i += 1

    off = int(ACCENT_AT * RATE)          # the accent the reveal lands on
    for k in range(len(st)):
        if off + k < n:
            buf[off + k] += st[k] * 1.35

    peak = max(1.0, max(abs(v) for v in buf))
    scale = 26000.0 / peak
    pcm = array.array("h", [int(max(-32000, min(32000, v * scale))) for v in buf])

    raw = dest + ".raw"
    open(raw, "wb").write(pcm.tobytes())
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "s16le", "-ar", str(RATE), "-ac", "1",
                    "-i", raw, dest], capture_output=True)
    os.remove(raw)
    sys.stderr.write("built %-34s from %s  (%d strokes)\n"
                     % (os.path.basename(dest), os.path.basename(src)[:34], i))
    return os.path.exists(dest)


if __name__ == "__main__":
    made = []
    for src_name, out_name, lo, hi in [
        ("Timpani_Hit_Fienup_001.wav", "roll_timpani.wav", 8.0, 24.0),
        ("Banjo_Drum_Hit_Fienup_016.wav", "roll_handdrum.wav", 10.0, 30.0),
        ("Impact_Drum_Hit_03.wav", "roll_deep.wav", 7.0, 20.0),
    ]:
        src = os.path.join(WS, "raw", src_name)
        if not os.path.exists(src):
            sys.stderr.write("missing source: %s\n" % src_name)
            continue
        if build(src, os.path.join(WS, "raw", out_name), lo, hi):
            made.append(out_name)
    print("\n".join(made))
