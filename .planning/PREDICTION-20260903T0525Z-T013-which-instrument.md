# PREDICTION — `T-013`: which of the two instruments is telling the truth?

**Written 2026-09-03T05:25Z by watch a9, BEFORE running either probe.** Tree stamp 2026.09.02.1.

## The question, in his words

Wyatt, twice: W5-2 — *"The buttons to call other battling captains sit on top of their boats, and
often on the WRONG boat"* — and `INBOX-20260901T1332Z` — *"not on top of, or next to, someone
else."*

Two of our own instruments answer it differently on the same shipped tree:

| | poses | wrong-boat |
|---|---|---|
| `scripts/qa/w52_call_beside_boat.mjs` | 12 circles, 3 viewports, **boats never moved** | **1** |
| `scripts/qa/w54_call_clear_of_ask.mjs` | 21 poses, 3 viewports, **two boats teleported per pose** | **15 (16 after the fix)** |

Both use the SAME geometry — nearest boat **by edge gap**, `boardShipEls()`, `dataset.seat`. So the
disagreement is not in the arithmetic. It is in the board each one builds.

## WHAT HAPPENED IMMEDIATELY BEFORE (rule: widen the time horizon)

`w54` does one thing `w52` does not, roughly one second before it measures:

```js
g.players[a].pos=[ax,ay]; g.players[d].pos=[dx,dy];
b.snapShipTo(a, …); b.snapShipTo(d, …);
```

**It moves exactly TWO of the four hulls and leaves the other two wherever the solo game left them.**
That is the only structural difference between the two probes, and it is the thing to suspect.

## WHAT I EXPECT, AND WHAT WOULD PROVE ME WRONG

**P1 — w54's wrong-boat rows are mostly THIRD PARTIES.** In the majority of `w54` rows flagged
`WRONG BOAT`, the `nearest` seat will be a captain who is **neither of the two named in the
prompt** — a hull the pose never moved, left stranded between the two it did.
*Falsifier:* if `nearest` is usually **the other named seat** — the two fighters' circles swapped —
then the placement really is picking the wrong boat, `w52` is under-reporting, and P1 is dead.

**P2 — w52 still reports about 1 wrong of 12 on this build.** It is the newer of the two and its
`nearest`-by-edge correction was earned on this exact false alarm.
*Falsifier:* a materially different number. If w52 now reports many, the two instruments agree and
there was never a conflict to settle.

**P3 — THE PICTURE WILL SIDE WITH w52.** Opening `w54`'s own screenshots for its WRONG-BOAT poses,
I expect to see the circle sitting **beside the boat it names**, with an unmoved third hull merely
closer in edge-distance — a player would not be misled.
*Falsifier:* the shot shows the circle plainly parked on or beside a stranger's hull. Then `w54`
is right, the defect is live, and this stops being a measurement argument and becomes a fix.

**P4 — both probes complete on this machine.** `stray_probe_check` is PASS with zero browsers and
both files carry the Windows `freshProfileDir` fix.
*Falsifier:* NOT RUN legs. If a leg cannot start, it is not a leg that passed, and the honest
report says so rather than averaging over what ran.

---

# THE RESULT — written 2026-09-03T05:40Z, after measuring. **I WAS WRONG ABOUT THE ANSWER.**

