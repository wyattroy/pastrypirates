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


> ### 🛑 STANDING GUARD — NOT WORK, NOT A ROW. Read before shrinking ANY picture.
>
> *Left here 2026-09-03 by watch a7 on CEO 143, replacing the `T-088` work row above. It is a
> blockquote and not a `- [ ]` row deliberately: it must never rank, and it must never be "done".*
>
> **He ruled the image work FINISHED — twice.** Question UI 2026-09-02T12:24:03Z, and again on the
> Glass at 16:10:03.916Z (`T-089`): *"It's finished -- push it to sea trial."* **Do not re-ask him.**
> A third question on the same subject at launch is itself the failure.
>
> **AND THE NUMBER HE RULED ON COVERED THREE QUARTERS OF HIS ART. Both are true, and the next
> reader is owed both.** The "about 2%" he was shown is `~0.09 MB across 12 files` out of 3.89 MB,
> computed over the part of the library the probe reached. `.planning/ASSET-DISPLAY-SIZES.md`
> excludes, in its own bold text: **74 files / 1.05 MB `NOT SEEN`** — ~27% of the library by weight,
> never measured — and **13 files / 0.20 MB whose only sighting was OFF the game**. The figure is
> honest and **narrower than the sentence he read**. The ceiling case for the unmeasured bucket
> (halving *everything* in it) is ~0.6 MB against 3.89 MB remaining, from **17.79 MB started** — so
> it is not launch-critical under any reading, which is why this is a guard and not a job.
>
> **⛔ NOBODY MAY SHRINK ONE OF THOSE 74 FILES WITHOUT MEASURING IT FIRST.** `NOT SEEN` means *"this
> probe never reached a screen that draws it"* — **never "unused"**. The probe reaches five surfaces
> and never draws the badge family, the battle icons, or the ingredient `holes/`.
>
> **This is not theoretical — it nearly destroyed the flippenator coin.**
> `assets/icons/flip-heads.png` ranked **x7.07**, top of the candidate list, sorted by how attractive
> it looked — purely because the About page draws it as an 18px inline icon. Its real slot is the
> flip ceremony, which the probe does not reach. Cutting it to 54px on that evidence would have
> wrecked it, and it was first in line.
>
> **And the ratios that ARE printed can be FLOORS, not values.** The probe applies the camera's zoom
> ceiling to `svg image` only, so an HTML `<img>` inside `CAM_HTML_LAYERS` (`src/ui/stage.js:476`) is
> measured at whatever zoom happened to be on. `trade-swirl` and `wind-arrow` are both in `rimHost`
> (`src/ui/board.js:243-250`) — 2 of the 12 candidates. Open since CEO 83.
>
> *This guard belongs in `.claude/memory/DECISIONS.md` beside "THE IMAGE-WEIGHT ASK IS CLOSED", and
> it is here instead because an unattended watch on this machine is fenced out of that file — the
> edit was attempted and refused. **A session that can write there should move it.***

- [ ] Your ruling: do you want `SCHEDULED` to stop hiding your ideas? **He answered; not yet built.**
      ⟨`T-139`⟩
      Measured with the page's own logic when it was put to him: **13 of his 15 ideas were hidden
      from the Glass, 9 of them by the word `SCHEDULED`**, which the code treated as identical to
      SHIPPED and CLOSED — against the Charter's own words, *"Every idea gets a visible fate
      (shipped / scheduled / parked-with-a-reason)"*. A fate is supposed to be VISIBLE; `SCHEDULED`
      was being used to make one disappear.
      ⚠ **Same triage and same reason as the row above** — lifted out of `## RULED` before the card
      that was its only surface is deleted.
      **Sizing: SMALL — one fate word, in the filter that decides what he sees.**
