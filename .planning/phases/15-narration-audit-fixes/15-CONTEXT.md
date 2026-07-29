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

<review_addendum>
## Review Addendum — added during the 15-05 approval gate (2026-07-28)

**D-16 — Icons are out of scope for Wyatt's review; keep every one of them.**

Wyatt's verbatim note while working through the audit page: *"I'm editing the narration now, but
in my notes i'm unable to copy-paste in the icons that are integrated in the text. I want all
icons that are currently used to be kept -- my notes are just about the words."*

**Binding rule for plan 15-06 (and any continuation agent writing `15-COPY-APPROVED.md`):**

- His dispositions and rewrites cover **words only**. The notes field on the audit page cannot
  carry the inline icon markup, so its absence from a note is a limitation of the tool — it is
  **never** an instruction to remove an icon.
- Every icon/image currently rendered inside a narration line **stays**, in the same role and the
  same relative position, unless he says so in words (e.g. "drop the coin icon here").
- When applying a reworded line, re-attach the existing icon markup to the new wording rather
  than shipping the plain-text note as the literal new string. A rewrite that silently drops an
  `<img class="narrIcon">`, an ingredient image, or a coin glyph is a **defect**, not a faithful
  transcription.
- This applies equally to lines he tags `merge` — the surviving line keeps its icons.
- Verification for 15-06: the icon inventory of the shipped narration must be a superset of the
  pre-15-06 icon inventory, minus only icons he removed in words.

**D-17 — Ingredients in trade/parley narration use system emoji instead of the custom art.**

Wyatt's verbatim note: *"many of the narrations still use the original emojis. none of them should --
they should all use the custom images we made (for coin heads, coin tails, and coin). Audit all
narrations to replace the emojis."*

**Audit result — the premise is right, but the cause is narrower than "emoji everywhere in source."**

The raw emoji in the narration source (102 occurrences of `🌕`/`⚪`/`⚫`, ~145 of everything else)
are *deliberate shorthand*, not a bug. `emojify()` (`src/shared/index.js:102`) swaps them for custom
art via the 70-entry `EMOJI_IMG` map at two chokepoints that between them cover every narration
surface: `describeFor()` (`src/ui/util.js:542`) for the `EVENT_NARRATION` table, and `panel()`
(`src/ui/panel.js:188`) for every ad-hoc `flash()` line. **Coin, heads and tails — the three Wyatt
named — are all in the map and already render as custom art in-game.** Verified by rendering the
audit page headless: 105 `narrIcon` `<img>` tags emitted.

**The genuine defect is the ingredient emoji.** Two parallel helpers disagree:

| Helper | Output | Used by |
|---|---|---|
| `ilabelImg(x)` (`src/shared/index.js:137`) | `<img class="narrIcon" src="assets/ingredients/wheat.png"> Toasty Wheat` — **custom art** | docking, aground, shot-clock-skip |
| `fmtItem(x)` (`src/ui/util.js:211`) | `🌾 Toasty Wheat` — **raw system emoji** | trade, parley (8 call sites) |

