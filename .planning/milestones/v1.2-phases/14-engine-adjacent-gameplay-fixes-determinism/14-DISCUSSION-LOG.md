# Phase 14: Engine-Adjacent Gameplay Fixes & Determinism - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-26
**Phase:** 14-engine-adjacent-gameplay-fixes-determinism
**Areas discussed:** Bot hail rule (AI-01), Storm step pacing, Storm interruption messages, All-bot sim vs real game (determinism)

---

## Bot hail rule (AI-01)

### Q1 — Does a hail use up the bot's turn?

| Option | Description | Selected |
|--------|-------------|----------|
| Hail costs its action | Bot that hails does NOT also fish/dock/attack. The hail IS its move. | ✓ |
| Keep it free, read better | Hail stays a bonus negotiation; narration changes so it reads as a trade offer. | |
| Free only if refused | Accepted trade = the bot's turn; a refusal still lets it act. | |

**User's choice:** Hail costs its action
**Notes:** Later validated against the code — a human's turn is *move, then exactly one action*, and 🤝 Parley is one of those actions (`humanAct`, `src/ui/flow.js:432`). So this is not a new rule; it makes the bot obey the rule humans already follow.

### Q2 — Should bots hail less often now that it costs a turn?

| Option | Description | Selected |
|--------|-------------|----------|
| Hail more selectively | Only spend the turn when genuinely worth it (last needed crate, truly stuck). | ✓ |
| Keep current frequency | Existing guards already strict; just apply the new cost. | |
| You decide | Let research measure hail frequency against the simulator. | |

**User's choice:** Hail more selectively

### Q3 — If hailing uses the action, does the bot still move? *(initially dismissed, answered later)*

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — it still sails | Moves as normal, then hails instead of fishing/docking/attacking. | ✓ |
| No — hailing ends the turn | Bot stays put and does nothing else. | |

**User's choice:** Yes — it still sails
**Notes:** Answered as a *principle*, not just this case — verbatim: *"bots should play by the exact same rules as humans. if a human is able to move, then trade, so should a bot."* Promoted to the phase's governing principle (D-01).

### User-initiated refinement — smarter, more human hailing

**User's input (unprompted):** *"it should hail intelligently — like a human would. it should prioritize hailing players with 2+ of an ingredient, as they have 1 spare. if it hails someone with a single ingredient, it should first hail a player who is closest to that island's dock and can get more relatively easily; and it should sweeten the deal with dubloons to make it worth the player's time. basically, make the bots smarter and more human with when and how they hail."*

**Conflict surfaced by Claude:** the hail only fires when the ingredient's crate supply is fully exhausted (`if(g.tokens[ing]>0)continue`, `src/ui/flow.js:588`), so at hail time *no* target can restock on demand. The "can get more easily" preference cannot work as the primary ranking under the current trigger.

### Q4 — Open the trigger so "who can restock" is meaningful?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — hail when it's smart | Hail whenever buying beats sailing; most human-like, but bots hail noticeably more. | |
| No — last resort only | Keep "crates gone, only you have one". Ranking still applies; restock becomes a tiebreaker. | ✓ |
| You decide | Let research measure both against the simulator. | |

**User's choice:** No — last resort only

### Q5 — How should the offer be sized?

| Option | Description | Selected |
|--------|-------------|----------|
| Pay more if it hurts you | Modest for a spare, premium for someone's only one. | |
| Pay more when desperate | Scales with the bot's own need / late game. | |
| Both combined | Factors in both the bot's need and the seller's cost. Richest, hardest to tune. | ✓ |

**User's choice:** Both combined

---

## Storm step pacing

### Q6 — How should a bot's storm push be paced? *(first framing dismissed)*

Claude's initial three-option framing (match human pacing / quicker beat / only pause on events) was dismissed. Re-asked open-ended after user feedback on question pacing.

**User's choice (free text):** *"yes, bots should also look the same as human players when the storm shoves them. you can move them quicker than the humans, snappier, but we want to know that they are being forced to run aground or pay to anchor, or flip, etc."*

