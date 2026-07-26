---
phase: 09-networking-layer-watcher-cleanup
plan: 04
subsystem: infra
tags: [firebase, realtime-database, watcher-registry, contract-check, module-contract, docs]

# Dependency graph
requires:
  - phase: 09-networking-layer-watcher-cleanup
    provides: "09-01/09-02/09-03's complete src/net/ transport surface (registry.js, all 18 watchers, writers.js, readers.js, index.js) — this plan's check scans that finished surface, not a partial slice"
provides:
  - "scripts/net_contract_check.js — the standing SPLIT-04/NET-01/NET-02/D-04 gate: five assertions (sole listener site, no UI dependency, no app-state dependency, directional imports, eighteen-watcher inventory completeness), zero comment stripping, wired into npm test"
  - "docs/MODULES.md — the src/net/ layout, the handler-injection seam, the two listener scopes, the corrected eighteen-watcher count, window.__pp_net_debug, the net contract check, and what deliberately did not move"
  - "REQUIREMENTS.md — SPLIT-04 and NET-02 marked Complete"
affects: ["09-05", "Phase 10", "Phase 11"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Contract-check assertions match literal substrings/word-boundaries against raw, unstripped lines rather than comment-stripped ones — the deliberate deviation from engine_contract_check.js, made necessary by src/net/index.js's Firebase databaseURL literal."
    - "Hardcoded-not-derived denylists/inventory: the UI denylist, app-state denylist, and eighteen-watcher list are all sourced from 09-01-PLAN.md's artifacts register, never from the files under test, so a silently dropped watcher or reintroduced UI dependency can't also silently drop out of what's being checked against it."

key-files:
  created:
    - scripts/net_contract_check.js
  modified:
    - package.json
    - docs/MODULES.md
    - .planning/REQUIREMENTS.md

key-decisions:
  - "Marked SPLIT-04 and NET-02 Complete in REQUIREMENTS.md — this plan's frontmatter requirements field, matching 09-03's stated intent to leave them Pending until the mechanical contract check existed. NET-01 and NET-03 remain Pending, reserved for 09-05's behavioral reconnect/leave-rejoin proof per that plan's own frontmatter."
  - "Assertion 1 (sole listener site) matches the listener-attach call paired with each of the five RTDB event names (both quote styles) rather than the bare `.on(` method name, and the detach call via the `.off(` literal — this avoids false-positiving on unrelated DOM/array method calls that happen to start with `on`/`off` while still catching every real Firebase listener form used in this codebase."
  - "Detach form matched as the literal substring `.off(` rather than paired with an event name, since `ref.off(event, callback)` and `ref.off(event)` both start with the same `.off(` prefix and this codebase's only detach call sites are inside registry.js itself — pairing would have added complexity with no additional catching power for the forms actually in use."

patterns-established:
  - "The URL-adjacency drill (criterion 9) is now the standing empirical proof, re-derivable at any time: a string literal containing `://` placed earlier on the same physical line as a real `.on(...)` call demonstrably defeats a Phase-8-style `indexOf('//')` stripper (verified inline, see Task 1 Acceptance Sweep below) but does not defeat this check."

requirements-completed: [SPLIT-04, NET-02]

coverage:
  - id: D1
    description: "scripts/net_contract_check.js — five assertions (sole listener site, no UI dependency, no app-state dependency, directional imports, eighteen-watcher inventory completeness), no comment stripping, all ten failure modes demonstrated red and restored"
    requirement: "NET-02"
    verification:
      - kind: unit
        ref: "node scripts/net_contract_check.js — exit=0, five named PASS lines"
        status: pass
      - kind: integration
        ref: "npm test — exit=0, includes net_contract_check.js alongside determinism/engine-contract/replay/registry-unit checks"
        status: pass
      - kind: other
        ref: "Ten red-proof drills (sole-listener in src/net/, sole-listener in index.html, registry exemption holds, URL-adjacency, UI denylist live + comment, app-state denylist, directional import, missing watcher, 19th-attach count mismatch) — see Task 1 Acceptance Sweep transcript below"
        status: pass
    human_judgment: false
  - id: D2
    description: "The URL-adjacency false negative is empirically confirmed against a simulated Phase-8-style stripper: the same fault line, stripped, hides the violation; unstripped (this check's approach), it is caught"
    requirement: "NET-02"
    verification:
      - kind: unit
        ref: "Inline Node simulation of stripLineComment() against the drill-4 fault line — see 'The URL-adjacency proof' below"
        status: pass
    human_judgment: false
  - id: D3
    description: "docs/MODULES.md documents the five-file src/net/ layout, the registry's exclusive listener-API ownership, the handler-injection seam and its directional import rule, the synchronous-dispatch constraint and the rejected emitter, the two listener scopes and session-survival rule, the corrected eighteen-watcher count, window.__pp_net_debug and its deliberate PP-BRIDGE exemption, the net contract check and its no-stripping rationale, and what deliberately did not move — with no placeholder language"
    requirement: "SPLIT-04"
    verification:
      - kind: unit
        ref: "grep sweep of docs/MODULES.md (registry.js/watchers.js/writers.js/readers.js/__pp_net_debug/net_contract_check/session/eighteen|18/PP-BRIDGE counts, TBD|FIXME|XXX|TODO|placeholder|coming soon absence) — see Task 2 Acceptance Sweep below"
        status: pass
    human_judgment: false

# Metrics
duration: ~35min
completed: 2026-07-24
status: complete
---

# Phase 9 Plan 4: Networking Contract Check & Module Contract Docs Summary

**A five-assertion, zero-dependency `scripts/net_contract_check.js` that mechanically enforces the registry as the sole Firebase listener attach/detach site, bars UI and app-state references from `src/net/`, bars imports into the UI or engine tiers, and pins the eighteen-watcher inventory — deliberately never comment-strips, unlike its Phase 8 precedent, because `src/net/index.js` now carries the Firebase `databaseURL` — with all ten failure modes demonstrated red and restored, wired into `npm test`, and the networking layer fully documented in `docs/MODULES.md`.**

## Performance

- **Duration:** ~35 min
- **Tasks:** 2 of 2 completed
- **Files modified:** 3 (`scripts/net_contract_check.js` created; `package.json`, `docs/MODULES.md` modified)

## Accomplishments

- Built `scripts/net_contract_check.js` mirroring `scripts/engine_contract_check.js`'s structure (shebang, header explaining what's gated and why, one PASS line per assertion, every assertion run before exit, named file/line/matched-literal failures) with the one deliberate deviation the plan required: **no comment stripping anywhere**. `src/net/index.js` carries the Firebase `databaseURL` — a `https://...` literal — which makes the Phase-8 precedent's `//`-comment stripper a live false-negative risk rather than a theoretical one, since that stripper's `indexOf("//")` would find the `//` inside the URL string and truncate the line before a real violation appearing later on it was ever seen.
- Five assertions, all scoped to `index.html` + every `.js` under `src/` (recursively), never `scripts/`:
  1. **Sole listener site** — zero `.on("value"`/`.on('value'`/... (all five RTDB event names, both quote styles) or `.off(` occurrences outside `src/net/registry.js`.
  2. **No UI dependency** — zero occurrences of any of 24 hardcoded UI names anywhere under `src/net/`.
  3. **No app-state dependency** — zero word-boundary matches of any of 11 hardcoded app-state names anywhere under `src/net/`.
  4. **Directional imports** — no `.js` under `src/net/` resolves an import into `src/ui/` or `src/engine/`.
  5. **Watcher inventory completeness** — `src/net/watchers.js` exports all 18 hardcoded watcher names and contains exactly 18 `registry.attach()` calls.
