# 03 — the UI contract gate: why the biggest one is not ported tonight

**Written 2026-08-23, plan 03-01 Task 5a. Every number here was measured, not estimated.**

**In one sentence for Wyatt:** the largest gate in the repo would report about seventy problems
against `/4` if we switched it on tonight, and roughly four-fifths of those are a writing rule the
new game never adopted — so switching it on would teach everyone to ignore it, and the four that
are *real* are logged here instead.

---

## 1. What was measured, and how

`scripts/ui_contract_check.js` is 1,509 lines — the largest gate in the repo. It has never read
`4/`.

It cannot be run against `4/` as it stands: it imports `../art-review/narration-core.js`, and
`4/art-review/` does not exist (the directory is root-only). For this one measurement a scratch
copy was placed at `4/scripts/_scratch_ui_contract_check.js`, that single import repointed at the
root `art-review/`, run once, and **deleted** — `git status --short -- 4/scripts/` is clean.

**That import is itself a finding, and it is the cheapest part of the port:** `art-review/` holds
the register vocabulary (`PIRATE_RE` / `PRONOUN_RE`), which is a TOOL and not a tree artifact, so
the correct resolution when the gate is ported is to keep it pointed at the root copy — exactly the
distinction `scripts/state_contract_check.js` now documents for `migrate_app_state.js`.

### The verdict, verbatim

```
PASS no src/ui/**/*.js import resolves into src/net/ (D-07)
PASS the PP bridge is gone (no PP-BRIDGE tag, no Object.assign(globalThis) under src/)
PASS the classic <script> region in index.html is empty
FAIL retained-globals allowlist — only window.revealMyRecipe (+ the 4 debug hooks) permitted under src/
FAIL the D-29 pirate register holds across src/ and index.html (+ the layout intactness probe)
FAIL co-reachability — a greyed control's reason is reachable in the state it explains (D-41/F11)
     [5 explanation var(s), 1 chain(s), 6 disabled option(s)]
PASS delivery — no broadcast's content branches on the local viewer (D-10/F7)
     [8 broadcast call(s) checked, 4 mechanisms]
PASS the storm rain is seeded from the game — no unseeded Math.random(), no GAME .r() (G19)
PASS the narration box is collapsed once the End of Voyage summary appears (UI-07)
PASS "we never connected" is a different sentence from "the server is busy"
PASS boot() initialises Firebase BEFORE the solo-resume early return
FAIL coin-parenthetical-nobrk — every trailing signed-coin parenthetical is wrapped in a nobrk span (FIX-21)
```

**9 PASS, 4 FAIL groups, 68 individual findings.**

*(03-01-PLAN.md predicted "8 PASS and 4 FAIL groups holding roughly sixty findings". The FAIL groups
match; the PASS count and the finding total are one and eight higher respectively. The numbers above
are the measured ones.)*

**Nine of the thirteen assertions already pass against the game we ship.** That is worth saying
plainly, because "the big gate is red against 4/" reads worse than the truth.

---

## 2. The triage — every one of the 68 findings, in exactly one bucket

| Bucket | Count | What it is | Where it goes |
|---|---:|---|---|
| **1. A real fault in `4/`** | **4** | controls that grey out with no reason a player can read | logged below — **not fixed here** |
| **2. Anchored on root-tree copy `4/` never had** | **9** | the gate looks for exact sentences that moved or were rewritten | **plan 03-02** — re-anchor, do NOT delete |
| **3. A rule `4/` has never adopted** | **54** | the D-29 second-person → `ye`/`yer` register conversion | **Phase 9 — The Written Record** |
| **4. A one-line allowlist entry** | **1** | `window.__pp4`, the `/4` stage's own debug hook | **plan 03-02** |
| | **68** | | |

---

### Bucket 1 — REAL FAULTS IN `4/` (4)

**These are the interesting ones and they are adjacent to Wyatt's own playtest item 2.** A control
greys out and the game never says why, so from the seat it is a dead button.

| File:line | Greyed by | What a player sees |
|---|---|---|
| `4/src/ui/flow.js:1354` | `!canBuy` | **"Buy \<ingredient\> −N🌕"** is greyed with no reason string decided by `canBuy` |
| `4/src/ui/flow.js:1358` | `!canBarter` | **"Trade any 2 crates fer \<ingredient\>"** is greyed with no reason string decided by `canBarter` |
| `4/src/ui/flow.js:1646` | `!holders` | an option the gate could not label is greyed with no reason string decided by `holders` |
| `4/src/ui/flow.js:2038` | — | the explanation variable `sub` is assigned across an if/else-if chain whose two conditions are **independent** (`targets.length&&!canAfford` vs `!canTrade`, no shared identifier), so **the second reason can be unreachable in the state it explains** |

> **OBSERVED, NOT YET MEASURED (CLAUDE.md rule 6).** These come from a static scan of the source. Not
> one has been reproduced in a browser: nobody has yet stood at a dock with too few coins and
> confirmed there is no sentence under the greyed button. **Do not report these to Wyatt as
> confirmed defects.** The first step in whoever picks them up is to reach that state and look —
> `docs/DRIVING-THE-GAME.md` §5e poses the state rather than sailing to it.

**Deliberately NOT fixed in 03-01**, for two reasons that both hold: this plan touches no game code
(only comment corrections), and rule 6 forbids acting on an unreproduced finding as though it were
measured.

---

### Bucket 2 — ANCHORED ON COPY `4/` NEVER HAD (9)

All nine are the FIX-21 coin-parenthetical assertion, which pins **exact sentence fragments** in
`src/ui/util.js` and then checks each is wrapped in a `nobrk` span. `4/` rewrote that narration, so
the anchors miss.

