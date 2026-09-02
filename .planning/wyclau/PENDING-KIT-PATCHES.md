# PENDING CLAUDE-KIT PATCHES — changes this repo needs that only the Mac can make

*The wyclau tooling in `scripts/wyclau/` and `.claude/skills/door/SKILL.md` is VENDORED from
claude-kit (see `.claude/wyclau/VENDORED-FROM`). `scripts/qa/vendor_check.mjs` fails the build on
any edit to those files here, correctly — the kit is the source and it lives on Wyatt's MacBook.*

> ### ⚠ THE STRUCTURAL PROBLEM THIS FILE EXISTS TO MAKE VISIBLE
>
> **The relay runs on the Razer. The tooling the relay runs on can only be fixed from the Mac.**
> So a watch that finds a bug in the Bell, the Glass, `can_push`, `close_item` or
> `start_trial_detached` can measure it, prove it and write the patch — and cannot ship it. Every
> such fix waits for a session on the other machine.
>
> **That is worth knowing before it is worth solving.** It has now cost two items in one day
> (below). If it costs a third, it is probably time to ask Wyatt whether the wyclau scripts should
> live in this repo and be vendored INTO the kit, rather than the other way round.

**How to apply:** from the claude-kit checkout on the Mac, edit the file named, then
`bash install.sh vendor <path to pastrypirates> wyclau`, then run `npm test` here. Delete the entry
below in the same commit. Each entry names the gate that will catch a re-vendor silently reverting
it, so nothing here can rot unnoticed.

---

## 1. The rulings card's empty state says "Nothing ruled yet", which is false

**File:** `scripts/wyclau/glass.mjs`, the "Your rulings, in hand" card — the `ruled.length === 0`
branch.

**Why now:** Wyatt's INBOX-20260901T1310Z gave that card a triage lifecycle, so the card is
*supposed* to reach zero — that is the success state, not the day-one state. The sentence under it
still reads "Nothing ruled yet", which tells him his rulings were lost rather than handled.

**Current:**

```js
: ruled.length === 0 ? `<p class="muted">Nothing ruled yet.</p>`
```

**Replace with:**