- Demonstrated all ten failure modes red and restored, including the load-bearing URL-adjacency drill: placed `"https://example.com"` earlier on the same physical line as a real `.on("value"...)` call inside `src/net/watchers.js`, confirmed the check still caught it (`exit=1`), then separately simulated `engine_contract_check.js`'s exact `stripLineComment()` function against that identical fault line in a standalone Node one-liner and confirmed it would have silently truncated the line at `https:` — hiding the violation. This is the empirical proof the deviation exists to provide.
- Wired into `package.json`'s `test` script, appended after the existing four checks; `test:determinism` unchanged; no dependency keys added.
- Rewrote `docs/MODULES.md`'s Phase-9 `src/net/` placeholder with the real five-file breakdown, and added six new sections: the handler-injection seam and its directional import rule (with the synchronous-dispatch constraint and the rejected-emitter rationale), the two listener scopes and the session-survival rule, the corrected eighteen-watcher count and its history, `window.__pp_net_debug` (a third standing tripwire, deliberately un-tagged with `PP-BRIDGE`), the net contract check (mirroring the existing engine-contract-check section, explaining the no-stripping deviation and its consequence for contributors), and what deliberately did not move into `src/net/` (the error-surfacing helper, the `db` global, room/lobby orchestration).
- Marked `SPLIT-04` and `NET-02` `Complete` in `REQUIREMENTS.md` via `requirements.mark-complete` — matching this plan's frontmatter `requirements` field and 09-03's stated intent to leave both `Pending` until the mechanical check existed. `NET-01`/`NET-03` remain `Pending`, reserved for 09-05's behavioral proof.

