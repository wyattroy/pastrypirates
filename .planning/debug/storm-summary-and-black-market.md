---
status: diagnosed
trigger: |
  DATA_START
  Two "lost behavior" reports from Wyatt's solo playtest on build 2026-08-20t.
  Item 3 — the storm summary: "before this work, the storm moved everyone simultaneously
  and reported just one narration summary at the end. How did this behavior get lost?"
  Then: "strangely, the storm narration summary did happen once, later on in the game —
  but earlier in the game, it described player actions one by one." NOT lost — CONDITIONAL.
  Find the condition.
  Item 7 — the black-market narration: "Did the on-stage narration for the black market
  appear the first time all ingredients were removed from an island? I didn't have to
  dismiss it… but it needs to be there. How did it get lost?"
  DATA_END
created: 2026-08-21T15:02:16Z
updated: 2026-08-21T15:45:00Z
---

## Current Focus

Both root causes CONFIRMED with code evidence + a git-history graveyard check + headless
engine measurements. INVESTIGATE-ONLY task — no game code touched (two other agents are
editing 4/index.html, 4/src/ui/stage.js, 4/src/ui/util.js, flow.js narration timing).
next_action: none — findings written up below and in the report; handoff to whoever takes
the fix.

## Symptoms

expected: |
  Item 3: storm should move everyone simultaneously and report ONE narration summary
  at the end (this was the original/older behavior Wyatt remembers).
  Item 7: black-market narration should appear on stage (a dismissable centre-stage
  ceremony card) the first time all ingredients are removed from an island.
actual: |
  Item 3: mostly narrates per-captain, one-by-one, EXCEPT it happened once, later in
  the game, as a single summary. So it is conditional, not lost.
  Item 7: black-market narration did not appear at all in the observed playtest.
errors: none reported (visual/narration behavior only)
reproduction: |
  Item 3: headless engine measurement (below) plus code-path tracing — see Evidence.
  Item 7: headless engine measurement (below) plus code-path tracing — see Evidence.
