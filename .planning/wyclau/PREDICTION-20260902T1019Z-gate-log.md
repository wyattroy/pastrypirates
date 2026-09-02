# PREDICTION — watch 2026-09-02T10:19Z, `INBOX-20260902T0120Z`

*Written BEFORE any measurement, per the rule. The whole value is that it cannot be retrofitted.*

**The item.** The Glass tick's change-gate (`glass_needs_publish.mjs`) must RUN on every tick and
leave its verdict on the record, even when the harvest has already decided the tick is publishing.
The runbook's override clause must override the **action**, not the **check**.

## What I expect to find, and why

1. **Nothing anywhere records the gate's verdict.** I expect `NOTHING-MOVED` and `PUBLISH` to appear
   only in the gate itself, its own `npm test` check, and prose in the runbook — no writer, no log
   file, no consumer. *Why:* the item says the 01:02Z tick "went straight to publishing without
   running the gate" and nobody could tell from the record; that is only possible if no record
   exists.
2. **`.planning/wyclau/GLASS-UPDATE-SESSION.md` step 3's parenthetical is the ONLY thing that
   authorises the skip** — *"(If step 2 found ideas or rulings, you are publishing regardless of what
   this says)"*. I expect no second place saying it.
3. **Nothing else in the repo invokes the gate** — not `glass.mjs`, not the Door, not a hook. *Why:*
   CEO 95 already found the Chartkeeper had no invocation anywhere; this subsystem's tools are
   runbook-invoked by hand.

## What would prove me WRONG

- Any script that already calls `glass_needs_publish.mjs` and stores its answer. Then the fix is to
  wire that existing path, not to add a wrapper.
- A second document that also grants the skip. Then editing one runbook is not enough and the change
  is bigger than "small".
- `glass.mjs` importing the gate. Then the honest fix is inside a **vendored** file and this item is
  BLOCKED, not workable — and I must say so rather than build a workaround beside it.

## What I expect to be the hard part, named now

**Where the verdict is written.** My first instinct is a tracked file so it is auditable from any
machine. **I predict that will turn out to be wrong**, because `newestWorkCommit()` in the gate
ignores a commit only when its *entire* diff is `GLASS-NOTE.md`; a tracked log line committed beside
the note reset makes that commit touch two files, so the next tick reads it as work landing and
republishes a page carrying nothing new — **the "echo tick" this project measured and removed on
2026-09-02.** If that holds, the log must be machine-local and gitignored, matching the existing
wyclau block in `.gitignore`, and the cross-machine half is BLOCKED on vendored files.

If the echo reasoning is wrong — if a two-file commit is somehow still skipped — a tracked log is
better and I should use one.

## The shape I expect to build

A non-vendored wrapper that runs the vendored gate, appends one line per run, and **exits with the
gate's own exit code** so the tick's branch is unchanged; a runbook step 3 that calls it
unconditionally with the override moved onto the action; and a red-first `npm test` gate that proves
the wrapper preserves both exit codes, always appends, never truncates, and **resolves a broken gate
to PUBLISH** rather than to silence.
