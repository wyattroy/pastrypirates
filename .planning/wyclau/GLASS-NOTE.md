<!-- GLASS-NOTE.md -- if this session should not publish the Glass itself, write what you
     want shown or said on it BELOW the marker line, then commit and push. The next watch (the
     relay session the Bell rings) reads this on its pulse, folds it into the page, and clears
     this file back to this template. If no watch picks it up within one Bell interval, the Bell
     is not ringing -- read .planning/wyclau/status/ for that machine's own account. -->
---

HARVEST FOR THIS TICK IS DONE. GLASS.HTML IS REGENERATED AND CORRECT. PUBLISH IS STILL BLOCKED.

2026-09-02T23:52Z (Glass-update session): re-read the live page (version `1788392555-753f`,
unchanged from the prior tick's harvest). `glassState.ideas` is empty; `glassState.rulings` has
only `admin-console-where`, already retired — `retire_answered.mjs --list` confirms `## BLOCKED ON
WYATT` is empty, and CHART.md's `## RULED` table (row ~1441) carries his verbatim words with `now`
left empty (not yet triaged — not this session's job). `LAST-HARVEST` stamped with that same
version; re-read before publish matched — safe to publish.

Also committed a prior watch's (T-105, 23:4xZ) uncommitted work that was sitting dirty in the tree
(commit `c8a55e42`) so `git pull --rebase` could proceed at all: `.claude/` sensitive-file writes
are refused by the harness even with Wyatt's 5:43:55 PM grant in force — that item is now BLOCKED
ON WYATT himself (not a watch item), written out in `CLAUDE-DIR-REPAIRS-PENDING.md`.

Ran `chartkeeper.mjs --reap` (report only, nothing on disk changed) and folded its FOR THE NOTE
lines into the page via `glass.mjs --note`:
  1 task has his answer on the record and never moved — a watch closes it.
  3 tasks were freed by his rulings and the work is still to do — a watch picks them up.
  1 task points at a file or process that is gone — a watch corrects the wording.
  7 tasks were measured on an older build (2026.09.01.x vs current 2026.09.02.1) — a watch
    re-measures them; not his to answer.

`.planning/wyclau/glass.html` is freshly regenerated from this content.

**PUBLISH ATTEMPTED AND STILL BLOCKED:** `429: daily publish limit for your plan reached (200) —
resets at UTC midnight — try again after the reset.` Attempted at 2026-09-02T23:52Z UTC, ~8 minutes
before reset. Same limit the 23:47Z watch hit. Nobody ran `mark_glass_published.mjs` this tick — no
publish happened, so don't trust a "published" claim anywhere else in this window.

**NEXT SESSION: after the UTC midnight reset, just publish `.planning/wyclau/glass.html`** to
https://claude.ai/code/artifact/74034bde-ad7e-4861-913e-d5d190801af2 (same file, don't regenerate
unless the live page's version has changed since `1788392555-753f` — re-read it first per the usual
step 6b check), then run `mark_glass_published.mjs --version=<the publish result's id>`, then reset
this file.

---

*(Re-added by the 23:39Z watch. **This paragraph has now been destroyed TWICE in one hour** — once
by that watch's own `npm test`, once by the tick above rewriting the file — and the hazard has bitten
five times today across three sessions. It survives only because it is committed. **REGENERATE
`glass.html` before publishing so this reaches his page:** the instruction above says not to, and it
was written before this was here.)*

## ⚑ WYATT — ONE THING ONLY YOU CAN DO, AND THREE WATCHES HAVE NOW STALLED ON IT

**The guard that stops your page overwriting what you've typed still works off a clock, not off
which version of the page was read.** That's the seven-second gap: a session looks, finds nothing,
you write an idea moments later, and for the next half hour anything that republishes is waved
through. Your ideas survived that on 2026-09-02 by luck of ordering.

**The fix is two small files, it's written out and ready to paste, and your permission doesn't reach
it.** You ruled at 5:43 PM *"Let the watch write them — I allow edits to hooks and skills"*, and I
tried both writes tonight with that grant live. Both were refused — **not by this project's
settings, which already allow every edit, but by Claude Code itself**, which won't let an unattended
session rewrite its own hooks and skills with nobody watching. That's a good rule and I didn't go
around it: I could have had a script write the same bytes, or asked your other open session to do
it, and both of those are the protection being defeated rather than satisfied.

**So it needs you in the room.** Either approve the prompt in a session you're sitting at, or run
the edits yourself — they're spelled out with their anchors in
`.planning/wyclau/CLAUDE-DIR-REPAIRS-PENDING.md`, nothing to work out. **What you'd be buying:** the
page stops asking *"when did someone look?"* and starts asking *"which version did they read?"* —
your own sentence, and the only question that can answer whether a republish is safe.
