# Phase 2: Multiplayer Revival - Context

**Gathered:** 2026-08-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Turn the Firebase tags back on in `4/`, restore the two welcome cards that were removed, close the
four latent faults sitting on net code that **has never executed once**, and then play a real
host-and-guest voyage — the point of which is to **produce a written finding**, not just a feature.
Phases 4 and 5 are scoped from that finding.

Requirements: **MP-01, MP-02, MP-03, MP-10, MP-11, MP-12, FIX-03.**

**This is a revival, not a rebuild.** `4/src/net/{readers,registry,watchers,writers}.js` are
byte-identical to the live net layer; `index.js` differs by 5 lines. All ~45 networking functions
survive in `4/src/orchestrator.js` and several were *upgraded* while the tags were off. What was
removed is two `<script>` tags and two welcome cards; the wiring is guarded, not deleted
(`4/src/ui/flow.js:2391-2393`).

**Not in this phase:**
- **The networked bake-off** — Phase 4. Phase 2 builds *nothing* toward it. The test voyage uses the
  existing `?bakeoff=0` switch (ROADMAP criterion 2 already specifies this).
- **Any gate, corpus or test-harness work** — Phase 3.
- **The cheat flags `?ovens=1` / `?windhud=1`** — Phase 6, unchanged. Wyatt was offered the chance to
  pull them forward and declined; `/4` is `noindex, nofollow` + `Disallow: /4/` and he is the only
  player, so the exploit surface is nil.
- **Trade pacing and the counter-offer slider** — Phase 5.
- **Anything that changes what `4/src/engine/index.js` emits.** Phase 3's corpus is not captured yet,
  so this phase is not *blocked* by it — but every fix here should still prefer the UI/orchestration
  tier, because Phase 3 captures immediately after.

</domain>

<decisions>
## Implementation Decisions

### How multiplayer reaches Wyatt

- **D-01: The Host/Join cards ship straight to `/4`. No flag, no separate preview deployment, no gating machinery.**
  Wyatt, 2026-08-19, verbatim: *"you're making this more complicated than it
  needs to be — no one in the entire world is playing /4 except me. just push it to /4 so i can
  test, and stop overcomplicating it."*

  **This supersedes two earlier positions taken within the same discussion** and both are recorded
  here so no downstream agent revives them: (a) forcing the bake-off off room-wide for every
  networked game, and (b) keeping the cards off the live `/4` build until Phase 4. Both were
  answers to "what if a stranger plays a half-finished crew game" — and there are no strangers.
  `4/index.html:10` is `noindex, nofollow` and `robots.txt:8` is `Disallow: /4/`.

- **D-02: No new bake-off gating code is written in this phase.** The test voyage runs with the
  existing `?bakeoff=0` switch, whose own comment calls it *"A ROLLBACK SWITCH, NOT A TUNING KNOB"*
  (`4/src/shared/index.js:378-391`). Bake-off over the wire is Phase 4's work in full.

  **Known and accepted:** with the bake-off ON, a networked game that reaches the ovens today would
  run the guest's bake on the **host's** screen — `4/src/ui/flow.js:584-588` states this outright and
  calls it *"a path no test can reach and no player can trigger, whose only behaviour is to hand
  somebody's bake to the bot without saying so."* Wyatt is the only player and knows this. Do not
  build a workaround for it.

- **D-03: No copy anywhere explaining that a crew game ends differently.** Wyatt, 2026-08-19,
  chose "say nothing" over a lobby line. Nobody playing online has seen the bake-off ending, so
  there is nothing to explain.

### The ⏩ skip button (MP-11)

