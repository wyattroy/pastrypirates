# Phase 9: Networking Layer & Watcher Cleanup - Context

**Gathered:** 2026-07-24
**Status:** Ready for planning
**Mode:** Autonomous (smart discuss — user delegated all design decisions for this milestone)

<domain>
## Phase Boundary

Two things: move Firebase multiplayer sync into its own module (SPLIT-04), and fix the `.off()` leak class through a single watcher registry (NET-01/02/03).

In scope: the networking module, the registry, teardown for every watcher, and behavioural proof that a reconnect/rejoin cycle leaves nothing dangling.

Out of scope: de-globalizing `game`/`myId`/`room`/`db` (Phase 10), UI extraction (Phase 11), removing the `window.PP` bridge (Phase 11), migrating to the modular Firebase SDK (deferred to v2 as `NETMOD-01` — incompatible with this milestone's byte-for-byte determinism gate).

</domain>

<decisions>
## Implementation Decisions

### The corrected baseline

- **D-01:** The ROADMAP and REQUIREMENTS said "14 watchers, 1 torn down". Direct grep of `index.html` on 2026-07-24 shows **18** Firebase `.on()` watchers and **2** `.off()` calls. Both docs have been corrected. Plan to **18**, not 14 — planning to the stale number would leave four watchers leaking. Verified inventory:

  | Line | Path | Event |
  |---|---|---|
  | 2117 | `rooms/{room}/flip` | value |
  | 2204 | `rooms/{room}/timerOff` | value |
  | 2281 | `rooms/{room}/clock` | value |
  | 2549 | `rooms/{room}/chat` | child_added |
  | 3073 | `rooms/{room}/battle` | value |
  | 3947 | `.info/connected` | value |
  | 3953 | `presence` | value |
  | 4090 | `rooms/{room}/recovery` | value |
  | 4114 | `rr` (prompt response) | value — **self-tears down at :4112** |
  | 4136 | `rr` (recipe prompt response) | value — **self-tears down at :4134** |
  | 4140 | `rooms/{room}/draftPrompts/{mySeat}` | value |
  | 4162 | `rooms/{room}/ev` | child_added |
  | 4174 | `rooms/{room}/prompt` | value |
  | 4229 | `rooms/{room}/narr` | value |
  | 4403 | `rooms/{room}/seats` | value |
  | 4408 | `rooms/{room}/status` | value |
  | 4481 | `rooms/{room}/turnOrder` | value |
  | 4493 | `rooms/{room}/recipes` | value |

- **D-02:** The two existing `.off()` calls (`:4112`, `:4134`) are the *same* pattern — a one-shot response listener that cancels itself once the matching reply arrives. They are already correct. Do not "fix" them into the registry in a way that breaks their self-cancelling semantics; register them so they are *also* torn down if the room dies before a reply arrives, which is the real gap in that pattern.

### The reference-identity problem (this is the crux of NET-02)

- **D-03:** Firebase's `ref.off(event, callback)` removes a listener **only when given the same function reference** that was passed to `.on()`. Every one of the 18 current watchers passes an **inline anonymous arrow function**. That means none of them can be individually detached today even if someone tried — the only available move is `ref.off(event)`, which nukes *every* listener on that path, including ones another part of the app may still need.

  So the registry is not a bookkeeping convenience; it is the mechanism that makes per-watcher teardown *possible at all*. Every callback must be hoisted to a named/held reference the registry stores alongside its ref and event type. ROADMAP criterion 2's phrase "exact callback-reference matching" is naming precisely this.

- **D-04:** The registry is the single place watchers are attached and detached. No `.on()` call may bypass it. This must be mechanically enforced (a grep-based contract check in the spirit of `scripts/engine_contract_check.js`), not left to discipline — otherwise Phase 10 and 11 quietly reintroduce raw `.on()` calls.

### Module boundary (SPLIT-04)

- **D-05:** Networking lives under `src/net/`, continuing the `src/shared` + `src/engine` convention from Phase 8.
- **D-06 (the central design question — resolve in research):** ROADMAP criterion 1 requires the net module to **never import the UI layer**. But the watcher callbacks are full of UI calls — `setFlipCoin`, `setClockUI`, `showNarration`, `render`, and friends. A naive move would force `src/net` to import UI and violate criterion 1 immediately.

  The shape of the answer is inversion: the net module owns *transport* (attach, detach, read, write) and publishes events; the UI subscribes. Research must determine the concrete seam — a callback/handler-registration API, a small emitter, or handlers injected at construction — against the real call sites, and confirm it does not disturb host-authority or the deterministic decision-log ordering.

  Note the asymmetry: the UI may import the net module. The net module may not import the UI. Criterion 1 is directional.

### Determinism and host authority

- **D-07:** The Phase 7 corpus remains frozen. **Never run `--capture`.** `git log --oneline -- 'scripts/fixtures/determinism/*.jsonl' | wc -l` must stay `1`. This phase should not touch engine behavior at all, so `--verify` staying green is necessary but nowhere near sufficient — the corpus does not exercise networking.
- **D-08:** Host authority is preserved exactly: only the host runs the engine and writes game state; guests render. The `replaying` guard must keep suppressing broadcasts during replay, or a host refresh will double-broadcast.
- **D-09:** Decision-log (`dlog`) write ordering is load-bearing for replay correctness. Moving the writer must not reorder or batch writes.

### Verification (NET-03 is deliberately hard)

- **D-10:** ROADMAP criterion 3 demands the reconnect/rejoin check be **behavioural** — "verified by a reconnect-and-count check, not code review alone". A grep proving `.off()` calls exist is explicitly *not* sufficient. The check must observe actual listener counts across a leave-and-rejoin cycle.
- **D-11:** Criterion 4 needs a real two-tab multiplayer game (host + guest) syncing after the extraction. Per MEMORY: all tabs in one Chrome profile share `localStorage`, and `myId` comes from `localStorage['pp_id']` read once at load — so without intervention the guest rejoins **as the host**. Fix: before each tab loads, `localStorage.clear(); localStorage.setItem('pp_id','<unique>')` then reload, done **sequentially**. Live auto-play is slow and occasionally flaky with several heavy tabs on one CPU; that is an environment artifact, not necessarily a bug.
- **D-12:** A leak check needs a ground truth. Firebase compat does not expose a public listener count, so research must find a workable observation method — instrumenting the registry's own bookkeeping is acceptable and probably best, provided the registry is genuinely the only attach path (D-04), since then its count *is* the truth.

### Claude's Discretion

- File split within `src/net/`, and the registry's exact API shape.
- Whether the registry keys on `(path, event, callback)` or hands back an unsubscribe handle.
- The emitter/handler mechanism for D-06, within the directional-import constraint.
- Whether the contract check extends `scripts/engine_contract_check.js` or becomes a sibling script.

</decisions>

<canonical_refs>
## Canonical References

- `.planning/ROADMAP.md` §Phase 9 — goal and 4 success criteria (watcher count corrected 2026-07-24)
- `.planning/REQUIREMENTS.md` — SPLIT-04, NET-01…03, and the Out of Scope table (modular Firebase SDK is v2)
- `.planning/codebase/CONCERNS.md` §"Firebase Watchers Without Cleanup" — the original debt writeup
- `.planning/codebase/ARCHITECTURE.md` — the host-authority model
- `.planning/phases/08-engine-extraction-node-harness-migration/08-VERIFICATION.md` — what Phase 8 delivered and the bridge's verified 128-key surface
- `docs/MODULES.md` — the module contract, startup order, and `PP-BRIDGE` conventions this phase extends
- `scripts/engine_contract_check.js` — the enforcement pattern to copy (note its documented `://`-substring false-negative caveat)
- MEMORY `project_mp_test_harness` — two-tab setup, the shared-`localStorage` `pp_id` gotcha, and the stale-server port trap

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `netFail(label)` — established error-surfacing helper that drives the visible "sync trouble" banner. Route new failure paths through it rather than inventing a second mechanism.
- `scripts/engine_contract_check.js` — the standing-gate pattern; a watcher-registry contract check should mirror it.
- The self-cancelling one-shot pattern at `:4112`/`:4114` and `:4134`/`:4136` — already correct in spirit; the model for scoped listeners.

### Established Patterns
- Host authority: only the host writes game state.
- `replaying` guard: `if(replaying)return` suppresses render/broadcast during fast-forward.
- All Firebase writes are `.catch(netFail(label))`.

### Integration Points
- Watcher callbacks reach deep into UI (`setFlipCoin`, `setClockUI`, `showNarration`, `render`) — this is the D-06 seam.
- `boot()` and the lobby/room lifecycle decide when watchers attach; teardown must hook the corresponding leave/rejoin path.
- The `window.PP` bridge and inverted startup from Phase 8 are how classic code reaches modules; net follows the same route until Phase 11 removes it.

</code_context>

<specifics>
## Specific Ideas

- The corrected 18-vs-14 count is a reminder that this milestone's planning docs carry a few stale numbers. Prefer a fresh grep over a quoted figure whenever a count is load-bearing.
- The corpus cannot see any of this. Phase 8 already showed that a green corpus proves nothing about the live multiplayer path — that gap is wider here, since networking is the whole subject. Behavioural verification is the only real gate.
- Wyatt has delegated design decisions for this milestone and does not want to be asked. Decide and record. `VERIFY-04` in Phase 12 remains the one genuine human step.

</specifics>

<deferred>
## Deferred Ideas

- **Modular Firebase SDK migration** — `NETMOD-01`, v2. `onValue()` would give a much cleaner unsubscribe story than compat's `.off()`, and it is tempting while touching exactly this code. Explicitly out of scope: it is a full networking rewrite and incompatible with this milestone's determinism gate.
- **De-globalizing `db`/`room`/`myId`** — Phase 10.
- **Removing the bridge** — Phase 11.
- **Checkpointing game state every N events** so replay doesn't re-run from turn 1 — from CONCERNS.md, still out of scope.

</deferred>

---

*Phase: 9-Networking Layer & Watcher Cleanup*
*Context gathered: 2026-07-24*
