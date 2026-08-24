# THE ORACLE-DEBUG WORKFLOW — build plan for a fresh session

**Purpose: turn the debugging system designed with Wyatt on 2026-08-24 into a standalone,
callable workflow (`/oracle-debug <bug-slug>`) any future session can invoke for hard,
intermittent, device-bound bugs. This file is the complete handoff — a session with zero prior
context should be able to build it from here.**

Wyatt's charter, verbatim anchors:
- "How would you direct you if you were me to do this flawlessly?" → the seven directives in §4.
- "Write down all of this in a plan that you can use in a different session… standalone, callable."

## 1. The principles the workflow enforces (non-negotiable)

1. **Pixels are the only oracle.** A verdict about what a player sees comes from rendered frames
   (screenshots, videos, painted-rect sampling) — never from computed style alone. This session
   shipped three "verified" fixes that were computed-style-true and pixel-false.
2. **A bug is found when it reproduces on demand; a fix ships when its red repro goes green.**
   No reproduction → no fix; instead, a scripted experiment is routed to the human device.
3. **Two ledgers, one truth.** EVIDENCE.md (measurements only, timestamped, labelled
   [M]easured / [O]bserved-once / [T]estimony) and HYPOTHESES.md (kill-criterion written BEFORE
   the experiment; killed theories never resurrect; no fix from an OPEN theory).
   Live templates: `.planning/debug-pulse/EVIDENCE.md` and `HYPOTHESES.md` — copy their shape.
4. **The human's device is the scarce instrument.** One pre-scripted ≤30s experiment at a time,
   each designed so either outcome kills at least one hypothesis.
5. **One bug to done.** The workflow refuses to share its session with other work.

## 2. What already exists (built 2026-08-24 — reuse, don't rebuild)

| Instrument | Where | Notes |
|---|---|---|
| Chromium rig | `4/scripts/mp_rig.mjs` | serve/launch/attach/makeHost/makeGuest/driver/killAll; CDP; `docs/DRIVING-THE-GAME.md` is the manual (read FIRST — hook-enforced). |
| WebKit runner | `4/scripts/wk_probe.mjs` | Real WebKitGTK via WebKitWebDriver; measures painted swing of a selector. `xvfb-run -a node 4/scripts/wk_probe.mjs <url> <sel>`. |
| WebKit red-proof | `4/scripts/wk_redproof.sh` | Run before trusting the runner. Known result on WebKitGTK 2.52: var-in-keyframes resolves fine (see EVIDENCE — the 24d mechanism is unconfirmed). |
| The pulse beacon | `4/src/ui/pulsebeacon.js` + loader in `4/src/main.js` | `?debug=pulse` on any device. Logs VIS/CLOCK/PROMPT/BOX with per-button LIVE/FROZEN verdicts and a page-timeline liveness probe. 🐛 chip → Copy log. `window.__pulseBeacon` for rigs. Sanctioned tooling exception (his explicit yes, 2026-08-24). |
| Video→frames→measure recipe | this session's transcript; re-derive as follows | ffmpeg: `pip install imageio-ffmpeg` → binary at `imageio_ffmpeg.get_ffmpeg_exe()` (the Playwright ffmpeg in /opt/pw-browsers is codec-stripped and cannot read .mov/.mp4). Frames at 5fps; measure per-button AREA in a bounding box (bright-pixel count, threshold sum>620, step 2) — swell ⇒ area ratio ≈1.31 at scale 1.15, period 1.1s; flat ⇒ ratio ≤1.01. `pip install pillow`. |
| Ledgers (live) | `.planning/debug-pulse/` | The pulse bug's current state — H1 stuck-clock is the front-runner; read before continuing that investigation. |

