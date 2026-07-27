# Phase 15: Narration Audit & Fixes - Context

**Gathered:** 2026-07-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a full narration audit to Wyatt as an approval gate, then apply the pruning he signs off on plus six specific narration corrections — so the game's voice reads naturally, consistently, and speaks to the player directly.

Requirements: **NARR-01, NARR-02, NARR-03, NARR-04, NARR-05, NARR-06.**

**Governing constraint for the whole phase:** this is a **presentation-tier** phase. Nothing here may change what `src/engine/index.js` records into the event stream — including adding a field to an existing event. Per the standing rule carried from Phase 14 (`.planning/STATE.md` §Blockers/Concerns), any such change invalidates all 31 determinism fixtures and forces another gated re-record. Every decision below was chosen to respect that. Narration text, narration timing, and how the host broadcasts narration are all fair game; the event stream is not.

</domain>

<decisions>
## Implementation Decisions

### NARR-01 — the audit deliverable and its approval gate

- **D-01: The audit is a browser page, not a document.** A throwaway HTML page (same pattern as the `art-review/gallery-*.html` pages Wyatt already reviews art with) rendering every narration line **exactly as it appears in-game** — seat colors, emoji, ingredient art — grouped by moment (round header / storm / docking / battle / trade & parley / fishing / shot clock / end of voyage). Wyatt's reason for choosing this over a markdown list: repetition has to be *felt* the way a player experiences it, and raw strings with `${}` placeholders and emoji-as-code hide that. — **Reversibility:** reversible — a throwaway review artifact, not shipped code.

- **D-02: Every line is tagged with a recommendation** — keep / cut / merge / rewrite — so Wyatt is reviewing a proposal, not a raw inventory. This is what NARR-01's "pruning recommendation" resolves to.

- **D-03: The audit page must cover BOTH narration sources.** The `EVENT_NARRATION` table (`src/ui/util.js:257-395`, ~26 lines) is not the whole surface — roughly 18 more one-off messages are hand-written `flash()` calls in `src/ui/flow.js` (the turn banner :570, the leeward warning :597, the trade-winds line :274/:531/:602, "yer too poor to afford powder" :542, the mid-storm second-leg line :659, the action prompt :522). An audit that only walks the table would miss the storm intro that NARR-03 is explicitly about. Grep both, or the audit is incomplete.

- **D-04: One review pass covers everything wording-related.** The page carries the pruning marks AND Claude's proposed new wording for NARR-02/03/04/05 side by side. Wyatt approves or rewrites all of it in a single pass. Rationale: he would want to approve new copy anyway (the standing project precedent — PROJECT.md Key Decisions: *"Storm-text audit produces a list back to Wyatt for rewrite | Copy is authored by Wyatt, not auto-generated"*), and reviewing pruning without seeing the replacement wording invites surprises.

- **D-05: Non-wording work proceeds in parallel and does NOT wait on the gate.** Specifically NARR-06's timing change and the `anchorHold` narration bug (D-13) — neither is a copy decision. Plan these so they are done and ready when sign-off lands, rather than idling the phase.

- **D-06: Bias the recommendation toward rewriting, not deleting.** Wyatt's explicit choice: keep roughly the same number of lines but make ones that currently blur together sound distinct (different verbs, different imagery) so a storm outcome doesn't read like a docking outcome. **Do not present an aggressive "one line per moment" cut as the default recommendation.** Flavor is not the thing being optimized away — sameness is.

### NARR-05 — second person, and how it survives multiplayer

- **D-07: The self-referential form is name-prefix + second person, in EVERY play mode.** Wyatt's own examples, verbatim: *"Crustbeard — you do this"*, *"Crustbeard — you're being attacked"*, *"Crustbeard — it's your turn"*. He initially scoped this to pass-and-play, then broadened it mid-discussion: *"i think we can keep the narration consistent across all play forms — they can all start with your playername (it adds immersion) before using 'you'."* So solo, online multiplayer, and pass-and-play all read the same way. **Consequence for planning:** there is ONE self-referential form to write, not two — this is simpler than the pass-and-play-only variant discussed earlier. Precedent already in the codebase: the turn banner at `src/ui/flow.js:570` renders `Ahoy, {name} — your turn!` for the local seat.

