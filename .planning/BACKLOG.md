# BACKLOG — everything deliberately NOT done before the cutover

**Created 2026-08-26** when Wyatt called the cutover: *"Only game stopping blocker bugs must be
solved before the cutover; everything else should be added to a durable backlog file for future
processes."*

**There was no standalone backlog file before this one** — only a `## Backlog` section inside
`ROADMAP.md`, which is milestone-scoped and gets archived with its milestone. **This file is not.**
It outlives milestones on purpose.

**How to use it:** add anything you decide not to do, with WHY it was deferred. Nothing here is
forgotten-by-accident; everything here is deferred-on-purpose, which is a different thing and the
whole reason the file exists.

---

## 🔴 TOP OF THE LIST — sail squares a guest cannot tap

**Deferred at the cutover by Wyatt's explicit call, 2026-08-26, on the understanding that it is
written down rather than forgotten. It is the first thing to pick up.**

`crew-phone`, guest, during a **tap-to-sail** prompt — `crew-phone-guest-006-settled.png`:

```
FAIL on-screen      : clickable off-screen: sailCell, sailCell
FAIL not-occluded   : sailCell covered by #pp4Cap
FAIL sail-clickable : 3 sail square(s) covered
```

Two sail squares are off the screen and one sits under the captains panel, so **a guest on a phone
has legal moves they cannot reach.** D-38's ruling is that a control you cannot hit is *the one
unacceptable outcome*, and crew-on-a-phone is the square Wyatt actually playtests.

- **It is on the SETTLED shot, not mid-animation.** The gate separates those (`fails` vs
  `motionOnly`, `playtest_gate.mjs`) and this is in `fails`.
- **It is the ONLY structural failure across 281 screens** in the final trial. Everything else is clean.
- **Why it was deferred:** unlike the cutover's other blockers it is unbounded — the board's visible
  band fighting the captains panel at phone height, not a find-and-replace.
- **Where to start:** `boardBand()` and `capBandBottom()` in the promoted `src/ui/stage.js`, and
  `docs/BOARD-RENDERING.md`.

---

## 🔴 SEO — MEASURED BROKEN, and it is a BRAND COLLISION, not a tags problem

**Wyatt, 2026-08-26, with five screenshots of Google for "pastry pirates":** *"The seo is literally
not working… We need to be up top, indexed by ai and Gemini, the first suggestion."*

### What the screenshots actually show — read them before proposing anything

`playpastrypirates.com` **appears nowhere across five screens of results for its own name.** Not
ranked low. Absent. What occupies that query instead:

| position | what owns it |
|---|---|
| **AI Overview #1** | ***Porky's Pastry Pirates*** — a **1942 Looney Tunes short**, sourced to IMDb |
| **AI Overview #2** | **Petsi Pies**, a bakery at 285 Beacon St, Somerville MA — 4.7★, 399 reviews |
| organic | IMDb, Looney Tunes Wiki (Fandom), YouTube (74.2K views) |
| images | every one Porky's Pastry Pirates |
| videos | **all four** Porky's Pastry Pirates |
| shopping | Etsy pirate cake toppers |

**THE STRATEGIC FACT, and every plan must start here: the name collides with an eighty-year-old
Warner Bros. cartoon that owns IMDb, Fandom and YouTube, and secondarily with a real bakery Google
believes is the local intent.** Adding meta tags does not win that. Anyone proposing "improve the
meta description" has not looked at the screenshots.

### What is MEASURED about the pages (2026-08-26, post-cutover)

| claim | status |
|---|---|
| `<h1>` count | **ZERO on both pages.** Also zero `<h2>`. A page with no heading gives a crawler no topic. |
| schema.org `VideoGame` | **PRESENT and complete** — name, url, description, image, genre, platform, numberOfPlayers, free Offer |
| og: / twitter: / canonical / description | **ALL PRESENT.** My earlier claim that they were missing was WRONG and is corrected here. |
| `noindex, nofollow` | **was on the game, removed at the cutover.** While it sat at `/4` this was correct; it is gone now. |
| crawlable body text | **NOT RELIABLY MEASURED.** Two attempts gave 11,845 and 11,759 words, both polluted by HTML comments the strip missed — the sample text was source commentary, not prose. Classic measured ~1,279 words of genuine copy. **Do not build on the promoted number until someone re-measures with a real HTML parser.** |

### The hypotheses, RANKED, each marked by how much it is worth

