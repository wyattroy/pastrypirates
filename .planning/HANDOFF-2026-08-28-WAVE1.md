# HANDOFF — 2026-08-28. Wave 1: one game activity engine.

> ## READ THIS FIRST, THEN `.claude/CLAUDE.md` IN FULL, THEN THE TWO MAPS IN §6.
>
> ```bash
> printenv CLAUDE_CODE_REMOTE     # `true` = cloud container. Unset = Wyatt's laptop; some of §7 differs.
> git fetch origin && git status  # branch claude/cloud-handoff-planning-a9ay1u, clean
> git log --oneline -1            # expect 2d19a15e or later
> npm test                        # 26 gates, exit 0
> node scripts/qa/cto_supervise.mjs
> ```
>
> **If the pull moved `.claude/CLAUDE.md`, RE-READ IT FROM DISK.** Your context copy was assembled
> from the working tree before you pulled. A stale rulebook has no gaps in it — it just looks short.

---

## 1. THE JOB, IN WYATT'S WORDS

> *"fix all the described architecture so both host and guest listen to one game activity engine"*
>
> *"i'd prefer to do it even if it breaks shot clock, and to temporarily remove the shot clock from
> the game. include the bakeoff in this work too — everything should come from one game activity
> engine."*

**Three rulings.** All of it, not the event half. The shot clock comes OUT (temporarily) rather than
being engineered around. The bake-off is in scope.

**Why the second ruling matters more than it sounds.** Rule C of `docs/DISPLAY-RULES.md` —
*"`withShotClock()` needs a plain Promise, nothing else"* — is the single reason four prompt forks
have stayed open across three phases: a prompt cannot loop back like an event when something is
racing it. He removed the obstacle instead of building around it. **It goes back afterwards, against
a converged dispatch, which is a far easier problem than racing two.**

---

## 2. THE SHAPE — one consumer, three producers

- `Game.ev()` (`src/engine/index.js:316`) is where **every** event is born. The engine is PURE
  (`engine_contract_check` ENGINE-01 forbids document/window/Date.now/Math.random) — do not put UI
  dispatch in it. A callback field is fine; a DOM reference is not.
- `pushEvents()` (`src/orchestrator.js:1484`) is where the **host** drains events to Firebase.
- `watchEvents()` (`src/orchestrator.js:1573`) is the **guest's** consumer, and it already holds the
  whole drawing sequence: `animateRimSweepIfAny()` → `render()` → `spawnPops()` → `playForEvent()` →
  `applyEndMeta()` on `end`.

**Converging means the host reads its own mail through that same consumer, and solo and
pass-and-play — which have no wire at all — feed the identical consumer from the drain.**

> ### ⚠️ THE WORK IS NOT ADDING THE SHARED CONSUMER. IT IS DELETING THE HOST'S INLINE DRAWING.
> Until the host's game-loop drawing is gone it will draw twice. **That is where the regressions
> are.** Rule A ("the host's own screen never round-trips through Firebase") means the host must
> call the consumer locally, not read its own write back.

---

## 3. WHAT IS ALREADY DONE — and the one player-visible fix already shipped

`2d19a15e` converged the **guest's flip prompt**. It fixed two real bugs found by MAPPING, not by
playing:
- a guest's flip ceremony drew an **empty title over empty stakes** (`flipMsg` was stamped only on
  the host's path; `stage.js` writes `fm ? … : ""`);
- a guest's coin **did not spin when tapped** — the exact "blank coin, then a spin a second later"
  fault playtest 22 fixed for the host and never reached the guest.

Guarded on `!p.battle` so `stage.js:1699`'s `!fm && btl` "⚔️ Broadside!" title survives. **Gate 26**
(`scripts/qa/flip_ceremony_parity_check.mjs`) asserts both directions.

**NOT YET SEEN WITH EYES.** Gate-verified and reasoned from source. **A two-tab crew game showing
the ceremony on both screens is the first thing you should do.**

---

## 4. THE FOUR DANGERS — read before touching the shot clock

**From the full inventory in §6. One of these hangs the game on the first prompt.**

1. **`ask()`'s `armed` promise (`src/ui/util.js:1577-1581`, `:1658`).** It resolves ONLY when
   `appState.clockPendingArm()` is called, from exactly two places: the reveal seam at
   `src/ui/panel.js:667-685` and the belt at `util.js:1649-1653`. **Delete the seam while leaving
   `armed` and EVERY PROMPT IN THE GAME NEVER RESOLVES.** Remove `armed`, `clockPendingArm/Local/
   Text`, the belt and the seam **as ONE atomic change**, replacing `:1658` with `const idxP=base;`.