```js
/* AN EMPTY CARD MUST SAY WHERE THEY WENT. "Nothing ruled yet" was true on day one and became a
   lie the moment the triage lifecycle landed (his INBOX-20260901T1310Z): he would read an empty
   card as his rulings having been lost rather than handled. The Chart's ## SETTLED RULINGS
   section holds every triaged one, and the ones still owing work are in the Tasks card above,
   tagged "Your ruling:". */
: ruled.length === 0 ? `<p class="muted">Every ruling you have made is triaged. The ones that still need something from you are in Tasks, tagged <b>Your ruling</b>; the rest are finished. All of them stay on the record in the Chart's SETTLED RULINGS table.</p>`
```

**What catches a silent revert:** nothing — this is wording, and no gate reads it. It is the one
entry here that depends on somebody applying it. **The lifecycle itself is safe**:
`scripts/qa/rulings_triage_check.mjs` (in `npm test`) enforces the record's side and renders the
real page, so a re-vendor cannot undo the triage, only leave this sentence wrong.

---

## 2. Pulsing the Glass consumes GLASS-NOTE.md even when the session cannot publish

**File:** `scripts/wyclau/glass.mjs`, the note-relay step (it folds
`.planning/wyclau/GLASS-NOTE.md` into the page and resets the file to its template).

**The bug:** the reset is unconditional. A session with no Artifact tool — which is *every* watch
on the Razer so far, six consecutively — folds the note into a page it then cannot publish, and
clears the file anyway. The note reaches nobody and is gone from the only surface Wyatt can read.

**What it cost, twice in one watch (2026-09-01T19:29Z):** the previous watch's warning —
*"THE BLACK CONSOLE WINDOW ON YOUR SCREEN IS THE TRIAL. Closing it kills the run"* — was consumed
by a pulse, restored by hand, then consumed by the NEXT pulse in the same watch and not noticed
until CEO Review 77 found it. An 88-minute release trial was in flight at the time.

**Fix shape:** reset the note only when the page is actually published — i.e. when
`mark_glass_published.mjs` runs, not when the file is merely written. That is the same
*"writing the file is only half of it"* rule `glass.mjs` already prints at itself on every run.

**What catches a silent revert:** `scripts/qa/glass_note_relay_check.mjs` already exercises the
relay ("picked up once, gone by the second run"). Whoever applies this fix should extend that gate
with a case for the unpublished path, red-proofed, in the same commit.

---

## 4. The Watch never runs the Chartkeeper, because the Door is vendored

**File:** `.claude/skills/door/SKILL.md`, THE WATCH section, step 6 (the one that republishes the
Glass and runs `publish_status.mjs`).

**Why now:** Wyatt asked four times for the Chart to re-prioritise itself, and the tool now exists
and is green — `scripts/wyclau/chartkeeper.mjs`, spec at `.planning/SPEC-CHARTKEEPER.md`, gates
`chartkeeper_check.mjs` and `chart_model_agrees_with_glass_check.mjs`. **His instruction named two
possible homes: the Glass-update session, or the watch. The first is wired** (step 4b of
`.planning/wyclau/GLASS-UPDATE-SESSION.md` — REAP in report mode, and that file is not vendored).
**The second cannot be, from here.** The spec's split is deliberate: reaping is a judgement and
belongs where a human is looking; ranking is arithmetic and belongs where it can act unattended.
Until this patch lands, the arithmetic half runs only when somebody types the command.

**The exact insertion**, into the Door's watch step 6, before `publish_status.mjs`:

> **Re-prioritise the Chart before you publish it:**
> `node scripts/wyclau/chartkeeper.mjs --rank --sweep --write`. It orders the open list so the
> next-to-be-completed is at the top, gives every row a `why-now:` phrase Wyatt can overrule, and
> moves rows done more than seven days ago into `.planning/CHART-LOG.md` behind a one-line stub.
> **It never ticks a box** — closing stays yours, behind `close_item.mjs`. Include `CHART.md` and
> `CHART-LOG.md` in the commit you were already making.

**What catches a silent revert:** nothing today, and that is stated rather than papered over —
`vendor_check.mjs` compares the Door against the kit's hash, so it enforces that the two MATCH, not
that either one contains this line. **Whoever applies this should add the wiring case to
`scripts/qa/chartkeeper_check.mjs`** (assert the Door's watch section names `chartkeeper.mjs`),
red-proofed by deleting the line and watching it go red, in the same commit. A capability nothing
checks is a capability that quietly stops running.

**One measured caveat for whoever applies it.** RANK re-orders rows *within the open-row slots the
file already has*, so headings, prose and done rows never move. It cannot reorder ACROSS the two
sections the Glass concatenates (`glass.mjs:386`: open checklist rows, then unfated inbox entries),
so a top-ranked idea still renders after every checklist row. Fixing that properly means converging
`glass.mjs` onto `scripts/wyclau/lib/chart_model.mjs` — which is patch 5.

---

## 5. `glass.mjs` and `chart_model.mjs` derive "what is open" separately

**File:** `scripts/wyclau/glass.mjs:374-393` — the `DECLARED`/`FATE_WORD`/`STILL_OPEN` fate test and
the `tasks = [...openChecklist, ...openInbox]` concatenation.

**Why now:** rule 23's design-time question is *what makes these two agree?*, and today the honest
answer is "nothing". `scripts/wyclau/lib/chart_model.mjs` is that logic extracted, with the fate
test's two recorded mistakes (one caught by CEO Review 63) carried across intact. **The Chartkeeper
already uses it; the Glass cannot, because it is vendored and the kit is outside the Razer session's
allowed directory** — measured, not assumed: an `ls` of the kit path is refused outright.

**Fix shape:** `import { parseChart } from "./lib/chart_model.mjs"` in `glass.mjs`, delete the
duplicated block, and vendor `lib/chart_model.mjs` alongside it (it will need adding to the kit's
wyclau file list and therefore to `MANIFEST.sha256`).

**What catches a silent revert:** `scripts/qa/chart_model_agrees_with_glass_check.mjs`, which
already exists and already runs in `npm test`. It builds a throwaway tree, runs the REAL `glass.mjs`
against a fixture Chart and compares the number it renders to the number the model computes — so
the two drifting apart is a red gate rather than a silent wrong list. Red-proofed by removing the
inbox half of `tasks`: it fails with *"the Glass says 4 open and chart_model says 3"*. After this
patch that gate becomes a tautology and should be **retired**, not kept — which is the correct end
state, because one function cannot disagree with itself.
