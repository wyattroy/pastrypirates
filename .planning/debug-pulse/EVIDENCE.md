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


## 2026-08-24 ~18:49 — build 24f, HIS iPhone Safari, the 5-MINUTE RECORDING (`notes/pulse bug.MP4`)

**This is the artifact the "Pending ingestion" line below was waiting for.** 289s, 1126x2436, 60fps,
ONE continuous take (status-bar clock runs 6:49→6:54 unbroken). Solo voyage, Days 3→12.
Same build as the four short clips above, so the two sets are ONE dataset.

Method: every circle prompt located by ring-colour blob detection across the whole recording, then
each button's painted CREAM AREA sampled at 30fps and reported as max/min ratio plus the
autocorrelation peak. Swell at scale 1.15 ⇒ area ratio ≈1.32, period 1.10s. Flat ⇒ ratio ≈1.00.

### [M] Prompt-by-prompt — 21 prompts, 5 DEAD, 16 ALIVE

| t | Day | Prompt | Btns | ratio | period | Verdict |
|---|---|---|---|---|---|---|
| 0:08 | 3 | TAILS – buy Sand-Speckled Eggs | 2 | 1.34–1.45 | 1.1s | ALIVE |
| 0:26 | 3 | single | 1 | 1.31 | 1.1s | ALIVE |
| 0:30 | 4 | **what'll ye do** (Dock/Trade/Pass, has ‹ back) | 3 | 1.32–1.40 | 1.1s | ALIVE |
| 0:38 | 4 | TAILS – buy | 2 | 1.32 | 1.1s | ALIVE |
| **1:00** | **5** | **what'll ye do** (Trade/Pass) | 2 | **1.000** | — | **DEAD** |
| 1:18 | 6 | **what'll ye do** (Dock/Trade/Pass) | 3 | 1.29–1.32 | 1.1s | ALIVE |
| 1:27 | 6 | TREASURE! Buy Velvety Vanilla Beans | 2 | 1.34 | 1.1s | ALIVE |
| **1:44** | **7** | **what'll ye do** (Trade/Pass) | 2 | **1.000** | — | **DEAD** |
| **2:00** | **8** | **what'll ye do** (Trade/Pass) | 2 | **1.000** | — | **DEAD** |
| 2:05 | 8 | trade GIVE fan | 4 | 1.31–1.36 | 1.07s | ALIVE |
| 2:09 | 8 | trade WANT fan | 4 | 1.31–1.36 | 1.10s | ALIVE |
| 2:15 | 8 | trade WANT fan | 6 | 1.26–1.33 | 1.10s | ALIVE |
| 2:24 | 8 | trade fan | 4 | 1.31–1.35 | 1.1s | ALIVE |
| 2:27 | 8 | single (Walk away) | 1 | 1.32 | 1.10s | ALIVE |
| 2:37 | 8 | single (Flaky Jack) | 1 | 1.31 | 1.07s | ALIVE |
| 3:20 | 9 | Call Dough Hook / Call Flaky Jack | 3 | 1.31 | 1.1s | ALIVE |
| 3:30 | 9 | TAILS – buy Fresh Milk | 2 | 1.34–1.43 | 1.1s | ALIVE |
| 3:44 | 9 | Accept / Counter / Deny | 3 | 1.34–1.36 | 1.10s | ALIVE |
| **4:09** | **10** | **what'll ye do** (Trade/Pass) | 2 | **1.000** | — | **DEAD** |
| **4:25** | **11** | **what'll ye do** (Dock/Trade/Pass) | 3 | **1.000–1.014** | — | **DEAD** |
| 4:38 | 11 | single | 1 | 1.32 | 1.07s | ALIVE |

- [M] **EVERY dead prompt is the "Wyargh, what'll ye do:" turn menu. 5 of its 7 appearances are
  dead; 0 of the other 14 prompts is.**
- [M] A dead button's area is constant to within **8 px out of ~24,000** across 3–8 seconds — and it
  sits at the size a LIVING button holds at its trough. Parked at rest, not frozen mid-breath.