- **D-08: "You" applies when the player is the doer AND when they are the target.** "Crustbeard — you attack Davy Scones" and "Crustbeard — Davy Scones attacks you." Wyatt's reasoning for going past NARR-05's literal "an action you took": once some lines say "you", a line naming you in the very next breath reads as a bug. Scope estimate given at decision time: ~44 lines gain a second version (vs ~30 for doer-only).

- **D-09: Round headers and storm banners stay addressed to the table.** `newround` (`src/ui/util.js:262`) and the storm intro speak to everyone at once; rendering them in second person would imply only the local player is affected. Explicitly rejected as an option.

- **D-10: The host broadcasts BOTH variants plus the subject seat; each client picks.** This is the mechanism, and it was chosen deliberately over two alternatives.

  **The problem it solves:** the big message box and the captain's log work differently. The log is rebuilt locally by every browser from the event stream via `describe()` (`src/ui/util.js:397`), so it can already personalize per viewer for free. The **live message box cannot** — `flash()` (`src/ui/panel.js:374`) calls `onBroadcast(msg)` → `netNarrate` (`src/orchestrator.js:264`) → `netSetNarr` (`src/net/writers.js:85`), which writes a single rendered HTML string to `rooms/{code}/narr`; every guest's `watchNarr` (`src/orchestrator.js:910`) shows the **host's** words verbatim. A host rendering "you" would make every guest read "you" about someone else.

  **The chosen shape:** widen the `narr` payload from `{html, t}` to carry the second-person variant and the subject seat, and have each client select. Purely additive to the Firebase payload — no engine change, no event-stream change, **no determinism risk**.

  **Rejected — "each browser writes its own from the event stream":** cleanest in principle, but the ~18 ad-hoc `flash()` messages (D-03) are not events and would still need the string path, leaving two systems to keep in step.

  **Rejected — "log only in multiplayer":** zero networking change, but the box Wyatt actually watches during an online game would keep naming him.

  — **Reversibility:** reversible — additive fields on a live-only sync node; guests that don't understand them fall back to the existing `html`. Worth writing the fallback deliberately so a mid-game version skew degrades to today's behavior rather than a blank box.

### NARR-02 — the missing "broke" lines

- **D-11: Add a line for BOTH broke moments** (Wyatt selected "Both", not one):
  1. **Can't afford to sail.** A captain with 0 coins gets no move and the game says nothing. `src/ui/flow.js:595` gates the whole sail block on `p.coins>0`, and `:603` carries an explicit comment declining to narrate it ("the action prompt right after already explains it"). That reasoning only holds for a **human** — `humanAct`'s prompt at `:522` does explain it. **A bot has no such prompt**: `src/ui/flow.js:676` gates the bot's sail on `p.coins>0` and silently skips it, so a broke bot appears to forget its turn. This is the most likely origin of the reported symptom and must cover bots as well as humans.
  2. **Can't afford to anchor in a storm.** `src/ui/flow.js:226` only offers "Pay 1🌕 to anchor" when `p.coins>=1`; when broke the option silently vanishes. The prompt at `:236-238` hints at the consequence but no line states plainly that the anchor is out of reach.

### NARR-04 — the bribe line

- **D-12: Split the battle-coin narration into "genuine bribe" vs "cleaned out".** Today one sentence covers both (`src/ui/util.js:370`): *"{loser} bribes their way out of giving away a crate with {spoil}."* The two real cases (`src/engine/index.js:570-574`):
  - `spoil="5 coins"` — the loser holds ≥5 coins and the winner needs nothing in their hold. **A real bribe** — they paid rather than part with a crate. Keep the bribe framing.
  - `spoil="N coins (all they had)"` — the loser has **no crates at all** and fewer than 5 coins. **Not a bribe** — there was no crate to withhold and nothing to bargain with; the winner simply scrapes up what was left. This is the case that produces Wyatt's reported *"with 2 🪙"* (a loser holding 2 coins renders "2 coins (all they had)"), and "(all they had)" should become real wording rather than a trailing parenthetical.

  **Note for the record:** NARR-04's write-up in REQUIREMENTS.md has the two amounts attached to the wrong situations ("with 2 🪙 when a crate is given" — when a crate changes hands, no coins move at all). The split Wyatt described is real; the mapping in the requirement text is not. Follow this decision, not the requirement's literal phrasing.

