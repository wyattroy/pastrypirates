# PREDICTION — T-009: derive the sea trial's leg-resume cache key from the tree, not a hand-typed stamp

Written 2026-09-04T10:30Z, before any code is changed.

## What I expect, and why

`scripts/playtest_gate.mjs` currently trusts a leg's cached result (`sea-trial-shots/legs/<name>--<STAMP>.json`)
whenever the on-disk file's `__stamp` field matches `PP4_STAMP` — a string a human bumps by hand
(`scripts/bump-build.mjs`). Twice today (07:45Z and 10:13Z, both in this Chart's `T-009` row) a real
game-code commit landed without the stamp moving, and the only thing that made those trials honest
was a watch noticing and bumping the stamp by hand before sailing. That is exactly the failure mode
CLAUDE.md rule 9 names: a hand-typed number standing in for something the tree already lets you
derive.

**I expect** that adding a content hash of every git-tracked file `.claude/hooks/lib/game-code.cjs`'s
own `isGameCode()` calls "the game" (the same single definition the pre-edit hook and the gear
picker already use, per rule 23 — not a fourth copy of the rule), and folding that hash into the
leg-resume cache key (both the filename and a `__treeHash` field on the record), will make a stale
resume structurally impossible: if the game code changes and the stamp does not, the hash changes,
the cache filename changes, and `readDone()` finds nothing to resume — the leg re-sails, honestly,
with no human required to remember anything.

**I expect** this needs no sea trial of its own: `scripts/` is explicitly excluded from "game code"
by `game-code.cjs`'s own `NOT_GAME` list, so this is QA tooling, not the shipped game — `npm test`
is the bar, not a leg fleet.

**I expect** this to be safe to land while the `2026-09-04T1013Z-Wy-Blade` trial (pid 41776) is
mid-flight, because that process already loaded `playtest_gate.mjs` into memory before I started —
editing the file on disk does not reach into a running Node process, so its resumability is
unaffected by this edit. I am not touching `RUN_ID`, `sailedHere()`, or anything in `sea_trial.mjs`
that governs cross-restart resumability — that is the separate, unresolved question the prior
watch's own prediction (`PREDICTION-20260904T034500Z-T-219.md`) explicitly left open, and this fix
does not need to answer it: a stable tree hash across a container recycle (same code, same commit)
reproduces the identical cache filename, so recycle-resumability behaves exactly as it did before.

## What would prove me wrong

- If `git ls-files` inside this repo does not return forward-slash-relative paths on Windows (T-220
  found exactly this kind of separator bug in a sibling file), `isGameCode()` would silently
  misclassify every path and the hash would either include almost nothing or almost everything.
  I will print the filtered file count and spot-check a few paths before trusting it.
- If hashing ~150-200 tracked files on every `playtest_gate.mjs` invocation is slow enough to matter
  (it should be milliseconds; if it is not, that is a real regression to a 90-minute trial's own
  overhead and I should say so rather than wave it away).
- If the new gate can be made to pass without the fix actually being wired into `playtest_gate.mjs`
  (a capability nothing invokes is this project's single most repeated failure — the Chartkeeper,
  the harvest, the two T-220 hook fixes with no `.claude/`-write access). I will structurally check
  that `readDone`/`legFile`/`stampRun` actually reference the new functions, not just that the lib
  functions work in isolation.

## What happened immediately before

Two real game-code commits landed on an unchanged stamp today (`1ffe4960`/`aa4c0c71`/etc. before the
07:45Z bump; `fe87894a` before the 10:13Z bump), both caught only because a watch happened to check
`git log` against the stamp by hand before sailing. Nothing in the trial itself would have caught
either one on its own — the resume logic has no way to know the tree changed underneath it. That is
the gap this fix closes.
