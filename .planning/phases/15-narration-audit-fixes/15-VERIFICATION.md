---
phase: 15-narration-audit-fixes
verified: 2026-07-30T22:26:27Z
status: human_needed
score: 19/19 must-haves verified
behavior_unverified: 0
overrides_applied: 0
re_verification:
  previous_status: gaps_found
  previous_score: 14/19
  previous_verified: 2026-07-29T19:19:18Z
  verified_at_commit: aec5e57
  gaps_closed:
    - "G1 — D-29 ye/yer conversion across ALL player-facing text (14 sites converted; 5 remaining reclassified as out-of-character chrome by Wyatt's own F1/G16 rulings, each individually anchored and freshness-checked)"
    - "G2 — D-17 fmtItem() renders ingredients with custom art (ING_IMG branch added; confirmed visually in the recorded playtest)"
    - "G3 — D-54 Wyatt's approved second-party addressed lines applied (battle spoils restructured to his wording; 'on it!' restored)"
    - "G4 — the narration extraction/coverage self-check runs green AND is now inside npm test (gates 16→17), so this class of drift can no longer escape CI"
    - "G5 — D-52 the ⚪️ icon and the dropped word 'firing' re-applied to the battle round-result lines"
  regressions: []
  notes: >-
    Far more landed than gap closure. Five quick tasks (phase15-verification-gaps,
    narration-audit-tool-hardening, playtest-bug-fixes, playtest-notes-fixes,
    playtest-session2-fixes) plus two loose follow-ups (G27, G28) shipped between the
    stale report and this one, driven by two recorded live playtests. The narration audit
    page — which was DEAD at the time of the previous report's commit, rendering 61 of 212
    cards while npm test reported all green — now executes headless inside npm test and
    renders 226 cards across 19 moments with 0 unrendered builder texts.
human_verification:
  - test: >-
      DECISION, not a test. Decide whether to accept sampled copy fidelity or build the
      audit tool's Task 5 (the render-based shipped-vs-approved gate). F4's own measurement
      hand-verified 19 of 144 reviewed approval fields; of the remaining 125, 84 have every
      distinctive fragment present but word ORDER and line IDENTITY were never checked, and
      41 are too placeholder-heavy to judge mechanically.
    expected: >-
      Either (a) Wyatt accepts that the copy is broadly-applied-and-live-playtested rather
      than exhaustively proven, and Task 5 moves to Phase 16/backlog; or (b) Task 5 is built
      before merge. Nothing is known to be wrong — this is unmeasured area, not a defect.
    why_human: >-
      The tool that would settle it does not exist. This is the exact mechanism whose absence
      let four approved rewrites ship missing in the first place (F4), so the residual is
      named rather than waved through.
  - test: >-
      Two of the four D-41 greyed dead-ends have never been seen on screen: "— coins only —"
      (needs a 0-coin purse inside the trade flow) and the hail "Counter-offer" (needs a bot
      that cannot afford a raise).
    expected: >-
      Each renders greyed and un-clickable with its own reason beneath the buttons —
      "Ye don't have any coin to offer — pick a crate instead." and "{bot} can't afford to go
      any higher." The other two (Attack, Trade) and the fifth (storm anchor at 0 coins, G10)
      were all confirmed live.
    why_human: >-
      Both need a game state the bots kept closing during both recorded sessions. The
      co-reachability gate (ui_contract_check assertion 6, red-proofed against the REAL
      broken ab98e04 code) proves a reason is reachable in the state it explains, but no
      harness renders these two.
  - test: >-
      Confirm the G28 narration pacing still reads right after a full night away from it —
      the curve was retuned live, mid-session, against a measured table.
    expected: >-
      Hold 500ms base + 20ms/char + 300ms/pause, clamped 800-2000ms LAST, then an 800ms fade.
      Long lines lose up to 2.4s of total screen time versus the pre-retune curve; short lines
      hold steady. He judged this correct in the browser on 2026-07-30.
    why_human: "Pacing is a taste call no gate can answer. Already cleared once; re-confirm only if it still feels off."