- [M] **The tightest control in the recording: 2:00 the turn menu is DEAD; 2:05 the trade fan that
  replaces it is fully ALIVE.** Same page, same day, 4 seconds apart. Deaths are BORN, per prompt,
  and do not spread to the next prompt.
- [M] Within a window the state never changes: an 8.5s alive window is alive throughout, a 6.0s dead
  window is dead throughout.

### [M] Control 1 — the page's animation clock is RUNNING during every dead window
Non-button patches of the board during the dead windows at 1:00 and 4:25 carry a clean periodic
signal at **2.53–2.60s, amplitude 36–44 grey levels**. That is `.rimFlow img`
(`rimDrift 2.6s linear infinite` + `rimPulse`, index.html:915) — the current arrows around the
trade ring — running at full amplitude in the same frames where the buttons above them are flat.
A temporal-variance map of the dead window shows the drifting arrows and the ship's halo bright,
and **nothing at all at the three button positions.**

### [M] Control 2 — the page was never hidden
Safari's bottom chrome bar sampled at 4fps across all 1,158 frames: brightness min 241.3, max 247.9,
std 3.28, **zero frames more than 4sd dark**. No Control Center pull, no app switch, no lock, in the
whole 289 seconds — while five prompts died.

### [O] Other things sighted (not measured)
At 2:00 and 4:23 a "tap to sail" prompt appeared with its squares lit and vanished with no ship
movement. May simply be a back-tap; recorded so it is not lost.

## 2026-08-24 — the isolated WebKit mechanism test (build: instruments only)

Real headless **WebKit 26.5** (Playwright webkit-2336, macOS arm64 — a far newer engine than the
WebKitGTK 2.52 used earlier). A page carrying the game's own literal `pp4Grow` keyframes, twelve
birth conditions, painted width sampled every animation frame for 3.3s, plus `getAnimations()`
playState / startTime / clock advance (docs/DRIVING-THE-GAME.md §7).

**Red-proof: the plain control SWINGS (70→80.5px, ratio 1.15). The instrument can see a swell.**

| Case | ratio | Verdict |
|---|---|---|
| A control, visible from birth | 1.15 | SWINGS |
| B born `visibility:hidden`, revealed at 900ms | 1.15 | SWINGS |
| C born hidden inside an ancestor whose transform tweens per frame | 1.15 | SWINGS |
| D born visible inside a tweening ancestor | 1.15 | SWINGS |
| E born `display:none`, revealed at 900ms | 1.15 | SWINGS (startTime deferred to the reveal) |
| F born hidden inside a statically-transformed ancestor | 1.15 | SWINGS |
| G animation granted by a DESCENDANT selector whose ancestor class lands late | 1.15 | SWINGS |
| H petal reparented into the camera layer after creation | 1.15 | SWINGS |
| I `left`/`top` rewritten every frame for 900ms | 1.15 | SWINGS |
| J `display` toggled none/'' every frame through the hidden window | 1.15 | SWINGS |
| K `aria-disabled` toggled every frame through the hidden window | 1.15 | SWINGS |
| L control inside the same `#prompt.radial #ap` structure | 1.15 | SWINGS |

- [M] **NOT ONE isolated birth condition reproduces the freeze in WebKit 26.5.** Hidden birth,
  `display:none` birth, a tweening camera ancestor, late-landing ancestor classes, reparenting,
  per-frame position writes and per-frame attribute churn all leave the animation running with a
  monotonic clock (+301ms over a 300ms wait, every case).
- Consequence: the freeze is **not** a generic WebKit fragility that a small page can provoke. It
  needs either the real game's full context, or an iOS-Safari-specific engine difference.

## Pending ingestion

- ~~His 5-minute phone recording~~ — **INGESTED** 2026-08-24 (build 24f section above).
- The FULL-GAME WebKit reproduction: drive a solo voyage in headless WebKit and read
  `getAnimations()` off a real turn-menu petal. The isolated page came up dry, so this is the
  next instrument. Not yet run.
- His Control-Center experiment result (see HYPOTHESES.md, "His device").
