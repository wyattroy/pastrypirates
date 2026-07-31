---
phase: 14
slug: engine-adjacent-gameplay-fixes-determinism
status: verified
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: 2026-07-26
---

# Phase 14 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

**Register origin:** authored at plan time — all six PLAN.md files carried a `<threat_model>` block.
This is a *verify-mitigations* audit, not a retroactive STRIDE scan.

**Short-circuit applied:** `threats_open: 0` + `register_authored_at_plan_time: true` +
`asvs_level: 1` → the L1 grep-depth classification is sufficient and no auditor spawn was required
(secure-phase.md step 3 short-circuit rule).

**Nature of this phase:** Pastry Pirates is a client-only browser game. Phase 14 changed local
simulation logic, UI rendering cadence, narration strings, offline developer scripts, and the
committed determinism fixtures. It added **no** authentication, no session handling, no network
calls, no persisted user data, and no dependencies. The dominant risk class here is therefore not
classical attack surface — it is **integrity of the behavioural oracle**: the 31-seed determinism
corpus that keeps multiplayer lockstep honest. Most of the register reflects that.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| developer shell → `scripts/` tooling | Offline Node scripts read committed fixtures and local engine source; no network, no untrusted input | Local file contents |
| committed fixtures → the oracle | The corpus is the behavioural ground truth; silently rewriting it destroys the ability to detect regressions | Event-stream hashes |
| human decision → irreversible write | The blocking checkpoint is the only thing between a red gate and a permanent redefinition of "correct" | A one-way approval |
| engine tier → everything | `src/engine/` is the deterministic core; an unmirrored RNG-sequence change desyncs live play from host-refresh replay | RNG draw order |
| host authority → guest render | The host resolves every storm push and hail; guests render only from the broadcast event stream | Game event feed |
| remote/replay decision index → `ask()` | A Firebase-relayed or replay-sourced choice index can be missing or out of range | Integer choice index |
| engine decision → UI presentation | The bot leg presents outcomes the engine already decided; it must never decide on its own | Resolved outcomes |
| test scaffolding → shipped source | A temporary forced-storm setting lives in the deterministic engine file | Config constant |
| approved copy → shipped strings | Wyatt's wording is the deliverable; rewriting it in passing defeats the approval gate | Player-facing text |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-14-01 | Tampering | `scripts/fixtures/determinism/*` via `--capture` | medium | mitigate | 14-01 never ran `--capture`; the re-record was gated in 14-04 behind full divergence enumeration and a blocking decision checkpoint | closed |
| T-14-02 | Repudiation | re-record with no audit trail | low | mitigate | `docs/DETERMINISM-RERECORD.md` records what changed, why, and with what measured evidence | closed |
| T-14-03 | Denial of Service | `leeward()` change altering pathfinding cost | low | accept | `sailBudget` 9 → 7 downwind of home; Dijkstra already handles budget 7 elsewhere. No unbounded search | closed (accepted) |
| T-14-04 | Tampering | choice index feeding the new hail `ask()` calls | low | mitigate | Inherited: `resolveOpt()` (`src/ui/util.js:604`) clamps a missing/out-of-range index to a safe default. **Verified present** | closed |
| T-14-05 | Tampering | half-applied trade if the shot clock expires mid-hail | medium | mitigate | Two `if(appState.turnExpired)return;` guards sit after each prompt and before any `ing`/`coins` mutation (`src/ui/flow.js:703,709`). **Verified present** | closed |
| T-14-06 | Elevation of Privilege | a bot gaining an action a human would not get | medium | mitigate | `if(hailed)return;` (`src/ui/flow.js:728`) immediately precedes `chooseAction()` (`:729`). **Verified adjacent** | closed |
| T-14-07 | Information Disclosure | hail prompt naming another seat's holdings | low | accept | A hail targets only an ingredient already shown in the captains box; hidden recipes untouched | closed (accepted) |
| T-14-08 | Tampering | RNG draw sequence in `play()` | medium | mitigate | `windNow2` consumes exactly one `this.r()` at the orchestrator's own draw point. Corroborated by determinism 31/31 **and** `dlog_replay_test.js` (live-vs-replay lockstep) both green | closed |
| T-14-09 | Tampering | fixture corpus rewritten to clear a red gate | medium | mitigate | 14-03 did not run `--capture`; the single re-record happened in 14-04 behind the human gate | closed |
| T-14-10 | Denial of Service | `DIRS[this.windNow2]` when `windNow2` is null | low | accept | The second push runs only when `storm` is true, and `play()` assigns `windNow2` on exactly those rounds. `takeTurn` has one caller | closed (accepted) |
| **T-14-11** | **Tampering** | **`--capture` burying an unrelated regression as the new baseline** | **high** | **mitigate** | Full per-seed enumeration with per-key attribution and an explicit unattributed-divergence line, produced **before** the blocking checkpoint. Wyatt reviewed the attributed report and approved the re-record explicitly. **This is the phase's only high-severity threat and it is closed** | closed |
| T-14-12 | Repudiation | no record of why the oracle changed | medium | mitigate | `docs/DETERMINISM-RERECORD.md` names causes, numbers, decision, date, new `engineSourceHash`, and revert path — committed with the fixtures | closed |
| T-14-13 | Tampering | weakening `REQUIRED_EVENT_TYPES` to force a capture to pass | medium | mitigate | **Tested under real pressure.** The coverage guard fired for real — after the phase's engine changes no seed produced a `shipwrecked` event. It was honoured by *adding a 31st seed*, not by weakening the list. `requiredEventTypes` still holds all 12 entries including `shipwrecked`; `coverage.shipwrecked: 1`. **Verified in manifest.json** | closed |
| T-14-14 | Spoofing | `rebase_source_hash.js` used to fake green without a real re-record | medium | mitigate | Never invoked in Phase 14 — the script's last touch is Phase 08 (`23092a5`). **Verified via git log** | closed |
| T-14-15 | Tampering | the bot leg diverging from the engine's storm rules | medium | mitigate | `botWindLeg` delegates every square to `g.windPush(p,DIRS[dirKey],1,dodgedOnce)` rather than re-deriving the outcome ladder; `scripts/bot_storm_narration_test.js` is a standing gate. **Verified in source** | closed |
| T-14-16 | Denial of Service | narration pacing stalling a 4-player storm round | low | mitigate | Separate shorter bot hold curve with a 2600ms ceiling plus a named per-square beat. Raised to 380ms (bot) / 420ms (human) during debug and confirmed acceptable by Wyatt at UAT | closed |
| T-14-17 | Information Disclosure | new narration lines leaking hidden state | low | accept | The moored lines and per-event narration restate outcomes already in the shared event stream and already visible on the board. Hidden recipes untouched | closed (accepted) |
| T-14-18 | Tampering | forced-storm hook shipped by accident | medium | mitigate | `roundCfg` reads `storm:0.125` and `git diff src/engine/index.js` is empty. The hook was re-applied and re-reverted twice during UAT and debug; **verified clean at phase close** | closed |
| T-14-19 | Tampering | approved copy silently reworded when applied | low | mitigate | Wyatt's two rewritten lines are present verbatim in `src/ui/util.js` (`:262`, `:281`); the nine Group A lines were left untouched as instructed. The one behavioural copy change during debug reused an already-approved string rather than inventing new wording | closed |
| T-14-20 | Repudiation | manual observations recorded as inferred rather than seen | low | mitigate | `14-VALIDATION.md` records the **first playtest failing**, the debug cycle, and the re-verified pass — not a clean sweep. The honest record is itself the mitigation | closed |
| T-14-SC | Tampering | npm/pip/cargo installs (supply chain) | low | accept | No package-manager installs in this phase. `package.json` has **zero** dependencies and zero devDependencies; the three new gates wire existing local scripts into `npm test`. **Verified** | closed (accepted) |