- [ ] Your ruling: your player-count console — where should it live? **He answered; nobody built it, and it is on no surface but a card that is being deleted.**
      ⟨`T-138`⟩
      His ask: *"a firebase admin console so I can see how many people are playing"*. **Measured
      before it was put to him, and still true: this game has NO stats or admin page at all** —
      `stats.html` and `lab.html` do not exist at the repo root.
      ⚠ **TRIAGED OUT OF `## RULED` 2026-09-03T07:1xZ FOR ONE REASON: THE CARD THAT CARRIED IT IS
      BEING REMOVED.** Wyatt, 2026-09-02T13:18Z: *"Remove the 'Your rulings in hand' box from the
      Glass."* Watch c1 is doing that and **checked first whether it would blind the detector** — it
      does not — **but four rulings sat in `## RULED` with empty `now` cells and that card was their
      only surface.** Removing it would have dropped all four off the page he reads, silently, with
      every gate still green. Its own finding, handed over rather than shipped past.
      **THE REUSABLE ONE: A SURFACE BEING RETIRED IS A MOMENT TO ASK WHAT ONLY LIVED THERE.**
      **Sizing: unscoped — he answered WHERE, nobody has scoped WHAT.**
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

  ### ✅ THE SEPARATE LEAD IS ANSWERED AND FIXED — it was NOT a generic rule reminder
  Watch 2026-09-03T05:59Z, **CEO 148 (PARTIAL — this half YES)**, commit `39575082`, stamp
  `2026.09.03.1`. **The flip ceremony called EVERY downwind battle a crosswind.** `src/ui/stage.js`
  looked for the captain in `dwTag.parentElement` — that is `.btl-wind`, a div holding the badge and
  nothing else — so the lookup returned null every time and fell through to the crosswind sentence.
  `renderBattle` now stamps `.btl-col.dw` from the same `dw` that writes the badge and the ceremony
  reads that, so the two cannot disagree (rule 23). Red→green gate
  `scripts/qa/flip_ceremony_names_the_wind_check.mjs` (`--before` reproduces the pre-fix DOM and
  must go RED); pair in `.planning/posed/flip-ceremony-wind-chrome-{before,after}.png`.
  ⚠ **A CORRECTION THE WATCH OWES IN THE OPEN.** Its commit says the approved copy
  `@copy misc.ceremony.windstakes` *"has never once been shown to a player"*. **False, and CEO 148
  found it.** The ceremony shipped working in `b07a7d2b` (2026-08-13) with the pill still inside the
  column; `a1913666` (2026-08-15, "one wind pill for both captains" — Wyatt's own playtest-23 item)
  moved it out to `.btl-wind` and broke the lookup silently. **A dated 19-day regression with a named
  commit, which is more useful than the tidier sentence.** Third verdict running on this branch to
  find a sentence tidier than the record.

  ### ⛔ THE HEADLINE HALF IS **NOT** SETTLED — AND THE WATCH'S FIRST ANSWER WAS WRONG
  It reported *"NOT CLIPPED, both engines — explanation B is dead."* **Withdraw that.** CEO 148:
  the pose was on the wrong stage. A battle card is placed `.centered`
  (`src/ui/stage.js:3721-3722`), but the probe posed straight after the opening ceremony, which
  leaves `#actionPanel`'s `dataset.pp4Stage` set, so it landed in **`pp4Center`** — and
  `index.html:2277-2278` DROPS the clip box there (`overflow:visible`, row `max-content !important`).
  Every clip reading came back zero **because of the stylesheet, not because of the card.**
  `.centered` keeps `index.html:467` (a pinned px row on a 180ms transition) and `:473`
  (`overflow:hidden`) — **the exact mechanism explanation B names. It is still live.**
  **THE INSTRUMENT IS ALREADY FIXED AND THE RUN IS ONE COMMAND.**
  `scripts/qa/t012_downwind_card_pose.mjs` now clears `pp4Stage` before posing AND refuses to report
  at all unless the card is on `centered` — so it can never again answer about the wrong screen:
  ```
  node scripts/qa/t012_downwind_card_pose.mjs          # and --wk
  ```
  **DELIBERATELY NOT RUN BY THAT WATCH: a sea trial was sailing** (`2026-09-03T0624Z-Wy-Blade`,
  pid 29700) and this project's settle window is already marginal at 2.7s against 2.6s. Run it once
  the trial is down.
  **AND THE LIVE LEAD IS ALREADY NAMED, from the watch's own prediction file** — `src/ui/panel.js:395-406`
  records a receipted case where a late-decoding inline `<img>` makes the panel measure one line
  short and `#apGridInner` then clips the line, *"which is exactly why it reproduces only
  sometimes"*. This sentence carries exactly such an image (the coin, via `emojify()`,
  `src/shared/index.js:184`). **That mechanism only exists in `.centered`.** Check it there first.
  ⚠ **AND EXPLANATION A AS WRITTEN IS SEPARATELY UNSUPPORTED:** the typewriter never touches this
  card — `src/ui/panel.js:454` types `.apMsg`, and `:375` says in its own words that a battle card
  has none. So "a progressive reveal caught early" cannot mean the typewriter.
