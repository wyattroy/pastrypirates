---
phase: 02-multiplayer-revival
plan: 04
subsystem: multiplayer
tags: [firebase, headless-chrome, cdp, escaping, xss, watchprompt]

# Dependency graph
requires:
  - phase: 02-multiplayer-revival (plan 01)
    provides: "The two-process CDP rig (rig.mjs) and host-create/guest-join driving pattern, extended here through a started voyage (voyage-setup.mjs, from 02-02) to reach watchPrompt() on a live guest"
provides:
  - "A measured, red-proofed non-reproduction: a captain's typed name (and the option-label/sub-line values that ride the same wire payload) cannot reach a guest's #actionPanel as parsed markup — pname() (4/src/ui/util.js:247-257) already routes every typed name through escHtml before it is ever interpolated into a prompt, narration, or the seat list"
  - "A corrected record: no exported esc() exists in 4/src/ui/util.js (CONTEXT.md and RESEARCH.md both cite one). The only exported escaper in 4/ is escHtml at 4/src/ui/recipe.js:24, reached via pn() -> pname() -> escHtml"
  - "A previously-undocumented finding for 02-FINDINGS.md: rooms/<C>/seats/*/name is capped server-side to 18 chars by a Firebase security rule, well under the client-side 40-char clamp — a mismatch that silently fires createRoom()'s catch-block alert() (a blocking native dialog) on any longer name, discovered mid-probe when it froze a headless page for minutes"
  - "watchPrompt() (the guest's prompt renderer) is only wired up inside beginGame() (src/orchestrator.js:1562), gated on the room's status flipping to 'playing' — a probe that only reaches the lobby can never observe it, regardless of escaping"
