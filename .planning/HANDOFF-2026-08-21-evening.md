# Handoff — 2026-08-21 evening (Wyatt stepped away; this is where to pick up)

**Read first:** `.claude/CLAUDE.md`, then `docs/HARD-WON-LESSONS.md` §8, then this file.
**Supersedes** `HANDOFF-2026-08-21-afternoon.md` — that file's "next action is Group E (02.2-07)" is
**stale**. Group E is still real and still unstarted, but four things happened after it was written
and they change what to do first.

**Live build:** `PP4_STAMP` **`2026-08-20y`** (`76cbdbe`). Everything below is pushed; `main` and
`origin/main` were both zero-ahead/zero-behind at handoff time.

---

## THE ONE-LINE STATE

The desktop layout was rebuilt twice today after Wyatt found it broken twice; his three desktop
design notes shipped; and **the piecemeal per-bug gates were replaced by one general playtest gate**
on his instruction. That gate is working and is now finding real bugs on its own. **Two of those
bugs are diagnosed and one is fixed; the other is fixed-but-unverified.**

---

## WHAT WYATT ASKED FOR TODAY, AND WHERE EACH ASK STANDS

| His ask | State |
|---|---|
| "the desktop mode looks terrible and was terribly QA'd" | **Fixed**, builds `v`→`w`. Board is a full-height square, captains column beside it, names complete. |
| "look at this screenshot" (empty tower, clipped names, Arrgh at top) | **Fixed**, build `w`. |
| "are your gates well architected or patchy?" → write ONE simple gate that plays whole games in all modes | **Built and working** — `4/scripts/playtest_gate.mjs`. See below. |
| "play them FULLY. click all the buttons; make sure everything works" | **Built** — coverage-first play + every click must produce an effect. |
| Vision judge / crew to true end as `test1`+`test2` (his picks) | **Built**; vision judge proven, crew leg **not yet run**. |
| Design note 1: captains box wider, crates on one line | **Shipped**, build `x`. |
| Design note 2: wind forecast into the header row where there's space | **Shipped**, build `x`. |
| Design note 3: background is gruesome → blue scattered radial gradient matching the board | **Shipped**, build `x`. |
| His afternoon item 5: wind pill from frame one with a `?` placeholder | **Shipped**, build `x`. |

---

## THE GATE — read this before writing any new check

**`4/scripts/playtest_gate.mjs`** + `lib/player.mjs`, `lib/checks.mjs`, `lib/vision.mjs`, `lib/cdp.mjs`.
Recorded as **D-37** in `02.2-CONTEXT.md`. Wyatt's exact complaint was that the old gate grew one
bespoke assertion per bug he found — *"exactly the kind of poor planning that landed us here in the
first place."*

**THE RULE THAT MATTERS: never add a per-bug assertion again.** A new failure class becomes either
a UNIVERSAL rule in `checks.mjs` (phrased over roles: things you click, things you read, containers)
or a line in the vision rubric. Nothing in these files may name a specific screen or bug.

- Run it: `node 4/scripts/playtest_gate.mjs --out=DIR` (add `--legs=solo-desktop` / `--judge=off`
  to narrow). Legs: `solo-desktop, solo-phone, passplay-phone, crew-desktop`.
- The vision judge shells out to `claude -p` — uses existing auth, no API key, works in the cloud.
  **Proven before being trusted:** on the broken build-v opening it returned FAIL @0.95 naming both
  the empty tower and the name/coin overlap unprompted; PASS on the fixed build.
- `4/scripts/stage_layout_check.mjs` stays as the fast pre-commit smoke (5 sizes × 3 moments, ~3 min).
  The playtest gate is the pre-drop bar.

**Four driver defects were found and fixed by running it against the real game** (all in
`a35d12e`): `appState` is not a window global so it reported DAY 0 forever; click locators used
truncated labels and matched nothing; two-step confirm controls (the recipe card) read as dead
buttons; and a `display:none` lobby button was flagged as unreachable. If the gate ever seems to
"not play", suspect this class first.

---

## WHAT THE GATE FOUND — pick up here

### 1. Side-bet circles piled under the ribbon — **FIXED, VERIFICATION UNFINISHED**
Found twice in one voyage by the playtest gate, and `stage_layout_check` **stalled** on it at
1920×1080 (a side bet you can neither answer nor dismiss — game-stopping). Cause was an ordering
bug: circles were separated and *then* clamped into the safe band, so the clamp squashed them back
together. Now clamp → separate → re-clamp, with a row fallback. Build `y`, commit `76cbdbe`.
**A verification voyage was running when the session ended; its result was never recorded.**
**Next session: re-run `node 4/scripts/playtest_gate.mjs --legs=solo-desktop --judge=off --out=DIR`
and confirm zero `no-pile` findings.** Do not mark this verified without that.

### 2. The trade slider is covered by the ribbon — **DIAGNOSED, NOT FIXED**
`STRUCT FAIL not-occluded: clickable covered by something else: apSlider <- covered by #pp4Ribbon`
— and 6+ `DEAD CONTROL: slider click did not move its readout` across a voyage. **The slider is
placed under the header ribbon, so a click lands on the ribbon and the counter-offer slider cannot
be moved at all.** Same family as the side-bet bug: placement not clamped to the top band.
Look at `stage.js`'s radial branch — `slw.style.top = stackTop + "px"` has no `tSafe` floor, unlike
its neighbours. **This is the highest-value open bug: it is a control a player literally cannot use.**

### 3. Prompt buttons drawn over the message that explains them — **RULE ADDED, BUG NOT FIXED**
Seen in the gate's own day-7 screenshot: on a trade response the answer buttons sit on top of
"Crustbeard wants 5…/Take it or…?". Universal rule 6 (`no-cover-text`) now catches it (`23d5177`).
The underlying placement bug is still open.

