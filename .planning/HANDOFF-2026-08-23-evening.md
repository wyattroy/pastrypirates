# Handoff — the evening of 2026-08-23 — Wyatt's playtest of build `2026-08-23c`, fixes approved and ordered

**For a fresh cloud session. Wyatt stopped the laptop session mid-setup and is moving this work to a
cloud container — this document plus `.planning/playtest-2026-08-23-evening/` is everything it knew.**

**State of the work: NOTHING HAS BEEN FIXED YET.** No game code changed, no servers or browsers left
running, no GSD quick-task directory was created (the `/gsd-quick` entry was interrupted by Wyatt's
stop order before its planner ran — there is nothing to resume; enter the workflow fresh). What DID
happen: his notes were triaged, he approved the order via the question UI, his evidence was read
pixel-by-pixel, and several "how do I test this?" questions were answered from the code. All of that
is below so you do not re-do it.

---

## THE APPROVED ORDER — his rulings, via the question UI, tonight

**Tier 1 — the three blockers, first (his explicit pick):**
1. **The "⚓ Reconnecting to yer voyage…" hang** (his problem 5). It stopped his whole playtest and
   he could not restart. Fix it AND give that screen an escape hatch so it can never strand him again.
2. **A bake-off trigger verified working in CREW games** so checklist items 43–46 become testable.
   See the `?ovens=1` findings below — solo appears to half-work; crew is unverified.
3. **The blank-space lag** (his item 6 + problem 2). Diagnose by playing and measuring.

