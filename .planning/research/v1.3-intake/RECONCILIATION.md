# v1.3 Reconciliation — the intake (63 items) vs. the 2026-07-31 draft (15 items)

**Written 2026-07-31.** Two independent v1.3 scopes existed. This document merges them.

| | **Intake** | **Draft** |
|---|---|---|
| Where | `.planning/research/v1.3-intake/` | `.planning/ROADMAP.md` §"Next Milestone: v1.3" |
| Source | `notes/edits for pastry pirates.pdf`, 63 items | Wyatt's 2026-07-31 punch list + the live Phase 17 playtest |
| Dated | 2026-07-27 | 2026-07-31 |
| Depth | Inventoried, feasibility-grounded against real code, **all 8 decisions answered by Wyatt** | Requirements + lane structure, not yet feasibility-graded |
| Shape | 11 sequential phases | 5 parallel lanes |

**How this happened:** the 2026-07-31 draft was built from `REQUIREMENTS.md`'s "Future
Requirements" plus that evening's conversation. `.planning/research/v1.3-intake/` was never read, so
the draft neither includes nor contradicts it by intent — it simply did not know about it. **The
draft is roughly a fifth of the real v1.3 scope.** Nothing in the intake was rejected; it was missed.

**Neither document is discarded.** The intake is the larger and better-grounded scope and its
decisions are already Wyatt's. The draft adds work that post-dates it — including eight bugs found in
the Phase 17 playtest that no earlier document could have known about.

---

## 1. Genuine overlaps — same work, two IDs. Merge, do not build twice.

| Draft | Intake | Verdict |
|---|---|---|
| **WIND-01** — dot particles on every non-storm turn | **V13-11/12/13** — ambient wind-particle effect | **Same feature.** Both independently reached the same Safari concern; feasibility grades it `needs-spike`, not `small`, because it changes the rendering duty cycle from occasional to 100%. **Keep the intake's spike gate** — it is the more cautious of the two and matches the draft's own constraint 2. |
| **WIND-02/03** — arrows flow into the whirlpool, whirlpool rotates | **V13-49/50** discoverability + **V13-51/52** semiotics research (D-05 = "research this milestone") | **Partial.** The draft supplies a concrete direction Wyatt gave on 2026-07-31, which **satisfies the research step for these two visuals** — no need to re-research what he has already specified. But V13-49/50's *"where will I come out"* discoverability is **additional** and survives; the draft does not cover it. |
| **FIX-02** — a disabled turn-clock button in solo | **N-03 + N-04** — clock disable works locally, full parity across all three modes | **The intake's is bigger and supersedes.** Wyatt's D-01 ruling asks for solo to *actually disable* the clock, not merely display an inert button. **FIX-02 as written under-delivers his own decision** — replace it with N-03/N-04, do not build both. |
| **FIX-14** — the active ring lags the boat in storms | **V13-23** — boat movement should ease in and out | **Adjacent, same code.** Both are ship-movement animation in `src/ui/board.js`. Feasibility found V13-23 is already technically an S-curve and needs a more exaggerated curve, CSS-only. Plan together — one animation pass, not two. |
| **FIX-11** — final-round narration never reaches guests | **V13-38/39/40** — timeout lines reach the log but not the narration box | **Same family, different instances.** Feasibility precisely located V13-38/39/40: `narrateLastEvent()` drops the line when `#actionPanel` has `needsAction`. **Check that guard against FIX-11 before investigating separately** — it may be one cause behind both. |
| **FIX-04** — remove "blown by the storm" | **V13-63** — wind-flavor descriptor library | Not the same, but they touch the same narration surface and the same round cadence. Sequence together. |

## 2. In the draft, absent from the intake — all of it survives

Everything here post-dates the intake or comes from a different source. **None is superseded.**

- **ABOUT-01/02** (About page), **META-01** (Google preview) — from the 2026-07-31 conversation.
- **AUDIO-01/02/03** (sound effects) — **this reverses an intake statement.** DRAFT-ROADMAP's "Not
  Included" says sound effects *"stay exactly as deferred."* Wyatt put them in v1.3 on 2026-07-31.
  **The later instruction wins**; the intake line is stale, not contradicted.
- **FIX-01** (name modal), **FIX-03** (buttons wait for typewriter), **FIX-06** (orange restyle),
  **FIX-07** (bribe with an empty hold), **FIX-08** (win-banner article), **FIX-09** (mobile chips),
  **FIX-10** (narrow window clips the action button), **FIX-12** (re-mask recipe art),
  **FIX-13** (blown-off-the-dock audit), **FIX-14** (ring lag) — **eight of these are from the Phase 17
  playtest on 2026-07-31**, after the intake was written.
- **LOAD-04a** (compress non-board art), **ART-01/02** (watercolor restyle, chained after the island
  redesign) — 2026-07-31 decisions.

## 3. In the intake, absent from the draft — ~50 items the draft silently dropped

The draft would have shipped v1.3 without any of this. Non-exhaustive, grouped as the intake groups it:

