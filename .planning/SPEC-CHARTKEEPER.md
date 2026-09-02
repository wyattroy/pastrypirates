# SPEC — THE CHARTKEEPER

*Written by the Advisor 2026-09-02 at Wyatt's instruction: audit the Chart, design (do not build) a
system that keeps it re-prioritised, current, and self-pruning, wired into the process. **This is a
build spec for a Watch.** Highest priority after the item currently in hand.*

**His words, verbatim, this session:** *"audit the chart ('tasks') which has MANY completed tasks
still stale on it, and design -- BUT DONT BUILD -- a system that will dynamically reprioritize it,
update it, and move things around it that is built into this process somehow -- either with the
Glass Update Session, or in the watch."*

**And he has asked for this before — twice, on the Glass, and both asks are still sitting in the
IDEA INBOX marked "SCHEDULED":**

- **2026-09-02T00:59:32Z** — *"You need to update Tasks list dynamically — it is stale. Add this to
  your session that updates glass. Move The Lesson section below it."*
- **2026-09-02T03:49:02Z** — *"Make all tasks in The Chart expandable for fuller context. Let me
  write a comment under each one if I choose to. Order the list with the next-to-be-completed at the
  top. re-order the list dynamically. Remove items from the list after they are complete (eg. The
  Blade Hour -- can you derive whether or not this was completed, or do you need me to tell you?)"*
- Plus **03:45:45Z** (*"Move The Lesson to below Tasks"* — a repeat) and **03:46:13Z**
  (*"rename Tasks to The Chart (Tasks To Do)"*).

> **THAT IS THE FINDING ABOVE ALL THE OTHERS.** The fix for the Chart's inability to re-prioritise
> was itself filed on the Chart, marked SCHEDULED, and never rose. **A row that says SCHEDULED with
> no owner and no position in a queue is a parked row wearing a better word.** Whoever builds this
> should read that as the acceptance test: if the Chartkeeper had been running, this spec's own
> request — written by Wyatt, twice, unblocked, tiny — would have been at the top of the list.

---

## PART 1 — THE AUDIT, AS MEASURED

Counts read from the file, not remembered: **27 done · 29 open** — which is exactly what the Glass
says, because `glass.mjs:345-346,392` derives both by counting `- [x]` and `- [ ]` inside
`## STEP 1 CHECKLIST`, in file order, with no other logic of any kind.

### FIVE OF THE 29 OPEN ROWS ARE DEAD OR ANSWERED — 17% of what he reads

