# Prediction — T-222, chartkeeper allocating a second handle onto a row that already has one

**Item:** `T-222` — `chartkeeper.mjs --rank --write` inserted a fresh handle (`T-233`/`T-234`) into the
MIDDLE of a wrapped title on two rows that already carried their own handle (`T-014`/`T-092`) a line
or two below, splitting a timestamp in half. Caught and repaired by hand 2026-09-03T2040Z. The row's
own instruction: "a row that already carries a handle must never be allocated a second one," and
points at `chartkeeper.mjs`'s id-allocation writer plus why `openHandleCarriers` did not see the
handle one line below.

## What I expect, and why

I expect this specific failure is **already fixed as a side effect of later work**, not still live.
Reading `scripts/wyclau/lib/chart_model.mjs`, `idOfRow()` (called by `chartkeeper.mjs`'s `idOf`) now
scans **every line of the row** for a whole-line `⟨`T-nnn`⟩` marker (`OWN_LINE_ID_RE`) before falling
back to anything else — this was added 2026-09-04 for `T-090`/`T-240` (a different bug: identity
picking up a handle mentioned in PROSE rather than the row's own head line). `withId()`'s guard
(`HEAD_LINE.test`, `/^\s*⟨[^⟩]*⟩\s*$/`) also scans **all** lines, not just index 1. Both checks are
line-position-independent, so a handle sitting two or three lines into a wrapped title should now be
found regardless of how much text precedes it.

**If true:** building a fixture shaped like the real corrupted rows (a title that wraps across two
physical lines before the row's own `⟨T-nnn⟩` marker line) and running `chartkeeper.mjs --rank --write`
against it should leave the existing handle alone and allocate ZERO new ids for that row.

**What would prove me wrong:** the same fixture reproduces the corruption — a second handle gets
spliced in, or the existing marker line gets moved/duplicated — which would mean the 2026-09-04 fix
solved a different-shaped bug and this one is still open. If that happens, the fix is narrower:
make `idOf`'s scan (and `withId`'s insertion guard) agree with `openHandleCarriers`'s definition of
"this row already carries this handle" so a row is never re-numbered.

## What happened immediately before, per rule 27 (widen the time horizon)

The corruption was produced by running `chartkeeper --rank --write` with no `--chart=`, pointed at
`CHART.md` by default while the row it corrupted lived in the SIBLING file, `GLASS-CHART.md` — but
`T-222`'s own text is explicit that this cross-file mistake is a separate, "worse than it looks"
observation, not the cause of the mid-title splice itself. The splice is about id-allocation *within
whichever row it landed on*, so the fixture below reproduces the row shape, not the cross-file call.
