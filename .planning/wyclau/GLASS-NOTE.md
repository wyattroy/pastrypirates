<!-- GLASS-NOTE.md -- if this session should not publish the Glass itself, write what you
     want shown or said on it BELOW the marker line, then commit and push. The next watch (the
     relay session the Bell rings) reads this on its pulse, folds it into the page, and clears
     this file back to this template. If no watch picks it up within one Bell interval, the Bell
     is not ringing -- read .planning/wyclau/status/ for that machine's own account. -->
---

HARVEST FOR THIS TICK IS ALREADY DONE — DO NOT REDO IT, JUST PUBLISH.

2026-09-02T23:47Z: read the live page (version `1788392555-753f`), confirmed glassState.ideas is
empty and glassState.rulings has only `admin-console-where`, which is ALREADY retired in
`.planning/CHART.md` (commit `362fc32a` — `BLOCKED ON WYATT` no longer carries that row, `## RULED`
has his verbatim words with `now` left empty). `LAST-HARVEST` is stamped
`{"artifactVersion":"1788392555-753f","harvestedAt":"...23:45:27...","ideaIds":[],"rulingKeys":[]}`.
Re-read after stamping showed the same version — safe to publish.

Ran `chartkeeper.mjs --reap` (report only) and folded its FOR THE NOTE lines plus the
admin-console-where status into the page via `glass.mjs --note`. `.planning/wyclau/glass.html` is
freshly regenerated and VERIFIED CORRECT: it has NO `<h2>Your call` section at all now (confirmed by
reading the generated file — `askList.length === 0 && !blockedUnreadable` short-circuits the whole
section to `""`), which is the fix — the currently PUBLISHED page still shows `Your call (1)` with
the admin-console-where ask card rendered, because the record was fixed (git) before the page was
last republished.

**PUBLISH BLOCKED, NOT SKIPPED:** the Artifact tool refused with `429: daily publish limit for your
plan reached (200) — resets at UTC midnight — try again after the reset.` Attempted at
2026-09-02T23:47Z UTC, ~13 minutes before reset. Nobody ran `mark_glass_published.mjs` — no publish
happened, so don't trust a "published" claim anywhere else in this window.

**NEXT WATCH: after the reset, just publish `.planning/wyclau/glass.html` to
https://claude.ai/code/artifact/74034bde-ad7e-4861-913e-d5d190801af2` (same file, don't regenerate
unless the live page's version has changed since `1788392555-753f` — re-read it first per the usual
step 6b check), then run `mark_glass_published.mjs --version=<the publish result's id>`, then reset
this file.

Also noted in passing, not this watch's job: a second, uncommitted set of changes to
`.planning/CTO-LEDGER.md`, `.planning/CHART.md`, `scripts/qa/glass_harvest_hook_check.mjs`,
`.planning/wyclau/CLAUDE-DIR-REPAIRS-PENDING.md` and `.planning/wyclau/PREDICTION-20260902T2339Z-T105.md`
was live in the working tree throughout this tick (T-105's watch, working on the `.claude/`
sensitive-file wall). Left untouched and uncommitted — not this session's to commit.

---

*(Appended by the 23:39Z watch — the note above is the Glass session's and is untouched. It was
DELETED from the working tree by this watch's `npm test` run and restored from HEAD with
`restore_from_head.mjs`; it survived only because that session had committed it. **That is the
`GLASS-NOTE.md` reset hazard biting for the FOURTH time in one day, and the first time against
another session's words rather than a watch's own.** Already a Chart row; recorded again because the
count is now the argument.)*

**WYATT — ONE THING YOU HAVE TO DO YOURSELF, AND NO WATCH CAN DO IT FOR YOU.**

The Glass harvest guard still decides on a clock, not on which version of your page was read — so
the seven-second window that could drop your ideas is still open. **The fix is two files under
`.claude/`, it is written out and ready, and your 5:43 PM ruling does not reach it.** I tried both
writes tonight with your permission already in force and the harness refused them as sensitive files
— that is Claude Code's own protection, not this project's settings, so it is not something you can
lift by ruling. Handing it to another session is also out: that tool's contract calls it permission
laundering and says to route it back to you. **So it needs you, in a session where you are present,
approving the prompt** — or running it yourself. Everything is spelled out with its anchors in
`.planning/wyclau/CLAUDE-DIR-REPAIRS-PENDING.md`; nobody has to work anything out. **Three watches
have now stalled on this, the third with your permission already granted.**
