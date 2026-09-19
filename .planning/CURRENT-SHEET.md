# The live playtest sheet

**One line, deliberately.** This file exists so a Stop hook — and the next session — can name the
sheet Wyatt is actually using, instead of guessing or publishing a sixteenth artifact beside the
fifteen that already exist.

**Update the URL here in the same commit that republishes the sheet.** If they disagree, the URL
here is the one that is wrong.

SHEET: https://claude.ai/artifact/LvqytfTYCwssQzTcmNFped
BUILD: 2026.09.19.1-staging@f9ba7012
NAME:  Pastry Pirates Checklist — he renamed it himself on 2026-09-17; it was "The plaque merge sheet".

**ONE PAGE, TWO SPELLINGS — do not "reconcile" these into a second artifact.** The slug above and
`https://claude.ai/code/artifact/a1623d69-328c-417e-920f-8a99782ebce2` are THE SAME PAGE: claude.ai
serves an artifact under a short slug and under its uuid, and a read of either returns
`Artifact a1623d69-…`. This file carried the uuid form until 2026-09-17, which read as a mismatch
against the link he is given, and a session came within one step of publishing a replacement.
**Give him the slug form.** Check identity by reading the URL, never by comparing the two strings.

## ⏳ WAITING TO GO ON THE SHEET — items another session sent that are not testable yet

**Why this section exists:** a session that sends an item "so it does not get lost" is relying on the
receiving session's memory, which is the one thing that does not survive. It goes here instead, in
the file whoever writes the sheet already reads.

**An item goes on the sheet only when he can actually test it.** A link that answers someone else's
404 is worse than no item: he taps it, sees something wrong, and reports a fault that is only the
item arriving early.

*(Empty right now. `cf-404` was queued here on 2026-09-18 and folded into the sheet the same night,
once staging served it at `@18c2bb93` — the queue did its job and the item moved on.)*

## ⚠ THE SHEET WAS CUT DOWN ON 2026-09-19, AND THAT IS WHY IT IS SHORT

His instruction: *"Update the playtest checklist for what is currently on staging. Remove the check
boxes at the bottom, I don't use them because I need a way to always give feedback about an item on
the list; if it's on the list for me to see, it must have PASS, PROBLEM, and a comment box next to
it."*

So two things changed and the second is the one a future session will be tempted to undo:

1. **THERE ARE NO TICK BOXES ANY MORE.** Every row on the page — including the go-and-do-this list
   at the bottom, which was checkboxes — is a card with **Pass**, **Problem** and a note. A tick
   could only ever say "I did it", which is the one thing he does not need to tell us.
2. **IT WENT FROM THIRTY ITEMS TO THREE, PLUS EIGHTEEN WALKS.** The page had accumulated everything
   since 14 September, nearly all of it already judged by him. What is on it now is only what
   staging serves AND he has not yet ruled on. **Do not re-add a judged item to make the page look
   fuller** — his rulings live in `.claude/memory/DECISIONS.md`, which is where they belong.

Marks are stored under the same localStorage key as before, and a row that used to be a tick box
stored a bare `true`; the page reads that as "no verdict yet" rather than throwing.

## The others, so nobody re-makes them