affects: [02-FINDINGS.md, 02-05, 02-06, 02-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Measuring an escaping question at the real sink: call the REAL production functions (pn(), remotePrompt()) with a realistic payload shaped exactly like ask()'s onRemotePrompt branch, rather than hand-writing the rooms/<C>/prompt node or reading source alone"
    - "Red-proof before trusting a negative: feed the same real sink a deliberately unescaped payload first, and only trust an 'already safe' reading once the detector is shown able to catch the unsafe case"
    - "CDP Page.javascriptDialogOpening auto-dismiss in rig.mjs's connectCDP — an uncaught alert() blocks the renderer's JS thread entirely, hanging every subsequent Runtime.evaluate on that page with no error, which reads exactly like a stuck probe"
    - "evalJS now takes a bounded timeout (rig.mjs) and rejects with the failing expression rather than hanging the whole Node process forever"

key-files:
  created:
    - "<scratchpad>/probe-fix03-esc.mjs — this plan's automated verify: creates a room with an attribute-shaped captain name, starts the voyage, calls the real remotePrompt()/pn() directly on the host to reach watchPrompt() on the guest, and reads the guest's live #actionPanel"
  modified:
    - "<scratchpad>/rig.mjs (from 02-01, extended here) — connectCDP's evalJS now takes a bounded timeout and surfaces exceptionDetails; added Page.javascriptDialogOpening auto-dismiss so a stray alert() cannot freeze a page silently"

key-decisions:
  - "No code changed. Task 1's measurement found the reported fault does not reproduce — pname() already escapes every typed name at render time (4/src/ui/lobby.js:150-152's own comment states this explicitly: 'escaping already happens once at render time inside pname()'), and pn() (which wraps pname()) is what every prompt message, option label, and sub-line in this codebase uses to interpolate a captain name. Task 2 therefore took the no-change branch per the plan's own instruction."
  - "The captain-name payload had to be re-picked mid-plan: the client-side clamp is 40 chars, but Firebase's /seats/*/name security rule validates a hard 18-char max (.planning/codebase/INTEGRATIONS.md:140) — undocumented in this phase's own CONTEXT.md/RESEARCH.md. A first attempt at 22 chars was silently rejected server-side, firing createRoom()'s alert() and freezing the probe for minutes before this was diagnosed by inspecting the live (frozen) page rather than assumed to be a script bug."
  - "The probe starts the actual voyage (setupStartedVoyage-equivalent), not just the lobby — watchPrompt() only attaches inside beginGame(), so a lobby-only probe reads a permanently empty #actionPanel regardless of the real answer. This does not violate 02-01's standing constraint: the voyage is started but never driven to its end, and rooms/<CODE> is deleted within seconds."

patterns-established:
  - "Reach the real sink, not a hand-written stand-in: remotePrompt() and pn()/pname() were called directly from the host's own page context — real production code, real Firebase wire transport, real guest-side render — without needing to drive a full trade or battle UI."
  - "A write/read race against a live turn loop (runLiveNet, which starts the instant a voyage begins) is handled by retrying the write-then-read pair rather than trusting a single sample, since rooms/<C>/prompt is a singular, last-write-wins node the real game is also writing to."

requirements-completed: []  # FIX-03 stays Pending in REQUIREMENTS.md — see Requirements Status below (D-09, and this plan closes 0 of the 3 sites since the third was already closed).

coverage:
  - id: D1
    description: "The guest's live DOM was measured, not read from source, to settle whether a host-typed captain name (and the option-label/sub-line values riding the same wire payload) can reach another captain's #actionPanel as parsed markup"
    requirement: "FIX-03"
    verification:
      - kind: e2e
        ref: "<scratchpad>/probe-fix03-esc.mjs (headless CDP, two-process rig, red-proofed against the live production database)"
        status: pass
    human_judgment: true
    rationale: "D-09 (02-CONTEXT.md): headless evidence is real, red-proofed, and measured against the live guest DOM, but this phase's own ruling reserves the actual requirement close for Wyatt's real-voyage phone pass. This plan also finds the fault does not reproduce, so there is nothing for a phone pass to close for THIS site specifically — flagged for 02-FINDINGS.md instead."
  - id: D2
    description: "The detector itself was shown able to see parsed markup appear (red-proof) before its 'already escaped' reading on the real captain-name payload was trusted"
    verification:
      - kind: e2e
        ref: "<scratchpad>/probe-fix03-esc.mjs — RED-PROOF block: an unescaped payload fed through the same real remotePrompt()/watchPrompt() sink renders as real DOM elements (msgIsElement/labelIsElement/subIsElement all true)"
        status: pass
    human_judgment: false

duration: ~110min
completed: 2026-08-19
status: complete
---

# Phase 2 Plan 4: The third FIX-03 site does not reproduce — the escaping was already there Summary

**Measured directly against a live guest's `#actionPanel` (not read from source): a host's typed captain name, and the option-label/sub-line values that ride the same wire payload, cannot reach another captain's screen as parsed markup — `pname()` already routes every typed name through `escHtml` before `watchPrompt`/`localAsk` ever see it. No code changed; the finding and a corrected record (no exported `esc()` exists in `4/src/ui/util.js`) are handed to `02-FINDINGS.md`.**

## Performance

- **Duration:** ~110 min (including diagnosing two probe-environment gotchas — see Issues Encountered)
- **Completed:** 2026-08-19
- **Tasks:** 2 (both `type="auto"`)
- **Files modified:** 0 production files. `<scratchpad>/rig.mjs` (from 02-01) extended; `<scratchpad>/probe-fix03-esc.mjs` created — neither committed.

## Accomplishments

- **Settled FIX-03's third named site by measurement, exactly as the plan required.** A captain named `<b id=pwn>"P</b>` — attribute-shaped, structurally obvious if parsed as markup — was driven through the REAL `createRoom()`/`joinRoom()` flow, into a REAL started voyage, and the REAL `pn()`/`pname()`/`remotePrompt()` functions were called directly on the host to reach `watchPrompt()` on a genuinely separate guest browser. The guest's `#actionPanel` was read live: no `<b id=pwn>` element was ever created (`pwnElementExists: false`); the payload appeared as literal escaped TEXT (`msgTextContent: '<b id=pwn>"P</b> offers ye a test trade:'`); and `pn()`'s own legitimate `<b style=...>` wrapper still rendered as three real elements (msg, label, sub) — the game's markup is unaffected.
- **The detector was red-proofed before any of that was trusted.** The identical sink (`remotePrompt()` → `watchPrompt()`) was first fed a deliberately unescaped payload (not routed through `pn()`); it produced real DOM elements with the injected ids (`msgIsElement`/`labelIsElement`/`subIsElement` all `true`), proving the detector can in fact see parsed markup appear when it is genuinely there.
- **Confirmed the exact escaping route named in the plan's own key_links, empirically:** `pn()` → `pname()` → `escHtml` (`4/src/ui/recipe.js:24`), and confirmed `4/src/ui/lobby.js:150-152`'s own comment — *"escaping already happens once at render time inside pname()"* — describes real, currently-true behavior, not aspiration.
- **Corrected the record for future readers:** no exported `esc()` exists in `4/src/ui/util.js` (CONTEXT.md and RESEARCH.md both cite one); the only exported escaper in `4/` is `escHtml` at `4/src/ui/recipe.js:24`. `4/src/ui/util.js`'s own `esc` (~line 1639) is function-local to `voyageAground()`, a different function entirely from the two `escW`/`esc` helpers `orchestrator.js`/`flow.js` define locally for **attribute values only** (`aria-disabled` reasons) — three separate helpers, three different coverage sets, none of them the captain-name escaping route.
- **Found (mid-probe, not by design) a real, previously-undocumented server-side constraint:** `rooms/<C>/seats/*/name` is capped to **18 characters** by a Firebase security rule (`.planning/codebase/INTEGRATIONS.md:140`), well under the client-side 40-char clamp both `confirmName()` and `joinRoom()` enforce. A first attempt at a 22-character test name was silently rejected server-side, which fired `createRoom()`'s `catch`-block `alert()` — a blocking native dialog that froze the headless page's JS thread entirely for minutes, reading exactly like a hung probe rather than a caught error. Diagnosed by inspecting the live (frozen) page over a second CDP connection rather than assumed to be a bug in this session's own script.

## Task Commits

1. **Task 1: Find out whether it reproduces** — no repo commit (investigation only; `git diff --name-only` under `4/` is empty)
2. **Task 2: Close it at the source, or close the record** — no repo commit (no-change branch taken; zero production files touched)

**Plan metadata:** committed in this same pass (see final commit below).

## Files Created/Modified

- No production files modified. `git status --short` and `git diff --name-only` were both empty at the end of this plan.
- `<scratchpad>/rig.mjs` *(not committed, from 02-01, extended here)* — `evalJS` now takes a bounded timeout (was previously able to hang the whole Node process indefinitely) and surfaces `exceptionDetails` as a thrown error instead of silently returning `undefined`; `connectCDP` now auto-dismisses any `Page.javascriptDialogOpening` event, so a stray `alert()` cannot freeze a page without at least being visible in the page's `dialogs` log.
- `<scratchpad>/probe-fix03-esc.mjs` *(not committed)* — this plan's automated verify.

## Decisions Made

- **No code changed** — Task 1's measurement is a real non-reproduction, backed by a red-proofed detector, so Task 2 took the plan's explicit no-change branch: record the finding, note the source inconsistency, hand both to `02-FINDINGS.md` (plan 07). Per Wyatt's 2026-08-19 standing ruling (quoted in the plan): `/4` is `noindex, nofollow` and Wyatt is the only current player, so defence-in-depth escaping on an already-escaped path would be protection with no beneficiary — not added.
- **Captain-name payload re-picked from 22 to 16 characters** after discovering the 18-char server-side validation rule mid-probe (see Accomplishments). The final payload `<b id=pwn>"P</b>` still carries all three characters `escHtml` escapes (`<`, `>`, `"`) plus a findable `id` marker, within the real ceiling.
- **The probe starts the real voyage rather than staying in the lobby.** `watchPrompt()` is only wired up inside `beginGame()` (`src/orchestrator.js:1562`), itself gated on the room's `status` flipping to `"playing"` (`watchRoom()`'s `netWatchStatus` listener). A lobby-only probe's guest `#actionPanel` is permanently empty regardless of the real answer — measured directly (first probe attempt read `panelHTML: "<div id=\"apGrid\"><div id=\"apGridInner\"></div></div>"` forever). This does not violate 02-01's standing constraint against driving a voyage to completion: the voyage is started, exercised for seconds, and torn down — `writeGameLog()` is never reached.
- **The write/read pair against `rooms/<C>/prompt` is retried, not sampled once**, because the real turn loop (`runLiveNet`, live the instant the voyage starts) may write its own genuine prompt to the same singular node at any moment. `writeAndRead()` re-issues the write and re-reads if a sample doesn't show the probe's own marker, rather than mistaking a lost race for a finding.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Probe's `evalJS` had no timeout, so a Firebase security-rule rejection's `alert()` hung the whole Node process indefinitely**
- **Found during:** Task 1, first probe run — the process ran for over two minutes with zero output, and inspecting the live page over a second CDP connection also hung, initially reading as an environment-level failure.
- **Issue:** `rig.mjs`'s `evalJS` (inherited from 02-01) had no timeout on `Runtime.evaluate`. An open `alert()` dialog blocks a page's JS thread entirely, so every subsequent `Runtime.evaluate` against that page — from the original probe OR a fresh inspection connection — hangs forever with no error. The actual cause (a 22-char captain name exceeding the DB's 18-char `/seats/*/name` validation, firing `createRoom()`'s catch-block `alert()`) was invisible until inspected directly.
- **Fix:** Added a bounded timeout to `evalJS` (rejects with the failing expression after 15s) and a `Page.javascriptDialogOpening` auto-dismiss handler in `connectCDP`, so a stray dialog is caught, logged, and dismissed rather than silently freezing the page.
- **Files modified:** `<scratchpad>/rig.mjs` (not committed).
- **Verification:** Re-run with a 16-char payload (under the real ceiling) completed cleanly with no hang; the timeout mechanism itself was exercised (and worked) while diagnosing the original hang.

