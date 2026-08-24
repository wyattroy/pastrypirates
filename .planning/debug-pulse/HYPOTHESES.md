# The pulse bug — HYPOTHESIS LEDGER

**The rule of this file (Wyatt's charter, 2026-08-24): every theory gets a kill-criterion BEFORE
its experiment runs. Killed theories never come back. No fix may be proposed from a theory still
marked OPEN. Claims are labelled measured / observed-once / inferred.**

**The symptom, stated precisely:** action-prompt buttons that should carry the swell are sometimes
completely static — same build, same session, no reload — on iPhone Safari (frame-measured), and
reported on desktop Safari and Chrome. When the swell runs, it is correct (his confirmation:
"I can see the swelling when it is being correctly triggered; the problem is that it is sometimes
not triggered at all").

## OPEN

| # | Hypothesis | Prediction | Kill criterion | Status |
|---|---|---|---|---|
| H1 | **Stuck animation clock**: Safari suspends the page's CSS-animation timeline on a hide (Control Center, app switch, lock) and sometimes fails to resume it; while stuck, even NEWLY created animations are frozen; a later hide/show unsticks it. | Deaths cluster after visibility events; whole-page (all prompts dead together); revives page-wide at a later visibility event. | Beacon shows a frozen probe-animation clock with NO preceding visibility event; or clock never freezes across many hide/show cycles on his phone. | OPEN — best fit for the 4-clip dead/dead/alive/alive split on one un-reloaded page |
| H2 | **The screen recorder is the perturbing event** (ReplayKit takeover, not visibility per se). | Deaths only ever occur in recorded sessions. | One frozen-pulse observation on the phone with no recording running (beacon log suffices). | OPEN |
| H3 | **Birth-at-the-boundary**: animations created in the same instant as a visibility flip start life suspended even when the clock otherwise recovers. | Dead prompts are specifically those that appeared during/just after a hide; the next naturally-born prompt is alive. | Beacon shows a prompt born >2s away from any visibility event with frozen buttons. | OPEN |
| H4 | **Tick-loop death** (stage.js): one uncaught exception kills the per-frame loop; the watchdog cannot revive it (S.raf holds a stale truthy id — verified by code read, `tick()`/watchdog, stage.js ~2989/3024). Prompts after a death render without the fan costume. | Dead prompts are card-styled rows, camera frozen, permanent until reload. | The four iPhone clips show correctly-fanned CIRCLES while dead → tick was alive for those. KILLED **for the recorded clips**; stays OPEN as a latent fragility for other reports (desktop?). | OPEN (latent) |

## KILLED — do not resurrect

| Theory | Killed by |
|---|---|
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