known_open:
  - item: "Audit tool Tasks 5, 6, 7 — no shipped-vs-approved copy comparison, no applier, no permanent scope rule"
    status: deliberate
    detail: >-
      Verified genuinely absent: no script in scripts/ compares source text against
      15-COPY-APPROVED.md or the approval fields of 15-DISPOSITIONS-FINAL.json. The two
      files that reference the dispositions do so for ACCOUNTING (assertion 8, all 209 rows
      carried across) and for hand-pinned literals in comments — not for text comparison.
      src/ui/board.js copy is now in the inventory (6 sites) but has never been compared.
      THE PHASE'S MOST SIGNIFICANT RESIDUAL.
  - item: "D-57 residue — narration rendering still has two independent paths on one .apMsg element"
    status: recorded, unenforced
    detail: >-
      .planning/todos/pending/narration-two-schedulers-unenforced.md. NOTE: that file and
      .continue-here.md both describe showNarration() as a hold+fade scheduler. That is no
      longer accurate after G17/F6 — showNarration() is now two lines with NO timer at all
      (src/ui/panel.js:457-459); the outgoing line fades only when one replaces it, inside
      panel(). The underlying concern (two code paths render narration, nothing asserts they
      agree) survives; the description does not. See warning W2.
  - item: "STORM-02 — guest storm-push parity"
    status: backlogged
    detail: "Explicitly NOT solved by G14's rim sweep; docs/DETERMINISM-RERECORD-NEXT.md §9 warns against treating it as such."
  - item: "Queued gated re-record batch"
    status: queued
    detail: >-
      docs/DETERMINISM-RERECORD-NEXT.md — engine purity (spoil/gave become data, drop
      ilabelImg from the engine, delete the dead raider branch), bot intelligence, STORM-02.
      ONE gated --capture pass, not three. The trade-wind animation is explicitly NO LONGER
      in this batch (G14 shipped free of an engine change).
  - item: "Two approved battle ADDRESSED variants (misc:battleLine orchestrator.js:482/:486)"
    status: resolved by Wyatt's own merge instruction
    detail: >-
      F4 flagged these as unapplied and recommended defer. Superseded: Wyatt approved
      retiring both on 2026-07-30 (commit 44261c8) as tag:"merge" twins that existed only
      because the code branched on WHO rather than WHAT. Each pair now renders one line
      naming whoever it applies to (orchestrator.js:532, :541). Not an outstanding item.
  - item: "Phase 16 scope — UI-01…07, META, KOFI"
    status: out of scope
    detail: "UI-06 (lobby name doubling) and D-55 (sail-highlight parity) landed early via F1/F2 and G25."
warnings:
  - id: W1
    file: "src/ui/panel.js:242-247"
    detail: >-
      Doc drift. The comment on GHOST_FADE_MS states "It stays 180ms" and points a future
      editor at "the `.18s` in index.html's `.apMsg.fadeOut` rule". Both numbers are 800/.8s
      as of G28 (panel.js:241 = 800; index.html:289 = .8s). Code and CSS agree; the comment
      instructing the reader to keep them in sync names the wrong value. Additionally NOTHING
      GATES the sync — grep for GHOST_FADE_MS across scripts/ returns zero hits; only the CSS
      side is pinned (narration_test.js:955).
    severity: warning
  - id: W2
    file: ".planning/todos/pending/narration-two-schedulers-unenforced.md, .continue-here.md:88-89"
    detail: >-
      Stale descriptions of already-changed code. The todo describes showNarration() as one of
      "two independent hold-and-fade schedulers"; it no longer holds or fades. .continue-here.md
      records D-55 as "never fixed" and D-35 as "nothing asserts it" — both are now fixed and
      gated (G25/G26, host_guest_parity_check.js). A reader picking up the todo would work from
      a wrong model of the code.
    severity: warning
  - id: W3
    file: "src/ui/flow.js"
    detail: >-
      Pre-existing cosmetic, ruled and left: `🎣 Fish (+1-2🌕)` uses an ASCII hyphen as a RANGE
      separator beside U+2212 minuses everywhere else. Outside D-38's rule by construction (F8).
    severity: info
---

# Phase 15: Narration Audit & Fixes — Verification Report

