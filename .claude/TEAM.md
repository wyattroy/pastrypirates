# TEAM.md — Pastry Pirates adapter for claude-kit team runs

**This file operationalizes `.claude/CLAUDE.md` for a crew. It overrides nothing in it.** Read
CLAUDE.md in full first — all 27 rules; every one was paid for. This page tells the crew how *this*
product is run, seen working, and verified.

*(Written 2026-08-30 against build `2026.08.30.1`. It replaces a stale draft in claude-kit that
described the `4/` tree — the cutover deleted that tree, and root `npm test` now covers everything.)*

## How to run and see this product

- **No build step.** `index.html` + `src/`, native ES modules. What is on a branch IS what runs.
- **Serve it:** `npm start` (python3 http.server on 8000), then `http://localhost:8000/`.
- **Staging:** `https://staging.playpastrypirates.com` — published from any branch by
  `./scripts/deploy-staging.sh "what changed"`. **Production is `playpastrypirates.com`, served
  from `main`, with real players on it right now.**
- **The tester's manual is `docs/DRIVING-THE-GAME.md`, read BEFORE opening a browser** — §3 solo,
  §4 the turn loop and the two things that stall every naive driver, §5b the autoplay driver that
  actually plays, §5c driving a guest while a human hosts, **§5e injecting the state you want
  instead of playing your way to it.**
- **The crew rig works:** `scripts/mp_rig.mjs` — `makeHost` / `makeGuest` / `startVoyage(C)`. Never
  hand-roll a click loop; four attempts died that way before `startVoyage` existed.
- **Shortcuts that skip the sailing** — read them from source, never from memory
  (`grep -rn "location.search" src/`). Today: `?ovens=1`, `?bakeoff=1|0`, `?bake2=1`, `?endcard=1`,
  `?usage=1`, `?wind=1`, `?windhud=1`, `?debug=pulse`. **Several ride on `devHost()` and are dead on
  the production domain.** A voyage to the ovens is sixteen days to reach ninety seconds of the
  thing under test.

## What "done" evidence looks like here

- **`npm test` exits 0.** 51 gates. A gate added or removed must update `gates.total` in
  `package.json` in the same edit, or `gate_count_check.js` fails the build.
- **The gear, chosen by the files touched — never by how the change feels:**
  `node scripts/qa/gear.mjs`. COSMETIC (words, colours, comments) · PLUMBING (how a mode serves the
  game up) · **FULL — everything else, and the default.**
- **The sea trial at that gear:** `node scripts/sea_trial.mjs`. Its report must keep its
  **NOT-RUN column** — a leg that could not start is not a leg that passed.
- **A picture, always.** The rendered screen, not the DOM and not a state dump. **For anything
  multiplayer, BOTH screens at the same moment, compared element by element.** A green suite proves
  nothing about what a player sees: seven bugs once reached Wyatt in a build whose checks were
  honest and were measuring game state rather than what was drawn.
- **A matched pair for anything visual** — the same posed state before and after. **When the
  question is a picture, do not go looking for a rate:** three probe runs and three 85-minute
  trials once failed to settle a placement question that two screenshots would have.
- **A fresh-context CEO verdict per item**, appended to `.planning/CEO-REVIEWS.md` newest-first.
  One item, one verdict; a batch at the end is the documented failure.

## Never touch

- **`main`.** Every push to it is served to real players immediately. Staging only, and only via
  `./scripts/deploy-staging.sh` — never a hand-rolled rsync.
- **`CNAME`, `robots.txt`, `sitemap.xml`.** GitHub Pages reads `CNAME` as a *claim* on the domain;
  a second repo containing it takes the live game down. Two sessions came within one command of it.
- **`assets/` that `/classic` still reads** — deleting art v2 no longer uses breaks the frozen v1.
- **The append-only records.** `.planning/CTO-LEDGER.md` and `.planning/CEO-REVIEWS.md` are
  appended to, never rewritten. Editing a past verdict falsifies what it said.
- **The determinism corpus.** Changing what the engine emits into the event stream invalidates it
  and forces a gated re-record. **Prefer a UI-tier fix**; if one is impossible, that is a question
  for Wyatt, not a decision for the crew.

## Useful to know

- **The live record is `.planning/CTO-LEDGER.md` (tail) + `.planning/BACKLOG.md` (wave list).**
  `ROADMAP.md` and `STATE.md` are explicitly NOT authoritative and no one should plan from them.
- **Claim an item in the ledger before editing it.** Assume a second session is on this branch —
  `git pull --rebase` before every commit.
- **Where the work actually lives, and why builders collide here:** `src/ui/flow.js` (3k lines,
  the turn loop) and `src/ui/stage.js` (3.7k, the director) hold most of what a task will touch.
  **Splitting by feature will put two builders in one file. Split by file, and run fewer builders
  than feels efficient** — on this codebase the crew's value is in measuring, checking and seeing,
  not in parallel typing.
- **`src/engine/index.js` is pure** — zero `isHost`, zero `passAndPlay`, no DOM, no network. Keep
  it that way; a mode or a screen leaking into the engine is a defect on sight.
- **Kill every browser and server BY PID before replying.** A `pkill -f` pattern that matches its
  own command line has killed the shell and silently eaten a commit.
- **Anything handed to Wyatt to read is a published, tappable link — never a repo path.** Write
  such files with no `<!doctype>`/`<html>`/`<body>` so they can be published at all.
- **Subsystem docs, read before touching:** trade → `docs/TRADE-SYSTEM.md` · board →
  `docs/BOARD-RENDERING.md` · bots → `docs/BOT-DESIGN-PRINCIPLES.md`, `docs/BOT-V3-RACE-PLANNER.md`
  · audio → `docs/AUDIO.md` · deploy → `docs/GIT-AND-DEPLOY.md` · testing → `docs/QA-PROCESS.md`
  and `docs/HARD-WON-LESSONS.md`.
