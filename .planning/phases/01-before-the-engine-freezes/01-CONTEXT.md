# Phase 1: Before the Engine Freezes - Context

**Gathered:** 2026-08-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Five changes to `4/` that must all land **before Phase 3 records the determinism corpus**, because
the corpus is a one-way door (`docs/DETERMINISM-RERECORD.md`): capture exactly once, never weaken
`REQUIRED_EVENT_TYPES`, and after capture nothing may change what `4/src/engine/index.js` emits.

1. **FIX-01** — the turn-clock preference stops leaking into the live game.
2. **TEST-01** — `4/src/ui/stage.js` imports under Node without throwing.
3. **TEST-02** — `4/scripts/no_undef_check.js` exits 0.
4. **RULE-01** — a captain who passes receives one dubloon, at all three `{t:"pass"}` sites.
5. **RULE-02** — the pass narration says so, in both renderings, across all 50 sea-creature entries.
6. **FIX-06** — the engine ships exactly one bot planner.

**Not in this phase:** anything requiring multiplayer to run (Phase 2), any gate or corpus work
(Phase 3), any promotion/cutover decision (Phase 6). **No second gameplay rule** — RULE-01/02 is the
one sanctioned exception (`REQUIREMENTS.md:160`); a second costs a determinism re-record.

</domain>

<decisions>
## Implementation Decisions

### FIX-01 — the clock preference

- **D-01: Namespace to `pp4_timerOff`, and DELETE the old `pp_timerOff` outright.** Not migrate, not
  leave. Wyatt, 2026-08-18. The blast radius is small and known: `/4` is `Disallow: /4/` in
  `robots.txt:8` and `noindex, nofollow` at `4/index.html:10`, so the only browsers carrying a
  `/4`-planted `pp_timerOff` belong to people Wyatt sent the link to.
  — **Reversibility:** one-way — a removed localStorage key cannot be restored. Anyone who had
  deliberately turned the clock ON inside `/4` gets it switched back off once, and anyone who had
  turned it OFF in the *live* game and also visited `/4` reverts to live's clock-ON default. Both
  are recoverable by the player with one tap of the existing toggle.

- **D-02: The deletion is a ONE-TIME cleanup guarded by a marker, not a delete-on-every-load.**
  Claude's call, stated to Wyatt and not contested. Deleting on every visit would mean `/4`
  permanently vandalises the live game's preference — the exact bug FIX-01 exists to fix, re-committed
  from the other direction.

- **D-03: The clock default stays OFF everywhere, including once multiplayer returns — ONE key, no
  solo/multiplayer split.** Wyatt, 2026-08-18, verbatim: *"multiplayer is played between friends, who
  can communicate through the chat. the host's game would be 'hung' because their friend is no longer
  playing, even if the timer was on."* This closes the question raised by the intake report
  (`4/src/orchestrator.js:1143-1152`, `remotePrompt` with no timeout) — **the shot clock is not the
  mechanism that handles a dropped player.** MP-13's presence-loss fallback (Phase 4) is.

- **D-04: The standing storage rule is "share who you are, split how you play."** Wyatt,
  2026-08-18. Identity follows the player across both games; anything that changes how a game behaves
  gets its own per-game key. **This answers every future storage key without asking again**, and it
  survives the cutover, where the new game and `/classic` share one origin.

  Verified state of the four keys the two games actually share (grep of every `pp_*` literal in both
  `src/` and `4/src/`):

  | Key | Live reads at | Verdict under D-04 |
  |---|---|---|
  | `pp_timerOff` | `src/orchestrator.js:177,1399,1404` | **Split** — this is FIX-01 |
  | `pp_id` | `src/ui/util.js:1491` | **Stays shared** — identity (D-03 exclusion already documented at `4/src/ui/util.js:1893`) |
  | `pp_lastName` | `src/ui/util.js:1502` | **Stays shared** — display name; rationale already written at `4/src/ui/util.js:1915` |
  | `pp_muted` | `src/ui/audio.js:45` | **Stays shared** — about the player's surroundings, not the game |

  **`pp_rematch` and `pp_seaIdx` cannot leak and need no change** — both are `4/`-only; the live game
  reads neither and has no `SEA_CREATURES` list at all. *(An earlier framing in discussion claimed
  "five more keys leak the same way." That was wrong — it grepped what `4/` writes without checking
  what live reads. Corrected here so no downstream agent re-derives it.)*