**Phase Goal:** Narration reads naturally and consistently — repetitions are pruned per Wyatt's review, the local player is addressed directly, and the specific broken/missing lines are corrected.
**Verified:** 2026-07-30T22:26:27Z, at `aec5e57`
**Status:** human_needed — 19/19 must-haves verified; three items await Wyatt's eye or decision, **none of which blocks the merge**
**Re-verification:** Yes — replaces the 2026-07-29 `gaps_found` (14/19) verdict. All five gaps closed.

---

## What changed since the stale report

The previous verdict was accurate on 2026-07-29 and is now obsolete. Between then and `aec5e57`:

| Wave | What it was | Effect here |
|---|---|---|
| `20260729-phase15-verification-gaps` | Closed all five gaps | G1-G5 below |
| `20260729-narration-audit-tool-hardening` | The audit page was **dead** at the previous report's commit — 61 of 212 cards, 128 texts unrendered, while `npm test` reported all green | Page now executes **headless inside `npm test`**; 226 cards, 0 unrendered |
| `20260729-playtest-bug-fixes` + `20260730-playtest-notes-fixes` | F1-F12, G1-G9 from two live playtests | Register exceptions, coin-debit safety, copy corrections |
| `20260730-playtest-session2-fixes` | G10-G26, 13 tasks | Greyed anchor, rim-sweep animation, paint-before-narrate, seeded rain, sail-highlight parity, parity gate |
| `6356db9`, `aec5e57` | G27 turn-order coin; G28 the hold/fade retune | NARR-06's final shape |

64 files, +34,991 / −370 across the phase.

---

## Goal Achievement

### The governing constraint — checked first, and checked for vacuity

| Check | Command | Result |
|---|---|---|
| Engine untouched since `9ddd214` | `git diff --stat 9ddd214..HEAD -- src/engine/` | **empty** |
| Engine untouched across the **whole phase** | `git diff --stat de30047..HEAD -- src/engine/` | **empty** |
| …and that check can actually fail | same command over an older range containing a real engine commit | `1 file changed, 17 insertions(+), 4 deletions(-)` — the path is live, not a typo silently matching nothing |
| Determinism corpus | `node scripts/determinism_baseline.js --verify` | **31/31 seeds PASS** |
| Full gate suite | `npm test` | **exit 0**, 17 gate scripts |

This is why none of the last four days needed a determinism re-record. The invariant held byte-for-byte.

> Correction to the brief's framing: `npm test` chains **17** scripts, not 21. The audit page's own check reports **23/23 assertion groups**, which is likely the source of the 21.

### The five gaps — all closed, verified independently of any SUMMARY

| # | Previous gap | Now | Evidence read in the codebase |
|---|---|---|---|
| G1 | **D-29** — 14 player-facing strings still read "you"/"your" | ✅ **CLOSED** | All 14 converted. Spot-verified at `orchestrator.js:509,602,612,717,1075,1257`, `flow.js:491,922,995`, `panel.js:167`. Five "you" occurrences remain and are **Wyatt's own rulings**, not misses: three `kind:"label"` (lobby seat suffix, player-row tooltip, name placeholder — F1: *"`Wyatt — ye` reads 'Wyatt — thou'"*), two `kind:"notice"` (privacy notice, credits — G16: *"the whole thing is written in normal english not pirate"*). `src/ui/recipe.js`'s cookbook prose is file-scoped out. **The one-time sweep is now a standing gate** (`ui_contract_check.js` assertion 5) with per-file content anchors and a staleness check that FAILS on an anchor matching nothing — "an exclusion that excuses nothing is cover, not an exclusion." |
| G2 | **D-17** — `fmtItem()` still emitted raw system emoji | ✅ **CLOSED** | `src/ui/util.js:247` now reads `ING_IMG[x]?ilabelImg(x):(ING_EMOJI[x]||"")+" "+iname(x)`. Confirmed **visually in the recorded playtest**: *"`sugar.png` rendered inside both the flip prompt and the dock narration; no raw system-emoji ingredient appeared."* |
| G3 | **D-54** — only 1 of 11 approved addressed lines applied | ✅ **CLOSED** | Battle spoils restructured to his wording (`util.js:629-632`: `⚔️ {winner} wins {a}–{d} and takes yer {spoil}` / `— ye bribe yer way out of givin' away a crate with {n}🌕.` / `— ye give up all ye have: …`). The dropped `on it!` restored at `flow.js:1397`, with the D-54/D-25 provenance in a comment directly above it. |
| G4 | **The coverage self-check exits 1; the inventory is stale** | ✅ **CLOSED, and structurally** | `extract_narration_lines.js` runs green and **is now inside `npm test`** (gates 16→17), alongside `narration_audit_check.js`. It writes `art-review/narration-inventory.json` on every run. The previous report's own recommendation — "consider adding the extractor to `npm test` … so this class of drift is caught by CI" — was taken. |
| G5 | **D-52** — two battle lines dropped the ⚪️ Wyatt typed | ✅ **CLOSED** | `orchestrator.js:532` — `Both fire ⚪️ HEADS — but ${dwName}'s **firing** downwind and the shot hits!` (icon **and** the dropped word restored); `:534` — `Both fire ⚪️ HEADS — but in the crosswind…`. |