**These are hypotheses. Only the table above is measured.**

1. **Brand collision is the whole game (high confidence — it is what the screenshots show).**
   Winning the bare phrase "pastry pirates" against Looney Tunes may not be achievable at all.
   **Fight the query you can win first:** "pastry pirates game", "pastry pirates online", "play
   pastry pirates", "pirate baking board game". The domain literally is *playpastrypirates.com*,
   which is an exact match for one of those.
2. **A JS game gives a crawler almost nothing to read (medium-high).** The page is an application,
   not a document. **There is real content in this repo already unused for this** — `RULES.md`,
   `RULES-V2.md`, and the About page. Real HTML pages of rules/how-to-play are both useful to
   players AND the only thing a crawler or an LLM can actually quote.
3. **Zero headings (high confidence, measured).** Cheap to fix and it is table stakes.
4. **Authority / backlinks (high confidence, and mostly OFF-repo).** A new domain with no inbound
   links does not outrank IMDb. This is the lever nobody in a code editor can pull, and it should be
   named honestly rather than substituted with more tags.
5. **AI / Gemini specifically (LOW confidence — do not guess here).** Being cited by assistants
   appears to follow from being crawlable, factual and quotable, plus structured data. `llms.txt` is
   speculative. **Nobody has verified how this actually works; treat any claim about it as unproven
   until someone checks current guidance.**

### Nothing has ever been measured

- No Google Search Console. **We do not know whether the site is indexed at all** — "not ranking" and
  "not indexed" are different problems with different fixes, and we cannot currently tell them apart.
  **This is step one and it costs nothing.**
- No analytics on which queries bring anyone.
- The sitemap lists `/` and `/about.html` only.

### The bar Wyatt set
*"up top, indexed by ai and Gemini, the first suggestion."* Against a Warner Bros. property, on the
bare phrase, that is a long campaign and possibly not winnable. **On the disambiguated queries it is
very winnable.** Say which one is being promised.

## 🔴 A tutorial for first-time players

A new player currently gets the *"Ahoy! Choose a recipe, gather each ingredient, then sail home
first to win!"* line and then a board with no explanation of how anything works.

- [ ] **Decide the shape first — this is Wyatt's call, not a mechanism question.** Options: a guided
      first voyage; a short interstitial before the first game; contextual first-time-only hints on
      each new control; or a "How to play" that is actually read.
- [ ] `How to play` exists in the menu — **find out whether anyone opens it** before building a
      second thing beside it.
- [ ] The game already teaches one gesture well and it is a good model to copy: *"Tap and hold the
      sea to reveal the board"* appears in-context, at the moment it is needed, and retires itself
      once learned (`PEEK_LEARNED`, `4/src/ui/stage.js`).
- [ ] **Watch a real first-timer play before designing this.** Nobody in this repo has.

---

## 🟠 Known bugs, deferred as not game-stopping

- [ ] **"Play again!" covers the award cards** at end of voyage — flagged **6 times** across two sea
      trials, every phone leg and Safari. **It is the DOCUMENTED design** (sticky was chosen because
      a button below the fold was worse). A third option exists and is unbuilt: pin it as a FOOTER
      outside the scroller — always visible AND never covering. **Cost: `#statsWrap` is also the
      draggable park sheet (D-14), so the gesture needs hand-verification.** Wyatt's call.
- [ ] **`deny` is never exercised** in crew games. A theory that it shared a cause with the covering
      bug was written down in advance and **disproved**. Unexplained.
- [ ] **31% of screens never settle** before being checked — all now reporting `churn: geometry`
      (the text class is fixed). Something moves >8px for 2.6s+. Diagnosable but undiagnosed.
- [ ] **8 of Wyatt's 35 playtest items untouched**; 5 parked with written diagnoses.
      See `.planning/phases/02.3-the-two-hour-playtest/TRIAGE.md`.
- [ ] **Large empty gap in the desktop right-hand column** at 1890x960 — pre-existing, taste, his call.

## 🔴 THE DETERMINISM CORPUS IS UNBOUND — removed from `npm test` at the cutover

**This is a REMOVED GATE, named loudly rather than left red or quietly made to pass.**

`npm test` no longer runs `determinism_baseline.js --verify`. It failed **31 of 31 seeds** the moment
the cutover landed, and the reason is not a bug: **the corpus was recorded against the engine that
used to be at the repo root, and the root is now a different game.** `scripts/lib/load_engine.js`
imports `../../src/engine/index.js` — tree-relative to its own location by deliberate design — so it
now loads the promoted engine and checks it against the previous engine's fixtures.

