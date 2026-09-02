# PREDICTION — `T-095`, his three "chaotic again" Glass faults

*Written 2026-09-02T17:36Z, BEFORE any measurement or edit. Rule 6's working form: the value is that
it cannot be retrofitted. Each line names what would prove it WRONG.*

---

## P1 — The existing gate `glass_his_five_asks_check.mjs` will FAIL on his new wording, and that is
## correct rather than a regression.

His item 2 says delete the apology and make one bar. That gate has three cases built on the apology
existing: the first paint must contain *"cannot see anything newer"*, `var BLIND` must be declared
and say the true thing, and every `pub.textContent` assignment must carry it. It also asserts the
age line is written as `age.textContent = "last progress" …`.

**Expect: 3–4 cases go red the moment item 2 lands.** They are not protecting a truth he still
wants — they encode the wording he has now overruled. **The right move is to REWRITE those cases
onto the new bar, never to delete them**: the property they defend (the page must not present a
frozen number as current) survives his rewording, and the *Updated* clock is what carries it now.

**WRONG IF:** the property does not survive — i.e. after the change there is no live statement of
the page's own age at all. Then his wording and the honesty requirement genuinely conflict, and that
is a question for him, not a thing to quietly resolve.

## P2 — Item 1's real work is in `tick()`, and the server-side first paint must keep a
## no-JavaScript fallback.

`inHandHtml` is built in Node (`glass.mjs:570-584`) and inlined at `:851`. If I only move the
rendering into `tick()`, a page opened with JavaScript disabled — or read before the first tick —
shows whatever Node baked in. **Expect to have to write the line twice, once in each place, and to
have to keep them from drifting** (rule 23: two things kept in step by discipline will drift). The
honest shape is one server-rendered absolute fallback that `tick()` immediately replaces with the
relative one.

**WRONG IF:** the first paint turns out never to be visible in practice — it is, `glass_his_five_asks`
already asserts exactly that for the published line, for the same reason.

## P3 — Item 3's cause is already measured and I expect the count to be right: five prose blocks in
## `## BLOCKED ON WYATT`, and NO hidden question among them.

The Advisor measured this. **Expect: I re-measure and find the same five, and the warning on his
page is therefore a true statement about unparseable content and a false implication that he is
missing a decision.**

**WRONG IF:** re-measuring finds a genuine question in that prose. Then moving the prose to
`CHART-LOG.md` would be deleting a question of his, and the fix is the opposite one — promote it to
a table row. **I will read all five before moving any of them.**

## P4 — The de-shouting rule will bite the new status bar and the in-hand line, and I expect it not
## to matter.

`shortTask()` only runs over Chart rows, not over the status bar. **Expect no interaction.**

**WRONG IF:** the in-hand item text goes through `unmark`/`shortTask` — then his claim words could be
sentence-cased or truncated, and a claim reading `T-095 — the glass is chaotic…` would be the page
editing a machine-written record.

## P5 — Sizing: the two gates will take longer than the three fixes.

The same was true of `T-088` and it was reported as understated. **Expect the same again**, and
specifically expect item 3's writer-side gate — the one that fails `npm test` when that section holds
a non-table line — to be the single largest piece, because it has to accept HTML comments and blank
lines and reject everything else without also rejecting the table header.

**WRONG IF:** the fixes turn out to need browser work. They should not: everything is string
rendering plus one `tick()` move.

---

## THE ONE I MOST EXPECT TO BE WRONG ABOUT

**P1's scope.** I predict 3–4 failing cases. If it is 1, I have misread how coupled the gate is to the
apology string; if it is 6+, the five-asks gate is load-bearing on wording in ways that will keep
breaking every time he rewords his page, and that itself is a finding worth reporting to him rather
than absorbing.