### Observable truths

Carried forward from the previous report, with status updated. Truths 1-18 keep their original numbering so the two documents can be read against each other.

| # | Truth | Source | Status | Evidence |
|---|---|---|---|---|
| 1 | Full narration-branch audit delivered; pruning applied only after Wyatt's review | SC1 / NARR-01 | ✓ VERIFIED | 209 reviewed dispositions; 203 carried across, **6 retired against his own written merge instruction and explicitly approved 2026-07-30** (`44261c8`). The G4 caveat that qualified this last time is gone. See the residual note below on copy-fidelity *coverage*. |
| 2 | The "broke" line is restored; the storm intro names only the first leg | SC2 / NARR-02+03 | ✓ VERIFIED | Gate-asserted since 15-02 — and **first live sighting** on 2026-07-30: `Claude — ye can't afford to anchor. Flip and take yer chances.` Both halves of NARR-02 now confirmed in play. |
| 3 | The bribe line is context-smart | SC3 / NARR-04 | ✓ VERIFIED | `util.js` bribe / cleaned-out split, now in Wyatt's approved one-sentence shape (G3). |
| 4 | Narration addresses the local player in 2nd person | SC4 / NARR-05 | ✓ VERIFIED | Confirmed live both directions in the same round: `Now the storm blows **Wyatt** west!` (spectator) vs `Now the storm blows **ye** west!` (actor) — a line that used to hardcode "you" for everyone. |
| 5 | **Non-prompt narration holds ~10% less time on screen** | SC5 / **NARR-06 as reworded 2026-07-30** | ✓ **VERIFIED** (was ⚠️ PRESENT_BEHAVIOR_UNVERIFIED) | See the dedicated section below. Measured on a guest seat with a MutationObserver, then retuned live by Wyatt and re-confirmed. |
| 6 | **Governing constraint** — the engine event stream is untouched | 15-CONTEXT §domain | ✓ VERIFIED | Empty diff, 31/31 seeds, non-vacuity proven. |
| 7 | Guest narration path holds/fades and never blocks | brief / D-57-58 | ✓ **VERIFIED** (was ⚠️) | Measured live: every line carried `apMsg fadeOut` after a length-proportional hold; `fades: 1` on every line — the previous report's double-fade risk found no evidence. Architecture has since simplified further (see below). |
| 8 | D-35 — one shared sail-prompt line, host and guest | brief | ✓ VERIFIED | Confirmed live on the guest: `Claude: click any yellow square to sail there (−1🌕)` — the host-authored text, not the old hardcoded guest string. Now also **gated** (`host_guest_parity_check.js` assertion 1). |
| 9 | D-41 — options grey out with a reason; no dead ends | brief | ✓ VERIFIED | Extended to a **sixth** site this week (G10, the storm anchor at 0 coins: `disabled:broke` + *"Yer too broke to anchor"*, plus the prompt text no longer offers the branch). F11's shadowed-reason bug found and fixed: reasons now collect into a list. Gated by assertion 6 (co-reachability), red-proofed **against the real broken `ab98e04` code**. Two of six states never eyeballed — human item 2. |
| 10 | D-23 — bot and human narration hold the same duration | brief | ✓ VERIFIED | Measured live on the same event type two turns apart: bot 2990ms vs human 2810ms, within 6%, residual fully explained by name length. Under the old split the bot line would have shown ~38% shorter. |
| 11 | D-19 — parley emitted only when `!dealt`; "Parley" unreadable | brief | ✓ VERIFIED | Confirmed live: action menu reads `🤝 Trade`. |
| 12 | D-29 — ye/yer across all player-facing text | brief | ✓ **VERIFIED** (was ✗ FAILED) | G1 above. Confirmed live: `Claude, what'll ye do:`, `Claude, choose yer recipe`, `Cast yer line — flip!`, `Land's blockin' Wyatt's wind`. |
| 13 | D-17 — `fmtItem()` renders custom art | brief | ✓ **VERIFIED** (was ✗ FAILED) | G2 above, confirmed visually. |
| 14 | D-37 — wind always "blows" | brief | ✓ VERIFIED | Confirmed live: *"Flaky Jack is blown into the trade winds and swept around the rim!"* |
| 15 | D-38 — parenthesised amounts signed | brief | ✓ VERIFIED | Held. G27 extended it: the turn-order consolation now reads `(+1🌕)`, not a bare `(+1)`. |
| 16 | D-53 — no `--`; every `–` between digits | brief | ✓ VERIFIED | Held; G13's rewrite kept it. |
| 17 | D-59 — the storm flip button shows the real coin loss | brief | ✓ VERIFIED | Refined by **G13** on Wyatt's word (*"the two coin emojis next to each other are confusing"*) → `lose half yer treasure (−N🌕)`. |
| 18 | D-16 — the shipped icon inventory is a superset | brief | ✓ **VERIFIED** (warning removed) | The two ⚪️ that were missing are back (G5). |
| 19 | D-54 — Wyatt's approved second-party addressed lines applied | brief | ✓ **VERIFIED** (was ✗ FAILED) | G3 above; and the two battle lines F4 later flagged were **retired by his own approved merge instruction**, not left unapplied. |

