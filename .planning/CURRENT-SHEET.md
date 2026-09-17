# The live playtest sheet

**One line, deliberately.** This file exists so a Stop hook — and the next session — can name the
sheet Wyatt is actually using, instead of guessing or publishing a sixteenth artifact beside the
fifteen that already exist.

**Update the URL here in the same commit that republishes the sheet.** If they disagree, the URL
here is the one that is wrong.

SHEET: https://claude.ai/code/artifact/a1623d69-328c-417e-920f-8a99782ebce2
BUILD: 2026.09.16.1-staging@7fb54490

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
- Game Feel Tuner (2026-09-15, his ask four times over: dials for the coins, the crates, the sail squares, the cannon's recoil/smoke/shake, the speed lines and confetti; three coin "chink" sounds and three "coins leaving the purse" candidates to pick; his numbers in `feel/wyatt`) — https://claude.ai/artifact/N62YXT3Bg9SBfruWTJi1s3

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
