# v1.3 Draft Roadmap — PROPOSAL, not a plan

**This is a discussion draft.** Nothing here is scheduled, approved, or built. It does not touch
`.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`, or `.planning/STATE.md` — those still describe
the live, in-flight v1.2 milestone. Read `DECISIONS.md` in this same folder first; several phases
below are shaped by decisions you haven't made yet, and each says so explicitly.

**Assumed starting point:** v1.2's Phases 15–17 finish first (see `DECISIONS.md`'s gating question,
recommendation A), and v1.3 starts as its own milestone after that. If you pick a different option
there, this phase order needs re-checking — see Assumptions below.

---

## Phase 1 — Pass-and-Play Device-Flow & Timer Bug Fixes

**Goal:** Fix the confirmed, precisely-located pass-and-play bugs before touching anything else — these are bugs blocking real people from playing, not polish.
**Items:** V13-02, V13-03, V13-04, V13-05, V13-06, V13-07, V13-08
**Size:** small
**Dependencies:** none — first phase of v1.3
**Done when:**
- Clicking the pass-and-play timer-disable button actually stops the local shot clock (today it silently does nothing, because it's wired to a multiplayer-only mechanism pass-and-play doesn't use).
- A smoke test exists that exercises pass-and-play at all (none does today).
- Battle-bet and bot-trade-hail prompts name the specific player being addressed.
- The two shared intro screens ("Ahoy!" and "crew draws lots") no longer force every player to individually pass the device — confirmed safe to change, no anti-cheat reason found (see D-07).

---

## Phase 2 — Live Repro & Investigation Spikes

