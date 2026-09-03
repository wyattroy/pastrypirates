# PREDICTION — can the harvest be carried by a script, or is the hand step irreducible?

**Written 2026-09-03T10:20Z, before reading `mark_glass_harvest.mjs` or writing a line.**
Sixth prediction of the session.

## THE FAULT (`T-140`)

Four kinds of Wyatt's own writing live only in the live artifact's state block —
`glassState.ideas`, `.rulings`, `.comments`, and the `now: true` flag on a pressed idea. **A
republish regenerates the page with `ideas: []` and `rulings: {}`, so anything not carried across
first is deleted.** The hook `glass-harvest-first.cjs` proves a session READ the page. Nothing
proves it MOVED anything. Between his press and his Chart sits one human-shaped step, four times
over — and a comment box that rendered without saving already cost him words once tonight.

## WHAT I EXPECT

**The hand step splits in two, and only the first half is irreducible.**

- **Irreducible:** *getting the page's HTML.* Only the Artifact tool can read a published artifact;
  a node script has no way to fetch it. A watch on some machines has no Artifact tool at all.
- **Reducible, and this is the whole item:** *everything after.* The state is a JSON blob in
  `<script type="application/json" id="glassState">`. Parsing it and writing four destinations is
  mechanical, and doing it by hand is what drops things.

So the fix I expect to build takes the page's HTML **as a file** and writes: ideas → INBOX,
comments → INBOX under their handle, rulings → `DECISIONS.md`, `now: true` → the pin. The session's
job shrinks from *"transcribe four kinds of thing correctly"* to *"save the page, run one command"*.

## WHAT WOULD PROVE ME WRONG

1. **If the state block is not recoverable from what the Artifact tool returns.** If `action:
   "read"` gives a summary rather than raw HTML for this artifact, there is no JSON to parse and
   the whole design collapses. **Check what a read actually returns BEFORE building the parser.**
   This is the falsifier most likely to fire, and it is cheap to test.
2. **If the destinations are not append-only.** Writing to `INBOX.md` and `DECISIONS.md` from a
   script means a merge, not an append, if entries can already exist for the same idea. **A harvest
   run twice must not duplicate his words** — and it WILL be run twice, because a session that is
   unsure whether it harvested will run it again. If I cannot make it idempotent, it is a worse
   tool than the hand step, which at least has a human noticing the duplicate.
3. **If `comments` are keyed by a handle that no longer owns a row.** He comments on a row; the row
   closes and sweeps to `CHART-LOG.md`; his comment now points at nothing. If the tool silently
   drops those, it has the same failure it exists to prevent, with a green exit code.

## THE TRAP

**This item's whole subject is "the machine says done and the words are gone."** The obvious way to
write this tool ends with a confident summary line — *"harvested 3 ideas, 2 rulings"* — and if the
write silently no-ops, that line is a lie of exactly the kind `T-076` was. **So the tool must read
back what it wrote and count it from the FILE, never from the array it iterated.** Anything else
reproduces the fault one layer up.

**Second trap, from tonight's record:** I have now changed a gate three times to make a red go
away. If this tool cannot be red-proofed — if I cannot show it FAILING to carry something and then
carrying it — I have not built a harvest, I have built a script that runs.

---

## THE RESULT — written after, and it is not a clean win

**Falsifier 1 — CLEARED, and better than expected.** `action: "read"` on an artifact the user owns
returns raw HTML *and saves it to a file*, so the tool takes a path rather than a paste. The split
held: reading is irreducible, carrying is not.

**Falsifier 2 — HANDLED.** Keyed on his own `at` timestamp. Case 3 runs the harvest twice and
compares the whole file, so a duplicate is a failure rather than a thing somebody notices.

**Falsifier 3 — HANDLED, deliberately.** A comment on a swept handle is carried anyway, with the
handle recorded as written. Case 4 fails if it is dropped. Silently discarding his words is the
fault this row is about.

### ⚠ THE TRAP FIRED, AND IT FIRED ON THE SAFEGUARD ITSELF

The trap I wrote was: *"the tool must read back what it wrote and count it from the FILE, never
from the array it iterated."* I built that. **And then the red proof showed the gate could not tell
whether I had.** Replacing the file-count with the loop-count — deleting the single safeguard the
whole design rests on — **passed all seven cases.**

The reason is worth keeping: case 5 tests the guard, not the read-back. It makes the destination
unreadable, so the tool exits at the read guard long before it counts anything. **I had written the
safety net and a test that could not see it.** Case 5b now reaches it — one path passed as both
destinations, so the second write silently erases the first — and the mutant dies there.

**A second mutant also escaped:** case 2 asked `/DO NOW|PINNED/` of the whole entry, so deleting the
pin from the TITLE still matched the word further down in `status:`. **An OR across two surfaces
tests neither.** Split into two assertions.

**So the honest summary: six mutants, two survived the first version, both were real holes, and one
of them was the thing the prediction had specifically warned about.** Writing the trap down did not
prevent it — the red proof did. That is the argument for doing both.

