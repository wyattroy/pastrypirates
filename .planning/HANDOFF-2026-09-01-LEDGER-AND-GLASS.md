# Handoff → the Blade session · 2026-09-01

**Why a handoff at all:** the advisor session's git is blocked by a sandbox error
(`fatal: unable to access '.git/config': Operation not permitted`) on every command, read-only
ones included. The file is readable by the shell and permissions are normal, so it is the tool
sandbox, not the repo. **Everything below is finished and tested; none of it is committed.**

---

## 1. LAND THIS FIRST — a finished fix that keeps `npm test` green

**File:** `scripts/wyclau/glass.mjs` (vendored; the source of truth is claude-kit
`plugins/wyclau/bin/glass.mjs`, which lives only on the Mac — so apply this to the vendored copy
and re-vendor later rather than editing the kit from the Blade).

**What it is:** a NARROWING of a change I made earlier today. I taught the Glass to read a long-run
marker from any machine's `.planning/wyclau/status/<host>.md`. That broke
`scripts/qa/glass_longrun_status_check.mjs` — 3 assertions — because a MALFORMED, FROZEN or
absurd LOCAL marker would be silently answered by a healthy remote one. Those are findings about
THIS machine and must stay visible; the gate was right and I was wrong.

**The edit, at `scripts/wyclau/glass.mjs` around line 453** — the condition that guards the
cross-machine block changes from `if (!longRun) {` to the two lines below, with the comment:

```js
/* ⚠ ONLY WHEN THIS MACHINE HAS NO MARKER AT ALL — narrowed 2026-09-01, by a gate that was right.
   The first version ran whenever the local read produced nothing, which includes the cases
   glass_longrun_status_check exists to protect: a marker that is malformed, frozen past its own
   staleness, or claiming a year of allowed silence. Those are FINDINGS ABOUT THIS MACHINE, and
   quietly answering them with a healthy marker from another machine is precisely the green light
   nothing can turn off that the local reader was built to refuse. A broken local marker must stay
   visible as broken; only genuine ABSENCE (this machine is simply not running a long job) may look
   elsewhere. */
const hasLocalMarker = (() => { try { readFileSync(join(WY, "LONG-RUN"), "utf8"); return true; } catch { return false; } })();
if (!longRun && !hasLocalMarker) {
```

**Verify before committing:** `node scripts/qa/glass_longrun_status_check.mjs` (all green) and
`npm test` (exit 0). Both passed here before git died.

⚠ **This is DETECTION, and Blade is right that PUBLISHING was the live defect.** It is not a fix
for the stale page; it is a regression fix for my own earlier change. Land it because the suite
needs it, not because it makes the Glass fresher.

---

## 2. A FALSE BELIEF TO STOP REPEATING — measured on both machines today

Blade's message says *"detached watch sessions run glass.mjs but have no Artifact tool"*. **That is
false, and it was measured today on BOTH machines.** The command:

```
claude -p "Answer in one line only: is a tool named Artifact present in YOUR tool list right now? Answer exactly PRESENT or ABSENT."
```

Mac: `PRESENT: Artifact`. Blade (Wyatt ran it himself): `PRESENT`. So `-p` sessions CAN publish.
The five ledger entries claiming otherwise were sessions **reporting falsely about themselves** —
the most convincing-looking evidence available, and wrong five times. A watch that believes it
cannot publish will not try, which is the whole of the staleness. **Do not design around the
absence of a tool that is present.** Still unexplained, and worth one measurement rather than a
theory: why a session searching its own tools finds nothing.

---

## 3. THE LEDGER REDESIGN — approved by Wyatt, and CEO Review 74 changed its shape

Wyatt: *"do it — approved, but CEO it first."* CEO 74 returned **YES-WITH-CHANGES** and corrected
three things. Build the CHEAPER shape it recommends, not the four-way split I proposed:

1. **FREEZE `.planning/CTO-LEDGER.md` where it stands. DELETE NOTHING.** This is the blocking
   condition. `docs/INTENDED-BEHAVIOUR.md:98,111,118,127` cites the ledger **by line number**, as
   does `.planning/wyclau/AUDIT-process-machinery.md`. Deleting narrative silently breaks every one
   of those pointers, inside the very doc rule 28 sends readers to. Freezing costs nothing and
   every citation survives.
2. **Start per-machine claims:** `.planning/wyclau/claims/<hostname>.md`, **in the ledger's declared
   four-field format** (see `CTO-LEDGER.md` line 13). CEO 74's sharpest point: the format has
   ALREADY drifted — today produced 3 conforming lines against 11 prose sections — so a claims file
   that repeats the drift trades a cluttered instrument for a dead one.
3. **Point `scripts/qa/cto_supervise.mjs` at the directory.** It parses the four-field lines for
   open/closed counts (`:64-93`) and reads the heartbeat cadence from the ledger's own header
   (`:34`). Miss this and the supervisor goes blind.
4. **Add the claims path to `.claude/hooks/ceo-cadence-fence.cjs`'s `RECORD_ONLY` list** — in the
   SAME commit. It excludes `CTO-LEDGER.md` (`:44`) and `status/` (`:47`); a new claims path would
   otherwise count as reviewable WORK and push the CEO fence toward firing on bookkeeping.
5. **Ship a reader that generates the union**, or the split fails the charter's principle 1 —
   "one of everything" means one place to LOOK, not one file to write.
6. `scripts/wyclau/close_item.mjs:160` **appends to the ledger** and is guarded by
   `scripts/qa/close_item_check.mjs:60` inside `npm test`. Frozen ledger + still-appending close
   gate is a contradiction to resolve deliberately: either close_item writes to claims too, or the
   freeze means "no new prose" rather than "no new lines". **Decide it explicitly and write down
   which.**

**Corrections to my own proposal, for the record:** I said the ledger was 1,773 lines; it is
**2,090**. I said "86 entries today"; CEO 74 is right that this was a line count — the real figure
is roughly 16 entries. Both numbers were hand-typed from a stale read, which is the convention this
project has a rule against.

---

## 4. What is NOT in this handoff

The sea-trial redesign (one leg per watch — Wyatt's ruling today) is designed but unbuilt, and is
the larger piece. It needs its own CEO pass before anyone writes code. Do not start it as part of
this handoff.