- **D-04: There is no ⏩ in a networked game. This is NOT a new ruling — it is Wyatt's existing ruling reaching its third mode.**
  Wyatt, 2026-08-19: *"there is no skip in a multiplayer game --
  this was decided earlier. skip is only for solo games."*

  The ruling is already written in the code at `4/src/ui/stage.js:425`:
  > `// no ⏩ at a Pass & Play table (Wyatt's ruling, 2026-08-13): the skip is solo-only`

  And the reason is in the commit that built it — `348ccf4` *"the black market and **fast-forward
  through bot turns**"*. **The ⏩ exists to skip bots.** In a crew game the turns being waited on are
  people, so there is nothing it is allowed to skip.

  **The work is one term, not a new behaviour.** The visibility condition at `4/src/ui/stage.js:426`
  reads `!appState.passAndPlay && act !== mySeat && …`. It never gained a networked case because
  there was no networked mode when it was written. Add the networked term **beside** the existing
  pass-and-play term, in the same condition — do not invent a parallel mechanism.

  **Additional fact the planner must not miss:** `appState.ff` also shortens `sleep()` in
  `4/src/orchestrator.js:131` and `4/src/ui/flow.js:79`. On the **host** those `sleep()` calls pace
  the whole `runLiveNet` loop, so a host skip would drag every guest's pacing, not just the host's.
  Hiding the chip is necessary but is not by itself proof the flag can never be set — verify the flag
  cannot be armed in a networked game, not merely that the button is invisible.

### The tab-hide gate (MP-10)

- **D-05: Verify, do not change.** `4/src/main.js:157-163` writes the *shared* `paused` node and is
  safe today only because it sits behind `ui.soloBotGame()` (`4/src/ui/util.js:1740`). Loosening that
  gate is how one player backgrounding a phone pauses the whole table. This requirement is satisfied
  by proving the gate holds once multiplayer is live, not by editing it.

### Chat's new home

- **D-06: Chat gets a button in the top ribbon beside ☰, opening a slide-up sheet with the log and the text box, with a dot when there is something unread.**
  Wyatt, 2026-08-19. The ship speech bubbles stay off.

  **Why this is in Phase 2 at all:** Wyatt's Phase-1 ruling that there is no shot clock rests on
  *"multiplayer is played between friends, who can communicate through the chat"* (D-03 of
  `01-CONTEXT.md`). With no chat surface, that reasoning has nothing under it.

  **What exists and what is missing.** The sending and receiving code is completely intact —
  `sendChat` (`4/src/orchestrator.js:311`), `watchChat` (`:321`), the form wiring (`:1681`), and the
  bubble machinery in `4/src/ui/board.js:1343-1368`. Only the *place* is gone: the new stage layout
  switches the bubbles off in one line (`4/index.html:1503`,
  `body.pp4Stage #chatBubbles { display:none; }`) because narration now owns that space, and
  `#chatPanel` (`4/index.html:2145`, "Scuttlebutt", with `#chatLog`, `#chatForm`, `#chatInput`)
  belongs to the classic grid the stage replaces.

- **D-07: An incoming message flashes briefly under the ribbon and fades**, so it is seen without
  opening the sheet. Wyatt, 2026-08-19, over a quieter dot-only option — a friend asking "wanna
  trade?" must not sit unread.

  **Consistency requirement, per CLAUDE.md §2:** it is a floating box, so it **must obey
  hold-the-sea** like every other floating box (prompts of all styles, narration bubbles, the
  stay-put confirm). Sweep those surfaces and state in the reply which were checked.

  **Placement constraint:** under the ribbon at the top — deliberately *not* down at the ships, which
  is the space the narration bubbles took and the reason the chat bubbles were switched off.

### The welcome screen

- **D-08: Four cards in the live game's order — Play Solo, Pass & Play, Host a Crew, Join a Crew.**
  Wyatt, 2026-08-19. Measured, not assumed: `.choiceRow` is `flex-wrap: wrap` with
  `.choiceCard { flex: 1 1 120px; min-width: 118px }` and a 10px gap (`4/index.html:1310-1312`), so
  four cards wrap to a **2×2 grid on a phone** rather than a squeezed row of four. Solo stays first —
  it is the mode that always works and the first thing a stranger sees.

  The card CSS **already survives in `4/`** — `.choiceCard.host` and `.choiceCard.join` at
  `4/index.html:1316-1317`. The click wiring survives guarded at `4/src/ui/flow.js:2391-2393`. The
  markup template is `index.html:1061-1067` (root), using `assets/icons/map.png` and
  `assets/icons/key.png` — **note `4/` prefixes asset paths with `../`**.