- **D-12a: The `asym` "raider" branch is dead code — do NOT change battle rules.** Wyatt raised a concern mid-discussion that attacker and defender losses should be symmetrical: *"If an attacker loses, they should face the same consequences as the defender in the case that the defender loses. The defender should get 5c or their crate of choice; the outcome should be symmetrical."* **Verified: they already are.** `asym` is hardcoded `false` in `roundCfg` (`src/engine/index.js:821`), so the raider branch at `:567-568` never executes and its `"2c (raider)"` string can never reach a player. Both attacker and defender losses fall through the same `else` block at `:569-575`. **No rules change, no engine change, no determinism re-record.** Removing the dead branch is not part of this phase (see Deferred Ideas).

### NARR-05 (second part) — the "already anchored safely" gap

- **D-13: This is a bug, not wording, and needs no copy decision.** When a storm pushes a player into a second island in the same turn, the already-paid anchor holds and the engine records an `anchorHold` event — but the human path at `src/ui/flow.js:224` fires `ev()` and `liveRender()` with **no `narrateLastEvent()` call**, so the line never plays on your own turn. Bots narrate every storm event they hit (`botWindLeg`, `src/ui/flow.js:306-309`, per Phase 14's D-11). That is exactly the reported "this line only appears for other players/bots". Adding the missing narrate call closes it. Existing copy at `src/ui/util.js:318`.

### NARR-06 — the timing cut

- **D-14: 10% off the hold for both the human and the bot narration curves; speech bubbles keep today's timing.** Two constants change: `MSG_HOLD_MULTIPLIER` (`src/ui/util.js:533`, currently `0.8` — already carrying v1.0's 20% cut, so this stacks) and `BOT_MSG_HOLD_MULTIPLIER` (`src/ui/util.js:568`, currently `0.5`). **This is the HOLD only** — `REVEAL_MS_PER_CHAR` (the typing-in rate, `src/ui/panel.js:289`) stays untouched, matching how v1.0's cut was scoped.

- **D-15: Chat bubbles must be deliberately excluded, which requires a small separation.** `showChatBubble` (`src/ui/panel.js:335`) currently calls the shared `msgHoldMs(text)`, so cutting that constant silently shortens chat bubbles too. Wyatt's reason for excluding them: a bubble is another player typing to you, not the game reporting — you want the extra beat to notice it. Give bubbles their own hold multiplier (or their own function) so the two can drift apart intentionally.

### Claude's Discretion

- **How the audit page is generated** — hand-written HTML, a small script that walks `EVENT_NARRATION` and the `flash()` call sites, or a mix. Wyatt cares about the rendered result and the grouping, not the mechanism. A script is preferable if it makes the "did we miss a line?" question answerable, given D-03.
- **The exact new multiplier values** for D-14 (0.8 → 0.72 and 0.5 → 0.45 are the literal readings; round as feels right).
- **The exact shape of the widened `narr` payload** in D-10 — field names, whether the second-person string is pre-rendered by the host or assembled client-side — as long as an older client falls back to today's `html` rather than breaking.
- **Draft wording for every new/changed line** — Claude drafts, Wyatt approves via D-04's single review pass.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

ROADMAP.md carries no `Canonical refs:` line for Phase 15. The list below was accumulated from REQUIREMENTS.md, ROADMAP.md, PROJECT.md, prior-phase context, and the codebase scout during this discussion.

