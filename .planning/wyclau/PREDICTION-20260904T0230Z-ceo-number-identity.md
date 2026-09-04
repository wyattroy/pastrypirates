# PREDICTION — 2026-09-04T02:30Z — a CEO number is not an identity, and the reader guesses

Written BEFORE the fix. His ask, verbatim: *"fix: Eight CEO numbers are used twice (31, 38, 73, 82,
83, 107, 135, 182), so --ceo=82 can resolve to the wrong verdict and the traceability check can then
pass against it."*

## What I have already measured (not predicted — these are counts, run before writing this)

- **185 verdict headings, 177 distinct numbers, 8 duplicated** — exactly the eight he named.
- Every pair is **two genuinely different reviews**, not a heading typo. E.g. `CEO 82` is both
  *"INBOX-20260901T1335Z part (c), RESIZE — VERDICT: NO"* (L13512) and *"the change-gate and the
  echo tick it grew"* (L13710).
- **51 pointers outside `CEO-REVIEWS.md` already cite these eight numbers** — CEO 83 alone has 15.
  Written by `close_item.mjs:262,282,300` into the Chart, the INBOX and the ledger.

## What I expect

1. `close_item.mjs:189` uses `.find(...)`, which returns **the first match and never says there was
   a second**. So `--ceo=82` silently resolves to whichever section appears first in the file, and
   the traceability check at :198 then passes or fails against a verdict nobody chose.
2. **Renumbering is the WRONG fix and the measurement above is why.** Fixing the record means
   rewriting 51 pointers, each of which has to be attributed by hand to one half of a collided
   pair. That is a large, error-prone edit to an append-only historical record, and it would be
   done to satisfy a gate rather than to help a player.
3. **THE DEFECT IS SILENCE, NOT DUPLICATION.** A duplicate that makes the reader *refuse* is
   harmless — it stops, names both, and a human picks. A duplicate the reader resolves by position
   is a wrong verdict certified as the right one. So the fix belongs in the READER, and once it is
   there, a ninth duplicate is equally harmless without anyone maintaining a list.
4. I expect **no gate should fail the build on the existing eight.** Failing on history nobody can
   cheaply fix is noise, and noise is how a suite stops being read.

## What would prove me WRONG

- **`.find` is not what runs** — a later branch already disambiguates → the live bug does not exist
  and this is a documentation item.
- **Something DOES depend on position resolving silently** — e.g. a script that closes items in bulk
  against historical numbers → refusing would break a working path, and I would need `--ceo-line=`
  or similar rather than a bare refusal.
- **Fewer or more than 51 pointers, or a pointer format I have not seen** → my "renumbering is
  expensive" argument is weaker or stronger than I claimed, and the recommendation may flip.
- **A duplicate turns out to be a typo rather than two real reviews** → then repairing the record IS
  the cheap fix for that pair and I have over-generalised.

## The trap I am naming

I have just been caught twice tonight for red proofs that tested the SHAPE of a thing rather than
the DECISION it carries (CEO 192 on the Bell's model; my own six-vs-two miscount). **The tempting
shallow version here is a gate that asserts the word "duplicate" appears in close_item.mjs.** The
real proof is to DRIVE the closer with a genuinely ambiguous number and watch it refuse — and to
drive it with an unambiguous one and watch it still work, because a refusal that fires on everything
is not a refusal.

## What I will NOT do

Renumber the eight, or add a hand-kept allow-list of "known historical duplicates". A hand-kept list
of what to guard rots exactly like the thing it guards — this file has said so since the cutover
broke six instruments at once.

---

## OUTCOME — measured

**Every prediction held, and no falsifier fired.** `.find()` was what ran (`close_item.mjs:196`);
nothing depends on positional resolution; the pointer count was 51 across the Chart, INBOX and
ledger; and all eight pairs are two genuinely different reviews, not typos.

**The live demonstration, which is better than the argument.** The red proof reverted `filter` to
`.find()` and re-ran the gate — the fixture **actually closed the item** against an ambiguous CEO 9,
writing `- [x] repair the dock ramp (closed … · CEO 9 · commit 34d27e6)`. Both fixture verdicts were
deliberately built to pass traceability, so the old code sailed through every downstream check with
a verdict nobody chose. *That is what "resolves to the wrong verdict" looks like when you make it
happen instead of describing it.*

**The trap I named was avoided, and it was worth naming.** The shallow version — grep
`close_item.mjs` for the word "duplicate" — would have passed all three mutants. The proof drives
the real closer through the real fixture harness instead. 3 mutants, 3 killed, 0 survived, **0
no-ops**, and each killed at its own assertion:

| mutant | killed by |
|---|---|
| revert to `.find()`, drop the guard | the ambiguity refusal — *and the fixture closed against CEO 9* |
| refuse, but hide the two headings | "the refusal SHOWS both headings" |
| make the refusal blanket (`> 0`) | **the GREEN cases** — a refusal that fires on everything is not a refusal |

That third mutant is the one the previous two red proofs of this session lacked: it checks the fix
does not simply say no to everything.

**No ceiling raise.** The assertions went into `close_item_check.mjs`, which already drives the real
closer against a real fixture repo — the same move that avoided a raise on the Bell's model flag.
Suite stays at 134, `npm test` exit 0.

**What this deliberately does NOT do, stated rather than implied:** the eight collisions are still in
the record, and a ninth can still be created. Both are now harmless, because the reader refuses and
names them instead of guessing. Renumbering would mean re-attributing 51 pointers by hand to one
half of each pair — a large, error-prone edit to an append-only history, made to satisfy a gate
rather than to help a player.
