---
phase: 05-trade-over-the-wire
plan: 01
subsystem: trade
status: complete
tags: [MP-07, MP-08, MP-09, D-55, D-56, convergence, rule-23, rule-8, display-rules, trade-system]
requires: [04-01]
provides:
  - "sliderWrapHTML(spec) + wireSlider(root,spec) — ONE coin slider, built and wired in one place, named directly by localAsk and by watchPrompt's ask branch"
  - "sliderText(spec,n) / sliderWirePayload(spec) — the deal re-stated at each stop, pre-rendered for the wire"
  - "ask()'s slider: payload — four serialisable fields plus texts, additive, omitted when absent"
  - "ask()'s {i,n} unpack — a remote captain's dragged number lands in the host's ref BEFORE resolveOpt, so one logQuantity() call records every drag"
  - "4/scripts/crew_trade_probe.mjs — a real crew trade measured: pacing, prompt round trips, the longest unbroken 'is deciding' span, the settlement ledger"
  - "4/scripts/local_trade_probe.mjs — the same trade in solo and pass-and-play, the two modes a two-tab test cannot see"
  - "dlog_quantity_check.js widened to util.js, comment-stripped, 7 new assertions each drilled red"
  - "host_guest_parity_check ORCHESTRATION_DECL — two new shared rows, watched RED first"
affects:
  - 4/src/ui/util.js
  - 4/src/ui/flow.js
  - 4/src/orchestrator.js
  - 4/src/ui/stage.js
  - 4/scripts/dlog_quantity_check.js
  - scripts/host_guest_parity_check.js
  - docs/TRADE-SYSTEM.md
  - docs/DISPLAY-RULES.md
  - .planning/ROADMAP.md
  - .planning/REQUIREMENTS.md
tech-stack:
  added: []
  patterns:
    - "one builder + one wiring, named by both tiers, no wrapper"
    - "pre-render a closure into per-stop strings for the wire"
    - "the answer rides home as {i,n} and lands in the caller's ref before resolveOpt"
    - "pose the trade by stubbing only the PROPOSER; everything under test stays real"
    - "wait for the PAINT, not the DOM, before photographing a prompt"
key-files:
  created:
    - 4/scripts/crew_trade_probe.mjs
    - 4/scripts/local_trade_probe.mjs
    - .planning/phases/05-trade-over-the-wire/baseline-hails-before.txt
    - .planning/phases/05-trade-over-the-wire/baseline-hails-after.txt
    - .planning/phases/05-trade-over-the-wire/shots/
  modified:
    - 4/src/ui/util.js
    - 4/src/ui/flow.js
    - 4/src/orchestrator.js
    - 4/src/ui/stage.js
    - 4/scripts/dlog_quantity_check.js
    - scripts/host_guest_parity_check.js
    - docs/TRADE-SYSTEM.md
    - docs/DISPLAY-RULES.md
    - .planning/ROADMAP.md
    - .planning/REQUIREMENTS.md
decisions:
  - "Task 4 (the parallel answering round) was NOT attempted. Recorded with its measured value and its risk — see §7."
  - "A dropped captain is resolved by the asker's existing 30s shot clock, not by a new per-seat onDisconnect. Moot until Task 4 lands; recorded so Task 4 inherits the reasoning."
  - "The pass-and-play question is recorded as OBSERVED AND NOT A DEFECT, with the reading of passGate's purpose that settles it. Wyatt can overturn it in a sentence."
requirements: [MP-07, MP-08, MP-09]
metrics:
  hails_per_game_before: 2.45
  hails_per_game_after: 2.45
  build_stamp: "2026-08-23c"
  crew_runs: 7
  gates: "30 in npm test, 8 reading 4/"
---

# Phase 5 Plan 01: Trade Over the Wire — Summary

**Hails per game: 2.45 before, 2.45 after — the whole `trade_offer_measure` table is byte-identical
to the baseline taken before a line changed.** Invariant I1 did not move, and could not have: nothing
in this plan touches `botOpenOffer`, `composeOffer`, `openingBid`, `worthHailing` or `worthReAsking`.
It changed what a captain *drags*, never who is *asked*.

