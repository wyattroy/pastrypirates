# The pulse bug — EVIDENCE LEDGER

**Nothing enters an argument unless it is in this file, as a measurement with a timestamp.**
Labels: [M] measured · [O] observed once · [T] his testimony.

## 2026-08-24 — build 24d era

- [M] His desktop Safari recording (pulse_bug.mov, 4.0s, 16 frames at 4fps): the Pass petal is
  **121px in every frame across 3.6 pulse cycles** — dead flat. Root cause found and fixed in 24e:
  `scale(var(--growHi))` inside @keyframes; WebKit resolves the var once at animation start and
  the radial class carrying 1.15 lands a beat later. Chromium re-resolves live (why the rig
  missed it).
- [T] "In Safari the pulsing DOES happen sometimes — it's just inconsistent" — the var-race's
  fingerprint (fallback 1.05 vs real 1.15, per prompt).

## 2026-08-24 — build 24f, Chromium rig (Linux, 1400x900)

- [M] 6 fans / 13 enabled buttons across one driven solo run: all `pp4Grow`, all running, painted
  swing 9.9px each, animation clocks monotonic (0 restarts), box class stable `radial`.
- [M] Real-cursor hover on a live petal: play-state stays `running` (the hover-pause rule is inert
  by specificity). Screenshot: hover-frozen-fan.png (not frozen).
- [M] Reduce-motion emulation: same button flips to `pp4Glow` (the still ring), never to nothing.

## 2026-08-24 ~18:27–18:28 — build 24f, HIS iPhone Safari, four clips, one un-reloaded session

Area of each circle per frame (5fps; swell = ~1.31 area ratio at the 1.15 scale, 1.1s period):

| Clip (time) | Prompt | ⏩ chip | Verdict |
|---|---|---|---|
| 1 (6:27) | Call Flaky Jack / Call Crustbeard | visible | DEAD (ratio 1.002) |
| 2 (6:27) | Dock / Trade / Pass | absent | DEAD (1.001–1.002) |
| 3 (6:28) | Buy / Nah | absent | ALIVE (1.31, 1.1s period) |
| 4 (6:28) | Accept / Counter / Deny | visible | ALIVE (1.31) |

- [M] All four clips open mid-prompt (the prompt predates each recording start).
- [M] Dead circles are correctly styled AS circles and correctly fanned → the radial class and the
  layout tick were alive during the dead clips (kills tick-death for these clips).
- [M] Two DIFFERENT dead prompts back-to-back (clips 1–2) → the freeze is not per-element birth
  alone; it outlived one full prompt turnover (supports the stuck-CLOCK variant of H1).
- [T] No reload, never left Safari, Reduce Motion off. Recording workflow: each clip begins with a
  Control Center pull (a page-hide) — ≥4 hide/show events across the minute.
- [T] The flip dead→alive falls between clips 2 and 3, i.e. at one of those hide/show boundaries.

## Code reads (2026-08-24)

- [M] No game code touches animation playback (grep: getAnimations/pause()/play-state — only the
  storm rain's own CSS pattern).
- [M] `tick()` (stage.js ~2989) is unprotected; watchdog (~3024) revives only when `S.raf` is
  falsy, and nothing clears `S.raf` on entry → an exception leaves a stale truthy id and the
  watchdog is blind. Latent fragility, not implicated in the four clips.
- [M] The radial costume is a per-frame grant: `menuButtons(ap) && boatUXY(seat)` (stage.js
  ~2267); menuButtons has a 16-char label gate ("Call " + a long human name blows it in crew).
- [M] GitHub Pages: `cache-control: max-age=600` on both index.html (all CSS) and stage.js (the
  stamp) — mixed-build pages are possible for up to 10 min after a deploy. Ruled out as the
  mid-session flip's mechanism (constant stylesheet), queued as delivery hardening.

## Pending ingestion

- His 5-minute phone recording (arriving via Google Drive) — full prompt-by-prompt ledger to be
  appended here: timestamp, prompt kind, per-button verdict, plus all other bugs sighted.
- His Control-Center experiment result (see HYPOTHESES.md, "His device").
