# Phase 10: App State & De-globalization - Context

**Gathered:** 2026-07-24
**Status:** Ready for planning
**Mode:** Autonomous (smart discuss — user delegated all design decisions for this milestone)

<domain>
## Phase Boundary

Encapsulate the 40+ implicit app-state globals behind an app-state module, while keeping every handler working through one documented mechanism (GLOBAL-01/02/03).

In scope: the app-state module, migrating the classic UI code's bare-identifier reads/writes onto it, keeping the one inline HTML handler working, and consolidating any test/debug `window` bridge to a single named surface.

Out of scope: UI rendering extraction (Phase 11), removing the `window.PP` bridge (Phase 11 — Phase 10 may *depend* on it), any engine or networking change (done in 8/9), the modular Firebase SDK (v2).

</domain>

<decisions>
## Implementation Decisions

### The two corrected counts (grep-verified 2026-07-24)

- **D-01:** ROADMAP/REQUIREMENTS said "41 inline onclick handlers". Direct grep shows this conflates two unrelated things:
  - **Exactly 1** inline HTML `onclick="…"` **attribute** in the whole file: `onclick="revealMyRecipe()"` at `index.html:1731`, generated inside a template string. This one resolves `revealMyRecipe` in **global scope** at click time — it is the *only* handler that de-globalization can actually break, and only if `revealMyRecipe` stops being globally reachable.
  - **40** JS `.onclick = () => {…}` **assignments** (e.g. `$("apStay").onclick=()=>done(null)`). These are closures that capture their lexical scope; de-globalization does not threaten them. They are not a click-through risk in the sense the roadmap implies.
  Both docs corrected. Plan to the real surface: 1 global-resolving inline attribute, not 41.

- **D-02:** The genuine GLOBAL-02 risk is therefore narrow and specific: (a) `revealMyRecipe` must remain reachable by the inline attribute; (b) any bare app-state identifier that a `.onclick=` closure *reads* (e.g. `game`, `mySeat`, `db`) must still resolve after those identifiers are de-globalized. (b) is really a GLOBAL-01 concern surfacing through the handlers.

### The real problem: mutable, reassigned state (this is the crux — resolve in research)

- **D-03:** Phase 8 de-globalized **read-only constants** with `Object.assign(globalThis, PP)` — a snapshot works because the values never change. Phase 10's globals are **mutable and reassigned**: `game = new Game(...)`, `myId = …`, `room = …`, `isHost = …`, `mySeat = …` all get written after init (confirmed at `index.html:3896`, `:3983`, `:4255`, and throughout). A snapshot bridge is fundamentally insufficient here — a bare `game` reassigned in the classic script would not propagate to any module holding a copy, and a module could not observe the write. This asymmetry is the entire difficulty of the phase and must be solved explicitly.

- **D-04:** The verified core app-state inventory (declaration sites; research must complete the full list):
  - `index.html:864` — `game, evIdx, timer, logLines`
  - `index.html:3896` — `db, myId, room, mySeat, isHost, roster`
  - `index.html:3900` — `numSeats, evPushed, promptCounter, gameStarted, appliedMeta`
  - `index.html:3903` — `passAndPlay, activeTurnSeat, recipeRevealed`
  - `index.html:2015` — `live, liveDone, liveGen`
  - `index.html:2027/2032/2037` — `shotClockSeat, shotClockDeadline, shotClockTimer, shotClockForce, shotClockPaused, shotClockPauseElapsed, shotClockFired, turnExpired, clockState`
  - `index.html:1342` — `cell, shipEls, activeRing, spinNeedle, stormText, stormDial, windLabels` (render handles — arguably UI-state, may belong with Phase 11; research to classify)
  - plus `replaying, dlog, dlogIdx, dlogN, resumeEvLen, resumeReadFailed, turnOrder, soloMeta, syncBoardRAF, curSeat, inBattlePrompt, spectatingBattle, lastChatSendAt`, and others.
  That is comfortably 40+. Research must produce the complete, de-duplicated inventory with every read and write site, because a missed write site silently desyncs state.

- **D-05 (mechanism — do NOT guess, resolve against the code):** The likely shape is a single app-state module exporting one mutable state object (e.g. `state.game`, `state.room`), with the classic code migrated from bare `game`/`room`/… to `state.`-qualified access. Reads and writes both go through the object, so reassignment is observable and shared. Alternatives research must weigh: getter/setter accessors on the bridge; keeping declarations classic but funnelling through documented accessors. Whatever is chosen must (a) survive being read by the 40 closures and the 1 inline attribute, (b) not reorder or defer anything the deterministic replay depends on, and (c) leave a Phase-11-greppable seam for the eventual bridge removal.

### Determinism, replay, and net state

- **D-06:** `replaying`, `dlog`, `dlogIdx`, `dlogN`, `evIdx` are **replay-load-bearing**. The replay fast-forward reads and mutates these in a precise order. De-globalizing them must not change read/write ordering or timing — the same class of risk as Phase 8's iteration-order constants, but for control flow. Verify with the corpus AND a host-refresh replay behavioural check.
- **D-07:** `db`, `myId`, `room`, `mySeat`, `isHost` are consumed pervasively by the `src/net/` module's call sites (the classic code passes them into `netX(db, room, …)`). De-globalizing them must keep those call sites resolving the *current* values, not stale snapshots — directly relevant to D-03's mutability problem.
- **D-08:** The Phase 7 corpus stays frozen. **Never `--capture`.** `git log --oneline -- 'scripts/fixtures/determinism/*.jsonl' | wc -l` must stay `1`. As with Phase 9, `--verify` green is necessary but not sufficient — the corpus does not exercise the multiplayer/app-state control flow.