**Notes:** Resolved to: visible square-by-square stepping, snappier beat than the human push, and every outcome surfaced (aground / paid anchor / flip result / moored / anchor-hold / blocked).

### Q7 — Should a bot's coin flip show the flip animation?

**User's choice (free text):** *"the bot's coin flip doesn't need to be shown — it can just tell us the result. snappiness is important; but we also want the sensation of 'fairness' by knowing that the bot is subject to the same rules as us."*

**Notes:** The second clause was promoted into the phase's governing principle — **fairness must be legible**, not merely true. This became the stated reason the storm-visibility work matters at all.

---

## Storm interruption messages

### Q8 — Wording standard for the new storm lines?

Asked as plain-vs-flavored. **User's choice (free text):** *"more pirate flavor, they should be fun to read"*

### Q9 — Who authors the new storm copy?

| Option | Description | Selected |
|--------|-------------|----------|
| Claude drafts, you approve | Phase 14 writes flavored lines, presents the full list for edit before closing. | ✓ |
| Placeholders now, you write in 15 | Plain lines now; flavor authored during Phase 15's narration pass. | |
| You write them now | Claude lists the moments needing a line; Wyatt writes them first. | |

**User's choice:** Claude drafts, you approve
**Notes:** Claude surfaced the precedent that storm copy is authored/approved by Wyatt, not auto-generated (PROJECT.md Key Decisions; how NARR-06 shipped in v1.0). Becomes an in-phase approval gate.

---

## All-bot sim vs real game (determinism)

### Q10 — What to do about the storm/safety-net mismatch?

The user first asked a clarifying question — *"what is the offline safety net?? what's it used for and why do we have it?"* — and Claude explained it in plain terms (30 fixed-seed all-bot games, fingerprinted and stored; a tripwire proving game logic didn't accidentally change, protecting multiplayer lockstep and host-refresh replay) before re-presenting the options.

Key fact established during this exchange: **live play never calls the engine's `takeTurn`** (`src/orchestrator.js:691,714` dispatch `botTurn`), so the 30-seed corpus does not cover the storm code Phase 14 changes — a UI-only fix would report a hollow 30/30.

| Option | Description | Selected |
|--------|-------------|----------|
| Leave it, note the gap | Fix only the real game; corpus untouched; log the mismatch for later. | |
| Leave it, add real coverage | Don't touch the corpus; add a check exercising the real storm path. | |
| Make the sim match | Align the simulator to the real 4-square storm; re-record all 30 fingerprints. | ✓ |
| Explain the trade-offs more | Not ready to pick. | |

**User's choice:** Make the sim match
**Notes:** Claude attached two safeguards to the decision in CONTEXT.md — re-record deliberately (confirm the only diffs are storm-related *before* re-recording, D-16), and a research flag (D-17) to check whether the simulator already charges bot trades an action, so the corpus is re-recorded **once** with all intended changes rather than twice.

---

## Claude's Discretion

- Exact snappier pacing/timing for bot storm steps (must stay legible).
- The actual heuristic behind "hail more selectively" and the combined offer scaling — to be measured against the bot simulator rather than guessed.
- Whether the hail becomes a formal option inside `chooseAction` (the natural shape, mirroring the human's Parley) or another structure, as long as one-move-one-action holds.

## Deferred Ideas

- **Opportunistic hailing** (bots hail while crates are still available) — explicitly declined for this phase; revisit only if hailing proves too rare.
- **Bots hailing other bots** — new capability, needs a hail concept in the deterministic engine, would change the fixtures again. Out of scope.
- **`eov-narration-box-not-cleared` todo** — reviewed, not folded; tagged `resolves_phase: 16` (UI-07).

## Process note

Mid-discussion the user flagged that Claude was presenting the next question before he could finish clarifying the previous topic (two questions were dismissed for this reason, not because they were bad questions). Flow was changed to one topic at a time with an explicit pause for additions before advancing. Recorded to persistent memory.