**There are 7 ingredients in play, not 9** (Wyatt's correction, confirmed in source). `ING_ALL`
lists nine, but `roundCfg` sets `nIslands: 7` and the engine takes `ING_ALL.slice(0, cfg.nIslands)`
(`src/engine/index.js:94`) — so only **wheat, dairy, sugar, eggs, cocoa, spice, vanilla** are ever
placed. `salt` and `honey` are vestigial: they have `ING_EMOJI` entries but **no art on disk** and
are never dealt. `src/shared/index.js:12` says so outright. Any fix or count here is over 7, and
`salt`/`honey` must not be used as evidence that art is missing.

None of the seven in-play ingredient emoji (`🌾🥛🍬🥚🍫🌶️🌼`) are keys in `EMOJI_IMG`, so
`emojify()` cannot rescue them — they reach the screen as system emoji. Worse, `fmtItem` *does* map
`"coins"` to `🌕`, which **is** in the map, so a single trade line renders custom coin art sitting
next to a system-emoji ingredient. That is precisely the inconsistency Wyatt spotted.

**The art already exists — no new assets needed** (Wyatt: *"the images for those ingredients do
already exist -- they are used on the islands, and in the captain's box. those are the exact same
images that should be used as the emojis inline when the ingredients are discussed."*). The asset
set is `ING_IMG[x]` → `assets/ingredients/{x}.png` (`src/shared/index.js:19`) — exactly the seven
files on disk, and exactly what already draws the island art, the captain's-box crates, and the
docking narration via `iconImg(ING_IMG[e.ing])`. The inline ingredient icon must be **that same
image**, not a new or resized variant.

**Fix for plan 15-06:** make `fmtItem()` render ingredients through the same custom art as
`ilabelImg()` (`<img class="narrIcon" src="${ING_IMG[x]}">`), keeping its existing coin handling.
Affects the 5 trade/parley narration lines (`parley`, `trade` and their addressed variants). Do
**not** bulk-replace emoji in source — that shorthand is load-bearing and `emojify()` already
handles it. Verification: no narration `.msgBox` on the audit page renders a raw ingredient emoji,
the inline `src` matches the island/captain's-box `src` for the same ingredient, and `npm test`
stays green.

**D-18 — Wyatt's governing design intent for narration (supersedes any conflicting reading).**

Verbatim: *"all players, whether they be bots or human, are treated the same and described the same.
The only difference is whether the player is YOU or someone else— that just changes the perspective
tense."*

**One axis of variation only: viewer perspective.** Not actor type. A bot doing X and a human doing
X must produce the *same* sentence; the only thing that may differ is whether the reader is the one
who did it ("you") or not (their name). Any code that narrates differently because the actor is a
bot is a defect against this rule.

**Audit — what currently violates it:**

| # | Violation | Evidence |
|---|---|---|
| 1 | Two parallel turn/storm pipelines split by actor type | `humanTurn`/`humanWind`/`windLeg` vs `botTurn`(`flow.js:690`)/`botWindLeg`(`flow.js:313`) |
| 2 | Same moment, two different wordings — and one is broken | Second storm leg: `flow.js:373` hardcodes "you" with **no viewer branch** (so spectators of a human's turn also read "you"); `flow.js:702` is always third person |
| 3 | Two turn-start banners | human `flow.js:613` vs bot `util.js:874` (`narrateCurrent`) |
| 4 | **Bot narration displays ~38% shorter** | `botMsgHoldMs` (0.45) vs `msgHoldMs` (0.72) — the same event is readable for less time when a bot did it. **Open question for Wyatt: deliberate pacing, or a violation to remove?** |
| 5 | Two event types for one concept | `parley` vs `trade` — see D-19 |

**Root cause:** the code is organised by *who acts*; the narration must be organised by *what
happened*, with viewer perspective applied at render time. Plan 15-01 already built exactly the
right mechanism (one viewer-neutral line + per-seat addressed variants). The bot/human split
predates it and was never collapsed. **Direction for 15-06: delete actor-specific narration; one
narration path per event; let the viewer axis do all the work.**

**D-19 — Merge `parley` into `trade`; successful `parley` is pure duplication.**

Wyatt: *"it is messy to have two duplicate flows… Can you merge the parley and trade logic so that
it's just one flow?"* He also asked whether successful-parley ever fires. **It does — and when it
does, it double-narrates.**

- `parley` with `ok:false` — `flow.js:512`, `flow.js:521` (human trade refusals). **Unique content.**
- `parley` with `ok:true` — only `flow.js:756` (bot hail), and lines 757–761 immediately emit a
  **`trade` event for the same swap**. So one accepted hail produces two captain's-log lines saying
  the same thing. The successful branch of `parley` is redundant in every case it can fire.

**Fix for 15-06:** one flow. A single `trade` event carrying an `ok` field (and the existing `kind`
of `swap`/`buy`/`counter`/`hail`); the refusal wording becomes a branch inside the one `trade`
builder. Remove the `parley` event type and its table entry. Verify no accepted hail emits two
events. This is the merge Wyatt asked for — **not** the plain `cut` his disposition file recorded,
which would have silenced refusals.

**D-20 — Disposition tags: where a `keep` tag carries edit text in `notes`, the NOTES WIN.**

Wyatt: *"For the entries tagged as 'keep' but I gave edits— use my edits; I forgot to change the
dropdown from 'keep' to 'rewrite'… The tag is a mistake."* Affects `table:sidebet`, `table:fish`,
`table:finish`, `adhoc:flow.js:640`, `adhoc:flow.js:646`, `adhoc:flow.js:722`, and any other row
where `finalTag: "keep"` coexists with non-empty `notes` containing replacement wording. Treat a
note that is a *question* to Claude (not replacement copy) as a question, not a rewrite.

**D-21 — The audit page must render EVERY branch, not one representative case per line.**

Wyatt: *"I wanted your audit page to render every line of narration in the game— that means the
tails branches too— so I'm not happy that candycrab was missing (how am I supposed to edit it if
it's missing?) and it makes me wonder what else is missing."*

**He is right, and candycrab was not the only gap.** Measured by rendering every realistic field
combination through the live builders: the page showed **~26** renderings for the `EVENT_NARRATION`
table; the builders actually produce **62+ distinct player-visible texts** (a floor — the count
under-samples config-gated branches). **More than half the table's wordings never appeared on the
page he was asked to approve.**

Per-line gaps (distinct texts the builders produce, vs the single case the page rendered):

`dock` 8 · `parley` 6 · `moored` 4 · `aground` 4 · `sidebet` 4 · `shotclockskip` 4 · `blocked` 3 ·
`battleflee` 3 · `bakeoff` 3 · `fish` 3 outcomes (heads→sugarfish, tails+sardine→candycrab,
tails→empty — only the heads case was shown).

Only `battle` was handled correctly (its bribe/cleaned-out split was rendered as two cards).

**Requirement for the rebuilt page:** enumerate every branch of every builder — every `got`/`heads`
/`reason`/`ok`/`winner`/`ing`-present value and every config-gated variant (`cfg.sardine`,
`cfg.tradeBonus`) — and render each as its own editable, separately-taggable card, each still
paired with its addressed "you" variant. Same for the ad-hoc lines. A line the page cannot render
is a line Wyatt cannot approve, so an un-rendered branch is a **blocking defect**, not a nicety.
Add a self-check that fails if any builder yields a text no card displays.

**D-22 — The rebuilt audit page is a FLOW CHART, not a list.**

Wyatt: *"I want you to format it more intelligently for a designer to rewrite and see each line of
dialogue in the context of the lines that will come before it and after it in a real game. Use
branching and flow chart conventions (including connecting lines) to show which narration line will
go to which next one, and display them on the html site accordingly."*

The audience is a **designer rewriting copy**, and copy can only be judged in sequence — a line
reads differently depending on what preceded it. A flat grouped list cannot show that.

**Requirements:**

- **Real sequence, derived from code — never invented.** Trace the actual turn flow (`humanTurn` →
  `humanWind`/`windLeg` legs 1 and 2 → per-square outcomes → `humanAct` → action outcomes → shot
  clock → round roll-over → `finish`/`bakeoff`/`end`) and build the edge list from those call
  paths. A wrong edge is worse than no edge: it would have him rewriting for a sequence that never
  happens. Where reachability is genuinely uncertain, mark the edge as such rather than guessing.
- **Connecting lines must be actually drawn** (SVG edges, positioned after layout), not implied by
  indentation. They must survive window resize and must not sit on top of the editing controls.
- **Branch points are forks.** This composes with D-21: every branch that must be rendered as its
  own card is exactly a fork in the chart. A `dock` with 4 outcomes is a 4-way fork, not one card.
- **Editing affordances survive the redesign.** Per-card tag control, notes field, localStorage
  persistence and JSON export are how Wyatt works — the chart must not cost him any of them.
- Keep each card's addressed "you" variant alongside its neutral text (D-07/D-10 shape).
- No external/CDN libraries (project has no build step; the page already imports live ES modules
  from `src/` and must keep doing so, so it stays truthful to shipped code).

**D-23 — Bot and human narration hold for the SAME duration (parity now; speed slider later).**

Wyatt: *"Narration events will ultimately have a 'speed' slider which lets users make them all
appear faster and slower. For the moment, let's have all bot narration events last the same length
as humans so we can finally bring everything into parity."*

Resolves the open question in D-18 violation #4 — the bot/human timing split is **a violation, not
deliberate pacing.**

- Collapse `botMsgHoldMs` (multiplier 0.45) into `msgHoldMs` (0.72). Call sites: `flow.js:333`,
  `flow.js:352`, `flow.js:702`, `flow.js:722`, plus any inside `botBeat`.
- **This does NOT touch the chat-bubble curve.** `CHAT_BUBBLE_HOLD_MULTIPLIER` (0.8, added in 15-02)
  is a *bubble vs narration* distinction, deliberately kept (see Specific Ideas above: "a bubble is
  another player talking to you"). D-23 collapses **bot vs human**, nothing else.
- **Forward-looking:** keep the resulting hold a single centralized multiplier so a future global
  speed slider can drive it from one place. Do not scatter new per-call-site durations.
- **Flagged, NOT auto-included — needs Wyatt's confirmation:** `BOT_STORM_STEP_MS` vs
  `STORM_STEP_MS` is a second bot/human timing difference, but it paces the *animation between
  storm squares* rather than how long narration text is readable. It is adjacent to this decision
  and arguably in the spirit of "bring everything into parity," but he asked specifically about
  narration events. 15-06 must surface this rather than silently changing it.

</review_addendum>

---

*Phase: 15-narration-audit-fixes*
*Context gathered: 2026-07-27*
*Review addendum: 2026-07-28*

<review_addendum_2>
## Review Addendum 2 — 2026-07-29

**D-24 — The captain's log is a THIRD-PERSON stream. Applied.**

Wyatt: *"i want the captain's log to be simply a 3rd-person stream of exactly what happens in the
narration"* → after discussion: *"make it third-person, it's one line"*.

**Facts established while investigating (correct the record — his initial read was understandable
but wrong in both directions):**

- The log was **never bespoke**. `syncLogLines()` called `describe()`, i.e. the same
  `EVENT_NARRATION` table that feeds the message box. One entry, two surfaces; a copy edit lands in
  both automatically.
- Action prompts (*"Ahoy Crustbeard, what do you want to do?"*) **structurally cannot** enter the
  log: the log is built from `game.events`, and prompts are `panel()` calls that emit no event.
  The behaviour he said he wanted was already guaranteed.
- The real gap was the opposite of his suspicion: `describe(e)` → `describeFor(e, undefined)` →
  `isLocalTo(seat, undefined)` → `seatLocal(seat)` → reads live `appState.mySeat`. So the log was
  **second person for your own moves** ("Crustbeard — you pay 1🌕 and sail").

**Change applied (`src/ui/util.js`, `src/ui/board.js`):** `syncLogLines()` now calls
`describeFor(e, NEUTRAL_VIEWER)`, forcing every builder's un-addressed branch. The demo-board log
seed in `board.js` was changed identically — behaviourally a no-op there (`mySeat` is null, so it
already resolved neutral) but made explicit so the two log-building paths cannot drift.

**Explicitly NOT changed:** the message box keeps addressing the player directly via its own
per-seat variants. `describe()`'s remaining callers are the round-header flashes
(`orchestrator.js:699`, `:720`), which should stay addressed. The stale comment at `util.js:529`
claiming "every existing describe() consumer keeps personalising per client" was corrected.

**Standing context — the log is low priority.** Wyatt: *"i don't see the log being used very much by
real-world players… we now have firebase logs for you to refer to to debug… players are simply
playing the game, not reading the log. I'm not sure it's worth prioritizing it any more."* Do not
expand log work beyond this. It predates the narration box and is not a design surface worth
investment.

</review_addendum_2>

**D-25 — Pass-2 tag semantics: `keep` means "keep AS DISPLAYED ON THIS CARD".**

Wyatt: *"i'm going to make sure my tags are all correct this round -- keep should mean 'keep as is
displayed here' not 'keep whatever i did in pass 1'."*

**The pass-2 export is self-contained and authoritative.** Every tag refers to the text rendered on
that card at the moment he set it. It does NOT refer to, defer to, or inherit from his pass-1
disposition. He is setting every tag explicitly this round, so pass-1 marks and the "from pass 1"
badges are superseded wherever the two disagree — **pass 2 wins, unconditionally.**

**The trap 15-06 must not fall into.** Many cards already display the NEW phase-15 wording — the
DRAFT lines introduced by plans 15-01 through 15-04 (second-person forms, the rewritten storm
intro, the broke-sail/broke-anchor lines, the split bribe/cleaned-out battle line). On those cards:

- `keep` = **ship the draft text shown on the card**. It does NOT mean "revert to the pre-phase-15
  wording", and it does NOT mean "this line was never changed".
- The only source of truth for what `keep` preserves is the card's rendered text, which is why
  D-21 (every branch must render) is a precondition for this convention working at all — a tag on a
  card whose text he could not see would be meaningless.

**Where a `rewrite` tag carries wording in `notes`, apply the notes** (unchanged from D-20; D-20's
"the notes win over a mistaken keep tag" rule was a pass-1 correction and is now moot, since he is
setting tags deliberately this round — but a note that is a *question* is still a question, never
copy).


**D-26 — Strip the pass-1 badges; infer intent from what Wyatt actually wrote.**

Wyatt: *"strip the badges. also, write some simple intelligence for the tags to make sure my intent
is understood -- if i have written new language in the textbox, then that implies i want a rewrite
-- so assume a rewrite. if i have written nothing in the text box, that implies a keep. if i
explicitly choose 'merge' or 'cut' as a tag, that's a deliberate choice."*

**Remove the "from pass 1" badges entirely** — under D-25 the pass-2 export is self-contained, so a
badge claiming inherited history is noise at best and misleading at worst.

**Derived-intent rules (in precedence order):**

1. Tag is `cut` or `merge` → **that intent, always.** Deliberate selections; never overridden by
   the notes box. Any notes are reasoning, not replacement copy.
2. Notes box is empty → **`keep`** (ship the text as displayed on the card, per D-25).
3. Notes box has content → **`rewrite`**, and the notes ARE the new copy.

**The sharp edge — questions must never become copy.** In pass 1 Wyatt used the notes box for
questions to Claude (*"Note for claude: i don't think this is called any more…"*, *"Where is this
called? Is it called anywhere?"*, *"isn't there a candycrab line too?"*). Under rule 3 those would
silently become the shipped narration text. Two mitigations, **both required**:

- **A separate "Question for Claude" field per card**, so a question is never typed into the copy
  box in the first place. It carries into the export as `question` and never affects intent.
- **A visible derived-intent line on every card**, computed live as he types, in plain language:
  `→ KEEP as displayed` / `→ REWRITE to: "<text>"` / `→ CUT` / `→ MERGE with <target>`. This makes a
  misread self-evident at edit time rather than at apply time. This is the primary safety net —
  the page must never infer silently.

**Also surfaced by the derived line:** tag `rewrite` with an empty notes box resolves to `keep` under
rule 2. The card must say so explicitly (`→ KEEP as displayed (no new wording given)`) so he can
see and correct it rather than losing an intended rewrite.

**Export contract for 15-06:** each row carries the raw `tag`, the raw `notes`, the optional
`question`, AND the resolved `intent` (`keep`/`rewrite`/`cut`/`merge`) plus `finalText` where the
intent is `rewrite`. **15-06 reads `intent`/`finalText` and re-infers nothing** — the inference
happens once, on the page, in front of Wyatt, where he can see and correct it.


**D-27 — Pass 2 is INCOMPLETE: only the first 17 rows are Wyatt's. Everything after is stale.**

Wyatt: *"I actually did not get as far as that in my writing session just now, I only got down to
here: [Reason: dock — storm shoved you onto it THIS turn] … so every decision 'made' after that is
actually left over from pass 1."*

**Cutoff: `table:moored~dockMoved` — row 17 of 81** in
`.planning/phases/15-narration-audit-fixes/15-DISPOSITIONS-PASS2.json` (inclusive; he edited it).

- **Rows 1–17 — genuinely reviewed in pass 2.** Authoritative under D-25/D-26.
- **Rows 18–81 (64 rows) — NOT decisions.** Pass-1 leftovers the page pre-filled. 30 of them carry
  notes that D-26's inference would turn into rewrites, and 21 carry non-`keep` tags. **None of it
  may be applied.** This includes every `battle`, `fish`, `sidebet`, `parley`, `tradewind`,
  `battleflee` and coin-flip mark.

**Root cause (mine, not his):** I instructed the page to pre-fill sibling cards from pass-1 marks to
save him work. Under the old tag-based reading that was harmless; under D-26 (text ⇒ rewrite) a
pre-filled note becomes an instruction to change copy he never looked at. Compounding it, the page
gave no way to distinguish *"Wyatt decided this"* from *"this is a default he never touched"* — so a
partial session exports looking complete.

**Required — a per-card `reviewed` state.** The page must record when Wyatt actually interacts with
a card (changes its tag, types in notes/question, or explicitly clicks a "reviewed / looks good"
affordance) and must:

- Export `reviewed: true|false` per row. **15-06 applies ONLY `reviewed: true` rows.** An unreviewed
  row is not a `keep` — it is *unknown*, and must be left exactly as the code currently is.
- Show a visible progress counter (`17 of 81 reviewed`) and visually distinguish untouched cards, so
  an incomplete pass is obvious both to him and to anyone reading the export.
- Never let a pre-filled default count as reviewed.

**Seeding rule (with D-26's exact-id rule):** seed rows 1–17 as reviewed with their marks intact;
seed rows 18–81 as **unreviewed with empty notes**, discarding the inherited pass-1 text entirely.

**D-19 CONFIRMED by Wyatt — the `parley` `cut` tags mean MERGE.** *"yes, treat the parley cuts as the
merge"*. `parley` folds into `trade` as designed in D-19; the two `cut` tags in the pass-2 file are
superseded. (Those rows are in the stale range anyway, but the decision itself is now explicit and
stands regardless of what a later export says.)


**D-28 — Cards that render shared wording must say so, BEFORE Wyatt edits them.**

Wyatt asked whether to tag `table:moored~dockStill` as `merge`, because it renders text byte-identical
to `table:moored` (`justDocked`) and the Tortuga-berth card. **Correct answer: `keep`** — those three
are not three copies to consolidate, they are **one string with three doors into it**:

```js
const stillDocked=`${pn(e.p)} is still docked, so the storm can't run them aground.`;
const L={ justDocked:stillDocked, dock: moved ? `Lucky break!…` : stillDocked, home:stillDocked };
```

A `merge` tag here would send 15-06 hunting for duplicate strings to consolidate — the right
instruction for the four trade-wind rim sweeps (genuinely separate copies), the wrong one here.

**The defect is that he had to ask.** The page knows which cards resolve to identical rendered text
(the duplicate-text guard already computes it) but only surfaces it *after* an edit creates a
divergence. It must surface it *before*:

- On every card whose rendered neutral text is byte-identical to another card's, show a
  **shared-wording notice naming the siblings**, e.g. *"Shared wording — this exact sentence also
  renders for 'docked last turn' and 'Tortuga berth'. Editing it changes all three."*
- Computed from the live builders (same probe the self-check uses), never a hand-maintained list.
- This is distinct from the `mergeWith` byte-identical cross-reference already shown for the ad-hoc
  lines: that flags *separate strings that happen to match* (merge candidates); this flags *one
  string reached by several branches* (not a merge candidate). **The wording must make that
  difference obvious**, since the correct tag differs — `merge` for the former, `keep`/`rewrite` for
  the latter.
- Where a rewrite on a shared string is entered, the derived-intent line should reflect the blast
  radius: `→ REWRITE to: "…" (also changes: <sibling labels>)`.

Known shared-string group at time of writing: `justDocked` / `home` / `dock`-when-unmoved all render
`stillDocked`. The probe must find any others rather than relying on that list.


**D-29 — Global pirate second person: "you" → "ye", "your" → "yer". Applied as a RULE, not 81 edits.**

Wyatt: *"I want to write 'ye' instead of 'you' and 'yer' instead of 'your' everywhere in the
narration, but I don't want to manually 'rewrite' each block just to do that -- can you write a note
to do that yourself?"*

**Scale:** 134 occurrences across `src/ui/util.js`, `src/ui/flow.js`, `src/orchestrator.js`,
`src/ui/panel.js` — `you` ×80, `your` ×35, `You` ×12, `You're` ×5, `Your` ×2. The voice is already
partly there: `flow.js` alone has `yer` ×13 and `ye` ×14, so this finishes a conversion already begun
rather than introducing a new register.

**MANDATORY — word-boundary matching.** A boundary-less replace corrupts code: `layout`
(`src/ui/util.js`, `src/orchestrator.js`) contains `you` and would become `layet`. Use `\byou\b` /
`\byour\b` etc. Never a bare substring replace.

**Case must be preserved:** `You`→`Ye`, `Your`→`Yer`, `you`→`ye`, `your`→`yer`.

**Scope — player-facing narration string literals ONLY.** Never identifiers, never comments, never
the audit page's own UI chrome, never variable/function/CSS names.

**CRITICAL INTERACTION WITH D-25 — the page must apply this rule LIVE.** D-25 fixed `keep` to mean
"ship exactly what this card displays". If the you→ye rule were applied later, at 15-06 time, then
what ships would differ from what Wyatt approved, silently breaking that contract on every card. So
**the audit page must render the converted text**, and Wyatt reviews the final pirate wording. The
rule is applied once, visibly, at review time — not invisibly afterwards. The same conversion must
also apply to replacement copy he types into a notes box, so his own rewrites match the register
without him having to type `ye` by hand.

**OPEN QUESTIONS — do not guess, ask Wyatt:**

1. **`you're` (5 occurrences)** — `yer` or `ye're`? Pirate convention uses `yer` for both *your* and
   *you're* ("yer carried by the storm" reads naturally), which is the recommendation, but it is his
   call.
2. **Scope beyond narration** — he said "in the narration". Action prompts and buttons are also
   player-facing ("Ahoy, what do ye want to do?"). Converting them too keeps one consistent voice;
   leaving them makes the game read in two registers. **Ask before widening.**
3. `yours` / `yourself` — none currently present; if any appear, `yers` / `yerself`.


**D-29 RESOLVED — Wyatt answered both open questions (2026-07-29):**

1. *"make you're and your 'yer'"* → **`your` → `yer` AND `you're` → `yer`.** One word does both jobs,
   which is standard pirate usage. So: `you`→`ye`, `your`→`yer`, `you're`→`yer` (and `You`→`Ye`,
   `Your`→`Yer`, `You're`→`Yer`).
2. *"convert everything"* → **scope is ALL player-facing text, not just narration.** Action prompts,
   button labels, the yellow action panel, modal copy, banners, intro/outro text — the whole game
   speaks one register. Still **never** identifiers, comments, or the audit page's own UI chrome.

**Final substitution table (word-boundary matched, case-preserving):**

| From | To |
|---|---|
| `you` / `You` | `ye` / `Ye` |
| `your` / `Your` | `yer` / `Yer` |
| `you're` / `You're` | `yer` / `Yer` |
| `yours` / `yourself` (if any appear) | `yers` / `yerself` |

**Ordering note:** match `you're` and `your` BEFORE bare `you`, or `you're` becomes `ye're` and
`your` becomes `yer` only by accident. Longest-alternative-first, as the existing `EMOJIFY_RE` in
`src/shared/index.js` already does for multi-codepoint emoji — same technique, same reason.

**Widened scope means widened hazard surface.** The `layout` landmine (D-29 above) was found in the
4 narration files; converting *everything* pulls in more files, so the word-boundary rule and an
identifier/comment exclusion are now load-bearing across the whole UI layer, not just narration.
Re-scan for `\w*you\w+` style collisions across every file touched, not only the original four.


**D-30 — Action prompts and button labels JOIN the audit. The gap was blocking his rewrite.**

Wyatt: *"the action prompts aren't here. because they're missing, I can't actually see what the
players are seeing, or reacting to. And I can't edit the most important lines of dialogue in the
game. Is it possible for you to add the action prompts to this audit, colored a different background
so I can recognize them, and keep everything else about this audit working?"*

**He is right, and the omission traces back to D-03**, which scoped the audit to the two *narration*
sources (the `EVENT_NARRATION` table + ad-hoc `flash()` calls). Action prompts are `ask()`/`panel()`
calls — a third surface, never in scope, and by volume the text players read most: every turn, every
decision. Two independent reasons it must be fixed now:

1. **Narration reads as a response to the prompt that preceded it.** Judging narration copy without
   the prompt above it is judging half a conversation — which is exactly what D-22's flow chart was
   meant to prevent.
2. **D-29 already commits to converting prompts to `ye`/`yer`** ("convert everything"). Approving a
   conversion he cannot see contradicts D-25's "ship exactly what this card displays".

**Scope — measured, not estimated:**

| Surface | Count |
|---|---|
| `ask()` prompt strings | 11 template-literal sites (20 `ask(` call sites total) |
| `panel()` prompt strings | 7 template-literal sites (16 `panel(` sites total) |
| **Button labels** | **57** |

Button labels are player-facing copy and must be individually editable — `🌕 FLIP!`, `🎣 CAST!`,
`Pay 1🌕 to anchor`, `Take 3🌕`, `a crate (winner picks)`, `🏃 Flee! (−1🌕)`, `Keep fighting`,
`← Back`, `Never mind`. Several are duplicated across sites (`← Back` many times); the
shared-wording notice from D-28 applies to them, so he sees when one edit changes several buttons.

**Requirements:**

- **Visually distinct background** so prompts are recognizable at a glance versus narration cards
  (his explicit ask). Must remain legible in the existing dark theme.
- **Placed in the flow chart at the point they actually fire**, so each prompt sits with the
  narration that answers it — a prompt divorced from its outcome recreates the original problem.
- **Buttons render on their own card, grouped under their prompt** — a prompt and its options are
  one decision moment and must be reviewable together.
- **Everything else keeps working, unchanged:** his `22 of 81` reviewed state and all saved marks,
  the same `STORAGE_KEY`, existing card ids (new ids only for the new prompt/button cards), the
  reviewed tracking, question field, derived-intent line, shared-wording notices, duplicate guard,
  self-check, and the `ye`/`yer` conversion from D-29 (which applies to prompts and button labels
  too).
- The reviewed-progress denominator will rise from 81; that is expected and must not reset or
  invalidate marks already made.


**D-31 — 15 of 28 prompts show NO buttons. The extractor only reads inline option arrays.**

Wyatt: *"i need to see the buttons here to know what the full text says! I don't want to duplicate
wording in the prompt and on the button. Where is the button, why is it not appearing with the
prompt?"*

**Cause.** `scripts/extract_narration_lines.js` captures button labels only when the `ask()` options
argument is an **inline array literal**. Whenever the code builds the options into a local variable
first — `opts`, `ingOpts`, `coinOpts` — the extractor records `rawOpts: "opts"` and `labels: []`.
That is the pattern used by **every prompt with conditional options**, i.e. the important ones.

**Measured: 15 of 28 prompts have zero captured labels**, and only 24 of the ~57 button labels in
`src/` are represented. Missing prompts include the ones that matter most:

| Site | Prompt |
|---|---|
| `flow.js:563` `humanAct` | **the main action menu** |
| `flow.js:261` `windLeg` | storm anchor-or-flip choice |
| `flow.js:103` `humanFlip` | the coin flip |
| `flow.js:125` `fishCast` | fishing |
| `flow.js:437/451` `humanTrade` | ingredient and coin pickers |
| `orchestrator.js:544` `asyncBattle` | plunder picker (`uniq.map(...)` — dynamic) |

**Why it is blocking, in his words:** without the buttons he cannot tell what the prompt still needs
to say. Concretely, `windLeg`'s buttons already read *"Flip! Heads: dodge. Tails: lose half 🌕"*, and
his in-progress prompt rewrite was re-stating that same heads/tails consequence in the prompt body —
the exact duplication he is trying to avoid. **A prompt without its buttons is unreviewable.**

**Required:**

- Extend the extractor to resolve a **locally-built options array**: within the enclosing function
  body, follow the variable named in `rawOpts` and collect every `const X=[…]` initialiser and every
  `X.push({label:…})` / `X.concat([…])` contribution.
- **Conditional labels are BRANCHES and every one must render** (D-21 applies to buttons exactly as
  it does to narration). `windLeg`'s flip button alone has three: *"…Tails: lose yer turn!"* (truly
  broke), *"…Tails: lose a crate!"* (broke, holding crates), *"…Tails: lose half 🌕"* (ordinary).
  Conditionally-present options (`Pay 1🌕 to anchor` only when `coins>=1`) must show their condition.
- Where options are genuinely dynamic (`uniq.map(i=>({label:ilabelImg(i)…}))`), render a described
  placeholder naming the generator rather than an empty list — silence is what caused this.
- **Add a self-check assertion**: every prompt card must render at least one button, or be explicitly
  marked dynamic. An empty button list must fail the check, exactly as an un-rendered branch does.


**D-32 — Whole CATEGORIES of player-facing copy are still absent from the audit.**

Wyatt asked for an independent sweep to confirm nothing was still missing. It is not.

Method: enumerated every player-facing string in `src/`, normalised both sides through the D-29
pirate conversion, and tested each against the rendered audit page's visible text.

**Confirmed absent — every item verified missing, not merely unmatched:**

| Category | Count | Examples |
|---|---|---|
| **Intro / barrier banners** (`netIntroBarrier`, 3 sites + button labels) | 6 | *"⚓ Ahoy! Gather every ingredient in yer recipe, then sail home first to win!"*; *"The crew draws lots for sailing order — … Patience pays, mateys!"*; the final-round *"fired up the bakery! Last chance, crew"*; buttons *"⚓ Arrgh! Let's start"*, *"🦜 Aye, set sail!"*, *"🦜 Final round — set sail!"* |
| **End-of-voyage awards** | 21 | 10 names + 11 bylines — *"The Cutlass of a Thousand Notches"* / *"One notch per fallen foe, carved into the hilt."*, *"The Black Spot of Bad Tides"*, *"The Golden Herring"* |
| **Battle blow-by-blow** | 3+ | *"Both fire HEADS — crosswind, cannonballs collide, no damage."*, *"Both miss — TAILS all round."*, *"Both HEADS — no score this round."* |
| **Multiplayer errors / room join** | 6 | *"Couldn't reach the multiplayer service…"*, *"No game found with code"*, *"That game has already set sail."*, *"That game is full."*, *"That game no longer exists."*, *"Enter the room code your host shared."* |
| **Recipe draft + waiting states** | 4 | *"⚓ Everyone's choosing their recipe…"*, *"⚓ Recipe chosen! Waiting for the rest of the crew…"*, *"⚓ Waiting for yer pirate mateys to continue…"*, *"is choosing where to sail…"* |
| **Dock flavour text** | 6 of 7 | Only *"a sack of toasty wheat"* renders (the dock card fabricates a wheat event). *"rich vanilla beans"*, *"bursting cacao pods"*, *"sand-speckled eggs"*, *"some jugs of cool milk"*, *"sprigs of red hot cinnamon"*, *"a sack of crystal sugar"* never appear |
| **Timer controls** | 2 | *"Turn the timer off"* / *"Turn the timer back on"* |
| **Lobby / pass-and-play** | 1 | *"Pass the device to …"* |

**~50 further strings.** The intro banner is the **first text any player reads**; the awards are the
**last**. Neither has ever been reviewable.

**Root cause — the scope was defined by MECHANISM, not by audience.** D-03 scoped the audit to the
`EVENT_NARRATION` table plus ad-hoc `flash()` calls; D-30 added `ask()`/`panel()`. Anything reaching
the player by another route — `netIntroBarrier()`, direct DOM writes for awards, lobby, room-join
errors — was structurally invisible. This is the same failure as D-21 (one case per line), D-30
(prompts absent) and D-31 (buttons absent): each time the page looked complete because it was
complete *against its own definition of scope*, and the definition was too narrow.

**The definition must change from "narration" to "every string a player can read."** The self-check
must enforce coverage against that definition — enumerate player-facing strings from source and fail
on any without a card — so the next omission is caught by the page, not by Wyatt.


**D-33 — Prompts whose message is a PARAMETER show the unreachable in-function fallback, not the real text.**

Wyatt, on the `humanFlip` card: *"when is this written?"* — answer: **never**.

`humanFlip(p, label, allowBack)` renders `ask(label || "Flip the dubloon!", opts)`. The literal the
extractor captured is the **fallback**, reached only when a caller passes no label. Both callers
pass one:

| Call site | Real prompt the player sees | On the audit? |
|---|---|---|
| `flow.js:265` (storm anchor flip) | *"Flip to dodge!"* | **✗ missing** |
| `flow.js:389` (docking flip, with Back) | *"Docking at {ingredient} — flip!"* | **✗ missing** |
| `flow.js:103` fallback | *"Flip the dubloon!"* | ✓ shown — **but unreachable** |

Same shape in `fishCast(p, label, allowBack)`: fallback `` `${pn(p.idx)}: cast your line — flip!` ``
is rendered, while the real label from `flow.js:592` — *"🎣 Cast your line — flip!"* — is missing.
(`flow.js:781` calls `fishCast(p)` with no label, but that is the bot path, which never reaches the
`ask()` at all — so the fallback is dead in both functions.)

**Also missing: the `ask()` helper text.** `localAsk(msg, opts, colors, sub)` takes a **4th argument**
rendered under the buttons. `humanAct` passes two variants — *"Attacking costs ye 2🌕 for powder.
Fire downwind for the edge!"* and the too-poor nudge. The extractor does not capture `sub` at all.

**This is D-31's defect one level up.** D-31 fixed options built into a local variable; the same
blind spot applies to the *message* when it arrives as a function argument. The extractor reads what
is lexically at the call site and cannot see what callers actually pass.

**Required:**
- For a prompt whose message is a parameter, **enumerate the callers** and render one card per real
  message passed, not the fallback.
- Where a fallback is genuinely unreachable (all callers supply a label), either omit it or mark it
  clearly as unreachable — it must never be presented as editable copy, because Wyatt spent a
  rewrite on one.
- Capture and render the `sub` helper text as its own card, with all its variants.
- The D-32 self-check ("every string a player can read has a card") must also assert the inverse:
  **no card renders a string a player can never read.**


**D-34 — `back:true` and `flip:true` option labels are STRUCTURAL MARKERS, never rendered text.**

Wyatt: *"I wanted the back button to always be just a circle with '<' inside it -- isn't that used
instead of this button with the word 'back' on it?"* — **he is right.**

`localAsk()` (`src/ui/flow.js:81-90`) finds the option flagged `back:true` and the one flagged
`flip:true`, **excludes both from the rendered button row** (`rest = opts.filter(x => x.i !== flipIdx
&& x.i !== backIdx)`), and re-renders them elsewhere with their own hardcoded text:

| Option label in code | What the player actually sees | Rendered by |
|---|---|---|
| `← Back` (**8 sites**) | a circular `‹` button — `.apBack`, `border-radius:50%`, 26×26px | `flow.js:88`, `orchestrator.js:896` |
| `🌕 FLIP!` | the coin element, `textContent = "FLIP"` | `board.js:639` `setFlipActive()` |
| `🎣 CAST!` | the same coin element — also **"FLIP"** | `board.js:639` |

**So ten button labels on the audit page are text no player has ever read.** The label strings exist
only so the code can find the option; their content is discarded.

**Note for a later phase (NOT this one):** the coin renders the literal word `FLIP` even during a
fishing cast, where the option claims `🎣 CAST!`. Either the cast label is dead or the coin is wrong
for fishing — worth a look, but it is a UI-behaviour question, not narration copy.

**This is the second class of dead copy Wyatt has been asked to edit** (D-33 was the first —
unreachable parameter fallbacks). Both were surfaced by him asking "is this even shown?", which the
page should be answering for him.

**Required — concrete test list for the D-33 inverse check** ("no card renders a string a player can
never read"). These must be marked unreachable or removed, never presented as editable copy:

- every `← Back` label (8 sites)
- `🌕 FLIP!` and `🎣 CAST!`
- `"Flip the dubloon!"` (`flow.js:103` fallback, D-33)
- `` `${pn(p.idx)}: cast your line — flip!` `` (`flow.js:125` fallback, D-33)

Where a marker label is dead but the CONTROL is live, say so on the card — e.g. *"Renders as the
circular ‹ back button; this text is never shown."* Wyatt needs to know the control exists without
being invited to rewrite words that go nowhere.


**D-35 — The sail-prompt is written twice, split by TRANSPORT, and the two wordings disagree.**

Wyatt: *"when is this shown? … it seems like the same purpose as localPickCell()"* — correct, and the
split is a D-18 violation in a new flavour.

| | `localPickCell` (`flow.js:200`) | `remotePickHighlights` (`flow.js:1044`) |
|---|---|---|
| Shown to | the player whose turn it is | **the same player**, when they are a remote guest |
| Reached via | `flow.js:178` — `decisionIsLocal(p.idx) ? localPickCell(…)` | `orchestrator.js:918` — host relays the prompt over Firebase |
| Wording | *"Crustbeard: click a highlighted square to sail (−1🌕)"* | *"Yer move — click a highlighted square to sail (−1🌕)"* |
| Button | `Stay put` | `Stay put` (byte-identical duplicate) |

**Same moment, same audience, two different sentences — decided by whether the player happens to be
the host or a guest.** A player would read one wording solo and the other online. D-18's rule is that
the ONLY axis of variation is viewer perspective, and here the viewer is literally the same person.

Neither matches D-07's agreed form (name-prefix + second person). The correct single line is one
neutral rendering plus one addressed variant, e.g. *"Crustbeard — yer move! Click a highlighted
square to sail (−1🌕)"* for the actor and the named third-person form for everyone watching.

**For 15-06:** collapse to one prompt used by both transports, in the D-10 neutral-plus-variants
shape. `Stay put` becomes a single shared label. This is the same defect as the bot/human storm-leg
duplication (D-18 #2) — the pipeline is forked, so the copy forked with it — but split by host/guest
rather than by actor type. **Worth sweeping for other host/guest wording pairs while fixing it**;
this one was found by eye, so others may exist.


**D-35 SWEEP RESULT — `localPickCell`/`remotePickHighlights` is the ONLY host/guest wording fork.**

Wyatt asked 15-06 to sweep for further pairs. Done now so 15-06 gets a list, not an instruction.

**Method:** enumerated every local-vs-remote branch point (`decisionIsLocal()`), then checked whether
each guest-side function **receives** its player-facing text or **hardcodes** its own. Hardcoding is
the structural signature of the fork — a received message cannot diverge from the host's.

| Branch point | Guest side gets its text from | Forked? |
|---|---|---|
| `util.js:841` — the whole `ask()` path | `msg` computed once, passed to both branches | **No** |
| `orchestrator.js:361` — `asyncBattle` | `msg` vs `spectMsg`, chosen by `seat===mySeat` | **No** — that is the *correct* actor/spectator split (D-10), not a transport fork |
| `orchestrator.js:665` — recipe draft | single `msgFor(p)` | **No** |
| `watchPrompt` (`:901`,`:912`) | `p.msg` from the payload | **No** |
| `watchDraftPrompt` (`:849`) | `p.msg` / `p.waitMsg` from the payload | **No** |
| **`flow.js:178` — sail-cell pick** | **`remotePickHighlights` HARDCODES its own sentence** | **YES — the D-35 fork** |

**`remotePickHighlights` (`flow.js:1044`) is the only guest-side function that writes its own
player-facing copy instead of rendering what the host sent.** Every other remote path is a pure
renderer, so its wording cannot drift. Confirmed by scanning each guest-side function for hardcoded
string literals — only this one has any.

**So 15-06 fixes one pair, not a category** — but the fix should keep the invariant explicit:
*guest-side code renders text, it never authors it.* That property is what kept the other five paths
correct, and is worth stating so a future remote renderer does not reintroduce the fork.


**D-36 — All trade-wind rim-sweep lines merge into `EVENT_NARRATION.tradewind`. Merge notes must name a CANONICAL target.**

Wyatt: *"the tradewind merge notes seem to recursively refer to each other -- many of them say to
merge with flow.js:296, but that one says to merge with 571 -- and 571 says to merge with 296. They
should all merge with: EVENT_NARRATION.tradewind, src/ui/util.js"*

**His decision:** the three ad-hoc rim-sweep `flash()` calls — `flow.js:296` (storm push),
`flow.js:571` (move-instead path), `flow.js:645` (post-sail) — all collapse into the table entry
`EVENT_NARRATION.tradewind` (`src/ui/util.js:358`), becoming table pass-throughs like the round
headers. Four wordings become one.

**Why the page produced a cycle.** The "Byte-identical to: …" cross-reference is **symmetric** — it
lists other cards rendering the same text. The three ad-hoc lines are byte-identical *to each other*
(*"is swept into the trade winds and whipped around the rim!"*), so each pointed at the others and
none pointed anywhere terminal. The table entry was never linked at all because it reads *"is
**carried** into the trade winds…"* — one verb different, so byte-matching could not see it.

**The mechanism defect:** byte-identity finds *duplicates*, but a merge needs a *destination*. Where
a table entry expresses the same moment in near-identical words, that entry is the natural
destination and byte-matching will never surface it.

**Required:**
- A `merge` disposition must carry an explicit **target**, and the export must include it
  (`mergeInto`). A merge with no target is not actionable — four such tags already exist (D-27 era).
- Replace the symmetric "Byte-identical to: …" list with a **canonical-target** presentation: name
  one destination, mark the others as folding into it. Never emit a cycle.
- Where a table entry exists for the same moment, offer it as the default target even when wording
  differs slightly — that is precisely the case byte-matching misses.
- Let Wyatt override the target per card; his answer here (`EVENT_NARRATION.tradewind`) is the
  default for all three rim-sweep cards.

**Still open — the verb.** Merging into the table entry means *"carried"* survives and *"swept"*
disappears, since `keep` ships what the card displays (D-25). Three of the four sites currently say
*"swept"*. **Ask Wyatt which verb the surviving line should use** — do not assume the table's
existing wording is a deliberate choice.


**D-37 — Wind acts on a player with ONE verb: "blow". Supersedes carried / swept / whipped.**

Wyatt: *"I rewrote the table entry to say 'blown' so they should now ALL say 'blown' (instead of
carried or swept). they trade winds themselves *sweep* you along, but i want the wind to always
*blow* you"*

**The rule:** whenever wind, storm, gale or gust moves a player, the verb is **blow/blown/blows**.
He is knowingly trading a more evocative word ("sweep" genuinely suits trade winds) for a consistent
one — the player should learn a single verb that always means "the wind moved you".

**Resolves D-36's open verb question:** the surviving `EVENT_NARRATION.tradewind` line uses **blown**
— not "carried" (the table's old wording) and not "swept" (the three ad-hoc copies). All four
collapse to the one "blown" line.

**Stragglers still using another verb — flagged, NOT auto-changed:**

| Site | Current | Note |
|---|---|---|
| `flow.js:373` (human) + `flow.js:702` (bot) | *"Now the storm **moves** ye 2 squares south!"* | Straight violation. Already merging under D-18 #2 — apply "blows" to the surviving line. |
| `util.js:328` (`moored`, lucky-break branch) | *"the gust **shoves** {name} onto a dock"* | **Ask before changing.** This is not a wind-pushes-you-N-squares moment — it is the gust *saving* you by pressing the ship against a dock. "Shoves" may be deliberate force, and D-20's approved rewrite kept it. |
| `util.js:288` (`windmove`) | *"is **carried** by the storm"* | His own pass-2 rewrite already reads *"Crustbeard is blown by the storm"* — consistent, no action needed beyond applying his note. |

**For 15-06:** apply the rule to the trade-wind merge and the storm-leg merge. Do **not** silently
rewrite `util.js:328` — surface it for his call. **Verification:** no player-facing string has wind /
storm / gale / gust as the subject of *carried*, *swept*, *whipped* or *moves*.


**D-37 RESOLVED — the lucky-break "shove" stays.**

Wyatt: *"keep the shove — it's saving you, not moving you"*.

`util.js:328` keeps *"the gust **shoves** {name} onto a dock"*. **This is an exception with a stated
principle, not an oversight**, and the principle is what a later pass must honour:

> D-37's "wind always blows" governs wind **moving** a player. It does not govern wind **saving**
> one. The lucky-break dock line is a rescue — the gust presses the ship against the dock and stops
> it running aground — so it keeps the stronger verb.

**Verification for 15-06, corrected:** no player-facing string may have wind / storm / gale / gust as
the subject of *carried*, *swept*, *whipped* or *moves*. **`shoves` is permitted only at
`util.js:328`** (the `moored` lucky-break branch). Any new *shove* elsewhere is a violation; that one
is not.


**D-38 — Every parenthesised cost/benefit carries an explicit + or −.**

Wyatt: *"I want the parenthesis cost/benefit to have a + or - in front of it always, so players can
easily see what that amount will do to their balance. I just noticed it with Button Attack (-2)…
can you [audit the rest]?"*

**Rule:** an amount shown in parentheses as a cost or benefit always states its direction. A player
should never have to infer from surrounding prose whether a number is coming in or going out.

**Scope — parenthesised amounts only.** Amounts inside a sentence stay unsigned (*"pays 1🌕 and
sails"*, *"Take 3🌕"*), because a sign reads as arithmetic mid-prose. Buttons whose whole label is a
price (*"Sell for 5🌕"*) are also out of scope: the verb already states direction.

**Already correct (6):** `(−1🌕)` dodge/anchor · `(−3🌕)` buy crate · `(+{n}🌕)` turn-order intro ·
`(+{n}🌕)` coin sweetener · `🦀 +1🌕` candycrab caption · `(-{powder}🌕)` Attack — *see sign-character
defect below*.

**Needs a sign — proposed direction, CONFIRM the two marked (?):**

| Site | Current | Proposed | Why |
|---|---|---|---|
| `util.js:494/495` | `(2🌕)` sugarfish, `(1🌕)` candycrab | `(+2🌕)` / `(+1🌕)` | a catch is a gain |
| `util.js:486` | `(they pay 1🌕)` | `(−1🌕)` | flee cost. **Drop "they pay"** — redundant once signed, and *"(they pay −1🌕)"* is nonsense |
| `util.js:487/488` | `(pays 1🌕)` | `(−1🌕)` | same, both variants |
| `flow.js:752` (?) | `{n}🌕` counter buttons | `+{n}🌕` | he is naming a price he would **receive** for his crate |
| `flow.js:461` (?) | `{give.coins}🌕` in the offer summary | `−{give.coins}🌕` | coins he is **giving away** — but this is a composed offer string (*"Wheat + 2🌕"*), where a minus may read as subtraction rather than cost |

**Separate defect — two different minus characters are in use.** `(-2🌕)` on the Attack button is an
ASCII hyphen `-`; `(−1🌕)` elsewhere is a proper minus `−` (U+2212). **3 hyphens vs 5 minuses.** They
render at different widths and weights beside a coin. Normalise to `−` (U+2212) everywhere.

**Verification for 15-06:** no parenthesised amount adjacent to a coin glyph lacks a leading `+` or
`−`, and no player-facing minus uses an ASCII hyphen.


**D-38 RESOLVED — Wyatt confirmed both ambiguous cases and the minus normalisation (2026-07-29):**

1. **Counter-offer buttons** (`flow.js:752`) → **`+{n}🌕`**. *"correct, +3🌕"*. Money he receives for
   his crate.
2. **Trade offer summary** (`flow.js:461`) → **left alone, deliberately.** *"agree, leave this
   alone."* The composed string reads *"Toasty Wheat + 2🌕"*, where `+` means "and also"; a `−`
   would collide with that reading. **This is a stated exception, not an oversight — do not
   "fix" it in a later pass.**
3. **Normalise the minus character** → *"please normalize the minuses"*. All player-facing minuses
   become **U+2212 `−`**. The ASCII hyphen `-` currently used on the Attack button (`flow.js:549`)
   and 2 other sites renders narrower and lighter than the `−` used elsewhere, so amounts fail to
   align beside the coin art.

**Final change list for 15-06 (D-38):**

| Site | From | To |
|---|---|---|
| `util.js:494`, `:495` | `(2🌕)` / `(1🌕)` | `(+2🌕)` / `(+1🌕)` |
| `util.js:486` | `(they pay 1🌕)` | `(−1🌕)` |
| `util.js:487`, `:488` | `(pays 1🌕)` | `(−1🌕)` |
| `flow.js:752` | `` `${n}🌕` `` | `` `+${n}🌕` `` |
| `flow.js:549` + 2 others | ASCII `-` | U+2212 `−` |
| `flow.js:461` | — | **no change (exception above)** |

**Verification:** no parenthesised amount adjacent to a coin glyph lacks a leading `+`/`−`; no
player-facing minus is an ASCII hyphen; `flow.js:461` still reads *"{ingredient} + {n}🌕"*.


**D-39 — "← Actually, move instead" EXISTS and works, but renders as a bare `‹` circle. The label is
the one dead marker that carried real meaning.**

Wyatt: *"This button doesn't exist, right? … ← Actually, move instead"* — **it does exist**, and is
reachable, but he has never seen those words.

`flow.js:558` — `{label:"← Actually, move instead", back:true, value:"moveInstead"}` — is the **only**
`back:true` option in `humanAct`'s list, so `localAsk()`'s `backIdx` finds it, excludes it from the
button row, and renders it as the generic circular `‹` (D-34). The action itself is live and handled
at `flow.js:567`.

**Offered only when** `canMoveInstead` — the sail step ended in "Stay put", nothing was spent or
moved, and the player can still afford to sail. The code comment states its purpose: *"covers the
reported 'hit Stay put by accident' complaint."*

**Why this differs from every other dead marker label (D-34).** For an ordinary `← Back`, discarding
the text costs nothing — a `‹` self-evidently means *go back*. Here the label carries information the
circle cannot: *you can undo your Stay put and move after all*. A player who mis-clicked sees an
unlabelled `‹` in a place they have no reason to look, and the feature built to rescue them is
invisible.

**So the fix that was shipped for that complaint is undiscoverable** — not because it is missing, but
because its only signpost is thrown away at render time.

**Options (Wyatt's call, and arguably Phase 16 / UI territory rather than narration copy):**
1. Render it as a normal labelled button — drop `back:true`, keep `value:"moveInstead"`; it is a
   distinct choice, not a navigation control.
2. Keep the circle but give it a tooltip / `aria-label` carrying the wording.
3. Leave as-is and accept it is discoverable only by experiment.

**Recommendation: option 1.** `back:true` is being used here as "put this last and style it as
secondary", but its actual effect is "replace this option's text with a `‹`". The option is a real
choice with a real consequence, so it should read like one.


**D-39 RESOLVED — "move instead" stays a normal back button. Consistency over signposting.**

Wyatt: *"I'm fine with this being just a normal back button -- if a player misclicks, they'll hit
back, and then be able to move again. let's keep things consistent"*.

**Decision: option 3 — leave as-is.** `flow.js:558` keeps `back:true`, keeps rendering as the
circular `‹`, and the label text stays unshown like every other back marker (D-34).

**His reasoning, recorded because it is the load-bearing part:** a player who mis-clicks "Stay put"
will reach for *back* by instinct — and back is exactly what this control is. The generic `‹` is
therefore discoverable enough, and one consistent back affordance everywhere beats a special case
that reads differently in one menu.

**Consequence for the audit:** `"← Actually, move instead"` is confirmed dead copy alongside the
other `back:true`/`flip:true` labels (D-34). It stays marked as such — **no rewrite should be spent
on it**, and a later pass must not "restore" it as a labelled button. This closes D-39; no 15-06 or
Phase 16 work follows from it.


**D-40 — Cards must flag EFFECTIVELY-dead text, not just structurally-dead text.**

Wyatt: *"yes, flag it on the card when the text is dead."*

D-34 marks text that **can never** render (marker labels replaced by a control). D-33 marks
**unreachable fallbacks**. Neither covers a third category Wyatt has now hit three times: text that
is reachable in principle but that a player in a normal game will not see, because a guard upstream
prevents it.

**Canonical example — `flow.js:582`, "Crustbeard can't afford powder."** The Attack option carries
`disabled:!canAfford`, and `localAsk()` gives disabled buttons no click handler, so the normal path
cannot reach it. The code comment says so outright: *"the button is disabled when you can't afford
powder, but guard the action too (e.g. a forced/edge selection)."* It is a genuine safety net against
a desynced multiplayer client — **worth keeping, not worth rewriting.**

**Why it matters:** the wording a player actually reads in that situation is the `sub` helper text at
`flow.js:560` — *"Yer too poor to afford powder! Go fishin'"* — a **different card**. Wyatt's pass-1
rewrite went onto the guard, not the live line. Third time this has happened (D-33 dubloon fallback,
D-34 back labels, now this), each time because the page gave no signal which of a near-identical pair
was the live one.

**Required:** a third card badge — *"Guarded: reachable only if an upstream guard fails; players will
not normally see this"* — naming the guard and, where one exists, **the live sibling that carries this
wording for real** (here: the `sub` helper at `flow.js:560`). Distinct from the dead-copy badge, since
the text is worth keeping; the point is to stop rewrites landing on it.

**D-41 — The Parley button leads to a dead end. It should be disabled with helper text, like Attack.**

Wyatt: *"this shouldn't be shown because it should be greyed out. It should be displayed as helper
text underneath a greyed out button explaining why it's greyed out."* — about `flow.js:410`,
*"No one has cargo to trade for."*

**The button's condition is far coarser than the action's.** `flow.js:551` offers Parley when
`tradeOpp(p).length`, and with `cfg.parley:true` `tradeOpp()` returns **every player still in the
game** — no distance check, no cargo check. `humanTrade()` then filters to `q.ing.length>0` and
bails with the message when none qualify.

**So the dead end is common, not exotic** — any round where no opponent is holding a crate, which
includes the opening rounds before anyone has docked. The player clicks Parley and is bounced
straight back.

**Fix (follows the Attack precedent already in this file):** compute the real availability once —
`tradeOpp(p).filter(q => q.ing.length > 0)` — and use it for **both** the button's `disabled` flag and
the action guard. Add `sub` helper text under the greyed button explaining why (e.g. *"No one's
holding cargo to parley for yet."*). `flow.js:410`'s flash then becomes a guarded safety net like
D-40's, rather than a routine dead end.

**Scope note:** this is a behaviour change (disabling a button), not pure copy — but it is
presentation-tier, touches no engine code, and the exact pattern already exists in `humanAct` for
Attack. Flagged for Wyatt to confirm 15-06 rather than Phase 16.


**D-42 — Typing in the Notes box auto-selects `rewrite`. The dropdown must stop lying.**

Wyatt: *"if i start typing in the Notes box, automatically select 'rewrite' from the dropdown. I'm
only writing a new line because i want that to be used -- i am trying to remember to also select
'rewrite' but i'm worried i'm forgetting."*

**He is forgetting, and it has cost him nothing — but the anxiety is the defect.** Measured against
his live session: of **33 reviewed cards carrying notes, 14 still had `tag: "keep"`** (42%). D-26's
derived intent already treats non-empty notes as `rewrite`, and the export carries that derived
intent, so all 14 apply correctly. The dropdown was never the source of truth.

**The real problem is that the visible control disagrees with the actual decision**, leaving him
checking his own work on every card. A UI that requires the user to remember what the system already
knows is the bug.

**Required:** typing in the Notes box sets the dropdown to `rewrite` automatically, so the visible
state matches the derived intent.

**Preserve D-26's precedence — this must NOT clobber a deliberate choice:**
- Auto-select `rewrite` **only when the current tag is `keep`** (or unset). If the tag is `cut` or
  `merge`, leave it alone — those are deliberate selections that win outright, and notes on them are
  *reasoning*, not replacement copy.
- Clearing the notes box on a card whose `rewrite` was auto-set should revert it to `keep`; a
  manually-chosen `rewrite` stays.
- The derived-intent line remains the authority and must keep updating live — this change only makes
  the dropdown agree with it, it does not alter what is exported.

**Retro-fix required:** the 14 already-marked cards must not be left looking wrong. On load, any card
whose notes are non-empty and whose tag is `keep` should have its dropdown corrected to `rewrite` —
same rule, applied once to existing state. No dispositions change, since the derived intent was
already `rewrite`; only the visible control catches up.


**D-41 RESOLVED — the Parley button disable lands in 15-06.**

Wyatt: *"do the trade button disable in 15-06"* — scope question settled. Not deferred to Phase 16.

Justified: it touches no engine code, changes no event, and the exact pattern already exists eleven
lines away in the same function (the Attack button's `disabled:!canAfford` + `sub` helper). It is
presentation-tier, which is what this phase is scoped to.

**15-06 task:** compute real parley availability once — `tradeOpp(p).filter(q => q.ing.length > 0)` —
and use it for **both** the button's `disabled` flag (`flow.js:551`) and the action guard
(`flow.js:409`). Add `sub` helper text under the greyed button saying why. `flow.js:410`'s flash then
becomes a guarded safety net (D-40) instead of a routine dead end.

**Verify:** with no opponent holding cargo, the Parley button renders greyed with its reason visible,
and it is not possible to click through to *"No one has cargo to trade for."*


**D-41 EXTENDED — three options invite a click that cannot work. Fix all three together in 15-06.**

Wyatt: *"yes, add it to D-41 and fix all three together"*.

`flow.js:446` — *"Ye don't have any to offer!"* — is the same defect one layer deeper. **"— coins
only —" is pushed unconditionally** (`flow.js:435`), with no check on whether the player has any
coins. A skint captain picks it, reaches the coins step, finds `coinChoices` empty and is bounced
back. **Reachable whenever `p.coins === 0`** — a normal state, and precisely when a player would want
to trade a crate instead.

**The pattern, and its one correct instance:**

| Option | Offered when | Actually requires | Today |
|---|---|---|---|
| `⚔️ Attack` (`flow.js:549`) | a target is adjacent | …**and** `coins >= powder` | ✅ `disabled:!canAfford` + `sub` explains why |
| `🤝 Parley` (`flow.js:551`) | any opponent alive (with `cfg.parley`, effectively always) | …**and** an opponent holds cargo | ❌ dead-ends at `flow.js:410` |
| `— coins only —` (`flow.js:435`) | always | …**and** `coins >= 1` | ❌ dead-ends at `flow.js:446` |

**Attack is the reference implementation** — compute real availability once, use it for both the
`disabled` flag and the action guard, explain the greying in `sub` helper text. The other two simply
never got the same treatment.

**15-06 task (all three in one pass):**
1. **Parley** — availability is `tradeOpp(p).filter(q => q.ing.length > 0)`; drive both
   `flow.js:551`'s `disabled` and `flow.js:409`'s guard from it; add `sub` text.
2. **Coins-only** — availability is `p.coins > 0`; drive `flow.js:435`'s `disabled` from it. `ask()`'s
   `sub` argument is available on that prompt for the reason.
3. **Attack** — no behaviour change; confirm it still matches the pattern so all three read alike.

Both dead-end flashes (`flow.js:410`, `flow.js:446`) then become guarded safety nets (D-40), not
routine walls.

**Verify:** with 0 coins, "— coins only —" renders greyed with its reason and cannot be chosen; with
no opponent holding cargo, Parley likewise; neither dead-end message is reachable by clicking a
visibly-enabled control.


**D-43 — Config-gated branches whose flag is a hardcoded constant are DEAD. Two cards are affected.**

Wyatt, of the `trade` card *"Cooperation bonus OFF"*: *"when does this get shown?"* — **never.**

`roundCfg()` (`src/engine/index.js:813-822`) is the **only** config factory — every game-start path
goes through it (`orchestrator.js:1006`, `flow.js:1006/1017`, `board.js:573`, `util.js:1112`) — and
**nothing in `src/` ever mutates `cfg` after construction** (verified: no `cfg.X =` assignment
anywhere). Every flag is a hardcoded literal:

`tradeBonus:true` · `sardine:true` · `parley:true` · `dockBuy:true` · `merchant:true` ·
`roundBoard:true` · `unlimitedDock:true` · `asym:false`

**So two audit cards render text no player can reach:**

| Card | Gated on | Why dead |
|---|---|---|
| `trade` — *"Cooperation bonus OFF"* | `cfg.tradeBonus === false` | always `true` |
| `fish` — *"Tails, sardine rule OFF — empty-handed"* | `cfg.sardine === false` | always `true` |

(`asym:false` is the already-known dead raider battle branch — see Deferred Ideas.)

**This is not a D-21 regression.** Rendering every config-gated variant was correct for completeness;
the problem is that two of those variants are unreachable in the shipped configuration and the page
does not say so. Only the test harness (`scripts/narration_test.js:51`) ever sets these false.

**Required — extend the dead-copy detection (D-33/D-34/D-40 family):** a branch gated on a config
flag whose value is a hardcoded literal in `roundCfg()` is unreachable, and its card must be badged
accordingly. Derive this from `roundCfg()` rather than hand-listing, so a future flag that genuinely
becomes configurable stops being flagged automatically.

**Keep the code, badge the card.** These branches cost nothing and would matter if a flag ever became
a real option — the point is only to stop Wyatt spending rewrites on them, as he nearly did on the
`humanFlip` fallback (D-33).


**D-44 — A `merge` default with no target reads as "merge with the card next to me". Pre-set every known target.**

Wyatt, on the `parley~refused` card: *"this one is flagged for merging, but i think it's merging with
the success message…? That seems wrong."*

**Diagnosis: it has no target at all.** Both parley cards carry `tag:"merge"`, `mergeInto` unset, and
the selector reads *"— choose a target —"*. With the sibling *"Deal struck"* card rendered directly
above it inside the same `parley` group, a bare `merge` naturally reads as *merge with that one* —
which would be exactly backwards, since deal-struck and refused are opposite outcomes.

**Root cause: D-19's decision was never applied as the card default.** D-36's work pre-set
`EVENT_NARRATION.tradewind` on the three rim-sweep cards from Wyatt's explicit instruction, but the
equally explicit D-19 decision — *`parley` folds into `EVENT_NARRATION.trade`, the refusal becoming a
branch inside the one `trade` builder* — was applied to the card's **recommendation** (`merge`) and
not to its **target**. Half the decision landed.

**Required:**
1. Pre-set `mergeInto: "EVENT_NARRATION.trade"` on **both** `table:parley` and `table:parley~refused`,
   matching how the tradewind trio were handled.
2. **A card must never display `merge` without naming a destination.** Where no target is known, the
   card must say so unmissably — *"MERGE: no destination chosen — pick one"* — rather than leaving a
   bare tag whose meaning the reader infers from adjacent cards. Sitting inside a group of siblings
   makes the wrong inference the natural one.
3. Sweep every card whose default recommendation is `merge` and confirm each has a pre-set target or
   the explicit "choose one" state. Four such tags existed unresolved from his earlier pass (D-27
   era); this is the same defect surfacing again.


**D-19 CLARIFIED + CONFIRMED — two separate changes, both approved. (2026-07-29)**

Wyatt: *"the whole parley/trade fold was actually mostly just about copy -- i wanted to have players
only see the word 'trade' instead of the word 'parley'. i'm not sure what this 'folding in' entailed
on the back end?"* → then, given the two options: **"copy plus the merge"**.

**Correction to how D-19 was originally recorded.** Wyatt's stated goal was a *copy* change; the
event merge was escalated onto it from a defect I found separately. They are independent and are now
recorded as such, so neither is mistaken for a consequence of the other.

**Change 1 — the copy (what he actually asked for). Two edits, no back-end work:**

| Site | From | To |
|---|---|---|
| `flow.js:550` | button label `"🤝 Parley"` | `"🤝 Trade"` |
| `flow.js:423` | prompt `"Parley with whom?"` | `"Trade with whom?"` |

Those are the **only** two places the word reaches a player. Everywhere else — the event type, the
builder name, comments — is internal and invisible. The button's `value` is already `"trade"`. The
`parley` narration builder's own text never contains the word.

**Change 2 — the event merge (a separate defect, independently approved).** Motivation is NOT the
wording: an accepted bot hail currently emits **both** a `parley` and a `trade` event for the same
swap (`flow.js:756-761`), writing two captain's-log lines for one trade. Fix: a single `trade` event
carrying an `ok` field alongside the existing `kind` (`swap`/`buy`/`counter`/`hail`); the refusal
wording becomes a branch inside the one `trade` builder; the `parley` event type and its table entry
are removed.

**Determinism is NOT at risk** — verified: **zero `parley` events across all 31 fixtures**, because
`Game.play()`'s headless path never emits them (they arise only from human trade flows in
`src/ui/flow.js`). The engine's own event stream is untouched, so the phase's governing constraint
holds.

**Both land in 15-06.** Verify after: the word "parley" appears nowhere a player can read it, and an
accepted hail produces exactly one log line.


**D-19 SIMPLIFIED — no `ok` field. The fix is one conditional. (supersedes the earlier D-19 design)**

Wyatt: *"why does The merge adds an ok field to the trade event?"* — **it does not need to.** The
`ok` field was my design, not a requirement, and it is unnecessary.

**The three `parley` emit sites:**

| Site | `ok` |
|---|---|
| `flow.js:512` | always `false` — human refuses the counter |
| `flow.js:521` | always `false` — human declines outright |
| `flow.js:756` | `ok:dealt` — **and when `dealt` is true, `flow.js:761` emits a `trade` event for the same swap** |

The only place `ok` can be `true` is the one place that already double-narrates. **Emit the parley
event only when the hail is refused** (`if(!dealt)`), and `ok` is `false` at every site — an
invariant field, i.e. no field.

**Resulting change set for 15-06 — much smaller than the original D-19 spec:**
1. `flow.js:756` — emit only when `!dealt`. Fixes the duplicate captain's-log line.
2. Drop the now-invariant `ok` field from the three emits and from the builder's branching; the
   `parley` builder collapses to its refusal wording only (its deal-struck branch becomes dead).
3. Copy: `flow.js:550` `"🤝 Parley"` → `"🤝 Trade"`, `flow.js:423` `"Parley with whom?"` →
   `"Trade with whom?"` (D-19 clarified).
4. Optional, internal only: rename the `parley` event type to reflect that it now means *refusal*.
   Players never see it — cosmetic, and it churns replay/log handling, so **not recommended**.

**No change to the `trade` event. The engine emits `trade` (`engine/index.js:450/455`) and those
events are in all 31 determinism fixtures (75 of them: 63 `buy`, 12 `swap`) — leaving `trade`
untouched means the baseline does not move.** The earlier plan to add `ok` to `trade` would have
invalidated the corpus, which the phase boundary forbids.

**Verify:** an accepted hail produces exactly one log line; a refused offer still narrates; `git diff`
shows no change to any `t:"trade"` payload.


**D-41 EXTENDED AGAIN — the hail "Counter" option is a FOURTH dead end, and the worst of them.**

Wyatt: *"yes add to D-41"*, after asking what the *"Never mind"* button does.

**`flow.js:750`** builds the counter-price list as
`[price+1, price+2, price+3].filter(n => n <= p.coins - HAIL_RESERVE)` — only raises the bot can
afford. The prompt is then `raises.length ? await ask(…) : 0`. **When the bot cannot afford any
raise, `raises` is empty, no prompt is shown at all, and `counterAmt` is silently `0`** — the hail
ends as a refusal.

**So the player clicks "Counter" and nothing happens.** No screen, no message, no explanation. This
is worse than the other three, which at least surface a dead-end line the player can read.

**Now four instances of one pattern** — an option offered without checking it can do anything:

| Option | Offered when | Actually requires | Today |
|---|---|---|---|
| `⚔️ Attack` (`flow.js:549`) | a target is adjacent | …**and** `coins >= powder` | ✅ greyed + `sub` explains |
| `🤝 Parley` (`flow.js:551`) | any opponent alive | …**and** an opponent holds cargo | ❌ dead-ends at `flow.js:410` |
| `— coins only —` (`flow.js:435`) | always | …**and** `coins >= 1` | ❌ dead-ends at `flow.js:446` |
| `Counter` (`flow.js:746`) | always, on every hail | …**and** the bot can afford a raise | ❌ **silent** — no prompt, no message |

**15-06 task, added to the existing three:** compute `raises` **before** offering the hail choices and
gate the `Counter` option on `raises.length > 0`; grey it with `sub` text saying why (the bot cannot
go higher). The `raises.length ? … : 0` fallback then becomes an unreachable guard (D-40), not a
silent exit.

**Separate, smaller finding — "Never mind" is not a Back button** (`flow.js:751`,
`{label:"Never mind", value:0}`). It carries **no `back:true` flag**, so unlike its cousins it renders
as a normal labelled button (which is why Wyatt can see its text at all). But it abandons the whole
hail rather than returning to the Sell/Counter/Refuse prompt — so a player who picks Counter by
mistake **cannot get back to "Sell"**; the offer is gone. That contradicts UI-08's deliberate step
machine (`flow.js:411`: *"Back moves to the PREVIOUS prompt"*). **Flagged for Wyatt — not folded into
the D-41 fix**, since making it a true Back is a behaviour change he has not asked for, and "abandon
the hail" may well be intended.


**D-45 — "Never mind" correctly abandons the hail. No change.**

Wyatt: *"I agree -- 'abandon the negotiation' is exactly what you want there — walking away from a
haggle is a real choice, not a mis-click."*

`flow.js:751` `{label:"Never mind", value:0}` stays exactly as it is. It ends the hail rather than
returning to the Sell/Counter/Refuse prompt, and that is **intended**: declining to haggle is a
decision, not a navigation slip, so it does not owe the player a step back.

**It is also already rendered correctly**, which is why Wyatt could read it in the first place: it
carries **no `back:true` flag**, so `localAsk()` leaves it in the button row with its label intact
instead of collapsing it to the circular `‹` (D-34). Its shape matches its meaning — a real choice
looks like a button, navigation looks like a back arrow.

**Contrast with D-39** (`"← Actually, move instead"`), which *does* carry `back:true` and renders as
the circle. Both are now settled and consistent with their own natures; neither is a defect.

**UI-08's step-machine rule** (`flow.js:411`: *"Back moves to the PREVIOUS prompt"*) governs the
**parley** flow's Back buttons. It does not extend to the hail's "Never mind", which is an exit, not
a Back. Recorded so a later pass does not "fix" the inconsistency by making it step back.


**D-46 — The docking sequence: PLACE names the destination, INGREDIENT names the payoff.**

Wyatt, across three messages: the island place-names *"SHOULD be called in the 'Dock at the Flour
Patch'"* button; the narration can then drop *"docks at the Flour Patch"* and read
*"Crustbeard hauls aboard Toasty Wheat!"*; and *"this prompt should say 'Docking at 🌾 The Flour
Patch — flip!'"*.

**The principle:** the two steps that are about *going somewhere* name the **place**; the step about
*what you got* names the **ingredient**. Nothing is said three times.

| Step | Site | Today | Becomes |
|---|---|---|---|
| Action button | `flow.js:545` | `⚓ Dock at {ilabelImg(port)}` → *"Dock at 🌾 Toasty Wheat"* | *"⚓ Dock at the Flour Patch"* |
| Flip prompt | `flow.js:389` | `Docking at {ilabelImg(ing)} — flip!` | *"Docking at 🌾 The Flour Patch — flip!"* — **ingredient icon kept, place name substituted** |
| Narration (heads) | `util.js:387` | `docks at {place} — hauls aboard {ilabelImg(e.ing)}!` | *"Crustbeard hauls aboard Toasty Wheat!"* |

**Implementation note:** the prompt wants *icon + place*, not `ilabelImg()` (which emits icon +
*ingredient*). The needed shape already exists in the `bought`/`coins` dock branches:
`${iconImg(ING_IMG[e.ing])} ${…}`. Reuse it — do not hand-roll a new img tag.

**Only the `ing` (heads) narration branch loses its place clause.** The other three dock branches
still need theirs, and `empty` still needs the ingredient name (*"finds no Toasty Wheat"* is the
whole point of that line). Do not apply the cut across all four.

**Two things flagged for Wyatt, not decided:**
1. **Capitalisation.** He wrote *"The Flour Patch"*; `DOCK_PLACE` stores *"the Flour Patch"* — and the
   articles are deliberately baked in per island (2 of 7 carry *"the"*: `the Spice Isle`,
   `the Flour Patch`; the other 5 are bare: `Glitter Bay`, `Custard Key`, `Full Cream Folly`,
   `Clucker's Cove`, `Cocoa Cabana`). Mid-sentence, *"Docking at the Flour Patch"* reads correctly
   and *"Docking at The Flour Patch"* does not. **Recommend keeping the stored lowercase article.**
2. **Spectators see neither the button nor the prompt** — only the narration. Cutting the place from
   the heads line leaves them without a location. If that matters, the addressed/neutral split can
   differ: actor gets *"Ye haul aboard Toasty Wheat!"*, spectators get *"Crustbeard docks at the
   Flour Patch and hauls a crate aboard!"* The mechanism already exists.


**D-47 — Every card needs a SECOND copy field for the addressed ("you") rendering.**

Wyatt: *"yes, add the second notes box and migrate my questions."*

**The gap:** every narration line has **two** renderings — viewer-neutral and addressed (D-07/D-10) —
but the card offers **one** notes box. Wyatt has been writing the neutral version in Notes and the
addressed version in the **Question** field, which by design never becomes copy (D-26). As it stands
15-06 would apply his neutral rewrites and **silently discard every "you" variant.**

**Measured across his live session: 18 questions, of which the field is doing three different jobs:**

| Content | Count | Belongs in |
|---|---|---|
| Addressed-variant copy | 6 | **the new second notes box** |
| Merge targets written as prose | ≥2 | the `mergeInto` selector (D-36/D-44) |
| Genuine questions | ~10 | the Question field, as intended |

**Required:**
1. A second copy field per card — *"Addressed ('you') version"* — sitting beside Notes, exported as
   its own key, and feeding the derived-intent line so both renderings are visible before shipping.
2. **Migrate conservatively.** Move a question into the new field only where it clearly specifies the
   addressed rendering (matches `you[- ]version`, `the "you"`, `addressed`, or opens with `ye `).
   Leave everything else where it is. **Show a one-time summary of exactly what moved** so he can
   check — a wrong migration turns a question into shipped copy, the failure the Question field
   exists to prevent.
3. **Do NOT auto-resolve merge targets from prose.** Surface them to him against the `mergeInto`
   selector instead — free-text matching to a card id is exactly the guesswork D-44 warned about.

**D-48 — Dock flavour text is KEPT. His current rewrites contradict that; he must reconcile.**

Wyatt: *"I want to keep the flavor text."* All seven `DOCK_FLAVOR` strings stay, and their cards
remain `keep`. They are **not** dead copy.

**Conflict, flagged not resolved:** his in-progress rewrites for `table:dock~bought` and
`table:dock~coins` both read *"docks at the Flour Patch **for Toasty Wheat**…"* — replacing the
flavour phrasing (*"for 🌾 a sack of toasty wheat"*) with the plain ingredient name. Applied as
written, they delete the very text he has just said to keep, and `DOCK_FLAVOR` becomes unused.

**Ask him to reconcile — do not pick for him.** Either those two notes change back to the flavour
phrasing, or "keep the flavour text" means keep the strings while these two lines stop using them
(in which case the seven cards are dead after all). The two readings ship differently.

**D-49 — The two open `newround` merge targets are answered (found in his question fields).**

- `table:newround~heldStorm` → *"merge with fresh storm"* → **`table:newround`** (Fresh storm)
- `table:newround~streakStormHeldWontQuit` → *"Merge with Storm committed ≥2 rounds + wind holds
  (2 rounds)"* → **`table:newround~streakStormHeldGusting`**

Closes the question left open since D-27. **Confirm these readings with him** before setting them in
`mergeInto` — both are prose-to-card-id inferences, and D-44 exists because a wrong merge target is
worse than an unset one.


**D-49 CONFIRMED — the two `newround` merge targets are set (2026-07-29).**

Wyatt: *"yes, those merge targets are right — set them."* The readings inferred from his question
fields are correct and become the cards' `mergeInto` values:

| Card | Merges into |
|---|---|
| `table:newround~heldStorm` (*Storm + wind holds, streak < 2*) | **`table:newround`** — Fresh storm |
| `table:newround~streakStormHeldWontQuit` (*Storm ≥2 rounds + wind holds ≥3*) | **`table:newround~streakStormHeldGusting`** — Storm ≥2 + wind holds (2 rounds) |

**Closes the question open since D-27** ("one line for all eight branches, or several"). The answer
turned out to be *several, with two of the eight folded in* — the two rarest, at roughly 1 round in
37 and 1 in 1,000 respectively. Six distinct round headers survive.

**D-48 FOLLOW-UP — flavour text restoration is pending on Wyatt, and he is waiting on the page.**

Wyatt: *"I will re-add the flavor text back in when you tell me i can."* He intends to reconcile the
conflict himself by editing `table:dock~bought` and `table:dock~coins` to restore the flavour
phrasing (*"for 🌾 a sack of toasty wheat"*) in place of the plain ingredient name he currently has.

**Blocked on D-47's second copy field landing** — those two cards also need their addressed ("you")
variants written, and he is not going to edit them twice. **Tell him explicitly when the page is
ready**, naming those two cards, or the flavour text ships deleted despite D-48 saying keep it.


**D-50 — Canonical glossary for Wyatt's `{curly brace}` shorthand, and the typo sweep.**

Wyatt: *"make fix the correct shorthand for the images, etc. that I am putting in the {curly braces}
-- i don't know what any of those variables … or images … are actually called."*

**23 distinct tokens across 78 written fields.** Mapping, authoritative for 15-06:

**Icons — Wyatt should write the EMOJI, not a placeholder.** `emojify()` (`src/shared/index.js:102`)
swaps every one of these for its custom art automatically at render. A `{token}` is *more* work and
has to be translated; the emoji is the shorthand the game already understands.

| His token | Count | Write instead | Resolves to |
|---|---|---|---|
| `{coin}` | 15 | `🌕` | `COIN_IMG` |
| `{coin-tails}` | 7 | `⚫` | `FLIP_TAILS_IMG` |
| `{coin-heads}` | 4 | `⚪` | `FLIP_HEADS_IMG` |
| `{sailboat}` | 2 | `⛵` | `SAILBOAT_IMG` |
| `{swords}` | 1 | `⚔️` | `BATTLE_IMG` |
| `{sugarfish}` | 1 | `🐠` | `SUGARFISH_IMG` |
| `{crab}` | 1 | `🦀` | `CANDY_CRAB_IMG` |
| **`{rod}` + `{fishing-hook}`** | 1+1 | `🎣` | `FISHING_ROD_IMG` — **two names, one icon** |
| **`{clock/stopwatch}`** | 1 | **ambiguous** | three exist: `⏳` hourglass, `⏰` alarm, `⏱` stopwatch. **Ask him.** |

**Ingredients — icon + name together, via `ilabelImg(key)`.** Note two of his tokens use the display
word, not the key:

| His token | Actual key | Renders as |
|---|---|---|
| `{wheat}` ×2 | `wheat` | 🌾 Toasty Wheat |
| **`{milk}`** | **`dairy`** | 🥛 Fresh Milk |
| `{sugar}` | `sugar` | 🍬 Crystal Sugar |
| `{eggs}` | `eggs` | 🥚 Speckled Eggs |
| `{cocoa}` | `cocoa` | 🍫 Cacao Pods |
| **`{cinnamon}`** | **`spice`** | 🌶️ Hot Cinnamon |
| `{vanilla}` | `vanilla` | 🌼 Vanilla Beans |

(Ingredient emoji are NOT in `EMOJI_IMG` — that is D-17's defect, fixed in 15-06 via `fmtItem`. Until
then ingredients must go through `ilabelImg`, not a bare emoji.)

**Variables — genuine placeholders, keep a token:**

| Token | Real source |
|---|---|
| `{dir}`, `{dir1}` | `DIRNAME[e.dir]` — the round's first/only wind direction |
| `{dir2}` | `DIRNAME[e.dir2]` — the storm's second gust (always perpendicular) |
| `{player}` | `pn(seat)` — coloured, bolded captain name |
| `{offer}` | the event's own offer field |
| `{N}` | a numeric amount from the event |

**Use the existing helper, do not string-concatenate.** Wyatt wrote *"this {dir}erly is gusting"*.
`windHoldPhrase(dir, streak)` (`src/ui/util.js`) already produces exactly that from `WIND_ADJ[dir]`,
including the ≥3 "won't quit" variant. 15-06 must call it rather than appending `"erly"` to a
direction name.

**Mechanical defects found — 22 of 78 fields:**
- **Leading/trailing spaces (~14)** — almost all are where he deleted a leading emoji when pasting
  (`" Crustbeard attacks…"` was `"⚔️ Crustbeard attacks…"`). **Per D-16 the icon is re-attached
  regardless**, so these are harmless, but the stray space must be trimmed.
- **Double spaces (3)** — e.g. `"— Round 3:  The storm's baked in"`.
- Brace and quote mismatches he had already found and fixed himself before this sweep.

**Required of 15-06:** normalise whitespace on every applied string; translate any surviving
`{token}` per the tables above; **stop and ask** on `{clock/stopwatch}` rather than guessing.


**D-50 RESOLVED — `{clock/stopwatch}` is the HOURGLASS `⏳`, and the three clock icons have distinct meanings.**

Wyatt: *"okay use the hourglass in that context."*

The lobby caption (`misc:lobby:lobby.js:115` — *"{clock/stopwatch} Yer mateys will appear above…"*)
uses **`⏳` / `HOURGLASS_IMG`**. It is about waiting for players to join, not about a control.

**All four clock-family icons have custom art on disk** (`assets/icons/`: `hourglass.png`,
`alarm.png`, `stopwatch.png`, `pause-symbol.png`). Their meanings, now settled — **keep them
distinct**:

| Icon | Means | Used at |
|---|---|---|
| `⏱` `STOPWATCH_IMG` | **the shot-clock control** — something you can press | `panel.js:87` toggle, `:94` *"no rush — tap ⏱"* |
| `⏳` `HOURGLASS_IMG` | **time passing / elapsed** | `board.js:542` *"Nobody finished!"*; now also the lobby wait caption |
| `⏰` `ALARM_IMG` | — | **defined but used nowhere.** Available, but introducing it means adding a third clock meaning; do not reach for it casually |
| `⏸` `PAUSE_SYMBOL_IMG` | paused state | panel |

**The reasoning matters more than the pick:** `⏱` currently signals *"this is a control"* consistently.
Using it for a passive waiting message would blur a signal that is presently clean. A later pass must
not "unify" these icons — the split is deliberate.


**D-51 — A fabricated event must be one the real game could actually produce.**

Wyatt, of the battle crate card: *"this shouldn't say 'null' right? … Crustbeard takes null."* —
**correct, and the game never produces it.**

`art-review/narration-audit.html:772` fabricates `{ spoil: null, spoilIng: "cocoa" }`. But every real
emit site sets **both** fields together, and for a crate win `spoil` is the rendered ingredient:

```js
spoil = ilabelImg(pick); spoilIng = pick;   // orchestrator.js:546, engine/index.js:572-573
```

The builder renders `takes ${e.spoil}` for the ingredient case (`util.js:473`), so a null `spoil`
prints the word **null**. The card should read *"Crustbeard takes 🍫 Cacao Pods."*

**Second defect on the same card:** the fabricated `rounds` (`[[1,0,false,"a"],[0,1,false,"d"]]`)
score **1–1**, rendered as *"wins 1–1 in 2 rounds"* — impossible, since a battle is first to 2 hits.
A card cannot be judged as copy when its numbers could not occur.

**This is a third class of audit-page defect**, distinct from the two already handled:

| Class | Defect |
|---|---|
| D-21 | a branch the game produces but **no card renders** |
| D-33 / D-34 / D-40 / D-43 | a card renders text the game **can never produce** |
| **D-51** | a card renders the **right line with impossible values** |

The first two are now enforced by self-checks; this one is not. **Required:** every fabricated event
must satisfy the invariants of its real emit sites — `spoil` set whenever `spoilIng` is, scores that
a real battle could reach, and so on. Where an invariant is mechanically checkable (paired fields,
especially), assert it; otherwise derive the fabricated value from the same helper the game uses
(`ilabelImg`) rather than hand-writing a literal, which is how `null` got in.


**D-52 — The battle round-result block has TWO attacker/defender duplicate pairs. Merge both.**

Wyatt tagged `orchestrator.js:483` `merge` with the question *"i dont know why this was its own
branch?"* — correct: it is `:482` with the names swapped.

**The block is six lines (`orchestrator.js:482-488`), containing two identical-shape duplicate pairs:**

| Lines | Differ only by | Wyatt's marks |
|---|---|---|
| **482 / 483** — both-heads, downwind carries the shot | attacker vs defender is downwind | 482 `rewrite`, **483 `merge`** ✅ he caught it |
| **486 / 487** — one side lands a hit | attacker vs defender hit | 486 `rewrite`, **487 `keep`, unreviewed** ⚠ same defect, not yet caught |
| 484 crosswind cancel · 488 both miss | — | no duplicate, genuinely single lines |

**His own 482 rewrite already contains the solution.** He wrote both renderings:

- neutral: *"Both fire ⚪️ HEADS — but Crustbeard's firing downwind and the shot hits!"*
- addressed: *"Both fire ⚪️ HEADS — but yer firing downwind and the shot hits!"*

That is the merge: **one line, with the downwind shooter named — or addressed as "ye" when it is
you.** The attacker/defender split disappears because the only thing that ever differed was *which
name goes in the slot*, which the D-10 neutral-plus-variants mechanism already handles. The side that
is downwind is computed one line earlier, so the shooter is already known.

**486/487 collapse the same way** — one line naming whoever landed the hit, addressed when it is the
reader. His 486 rewrite is *"Crustbeard lands a hit!"*; the addressed sibling is *"Ye land a hit!"*
and 487 folds in. **Flag this to him** — 487 is currently `keep` and unreviewed, so as it stands 486
gets rewritten and its twin does not, and the two drift apart. Exactly the failure the merge prevents.

**For 15-06:** collapse `:482`/`:483` into one downwind line and `:486`/`:487` into one hit line, both
in neutral-plus-addressed form. Six branches become four. Same pattern as D-18's bot/human storm-leg
duplication and D-35's host/guest sail prompt — a fork that exists only because the code branches on
*who*, when the narration should branch on *who is reading*.


**D-53 — `--` in Wyatt's copy becomes an EM dash `—`, not an en dash. Applied at 15-06.**

Wyatt: *"i can't type n-dashes in the text boxes -- so if I write '--' replace that with the
appropriate n-dash"*, then *"you can do it at the end"*.

**Correction to the ask — the house style is the EM dash.** Counted across the three narration files:

| Character | Count | Used for |
|---|---|---|
| **`—` em dash** | **441** | every prose break — the game's universal convention |
| `–` en dash | 4 | **only** battle scores (`${aP}–${dP}`, `util.js:468-470`) and one placeholder coin dash |
| ` - ` spaced hyphen | 1 | — |

So `--` in his copy means the **em dash `—`** he sees everywhere in the existing narration. The en
dash is reserved for number pairs; substituting it in prose would be wrong in all 441 places and
right in none.

**Rule for 15-06:** replace `--` (and a spaced ` - ` used as a prose break) with `—` in every applied
string. **Do NOT touch a `–` between digits** — that is a score and is already correct.

Timing is his call: *"you can do it at the end"* — this is a normalisation pass applied when copy is
written to `src/`, alongside D-50's whitespace trimming and placeholder translation. It is **not**
applied live on the audit page, so his cards will keep showing `--` while he works; that is expected
and not a defect.

**Verification:** no applied narration string contains `--`; every `–` in shipped copy sits between
two digits.


**D-54 — Two-party lines render THREE variants but the editor offers TWO fields. Add the third.**

Wyatt, of the battle opening card: *"these battle lines NEED three options, just like are currently
displayed. can you add those just here for parity?"*

**The card already renders all three** — it is the editor that is short:

| Rendered | Editable? |
|---|---|
| Neutral — *"Crustbeard attacks Davy Scones! First to 2 points wins…"* | ✅ Notes |
| Addressed to the **attacker** — *"Crustbeard — ye attack Davy Scones!…"* | ✅ Addressed field (D-47) |
| Addressed to the **defender** — *"Crustbeard attacks ye!…"* | ❌ **no field** |

**13 cards are affected** — every two-party event, i.e. those where `narrationSubjects()`
(`util.js:548`) returns two seats: `battle`, `battleflee`, `parley` (×2 branches), `trade` (×2),
`blocked`, `bakeoff`, the battle opening announcement, and both side-bet lines.

**This is D-47 one step further.** D-47 fixed "one box for two renderings"; two-party events have
**three**, and the second addressed form is currently unwritable — so a rewrite of the defender's
line has nowhere to go and would be silently lost, exactly as the addressed forms were before D-47.

**Required:**
- A **second addressed field on two-party cards only** — do not add a dead third box to the ~200
  single-subject cards.
- **Label each by its role, not by seat index** — *"Addressed to the attacker"* / *"…the defender"*,
  *"…the offerer"* / *"…the other captain"*. `Crustbeard`/`Davy Scones` are sample names; a label
  reading "Addressed to Davy Scones" tells him nothing about which role ships that line.
- Derive the count from the card's actual rendered variants (it already knows — that is how the page
  renders three boxes), never a hand-listed set of ids.
- Export under its own key; feed the derived-intent line like the other two.

**Note for the migration:** for the 13 affected cards Claude's drafted addressed text (D-47 follow-up)
was written from the **first-named party's** side — attacker, offerer, bettor. Those stay where they
are; the new field starts empty for the second party.


**D-55 — Guest sail-highlights are a second, degraded rendering. Same host/guest fork, third instance.**

Found while Claude played as a guest in Wyatt's game (2026-07-29): selecting `.sailCell` returned
nothing, so three turns were silently spent clicking "Stay put". The class exists only on the host's
board. Wyatt: *"Might be worth 15-06 or Phase 16 giving guest highlights the same class, purely so
the two boards are inspectable the same way."* — **agreed, and the player-facing half matters more.**

| | Host (`localPickCell`, `flow.js:196`) | Guest (`remotePickHighlights`, `flow.js:1040`) |
|---|---|---|
| class | `sailCell` | **none** |
| fill | `#ffc23a` | `#fdb63d` |
| opacity | `.5` (via CSS) | `.4` (inline) |
| animation | **`sailBounce` pulse**, staggered per cell | **none** |
| hover | **brightness + drop-shadow** (`index.html:413`) | **none** |
| reduced-motion | honoured (`index.html:418`) | n/a — nothing animates |

**So a guest's move options don't pulse, don't respond to the cursor, and are dimmer and a different
orange.** The affordance that says *"these are clickable"* is the animation and the hover, and guests
get neither. Two players in the same game are looking at materially different boards.

**This is the D-35 fork a third time.** The sail decision has forked host/guest code, and each fork
has drifted independently: D-35 the *wording*, this the *DOM contract*, and this the *visual
affordance*. Same root cause every time — `flow.js:178`'s `decisionIsLocal(p.idx) ? localPickCell(…)
: remotePickHighlights(…)`.

**Fix:** give guest highlights `class:"sailCell"` and drop the inline fill/opacity so both paths take
the same CSS. One line, and it fixes the animation, hover, colour and reduced-motion handling at
once — inspectability comes free.

**Scope: Phase 16, not 15-06.** It is visual polish with no narration content, and Phase 16 already
owns UI-01…07. Flagged there rather than smuggled into a copy pass. **Related: D-35's wording fix
(15-06) touches the same two functions — worth doing both in one sitting so the fork is closed
rather than half-closed.**


**D-56 — Host/guest drift is ONE path, not a pattern. Roll it in; add a parity test, not an audit.**

Wyatt: *"Is it worth scoping a whole audit of the drift from host to guest, for a different
milestone, or is it small enough to roll into something else"* — **measured, and it rolls in.**

**There are only three host/guest branch points, and two are healthy:**

| Path | Branch | State |
|---|---|---|
| Every `ask()` prompt | `util.js:841` | `localAsk` (`flow.js:86-96`) and `watchPrompt` (`orchestrator.js:896-916`) are **near-identical twins** — same `apBack` / `apMsg` / `apBtns${grid}` / `apBtn` / `apDisabled` / `apSub`, same `apBtnStyle`, same disabled-is-display-only rule |
| Battle prompts | `orchestrator.js:361` | same shape; `msg`/`spectMsg` is a deliberate actor/spectator split, not drift |
| **Sail highlights** | `flow.js:178` | **the outlier** — see D-35, D-55 |

**Why the outlier is the outlier:** it is the only place the guest **draws its own element** rather
than reproducing the host's markup. Everywhere else the guest renders a payload the host composed, so
it *cannot* drift. Give a path its own drawing code and it drifts in every dimension at once —
wording (D-35), DOM contract (D-55), and visual affordance (D-55).

**So an audit would spend real effort confirming a two-minute finding. Do not scope one.**

**The genuine residual risk:** those twin renderers match **by discipline, not by structure**. Two
parallel implementations kept in step by whoever remembers. Nothing enforces it, and nothing would
notice if they diverged tomorrow.

**Agreed plan:**
1. **Fix the sail highlights** — give the guest rect `class:"sailCell"`, drop the inline fill/opacity
   so both take the same CSS (Phase 16, alongside D-35's wording fix in the same two functions —
   close the fork in one sitting rather than half-closing it).
2. **Add a class-parity regression test (Phase 16 task, see below)** — converts "we keep these in
   step carefully" into "they cannot silently diverge."
3. **No separate audit, no new milestone.**

**PHASE 16 TASK — host/guest render-parity test.** Add to `scripts/` and wire into `npm test`:
assert that `localAsk` and `watchPrompt` emit the **same set of CSS class names** for an equivalent
prompt (`apBack`, `apMsg`, `apBtns`, `apBtn`, `apDisabled`, `apSub`, plus the `recipes` grid
modifier), and that the sail-highlight paths agree on `sailCell`. Static source-scanning is
acceptable — the existing `scripts/*_check.js` gates already work that way and need no DOM. Fail
loudly naming the class present on one side and missing on the other. ~10 lines; the point is that
the next divergence is caught by CI rather than by someone playing a guest seat and noticing their
board doesn't pulse.


**D-57 — GUEST NARRATION NEVER FADES. NARR-06's timing change only affects the host.**

Found by Wyatt during the 2026-07-29 playtest: *"it's faded for the host, and not for the guest."*
Verified live on the guest seat — the end-of-voyage message carried `class="apMsg"`, **no
`fadeOut`**, `opacity: 1`.

**The two render paths:**

| | Host | Guest |
|---|---|---|
| Entry point | `flash(msg, ms, holdMs, variants)` (`panel.js:384`) | `showNarration(html)` (`panel.js`) |
| Body | render → `await sleep(msgHoldMs(text))` → `el.classList.add("fadeOut")` (`:395`) | `panel(html ? '<div class="apMsg">'+html+'</div>' : "")` — **that is the whole function** |
| Hold timer | yes, length-aware | **none** |
| Fade | yes | **never** |

**Consequence for this phase: NARR-06 is only half-delivered.** Its success criterion is *"Narration
text stays fully visible 10% less time before it begins fading."* Plan 15-02 cut
`MSG_HOLD_MULTIPLIER` 0.8→0.72 and `BOT_MSG_HOLD_MULTIPLIER` 0.5→0.45 — **both consumed exclusively
by `msgHoldMs()`, which only `flash()` calls.** A guest has no hold to shorten and no fade to begin,
so the requirement is unverifiable on a guest and false as written. Every remote player in every
online game is unaffected by the change we shipped for it.

**Same root cause as D-35/D-55/D-56, fourth instance** — a host path and a guest path for one
concept, drifting independently. Here the guest path is not a degraded copy but a *stub*: three
of `flash()`'s four parameters (`ms`, `holdMs`, `variants`) have no equivalent at all.

**Also observed in the same box (formatting, separate defect):** at end of voyage the narration box
sits under the End-of-Voyage panel showing *" Wyatt baked a Caramel Slice and won Best Baker in the
Caribbean!"* — duplicating the win the panel already announces, and with the leading space D-50
predicted (a stripped emoji). Related to the pending todo `eov-narration-box-not-cleared`
(`resolves_phase: 16`), but that todo describes an **empty** box; this is a **non-empty duplicate**.
Update that todo rather than filing a second one.

**Decision needed from Wyatt before phase sign-off:** either
1. give the guest path a hold+fade (mirroring `flash()`'s timing, so NARR-06 is true for everyone), or
2. accept NARR-06 as host-only and record the limitation explicitly.

Option 1 is the honest reading of the requirement. **This must not be discovered after the phase is
marked complete** — it is the requirement's own success criterion.


**D-57 RESOLVED — give the guest a hold and fade. NARR-06 becomes true for every player.**

Wyatt: *"do option 1 -- give the guest a hold and fade"*.

**15-06 task.** `showNarration(html)` (`src/ui/panel.js`) currently is, in full:

```js
export function showNarration(html){ panel(html?`<div class="apMsg">${html}</div>`:""); }
```

It must mirror `flash()`'s timing (`panel.js:384-397`): render, wait `msgHoldMs(text)` against the
**rendered** text, then add `.fadeOut`. Reuse `msgHoldMs()` — do not introduce a second multiplier,
or NARR-06's 10% cut will apply to one path and not the other, which is precisely today's bug.

**Implementation notes:**
- Measure the hold from the **rendered** text (`el.textContent`) exactly as `flash()` does, not the
  raw HTML — icon markup and `<span>`s would otherwise inflate the length.
- `flash()` awaits `el._revealDone` (the typewriter promise) before starting its hold. The guest
  path must do the same, or the fade can begin while characters are still appearing.
- Guests receive narration from `watchNarr`, which can deliver a new line while the previous hold is
  still pending. **Cancel any in-flight hold/fade when a new line arrives** — otherwise a stale timer
  fades the new message. `flash()` does not face this (it is awaited in sequence); the guest path is
  event-driven and does.
- Keep it a UI-layer change only. **No engine or event-stream change** — the phase boundary and the
  31 determinism fixtures are untouched by narration timing.

**Verify:** on a guest seat, a narration line fades after a hold proportional to its length, matching
the host's timing for the same line; a rapid second line cancels the first's fade rather than
inheriting it. **NARR-06's criterion must be demonstrably true from a guest seat, not only a host
seat** — that is the whole point of this decision, so the phase's verification must test it there.

