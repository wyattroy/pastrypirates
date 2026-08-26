# Handoff — 2026-08-26, evening

**Live build: `2026-08-26h`.** `main` level with `origin/main`. 37 commits today.
**Read §0 first. It is the reason everything else in this file exists.**

---

## 0. WHAT CHANGED TODAY, IN ONE PARAGRAPH

Wyatt playtested for two hours and filed **35 defects**. The overnight session shipped **22 fixes and
verified 4** — all solo, one screen size — chose its testing depth by feel, and wired none of its ten
check scripts into `npm test`. He then asked *"how would a real QA team do this?"*, and the day
became building one: **the sea trial** (rule 24) and **a CEO agent that reviews the work before he
sees it** (rule 25). Two CEO reviews have run. **Both found the process certifying things it had not
tested.** Both were right, and both are the reason this file is worth reading.

---

## 1. THE TWO NEW STANDING RULES

### Rule 24 — every change to the game goes through a SEA TRIAL

```bash
node 4/scripts/qa/gear.mjs      # how deep does THIS change go?
node 4/scripts/sea_trial.mjs    # run it; writes .planning/SEA-TRIAL.md
```

Contract: **`docs/QA-PROCESS.md`**. Four steps (show it broken → change → show it fixed → sweep) and
three gears (COSMETIC / PLUMBING / FULL) chosen **by the files you touched, never by feel**.
`.claude/hooks/qa-gear-first.cjs` stops the first edit to game code and states the gear.

**The middle gear is a different SUBJECT, not a smaller size.** Wyatt: *"Each mode should be
structurally different just about who the player is playing against, but the game itself should
remain consistent for every player in every mode."* An earlier draft had a gear meaning "behaviour
changed inside one mode" — **that presumes the fork it should prevent**, and he threw it out.

### Rule 25 — show the work to a CEO before showing it to him

Wyatt: *"after you've done your work, show it to CEO before you show it to me."* Template:
**`.claude/CEO-BRIEF.md`**. Fresh context every time; it gets his request **verbatim**, what was
actually done, and **the previous verdict**. Its question is narrow: **did the thing he asked for
happen?** — not "is this good work". **Its verdict reaches him in ITS words, especially when bad.**

---

## 2. WHAT THE TWO CEO REVIEWS FOUND — all verified before acting

**Review 1:** *"The unit shipped a process today and its very first output is a lie."*
- The gear picker read the **working tree** — so committing a fix (the mandated workflow) made it
  report "nothing to prove", sail zero legs and write PASSED. **Following the rules exactly was a
  complete bypass.** Fixed: falls back to `origin/main...HEAD`.
- `PASSED WITH GAPS` exited 0 → now `INCOMPLETE`, exits 1.
- `rec.finished = recA || recB` → **`&&`**. A host finishing while the guest sat stuck reported
  "finished". That is T-04's exact symptom passing the gate.
- **Crew-on-a-phone had no leg** — the square he actually playtested. Added.
- Highest-leverage gap: **no host-vs-guest comparison**. Built: `4/scripts/lib/seat_parity.mjs`.

**Review 2:** *"He asked for three things and got one and a half."*
- **The sweep command the process printed did not exist.** `qa/matrix.mjs` was deleted this morning
  (correctly, a duplicate) and referenced in **five** places. Fixed → `sea_trial.mjs`.
- **The report still said PASSED.** Code was fixed; the artifact never regenerated. Now fixed twice:
  the file states the truth, and a trial writes **IN PROGRESS before it sails**, so a killed run can
  never inherit the previous verdict.
- **Both comparator findings were FALSE.** Its `battle` field read `#pp4Prompt` — *the viewer's own
  prompt box*. Fields removed rather than patched.
- *"Writing rules about the process took the hour that running the drill would have taken."*

---

## 3. ⚠ THE THING TO DO FIRST — the drill cannot currently fail