**2. [Rule 1 - Bug] First probe design read a permanently-empty guest panel because `watchPrompt()` was never attached**
- **Found during:** Task 1, second probe run (lobby-only, no voyage start) — both the red-proof and real-test readings came back with an empty `#actionPanel`, which would have been misreported as "escaped" (a false negative) had the empty-panel case not been checked against the red-proof requirement.
- **Issue:** The probe called `remotePrompt()` directly without first starting the voyage. `watchPrompt()` (the guest's listener under test) is only wired up inside `beginGame()`, itself only reachable once the room's status is `"playing"`. A lobby-only probe's writes to `rooms/<C>/prompt` are simply never observed by the guest.
- **Fix:** The probe now calls the plan's own proven `startVoyage()` helper (from `voyage-setup.mjs`, 02-02) before running either test block, then tears down within seconds — never driving the voyage to its end.
- **Files modified:** `<scratchpad>/probe-fix03-esc.mjs` (not committed).
- **Verification:** Re-run after the fix: the red-proof block correctly showed `msgIsElement/labelIsElement/subIsElement: true` for a deliberately unescaped payload, proving the sink is now genuinely reachable and the detector genuinely works.

---

**Total deviations:** 2 auto-fixed (1 blocking — probe tooling, 1 bug — probe design). Neither touched a production file; both were self-contained to this plan's own measurement apparatus.
**Impact on plan:** Necessary to get a trustworthy measurement at all. Not scope creep — no production code was affected, and the final answer (non-reproduction) is unchanged by either fix; they were required to make the measurement possible and honest rather than accidentally reporting a false negative from an unreachable sink.

## Issues Encountered

See "Deviations from Plan" above for the two probe-environment issues (both diagnosed and resolved within this plan; neither is an open blocker). No other issues.

## User Setup Required

None — no external service configuration required.

## Requirements Status

**FIX-03 stays `Pending` in `REQUIREMENTS.md`.** This plan closes 0 of the 3 sites named in `REQUIREMENTS.md`'s own FIX-03 text, because the third (this plan's site — `watchPrompt`'s prompt rendering) was already closed upstream by existing code (`pname()`'s escaping), not by any change made here. The other two sites were closed in 02-02. D-09 (`02-CONTEXT.md`) also reserves FIX-03's actual close for Wyatt's real-voyage phone pass regardless of headless evidence — unchanged by this plan.