**P1 — the arithmetic HELD and the conclusion I drew from it DID NOT.** 19 of the 22 wrong rows do
name a captain who is not in the fight (most often the player's OWN boat, seat 0). But that does not
make w54's count an artifact, because in those same rows the circle is **106–229px** from the
captain it names. A player is genuinely being pointed at a stranger.

**P2 — HELD, and better than remembered.** `w52` reports **0 of 12**, not 1 of 12. Every circle sits
**11px** from its own hull, 0% overlap, on all three viewports.

**P3 — WRONG, and it is the finding.** I predicted the picture would side with w52. It does not.
`mp-rig-shots/w54-t013-phone-20-50.png`, taken this watch on this build: both call circles sit in
**empty water in the middle of the board**, roughly 400px below the two boats, one of them parked on
a sugar-cube island. Neither is beside the captain it names. **That is Wyatt's report, photographed.**

**P4 — HELD.** 21 poses measured, **0 NOT RUN**, on all three legs.

## AND ONE MECHANISM IS NOW DEAD, WHICH IS WHY THIS WAS WORTH MEASURING TWICE

**(B) MID-GLIDE IS DEAD.** All 21 poses reported **ships stopped**, and the wrong-boat count measured
where w54 measures and again after the hulls stop is **identical: 22 → 22**. Waiting changed nothing.
*(w54's own "STILL MOVING at the 10s cap" on 19 of 21 is its pill-and-circles signature catching the
board's permanent breathing — not the ships. It is a misleading line, not a wrong measurement.)*

**(A) OFF CAMERA IS REAL BUT PARTIAL.** 17 of 42 circles name a captain whose hull is off the screen
entirely — `src/ui/stage.js:2864-2869` builds an anchor from `boatUXY(seat)` → `toScreen(...)` and
`anchors.every(Boolean)` is **true for a point nobody can see**, so the anchored branch runs on an
anchor that is off the board. But ~10 wrong rows have their own hull plainly ON SCREEN, so this is
not the whole of it.

> ### ⚠ THE PARAGRAPH THAT WAS HERE WAS WRONG, AND CEO 146 CAUGHT IT BEFORE WYATT SAW IT
>
> It said: *"Every correct circle sits 4–11px from its own hull. Every wrong one sits 106–229px
> away. There is nothing in between."* **The second half is false on my own data.** 106px, 136–141px
> and 225px each appear on BOTH sides of that run — see `.planning/T013-RUNS-20260903.md`, run 3,
> where both lists are transcribed in full. I wrote a tidier sentence than the record, which is the
> fault the previous two reviews both named. It is corrected here rather than quietly reworded.
>
> **The 27 in the summary above it is void too**, for the reason in finding 3 below.

**WHAT THE NUMBERS ACTUALLY SHOW, RE-STATED FROM TWO RUNS AND CHECKED AGAINST BOTH LOGS.** Split the
circles by how far each one is from the boat it names, not by whether it is "wrong":

| | run 3 | run 4 |
|---|---|---|
| **anchored** — within 16px of the boat it names | 10 of 42 | 18 of 42 |
| — of those, nearest the WRONG captain | **0** | **0** |
| **stranded** — further than that | 32 | 24 |
| — of those, nearest the WRONG captain | 22 | 15 |
| widest anchored gap / closest stranded gap | 13px / 49px | 10px / 51px |

**Twenty-eight anchored circles across two runs and not one names the wrong captain. No circle in
either run ever landed between 13px and 49px.** That hole is the finding: the placement is not
drifting a bit, it is **switching** — it either puts the circle against the hull it names or throws
it half a screen away, and at that distance which captain looks nearest is chance.

**SO "ON THE WRONG BOAT" IS A SYMPTOM AND NOT THE FAULT.** The fault is that the circle is often
beside no boat at all — which is exactly what the photograph shows, and it explains both of Wyatt's
sentences with one mechanism.

## THE VERDICT, IN ONE LINE

**`w54` is telling the truth; `w52` is honest and cannot see the fault.** `w52` never moves a boat, so
the two named captains are always framed and close together, the anchored placement always succeeds,
and it measures a board on which this fault cannot occur. Its 0-of-12 is a true statement about the
wrong board.

## WHAT I AM NOT CLAIMING

I am not predicting whether the circles are placed WELL. That is a separate, live question and
`T-013`'s own second half (`src/ui/stage.js`'s last-resort branch never checks WHOSE hull it lands
on). **This note is only about which instrument's number a reader may believe** — and the arbiter is
the screenshot, not a third number.