**What was actually lost tonight: nothing.** The corpus belongs to the classic engine, which is
frozen (no code commit since 2026-08-02), so it cannot regress. The promoted game **never had a
corpus** — `docs/DETERMINISM-CAPTURE-4.md` was written in advance precisely because capturing one is
a *one-way door*. Coverage today is identical to coverage yesterday. What is lost is the *guard*.

**Why it was not fixed on the night:** the honest fix is a re-point, and it is wider than it looks.
`4/scripts/lib/load_engine.js` is a byte-identical twin that resolves to `4/src/engine` — which no
longer exists — so it is broken too, and `lib_twin_check.js` exists to assert those two files never
drift. Making them legitimately differ is a change to a check's premise, and that is not work to do
at 1am on a one-way cutover. `DETERMINISM-CAPTURE-4.md` says this exact thing: the door should be
opened "deliberately — instead of a thing somebody discovers at 3am, mid-phase, with a red suite and
no procedure."

**The choice waiting to be made, and it IS a choice:**
1. **Point the verify at `classic/`** — restores exactly yesterday's coverage. Needs `load_engine` to
   take a tree, and needs `lib_twin_check`'s premise revisited.
2. **Capture a corpus for the promoted engine** — NEW coverage the game has never had, and a one-way
   door. Follow `docs/DETERMINISM-CAPTURE-4.md`; do not improvise it.
3. Both, in that order.

`npm run test:determinism` still exists and still fails, on purpose, so the gap is one command away
from being visible rather than hidden.

## 🔴 GATES PARKED BY THE CUTOVER — 34 in the chain became 18

**Named individually, because a parked gate nobody wrote down is a gate nobody restores.**
The suite is GREEN at 18. It is green honestly — nothing was made to pass, and nothing that guards
the live game was dropped.

### Not a loss — 6 gates
The six `--tree=4` runs were deleted as **duplicates**: root now IS the promoted game, so the bare
runs beside them already cover it. Zero coverage lost.

### An UPGRADE — 3 gates
`dlog_replay_test`, `net_registry_test` and `rim_sweep_trace_test` passed against the promoted game
and were deliberately LEFT on the root. **They now guard the live game for the first time**; before
the cutover they only ever saw v1.

### Re-pointed, coverage preserved exactly — 2 gates
- `ui_contract_check` → `--tree=classic`. It is now tree-aware through the shared picker.
  **It fails 24 assertions against the promoted game and those are REAL:** 2 retained globals
  (`window.__pulseBeacon`, `window.__pp4`) not on the allowlist, and **~22 player-facing strings
  still in the pre-conversion you/your register** instead of ye/yer — rule 12's voice, in the live
  game. See the entry below.
- `hail_ranking_test` → imports `classic/src/`; it tests v1-only exports.

### PARKED — 10 gates, each with its symptom
| gate | why it is parked |
|---|---|
| `determinism_baseline --verify` | corpus bound to the tree that moved — see the 🔴 entry above |
| `storm_moored_reason_test` | **mixes engines**: `loadEngine()` pulls the PROMOTED engine while the test imports classic's flow → `g.windPush is not a function` |
| `audio_mapping_test` | resolves `sfx/*.mp3` by a path that moved |
| `bot_storm_narration_test`, `narration_test`, `narration_flow_test`, `extract_narration_lines`, `economy_guard_test`, `narration_audit_check` | v1 narration/economy suites; import v1-only exports |
| `gate_citation_check` | **its premise is retired, not its paths.** It asks "does this gate read `4/`?" and `4/` no longer names the game. Post-cutover the question is "does it read root" — a redesign, not a path fix |

Their invocations are preserved verbatim in `package.json` under `scripts.test:v1` and
`scripts.test:parked-citation` so restoring them is copy-and-paste, not archaeology.

## 🟠 THE PROMOTED GAME FAILS 24 UI-CONTRACT ASSERTIONS — and ~22 are the pirate voice

Surfaced the moment the cutover pointed `ui_contract_check` at the promoted tree.

