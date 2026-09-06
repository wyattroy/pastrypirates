# PREDICTION — the sea trial's "browser-free checks failed" section names the wrong gate

Written before any measurement or fix, per the Door's Proof step 3.

## What I expect, and why

`scripts/sea_trial.mjs` runs `npm test` (a ~143-gate `&&` chain) via one `execSync` call, and on
failure builds `unitTail` from `slice(-14)` of the concatenated `stdout + stderr`. Because Node
buffers each stream separately and concatenates them whole (not interleaved by real time), the last
14 lines of that concatenation are usually the tail of whichever stream is non-empty last — in
practice this has been shown (CEO 185) to be trailing chatter from gates that ran and PASSED just
before the chain stopped, not the actual failing gate's own diagnostic output. `execSync` throws
`Error` objects whose `.stdout`/`.stderr` are `Buffer`/string snapshots of the whole run up to the
point npm's shell wrapper printed its own `npm ERR!` trailer; that trailer is short, so the "last 14
lines" window reaches backward past it into the last passing gate's own success output.

**I expect:** if I reproduce CEO 185's scenario with a synthetic 3-step chain where step 2 fails and
prints a unique marker, the current code's `unitTail` will NOT contain that marker's identifying
context in a way that names step 2's script path — it will show whatever step 1 or npm's own error
banner most recently wrote.

**The fix I intend:** on npm-test failure only (rare path — does not slow the common green case),
re-run the chain one entry at a time (parsed from `package.json`'s own `scripts.test` string, split
on ` && `, the same source `gate_count_check.js` already trusts) until one entry's exit code is
non-zero, and report that entry's own command string plus its own last N lines of output — never a
guess from tail-slicing the whole run.

## What would prove me wrong

- If `unitTail`'s current slice actually DOES already contain the failing script's own path or
  distinguishing text in a controlled repro, my diagnosis of the bug is wrong and I should not touch
  `sea_trial.mjs` at all — CEO 185's finding would need re-reading, not re-implementing.
- If splitting `scripts.test` on `&&` and re-running entries one at a time turns out non-trivially
  slow (a gate that is only fast as part of the full chain, e.g. shares warm state) — not expected
  here, since CLAUDE.md/QA-PROCESS describes these as independent, browser-free, stateless checks.
- If a chain entry is not a plain `node <path> [flags]` invocation and my splitter mis-parses it —
  `gate_count_check.js`'s own `NODE_INVOCATION` regex (`^node\s+(\S+)`) already assumes this shape
  for the whole chain, so if that assumption is safe for gate-counting it should be safe for
  culprit-finding too; if it isn't, gate_count_check would already be silently wrong, which is a
  separate finding worth surfacing.

## What happened (filled in after measuring)

**One falsifier fired, partially.** A minimal 3-step synthetic repro run directly through
`execSync` (no `npm` wrapper, no trailing error banner) did NOT reproduce the bug — its `tail(-3)`
happened to contain the failing step's marker, because the total output was tiny and nothing
followed it. That does not mean the diagnosis is wrong; it means the bug needs BOTH ingredients
CEO 185's real incident had: (a) enough passing-gate chatter before the failure to threaten the
tail window, and (b) enough trailing noise AFTER the failing gate's own (short) output — in the
real incident that trailing noise is presumably npm's own error banner and/or later intervening
gates' brief PASS lines — to push the failing gate's identifying text out of a fixed-size tail
window. Built a faithful adversarial reconstruction of that exact shape (verbose 20-line passing
gate, then a 1-line-stderr failing gate, then a 15-line fake trailing banner) and confirmed the OLD
`slice(-14)` formula does lose the failing gate's own "boom" line under it — this is the red-proof
in `scripts/qa/sea_trial_names_failing_gate_check.mjs` case 2.

**The fix does not rely on tail-slicing at all**, so the exact shape of the trailing noise is moot:
`findCulprit()` (`scripts/lib/npm_test_culprit.mjs`) re-runs `package.json`'s own `scripts.test`
chain one entry at a time and identifies the culprit by each entry's own exit code, never by
reading text. Confirmed correct on a 4-step fixture chain (cases 3-4), and confirmed the gate can
actually FAIL by deliberately breaking `findCulprit`'s success-detection twice (RED 2/4, then
RED differently 2/4) before restoring it (GREEN 4/4).

No other falsifier fired: the `&& `-split parsing assumption held (case 1), and re-running the
chain per-entry was fast enough to be a non-issue (the 4-fixture chain and the full 144-gate
`npm test` both completed well within normal time — this path only ever runs on the rare failing
case, never on green).

Full `npm test`: 144/144 green (143 pre-existing + this new gate). No game code touched.
