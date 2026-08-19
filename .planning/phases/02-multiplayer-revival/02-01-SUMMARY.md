---
phase: 02-multiplayer-revival
plan: 01
subsystem: multiplayer
tags: [firebase, realtime-database, headless-chrome, cdp, lobby-ui]

# Dependency graph
requires: []
provides:
  - "4/index.html carries the two Firebase SDK <script> tags (12.15.0), restored byte-for-byte from root"
  - "4/index.html carries #choiceHost / #choiceJoin (D-08 order: Solo, Pass & Play, Host, Join), wired to the already-guarded flow.js:2391 handlers with zero JS changes"
  - "4/index.html carries #fbnote / #busynote, display:none at rest, feeding the already-guarded readers at orchestrator.js:745/1785"
  - "A two-process headless CDP rig (scratchpad rig.mjs) — own --user-data-dir per process, no shared pp_id — proven to drive a host and an independent guest through the full create-room/join-by-code/claim-seat handshake against the live production Firebase database"
  - "A hard finding: gamelogs/<ts> is write-once by Firebase security rule for EVERY client, including Wyatt's own browser — no probe in this phase (or any future one) may let a headless run reach the end of a voyage, because writeGameLog() cannot be undone"
affects: [02-02, 02-03, 02-04, 02-05, 02-06, 02-07, 02-FINDINGS.md]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Two independent headless Chrome processes (own --user-data-dir, own --remote-debugging-port) as the phase's shared multiplayer test rig — sidesteps shared-localStorage pp_id entirely rather than working around it"
    - "gamelogs/ prevention-not-cleanup: since a write-once security rule makes gamelogs/<ts> permanently undeletable by any client, shakeout probes in this phase must never drive a voyage to completion, rather than relying on teardown"

key-files:
  created:
    - "<scratchpad>/rig.mjs — connectCDP/launchChrome/launchPair/teardownRoom/attemptDelete/readNode/assertGamelogsWriteOnce, imported by every probe in this phase"
    - "<scratchpad>/probe-mp01-02.mjs — Task 1's automated verify (host+guest handshake)"
    - "<scratchpad>/probe-cleanup-selftest.mjs — Task 2's automated verify (teardown red/green + crash path + gamelogs write-once proof)"
    - "<scratchpad>/probe-wrap-geometry.mjs — measured the 2x2 card wrap at 360px width"
  modified:
    - "4/index.html — Firebase SDK tags, #choiceHost/#choiceJoin, #fbnote/#busynote restored"

key-decisions:
  - "gamelogs/<ts> cannot be cleaned up by any client (write-once Firebase rule, confirmed by direct testing and by .planning/codebase/INTEGRATIONS.md's own documentation). rig.mjs's teardownRoom() now only handles rooms/<CODE>; a new assertGamelogsWriteOnce() proves the guarantee instead of pretending cleanup works."
  - "No probe in this phase may drive a voyage to completion (never call writeGameLog()) — this is now a standing constraint for plans 02-02 through 02-07, not just this plan."

patterns-established:
  - "Two-process CDP rig (rig.mjs) is the one launcher every later probe in this phase imports, per the plan's own artifact list."
  - "Red-proof every cleanup claim before trusting it: the gamelogs finding was only caught because the self-test was built to demonstrate the RED state first, per docs/HARD-WON-LESSONS.md's 'verify a check can fail' rule."

requirements-completed: []  # Deliberately NOT marked complete — see "Requirements Status" below (D-09).