- **~22 × `D-29-REGISTER`** — player-facing strings still reading the pre-conversion 2nd-person
  register (you/your) rather than ye/yer, in `src/orchestrator.js` (1145, 1194, 1195, 1733, 2225),
  `src/ui/bakeoff.js` (645–647, 681), `src/ui/board.js:2205` and `src/ui/flow.js` (425, 749,
  1232–1235, 1376–1377, 1402, 1499–1505 …). The spec is
  `art-review/narration-audit.html`'s PIRATE_MAP. **This is CLAUDE.md rule 12's voice boundary, in
  the live game, visible to players.**
- **2 × retained globals** — `src/ui/pulsebeacon.js:151` assigns `window.__pulseBeacon` and
  `src/ui/stage.js:3331` assigns `window.__pp4`; neither is on the allowlist. Both are debug hooks:
  either allowlist them deliberately or stop shipping them.

**Fixing these is how `ui_contract_check` gets promoted from guarding the frozen game to guarding
the live one.** That is the real prize here, and it is a copy pass plus two decisions.

## 🟠 Process debt

- [ ] **The seeded-defect drill still cannot fail.** `4/scripts/qa/seed_drill.mjs:72` grades on the
      leg's **exit status**, and the leg fails on its own for unrelated reasons — so every seed scores
      CAUGHT whether the bug is present or not. **Fix: run one UNSEEDED baseline first and grade each
      seed only on failures the baseline did not have.** ~15 lines.
      **Until this exists there is no evidence the sea trial catches Wyatt's bugs.**
- [ ] **Nothing gates the push.** A ~15-line `pre-push` hook could refuse game code without a
      completed sea trial for that build stamp — and would also dodge the post-push gear blindness.
- [ ] **Red-proof meta-gate** — nothing verifies the 34 gates can go red. Only 5 of 42 scripts carry
      a `FAILURE DEMONSTRATION` header; it is a habit, not a gate.
- [ ] **Trigger-fired lessons** — extend `.claude/hooks/` so a lesson arrives when you are about to
      make the mistake, not at session start. The rule-17 hook proves the pattern works.
- [ ] **Volume**: `HARD-WON-LESSONS.md` is ~1316 lines and CLAUDE.md ~960, and every session is told
      to read both. CEO review 5 recommends collapsing §10c/e/f/g to one line each.

## 🟡 Roadmap phases deferred past the cutover

- [ ] **Phase 5 — Trade Over the Wire.** Multi-captain trade inside one turn, counter-offers across
      the wire, a guest with the same controls as the host.
- [ ] **Phase 7 — The Board Fits.** The whole board visible on a laptop.
- [ ] **Phase 8 — A Desktop Worth the Width.**
- [ ] **Phase 9 — The Written Record.** The rules rewritten from the code; ~40 rulings and 13
      approved copy strings lifted out of commit bodies.
- [x] ~~**Tidy-up**: `v2/`, `v2bakeoff/` and `3/`~~ — deleted at the 2026-08-26 cutover (96 files,
      3.3MB, recoverable from git history).
- [ ] **`4/scripts/` is the last thing left in `4/`.** The game moved to the root at the cutover but
      the dev scripts stayed put, to avoid merging two `scripts/lib/` directories at midnight. Moving
      them to `scripts/` means resolving exactly two collisions — `lib/` and `no_undef_check.js` —
      and deciding what `lib_twin_check.js` compares once there is only one `lib/`. Until then `4/`
      is a directory holding only tooling, which reads as leftover and is kept out of the index in
      `robots.txt`.
- [ ] **Safari storm on a real device** — never measured on this build. Headless WebKit now runs in
      the sea trial, but `DRIVING-THE-GAME.md` §9 is explicit: *"Chrome is not Safari… a green
      harness still earns a human Safari pass."*

### §0 — what was MEASURED on 2026-08-26 night, and the two theories it killed

**No fix yet. Two hypotheses eliminated and one mechanism located — recorded so the next session
does not re-derive them.** Measured on a real solo phone (390×664) at a live sail prompt, values
read from the rendered page, not reasoned:

```
vw 390  vh 664
#board      l0 t86  r390 b476   (390×390 — a SQUARE)
#boardwrap  l0 t86  r390 b476   (identical)
#pp4Cap     l0 t476 r390 b664
#sailHost   l-185.4 t-48.6 r575.4 b712.1   transform: scale(1.95052) translate(-185.351px,-134.637px)
viewBox "155.94 113.27 328.118 328.118"    preserveAspectRatio "xMidYMin meet"
```

