# PREDICTION — `vendor_check.mjs` after the inversion (watch 2026-09-02T13:10Z)

*Written BEFORE any measurement, per the standing rule. The whole value is that it cannot be
retrofitted, so it is committed before the gate that tests it is written.*

## What I expect, and why

His ruling had two halves, and I expect only the first shipped. `3d1d0a9d` replaced the final
`exit 1` with an `exit 0` that prints DRIFT. But `fail[]` — the array that block reads — is not fed
only by edited files. Reading `vendor_check.mjs`, four different conditions push into it:

| line | condition | what it actually means |
|---|---|---|
| 77 | `VENDORED-FROM` present, `MANIFEST.sha256` missing | **the check cannot run at all** |
| 89 | a manifest file is gone from disk | a vendored file was **DELETED** |
| 90 | a hash differs | edited here — **the one his ruling is about** |
| 114 | a kit-shaped agent file not in the manifest | will be **lost on the next vendor** |

So I predict:

1. **All four exit 0** today, and only the third is honestly "ahead of the kit".
2. **The label is wrong for three of them.** Line 157 rewrites only the literal string
   `EDITED IN PLACE`; the other three messages print unchanged beneath a `DRIFT` prefix and above
   the sentence *"N file(s) have moved on here and not yet in claude-kit"* — **false** for a deleted
   file, for a stray agent card, and for an area that was never examined at all.
3. **The missing-manifest case is the serious one.** A gate that cannot examine its subject now
   prints `PASSED (with drift)`. That is `HARD-WON-LESSONS.md` §3 — an instrument reporting nothing
   has told you something about ITSELF, not about the world — and it is exactly what he meant by
   *"do not also delete the check"*.
4. **Nothing tests this file.** `vendor_check.mjs` runs inside `npm test`; no gate has it as a
   subject, so none of the above can go red.

## What would prove me WRONG

- Any of the four paths exiting **1** → the inversion was scoped, not blanket, and there is nothing
  wrong with the exit code.
- The label replacement covering the other three messages → point 2 is wrong and only the exit code
  is at issue.
- An existing gate anywhere with `vendor_check` as its subject → point 4 is wrong and the red-proof
  he asked for already exists.
- **The strongest disproof, and the one I most expect to bite: if the kit-behind half turns out to
  be honestly unknowable from this machine.** The file's own header says it CANNOT see the kit
  moving forward without both trees, and a watch's read of `C:\Users\wyatt\Projects\claude-kit` has
  been measured REFUSED twice. If that holds, then *"a kit that has fallen behind must be reported"*
  cannot be satisfied by a detector here, and the correct answer is to make the output say so in
  those words rather than to build one. **My framing of the item would then be the thing that was
  wrong**, and the fix shrinks to the exit-code classes plus an honest NOT CHECKED line.

## What happened immediately before

`T-078` shipped at 08:48Z inside a commit whose subject line is about the Glass lesson order, not
about vendoring. **That is why nobody moved the record**: the keystone landed as step 1 of somebody
else's item, so no close gate ran, no CEO judged it, and the row stayed open while three other rows
went on citing it as a live blocker.