`4/scripts/qa/seed_drill.mjs` puts last night's bugs back and asks whether the trial notices. It ran
and reported **T-12, T-16, T-30 CAUGHT**.

**DO NOT BELIEVE THAT — 4 of 4 is exactly what a broken drill would also print.** Each seed is bounded to `--max-min=4`, so **every leg ends "voyage
incomplete" whether the bug is there or not.** There is no control run. **The drill as it stands
cannot go green, so its red means nothing.**

```bash
# THE MISSING CONTROL — an UNSEEDED leg under the same 4-minute cap.
node 4/scripts/playtest_gate.mjs --legs=solo-phone --judge=off --max-min=4 --port=8970 --dbg=9970
```

- If the control **also fails** → the drill proves nothing. Give each seed a check that names the
  seeded symptom (does a stage element survive at port? does the Start button run `pp4Glow`?)
  rather than reading the leg's overall pass/fail.
- If the control **passes** → the three CAUGHTs are real and the drill is sound.

**This is the third check built today that could not fail** (the others: a narration probe measuring a
`display:none` panel, and the gear picker calling an empty diff "cosmetic"). The pattern is the
lesson: **a check that cannot see its subject must return the STRICT answer, and a check nobody has
watched go red is a check nobody should trust.**

---

## 4. REAL BUGS THE TRIAL FOUND — unfixed, and worth more than the process work

From the **crew-phone** leg — the first time that square has ever been tested. It completed a real
two-phone voyage to **END OF VOYAGE, day 21**, and failed correctly:

| | |
|---|---|
| **3 × `no-cover-ask`** | a button sitting **on top of the question it answers**, three separate times, at phone size |
| **console error** | `duplicate attach refused for key "session\|…/.info/connected"` — Firebase connection watching wired up **twice** |
| **`deny` never exercised** | the trade Deny path was offered all voyage and **never once successfully clicked** |
| **20 screens** | checked while **still animating** |

Full log: `/tmp/crewphone4.log` (transient — re-run to regenerate).

---

## 5. STATE OF HIS 35 PLAYTEST ITEMS

`.planning/phases/02.3-the-two-hour-playtest/TRIAGE.md` — **22 addressed, 4 verified on screen,
5 parked with a written diagnosis, 8 untouched.**

**Parked, each with the reason in the file:** T-01 (solo Enter — does not reproduce in Chrome, needs
the WebKit mount), T-03 (retracted — I claimed a screenshot confirmed it and it did not), **T-09
(two independent answers to "whose turn is it" — converging them is a replay design call and is
HIS)**, T-18 (parentheses), T-28 (rewatch pacing — fixing only the baker's side would desynchronise
the watcher).

---

## 6. NOT BUILT, AND NAMED SO IT IS NOT ASSUMED

- **Nothing gates the push.** `docs/QA-PROCESS.md` claimed it did for half a day; now marked NOT
  BUILT with the ~15-line `pre-push` hook it needs described.
- **No timeline recorder** — so ~6 of his defects (a card that never leaves, a missing drumroll, the
  flip landing late) are invisible to the trial. `4/scripts/narration_timeline.mjs` exists, unwired.
- **T-04 and T-06 are not covered by the comparator.** Both need a **clock**, not a snapshot: a
  difference that clears when the battle clears is normal; one that outlives it is the bug.
- **The full 8-leg trial has never completed.** 1 leg has a verdict and it is a failure.

---

## 7. WHERE TO PICK UP

1. **Run the control in §3.** Everything about whether this process works hangs on it.
2. **Fix the four real bugs in §4** — they are the game getting better, which is the only thing that
   counts (THE POINT, top of CLAUDE.md).
3. **Then** the pre-push gate and the timeline recorder.
4. **Ask him what is on his list first** (rule 5). His list outranks this one.

**And run every piece of work past a CEO before showing him — rule 25. It has caught something real
both times, including work I was about to report as finished.**
