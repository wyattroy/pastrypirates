---
quick_id: 260818-vot
phase: quick/260818-vot-pass-payout-in-config
plan: 01
subsystem: engine + narration + turn menu
status: complete
tags: [RULE-01, RULE-02, D-06, D-07, D-50, nothing-is-a-constant, falsifiability]
requires:
  - "plan 01-04's Game.prototype.doPass and its two gates"
  - "plan 01-03's rewritten scripts/bot_ladder4.js (the neutrality instrument)"
  - "plan 01-05's recorded ladder sha256, as the anchor"
provides:
  - "roundCfg().passCoin — the single source of the pass payout, and D-07's single edit point"
  - "a Pass button that states what a pass pays"
  - "two gates that stay falsifiable when the payout moves"
affects:
  - "plan 01-06 (wave 5): the pointer to the payout's single source has MOVED — see below"
tech-stack:
  added: []
  patterns:
    - "a button states its amount when the amount is CERTAIN at the tap (Buy, Attack, Pass); a conditional amount lives in the prompt text instead (Dock, Call)"
    - "three-leg gate design against tautology: a hand-typed pin, a non-default run, and an observed-vs-rendered agreement"
key-files:
  created:
    - .planning/quick/260818-vot-pass-payout-in-config/260818-vot-READERS.md
  modified:
    - 4/src/engine/index.js
    - 4/src/ui/flow.js
    - 4/src/ui/util.js
    - 4/scripts/pass_coin_test.js
    - 4/scripts/pass_narration_test.js
decisions:
  - "The payout is a field on roundCfg(), not a number in doPass. D-07 may lower it at the wave 5 balance gate and that edit now lands on one line."
  - "No fallback default anywhere. All five Game construction sites route through roundCfg(), proved as a command — a fallback would re-introduce the hidden constant this task removed, in the one place nobody would grep."
  - "The Pass button follows ATTACK, not Buy: leading wave kept, nobrk parenthetical, raw coin through the emojify chokepoint, no short: form. ASCII plus, because Attack's minus is U+2212 and is not the model for a gain."
  - "The parenthetical DISAPPEARS at a zero payout rather than advertising a zero."
  - "NOT swept onto Dock or the sidebet Call — their amounts are not certain at the tap."
  - "One existing gate assertion changed, deliberately and minimally; the 100 rendered verdicts were not touched, because their passing unchanged IS the evidence."
metrics:
  duration: ~50min
  tasks: 3
  files: 6
  completed: 2026-08-18
---

# Quick task 260818-vot: the pass payout moves into the config

The pass dubloon was the only bare literal in an economy where every other coin amount is
config-derived — and putting the amount on the Pass button would have made **three** copies that
must move together. D-07 may lower the payout at the wave 5 balance gate. Three literals moving in
lockstep is exactly how the interface ends up lying to a captain about their own purse.

It is now **one field, `roundCfg().passCoin`, and three derived sites**: the payment, the button and
the narration tag. The change is behaviour-neutral at the shipped default and is **proved** so —
not asserted — by 100 unchanged rendering assertions and three byte-identical ladder records.

**Commits:** `2eb7b80` (readers), `a9da720` (the refactor), `831abd2` (the gates).

---

## The one sentence plan 01-06 needs

**Plan 01-06 line ~218 tells wave 5 to change the amount "at its single source in `doPass`". After
this task that single source is `passCoin` on `roundCfg()` in `4/src/engine/index.js`, and `doPass`
derives from it.** The pointer has moved; `01-06-PLAN.md` was **not** edited, because another
phase's approved plan is not this task's to rewrite. A pointer that has moved and been left
unrecorded is how this project loses days — so it is recorded here, and in the config field's own
comment, which names D-07 as the reason the field exists.

---

## Reader classification

Full table with the four raw greps in
[`260818-vot-READERS.md`](260818-vot-READERS.md). It was written **before a production line moved**,
because the −21.2 ladder regression came from changing how a quantity is produced without first
listing what reads it. Condensed:

