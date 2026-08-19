---
phase: 2
slug: multiplayer-revival
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-19
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from `02-RESEARCH.md` § "Validation Architecture" (lines 670-715). That section is the
> source; this file is the execution-facing contract. **Point, don't restate** — where the two
> disagree, RESEARCH.md wins and this file is stale.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None formal for `4/` — ad-hoc CDP-driven Node probe scripts. Formal `npm test` coverage of `4/` is TEST-05 / Phase 3, explicitly NOT this phase. |
| **Config file** | none — no `4/package.json` exists and this phase must not create one (see Wave 0 below) |
| **Quick run command** | one probe script per criterion, e.g. `node <scratchpad>/probe-mp01.mjs` |
| **Full suite command** | the seven-criterion sequence run end-to-end once on a clean pair of Chrome profiles (MP-01 → MP-02 → MP-03 → MP-10 → MP-11 → MP-12 → criterion 5) |
| **Estimated runtime** | ~a full `?bakeoff=0` voyage, headless, two processes |

**The root `npm test` is NOT a gate for this phase.** `docs/HARD-WON-LESSONS.md` §3 — "a gate scanning
the wrong tree is not silent, it is reassuring." A green root suite says nothing about `4/`.

---

## Sampling Rate

- **After every fault fix:** run that fault's own probe immediately, before moving to the next fault.
  **Prove the probe reproduces the fault against the pre-fix code FIRST** — CLAUDE.md §4: check that a
  check can FAIL before believing it passing. All four faults sit on code that has never executed once,
  so an unfalsified probe here is worth nothing.
- **After every plan wave:** re-run every probe already written (they are cheap and the tiers interact).
- **Before handoff:** the full seven-criterion sequence, once, clean, end to end, with room cleanup in a
  `finally`.
- **Max feedback latency:** one voyage.

**The headless pass is the pre-flight, not the gate.** The gate is Wyatt playing a real voyage on his
phone (CONTEXT.md D-09). Nothing in this phase closes on headless evidence alone, however green.

---

## Per-Task Verification Map

Task IDs are assigned by the planner; this table is keyed by requirement until then. Full detail —
signal, where it is read, and the exact assertion — is in `02-RESEARCH.md` § "Phase Requirements → Test
Map".

| Requirement | Behavior | Test Type | Automated Command | Provable headlessly | Status |
|---|---|---|---|---|---|
| MP-01 | Host creates a room and gets a shareable code | smoke (CDP probe) | drive `choiceHost`; assert `rooms/<C>` exists in RTDB and the on-screen code matches | ✅ yes | ⬜ pending |
| MP-02 | Guest joins by code, claims a seat, named without collision | smoke (two-process CDP) | drive `choiceJoin` with the host's code; assert two distinct names in `rooms/<C>/seats` | ✅ yes | ⬜ pending |
| MP-03 | Guest stays in sync for a full voyage, incl. the recipe draft | integration (two-process CDP + live RTDB read) | full `?bakeoff=0` voyage both sides; assert no rejected promise in `watchRecipes`; assert sampled `events[last].state[].pos` match | ⚠️ partly — crash-free and state-match are headless; "feels in sync" is phone-only (D-09) | ⬜ pending |
| MP-10 | Hiding a tab does not pause/resume the shared clock for anyone else | integration (CDP, simulate `document.hidden`) | simulate hide on guest then host; assert `rooms/<C>/paused` never changes | ✅ yes | ⬜ pending |
| MP-11 | Fast-forward cannot skip narration others are watching | integration (source + runtime) | assert the networked term is present in the `4/src/ui/stage.js:426` condition **and** that `appState.ff` cannot be armed by any reachable path in a networked turn | ✅ yes | ⬜ pending |
| MP-12 | Host reload mid-voyage resumes from the decision log | integration (CDP `Page.reload`) | assert `replayShortfall(...).incomplete === false` (real exported fn, `4/src/ui/util.js:2029`); assert post-reload round/players match the pre-reload snapshot, not turn 1 | ✅ yes — the most machine-checkable criterion in the phase | ⬜ pending |
| Criterion 5 (D-10) | Guest closes tab mid-voyage, reopens, rejoins same seat without retyping the code | integration (CDP close + reopen same profile) | assert post-reopen `room`/`mySeat`/`isHost` match pre-close, and the join screen was never shown | ✅ yes | ⬜ pending |
| FIX-03 (three sites) | No crash on sparse recipe draft / null room / unescaped prompt HTML | source assertion + CDP probe reaching each path | drive the draft to a sparse mid-state; drive `startGame` against a concurrently-deleted room; drive a prompt whose text is `<script>`-shaped and assert it renders escaped | ✅ yes | ⬜ pending |
| MP-12 / D-10 shared invariant | One decision per prompt in the log regardless of routing | source assertion | `4/src/ui/flow.js:1432-1436` — a log whose length or order depends on routing only replays under the same routing | ✅ yes | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] **One two-process CDP launcher, written once and reused by every probe.** No fixture of this shape
      exists in the repo — `4/`'s two-browser rig is the first time it is needed. Duplicating the
      launch/connect boilerplate per probe is the anti-pattern.
- [ ] **The `4/`-correct import paths.** `docs/DRIVING-THE-GAME.md`'s dynamic `import()` calls are
      root-relative and will inject state into the WRONG tree. Research §3 has the exact corrected form.
- [ ] **Room cleanup in a `finally`.** There is no automated teardown once a voyage has started
      (`abandonRoom()` only deletes from the lobby, host-only). Every probe deletes its own room or the
      live database accumulates junk.

**Must NOT be created by this phase:** a `4/package.json`, or any test-runner wiring. That is TEST-05 /
Phase 3. Probe scripts live in the scratchpad, or — if committed for the findings document's sake — are
marked one-off and wired into nothing.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|---|---|---|---|
| The voyage *feels* in sync — narration readable, pacing right, prompts arriving when expected | MP-03 | A machine can prove the boards match; it cannot prove the game reads right to a person watching it | Wyatt hosts on his phone, plays a full `?bakeoff=0` voyage with a second player, and says whether it held together |
| **The phase gate itself** | all | CONTEXT.md D-09: four faults sit on code that has never run, so Claude shakes it out headless first — but nothing here closes on headless evidence alone | Wyatt plays one real voyage on his phone. That is the pass. |
| Chat reads right in play — the flash is noticed without being intrusive, the sheet opens where a thumb expects | D-06, D-07 | Taste and placement are Wyatt's (CLAUDE.md §1) | Play with chat open and closed; a message arriving mid-turn must be seen without hijacking the turn |

---

## Validation Sign-Off

- [ ] Every probe was proven to FAIL against the pre-fix code before being trusted as a pass
- [ ] The seven-criterion sequence ran once, clean, end to end
- [ ] Every Firebase room created by a probe was deleted
- [ ] Every headless Chrome and local server started was killed before replying (CLAUDE.md §3)
- [ ] The findings document records what actually broke, not what was predicted
- [ ] Wyatt played a real voyage on his phone and it passed
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