### How the phase is proved

- **D-09: Claude shakes it out headless first; Wyatt then plays a real voyage on his phone, and that is the pass.**
  Wyatt, 2026-08-19. Four faults sit on code that has never run, so the first join
  will very likely crash — he should not be the crash detector. But nothing in this phase closes on
  headless evidence alone.

- **D-10: Guest reconnect is a pass/fail criterion in this phase, not a note.** Wyatt, 2026-08-19.
  This closes the open item Phase 1 deferred here. ROADMAP criterion 4 names only the **host**
  reloading. **On paper guest reconnect already works** — `pp4_sess` is read synchronously at
  `4/src/orchestrator.js:1730` before a pixel is drawn, and the async room read only confirms the room
  still exists — **but that path has never executed in `4/`.** It is a code read, not a measurement.
  A guest dropping and rejoining is the single most likely real-world event in a phone game with
  friends.

  **Add as criterion 5:** a guest who closes their tab mid-voyage and reopens the page rejoins the
  same game, in their seat, without retyping the room code.

### Claude's Discretion

- **Restore `#fbnote` and `#busynote` with the cards.** Both `<div>`s were deleted from `4/`'s
  welcome screen but the code that shows them survived, guarded: `4/src/orchestrator.js:1785`
  (`const note=$("fbnote");if(note)…`) and `:745` (`const note=$("busynote");if(note)…`). **Nothing
  crashes** — but a player whose network blocks Firebase would get two greyed-out cards and **no
  explanation at all**. The `.fbnote` CSS is intact at `4/index.html:1352-1354`, and `#syncnote` /
  `#recoverynote` already use it (`:2069`, `:2072`). Copy from root `index.html:1070-1071`.
- **The four latent net faults (FIX-03 and neighbours)** — mechanism is Claude's. Sites below in
  Integration Points. Note the line numbers in the intake report have drifted; locate by shape.
- **Where the finding document lives and what shape it takes.** ROADMAP: *"This phase produces a
  finding, not just a feature."* Suggest `.planning/phases/02-multiplayer-revival/02-FINDINGS.md`.
- **Whether the `v2.1 + bake-off — test ruleset` byline** (`4/index.html:1844`) changes when the row
  becomes four cards. Root has an About link in that position instead; `about.html` 404s at `/4`
  until Phase 6, so do **not** restore the About link here.

### Folded Todos