### The debug bridge (GLOBAL-03)

- **D-09:** Phase 9 already introduced `window.__pp_net_debug` (exposing `size/list/detachRoom/detachAll`) as a *named, intentional* debug hook. GLOBAL-03 asks for "a single documented mechanism for test/debug state access". Consolidate: `window.__pp_net_debug` plus `window.__pp_module_ok`/`window.__pp_boot_count` from Phases 7–8 are the existing named hooks. Phase 10 should land the app-state debug accessor under the same documented umbrella (a single `window.__pp_debug` namespace, or an explicitly-listed set), and document it in `docs/MODULES.md`. Do not scatter new ad-hoc `window.*` debug globals.

### Verification

- **D-10:** GLOBAL-02's "click-through of every handler" reduces, correctly, to: the 1 inline attribute fires, and a representative click-through of the closure-driven controls works with no new `ReferenceError`/`no-undef`. A full solo game and a two-tab multiplayer game (criterion 4) both remain playable — reuse the Phase 9 two-tab harness and the render-only-guest methodology note (guests' local `game` is intentionally stale; read the rendered panel).
- **D-11:** A standing contract check (mirroring `engine_contract_check.js` / `net_contract_check.js`) should assert no *new* bare mutable global was reintroduced outside the app-state module — so Phase 11 inherits enforcement. Beware the `://`-substring false-negative caveat noted in Phase 9; do not inherit comment-stripping if the checked files contain URL literals.
- **D-12:** Safari is not required at this boundary (roadmap schedules it at Phase 11 and 12). Chrome is sufficient here.

### Claude's Discretion

- The app-state module's exact name/path (`src/state/`?), and whether it's one object or a few grouped ones.
- Whether render handles (`cell`, `shipEls`, `stormDial`, …) are app-state or deferred to Phase 11's UI extraction — classify by whether non-UI code reads them.
- The debug-hook consolidation shape, within D-09's "single documented mechanism" rule.
- Commit granularity, subject to D-08 (never `--capture`) and verify-after-every-commit.

</decisions>

<canonical_refs>
## Canonical References

- `.planning/ROADMAP.md` §Phase 10 — 4 success criteria (onclick count corrected 2026-07-24)
- `.planning/REQUIREMENTS.md` — GLOBAL-01/02/03, Out of Scope
- `.planning/STATE.md` §Blockers/Concerns — explicitly flags Phase 10 as able to "silently break the 41 inline onclick handlers", needing an upfront handler audit + click-through checklist (that audit is D-01/D-02 above)
- `.planning/phases/09-networking-layer-watcher-cleanup/09-VERIFICATION.md` — the render-only-guest methodology note and `window.__pp_net_debug` shape
- `docs/MODULES.md` — bridge, startup order, `PP-BRIDGE` conventions, the existing named debug hooks
- `scripts/engine_contract_check.js`, `scripts/net_contract_check.js` — the standing-gate pattern (and the `://` false-negative caveat)
- `src/main.js` — where the bridge is populated and `boot()` invoked; the reassignment-vs-snapshot problem lives at this seam

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- The `window.PP` / `globalThis` bridge from Phase 8 (128 keys) + the 55 net fns from Phase 9 — the existing mechanism classic code uses to reach modules.
- `window.__pp_net_debug`, `window.__pp_module_ok`, `window.__pp_boot_count` — the named debug hooks to consolidate under GLOBAL-03.
- The Phase 9 two-tab harness (distinct `pp_id`, sequential load) for criterion 4.

### Established Patterns
- Host authority: only the host mutates game state; guests render-only (their local `game` is intentionally stale — read the rendered panel).
- `replaying` guard gates render/broadcast during fast-forward.
- Deterministic RNG + replay depend on exact control-flow ordering.

### Integration Points
- `game`/`db`/`room`/`myId`/`mySeat`/`isHost` are read by `src/net/` call sites AND the 40 closures AND the 1 inline attribute — every consumer must see live values after de-globalization (D-03).
- `src/main.js` populates the bridge and calls `boot()`; mutable state reassigned in the classic script must reach modules that read it.

</code_context>

<specifics>
## Specific Ideas

- This is the third milestone doc miscount found by fresh grep (Phase 9: 18 vs 14 watchers; here: 1 vs 41 inline handlers). The pattern holds — verify every load-bearing count against the code, never quote the roadmap figure.
- The scary-sounding "41 handlers" criterion is largely a paper tiger; the actual hard problem is mutable-state reassignment (D-03), which the roadmap barely names. Weight the plan accordingly.
- Wyatt delegated design decisions for this milestone. Decide and record. `VERIFY-04` (Phase 12 Safari) is the one genuine human step.

</specifics>

<deferred>
## Deferred Ideas

- **Removing the `window.PP` bridge** — Phase 11 (it must survive Phase 10).
- **UI rendering extraction** — Phase 11; the render-handle globals (`cell`, `shipEls`, `stormDial`) may migrate then, not now, if they're UI-only.
- **JSDoc typedefs for app-state shape** — `DX-01` in v2; tempting while defining the state object, still out of scope.

</deferred>

---

*Phase: 10-App State & De-globalization*
*Context gathered: 2026-07-24*
