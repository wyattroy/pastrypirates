<!-- GLASS-NOTE.md -- if this session should not publish the Glass itself, write what you
     want shown or said on it BELOW the marker line, then commit and push. The next watch (the
     relay session the Bell rings) reads this on its pulse, folds it into the page, and clears
     this file back to this template. If no watch picks it up within one Bell interval, the Bell
     is not ringing -- read .planning/wyclau/status/ for that machine's own account. -->
---

**2026-09-06, ~9:40 AM ET — the Advisor, at Wyatt's ask.**

**New top task: `T-261` — scope the whole SFX job into a PRD and show it to Wyatt BEFORE any of it
is implemented.** His words: *"i have ideas that i want to express before that work is started"*.
`T-073` (Add New SFX to the game) is now explicitly GATED behind it.

**The Drive blocker on the SFX work is gone.** Both his links opened once he was present to grant
the permission, and everything is captured in the repo — 30 files with ids, plus his full 28-sound
plan sheet (`.planning/wyclau/T-073-SFX-BRIEF.md`, commit `0fdbe853`). **No watch needs Drive.**

**A FULL sea trial is sailing** — run `2026-09-06T1328Z-Wy-Blade`, pid 47468, started 9:28 AM ET,
build `2026.09.04.2`. Its 9:13 AM predecessor sailed nothing because ten legs were cached under the
current stamp (`T-219` biting); those were cleared before this one started.

**Also 2026-09-06, ~9:5x AM ET — from watch `pastrypirates-0c`, relayed by the Advisor because
neither of us has a publishing tool.**

**`T-237` IS A REAL DEFECT AND IT IS WORSE THAN THE ROW SAID — ON A PHONE, A PLAYER CANNOT READ A
TRADE OFFER AT ALL.** Re-measured with the posed instrument CEO 198 asked for (commit `30698ce2`,
CEO 217 YES): **10 of 42 poses hit, and every one is on the 390px phone** — all 28 tablet and
desktop poses came back clean. It only happens when the boat is near the TOP rows. Opened by eye:
two whole circles sit squarely on the offer message, blotting out two of its three lines.
**Left OPEN on the Chart, not closed** — the watch traced a plausible cause in the board's
fan-placement code and deliberately did not touch it: ~900 lines where naive fixes have repeatedly
re-broken things already paid for. Sized SMALL-to-MEDIUM, game code, needs a sea trial.

---

**2026-09-06, ~10:0x AM ET — watch pastrypirates-f6, closing `T-261`.**

**THE SFX PRD IS WRITTEN. IT IS NOT PUBLISHED — NO SESSION AVAILABLE COULD PUBLISH IT.** Full page
at `.planning/wyclau/T-261-SFX-PRD.html` (publishable shape, starts `<title>` then `<style>`).
Checked for a publisher before falling back here: this session has no Artifact tool; the Advisor
(`pastrypirates-14`) confirmed it has none either; `Blade 9.6` was asked and had not answered by the
time this watch ended. **Wyatt, if you are reading this, the PRD exists and is ready — someone with
an Artifact tool needs to publish `.planning/wyclau/T-261-SFX-PRD.html` for you, or a session can
read it and walk you through it directly.**

**THE HEADLINE FINDING, worth knowing even before the page is up:** the 6 sound files already
shipped in the game (`battle-swords.mp3`, `coin-flip.mp3`, `fishing.mp3`, `ship-move.mp3`,
`storm.mp3`, `store-ingredient.mp3`) match 6 of Luis's new Drive files **byte-for-byte in size** —
including his fight-resolve sword sound, which is the exact file both you and the earlier audio
audit independently flagged as clipped. **This is not "add 28 sounds to a silent game."** 6 of
Luis's files already shipped under generic names; the PRD scopes the other 21, plus several
already-chosen library sounds from the 2026-08-19 audit that were never wired in.

**Seven numbered questions wait in the PRD** — the unmapped `PP_SFX_Alarm.mp3`, confirming five
"probable" file-to-moment mappings, whether the first pass covers Luis's files + the already-settled
library sounds together or splits them, where "your turn" and the fight-resolve slot land given the
byte-match finding, whether the 3 music tracks (69 MB) stay out of scope (recommended: yes), and
whether to level the whole expanded sound set in one pass once everything is in (recommended: yes).

`T-073` stays GATED behind this until you rule. No game code touched this watch.
