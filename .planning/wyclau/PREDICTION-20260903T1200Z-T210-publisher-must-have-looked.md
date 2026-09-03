# PREDICTION — can the publisher be made to prove it looked at his page?

**Written 2026-09-03T12:00Z, before touching anything.** Ninth prediction of the session.

## THE FAULT (`T-210`, filed off the live receipts)

```
LAST-HARVEST  11:22:00.631Z  version 1788433599-0141  stamped by THIS session
LAST-PUBLISH  11:22:29.562Z  version 1788434543-bb7a  by a PEER session
```

Twenty-nine seconds, two sessions, and the peer never stamped a harvest of its own. The publish
hook allowed it because the stamp's MTIME was fresh — and the stamp is **machine-local**, so every
session on this machine shares one. **One session's look licensed another session's overwrite.**

## WHAT I EXPECT

**`mark_glass_published.mjs` should require the same `--harvested=<file>` that
`mark_glass_harvest.mjs` now does (`T-140`), and refuse unless the harvest receipt names that same
file.** A session that never read the page has no such file to name, so it cannot stamp — and the
Door's publish step ends on that command.

**And the identity is FREE, which is the part I want to check rather than assume.** The Artifact
tool saves each read under the reading session's own directory:
`…/projects/<project>/<SESSION-ID>/tool-results/artifact-<id>-<version>.html`. **The session id is
already in the path**, so passing another session's file is a deliberate act (you must go and find
it), not the accident that happened tonight.

**This does not close the race and I must not claim it does.** He can still write in the seconds
between a read and a publish; nothing short of a transaction on his page fixes that. What it closes
is the case where **the publisher never looked at all**, which is the one that actually happened.

## WHAT WOULD PROVE ME WRONG

1. **If `mark_glass_published.mjs` is driven by something that legitimately cannot read the page.**
   A Bell-launched watch has no Artifact tool on some machines. If such a watch stamps publishes,
   a mandatory flag WEDGES THE ONE SURFACE HE STEERS FROM — the exact failure `receipt_version_is_identity_check`'s
   own header warns about. **Check every caller before making it mandatory**: gates, hooks, the Door,
   `bell.ps1`.
2. **If the session id is not in the path.** The whole "identity is free" half rests on that. If
   reads land in a shared directory, passing another session's file is indistinguishable from
   passing your own, and the flag proves only that *somebody* looked — which is exactly what
   `LAST-HARVEST`'s mtime already proves. **Verify against the real files before designing on it.**
3. **If it is vendored and the project may not edit it.** `MANIFEST.sha256` lists this file. If the
   lock still points outward, the fix belongs in claude-kit and I must say so rather than edit here.

## THE TRAP

**A mandatory flag on the last command of the publish path can wedge his Glass.** Every previous
refusal added this session (`--rulings=`, `--harvested=`) broke sibling gates that drove the tool
with older fixtures — twice, and both times the gates were right and only their fixtures were
stale. **Expect it again, find every caller FIRST, and fix the callers rather than loosening the
refusal** — a refusal relaxed for a test is not a refusal.

**Second trap, sharper and specific to tonight:** I have now written five instruments that could not
tell success from never-ran. **The check I am about to add must not be able to pass because a file
was unreadable, a path was empty, or a comparison matched two blanks.** An empty `--harvested=`
against an empty receipt field must REFUSE, not agree.

---

## THE RESULT — both traps fired, and the first one nearly shipped

**Falsifier 2 — CLEARED FIRST, because the design rested on it.** Each session's Artifact reads land
under its own `…/projects/<project>/<SESSION-ID>/tool-results/…` directory. The identity really is
free.

**Falsifier 3 — CLEARED.** `vendor_check` reports *"PASSED (with drift) — 8 ahead"*: his ruling
inverted the lock, so the project owns its copy and the fix belongs here.

**Falsifier 1 — the callers.** Two gates drive the writer and both broke. **Neither was wrong**;
both had fixtures predating the flag. Fixed by seeding a harvest receipt in each sandbox, never by
loosening the refusal.

### ⛔ THE TRAP FIRED AND I ALMOST SHIPPED IT

The trap: *"a mandatory flag on the last command of the publish path can wedge his Glass."* It did.
`LAST-HARVEST` stored only `artifactVersion`, never the FILENAME — **so the SUCCESS path refused
too, and no publish could ever have been stamped again.**