Build to look for: **`2026-08-23c`**.

**A guest now sets their coins by dragging the same bar the host drags, and the ± stepper is deleted.
On the counter that used to cost eleven prompt round trips and fifty-two seconds of dead screen, it
now costs three and sixteen.** MP-07 was verified in a real crew room and needed no fix. **MP-09 is
partly done and I am saying so plainly: the expensive half is gone, the design defect behind it —
holders asked one at a time — is still there, and Task 4 was not attempted.**

---

## 1. THE GUARDED NUMBER, FIRST, IN ITS OWN ROW

| | before (build `2026-08-23b`) | after (build `2026-08-23c`) |
|---|---|---|
| **hails per game** | **2.45** (368 open offers / 150 games) | **2.45** (368 / 150) |
| trades struck | 142 (0.95/game) | 142 (0.95/game) |
| offers → trade | 38.6% | 38.6% |
| mean coins offered | 4.16 | 4.16 |
| IDENTICAL re-hails | 3 (0.8%) | 3 (0.8%) |
| mean voyage | 16.4 rounds | 16.4 rounds |

`node 4/scripts/trade_offer_measure.js 150`, saved verbatim at `baseline-hails-before.txt` and
`baseline-hails-after.txt`. **`diff` reports no difference at all.** Recomputed rather than quoted —
`docs/TRADE-SYSTEM.md` §6 warns its own figures are stale by design, and 2.45 is what this tree
actually produces today (the doc says 2.63).

---

## 2. WHAT A CAPTAIN CAN DO NOW THAT THEY COULD NOT

| | Before (`2026-08-23b`) | After (`2026-08-23c`) |
|---|---|---|
| A guest setting coins in a trade | a ± pair, **one full prompt round trip per coin** | **drags the same slider the host drags — one drag, one confirm** |
| …and where those ± circles were drawn | **inside the radial arc**, indistinguishable from Attack and Trade | gone; the arc holds only "Ask it!" — *"THE ARC IS FOR ACTIONS ONLY"* now holds on both tiers |
| The pill as ye drag | a guest never saw it | **re-states the whole deal at every stop**, on both tiers, from the same strings |
| The decision log for a remote N-coin counter | **N+2 entries** — its length depended on the coin count AND the routing | **2 entries, always** |
| A guest countering with a crate | worked, but nobody had ever proven it | **measured end to end: the crate that moves is the one asked for, and the give side is cleared** |

---

## 3. THE PACING, MEASURED — with the responder's thinking time held at a fixed 3000ms

Every duration below is from `4/scripts/crew_trade_probe.mjs`, a real host and real guests in a real
Firebase room, sampled every 200ms. **Every one is quoted beside that fixed delay or it means
nothing.** The `…is deciding…` figure is the longest UNBROKEN span any ONE screen held that line —
criterion 3's actual subject, because `ask()` broadcasts it with `{wait:true}` and a wait line
registers no dismissal deadline, so it stands for the whole chain.

### The red-proof, run first (HARD-WON-LESSONS §2)

A stopwatch that has never been seen to report a SHORT time cannot be trusted when it reports a long
one. One human holder, plain accept: **13.4s**, longest deciding span **4.8s**, **1** prompt, dlog
**+1**. Roughly the fixed delay plus overhead. The instrument can report a short time.

### THE HEADLINE A/B — the same counter, before and after

One guest, countering with a crate **plus 8 coins**:

| | ± stepper (`2026-08-23b`) | slider (`2026-08-23c`) |
|---|---|---|
| **prompt round trips** | **11** | **3** |
| **wall clock** | **61.2s** | **24.9s** |
| **longest unbroken "…is deciding…" on the asker's screen** | **52.6s** | **16.2s** |
| **decision-log entries** | **+12** | **+4** |
| what the captain does | 8 taps, then a confirm | one drag, then a confirm |