**Environment facts a fresh container must know:**
- The network allowlist BLOCKS `cdn.playwright.dev` and the Microsoft mirror → `npx playwright
  install webkit` fails 403. Workaround that works: `apt-get install -y --no-install-recommends
  webkit2gtk-driver xvfb` (apt's Ubuntu hosts are allowed). **apt installs die with the
  container** — the workflow re-installs them at start (idempotent, ~1 min). Alternative: Wyatt
  can add `cdn.playwright.dev` to the environment's network policy for real Playwright WebKit.
- Uploads land in `/root/.claude/uploads/<session>/`; >30MB comes via the Google Drive connector.
- Kill every headless browser/server before replying (CLAUDE.md rule 17); scoped pkill lives in
  mp_rig's killAll().

## 3. What to build: the callable skill

Create a **project skill** at `.claude/skills/oracle-debug/SKILL.md` (CLAUDE.md's "Project
Skills" section names this directory) so any session can invoke `/oracle-debug <bug-slug>`.

The skill's procedure (the roles from the design, as phases — run in ONE session with subagent
fan-outs, not five standing sessions):

1. **INIT** — `mkdir .planning/debug/<slug>/`; copy the two ledger templates; write the bug's
   symptom statement in one precise sentence (have the user confirm it via the question UI).
   Re-install WebKit driver + xvfb if absent. Run `wk_redproof.sh` and the Chromium rig smoke.
2. **EVIDENCE INTAKE (Librarian)** — every artifact the user provides is converted to
   measurements and appended to EVIDENCE.md before any reasoning. Videos → frames → area series
   per the recipe above. His screenshots read pixel-by-pixel (rule 22). Beacon logs parsed into
   the ledger verbatim.
3. **TRACE (Code Tracer)** — build/refresh the dependency map of the symptom: every selector,
   class writer, and timing that can produce it, with file:line. Subagent fan-out (Explore
   agents) is appropriate here. The map lives beside the ledgers as TRACE.md.
4. **HYPOTHESES (Keeper)** — each theory gets: statement, prediction, kill criterion (written
   first), status. Present the table to the user via the question UI when their ruling is needed;
   their rulings are recorded verbatim and are final (a banned theory never reappears — this
   session violated that once and was rightly called out).
5. **REPRO (Engineers, parallel)** — one subagent per OPEN hypothesis, each with the single goal
   of a red test in a controllable environment (Chromium rig, WebKit runner, beacon-instrumented
   live page). Timeboxed; results (including failures to reproduce) go into EVIDENCE.md.
   Where no environment can reproduce it → hand the Human-Experiment Designer the job:
   emit ONE ≤30-second scripted experiment for the user's device, with both outcomes' meanings
   pre-written.
6. **FIX (only after a theory is CONFIRMED)** — the fix is built against the red repro; the
   Adversarial Verifier (a separate subagent, fresh context) then tries to break it: other
   engine, other timing, visibility churn, throttling. Ship only when red→green and the verifier
   gives up. Ship loop per CLAUDE.md §6 (stamp bump, diff guard, zero-zero).
7. **CLOSE** — EVIDENCE gets the closing measurement; HYPOTHESES gets the confirmed row moved to
   a CONFIRMED section with the fix commit; `docs/HARD-WON-LESSONS.md` gets one paragraph if the
   lesson generalizes; the checklist gets a retest item.

Skill-authoring notes: keep SKILL.md under ~200 lines — link the contracts (this file) rather
than restating; the two ledger templates ship inside the skill directory as `templates/`;
the skill must state the oracle rules at the top as MUSTs, because they are the whole point.

## 4. Wyatt's seven directives (the skill's contract with him — print them at invocation)

1. No fix ships until the failure reproduces red→green, or the experiment is explicitly routed
   to him.
2. No Safari claims without the WebKit runner (re-install it first).
3. The hypothesis ledger is a file he can read, updated every turn; he reviews the ledger, not
   prose.
4. Instrumenting the product is allowed ONCE per bug, with his explicit yes (the beacon pattern:
   URL-flag-gated, DOM-only, zero cost when off).
5. His device time is scarce: one pre-scripted ≤30s experiment at a time, both outcomes
   pre-interpreted.
6. Every claim labelled measured / observed-once / inferred; fixes justified only by measured.
7. One bug to done; the session refuses unrelated work while the bug is open.

## 5. Backlog discovered during this investigation (hand to normal GSD flow, NOT this workflow)

- Tick-loop hardening: `tick()` (4/src/ui/stage.js ~2989) unprotected; watchdog blind because
  `S.raf` is never cleared on entry (stale truthy id after an exception). Fix: clear on entry or
  try/catch + re-arm.
- Delete the inert hover-pause rule (vocabulary block, index.html) — measured dead CSS.
- Version-lock modules to the page (stamp-keyed import URLs) so a cached page always loads its
  own build whole — delivery hardening, max-age=600 measured on GitHub Pages.
- The suspected H1 fix-in-waiting (do NOT ship before confirmation): on visibilitychange→visible,
  re-kick the attention animations (one-frame class toggle), making resume the game's own
  responsibility on every engine.
