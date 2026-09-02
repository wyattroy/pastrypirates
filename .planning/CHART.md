# THE CHART — the one plan

*Wyclau's single plan file (charter part 1). The launch line worked backwards from the date, the
idea inbox, and what's blocked on Wyatt. Sessions: enter through the Door
(`.claude/skills/door/SKILL.md`), claim before editing, keep this file current — it is the source
the Glass derives from.*

**Until the cutover, the per-bug game backlog stays in [`BACKLOG.md`](BACKLOG.md)** — the
Razer engine works from it. This file owns the launch line and the reboot. *(The Mac fix session
that was also working it is archived as of 2026-08-31.)*

---

## THE LAUNCH LINE

Mission: the Reddit launch (overdue since ~2026-07-30; the date gets committed at the end of
step 2). Wyatt's five-item bar is step 3.

| # | Step | State |
|---|---|---|
| 1 | **The reboot** (Door, Glass, watchdog, rulebook, memory, pruning) | **IN PROGRESS** — see checklist below |
| 2 | **The foundation** (one-director rebuild, 6 steps) | **DONE, in every step that can be.** Steps 1-5 shipped (step 5 as the narrow half, his ruling, 2026-08-31); step 6 largely already enforced by existing gates. **Launch date proposed here.** |
| 3 | **The launch list**: finished feel solo+crew · tutorial · analytics · code-privacy decision · SEO | not started; sized at step 2 |
| 4 | **Launch, then the till** (accounts + paid merch, +1 month) | not started |

> ### ⚑ IF YOU ARE HERE TO REDESIGN THE BOSUN / QUARTERMASTER / WATCHDOG SYSTEM, START HERE
>
> **[`.planning/wyclau/REDESIGN-BRIEF.md`](wyclau/REDESIGN-BRIEF.md)** — every major failing,
> success and learning from 48 hours of running it, written 2026-09-01 at Wyatt's instruction
> *"so that a new fresh session can redesign it"*. Readable page:
> https://claude.ai/code/artifact/b9a6a1f8-cd4d-4525-be4a-b68800dbc374
>
> It opens with the numbers rather than the narrative — 6 of 17 trials ever produced a verdict,
> the watchdog launched four engines in one day and every one fired while a session was working,
> and one bug has seven instruments and zero fixes — then separates what held from what failed,
> role by role, with the Bosun's own failures tagged as its own. It ends with seven open questions
> a redesign has to answer, starting with **who owns liveness**, given that every proxy tried so
> far (heartbeat, activity stamp, commit clock) has failed in both directions.

## STEP 1 CHECKLIST — the reboot (estimate 2–3 days from 2026-08-31; re-sized end of day one)

*Open items carrying `GATED:` are not currently actionable — say why right after the marker. A
watch picking its one item skips GATED rows; keep the marker exact so "nothing unblocked" stays
readable at a glance. (The Stop hook that used to parse this string was deleted 2026-09-01 with
the Watch redesign — see the section below.)*

### ⚑ THE WATCH REDESIGN — 2026-09-01, supersedes the machinery rows above

Wyatt's sixteen rulings (`.claude/memory/DECISIONS.md`, "THE RELAY REDESIGN") replaced the
Bosun/Quartermaster/watchdog with the **Watch** (a relay of fresh one-item runs), the **Bell**
(`scripts/wyclau/bell.ps1` — rings a watch when none is on deck), the **Inbox**
(`.planning/wyclau/INBOX.md` — his words, obeyed first), and the **close gate**
(`scripts/wyclau/close_item.mjs` — no tick without a CEO verdict). Design, published:
https://claude.ai/code/artifact/8c855d0c-92b5-471e-9c51-f6800f1e8539


- [ ] **⚑⚑⚑ TOP PRIORITY, HIS WORDS: "add it to the chart at the top priority". THE GLASS MUST NOT
      BE ABLE TO LOSE HIS WRITING.** `INBOX-20260902T192000Z` (the build; the design half closed as
      `INBOX-20260902T191500Z`). Designed 2026-09-02, 3:15 PM ET; **design only, the build is
      yours.** Full spec: [`SPEC-GLASS-HARVEST-SAFETY.md`](SPEC-GLASS-HARVEST-SAFETY.md).
      **CEO 117 returned PARTIAL and its two corrections are already folded into the spec** — Layer
      D was specifying something that already ships (`glass.mjs:1218`), and Layer A's "unknown" was
      half answered in `glass.mjs:22-23`. **Read the spec, not this row's summary of it.**
      ⟨`T-105`⟩
      **HIS INVARIANT, AND THE WHOLE DESIGN HANGS ON IT:** *"the harvest stamp records when a
      session looked. It is not evidence the page hasn't changed since. Your page carries its own
      version number — that's the fact that can answer 'is a republish safe?', and a clock never
      can."* **Identity, not a clock.**
      **IT IS NOT A THEORY. IT HAPPENED TODAY WITH SEVEN OF HIS IDEAS IN IT.** The tick harvested at
      **3:07:08 PM** and correctly found nothing; **his first idea landed at 3:07:15 PM, seven
      seconds later**; six more followed. From that moment the stamp read "fresh" for thirty minutes
      and `.claude/hooks/glass-harvest-first.cjs:37` (`FRESH_MIN = 30`) would have green-lit any
      republish, which regenerates the page from disk and drops `glassState`. **They survived by
      luck of ordering, not by design.**
      **THE ACCEPTANCE TEST IS THAT REPLAY, and nothing else counts:** harvest at T finds nothing, he
      writes at T+7s, a session republishes at T+5min — **his words survive, or it is not a fix.**
      **FOUR LAYERS, in the spec, cheapest first:** (A) the Artifact tool already refuses a publish
      over a newer version — so **never pass `force`**, and gate against it; (B) the stamp records
      the **artifact version id**, not a time, and is compared immediately before publishing —
      `FRESH_MIN` deleted; (C) harvesting becomes idempotent by idea id, so a double harvest is
      harmless and a missed one is recoverable; (D) **the page stores each idea the moment he
      submits it**, so his words are never in only one place.
      ⚠ **ONLY LAYER D EARNS THE WORD "PERMANENT" — A, B AND C NARROW THE WINDOW AND D REMOVES IT.**
      Do not let a smaller layer ship under that word.
      ⚠ **AND THE FIRST MOVE IS A MEASUREMENT, NOT CODE.** Layer A rests on an unverified claim:
      whether a save WYATT makes in the page raises the tool's conflict, or passes silently as the
      session's own write. **Measure that before building anything** — if it conflicts, A is nearly
      the whole fix and B is ceremony; if it does not, A is worthless and B is mandatory.
      **THE FAULT IS ALSO IN WHERE THE GUARD SITS, not only what it is made of.** The tick reads at
      step 2 and publishes at step 7 (`GLASS-UPDATE-SESSION.md`), with a gate, a stamp, a Chart reap,
      a staleness judgement and a regeneration in between — **so even a perfect tick has a
      multi-minute gap between the read and the destructive act.** Move the check to step 7.
      **Sizing: no game code, no sea trial.** Hooks, the Glass runbook and `glass.mjs`.
- [ ] **ONE LABEL IS DOING DUTY FOR THREE UNRELATED FAULTS, AND EVERY READER OF HIS PAGE HAS DRAWN
      ⟨`T-090`⟩
      THE WRONG CONCLUSION FROM IT — INCLUDING THE ADVISOR, TO HIS FACE.** His idea, 3:30 PM ET,
      `INBOX-20260902T193000Z`: *"do you want to put those in the Your Call section so I can
      approve/deny them being closed?"*
      **His page says "N tasks on your list look already finished."** Ran
      `node scripts/wyclau/chartkeeper.mjs --reap` and read all ten: **not one of them is flagged
      "looks finished."** Six say *the evidence is stale because the build moved on*, three say *he
      ruled and the row never moved*, one says *a pid is dead*.
      **THE ANSWER TO HIS IDEA: right instinct, wrong pile.** Stale-evidence rows need RE-MEASURING,
      not his approval — he cannot know from a phone whether a trade circle still clips a name.
      Already-ruled rows must never go back to him; that is `T-090`'s exact fault, the one he was
      furious about at 1:38 PM today. **Your Call is right for the residue only** — rows whose fate
      is genuinely his say-so, like *"merge the 465-commit branch to main — his own final say-so"*.
      **That pile is one or two rows, not ten.**
      ⚠ **AND THE "HE ALREADY RULED" SIGNAL CAN FIRE ON A ROW HE NEVER RULED ON. VERIFIED:** `T-078`
      (`CHART.md:1047`) is *"chase it only if it is seen again"* about an `<img>` that failed to paint
      once in a WebKit frame — matched against his **12:39:56Z ruling on whether a watch may read the
      claude-kit folder**. Unrelated. **Under his proposal, unfixed, that row would be put to him as a
      question — the very failure the proposal exists to reduce.** Fix the matcher before wiring
      anything to his page.
      **THE BUILD, in order:** (1) split the reap by KIND and name each kind in the note in his
      words; (2) fix the ruling-to-row matcher and red-proof it on `T-078`; (3) route each kind to
      its owner — re-measure, close, or ask him; (4) only then, his Your Call pile.
      **Sizing: `chartkeeper.mjs` and `glass.mjs`. No game code, no sea trial.**

*Rows tagged **Your ruling:** are his own decisions, triaged out of the RULED waiting room below
(2026-09-01, INBOX-20260901T1310Z). The tag is how he tells his own call from a row somebody else
wrote; `scripts/qa/rulings_triage_check.mjs` keeps each one matched to its settled ruling.*