### Requirements and phase scope
- `.planning/REQUIREMENTS.md` — NARR-01 (line 35) … NARR-06 (line 40). **Read D-12's note before trusting NARR-04's literal phrasing.**
- `.planning/ROADMAP.md` §"Phase 15: Narration Audit & Fixes" — goal and the 5 success criteria.

### Binding constraints carried forward
- `.planning/STATE.md` §Blockers/Concerns — **the standing determinism rule.** Any change to what the engine emits into the event stream (including adding a field to an existing event) invalidates all 31 fixtures and forces a gated re-record. Prefer UI-tier fixes. This is why D-10 widens the Firebase narration payload rather than the event stream.
- `.planning/phases/14-engine-adjacent-gameplay-fixes-determinism/14-CONTEXT.md` — D-11/D-13/D-14/D-21/D-27 (the most recent narration work: which storm lines exist, the Wyatt-approves-copy gate as actually run, and why `moored` was collapsed at the narration layer only). D-27 in particular established that most storm copy already existed and the gap was *surfacing* it — the same shape as D-13 here.
- `.planning/phases/13-multiplayer-turn-clock/13-CONTEXT.md` §D-10 — pause/timer are wall-clock/UI concerns, not engine state. The same boundary applies to narration timing.
- `.planning/PROJECT.md` §Key Decisions — *"Storm-text audit produces a list back to Wyatt for rewrite | Copy is authored by Wyatt, not auto-generated"*, the precedent behind D-04.
- `docs/DETERMINISM-RERECORD.md` — what a re-record costs, if anyone is tempted.

### Codebase maps
- `.planning/codebase/ARCHITECTURE.md` — layer boundaries (ui must not import net; engine stays DOM/Firebase-free).
- `.planning/codebase/TESTING.md` — the harness/gate story; `npm test` is 12 gates plus `node scripts/determinism_baseline.js --verify` at 31 seeds.