## Task Commits

Each task committed atomically:

1. **Task 1: Build and wire the networking contract check** — `55ee744` (feat)
2. **Task 2: Document the networking layer in the module contract** — `16501b4` (docs)

**Plan metadata:** committed alongside this summary (see final commit below).

## Task 1 Acceptance Sweep

```
$ node scripts/net_contract_check.js; echo exit=$?
PASS sole listener site (NET-02, D-04) — zero .on()/.off() calls outside src/net/registry.js
PASS no UI dependency (SPLIT-04) — zero UI names referenced anywhere under src/net/
PASS no app-state dependency — zero app-state names referenced anywhere under src/net/
PASS directional imports (SPLIT-04, D-06) — src/net/ never imports src/ui/ or src/engine/
PASS watcher inventory completeness (NET-01, D-01) — all eighteen watchers exported, exactly eighteen registry.attach() calls
exit=0
$ npm test; echo exit=$?
... (determinism 30/30, engine_contract_check 4/4, dlog_replay_test, net_registry_test 32/32, net_contract_check 5/5) — exit=0
$ grep -c 'net_contract_check' package.json
1
$ node -e "const p=require('./package.json'); if(p.dependencies||p.devDependencies) process.exit(1)"; echo exit=$?
exit=0
$ grep -ci 'strip' scripts/net_contract_check.js
7
$ grep -c 'scripts/' scripts/net_contract_check.js
5
$ node scripts/engine_contract_check.js; echo exit=$?
exit=0 (4/4 PASS)
$ git log --oneline -- 'scripts/fixtures/determinism/*.jsonl' | wc -l | tr -d ' '
1
$ git status --porcelain scripts/fixtures/determinism/
(empty)
$ git status --porcelain src/ index.html
(empty)
```

### Red-proof transcript — all ten failure modes

**Drill 1 — sole listener site, `src/net/watchers.js`:** inserted `db.ref("rooms/"+room+"/rogue").on("value", handler)` into `netWatchFlip`. `exit=1`, `SOLE-LISTENER: src/net/watchers.js:32 contains a Firebase listener attach (".on("value"") outside src/net/registry.js`. Restored via `git checkout --`; `exit=0` confirmed.