**Score: 19/19 truths verified.** Zero behavior-unverified. Both truths the previous report could not settle (5 and 7) were settled by measurement in a running game.

---

## NARR-06, verified against the **reworded** requirement

The requirement was reworded by Wyatt on 2026-07-30 and now reads:

> **NARR-06**: Non-prompt (blue-box) narration holds ~10% less time on screen before the next line comes in *(reworded 2026-07-30 at Wyatt's clarification — the criterion was always hold length, never fade)*

This is **not** the criterion the previous report verified, so it was re-derived from scratch.

**What shipped (G28, retuned live during the recorded playtest):**

```js
const HOLD_BASE_MS=500, HOLD_MS_PER_CHAR=20, HOLD_PAUSE_MS=300;
export const HOLD_FLOOR_MS=800, HOLD_CEILING_MS=2000;
export function msgHoldMs(text){ … return Math.round(Math.min(Math.max(raw,HOLD_FLOOR_MS),HOLD_CEILING_MS)); }
```

Three changes, and the second is a real bug fix the previous verification did not catch:

1. base 1000→500, per-char 50→20 — he watched long lines and said they *"hold too long"*.
2. **The clamp moved LAST.** It used to wrap `raw` and *then* multiply, so the 1200/7000 written in the source were bounds on an intermediate nobody ever saw; the real visible range was 864..5040ms. Wyatt spotted it himself: *"the clamp should happen last. right?"* It is now literally that.
3. `MSG_HOLD_MULTIPLIER` (0.72) **retired**, not stacked. Keeping it would have rendered his 2000 ceiling as 1440 — recreating the exact defect item 2 just fixed, one layer down.

**Does it satisfy "~10% less"?** Yes, and by a wide margin for anything but the shortest line. Worked example, 40-code-unit sample: old curve `clamp(1000+40·50+pauses,1200,7000)·0.72`; new curve `clamp(500+40·20+pauses·300, 800, 2000)` = **1300ms**, pinned as a literal in `narration_test.js:235`. The commented measured table for *total* time on screen (reveal + hold + fade): 25ch 2.5→2.6s, 80ch 5.6→4.4s, 120ch 7.6→5.2s, 160ch 8.4→6.0s. Short lines are ~flat because the **fade** grew to 800ms at his request (*"the point of it is to let the player know that the text is about to leave, so they can hurry up and read it"*); the hold itself fell everywhere.

**Verified from a guest seat**, which D-57 required and the previous report could not do — measured with a MutationObserver on `#actionPanel`:

| Line | Hold |
|---|---|
| `— Round 1: wind is blowin' west —` | 1911 ms |
| `Claude — ye flip ⚪ HEADS!` | 1585 ms |
| `Claude — ye haul aboard 🍬 a jar of Crystal Sugar!` | 2450 ms |
| `Land's blockin' Wyatt's wind — can't sail as far…` | 4249 ms |

(Timings predate the G28 retune; they establish that the guest path **holds and fades at all**, which before this phase it never did — the guest path was `panel(html)` and nothing else.)

**Test-pinned, not just present:** `narration_test.js` pins the literal 1300, the 2000 ceiling binding on a 200-char line, the 800 floor binding on a short pauseless line, `botMsgHoldMs` as a pure alias, `chatBubbleHoldMs` deliberately unchanged at 2400, the `.8s` CSS fade, the **absence** of `MSG_HOLD_MULTIPLIER`, and that the clamp is applied last.

**Human-eye verdict on file:** *"Narration fade + hold (G17/G28) — **PASS after retune**."*

---

## Adversarial checks — do the gates actually fail?

The brief warns that four vacuous assertions were caught this week. Every load-bearing gate in this verdict was tested for non-vacuity.

| Check | Method | Result |
|---|---|---|
| Engine-diff invariant | Ran the same command over a range containing a real engine commit | Reports `17 insertions(+), 4 deletions(-)` — **the path is live** |
| D-29 register gate | **Live mutation of real source**: `Cast yer line` → `Cast your line` in `src/ui/flow.js`, ran the gate, restored | `FAIL … D-29-REGISTER: src/ui/flow.js:995` — **genuinely fails**; `git status` clean after restore |
| `ui_contract_check.js` | Its own `--drill` mode, 8 assertions | 24 drill cases, **all pass**, including negative controls and three anti-vacuity cases: a chrome exception must not widen, a **stale anchor is a FAILURE not a no-op**, and an exception is scoped per file |
| `narration_audit_check.js` | Its own `--drill` mode, 10 assertions | All pass, including *"assertion 10 goes red on a junk card id — the one that silently satisfied the page's own probe"* and *"goes red when the page's module throws at all — the historic blank-page failure"* |
| The audit page itself | Assertion 10 **executes** the page headless (`scripts/lib/audit_page_headless.mjs`, hand-rolled DOM, no dependency) and reads back its own numbers | Headless **reproduces the browser's failure exactly** — 61 cards and 128 self-check failures at the broken commit. Fidelity proven against a real browser observation, not asserted. |

That last row is the direct answer to *"two agent reports this week claimed a page was fine when a browser showed otherwise."* The page-health gate is now calibrated against the browser reading that caught the lie.

Current live-render numbers, read from the gate output rather than any SUMMARY: **226 cards rendered (221 distinct) across 19 moments, 0 unrendered, 0 page self-check failures**, 91/91 flow-chart lookups resolve, 89 live sites each placed under exactly one node.

---

## Requirements Coverage

| Requirement | Status | Evidence |
|---|---|---|
| NARR-01 | ✓ SATISFIED | 209 reviewed dispositions; 203 carried, 6 retired **with his explicit approval** (`44261c8`); the audit page is live and gated. Coverage caveat below. |
| NARR-02 | ✓ SATISFIED | Gate-asserted **and** first live sighting, 2026-07-30 |
| NARR-03 | ✓ SATISFIED | `stormIntroClause()`; verb "blows" per D-37, register per D-29 — both approved supersessions of the requirement's literal phrasing. Confirmed live. |
| NARR-04 | ✓ SATISFIED | bribe / cleaned-out split, in his approved one-sentence shape |
| NARR-05 | ✓ SATISFIED | Confirmed live in both actor and spectator forms in the same round |
| NARR-06 | ✓ SATISFIED **against the 2026-07-30 rewording** | Hold curve above; guest-seat measured; human-eye PASS |

No orphaned requirements: REQUIREMENTS.md maps exactly NARR-01…06 to Phase 15; all six are claimed and all six verify.

---

## Known-open — deliberate, recorded, not gaps

Stated plainly so nobody re-discovers them as failures.

### 1. Audit tool Tasks 5, 6, 7 — **the phase's most significant residual**

**Verified genuinely absent.** No script compares shipped source text against `15-COPY-APPROVED.md` or the approval fields of `15-DISPOSITIONS-FINAL.json`. The only two files that reference the dispositions do so for *accounting* (assertion 8: all 209 rows carried across) and for hand-pinned literals inside comments. There is no applier. `src/ui/board.js` copy is now in the inventory (6 sites) but the comparison has never run against it.

This matters because it is the mechanism whose absence let four approved rewrites ship missing. The phase's own honest measurement (F4) puts the exposure precisely:

> 144 reviewed non-merge approval fields. Three passes: 37 unapplied → 19 → hand-verified **3** (plus F3's intro banner = 4). **But:** 84 fields have every distinctive fragment present while *word order and line identity were never checked*, and 41 are too placeholder-heavy to judge mechanically. *"This heuristic establishes that the copy is broadly applied, not that it is exactly right."*

So **19 of 144 are conclusively settled**; the rest rest on fragment matching plus two live playtests in which Wyatt read dozens of lines on screen and raised no copy objection. Nothing is known to be wrong. This is unmeasured area, not a defect — and it is human item 1.

### 2. D-57 residue — two narration render paths, unenforced

Recorded in `.planning/todos/pending/narration-two-schedulers-unenforced.md`, deliberately not fixed (G17 was changing the same code in the same pass). **See warning W2: the recorded description is now stale.** `showNarration()` is no longer a hold+fade scheduler — it is two lines with no timer (`src/ui/panel.js:457-459`), and the outgoing line fades only when one replaces it, inside `panel()` (F6/G17, Wyatt-approved: *"never fade the last line; fade ONLY when something replaces it"*). The concern that survives is narrower: two code paths render narration and nothing asserts they agree. The other three of the four host/guest drifts are now fixed **and** gated (`host_guest_parity_check.js`, `npm test` 16→17).

### 3. STORM-02 — guest storm-push parity: backlogged

`docs/DETERMINISM-RERECORD-NEXT.md` §9 explicitly warns against treating it as solved because G14 shipped: a rim sweep is geometry over a static ring, a storm push is simulation.

### 4. Queued gated re-record batch

`docs/DETERMINISM-RERECORD-NEXT.md` — engine purity (`spoil`/`gave` become data, drop `ilabelImg` from the engine, delete the dead raider branch), bot intelligence, STORM-02. **One** gated `--capture` pass, not three. The trade-wind animation is explicitly no longer in this batch.

### 5. Phase 16 items — out of scope

UI-01…07, META, KOFI. UI-06 (lobby name doubling) and D-55 (sail-highlight parity) landed early via F1/F2 and G25.

### 6. Not open — the two battle ADDRESSED lines

F4 flagged `misc:battleLine:orchestrator.js:482/:486` as unapplied and recommended defer. **Superseded and closed:** Wyatt approved retiring both on 2026-07-30 (`44261c8`) as `tag:"merge"` twins that existed only because the code branched on WHO rather than WHAT. Each pair now renders one line naming whoever it applies to (`orchestrator.js:532`, `:541`). Carrying this as an open item would be wrong.

---

## Warnings

| ID | File | Finding | Severity |
|---|---|---|---|
| **W1** | `src/ui/panel.js:242-247` | The `GHOST_FADE_MS` comment says *"It stays 180ms"* and points a future editor at *"the `.18s` in index.html"*. **Both are 800 / `.8s`** after G28 (`panel.js:241`, `index.html:289`). Code and CSS agree — the comment telling the reader to keep them in sync names the wrong number. Worse, **nothing gates the sync**: `grep GHOST_FADE_MS scripts/` returns zero hits; only the CSS side is pinned. A one-line comment fix, plus optionally a gate, before someone edits one number and not the other. | ⚠️ Warning |
| **W2** | `.planning/todos/pending/narration-two-schedulers-unenforced.md`, `.continue-here.md:88-89` | Stale descriptions of already-changed code. The todo describes `showNarration()` as a hold-and-fade scheduler it no longer is. `.continue-here.md` records D-55 as *"never fixed"* and D-35 as *"nothing asserts it"* — both are now fixed **and** gated. A reader picking up the todo would work from a wrong model. | ⚠️ Warning |
| **W3** | `src/ui/flow.js` | `🎣 Fish (+1-2🌕)` uses an ASCII hyphen as a **range** separator beside U+2212 minuses everywhere else. Outside D-38's rule by construction (F8); carried forward from the previous report unchanged. | ℹ️ Info |

**No `TBD` / `FIXME` / `XXX` debt markers** in any of the 64 files this phase touched.

---

## Behavioral evidence

| Behavior | Method | Result |
|---|---|---|
| Full gate suite | `npm test` | **exit 0**, 17 scripts; audit page 23/23 assertion groups |
| Determinism corpus | `determinism_baseline.js --verify` | **31/31 seeds PASS** |
| Engine invariant, both ranges | `git diff --stat` | **empty**, and proven non-vacuous |
| D-29 gate fails on a broken tree | live mutation + restore | **FAIL, correctly named and located** |
| `ui_contract_check` red-proof | `--drill` | 24 cases, all pass |
| `narration_audit_check` red-proof | `--drill` | all cases pass, incl. 7 for assertion 10 |
| Audit page renders | headless execution inside the gate | 226 cards, 0 unrendered, 0 self-check failures |
| Guest narration hold + fade | MutationObserver, room XUDV | length-proportional hold, `fades: 1` per line |
| Bot/human hold parity | same event type, two turns apart | 2990 vs 2810 ms — within 6% |
| Storm rain in Safari | Wyatt, in Safari | *"stotm looks great in safari"* — the browser that matters (v1.0 BUG-01) |
| Guest sail-highlight parity | measured on the guest | 13/13 squares attribute-identical to the host |

### Probes

No `scripts/*/tests/probe-*.sh` exist in this project; `npm test` is the probe surface and it was run in this process, not read from a SUMMARY.

---

## Verdict

**The phase goal is achieved.** All five gaps from the 2026-07-29 verdict are closed and independently re-verified against the codebase rather than against any SUMMARY. All six requirements — including NARR-06 **as reworded on 2026-07-30**, which is a different criterion from the one previously checked — are satisfied. The governing constraint held byte-for-byte across the entire phase, and that check was proven capable of failing. Every gate this verdict leans on was either mutation-tested or has its own red-proof drills including anti-vacuity cases, and the audit page's health gate is calibrated against the exact browser reading that caught a previous false green.

The strongest evidence is not static. Two recorded live playtests confirmed, on screen, in a running game: the restored broke line (first sighting ever), custom ingredient art inline, the ye/yer register, actor-vs-spectator storm phrasing, bot/human hold parity within 6%, the shared sail prompt on the guest, the shadowed-reason fix, zero prompt leaks in ~150 lines, and Safari storm performance.

**Three things await Wyatt, none of which blocks the merge:**

1. **A decision, not a defect** — accept sampled copy fidelity, or build the audit tool's Task 5 first. 19 of 144 approval fields are conclusively settled; 125 rest on fragment matching plus his own live reading. This is the phase's most significant residual and it is named rather than waved through, because it is precisely the mechanism whose absence let four approved rewrites ship missing.
2. **Two of six D-41 greyed states** were never eyeballed — the bots kept closing the window in both sessions. Gate-covered, not screen-confirmed.
3. **The G28 pacing** was retuned mid-session; worth one fresh look, though he already cleared it.

Plus two small documentation corrections (W1, W2) that cost minutes and prevent a future reader from working off stale descriptions of code that has since changed.

**On merging:** Wyatt's confirmed sequence is on file (`44261c8`) — finish the build, run the pipeline, merge Phase 15, start Phase 16. This verdict supports that. The remaining pipeline step never run is `/gsd-code-review` on the phase diff: two days of changes across narration, prompts, storm handling, coin paths and the audit tool, and nothing has yet read it *as code*. Everything caught so far came from playtesting or verification.

---

_Verified: 2026-07-30T22:26:27Z at `aec5e57`_
_Verifier: Claude (gsd-verifier) — re-verification, replaces the 2026-07-29 `gaps_found` (14/19) verdict_
