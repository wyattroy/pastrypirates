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

