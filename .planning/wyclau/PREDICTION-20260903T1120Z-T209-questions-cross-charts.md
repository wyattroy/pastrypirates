# PREDICTION — can a question in one chart block a row in the other?

**Written 2026-09-03T11:20Z, before changing a line.** Eighth prediction of the session.

## THE FAULT (`T-209`, filed by me an hour ago, immediately after hand-repairing an instance)

`chartkeeper.mjs:937` — `livePointer = blockedNaming(row.id).length > 0`, and `blockedNaming`
(`:754`) filters `parsed.blocked`, which is the BLOCKED ON WYATT table of **the one chart it was
pointed at** (`:711`, `parseChart(src)`).

**His questions all live in `.planning/CHART.md`** — that is the section the Glass renders as *Your
Call*. So when I parked `T-121` (a `GLASS-CHART.md` row) and wrote its question to `CHART.md`,
`--chart=GLASS-CHART.md --rank` reported **0 rows moved** and left the parked row at rank 1: the
row the Door sends the next session to take. Repaired by hand with `· needs: wyatt`.

## WHAT I EXPECT

**The blocked-question corpus is not a property of the chart being ranked — it is a property of the
PROJECT.** One person, one queue of open questions, two lists of work. So `blockedNaming` should
read the union of BLOCKED ON WYATT across both charts, deduped, whichever chart is being ranked.

After that, parking a row and writing its question anywhere his page renders will sink the row on
its own, and `· needs: wyatt` goes back to being a manual override rather than the only thing that
works.

## WHAT WOULD PROVE ME WRONG

1. **If `parsed.blocked` carries more than table rows into the score.** `unattachedQuestions`
   (`:886`) and `settledNaming` also read `parsed`. If I widen `blocked` itself rather than only
   what `livePointer` consults, a question in `CHART.md` could start being reported as an
   *unattached question on the Glass chart* — a new false warning, on his page, from a fix.
   **Test: run `--rank` on both charts before and after and diff the question counts.**
2. **If the other chart may legitimately not exist.** Gates build fixture charts in temp dirs with
   no sibling. A hardcoded second path that must exist turns every fixture run into a crash — the
   sixth tool tonight to break on an assumed path. **The second chart must be optional.**
3. **If two charts can carry the SAME question and double-count it.** `livePointer` is a boolean so
   a duplicate is harmless there, but `blockedNaming(...).length` is also read at `:500` and `:526`
   inside the REAP probes. **Check those two call sites before changing what the function returns.**

## THE TRAP

**I am about to hardcode a second chart path into a tool whose defining fault tonight has been
hardcoded chart paths** — this file's own header records five tools that broke when his one
instruction split the list in two, and I filed this row calling it the sixth. **Adding a second
literal path is the same mistake with one more entry.**

The honest shape is to DERIVE the set of charts — the tool already knows its own `--chart=`, and
the project's charts are the files matching `.planning/*CHART.md` — rather than naming
`CHART.md` in a second place. If I cannot derive it cleanly, I should say so and take the literal,
with a comment that names it as a known rot point rather than pretending it is fine.

---

## THE RESULT

**Falsifier 3 — CLEARED FIRST, because it constrained what I was allowed to change.** Both REAP
call sites (`:500`, `:526`) use `blockedNaming(...).length` as *"a live question means do not
claim"*. Widening the corpus makes them MORE conservative, which their own comment calls *"the only
safe direction"*. Nothing to guard against.

**Falsifier 1 — CLEARED, measured rather than assumed.** Widening a question corpus could have
manufactured false *unattached question* warnings **on his page**. Before → after, both charts:
`unattachedQuestions` 1→1 and 0→0; `unattachedMentions` 1→1 and **9→8** — one FEWER, which is
`T-121`'s question now correctly attached.

**Falsifier 2 — CLEARED by construction.** A missing sibling, an unreadable file, or a temp-dir
fixture with one chart all mean *"no others"*. Case 4 fails if a lone chart stops ranking.

**THE FIX WORKS, MEASURED BOTH DIRECTIONS ON THE LIVE CHARTS:** question reachable → `T-121` scores
**−997**, rank 23 of 25; `CHART.md` removed so the question is unreachable (the old behaviour) →
**+3**, rank 2. The hand-applied `· needs: wyatt` is removed, because the mechanism carries it now.

### THE TRAP DID NOT FIRE, AND NAMING IT IS WHY