coverage:
  - id: D1
    description: "Host creates a room from /4 and gets a shareable code that matches the rooms/<CODE> node written to Firebase"
    requirement: "MP-01"
    verification:
      - kind: e2e
        ref: "<scratchpad>/probe-mp01-02.mjs (headless CDP, two-process rig)"
        status: pass
    human_judgment: true
    rationale: "D-09 (02-CONTEXT.md): 'Claude shakes it out headless first; Wyatt then plays a real voyage on his phone, and THAT is the pass. Nothing in this phase closes on headless evidence alone.' Headless proof is real and passing, but the phase's own ruling reserves the actual close for Wyatt's phone pass, expected around plan 02-07."
  - id: D2
    description: "A second, independent browser joins by that code, claims a seat, and appears in the seat list under a name distinct from the host's"
    requirement: "MP-02"
    verification:
      - kind: e2e
        ref: "<scratchpad>/probe-mp01-02.mjs (headless CDP, two-process rig)"
        status: pass
    human_judgment: true
    rationale: "Same D-09 rationale as D1 — headless-proven, human close deferred to the phase's real-voyage gate."
  - id: D3
    description: "A probe that creates a room deletes rooms/<CODE> (and, where possible, any gamelogs/<ts> it wrote) and a read-back confirms it"
    verification:
      - kind: e2e
        ref: "<scratchpad>/probe-cleanup-selftest.mjs — red-then-green + crash-path proof for rooms/<CODE>; write-once proof for gamelogs/"
        status: pass
    human_judgment: false

duration: ~50min
completed: 2026-08-19
status: complete
---

# Phase 2 Plan 1: The lights come back on Summary

**Restored the two Firebase `<script>` tags and the Host/Join welcome cards in `4/index.html`, proved a host-and-guest room handshake with an isolated two-process headless Chrome rig against the live database, and discovered mid-execution that `gamelogs/<ts>` is permanently undeletable by any client — reshaping this and every later plan's cleanup story.**

## Performance

- **Duration:** ~50 min
- **Completed:** 2026-08-19
- **Tasks:** 2 (Task 1: tracer; Task 2: auto)
- **Files modified:** 1 (`4/index.html`) + 4 scratchpad-only probe scripts (not committed)

## Accomplishments

- Multiplayer's front door is back: the Firebase SDK, the Host/Join cards (in D-08's order, confirmed to wrap 2×2 at 360px by measured geometry, not CSS reading), and the two explanation notes the guarded readers were already waiting on.
- Built and proved the phase's shared test rig — two genuinely isolated headless Chrome processes (own profile, own port each) — by actually creating a room, joining it from a second process with a distinct identity, and reading the result back out of Firebase, not just observing DOM text.
- Found a real, previously-undocumented-in-this-phase constraint in Wyatt's own database (`gamelogs/` is write-once) **before** it could silently pollute production during a later, larger plan — caught it here, on the smallest possible task, and corrected course before it compounded.

## Task Commits

1. **Task 1: The lights come back on — tags, four cards, and one host-and-guest handshake** — `3f69c43` (feat)
2. **Task 2: Every probe cleans up after itself — rooms and game logs both** — no repo commit (scratchpad-only; `4/src/*` and `4/index.html` untouched by this task — see Deviations)

**Plan metadata:** committed in this same pass (see final commit below).

## Files Created/Modified