### FIX-06 — the dead bot brain

- **D-05: Delete `planTurnClassic` and its dead subtree, and rewrite the ladder to run one brain.**
  Wyatt, 2026-08-18, verbatim: *"we should never use the old bot brain, it's done. Bot tuning should
  be done with the newest algorithm that is actually used in game. this follows one of my design
  principles -- elegance. why would we use bot logic to simulate a game that is different from the
  actual bot logic in the game?"*

  **The record was wrong and the planner must not trust it.** `REQUIREMENTS.md:130` and
  `research/v2.0-intake/CODE-QUALITY.md:59` both state `planTurnClassic` has "zero callers" /
  "exactly one occurrence in the whole repo." It has four more:

  ```
  scripts/bot_ladder4.js:10,17   (prose describing it as the control arm)
  scripts/bot_ladder4.js:22      import { Game, roundCfg } from "../4/src/engine/index.js"
  scripts/bot_ladder4.js:29      const CLASSIC_PLAN = Game.prototype.planTurnClassic;
  ```

  `scripts/bot_ladder4.js` is the **only** script in the repo that loads `4/`. Deleting the planner
  without rewriting it breaks the ladder. **So FIX-06 is two pieces of work, not one.**

  **The rewrite:** seat all bots with the shipping brain (`planTurnV3`) and compare **before vs after
  the pass dubloon on fixed seeds**, replacing the live head-to-head with a before/after measurement.

  — **Reversibility:** costly — the code is recoverable from git history, but the numbers in
  `docs/BOT-V3-RACE-PLANNER.md` become permanently **unreproducible**: they stay true as a written
  record of why the v3 brain was chosen, and nobody can ever re-run that head-to-head. Wyatt was told
  this explicitly and accepted it.

  Dead subtree to remove (from the intake report, to be re-verified before deleting):
  `planTurnClassic:2739-2875`, `turnsToWin:2085-2127`, `turnsToWinIf:2128-2142`,
  `denialValue:2143-2157`, `legTurns:2048-2059`. **Do not confuse these with the v3-suffixed
  versions** (`legTurns3`, `turnsToWin3`, `turnsToWin3If`, `tour3`) which are live and load-bearing.
  Also resolves the divergent float epsilon recorded at `CODE-QUALITY.md:121` (`1e-12` in v3 vs
  `1e-9` in the classic copy).

  `scripts/bot_ladder3.js` points at `3/`, which Phase 6 deletes. Out of scope here.

### RULE-01 / RULE-02 — passing pays, and says so

- **D-06: The pass narration tag is `Recipe idea! (+1🌕)`.** Wyatt's pick, 2026-08-18, after
  rejecting two longer drafts of his own: *"it's honestly pretty awkward, and it's getting really
  long… core idea: you're getting recipe inspo from the sea creatures. core constraint: must be short
  and easy to read."*

  **It is a subjectless fragment, and that is the whole point.** The 50 entries are hand-written
  prose pairs (`4/src/shared/index.js:226`) with an addressed `y` form and a third-person `t` form
  carrying a `{}` name marker. Roughly 20 of the 50 end on the *creature* as the nearest grammatical
  subject — *"{} catches sight of the bottom, and a dozen donut shrimp bounce past."* Any appended
  clause with a verb hands the pen to the shrimp. A fragment with no subject and no verb agreement
  works identically in both persons on all 50 lines.

  **Consequence: all 100 hand-written strings stay untouched.** The tag is appended by the renderer
  in ONE place. This also honours `4/src/ui/util.js:346`, which forbids conjugating or deriving
  agreement from these strings — *"the deleted seaSighting() did all three and got the plurals
  wrong."*

  **Treatment:** wrap the whole tag unbreakable (`<span class="nobrk">`), not just the parenthetical.
  Same reasoning as the sailing-order line at `4/src/ui/flow.js:2231` (G27/P7) — a unit and its
  amount are one readable thing. The `🌕` is emoji shorthand; `emojify()` swaps it for `COIN_IMG` at
  `panel()`'s chokepoint (D-50). Do not hand-roll markup for the coin.

  Rendered check, on a line that broke every earlier draft:
  > *Crustbeard catches sight of the bottom, and a dozen donut shrimp bounce past. Recipe idea! (+1🌕)*
  > Crustbeard — ye catch sight of the bottom, and a dozen donut shrimp bounce past. Recipe idea! (+1🌕)

