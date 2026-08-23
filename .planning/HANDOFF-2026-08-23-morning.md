# Handoff — the night of 2026-08-22/23

**Live build: `PP4_STAMP` `2026-08-23c`.** Everything below is pushed; `main` and `origin/main` were
zero-ahead/zero-behind at handoff.

**Wyatt's morning starts here:** `.planning/playtest-checklist.html` — 50 items, tick or flag each,
notes box on every one, autosaves, and a "Copy my notes" button that emits only what he marked.

---

## THREE PHASES SHIPPED IN ONE NIGHT

| Phase | State |
|---|---|
| **3 — The Safety Net** | 4 of 5 requirements. TEST-03 (the determinism corpus) **deliberately deferred**. |
| **4 — The Networked Bake-off** | **All five criteria.** |
| **5 — Trade Over the Wire** | 3 of 4 criteria; the parallel answering round (MP-09's harder half) not attempted. |

### Phase 3 — the number that says it best
`npm test` ran **21 gates, none of which opened `4/`**. It now runs **30, and 8 read the game we
ship.** Every one red-proofed BOTH ways: red against a fault planted in a `4/` file **while the root
aim stayed green at the same moment**, because one-sided proof says nothing about where a gate is
actually looking. Host/guest parity now **fails the build**.

**The roadmap said two dangling citations. There were ninety.** 38 satisfied by the new gates, 8 true
as written, 46 declared honest debt. **Two comments described protection that does not exist** —
one credited a root gate that has never opened the file it claims to guard, and one cited
`scripts/bakeoff_tune.js` as the measurement behind a tuned value. **That file has never existed**,
confirmed against the whole history.

### Phase 4 — the question open since 2026-08-08, answered
**A guest's bake was being played on the HOST's screen, with the host's hands, while the guest's own
screen showed nothing at all.** Not forfeited — played. Proven three ways in one room: the recipe
matched seat 1's ingredient order and no other seat's; the CAPTAINS panel showed the guest holding
exactly those crates; the guest's attempt count went 0→1 while the host's stayed 0.

Now the guest bakes in their own browser, and **every other captain watches the same face-down
bench**. At three sampled moments — including mid-reveal — the crate badges on the baker's screen
and a watcher's were **byte-identical**. The bake has no shot clock; a captain who drops forfeits in
~2.5s instead of hanging the table.

### Phase 5 — the guarded number held
**Hails per game: 2.45 before, 2.45 after**, the whole 150-voyage table byte-identical to the
pre-edit baseline. `coinStepper` is deleted; a guest drags the same slider the host does. An 8-coin
counter went from **11 prompt round trips and 61.2s** to **3 and 24.9s**, and the longest unbroken
"…is deciding…" on the asker's screen from **52.6s to 16.2s**. The decision log now records the
dragged number once, however the trade was routed: 12 entries → 4.

---

## WHAT IS OPEN, AND WHY — read this before planning anything

1. **TEST-03, the determinism corpus, is deliberately uncaptured.** It is an oracle against
   *unintended* engine drift, and Phases 4 and 5 were the two most likely to make an *intended* one.
   `docs/DETERMINISM-CAPTURE-4.md` records the decision, its alternative, and the re-record
   procedure, so spending that one-way door later is a costed act rather than a 3am crisis.
   **Phase 6 (the Cutover) is the natural moment to capture it — the engine should be still by then.**
2. **MP-09's parallel answering round was not attempted.** Holders are still asked one at a time,
   proven from the prompt-node write log. Criterion 3's stated bar is met now the stepper is gone,
   but the design defect is not fixed. **The measurement moved the premise:** the stepper was 52
   seconds of dead screen for ONE captain; each further holder costs about five. It is the smaller
   half carrying all the risk.
3. **Ten `4/scripts/` gates exist, read `4/`, and all pass — none is in `npm test`.** The cheapest
   coverage win available, deliberately not taken because none was red-proofed. **An unproven gate
   in the chain is worse than no gate.** That is plan 03-02.
4. **`ui_contract_check.js` is not ported** — 9 PASS / 4 FAIL / 68 findings, of which 54 are the
   `ye`/`yer` register rule `4/` never adopted. That is Wyatt's voice and Phase 9 work. Triaged with
   counts in `03-UI-CONTRACT-TRIAGE.md`.
5. **Four real faults in `4/`, observed but NOT measured** — controls that grey out with no reason a
   player can read. Adjacent to his item 2. Do not report them as confirmed until reproduced.
6. **A taste call waiting for him:** in pass-and-play, a second captain's trade-answer prompt appears
   with no hand-off card. Recorded as *correct* (cargo is public, answering costs no turn) but it is
   his to overrule. One line either way. Item 50 on the checklist.
7. **Two Phase 4 things unverified:** no paired screenshot of the swap animation running, and no
   driven host-reload mid-bake.

## STANDING RULINGS ADDED THIS NIGHT

- **D-55** — a guest gets the REAL coin slider. Never an open decision; rule 23 and rule 8 settled
  it, and the ROADMAP line inviting a choice was stale. **When a roadmap line offers a choice a
  standing rule has already made, the rule wins.**
- **D-56** — for an unattended run, the documents ARE his input. An instruction to READ, not
  permission to guess. The test before treating anything as open: *can I name the ruling, the doc
  section, or the commit that decides this?*

## WHERE THE MILESTONE STANDS

Phases 1, 2, 02.1, 02.15, 02.2, 3, 4, 5 are done or substantially done. **Phase 6 is the Cutover** —
11 requirements, and the first one where `playpastrypirates.com` itself changes. Phases 7, 8, 9 (the
board fits, desktop, the written record) follow it.