- **`2026-08-01-guest-battle-sound-fires-on-arrival-not-render.md`** (severity: major, area:
  multiplayer). Wyatt, 2026-08-01: *"battle start sound not played at correct time for guests. This is
  a drift issue that needs an architectural fix, not a patch."* The guest triggers on the **data
  callback** (`watchBattle`) while the host triggers on a **code seam**; every other sound in the game
  binds to the **render** of its event (`playForEvent`), which is the correct pattern the todo names.
  **The todo cites v1 `src/` paths — re-verify against `4/src/orchestrator.js` before acting; it may
  already be fixed or differently shaped.**

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### The reconstruction of the period this phase revives — read first
- `.planning/research/v2.0-intake/MULTIPLAYER-GAP.md` — the only synthesis of `4/`'s net layer.
  Part 1b (how a turn is handed off), Part 2 (what is actually disabled), Part 3 (the per-mechanic
  hazard table), Part 5 W1/W2/W6 (this phase's workstreams). **Its line numbers have drifted in
  places — locate by shape, and treat a citation that does not match as drift, not as a new bug.**
- `.planning/ROADMAP.md` → "Phase 2: Multiplayer Revival" — goal, 4 success criteria (D-10 adds a
  fifth), and the evidence block naming FIX-03's three sites.
- `.planning/REQUIREMENTS.md:33-35,43-45,127` — MP-01/02/03, MP-10/11/12, FIX-03.

### Before any browser pass
- `docs/DRIVING-THE-GAME.md` — mandatory before driving the game. §5d covers windows too narrow to
  hand-drive. **⚠ Its import paths are root-relative and will inject state into the WRONG tree until
  DOC-06 (Phase 9) fixes them.** Working around this is a real cost inside this phase, not free.
- **Same-machine two-tab multiplayer shares localStorage `pp_id`** — re-set the host's own `pp_id`
  before reloading, or the two tabs collide as one player. Carried in `.planning/STATE.md`.
- `.claude/CLAUDE.md` §3 — **kill every headless Chrome and local server before replying.** This
  phase runs more browsers than any other in the milestone; two abandoned probes at 21% CPU each is
  the incident that earned the rule.

### Standing rules that constrain this work
- `.claude/CLAUDE.md` §2 — consistency (sweep every surface a behaviour touches and **say which you
  checked**); nothing is a constant; **read the graveyard in the git log**. D-04 exists because the
  ⏩ ruling was already in the log and the discussion nearly re-decided it.
- `.claude/CLAUDE.md` §6 — the deploy loop: commit → **bump `PP4_STAMP` in `4/src/ui/stage.js`** →
  prove the diff touches only `4/` → push, pull, verify zero → tell Wyatt the stamp to look for.
  **He cannot see the work otherwise; he is on a phone.**
- `docs/HARD-WON-LESSONS.md` — read at session start, and **re-read a lesson at its trigger.** §3
  ("a gate scanning the wrong tree is not silent, it is reassuring") is why nothing in this phase may
  be declared done on the strength of a green root `npm test`.
- `.planning/phases/01-before-the-engine-freezes/01-CONTEXT.md` — D-03 (the clock is OFF everywhere,
  one key, and **the shot clock is not the mechanism that handles a dropped player**) and D-04
  ("share who you are, split how you play") both bind here.

### Determinism — not captured yet, but captured immediately after
- `docs/DETERMINISM-RERECORD.md` — capture exactly once; never weaken `REQUIRED_EVENT_TYPES`.
  Phase 3 captures right after this phase. **Prefer UI/orchestration-tier fixes** so nothing here
  forces a second capture.
- `.planning/STATE.md` → Blockers/Concerns — the four latent net faults, and the open question about
  `docs/DETERMINISM-RERECORD-NEXT.md`'s three queued purity fixes (Phase 3's call, not this one).

### Subsystem docs (read before touching the subsystem)
- `docs/BOARD-RENDERING.md` — before anything drawn on the board. The chat flash (D-07) is a floating
  box over the board.
- `docs/TRADE-SYSTEM.md` — only if a trade path is touched. Trade work proper is Phase 5.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **The whole net transport, unchanged.** `4/src/net/{readers,registry,watchers,writers}.js` are
  byte-identical to live; `4/src/net/index.js` differs only by a `typeof firebase === "undefined"`
  guard at `:96-99`. 59 exports, `cfgReady()` true.
- **The guarded lobby wiring** — `4/src/ui/flow.js:2391-2393` (`const hostCard=$("choiceHost"); if(hostCard)…`).
  Restoring the two cards is all it takes; the handlers are already attached.
- **The card CSS** — `.choiceCard.host` / `.choiceCard.join` at `4/index.html:1316-1317`, never removed.
- **The `.fbnote` style** — `4/index.html:1352-1354`, already in use by `#syncnote` and `#recoverynote`.
- **The whole chat mechanism** — `sendChat` (`4/src/orchestrator.js:311`), `watchChat` (`:321`), form
  wiring (`:1681`), `#chatPanel`/`#chatLog`/`#chatForm`/`#chatInput` (`4/index.html:2145-2151`),
  bubble machinery (`4/src/ui/board.js:1343-1368`). Only the *place* is missing.
- **`draftPrompts/<seat>`** (`writers.js:118`) — the working precedent for a per-seat channel, if one
  is ever needed. Not needed in this phase.
- **The handler seam** — `4/src/main.js:71-93` still injects `onRemotePrompt`, `onLogDecision`,
  `onBroadcast`, `onBroadcastFlip`, `onBroadcastClock`. Nothing to re-wire.