**Drill 2 — sole listener site, `index.html`:** inserted an identical raw `.on("value", ...)` call as a standalone function ahead of `boot()`. `exit=1`, named `index.html:4622`. Restored; `exit=0` confirmed.

**Drill 3 — exemption is exactly one file:** inserted the same raw attach into `src/net/registry.js` itself. `exit=0` — the exemption held and did not accidentally widen. Restored; `exit=0` confirmed again (sanity check on the restore, not a second drill).

**Drill 4 — URL adjacency (the deviation's whole reason to exist):** placed `const __drill4 = "https://example.com"; db.ref("x").on("value", handler); // DRILL-4` inside `netWatchFlip`. `exit=1`, `SOLE-LISTENER: src/net/watchers.js:33 contains a Firebase listener attach (".on("value"") outside src/net/registry.js` — the check saw past the URL literal and caught the real violation. Restored; `exit=0` confirmed.

**The URL-adjacency proof (why this matters):** ran the drill-4 fault line through a standalone reproduction of `engine_contract_check.js`'s exact `stripLineComment()`:

```
$ node -e '
const line = `  const __drill4 = "https://example.com"; db.ref("x").on("value", handler); // DRILL-4`;
function stripLineComment(line) {
  const idx = line.indexOf("//");
  return idx === -1 ? line : line.slice(0, idx);
}
console.log("Stripped (Phase-8-style):", JSON.stringify(stripLineComment(line)));
console.log("Contains real violation after strip?", stripLineComment(line).includes(".on(\"value\""));
'
Stripped (Phase-8-style): "  const __drill4 = \"https:"
Contains real violation after strip? false
```

Empirically confirmed: a Phase-8-style stripper truncates this exact line at `https:` and never sees the real `.on("value"` call — the precise false negative Pitfall 4 warned about, now demonstrated rather than merely argued. `scripts/net_contract_check.js`'s no-stripping approach catches it.

**Drill 5a — UI denylist, live reference:** inserted `function __drill5(){ return setFlipCoin(true); }` into `src/net/writers.js`. `exit=1`, `NO-UI: src/net/writers.js:43 references UI name "setFlipCoin"`. Restored; `exit=0` confirmed.

**Drill 5b — UI denylist, inside a comment (over-flagging is the intended bias):** inserted `// note: this file never calls setFlipCoin, unlike index.html` as a comment line in the same file. `exit=1`, same failure line and name. Restored; `exit=0` confirmed. Comment-only mentions of a denylisted name are caught exactly as intended.

**Drill 6 — app-state denylist:** inserted `function __drill6(){ return replaying; }` into `src/net/writers.js`. `exit=1`, `NO-APP-STATE: src/net/writers.js:43 references app-state name "replaying"`. Restored; `exit=0` confirmed.

**Drill 7 — directional import:** added `import { Game } from "../engine/index.js";` at the top of `src/net/writers.js`. `exit=1`, `DIRECTION: src/net/writers.js:1 imports "../engine/index.js", which resolves into src/engine/ — src/net/ may never import the engine`. Restored; `exit=0` confirmed.

**Drill 8 — inventory completeness, missing watcher:** removed the `export` keyword from `netWatchRecipes` in `src/net/watchers.js`. `exit=1`, `INVENTORY: "netWatchRecipes" is not exported by src/net/watchers.js`. Restored; `exit=0` confirmed.

**Drill 9 — inventory completeness, attach-count mismatch:** added a nineteenth `netWatchExtra19th` wrapper with its own `registry.attach()` call to `src/net/watchers.js`. `exit=1`, `INVENTORY: expected exactly 18 registry.attach() calls in src/net/watchers.js, found 19`. Restored; `exit=0` confirmed.

`git status --porcelain src/ index.html` returned empty after every drill — all ten deliberate faults were fully restored.

## Task 2 Acceptance Sweep

```
$ grep -c 'src/net/registry.js' docs/MODULES.md
1
$ grep -c 'src/net/watchers.js' docs/MODULES.md
3
$ grep -c 'src/net/writers.js' docs/MODULES.md
2
$ grep -c 'src/net/readers.js' docs/MODULES.md
1
$ grep -c '__pp_net_debug' docs/MODULES.md
1
$ grep -c 'net_contract_check' docs/MODULES.md
5
$ grep -c 'session' docs/MODULES.md
3
$ grep -c 'eighteen\|18' docs/MODULES.md
10
$ grep -c 'PP-BRIDGE' docs/MODULES.md
5
$ grep -ciE 'TBD|FIXME|XXX|TODO|placeholder|coming soon' docs/MODULES.md
0
$ node scripts/net_contract_check.js; echo exit=$?
exit=0 (5/5 PASS)
$ node scripts/engine_contract_check.js; echo exit=$?
exit=0 (4/4 PASS)
$ npm test; echo exit=$?
exit=0
$ git log --oneline -- 'scripts/fixtures/determinism/*.jsonl' | wc -l | tr -d ' '
1
$ git status --porcelain scripts/fixtures/determinism/
(empty)
```

## The three hardcoded lists (final contents)

**UI denylist (24 names), from `09-01-PLAN.md`'s artifacts register:**
`setFlipCoin`, `setClockUI`, `setFlipActive`, `setNeedsAction`, `showNarration`, `showChatBubble`, `appendChatLine`, `renderSeatList`, `renderBattle`, `renderBattleFromSnap`, `buildPlayerRows`, `drawBoard`, `spawnPops`, `syncLogLines`, `updateRecipeBanner`, `applyEndMeta`, `panel`, `showRoom`, `showHome`, `showGameView`, `escHtml`, `emojify`, `alert`, `netFail`.

**App-state denylist (11 names), from the same register:**
`game`, `mySeat`, `isHost`, `replaying`, `evIdx`, `evPushed`, `gameStarted`, `spectatingBattle`, `inBattlePrompt`, `clockState`, `roster`.

**Deliberately excluded from the app-state denylist, with reason (per the plan's explicit instruction that a silent omission would be indistinguishable from an oversight):**
- `dlog` and `turnOrder` — both appear inside legitimate Firebase path strings `src/net/` must construct (`"rooms/"+room+"/dlog/"+n`, `"rooms/"+room+"/turnOrder"`).
- `db`, `room`, `seat`, `myId` — parameter names of the transport functions themselves, not application state read from anywhere else.

**Watcher inventory (18 names), from `09-01-PLAN.md`'s inventory table, never derived from `src/net/watchers.js`'s own export list:**
`netWatchFlip`, `netWatchConnected`, `netWatchPresence`, `netWatchTimerOff`, `netWatchClock`, `netWatchChat`, `netWatchBattle`, `netWatchRecovery`, `netWatchDraftPrompt`, `netWatchEvents`, `netWatchPrompt`, `netWatchNarr`, `netWatchSeats`, `netWatchStatus`, `netWatchTurnOrder`, `netWatchRecipes`, `netWatchResponse`, `netWatchDraftResponse`.

## The no-stripping header text

From `scripts/net_contract_check.js`'s header (verbatim excerpt):

> engine_contract_check.js strips every line from the first `//` to end of
> line before matching, and its own header explicitly says that is safe only
> because src/engine/ and src/shared/ contain no URL literals, asking that
> the assumption be "reconfirmed if a URL-bearing string is ever added
> here." src/net/index.js now contains the Firebase `databaseURL` — a
> `https://...` string literal — which makes that exact false-negative live
> instead of theoretical: a real violation appearing after a `://`-bearing
> literal earlier on the same physical line would be silently truncated
> away by that stripper before the match pattern ever saw it.
>
> This is that reconfirmation moment, and the answer is: do not comment-strip
> at all, anywhere in this file. Match raw, unstripped lines and accept the
> occasional false positive inside a comment. That trade is deliberate and
> asymmetric: a false positive here costs a reworded comment; a false
> negative would silently reopen the exact bug class NET-01 and NET-02 exist
> to close. This script is biased toward over-flagging on purpose.

## Files Created/Modified

- `scripts/net_contract_check.js` — new. Zero-dependency Node ESM script, five named assertions, no comment stripping, scoped to `index.html` + `src/**/*.js`, never `scripts/`.
- `package.json` — modified. `test` script extended with `node scripts/net_contract_check.js` appended after the existing four checks. `test:determinism` unchanged. No dependency keys added.
- `docs/MODULES.md` — modified. `src/net/` layout filled in; six new sections added (handler-injection seam, two listener scopes, eighteen-watcher count/history, `window.__pp_net_debug`, net contract check, what deliberately did not move).
- `.planning/REQUIREMENTS.md` — modified. `SPLIT-04` and `NET-02` marked `Complete`.

## Decisions Made

See `key-decisions` in frontmatter. In short:
1. Marked `SPLIT-04`/`NET-02` `Complete` per this plan's own frontmatter requirements field; left `NET-01`/`NET-03` `Pending` for 09-05's behavioral proof, matching that plan's frontmatter.
2. Matched the sole-listener-site assertion's attach form against the event name (not the bare `.on(` method name) to avoid false-positiving on unrelated calls, and matched the detach form as the bare `.off(` literal since this codebase's only detach call sites are inside `registry.js` and pairing with an event name would have added complexity with no additional catching power.

## Deviations from Plan

None — plan executed exactly as written. The one deliberate deviation described in the plan itself (no comment stripping, unlike `engine_contract_check.js`) is the plan's own explicit instruction, not an unplanned deviation from it.

## Known Stubs

None — this plan is entirely tooling and documentation; no UI surface, no application behavior.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- SPLIT-04's directional-import guarantee and NET-02's registry-only enforcement are now mechanically standing gates in `npm test`, not one-time greps — Phase 10 and Phase 11 both touch `src/net/`-adjacent code again and inherit this protection automatically.
- The directional-import assertion (`src/net/` may never import `src/ui/`) is committed now, while `src/ui/` doesn't exist yet, so Phase 11's creation of that directory is the first moment a violation could be caught, not the first moment the check existed.
- `docs/MODULES.md` is up to date for any contributor touching `src/net/`, including the exact consequence of the no-stripping check (a comment naming a UI function or app-state global fails the build; reword it, don't weaken the check).
- 09-05 (NET-01/NET-03's behavioral reconnect/leave-rejoin proof and the two-tab multiplayer smoke test) can now run against a fully documented, fully mechanically-enforced `src/net/` surface.
- `REQUIREMENTS.md`: `SPLIT-04`/`NET-02` `Complete`; `NET-01`/`NET-03` `Pending`, reserved for 09-05.

## Self-Check: PASSED

- `scripts/net_contract_check.js` — FOUND (`git show 55ee744 --stat` includes it; `node scripts/net_contract_check.js` exit 0, 5/5 PASS)
- `package.json` — `net_contract_check` wired into `test` script, confirmed via `grep`
- `docs/MODULES.md` — all required sections present, zero placeholder language
- Commit `55ee744` — FOUND in `git log --oneline`
- Commit `16501b4` — FOUND in `git log --oneline`
- `npm test` — exit 0
- `node scripts/net_contract_check.js` — exit 0 (5/5 PASS)
- `node scripts/engine_contract_check.js` — exit 0 (4/4 PASS)
- `git log --oneline -- 'scripts/fixtures/determinism/*.jsonl' | wc -l` → 1
- `git status --porcelain scripts/fixtures/determinism/` — empty
- `git status --porcelain src/ index.html` — empty (all ten red-proof drills fully restored)

---
*Phase: 09-networking-layer-watcher-cleanup*
*Completed: 2026-07-24*
