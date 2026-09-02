# PREDICTION — watch 2026-09-02T06:49Z, T-001: the duplicate-key collision

*Written BEFORE any measurement, per the rule that a prediction composed after the result always
turns out to have been right. Committed in the same step it was written (shared checkout).*

## What I am about to measure

CEO 94's third finding: `INBOX.md` contains two different entries under one id, and
`chartkeeper.mjs:144` builds `inboxById = new Map(inboxEntries.map(e => [e.id, e]))`. A `Map`
constructed from pairs keeps the LAST value for a repeated key, silently.

## What I expect to find

1. **The collision is real and is exactly one id today.** `inboxEntries.length` will be one greater
   than `inboxById.size`, and the repeated id will be `INBOX-20260902T05xxZ`.
2. **The consequence is on `live`, not on `cited`.** `linksOf()` de-duplicates cited ids into a
   `Set` and then asks `inboxById.get(id).live`. So the count of citations is unaffected; what the
   survivor decides for both is whether the citation buys the **+100 approval bonus**.
3. ⚠ **I expect the wrong answer to be LATENT TODAY, not visible.** I believe both colliding
   entries are currently OPEN (neither `DONE` nor `PARKED`), so `live` is `true` either way and no
   row's score changes right now. **If that is what I find, the honest report is "a silent
   order-dependency that has not yet produced a wrong number", not "a wrong number on his page."**
   The gate therefore has to CONSTRUCT the divergent case — one entry DONE, one OPEN — because the
   real Chart cannot show it today.
4. **The direction of the error is unbounded either way.** Whether the survivor is live or done
   depends purely on which entry he happened to type second. That is the defect: not a wrong value,
   an ungrounded one.

## What would prove me WRONG

- `inboxEntries.length === inboxById.size` — no collision, CEO 94 misread the file, and this item
  is void.
- `live` turning out not to be read through `inboxById` at all (e.g. recomputed from the entry list
  at the call site), in which case the `Map` is only a membership test and the collision is
  harmless.
- The two colliding entries differing in status TODAY, in which case point 3 is wrong and there IS
  a visible wrong score on his page — a bigger finding than the one I am claiming.

## The sweep I expect to owe (same fault class, other keys)

`chartkeeper.mjs:386` `reapById = new Map(reap.map(r => [r.title, r.reason]))` and `:436`
`settleByTitle = new Map(settle.map(s => [s.title, s]))` are keyed by a row's TITLE, which nothing
guarantees is unique. I predict:

- **Worse consequences than the Inbox one if it ever fires**, because `score():475` reads
  `reapById.has(row.title)` to decide `livePointer`, which carries **−1000**; and the write pass
  (`:747-748`) looks both maps up by `titleOf(lines)` to write REAP's reason INTO the Chart file —
  so a title collision puts one row's stale-reason text onto a different row on his page.
- **No duplicate titles on the real Chart today**, so this too will be latent. If I find duplicate
  titles, that is a bigger finding than the Inbox collision and it should be reported first.

## What I intend to change

Key by something that cannot collide, and make an ambiguous key fail toward UNDER-claiming (the
direction this file already argues for: "it under-counts … and that is the safe direction, because
the failure of the old signal was over-claiming"). Concretely, for an id resolving to more than one
entry, `live` is true only when EVERY entry sharing it is live — and the tool NAMES the ambiguous
id in its report, because a duplicate id in his Inbox is a fault in his record that wants repairing
at the source, not papering over in the reader.