- **Pass-and-play bugs V13-02…08** — including a **clock-disable button that silently does nothing**
  in pass-and-play (it watches a Firebase node that pass-and-play has no connection to). Confirmed,
  located, and blocking real players. The intake makes these **Phase 1, before anything else.**
- **Recipe uniqueness V13-42/43/44** — two players can be dealt the same recipe. **Confirmed
  fixture-breaking**; forces the re-record (see §4).
- **Investigation spikes** — V13-09/10 resize drift, V13-55 turn-skip, V13-57/58 multiplayer
  ingredient trade, V13-59/60/61 ingredients vanishing. Feasibility could not reproduce any of them
  from static reading; they need live repro sessions.
- **V13-62 narration review tool** (`narration.html`) — Wyatt asked for it; it also makes the copy
  work cheaper downstream.
- **N-01** pass-and-play test coverage, **N-02** turn-clock urgency animation (rings 300% larger and
  red at 5s, persisting through the 10s phase), **N-05** rework "parley" into a different narration
  path, **N-06** drop the time-out crate penalty.
- **V13-45/46/47** Parley→Trade rename + grey-out (D-04 = rename).
- **V13-15/16/17** blue ship → purple (needs a boat-art pass, not just a colour constant) and remove
  the vestigial dot; **V13-33** compass; **V13-37** movement-cost button text.
- **Copy items** V13-18/19/35/36/41/63 — gated on Wyatt's batched writing session (D-06 = one batch).

**Deliberately still deferred by Wyatt's own decisions:** the hints/tutorial system (D-02 = stay
deferred, *"we'll do an onboarding milestone soon"*) and the settings menu (dropped as a knock-on of
D-02 — *"we don't need a settings menu at this stage"*).

## 4. The one structural conflict — and it resolves

**Intake Phase 4 schedules a determinism re-record inside v1.3.** Recipe uniqueness is confirmed
fixture-breaking: the fix changes `this.r()` draws during construction, so **all 31 fixtures are
affected.** The draft, meanwhile, states that *nothing* in v1.3 may touch the engine — that being the
property that keeps its five lanes parallel.

**These are compatible, and the merge is better than either alone.** The draft's rule is really a
constraint **on the parallel lanes**, not on the milestone. A single, isolated, gated engine phase
can coexist with lanes that stay clear of the engine:

- **All engine-tier work lands in ONE phase** and the corpus is re-recorded exactly once — the same
  discipline v1.2's Phase 14 used.
- **The lanes keep their rule** and stay parallel.
- **This is strictly better for two draft items.** FIX-05 (paid anchor narrated as "still docked")
  and FIX-13 (blown-off-the-dock) both have unconfirmed engine-vs-UI causes. The draft had to
  **exile FIX-05 from the milestone entirely** because there was no re-record to join. With the
  intake's Phase 4 present, **both can be investigated inside v1.3** and join that batch if they turn
  out engine-tier. **FIX-05 should be un-exiled.**

**Consequence for ART-01:** the watercolor restyle is chained behind ISLAND-01…04, which needs its
own *second* re-record. That remains **out of v1.3** — the merge adds one re-record, not two.

## 5. Recommended merged shape

Intake phase order, with the draft's lanes folded in where they fit. Numbering continues from v1.2.

| # | Phase | Source | Notes |
|---|---|---|---|
| 18 | Pass-and-play & clock bugs | Intake P1 + N-01/02/03/04 | **First — real players are blocked.** Absorbs the draft's FIX-02 |
| 19 | Live repro & investigation spikes | Intake P2 + **FIX-05, FIX-13** | Anything found engine-tier queues to Phase 21 |
| 20 | Narration review tool | Intake P3 (V13-62) | Makes the copy phase cheaper |
| 21 | **Engine fixes & the single re-record** | Intake P4 + whatever P19 confirms | **The one-way door. Once only.** |
| 22 | Prompts, polish & cosmetics | Intake P5 + draft **Lane C** | FIX-03+FIX-10, FIX-06, FIX-04, FIX-07, FIX-08, FIX-09 |
| 23 | Narration copy & parity | Intake P6 + draft **FIX-11** | Gated on Wyatt's D-06 batch |
| 24 | Board comes alive | Draft **Lane A** + Intake P8/P9 | WIND-01 keeps the Safari spike gate; adds V13-49/50 |
| 25 | The front door | Draft **Lane B** | FIX-01, ABOUT-01/02, META-01 |
| 26 | Sound | Draft **Lane D** | AUDIO-01/02/03 — clock parity from P18 gives the mute button its anchor |
| 27 | Art & assets | Draft **Lane E** | FIX-12 + LOAD-04a as one export pass; FIX-14 with V13-23 |
| 28 | Closing playtest | Intake P11 | Safari gate for WIND-01 rides here |

**Phases 22–27 are still mutually parallel** — the lane structure survives. Phases 18–21 are
sequential and come first, because Phase 21's re-record must know everything that belongs in it.

**This is a materially bigger milestone than either document alone.** Worth saying out loud rather
than discovering mid-flight: v1.3 as merged is larger than v1.2 was. Splitting it (e.g. bugs +
re-record as v1.3, look-and-feel as v1.4) is a legitimate alternative and is **Wyatt's call**.