*Status: open · closed · open — below high threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above `workflow.security_block_on` (high) count toward `threats_open`*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| R-14-01 | T-14-03 | Sail budget drops 9 → 7 downwind of home. Existing Dijkstra pathfinding already handles budget 7 for every other island; no unbounded search introduced | Plan-time disposition | 2026-07-26 |
| R-14-02 | T-14-07 | A hail can only name an ingredient the captains box already displays. Hidden recipes are never revealed | Plan-time disposition | 2026-07-26 |
| R-14-03 | T-14-10 | `windNow2` is assigned on exactly the rounds the second push runs; `takeTurn` has a single caller so the invariant is local and total | Plan-time disposition | 2026-07-26 |
| R-14-04 | T-14-17 | New narration restates outcomes already in the shared event stream and already visible on the board | Plan-time disposition | 2026-07-26 |
| R-14-05 | T-14-SC | Zero dependencies, zero devDependencies. Phase 14 installed nothing; the supply-chain gate does not fire | Plan-time disposition | 2026-07-26 |

*Accepted risks do not resurface in future audit runs.*

---

## Known Limitation (not a threat — recorded for traceability)

Multiplayer **guests** do not see the intermediate squares of a storm push; they see the boat arrive
at its final square. A guest renders purely from the broadcast event feed and the intermediate
squares emit no event by design — adding one would alter the event stream the determinism corpus
pins. This is an accepted product limitation (Wyatt's decision at phase close, logged as backlog
item STORM-02), **not** a security or integrity issue: the authoritative outcome and all narration
are identical for host and guest.

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-07-26 | 21 | 21 | 0 | /gsd-secure-phase (orchestrator, L1 short-circuit) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-07-26
