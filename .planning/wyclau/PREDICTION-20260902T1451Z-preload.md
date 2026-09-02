# Prediction — watch 2026-09-02T14:51Z, before a single measurement

*Written before the probe was built or run. Rule 6's working form: name what would prove me wrong,
in the same note, so the result cannot be retrofitted.*

**The item:** `INBOX-20260901T1335Z`, his launch-critical image ask. Two of his three parts are
closed on byte evidence. **The part I am testing is his second sentence:** *"we need to load all
game assets up front; i notice sometimes that the 'fire the ovens' graphic loads dynamically when
it is called, which will make it appear blank on slow connections."*

## What happened immediately before (STEP 0 — widen the time horizon)

Two commits ago, `05f63b12` renamed **31 pictures from `.png` to `.webp`**, and `fbbf44ad` renamed
the board before it. **A rename pass is exactly where a warm-up list rots**, and `preloadAssets()`
is only half derived: `sharedAssetUrls()` reads `*_IMG` constants off the module (rule 9, good),
but four families are still spelled out by hand in `util.js:2017-2028` — `logo.jpg`, the boats and
islands, the recipe art, and the badges, the last with the extension **`.png` typed into the string
in two different files** (`util.js:2028` and `board.js:2090`). Anything the derivation cannot see
survives a rename only because somebody remembered.

## The prediction

1. **The icon probe will still pass.** `flame.png` is a `*_IMG` constant and the derivation covers
   it; his own named example is genuinely fixed and I expect it to stay fixed.
2. **Boot will NOT warm every picture the game can draw.** I expect a non-empty gap, and I expect
   it to be in the families the derivation cannot see — specifically **pictures referenced only
   from CSS in `index.html`** (the welcome backdrop and the rain streaks are my two named
   candidates), because those are in no JavaScript constant at all and no `*_IMG` suffix can reach
   them.
3. **I expect the about-page JPEGs to be absent too, and to be CORRECT to be absent** — they are
   drawn on `about.html`, not in a voyage, so "all game assets" does not cover them. If the check
   cannot tell those two cases apart it will be a check that cries wolf, and that is the design
   risk, not the finding.
4. **On the time half:** I expect the boot payload to now be small enough that the honest answer to
   *"does it load MUCH faster"* is yes and is worth giving him as one number of megabytes-over-the-
   wire and one number of seconds, not as a folder size.

## What would prove me WRONG

- **On (2):** if a probe that enumerates the real `assets/` tree and compares it to what boot
  fetched finds **nothing** missing that the game actually draws, then the warm-up is already
  complete, my "a rename pass rots a hand-kept list" reasoning did not apply here, and the honest
  outcome is that his item closes with no code change at all.
- **On (1):** if `flame.png` is NOT fetched at boot, then the fix credited to `2f3a4a0` has
  regressed since — and that is a live defect on his own named example, not a record item.
- **On (4):** if the boot payload is still multiple megabytes, the byte work did not reach the
  thing he asked about and "17.79 MB to 4.3 MB" was never an answer to his question.

## The instrument's own failure mode, named before it is built

**A check that reads the folder can only condemn a file it can prove the game draws.** The way this
goes wrong is the way `asset_display_size_probe.mjs` already went wrong on this same item: NOT SEEN
gets read as "unused". So the check must report three buckets — **warmed**, **drawn but not
warmed** (the defect), and **never reached by this probe** (unknown, and not a verdict) — and the
gate may only fail on the middle one.