| Reader | What it reads | Treatment |
|---|---|---|
| `4/src/engine/index.js` — the purse increment in `doPass` | the QUANTITY | derived off `this.cfg` |
| `4/src/ui/util.js` — the `pass:` narration tag | the QUANTITY, inside a rendered string | derived off `appState.game.cfg`, following the `dock:` builder's existing unguarded read from inside the same table |
| `4/src/ui/flow.js` — the Pass option label | the QUANTITY (**a new reader**, added here) | derived, Attack-shaped |
| `pass_coin_test.js` purse-delta assertion | the QUANTITY, hand-typed | **stays a pinned literal** — this pin is what catches the default moving |
| `pass_narration_test.js` `TAG` constant | the RENDERED STRING, hand-typed | **stays a pinned literal** — D-06's approved wording |
| `pass_narration_test.js:170`, `pass_coin_test.js:217/224` | the SOURCE TEXT | unchanged; the QUOTED-vs-BARE trap is live in these exact files |
| the ORDERING and event-SHAPE assertions | the recorded SNAPSHOT | unchanged |
| `scripts/bot_ladder4.js` | the quantity, via `roundCfg()` | **untouched** — it is the neutrality instrument |
| `4/src/ui/util.js:1810` (`q.coins++`) | a DIFFERENT quantity (the shot-clock forfeit) | untouched; a grep-alternation false positive |

**The NaN question, answered as a command.** All five `new Game(` construction sites route through
`roundCfg()` — including the solo-resume rebuild (`util.js:2008`, which rebuilds cfg from
`roundCfg()` rather than reading it out of the save) and the multiplayer host write
(`orchestrator.js:1511`, which writes the whole cfg to the room, so guests inherit the field for
free). **No fallback default was added and none is needed.** No published number lives in `docs/` or
`4/RULES-V2.md` — checked, zero hits.

---

## Behaviour-neutrality, measured

`node scripts/bot_ladder4.js 20 7919 --json`, three captures, sha256:

| Capture | sha256 | verdict |
|---|---|---|
| **CONTROL** — recorded by plan 01-05 | `a2224555a51f455dcac2883de28e72051e31aa301d51f3a415ceb5f07e7b9cc1` | the anchor |
| before the change | `a2224555…7b9cc1` | **match** — the anchor held, so a difference could only be this change |
| after the change | `a2224555…7b9cc1` | **byte-identical** |
| after all four sabotages were reverted | `a2224555…7b9cc1` | **byte-identical** — no sabotage survived |

Wave 5 plan 06 can still attribute its movement to the pass dubloon and not to this refactor.

**Identity between runs is normally an alarm, not a result** (HARD-WON-LESSONS §0), which is why it
is not believed on its own — it is red-proofed by sabotage 1, which changes engine behaviour and
turns both gates red.

---

## The narration is invisible at the default, proved by rendering

All 100 renderings still pass against the gate's **unchanged hand-typed tag constant**. The three
printed samples are **byte-identical to the ones `01-04-SUMMARY.md` recorded** (diffed, not eyeballed):

```
#04 addressed     🌊 Crustbeard — ye catch sight of the bottom, and a dozen donut shrimp bounce past. Recipe idea! (+1🌕)
#04 third-person  🌊 Crustbeard catches sight of the bottom, and a dozen donut shrimp bounce past. Recipe idea! (+1🌕)
```