2. **Pause is a SEPARATE feature sharing the clock's state and panel — KEEP IT.** It backs the phone
   app-switch auto-pause (`main.js:175-184`) that exists because a hidden tab used to hang a turn
   forever. `#scPause` lives inside `#shotClockPanel`; you cannot delete the panel without deleting
   pause.
3. **The "Barnacle Brain / slowest to decide" award tallies shot-clock events**
   (`util.js:891`, `:926`, `:952`). Remove the events without the award and every seat scores 0 and
   it is handed out by tie-break — a visibly wrong end-of-voyage screen.
4. **`expireShotClock` is the only caller of `appState.activePickCleanup`.** Remove one, remove the
   other's registration too, or DISPLAY-RULES' sail-prompt row becomes false in the same commit.

**Two things that make this SAFER than it sounds:**
- **The shot clock is already dormant in shipped play.** `stage.js:3344` seeds `timerOff = true`,
  so `startShotClock` early-returns. Nothing live breaks.
- **The `shotclock` event does NOT touch the determinism corpus.** `grep src/engine/` finds zero
  occurrences — both events are emitted from the UI tier, and no bot replay fires one.

---

## 5. ⚠️ THE DESIGN DOC'S LINE NUMBERS ARE STALE

`docs/DISPLAY-RULES.md` is excellent prose with **rotted coordinates** — off by 100–370 lines in
three places checked. `recipeDraftNet()` is at `orchestrator.js:966`, not `:855`. `netIntroBarrier()`
is at `flow.js:2634`, not `:2265`. **Re-derive every location; trust the reasoning, not the numbers.**

---

## 6. THE TWO MAPS — read both before writing a line

Two read-only agent passes, preserved because they cost a full pass each and would otherwise have
died in a session's context:

- **`.planning/research/wave1-convergence/FORKS-2-AND-3.md`** — `ask()` and `battleAsk()`. Fork 3
  collapses to near-trivial once the clock is gone; fork 2's hard part was never the clock. Contains
  the ECHO LOOP landmine (`renderBattle` publishes from inside the renderer) and the
  `ORCHESTRATION_DECL` mechanics.
- **`.planning/research/wave1-convergence/FORKS-4-5-AND-SHOTCLOCK.md`** — `recipeDraftNet()`,
  `netIntroBarrier()`, and the complete shot-clock removal inventory with REMOVE / KEEP-BUT-NEUTER /
  DANGER per site, every gate that goes red, and every doc line that becomes false.

> ### THE ONE THING THAT NEEDS WYATT, NOT YOU
> **Forks 4 and 5 both have a pass-and-play branch and they mean OPPOSITE things.** The recipe draft
> shows EVERY seat in turn behind the pass-the-device gate because recipe cards are **secret**. The
> intro barrier shows ONE card for the whole table because — Wyatt, 2026-08-08 — *"Dont require
> passing to the next player for the opening narration… Just show those once."*
>
> **A single dispatcher that handles one correctly handles the other wrongly**, and collapsing fork
> 4's branch is an **information leak**: `optsFor(p)` renders both of that seat's secret recipe
> choices. Carry a public-vs-private seat set INTO the dispatcher —
> `const asked = appState.passAndPlay && isPublic ? [humans[0]] : humans;` — do not let convergence
> quietly delete a decision he made.

---

## 7. THE PROCESS — non-negotiable, and all of it is enforced

**FOUR STEPS, never skipped, never reordered:** show it broken (write the check that FAILS first) →
change it → show that SAME check passes → sweep.

```bash
node scripts/qa/gear.mjs        # how deep must THIS change go? decided by FILES, never by feel
node scripts/sea_trial.mjs      # sail it; writes .planning/SEA-TRIAL.md
npm test                        # 26 gates, exit 0
```

**STEP 0 — WIDEN THE TIME HORIZON.** *What happened immediately BEFORE the bug? And before that?*
A snapshot cannot show you a race. **Intermittent is the tell.**

**WRITE YOUR PREDICTION DOWN BEFORE YOU MEASURE**, including what would prove you WRONG, then say
plainly which parts were wrong.