### 4. Trade question and its answers stranded apart — **OBSERVED ONCE, NOT MEASURED**
Day-9 screenshot: the question card sits mid-right while its two answer circles are ~250px away at
the top edge, and the "Dough Hook" label overflows its circle. Rule 6 territory. **Not measured —
do not report as confirmed until it is** (rule 6 of CLAUDE.md).

---

## STILL NOT DONE

- **The other three gate legs have never been run**: `solo-phone`, `passplay-phone`, `crew-desktop`.
  The crew leg is the risky one (Firebase, two browsers, plays to the true end as `test1`/`test2`).
- **The vision judge has never run inside a full gate pass** (every run so far used `--judge=off` to
  debug the driver mechanics first). It is proven standalone; it is not proven in the pipeline.
- **Group E (`02.2-07-PLAN.md`)** — Wyatt's afternoon list + the narration flicker fix +
  storm/black-market + recipe card D-35. Planner wrote it, plan-checker passed it, nothing executed.
  Its item 5 (wind pill from frame one) shipped today; the rest stands.
- **Cloud-runnable step 6** — `docs/GIT-AND-DEPLOY.md` §7's proof checklist can only be run from
  inside a cloud session. Until it passes, the laptop stays the QA machine.

## UPDATE, LATE EVENING — the gate is built, run, and green enough to trust; the PHONE is next

**Live build: `PP4_STAMP` `2026-08-21g`.** Everything below is pushed.

### The gate now does what Wyatt specified, end to end
`node 4/scripts/playtest_gate.mjs --out=DIR` played a COMPLETE voyage in every mode:
solo-desktop (day 17), solo-phone (day 15), passplay-phone (day 14) and **crew-desktop, host
AND guest both to day 15** as `test1`/`test2` in a real Firebase room. Evidence, including the
four contact sheets and every judge finding in its own words:
`phases/02.2-…/playtest-2026-08-21/`. **Open the contact sheets before anything else.**

### THE HEADLINE FINDING: desktop landed, the phone is the next body of work
53 vision-judge failures, and the distribution is the whole story — **solo-phone 19 and
passplay-phone 21 against desktop 5 and crew 4.** By theme: 33 clipped at a screen edge, 21
overlapping or obscured, 8 empty dead space. The phone has the same class of faults desktop had
yesterday morning, and nobody has yet done for it what today did for desktop. **That is the next
job, and it is unusually well evidenced.**

### Bugs found by the gate and FIXED today (each verified by a later clean run)
1. The board band ended at the captains card's top even when the card sits BESIDE the board —
   one wrong reading in three places. It inverted the prompt band (yMin 85, yMax −29), which is
   why side-bet circles piled under the ribbon and a driver STALLED on them. `capBandBottom()`.
2. The trade slider was placed only inside `if (message exists)` and so was never positioned on
   prompts without one — rendering under the ribbon, unusable, for six straight voyages.
3. The radial memo could skip placing a prompt's buttons ENTIRELY: two similar prompts in a row
   share a cache key, and the second prompt's brand-new buttons never got positioned.
4. Narration bubbles covered sail squares (D-38's one exception).
5. The cornered fan laid 8 buttons in one row and clamped them into a 308px band, piling them.
6. The ask pill and helper line ran off the right edge instead of wrapping.

### TWO THINGS THAT WERE THE INSTRUMENT, NOT THE GAME — and both nearly reached Wyatt
- **A "game-stopping stall at day 15."** Event stream frozen, clean console, plausible culprit in
  the last events. It was `document.hidden`: the game correctly paused itself and
  `waitWhilePaused()` correctly waited forever. Closed with `Emulation.setFocusEmulationEnabled`.
  Written up in `docs/HARD-WON-LESSONS.md`.
- **A "buttons overlapping" alarm that survived three fixes.** The buttons are 66px CIRCLES 73.5px
  apart — visibly not touching — and the rule compared bounding boxes. The gate's overlap test is
  now shape-aware. Three real fixes went in chasing an alarm that, in that instance, was false.
- **And one regression of my own:** the inline ask-pill cap (`vwPx()-20`) was LOOSER than the
  stylesheet's existing `max-width:88%` and, being inline, won — so a fix for clipping slightly
  widened the box. It now takes the tighter of the two.

### Still open
- **The phone layout pass** (above) — the big one.
- 4 structural failures remain across the four legs: one `no-cover-ask`, one `no-pile`, one
  `not-occluded`, one `sail-clickable`. Each names its screenshot in the gate log.
- The empty dead space below the captains card **on phone**, flagged 8 times by the judge. It is
  a real look, but changing it is a phone layout change and D-18/D-31 promised the phone stays
  untouched — **Wyatt's call, not a session's.**
- Group E (`02.2-07-PLAN.md`) — untouched. Its item 5 (wind pill from frame one) shipped today.

## SUGGESTED ORDER

1. **Open `playtest-2026-08-21/contact-solo-phone.png` and `contact-passplay-phone.png`.** Read
   them the way Wyatt reads a screenshot. The next job is written on them.
2. Do for the phone what 2026-08-21 did for desktop: one pass over clipping at the right edge,
   overlapping prompts, and the empty band under the captains card. 40 of 53 findings live there.
3. Re-run `node 4/scripts/playtest_gate.mjs --out=DIR` after each drop — it is ~45 minutes
   unattended for all four modes and it keeps its own evidence.
4. Then Group E.

## STANDING RULINGS THAT BIND THE NEXT SESSION

D-37 (the gate architecture — no per-bug assertions) · crew QA uses `test1`/`test2` ·
browsers headless + muted + never announced · scope every `pkill` to your own port ·
whole-game QA bar · D-31 desktop picks · D-30 economy philosophy · his notes are the design contract.