- [ ] **AND THE OTHER HALF OF THAT MEASUREMENT, WHICH IS HIS QUESTION AND IS STILL OPEN: a call
      ⟨`T-013`⟩
  circle is often nearest the WRONG captain, and the two instruments disagree about how often.**
  Found by CEO 84, which pointed out the answer was already sitting unread in the probe's own data.

  ✅ **SETTLED 2026-09-03 by watch a9 — `w54` IS TELLING THE TRUTH. THE DEFECT IS LIVE.** Evidence:
  `.planning/T013-RUNS-20260903.md` (four runs, transcribed in full),
  `.planning/PREDICTION-20260903T0525Z-T013-which-instrument.md`, CEO 146, and the photograph
  `mp-rig-shots/w54-t013-phone-20-50.png` — **both call circles floating in open water in the middle
  of the board, one parked on a sugar-cube island, roughly 400px below the only boats on screen.**

  > ### ⚠ THE FOUR LINES THAT WERE HERE TOLD THE NEXT READER THE OPPOSITE, AND THEY WERE WRONG
  >
  > They said `w52` *"reports 11 of 12 circles nearest their own boat at an 11px gap"* and **"DO NOT
  > read that as a live 15-in-21 defect"**, and explained the gap away as `w54` stranding a third
  > hull. **`w52`'s number is true and it is true about the wrong board.** It never moves a boat, so
  > all four hulls stay bunched within ~140px, the anchored placement always succeeds, and it
  > measures a board on which this fault cannot occur. Re-run this watch it scored **0 of 12**.
  > *(CEO 146 required this correction be written in the open rather than reworded: a row that
  > waves the next watch off a real defect costs more than one that merely omits it.)*

  **AND THE FAULT IS NOT "THE WRONG BOAT" — THAT IS THE SYMPTOM.** Split by how far each circle sits
  from the captain it names, across two independent 42-circle runs: **28 circles landed within 16px
  of their own hull and NOT ONE of them named the wrong captain.** The other 56 landed 49–274px away
  — half a phone screen — and 37 of those named somebody else, which is about what chance gives you
  among four hulls. **No circle in either run ever landed between 13px and 49px.** The placement is
  not drifting; it is switching. It either anchors to the boat it names or throws the circle
  somewhere else entirely, and then "wrong boat" is luck.

  **TWO MECHANISMS, ONE MEASURED DEAD.** *Mid-glide is dead* — the ships had stopped in all 21 poses
  and the count is identical measured early and late (22→22, then 15→15). *Nothing to be beside* is
  real: 9–17 of 42 circles name a captain whose hull is off the screen entirely, and
  `src/ui/stage.js:2864-2869` builds that anchor as `boatUXY(seat)` → `toScreen(…)` with
  `anchors.every(Boolean)` **true for a point nobody can see**. But ~8 of 33 answerable rows have
  the named hull plainly on screen and are still wrong, so that is not the whole of it.

  **WHAT IS STILL OPEN IS THE FIX, and it is FULL gear** (`src/ui/stage.js`, the radial placement) so
  it needs a sea trial. `src/ui/stage.js`'s last-resort branch lets a circle land on a hull when that
  is the only way off the question and never checks WHOSE. **The next watch has a RED check waiting
  and does not need to re-argue any of this:** `node scripts/qa/t013_which_instrument.mjs` prints
  ANCHORED vs STRANDED, and the job is to move circles out of the stranded column.
  ⚠ **And CEO 146's caution, which the fix must not flatten:** a circle *stranded away from every
  boat* and a circle *sitting on the wrong boat* are both inside what Wyatt reported, and they may
  not be the same bug. Do not assume one change cures both — measure both columns.
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
- [ ] **THE PUBLIC ABOUT PAGE TEACHES AN ACTION THE GAME DOES NOT HAVE, AND TWO OTHER THINGS THAT
      ⟨`T-114`⟩
      ARE WRONG. Found 2026-09-02 6:30 PM ET while doing the homework for his rules-page split;
      NOT fixed, deliberately — which of these sentences survives depends on the split he approves
      (`BLOCKED ON WYATT`, rules page 1-4). Sizing: SMALL, `about.html` only, no `src/`.**
      **WHAT A STRANGER ARRIVING FROM GOOGLE READS.** `about.html:187` offers **fish** as one of
      the four turn actions. **There is no fish** — the four are Dock, Attack, Trade, Muse
      (`src/ui/flow.js:2310, 2318, 2322, 2416`), and fishing was deleted outright rather than
      disabled (`src/ui/flow.js:301`, *"v2 rule 3: fishing is gone entirely"*). `about.html:184`
      says the dock flip wins you a **crate**; the flip pays **coins**, and buying a crate is a
      separate step at a price that rises as the island empties. `about.html:176` and `:198` say
      **"first baker home wins"** with the bake-off as a **tiebreak**; the bake-off is live
      (`BAKEOFF_ENABLED = true`, `src/shared/index.js:466`) and it is how **every** captain wins —
      two on the same day bake **together**.
      **AND A FOURTH, FOUND BY CEO 124 AND NOT BY THE WATCH THAT FILED THIS ROW.**
      `about.html:181-182` says the wind *"sets your sailing budget for the turn — cheap with it,
      dear against it"*, which tells a stranger that sailing costs something. `index.html:2833`:
      **"Sailing is free."** The wind caps the RANGE, it never charges.
      ⚠ **Whoever takes this: the in-game modal is RIGHT and About is wrong, not the other way
      round.** The full comparison and the reasoning are in
      [`SPEC-RULES-PAGE-SPLIT.md`](SPEC-RULES-PAGE-SPLIT.md).
      ⚠ **And do not trust the count.** It was three, then four the moment somebody else looked.
      **Nobody has ever checked this page against the game it describes**, so the honest scope is
      "re-read the whole section", not "fix four sentences".
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



### ⚑ FOR A WATCH — filed by the Advisor 2026-09-02, none of it this session's to build

- [ ] **Judge the 267 screenshots the release trial queued** — his ruling, question UI 2026-09-02:
      ⟨`T-003`⟩
      *"Judge the screenshots first"*, chosen over staging-in-parallel and over production. Trial
      `SEA-TRIAL-2026-09-01T1914Z-Wy-Blade` sailed 10/10 legs on `2026.09.01.7` with NOTHING in the
      not-run column, but its own report says **"THE JUDGE CANNOT SEE — every visual verdict below
      is worthless; the structural half still stands."** The screens are queued, marked NOT cleared.
      His reasoning: the untappable sail square that cost days was caught by looking, not structure.
      ⚠ STALE-CANDIDATE — stale-evidence (re-measure it on this build) — measured on build 2026.09.01.7; the tree is 2026.09.03.1, so its evidence no longer describes this game

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
      ⚠ STALE-CANDIDATE — stale-evidence (re-measure it on this build) — measured on build 2026.09.01.8; the tree is 2026.09.03.1, so its evidence no longer describes this game

- [ ] **THE RELEASE TRIAL'S EVIDENCE WAS RETIRED BY THE FIX, and that is a real number about the
      ⟨`T-016`⟩
  launch date.** CEO 84: the 88-minute trial that was ruling 12's whole cargo tested build
  `2026.09.01.7`; the fix above bumped it to `.8`, so **staging now needs another ~90-minute
  trial.** `npm test` is GREEN again (another session cleared the vendored-file failure), so the
  gate that blocked staging is open — the only thing missing is a trial of the code that would
  actually ship.
      ⚠ STALE-CANDIDATE — stale-evidence (re-measure it on this build) — measured on build 2026.09.01.7; the tree is 2026.09.03.1, so its evidence no longer describes this game

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
      ⚠ STALE-CANDIDATE — stale-evidence (re-measure it on this build) — measured on build 2026.09.01.7; the tree is 2026.09.03.1, so its evidence no longer describes this game
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
      ⚠ STALE-CANDIDATE — dead-pointer (correct the text (it points at something gone)) — warns readers off on account of pid 45256, which is not running; measured on build 2026.09.01.6; the tree is 2026.09.03.1, so its evidence no longer describes this game