**RULE 6, in the form that caught this session twice:**
- **An agent's finding is not a measurement either.** A subagent report arrives with file:line
  citations and reads exactly like verified work. Two false claims reached Wyatt that way.
- **A correct reading of a DEAD BRANCH is still a false statement about the game.** P-1 was withdrawn
  because the penalty code is real and unreachable. **Ask "can a player reach this?" before "what
  does it do?"**

**RULE 25 — show it to a CEO before showing it to him.** `node scripts/qa/ceo_brief.mjs --ask="…"`,
fresh agent, its verdict reaches him **in its words**, appended to `.planning/CEO-REVIEWS.md`.
Review 7 is the newest; hand it to the next CEO so recurrence can be checked.

**THE LEDGER** — `.planning/CTO-LEDGER.md`, append-only, `HEARTBEAT` every 20 min, ONE item open at
a time. **Close the last one, do not just start the next.**

**THE LOCK** — `.planning/.cto-lock` arms `.claude/hooks/cto-staging-only.cjs`, which denies every
route to `main`. A CEO tested it and got two spellings through; both are closed and pinned in
`scripts/qa/cto_gate_check.js` (gate: 24 cases). **Its honest limit: it stops an accident and every
honest spelling. It does not stop a determined worker.**

---

## 8. WHERE THINGS STAND

| | |
|---|---|
| branch | `claude/cloud-handoff-planning-a9ay1u`, 30 commits ahead of `origin/main`, clean |
| staging | `https://staging.playpastrypirates.com/` — `2026.08.27.3-staging@427ff9d5` **(HTTPS works now)** |
| production | `2026-08-26k-CUTOVER` — **untouched. Nothing has reached real players.** |
| gates | 26, exit 0 |
| backlog | Wave 0 ✅ 3/3 · Wave 2 ✅ 9/10 · **Wave 1 in progress** · Waves 3-6 untouched (15 items) |

**⚠️ THE BUILD ON STAGING FAILED ITS SEA TRIAL** (`.planning/SEA-TRIAL.md`) — published before the
verdict existed. Real findings still open: **a dead "Trade" control on crew-phone**, two moments
where host and guest saw different games on crew-desktop (captains panel row order; the turn
highlight on a different captain — *that is Wave 1's own evidence*), ~45 screens that never settled.
**Re-sail early: WebKit now works and the vision judge can see, neither of which was true then.**

**Nine questions wait on Wyatt** in `.planning/CTO-QUESTIONS.md`. **Nothing pushes them to his
phone** — that promise was never true and is now corrected in the file. **Name the open ones out
loud in every report.**

---

## 9. CLOUD FACTS — all measured 2026-08-27/28, all in `docs/GIT-AND-DEPLOY.md` §7

- **WebKit works.** `~/.pw` holds the npm package; the browser lands in **`$PLAYWRIGHT_BROWSERS_PATH`
  (`/opt/pw-browsers`)**, not `~/.cache/ms-playwright`. `install-deps` is required and its failure
  prints AFTER a successful 102 MB download — read past the stack trace.
- **The vision judge needs `NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt`** or it cannot reach its
  API and defers every screen. Already wired into `scripts/lib/vision.mjs`.
- **`gh` and `rsync` are absent in the container** (`gh` IS on Wyatt's Mac). `deploy-staging.sh`
  feature-detects both now.
- **`pkill -f chromium` KILLS YOUR OWN SHELL** — every Bash call runs under a wrapper exporting
  `CHROME_BIN=/usr/local/bin/chromium`. And the browsers are named **`chrome`**, so
  `pgrep -x chromium` reports zero while ten are alive. Match the process NAME and cover both.
- **A fresh container's local `main` is stale** and that is not a finding. `git branch -f main
  origin/main`.

---

## 10. WHEN YOU HAND BACK

1. The ledger current and the lock **released** (`rm -f .planning/.cto-lock`).
2. A staging deploy he can play, with the **`https://`** URL written out and its build stamp.
3. **The CEO's verdict, in the CEO's words**, especially when it is bad.
4. **An honest NOT-RUN list.** A leg that could not start is not a leg that passed.
5. Anything you guessed, named as a guess.
6. **Screenshots of host AND guest side by side.** Rule 23's fault class is invisible to any check
   that tests a renderer, and visible instantly in two pictures. It is the only thing that can
   actually prove this work.
