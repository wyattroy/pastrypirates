# PREDICTION — 2026-09-06T2130Z — stale IDEA INBOX rows still ranking as open

**Handle:** none yet (a chartkeeper hygiene bug found while orienting, not a pre-existing Chart row).
Written BEFORE editing `CHART.md` or re-running `chartkeeper.mjs`.

## What I found, and why it matters to Wyatt

Ranking the Chart (`node scripts/wyclau/chartkeeper.mjs --rank --sweep --write`) puts
`t216-baker-tiebreak` at rank 3 and the sitemap ask (`T-243`) at rank 4 — both above every genuinely
open bug on the Chart. Both rows already carry their own prose saying they are finished:
`t216-baker-tiebreak` (`.planning/CHART.md:1340`) says *"**FATE: SHIPPED 2026-09-04, already closed
as `T-216`**"*; the `donow-buttons-numbered` duplicate (`:1365`) says *"**FATE: SHIPPED 2026-09-03,
and closed as `T-218`**"*. Neither ever leaves his Tasks list because `hasFate()`
(`scripts/wyclau/lib/chart_model.mjs:110-112`) only returns true when `stateOf()`'s `DECLARED` regex
(`:58`, `/(?:→|->)\s*\*\*([^*]{0,160})/`) matches — and it requires an arrow immediately before the
bold text. Neither line has one.

## What I expect

1. **Before any edit, `node scripts/wyclau/chartkeeper.mjs --rank` lists both rows** (t216 at #3,
   T-243 at #4) and the header reports "38 open rows + 34 unfated ideas = 72 tasks."
2. **Adding `→ ` immediately before `**FATE:` on lines 1340 and 1365 (only) makes both rows
   disappear from the rank list**, because `DECLARED` will now match, `FINISHED` will find the word
   `SHIPPED` in the captured text, and `hasFate()` will return true.
3. **The open-idea count in the header drops by exactly 2** (72 → 70), and no OTHER row's rank
   changes, because I am not touching any other line.
4. **`T-098` (line 1758) and the `T-243` row itself are NOT touched** — `T-098` already carries a
   working `→ **CLOSED 2026-09-06**` marker later in its own block (confirmed by grep: it is the
   only row of the four candidates that already has one), and `T-243`'s block has a second,
   later, ALSO-unrecognized re-fating (`✅ **FATED AND ANSWERED 2026-09-03...**` at line 1504) that
   makes me not confident the row is cleanly single-threaded — it stays open, filed as a follow-up
   note instead of fixed by me.

## WHAT WOULD PROVE ME WRONG

- If adding the arrow to either line does NOT remove it from the rank list, my reading of
  `DECLARED`/`FINISHED` is wrong and I need to re-read `chart_model.mjs` rather than assume.
- If the open-idea count moves by anything other than exactly 2, some other row was affected —
  meaning either an unintended edit, or my claim that these two blocks contain no other arrow is
  wrong.
- If broadening this fix to a general regex change (matching bare `✅ **...**`) were attempted, it
  would break `T-073` (rank 1, DO NOW): that row's own sub-note *"✅ **THE GATE IS CLEAR — `T-261`
  CLOSED 2026-09-06...**"* contains the word `CLOSED` about a DIFFERENT ticket, and a bare-✅ match
  would wrongly mark the whole (very much still-open) row finished. This is why I am hand-fixing two
  verified-simple text lines rather than touching the shared parser — the parser change is a bigger,
  riskier job than this watch, and is what I'm filing as a follow-up rather than attempting.

## THE TRAP — what I want to be true

I want "the parser is broadly broken, let me fix the regex" to be the win, because it would prevent
every future recurrence in one move. **I already checked that trap against `T-073`'s own text and it
fails** — a general fix is not safe without much more careful design than one watch turn allows. The
honest, sized answer is: fix the two verified instances by hand, and leave the systemic note for
whoever takes it next.