- [ ] **⚑⚑ HE WROTE "DO NOW" ON BOTH OF THESE HIMSELF, AND THAT IS THE ONLY REASON THEY ARE THIS
      ⟨`T-103`⟩
      HIGH.** *(This row asserted "THEY ARE THE TOP TWO ROWS" while sitting third — CEO 117 caught
      it. **A row must not claim its own position: RANK decides that and moves rows under it.**
      Measured 3:22 PM ET: score 108, rank 3 of 53.)* Glass, 2026-09-02, 3:09 PM ET. Triaged here by the Advisor at 3:12 PM out of
      THE IDEA INBOX, where the harvest correctly parked them **below every open checklist row** —
      which is the exact sinking he has now complained about five times.
      ⟨`T-103`⟩ ⟨`T-104`⟩
      **HIS WORDS, VERBATIM, BOTH:**
      1. *"DO NOW: build a way for me to drag to reprioritize the chart, in The Glass."* ⟨`T-103`⟩
      2. *"Do Now: in the Glass, Add a \"DO now\" button next to \"Send to the Chart\" button that
         tells RANK to put this task at the top"* ⟨`T-104`⟩
      **THESE ARE THE CONCRETE BUILD OF `T-083`'s SECOND HALF**, which is the row directly below and
      carries his earlier words: *"i need a way to say DO THIS NOW."* **Read `T-083` first — it is
      the design and it is his — then build these two as its interface.** They are not a separate
      idea and must not be designed twice.
      ⚠ **AND THE JOKE IS LOAD-BEARING, SO DO NOT LOSE IT: he had to type "DO NOW" in prose,
      twice, because the button that would have let him say it does not exist yet — and the request
      for that button then sank to the bottom of the list.** The feature is its own acceptance test:
      **had `T-104` been shipped, `T-104` would not have needed rescuing by hand.** That is the same
      sentence the Chartkeeper audit already earned once (`INBOX-20260902T04xxZ`), now true a second
      time, of a different tool, in one day. **A hand-placement like this one is the failure, not the
      fix** — it works once and generalises to nothing.
      **Sizing: both are Glass UI (`glass.mjs` plus `chartkeeper.mjs`'s rank input). No game code,
      no sea trial** — COSMETIC gear plus a rendered screenshot at 390×844. Verbatim text and the
      harvest account: `THE IDEA INBOX` below, and the Glass commits `996ee621` / `7042c7e0`.

- [ ] **A TRADE-OFFER CIRCLE CANNOT HOLD ITS OWN CAPTAIN'S NAME — filed 2026-09-02T02:4xZ by the
      ⟨`T-017`⟩
  watch that judged the queue, deliberately not fixed by it (one item; and a stamp bump would retire
  the trial sailing at the time).** In a trade, the circle telling you *whose* offer you are about to
  accept is the one piece of text on it that does not fit. **Two independent legs, two sizes, both
  settled screens:** `solo-tablet-014-settled.png` — *Crustbeard* clipped by its own disc, the C on
  the left rim and the final d severed on the right, while "Walk away" in the identical circle beside
  it fits with room to spare; and `crew-desktop-guest-012-settled.png` (build stamp `2026.09.01.7`
  legible in the side rail) — *Flaky Jack* hanging out of both sides. Both images are preserved in
  `judge-1914Z-shots/` and are the "before" of the posed pair.
  **Where it comes from, read not guessed:** `src/ui/flow.js:2183-2184` builds each offer circle's
  compact label as `short:` — the captain's name as line one of a two-line label inside a
  fixed-diameter disc, with nothing sizing the name to the circle. **Every captain whose name is
  longer than "Walk away" is a candidate**, so this is a rule to write once, not two names to
  shorten (his standing instruction on the call circles: *"Fix this universally, not through
  patches"*). Rule 26: pose it, before and after, same seed — do not go looking for a rate.
  Account: [`.planning/JUDGED-2026-09-02T0152Z.md`](JUDGED-2026-09-02T0152Z.md).

  **⚑ A THIRD INSTANCE, ON THE CURRENT BUILD AND A THIRD ENGINE/SIZE — and this one the AUTOMATIC
  judge caught by itself. Watch 2026-09-02T03:00Z.** `solo-desktop-wk-021-settled.png` (in the
  0137Z queue, build stamp **`2026.09.01.8`** legible in the side rail): the offer circle reads
  **`rustbea`** — *Crustbeard* severed at BOTH ends, losing the leading `C` and the trailing `rd`,
  while *"Walk away"* in the identical circle directly below it fits comfortably. The judge's own
  words were *"showing only 'rustbea'"*; opening it confirms that exactly.
  **What the third instance adds:** the first two were Chromium tablet and Chromium crew-desktop on
  build `.7`. This is **WebKit desktop on `.8`** — so it is neither engine-specific, size-specific,
  mode-specific, nor fixed by anything that has shipped since. **Three sightings, three
  configurations, one cause.** It reinforces rather than changes the fix: one rule that sizes the
  name to the disc, written once.
      ⚠ STALE-CANDIDATE — measured on build 2026.09.01.7; the tree is 2026.09.02.1, so its evidence no longer describes this game




- [ ] **BUILD THE KIT-BEHIND DETECTOR — the half of `T-078` he asked for and nobody has
      ⟨`T-084`⟩
      built. It is UNBLOCKED as of 2026-09-02T13:5xZ and it was blocked by one missing flag.**
      **His condition, in his own words:** *"DO NOT ALSO DELETE THE CHECK. Red-proof both ways: a
      local edit must NOT fail; **a kit that has fallen behind must be reported**."* The first half
      shipped and is gated (`vendor_lock_inverted_check.mjs`). **The second half does not exist** —
      `vendor_check.mjs` currently prints, honestly, that it did NOT check whether claude-kit has
      moved forward, on every path. That admission is a placeholder, not the answer.
      **WHY IT WAS "IMPOSSIBLE" AND WHY IT IS NOT — read this before starting, it is the whole
      story.** Three watches recorded a read of `C:\Users\wyatt\Projects\claude-kit` as REFUSED and
      each concluded the kit was unreachable. **Wyatt was asked and ruled "yes" at
      2026-09-02T12:39:56.363Z** (his RULED table, below) — and thirty-one minutes later a watch
      still wrote *"THE HALF OF HIS SENTENCE THAT CANNOT BE BUILT HERE"* into a gate, because the
      ruling had not been harvested. CEO 106 caught it. **A REFUSAL IS A PERMISSION SETTING, NOT A
      FACT ABOUT THE WORLD.** The fence was `bell.ps1`'s launch line carrying no `--add-dir`; it now
      carries one (commit `9c4edb48`, gated both ways in `bell_check.mjs`).
      **SO THE FIRST WATCH THE BELL RINGS AFTER `9c4edb48` CAN READ THE KIT. Check that first** —
      if the read is still refused, the ring predates the change or the kit is not beside the repo,
      and the launcher's own log line now says `kit: readable` or `kit: not present`.
      **Sizing: small-to-medium.** `install.sh check <repo> wyclau` already answers the question
      from a tree holding both; the work is calling it (or hashing the kit's copies directly) and
      reporting BEHIND as news, in the same four-kind vocabulary `vendor_check.mjs` now uses.
      **Red-proof: a kit deliberately set one commit back must be REPORTED; a kit in step must
      not be.** And case 6 of `vendor_lock_inverted_check.mjs` gets STRONGER when this lands — it
      currently asserts only that the file admits it has not checked. Do not delete it; tighten it.
      ⚠ STALE-CANDIDATE — your answer landed — **"yes"** — ruled on the Glass 2026-09-02T12:39:56.363Z, no note attached — and nothing moved this row
- [ ] **A THIRD OF THE ART LIBRARY HAS NO MEASURED GAMEPLAY MAXIMUM — 1.25 MB the resize question
      ⟨`T-088`⟩
      cannot see. Filed 2026-09-02T16:0xZ at CEO 109's finding.** Split into three, biggest first:
      **(a) 74 files / 1.05 MB `NOT SEEN`** — the probe reaches five surfaces and never draws the
      badge family, the battle icons or the ingredient `holes/`. Not measured, so not safe to
      shrink, and that is 27% of the library sitting outside the answer.
      **(b) 13 files / 0.20 MB whose only sighting is OFF the game** — and CEO 109 checked two of
      them by hand: `icons/crown.png` (320×315, 35 KB) is drawn at 15px in the captains panel
      (`index.html:428`), 18px in the End-of-Voyage banner (`src/ui/board.js:2072`) and ~34–38 CSS
      px in the victory confetti (`src/ui/board.js:2024`); `icons/cupcake.png` (253×320, 28 KB) the
      same via `celebrateHomeDocks()` (`src/ui/board.js:2003,2016`). **At 38 CSS px on a 2× screen
      both still carry ~4× the pixels they can use — 63 KB, more than half the whole remaining
      candidate list, in a bucket labelled "do not shrink".** They need their gameplay slots
      measured, not assuming.
      **(c) the camera-layer caveat, open since CEO 83 and still unfixed** — the probe applies the
      zoom ceiling to `svg image` only, so an HTML `<img>` inside `CAM_HTML_LAYERS`
      (`src/ui/stage.js:476`) is measured at whatever zoom happened to be on. `trade-swirl` and
      `wind-arrow` are both in `rimHost` (`src/ui/board.js:243-250`), so **their two rows in the
      current candidate list are FLOORS, not values** — 2 of the 12.
      **Sizing: this is a measurement item, not a resize item. It decides whether `T-087`'s 2.3% is
      the real answer or an underestimate.** No game code.
- [ ] **HARVEST HIS 12:39:56Z KIT RULING INTO `DECISIONS.md` — a two-minute edit this watch
      ⟨`T-085`⟩
      was refused permission to make, and its absence has already cost one item.**
      The ruling: *"May an unattended watch READ the claude-kit folder?"* — **"yes"**, ruled on the
      Glass 2026-09-02T12:39:56.363Z. It is in the RULED table below and **nowhere else**
      (`grep "claude-kit folder" .claude/memory/DECISIONS.md` → 0). `CLAUDE.md` §5: *"A ruling he
      made that nobody harvested is the failure this system exists to stop."*
      **The entry is already written** — it is in the ledger under WATCH 13:10Z and in commit
      `9c4edb48`'s message, including the alternative he did not pick (leave the fence up and keep
      routing kit work to a human) and the scope limit (**this ruling is about READING; nothing in
      it authorises a watch to PUSH to claude-kit**). Paste it in.
      ⚠ `.claude/memory/DECISIONS.md` is permission-protected: an unattended watch's edit is
      refused. **Whoever takes this needs a session that can write it** — or the protection needs
      changing, which is a question for Wyatt, not a repair for a watch.
      ⚠ STALE-CANDIDATE — your answer landed — **"yes"** — ruled on the Glass 2026-09-02T12:39:56.363Z, no note attached — and nothing moved this row
- [ ] **AND THE OTHER HALF OF THAT MEASUREMENT, WHICH IS HIS QUESTION AND IS STILL OPEN: a call
      ⟨`T-013`⟩
  circle is often nearest the WRONG captain, and the two instruments disagree about how often.**
  Found by CEO 84, which pointed out the answer was already sitting unread in the probe's own data.
  Measured both ways on the same 21 poses: **15 wrong-boat before this watch's fix, 16 after** — so
  it is pre-existing and this change neither caused nor cured it. **DO NOT read that as a live
  15-in-21 defect.** `scripts/qa/w52_call_beside_boat.mjs`, which was built for exactly this
  question and does NOT move anyone, reports 11 of 12 circles nearest their own boat at an 11px
  gap. The difference is that `w54` teleports two captains to fixed squares and leaves the other
  two where they were, which can strand a third hull nearer than the named one. **Which instrument
  is telling the truth is the first thing to settle**, and it is a posed question, not a rate.
  Wyatt has asked for this twice (W5-2, and INBOX-20260901T1332Z: *"not on top of, or next to,
  someone else"*), so it is worth a watch. Second, smaller: `src/ui/stage.js`'s last-resort branch
  lets a circle land on a hull when that is the only way off the question, and never checks WHOSE.
- [ ] **A DOWNWIND BATTLE MAY END ON A HALF-SENTENCE — TWO LIVE EXPLANATIONS, OPPOSITE FIXES, AND IT
      ⟨`T-012`⟩
  IS A POSE NOT A RATE. Observed 2026-09-02 by eye AND independently by the vision judge; NOT
  MEASURED, and deliberately not called a defect.** `solo-tablet-wk-018-settled.png` shows
  *"Both fire 🪙 HEADS — but Davy Scones's firing"* and stops; `src/orchestrator.js:700` writes
  *"…firing downwind and the shot hits!"*, so six words are missing from the screen. **Either** the
  screenshot caught a progressive reveal a fraction early (the known Safari settle miss — 7 of 27
  desktop and 5 of 20 phone screens in this project's own record) **or** the wrapped second line is
  clipped by the card and every downwind battle in the game ends mid-phrase on every engine.
  **The settling move: pose the same downwind battle on a tablet in Chrome and in WebKit, wait past
  the reveal, photograph the card. Do not run a trial for this.**
  *Separate lead on the screen immediately BEFORE it, observed once:* the flip ceremony reads
  *"Crosswind — two heads and the cannonballs collide"* while the card that follows reads *"↓ DAVY
  SCONES FIRES DOWNWIND — WINS TIES"* — same day, same wind readout. Possibly a generic rule
  reminder; that is a source question, not a screenshot one.
  Account: [`.planning/JUDGED-2026-09-02T0219Z.md`](JUDGED-2026-09-02T0219Z.md).
- [ ] **THE CREW-PHONE GUEST — THE SEAT WYATT ACTUALLY PLAYTESTS — HAS NEVER BEEN A PHONE IN ANY
      ⟨`T-020`⟩
  TRIAL THIS PROJECT HAS RUN. Measured 2026-09-02T02:5xZ by the watch that judged the queue,
  deliberately not fixed by it (one item, and `playtest_gate.mjs` is being read by the trial at sea).
  Sizing: ONE LINE plus a gate.** `scripts/playtest_gate.mjs:358` defines the leg as
  `{ W:390, H:664, mobile:true, dsf:2, guestW:390, guestH:664 }` and its own comment says *"Both
  seats phone-sized, because a crew game between two phones is what he and a friend play."* Line 421
  opens the **host** with `mobile: !!def.mobile, dsf: def.dsf || 1`. **Line 429 opens the GUEST with
  neither** — only `W, H, dbgPort, httpPort, serveRoot, profileDir` — and `scripts/lib/cdp.mjs:34`
  defaults them to **`mobile = false, dsf = 1`**, with touch emulation gated behind `if (mobile)` at
  line 70. So that seat is a 390×664 **desktop** window at 1×, fine pointer, no touch. The size was
  set; the device was not.
  **PROVEN IN THE PICTURES, NOT ONLY IN THE SOURCE:** `crew-phone-host-012-settled.png` (780×1300)
  reads *"**Tap** and hold the sea to reveal the board"*; `crew-phone-guest-012-settled.png`
  (390×664), same leg, same run, reads *"**Click** and hold…"*. `src/ui/stage.js:547-551` derives
  that verb from `matchMedia("(pointer: coarse)")`, so it is the device, not host vs guest.
  **AND THE FIX FOR THE IDENTICAL FAULT IS ALREADY WRITTEN THREE LINES ABOVE THE BUG**, in
  `scripts/lib/cdp.mjs:65-69`: *"Measured: the phone leg's screenshot came back reading 'Click and
  hold the sea' where a real phone says 'Tap and hold' (D-40). A phone leg that does not emulate a
  phone tests the wrong game."* It was applied to the solo phone leg and never swept to the crew
  guest — rule 8's sweep, missed once, three weeks ago.
  **WHAT IT COSTS:** the leg's own comment says most of Wyatt's 35 findings came from crew-on-a-phone,
  and half of that leg's evidence — every guest-seat tap target, every touch-only path, every
  2×-device-pixel judgement — was taken on a device no player has. **It also ANSWERS an open row:**
  `docs/INTENDED-BEHAVIOUR.md:272` carries the Click/Tap guest-vs-host difference as *"Observed once,
  2026-08-30. Not measured"* — it is now measured, and it is the instrument.
  Account: [`.planning/JUDGED-2026-09-02T0219Z.md`](JUDGED-2026-09-02T0219Z.md).
- [ ] **THE TRIAL DECIDES "have I tested this build?" FROM A HAND-TYPED NUMBER, and nothing goes red when that number is wrong — its own item, filed 2026-09-01T19:30Z at CEO 76's finding 4, deliberately NOT fixed by the watch that found it.**
      ⟨`T-009`⟩
  `scripts/playtest_gate.mjs:572` keys the leg-resume cache on `PP4_STAMP` (`src/ui/stage.js:43`),
  a literal that moves only when somebody remembers to run `npm run bump`. **This is not a one-off:
  four game commits landed on `.6` and nothing anywhere went red**, and three of those landed
  DURING an 88-minute trial that then reported on code it had never sailed. Nothing protects `.7`
  either. The player-facing cost is exact: a release decision made on a report about a different
  build. **Rule 9's shape is a key derived from the tree** — e.g. `git rev-parse HEAD:src` folded
  into the cache key and the report's own stamp — which makes "did the trial sail the staged code?"
  mechanical instead of a duty somebody must remember. Sizing, honestly: one small change to the
  cache key plus a gate, not a rewrite. Whoever takes it, read `scripts/bump-build.mjs`'s header
  first — the stamp is deliberately its own counter, and the fix must not reintroduce a second
  file that can disagree with it.
- [ ] **★ AN ANSWERED QUESTION NEVER LEAVES `BLOCKED ON WYATT`, SO THE GLASS ASKS HIM FOREVER — and
      he has now reported this exact fault TWICE, about two different cards.** Filed
      2026-09-02T16:3xZ. **Sizing: small, and it is a lifecycle, not a feature.**
      ⟨`T-090`⟩
      **HIS WORDS:** *"why did my response in the glass not get completed? I already said 'Don't' to
      this question on the Glass once -- now it seems to be asking me again."*
      **MEASURED:** he answered on the page; a watch harvested it at **12:21:40** — its own commit
      says *"his answer was there, unread"* — and wrote it to the Chart as `T-089`. **The question
      row stayed in `BLOCKED ON WYATT` regardless**, so the card kept rendering it. Harvesting an
      answer creates a row; **nothing retires the question.**
      ⚠ **HE ALREADY REPORTED THIS ONCE, ABOUT THE OTHER CARD.** `INBOX-20260901T1310Z`: *"The
      Glass's Your Rulings -- In Hand are stale; there must be a process that triages them and adds
      them to the Tasks list, then removes them from the Your Rulings list."* **That lifecycle was
      built for `## RULED` and gated (`rulings_triage_check.mjs`). `BLOCKED ON WYATT` never got
      one** — so the same fault sat in the card beside it, ungated, until he hit it again.
      **THE FIX IS THE LIFECYCLE HE ALREADY SPECIFIED, APPLIED TO THE SECOND CARD:** when an answer
      is harvested, the question **moves** — out of `BLOCKED ON WYATT`, into the log with his verdict
      — in the same commit that records it. **One act, not two**, exactly as `close_item.mjs` ticks
      the row and writes the ledger together so they cannot disagree.
      **AND GATE IT, because the ungated twin is what allowed this:** extend
      `rulings_triage_check.mjs` (or a sibling) to fail when a `BLOCKED ON WYATT` row has a
      corresponding harvested ruling. Red-proof both ways.
      *(The stale row itself was removed by hand 2026-09-02T16:3xZ so the page stops asking him a
      third time. That is a repair, not the fix.)*
      🔁 **IT IS HAPPENING AGAIN RIGHT NOW — a THIRD instance, measured 2026-09-02T17:4xZ, and this
      one proves the hand-repair does not generalise.** He ruled **"Keep it."** on the black-window
      flash at 17:06Z. A session harvested it correctly and committed it (`778c6f92`, *"chart:
      harvest Glass ruling on the black-window flash check"*) — **and the question is still the ONLY
      data row in `BLOCKED ON WYATT`**, so Your Call is asking him a question he has already
      answered, for the third time in one day. **The harvest is not the fault; the harvest worked.
      The fault is that nothing retires the question in the same act.** Harvest-then-triage-later is
      the design, and the gap between the two steps is a page that lies to him — so the move must be
      atomic, which is what this row already says.
- [ ] **⚠ THE STAGING DEPLOY IS THE ONE STEP A WATCH CANNOT TAKE, AND THAT — NOT THE EVIDENCE — IS
      ⟨`T-027`⟩
      WHY PARTS 2 AND 3 OF RULING 12 ARE STILL OPEN. Measured 2026-09-02T04:0xZ by the watch that
      tried it. Sizing: one line of config, or one command from an attended session.**
      Everything ahead of the deploy passed on this watch: `npm test` green through its last
      `&&`-chained gate, `gear.mjs` FULL and already paid for by the 0137Z trial (ten legs on
      `2026.09.01.8`, empty NOT-RUN column, empty unjudged column since the 03:00Z watch).
      Then `./scripts/deploy-staging.sh "…"`, `bash scripts/deploy-staging.sh "…"` and
      `bash scripts/deploy-staging.sh` each returned **"This command requires approval."** Three
      forms, one answer; stopped there rather than hunting a fourth wording.
      **Cause, read rather than guessed:** `.claude/settings.json`'s allow list has
      `"Bash(node scripts/*)"` and nothing covering a `bash …/*.sh`, which is exactly why every
      `node scripts/…` command that watch ran went through. `scripts/deploy-staging.sh` is the only
      deploy entrypoint in the repo (`scripts/**/deploy*` → one file), and hand-rolling the rsync is
      rule 14 — the one that takes the live game down.
      **Why it matters beyond this item:** the relay's own liveness guards all test GIT.
      `can_push.mjs` checks four git faults and says "can publish"; the thing that actually stopped
      this watch was the permission layer. Same shape as the push refusal solved four hours ago —
      and every successful staging deploy this project has had was run by an ATTENDED session.
      **Staging is measurably stale as a result:** the wire says `2026.09.01.6-staging@60f969c4`,
      two builds behind the tree, so the preload pass, the about-recipes resize, the call circle
      moved off the question it asks, the storm glide and the guest's camera are all missing from
      the address he plays.
      **The fix is his, and the watch deliberately did not take it** — adding
      `"Bash(bash scripts/deploy-staging.sh*)"` to `.claude/settings.json` grants every future
      unattended watch the ability to publish to a public address, which is not a repair a watch
      gets to make to the one file that exists to be his. See BLOCKED ON WYATT.
      ⚠ STALE-CANDIDATE — measured on build 2026.09.01.8; the tree is 2026.09.02.1, so its evidence no longer describes this game
- [ ] **Judge the 267 screenshots the release trial queued** — his ruling, question UI 2026-09-02:
      ⟨`T-003`⟩
      *"Judge the screenshots first"*, chosen over staging-in-parallel and over production. Trial
      `SEA-TRIAL-2026-09-01T1914Z-Wy-Blade` sailed 10/10 legs on `2026.09.01.7` with NOTHING in the
      not-run column, but its own report says **"THE JUDGE CANNOT SEE — every visual verdict below
      is worthless; the structural half still stands."** The screens are queued, marked NOT cleared.
      His reasoning: the untappable sail square that cost days was caught by looking, not structure.
      ⚠ STALE-CANDIDATE — measured on build 2026.09.01.7; the tree is 2026.09.02.1, so its evidence no longer describes this game
- [ ] **THE LAST SCREEN OF THE GAME HIDES THE AWARD WINNERS' NAMES BEHIND THE "PLAY AGAIN!" BUTTON —
      ⟨`T-023`⟩
  found by the automatic judge 2026-09-02, then confirmed by eye and found to be WORSE than its
  description. Not fixed (one item; and any `src/` change retires the trial at sea).**
  `passplay-phone-039-settled.png`, End of Voyage, 390×664. The judge said *"Play again button
  floats over the bottom achievement card, covering its content instead of sitting below the scroll
  area."* Opening the picture shows the sharper version: the sticky button and its frosted backing
  cover the BOTTOM of both award cards, and on the left card the winner's name — **Davy Scones, in
  pink** — is sliced horizontally, with only the tops of the letters showing above the button's
  edge. The right card's *Peg Leg Meg* survives only because it sits a few pixels higher.
  **What a player sees:** the voyage ends, two awards are handed out, and you cannot read who won
  one of them. This is the screen a new player sees last and the one most likely to be screenshotted
  at launch. Rule 26: pose the End of Voyage at 390×664 before and after; do not go looking for a
  rate. Account: [`.planning/JUDGED-2026-09-02T0219Z.md`](JUDGED-2026-09-02T0219Z.md).

  **⚑ REPRODUCED ON THE CURRENT BUILD, IN A SECOND MODE — AND NOW SCOPED. Watch 2026-09-02T03:00Z,
  judging the 0137Z queue.** The automatic judge found it again on its own, unprompted, at
  `solo-phone-023-settled.png` — **solo**, not pass-and-play, on build `2026.09.01.8`, which is the
  stamp in the tree. Opened by eye and it is the identical fault down to the detail: *The
  Silver-Tongued Ledger*'s winner — **Davy Scones, in pink** — sliced horizontally with only the
  tops of the letters clearing the button's frosted backing, while *Crustbeard* on the right card
  survives by sitting a few pixels higher. **So it is not one screen in one mode; it is what the
  End of Voyage does on a phone.**
  **AND A THIRD SIGHTING IN THE SAME RUN, ON THE OTHER ENGINE:** `solo-phone-wk-028-settled.png`,
  **WebKit** — the judge's own unaided words: *"'Play again!' button overlaps and obscures the award
  cards below it, cutting off the 'Crustbeard' name and the left card's captain name mid-text."*
  **So within this one run: three phone legs, two modes, BOTH engines, all failing the same way —
  while the tablet and desktop legs are clean.** That is as well-characterised as a layout fault
  gets short of a posed pair, and it makes this the one player-facing defect in the release
  evidence rather than a suspicion.
  **AND THE SCOPE IS NARROWER THAN THE ROW ASSUMED, WHICH MAKES THE FIX EASIER RATHER THAN HARDER:
  it is PHONE-ONLY, and the tablet is a WORKING REFERENCE.** `solo-tablet-022-settled.png` — in the
  0137Z queue, written 02:03Z, so same run and same build — is the same screen on a tablet: four
  award cards in one row, **every winner's name fully legible** (Davy Scones, Crustbeard, Dough
  Hook, Flaky Jack), the whole stats table readable, and *Play again!* sitting clear BELOW the
  content. Nothing is covered. So the posed pair rule 26 asks for has a third picture already
  taken: **pose 390×664 before and after, and check it against the tablet, which is what the screen
  is supposed to look like.**
  > **⚠ CORRECTED IN THE OPEN, BY THE WATCH THAT GOT IT WRONG — and the correction is worth more
  > than the row.** This first cited `solo-tablet-031-settled.png`, calling it *"same run, same
  > build"*. **It is neither.** Its mtime is 2026-09-01T14:52Z — hours before even the 1914Z run —
  > and `grep` finds it **not in the 0137Z queue at all**. It was caught by reading the build stamp
  > printed in its own corner: `2026.09.01.7`, not `.8`.
  > **THE CAUSE IS THE STOPGAP ITSELF, AND IT IS THIS ROW'S TWIN.** `judge_the_queue.mjs --snapshot`
  > copies every PNG in `sea-trial-shots/` older than its cutoff; run with a far-future `--before`
  > it takes **820 files when only 315 are this run's**. The other ~505 are leftovers from earlier
  > runs that this trial never overwrote, sitting in the snapshot under ordinary-looking names with
  > nothing to mark them. **A session reading the snapshot by filename gets an older build's picture
  > and no warning** — which is exactly *"a queue judged after a later run describes a mixture of
  > runs, silently"*, reproduced inside the tool meant to prevent it. The JUDGED screens are safe
  > (the judge only reads `judge-queue.json`, and all 315 have mtimes inside the run's window);
  > it is BY-EYE reading of the folder that is unsafe. **Whoever does the derived-path fix should
  > make the snapshot take only what the queue names.**
      ⚠ STALE-CANDIDATE — measured on build 2026.09.01.8; the tree is 2026.09.02.1, so its evidence no longer describes this game
- [ ] **THE RELEASE TRIAL'S EVIDENCE WAS RETIRED BY THE FIX, and that is a real number about the
      ⟨`T-016`⟩
  launch date.** CEO 84: the 88-minute trial that was ruling 12's whole cargo tested build
  `2026.09.01.7`; the fix above bumped it to `.8`, so **staging now needs another ~90-minute
  trial.** `npm test` is GREEN again (another session cleared the vendored-file failure), so the
  gate that blocked staging is open — the only thing missing is a trial of the code that would
  actually ship.
      ⚠ STALE-CANDIDATE — measured on build 2026.09.01.7; the tree is 2026.09.02.1, so its evidence no longer describes this game
- [ ] **⚠ THE CLOSE GATE READS THE INBOX AS INSTRUCTIONS: A DOLLAR SIGN IN ONE OF HIS ITEMS WILL
      ⟨`T-097`⟩
      SHRED THE FILE, SILENTLY, WHILE PRINTING `CLOSED`.** Found 2026-09-02T18:3xZ by walking into it:
      `close_item.mjs:152` and `:158` call `String.replace` with the rewritten section as the
      REPLACEMENT string, and JavaScript reads dollar-sequences in a replacement string as commands.
      A paragraph that merely QUOTED the gate's own regex contained a dollar followed by a backtick —
      *"insert everything before the match"* — and the gate spliced the file's first 34 lines into the
      middle of an entry. **It exited 0 and printed `CLOSED INBOX-20260901T1335Z`.** Repaired by hand
      the same minute; the damage was 34 duplicated lines, not lost words, because the duplication
      happened to be an insertion.
      **PROVEN, NOT REASONED** — `"HEAD\nBODY\nTAIL".replace("BODY", payload)` with a dollar-backtick
      payload yields `"HEAD\nX HEAD\n Y\nTAIL"`; the same call with `() => payload` yields the literal.
      **THE FIX IS ONE CHARACTER CLASS: pass a replacer FUNCTION at both call sites.** After that no
      INBOX text can ever be read as an instruction.
      ⚠ **WHY THIS IS NOT A CURIOSITY: THE INBOX IS THE ONE FILE THAT HOLDS HIS WORDS VERBATIM.**
      A "$5 bug bounty", a price, a shell snippet, `$foo` in a bug report — any of those in an item of
      his corrupts the record at the exact moment that item is closed. **And the same line has a
      SECOND fault already recorded in `INBOX-20260901T1335Z`'s own entry:** the fate regex has no `s`
      flag, so a multi-line `status:` block is only half-replaced, leaving text under a line reading
      DONE. **Both live in `close_item.mjs:152-158`; fix them together.**
      **Sizing: small — two call sites, plus a red-first fixture whose status block is multi-line and
      whose prose contains a dollar sign.** ⚠ The file is VENDORED from claude-kit and its header says
      edit there; his 2026-09-02 ruling inverted that for `glass.mjs` but has not been extended here,
      so **the first decision is which tree it lands in, and `vendor_check.mjs` will have an opinion.**
- [ ] **THE DE-SHOUTING WRITES HIS OWN NAME IN LOWER CASE, ON HIS OWN PAGE. Found 2026-09-02T18:xxZ
      ⟨`T-088`⟩
      by photographing the real Glass at 390x844, not by a fixture — it is invisible to every
      hand-written test case in the gate. Sizing: SMALL, `glass.mjs` only, no game code.**
      **WHAT HE SEES**, in `.planning/posed/glass-after-T095.png`, on at least four numbered rows:
      *"the seat wyatt actually playtests"* (row 10), *"a character of wyatt's own text"* (row 20),
      *"git stages whole files"* row (25), and the section name itself as *"blocked on wyatt"*
      (row 2). **WHY:** `shortTask()` sentence-cases any run of two or more all-caps words, and
      watches write row titles in capitals for emphasis — so `WYATT` inside a shouting run is
      lowercased along with everything else. The rule has no notion of a proper noun.
      **The existing carve-outs are the shape to follow and they are already derived rather than
      listed** — a lone all-caps word is a name, a token carrying a digit is an identifier, a lone
      `I` is a fact about English. His own name is the same kind of fact. ⚠ **Do not "fix" it with a
      list of blessed words** (rule 9); and whatever lands must keep the six cases the gate already
      holds, including `CEO 110`, `T-088` and `FROM A HAND-TYPED NUMBER`.
      **Not fixed by the watch that found it: one item, and this is `T-088`'s subject, not `T-095`'s.**



### ⚑ FOR A WATCH — filed by the Advisor 2026-09-02, none of it this session's to build

- [ ] **A SESSION MUST READ THE RECORD BEFORE PUTTING A QUESTION TO HIM — I asked him something he
      had already answered, twenty minutes after he answered it.** Filed 2026-09-02T16:3xZ.
      **Sizing: this is a rule and a hook, not a feature.**
      ⟨`T-091`⟩
      **WHAT HAPPENED, with timestamps:** his answer was harvested at **12:21:40**. The Advisor put
      the same question to him through the question UI at roughly **12:22**, and closed the item on
      the second answer at **12:24:03**. **The answer was on disk before the question was asked.**
      He had to decide the same thing twice and then work out why.
      **THIS IS THE FAULT `DECISIONS.md` EXISTS TO PREVENT**, and the rulebook states it directly:
      *"answer from them, never re-ask a settled question. A ruling he made that nobody harvested is
      the failure this system exists to stop."* **The Advisor read neither the page nor
      `BLOCKED ON WYATT` before asking.**
      **THE MECHANICAL FIX, because a prose rule is what already failed here (Principle 2):** a
      `PreToolUse` hook on `AskUserQuestion` that greps the question's own subject against
      `.claude/memory/DECISIONS.md`, `## BLOCKED ON WYATT` and the live `glassState`, and **blocks
      with the existing answer** when it finds one. **It must fail OPEN on an unreadable source** —
      a hook that silently swallows a real question is worse than the double-ask it prevents.
      **THE CHEAPER HALF, worth doing even if the hook is not:** the Advisor's own routine gains one
      line — *before any question to him, read `BLOCKED ON WYATT` and the newest harvest.* It is
      thirty seconds and it would have caught this one.

- [ ] **★★ "WHAT IS BEING WORKED ON RIGHT NOW" — design approved by CEO with changes, all applied.
      His ask 1 of five. Spec: [`SPEC-WHAT-IS-IN-HAND.md`](SPEC-WHAT-IS-IN-HAND.md). Sizing: SMALL.**
      ⟨`T-094`⟩
      **HIS WORDS:** *"what is being worked on RIGHT NOW? that needs to be visible just underneath
      the emoji status."* Then: *"design a fix, get CEO's approval, then add it to the top of the
      chart."* **Verdict: APPROVED WITH CHANGES — and the changes were not cosmetic.**
      **BUILD IT THIS WAY — write the claim the way the CLOSE is already written.** `close_item.mjs`
      appends a fixed machine-written line on close; the claim half is human prose. Make them
      symmetrical: `publish_status.mjs` gains an **`## In hand`** block in
      `.planning/wyclau/status/<machine>.md`, the same shape as the `## Long run in flight` block it
      already writes — and `glass.mjs` already reads that file (`:614`). One more `split`.
      **WHY NOT THE OBVIOUS VERSION (parse the ledger):** `.planning/CTO-LEDGER.md` has **15**
      `### WATCH` headings and **exactly 4** match a parseable shape — the tidy ones are all from the
      last two hours, and nothing prescribes the format. **A regex over that finds nothing this
      morning and goes silent the first time a watch words its heading its own way.**
      **FOUR STATES, and the fourth is the point:** in hand · nothing in hand · **⚠ claimed but
      COLD** · unreadable. **A watch can claim and end without closing — that happened twice today,
      deliberately** — so an open claim outliving its watch is normal, and must never read as
      "being worked on right now". COLD is derived from a `staleAfterMinutes` the block declares
      itself, exactly as the long-run block already does. **No new constant.**
      **THE BOUND, HONESTLY:** a stale claim is NOT self-clearing within a Bell interval. Rings were
      **40, 60, 50 and 30 minutes** apart today, and a watch can end having pushed nothing. **Up to
      about an hour, unbounded when the Bell is not ringing** — which is why COLD is required.
      ✅ **AND HIS ASK 2 IS ALREADY FIXED, BY ANOTHER ROUTE — do not build it here.** The browser
      clock the first draft proposed **already exists** (`glass.mjs:900-930`, two clocks, since
      2026-08-31). The clock was never the fault; a published page cannot see a commit made after it
      was generated. **The Door's new step 6b closes it** — the watch now messages the Glass to
      publish the moment it lands work.

- [ ] **★★★ ONE PROCESS EDITS THE CHART — HIS RULING, AND HE PUT IT ABOVE THE LAUNCH.** 2026-09-02.
      ⟨`T-093`⟩
      **HIS WORDS:** *"I want you to prioritize chartkeeper.mjs, we can't launch ANYTHING until the
      chart is actually functioning -- this is nonsense, what's happening right now."*
      **THIS OVERRIDES HIS EARLIER PRIORITY RULING** (*"the game wins any contested hour until it
      launches"*, same day). He has looked at the result and reversed it: **the Chart is the
      instrument he steers by, and a broken instrument makes every other priority unreliable.**

      **WHAT IS ACTUALLY WRONG, measured today rather than asserted:**
      - **Three sessions write `CHART.md`** — the Advisor, the Glass-update session, every watch —
        and **git's smallest unit is the FILE.** So `close_item.mjs` staging the Chart for its own
        sweep carries another session's uncommitted lines into its commit. **Five times in one
        session.** `git add <path>` is no safer than `git add -A`; path precision cannot help.
      - **The cost is a corrupted record, not lost work.** Commit `59f8b7a7` — *"watch closes his
        black window"* — carries `T-090`, `T-091` and a card repair written by a different session.
        `git log -S` for *"why does T-091 exist?"* answers with the wrong subject. **CEO 104 and 105
        both flagged one-commit-two-jobs; this is the third instance.**
      - **And rows go stale faster than anyone closes them** — the reaper has flagged **10** all
        afternoon, unchanged, because one watch closes one item every 30–60 minutes.

      **THE FIX HE CHOSE, and it is rule 23's own answer:** *what makes these two agree?* — **nothing
      does, so make there be one.** Every writer goes through `chartkeeper.mjs`: it reads, edits and
      commits the Chart, and no session hand-edits `CHART.md` again.

      **WHAT THAT MEANS CONCRETELY, in the order it should be built:**
      1. **A write API on `chartkeeper.mjs`** — add a row, close a row, mark GATED, retire a blocked
         question — each one *read → modify → commit* in a single act, so no window exists for
         another session to carry the edit. `close_item.mjs` already does exactly this for closing;
         **it is the worked example and the pattern to copy, not to reinvent.**
      2. **The Advisor, the Glass session and the Door all call it** instead of editing the file.
      3. **A gate that fails when `CHART.md` changes in a commit that did not go through it** —
         derivable from the commit's own touched-files, and the only thing that stops hand-editing
         creeping back. Without it this is a convention, and Principle 2 says conventions fail here.

      ⚠ **THE ONE THING TO GET RIGHT, because it is where this design can go wrong:** a single writer
      must not become a single point of failure. **If `chartkeeper.mjs` refuses or crashes, a session
      must still be able to record his words** — the Inbox is not the Chart and must stay
      hand-writable, so a harvest is never blocked by a tool being broken. **Losing his words is
      worse than a messy Chart.**

      **SIZING, HONESTLY: MEDIUM, and larger than anything else currently open on this list.** The
      API is small; the migration is every caller; the gate is the part that makes it stick.

- [ ] **★★★ ONE QUEUE, RANKED — HIS DESIGN, AND IT REPLACES THE DOOR'S OWN ORDERING RULE.**
      ⟨`T-083`⟩
      2026-09-02, question UI. **Do these four in order; the first is a hard dependency.**
      **His words:** *"the door should not read oldest-first; the RANK algorithm should do the
      ordering, and the door should read what's at the top. the rank algorithm should prioritize my
      requests over bugs that the Watch generated; and i need a way to say DO THIS NOW such that
      RANK puts it at the top -- eg a checkbox underneath the ideas list that says 'Add to top of
      list'"*
      **WHY IT MATTERS MORE THAN IT LOOKS: there are TWO orderings today and rule 23 says that is the
      defect.** The Door has its own rule (`SKILL.md:81` — INBOX oldest-first, then the Chart) and
      RANK has another. *What makes these two agree?* **Nothing.** His design deletes one of them.
      **AND THE MEASURED COST OF OLDEST-FIRST:** 8 open Inbox items, the oldest from the previous
      day, so **anything he writes now is automatically his lowest-priority item.** That inversion —
      not anyone's discipline — is what forced him to interrupt and repeat himself five times on
      2026-09-02.
      **1 · CONVERGE THE TWO DERIVATIONS FIRST — nothing else works until this lands.** Patch 4's own
      caveat: RANK reorders *within the open-row slots the file already has* and **cannot reorder
      across the two sections the Glass concatenates** (checklist rows, then unfated inbox entries).
      *"The Door reads what is at the top"* is meaningless until there is ONE list to be at the top
      of. This is `PENDING-KIT-PATCHES.md` patch 5 — `glass.mjs` imports
      `scripts/wyclau/lib/chart_model.mjs` and the duplicated fate/concat block is deleted.
      **Unblocked as of the `vendor_check` inversion.** Its gate
      (`chart_model_agrees_with_glass_check.mjs`) becomes a tautology once one function cannot
      disagree with itself and should be **RETIRED, not kept** — patch 5 says so itself.
      **2 · RANK GAINS A SOURCE SIGNAL.** *"prioritize my requests over bugs that the Watch
      generated."* **Derive it, never add a field:** his items carry his words (an Inbox entry with a
      `>` quote block, or a Chart row quoting him); watch-filed rows carry a watch stamp. Rule 9.
      **3 · THE DOOR DROPS ITS OWN RULE.** `SKILL.md:81`'s *"INBOX first — the oldest OPEN item"*
      becomes *"work whatever RANK put first."* **Delete the old rule rather than adding beside it**
      — leaving both is the two-orderings fault re-created.
      **4 · THE "ADD TO TOP" CHECKBOX**, under the Ideas box on the Glass, and the harvest carries
      the flag through so RANK sees it. **This is the half that removes HIM from the mechanism:**
      every interrupt on 2026-09-02 required him to notice, interrupt and repeat himself.
      ⚠ **ONE SLOT, NOT A QUEUE.** Ticking it on a second item must displace the first, deliberately.
      **A gate fails the build on two.** An interrupt with a queue is just another backlog, which is
      the fault this whole design removes.
      ⚠ **AND IT MUST BE VISIBLE ON THE PAGE** — he must see what he pinned and whether it has been
      taken. *An interrupt he cannot see is indistinguishable from one that was ignored*, which is
      exactly what happened all night.

- [ ] **⚠ THE WRITE PASS SILENTLY REWROTE A CHARACTER OF WYATT'S OWN TEXT.** Found 2026-09-02T15:xxZ
      ⟨`T-008`⟩
      by an independent read-only verification of the sweep, which was looking for lost rows and
      found this instead. In the sweep commit `a70451f2`, the row two lines above this one had its
      curly apostrophe **U+2019 turned into ASCII `'`** — *"the Glass’s Ideas box"* became *"the
      Glass's Ideas box"* — while the row was being re-emitted with its `T-008` handle.
      **WHY THIS IS NOT PEDANTRY.** CEO 91's rule is that a row's FIRST LINE IS HIS and the tool
      never touches a character of it; there is a gate case asserting exactly that ("every row's
      first line survived the write byte for byte") and it is GREEN, so it is not asserting what it
      claims — the likeliest reading is that the fixtures contain no non-ASCII punctuation, which is
      the `\Z`-in-the-fixture lesson from this same file family, again. This project has already
      paid for one character of punctuation once: *"Attack's − is U+2212, not ASCII."*
      **AND THE SHAPE IS WORSE THAN THE INSTANCE.** A write pass that normalises a character today
      normalises a word tomorrow, in the one document that carries his words verbatim, with a green
      gate over it. Nothing here is urgent — the row is open, the meaning is unchanged — but the
      SILENCE is the defect.
      Start by making that gate's fixture carry curly quotes, an em dash and an accented character,
      and watch it fail. Do not "fix" the apostrophe by hand first: the failing gate is the evidence.

- [ ] **A GLASS TICK CAN STILL WALK PAST STEP 3, AND ONE DID — TWO MINUTES AFTER THE FIX SHIPPED.**
      ⟨`T-074`⟩
      CEO 100 dated it to the minute and this watch confirmed it: `.planning/wyclau/LAST-HARVEST`
      reads `2026-09-02T10:35:50Z` (written only by step 4) and `GATE-LOG`'s newest line is still
      `10:29:01Z` (the watch's own bench test). **The tick ran step 4 and left no verdict at step 3.**
      ⚠ **THE ABSENCE OF THAT LINE IS THE NEW MECHANISM WORKING, NOT FAILING** — before 10:33Z there
      was no way on earth to tell a skipped gate from an unwired one, and the very first use of the
      log caught a skip. Do not read this row as "the fix did not work."
      **WHAT IS ACTUALLY MISSING: a gate the tick cannot walk past.** Step 3 is an instruction in a
      runbook, and `glass_gate_verdict_logged_check.mjs` case 8 can only check that the runbook SAYS
      the right thing — it cannot see whether the session typed the command. Fix shape: make the
      later steps refuse. A `mark_glass_published.mjs` that declines to stamp when `GATE-LOG` has no
      line newer than `LAST-HARVEST` would close it mechanically — **but that file is VENDORED**
      (`.claude/wyclau/MANIFEST.sha256`), so this needs a session that can reach claude-kit, or a
      non-vendored pre-step. **Not a firmer sentence. Sentences are what failed.**

- [ ] **A SECOND TRIAL CAN BE STACKED ON A LIVE ONE — the guard erases itself about a minute in. Filed 2026-09-01T19:30Z, measured, not fixed (one item).**
      ⟨`T-014`⟩
  `scripts/wyclau/start_trial_detached.mjs:56` refuses a duplicate only `if (prev && prev.pid)`,
  reading `.planning/wyclau/LONG-RUN`. But the trial's own progress writer,
  `scripts/wyclau/longrun_status.mjs:108-119`, rewrites that marker as a fixed five-field object —
  it deliberately preserves `startedAt` and **drops `pid`, `runId`, `reportPath` and `logPath`**,
  every field `start_trial_detached.mjs` calls the birth certificate. Measured live at 19:15:19Z,
  62 seconds after launch: the marker held `what/startedAt/updatedAt/progress/staleAfterMinutes`
  and no pid. So from a minute in, the only mechanical protection against two 88-minute trials
  fighting over `sea-trial-shots/` is gone, and a later watch also cannot learn from the marker
  which report the live run is writing. Both files are VENDORED — fix in claude-kit, then re-vendor.

- [ ] **A TRIAL'S SCREENSHOTS ARE DESTROYED BY THE NEXT TRIAL, AND THE QUEUE THAT NAMES THEM DOES
      ⟨`T-015`⟩
  NOT NOTICE — measured 2026-09-02, not fixed (one item).** Every leg writes to the SAME filenames
  in `sea-trial-shots/`, and `scripts/playtest_gate.mjs:673-682` writes `judge-queue.json` last,
  once, to the same path. Nothing stamps a picture with the run that took it. **So a queue judged
  after a later run describes a mixture of runs, silently** — and a session reading it cannot tell.
  The rate, measured on the 1914Z run's own queue while a later trial sailed: **107 of its 343
  screens overwritten by 02:20Z, 252 by 02:35Z — 145 lost in fifteen minutes.** The player-facing
  cost is the same as the not-run column's: a release decision made on visual evidence that quietly
  describes a build nobody shipped. **Sizing: small.** Rule 9's shape is a path derived from the run
  — `sea-trial-shots/<runId>/` — so the queue and its pictures cannot come apart, rather than a
  session remembering to snapshot. `scripts/qa/judge_the_queue.mjs --snapshot=` is this watch's
  stopgap and is NOT the fix; it protects one run, by hand, after the fact.

- [ ] **`can_push.mjs` SAYS "CAN PUBLISH" TO A WATCH WHOSE `git push` IS THEN REFUSED — twice now on
      ⟨`T-011`⟩
  this branch, and it is the one fault the relay cannot survive. Measured 2026-09-02T03:xxZ, not
  fixed (one item). Sizing: small.** The Door's own words are *"a watch that pushes nothing is
  invisible, and an invisible watch is indistinguishable from a dead one."* `can_push.mjs` is the
  guard against exactly that, and it checks **four** faults — detached HEAD, no upstream, rebase in
  progress, merge in progress (`scripts/wyclau/can_push.mjs:21`). **A sandbox or permission layer
  that refuses `git push` outright is not among them**, so the script prints `can publish` and the
  watch works a full turn into a void.
  **It has now happened twice, to two different watches, both on `claude/cloud-handoff-planning-a9ay1u`:**
  the 01:52Z watch (commit `33e94b89` local-only; rescued by the 02:19Z watch, which flagged it as
  *"worth a row if it happens a third time"*) and this 03:00Z watch (two commits held locally).
  **Both watches did everything right and neither could tell in advance.**
  **Why it is worse than an ordinary failure:** the previous occurrence was only caught because a
  LATER watch on the same machine happened to be able to push and noticed the stranded commit. That
  is luck, not a mechanism. If both watches in a row are refused, the work is simply gone from every
  other machine's view while the ledger says it happened.
  **Fix shape, and it must not be a fifth hand-typed case:** the honest check is to ask git whether
  a push would succeed rather than to enumerate reasons it might not — `git push --dry-run` against
  the upstream — and report the refusal in the script's own words. Rule 9: derive the answer,
  never keep a list.
  > **⚠ SHARPENED AT THE END OF THE SAME WATCH, AND THE REAL CAUSE IS MUCH NARROWER — AND FIXABLE
  > TODAY.** The push was **not** refused by anything about pushing. It was refused by the **command
  > FORM**. Measured, in this order, on one machine in one session:
  > `git push` → refused · `git push origin HEAD` → refused · `git push origin <branch-name>` →
  > **SUCCEEDED**, `916067cc..89bf93d4`.
  > So the permission allowlist evidently matches `git push origin <branch>` and not the bare or
  > `HEAD` forms. **That means two watches lost their work to a habit of typing `git push`, not to a
  > sandbox that forbids publishing** — and the 01:52Z watch's commit sat stranded for half an hour
  > for the same reason.
  > **Two cheap fixes, and they are independent:** (a) `can_push.mjs` should run `git push --dry-run`
  > and would have caught this instantly; (b) the Door and the watch runbook should say **push with
  > the explicit branch name**, because that is the form that works. (b) costs one line and removes
  > the failure entirely.

- [ ] **`CHART.md` IS A HOT FILE THREE SESSIONS WRITE, AND GIT STAGES WHOLE FILES — so an
      uncommitted edit is always carried by whoever commits next, into THEIR commit message.**
      Filed 2026-09-02T16:4xZ after it happened five times in one session. **Sizing: the mitigation
      is a habit and one line of the Door; the structural answer is bigger and is his call.**
      ⟨`T-092`⟩
      **THE MECHANISM, MEASURED RATHER THAN GUESSED — and the first guess was wrong.** It is NOT
      `git add -A`: neither the Door nor `close_item.mjs` prescribes it, checked. What actually
      happens is plainer and unavoidable in git: **`close_item.mjs` legitimately stages `CHART.md`
      for its own sweep, and staging a file takes the WHOLE file** — including another session's
      uncommitted lines in it. **`git add .planning/CHART.md` is no safer than `git add -A`. Path
      precision does not help, because the unit git stages is the file.**
      **WHAT IT COSTS, and it is not lost work — it is a corrupted record.** On 2026-09-02 at
      12:38:33, commit `59f8b7a7` — *"watch 16:09Z closes his black window"* — carried `T-090`,
      `T-091` and a `BLOCKED ON WYATT` repair written by a different session. The rows work. **But
      the reasoning for them now lives under a commit about a console window**, so `git log -S` for
      *"why does T-091 exist?"* answers with the wrong subject. **CEO 104 and CEO 105 both flagged
      "one commit doing two jobs" as a fault; this is the third instance and the first where it was
      done TO a session rather than BY one.**
      **THE WINDOW IS AS WIDE AS WHATEVER YOU DO BETWEEN EDITING AND COMMITTING**, and the worst
      offender is the obvious one: **running `npm test` first makes the window minutes wide.**
      **THE HABIT, which is cheap and works today: COMMIT FIRST, TEST AFTER** — the reverse of what
      feels careful. If the suite then fails, fix it in a second commit; a red commit that is
      honestly described beats a correct commit filed under someone else's subject. *(The Door's
      step 6 currently says "Commit (`git pull --rebase` first), push" at the END of a sequence that
      includes running the suite. One reordered sentence.)*
      ⚠ **AND THE STRUCTURAL QUESTION, WHICH IS HIS AND IS NOT SMALL:** this is the cost of one plan
      file that every session writes. Principle 1 says one of everything, and that is right — but
      **`CHART.md` is now edited by the Advisor, the Glass-update session and every watch, and git
      has no smaller unit than the file.** The options are (a) live with it and keep the window
      shut, (b) split the Chart so different writers touch different files, which trades this
      collision for a drift problem the project has already paid for, or (c) have every writer go
      through `chartkeeper.mjs` so there is one process editing it rather than three. **(c) is the
      one that fits rule 23's question — *what makes these two agree?* — and it is the largest.**

- [ ] **Committed is not delivered: a note in git is not a note on the page** — a watch committed
      ⟨`T-024`⟩
      real content into `GLASS-NOTE.md` (`4cf59101`) and it never reached Wyatt, because the
      session that commits a note and the session that next publishes are not the same one. Same
      class as the publish-stamp fault. Routed here by the publisher, which explicitly did not
      propose a mechanism itself.

- [ ] Day 2 — Glass v3: the interactive rebuild (tap-to-rule cards, ideas box, daily lesson,
      ⟨`T-025`⟩
  Captain's log) on the thin-surface architecture (design, section IV)

- [ ] **HIS FOUR GLASS-PAGE ASKS — THREE OF THE FOUR NOW SHIPPED. What is left is the two that need new UI: expandable rows and a per-item comment box. FIVE HOURS OLD WHEN FILED, ASKED FOUR TIMES, NEVER A
      ⟨`T-076`⟩
      ✅ **SHIPPED 2026-09-02, in this order:** the Chart re-prioritises itself (RANK runs in every
      watch via the Door, and the two derivations were converged so it ranks the list he actually
      sees) · The Lesson moved BELOW the Chart · the card renamed to *The Chart (Tasks To Do)* ·
      next-to-be-completed first, re-ordered on every tick.
      ⏳ **STILL OPEN, and they are the two that need new interface rather than new ordering:**
      **expandable rows** for fuller context, and **a comment box under each item**. Both are
      `glass.mjs`, both are now editable in-repo, and neither is blocked.
      ⛔ **NOT part of this row:** *remove items once complete* — SWEEP exists but is still the
      seven-day-with-a-stub form he OVERRULED, and it cannot ship until the done count is
      re-sourced from `CHART-LOG.md`. That is kit patch 6, filed separately.
      ROW UNTIL NOW. THIS IS THE NEXT ITEM, AHEAD OF EVERYTHING.** Wyatt, 2026-09-02T07:xxZ:
      *"why have NONE of my changes to the glass been made??????????? i asked for them FOUR HOURS
      AGO."*
      **He is right, and the reason is measurable rather than mysterious:** all four asks live in
      `## THE IDEA INBOX` (this file, ~line 1320) tagged **SCHEDULED**. `glass.mjs:385` counts an
      inbox entry as an open task **only when it has NO fate** — and `SCHEDULED` is a fate. **So
      marking them "SCHEDULED" made them invisible on his own page AND invisible to a Watch picking
      its one item, simultaneously.** They have never had a `- [ ]` row or a `T-` handle. A watch
      noticed two of them and wrote *"STILL NOT BUILT AND NOT FILED ANYWHERE ELSE"* (line ~225) and
      still did not file them.
      **THIS IS THE AUDIT'S OWN HEADLINE, PLAYING OUT AGAINST THE AUDIT ITSELF:** *"a row that says
      SCHEDULED with no owner and no position in a queue is a parked row wearing a better word."*
      **THE FOUR, in his words, oldest first:**
      1. **00:59:32Z** — *"You need to update Tasks list dynamically — it is stale."* (the
         Chartkeeper; REAP is live, RANK is not — see `PENDING-KIT-PATCHES.md` 4)
      2. **00:59:32Z, repeated 03:45:45Z** — *"Move The Lesson section below it."* / *"Move The
         Lesson to below Tasks."* **Asked twice. One CSS/DOM move in `glass.mjs`.**
      3. **03:46:13Z** — *"rename Tasks to The Chart (Tasks To Do)."* **One string.**
      4. **03:49:02Z** — *"Make all tasks in The Chart expandable for fuller context. Let me write a
         comment under each one if I choose to. Order the list with the next-to-be-completed at the
         top. re-order the list dynamically. Remove items from the list after they are complete."*
      **SIZING, HONESTLY: items 2 and 3 are minutes and are pure `glass.mjs`.** Item 4's expandable
      rows and comment box are a bigger piece of the same file. **`glass.mjs` IS VENDORED — edit in
      claude-kit, then re-vendor**, which is the friction that has been quietly deferring all of
      this. **Do items 2 and 3 first and publish, so he sees movement on the page within one tick.**
      ⚠ **AND THE ADVISOR'S OWN RECOMMENDATION WAS TO SHIP THIS HALF FIRST** —
      `SPEC-CHARTKEEPER.md`: *"a perfectly-ranked list still reads as gibberish on his phone if
      every row is 90 truncated characters."* **That recommendation was made and then not carried
      into a row anybody could take.** The backend half has had seven watches; the half he can see
      has had none.

- [ ] **Repair the two disarmed Advisor gates** (CEO 83, all four findings verified in the code).
      ⟨`T-002`⟩
      `claim-before-game-code.cjs` appends the ledger path **inside its own deny branch**, so it
      fires once then waves every later edit through — and forges evidence
      `advisor-triages-watch-works.cjs` reads. That one is also blind to **untracked** files
      (`:83` excludes `??`), which is half the collision its own header cites. And `isGameCode()`
      is false for `scripts/qa/*`, `.claude/hooks/*` and `.planning/*`, so it would not have fired
      once during the night that earned it. **Both are unregistered from settings.json as of
      2026-09-02 on his ruling** — they give no false assurance while they wait. `file-his-words.cjs`
      works and stays armed.

- [ ] The 48-hour shakedown (DECISIONS ruling 14; supersedes the 24h exit test): cargo is the
      ⟨`T-022`⟩
  release — detached trial → staging → Wyatt plays → merge on his say-so; then the rulebook cutover

- [ ] **THE AUTOMATIC VISION JUDGE CLEARED A SCREEN WITH PLAINLY CLIPPED TEXT ON IT — filed
      ⟨`T-019`⟩
  2026-09-02 so nobody reads "218 PASS in 221" as "the screens are clean".**
  `crew-desktop-guest-012-settled.png` is the screen a watch read by eye and found the trade-offer
  circle whose *"Flaky Jack"* label hangs out of both sides of its own disc (the row above). The
  automatic pass reached the same file and wrote `"verdict":"PASS", "issues":[], "confidence":0.85`.
  A second reader opened the picture and confirmed the clipping independently. **The judge is not
  useless** — it found `passplay-phone-039-settled.png` on its own — **but its clean count is a
  FLOOR, not a ceiling**, and any release decision quoting it must say so. Same shape as the green
  suite that blessed the build Wyatt then found seven bugs in. **Not an action item on its own**;
  it is the caveat that belongs beside every judged-screen number from here on.
  **HOW STRONG THE CAVEAT IS, MEASURED RATHER THAN ASSERTED (CEO 86's finding 2):** the false PASS
  was found because a human had already flagged that screen, not by sampling. Four further PASS
  screens were then opened blind, one per leg family, and **all four held**. So: of five PASS
  screens a human has examined, one was wrong — and four screens cannot bound an error rate across
  218. It says the judge is not wrong constantly; it does not say the pile is clean.

- [ ] The Blade hour (Wyatt + a session, ~30–60 min): register the Bell, the ring test both
      ⟨`T-021`⟩
  directions, the O2 publish test — runbook `scripts/wyclau/RAZER-SETUP.md`
  **PARTIALLY DERIVABLE, measured 2026-09-02T03:5xZ: `schtasks /Query /TN "wyclau-bell" /V` on
  this machine shows the task registered and Enabled (Status: Ready, last ran 23:48, next 23:58)
  — the Bell-registration third is done. The ring-test and O2-publish thirds are not checkable
  this way; still needs Wyatt or a session that can run them.**

- [ ] **THE GATE'S VERDICT IS MACHINE-LOCAL AND WYATT CANNOT SEE IT** — CEO 100's finding 5, and the
      ⟨`T-075`⟩
      untracked half of `T-018`. `.planning/wyclau/GATE-LOG` is one small file on one laptop,
      surfaced nowhere on his page. **The gitignore is correct and is not the thing to change** —
      a tracked log line committed beside the note reset would make that commit touch two files, so
      `newestWorkCommit()` would read it as work landing and republish an unchanged page: the echo
      tick removed the same day. `publish_status.mjs` is the mechanism that already carries exactly
      these machine-local instruments into the tracked `status/<host>.md`, and **it is vendored** —
      so this is a kit patch, alongside the others in `PENDING-KIT-PATCHES.md`.

- [ ] **The Glass's own note contradicts its Your Call card, and he caught it in a
      ⟨`T-077`⟩
      screenshot.** Filed 2026-09-02T07:xxZ. **Sizing: one sentence of wording.**
      His screenshot: the note reads *"reap flags 6 rows as likely already answered, first: the
      Chartkeeper's Blocked-on-Wyatt question"* directly above **YOUR CALL (0) — "Nothing waiting."**
      **BOTH ARE CORRECT AND THEY READ AS A LIE.** Measured: `## BLOCKED ON WYATT` contains **zero
      table rows** (`grep -c '^|'` → 0), and `glass.mjs:311-321` builds Your Call only from table
      rows — so **(0) is literally true.** The note is the REAPER reporting Chart rows that *mention*
      an already-answered blocked question. Two different subjects, one page, no way for him to tell.
      **THE FIX IS THE NOTE'S WORDING, NOT YOUR CALL'S LOGIC** — the reaper's line must say it is
      talking about **stale rows to clean up**, never about a question waiting on him. Rule 8: a
      word that means "waiting on Wyatt" must mean that everywhere on this page.


- [ ] **THE PROJECT OWNS ITS DOOR — his ruling, and it is what finally lets the Chartkeeper
      ⟨`T-079`⟩
      RANK run.** 2026-09-02, question UI. **Depends on `T-078`. Sizing: one line of the Door plus a
      gate case.**
      `.claude/skills/door/SKILL.md` is vendored, and `PENDING-KIT-PATCHES.md` patch 4 records the
      cost in one sentence: *"The Watch never runs the Chartkeeper, because the Door is vendored."*
      **He asked for the Chart to re-prioritise itself four times; REAP shipped because its home is
      not vendored, RANK did not because its home is.**
      **The insertion is already written and measured** — patch 4 carries the exact text for the
      watch's step 6, plus its own caveat that RANK reorders only within existing open-row slots and
      cannot reorder across the two sections the Glass concatenates.
      **Add the wiring case to `scripts/qa/chartkeeper_check.mjs`** — assert the Door's watch section
      names `chartkeeper.mjs` — red-proofed by deleting the line. Patch 4's own words: *"A capability
      nothing checks is a capability that quietly stops running."*

- [ ] **THREE FATE STATES — `SCHEDULED` MUST STOP HIDING HIS IDEAS. His ruling, question UI,
      ⟨`T-080`⟩
      2026-09-02.** Depends on `T-078`. **Sizing: small, pure `glass.mjs`.**
      **Measured with the page's own logic before it was put to him: 15 ideas, 2 shown, 13 HIDDEN —
      9 of them by the single word `SCHEDULED`**, which `glass.mjs:375` treats as identical to
      SHIPPED and CLOSED.
      **And it contradicts the approved Charter in writing.** `CHARTER.md`: *"Every idea gets a
      **visible** fate (shipped / scheduled / parked-with-reason) within a day."* Scheduled and
      parked are named as VISIBLE fates. **This is a defect against a written spec, not a taste
      call.**
      **The shape he chose:** OPEN shows · **SCHEDULED shows and says so** · **PARKED shows dimmed,
      with its reason** · only genuinely-finished words hide (SHIPPED · DONE · FIXED · CLOSED ·
      HARVESTED · ROOT-CAUSED). Expected result: **11 shown, 4 hidden.**
      **Derive the three buckets from one list each and gate that no word appears in two** —
      red-proof by planting `SCHEDULED` in the finished list.

- [ ] **TWO DIFFERENT ROWS ON THIS CHART BOTH CARRY `T-079`, AND THE HANDLE IS NOW LOAD-BEARING.**
      ⟨`T-079`⟩
      Found 2026-09-02T12:5xZ by the watch that closed `T-079`, while trying to close it: the close
      gate could not find the row by handle because there are two. `CHART.md:990` (the npm-test row,
      just closed) and `CHART.md:1166` (**THE PROJECT OWNS ITS DOOR**) share it.
      **WHY IT MATTERS MORE TODAY THAN IT DID YESTERDAY.** As of `ed827799` a handle is no longer a
      label — it is the LINK that decides whether a row is hidden from him. A question of his that
      names `T-079` would sink **both** rows, and a settled ruling naming it would flag both stale.
      This is block 12's own fault class (`new Map(pairs)` keeps the last value for a repeated key)
      arriving one floor up, in his record instead of in the code.
      **THE GATE THAT WOULD CATCH IT EXISTS AND IS POINTED AT A FIXTURE.** `chartkeeper_check.mjs`
      case 7 asserts "every allocated id is distinct" — on `MIXED`, never on the real Chart. **A
      gate aimed at the wrong tree is not silent, it is reassuring** (`HARD-WON-LESSONS.md` §3).
      **DO NOT RENUMBER THE OLDER ROW.** A handle is allocated once and never reused — a CEO
      verdict, a ledger entry and this row all point at `T-079` meaning the npm-test row. Give the
      NEWER row (the Door row, filed by hand in `5e75bcf3` alongside `T-078`/`T-080`/`T-081`) a free
      handle, then add the real-Chart case. **Sizing: minutes for the renumber, one case for the
      gate. Red-proof by leaving the duplicate in place and watching the new case fail.**

- [ ] **`unattachedMentions` STILL WORD-SEARCHES FOR THE HEADING — CEO 104's one residual, and it is
      ⟨`T-086`⟩
      advisory only.** `chartkeeper.mjs`, in `derive()`: the list of rows that need a link is found
      by `/BLOCKED ON WYATT/i.test(row.raw)`, the very grep `ed827799` removed from the SCORE. So a
      row that says *"waiting on his call"* in different words is never listed as needing a handle.
      **It cannot sink anything any more** — that is why it is a blind spot in a helper report
      rather than a live defect, and why it was not fixed in the same pass. **Sizing: small.** The
      honest version derives the candidate set from something structural (a row with no handle at
      all cannot be linked, and that IS derivable) rather than from a phrase.

- [ ] **WHAT IS LEFT OF THE CHARTKEEPER AFTER SWEEP SHIPPED — the remainder of `T-001`, split out
      ⟨`T-001`⟩
      so his top row can close on what it actually promised.** All four passes now exist and all
      four RUN (RANK from the Door, SWEEP from `close_item.mjs`). These are the follow-ons, not the
      Chartkeeper:
      **1. RANKING SIGNAL A IS HALF DONE.** A row citing a REAL BUT UNRELATED live Inbox entry is
      still credited — CEO 94 wrote a fictional *"repaint the bilge pump widget"* row, pasted a live
      stamp into it and it ranked #1. Its fix (require the cited entry to name the row's `T-nnn`)
      would today zero every row, because there are no backrefs at all. **A design choice about his
      record, not a patch.**
      **2. HIS 03:49Z GLASS ASKS ARE STILL NOT BUILT** — expandable rows, and a comment box under
      each item. Both need `glass.mjs`, which is no longer vendored-locked, so they are ordinary
      work for the first watch that takes them. They are also the half that makes the ranking
      legible: a perfectly ordered list still reads as gibberish at 90 truncated characters a row.
      **3. TWO REAP PROBES HAVE NO GATE CASE AT ALL** — `supersededByAnotherRow` and `pidLongDead`.
      **4. THE DUPLICATE HANDLES** are their own open row and are named by
      `chart_sweep_conserves_check.mjs` on every run: `T-057`, `T-058`, `T-059`, `T-078`, `T-079`.
- [ ] **WIRE THE KIT AS A `git subtree` SO PROMOTION IS A MERGE, NOT A COPY — his metaphor,
      ⟨`T-081`⟩
      his refusal of cherry-picking.** 2026-09-02. **Sizing: an afternoon. Do NOT start it before
      `T-078`, and do not bundle the generalisation with it.**
      **His words:** *"the kit is 'production' and the local version of it is 'staging'… i don't want
      to be the human cherrypicking; i want the design of the kit itself to be architecturally
      extensible."* And his amendment to the adoption ruling: a project must also have **a way to
      update to the latest kit as it becomes available.**
      **`git subtree` answers both halves with machinery this project already trusts:** the kit's
      files live in the repo and are edited in place; `subtree pull` is "update to the latest";
      `subtree push` is "staging promotes to production". **Promotion is a merge, never a copy —
      rule 2 of his own release process** — so there is real ancestry, real conflicts when two things
      genuinely disagree, and it is reversible. A copy has no ancestry and therefore cannot tell an
      improvement from a divergence.
      ⚠ **THE HALF NO MECHANISM PERFORMS, AND IT MUST NOT BE PROMISED:** a subtree push sends
      pastrypirates' code upstream **verbatim**, and his ruling 4 is that the kit holds GENERALISED
      versions. `close_item.mjs:49-52` hardcodes four `.planning/` paths; `start_trial_detached.mjs`
      **exits 2** without `scripts/sea_trial.mjs`. **Pushed as-is, the kit inherits a pirate game.**
      Generalising is design judgement and belongs to the batched pass his ruling 3 describes —
      **build the plumbing, defer the framework.**

- [ ] **WRITE THE HANDLE LINKS INTO HIS QUESTIONS — the migration `ed827799` deliberately did not
      ⟨`T-079`⟩
      do, and until somebody does, NOTHING is ever marked "waiting on Wyatt".** CEO 104's one
      sentence for him says exactly this.
      **WHAT THE TOOL ALREADY TELLS YOU** — run `node scripts/wyclau/chartkeeper.mjs --rank` and
      read the last two warnings. Today: **4 rows talk about his BLOCKED ON WYATT table and name no
      question** (the Chartkeeper row, the staging-deploy row, the npm-test row and the Your-Call
      wording row), and **2 of his open questions name no task** (*"May an unattended watch READ the
      claude-kit folder?"* and *"Do you want `SCHEDULED` to stop hiding your ideas?"*).
      **THE JOB:** for each of his questions, write the `T-nnn` of every row it actually holds up
      into the question's own cell. Same for `SETTLED RULINGS`, whose rows currently name their
      subjects in prose only — the staging-permission ruling is the worked example: it is settled,
      the row it freed is still open at rank 32, and no machine can see the connection.
      ⚠ **THIS IS A CONTENT JUDGEMENT, WHICH IS WHY IT WAS LEFT.** Attaching a question to a row
      HIDES that row from him. The Chartkeeper row is the trap: its remaining half really is
      kit-blocked, but it is a BUNDLE with unblocked parts (this watch worked one), and sinking a
      bundle for one blocked part is the same section-for-row-level fault `T-079` just removed. **A
      bundle with unblocked parts must be SPLIT, not sunk** — that is SETTLE's job, not a question's.

- [ ] **The release trial did not sail the code that would be staged — RE-SAIL LAUNCHED 2026-09-01T19:14:17Z, verdict pending. GATED: nothing to DO but read the report when it lands; do not start a second trial while pid 45256 is alive.**
      ⟨`T-026`⟩
  The original finding: `efa1f2f5` ("preload: recipe art and award emblems now load up front")
  landed **2026-09-01T18:13:39Z** and touches `src/ui/util.js` — game code. The trial started
  16:44:08Z and ran 88 minutes, ending ≈18:12Z, so the change post-dated the whole run by about
  ninety seconds. **Three MORE game commits landed DURING that run** (`822549a7`, `bca181b2`,
  `f7c1207e`), which the original filing missed. Staging on the strength of that report would ship
  something the trial never saw.
  **THE RE-SAIL COULD NOT SAIL UNTIL THE STAMP MOVED, and that is the part worth keeping.**
  `readDone()` keys the leg cache on the build stamp alone (`playtest_gate.mjs:572,576`), and all
  ten legs of the FULL fleet held records at `2026.09.01.6` — so a trial started as the tree stood
  would have resumed 10 of 10, sailed nothing, and (correctly, under the provenance rule fixed an
  hour earlier) filed every resumed leg as NOT RUN. Measured red first: ten files matched
  `*--2026.09.01.6.json` and `crew-phone`'s own `__stamp` matched too, so both halves of the resume
  key were live. **The same one line fixes the honesty problem too**: four game commits had landed
  since `373bd99e` set `.6`, so the stamp named a tree it was never sailed against. Bumped to
  `2026.09.01.7` (`d6d6d75b`, via `scripts/bump-build.mjs` — the counter is the stamp itself, never
  a second file). Green after: zero cached legs at `.7`, no gate hardcodes the old value, npm test
  86/86, and the trial's own banner reads `build 2026.09.01.7 … gear: FULL` with all ten legs
  listed to sail rather than resume.
  Run `2026-09-01T1914Z-Wy-Blade`, pid 45256, report
  `.planning/SEA-TRIAL-2026-09-01T1914Z-Wy-Blade.md`, log
  `.planning/wyclau/detached/trial-2026-09-01T1914Z-Wy-Blade.out`. ~88 min on the last run's timing.
      ⚠ STALE-CANDIDATE — warns readers off on account of pid 45256, which is not running; measured on build 2026.09.01.6; the tree is 2026.09.02.1, so its evidence no longer describes this game
- [ ] **GATED: recurrence. One `<img>` reserved its box and did not paint, once, in one headless
      ⟨`T-078`⟩
  WebKit frame — mechanism unproven.** The residual of `T-005`, split off so a closed answer stops
  carrying an open question. What is proven is what it is NOT: not a font (the same card's bare 🏴
  was font-drawn in that frame), not a missing file (the same URL painted four times in the CAPTAINS
  panel of that frame), not an engine difference (the next run's same leg was clean). **Seen once.
  Chase it only if it is seen again**, and then with a posed board (`docs/DRIVING-THE-GAME.md` §5e),
  never a rate over a voyage — a single still cannot tell a mid-paint from a bug.
  Evidence and the numbers: [`T005-2026-09-02-THE-COIN-AND-THE-RIG.md`](T005-2026-09-02-THE-COIN-AND-THE-RIG.md).
      ⚠ STALE-CANDIDATE — your answer landed — **"yes"** — ruled on the Glass 2026-09-02T12:39:56.363Z, no note attached — and nothing moved this row
- [ ] Your ruling: merge the 465-commit branch to `main` — **GATED: his own final say-so, and he has not played 2026.09.01.8 on staging yet.** The release trial has since landed clean (0137Z, 10 of 10, empty not-run column). Nothing for a watch to do but wait.
      ⟨`T-006`⟩
      ⚠ STALE-CANDIDATE — measured on build 2026.09.01.8; the tree is 2026.09.02.1, so its evidence no longer describes this game
- [ ] 24-hour unattended engine run, zero silent stalls — GATED: passive, monitor only; nothing to DO but watch the clock since the Razer hour (16:19Z)
      ⟨`T-028`⟩
- [ ] Memory consolidation: five homes → one + pointers — GATED: same quiet moment
      ⟨`T-029`⟩
- [ ] Pruning: kill-list generated (GSD phase machinery, dead files), archived in git, deleted; goes on the Glass for the record — GATED: same quiet moment
      ⟨`T-030`⟩
- [ ] Rulebook cutover: `CLAUDE-next.md` replaces `.claude/CLAUDE.md`; war stories → `.claude/rules/*.md` at their triggers — GATED: at the quiet moment, needs the parallel fix session closed
      ⟨`T-031`⟩
- [ ] Your ruling: the cutover moment — **GATED: on the exit test verdict, which is his own stated condition.** Nothing for a watch to do.
      ⟨`T-007`⟩
- [ ] Your ruling: the Glass's Ideas box corrupting the page after a save — **GATED: awaiting his own look at the live page**, which only he can do. Root-caused and fixed 2026-09-01, and he has since written to that page repeatedly with no corruption reported — very likely closable the next time he says so.
      ⟨`T-008`⟩

## BLOCKED ON WYATT

<!-- ⚠ THIS SECTION IS TABLE ROWS, BLANK LINES, OR HTML COMMENTS. NOTHING ELSE, AND A GATE ENFORCES IT
     (scripts/qa/glass_calm_check.mjs, case 10). glass.mjs renders only lines beginning with "|" and
     skips every paragraph — so a question written here as prose is invisible on his page, and Your
     Call truthfully reports (0) while a real question waits. He caught exactly that in a screenshot,
     2026-09-02. A QUESTION IS NOT ASKED UNTIL IT IS A ROW IN THIS TABLE.

     AND THIS NOTE IS A COMMENT FOR THE SAME REASON, which is the joke that cost him a red warning:
     as prose, the paragraph forbidding prose was itself the first thing the detector flagged — in
     red, above his real decisions — along with four blocks of historical bookkeeping. His words,
     2026-09-02T17:xxZ: "'…and there is more in that section this page could not read…' → what is
     causing this? debug and fix." This was the cause. The four notes moved to CHART-LOG.md.
     ⚠ AND HIS ARROW IS WRITTEN → HERE, NOT AS TWO DASHES AND AN ANGLE BRACKET, BECAUSE THAT SEQUENCE
     CLOSES AN HTML COMMENT. Quoting him verbatim inside this fence ended the comment mid-sentence
     and put six lines of it straight back into the section as prose — the gate caught it in one
     run. Anything quoted in here has to be checked for it.

     The reader was deliberately NOT made cleverer. The first draft warned only on prose containing a
     "?", and three of the five blocks quoted his own already-answered questions, marks and all — so
     the warning would have survived the fix. Fence the writer, keep the reader broad and dumb.
     Diagnosis: SPEC-GLASS-CALM.md and SPEC-VISIBILITY-AND-INJECTION.md §2. -->

| Question | Recommendation | since |
|---|---|---|

<!-- The four blocks of historical bookkeeping that used to sit here — which questions were ruled,
     when, and where each went — moved to CHART-LOG.md on 2026-09-02 under "BOOKKEEPING — questions
     that have left BLOCKED ON WYATT". Nothing was deleted. They are backward-looking, and his
     ruling is that the Chart shows only where we are going. -->

## RULED — his answers, waiting to be triaged

> ### THIS SECTION IS A WAITING ROOM, NOT AN ARCHIVE. Read this before adding a row.
>
> Wyatt, 2026-09-01 (INBOX-20260901T1310Z): *"The Glass's Your Rulings -- In Hand are stale; there
> must be a process that triages them and adds them to the Tasks list, then removes them from the
> Your Rulings list."* **This section IS that card** — the Glass renders every row of it under
> "Your rulings, in hand", so a row that stays here forever is a card he stops reading. It held
> eight rows, five of them shipped or closed days earlier.
>
> **THE PROCESS, and it is three moves, done by the watch that harvests or acts on a ruling:**
>
> 1. **A freshly harvested ruling lands HERE**, with the `now` cell left EMPTY — it has not been
>    triaged yet, and an empty cell is the honest way to say so.
> 2. **Triage it.** If it still needs work, add a `- [ ] Your ruling: …` row to the STEP 1
>    CHECKLIST — that is what puts it in the Glass's Tasks card, automatically, with no second
>    list to keep in step. If nothing is left to do, no task is needed.
> 3. **Move the whole row down to SETTLED RULINGS**, with the verdict written into its `now` cell.
>    It leaves this card and stays on the record forever.
>
> **Enforced, not remembered:** `scripts/qa/rulings_triage_check.mjs` fails the build if a row here
> carries a verdict (it belongs in SETTLED), or if a settled ruling with work outstanding has no
> checklist row (it would have vanished from every surface he can see). Both directions
> red-proofed.

*Four rulings are waiting, freshly harvested (rows below, `now` cell empty by design — not yet
triaged). Two more rulings landed and were triaged straight to SETTLED below since both resolve
to "nothing to build." The prior eight were triaged 2026-09-01; three carried work and are in the
STEP 1 CHECKLIST, tagged "Your ruling:".*

| item | HIS RULING | now |
|---|---|---|
| Recipe pictures: convert PNG → WebP (21 pastry images, 1.71MB → 1.18MB, no visible change) | **"Do it; but I am surprised that they are already 'too small'— what is the maximum size they are displayed at?"** — ruled on the Glass 2026-09-02T00:58:35.117Z | |
| May a watch publish to staging on its own? The tree is green, trial-covered and every screen judged, and the one command that puts it on `staging.playpastrypirates.com` is the one thing an unattended watch is not allowed to run — three forms all answered "This command requires approval." | **YES** — ruled on the Glass 2026-09-02T04:03:36.066Z, no note attached | |
| Do you want `SCHEDULED` to stop hiding your ideas? Measured with the page's own logic: 13 of your 15 ideas are hidden from the Glass, 9 of them by the word `SCHEDULED` — which the code treats as identical to SHIPPED and CLOSED, against the Charter's own words: "Every idea gets a visible fate (shipped / scheduled / parked-with-reason)." | **"yes"** — ruled on the Glass 2026-09-02T12:28:02.757Z, no note attached | |

## THE FOUNDATION, AS MEASURED 2026-08-31 — not as the plan describes it

*The plan (`architecture-one-director.html`) was written from a reading that predates several
convergences. Every row below was checked against the tree, not against the document.*

| step | the plan says | the tree says |
|---|---|---|
| 1 · storyboard, route one kind through it | to build | **DONE.** `present()` in `src/shared/storyboard.js`, `playStoryboard()` in `src/ui/flow.js`, `sail` converted. No player-visible change — see step 2. |
| 2 · put the route on the event, guest walks real water — *"first visible win"* | to build | **ALREADY SHIPPED.** The route rides on the event as `draw.route` and `consumeEvent` walks it on every client. There is no visible win left to claim. |
| 3 · one fact for whose turn it is | struck by measurement | **DONE**, by commit `5e9ee2b1`, before the run that checked it. `setActor` has one caller. |
| 4 · storyboard parity gate | to build, after two kinds | **DONE**, built after one kind on purpose — the plan's own reason is to guard the migration rather than certify it. Golden file, one process, no browser. |
| 5 · the Decider interface | to build | **DONE, the narrow half — shipped 12:54Z, ruled 17:09Z.** Two orthogonal predicates stay two, per his ruling. The three mode reads that decided what is *drawn* moved to one pure rule module, `src/shared/visibility.js`; the drawing code only supplies facts. |
| 6 · delete old paths, layering gate strict | to build | **LARGELY ALREADY ENFORCED.** All three layering rules the plan asks for already fail the build; proven by planting each violation. |

- **Safari screens miss the settle window by about a tenth of a second — a tuning decision, not a bug.**
  Measured 2026-09-01 on Safari's first two legs ever run here: 7 of 27 screens (desktop) and 5 of
  20 (phone) were checked while still moving, **all of them GEOMETRY churn, longest wait 2.7s**
  against the 2.6s window — and none anywhere near the 12s runaway guard. So the game is not
  misbehaving in WebKit; the checker reads the screen a fraction before WebKit finishes animating.
  → **PARKED, with the measurement, because the obvious fix has a real cost.** `waitSettled()`
  already pushes its deadline while TEXT is still painting, and extending that to geometry would
  clear these. But a screen with a looping animation would then hold until the 12s guard every
  time, on every leg of every trial — potentially minutes added per run to fix a 100ms miss.
  The honest options are (a) push on geometry too and accept the worst case, (b) let the window
  follow the engine, since this is WebKit-only so far, or (c) leave it and read the cause, which
  the verdict now prints. **Not guessing between them without more evidence** — three Safari legs
  is one run. Revisit when a second Safari trial exists to compare against.

## THE IDEA INBOX

*Drop ideas here in any words, any time, through any session ("add to the chart: …"). Each gets a
fate — SHIPPED / SCHEDULED (where) / PARKED (why) — with a recommendation, within a day.*

> ### ⚠ `T-098` – `T-104` ARE THE SAME SEVEN THINGS AS `INBOX-20260902T1907*`. WORK THEM FROM THE INBOX.
>
> **Two sessions harvested his 3:07–3:09 PM writing off the Glass within minutes of each other** —
> the Glass-update session filed all seven here as `T-098`–`T-104` (`996ee621`, `7042c7e0`), and the
> Advisor filed five of them into `.planning/wyclau/INBOX.md` as `INBOX-20260902T190715Z` through
> `…190743Z`. **Neither was wrong and neither knew about the other until they compared notes by
> message.** Nothing was lost; the cost is that the same job is now claimable twice.
>
> **THE INBOX COPY IS AUTHORITATIVE, for a mechanical reason and not a preference:** he wrote these
> as *instructions* — several say "ask me", "do not write any code this session", "recommend, don't
> just build" — and the INBOX is the only one of the two that the Door reads FIRST, that carries a
> `solution:` line in his own words, and that `close_item.mjs` can close. **A row here cannot be
> closed by the gate.** The two `DO NOW` asks (`T-103`, `T-104`) additionally have real task rows at
> the top of `FOR A WATCH`; that is where they get worked.
>
> **AND THIS IS EXACTLY WHAT `T-105` LAYER C IS FOR** — an idempotent harvest keyed on the idea's own
> id (`i1788376035472`) would have made the second harvest a no-op instead of a duplicate, and the
> question *"has this already been filed?"* would be answered by the data rather than by two sessions
> messaging each other. **Filed here as the second live instance in one hour.**

- **⚑ Wyatt, DO NOW, written on the Glass, 2026-09-02, 3:09 PM ET**: *"Do Now: in the Glass, Add a
      ⟨`T-104`⟩
  \"DO now\" button next to \"Send to the Chart\" button that tells RANK to put this task at the
  top"* → **NOT YET FATED — harvested verbatim, not investigated. This session's mandate is
  harvest-and-publish only.** Companion to T-103 (drag-to-reprioritize) -- both are UI asks for the
  Glass/Chart pairing, filed one minute apart.

- **⚑ Wyatt, DO NOW, written on the Glass, 2026-09-02, 3:09 PM ET**: *"DO NOW: build a way for me
      ⟨`T-103`⟩
  to drag to reprioritize the chart, in The Glass."* → **NOT YET FATED — harvested verbatim, not
  investigated. This session's mandate is harvest-and-publish only.** He tagged this DO NOW
  himself — flag it for the next session/watch to pick up first, ahead of T-098 through T-102.

- **Wyatt, written on the Glass, 2026-09-02, 3:07 PM ET**: *"Regenerate sitemap.xml at the repo
      ⟨`T-102`⟩
  root of playpastrypirates.com now that the new pages exist.

  Include every genuinely public page. Verified 2026-09-02, these are correctly EXCLUDED and
  should stay out:
  - classic/ — deliberately meta noindex,follow so v1 can't compete with the front door
  - lab.html, stats.html, classic/lab.html, classic/stats.html, /4/ — blocked in robots.txt
  - art-review/, scripts/, .planning/ — working files, not the site

  Use \<lastmod\> only. No \<changefreq\>, no \<priority\> — Google ignores both. Derive each
  lastmod from git, don't hand-type.

  Consider whether this file should be generated by a script from the actual pages rather than
  hand-maintained — a hand-kept sitemap goes stale silently the next time a page is added.
  Recommend, don't just build; flag it as a small job and let me decide.

  Then remind me to resubmit sitemap.xml in Google Search Console under the playpastrypirates.com
  property (not wyattroy.com — check the property picker, they look identical)."* → **NOT YET
  FATED — harvested verbatim, not investigated. This session's mandate is harvest-and-publish
  only.** Note: this supersedes/extends T-098 below (both touch sitemap.xml) — a later session
  should reconcile the two rather than doing both independently.

- **Wyatt, written on the Glass, 2026-09-02, 3:07 PM ET**: *"Pull the Credits modal (index.html,
      ⟨`T-101`⟩
  around line 2717) out into its own page at playpastrypirates.com so I have a URL to send
  collaborators.

  REGISTER WARNING, and it's easy to get wrong: credits are NOT in pirate speak. They're outside
  the game world and written in my own plain first-person voice. A "ye"/"you" difference between
  the credits and the rest of the game is correct and deliberate — never "fix" it. See
  .claude/CLAUDE.md §2, the voice boundary.

  Same one-source constraint as the rules page: the modal and the page must not become two copies
  that drift."* → **NOT YET FATED — harvested verbatim, not investigated. This session's mandate
  is harvest-and-publish only.**

- **Wyatt, written on the Glass, 2026-09-02, 3:07 PM ET**: *"Build the rules page for
      ⟨`T-100`⟩
  playpastrypirates.com, following the content split I approved in the previous session.

  THE HARD CONSTRAINT, and it's the reason this needs care:

  The in-game "How to play" modal (index.html, around line 2685) and the new rules page must NOT
  be two copies of the same 765 words. Two things kept in step by discipline will drift — that's
  rule 23 in .claude/CLAUDE.md, ONE DISPLAY PATH, and this is exactly the shape it warns about. Six
  months from now someone fixes a wind rule in one place and not the other, and the game
  contradicts its own rules page.

  Before writing anything, answer this out loud: what makes these two agree? If the honest answer
  is "we keep them in sync," that's the defect, and you should design it differently before
  writing a line. There is no build step in this project — vanilla HTML/CSS/JS, native ES modules
  — so whatever you propose has to work without one.

  Also required:
  - Wire the footer links (index.html has .footerHow / .footerCredits)
  - Give the page proper \<title\>, meta description, and og: tags matching the house pattern in
    index.html
  - Screenshot the result before handing it over, and screenshot the in-game modal too to prove it
    still works (rule 19)
  - Run the sea trial: node 4/scripts/qa/gear.mjs, then sea_trial.mjs
  - Bump PP4_STAMP in src/ui/stage.js before pushing

  Every push to main is served to real players immediately. Read the diff."* → **NOT YET FATED —
  harvested verbatim, not investigated. This session's mandate is harvest-and-publish only.**
  ⚠ **References "the content split I approved in the previous session" and "node 4/scripts/qa/
  gear.mjs" — the `4/` tree language predates this repo's v2.0 cutover (game code now lives at
  repo root, not `4/`). Whoever picks this up should reconcile the path before running anything.**

- **Wyatt, written on the Glass, 2026-09-02, 3:07 PM ET**: *"I want to give Pastry Pirates' rules a
      ⟨`T-099`⟩
  real, findable page, and I need to decide the content split before anything gets built.

  The situation, verified 2026-09-02:
  - index.html has a "How to play" modal (around line 2685) holding 765 words of detailed rules:
    the wind rule and the ghost needle, crate prices rising as an island empties, how a broadside
    resolves downwind, the trade winds, storms, the shot clock. It's the best writing on the site.
  - It lives in a JavaScript pop-up with no URL. Nobody can link to it, search for it, or land on
    it from Google.
  - about.html separately has a shorter "How it plays" section (The goal / Your turn / Coming
    home), plus "What the captains are saying" and "Credits". About 1,665 words total.

  So there are already two overlapping accounts of the rules, and if a new page joins them that's
  three pages competing for the same search.

  Ask me 2-5 questions with the question UI to settle: which page becomes THE rules page, what
  About keeps, and whether the in-game modal shows the full text or a short version that links out.

  Do not write any code this session. Come back with a recommendation and let me approve it."* →
  **NOT YET FATED — harvested verbatim, not investigated. This session's mandate is
  harvest-and-publish only.** Reads as: a content-architecture decision (rules-modal vs. about.html
  vs. a new page) he wants walked through with the question UI, not built yet.

- **Wyatt, written on the Glass, 2026-09-02, 3:07 PM ET**: *"Fix sitemap.xml at the repo root of
      ⟨`T-098`⟩
  playpastrypirates.com.

  Two problems, both verified 2026-09-02:
  1. It uses \<changefreq\> and \<priority\> on both entries. Google publicly ignores both tags —
     they're dead weight from the 2005 spec.
  2. It has no \<lastmod\>, which is the one tag Google actually uses to decide what's worth
     re-crawling.

  Remove changefreq and priority. Add lastmod to both entries.

  DERIVE the dates, do not hand-type them — an inaccurate lastmod gets discounted by Google, and a
  hand-typed date is wrong the moment work continues. Use the last commit date of the page each
  entry points at:
    git log -1 --format=%cs -- index.html
    git log -1 --format=%cs -- about.html

  Note: sitemap.xml is a site-identity file (docs/GIT-AND-DEPLOY.md §1). It must never be copied
  to the preview/staging repo. Don't touch scripts/deploy-preview.sh — just be aware.

  Gear: COSMETIC. This is not game code."* → **NOT YET FATED — harvested verbatim, not
  investigated. This session's mandate is harvest-and-publish only.** Reads as: a small, scoped
  SEO fix to the live sitemap, self-contained and already speced by him.

- **Wyatt, ruled on the Glass, 2026-09-02T17:06:59.448Z** (question: *"That black window you asked
      ⟨`T-096`⟩
  about is fixed — but the check that keeps it fixed flashes one for about a second every time we
  run the checks. Is that price OK?"*, `.planning/CHART.md` BLOCKED-ON-WYATT row, choice `note`):
  *"Keep it."* → **NOT YET FATED — harvested verbatim, not investigated. This session's mandate is
  harvest-and-publish only.** Reads as: keep the self-test that flashes a black window for ~1
  second during every `npm test` and sea trial, in exchange for the check not being able to go
  silently blind. The BLOCKED-ON-WYATT table row for this question should be moved to RULED/SETTLED
  by whichever session next triages the inbox.

- **Wyatt, ruled on the Glass, 2026-09-02T16:10:03.916Z** (question: *"Your images ask, last
      ⟨`T-089`⟩
  third: shrinking the rest of the art is worth about 2%. Call it finished, or spend a watch on
  it?"*, `.planning/CHART.md` BLOCKED-ON-WYATT row, choice `no`): *"It's finished -- push it to
  sea trial."* → **NOT YET FATED — harvested verbatim, not investigated. This session's mandate is
  harvest-and-publish only.** Reads as: stop spending watches on the image-resize tail (the
  unmeasured third of the library included) and move straight to the sea trial instead.

- **Wyatt, written on the Glass, 2026-09-02T13:18:28.755Z**: *"Remove the \"Your rulings in hand\"
      ⟨`T-087`⟩
  box from the Glass"* → **NOT YET FATED — harvested verbatim, not investigated. This session's
  mandate is harvest-and-publish only.**

- **Wyatt, written on the Glass, 2026-09-02T12:29:35.591Z**: *"The trade winds squares should also
      ⟨`T-082`⟩
  be yellow-ISH not blue-ish-- they should look similar to the travellable squares, they just also
  have dotted lines around them and show the preview when tapped. when changing the trade winds
  highlight color, we also need to change the text that mentions \"blue squares take two taps\" --
  that message should say something like \"tap a trade winds square twice to confirm\""* → **NOT
  YET FATED — left open deliberately, not tagged SCHEDULED, per his own ruling above that
  SCHEDULED hides ideas from this page until that fix ships.** A colour/copy pairing: recolour the
  trade-wind squares to match the travellable-square yellow (keeping their dotted outline and
  tap-to-preview), and rewrite the "blue squares take two taps" narration line to describe the new
  colour, e.g. "tap a trade winds square twice to confirm." Not investigated here — this session's
  mandate is harvest-and-publish only.

- **Wyatt, written on the Glass, 2026-09-02T05:12:07Z**: *"Add New SFX to the game -- they are all
      ⟨`T-073`⟩
  available here: https://drive.google.com/drive/folders/1-QPmngfYHbizxNNj7-SjNQVHoVJl1zlW?usp=share_link.
  You can see the spreadsheet with our plan for the SFX here:
  https://docs.google.com/spreadsheets/d/12l3IEp8KslOEeGHJm_B8r7l_NPF4_wxN02uqW7PoEc4/edit?usp=sharing
  If you cannot access either of those drive docs/folders (try multiple ways) then tell me the
  easiest way to get the files to you"* → **SCHEDULED, next audio/game-code session — an asset
  request, not a code defect.** He wants new SFX added, and has linked (1) a Drive folder holding
  the audio files and (2) a spreadsheet with the SFX plan. Read `docs/AUDIO.md` first (CLAUDE.md
  §4) — three audio defects are already live there and this should not be layered on top of them
  blind. Not investigated here — this session's mandate is harvest-and-publish only. His own
  instruction is the first step for whoever picks this up: try to actually reach both Drive links
  (a browser-driving session has a real shot; a plain fetch likely does not), and if neither link
  is reachable, tell him the easiest way to get the files across instead of guessing.

- **⚑ Wyatt, LIVE BUG REPORT, written on the Glass, 2026-09-02T04:15:44Z**: *"The \"black spot of
      ⟨`T-059`⟩
  bad tides\" prize should be handed out every game to the player who flipped the most tails -- it's
  quite gratifying. however, it is not currently being calculated correctly. in my last playtest,
  crustbeard had 67% heads luck yet flaky jack won the award, with 75% heads luck. This means that
  the \"heads luck\" isn't being calculated correctly either -- it suggests that crustbeard only
  flipped a coin 3 times, and flaky jack 4 times -- whereas in a game, the coin must be flipped at
  least 5 times in order to get 5 crates; and often more. the heads luck data should count all coin
  flips from every action that a player does, which includes battling and docking (and anything
  else?)"* → **SCHEDULED, next game-code session — a real defect, with his own measurement
  attached.** Two linked claims: (1) the End-of-Voyage "Black Spot of Bad Tides" award (most tails
  flipped) went to Flaky Jack over Crustbeard despite Crustbeard's lower heads-luck percentage,
  which is contradictory on its face; (2) the "heads luck" percentage itself looks undercounted —
  his math implies only 3-4 flips were tallied per player when a full voyage flips far more than
  that just from crate-gathering, before battling/docking flips are even added. His diagnosis: the
  coin-flip tally is likely scoped to only one action type (crate flips) instead of every action
  that flips a coin. Needs a real trace of what increments the tally before any fix — not
  investigated here, this session's mandate is harvest-and-publish only.

- **⚑ Wyatt, LIVE BUG REPORT, written on the Glass, 2026-09-02T04:12:13Z**: *"in the recipe popup
      ⟨`T-060`⟩
  modal (viewable at the end of the game and whenever you click your own recipe) the print and pdf
  buttons cover up the X to close the modal -- redesign the modal header to accommodate the X"* →
  **SCHEDULED, next game-code session — a real defect report.** A player who opens their recipe
  (from End of Voyage or by clicking their own recipe mid-game) can't close the modal because the
  Print/PDF buttons sit on top of the X. Needs a header layout fix so all three controls have room
  — not investigated here, this session's mandate is harvest-and-publish only.

- **⚑ Wyatt, LIVE BUG REPORT, written on the Glass, 2026-09-02T04:04:27Z**: *"New bug: post-trade
      ⟨`T-061`⟩
  denial narration is gone. Find out what happened to it; also, audit the entire game to see which
  other narrations are now missing. we can't have them suddenly go missing, it means our process
  is broken."* → **SCHEDULED, next game-code session — a real defect report, not a Glass-layout
  ask, and flagged above the Glass-UI batch below because it's a regression in the game itself.**
  Two asks: (1) find out why the narration line a player sees after a trade offer is declined has
  stopped appearing, and (2) since this implies something upstream silently broke it, sweep every
  other narration trigger in the game for the same silent loss rather than fixing this one line in
  isolation. Not investigated here — this session's mandate is harvest-and-publish only, never game
  code (rule 6/26: needs measurement — a posed before/after trade-denial, not a guess at the cause
  — before it's called fixed).

- **Wyatt, written on the Glass, 2026-09-02T03:58:29Z**: *""Shipped today" should only list tasks
      ⟨`T-062`⟩
  that were actually completed -- not commits that were simply recording things that I said --
  those are useless to me. I want to be able to read Shipped Today and see what was built; not a
  record of my past writing to you"* → **SCHEDULED, next Glass-focused session, same batch as the
  other Glass-layout/content asks in this inbox.** The "Shipped Today" card currently derives
  straight from the git log, so a Glass-update session's own harvest commits (like this one, and
  the ones right above it) show up there indistinguishably from real game-code fixes — noise, by
  his own read. Likely fix: filter that card's commit list to exclude harvest/publish-only commits
  (they all share a recognizable prefix — "harvest:" — that `glass.mjs` could match on and drop),
  or split the feed into a real "Shipped" list and a separate, de-emphasized "heard from you"
  trail. Not fixed here — this session's mandate is harvest-and-publish only.

- **Wyatt, written on the Glass, 2026-09-02T03:56:34Z**: *"Remove the verbose paragraphs from the
      ⟨`T-063`⟩
  top of The Glass, eg \"From another session, folded in on this pulse: **Watch
  2026-09-02T03:48Z — taking up the last two parts of your release order: put it on staging, and
  hand you the link.**...\" so they never appear again -- if you need to update me, do it in one of
  the other sections or in Your Call if it needs my choice"* → **SCHEDULED, next Glass-focused
  session, same batch as the other Glass-layout asks above/below.** He wants the long
  session-to-session note paragraphs that currently appear at the top of the page gone for good —
  any update from a session should land in an existing section (Shipped Today, Your Call) instead
  of as a standalone block of prose at the top. Not fixed here — this session's mandate is
  harvest-and-publish only; the one-sentence `--note` this session itself writes is a narrower,
  compact version of the same pattern he's asking to remove, so the fix likely needs to touch how
  `glass.mjs` surfaces every session's note, not just the multi-paragraph ones.

- **⚑ Wyatt, written on the Glass, 2026-09-02T03:55:25Z, LIKELY EXPLAINS A REAL BUG**: *"you must
      ⟨`T-064`⟩
  build a submit button underneath every Your Call entry, and not record my responses until I
  press it -- otherwise they may get cut off by your processes."* → **SCHEDULED, next Glass-focused
  session — flagged as higher priority than the other three.** This appears to be the root cause
  of the gold-coin ruling landing cut off mid-sentence minutes earlier ("In the past (earlier
  today) it was a") — his own diagnosis of why. The ruling textarea currently likely saves on
  every keystroke or on blur rather than on an explicit submit, so a save mid-typing captures a
  partial string. Recommend: add an explicit "Submit" button under each ruling's note field,
  disable/hide it until there is text, and only write to `glassState.rulings` on that click —
  matching the pattern the Send-to-Chart idea box already uses. Not fixed here — this session's
  mandate is harvest-and-publish only, never product work on the page itself.

- **Wyatt, written on the Glass, 2026-09-02T00:59:32Z**: *"You need to update Tasks list
      ⟨`T-065`⟩
  dynamically — it is stale. Add this to your session that updates glass. Move The Lesson section
  below it."* → **SCHEDULED, next Glass-focused session — not this one.** Two asks: (1) the Tasks
  card should reflect the STEP 1 CHECKLIST live rather than going stale between regenerations, (2)
  reorder so The Lesson section sits below Tasks. This Glass-update session's own mandate is
  harvest-and-publish only, never product work on the page itself — recommend a session actually
  scoped to Glass UI work picks this up, matching how the 2026-08-31 20:40Z layout asks were
  handled (scheduled, then shipped together in one focused pass rather than piecemeal).
  - **Reiterated on the Glass, 2026-09-02T03:45:45Z**: *"Move The Lesson to below Tasks."* Same ask
    (item 2 above), written again — nothing new, still unshipped, still SCHEDULED. Flagging the
    repeat itself as a signal: two separate write-ins for the same reorder suggests it should not
    wait much longer for a Glass-focused session to pick it up.
  - **Written on the Glass, 2026-09-02T03:46:13Z**: *"rename Tasks to The Chart (Tasks To Do)."*
    New naming ask, same card. → **SCHEDULED, same Glass-focused session as the two above** —
    rename the "Tasks" card's heading to "The Chart (Tasks To Do)".
  - **Written on the Glass, 2026-09-02T03:49:02Z**: *"Make all tasks in The Chart expandable for
    fuller context. Let me write a comment under each one if I choose to. Order the list with the
    next-to-be-completed at the top. re-order the list dynamically. Remove items from the list
    after they are complete (eg. The Blade Hour -- can you derive whether or not this was
    completed, or do you need me to tell you?)"* → **SCHEDULED, same Glass-focused session as the
    three above** — five asks on the Tasks card: (1) expandable rows for more context, (2) a
    per-item comment box, (3) sort next-to-complete first, (4) that ordering re-derived live not
    fixed, (5) auto-remove completed items.
    **His embedded question, answered by measurement rather than deferred:** partly derivable.
    Checked `schtasks /Query /TN "wyclau-bell" /V` directly on this machine just now — the task IS
    registered, **Status: Ready, Scheduled Task State: Enabled**, last ran 23:48, next run 23:58 —
    so the Bell-registration third of that item is genuinely done. But "The Blade hour" checklist
    row bundles three things (register the Bell, the ring test both directions, the O2 publish
    test) and only the first is checkable this way — the other two need either his confirmation or
    a session that can run that test. Not marking the checklist row complete on one-third evidence;
    left `[ ]` with this measurement attached so the next session doesn't have to re-derive it.

- **Wyatt, LIVE BUG REPORT, 2026-08-31 21:00Z, two screenshots**: *"after I send something to you in the ideas box, the page css breaks; and i'm not sure if the idea was sent. i need to be able to send another idea immediately afterwards, without waiting. i need to know that my first idea was sent, and added to the chart."* → **ALL THREE NOW FIXED — THE CORRUPTION WAS ROOT-CAUSED 2026-09-01 03:50Z, AFTER THREE WRONG ATTEMPTS. Awaiting only his own look at the live page.** *(This line said "THE THIRD — THE ACTUAL CORRUPTION — IS UNEXPLAINED" for two days, and that was true when written. The escaper the page uses to save itself was a no-op — authored inside a template literal, its backslashes halved on the way out, so it replaced `<` with `<` — and every self-publish therefore wrote a live closing script tag into the document, ending the real script early and turning the rest of the page into stray markup. Found by clicking Send in a real browser and rendering what came back. Gate `glass_self_publish_check.mjs`, red first.)*
      ⟨`T-066`⟩
  - **✅ Fixed, verified**: "send another immediately, without waiting" and "know it was sent" — the Send button's success handler was an empty comment (relied entirely on the platform's own view reload, never re-enabled, never confirmed). Now updates local state, clears the box, repaints the visible list, shows an honest confirmation ("Saved to the page — a session will harvest it to the Chart soon." — not overclaiming it's already in the Chart), and re-enables immediately. Same fix applied to the rulings-save flow for consistency (rule 8). Gate `scripts/qa/glass_send_confirms_check.mjs`, red-proofed against the exact pre-fix empty handler.
  - **⚠ CORRECTION, CEO Review 54, IN THE OPEN — the page-corruption fix is NOT proven.** The original entry here said "root cause measured": a comment reading `// The state block is a JSON <script>, so...` — a literal, unescaped, tag-shaped substring inside the real client script element. **That claim was wrong, and the review caught it properly**: it regenerated the exact pre-fix page and rendered it in a real, unmodified headless Chrome — it came up completely clean, no corruption. Per the HTML5 spec, a bare `<script>` (no slash) inside running script content is not special; only `</script` ends it. A follow-up check here (4 rounds of the real client-side self-publish escaping, simulated in Node) also never drifted. **So the actual mechanism that broke Wyatt's live page is still unknown** — most plausibly something specific to the Claude Artifact host's own internal rendering/patching pipeline when `cap.publish()` runs live, which cannot be reproduced or inspected from outside that system. The comment was still reworded (bad practice regardless, and the gate `scripts/qa/glass_script_tag_purity_check.mjs` was kept and WIDENED to check the whole document, not just two known blocks — a real improvement CEO Review 54 also asked for) — but it must not be called a proven fix for his exact symptom. **Needs Wyatt to try the Ideas box again on the live page and say whether the corruption still happens** — parked here rather than asked via the question UI, per his standing instruction. npm test 74/74.
  - **2026-08-31, ATTEMPT 2 — also reported still broken.** Redesigned to blank the body to a few plain words BEFORE calling `cap.publish()`, reloading once the publish promise settled either way. Wyatt: *"the glass ideas section is still broken."* Gate `glass_self_heal_reload_check.mjs` verified the mechanism was actually shipped; it did not verify the mechanism actually fixes his symptom, which remained unmeasurable from outside the live host.
  - **2026-09-01, ATTEMPT 3 — removed `location.reload()` from the flow entirely, not yet confirmed.** Two different reload timings (1400ms after publish; immediately before, blanked) both still corrupted, per his own reports — evidence the reload itself is implicated, not its timing. Send/ruling handlers now mutate `state` in memory, repaint synchronously via the existing `renderIdeas`/`paintAsk`, and call `cap.publish()` in the background with no navigation at all. This also directly answers his original ask ("send another idea immediately, without waiting") better than either reload-based version did. Gate `glass_optimistic_save_check.mjs` (replacing `glass_self_heal_reload_check.mjs`) verifies no `location.reload()` remains in the send/ruling paths and that both update state before publishing. **Still not proof the corruption is gone — same limitation as attempts 1 and 2: it cannot be reproduced outside the live authenticated host.** Needs Wyatt to try the Ideas box again and say whether it still happens.
- **Wyatt, written on the Glass, 2026-08-31 20:40:18Z**: *"Edits for The Glass: 1. Move 'Tasks' to
      ⟨`T-067`⟩
  go above 'Shipped Today' 2. Make Shipped Today expandable, with each thing shipped in its own
  pill, clickable to see more information about that commit 3. reformat the pages so Shipped Today
  is in the left column, and Your Rulings is on the right column. On mobile, one column with
  Shipped Today is on top."* → **SCHEDULED, next Glass-focused session.** All three are real,
  concrete UI work (reorder a section, make list items expandable with per-commit detail, a
  responsive two-column layout) — not urgent, not blocking any Chart item, and needs the same
  render-and-screenshot discipline (rule 19) the redesign itself used. Recommend building all three
  together rather than piecemeal, since (2) and (3) both touch the Shipped Today card's markup.
  → **ALL THREE SHIPPED 2026-09-01 04:15Z**, built together as recommended. (1) Tasks now sits above
  Shipped Today. (2) Each commit is its own pill, closed by default, opening to that commit's real
  reasoning — its body, with the `Co-Authored-By`/session trailers stripped by SHAPE so a renamed
  trailer cannot leak back in; the hash and relative time sit at the foot. (3) Two columns at
  ≥46rem, Shipped left and Rulings right, one column below that with Shipped on top — source order
  already puts Shipped first, so the phone case is the grid simply not applying, with no second
  ordering rule to keep in step. The sheet widens to 62rem only where the grid applies (at 40rem the
  columns came out 311px and the rulings table wrapped every other word). Rendered and screenshotted
  at 1100px and 375px, zero horizontal overflow at either. **Three real defects were found by
  looking at the picture rather than the numbers**: raw `~~` markdown reaching the page (the Chart's
  markers were stripped in three ad-hoc places and `~~` was missed in all of them — now one
  `unmark()`); an answered question still rendering as an open "Your call" because its row had been
  edited in place instead of moved to RULED; and the Tasks card counting harvested ideas as open
  work — it read only each bullet's FIRST line, while an idea's fate is written in the lines
  underneath, so "12 open" was really 6.
- **CEO Review 51's small finding**: `quiet_gate_report.mjs`'s naming convention (`^[wq]\d+_`)
      ⟨`T-068`⟩
  misses `a1_bake_now_check.mjs` / `a2_bot_bake_watch_check.mjs` — two real per-item gates that are
  neither structural nor currently reportable as retirement candidates. → **PARKED, low priority**:
  widen the regex to also match `a\d+_` whenever someone is next in `quiet_gate_report.mjs` for
  another reason; not worth a standalone session, since the report already covers every gate that
  matches its stated convention and found zero candidates either way today.

- **Wyatt, written on the Glass AND said live, 2026-09-01 02:13:52Z**: *"Make Glass truly mobile
      ⟨`T-069`⟩
  friendly— it is too wide for phone because not all its divs are constrained, so the 'your ruling'
  section forces the whole page to be too wide. Also, I like the headline on 'progress' under the
  status emoji, but make it a headline, a sentence or two, not a paragraph. Lastly, I can see the
  bosun working right now, but the status shows red. You have to fix the way you report status so
  that it's only red if the bosun is truly not working or running any subprocesses. Page is still
  broken after submitting an idea, same error as before."* → **THREE SHIPPED AS CODE, ONE
  UNCONFIRMED (the corruption — his to verify).** *(Framing corrected TWICE in the open: the first
  version said "shipped, three of four", counting a process promise as a working fix — CEO Review 56
  was right to call that out. The third item was then genuinely fixed with a mechanism later the
  same day, so the count is honest now for a different reason than it was first claimed.)*
  - **Mobile width**: root cause was `table{width:100%}` under the default `table-layout:auto` —
    a minimum, not a ceiling; a long unbroken token in a ruling's cell (a path, a command) stretched
    the whole page past the viewport. Fixed with `table-layout:fixed` plus `overflow-wrap:anywhere`
    on the table cells and on `.sheet` itself, so a future long string in any card can't reopen this.
  - **Headline, not a paragraph**: added `shortNote()` in `glass.mjs`, capping the displayed pulse
    note to its first sentence or two (~200 chars) regardless of how long a session's `--note` is.
  - **False red while actually working — NOT FIXED IN CODE, and it should not be filed as done.**
    CEO Review 56: *"Wyatt asked to fix the way you report status, and what shipped is a habit, not
    a mechanism."* What follows is the honest reason, not a defence: the dot is correct given what
    it can see — it counts
    minutes since the LAST PUBLISH, and this session had been pulsing HEARTBEAT locally every 15
    minutes (via a background Monitor) without republishing the artifact at the same cadence, so
    the live page's clock was ticking from a stale snapshot even though the worker was genuinely
    alive. This is not fixable from inside the static page — there's no live channel for it to poll.
    Fixed by republishing NOW, and going forward this session will republish on every Monitor
    heartbeat (~15 min) during long waits, not only at item boundaries, keeping the published
    snapshot comfortably inside the 45-minute/watchdog-tied threshold. The 45-minute threshold
    itself is unchanged — it's tied to the watchdog's own restart contract (see the page's own meta
    line), so loosening it would misrepresent that, not fix this.
    **✅ NOW FIXED WITH A MECHANISM — 2026-09-01 03:45Z.** The chain audit's fix 1 supplied the
    missing signal (`LONG-RUN`, written by the job itself), and the Glass now reads it: the live
    page shows **"⚙️ sea trial, 10 legs — 5/10 legs, still running"** instead of a red dot, because
    the job says what it is doing rather than the page guessing from a clock. Rendered and
    screenshotted at 375px before shipping (rule 19). **It cannot become a new lie:** a missing,
    malformed, future-dated or expired marker falls back to the ordinary clock, so nothing can hold
    the light green — that would be the 2026-08-31 timer heartbeat rebuilt on the page. Gate
    `scripts/qa/glass_longrun_status_check.mjs`, 6 checks, red first, including both
    cannot-hold-it-green cases. npm test 77/77.
  - **Idea-submit corruption — attempt 3, see the entry above.** Same underlying bug as the
    2026-08-31 report; folded into that entry rather than duplicated here.
- **"testing"** (written on the Glass, 2026-09-01 03:14:37Z, minutes after the reload-free rewrite
      ⟨`T-070`⟩
  shipped) → **HARVESTED, and it carries real evidence about the corruption bug.** The idea reached
  `glassState.ideas` intact and the page saved a clean new version — so the SAVE path works on the
  no-reload design. What that cannot tell us is what he SAW: the reported fault was always a
  rendering one (his own View Source showed the stored HTML was clean), so only he can say whether
  the page still garbled. **Left open in BLOCKED ON WYATT for exactly that reason** — the third
  attempt is unconfirmed, not confirmed, until he says so.
- **"Test to send to the chart"** (written on the Glass, 18:27:43Z) → **SHIPPED, and this IS the
      ⟨`T-071`⟩
  fate.** Read literally: the two-way save it exercises is exactly what it tested — the idea
  reached `glassState.ideas` on the live artifact and this harvest is that path completing end to
  end for the first time since Glass v2 shipped. No further action; the mechanism it was testing
  now has its first real proof.

- **⚑ Wyatt, written on the Glass, 2026-09-02T04:36:18.685Z, PROPOSAL TO REDESIGN THE SEA
      ⟨`T-072`⟩
  TRIAL**: *"Redesign Sea Trial to take less time: I can play a full game in 15 minutes. we
  probably don't need to test every browser size of every game for every sea trial; we need to
  test one game (eg solo) in every browser size (phone, tablet, desktop); and we need to test
  every game mode in one browser size, eg tablet (solo, pass & play, crew). That's actually 5
  legs, not 12, and it will ensure that most changes are functional in most situations. Only for
  the big UI changes do we need a FULL sea trial with 3 modes * 3 sizes. And the sea trial should
  be intelligently deployed in scope depending on the change made -- If the change only affects
  pass&play (eg the handoff screen) then that is the only one that needs to be tested. make sure
  my thinking is correct here. show CEO. and create a new sea trial protocol that will be quicker,
  more efficient, and equally effective"* → **NOT INVESTIGATED — this is a Glass-harvest-only
  session, no product or QA-process work done here.** He's asking two things: (1) sanity-check his
  own proposal to cut the standard sea trial from 3 modes × 3 sizes (9 legs, or up to 12 per the
  QA-PROCESS doc) down to a 5-leg matrix (one mode across all three sizes, all three modes at one
  size) with the full 9-leg version reserved for big UI changes, scoped by what the change actually
  touches; (2) if the reasoning holds, build that as the new default protocol, and show it to CEO
  per his standing instruction before it's presented back to him. Needs a session that can actually
  read `docs/QA-PROCESS.md` and `scripts/sea_trial.mjs`'s current leg matrix, reason about whether
  a 5-leg reduced trial would still have caught the real regressions this project has shipped and
  later found (host/guest divergences, viewport-specific layout breaks), and scope the change
  before touching the trial script itself. → **SCHEDULED, next session that owns QA-process work.**

## FATES DECIDED

- **"The Glass becomes our two-way interface"** (Wyatt, 2026-08-31) → **SCHEDULED**: Glass v2
  today after the Razer hour; wyclau source homes in claude-kit now. GitHub Pages was considered
  and set aside for the private interface (public by nature, no write path without glue) —
  **reconsider at launch** as a public, player-facing status page for the game.