- [ ] Your ruling: merge the 465-commit branch to `main` — **GATED: his own final say-so, and he has not played 2026.09.01.8 on staging yet.** The release trial has since landed clean (0137Z, 10 of 10, empty not-run column). Nothing for a watch to do but wait.
      ⟨`T-006`⟩
      ⚠ STALE-CANDIDATE — stale-evidence (re-measure it on this build) — measured on build 2026.09.01.8; the tree is 2026.09.03.1, so its evidence no longer describes this game
- [ ] **GATED: recurrence. One `<img>` reserved its box and did not paint, once, in one headless
      ⟨`T-078`⟩
  WebKit frame — mechanism unproven.** The residual of `T-005`, split off so a closed answer stops
  carrying an open question. What is proven is what it is NOT: not a font (the same card's bare 🏴
  was font-drawn in that frame), not a missing file (the same URL painted four times in the CAPTAINS
  panel of that frame), not an engine difference (the next run's same leg was clean). **Seen once.
  Chase it only if it is seen again**, and then with a posed board (`docs/DRIVING-THE-GAME.md` §5e),
  never a rate over a voyage — a single still cannot tell a mid-paint from a bug.
  Evidence and the numbers: [`T005-2026-09-02-THE-COIN-AND-THE-RIG.md`](T005-2026-09-02-THE-COIN-AND-THE-RIG.md).
- [ ] Your ruling: the cutover moment — **GATED: on the exit test verdict, which is his own stated condition.** Nothing for a watch to do.
      ⟨`T-007`⟩
- [ ] Your ruling: the Glass's Ideas box corrupting the page after a save — **GATED: awaiting his own look at the live page**, which only he can do.
      ⟨`T-137`⟩
      ⛔ **RESTORED A THIRD TIME, 2026-09-03T07:4xZ — AND THIS TIME THE CAUSE IS MEASURED, SO THE
      NEXT WATCH FIXES IT INSTEAD OF RESTORING IT A FOURTH.**
      First as `T-124`, then as `T-135`, then again here. Every archive entry reads `- [x]` and, for
      the first two, carries **no close pointer** — compare any real close, which reads
      `(closed · CEO nnn · …)`.
      **THE CAUSE IS NOT THE SWEEP. IT IS `close_item.mjs`'s ROW MATCHER, AND IT CLOSES THE WRONG
      ROW.** `close_item.mjs:114-137` splits the Chart into blocks running from one `- [ ]` to the
      NEXT one — and for the LAST open row in the file, `blockOf` runs to `lines.length`
      (`:118`), so **that row's "block" is the entire rest of the Chart**: BLOCKED ON WYATT, RULED,
      THE IDEA INBOX, everything. Any `--item=` string appearing anywhere below the last checkbox
      therefore matches that row and only that row. **This row has been the last `- [ ]` in the file
      each time.**
      **MEASURED, NOT INFERRED.** Watch c1 ran `close_item.mjs --item="T-087"` — an IDEA INBOX
      entry with no `- [ ]` row of its own, living ~300 lines below this one. The gate reported
      `CLOSED "T-087"` and wrote **CEO 152 and c1's own close reason onto THIS row**, ticked it, and
      swept it to `CHART-LOG.md`. The archive entry is still legible in `git diff` from that moment:
      a T-137 heading carrying a T-087 verdict. Reverted by hand before it was committed.
      ⚠ **SO THE TICK IS NOT EVIDENCE OF A JUDGEMENT, AND NEITHER IS THE CLOSE POINTER.** The third
      archive entry HAD a pointer, which is exactly what the first two were missing — and it was
      still the wrong row. **A close pointer proves a gate ran, not that it ran on this item.**
      ⚠ **WHAT MAKES THIS WORSE THAN A LOST ROW: the row's own text says it is gated on an action
      only Wyatt can perform.** The last open row in the Chart is, structurally, the one most likely
      to be a long-waiting GATED row — so this fault preferentially eats the things waiting on him,
      the one category a session can never finish.
      **THE FIX, SIZED: bound the last block at the next `## ` heading instead of at end-of-file
      (`close_item.mjs:118`), and make `--item` refuse rather than fall back when no row OWNS the
      handle** — c1's call named an item that has no Chart row at all, and the honest answer was
      "there is no such row", not a silent match on a neighbour. Red-proof: close a handle that
      exists only in the IDEA INBOX and assert the gate REFUSES.
      **NOT FIXED HERE, deliberately.** c1 held `glass.mjs` and `rulings_triage_check.mjs` this
      watch, a peer was live on the Chart, and a trial was at sea. **Sizing: SMALL — one bound and
      one refusal, plus the gate.** Whoever takes it inherits the measurement, not a theory.
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
     Diagnosis: SPEC-GLASS-CALM.md and SPEC-VISIBILITY-AND-INJECTION.md §2.

     ⚑ EVERY QUESTION ROW CARRIES ITS OWN ID, AND A GATE REQUIRES IT
     (scripts/qa/answered_question_retired_check.mjs, cases 3 and 6). It goes at the FRONT of the
     question cell, written as an HTML comment holding "qid:" and a short slug — so the row still
     starts with "|", and he never sees it on his page.

     ⚠ THE EXACT LITERAL IS NOT PRINTED HERE, AND THAT IS NOT LAZINESS: writing one HTML comment
     inside this one CLOSES THIS ONE at the nested comment's own terminator, and everything after it
     lands back in the section as prose — which is precisely what the arrow warning above is about,
     and it happened again while this paragraph was being written. Copy the form from a live row, or
     run `node scripts/wyclau/retire_answered.mjs --list`, which prints it.

     WHY. Until 2026-09-02 a question's identity was the first 40 characters of its own prose. Two
     sibling questions that open the same way collide onto ONE id — proven, not theorised:
       ⟨T-105⟩ Should the harvest retire the row immediately, or flag it for a watch?
       ⟨T-105⟩ Should the harvest retire the row only after a CEO has seen it?
     both slug to `t-105-should-the-harvest-retire-the-row`. HIS ANSWER TO ONE WOULD RETIRE THE
     OTHER, and the record would then show him answering a question he never saw. Editing a
     question's wording orphans the ruling he already made, for the same reason.

     ⚑ AND NOBODY DELETES A ROW FROM THIS TABLE BY HAND. When he answers, ONE command records the
     answer and removes the question together, so they cannot disagree:

         node scripts/wyclau/retire_answered.mjs --qid=<id> --verdict="<his words, verbatim>"

     Six times in twelve hours on 2026-09-02 a session harvested his answer and left the question
     asking; three of those were repaired by hand, which is not a fix. His words, 6:57 PM ET:
     "the page continues to re-show me thw e questions AFTER they're harvested. this is NOT fixed
     and it is a PRIORITY more than any of the SEO work." -->

| Question | Recommendation | since |
|---|---|---|
| <!--qid:t017-name-type-too-small--> ⟨`T-017`⟩ **The captain's name now fits inside the trade circle — but only by shrinking to about half size. Is that too small to read?** Your three screenshots of *Crustbeard* and *Flaky Jack* hanging out of their circles are fixed: the name is now inside the rim at phone, tablet and desktop. To get it in there beside the crate and the price, the type drops from 9.5px to 5.5px. Three pictures of the same board, before and after: `.planning/posed/t017-before.png`, `t017-after.png`, `t017-after-circle.png`. | **Take a look at the third picture and tell me if it is readable.** If it is not, the honest fix is a bigger circle rather than smaller words — the disc is 66px and it is being asked to hold a name, a crate and a price. A third option: move the name out to the sentence above and leave only the price in the circle. | 2026-09-03 |
| <!--qid:t017-fan-mixed-sizes--> ⟨`T-017`⟩ **Only the long labels shrank, so a fan can now mix two type sizes — "Walk away" stays big while the names go small. Do you want them all matched?** Consistency is one of your core values, so I have not chosen this myself. | **Match them — shrink every circle in a fan to whatever its longest label needs.** One gesture, one look. The cost is that a fan containing one long name makes *every* label in it small, including short ones that had room. Say the word and it is a few lines. | 2026-09-03 |
| <!--qid:t102-search-console--> ⟨`T-102`⟩ **Your own reminder, and it is the one step nobody here can take for you: resubmit `sitemap.xml` in Google Search Console.** The file was fixed on 2026-09-02 — dead tags gone, both dates now derived from git — but Google will not re-read it until the property owner asks. Your note warns yourself about the property picker: *"under the playpastrypirates.com property (not wyattroy.com — check the property picker, they look identical)."* | **Do it when you next have a laptop minute — it is a two-minute job.** This is a row rather than a note because a note gets read once and then it is gone; this stays on your page until you tell me it is done. Tap it away when you have. | 2026-09-03 |
| <!--qid:t102-working-files-indexable--> ⟨`T-102`⟩ **⚑ Google can index your working files right now, and your note assumed it could not.** You listed `art-review/`, `scripts/` and `.planning/` as "correctly EXCLUDED" — they are excluded from the sitemap, but **the sitemap is an invitation, not a fence.** Thirteen pages are live on the domain with nothing stopping a crawler: five `art-review/` galleries, seven `notes/sketches/` mockups, and `battle_sim.html` (plus nineteen files under `.planning/`). Only four pages in the whole repo say anything about crawling at all. | **Let me add four lines to `robots.txt` — `Disallow` for `/art-review/`, `/notes/`, `/scripts/`, `/.planning/`.** Same shape the file already uses for `lab.html` and `stats.html`. It is minutes, not a watch, and it is worth doing whatever you decide about the question below. Say yes and the next watch does it. | 2026-09-03 |
| <!--qid:t102-sitemap-coverage--> ⟨`T-102`⟩ **You asked me to recommend rather than build: should the sitemap's page list be generated from the actual pages?** You were right that it goes stale silently — nothing anywhere notices a page missing from `sitemap.xml`, and `/rules.html` would vanish from Google without a sound. The list is correct today (two pages, and they are exactly the two that declare themselves public), so this is about tomorrow. | **Don't generate it — make it go RED instead, once the fence above is closed.** Every page can say whether it is public, in its own tag and in `robots.txt`, so a check derives the answer with no list in it. The day a page lands unlisted, the tests fail and name it. **Generating the file instead needs a hand-kept list of what to leave OUT — the same problem moved somewhere you cannot see it — and it would write a file Google reads with nothing between it and a wrong guess.** Third option: leave it and remember, which is what just failed. Sizing: the fence is minutes, the check is one watch. | 2026-09-03 |

<!-- The four blocks of historical bookkeeping that used to sit here — which questions were ruled,
     when, and where each went — moved to CHART-LOG.md on 2026-09-02 under "BOOKKEEPING — questions
     that have left BLOCKED ON WYATT". Nothing was deleted. They are backward-looking, and his
     ruling is that the Chart shows only where we are going. -->

## RULED — his answers, waiting to be triaged

> ### ⚠ NOTHING RENDERS THIS SECTION ANY MORE. A ROW LEFT HERE IS A RULING HE CANNOT SEE.
>
> **Read this before adding a row. It changed on 2026-09-03 and the change inverts the old rule.**
>
> Wyatt, on the Glass 2026-09-02T13:18:28.755Z: *"Remove the "Your rulings in hand" box from the
> Glass"* (`T-087`, done by watch c1). **This section USED TO BE that card** — the Glass rendered
> every row of it under "Your rulings, in hand", which is why waiting here was safe: he could see
> a ruling sitting untriaged. **It is gone at his instruction, so this table is now session-facing
> only.** Four of his rulings were parked here the hour it was removed, and removing it would have
> dropped all four off the page he reads with every gate still green.
>
> His original ask, still the reason the lifecycle exists — 2026-09-01, INBOX-20260901T1310Z:
> *"The Glass's Your Rulings -- In Hand are stale; there must be a process that triages them and
> adds them to the Tasks list, then removes them from the Your Rulings list."*
>
> **THE PROCESS, three moves, done by the watch that harvests or acts on a ruling — and move 2 is
> no longer optional:**
>
> 1. **A freshly harvested ruling lands HERE** with the `now` cell EMPTY — untriaged, and an empty
>    cell is the honest way to say so. `scripts/wyclau/lib/retire.mjs` writes it.
> 2. **It gets a `- [ ] Your ruling: …` row in the STEP 1 CHECKLIST, ALWAYS** — that is what puts
>    it on the Glass's Tasks card, with no second list to keep in step. **This used to read "if
>    nothing is left to do, no task is needed"; that is now a build failure**, because with the
>    card gone the only alternative to a task row is invisibility. A ruling that turns out to owe
>    nothing goes straight to move 3. `retireQuestion()` writes this row in the same act as the
>    one above, so the harvest can no longer leave a ruling stranded.
> 3. **Move the whole row down to SETTLED RULINGS** in [`CHART-LOG.md`](CHART-LOG.md), verdict in
>    its `now` cell, and delete its task row. It leaves the waiting room and stays on the record.
>
> **Enforced, not remembered:** `scripts/qa/rulings_triage_check.mjs` — 8 cases — fails the build
> if a row here carries a verdict (it belongs in SETTLED), if a row here has no checklist row (it
> is on no surface he can see), or if a settled ruling with work outstanding has no checklist row.
> It also holds his removal in place: case 7 re-renders the real Glass and fails if the card comes
> back, and case 8 fails if the harvest tool and this rule ever drift apart. Every direction
> red-proofed.

*How many are waiting is the row count below — [not a number typed here](CHART-LOG.md), because a
hand-typed count is wrong the moment work continues (this paragraph said "three" while two were
waiting). `node scripts/qa/rulings_triage_check.mjs` prints the tally and names any row that is
stranded.*

| item | HIS RULING | now |
|---|---|---|
| <!--qid:admin-console-where--> **Your player-count console — where should it live?** You asked for *"a firebase admin console so I can see how many people are playing"*. **Measured first: the current game has NO stats or admin page at all** — `stats.html` and `lab.html` do not exist at the repo root; the only one in the repo is `classic/stats.html`, inside the frozen v1. So this is a new surface however it is built, and where it goes is yours. | put it at /stats.html behind a simple curtain and block it from robots.txt | |
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

**Harvested rulings, 2026-09-02, verbatim from the Glass (`glassState`, generatedAt
2026-09-02T22:37:19.175Z, second read at the same generatedAt after he kept answering mid-tick — all
five rules-page questions in the Your Call table above are now answered). NOT YET TRIAGED — this
session's mandate is harvest-and-publish only.**

- `rules-page-1-of-4-which-page-becomes-th` — **RULES PAGE 1 of 4 — which page becomes THE rules
      ⟨`T-115`⟩
  page? You asked for this split before anything gets built.** His answer (choice: note, at
  2026-09-02T22:50:08.719Z): *"Do a new /rules.html that explains the rules -- using the latest
  version of the game."*

- `rules-page-2-of-4-what-does-about-keep` — **RULES PAGE 2 of 4 — what does About keep?** His
      ⟨`T-116`⟩
  answer (choice: note, at 2026-09-02T22:50:37.757Z): *"Agree with your rec -- delete \"how it
  plays\""*

- `rules-page-3-of-4-does-the-in-game-moda` — **RULES PAGE 3 of 4 — does the in-game modal show the
      ⟨`T-117`⟩
  full rules, or a short version that links out?** His answer (choice: yes, at
  2026-09-02T22:51:10.628Z): *"Do your recommendation -- full text, modal stays the source."*

- `rules-page-4-of-4-does-the-rules-page-s` — **RULES PAGE 4 of 4 — does the rules page speak
      ⟨`T-118`⟩
  pirate, or in your own plain voice?** His answer (choice: note, at 2026-09-02T22:51:18.219Z):
  *"Pirate speak!"*

- `and-once-credits-has-its-own-page-does` — **And once Credits has its own page — does About keep
      ⟨`T-119`⟩
  its credits list?** His answer (choice: note, at 2026-09-02T22:51:58.611Z): *"Keep a short list on
  About and link out"*

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
      ⟨`T-108`⟩
  \"DO now\" button next to \"Send to the Chart\" button that tells RANK to put this task at the
  top"* → **SCHEDULED — built 2026-09-02T21:4xZ, commit `c8a475a6`, CEO 121; the row that carries
  it is `T-104` at the top of FOR A WATCH, open because one joint is still a session remembering a
  command.** Companion to the drag ask below; the two were filed one minute apart.

- **⚑ Wyatt, DO NOW, written on the Glass, 2026-09-02, 3:09 PM ET**: *"DO NOW: build a way for me
      ⟨`T-109`⟩
  to drag to reprioritize the chart, in The Glass."* → **SCHEDULED — the row that carries it is
  `T-103` at the top of FOR A WATCH.** He tagged this DO NOW himself.

  ⚑ **THE HANDLE LINES CAME OFF BOTH OF THESE, 2026-09-02T21:5xZ, AND THAT IS THE FIX AND NOT A
  TIDY-UP.** Each of these entries carried `⟨T-104⟩` / `⟨T-103⟩` while the real task rows carried
  the same handles — so **two open rows answered to each handle**, which is the fault the note above
  already names and the same shape that once made a live row answer to `T-078`, a handle that had
  closed hours earlier. **An idea and the task written from it are one job, and one job has one
  handle.** The task row keeps it; the harvest entry keeps his words and points. Three duplicate
  pairs remain (`T-088`, `T-008`, `T-079`) and they are somebody's row, not this watch's item.

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

  ⚠ **`T-098` IS NOW CLOSED (2026-09-03, CEO 142), SO THIS POINTER NO LONGER POINTS AT AN OPEN ROW —
  and CEO 142 found that, not the watch that closed it.** Its words: *"Ticking `T-098` leaves that
  note pointing at a closed box… if `T-098` closes and `T-102` stays buried and unranked, he never
  gets told."* **THIS ENTRY IS STILL UNFATED AND STILL RANKS NOWHERE**, and it carries two of his
  instructions that the sitemap fix did NOT satisfy:
  1. **THE SEARCH CONSOLE REMINDER — the one step only he can take.** *"Then remind me to resubmit
     sitemap.xml in Google Search Console under the playpastrypirates.com property (not
     wyattroy.com — check the property picker, they look identical)."* Carried into
     `.planning/wyclau/GLASS-NOTE.md` by watch a6 so it actually reaches him, but it belongs in a
     ranked row too, because a note gets consumed once and a row does not.
  2. **"RECOMMEND, DON'T JUST BUILD" — and it was built.** His words here: *"Consider whether this
     file should be generated by a script from the actual pages rather than hand-maintained…
     Recommend, don't just build; flag it as a small job and let me decide."* CEO 142, finding 3:
     `scripts/qa/sitemap_write.mjs:1-20` **is** that generator, shipped under `T-098` before this
     note was fated. Not `T-098`'s fault — but nobody has put the choice to him, and now nobody
     has a reason to look. **Whoever fates this row: the decision is still his to make, after the
     fact, and the honest question is whether to KEEP the generator, not whether to write one.**

  ✅ **FATED AND ANSWERED 2026-09-03, 06:5xZ, by watch b2, CEO 150 (PARTIAL). Point 2 is delivered
  as the recommendation he asked for; point 1 is now a standing question row instead of a note that
  gets consumed once.** Reasoning: [`SPEC-SITEMAP-COVERAGE.md`](SPEC-SITEMAP-COVERAGE.md); three
  rows now on his Your Call card (`qid:t102-search-console`, `qid:t102-working-files-indexable`,
  `qid:t102-sitemap-coverage`). Prediction written before the measurement:
  `PREDICTION-20260903T0655Z-T102.md`, all three clauses held. **Nothing was built** — his sentence
  is *"Recommend, don't just build."*
  **THE RISK HE NAMED IS REAL AND UNGUARDED, and that measurement stands:**
  `sitemap_lastmod_check.mjs:99-127` builds its list from the sitemap's own `<url>` blocks and loops
  only over those, so **a page that exists with no entry is invisible to it by construction**; the
  gate's own header states the assumption at `:22-24`. `/rules.html` (`T-100`) is the next page we
  ship.
  ⚑ **AND THE BIGGEST THING HERE IS CEO 150's, NOT THE WATCH'S: THIRTEEN WORKING-FILE PAGES ARE
  CRAWLABLE ON THE LIVE DOMAIN TODAY.** Five `art-review/`, seven `notes/sketches/`,
  `scripts/battle_sim.html` — none carries `noindex`, none is `Disallow`ed. Only **4** pages in this
  repo declare a `robots` tag at all (`index.html:16`, `about.html:14`, `classic/index.html:15`,
  `classic/stats.html:8`). **His note calls `art-review/`, `scripts/` and `.planning/` "correctly
  EXCLUDED" — they are excluded from the SITEMAP, which is an invitation and not a fence.** Filed as
  the first question row, four `robots.txt` lines, not built.
  ⚠ **A CORRECTION THE WATCH OWES: it wrote "13 tracked `.html` files in the repo" and that is
  false — 37, or 18 outside `.planning/`.** The 13 was a shell-filtered count reported as a fact
  about the repo, and the five `art-review/` pages it dropped were the ones the question was about.
  **The undercount hid a hole in the recommendation itself:** the coverage rule as first written
  would have demanded entries for 32 files and failed, so it did not clear the bar it uses to reject
  the generator. Both fixed in the spec; the sizing moved from "one watch" to "minutes for the fence,
  one watch for the check."

  ⚠ **AND A CORRECTION TO THE LINE DIRECTLY ABOVE, which I owe in the open.** *"The honest question
  is whether to KEEP the generator"* reads `sitemap_write.mjs` as the thing this sentence of his is
  about. **It is not.** That script derives the DATES from git, which is his *first* instruction on
  this subject and is not in question — *"DERIVE the dates, do not hand-type them."* It reads the
  page list out of the existing file and says so in its own comment (`:12-16`). **So there is no
  built generator to keep or discard here; the half he flagged — the page LIST going stale — was
  never built at all.** CEO 142's finding 3 stands (the choice was never put to him); the framing
  the fating watch wrote from it was one file off.

  ⚠ Also from CEO 142, finding 4, and it is his to know rather than ours to fix quietly: his note
  says *"Don't touch `scripts/deploy-preview.sh`"* — **that file does not exist in this repo.** The
  real one is `scripts/deploy-staging.sh` (which does carry the `sitemap.xml` exclude, verified).
  `.claude/CLAUDE.md` §3 still names the dead filename too, so he is holding a stale name that two
  documents keep confirming.

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
  **WORKED 2026-09-02 6:3xPM ET, CEO 124 (PARTIAL), commit `2b2ef256`, closed as
  `INBOX-20260902T190723Z`. THIS ROW STAYS OPEN ON PURPOSE: the questions are asked and the
  recommendation is written — the DECISION is his, and it is the five rows at the top of your Your
  Call card.** One tap each. Recommendation: a new `/rules.html` carrying the modal's text, with
  About's rules section deleted rather than corrected, so it stays two pages and not three.
  Reasoning and the four measured errors on the public About page:
  [`SPEC-RULES-PAGE-SPLIT.md`](SPEC-RULES-PAGE-SPLIT.md). **`T-100` (build the page) and `T-101`
  (the credits page) are blocked on question 1 by his own sentence.** This row closes when he
  answers, not before.

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
  harvest-and-publish only.** Reads as: stop spending watches on the image-resize tail and move
  straight to the sea trial instead.

  ⚠ **THIS LINE USED TO END "(the unmeasured third of the library included)" AND HE NEVER SAID
  THAT.** His words are eleven: *"It's finished -- push it to sea trial."* The parenthesis was a
  session's inference written unlabelled beside his verbatim quote — **the exact fault this project
  already paid a day for**, six days earlier and on this same subject: `.claude/memory/DECISIONS.md`
  lines 943-948, *"an exclusion written from a PARAPHRASE of what somebody wanted is invisible once
  it is in the code, because every later reader inherits the paraphrase and not the sentence."*
  Found by CEO 143, not by the watch that was about to close a row on it. Removed 2026-09-03T05:1xZ.
  **What the ruling DOES cover is decided below, in the open, on the numbers he was actually shown.**

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

- **Wyatt, written on the Glass, 2026-09-02, 5:45:07 PM ET**: *"Add google analytics to
      ⟨`T-110`⟩
  playpastrypirates.com and create a firebase admin console so I can see how many people are
  playing"* → **ALREADY HARVESTED AND SIZED, elsewhere, before this row existed — filed here only
  because step 2 of this runbook requires every live-page idea to land in THIS section verbatim, and
  it had not.** The full write-up (two jobs: a third-party script on the live site, and a new
  surface reading live multiplayer data) is `.planning/wyclau/INBOX.md`,
  `INBOX-20260902T214507Z`. **SCHEDULED — no further action from this session.**

- **Wyatt, written on the Glass, 2026-09-02, 5:43:55 PM ET, RULING on `T-105`**: *"Let the watch
      ⟨`T-128`⟩
      ⚠ **RENUMBERED `T-105` → `T-128`, 2026-09-02 10:10 PM ET, at his instruction to clean the Chart.** Two open rows carried `T-105`, so `chartkeeper.mjs:860` treated every mention of it as claiming NOTHING — a ruling naming it named two jobs and spoke for neither, and **his dragged order named it twice and could not say which row he had moved.** Handles are never reused; `T-105` still resolves in `CHART-LOG.md` and in git history.
  write them -- I allow edits to hooks and skills"* → **ALREADY HARVESTED**, `.claude/memory/DECISIONS.md`
  (commit `0472a129`), which also records that the question he answered carried an unverified
  premise (`.claude/` is not, in fact, entirely denied to a watch — `settings.json` allows bare
  Edit/Write there). No allowlist change was made or is needed; if a watch is still refused, that is
  a harness behaviour for unattended sessions, not this repo. Filed here for the same reason as the
  row above.

- **Wyatt, written on the Glass, 2026-09-02, 5:45:23 PM ET, RULING**: *"Done -- I wrote about
      ⟨`T-113`⟩
  adding google analytics and firebase"* → **ALREADY HARVESTED**, `.planning/wyclau/INBOX.md`,
  `INBOX-20260902T214523Z` — his half of the live conflict-test he ran himself on this page (Layer A
  of `T-105`, already confirmed REFUSED on a disposable artifact; his run is the live-page
  confirmation, and a session's own auto-mode classifier blocked a second, riskier attempt to repeat
  it — see `.planning/wyclau/INBOX.md`, entries dated 21:46–21:49). Filed here for the same reason
  as the two rows above.

## FATES DECIDED

- **"The Glass becomes our two-way interface"** (Wyatt, 2026-08-31) → **SCHEDULED**: Glass v2
  today after the Razer hour; wyclau source homes in claude-kit now. GitHub Pages was considered
  and set aside for the private interface (public by nature, no write path without glue) —
  **reconsider at launch** as a public, player-facing status page for the game.