**Goal:** Get real answers, from actually playing the game, on the five bugs that code-reading alone couldn't confirm or refute — and gate two research-only asks before anyone designs a fix.
**Items:** V13-09/10 (resize drift), V13-55 (turn-order skip), V13-57/58 (multiplayer ingredient-trade: UI confusion or real bug), V13-59/60/61 (ingredients vanishing — re-test after Phase 1's timer fix), V13-13 (Safari perf spike for the proposed always-on wind effect), V13-51/52 (whirlpool/wind-direction visual research)
**Size:** needs-spike (time-boxed investigation and research, not full builds)
**Dependencies:** Phase 1 (re-test the disappearance bug after the timer-toggle fix — the leading hypothesis is that fixing V13-02/03 resolves it as a side effect)
**Done when:**
- Each of the five "mystery" bugs has either a confirmed root cause + rough fix size, or a documented "reproduced clean, closing as-is" verdict.
- The always-on wind-particle idea has a pass/fail from an actual full-game Safari playthrough (this touches the exact rendering file that caused v1.0's Safari near-crash, run continuously instead of only during storms — a real change in duty cycle, not a small tweak).
- The whirlpool/wind-direction research returns 2–3 concrete visual directions for you to pick from (per D-05) — no design commitment yet.
- Any bug confirmed here to need an engine-tier fix (not just UI) is NOT fixed in this phase — it gets queued into Phase 4's single re-record batch, so the determinism cost is paid once.

---

## Phase 3 — Narration Review Tool

**Goal:** Build the feedback tool you asked for, early enough that it's useful for the copy work later in this milestone.
**Items:** V13-62
**Size:** small-medium
**Dependencies:** none
**Done when:** a new `narration.html` page (modeled on the existing `art-review/gallery.html` — the file named in the PDF, `art-review.html`, doesn't actually exist) lists every distinct narration line the game can show, each with a feedback textbox, and a button that copies all your feedback to the clipboard in one go so you can paste it back in a single message.

---

## Phase 4 — Engine Fixes & Single Determinism Re-record

**Goal:** Fix the confirmed recipe-duplication bug (and anything else confirmed engine-tier from Phase 2), paying the "re-record the multiplayer replay corpus" cost exactly once — the same discipline the last milestone's Phase 14 used.
**Items:** V13-42, V13-43, V13-44 (recipe uniqueness — confirmed) + any engine-tier fix Phase 2 confirms is real (possible candidates: V13-55's turn order, V13-59-61's ingredient conservation)
**Size:** medium (recipe fix alone) to large (if Phase 2 surfaces more)
**Dependencies:** Phase 2 (need to know what else, if anything, belongs in this same batch)
**Done when:**
- Every game pre-selects 8 unique recipe cards (2 per player) before dealing any out, so the same recipe can never be offered to, or picked by, two different players — the bug that let two players both get "Pound Cake" is gone.
- Any other confirmed engine-tier fix from Phase 2 ships in this same phase, not a separate one.
- The 31-seed determinism corpus (the thing that keeps multiplayer games staying in sync) is re-recorded exactly once, behind one blocking decision from you, with a full report of what changed and why — exactly how the last milestone's storm-movement fix was handled.

---

## Phase 5 — Trade Rename, Trade-Button Polish & Cosmetic Micro-Fixes

**Goal:** Clear the batch of small, independent, code-cheap cosmetic fixes — none of these touch each other's code, so they're natural fill-in work.
**Items:** V13-45/46/47 (Parley→Trade rename + grey-out-when-nobody-to-trade-with, gated on D-04), V13-15/16/17 (recolor the blue ship to purple + remove the leftover circle by captain names), V13-23 (make boat movement visibly ease in and out), V13-33 (bigger compass, tighter to the corner), V13-37 (movement-cost button text — fixing all 3 places it currently appears)
**Size:** small
**Dependencies:** D-04 (rename yes/no — if no, skip the string swap and keep building the grey-out under the existing "Parley" label)
**Done when:**
- (If renamed) exactly the 3 places that say "Parley" now say "Trade"; the trade button greys out with italic explanatory text when nobody has anything to trade, instead of just disappearing.
- The blue captain's ship (and every UI element tied to that color) reads as purple, not confusable with the green ship — including the boat image itself, which needs a separate art-asset pass, not just a code color change.
- The leftover circle next to captain names in the Captains box is gone, with the row still lining up correctly.
- Boat movement visibly speeds up then slows down across a single square-hop, not just decelerates.
- The compass is bigger and sits close to the board's top-right corner.
- The sailing-cost button always reads the new, clearer wording, everywhere it appears.

---

## Phase 6 — Narration Copy & Parity Pass

**Goal:** Land the narration-text fixes and the new copy you write, using the review tool from Phase 3.
**Items:** V13-18/35 (recipe-choice reordered relative to the NEW opening line, since the reorder instruction and the line rewrite touch the exact same text), V13-19 (solo end-of-voyage line), V13-36 (docking flip-rule clarifier), V13-38/39/40 (timeout lines that appear in the captain's log but not the visible narration box — a real, precisely-located bug in one guard clause), V13-41 (fishing button shows the coin range), V13-63 (wind-flavor descriptor library)
**Size:** small-medium in code; gated on you delivering the copy (D-06)
**Dependencies:** Phase 3 (review tool ready), D-06 (your copy batch), and — because Phase 15 in the still-open v1.2 milestone independently targets the same 2nd-person/"you" narration voice (its NARR-05 requirement) — a quick check that Phase 15 hasn't already shipped this exact fix, so it isn't built twice
**Done when:**
- The opening narration reads your new wording, with the recipe-choice screen correctly sandwiched between it and the "crew draws lots" screen.
- The solo winner sees a short, appropriately-worded line instead of being told about their own win in the third person.
- Docking narrates the heads/tails rule before you flip, in your words.
- Every timeout line that shows up in the captain's log also shows up in the on-screen narration box, addressing the local player as "you."
- The fishing button shows the coin range, with a "+2" shown for the two named lucky catches.
- A pastry-themed wind-flavor line appears every round, selected without any new random-number draw (so it can't break multiplayer sync).

---

## Phase 7 — Settings Menu Shell + Turn-Clock Toggle Relocation

**Goal:** Build the (currently nonexistent) settings menu, and move the existing clock on/off toggle into it.
**Items:** V13-30 (shell only — the hints toggle inside it is Phase 10's concern, if D-02 says yes), V13-32
**Size:** small
**Dependencies:** D-01 (whether the clock's default state and an explanatory modal need building here, or just the relocation)
**Done when:**
- A settings menu exists.
- The turn-clock on/off toggle lives there; play/pause stays on the clock itself, unchanged.
- The toggle's default state matches whatever you decided in D-01; if you chose an "off by default" option, the explanatory pop-up (what the clock does, what the timeout penalties are) ships alongside it.

---

## Phase 8 — Trade-Wind Discoverability

**Goal:** Make it visually clear how ships enter the trade winds and roughly where they'll come out — using whichever design direction you picked from Phase 2's research.
**Items:** V13-49, V13-50
**Size:** small-medium
**Dependencies:** Phase 2's whirlpool/wind research + your pick of a direction (D-05)
**Done when:** a ship approaching the game board's rim gets some visual signal that it's about to be swept into the trade winds, and once swept in, the board shows roughly where the ride will end — built to whatever specific look you approved, not a generic guess.

---

## Phase 9 — Ambient Wind-Particle Effect

**Goal:** Add the subtle, always-drifting wind effect over the board — only if it's confirmed safe on Safari.
**Items:** V13-11, V13-12, V13-13
**Size:** small if the spike passes; dropped or rescoped if it doesn't
**Dependencies:** Phase 2's Safari performance spike passing
**Done when:** a few small particles drift gently across the board in the wind's current direction, confirmed smooth through a full real game on both Chrome and actual Safari — not just a quick glance, since this reuses the exact rendering technique behind a prior Safari near-crash, just run continuously instead of occasionally.

---

## Phase 10 — Tutorial / Contextual Hints System

**Goal:** Build the first/second/third-time contextual hint system, if you decide it's new scope rather than a revival of the tutorial you already deferred.
**Items:** V13-21, V13-22, V13-24, V13-25, V13-26, V13-27, V13-28, V13-29, V13-30 (full), V13-31
**Size:** large — the single biggest item in the whole punch list
**Dependencies:** D-02 (is this in scope at all), D-06 (your hint copy), Phase 7 (the settings-menu shell this extends)
**Done when:** the first and second time a player takes any action, the game shows your extra explanatory text; the third time onward, it shows your short permanent version; a settings toggle turns hints on or off, defaulting on for a brand-new browser and off after that.

**If D-02 comes back "no" or "not yet," this entire phase is dropped, not shrunk — it doesn't make sense half-built.**

---

## Phase 11 — Closing Playtest

**Goal:** Confirm the milestone's fixes actually hold up in real play, the same way v1.2's Phase 17 closes that milestone.
**Items:** none new — re-verification of V13-53–61's originally reported symptoms, plus everything shipped in Phases 1–10
**Size:** small
**Dependencies:** all prior phases
**Done when:** a two-window Safari+Chrome multiplayer game and a 4-player pass-and-play game both play start-to-finish with no recurrence of the reported turn-skip, ingredient-trade-UI, or ingredient-disappearance symptoms.

---

## Assumptions

Every assumption below is tagged with the decision in `DECISIONS.md` that would invalidate it.

1. **v1.2's Phases 15–17 finish before any v1.3 phase starts**, and v1.3 Phase 1 runs immediately after. *(Invalidated by choosing Option B or C on the gating question — B means Phases 5/6 above should likely be merged into v1.2's Phase 15/16 instead of standing alone; C means Phase 17's verification never happens and this roadmap would need to absorb that check itself.)*
2. **The turn clock defaults stay ON**, per Phase 13's shipped/verified behavior, in every phase except Phase 7 where D-01 is explicitly resolved. *(Invalidated by D-01 — if you pick "off by default," Phase 7 gets bigger: default flip + new explanatory modal, and Phase 10's hints system would need to account for a calmer, clock-optional first playthrough rather than assuming the clock is always running.)*
3. **Phase 10 (tutorial/hints) is genuinely new v1.3 scope, not a revival of the already-deferred TUT-01…03.** *(Invalidated by D-02 — a "no" drops Phase 10 entirely; a "plumbing only" answer keeps Phase 7's settings-menu work but removes Phase 10's actual hint content and copy.)*
4. **"Parley" becomes "Trade."** *(Invalidated by D-04 — a "no" means Phase 5 skips the 3 string edits and V13-47's grey-out ships under the existing label.)*
5. **You'll personally write or approve the copy batch** (hint text, wind-flavor library, end-of-voyage line, docking clarifier, trade-button subtext) in roughly one sitting before Phases 6 and 10 build against it. *(Invalidated by D-06 — if you'd rather have drafts written for you to edit instead of writing from scratch, Phases 6/10 can proceed with placeholder-then-swap copy instead of waiting on a blank-page draft from you.)*
6. **Fixing the pass-and-play timer bug first (Phase 1) is worth doing before investigating the ingredient-disappearance mystery**, on the chance it resolves for free. *(Invalidated by D-03 if you'd rather greenlight a single all-five investigation session up front regardless of sequencing.)*
7. **Phase 2's live-repro investigations find causes similarly small to the recipe-uniqueness fix**, not something structurally larger (e.g., a genuine multiplayer desync). *(No specific decision gates this — flagging because if Phase 2 finds something bigger, Phase 4's size estimate should be revisited before committing to it, not silently absorbed.)*
8. **The always-on wind-particle Safari spike (Phase 2) passes.** *(No decision gates this either — it's a technical outcome, not a choice — but Phase 9 is written assuming a pass; a fail should shrink or drop Phase 9, not be quietly worked around.)*
9. **Building `narration.html` (Phase 3) before the copy-writing phases is worth the sequencing**, rather than after. *(A process bet, not gated on any decision — if you'd rather just get copy asks in a plain list, Phase 3 can slide later without blocking Phase 6.)*

---

## Not Included

- **Pure section headers and a screenshot with no independent content** (V13-01, 09, 11, 14, 20, 24, 34, 42, 45, 48, 53, 54) — these aren't separate work; each is folded into the child items already scheduled above.
- **V13-56 (verify no old turn-skip/"passing the wheel" vestige remains)** — step 2 already searched the entire codebase and found no trace of it; the only "wheel" text is the current, correct turn-start narration. This closes as verified-clean with no phase needed.
- **Sound effects, the original scripted tutorial (TUT-01…03), and the island redesign** — all three stay exactly as deferred in `.planning/STATE.md` today, regardless of what you decide about the new hints system in D-02. That decision is only about the new inline-hints ask, not about reopening these three.
- **A committed visual redesign for whirlpools/trade-wind direction** — Phase 2 only spikes the research; the actual build (Phase 8) is gated on you picking a direction, so nothing is designed here yet.
- **Any change to the already-shipped v1.0/v1.1/Phase-13/Phase-14 work** — this document only proposes new work on top of what's already built and verified.