The trap: *"I am about to hardcode a second chart path into a tool whose defining fault tonight has
been hardcoded chart paths."* The obvious implementation was one line — read `CHART.md` too — and
it would have been the sixth instance of the fault this row was filed to describe. **The set is
derived instead** (every `*CHART.md` beside the given one), so a third list is covered by nobody
doing anything, and `CHART-LOG.md` is excluded by the pattern so answered questions cannot
resurrect. Case 5 uses a third chart; case 6 puts a question in the archive.

### AND MY TEST INSTRUMENT WAS WRONG BEFORE THE CODE WAS

My first check reported *"T-121 still at rank 1 — the fix did not work"*. **The fix was working.**
The `awk` I used to find the row's position matched the handle in the file's HEADER PROSE, not the
row, and reported position 1 every time. I nearly went looking for a bug in correct code.

**That is the fourth instrument fault of this session, in the fourth different throwaway harness** —
after the loop-count that could not see a lost write, the exit-code that read a crash as a red
proof, and the mutant runner that read no-output as a pass. **Every one was a tool I wrote to check
something else, and not one was itself red-proofed.** The rule earned tonight, stated plainly:
*before believing a measurement, ask what the instrument would print if the thing worked — and
check that it prints something different.* The JSON score (`−997` vs `+3`) is that check here.

---

## WHAT CEO 166 FOUND, AND THE CENTRAL ONE IS THE FAULT SURVIVING ITS OWN FIX

⛔ **1. `T-132`'s LIVE INSTANCE WAS STILL FIRING, IN THE SAME FUNCTION, AFTER THE FIX.** I widened
`blockedNaming` — the SCORE — and left `unattachedQuestions` (`:915`) reading `openItems`, which is
only the chart being ranked. So on the live `CHART.md` the tool printed *"1 of your open question(s)
name no task"* **about `T-121`'s question, which names its task perfectly.** The row I filed calls
itself a costume of `T-132`; I fixed one half and left the other wearing it.

**WIDENING ONE HALF OF A JOIN AND NOT THE OTHER IS HOW A FAULT SURVIVES ITS OWN REPAIR.** Fixed:
`siblingOpenIds`. Measured — `unattachedQuestions` 1 → 0 on `CHART.md`, `T-121` still −997.

⚠ **AND THE LESSON IS NOT "reshape the fixture", which is what I would have guessed.** CEO 166 ran
my OWN fixture unchanged and it already exhibited the bug — the wrong answer was sitting in
`unattachedQuestions` on an object my gate parsed and then discarded. **Every case asserted on
`score` and nothing else.** One assertion on a field already in hand would have caught it.
**Assert on the whole output, not only the number you set out to fix.**

⛔ **2. THE STAKES I WROTE WERE FALSE, IN FOUR FILES.** *"the row the Door sends the next session to
take."* The Door's rank step takes no `--chart=`, so it ranks `CHART.md`; the only thing it points
at the Glass chart is `tick_rows.mjs`, which reports and never orders. **Nothing in the repo ranks
that list automatically.** The defect is real — the Advisor ranks it by hand, every time — and I
inflated the consequence and propagated it. Corrected in all four.

⛔ **3. THE ARCHIVE EXCLUSION WAS AN INCLUSION THAT ONE FILENAME HAPPENED TO MISS.** `/CHART\.md$/`
admits `OLD-CHART.md`, `2026-09-CHART.md` — every answered question in an archived chart blocking
live work forever, silently. And dropping the `$` survived every case, admitting `CHART.md.bak` /
`.orig` / `.rej`, the exact leftovers a rebased shared branch produces. Now a deny-list first, then
the anchor; case 6b covers four names and both mutants die on it.

⚠ **4. `npm test` WAS RED AT GATE #49 AND MINE NEVER RAN INSIDE IT.** A peer's committed game-code
work; the chain is `&&`-joined and mine is #118/#119, so seventy gates did not execute. **Passing
standalone is not suite coverage** and I had not said so. Now resolved — the peer's failure is
fixed, the suite exits 0, and all three of my gates are confirmed running inside it.

**And CEO 166 caught its own instrument being wrong before the code was** — it first measured 15
rows moving, from running the old chartkeeper *outside* the repo where `import.meta.url` could not
find the ledger. It reported that in the open rather than re-running quietly. **That is the fifth
instrument fault on this branch in two days, and the first one found by the reviewer rather than by
the author.**