- Card-feel tuner — https://claude.ai/code/artifact/b6cfcdac-fa74-425c-9b1b-ba518af4e4fc
- The Plaque (captains box plan) — https://claude.ai/code/artifact/8e2e8de9-0782-4124-979a-6e88f6fe8400
- Two Axes, Seven Channels (architecture) — https://claude.ai/code/artifact/7b34c094-6012-4b04-bbdd-1a9882047f1f
- The Plaque Art Brief (captain's box art) — https://claude.ai/code/artifact/7a51b394-c56b-455d-bc5e-858bf8cde072
- Sugar Cane, in purple (the v3 round + his pick; since 2026-09-13 night, ROUND 4 — drawn from his own sketch with a matched outline, photographed in the game; his marks in `cane/wyatt-r4` (round 3's in `cane/wyatt-r3`)) — https://claude.ai/code/artifact/082a0907-8946-463d-ba18-a91fe559042b
- Captain's Box Tuner (row fill, band parchment, crate squeeze) — https://claude.ai/code/artifact/219b5862-3265-4432-b9a8-f28457ba7d48
- Recipe Card Tuner (his numbers, 20 sliders) — https://claude.ai/code/artifact/6e1c84b1-cfc0-45ef-b33e-7d76e9eecc6e
- Butter & Milk (W4-11, round 1 — three rolls in the game; his marks in `milk/wyatt-r1`) — https://claude.ai/code/artifact/3588cebc-c443-4894-9b16-ced75318799c
- Crate Size Tuner (the real captain's box at real size; his dials in `crates/wyatt`) — https://claude.ai/code/artifact/7695863a-e429-40a1-89b2-55e8c379aa4e
- The Narration Pass (W7-2 — since 2026-09-13 late night REBUILT ON `src/shared/words.js`, every line the game says today, written-as shorthand shown; his new marks in `narration/wyatt-words`; his first pass, in `narration/wyatt`, is applied) — https://claude.ai/code/artifact/f5369931-f83e-46f5-8a3b-624508069437
- Ingredient Pop-In Tuner (the real board at real size; his dials in `popin/wyatt`, or pasted from Copy my notes) — https://claude.ai/code/artifact/64052412-b5b9-4163-b8f3-8132c89694ef
- One Engine, One Display (the CEO's architecture audit of how player-facing words are served, 2026-09-14 — 15 recommendations + a phased path, Passed/Problem on each; his marks in `arch/wyatt`) — https://claude.ai/code/artifact/89fab77d-5a17-4dd6-8a4d-958c3bbeafee
- Victory Card Proposals (ROUND 4 since 2026-09-16: his round-3 dials are the starting settings; score rebalanced so any winner scores at least double any non-winner (win pays a worked-out amount; doubloons, trades and days ahead count up to a limit; no musing); confetti falls with gravity; tall award columns; lines slide up; preview plays only the section being edited unless Play all; his marks in `victory/wyatt-tuner-r3`) — https://claude.ai/code/artifact/a7e8dae4-42d9-4f01-891a-ef2c782f091f
- The Victory Card PRD (draft 1, 2026-09-16; a commentable view of docs/VICTORY-CARD-PRD.md, rebuilt from that file; his answers and marks in `prd/wyatt`) — https://claude.ai/artifact/RDewgpSMitkyCLsm6E5EF8
- Game Feel Audit (every moment of a voyage, what it does today, 39 ideas with Passed/Problem; his marks in `feel/wyatt`) — https://claude.ai/code/artifact/d7621423-5760-4242-b83d-3321c4bfb9d2
- Sounds of the Voyage (2026-09-14 — the sounds his game feel audit proposed: 8 moments, 3 constructed candidates each heard in a replay of the moment, all levelled to one loudness, plus "find a real recording"; his picks and marks in `sound/wyatt`) — https://claude.ai/code/artifact/43d0cd3d-4a90-413a-bc4a-2e6f1aab1057
- The Voyage Ahead (2026-09-14, the future-plans interview: 20 questions with research, his answer under each, four open questions with answer buttons at the top, a notes box per section; his marks in localStorage `voyage-ahead/wyatt-r1`, or pasted from Copy my notes) — https://claude.ai/code/artifact/5e7a7947-702f-4f81-b510-4d1fc9a19353
- Cloudflare Cutover Runbook (2026-09-15 re-measured: every step from DNSSEC off to teardown, Done/Problem and a note per step, Squarespace's and Cloudflare's current menu labels; his marks in `steps/<id>`) — https://claude.ai/artifact/HgGTWrpKkxb1bswaH9SY3P
- Pastry Pirates After Launch (the PRD from the future-plans interview, 2026-09-15: goals ladder, economy, accounts and ledger, worlds as folders, ways to play, all 14 growth leads, platforms, board game, order, not-doing; 4 open questions at top, a notes box per section; his marks in localStorage `after-launch-prd/wyatt-r1`, or pasted from Copy my notes) — https://claude.ai/artifact/6DGyHdVj4SShy3tZumPNQn
- Sound Levels Tuner (2026-09-18, his ask: "if you want to make an artifact for tuning the sfx then I can get them all right"; all 18 stems with the gain each SHIPS at, how often each is heard in a voyage (counted over 40 seeded voyages: sailing 59x, the turn bell 64x, the muse 32x, the coin flip 32x, a crate 24x), six "moments" that play the real pile — a muse, a dock, three sails, a fight, a bake-off, a minute at sea — a note box per sound and one-tap Copy my numbers) — https://claude.ai/artifact/8RGLEGWL8ks6EEyWtv4jHT
- Game Feel Tuner (2026-09-15, his ask four times over: dials for the coins, the crates, the sail squares, the cannon's recoil/smoke/shake, the speed lines and confetti; three coin "chink" sounds and three "coins leaving the purse" candidates to pick; his numbers in `feel/wyatt`) — https://claude.ai/artifact/N62YXT3Bg9SBfruWTJi1s3

- Tier 1 Cleanup Checkpoint (2026-09-17 — the architecture cleanup's first tier: two open questions with answer buttons, the sea trial verdict beside dev's, and Passed/Problem on each item once it reaches staging; his marks in localStorage `tier1/wyatt`) — https://claude.ai/artifact/UkGq3PFn4mkmyx9TKTiBiB

## Build 2026.09.15.5 — staging, 2026-09-15 (waiting on his verdict)
- **The coins**: one at a time (1400ms flight, 700ms apart, stagger capped), the count steps per landing, a chink per coin
  (his three candidates are slots in `sfx/coin-chink.mp3`; A is in), elastic landings for coins and both flying crates.
- **Coins leaving the purse**: all three candidates built, SPILL in the game (`SPEND_STYLE` in `src/ui/board.js`).
- **The sail squares**: another 50% slower (pop .5s, cascade 560ms).
- **The docks**: a dock that buys nothing says so, naming the one reason a player can see.
- Sheet v38 https://claude.ai/artifact/LvqytfTYCwssQzTcmNFped · Tuner v3 https://claude.ai/artifact/N62YXT3Bg9SBfruWTJi1s3
- **Still his**: the chink pick, the coins-leaving pick, whether a dock's decline names the island, every tuner number,
  Cloudflare step 0, and the merge to main (production is still 2026.09.13.5).
- **In flight**: the CEO's bot-strategy audit (head-to-head ladders measuring whether holding a cheap crate beats the coin).
- **Build 2026.09.16.1** adds the bot work that survived measurement: one buy decision (`wantsCrate` + its gate, 117 now)
  and the dock rate derived. His cheap-crate rule was built and removed with the numbers written into the engine;
  the open question for him is whether to make a spare crate *worth* something to the objective (sheet v39).
- Pastry Pirates Roadmap (2026-09-17 — the plan to launch 1 Oct: measured state, six goals, the 14 days with his jobs marked, after-launch phases, AND every ruling and research finding from the business-planning session so they survive a cleared chat; 2 open questions, a notes box per section; his marks in localStorage `roadmap/wyatt-r1`) — https://claude.ai/artifact/7U9Cex8FxPtwA1ZPSAJ29w