**The gate says what to do, in its own failure text, and it is right:** *"re-anchor this assertion;
do NOT delete it. It protects FIX-21."*

| Kind | Count | Detail |
|---|---:|---|
| `COIN-NOBRK-ANCHOR` | 6 | anchor sentence not found at all: the aground half-coins-lost repairs clause (`const lossTag=lost!=null?`), four sidebet won/lost variants, and the `fish:` catch-amount handler |
| `COIN-NOBRK` | 2 | battleflee flee-cost, two viewer branches, no `nobrk` span found on the expected sentence |
| `COIN-NOBRK-COUNT` | 1 | battleflee expected 2 occurrences of one sentence, found a different number |

**What the rule actually protects, and why re-anchoring is worth the work:** a trailing signed-coin
parenthetical like `(−1🌕)` must not be allowed to line-wrap between the sign and the coin. On a
phone that produces a narration line ending in a bare `−` with the coin alone on the next row. It is
a real reading defect, it is cheap to prevent, and `4/` is the tree Wyatt reads on a phone.

**Whether `4/`'s rewritten sentences already carry the spans is NOT established** — the gate could
not find the anchors, which says nothing either way about the spans. That measurement is the first
task of the re-anchor.

---

### Bucket 3 — A RULE `4/` HAS NEVER ADOPTED (54)

`D-29-REGISTER`: a player-facing string still reads the pre-conversion second person, and the rule
says convert it to `ye`/`yer`.

| File | Findings |
|---|---:|
| `4/src/ui/stage.js` | 14 |
| `4/src/ui/flow.js` | 14 |
| `4/index.html` | 12 |
| `4/src/ui/util.js` | 8 |
| `4/src/ui/bakeoff.js` | 3 |
| `4/src/orchestrator.js` | 3 |
| | **54** |

**THIS IS WYATT'S VOICE AND IT IS A COPY PASS, NOT A GATE PORT.** Turning this assertion green means
rewriting fifty-four player-facing sentences, and taste, placement and wording are his (CLAUDE.md
§1). Making the gate green any other way means weakening it. **Both are forbidden**, which is
precisely why wiring it in tonight was never an option.

**→ Phase 9, The Written Record.** It belongs beside the rest of the copy work, with him.

**And the voice boundary applies when it happens (CLAUDE.md rule 12):** the credits and About page
are deliberately NOT in pirate speak, because they are outside the game world. A `ye`/`you`
difference there is correct. **A blanket conversion of all 54 would be a bug.** Anyone running this
pass must check each site against that boundary first.

*(One caution for whoever ports the gate: `4/index.html`'s 12 findings sit in markup, and the file's
own comment at the Pass & Play block notes that "an HTML comment has no per-line marker, so the
register scan cannot tell a continuation line from real copy." Comments there can be miscounted as
copy — including the `UNGATED-IN-4` marker plan 03-01 added to that very comment.)*

---

### Bucket 4 — A ONE-LINE ALLOWLIST ENTRY (1)

```
RETAINED-GLOBAL: src/ui/stage.js:3027 assigns "window.__pp4" — not on the retained-globals
allowlist (revealMyRecipe, __pp_module_ok, __pp_boot_count, __pp_net_debug, __pp_app_state_debug)
```

`window.__pp4` is the `/4` stage's own debug/test hook — the same object
`4/scripts/mp_rig.mjs` and the playtest drivers reach for (`window.__pp4.sailCells`,
`__pp4.sweepCam`). It is a **deliberate retained global in `4/` that the root tree does not have**.

**The fix is one entry, and it must be PER-TREE**, the same shape `scripts/engine_contract_check.js`
now uses for its two inventories — a shared allowlist would silently permit `__pp4` in the root
game too.

---

## 3. RECOMMENDED SHAPE FOR PLAN 03-02

**Land the port in two halves, and only the first half blocks.**

### Half A — can block against `4/` in the next pass

| Assertion | Why it can block | Cost |
|---|---|---|
| the 9 already green | already green against `4/` | the selector only |
| retained-globals | one per-tree allowlist entry (bucket 4) | ~10 lines |
| coin-parenthetical-nobrk | re-anchor 9 assertions to `4/`'s own sentences (bucket 2) | the real work of 03-02 |

That is **12 of 13 assertions blocking against the game we ship.**

### Half B — cannot block until a copy decision is made

The D-29 register assertion. **Port it with the selector but leave it OUT of the blocking chain**,
run by name, and say so in the gate's header the way `host_guest_parity_check.js` did for its own
declared gap. Then Phase 9 converts the copy and the assertion joins the chain in that same commit.

**Do not "temporarily" widen the register rule to make it green.** That converts an honest partial
into a lie, which is the single easiest wrong thing to do here — the same trap 03-01 Task 3 named
for the `localAsk` declared gap.

### The gate's own prerequisites, measured tonight

- **Point `art-review/narration-core.js` at the ROOT copy.** It is a tool (a vocabulary), not a tree
  artifact. There is no `4/art-review/` and there should not be one.
- The gate already takes a `root` argument throughout and uses `REAL_ROOT` at the foot, exactly like
  `host_guest_parity_check.js` did before D-28 — so the selector drops in with
  `scripts/lib/pick_tree.js` and no restructuring.
- **Red-proof both ways per assertion**, and update `package.json`'s `gates` counts in the same
  edit — `scripts/gate_count_check.js` will fail the build if you forget.

### And the reason none of this happened tonight, in one line

`docs/HARD-WON-LESSONS.md` §9: **a gate that fires on every screen trains its reader to ignore it,
which is worse than no gate.** Sixty-eight findings, fifty-four of them a copy rule nobody has
agreed to apply, is that gate.
