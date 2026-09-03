# PREDICTION — written 2026-09-03T04:25Z, BEFORE the fix, by watch a5 (Wy-Blade)

**The item.** `T-017` is rank 1 on `.planning/CHART.md` — the row the Door tells every watch to
take — and it is actually **waiting on Wyatt**. Its fix shipped; two taste questions were put to him
on 2026-09-03 (`qid:t017-name-type-too-small`, `qid:t017-fan-mixed-sizes`) and are unanswered. But
neither question names the row, so the Chart's own "blocked sinks to the bottom" rule cannot fire.

**The mechanism, read not guessed.** `chartkeeper.mjs:934` — `livePointer = blockedNaming(row.id).length > 0`,
and `blockedNaming` is `parsed.blocked.filter(r => r.raw.includes(id))` (`:726`, `:751`). At `:937`
a live pointer subtracts **1000** and sets the why-now phrase *"waiting on your answer"*. The two
questions carry `qid:t017-…` in an HTML comment and the string `T-017` nowhere, so `.includes("T-017")`
is false for both, and the row keeps its full +50.

**The tool already says so.** Tonight's `--rank` printed: *"2 of your open question(s) name no task,
so nobody can tell what they are holding up"*, naming both. It is a WARNING, and it is already
guarded (`chartkeeper_check.mjs:1453-1466`). **Nothing is broken in the machinery — the output was
simply never acted on.** So the fix is data, not code, and I should say that plainly rather than
inventing a mechanism.

## WHAT I EXPECT, EXACTLY

1. Writing `T-017` into the question cell of both blocked rows makes `blockedNaming("T-017")`
   return **2**.
2. `T-017`'s score goes **50 → −950** — a drop of exactly 1000, not approximately.
3. Its why-now phrase gains **"waiting on your answer"**.
4. It leaves rank 1 and sinks near the bottom of the open list.
5. The new rank 1 becomes **`T-088`** (currently rank 2, score 46) — the art-library measurement.
6. The `unattachedQuestions` warning stops naming the two `t017` questions. It should still name
   nothing else, because `qid:admin-console-where` is the only other question and it is not in the
   open set the warning reads… **if that one still appears, my model of the warning is wrong.**

## WHAT WOULD PROVE ME WRONG

- `T-017` stays at rank 1, or moves for some reason other than the blocked penalty.
- The score drops by something other than 1000 — that would mean a second signal changed and I did
  not understand the scoring.
- The why-now phrase reads *"blocked (GATED)"* or *"needs you"* instead of *"waiting on your
  answer"* — those are the `gated` and `needs: wyatt` branches, and picking the wrong one would mean
  I misread `:939`.
- `chartkeeper_check.mjs` goes red — the fix is to his Chart, not to the tool, so the gate must be
  untouched by it. **If the gate moves at all, I have changed something I did not intend to.**

## WHAT I AM DELIBERATELY NOT DOING, AND WHY

**Not building a rule that derives the handle from the `qid:` slug.** There are exactly three qids
on the live Chart and one of them (`qid:admin-console-where`) carries no handle at all, so the
"convention" is a two-sample coincidence. A normalisation rule built on it would be a mechanism
nobody documented, guarding a shape nobody agreed to. The detector already exists and is already
gated; what failed was acting on it.

**Not answering the two questions.** They are taste — how small is too small to read, and whether a
fan of circles must match. Rule: taste is his.