- **D-07: The balance check is a GATE on this phase, not a note.** Wyatt, 2026-08-18: if the ladder
  shows bots passing materially more and voyages dragging, that is **a bug to fix before the engine
  freezes** — most likely by lowering the payout — and the planner reports exactly what moved and
  why. Rationale: Phase 3 freezes the corpus, after which the same fix costs a re-record.

  Passing is the always-available turn-ender, so if it pays, it is the one move nobody can ever be
  denied. The race planner does not want coins, it wants to win — so the signal is **pass rate and
  voyage length**, measured before and after on fixed seeds (see D-05's ladder rewrite; the two are
  the same piece of work).

### Claude's Discretion

- **Where the dubloon is applied.** `Game.ev()` at `4/src/engine/index.js:320` opens with
  `if(!this.record)return;` — **it is a recorder, not a reducer.** It does not mutate state, so the
  coin cannot be paid "inside the pass event." Prefer a single shared `doPass(p)`-style method that
  all three emission sites call, over three inline `+1`s — per CLAUDE.md §2, the elegant version
  deletes code. Sites: `4/src/ui/flow.js:1861` (human menu), `4/src/ui/flow.js:2140` (bot fallback in
  the animated turn), `4/src/engine/index.js:2993` (engine fallback). **Both bot paths must pay** —
  `4/src/ui/flow.js:2130-2137` explains why the fallback is duplicated rather than inherited, and a
  fix applied only to the engine "would fix the simulator and leave every real browser game exactly
  as broken."
- **TEST-02 is two problems, not one.** `4/scripts/no_undef_check.js` exits 1 on three hits. One is
  real: `4/src/ui/stage.js:190`, a bare module-scope `addEventListener` — fix with `window.` behind a
  `typeof` guard, matching `4/src/main.js:157`'s own pattern. **The other two are checker
  false-positives** on `set subject(v){…}` / `get subject(){…}` at `4/src/ui/stage.js:1483`, matched
  as call-position identifiers. Fix the heuristic, not the working code.
- **Keep the two checkers identical.** `diff scripts/no_undef_check.js 4/scripts/no_undef_check.js`
  is currently **byte-identical**, and the root copy exits 0 only because `src/` happens to contain
  no accessor in that shape. Fixing one and not the other creates exactly the drift the intake report
  flagged for `4/scripts/lib/`. Apply the heuristic fix to both in the same commit.
- **Sweep all five `pp_timerOff` sites in `4/`, not just the one FIX-01 names.**
  `4/src/ui/stage.js:1478` (the force-write), `4/src/ui/stage.js:909` (the menu toggle),
  `4/src/orchestrator.js:184` (the sheet toggle), `:1570` (the read), `:1575-1576` (the read that
  pushes to the room via `netSetTimerOff`). Per CLAUDE.md §2 consistency, state in the reply which
  sites were checked.
- Which reads of the removed classic-planner helpers are safe to delete — re-verify callers before
  deleting, per CLAUDE.md §2: *"List what reads a quantity, gates included, before you change how it
  is produced."*

### Folded Todos

None. The matcher returned 38 keyword hits (`todo.match-phase 1`), all v1-era and none about FIX-01,
TEST-01/02, RULE-01/02 or FIX-06 — the 0.9 scores come from generic tokens (`src`, `flow`, `turn`).
`STATE.md` already records that all 39 pending todos predate `4/`. See Deferred below for the three
worth a second look.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### The one-way door this phase exists to get ahead of
- `docs/DETERMINISM-RERECORD.md` — capture exactly once; never weaken `REQUIRED_EVENT_TYPES`.
  Everything in Phase 1 must land before Phase 3 captures.