| line | row | why it is stale | evidence |
|---|---|---|---|
| **701** | *"THE STAGING DEPLOY IS THE ONE STEP A WATCH CANNOT TAKE … The fix is his … See BLOCKED ON WYATT"* | **He ruled YES at 2026-09-02T04:03:36Z.** BLOCKED ON WYATT is now empty and says so in its own body, so the row's pointer aims at nothing. The item became actionable four hours before this audit and nobody moved it. | `.claude/settings.json` still contains **zero** `Bash(bash …)` entries — verified by grep. Staging serves `2026.09.01.6`; the tree is `2026.09.01.8`. |
| **380** | *"RE-SAIL LAUNCHED 2026-09-01T19:14:17Z, verdict pending … do not start a second trial while pid 45256 is alive"* | The verdict landed hours ago, and a **newer** trial has since superseded it entirely. The row still warns a reader off a trial on account of a long-dead pid. | `.planning/SEA-TRIAL-2026-09-01T1914Z-Wy-Blade.md` exists and is complete; `.planning/wyclau/LONG-RUN` is **empty** — nothing is at sea. |
| **420** | *"THE RELEASE TRIAL'S EVIDENCE WAS RETIRED BY THE FIX … staging now needs another ~90-minute trial"* | **That trial ran and landed.** | `SEA-TRIAL-2026-09-02T0137Z-Wy-Blade` — build `2026.09.01.8`, 10 of 10 sailed, **NOT-RUN column empty**, and `2026.09.01.8` is the stamp in `src/ui/stage.js` right now. |
| **674** | *"Judge the 267 screenshots the release trial queued"* | **Judged.** | `.planning/JUDGED-2026-09-02T0152Z.md` and `-0219Z.md` are the accounts of that queue; `-0300Z.md` judged the newer queue 315 of 315. *(Honest caveat: 252 of the 1914Z run's 343 pictures were destroyed by an overlapping trial before judging — which is precisely open row 487, so the caveat has a home.)* |
| **647** | *"24-hour unattended engine run, zero silent stalls — GATED"* | **Superseded.** Row 74 says so in its own text: *"The 48-hour shakedown (DECISIONS ruling 14; **supersedes the 24h exit test**)"*. Two rows for one thing, and the dead one still counts against him. | CHART.md:74 |

### TWO MORE ARE PARTLY STALE

- **Row 60, "The Blade hour"** bundles three jobs (register the Bell · ring-test both directions ·
  the O2 publish test). **One is measurably done** — `schtasks /Query /TN "wyclau-bell" /V` shows the
  task registered and Enabled. That measurement exists, but it is buried **500 lines away** in the
  idea inbox instead of on the row. **He asked directly whether this was derivable.** The answer is:
  one third yes, two thirds need him — **and a bundled row can never be ticked**, which is a design
  fault in the row, not in the work.
- **Row 81, "the Glass's Ideas box corrupting the page — awaiting his look on the live page"** — he
  has since written to that page four times without corruption (03:50, 03:54, 04:03, 04:04Z saves,
  all present in the live `glassState`). That is his look, delivered as behaviour rather than as a
  sentence. **Worth one question, not an assumption.**

### THREE STRUCTURAL FAULTS, WHICH ARE THE REAL SUBJECT

**1 · The order carries no information.** File order is roughly the order things were *written
down*. Today the row nearest the top needs 30 minutes of Wyatt's time; the row nearest the bottom is
approved, unblocked, one line of config, and is the only thing between the tree and staging. Nothing
in the list says so.

**2 · Rows are essays, not tasks.** The sail-square row is **206 lines** under one `- [ ]`. The
End-of-Voyage row is 52. The Glass truncates each to a one-line summary, so what reaches his phone is
the first ~90 characters of a 200-line investigation — *"AND THE OTHER HALF OF THAT MEASUREMENT,
WHICH IS HIS QUESTION AND IS STILL OPEN: a…"*. **The content is excellent and unaddressable.** His
ask for expandable rows is the correct instinct: nothing is missing, it just has no handle.

**3 · Done rows never leave.** 27 of them, some a fortnight old, several hundreds of lines long.
CHART.md is 1,015 lines and roughly 60% of it is history. The `done` count grows forever and
therefore means nothing — *"27 done"* is not a fact about this week.

### WHAT IS GENUINELY OPEN AND CORRECTLY SO

The other 22, and several are strong: the trade-offer circle that cannot hold a captain's name
(three sightings, two engines, three sizes), the End-of-Voyage button hiding the award winners
(three phone legs, two modes, both engines, tablet clean as reference), the crew-phone guest that has
never actually been a phone, the money symbol split between emoji and image, `can_push.mjs` saying
yes to a push that is then refused, screenshots destroyed by the next trial, the build stamp that is
a hand-typed number. **The Chart's problem is not its content. It is that its content has no order,
no handles, and no exit.**

---

## PART 2 — THE DESIGN

### The one-sentence shape

**`scripts/wyclau/chartkeeper.mjs` — three passes over `CHART.md` (REAP, RANK, SWEEP) that derive
every judgement from facts the repo already holds, run on every Watch tick and reported on every
Glass tick, and never tick a box.**

### The enabling change: give each row a machine-readable head

Today a row is `- [ ] <essay>`. There is no addressable unit, which is why nothing can be sorted,
expanded, commented on or archived. Give each open row a small head and let the essay be its body:

```
- [ ] `T-041` **The staging deploy permission line** ⟨size:S · touches:config · needs:none⟩
      <the essay exactly as it is written today, indented, unchanged>
```

**Three hand-written fields only** — `size` (S/M/L), `touches` (game/instrument/config/process),
`needs` (none / wyatt / a named row). **Everything else is derived**, per Principle 6. The `T-nnn`
id is allocated once and never reused, so a comment, a CEO verdict and an archive stub can all point
at the same thing.

> **Why a head and not a separate index file:** Principle 1 — one of everything. A second file
> listing priorities is two things kept in step by discipline, and this project's own record says
> those always drift.

### PASS 1 — REAP (find the dead rows)

For each open row, ask a **derived** question, never read a stored flag:

| the row mentions… | the question asked of the world |
|---|---|
| a sea-trial report path | does the file exist, and is `LONG-RUN` empty (i.e. finished)? |
| a build stamp | does it equal `PP4_STAMP` in `src/ui/stage.js`? if older, **its evidence is retired** |
| a pid | is that process alive? |
| "See BLOCKED ON WYATT" | is there still a matching row there? an empty section means a dead pointer |
| a ruling | does it now appear in SETTLED RULINGS with a verdict? |
| `supersedes:` / "supersedes" | is the superseding row present and open? |

**IT DOES NOT TICK THE BOX. IT FLAGS.** It appends `⚠ STALE-CANDIDATE — <the derived reason>` to the
row and lists them. Ticking a box is a claim about *work*; the reaper only ever measures the
*pointer*. **An instrument that can erase work from the record is the exact fault
`mark_glass_published.mjs` had** — a stamp that could only say one thing. Closing stays a Watch's
job, behind `close_item.mjs` and a CEO verdict.

### PASS 2 — RANK (order the list)

Sort by a score derived entirely from the repo, highest first:

| signal | source | effect |
|---|---|---|
| **approved and unblocked** | a ruling in SETTLED/RULED says yes, and the work is not done | **floats to the very top.** The staging permission line would be #1 today, correctly |
| **blocked** | the row carries `GATED:` or `needs:wyatt` | **sinks to the bottom, always.** This alone fixes most of the present list |
| **player-facing** | the row cites a `src/` or `index.html` path | outranks instrument-facing (`scripts/`). *This is the rulebook's own THE POINT, made mechanical* |
| **evidence retired** | cites a build stamp older than `PP4_STAMP` | sinks — its measurement no longer describes the tree |
| **how often HE has raised it** | count of matching entries in `INBOX.md` / the idea inbox, which are timestamped | rises. Three sightings of the trade circle; two write-ins for "move The Lesson". **The best available proxy for what he cares about, and it is already on disk** |
| **size** | the head's `size:` | tie-break, small first, so the queue drains |

**Every ranked row carries a derived `why-now:` phrase** — *"approved, unblocked, one line"*,
*"player-facing, he has raised it three times"*. **An order he cannot read is an order he cannot
overrule**, and overruling it must stay trivially easy.

### PASS 3 — SWEEP (give done rows an exit)

Move every `- [x]` row older than **7 days** out of CHART.md into `.planning/CHART-LOG.md`, leaving a
one-line stub: date · title · CEO number · archive link. The Chart stops growing; the record loses
nothing; and the Glass's `done` count becomes **"done this week"**, which is a number that means
something.

### WHERE IT RUNS — his two options, and my recommendation is *both, with different authority*

| | **The Watch** | **The Glass-update session** |
|---|---|---|
| runs | **RANK + SWEEP**, and *acts* — rewrites the order, archives, commits | **REAP only, in report mode**, immediately after the harvest |
| why there | it already has write authority, a CEO gate, and `close_item.mjs` as a natural hook point | it is the only session that reads his live page, and reaping is a judgement about whether something **he is waiting on** has landed |
| output | a re-ordered CHART.md in the commit it was already making | stale candidates written into `GLASS-NOTE.md`, so he sees *"5 rows look dead, and here is why"* rather than a silent rewrite |

**The split is the point: ranking is arithmetic, reaping is judgement.** Put the arithmetic where it
can act unattended; put the judgement where a human is looking.

### THE GUARDRAILS THAT STOP THIS BECOMING THE NEXT THING THAT ROTS

1. **Never auto-tick a box.** Flag, then a Watch closes with a CEO verdict. (Principle 3; and the
   `mark_glass_published` lesson.)
2. **Red-proof both directions before it is trusted, and quarantine it until it has caught a real
   stale row nobody had noticed.** Plant a genuinely live row → it must be left alone. Plant a dead
   one → it must flag. A reaper that flags everything is as useless as one that flags nothing.
3. **Every ordering decision must be explainable in one phrase** (the `why-now:` string above).
4. **The Chartkeeper must be able to say "the Chart is fine."** A pass that always finds something is
   a pass that is measuring itself.

### WHAT WYATT GETS ON THE PAGE — his five 03:49Z asks, all satisfied by this

| his ask | delivered by |
|---|---|
| expandable rows for fuller context | the essay becomes the row's **body**; the Tasks card renders `<details>` |
| a comment box under each item | writes into the row's head as `note:`, harvested like any Glass write |
| next-to-be-completed at the top | RANK |
| re-ordered dynamically | RANK runs on every tick |
| completed items removed | SWEEP |

Plus the two already-scheduled Glass asks that belong in the same pass: **rename the card to "The
Chart (Tasks To Do)"** and **move The Lesson below Tasks** (asked twice).

### SIZING, HONESTLY

- **The Chartkeeper itself** (script + row-head convention + two wire-ups + gate): **MEDIUM** — call
  it a day for a Watch, most of it retrofitting heads onto 29 open and 27 done rows, not writing the
  three passes.
- **The Glass-side rendering** (expandable, per-item comment, rename, Lesson reorder): **SMALLER, and
  separate.**

> **RECOMMENDATION ON ORDER: ship the Glass-side half FIRST or alongside.** A perfectly-ranked list
> still reads as gibberish on his phone if every row is 90 truncated characters of a 200-line essay.
> The ranking is what makes the list *right*; the expandable rows are what make it *readable*, and he
> has asked for the readable half twice.

### WHAT THIS SPEC DELIBERATELY LEAVES UNDONE

- **It does not close the five dead rows.** They are named above with their evidence so a Watch can
  close them properly, each with its own CEO verdict per the after-every-item rule.
- **It does not add the staging permission line** to `.claude/settings.json`, though he ruled YES.
  That is a change to the one file that exists to be his, and it grants every future unattended Watch
  the ability to publish to a public address. **It should be the very first thing the Chartkeeper's
  own ranking surfaces — and a person should type it.**
- **It does not touch game code**, and nothing in it may bump `PP4_STAMP`.