The donut-shrimp line (#04) is the one that broke every earlier draft. D-06's wording is untouched.

---

## The Pass button

Measured by lifting the label expression **out of `flow.js`'s own source** and evaluating it against
a real `roundCfg()` — never a re-typed copy, and `humanAct` needs a DOM so the button itself cannot
render headlessly:

| `passCoin` | rendered `textContent` | length | needs `short:`? (stage.js limit is 16) |
|---|---|---|---|
| 1 (shipped) | `🌊 Pass (+1🌕)` | 14 | no |
| 0 | `🌊 Pass` | 7 | no — **the parenthetical disappears rather than advertising a zero**, exactly as Attack's does when powder is free |
| 7 | `🌊 Pass (+7🌕)` | 14 | no |
| 12 | `🌊 Pass (+12🌕)` | 15 | no — headroom even at two digits |

Built to the ATTACK precedent literally: same conditional shape, same `nobrk` wrapping, same read
off `appState.game.cfg`, raw 🌕 left for `panel()`'s emojify chokepoint (D-50). **ASCII `+`, not
Attack's U+2212 MINUS SIGN** — every gain parenthetical in the game uses a plain plus.

**Consistency sweep, and which surfaces were checked** (CLAUDE.md §2). Checked: **Buy/Dock**
(states its price in the prompt), **Attack** (states its powder on the button), **Trade**,
**Bakery/Ovens**, **the sidebet Call**, **Pass**. The ruling is that a button states its amount when
the amount is **certain at the moment of the tap** — Buy, Attack and Pass all qualify. **Dock is a
coin flip and Call is conditional on being right**, so both keep their amounts in the prompt text
and are deliberately left alone. This is the codebase's existing convention, swept against, not a
new exception.

---

## The four failure demonstrations

**The whole job was this.** Both gates passed before the change and pass after it — that is correct
and is the point. The danger was the other direction: re-pointing them at the config field so they
assert `delta === cfg.passCoin` while the engine computes `coins += cfg.passCoin` would make them
tautologies, unable to fail and still printing PASS.

Each sabotage was applied, run, recorded, and reverted with a targeted `git checkout -- <file>`.

### 1. The config default moved, 1 → 2 — **the sabotage a vacuous gate survives**

| Gate | exit | failures | named assertions |
|---|---|---|---|
| `pass_coin_test.js` | **1** | 4 | `LEG A: the shipped default payout is one dubloon` got=2 want=1 · `LEG A: doPass raises the acting captain's purse by exactly one dubloon` got=2 want=1 · `ORDERING: and that snapshot purse is one higher than before the call` got=5 want=4 · `a turn ending at the engine fallback leaves the purse exactly one higher` got=2 want=1 |
| `pass_narration_test.js` | **1** | 103 | `LEG A: the shipped default payout is one dubloon` got=2 want=1 · **all 100 renderings** against D-06's wording · `LEG A: restored — the fixture is back at the shipped default` · `LEG A: and a rendering at the restored default carries D-06's approved tag again` |

**BOTH gates went red. Neither is a mirror.**

### 2. The button re-hardcoded (a bare `(+1🌕)` back in the label)

`pass_coin_test.js` exit **1**, exactly **1** failure:
`LEG C: the Pass button states no literal gain amount — the number is derived, never typed` got=false.
`pass_narration_test.js` exit 0 — correct, it does not read `flow.js`.

### 3. The narration pointed at the wrong config field (powder, not the payout)

`pass_narration_test.js` exit **1**, 105 failures. The ones that matter:
`LEG C: the amount the narration renders equals the delta the purse observed (payout 1)` got=false ·
**and the same at payout 7** · `LEG B: all 100 renderings carry the moved payout` got=0 want=100 ·
`LEG C: and it reads the payout off the live round config` got=false.
`pass_coin_test.js` exit 0 — correct, it does not read `util.js`.

**This is the leg's whole reason for existing.** A wrong-field read still *derives*; Leg C is what
catches it as a **disagreement between what the engine did and what the interface said**, rather
than as a wrong constant.

### 4. The two statements in `doPass` swapped (record before pay)

`pass_coin_test.js` exit **1**, 4 failures, all ORDERING and all read off the **recorded snapshot**,
not off source order: `ORDERING: the pass entry's own snapshot shows the purse AFTER the payment`
got=3 want=4 · `ORDERING: and that snapshot purse is one higher than before the call` got=3 want=4 ·
`LEG B: and the recorded snapshot still shows the post-payment purse at 7` got=3 want=10 ·
`ORDERING: the recorded snapshot for that turn shows the post-payment purse` got=3 want=4.

The hard predicate is **re-proved against the derived code** rather than assumed to have carried
over from 01-04.

---

## The gate diff, and the one existing assertion that changed

`git diff 282a70b -- 4/scripts/pass_narration_test.js`, fixture addition:

```js
+import { Game, roundCfg } from "../src/engine/index.js";
...
+const STRATS = ["pirate", "trader", "balanced", "rusher"];
+const SHIPPED_PAYOUT = 1;  // Leg A: hand-typed, never read back off the config it is pinning
+appState.game = new Game({ ...roundCfg(STRATS), bakeoff: true }, 7919, true);
...
+checkTrue("CONTROL: a real game is seated, built by the game's own round config", appState.game instanceof Game);
+checkTrue("CONTROL: the payout the builder reads is a finite number", Number.isFinite(appState.game.cfg.passCoin));
+check("LEG A: the shipped default payout is one dubloon", appState.game.cfg.passCoin, SHIPPED_PAYOUT);
```

The fixture is built by `roundCfg()` exactly as every construction site in the tree builds it, and is
**validated before anything is measured** — a hand-made `{cfg:{…}}` stand-in would have let the file
prove the tag against a config the game cannot produce (the lemon-in-the-hold failure,
HARD-WON-LESSONS §3).

**One existing assertion changed, and it had to be.** `pass_narration_test.js` asserted the builder's
**source** contains the tag as one literal:

```js
-  checkTrue("the builder body carries the tag", body.includes(TAG));
+  checkTrue("the builder body carries the tag's approved wording", body.includes(TAG.slice(0, TAG.indexOf("(") + 2)));
```

The amount now derives, so the source cannot contain the whole literal. It asserts the approved
**wording** is written out and the **number** is not — sliced from the same `TAG` constant rather
than re-typed, so the two cannot drift. Paired with the new Leg C negatives on the same region.
**The pin against D-06's full approved string is the 100 RENDERED verdicts, which were not touched**
— their passing unchanged is precisely the evidence that the derivation is invisible at the default,
and rewriting them would have destroyed it.

Everything else in both gates is additive.

---

## The quoted-vs-bare trap, handled twice

`pass_narration_test.js:170` asserts the tag appears in `util.js` exactly **once**;
`pass_coin_test.js:217` counts `doPass` in `flow.js` at exactly **two**. Every comment written in
those files refers to things in prose — "the live round config", "the shared method" — never as the
quoted string or the full accessor chain. Both counts still read 1 and 2.

**And one level further out, which is the version that would have been missed.** The Leg C
literal-digit regex would have tripped on the prose *above* the Pass button, which necessarily
explains what a zero payout would otherwise have rendered as. So the scanned region is trimmed to
the option itself (`upTo(regionAfter(...), "});")`) and **printed in the gate's output**, so what
was scanned is visible rather than trusted. Same failure as `seat_arg_check.js`'s first run, which
failed on the comment documenting the bug it existed to catch.

---

## Verification

| # | Check | Result |
|---|---|---|
| 1 | Both gates exit 0 on the restored tree with their Leg A literals intact | ✅ |
| 2 | All four sabotages observed FAILING, exit codes and named assertions recorded | ✅ above |
| 3 | Ladder byte-identical across three captures, anchored to 01-05's `a2224555…` | ✅ |
| 4 | `npm test` (root, 21 gates) | ✅ exit 0 |
| 5 | `git diff --name-only` names only the six files this plan owns | ✅ |

Every `4/` gate by name — `stage_import_check`, `no_undef_check`, `pp4_timeroff_check`,
`planner_singleton_check`, `pass_coin_test`, `pass_narration_test` — **all exit 0**. There is still
no combined runner for `4/`; wiring one is Phase 3's TEST-04/05 and was out of scope.

**Standing note, unchanged and still true: not one of root `npm test`'s 21 gates loads `4/`.** A
green `npm test` says nothing about the game being promoted — that is the "gate scanning the wrong
tree" trap, and it is why the six named `4/` gates are run and reported separately.

**Trees proved untouched**, as a command rather than as a claim (`git diff --name-only 282a70b`):
repo-root `src/` (the LIVE v1 game) **0**, `v2/` **0**, `v2bakeoff/` **0**, `3/` **0**, `CNAME`
**0**, `robots.txt` **0**, `sitemap.xml` **0**. `4/src/ui/stage.js` has a **zero-line diff** —
`PP4_STAMP` is untouched at `2026-08-18d`, because **plan 01-06 owns that line and the push**.
Nothing was pushed. Wyatt will not see this on his phone and should not be told to look for it.

**Probe hygiene:** no browser and no local server was started by this task. `pgrep` for
`remote-debugging-port` and `http.server` both return nothing. The three ladder runs were
foreground, bounded, ~4–7s each.

---

## Deviations from Plan

### Auto-fixed

**1. [Rule 3 — Blocking] One existing narration-gate assertion had to change**

- **Found during:** Task 2
- **Issue:** The plan says "change no existing assertion" in `pass_narration_test.js`. But line 177
  asserted `body.includes(TAG)` against the **source text** of the builder — and once the amount
  derives, the source can no longer contain `Recipe idea! (+1🌕)` as one literal. Left alone it fails
  for the right reason but blocks the task; re-pointed carelessly it goes vacuous.
- **Fix:** it asserts the approved **wording** is present and the **number** is not, sliced from the
  same `TAG` constant so the two cannot drift, plus two new Leg C negatives on the same region. The
  plan's actual intent — that the **100 rendered verdicts** stay compared against the hand-typed tag
  — is fully honoured; those are untouched.
- **Files:** `4/scripts/pass_narration_test.js` · **Commits:** `a9da720`, `831abd2`

**2. [Rule 1 — Bug] `regionAfter()` printed the wrong filename for non-`flow.js` sources**

- **Found during:** Task 3
- **Issue:** the helper hardcoded `path.basename(FLOW_PATH)` in its anchor line, so anchoring into
  `4/src/engine/index.js` would have printed `flow.js:957`. A gate whose own diagnostic names the
  wrong file is how "a gate scanning the wrong tree is not silent, it is reassuring" starts.
- **Fix:** an optional `file` parameter defaulting to `FLOW_PATH`; every existing call is unchanged.
- **Files:** `4/scripts/pass_coin_test.js` · **Commit:** `831abd2`

**3. [Rule 2 — Missing] A region-trimming helper, and it is load-bearing**

- **Found during:** Task 3
- **Issue:** the plan's Leg C literal-digit regex over a fixed-length region would have swallowed the
  neighbouring comment, which necessarily spells out what a zero payout would otherwise render — so
  the check would have tripped on the **explanation** of the rule rather than on a breach of it.
- **Fix:** `upTo(region, terminator)` trims each region to its own closing punctuation, and every
  scanned region is **printed** in the gate output so it can be read rather than trusted.
- **Files:** `4/scripts/pass_coin_test.js` · **Commit:** `831abd2`

### Not done, deliberately

- **`01-06-PLAN.md` was not edited.** Its line ~218 now points at a location that has moved. Another
  phase's approved plan is not this task's to rewrite; the move is recorded at the top of this
  summary instead.
- **`PP4_STAMP` was not bumped and nothing was pushed.** Plan 01-06 owns both.
- **Dock and the sidebet Call were not swept.** Reasoning above, under the Pass button.

## Known Stubs

None. Every site the payout reaches is wired to the config field, and the absence of a fallback
default is a decision recorded above rather than an omission.

## Self-Check: PASSED

- `4/src/engine/index.js`, `4/src/ui/flow.js`, `4/src/ui/util.js`, `4/scripts/pass_coin_test.js`,
  `4/scripts/pass_narration_test.js`, `260818-vot-READERS.md` — all present.
- Commits `2eb7b80`, `a9da720`, `831abd2` — all found in `git log`.
