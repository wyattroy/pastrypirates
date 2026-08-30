# Forks 2 (`ask()`) and 3 (`battleAsk()`) — mapped 2026-08-28

**Read-only investigation for the one-activity-engine work. Every claim carries file:line.**
**Written down because it cost a full agent pass and existed only in a session's context.**

> **HEADLINE: fork 3 collapses to near-nothing once the shot clock is gone. Fork 2 does not — its
> hard part was never the clock, it is the FLIP sub-case, which is not rendering-shared at all
> despite what `docs/DISPLAY-RULES.md` §4 claims.**

## Fork 2 — `ask()` (`src/ui/util.js:1549`)

The dispatch is at `util.js:1607-1642`: `decisionIsLocal(seat) ? onLocalAsk(...) : onRemotePrompt(...)`.
Rule B is satisfied — it forks on `decisionIsLocal` (`util.js:1892`), not `seatLocal`.

**THE DOC IS PARTIALLY WRONG.** "Rendering shared? Yes" is true for `optionButtonsHTML` + the
slider, and **false for every flip-bearing prompt**:

| | host `localAsk` | guest `watchPrompt` |
|---|---|---|
| pure flip | **no panel at all**, `flipMsg` stashed (`flow.js:199,212`) | `showNarration(p.msg)` — a bubble the host never draws (`orchestrator.js:1702`) |
| tap paints the spin | **yes** — `setFlipCoin("spin")` in the tap's own frame (`flow.js:211,226`) | **no** — the guest waits for the host's broadcast: the exact "blank coin then spins a second later" fault playtest 22 fixed |
| flip + options | flip arms the coin AND the full button row renders | **early `return`** — the other options are **never drawn on a guest** |
| `flipMsg` | set (`flow.js:199,224`) | **never set** — so the guest's ceremony title and stakes were EMPTY |

**FIXED 2026-08-28** (commit "a guest's flip ceremony had no words"): the guest now stamps `flipMsg`
and paints the spin, guarded on `!p.battle`. **The flip early-return at `orchestrator.js:1703` is
NOT fixed** — a guest still never sees the other options on a flip-bearing prompt. That is a visible
behaviour change and needs Wyatt's call.

### Landmines
1. **`stage.js:1699`'s `!fm && btl` fallback is load-bearing for BATTLES** — it writes
   "⚔️ Broadside!" when `flipMsg` is null. A converged renderer that stamps `flipMsg`
   unconditionally destroys the battle ceremony's title. `battleAsk` must keep producing `fm===null`.
2. **`panel("")` on a foreign prompt** (`orchestrator.js:1665-1667`) is guarded on `.bko` only —
   moving it kills a bake bench again, a measured regression recorded at `:1659-1664`.
3. **The parity gate anchors on the NAME** `localAsk(` (`scripts/host_guest_parity_check.js:207-209`).
   Renaming fails assertion 1 with "re-anchor this gate; do NOT delete the assertion".
4. `_shortHtml`: host tests `o.short!=null` (`flow.js:281`), guest tests truthiness
   (`orchestrator.js:1755`) — cosmetic, but a second divergence in a class the doc calls closed.

## Fork 3 — `battleAsk()` (`src/orchestrator.js:591-642`)

The doc's "one card builder" claim is **CORRECT** — `renderBattleFromSnap` (`flow.js:2737-2741`)
reaches `renderBattle` through `netHandlers().onRenderBattle` (`main.js:97`). **But it is reached
through the handler table, not by name**, so a `renderBattle(` row in `ORCHESTRATION_DECL` would
read `listeners=0` and fail as PARITY-ORCH even though the convergence is real. Declare
`applyBattleSnap(` instead — that is the true both-tiers seam, matching `applyBenchSnap(`.

**Two real differences the doc does not mention:**
- The guest reconstructs options as `{label:l}` only (`orchestrator.js:1680`) — no cls/disabled/why/short/seat.
- **`battleFooter` (`flow.js:2745-2752`) is a SECOND button-markup builder** that hand-writes
  `<button class="apBtn btlBtn">` and never goes through `optionButtonsHTML`. Battle prompts get no
  `aria-disabled`, no `data-why`, no short-label bloom. Fork 3 sits outside the 02.1-03 convergence.

### Landmines
1. **THE ECHO LOOP.** `renderBattle` publishes to Firebase from INSIDE the renderer
   (`orchestrator.js:392`); `watchBattle` bails for the host at `:561` purely to stop it reading its
   own write. Remove that guard before moving the publish out and you get an infinite render loop.
   **Move the publish out first** — the `benchPublish`/`applyBenchSnap` shape at `:435-441`/`:482`.
2. **`appState.inBattlePrompt`** (written `:1667,:1672,:1685,:1763,:1801,:1895`, read `:543`) stops
   the scoreboard stream wiping the deciding guest's buttons mid-decision. Keep the suppression.
3. **`playBattleEngage()` edge trigger** (`applyBattleSnap:541`) — bringing the host through
   `applyBattleSnap` would sound the clash sting on the host, which plays it from its own loop today.
4. **Defaults differ:** fork 3 falls back to the LAST option (`:640-641`), fork 2 to the FIRST
   (`util.js:1658`). **Keep `resolveOpt`'s `opts.length-1` fallback when `withShotClock` is ripped
   out** — it is also the null-answer fallback for a disconnected guest.

## Recommended first steps
- **Fork 2:** extract `renderAskPrompt(spec, answer)` from `flow.js:195-289`, keeping the pure-flip
  early return as a branch INSIDE it; `localAsk` passes `res`, `watchPrompt` passes `sendResponse`.
- **Fork 3:** lift `netSetBattle` out of `renderBattle` into a `battlePublish(o)` that calls
  `applyBattleSnap` locally and writes under the Rule A guard. Nothing else changes. That is what
  makes `if(appState.isHost)return;` removable later without an echo.

## On the parity gate, before you converge anything
`ORCHESTRATION_DECL` is `scripts/host_guest_parity_check.js:601-656`. `localAsk` is declared a gap at
`:616`. After convergence it becomes a `superseded:` row plus a `shared:true` row for the new
renderer — **and `superseded` asserts nothing** (`:604-613` says so). Two cautions:
- **Watch the new row go RED first.** `:628-631` and `:644-648` both record that a row added after
  the fact proves nothing.
- **Assertion 1 goes vacuously green** once markup moves into a shared renderer — both regions emit
  zero class tokens. It has hit this once already and was replaced by a COUNT (`:262-270`).
  Fork 2 needs the same: assert exactly ONE function emits `apBtns`/`apMsg`.