- `docs/DETERMINISM-RERECORD-NEXT.md` — three queued purity fixes. `STATE.md` flags an open question:
  with no fixtures yet, the reason they were queued has disappeared. **Decide before capture, not here.**

### Bot behaviour and tuning (FIX-06, D-07)
- `docs/BOT-DESIGN-PRINCIPLES.md` — principle 10 (nothing is a constant). **Read before touching the
  ladder or the payout.**
- `docs/BOT-V3-RACE-PLANNER.md` §4 — the shipping brain. Cites `planTurnClassic` as "the control arm
  of every number below" (`:9`, `:179`); those citations become historical once D-05 lands and the
  doc needs a note saying so. `docs/FABLE-BOT-BRIEF.md` carries the same reference.
- `scripts/bot_ladder4.js` — the only script in the repo that loads `4/`; rewritten by D-05.

### Phase 1 scope and evidence
- `.planning/ROADMAP.md` → "Phase 1: Before the Engine Freezes" — goal, 5 success criteria, evidence
  block, and the balance note that D-07 turns into a gate.
- `.planning/REQUIREMENTS.md:55,73,125,130,160,169` — FIX-01, TEST-01/02, RULE-01/02, FIX-06, plus the
  two "explicitly not doing" rows (no second gameplay rule; the clock default is NOT changed).
  **`:130`'s "zero callers" claim is wrong — see D-05.**
- `.planning/research/v2.0-intake/CODE-QUALITY.md` — the audit every requirement here traces to.
  **Two claims in it are wrong or incomplete: the `planTurnClassic` caller count (`:59`) and the
  scope of the localStorage leak.** Both corrected in D-04/D-05 above.

### Standing rules that constrain the work
- `.claude/CLAUDE.md` §2 — consistency (sweep every surface and say which you checked); nothing is a
  constant; read the graveyard in the git log; the credits/About voice boundary.
- `.claude/CLAUDE.md` §3 — kill every headless Chrome and local server before replying; absolute paths.
- `docs/HARD-WON-LESSONS.md` — read at session start; re-read a lesson at its trigger. §3 is "a gate
  scanning the wrong tree is not silent, it is reassuring," which is why `npm test` being green today
  says nothing about `4/`.
- `.planning/PROJECT.md` → Constraints — bots and humans have identical rules and affordances. This is
  why RULE-01 pays the bot paths and is not an open question.

### Copy and narration
- `docs/DRIVING-THE-GAME.md` — before any browser pass. §5d covers windows too narrow to hand-drive.
  **Its import paths are root-relative and will inject state into the wrong tree** until DOC-06.
- `4/src/ui/util.js:335-360` — the seaLine contract: both persons read out verbatim, nothing
  conjugated, no agreement derived. D-06 is built to honour this.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`emojify()` + `COIN_IMG` at `panel()`'s chokepoint (D-50)** — the coin in `(+1🌕)` goes through
  the same path as every other `🌕` in the game. Do not hand-roll markup.
- **`<span class="nobrk">`** — `4/src/ui/flow.js:2231` (G27/P7) is the precedent for keeping an amount
  attached to what it belongs to.
- **`typeof`-guarded `window.addEventListener`** — `4/src/main.js:157` already has the pattern
  TEST-01 needs.
- **`4/scripts/lib/`** — byte-identical to `scripts/lib/`, so the harness is reusable as-is.

### Established Patterns
- **`Game.ev()` records, it does not reduce** (`4/src/engine/index.js:320`). State changes happen at
  the call site. This shapes RULE-01 entirely.
- **`planTurn(p)` is the ONE brain entry point** (`4/src/engine/index.js:2196`) — both `Game.takeTurn`
  (headless) and `botTurn` (animated) route through it, so a brain change drives both by
  construction. That invariant is what makes D-05 safe.
- **The bot fallback is deliberately duplicated** across engine and flow (`4/src/ui/flow.js:2130-2137`
  states why). Any turn-level rule must land in both.
- **`try/catch`-swallow around every `localStorage` access**, with no logging — the convention is
  documented at `4/src/ui/util.js:1893-1898` and `4/src/ui/audio.js:182`. FIX-01's new code follows it.