### Not available
- `notes/edits for pastry pirates-2.pdf` (the v1.2 playtest punch list, cited in PROJECT.md) is **not in the repo** — `notes/` is gitignored and lives only in Wyatt's main working copy. Do not plan around reading it; NARR-01…06 are fully transcribed in REQUIREMENTS.md and refined by the decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`EVENT_NARRATION` (`src/ui/util.js:257-395`)** — the single table mapping each event type to its long-log text, board pops, and mini-log caption. ~26 entries. The primary audit target and the primary edit surface.
- **`describe()` (`src/ui/util.js:397`)** — renders one event's text from the table. **Runs on the host, on every guest, and again during reload-replay** (see the file's own comment at :232-236). Anything viewer-dependent added here is automatically per-viewer, which is why the captain's log gets second person for free.
- **`art-review/gallery-islands.html`** — the existing throwaway review-page pattern Wyatt already uses for art sign-off. The model for D-01's audit page.
- **`seatLocal(s)` (`src/ui/util.js:667`)** and **`decisionIsLocal(s)` (`:671`)** — the existing "is this me?" predicates. Already used for the handful of second-person lines that exist today (`src/ui/flow.js:274, 531, 542, 570, 597, 602`) — those six are the working precedent for D-07/D-08's form.
- **`pn(i)` / `poss(i)` (`src/ui/util.js:207-209`)** — the colored-name renderers every third-person line goes through. The natural seam for a name-prefix + second-person variant.
- **`msgHoldMs()` / `botMsgHoldMs()` (`src/ui/util.js:534, 569`)** — the two hold curves, each already fronted by a single named multiplier constant precisely so pacing can be tuned without a code hunt (Phase 14's D-10 set this up). D-14 changes two numbers.

### Established Patterns
- **Engine purity / event-then-narrate.** Outcomes are recorded via `this.ev({t:...})` and rendered from that stream. All Phase 15 work rides existing event types — **no new events, no new fields.**
- **Copy is authored by Wyatt.** Claude drafts, Wyatt approves, then it ships. Ran twice already (v1.0 storm text, Phase 14's storm/hail lines).
- **Two narration surfaces with opposite properties.** Live box = host-rendered and broadcast verbatim (`netSetNarr` → `watchNarr`). Captain's log = rebuilt locally from events by every client. Any "personalize per viewer" work must handle these separately — this is the single most important thing for the planner to internalize about NARR-05.
- **Replay safety.** `sleep()` is a no-op during replay, and `netNarrate`/`netBroadcast` both early-return on `appState.replaying`. Timing changes are replay-safe by construction.

### Integration Points
- **`src/ui/util.js:257-395`** — `EVENT_NARRATION`; pruning, rewrites, the bribe split (D-12), and the second-person variants (D-07/D-08).
- **`src/ui/flow.js`** — the ~18 ad-hoc `flash()` messages (D-03): the storm intro at **:570** (NARR-03's target), leeward :597, trade winds :274/:531/:602, powder :542, second storm leg :659, action prompt :522.
- **`src/ui/flow.js:224`** — the missing `narrateLastEvent()` for `anchorHold` (D-13).
- **`src/ui/flow.js:595-603`** and **`src/ui/flow.js:676`** — the two broke-can't-sail gates, human and bot (D-11 case 1).
- **`src/ui/flow.js:226`** — the broke-can't-anchor gate (D-11 case 2).
- **`src/ui/util.js:533, 568`** — the two hold multipliers (D-14).
- **`src/ui/panel.js:335`** — `showChatBubble`'s shared `msgHoldMs` call, which must be separated (D-15).
- **`src/net/writers.js:85` (`netSetNarr`), `src/orchestrator.js:264` (`netNarrate`), `src/orchestrator.js:910` (`watchNarr`)** — the three points the widened narration payload touches (D-10).
- **`src/engine/index.js:570-574`** — read-only reference for D-12's two coin cases. **Do not edit.**

</code_context>

<specifics>
## Specific Ideas

- **Wyatt's second-person format, verbatim:** *"in pass-and-play, start with {playername} before saying you -- eg. Crustbeard -- you do this; or Crustbeard -- you're being attacked; or Crustbeard -- it's your turn"*, then broadened: *"i think we can keep the narration consistent across all play forms -- they can all start with your playername (it adds immersion) before using 'you'."* **Immersion is the stated reason** — the name is not a disambiguator he tolerates, it is part of the effect he wants.
- **Wyatt's symmetry principle for battles:** *"If an attacker loses, they should face the same consequences as the defender in the case that the defender loses. The defender should get 5c or their crate of choice; the outcome should be symmetrical."* Already true in shipped play (D-12a) — recorded here because it is a rule he cares about and any future battle-spoils work must preserve it.
- **Why the browser page over a document:** repetition has to be judged the way a player experiences it — rendered, in sequence, with art and color — not as raw strings.
- **Why bubbles are exempt from the timing cut:** a bubble is another player talking to you, not the game reporting; it deserves the extra beat.

</specifics>

<deferred>
## Deferred Ideas

- **Remove the dead `asym` / raider battle branch** (`src/engine/index.js:567-568`, mirrored `src/orchestrator.js:516`). Verified unreachable (`asym:false`, `roundCfg` :821). It is dead code carrying a player-facing string (`"2c (raider)"`) that can never render. **Deliberately not in Phase 15** — deleting an engine branch is a code-cleanliness change in a narration phase, and touching battle spoils at all sits next to the determinism corpus. Worth a backlog item.
- **Sound effects, interactive tutorial, island redesign** — already deferred to a later milestone (PROJECT.md).
- **STORM-02 — multiplayer guest storm-push parity** — already backlogged at Phase 14 close.

### Reviewed Todos (not folded)
- **`eov-narration-box-not-cleared`** (`.planning/todos/pending/`, `resolves_phase: 16`) — "End-of-voyage leaves the narration box visible but empty." Matched this phase at 0.9 because it concerns the narration box, but it is a panel-visibility bug, not narration copy, and Phase 16's **UI-07** already scopes it explicitly ("the empty narration/action box is hidden/collapsed once the End-of-Voyage summary appears"). Left where it is to avoid duplicating scope across two phases.

</deferred>

---

*Phase: 15-narration-audit-fixes*
*Context gathered: 2026-07-27*
