# The pulse bug — HYPOTHESIS LEDGER

> # ✅ SOLVED — 2026-08-25, confirmed green by Wyatt on his own iPhone (build 2026-08-25a).
>
> **The animation was never CREATED.** Not frozen — absent. His beacon log on iOS 18.7 /
> AppleWebKit 605.1.15 showed a button whose stylesheet grants `pp4Grow`, whose computed
> play-state reads `running`, and whose `getAnimations()` returns nothing.
>
> **Cause:** `#actionPanel.pendingReveal` holds the buttons at `visibility:hidden` until the
> typewriter AND `stageSettled()` (the camera tween + the ship's glide) both resolve. Sail, and
> the button is declared-but-not-drawn for up to 1400ms; that WebKit never starts the animation
> once the element finally paints. Stay put, and the wait is zero and it breathes.
>
> **Fix:** every attention rule now says `#actionPanel:not(.pendingReveal)` — the animation is
> granted at REVEAL, never at build. **This is a STOPGAP.** His ruling is that nothing should be
> laid out until the camera anchors; when that lands, the `:not(.pendingReveal)` goes with the
> early-build path.
>
> **What found it, in order:** his 5-minute recording (the freeze is one prompt, the turn menu) →
> his own controlled comparison, *"if i stay put instead of sail, the pass/trade buttons DO
> swell"* → the beacon log on his device. **Three drivable engines were all innocent and none of
> that was evidence** — the faulty engine exists only on his phone.
>
> Everything below is the record of how it was narrowed, kept as written.

**The rule of this file (Wyatt's charter, 2026-08-24): every theory gets a kill-criterion BEFORE
its experiment runs. Killed theories never come back. No fix may be proposed from a theory still
marked OPEN. Claims are labelled measured / observed-once / inferred.**

**The symptom, stated precisely (sharpened 2026-08-24 by the 5-minute recording):** action-prompt
buttons that should carry the swell are sometimes completely static — same build, same session, no
reload, no hide — on iPhone Safari (frame-measured), and reported on desktop Safari and Chrome.
When the swell runs, it is correct (his confirmation: "I can see the swelling when it is being
correctly triggered; the problem is that it is sometimes not triggered at all").

**What the 5-minute recording adds, and it narrows the search enormously:** the freeze is BORN WITH
A PROMPT and dies with it — a dead menu is followed 4 seconds later by a fully alive trade fan on
the same un-reloaded page — and it is ALWAYS THE SAME PROMPT: the "Wyargh, what'll ye do:" turn
menu, 5 of its 7 appearances, against 0 of the other 14 prompts measured. This is not an episode
that sweeps the page. It is one prompt being built wrong.

## OPEN

**Everything below is reasoning about ONE fact, established 2026-08-24 by the 5-minute recording
(EVIDENCE.md): the freeze is BORN WITH A PROMPT, it is always the same prompt — the
"Wyargh, what'll ye do:" TURN MENU (5 of its 7 appearances; 0 of the other 14 prompts) — and the
page around it is entirely healthy while it is frozen.**

| # | Hypothesis | Prediction | Kill criterion | Status |
|---|---|---|---|---|
| H2 | **The screen recorder is the perturbing event** (ReplayKit takeover). | Deaths only ever occur in recorded sessions. | One frozen-pulse observation on the phone with no recording running (beacon log suffices). | OPEN but WEAKENED — the recorder ran for all 289s of the 5-minute clip and 16 prompts pulsed perfectly, so recording cannot be SUFFICIENT. |
| H4 | **Tick-loop death** (stage.js): one uncaught exception kills the per-frame loop; the watchdog cannot revive it (`S.raf` holds a stale truthy id, stage.js ~2989/3024). | Dead prompts render without the fan costume; camera frozen; permanent until reload. | Dead prompts drawn as correctly-fanned CIRCLES over a live board. | OPEN (latent only) — killed again by the 5-minute clip: dead petals are correctly fanned circles and the board around them animates. Stays on the hardening list. |
| H5 | **Born behind the settle gate.** `#actionPanel.pendingReveal` holds radial petals at `visibility:hidden !important` until `Promise.all([revealDone, settledP])`, and `settledP` is `stageSettled()` — *"waits on the camera tween and the ship's rendered transform"* (panel.js ~675). The turn menu is the one prompt reliably built while the boat is still arriving. | Exactly the prompts born during board motion die; prompts built on a still board live. | An isolated WebKit page where a petal born `visibility:hidden` and revealed later fails to swell. | **KILLED as a standalone mechanism** — see the isolated test in EVIDENCE.md: case B swings at full 1.15. Survives ONLY as "the gate plus something else the isolated page lacks". |
| H6 | **Camera-layer compositing.** The petals are `position:fixed` inside an ancestor carrying a live `transform` during the director's glide; WebKit discards an animation started in a layer being transformed. | Same deaths; a petal outside a moving layer pulses fine. | An isolated WebKit page where a tweening transformed ancestor makes no difference. | **KILLED as a standalone mechanism** — cases C, D, F all swing at 1.15. |
| H7 | **Hidden birth alone**, regardless of the camera. | ALL radial prompts should die. | Any radial prompt measured alive. | **KILLED** — 16 of 21 prompts alive in one recording, and case B swings in WebKit. |
| H8 | **Something in the turn menu's own build path, not the reveal gate.** The turn menu is the only prompt assembled from the engine's own turn-open sequence (digest ⏩ → sail prompt → menu) rather than from a player tap. Whatever it is, it is invisible to a 12-case isolated page — the freeze needs the real game. | The full-game WebKit run reproduces flat turn menus while its trade fans pulse. | The full-game WebKit run shows every prompt pulsing — which would push the whole bug back onto iOS-Safari-specific engine behaviour and make his device the only instrument. | **WEAKENED, 2026-08-25.** Tested: 12 turn menus across two full solo voyages in headless WebKit 26.5 at 390x844 touch, driven by the real `lib/player.mjs`. All 69 enabled buttons swelled at 1.15. Not reproduced — but a headless engine is not his phone, so this narrows rather than clears. |
| H9 | **iOS Safari differs from every WebKit we can drive.** Playwright's WebKit 26.5 and WebKitGTK 2.52 both behave correctly; his iPhone does not. | No headless engine will ever reproduce it. | Any headless reproduction at all. | **NOW THE FRONT-RUNNER, 2026-08-25.** Three engines have now failed to reproduce it — WebKitGTK 2.52, WebKit 26.5 isolated (12 birth conditions), and WebKit 26.5 in the real game (12 turn menus). His device is the only instrument left, and the beacon exists for it. |

## KILLED — do not resurrect

| Theory | Killed by |
|---|---|
| **H1 — stuck animation clock** (the long-standing front-runner) | **The 5-minute recording, 2026-08-24.** During BOTH measured dead windows the board's `.rimFlow` current arrows run at full amplitude on a clean 2.53–2.60s period — `rimDrift 2.6s linear infinite`, a plain CSS animation on the same page, in the same frames where the buttons are flat to within 8px of area. The page's animation timeline is not stuck; only the buttons are out. |
| **H3 — birth at a visibility boundary** | **The 5-minute recording, 2026-08-24.** Safari's chrome bar is present and identically bright in all 1,158 sampled frames across 289 continuous seconds (status clock 6:49→6:54 unbroken). There was NO hide, app switch or lock in the whole recording, and five prompts died anyway. |
| Hidden birth / tweening-camera ancestor / late ancestor class / reparenting / per-frame position or attribute churn, as STANDALONE WebKit mechanisms | **The isolated WebKit 26.5 test, 2026-08-24** (EVIDENCE.md). Twelve birth conditions carrying the game's own `pp4Grow` keyframes; all twelve swing at ratio 1.15 with a monotonic animation clock. Red-proofed: the plain control swings. |
| macOS/iOS Reduce Motion | His check: setting is OFF (2026-08-24). |
| Greyed-circle perception | His ruling: "these look fine, they are not the problem." Banned. |
| Card/slider rows' gentle swell | His ruling: "this is not the problem." |
| Swell amplitude too small on phone | His confirmation: swell clearly visible when triggered. |
| Cache-mixed builds as THE mid-session mechanism | His testimony: no reload, no leaving Safari, and dead→alive flipped mid-page — a constant stylesheet cannot swap itself. (Version-locking modules to the page stays queued as delivery HARDENING, not as this bug's fix.) |
| The ⏩ skip button as direct mechanism | Code trace: `appState.ff` only shortens sleeps (flow.js:80, util.js:1333), touches no animation, self-clears at next prompt (flow.js:98). Chip presence also fails to split dead/alive clips. |
| Hover-parked cursor pausing petals | Measured (CDP real cursor): the pause rule is inert — higher-specificity animation shorthand overrides it; petal kept running under the cursor. (The dead rule should be deleted for honesty — hardening list.) |
| Animation restarts from panel rebuilds | Measured: 6 fans, clocks advance monotonically, 0 restarts. |
| Radial/card regime flapping mid-prompt | Measured: boxCls stable across each fan. |
| var()-in-keyframes as a still-live mechanism in the CURRENT build | Fixed in 24e (literal keyframes); 6/6 fans swing 9.9px in Chromium; alive clips 3–4 swing at full 1.15 on the phone. **HONEST DOWNGRADE (2026-08-24, WebKit runner):** WebKitGTK 2.52 resolves var()-in-keyframes correctly (red-proof: both var and literal pages swing 10.5px) — so the var mechanism is UNCONFIRMED as the cause of the 24d flat video; his iOS/desktop Safari version may differ, or that video was itself an early stuck-clock (H1) episode, which would unify the whole history under one bug. The literal-keyframes change stays as sound hardening either way. |
| Soft/strong specificity fight | Fixed 24e (mutually exclusive selectors), measured. |
| Enabled buttons secretly aria-disabled | Measured: 13/13 enabled buttons pp4Grow/running. |
| Service worker staleness | No service worker exists in the repo. |
| Sampling/refresh-rate illusion in the videos | Area measurement flat to ±0.2% — a real swell cannot hide from area at any sampling rate. |
| Programmatic animation pause in game code | Grep: no getAnimations/pause/play-state writes anywhere in 4/src (storm rain's own CSS aside). |

## The instruments

- **The beacon** (`?debug=pulse`, 4/src/ui/pulsebeacon.js): timestamps every prompt build, class
  transitions, visibility events, per-button LIVE/FROZEN verdicts, and a page-timeline liveness
  probe (a reference animation sampled every 2s — if ITS clock stops while visible, H1 is caught
  red-handed with a timestamp). Copyable log for pasting into a session.
- **The WebKit runner** (Playwright WebKit, 4/scripts/wk_probe.mjs): the Safari-engine half of the
  rig. Red-proofed against the known 24d var()-in-keyframes bug before being trusted.
- **The Chromium rig** (4/scripts/mp_rig.mjs): unchanged.
- **His device**: the scarce instrument. One scripted 30-second experiment at a time; the current
  one: get a fan pulsing → pull Control Center down/up (or lock/unlock) repeatedly → note whether
  it freezes, and whether a frozen fan revives when the NEXT prompt arrives (stuck-clock predicts
  page-wide revival possible; frozen-element predicts never).