- `4/index.html` — restored `firebase-app-compat.js`/`firebase-database-compat.js` tags; restored `#choiceHost`/`#choiceJoin` (D-08 order, `../assets/` prefixed icons); restored `#fbnote`/`#busynote`; rewrote both removal comments to describe the restored state.
- `<scratchpad>/rig.mjs` *(not committed — throwaway per RESEARCH.md's own convention)* — `connectCDP`, `launchChrome`, `waitForChrome`, `launchPair`, `teardownRoom`, `attemptDelete`, `readNode`, `assertGamelogsWriteOnce`. Every later plan's probes should import this rather than re-deriving the launcher.
- `<scratchpad>/probe-mp01-02.mjs` *(not committed)* — Task 1's automated verify.
- `<scratchpad>/probe-cleanup-selftest.mjs` *(not committed)* — Task 2's automated verify.
- `<scratchpad>/probe-wrap-geometry.mjs` *(not committed)* — measured the 2×2 wrap claim.

## Decisions Made

- **`4/`'s asset-path convention (`../assets/`) applied to the two new card icons and both notes**, matching every existing card in the same row — no new convention introduced.
- **Reused an already-existing throwaway `gamelogs/` node to prove the write-once guarantee, rather than writing a fresh one** — every write to that path is permanent, so proving the point without adding a fifth junk entry was the only responsible option once the constraint was understood.
- **Dropped `localStorage.clear()` calls from the probes.** Each Chrome process already boots with a fresh, empty profile (own `--user-data-dir`); clearing storage *after* `boot()` had already minted `pp_id` via `getMyId()` desynced `localStorage` from the in-memory `appState.myId` the rest of the page keeps using — a probe bug caught by asserting `rooms/<CODE>.host` against the wrong value (see Deviations, Rule 1).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Probe asserted host identity against the wrong source**
- **Found during:** Task 1's first probe run.
- **Issue:** `probe-mp01-02.mjs` cleared `localStorage` right before driving the UI, which wiped the `pp_id` `boot()` had already written moments earlier. `appState.myId` (in memory) stayed correct and the room was created fine, but reading `localStorage.getItem('pp_id')` afterward returned `null`, so the probe's own identity check failed against a value it had itself invalidated.
- **Fix:** Removed the redundant `localStorage.clear()` calls (each Chrome process already starts with an empty profile) and read identity via `appState.myId` instead.
- **Files modified:** `<scratchpad>/probe-mp01-02.mjs` (not committed).
- **Verification:** Re-run passed cleanly — host and guest seats confirmed distinct, room read back matched the DOM.

**2. [Rule 1 - Bug] Probe compared bot seats against the "distinct name" assertion**
- **Found during:** Task 1's first probe run.
- **Issue:** `rooms/<CODE>/seats` includes the 3 bot-filled slots (`id:"", name:""`) alongside the 2 human ones; the probe's distinctness check ran over all 4 entries and always failed on the empty bot names.
- **Fix:** Filter to `bot === false` seats before asserting distinct ids/names — matching what the acceptance criteria actually describes ("two entries carrying distinct id values").
- **Files modified:** `<scratchpad>/probe-mp01-02.mjs` (not committed).
- **Verification:** Re-run passed; two human seats (`Wyatt`, `Claude`) confirmed distinct.

**3. [Rule 3 - Blocking, with residual production impact — see "Known Issue" below] `gamelogs/<ts>` cannot be deleted by any client**
- **Found during:** Task 2's self-test, first run.
- **Issue:** The plan's acceptance criteria required a teardown that removes both `rooms/<CODE>` and `gamelogs/<ts>`, read back as null. Direct testing (both via the Firebase REST API with `curl` and via the live page's Firebase SDK) showed every delete/overwrite attempt against `gamelogs/*` returns `PERMISSION_DENIED`. This matches a rule already documented (but not read as part of this plan) in `.planning/codebase/INTEGRATIONS.md`: `"/feedback, /gamelogs: write-once only (!data.exists())"`. This is Wyatt's own deliberate tamper-proofing for the voyage archive — not a bug, and not something any code change in `4/src/net/` or `rig.mjs` can work around, because it is enforced server-side by Firebase's rules, identically for every client including Wyatt's own browser.
- **Fix:** Re-scoped `rig.mjs`'s `teardownRoom()` to `rooms/<CODE>` only (proven working, red-then-green, and on a forced-crash path). Added `assertGamelogsWriteOnce()`, which proves the guarantee instead of claiming cleanup that cannot exist. The real mitigation for `gamelogs/` shifts from cleanup to **prevention**: no probe in this phase may ever drive a voyage to completion (i.e., must never call `writeGameLog()`) — confirmed true of every probe built in this plan (none leave the lobby), and now a standing constraint for plans 02-02 through 02-07 too.
- **Files modified:** `<scratchpad>/rig.mjs`, `<scratchpad>/probe-cleanup-selftest.mjs` (neither committed).
- **Verification:** Re-run passed cleanly with the corrected claim — `rooms/<CODE>` teardown proven red-then-green and on the crash path; `gamelogs/` write-once confirmed (delete rejected with `PERMISSION_DENIED`, node still present) rather than falsely reported as cleaned up.

---

**Total deviations:** 3 auto-fixed (2 bug, 1 blocking-with-residual-impact).
**Impact on plan:** The first two were self-contained probe bugs with no lasting effect. The third changed what Task 2 could actually deliver and left a small, permanent, and fully accounted-for footprint in the live production database — see the Known Issue below. No scope creep; the corrected approach is narrower and more honest than the plan's original assumption, not broader.