Each `+ 1🌕` tap was a whole prompt: a Firebase write, a response write, a full panel re-render on
both screens, a fresh 30-second clock and another `…is deciding…` broadcast to the table. The
prompt-node write log in `shots/t2/log.txt` shows all nine of them, one every ~4.7 seconds.

### The other runs, for the record

| run | holders | shape | prompts | wall clock | longest deciding | dlog |
|---|---|---|---|---|---|---|
| `t1-redproof` | 1 | accept | 1 | 13.4s | 4.8s | +1 |
| `t1` | 2 | accept | 2 | 18.2s | 9.6s | +2 |
| `t2` / `t2-before` | 1 | crate counter, 8 coins, **stepper** | **11** | **61.2s** / 60.9s | **52.6s** | **+12** |
| `t2c` | 1 | crate counter, 0 coins, stepper | 3 | 22.6s | 14.0s | +4 |
| `t3` | 1 | crate counter, 2 coins, **slider** | 3 | 25.2s | 16.6s | +4 |
| `t3-8coin` / `t3-after` | 1 | crate counter, **8 coins, slider** | **3** | **24.9s** / 24.4s | **16.2s** | **+4** |
| `t5-crew` | 2 | **both** counter with a crate + 2 coins, slider | 6 | 40.7s / 41.4s | 32.0s / 32.8s | +8 |

*Where two figures appear, the run was done twice — once for the numbers and once to regenerate the
screenshots after §6's deletion. They agree, which is the reproducibility this A/B needed anyway.*

**Read the last row as the honest remaining cost.** Two captains each making a full counter still
takes 40.7 seconds, and the host reads one unbroken `…is deciding…` for 32 of them, because the
holders are asked **strictly in series**. That is MP-09's real defect and it is not fixed.

### THE SERIES COST, PROVEN RATHER THAN INFERRED

From the prompt-node write log of the two-holder run (`shots/t1/log.txt`) — these are writes to
`rooms/<CODE>/prompt` counted by a live Firebase listener, not anything derived:

```
+4.3s   q6…  seat=1   "test2: Flaky Jack offers Fresh Milk + 3 coins for yer …"
+9.1s   (cleared)
+9.1s   q7…  seat=2   "test3: Flaky Jack offers Fresh Milk + 3 coins for yer …"
+13.8s  (cleared)
```

**Seat 2 is not asked until seat 1 has answered.** Each further holder adds ~4.8s of plumbing on top
of that captain's own thinking time.

---

## 4. EVERY CRITERION, WITH THE MEASUREMENT

### ✅ 1 (MP-07) — a guest counters with a crate, and the crate that moves is the one they asked for

`shots/t2c`. A bot hailed *"Who'll give me Toasty Wheat for Fresh Milk + 3 coins?"*; the guest
answered **Counter → Crystal Sugar → 0 coins** — *"keep yer coin, I want yer cocoa"* in its actual
shape. The engine's own ledger after settlement:

```
EV trade  a=2 b=1  gave="Crystal Sugar"  got="wheat"
holds  seat 1 (guest):  ["wheat"]              ->  ["sugar"]
       seat 2 (asker):  ["dairy","sugar","sugar"] -> ["dairy","sugar","wheat"]
coins  seat 2 (asker):  8  ->  8
```

**The guest received the sugar they asked for. The asker still holds its dairy and all eight coins —
the original give side was cleared.** That is exactly the failure `docs/TRADE-SYSTEM.md` §8 records
(*"When i clicked 'dough hook', i suddenly lost my wheat!"*), and it is correct today.

**No code change was needed.** ROADMAP's reading that this was "mostly verification" was right; it
is now measured rather than assumed, which is the difference this criterion existed to establish.

*Three earlier runs (`t2`, `t2b`, an intermediate) transmitted the counter perfectly and ended in a
**parley**, because the guest asked for the asker's ONLY copy of a crate its own recipe wanted and
the bot correctly refused on its own arithmetic. A refusal is a legitimate answer — it is just not
a settlement, and I did not report the first one as proof of anything.*

