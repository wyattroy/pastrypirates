# PREDICTION — 2026-09-06T2245Z — T-264, the checkmark-fate marker fix

**Handle:** `T-264` (`.planning/CHART.md`, "A ROW CAN DECLARE ITSELF CLOSED IN PROSE AND STILL NEVER
LEAVE WYATT'S TASKS LIST"). Written BEFORE editing `chart_model.mjs` or `CHART.md`.

## What I found, measured first

Ran a scan script (`scripts/wyclau/_t264_scan.mjs`) over every row in `## THE IDEA INBOX` (44 rows)
looking for `✅ **...**` markers in rows `stateOf()` currently calls "open". **Exactly ONE row is
affected: `T-243`** (the sitemap ask). It carries two unrecognized checkmark markers — line 1433
`✅ **CLOSED PROPERLY 2026-09-06, CEO 226 (YES), through the gate this time.**` and line 1482
`✅ **FATED AND ANSWERED 2026-09-03...(PARTIAL)...**` (chronologically EARLIER despite sitting LOWER
in the file — this row is not single-threaded, exactly as T-264 itself warned). No other row in the
44 is affected, so the blast radius of a checkmark-recognizing fix is exactly this one row.

## What I expect

1. **Extending `stateOf()` to also recognize `✅ **...**` (not just `→`/`->`) as a possible own-verdict
   marker — but ONLY when the arrow form finds nothing, and ONLY using the FIRST such checkmark match
   whose captured text does not quote a DIFFERENT `` `T-nnn` `` handle — will flip `T-243` from `open`
   to `finished`, and change no other row's classification**, because the scan above found no other
   row with an unrecognized `✅` marker.
2. **First-match (not last-match) is required for correctness here, not just for minimal change.**
   T-243's own two markers are in the WRONG chronological order in the file (the 2026-09-06 close sits
   above the 2026-09-03 partial-fate). The first one in file order is "CLOSED PROPERLY" (finished);
   the second is "FATED AND ANSWERED...(PARTIAL)" whose captured 160 chars contain no FINISHED_WORDS
   word, which alone would classify as "open" if picked instead. If I had designed this as
   "last-match-wins" it would get T-243 wrong. Test this explicitly.
3. **The "different ticket" filter must reject `T-073`'s own trap sentence if it is ever fed through
   this path** — `` ✅ **THE GATE IS CLEAR — `T-261` CLOSED 2026-09-06...** `` mentions `T-261`,
   different from T-073's own id. (T-073 itself never reaches this code path in practice — it's a
   checklist row, and `stateOf`/`hasFate` are only invoked on IDEA INBOX rows in `parseChart` — but
   the filter must still work on that exact string as a unit-level red-proof, because `assign_handles.mjs`
   calls `stateOf` more broadly and a future caller might not have the same `kind==="task"` short-circuit.)
4. **`chart_model_agrees_with_glass_check.mjs` and `glass_shows_scheduled_ideas_check.mjs` stay green
   unchanged** — their fixtures use only the arrow convention, so the new checkmark branch is never
   reached for them.
5. **After the fix, ranking the live Chart (`chartkeeper.mjs --rank`) drops `T-243` out of the open
   list entirely** and the "N open rows + M unfated ideas" header total drops by exactly 1.

## WHAT WOULD PROVE ME WRONG

- If flipping T-243 to `finished` changes any OTHER row's rank/state in the live Chart, my claim that
  the scan found only one affected row is wrong (either the scan itself is buggy, or a row I didn't
  expect shares this shape).
- If using first-match instead of last-match gets T-243 WRONG (i.e., it needs the second marker to
  read finished), my read of the file's own chronology is backwards — re-check the marker order.
- If `chart_model_agrees_with_glass_check.mjs` or `glass_shows_scheduled_ideas_check.mjs` goes red,
  my assumption that no fixture uses `✅ **` is wrong.
- If the different-ticket filter test on the T-073 string does NOT correctly reject it, the filter
  regex is broken and must not ship.

## THE TRAP — what I want to be true

I want "one small, targeted fix closes T-264 cleanly" to be true, because it lets me both fix the
mechanism AND do the sweep in one watch, which the row's own sizing note calls "small-to-medium."
**The trap is stopping at "it works for T-243" without checking the filter actually rejects the
T-073 shape** — a fix that only happens to be safe because nothing else currently triggers it is not
the same as a fix that is safe by construction. I am red-proofing the filter directly against that
string, not just against the one row it happens to matter for today.
