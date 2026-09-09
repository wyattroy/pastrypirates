# CEO reviews — newest at the TOP, append-only

**Never edit an old verdict.** A review that turned out wrong is evidence about the reviewer and
belongs on the record exactly as it was written. Each CEO is handed the previous verdict so it can
say whether a fault is *recurring* — which is the check this file exists to make possible.

---

## 2026-09-08 · `a6c2894b`..`2d676cd1` · six commits · **MIXED — one named bug NOT DONE**

**Reviewed:** his three named bugs (coin vanishing, the bot-attack blocker, the desktop recipe
picker), his twelve playtest-artifact notes, the updated artifact, and "do it" on converging the
drain.

**Its one sentence for Wyatt, verbatim:**

> **Nine of your twelve notes are genuinely done and the blocker's mechanism is correctly found —
> but the desktop recipe picker you filed as bug 3 looks pixel-for-pixel the same as before the fix
> in their own screenshots, the tablet picker cuts your captains box in half instead of covering
> it, and the updated playtest artifact you asked for was never made.**

**Verdicts**

| ask | verdict |
|---|---|
| bug 1 — coin vanishes before the stage | DONE |
| bug 2 — BLOCKER, bot attack | DONE, but never played in a real crew game |
| bug 3 — desktop picker | **NOT DONE** |
| s3 · s4 · s7 · t1 · t2 · t3 · t5 · r3 · r4 | DONE (s7 ungated) |
| s8 Safari | PARTIAL — honestly labelled as a hypothesis |
| r7 cover the captains box | **PARTIAL — the tablet half fails outright** |
| q29 show option 2 | UNVERIFIABLE — "option 2" exists nowhere in the repo |
| the updated playtest artifact | **NOT PRODUCED** *(see CTO note below)* |
| "do it" — the convergence | DONE in substance; the GATE that claims to hold it does not |

**Findings that stand, in its words**

- **bug 3:** the 44px lift is clamped by `topBandPx()` (`stage.js:3269`) and on desktop the captains
  column starts right under the ribbon, so the whole lift is absorbed. *"And a vertical lift cannot
  overlap the board on desktop anyway — the board is to the left, not below."*
- **r7 tablet:** the sheet is a centred column that bisects the captains box, all four names legible
  either side. Cause: `#actionPanel` is still capped at the board's width by a shared classic rule
  (`index.html:2088-2094`) — a rule the repo had already parked as *"a taste call Wyatt has not
  made."* **His r7 IS that ruling, and the parked question was never unparked.**
- **the centring (unasked-for):** blank cream below the card went 145px → 190px and a new ~127px
  band appeared above; ~44% of the sheet is empty. It also sets `justify-content:center` on the
  element that already carries `overflow-y:auto` (`index.html:2331`), so on a short screen the
  title can scroll out of reach and cannot be scrolled back to.
- **the new gate has two holes:** it reads only `flow.js` and `orchestrator.js` (2 of ~11 files), so
  a ride added to `board.js` passes; and one alias (`const _ride = animateSailRoute`) defeats its
  literal regex. The red-proof exercised one shape only.
- **`await liveRender()` widens a pre-existing deadlock hazard** — it now awaits *every* unconsumed
  event, and `localAsk`'s resolver fires only from a tap. Also `panel.js:164` dereferences
  `appState.game` **before** the guard at `:165`, so it can throw synchronously and return no
  promise.
- **`setFlipCoin`'s new guard sits ABOVE `stopFlipSpinSound()`** (`board.js:2397` vs `:2409`), so a
  deferred blanking skips the one line written to stop the spin sound outliving the picture. No live
  path found — a weakened invariant, not a measured bug.
- **stale facts now written into the source:** `docs/AUDIO.md:210` still says the music gap is 60
  (it is 180) and warns against restoring 120; "~57 call sites" is really **48** and that wrong
  number is now in `panel.js:156`, `panel.js:173` and `flow.js:1181`; `panel.js:173` still says
  liveRender "stays synchronous"; nine awaited sites, not eight.
- **`.pp4RcSwap` has no `:focus` rule at all**, so "keep it on the button" is satisfied by the front
  card's ring, not the circle's — keyboard focus on the swap button is invisible.
- **the coin-flip ruling (H):** *"I read it and I agree with the CTO"* — `DECISIONS.md:518-522` is
  scoped word for word to the flip's SOUND. **No conflict.**
- **(I) confirmed:** nothing was written to `.claude/memory/`, `docs/` or `.planning/` except six
  PNGs, so his four rulings and all twelve notes *"exist nowhere but this conversation."*
- **the sail-length retraction is CORRECT** (`storyboard.js:161`). *"The CTO was right to retract,
  and Wyatt was right to push."*
- **§5 (delegation):** *"I cannot answer this one honestly"* — no access to the CTO's thread. Not
  checked, no evidence found.

**Where the CTO disputes it, on the record:** the updated playtest artifact **was** produced and
published (same URL, twice). The CEO is repo-read-only and an Artifact is not a repo file, so it
could not see it — a scope limit of the review, not a miss in the work. Everything else above is
accepted.

**No previous verdict existed.** This file did not exist before today, so the recurrence check
could not run — the CEO named that as a finding about the process, and it is.