**KILLED — "the HTML sail layer and the SVG board are scaled by different numbers and drift."**
This was the sharper theory and it is wrong. Worked through arithmetically from the measured values:
SVG puts a board unit at `390/328.118 = 1.188595` px each; the HTML layer puts it at
`(1/640)·390 · (640/328.118)` = **the same 1.188595**. Checked at three board coordinates across the
whole width — **agreement to 0.000 px**. The two paths do not drift. *(Its own falsifier — "if
`#board`.width === vwPx() there is no mismatch" — is exactly what the measurement shows: both 390.)*

**KILLED — "the captains panel overlaps the board's visible band."** The board ends at y=476 and
`#pp4Cap` begins at y=476. They are **adjacent, not overlapping**, at this size in this mode.

**LOCATED — nothing clips the camera-mapped HTML layers.** `#boardwrap` is
`position: relative; width: 100%; container-type: inline-size` with **no `overflow` rule**. The
`overflow: hidden` in this area belongs to `#board`, which is the SVG and clips only its own
content — not its sibling HTML layers. And `#sailHost` measures **−48.6 → 712.1**, far outside the
board's 86 → 476, because it is a transformed layer whose children paint wherever the transform puts
them. **So a sail square whose board coordinate is outside the current camera frame paints outside
the board entirely** — over the ribbon above, or into the captains panel's band below, which is
exactly what `sailCell <- covered by #pp4Cap` reports.

**WHAT IS STILL NOT KNOWN, and why no fix shipped tonight.** `camFitCells()` fits the bounding box of
every legal cell plus the player's own ship, grows the frame for the prompt's reserve, clamps to 640,
and `camTo` clamps the origin into the board — **on paper every legal square should always be in
frame**. So the open question is what puts one outside it. The two candidates, neither measured:

1. **The camera has not moved yet.** `camTo` REMEMBERS rather than performs while a centre-stage card
   or the flip veil holds attention (`stageHoldsAttention()` → `S.camHeld`), and `tick()` performs it
   later. Squares drawn before that glide would sit on the old frame.
2. **The glide is mid-flight.** `camTo` tweens over 650 ms; the trial reports **31% of screens hit the
   settle cap**, so screens are being judged while still moving.

**The decisive measurement is a CREW GUEST at a tap-to-sail prompt** — that is where it reproduces,
and tonight's probe was solo. Read `S.camHeld`, `S.tween`, `S.cam` and every `.sailCell` rect at the
settled moment, and ask whether the failing cells are outside the frame the camera was asked for or
outside the frame it had actually reached.

> **Do not "fix" this by clipping `#sailHost`.** It would stop the square painting over the captains
> panel and would NOT make it reachable — it would hide a legal move instead of showing an
> unreachable one, which is worse. The fault is the frame, not the paint.

---

## 🟠 THE FIRST HONEST FULL SEA TRIAL SINCE THE CUTOVER — 2026-08-27, 81 min, 8 legs

**It FAILED, which is the point.** Until tonight it crashed on `ENOENT` before sailing a leg, so this
is the first real result the gate has produced since the promotion. Build `2026-08-26k-CUTOVER`,
gear FULL, legs: solo-desktop, solo-phone, passplay-phone, passplay-desktop, crew-desktop,
crew-phone, solo-desktop-wk, solo-phone-wk.

### The ONLY structural failure across all 8 legs is §0 — again

```
crew-phone-guest-006-settled.png
  FAIL on-screen      : clickable off-screen: sailCell
  FAIL sail-clickable : 1 sail square(s) covered: a sail square <- nothing (outside any element)
```

Same leg, same seat, same screen number as every previous trial. *"Covered by nothing (outside any
element)"* means the cell's own centre is **outside the viewport** — `elementFromPoint` returned
null. **Everything else in the game is structurally clean.**

**Three attempts to reproduce it under measurement, all on a real two-phone crew rig, failed** — 2
sail prompts measured in one run, 15 cells in another, every cell fully on screen. **It is
intermittent**, which the drill's null test independently measured (crew noise floor 3, solo 0).
That is why it must be fixed before any crew-phone verdict can be trusted.

### What the vision judge saw — read the pictures, not the captions