### Established Patterns
- **The host runs the entire game; there is no distributed turn-taking.** `runLiveNet`
  (`4/src/orchestrator.js:974`) is one `while` loop on the host's browser. Guests rebuild from the
  `ev` feed and never simulate. **Everything about pacing, skipping and pausing follows from this.**
- **`ask()` forks exactly once** — `decisionIsLocal(seat) ? onLocalAsk(…) : onRemotePrompt(…)`. Any
  prompt that goes through `ask()` already routes remote correctly with no changes.
- **The remote prompt payload is labels and flags only** —
  `{kind:"ask", msg, labels, colors, classes, disabled, why, sub, flip, flipIdx, back, battle}`.
  This is the constraint that makes the bake-off Phase 4's problem and not this phase's.
- **One decision per prompt in the log, regardless of routing.** `4/src/ui/flow.js:1432-1436`: a log
  whose *length or order* depends on routing only replays under the same routing. Any fix here must
  preserve it — MP-12 (host reload) and D-10 (guest reconnect) both depend on it.
- **Sound binds to the RENDER of its event** (`playForEvent`, `4/src/orchestrator.js:1060`,
  `4/src/ui/panel.js:252`) — battle is the one place that departs from it. That is the folded todo.
- **`4/src/net/registry.js` is the ONLY file allowed to call `ref.on()`/`ref.off()`** (`:3-5`),
  enforced so a teardown can never be bypassed. Watchers are scoped `"room"` or `"session"`.
- **Mode-gated ribbon chips** — `4/src/ui/stage.js:422-434` is the single place a ribbon chip's
  visibility is decided per mode. The ⏩ networked term (D-04) and the new 💬 chip (D-06) both belong
  in that same tick, not in new bespoke code.

### Integration Points
- **The two Firebase `<script>` tags** — removed at `4/index.html:28-30`, which documents itself and
  says restoring them is the revival.
- **The two welcome cards** — insert into `4/index.html:1833-1841` (`.choiceRow`), template at root
  `index.html:1061-1067`; **`4/` prefixes assets with `../`**. The removal comment sits at `:1839-1840`.
- **`#fbnote` / `#busynote`** — root `index.html:1070-1071`; readers already guarded at
  `4/src/orchestrator.js:1785` and `:745`.
- **The `4/src/main.js:39-45` tripwire** — noted by the intake report as needing re-enabling.
- **FIX-03's three sites, located by shape** (intake line numbers have drifted):
  - **the sparse-draft crash** — `picks.forEach(…)` in `watchRecipes`, `4/src/orchestrator.js:1594`.
    The Firebase node is normally an **object**, not an array, and the sparse mid-draft shape is the
    *expected* one — so **every guest crashes during the recipe draft**. ROADMAP criterion 2 cannot
    pass without this.
  - **the unguarded `.val()`** — `startGame`, `4/src/orchestrator.js:1508`. The correct guard already
    exists ~20 lines above in `watchRoom` (`:1487-1488`, `if(!r0){alert(…);…return;}`).
  - **the unescaped host HTML** — `watchPrompt`'s prompt rendering, `4/src/orchestrator.js:1235-1250`.
    `esc()` already exists in `4/src/ui/util.js`.
  - **`remotePrompt` with no timeout** — `4/src/orchestrator.js:1143-1152`. **Read Phase 1's D-03
    before touching this**: the shot clock is deliberately NOT the drop handler in this game.
- **⏩ visibility** — `4/src/ui/stage.js:426`; the arm site is `:884-888`; the flag is read at
  `4/src/ui/flow.js:79`, `:1013`, `4/src/orchestrator.js:131`, `4/src/ui/util.js:1207`,
  `4/src/ui/stage.js:523`.
- **Tab-hide gate** — `4/src/main.js:157-163`, behind `ui.soloBotGame()` (`4/src/ui/util.js:1740`).
- **Chat's dead space** — `4/index.html:1503` (`body.pp4Stage #chatBubbles { display:none; }`).
- **Ribbon markup** — `4/src/ui/stage.js:873-877` builds `#pp4Round`, `#pp4Boats`, `#pp4Clock`,
  `#pp4FF`, `#pp4Menu`. The 💬 chip goes here.