**A genuine source inconsistency, found and left uncorrected here per the plan's own instruction (handed to `02-FINDINGS.md` instead):** `REQUIREMENTS.md`'s FIX-03 checklist item names exactly **three** sites (the sparse-draft crash, the unguarded `.val()`, and the unescaped host HTML). `02-CONTEXT.md`'s "Integration Points" section, under the heading **"FIX-03's three sites, located by shape"**, lists **four** bullets — the same three plus `remotePrompt` with no timeout (explicitly NOT this plan's or any plan's fix, per Wyatt's 2026-08-19 ruling recorded in `02-02-SUMMARY.md`: "write it down, don't fix it"). The heading's own count is wrong for its own list.

## Next Phase Readiness

- **Ready:** the third FIX-03 site has a settled, measured disposition — no reproduction, no code change needed, no risk carried forward into 02-05/02-06.
- **Raw material for `02-FINDINGS.md` (plan 07):**
  1. The non-reproduction itself, with the red-proofed evidence above (the detector was shown able to catch the fault before its "already safe" reading was trusted).
  2. The corrected record: no exported `esc()` exists in `4/src/ui/util.js` — the only exported escaper in `4/` is `escHtml` (`4/src/ui/recipe.js:24`), reached via `pn() -> pname() -> escHtml`.
  3. The three-vs-four site-count inconsistency between `REQUIREMENTS.md`'s FIX-03 text and `02-CONTEXT.md`'s "Integration Points" heading (see Requirements Status above).
  4. The undocumented 18-char server-side `/seats/*/name` validation ceiling (vs. the 40-char client-side clamp), and the failure mode it causes when exceeded (a blocking `alert()` that silently freezes the affected client with no error visible to the player beyond the dialog itself) — worth a look independent of this plan's own scope, since a real player typing a name over 18 characters would hit the identical freeze.
  5. `remotePrompt`'s no-timeout item remains open, per Wyatt's standing 2026-08-19 ruling — write it down, don't fix it (already recorded in `02-02-SUMMARY.md`; restated here as it is this plan's most closely adjacent open item).
- **Probe tooling improvements carried forward:** `rig.mjs`'s bounded `evalJS` timeout and dialog auto-dismiss are available to 02-05/02-06's probes, and are a real robustness gain (a stray `alert()` from ANY future probe's bug will now fail loudly within 15s instead of hanging the whole run silently).
- **Ports used this plan** (avoid reusing without a fresh Chrome profile/port): servers `8912`; CDP debug ports `8910`/`8911` (final successful run), `8920`/`8921` (diagnostic runs).
- **Zero headless Chrome and zero local server processes were left running** at the end of this plan, confirmed by `pgrep` before returning.

## Self-Check: PASSED

- `.planning/phases/02-multiplayer-revival/02-04-SUMMARY.md` — FOUND (this file)
- `git status --short` — clean (no production files modified)
- `git diff --name-only` under `4/` — empty

---
*Phase: 02-multiplayer-revival*
*Completed: 2026-08-19*