### ✅ 2 (MP-08) — every seat drags the same slider, and `coinStepper` is deleted

**It was never a decision** (D-55, rule 23, rule 8). The deliverable was one builder and one deletion.

- `sliderWrapHTML(spec)` and `wireSlider(root,spec)` live in `4/src/ui/util.js` beside
  `optionButtonsHTML`, for the recorded reason that `stage.js` needs the class names and `flow.js`
  must not be imported there. **Both tiers name both functions directly** — `localAsk`
  (`4/src/ui/flow.js`) and `watchPrompt`'s ask branch (`4/src/orchestrator.js`). No wrapper.
- **`coinStepper` is gone from `4/src/`** — the function, its caller, and the fallback line in
  `coinSlider`. The only mentions left are four comments explaining the deletion.
- The wire carries `slider:{min,max,start,aria,texts}` on `ask()`'s existing payload, **additive and
  omitted when absent**. `fmt` is a closure over live game state so it is pre-rendered into `texts`,
  one short string per stop — the pill re-stating the deal is why the number is never read alone.
- The answer comes home as `{i,n}` on the unchanged `response` node and `ask()` lands `n` in the
  host's `ref` **before `resolveOpt`**, so `coinSlider`'s single `logQuantity()` call records a
  remote drag exactly as it records a local one. **A bare number still works** — `withShotClock`
  force-resolves with a plain `0` and that path is unchanged.

**Measured, both tiers, same prompt shape:**

| | HOST / local (`shots/t5-solo/05-dragged.png`) | GUEST (`shots/t3-after/03-mid-round-guest1.png`) |
|---|---|---|
| back "‹" circle | present, left of the pill | present, left of the pill |
| ask pill | "Ye're GIVIN' 🥛 Fresh Milk **+ 3🪙** for 🌾 Toasty Wheat" | "test2: ye're ASKIN' 🍬 Crystal Sugar for yer 🌾 Toasty Wheat" |
| the bar | orange track, round thumb, readout at the right | identical |
| the arc | **one** circle: "Offer it!" | **one** circle: "Ask it!" |
| reveal order | back → message → slider → button | back → message → slider → button |

**The same picture with a different captain's name in it.** For contrast,
`shots/t2-before/03-mid-round-guest1.png` is the guest BEFORE: three circles in the arc — "Ask it!",
"+ 1🌕", and a greyed "− 1🌕" — no bar, no readout. **Those ± circles in the arc are what playtest 21
took out of the host's arc and what nobody had noticed were still in a guest's.**

**The number reaches the log.** Solo dlog after a drag to 3: `[0,0,[7,5],0,0,0,0,3,0]`. Crew, two
guests each countering with a crate + 2 coins: `[…,1,0,0,2,1,0,0,2]` — one symmetric triple per
holder, the `2` being the dragged number. That is HARD-WON-LESSONS §5's exact failure (the captain
dragged to 6 and the log gained `[0]`) not recurring, **by construction rather than by care**.

### ⚠️ 3 (MP-09) — the NUMBER is met; the DESIGN DEFECT is not

**Criterion 3 as written — "nobody watching '…is deciding…' for over two minutes" — is met.** The
thing that blew past it was never the holder count; it was the stepper, which put **52.6 seconds** of
unbroken dead screen in front of the asker for **one** captain making **one** counter. That is gone.
Three holders each burning the full 30-second shot clock is 90s, under the bar.

**But holders are still asked one at a time, and that is the defect the criterion was pointing at.**
Two holders each making a full counter cost 40.7s and 32.0s of unbroken `…is deciding…` on the host,
measured on the shipping build. **`collectTableAnswers` was not built. The answering loop still
exists TWICE** — `humanTrade` and `botOpenTradeLive`, byte-identical but for a `worthReAsking`
filter. See §7 for why I stopped, and what it is worth.

### ⚠️ 4 — the LENGTH half landed; the ORDER half did not