**And I nearly recorded it as working, because I read a PIPELINE's exit code instead of node's.**
`node … | tail -1; echo $?` reports `tail`'s status. The output said *"Nothing was written."* and
the number beside it said `0`. **That is the sixth instrument fault of this session — in the hour
after writing `HARD-WON-LESSONS` §14 about the first five, and it is the same fault CEO 166 had
caught in a reviewer earlier the same night.** Only re-running without the pipe exposed it.

`mark_glass_harvest.mjs` now records `harvestedFile`; case 3 fails if a legitimate publish is ever
refused, and case 6 fails if either half of the join is removed.

### THE SECOND TRAP HELD

*"An empty `--harvested=` against an empty receipt must REFUSE, not agree."* Case 4 covers it and
passes. **And measuring the guard rather than trusting it found the guard is unreachable:**
`basename(resolve(""))` returns the current directory's name, never `""`, so the empty case is
already caught one guard above. Reported as an equivalent mutation rather than counted as a kill,
and labelled unreachable in the source — **a guard nobody can reach reads as protection and is
not.**

**4 of 5 mutants killed**, including one asserting the refusal carries the RIGHT MESSAGE: deleting
the missing-flag guard still refuses, but tells the session to fix a receipt fault that does not
exist. *"It went red" is not enough when the message is what the next session acts on.*

---

## WHAT CEO 168 FOUND — and it is the sharpest verdict of the night

⛔ **1. THE GUARD WAS A *VERSION* JOIN, NOT A *SESSION* JOIN.** The design rested on *"the session id
is already in the path"* — and `basename()` **threw the path away, one character before it would
have been used.** Measured by CEO 168: session directories routinely hold byte-identical basenames
for the same Glass version — one version in three of them, eleven more in two.

⛔ **2. THE INCIDENT IT IS NAMED FOR WOULD STILL HAVE PASSED.** From the read files' own mtimes, the
peer had that page on disk at **11:22:15Z, fourteen seconds before it stamped.** Naming its own copy
would have matched a receipt written by a different session. **The fix would not have refused the
event it was filed off.** Now it does — verified against the two real session directories that
still hold that version: naming the peer's copy against my receipt exits 1.

⛔ **3. "THE DELETION" WAS OVERCLAIMED IN FOUR PLACES.** The destructive act is the Artifact
republish, gated only by `glass-harvest-first.cjs`'s mtime check — machine-local, shared, and
untouched by this. **A session that never looked can still publish and still delete his words. What
it can no longer do is file a clean receipt afterwards.** Corrected everywhere; the remaining half
needs the hook, which lives under `.claude/` and needs Wyatt's own hands.

⛔ **4. "`!want` IS UNREACHABLE, MEASURED" WAS FALSE.** I measured `basename(resolve(""))` — the
wrong input. `basename(resolve("C:\"))` is `""`, so the guard was load-bearing while labelled
settled. **A behavioural claim in a comment, which is exactly what rule 6's other half forbids.**
The value it guarded is now deleted rather than defended.

⛔ **5. THE COMPARISON LET EIGHT CHARACTERS THROUGH** — `--harvested=artifact`, and even
`harvestedFile`, a KEY inside the receipt. The sibling half one file away had it right the whole
time. **And my first fix traded that for a worse dependency**: an anchored string match on
`"harvestedPath": "…"` — *with the space `JSON.stringify(obj, null, 2)` happens to emit*. A
compactly-written receipt then matched nothing and every publish was refused again. **A needle that
depends on someone else's whitespace is not an anchor.** It parses the JSON now.

⛔ **6. CASE 6 GREPPED THE HARVEST SCRIPT INSTEAD OF RUNNING IT** — the §14 fault inside the gate
written an hour after §14. Rename the field and leave the word in a comment, or hardcode the path,
and the gate printed PASS **while every legitimate publish would be refused.** It now walks the
whole three-step chain for real: carry → harvest stamp → publish stamp.

⛔ **7. HALF THE RUNBOOK WAS LEFT BEHIND** — `GLASS-UPDATE-SESSION.md:321` (the tick's entire
prompt), `glass.mjs:1911` (the instruction printed on screen at publish time), and this script's own
no-version remediation line. **A tick following its own runbook would have been refused.** All three
updated.

**9 of 9 mutants killed**, including all three CEO 168 found surviving, plus a tenth (`empty
harvestedPath`) that survived the round after and now dies at its own case.

### THE PATTERN, STATED ONCE

**Every one of the seven is the same shape: a join with one half done.** Score widened, report not
(CEO 166). Harvest anchored, publish not. Door updated, runbook not. Field recorded, path not.
**This item was itself a join, and I built it half at a time — four times in one hour.**