- **The engine is determinism-clean and DOM-free** — zero `Math.random`/`Date.now`/`performance.now`
  under `4/src/engine/`. RULE-01's coin must not introduce any.

### Integration Points
- `4/src/ui/stage.js:1478` — the force-write. `:909` — the menu toggle. `4/src/orchestrator.js:184`,
  `:1570`, `:1575-1576` — the sheet toggle, the read, and the read that pushes to the room.
- `4/src/ui/util.js:502-509` — the `pass:` narration renderer, where D-06's tag is appended.
- `4/src/shared/index.js:226` — the 50 `{y,t}` entries. **Untouched by D-06.**
- Three `{t:"pass"}` emission sites: `4/src/ui/flow.js:1861`, `4/src/ui/flow.js:2140`,
  `4/src/engine/index.js:2993`.

</code_context>

<specifics>
## Specific Ideas

- **"Recipe idea! (+1🌕)"** — Wyatt's chosen wording, picked over "That's goin' in the recipe" and
  "Into the recipe book it goes." The idea he named: *"you're getting recipe inspo from the sea
  creatures."* The constraint he named: *"must be short and easy to read."* He rejected his own first
  draft ("and ye scribble a new recipe") on length after seeing it rendered.
- **The rendering samples are what settled it.** Wyatt reversed a selection after seeing 10 real lines
  on screen and reversed again after seeing three candidates side by side. **Show rendered copy, don't
  describe it.**
- **On the shot clock and dropped players:** *"multiplayer is played between friends, who can
  communicate through the chat."* The clock is not a disconnection-recovery mechanism in this game.
- **On the old bot brain:** *"this follows one of my design principles -- elegance."*

</specifics>

<deferred>
## Deferred Ideas

### To Phase 2 — Multiplayer Revival
- **Guest reconnect is not gated by any criterion.** Wyatt asked whether a guest can close a tab and
  rejoin without retyping the room code. **On paper, yes:** `pp4_sess` is read synchronously at
  `4/src/orchestrator.js:1730` before a pixel is drawn, and the async room read only confirms the room
  still exists. **But that path has never executed in `4/`** — it is a code read, not a measurement —
  and Phase 2's criterion 4 names only the *host* reloading. Add a guest-reconnect criterion.
- **Multiplayer chat has nowhere to appear in the new game.** Wyatt, 2026-08-18: *"the chatbox
  currently writes chats above the ships, but the new narration takes that space. we'll need to design
  a new place for chats to appear over the game in multiplayer."* Confirmed and sharper than that:
  `4/index.html:1503` is `body.pp4Stage #chatBubbles { display:none; }` — the new stage layout switches
  the on-board speech bubbles **off entirely**. `#chatPanel`/`#chatLog` still exist in the classic grid
  (`:59`, `:122`) but the stage layout overrides it. **This is a design job, not a one-liner.**

### To Phase 9 — The Written Record
- `docs/BOT-V3-RACE-PLANNER.md` (`:9`, `:179`) and `docs/FABLE-BOT-BRIEF.md` cite `planTurnClassic` as
  the control arm. After D-05 those numbers are unreproducible. Add a note saying so rather than
  deleting them — they are the record of why the v3 brain was chosen.

### Reviewed Todos (not folded)
All 38 matches were reviewed and none folded — every one is v1-era and none addresses a Phase 1
requirement. Three are adjacent enough to name:
- **"Audit bot/human parity across all three turn implementations"** — RULE-01 is a live instance of
  exactly this (bots pass, so bots are paid, at all three sites). Phase 1 serves one case of it; the
  broader audit is not in scope. `STATE.md` lists this among the 7 still-actionable todos.
- **"The timer toggle feels unresponsive, and its helper text contradicts the button"** — v1's timer
  toggle. `4/` rebuilt this surface; re-point or close after the cutover.
- **"Solo play should show a disabled turn-clock button for consistency"** — v1 UI; `/4` has a working
  toggle in the menu. Re-point or close after the cutover.

</deferred>

---

*Phase: 1-Before the Engine Freezes*
*Context gathered: 2026-08-18*
