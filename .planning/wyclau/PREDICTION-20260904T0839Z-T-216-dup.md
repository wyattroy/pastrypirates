# PREDICTION — closing the stale duplicate T-216 row

**Written before running `close_item.mjs`.**

## What I expect

`.planning/CHART.md:1179` ("t216-baker-tiebreak — the rules page promises a 'got home first'
tiebreak…") is a leftover copy of a ruling already implemented and closed elsewhere on the
Chart. I expect:

1. `close_item.mjs --item="T-216" --ceo=193 --commit=1ffe4960 --reason="stale duplicate: the
   engine fix already closed and was swept to CHART-LOG.md; this is the leftover harvested-
   ruling copy of the same handle"` will succeed (exit 0) and tick the row at line 1179 — because
   chartkeeper's duplicate-handle scan no longer lists `T-216` among ambiguous open handles,
   meaning this is the ONLY open row carrying that handle, so `--item="T-216"` resolves to it
   unambiguously.
2. CEO 193 will be accepted as traceable evidence because it names `T-216` directly (confirmed
   by grep before writing this).
3. No game-code diff is needed for THIS closure specifically — the game-code diff (`1ffe4960`)
   already exists and already shipped; this act is paperwork reconciliation, not new engine work.

## What would prove me wrong

- If `close_item.mjs` refuses because `--item="T-216"` matches more than one open row (i.e. my
  read of the duplicate-handle scan was wrong), that means there's a THIRD open copy I haven't
  found, and I should stop and re-scan rather than force a match.
- If CEO 193's text does not actually verify a game-code diff and only verified a different
  narrower claim (the close-gate bug, per its own title), the gate might accept it on a
  technicality while the record is thinner than it looks — worth flagging even if the gate
  passes.
- If the row at line 1179 turns out to describe something CEO 193 never actually checked (e.g.
  a DIFFERENT open question buried under the same handle), closing it would be wrong even if the
  gate allows it — I will re-read the full row text once more immediately before running the
  gate, not rely on memory from orientation.