**Tier 2 — the visible-bug batch (~13 fixes)** — the full list with his notes is verbatim below.
Board top row cut off + square mobile board + drop the "CAPTAINS" heading; ALL prompt buttons pulse
(pass/trade/attack currently don't — full QA sweep required, his words); recipe card 2 taps not 3;
one coin-flip duration defined in ONE place, **1.0s not 1.5s (his own correction)**, identical for
bots and humans; nothing ever happens behind the stage (his item 7 — see his stated principle below,
quote it back before designing); Pass position at the 45° cutoff (his item 16); the greyed-out
explainer's wrong copy AND wrong position (item 17, screenshot committed); black-market message
centering (item 9); storm must not narrate trade-winds separately — post-storm summary only (item 8);
narration bubble covering a sail square (item 38); bot-name capitalization-normed collision (item 30);
remove the "What do they call ye, captain?" modal between "Join a crew" and the join screen (item 31).

**Tier 3 — the desktop menu redesign (item 21).** Taste work: bring him options to pick from
(question UI, with a recommendation), do not guess.

**His other three answers tonight:**
- The lag is in **solo AND crew** — "i only checked those two, so i'd assume it's everywhere."
- He **can't tell when it started** — bisect older builds yourself.
- The item-17 screenshot was received; it is committed in the evidence folder.

## HIS PRINCIPLE FOR ITEM 7, stated in full — design to this, not just the instance

> "at EVERY stage, when things happen on stage, the board waits for the stage to disappear before
> serving more narrations/director movement/etc — the etc is important here so i want you to
> understand my intention: the stage should get all your attention; if things happen behind it, the
> player feels like they're missing out, and the stage is BLOCKING them from seeing important
> things. that's the worst feeling."

So: dock coin flip appearing behind the veil, the director moving the camera behind the flip — all
one fault class. Anything drawn on the stage freezes everything else until the stage is gone.

---

## EVIDENCE ON DISK — `.planning/playtest-2026-08-23-evening/`

| File | What it is |
|---|---|
| `img-6352-tails-price-risen-line.png` | **Item 17 evidence** (7:36pm, Day 6). The italic line "The price has risen to 3 🪙 — more than ye can pay" drawn ON TOP of the TAILS narration's own second line, covering "of … Fresh Milk?" — while the greyed Buy −3 circle it explains sits far away on an island. He holds 1 coin, price is 3, and the price never rose (both his points confirmed in the frame). |
| `img-6353-day9-top-row-clipped.png` | **"Board cuts off the top row" evidence** (7:39pm, Day 9). His ship on the top row is clipped in half by the board's top edge. The board window is visibly wider than tall — his "no longer square" point. Likely one fault: the captains box takes the height. His fix suggestion: remove the "CAPTAINS" heading line. |
| `img-6359-day1-ovens1-full-hold.png` | **`?ovens=1` half-working** (10:33pm, Day 1). Wyargh holds 5 crates on Day 1, all bots empty — the shortcut's signature, so it DID fill his hold tonight. Also shows the "Stay put" circle and the "tap to sail" pill each sitting on highlighted sail squares (his item 38; the overnight gate saw the same three times). |
| `screenrecording-1941-aye-stay-put.mp4` | 10.7s recording (7:41pm, Day 10) of the "Aye, stay put" flow. |
| `video-frames/f01.png … f22.png` | The same video at 2 frames/sec — `fNN` sits at roughly (NN−1) × 0.5s. Read these directly if ffmpeg is unavailable. |

**What the video shows, frame-read (verify against the frames yourself):**
- **f01–f08 (~0–4s):** static board, "Wyargh: tap to sail" pill + "Stay put" circle up. Nothing moves
  for ~4–5 seconds — this dead stretch may itself be an instance of the lag he is reporting.
- **~f09–f14:** a dashed arc appears; the camera zooms in.
- **f15 (~7.5s):** zoomed view with THREE circles at once — the original "Stay put" still on screen
  beside its own confirm pair "Aye, stay put" / "Keep sailin'", plus the tap-to-sail pill. This is
  his "aye stay put feels like a duplicate" (problem 3): the original button visibly coexists with
  its confirm.
- **f22 (~10.7s):** the camera has zoomed back OUT mid-prompt and the confirm circles now sit ON TOP
  of the "tap to sail" pill. Director movement during a live prompt — same family as item 7.

His three screenshots are ALSO first-class evidence for items beyond the ones he filed them under —
read every one before touching related code (CLAUDE.md rule 22).

---

## ANSWERED FROM THE CODE ALREADY — do not re-derive

- **Item 2 (hold-the-sea hint "never saw it"):** working as designed. The hint retires FOREVER after
  the player has used the hold 3 times — `4/src/ui/stage.js:316`: `PEEK_KEY="pp4_peekUsed"`,
  `PEEK_LEARNED=3`, localStorage. Wyatt long since crossed 3, so he can never see it. **Told him:
  test in a private tab, or `localStorage.removeItem("pp4_peekUsed")` and reload.** Probably no fix
  needed — but he may want the teaching behaviour itself revisited; that's his call, not yours.
- **Items 27/28 (`?ovens=1` "doesn't seem to work"):** the flag exists — `4/src/shared/index.js:416`
  (`ovensNowEnabled()`), applied via `stockHoldsForBakeTest` (`4/src/orchestrator.js:1141`), rides in
  soloMeta (`4/src/ui/util.js:602, 2497`). It fills HUMAN holds **only when a brand-new voyage
  starts** — appended to an in-progress game's URL it does nothing, and a refresh resumes instead of
  restarting. He was told this. BUT `img-6359` proves the hold DID fill on a fresh Day 1 tonight —
  so his "doesn't work" is either (a) what happens after "Stay put" on day 1 (the ovens should
  light; do they?) or (b) an earlier attempt on a resumed game. **Observed once, not measured** —
  reproduce before claiming either. And whether `?ovens=1` works in a CREW room at all is
  completely unverified; items 43–46 need it (tier 1, item 2).
- **The reconnect hang (tier 1, item 1):** the whole boot/resume path is
  `4/src/orchestrator.js:2349` (`boot()`), with `resumeHostGame()` at `:2324` panelling
  "⚓ Reconnecting to yer voyage…" (`:2344`, `@copy prompt.net.reconnecting`) and then
  `beginGame(r.cfg, r.seed)` with `appState.replaying=true`. Note for the escape hatch: the session
  blob `pp4_sess` in localStorage means EVERY reload re-enters the resume journey — if the replay
  stalls, the player is permanently stranded with no UI path out. His repro: crew game, tested "host
  closes the tab" (checklist's tab-close item), then the hang, then could not restart. **Not yet
  reproduced — reproduce it in the two-window rig before fixing** (CLAUDE.md rule 6).
- **The lag (tier 1, item 3):** nothing measured yet. His observations: gaps between action prompt
  buttons appearing; a LONG blank before the "crew draws lots" card; ~1s between Trade prompt
  options. He says it is NEW — "it never used to happen" — so bisecting builds (git log on `4/`)
  is a legitimate instrument alongside a stopwatch on the current one.

---

## HIS PLAYTEST NOTES, VERBATIM — the source of truth for tier 2

Pastry Pirates playtest — build 2026-08-23c

#1 [PASSED] Any long question — a trade ask, a battle prompt
#2 [PROBLEM] "Tap and hold the sea to reveal the board"
    i don't think i saw this at all -- maybe because my counter isn't reset? i never saw this message, how do i test it?
#3 [PASSED] A sail prompt with "Stay put" showing
#4 [PASSED] The recipe picker on Day 1
#5 [PASSED] Top-left corner, during a prompt with a ‹ back button
#6 [PASSED] Any narration bubble
    this passes; but more upsetting is that there is now a long blank-space lag between narration bubbles. it's like the game is "thinking" and it makes the whole game feel laggy. i have no idea what's causing it but it sucks. ask me questions to diagnose what i mean, i can be more specific -- it happens in between action prompt buttons, it happens for a LONG time before the "crew draws lots" card appears... it's really awful.
#7 [PASSED] A dock coin flip
    it seems like it still appears behind the veil, but it did last long enough. shouldn't it only appear after the veil disappears? shouldn't all narration boxes only appear after the veil disappears? the director moved the screen behind the dock coin flip too, which shouldn't happen -- at EVERY stage, when things happen on stage, the board waits for the stage to disappear before serving more narrations/director movement/etc -- the etc is important here so i want you to understand my intention: the stage should get all your attention; if things happen behind it, the player feels like they're missing out, and the stage is BLOCKING them from seeing important things. that's the worst feeling.
#8 [PROBLEM] A storm
    The storm narrated the fact that flaky jack was blown into the trade winds -- it shouldn't. trade winds, like everything else, should be reported once with the post-storm summary.
#9 [PROBLEM] The black market, the first time a shelf runs dry
    this message appeared, but it was not centered vertically and the top of it was nested behind the header row. how did your QA miss this?
#10 [PASSED] The Dock petal
#11 [PASSED] Buying a crate
#12 [PROBLEM] The recipe card
    The recipe card seems to require 3 clicks, not 2. it should be tapped (or clicked) once to select it, and one more time to choose it. not three.
#13 [—] ⚠️ Your item 1 — are the prompt buttons loud enough?
    not all of the prompt buttons pulse! eg pass, trade, attack never pulse. the loudness is fine, but you need to fully QA to make sure ALL prompt buttons are pulsing.
#14 [PASSED] The action circles on a phone
#15 [PASSED] A prompt with your boat in a corner
#16 [PROBLEM] Pass
    when right-to-left orientation of buttons, pass should be on the right, not the left -- humans read left to right, so when you put it on the left we read it first; it's the same problem as before. decide where pass goes based on whether the fan is more horizontal or more vertical, at the 45 degree cutoff.
#17 [PROBLEM] The italic "why is this greyed out" line
    when i flipped tails at a dock, "The price has risen to 3..." showed up, which is wrong in 2 ways: 1, the price STARTED at 3, it didn't rise, and 2 it appeared overlapping with the TAILS box, nowhere near the greyed out button. i have a screenshot if you want it.
#18 [PROBLEM] Every coin flip — dock and battle
    all flips should last the same amount of time. it seems like bot flips (and maybe other players' flips?) take shorter time. Use elegant code -- a coin flip should be a coin flip; don't patch this, fix it. the coin flip duration should be set in one place. and it should be 1 second, not 1.5 seconds (this last part is my mistake -- 1.5 feels too long)
#19 [PASSED] Wind and forecast, on tablet and desktop
#20 [PASSED] A tall window (your tablet shape)
#21 [PROBLEM] Desktop menu
    You did this correctly, but now the buttons are absurdly wide and the whole thing looks messy. redesign the UI to be professional and clean and clear following accepted standards for buttons like this.
#22 [PASSED] Phone: end of a voyage
#23 [PASSED] Phone: docking
#24 [PASSED] Phone: the captains list
#25 [PASSED] Phone: the recipe picker
#26 [PASSED] Phone: the recipe picker, first screen of the game
#27 [—] The moment your bake is scored
    havent seen yet -- how do I trigger it? adding ?ovens=1 to the url doesn't seem to work
#28 [—] The rest of that day, and the next attempt
    havent seen yet -- how do I trigger it? adding ?ovens=1 to the url doesn't seem to work
#29 [PASSED] Join a crew and type a name a REAL person already has
    This works
#30 [PROBLEM] Type a name one of the BOT captains has
    This should be capitalization-normed. i was able to join as flaky jack, with Flaky Jack still remaining at the table -- but Flaky Jack should have changed to another name.
#31 [PASSED] "Change yer name" in the lobby
    This works fine -- but I have a differnt note related to it, which i'll write here: when you hit "Join a crew" you should go straight to the Join a Crew screen which has the 4-letter code button and the Yer captain name field. Remove the "What do they call ye, captain?" modal in between, it's now unnecessary
#32 [PASSED] A battle coin flip, on a phone
#33 [PASSED] Offering a crate in a trade
#34 [PASSED] A long trade question on a phone
#35 [PASSED] The recipe sheet
#36 [PASSED] Drag on the sea and lift your finger off the board — over the captains box, or past the screen edge
#37 [PASSED] A sail prompt — how far back does the board sit?
#38 [PROBLEM] A narration bubble while sail squares are up
    it was partially covering one square for me once
#43 [PROBLEM] Crew game: a GUEST reaches the ovens
    untested: you need to give me a way to trigger bakeoff
#44 [PROBLEM] Crew game: while ANY captain bakes, look at the other screens
    untested: you need to give me a way to trigger bakeoff
#45 [PROBLEM] Crew game: tap "Watch again 🌕1" as a guest
    untested: you need to give me a way to trigger bakeoff
#46 [PROBLEM] Crew game: close a tab mid-bake
    untested

Not checked: 13, 27, 28, 47, 48, 49, 50, 39, 40, 41, 42

problems that aren't in the list:

1. the board cuts off the top row.
2. there are times when there is no narration, and it feels like the game has lagged/stalled. this is new, it never used to happen. Eg with Trade, there's almost a second delay between the different prompt options
3.  the "aye stay put" button feels like it's a duplicate of "stay put", and it's not clear what causes it
4. the aspect ratio of the board window on mobile is no longer square, but it needs to be. remove the "Captains" line of text in the captains box to save space.
5. I could not complete the list because the site hung on "reconnecting to yer voyage" after i tested the host closing the tab, and i couldn't restart it.

---

## BEFORE YOU START — the short version of what governs this work

- **Read `docs/HARD-WON-LESSONS.md` end to end, and `docs/DRIVING-THE-GAME.md` before touching a
  browser.** The two-window crew rig is `4/scripts/mp_rig.mjs`. Headless, muted, scoped pkill.
- **Reproduce before fixing, measure before reporting** (rules 6, 19). The reconnect hang and the
  lag are both unreproduced tonight.
- **One display path** (rule 23): the "aye stay put" mess and item 7 are orchestration questions —
  ask what makes the two states agree before adding a branch.
- The overnight gate's own 5 findings + 1 structural are listed at the bottom of
  `.planning/playtest-checklist.html` — some overlap his items (the sail-square/pill overlap IS the
  known structural one, with a note that "the existing clamp provably cannot reach it").
- The morning-side context is `.planning/HANDOFF-2026-08-23-morning.md` (what shipped overnight and
  what was deliberately left open — MP-09's parallel round, TEST-03, the unported gates).
- Ship loop: commit → bump `PP4_STAMP` in `4/src/ui/stage.js` → prove the diff touches only `4/` →
  push, pull, verify zero-zero → tell him the stamp to look for.
- **You are in a cloud container: read `docs/GIT-AND-DEPLOY.md` §7 before any browser or crew work.**
  The session-start hook fixes Chromium's TLS automatically; if the network is a partial allowlist,
  Firebase fails SILENTLY and a guest that never joins looks exactly like a multiplayer bug — the
  tier-1 reconnect repro depends on `*.firebaseio.com`, `www.gstatic.com`, `*.googleapis.com`.