**Length: done, and it arrived through criterion 2.** Deleting the stepper removed the last thing
that made the decision log's size depend on how a trade was routed *or* on how many coins were asked
for. Measured: an 8-coin remote counter was **+12** entries and is now **+4**, which is what an
identical local counter has always cost.

**Order: untouched.** With the answering loop still sequential, each holder's entries are still
written inside the loop rather than after the round in a fixed pass. Nothing regressed — this is the
same ordering the game has always had, and `dlog_replay_test.js` is green — but the *routing
independence* criterion 4 asks for is only half delivered.

### ✅ Solo and pass-and-play both play a complete trade

The two modes a two-tab test cannot see by construction (`room === null`).
`4/scripts/local_trade_probe.mjs`, one browser, `shots/t5-solo` and `shots/t5-pnp`:

- **Solo** — offer built, coins **dragged** to 3, the pill re-stated the deal
  (`"Ye're GIVIN' Fresh Milk for Toasty Wheat"` → `"…Fresh Milk + 3 for Toasty Wheat"`), the answer
  round named the terms in full before anything was tappable (*"the table answers: Crustbeard takes
  yer Fresh Milk + 3"*), and it settled. dlog carries the `3`.
- **Pass-and-play** — the same, with `passAndPlay=true`, settled, dlog carries the `3`.

### ✅ The determinism door is still open

Nothing the engine emits changed. Every edit is UI/orchestration tier. `4/scripts/fixtures/` still
does not exist. `respondToOffer`, `counterTerms`, `settleTrade`, `noteDemand`, `rememberRefusal` and
`refusedFlagWanted` are called in the same order with the same arguments; the coin count crossing
`settleTrade` is a number and always was. **Where the player dragged is a UI-tier fact.**

---

## 5. GATES — RED FIRST, EVERY TIME

**`scripts/host_guest_parity_check.js` gains two rows, both watched RED against the pre-task tree
reconstructed from `HEAD` before they were added:**

```
FAIL assertion 6 — orchestration parity [STRICT]
      sliderWrapHTML     listeners=0  host-loop=0  shared
      wireSlider         listeners=0  host-loop=0  shared
  - PARITY-ORCH-ABSENT: sliderWrapHTML( is not called anywhere …
  - PARITY-ORCH-ABSENT: wireSlider( is not called anywhere …
```

Green on the shipping tree at `listeners=1 host-loop=1` on both. `--drill` passes all six assertions.
Two rows rather than one because markup and wiring are separately droppable: a tier that builds the
bar without wiring it renders a **dead slider** — a failure class the playtest gate already counts.

**`4/scripts/dlog_quantity_check.js` was re-anchored and widened, and it went RED by name first:**
deleting `coinStepper` made `body("coinStepper")` null and the gate failed on `coinStepper() exists`
before anything was edited. It now scans **`util.js` as well as `flow.js`** — TRADE-SYSTEM I4's
corollary, *list what reads a quantity, gates included* — with seven new assertions, **each drilled
by planting the fault and watching it fire**:

| drill | fired |
|---|---|
| a second `.apSliderWrap` markup copy appears | ✅ |
| `coinStepper` is put back | ✅ |
| a THIRD writer of `ref.value` in util.js | ✅ |
| `ask()` stops landing the remote number in `ref` | ✅ |
| util.js starts READING the running position | ✅ **(after a fix — see below)** |
| `coinSlider` stops logging its confirm | ✅ |
| the comment stripper blanks a file | ✅ |

**One of those drills caught a vacuous assertion I had just written.** "util.js reads `ref.value`
nowhere" reused a regex carrying a `(?<!\.)` lookbehind written for a bare local `ref` in flow.js.
Every reference in util.js is reached through an object (`sl.ref.value`), so the lookbehind blocked
the match and **the assertion could not fire for the one shape it existed to catch.** It passed the
drill by doing nothing. Fixed with its own regex; a check that cannot fail still reads as protection.

**And the widened gate then failed on my own prose** — HARD-WON-LESSONS §1b's exact trap, *"a check
that cannot tell prose from code makes writing the explanation an offence."* The sentence documenting
what the control does contains the literal `sl.ref.value`. It now strips comments through the shared
`js_region_tokenizer`, and prints **45,948 code chars of flow.js and 45,243 of util.js** so a run over
a blanked file cannot hide.

**`npm test`: 30 gates, 8 reading `4/`, exit 0.** Also green: `no_undef_check`, `seat_arg_check`,
`stage_import_check`, `module_graph_check --tree=4`, `net_contract_check --tree=4`,
`state_contract_check --tree=4`, `engine_contract_check --tree=4`, `dlog_replay_test`,
`prompt_field_parity_check`, `gate_citation_check`, `lib_twin_check`.

---

## 6. THE TWO INSTRUMENT FAILURES — both mine, both nearly reported as game bugs

Recorded because a QA layer is unreviewed code that nobody plays.

### A prompt that was in the DOM and not on the screen — and was NOT a bug

Two solo screenshots showed **no prompt at all** while the state read at the same instant said the
slider was present with `max=6`. That reads exactly like a game-stopping layout fault, and it is the
class rule 19 exists to catch. **I did not report it.** Instead:

1. **Measured the geometry** rather than theorising: `#pp4Prompt` was `display:none`, every rect
   `0×0`. Never `offsetParent`.
2. **Reproduced it on the PRE-TASK tree** by checking out `HEAD`'s three files and re-running the
   same probe — identical. So not a regression from this work.
3. **Sampled it over time**, because a still frame cannot tell "hidden" from "not revealed yet":
   **3 of 32 samples `none/0x0`, 29 `block/691×950`.** The layer is hidden for roughly the first
   **750ms** of a prompt's life while it reveals.

**The DOM read that says "the slider is there" is true three quarters of a second before a captain
can see anything, and my `shot()` fired straight after it.** The probe now waits for the paint. This
is written into `docs/DISPLAY-RULES.md` §2 so the next person photographing a prompt does not pay
for it again.

### I DELETED EVERY SCREENSHOT — the same zsh trap, a third time in one night

Pruning 95MB of captures down to the load-bearing ones, I wrote `for f in $KEEP` with `KEEP` a
space-separated scalar. **zsh does not word-split an unquoted scalar**, so the loop saw one giant
filename, copied nothing, printed one `MISSING:` line, and the `find -delete` on the next line then
removed all 111 images. **This is the identical trap that had produced the nine phantom gate
failures twenty minutes earlier, and I had already written that one up in this very document.**
Reading a lesson is not applying it (HARD-WON-LESSONS §0).

Recoverable, and recovered: the probes are deterministic apparatus, so the evidence was regenerated —
including the BEFORE picture, which needed the pre-task tree checked out again. **The re-run
reproduced the original numbers** (11 distinct prompts, 60.9s vs 61.2s, +12 dlog, 8 taps), which is
itself worth having: the headline A/B is repeatable, not a single lucky sample. The prune now builds
a zsh **array**, counts what it staged, and refuses to delete anything if fewer than eight images
were copied.

### Nine gates "failing" while `npm test` passed

A verification loop reported **9 of 9** gates red seconds after `npm test` exited 0. A uniform
failure rate is diagnostic — 9 of 9 is never a property of the thing being measured. The shell is
zsh, which does not word-split an unquoted `$g`, so every command name was the whole string. Re-run
with `eval`, all fourteen green, **and a deliberately failing control added** to prove the harness
can still report a failure.

### The driver-oscillation hazard — CONFIRMED, observed live

`project_mp_rig` records that a first-live-button driver oscillates `+1 / −1` forever on the remote
stepper. **It reproduced in this tree and cost a 240-second run.** The generic tick took the first
live button, which on the stepper is `− 1`; the next tick found `− 1` greyed at the floor and took
`+ 1`; the tick after found `− 1` live again — with the host reading *"test2 is deciding…"* for four
solid minutes behind it. Fixed by giving the tick mp_rig's own prefer-the-committing-circle rule.
**Task 3 removes the control that causes it. That is a benefit of the deletion, not a goal of it.**

---

## 7. WHAT DID NOT LAND, AND WHY — Task 4, the parallel answering round

**I did not attempt it, and this is the decision I most want overturned if you disagree.**

**What it would buy, measured:** each additional holder currently adds their own thinking time plus
~4.8s of plumbing, in series. Two holders both countering = 40.7s and 32.0s of unbroken
`…is deciding…`. Parallel, that becomes roughly one holder's cost — call it ~20s and ~16s. **Real,
and worth doing.**

**Why I stopped, in three parts:**

1. **The plan ranks it last for a reason it states plainly** — *"the only one that restructures a
   path the game already plays correctly … a half-done parallel round is a stalled table."* You were
   asleep, `main` is what you play on your phone, and a stalled crew table is the worst thing I could
   have shipped tonight.
2. **The measurement moved the premise.** The plan assumed holders-in-series was the pacing wall. It
   is not the big half: the stepper was **52.6 seconds of dead screen for ONE captain**, and a further
   holder is **~5**. Task 3 removed 36 seconds; Task 4 removes ~5 per extra captain. Task 4 is the
   smaller half and carries all the risk.
3. **Criterion 3's stated bar is already met** on the measured plumbing (§4).

**It needs:** a per-seat dispatch on `draftPrompts/<seat>`, a widened draft payload (`disabled`,
`why`, `sub`), one narration line with per-seat variants, a clock discipline on the asker, a replay
short-circuit consuming the log in holder order, counters run sequentially after the round, and a
reordering of the decision log. Each is a place a table can stall. `recipeDraftNet`
(`4/src/orchestrator.js:921`) is the working precedent for every one of them.

**One reversible choice recorded in advance, so Task 4 inherits it:** a captain who DROPS mid-round
should be resolved by **the asker's existing 30-second shot clock**, not by a new per-seat
`onDisconnect`. The alternative resolves in ~2.5s instead of up to 30s, at the cost of a new writer
pair and the stale-handler hazard the plan itself names in capitals — a missed cancel forfeits an
answer a captain actually gave. Faster is better, but not at the price of a new way to lose a real
answer.

---

## 8. RECORDED PER D-56 — decided from the documents, never queued

| Question | What settled it | The alternative, if you prefer it |
|---|---|---|
| Does a guest get the real slider, or is the stepper an acceptable fallback? | **Not open.** Rule 23 / DISPLAY-RULES §1, rule 8, and D-55 in your own words. The ROADMAP line offering it as a choice was stale and has been rewritten in the open. | none — you have ruled twice |
| Should `fmt` be dropped for remote seats since it is a closure? | TRADE-SYSTEM §4: the pill re-stating the deal is why the number is never read in isolation. Pre-rendered into `texts`. | send a bare number; a guest then has a different control again |
| Does an object on the `response` node need a new channel? | 04-01 established `{g:[…],w:n}` crosses unchanged. | a new node — unnecessary |
| Convergence of `ask()` itself (prompt fork 2)? | DISPLAY-RULES §4 records it unconverged and 02.15-02 parked it over the flip-ceremony `__pp4.flipMsg` landmine. Scoped to the slider only; §4 now says **which half** converged. | converge the fork — a separate piece of work with a named landmine |
| Task 4 | Judgement, not a ruling. Recorded in §7 with its measured value. | do it next session; nothing here blocks it |
| A dropped captain mid-round | Judgement. The asker's clock over a new onDisconnect. | the per-seat writer pair, ~2.5s instead of ≤30s |

### The pass-and-play question — OBSERVED, and recorded as NOT a defect

The plan raised a hypothesis from source and forbade reporting it unmeasured: at a shared device,
does a second human holder's trade-answer prompt appear **without** the pass-the-device screen?

**Observed** (`shots/t5-pnp`, and written down as seen): captain Crustbeard hailed the table on their
turn, and test1's answer prompt — *"test1: Crustbeard offers Fresh Milk + 3 coins for yer Toasty
Wheat"*, Accept / Counter / Deny — appeared on the same device with **no hand-off card**. Confirmed.

**And I am recording it as correct, not as a bug.** `passGate` returns immediately for the seat whose
turn it is, and it exists to stop *private* information reaching the next captain — recipe choices,
per its own comment. TRADE-SYSTEM §1 says every captain's cargo and purse are public and that
**responders do not spend a turn answering**. So a trade answer is neither a turn nor a secret, which
is what `passGate` guards. Gating every holder would cost up to three hand-off cards per hail at a
four-seat table, for information already on the board.

**This is the one I am least sure of, and it is a taste call, which is yours.** If you would rather
each captain took the device to answer, it is one `await passGate(q.idx)` in the answering loop —
and it belongs in Task 4's restructure, where the sequential branch already exists.

---

## 9. DEVIATIONS FROM PLAN

**[Rule 3 — blocking] The plan's Task 1 probe design had to change.** `?ovens=1` — the flag
`crew_bake_probe` uses — stocks every hold to a full recipe, so the first run put every captain
straight at the ovens and no action menu ever appeared. A full hold is precisely the state in which
nobody trades. Dropped for this probe, and written into its header.

**[Rule 3 — blocking] The trade is POSED, not played for.** A bot hails ~2.45 times a *game*, so
waiting for one is minutes of driving per sample. The probe parks the turn loop on the host's own
**local** prompt (which never touches `rooms/<CODE>/prompt`, so the wire is free), poses the holds
against `g.ings`, and stubs `botOpenOffer` for exactly one call. **Only the proposer is posed** —
`noteDemand`, the `openoffer` event, the answering loop, `counterTerms` and `settleTrade` all run for
real. Hail volume is never measured there; that is `trade_offer_measure.js`'s job, headless.

**[Rule 2 — missing coverage] The quantity gate would have gone vacuous.** `ask()` now writes
`ref.value` from `util.js`, a file the gate did not read. Widened in the same commit — otherwise it
would have kept passing while a second writer existed.

**Task 4 not attempted** — see §7. Not a deviation discovered mid-flight; a judgement recorded in the
open, and the plan's own abandonment ladder anticipated stopping here.

---

## 10. SAFETY

- **Nothing outside `4/`, `scripts/`, `docs/` and `.planning/` changed.** Proven with
  `git status --short` before committing; `CNAME`, `robots.txt` and `sitemap.xml` untouched.
- **Every Chrome and server this run started was killed** — `pgrep` reports 0 of each.
- **11 screenshots are kept, not 111.** The full set was 95MB, which does not belong in a repo that
  serves a website. Kept: the guest's stepper and the guest's slider on the same prompt (the whole
  MP-08 argument, side by side), the host reading `…is deciding…` behind each, the local slider in
  solo and pass-and-play, the pass-and-play answer prompt, and both guests' screens at the moment a
  two-holder round opens. **Every log.txt and result.json is kept** — those hold the numbers this
  document quotes, and the raw 200ms sample traces behind the four spans it cites.
- **No crew voyage was driven to an end of voyage**, so no permanent `gamelogs` row was written.
  Every room was deleted by the probe's own exit path, including on a throw.
- Chrome profiles were written to `os.tmpdir()`, never under `--out`.
- `PP4_STAMP` is **`2026-08-23c`**.

---

## Self-Check: PASSED

`05-01-SUMMARY.md`, `4/scripts/crew_trade_probe.mjs`, `4/scripts/local_trade_probe.mjs`,
`baseline-hails-before.txt` and `baseline-hails-after.txt` all exist on disk. `npm test` exits 0 with
30 gates, 8 reading `4/`. `coinStepper` exists nowhere in `4/src/` except in four comments explaining
its deletion. No headless Chrome and no `http.server` this run started is still alive.
