# Phase 14: Engine-Adjacent Gameplay Fixes & Determinism - Context

**Gathered:** 2026-07-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Make storm pushes behave and *read* correctly (the boat steps one square at a time, and the game says the right thing at the right square), and settle the rule for when a bot hails the human to buy a crate — without breaking deterministic multiplayer replay.

Requirements: **STORM-01, AI-01, VERIFY-02.**

**Governing principle for the whole phase (user's words, D-01):** bots play by the *exact same rules* as human players, **and the player must be able to see that they do.** Fairness must be legible, not merely true. Every implementation decision should be testable against: *"would a human be allowed to do this, and can the player tell?"*

</domain>

<decisions>
## Implementation Decisions

### Governing principle

- **D-01:** **Bots follow the same rules as humans, visibly.** A bot's turn structure must mirror the human's: **one move + one action**, no exceptions. The player must be able to *see* bots subject to the same consequences (this is the stated reason for the storm-visibility work below — "we want the sensation of 'fairness' by knowing that the bot is subject to the same rules as us"). — **Reversibility:** reversible — a design principle guiding the changes below, not a structural commitment.

### AI-01 — the bot hail rule

- **D-02:** **A hail costs the bot its action.** A bot that hails the human does NOT also fish/dock/attack that turn. This is not a new rule — it is the bot finally obeying the rule humans already follow: the human's turn is *move, then pick exactly one action*, and **🤝 Parley is one of those actions** (`src/ui/flow.js:432` `humanAct` — opts are ⚓ Dock / ⚔️ Attack / 🤝 Parley / 🎣 Fish / bakery). Today the bot gets the hail **for free and** a normal action (`src/ui/flow.js:584-612`, then `chooseAction` at :613), which is the "two actions in one turn" Wyatt reported. — **Reversibility:** reversible — localized to the live bot turn flow.
- **D-03:** **The hailing bot still moves.** Per D-01, a bot's turn mirrors the human's: sail (pay 1🌕, move) → then the hail *is* its action. The hail costs the **action**, not the whole turn. (Confirmed by Wyatt: *"if a human is able to move, then trade, so should a bot."*)
- **D-04:** **Bots hail more selectively.** Now that a hail costs a full action, the bot should only spend it when genuinely worth it (e.g. that crate is the last thing it needs, or it is truly stuck) rather than whenever the trigger happens to fire.
- **D-05:** **Keep the hail trigger as last-resort only.** A bot hails only when that ingredient's crate supply is exhausted (`if(g.tokens[ing]>0)continue` — `src/ui/flow.js:588`). Hailing was explicitly NOT opened up to fire earlier/opportunistically; hail frequency should stay roughly as today, gated further by D-04. — **Reversibility:** reversible.
- **D-06:** **Hail targeting becomes deliberate and human-like.** Today the bot blindly takes the first human found holding the crate (`g.players.find(...)` — `src/ui/flow.js:590`). Replace with ranked selection:
  1. **Prefer sellers holding 2+ of the ingredient** — they have a genuine spare, so it is an easier "yes".
  2. **Single-holders are the fallback**, preferring whoever it hurts least.
  3. **"Can restock easily" (proximity to that ingredient's island/dock) is a tiebreaker only** — under D-05 the crate pool is empty when a hail fires, so no target can truly restock on demand (crates only return to the pool when a player runs aground: `src/engine/index.js:279`). Do not build ranking logic that assumes restocking is available.
- **D-07:** **The offer is sweetened, scaling on BOTH factors combined:** how badly the bot needs it (desperation — e.g. last ingredient, late game) AND how much giving it up costs the seller (a spare is cheaper than someone's only one). Today the offer is a flat 5🌕 with a 6–10 counter capped by the bot's purse (`src/ui/flow.js:592-604`). **Tuning caution:** combined scaling is the richest but easiest to over-tune — bots must not bankrupt themselves.
- **D-08:** **No bot-vs-bot hail.** Hailing is bot→human only and does not exist in the deterministic engine's `takeTurn`; do NOT add it. AI-01's "mirror in the engine if the rule applies to bot-vs-bot" resolves to *nothing to mirror* for the hail itself. (See D-12 for the related open question about bot trades in the simulator.)

### STORM-01 — storm movement and how it reads

- **D-09:** **Bot storm pushes step one square at a time, visibly** — same as the human push, which already resolves square-by-square with narration and inline prompts (`windLeg`, `src/ui/flow.js:206`). Today bots call the engine twice with no intermediate render (`src/ui/flow.js:559-560`), so the boat appears to teleport up to 4 squares.
- **D-10:** **Snappier than the human push.** Bots step visibly but with a quicker beat than the human's pacing — a storm pushes every player, so a 4-player game means up to three bot pushes of up to 4 squares each per storm round. **Speed must never cost legibility** (D-01): snappiness and visible fairness are the two things being balanced.
- **D-11:** **Every storm outcome must be surfaced** for bots, not just the movement: run aground, paid anchor (dodge), coin-flip result, held at a dock/home (moored), anchor-hold on a second leg, and blocked by another ship. These events are already recorded by the engine (`src/engine/index.js:265-286`) but never narrated during a bot's push. **Bot coin flips do NOT show the flip animation** — state the result only (e.g. "…flips: tails — runs aground!"). The human keeps the interactive flip.
- **D-12:** **The false "the dock held fast" message must fire at the correct square.** Per STORM-01 — it currently appears while the boat is still a square away from the dock. The `moored` event fires from the island/home checks in the push loop (`src/engine/index.js:265-267`, mirrored at `src/ui/flow.js:212-216`).
- **D-13:** **New storm lines get real pirate flavor — "fun to read".** These per-square outcomes have never been narrated before, so genuinely new copy is required.

### Storm copy approval gate

- **D-14:** **Claude drafts the pirate-flavored storm lines; Wyatt approves before the phase closes.** This is an in-phase approval gate. It follows the established project precedent that storm copy is authored/approved by Wyatt rather than auto-generated (PROJECT.md Key Decisions: *"Storm-text audit produces a list back to Wyatt for rewrite | Copy is authored by Wyatt, not auto-generated"*; this is how NARR-06 shipped in v1.0). Present the complete list of new lines (aground, paid anchor, flip result, moored/held at dock, anchor-hold, blocked by ship) for edit. — **Reversibility:** reversible — copy edits are cheap.

### VERIFY-02 — the determinism safety net

- **D-15:** **Align the all-bot simulator to the real game's storm, and re-record the 30 fingerprints.** The two storm paths currently disagree: the **live game** (`botTurn`, `src/ui/flow.js:559-560`, and `humanWind`/`windLeg` at :271-273) applies **both gusts — up to 4 squares**, while the **engine's all-bot simulator** (`takeTurn`, `src/engine/index.js:700`) applies only the **first gust — 2 squares**. `windNow2` is set in the orchestrator (`src/orchestrator.js:683`) and only *recorded* by the engine (`src/engine/index.js:233`), never acted on in `takeTurn`. Wyatt chose to make the simulator model the game that actually ships. — **Reversibility:** **one-way** — re-recording the golden fixtures destroys the previous byte-for-byte oracle: after the reset, the corpus can no longer prove "nothing else changed" across that boundary. Restoring it would mean reverting the engine change AND restoring the old fixtures from git history.

  **Critical context — the net does not currently cover this code.** Live play never calls `takeTurn`: `src/orchestrator.js:691,714` dispatch `botTurn`/`humanTurn`. `takeTurn` runs only inside `Game.play()` (`src/engine/index.js:756,763`), which is what the determinism harness drives (`playSeed` → `g.play()`, `scripts/determinism_baseline.js:61-65`). So a UI-only storm fix would report a hollow 30/30 — green for code it never exercised. **Fairness in the real game is already intact** on this point: live humans and live bots both get the full 4-square push.

- **D-16:** **Re-record deliberately, never reflexively.** Required order: make the storm change → run the 30 seeds → **confirm the differences are only storm-related** → then re-record. A fingerprint that changes for an unexplained reason is a real bug, not paperwork. The hazard of re-recording is that it can silently bury an unrelated regression in the same step. Document what changed and why alongside the new fixtures.

### Claude's Discretion

- **Exact snappier pacing for bot storm steps** (D-10) — the specific per-square timing is for planning/implementation to choose, subject to staying legible.
- **How D-04's "more selectively" and D-07's combined offer scaling are computed** — research/planning decide the actual heuristic; the bot simulator (`cocoa_pirates_sim.py`, `scripts/battle_sim.js`) can be used to measure hail frequency and bot solvency rather than guessing.
- **Whether the hail becomes a formal option inside `chooseAction`** (the natural shape given D-02/D-03, since that is exactly how the human's Parley works) versus another structure — implementation's call, as long as the one-move-one-action rule holds.

### Open question for research (raised during discussion, not yet decided)

- **D-17:** **Does the all-bot simulator already charge bot trades an action, the way the human's Parley does?** D-01 ("same rules as humans") may reach beyond the hail. If `takeTurn` lets a simulated bot trade *and* act, aligning it would be consistent with the principle — but it would change the 30 fingerprints **again**, on top of D-15. Research must determine this **before** planning sequences the re-record, so the corpus is re-recorded once with all intended behavior changes included, not twice.

### Folded Todos

- **`bot-hail-plus-action-same-turn`** (`.planning/todos/pending/`, `resolves_phase: 14`) — "A bot can 'hail' (parley) the human AND take a normal action in one turn." Observed by Wyatt in the Phase 12 Safari playthrough (Flaky Jack parleyed *and* fished). Traced and confirmed **pre-existing since v1.0**, not a v1.1 refactor regression (`main:index.html:4607` has the same hail-then-`chooseAction` structure). This todo **is** AI-01 and is resolved by D-02–D-08.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

ROADMAP.md lists no `Canonical refs:` line for Phase 14. The references below were accumulated from REQUIREMENTS.md, PROJECT.md, the folded todo, and the codebase scout during this discussion.

### Requirements and phase scope
- `.planning/REQUIREMENTS.md` — STORM-01 (line 20), AI-01 (line 24), VERIFY-02 (line 57). AI-01 explicitly defers the hail rule to this phase.
- `.planning/ROADMAP.md` §"Phase 14: Engine-Adjacent Gameplay Fixes & Determinism" — goal and the 4 success criteria.
- `.planning/todos/pending/bot-hail-plus-action-same-turn.md` — the folded todo: full trace, the v1.0 pre-existence proof, and the original design question.

### Carried-forward decisions
- `.planning/phases/13-multiplayer-turn-clock/13-CONTEXT.md` §D-10 — the determinism guardrail ("pause/timer are wall-clock/UI concerns, not engine state; the engine has no clock/pause access by design; keep it that way"). **Phase 14 is the first phase to deliberately cross into engine behavior**, so D-15 is a conscious, scoped exception to the spirit of that guardrail — not a licence to loosen it generally.
- `.planning/PROJECT.md` §Key Decisions — "Storm-text audit produces a list back to Wyatt for rewrite | Copy is authored by Wyatt, not auto-generated" (the precedent behind D-14).
- `.planning/debug/knowledge-base.md` — Phase 13's host-authority/broadcast lesson (host-owned state must be broadcast; clients must render from authoritative payloads, not host-only locals).

### Codebase maps
- `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/TESTING.md` — layer boundaries and the harness/verification story.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`windLeg` (`src/ui/flow.js:206-260`)** — the human storm push. **This is the pattern to copy for D-09/D-11.** It already walks one square at a time and calls `narrateLastEvent()` + `liveRender()` after each outcome (moored :212, blocked :214, island/dodge/flip :215-250). The bot version needs the same shape minus the interactive prompts and minus the flip animation (D-11).
- **`humanAct` (`src/ui/flow.js:432`)** — the canonical definition of "a turn is move + exactly one action", including 🤝 Parley as an action. **This is the rule D-02/D-03 make bots obey**, and the reference for what "same rules as humans" means concretely.
- **`chooseAction` (`src/engine/`, called at `src/ui/flow.js:613`)** — the bot's action selector; the natural home for the hail if it becomes a first-class action.
- **Bot simulators** — `cocoa_pirates_sim.py`, `scripts/battle_sim.js`: usable to measure hail frequency and bot solvency for tuning D-04/D-07 empirically instead of by guess.

### Established Patterns
- **Engine purity** — `src/engine/` is DOM-free/Firebase-free and must stay so; the module-graph gate in `npm test` enforces the layer rules (ui must not import net, etc.). Storm *presentation* work belongs in `src/ui/flow.js`; only D-15's gust alignment touches `src/engine/`.
- **Event-then-narrate** — outcomes are recorded via `this.ev({t:...})` and rendered from that event stream; new storm narration should ride the existing event types (`moored`, `dodge`, `anchor`, `anchorHold`, `aground`, `shipwrecked`, `blocked`, `windmove`, `blownOut`) rather than inventing a parallel channel.
- **Determinism gates** — `npm test` (9 gates incl. the 19-watcher net inventory) and `node scripts/determinism_baseline.js --verify` (30 seeds, 12345–12374, 5 personalities rotated across 4 seats) must both be run; per D-15/D-16 the determinism result will change deliberately, once.

### Integration Points
- **`src/ui/flow.js:555-568`** (`botTurn` storm block) — where bot pushes become per-square and narrated (D-09/D-10/D-11).
- **`src/ui/flow.js:584-612`** (hail block) — where the hail becomes an action, gains ranked targeting, and gains scaled offers (D-02–D-07).
- **`src/engine/index.js:693-703`** (`takeTurn` storm block) — the single-gust simulator storm; the one engine edit (D-15).
- **`src/engine/index.js:260-290`** (`windPush`) — the shared push/outcome logic both paths rely on; where the "correct square" check for D-12 lives.
- **`scripts/determinism_baseline.js` + `scripts/fixtures/determinism/`** — the 30 golden fixtures to be re-recorded under D-15/D-16 (`scripts/rebase_source_hash.js` exists for the source-hash side).

</code_context>

<specifics>
## Specific Ideas

- **Wyatt's framing of the hail upgrade (verbatim intent):** *"it should hail intelligently — like a human would."* Prioritize players with 2+ of an ingredient (they have a spare); if hailing a single-holder, prefer one who could get more relatively easily; and sweeten the deal with doubloons to make it worth the player's time. Overall: *"make the bots smarter and more human with when and how they hail."*
- **Wyatt's framing of the fairness goal (verbatim intent):** *"snappiness is important; but we also want the sensation of 'fairness' by knowing that the bot is subject to the same rules as us."*
- **The reported symptom that started AI-01** (Phase 12 Safari playthrough):
  ```
  Flaky Jack pays 1 and sails
  Flaky Jack offered 5 for Wyyyy's Speckled Eggs — refused
  Flaky Jack casts a line, nets a candycrab (1)
  ```
  Reads as one bot taking two actions in a single turn.

</specifics>

<deferred>
## Deferred Ideas

- **Opening the hail trigger up so bots hail opportunistically** (while crates are still in the pool, when buying beats sailing) — considered and explicitly declined for this phase (D-05). It would make bots hail noticeably more often and is a real gameplay shift; revisit only if hailing proves too rare after D-04.
- **Bots hailing other bots** — would be a new capability, requires adding a hail concept to the deterministic engine, and would change the fixtures again. Out of scope (D-08).

### Reviewed Todos (not folded)
- **`eov-narration-box-not-cleared`** — "End-of-voyage leaves the narration box visible but empty." Matched the phase scan but is tagged `resolves_phase: 16` and is UI-07 in Phase 16's scope. Left for Phase 16.

</deferred>

---

*Phase: 14-Engine-Adjacent Gameplay Fixes & Determinism*
*Context gathered: 2026-07-26*