</code_context>

<specifics>
## Specific Ideas

- **On over-engineering the rollout**, Wyatt 2026-08-19: *"you're making this more complicated than
  it needs to be — no one in the entire world is playing /4 except me. just push it to /4 so i can
  test, and stop overcomplicating it."* **Two separate gating schemes were proposed and both were
  wrong.** The generalisable lesson: `/4` is a private test build, and a protection whose only
  beneficiary is a hypothetical stranger is protection worth nothing.
- **On the skip button**, Wyatt 2026-08-19: *"there is no skip in a multiplayer game -- this was
  decided earlier. skip is only for solo games."* The ruling was in the code and in the git log, and
  the discussion nearly re-decided it from scratch. **Read the graveyard.**
- **On the final round**, Wyatt 2026-08-19: *"the bakeoff can be completed in as little as 1 turn if
  the player is smart."* Confirmed in the code at `4/src/orchestrator.js:877`: *"The one-lap final
  round is gone: the baking days ARE the catch-up window."* The one-lap final round survives only in
  `runLiveDayClassic` (`:826`), which the shipped ruleset does not use.
- **The chat flash, as he approved it:**
  ```
  DAY 4 · 🚢🚢🚢🚢 · 💬• · ☰
     ╭───────────────────╮
     │ Meg: wanna trade? │
     ╰───────────────────╯
           🌊 the board 🌊
  ```
- **The welcome row, as he approved it** — Solo (mint) · Pass & Play (teal) on top; Host (orange) ·
  Join (pink) beneath, wrapping 2×2 on a phone.

</specifics>

<deferred>
## Deferred Ideas

### To Phase 4 — The Networked Bake-off
- **"Is cheating a real risk among friends?"** — this question surfaced twice in one discussion and
  should be answered **once**, for both cases: (a) the bake-off's `bake.slots` privacy
  (`MULTIPLAYER-GAP.md` W3b), and (b) the pending todo `every-client-can-see-every-recipe.md`, where
  any player can read every rival's secret recipe from the browser console (found when Claude joined
  Wyatt's game, 2026-07-29). Wyatt reviewed (b) here and did not fold it.

### To Phase 6 — The Cutover
- **The cheat flags `?ovens=1` and `?windhud=1`.** Offered for early closure in this phase; Wyatt
  declined. Stays in Phase 6 as the roadmap has it.
- **The About link on the welcome screen.** Root has one where `4/` has the `v2.1 + bake-off` byline;
  `about.html` 404s at `/4` until this phase fixes it.

### To a later phase — chat's finished form
- D-06 is deliberately the **smallest honest version**. The prettier design — where chat sits at rest,
  how it reads at a glance, whether the bubbles ever come back once narration and chat can share the
  board — is not decided and is not this phase's job.

### Reviewed Todos (not folded)
38 keyword matches were returned by `todo.match-phase 2`; four are area `multiplayer` and all four
were put to Wyatt. He folded one (the guest battle sound, above). The other three:
- **`2026-07-31-final-round-narration-never-reaches-guests.md`** (major) — *"a guest plays their last
  turn without knowing it is their last."* **Not folded, and correctly so:** the one-lap final round
  does not exist in the shipped bake-off ruleset (`4/src/orchestrator.js:877`). It survives only on
  the `runLiveDayClassic` path. **Do not resurrect this as a bug unless the classic ruleset is ever
  shipped over the wire.**
- **`every-client-can-see-every-recipe.md`** (medium, design) — see Phase 4 above.
- **`pause-cannot-beat-end-of-turn-expiry.md`** (low) — largely moot: the turn clock defaults OFF in
  `4/` (Phase 1 D-03), so most crews never see a shot clock at all.

The remaining 34 matches are v1-era and score on generic tokens (`src`, `flow`, `turn`).
`.planning/STATE.md` records that all 39 pending todos predate `4/`.

</deferred>

---

*Phase: 2-Multiplayer Revival*
*Context gathered: 2026-08-19*