## Known Issue — small permanent residue in production `gamelogs/`

While building Task 2's self-test (before the write-once constraint above was understood), four throwaway writes landed in the **live production `gamelogs/` node** and cannot be removed by any client tool available to this session — only Firebase console access with admin credentials can delete them, if you want them gone. All four are sub-1KB, clearly tagged as test/probe data, and carry no real player information:

| Path | Content |
|---|---|
| `gamelogs/17871453713N` | `{"probe":"debug-gamelog-delete","test":true}` |
| `gamelogs/17871454233N` | `{"probe":"debug-gamelog-delete-2","test":true}` |
| `gamelogs/1787145352658` | `{build:"v4-selftest", room:"SLFAG4SF", throwaway:true, pid:"selftest", ...}` |
| `gamelogs/1787145353126` | `{build:"v4-selftest", room:"SLFB7ILH", throwaway:true, pid:"selftest", ...}` |

No further probe in this plan (or, per the new standing constraint, any later plan in this phase) will add to this list — every probe built after this discovery reuses an *existing* throwaway node (`gamelogs/1787145352658`) to prove the write-once guarantee rather than writing a new one, and no probe drives a voyage to completion. `rooms/<CODE>` — the node every probe in this plan actually creates in the normal course of testing — is fully and repeatedly proven cleanable; only these four `gamelogs/` writes, made while diagnosing the constraint itself, are permanent.

## Issues Encountered

See "Deviations from Plan" above — all three were diagnosed and resolved within this plan. No open blockers.

## User Setup Required

None — no external service configuration required. (Firebase itself needed no setup; the SDK tags are a CDN restoration, not a new integration.)

## Requirements Status

**MP-01 and MP-02 are headlessly proven, not yet marked complete in `REQUIREMENTS.md`.** Per D-09 (`02-CONTEXT.md`): *"Claude shakes it out headless first; Wyatt then plays a real voyage on his phone, and THAT is the pass. Nothing in this phase closes on headless evidence alone."* Both requirements' rows stay `Pending` until that phone pass, expected around plan 02-07 (the one plan permitted to bump `PP4_STAMP`). This SUMMARY's `coverage:` block marks both `human_judgment: true` with that rationale rather than running `requirements mark-complete` — a deliberate deviation from this executor's default step, made to avoid a checkbox that would misstate status the project's own decision explicitly reserves for a human.

## Next Phase Readiness

- **Ready:** `4/index.html` carries a real, working lobby front door; the two-process CDP rig (`rig.mjs`) is proven and ready for every remaining plan in this phase to import.
- **Standing constraint for 02-02 through 02-07:** no headless probe may drive a voyage to completion — `writeGameLog()`'s target is permanently undeletable. Any plan whose criteria (e.g. MP-03's full-voyage sync check) seem to require reaching the end of a voyage should design around this (state injection to reach *near* the end without crossing `writeGameLog()`'s call site, or accept — and clearly flag — that a specific probe will add one more permanent `gamelogs/` entry, the same way this plan's four did).
- **Raw material for `02-FINDINGS.md` (plan 07):** the gamelogs/ write-once discovery, the probe-bug fixes above, and the confirmation that the guest tier behaved exactly as `02-RESEARCH.md` predicted (no selector/import-path surprises beyond the already-known `/4` dynamic-import prefix) — see 02-RESEARCH.md's own note that this is "raw material" for that document.
- **Ports used this plan** (avoid reusing without a fresh Chrome profile/port, per Chrome's per-URL module cache — `docs/DRIVING-THE-GAME.md` §1): servers `8491`, `8492`, `8493`, `8494`; CDP debug ports `9481`, `9482`, `9483`, `9484`, `9491`, `9492`, `9495`.
- **Zero headless Chrome and zero local server processes were left running** at the end of every probe run in this plan, confirmed by `ps` before returning each time.

## Self-Check: PASSED

- `4/index.html` — FOUND
- `.planning/phases/02-multiplayer-revival/02-01-SUMMARY.md` — FOUND
- Commit `3f69c43` — FOUND in `git log --oneline --all`

---
*Phase: 02-multiplayer-revival*
*Completed: 2026-08-19*