| screen | finding |
|---|---|
| `solo-phone-022`, `solo-phone-eov` | **"Play again!" covers the award cards**, cutting off their descriptions. This is now the **eighth** flag across three trials |
| `crew-phone-host-008` | **NEW — a ghosted rounded-box edge peeking above the "Tap and hold the sea" bubble**, just under the wind bar |
| `passplay-desktop-009`, `crew-desktop-host-006` | large empty dead space in the right-hand column — the known desktop gap, his call |
| `solo-phone-019` | two circular trade labels "overlap/touch". **MEASURED FROM THE IMAGE: they are ~11 CSS px apart — crowded, NOT overlapping.** The judge over-reported; the structural `no-pile` rule was right to stay quiet. Recorded so nobody "fixes" a non-bug |

**The ghost box is worth a look.** A floating box is being placed with its top ABOVE
`boardBand().top`, so `#pp4Fx` — the clipped host — cuts it and leaves a sliver showing. The fix is
in the placement, not the clip; not attempted unattended because re-tuning bubble placement without
Wyatt's eye is exactly the kind of taste change that costs a round.

### A STANDING ENTRY IS NOW WRONG, corrected in the open

**"`deny` is never exercised in crew games. Unexplained."** — that is no longer true. This trial
exercised it: **`deny:1/7` on crew-desktop and `deny:1/4` on crew-phone**, with `counter:2/5` and
`counter:1/3` alongside. It was very likely never exercised *because the crew legs could not run at
all* — the browser fleet was loading a directory listing. **Rule 6 applies to standing claims too:
this one was inherited, not re-measured.**

### TWO LEGS DID NOT RUN — and a leg that did not run is not a leg that passed

`solo-desktop-wk` and `solo-phone-wk` both died with *"playwright not found"*. **Safari/WebKit
coverage in this trial is ZERO.** The report says so in its own NOT-RUN column, which is the one
thing that column exists for.

### Coverage worth watching

`menu:0/1` on every single leg — the game offers the menu and the driver never opens it, so nothing
behind ☰ is being exercised at all. Several ingredient options sit at `0/2`.

### T-23 "nobody can watch a bot bake" — the mechanism, traced 2026-08-27 (READ, not measured)

**This is not a feature to build. It is one missing publish.** The whole watching apparatus already
exists and already works for humans; a bot simply never feeds it.

The chain, read end to end:

1. `bakeoffPrompt` (`src/ui/flow.js`) builds `onBench = patch => netHandlers().onBenchPublish(spec, p.idx, patch)`
   and hands it to `playBakeoffLive` — **but only on the branch that runs a HUMAN's attempt.**
2. `watchBattle` (`src/orchestrator.js:551`) is attached by **every** client, host included, and its
   bake branch `if(v&&v.bake){applyBenchSnap(v.bake);return;}` runs **before** the `isHost` guard.
3. `applyBenchSnap` skips only `decisionIsLocal(snap.seat)`, and `decisionIsLocal(s)` is
   `(passAndPlay && human) || s === appState.mySeat` (`src/ui/util.js:2158,2174`). **For a bot seat
   that is FALSE on every client, including the host.**
4. So `benchWatch(snap)` would run and draw the face-down bench for everyone — **if a snapshot ever
   arrived.** None does: a bot's bake never goes through the human branch, so `onBench` is never
   called and nothing is ever published.

**So the fix is to publish a bench for a bot's attempt, not to build a watching mode.** Everything
downstream — the face-down bench, the picks, the reveal, the "X is at the ovens — watch the crates"
hint, the paid-replay epoch handling — already exists and is already shared by both tiers.

**Why this matters more than its size suggests:** in SOLO every opponent is a bot, so a solo player
currently never sees a single opponent's bake-off. Wyatt: *"a vital part of the gameplay and endgame
tension."*

> **STATUS: READ, NOT MEASURED.** No bot bake was observed under instrumentation. Before building,
> confirm by watching a solo bake-off that `onBenchPublish` is never called for a bot seat — that is
> the one claim above that a measurement could overturn.

### T-06 "host sees nothing during a guest's bake" — re-read, still not reproduced

Wyatt ruled 2026-08-26 that **the bench SHOULD be there**, so this is a bug in the watch path, not a
design question. Re-reading it on 2026-08-27 confirms the earlier trace: `watchBattle` is attached
on the host, the bake branch precedes the `isHost` return, and `decisionIsLocal(guestSeat)` is
**false** on the host — so nothing in the path blocks it. **By reading, the host should get the
bench.** He saw neither the bench nor the broadcast wait line.

**That exhausts what reading can settle.** It needs a live crew bake with the two-phone rig and the
publish/receive instrumented on both sides — is `onBenchPublish` firing on the guest at all, and is
`watchBattle`'s callback receiving it on the host?
