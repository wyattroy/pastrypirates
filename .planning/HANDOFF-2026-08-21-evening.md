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

## SUGGESTED ORDER

1. Re-run the solo-desktop gate leg to close out the side-bet verification (~20 min, unattended).
2. Fix the slider-under-the-ribbon bug (#2) — a player-blocking control, and already diagnosed.
3. Run the remaining three legs, with `--judge=on`, and read the contact sheets.
4. Then Group E.

## STANDING RULINGS THAT BIND THE NEXT SESSION

D-37 (the gate architecture — no per-bug assertions) · crew QA uses `test1`/`test2` ·
browsers headless + muted + never announced · scope every `pkill` to your own port ·
whole-game QA bar · D-31 desktop picks · D-30 economy philosophy · his notes are the design contract.
