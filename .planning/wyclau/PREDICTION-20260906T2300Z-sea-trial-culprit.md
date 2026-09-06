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

See the ledger entry and commit for the result. If any of the above falsifiers fired, this section
says which one.
