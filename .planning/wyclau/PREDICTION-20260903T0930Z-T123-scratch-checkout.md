# PREDICTION — can a red proof run at an old ref without touching the shared tree?

**Written 2026-09-03T09:30Z, before changing anything.** Fourth prediction of the session; the
previous three were wrong and each was caught by its own falsifier rather than by a reviewer.

## THE FAULT

`scripts/qa/_t103_redproof.mjs` overwrites `glass.mjs` and `chartkeeper.mjs` with an old ref's
content, runs a gate, and restores them in a `finally`. **Three sessions share this branch.** CEO 132
declined to run it for exactly that reason: any `git commit -a` from another watch inside that
window commits reverted code. Its sibling limit is that it restores only those two files, so a case
reading anything else cannot go red under it — and one was reported as having done so.

## WHAT I EXPECT

**A `git worktree` at the ref fixes both halves at once.** It materialises the WHOLE tree at that
commit in a temp directory, so:
- nothing in the shared checkout is written, and the window disappears entirely rather than being
  made shorter;
- the "only two files" limit goes with it, because every file is at the ref, not just two.

## WHAT WOULD PROVE ME WRONG — and this is the half that has bitten twice tonight

**The gate may resolve its own paths from ITS OWN FILE LOCATION rather than from `cwd`.** That is
exactly what `glass.mjs` does (`T-112`: *"resolves its own paths from its own file location
regardless of cwd, so a gate CANNOT sandbox it by changing directory"*), and it is why the
`--consume-note` and `--longrun-root=` fixes had to go into the generator rather than the caller.

**If `do_now_check.mjs` does the same, a worktree isolates nothing** — the copy inside the worktree
would read the LIVE repo's files, report on the current tree, and print a confident answer about the
wrong subject. **Test before rewriting: read how it computes its ROOT.** If it is
`fileURLToPath(import.meta.url)`, the worktree copy resolves to the worktree — which is what I want —
but if it hardcodes or climbs to a fixed path, it does not.

**Second falsifier:** if the gate shells out to `git` for anything, a worktree at a detached ref may
answer differently from the main checkout, and a red could come from that rather than from the
missing code. **Check for `git` calls inside the gate before trusting a red.**

**Third:** `git worktree add` writes to `.git/worktrees/` in the SHARED repo. That is metadata, not
tracked content, and no other session reads it — but it is not "touches nothing", and I should say
so rather than claim more than is true.

## THE TRAP

I want this to be a clean one-line swap, because it is late and the row is small. **If the gate
turns out to resolve paths from its own location in a way a worktree does not fix, the honest answer
is a flag on the gate — a bigger change — and not a worktree that appears to work while reading the
live tree.** That failure mode would look exactly like success.