started: |
  Item 3: unchanged since b8e9eea (2026-08-14, "one line reads the whole storm, instead
  of four saying a quarter each") — the bug is a gap in that commit's own coverage, not a
  later regression.
  Item 7: unchanged since 348ccf4 (2026-08-12, "the black market + fast-forward through
  bot turns") — the bug is a gap in that commit's own coverage, not a later regression.

## Eliminated

- hypothesis: "(item 3a) a moored/anchored captain forces per-captain lines"
  evidence: |
    Read engine/index.js noteStormOutcome(): outcome "landHeld" (land-anchor) sets
    p.stormNote="held" and emits {t:"anchorHold"} — and util.js's anchorHold narration
    entry (line 438) carries NO `txt`, only `caps`/`pops`. An anchored captain narrates
    NOTHING inline; they are folded cleanly into the summary's "held" group. Anchoring is
    not the trigger.
  timestamp: 2026-08-21T15:20:00Z
- hypothesis: "(item 3b) host-loop vs bot-turn path — a storm during a bot's turn narrates differently than one at day start"
  evidence: |
    Both humans and bots resolve a storm through the identical runStormLive()
    (4/src/ui/flow.js) — the storm is table-wide, resolved once per round before anyone
    acts (rule 7), never per-player, never inside a turn. There is no second storm code
    path keyed on whose turn it is.
  timestamp: 2026-08-21T15:20:00Z
- hypothesis: "(item 3d) solo vs crew produces different storm narration"
  evidence: |
    runStormLive() is called from exactly two orchestrator.js sites (896, 1067), both
    reached identically regardless of solo/pass-and-play/crew. No solo-only or crew-only
    branch exists in the storm path.
  timestamp: 2026-08-21T15:25:00Z
- hypothesis: "(item 7) 02.15-02 prompt-seam convergence / item 11's pendingReveal gate / the narration hold change swallowed the black-market ceremony"
  evidence: |
    git log -S on pendingReveal/renderPickPrompt/D-30 shows these commits (5b1af61 —
    item 11's camera-settle gate; a521b86/f5bbd7b — 02.15-02's pickCell() convergence)
    touch ONLY the sail-square pick prompt (pickCell/localPickCell/renderPickPrompt) and
    the "…is deciding…" wait-line — none of them touch panel.js's narrateLastEvent(),
    util.js's narrateCurrent()/botBeat(), or dryCeremony(). The black-market ceremony
    code is untouched by any of the named recent work. Confirmed by diff, not assumption.
  timestamp: 2026-08-21T15:35:00Z

## Evidence

- timestamp: 2026-08-21T15:15:00Z
  checked: |
    4/src/engine/index.js stormSummaryEvent()/noteStormOutcome(), and the b8e9eea commit
    message/diff ("4: one line reads the whole storm, instead of four saying a quarter
    each", 2026-08-14).
  found: |
    The commit's own header comment ("WHAT IS AND IS NOT COLLAPSED") lists exactly which
    per-ship storm events lost their narration text: windmove, blownOut, anchorHold. All
    three now return {caps:[...]} with no `txt` in 4/src/ui/util.js. It does NOT mention
    the `blocked` event at all.
  implication: |
    The per-square "blocked" event (a storm push interrupted by hitting ANOTHER ship, as
    opposed to land) was never covered by the item-3 fix and was never in scope for it —
    it is the one storm outcome the commit's own audit missed.
- timestamp: 2026-08-21T15:16:00Z
  checked: 4/src/engine/index.js stormStep() (line ~425) and 4/src/ui/util.js's `blocked` narration entry (line ~631).
  found: |
    stormStep()'s ONLY call site for {t:"blocked"} is when a ship's storm push is stopped
    by ANOTHER SHIP occupying the next square (as distinct from `landHeld`, which is land
    or the world edge and IS silenced). util.js's `blocked` entry still returns a full
    `txt`: "X spots Y dead ahead, so strikes sail and holds fast." — this narration line
    is specifically storm-only (comment at line 630: "v2.1: a storm stops short of land
    or of another ship, and that is the whole of it") and was never silenced.
  implication: matches Item 3's exact symptom.
- timestamp: 2026-08-21T15:17:00Z
  checked: 4/src/ui/flow.js runStormLive(), lines 1168-1220.
  found: |
    Inside the per-square push loop: "// stormStep records its own `blocked` event when a
    ship holds the square ahead / if(g.events.length>evBefore){liveRender();await
    narrateLastEvent();}" (line 1199-1200) — this fires INLINE, per collision, DURING the
    per-ship loop, BEFORE the eventual g.stormSummaryEvent() call at line 1217. The
    b8e9eea diff shows it removed the narrateLastEvent() call that used to fire from
    noteStormOutcome() (a DIFFERENT call site, after the per-ship loop) but never touched
    this one, because they are structurally separate call sites doing different jobs.
  implication: |
    ROOT CAUSE CONFIRMED for item 3. Whenever any captain's storm push is blocked by
    ANOTHER SHIP (not land), an inline "X spots Y dead ahead…" line narrates immediately,
    interrupting the otherwise-clean one-summary experience — and if that captain never
    moved at all before being blocked (moved=false), noteStormOutcome()'s
    `if(!moved)return;` means p.stormNote is never set, so that captain is SILENTLY
    OMITTED from the eventual stormSummary line too (a secondary defect: not just an
    extra line, but a missing one).
- timestamp: 2026-08-21T15:18:00Z
  checked: |
    4/src/engine/index.js players[].pos initialisation (lines 265-289) — where captains
    start the voyage.
  found: |
    "ships start at Isle of Tortuga's four docks (N/S/E/W of the island)" — ALL captains
    begin the game one square apart, clustered at the map's centre. They only spread out
    as the voyage progresses.
  implication: |
    Explains WHY Wyatt saw this "early in the game" and not later: ship-to-ship storm
    collisions are structurally most likely when captains are still bunched near Tortuga,
    and become rarer as the fleet spreads out across the map.
- timestamp: 2026-08-21T15:22:00Z
  checked: |
    Headless engine measurement (scratchpad script, storm probability elevated to 0.35 for
    signal, 300-400 seeded games, STRATS=[pirate,trader,balanced,rusher], reading real
    `g.events` from `Game.play()`/`runStorm()` — same stormStep/noteStormOutcome/
    stormSummaryEvent the live UI path calls).
  found: |
    300 games -> 1677 storms with a summary. 244 storms (14.5%) contained >=1 ship-blocks-
    ship `blocked` event -> an inline per-captain line during that storm. 71 captains with
    a blocked event were entirely omitted from their storm's own summary (moved=false
    path). Rate-normalized by round bucket (400 games): rounds 1-3 -> 16.8% of storms hit
    a collision, 4-6 -> 13.4%, 7-10 -> 15.6%, 11-15 -> 14.6%, 16+ -> 10.2%. A real but mild
    decline, not a hard game-phase gate — the predicate is proximity/alignment along the
    storm's push direction, which correlates with (but is not identical to) "early game".
  implication: |
    Measured, not guessed: roughly 1 in 7 storms overall break the "one clean summary"
    promise, and this is somewhat MORE likely in the opening rounds (ships start adjacent
    at Tortuga) and somewhat LESS likely later (fleet spread out) — matching Wyatt's own
    account almost exactly ("mostly one-by-one early, one clean summary later, but not a
    hard rule").
- timestamp: 2026-08-21T15:26:00Z
  checked: |
    4/scripts/ directory listing for any existing storm-narration regression test.
  found: no storm narration test exists (pass_narration_test.js and prompt_field_parity_check.js are the only narration-adjacent gates; neither exercises the storm summary or the `blocked` event).
  implication: "why not caught" — no gate covers this class; it is a pure narration-text
    defect, reachable only by watching/reading a storm's on-screen text.
- timestamp: 2026-08-21T15:28:00Z
  checked: |
    4/src/ui/panel.js narrateLastEvent() (line 1161) and dryCeremony() (line 1190), and
    the 348ccf4 commit diff that introduced both (2026-08-12, "the black market +
    fast-forward through bot turns").
  found: |
    dryCeremony() is a dismissable centre-stage prompt (panel(html,true) with an "Arrgh!"
    button), gated at the END of narrateLastEvent(): "if(e.firstDry&&!appState.replaying)
    await dryCeremony();". The 348ccf4 diff adds this ONLY inside panel.js's
    narrateLastEvent() — the human-driven narration path (called from humanDock() in
    flow.js after every human dock/buy event).
  implication: matches "it needs to be there... how did it get lost" — this is where it
    lives when it fires.
- timestamp: 2026-08-21T15:30:00Z
  checked: |
    4/src/ui/flow.js botTurn()'s dock branch (line 2271) and 4/src/ui/util.js botBeat()/
    narrateCurrent() (lines 1830-1845).
  found: |
    A BOT's dock purchase runs through the ENGINE's own doDock() (not humanDock), then
    "await botBeat();return;" — NOT narrateLastEvent(). botBeat() calls
    netHandlers().onLiveRender() then narrateCurrent(), a SEPARATE, older function (first
    written 2026-08-11, commit 511c427 — a full day before the black-market ceremony
    existed) that reads appState.logLines[evIdx] and flashes only its `.txt`. It has NO
    reference to `firstDry`, `drySeen`, or dryCeremony() anywhere in its body.
  implication: |
    ROOT CAUSE CONFIRMED for item 7. Two structurally separate narration functions exist —
    narrateLastEvent() (human path) and narrateCurrent() (bot path, via botBeat()) — and
    the black-market ceremony was wired into only one of them when it was built. `drySeen`
    (engine/index.js) is a single voyage-wide flag that flips true on the FIRST-EVER shelf
    depletion regardless of who buys the crate. If any of the solo game's bot opponents
    happens to be the one who empties ANY island's shelf first — which their dock action
    routes through botBeat()/narrateCurrent() — the ceremony is silently skipped AND
    `drySeen` is now permanently true for the rest of the voyage. The human player can
    never see the ceremony again that voyage, no matter which island they later empty
    themselves.
- timestamp: 2026-08-21T15:32:00Z
  checked: |
    git log -S "narrateCurrent" / -S "dryCeremony" / -S "firstDry" across 4/src — full
    history of both functions.
  found: |
    narrateCurrent() was created at 511c427 (2026-08-11, the very first /4 commit) and its
    body has not materially changed since (the one later -S match, 01d03ef 2026-08-20, is
    a commit-MESSAGE mention describing narrateCurrent in prose while fixing an unrelated
    host/guest wait-line divergence — it does not edit narrateCurrent's code). dryCeremony/
    firstDry were both introduced together in 348ccf4 (2026-08-12), inside panel.js only.
  implication: |
    This is not a regression from any of tonight's work (02.15-02 prompt seam, the
    pendingReveal gate, the narration hold change, D-30) — those commits never touch
    either narration function. The bug has existed, unchanged, since the black-market
    ceremony's very first commit on 2026-08-12.
- timestamp: 2026-08-21T15:40:00Z
  checked: |
    Headless engine measurement (scratchpad script, 500 seeded games, STRATS=[pirate,
    trader,balanced,rusher], seat 0 used as a symmetric proxy for "the human" — the
    engine's headless play() treats every strategy identically, so this measures the pure
    turn-order race for who empties a shelf first).
  found: |
    500 games: 3 (0.6%) never had a shelf go dry at all. Of the 497 that did, seat 0
    claimed the voyage's firstDry event first in only 117 games (23.4%) — a different seat
    (proxy: "a bot") claimed it first in 380 games (76.0%), almost exactly the 75% base
    rate expected from 1-of-4 seats vs the other 3.
  implication: |
    In roughly three out of every four solo voyages, a bot opponent — not the human
    player — is structurally the one who first empties a shelf, which means the ceremony
    is silently swallowed in ~76% of solo games. This is a common, not a rare, failure —
    consistent with Wyatt reporting it as simply absent rather than "sometimes missing".

## Resolution

root_cause: |
  Item 3 (storm one-by-one narration): commit b8e9eea (2026-08-14) silenced the per-ship
  storm bubble text for windmove/blownOut/anchorHold (folding them into a single
  stormSummary line emitted once, after the whole push resolves) but never silenced the
  ship-blocks-ship `blocked` event's own narration text, and never touched the SEPARATE
  inline narrateLastEvent() call inside runStormLive()'s per-square loop (flow.js
  line ~1200) that fires it. Whenever a storm push is stopped by another ship (not land)
  — structurally most likely early in a voyage, when all captains start clustered one
  square apart at Isle of Tortuga — that captain's collision narrates inline,
  mid-storm, before the eventual one-line summary; and if that captain never moved at
  all before being blocked, they are also silently missing from the summary itself.
  Measured: ~14.5% of storms overall (mean ~16.8% in rounds 1-3, ~10.2% in rounds 16+).

  Item 7 (missing black-market ceremony): commit 348ccf4 (2026-08-12) added the
  once-per-voyage dryCeremony() prompt gated on the dock event's `firstDry` flag, but
  wired it only into panel.js's narrateLastEvent() (the human-turn narration path).
  A bot's dock purchase narrates through a structurally SEPARATE, older function —
  util.js's narrateCurrent(), called by botBeat() — which has no knowledge of `firstDry`
  or dryCeremony() at all. Since `drySeen` is a single voyage-wide flag that latches true
  on the very FIRST shelf depletion regardless of who buys the crate, any bot opponent
  who happens to empty a shelf first (measured: ~76% of solo voyages) silently consumes
  the one-time ceremony trigger and the human player never sees it, for the rest of that
  voyage, no matter which island they later empty themselves.

  Both are the same class of defect — CLAUDE.md rule 23, ONE DISPLAY PATH: two code paths
  that must agree (human narration vs. the storm's per-square loop; human narration vs.
  bot narration) were never converged, so a feature added to one silently never reached
  the other. Neither is a regression from tonight's work (02.15-02, item 11's
  pendingReveal gate, the narration hold change, D-30) — both have been present, unchanged,
  since the commit that built the feature they belong to (2026-08-14 and 2026-08-12
  respectively).
fix: |
  NOT APPLIED — this was an investigate-only task (two other agents are actively editing
  4/index.html, 4/src/ui/stage.js, 4/src/ui/util.js and flow.js narration timing).
  Proposed fix direction for whoever takes this, UI-tier only in both cases (no engine
  change needed — the engine already records the right facts; only the narration-table/
  call-site wiring needs to converge):

  Item 3: strip the `blocked` narration entry's `txt` in 4/src/ui/util.js (matching
  windmove/blownOut/anchorHold — keep `pops`/caps if wanted for the board feedback) and
  fold "held-by-a-ship" into stormSummaryEvent()'s existing groups the same way
  "held-by-land" already is, so a ship-blocked captain reads inside the one summary
  sentence instead of narrating inline and (worse) sometimes not narrating anywhere. This
  requires a small engine change to noteStormOutcome() (4/src/engine/index.js) so a
  same-storm ship-block also sets p.stormNote, since today it only does when moved=true.

  Item 7: give narrateCurrent()/botBeat() (4/src/ui/util.js) the same firstDry check
  narrateLastEvent() has — call dryCeremony() (currently panel.js-local) from both paths,
  which likely means exporting it from panel.js, or converging the two narration
  functions into one (the project's own stated preference per rule 23 — "when a SECOND
  consumer of the same thing appears, CONVERGE: make the FIRST one go through the new
  path too"). The narrower fix (add the check to narrateCurrent alone) is smaller; the
  wider fix (one narration function for both bot and human beats) is what rule 23 argues
  for and would prevent this whole class recurring for the next feature gated on a
  once-per-voyage flag.
verification: |
  NOT VERIFIED — no fix applied. Reproduction evidence for both items is the headless
  engine measurements recorded above (scratchpad scripts, run against the real
  4/src/engine/index.js — read-only, no game files modified). Both are directly reproducible in the live UI by:
  Item 3: raising cfg.storm via docs/DRIVING-THE-GAME.md §5e and playing several storms
  while ships are still near Tortuga (a collision is highly likely in the first few
  rounds; try several storms if the first one misses).
  Item 7: playing solo and watching a BOT dock at a nearly-sold-out island before the
  human player empties any shelf themselves (or, per the measurement above, simply
  playing an ordinary solo voyage — this happens in ~76% of them by default).
files_changed: []
