# PREDICTION — T-131: the gate that writes the live sea-trial marker

**Written 2026-09-03T05:35Z, BEFORE the fix and before any measurement of it.**

## THE FAULT, ALREADY MEASURED (this part is not a prediction)

`scripts/qa/glass_longrun_status_check.mjs` plants four fixtures in the **real**
`.planning/wyclau/LONG-RUN` (`:55, :92, :100, :109`) and restores the previous contents at `:116`.
A detached sea trial writes that same file as it sails. Observed tonight: three of its cases failed
against live trial JSON while a trial was at sea, and that is what a red `npm test` was.

## WHAT I EXPECT THE FIX TO BE, AND WHY

**`glass.mjs` reads the marker through `longRunStatus(ROOT)` (`glass.mjs:808-811`), and `ROOT` is
derived from the script's own file location.** So — exactly as with `GLASS-NOTE.md` earlier tonight
— **a gate cannot sandbox it by changing directory**. The destructive coupling has to be broken in
the generator, not in the caller.

Expected shape, and it is the same shape as the `--consume-note` fix that already shipped: give the
generator a **`--marker=<path>`** override, and have the gate write its fixtures to a temp file and
pass that path. Then the gate never touches the real marker and the restore at `:116` — a
destroy-then-repair, which `T-112`'s row explicitly rules against — disappears entirely rather than
being made safer.

## WHAT WOULD PROVE ME WRONG

- **If `longRunStatus` does not take its directory as an argument in a way `--marker=` can reach.**
  It is called as `longRunStatus(ROOT)`, so a path override looks straightforward; if the module
  resolves its own path internally instead, the fix is in `longrun_status.mjs` and my reading of
  where the coupling lives is wrong.
- **If the gate needs the REAL marker to test what it is actually testing.** Its subject is the
  page's rendering of long-run states, which a fixture serves perfectly. But if any case depends on
  the marker being at the canonical path — e.g. it asserts the page's behaviour when the file is
  *absent*, which a `--marker=` pointing at a non-existent temp path would also satisfy — I should
  find that out by reading every case before changing any of them, not after.
- **If removing the write breaks a case that was silently relying on it.** The honest test: after the
  change, `.planning/wyclau/LONG-RUN` must be untouched by a full gate run. I will check its
  existence and mtime before and after; if the gate still writes it, the fix is cosmetic.

## THE ACCEPTANCE TEST, NAMED BEFORE THE WORK

1. Plant a sentinel marker at the real path with a distinctive `what`.
2. Run the gate.
3. **The real marker must be byte-identical afterwards** — not restored, *never written*.
4. The gate must still pass, and must still be able to FAIL: revert one behaviour it guards and
   watch a case go red, so this is not a gate quietly neutered into always-green.

**Point 4 is the one that matters.** Two verdicts in two nights have now found checks that could not
fail — the last one *inside the fix for that very fault*. Making a gate stop touching a live file is
exactly the kind of change that can accidentally make it test nothing.
