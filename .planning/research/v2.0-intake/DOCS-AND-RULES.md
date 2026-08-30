# Documentation archaeology for promoting `4/` to be the official game

Research pass, 2026-08-18. Repo `/Users/wyattroy/Documents/Projects/pastrypirates`, branch `main`,
fetched and verified in sync with `origin/main` (both directions zero). No repo files were modified.

HEAD is `a191366` (2026-08-15, *"4: one wind pill for both captains…"*). The last 12 commits on `main`
are all `4:` commits. **`4/` is not a side experiment — it is where all recent work happened.**

---

## 0. The headline findings, before the tables

1. **`4/` is already sanctioned by CLAUDE.md, and unknown to `.planning/`.** CLAUDE.md's
   *"HOW WYATT PLAYS WHAT YOU BUILT"* section (added 2026-08-14) names `4/` as *"the milestone under
   development"* served at `playpastrypirates.com/4`, with a five-step merge loop. Meanwhile
   `.planning/` contains **zero** references to `4/` — deliberately, per `4/RULES-V2.md` line 14:
   *"Built outside GSD by explicit instruction; notes live here, `.planning/` untouched."* So the
   process record does not need *correcting*; it needs **re-basing**.

2. **`4/RULES-V2.md` is NOT the canonical rules source for `4/`. It is a frozen inherited copy.**
   It is byte-identical (md5 `191459a6…`) across `3/`, `4/`, `v2/` and `v2bakeoff/`, was committed to
   `4/` verbatim on 2026-08-11 in the commit that created the directory, and **has never been edited
   since** — while `4/src/engine/index.js` grew from 2,268 lines (v2bakeoff) to 3,313. It is at least
   four confirmed rules behind the code. Detail in §4.

3. **The CLAUDE.md loaded into this session's context is an older revision than the file on disk.**
   The on-disk file is 936 lines with 8 sections my injected copy lacks — including
   `CONSISTENCY IS A CORE VALUE`, `NOTHING IS A CONSTANT`, `READ THE GRAVEYARD`,
   `HOW WYATT PLAYS WHAT YOU BUILT`, `ASK WITH THE QUESTION UI`,
   `RESTATE EVERY MID-FLIGHT INSTRUCTION`, `The board is drawn in FIVE layers`, and the
   `HARD-WON-LESSONS` pointer. `git diff HEAD` on the file is clean, so disk == HEAD and the
   *context copy* is what is stale. **A session trusting its injected CLAUDE.md is missing every rule
   added after 2026-08-02 — which is exactly the `4/` era.** Worth telling Wyatt.

4. **`4/` honors the standing design rules** — narration order, voice boundary, consistency, copy
   approval all verified in code (§5). The exposure is not design discipline; it is **verification
   coverage**: `4/` is guarded by 4 scripts where root is guarded by 21, and has no determinism
   oracle at all.

---

## 1. The CLAUDE.md rule ledger — all 24 commits, chronological

`git log --format="%H|%ad|%s" --date=short -- .claude/CLAUDE.md` → 24 commits, 2026-07-22 → 2026-08-14.

| # | Date | SHA | Rule added | Incident that caused it | Still present? |
|---|---|---|---|---|---|
| 1 | 07-22 | `cdb54d6` | Initial 399-line GSD-generated body: Project, Tech Stack, Conventions, Architecture, Anti-Patterns, GSD Workflow Enforcement | Roadmap creation (bootstrap) | **Present** (lines 184–573), but describes **v1's monolith** — see §6 |
| 2 | 07-31 | `36b3ce8` | Read `docs/DRIVING-THE-GAME.md` before browser automation; `#flipCoinWrap` IS the flip button | Stalled three separate attempts | **Present** |
| 3 | 08-01 | `b110e16` | **`git fetch` before trusting any ref**; `main`/`origin/main` are local caches | Local `main` 457 commits behind; wrong conclusion handed to 4 sessions | **Present** |
| 4 | 08-01 | `4e73187` | **Narration box reveals top-to-bottom.** Order stated as *back → message → helper → buttons* | Wyatt's Safari playtest, 3 findings | **Superseded by #5 — order was WRONG as first written** |
| 5 | 08-01 | `8eff26a` | **Corrects #4's order** to *back → message → buttons → italic helper*; pins it to `localAsk()`'s DOM order (`.apBack`,`.apMsg`,`.apBtns`,`.apSub`) | The playtest batch itself | **Present** (lines 76–92) |
| 6 | 08-02 | `22524eb` | (a) Kill every headless Chrome/server in the same session. (b) **NEVER copy `CNAME`** — use `scripts/deploy-preview.sh` | (a) 2 probes at 21% CPU + 17 stale servers on an overheating laptop. (b) Two sessions came within one command of taking the live game down | **Present** |
| 7 | 08-02 | `d048b11` | `robots.txt` + `sitemap.xml` are the same hazard as `CNAME`; add site-identity files to `EXCLUDES` in the same commit | First deploy-script run republished live `robots.txt` over the preview's | **Present** |
| 8 | 08-02 | `a2c7390` | Pull `origin main` back down after every merge; verify both counts zero | The 457-commit incident again | **Superseded by #12 (broadened)** |
| 9 | 08-02 | `f15e178` | **Measuring cost ≠ measuring layout.** `--disable-gpu` is wrong for cost; an idle headless page makes animations measure free (0.2%/0 vs 11.1%/60) | Welcome-screen perf work | **Present** |
| 10 | 08-02 | `bb3cfeb` | *"At the end of the session" is too late* — bound every probe, kill on answer, never leave one running across a reply | 53% CPU across 13 Chrome processes, hours after #6 was written | **Present** |
| 11 | 08-02 | `cf737de` | **ASK 2–5 CLARIFYING QUESTIONS before building anything non-trivial** | Three failed rounds on the mute-button layout fix | **Present** (lines 599–623) |
| 12 | 08-02 | `d2df75a` | (a) Broadens #8 → **keep main in sync ALWAYS**, three moments. (b) **The voice boundary** — credits/About are NOT pirate speak. (c) **Worktrees are retired**, work in the main checkout | (a) worktrees retired. (b) A copy audit "fixed" correct credits copy. (c) `/gsd-progress` in a stale worktree reported v1.3 as 0-of-5 | **All present** |
| 13 | 08-02 | `4b37712` | Run `gsd-tools validate health` before status/phase-close; the known-noise list (W019/W002/W011); the three record conventions (point don't restate; never hand-type a countable number; no future tense in an append-only record) | 43 unread warnings; four record failures the checker structurally cannot see | **Present** (lines 734–805) |
| 14 | 08-05 | `e4afc79` | **Two trees, one repo — absolute paths always**; assert blast radius with `git diff --name-only \| grep -v '^v2/'`. Plus 4 more learnings (module cache, replaced algorithms, bots ignoring rules, probe bounding) | Building `v2/`: two edits meant for `v2/src/` landed in `v1/src/` | **MOVED, not removed** — see #15 |
| 15 | 08-05 | `0f69b03` | **Removes 58 lines added 5 commits earlier**, replacing them with a pointer to the new `docs/HARD-WON-LESSONS.md` | Consolidation | **Pointer present** (lines 887–931). *This is the one large deletion in the file's history, and it is a legitimate move, not a silent drop.* |
| 16 | 08-06 | `33a5dfc` | **RESTATE EVERY MID-FLIGHT INSTRUCTION** before carrying on; don't go hunting when he refers back — scroll up first | Two mid-build corrections implemented but never acknowledged; a session searched git/GitHub/Drive for "my two latest notes" that were his own messages | **Present** (lines 624–650) |
| 17 | 08-08 | `65195ad` | Strengthens the HARD-WON-LESSONS pointer: **read ALL of it, before the first tool call** | A session re-paid for three lessons already written in that file | **Present** |
| 18 | 08-09 | `0b365e7` | **ASK WITH THE QUESTION UI. ALWAYS. NOT PROSE.** Max 4 questions/call, ask in rounds, mark the recommendation | *"I tell you every day."* He is on a phone | **Present** (lines 574–598) |
| 19 | 08-12 | `46df917` | **CONSISTENCY IS A CORE VALUE** — same gesture, same behaviour everywhere; sweep every surface and say which were checked; sanctioned exceptions listed | Hold-the-sea faded some prompt styles and not others — three behaviours for one gesture. **Earned inside `4/`** | **Present** (lines 1–19) |
| 20 | 08-13 | `f3a8ce2` | **§0: read the subsystem's design doc before writing a line**; re-read a lesson at its TRIGGER | A day spent rebuilding `windReach3()`, which `BOT-V3-RACE-PLANNER.md` §4 says already shipped | **Present** |
| 21 | 08-14 | `27445d6` | **HOW WYATT PLAYS WHAT YOU BUILT** — `/4` is the milestone, ships on `main`, bump `PP4_STAMP`, prove the merge touches only the milestone | He tested `build 2026-08-13a` for a morning; 14 commits sat unmerged | **Present** (lines 130–183) |
| 22 | 08-14 | `7dd8ab3` | **NOTHING IS A CONSTANT** (derive from what the game computes) + **READ THE GRAVEYARD** (`git log --grep` / `-S`) | *"we already tried many failed attempts at decreasing trade spam; have you read all those logs?"* | **Present** (lines 20–75) |
| 23 | 08-14 | `bdaf100` | Adds `docs/TRADE-SYSTEM.md` as required reading before touching anything that trades | The constant rule was earned twice in one day | **Present** |
| 24 | 08-14 | `a9b2563` | **The board is drawn in FIVE layers** — `CAM_HTML_LAYERS` or it detaches on zoom; continuous animation must be HTML not SVG (62 layouts/sec → 0) | The trade-wind current detached, beside a comment predicting it | **Present** (lines 651–664) |

### Rules removed or changed — the flagged set

- **Nothing was silently deleted.** The only large removal (#15, −58 lines) is a documented move into
  `docs/HARD-WON-LESSONS.md`, with a pointer left behind. Verified by reading the diff.
- **One rule was silently CORRECTED, and this is the one to know about:** the narration reveal order
  (#4 → #5). For ~6 hours on 2026-08-01 CLAUDE.md instructed *helper text before buttons*. The
  shipped rule is *buttons before helper text*. Any document or memory quoting the first ordering is
  wrong. `4/` implements the corrected order (§5).
- **One rule was broadened, not dropped:** #8 → #12a (after-merge → always).

---

## 2. `docs/` inventory

| Doc (all under `/Users/wyattroy/Documents/Projects/pastrypirates/docs/`) | Governs | Applies to `4/`? | Stale? |
|---|---|---|---|
| `HARD-WON-LESSONS.md` | Master "what to distrust", 861 lines, §0–§7: read the subsystem doc first; absolute paths; don't trust reasoning over measurement; tooling that lies; probe hygiene; design lessons; working with Wyatt | **YES** — already names `4/scripts/seat_arg_check.js`, `4/scripts/dlog_quantity_check.js`, `voyageAground()` | **PARTIAL** — rules live; §1/§7 worked examples and §3 gate references still address `v2/` and `v2bakeoff/` |
| `TRADE-SYSTEM.md` | **Canonical** for trading: 4 invariants (hail count is guarded and player-facing; public info only; bot/human parity; nothing that prices a trade may be a constant), the pipeline, the human flow, what was tried and failed | **YES — `4/`-native.** Every path in it is a `4/` path | **NO** |
| `BOARD-RENDERING.md` | **Canonical** for the board: the five-layer stack, two coordinate systems, `CAM_HTML_LAYERS`, letterboxing, HTML-not-SVG for continuous animation, the 8-step new-overlay checklist | **YES — `4/` ONLY.** `CAM_HTML_LAYERS`, `rimHost`, `ringTo`, `routeTick` exist only in `4/src/` | **NO** |
| `BOT-DESIGN-PRINCIPLES.md` | What bots are for: the objective made computable, 10 principles (no priority orders; public info only; personality tilts never overrides; prove on the ladder; price by what IT would accept), the hail-volume invariant, a numbered failure log | **YES** — principles are ruleset-independent; every function named is in `4/src/engine/index.js` | **PARTIAL** — declares itself canonical for `v2bakeoff/`; its hail figure (0.75/game) is superseded by TRADE-SYSTEM §6's 2.63 |
| `BOT-V3-RACE-PLANNER.md` | The v3 brain: maximise P(win) of a 4-way race; `RACE_BIAS`/`RACE_SPREAD` fitted by max-likelihood not tuned; what the ladder rejected twice; the becalming bug; **a trade-winds section written against `/4`** | **YES** | **PARTIAL** — design live; the "`/3` is the build, `/v2bakeoff` is the incumbent" framing is one generation behind |
| `DRIVING-THE-GAME.md` | The playtest-automation runbook: fresh port, the flip coin is its own button, the autoplay driver, arm a watcher, **inject state rather than play to it**, drive frames when measuring cost | **MOSTLY** — every DOM id/class it names survives in `4/` (`#flipCoinWrap`, `.apBtn`, `.btlBtn`, `.sailCell`, `#actionPanel` all verified present) | **PARTIAL — two concrete breakages.** Hardcoded import paths are root-relative (`/src/state/index.js` → must be `/4/src/…`); §5c/§5d (guest driving, Firebase watchers) are dead in `4/`; the §5b driver knows nothing of the bake-off prompt and will likely stall in it |
| `MODULES.md` | Module-loading + local-dev contract: no build step, HTTP server required, the tier layout, the net→UI and ui→orchestration seams, `appState` rules, permitted globals | **PARTIAL** — the seams and globals all exist in `4/` | **PARTIAL** — its enforcement claims are v1-only (every contract-check gate scans root `src/`), and it does not know `4/`'s new modules (`ui/stage.js`, `ui/bakeoff.js`, `ui/usage.js`, `engine/bakeoff.js`, `shared/recipe-steps.js`) |
| `VERIFICATION-CHECKLIST.md` | Phase 12's four gate criteria for the v1.1 refactor: `npm test` 9-script chain + frozen-corpus invariant; solo E2E (11 steps); two-tab multiplayer (11 steps); manual Safari pass | **NO** | **YES — and structurally impossible for `4/`.** Criterion 1's scripts read root `src/`; Criterion 3 cannot run (no Firebase in `4/`). Needs replacing, not editing |
| `WINNING-STRATEGY.md` | Game-theoretic optimal play: sailing is ~65% of the game; price is a clock not a cost; tour/wind/contention; four traps incl. never attack upwind holding cargo | **YES** — ruleset-level, names no paths | **PARTIAL** — routing/wind/fighting current; its "trading is nearly dead" and "endgame intercept is always worth it" claims are both contradicted by later measurement |
| `DETERMINISM-RERECORD.md` | Closed historical record of the Phase 14 re-record; the 31-seed corpus; **capture exactly once; never weaken `REQUIRED_EVENT_TYPES`** | **NO** | **YES for `4/`.** Consequence worth stating: **`4/` has no determinism oracle at all**, so building one is a first-time capture decision, not a re-record |
| `DETERMINISM-RERECORD-NEXT.md` | Queue of engine changes specified but deliberately unlanded: `spoil` carries rendered text, `gave` carries `price+" coins"`, `ilabelImg` imported into the engine tier | **INHERITED** — `4/`'s engine is a descendant, so the violations likely persist | **PARTIAL** — the debt is real and unlanded; its line numbers and cost model are v1-only. **The economics invert in `4/`**: with no fixtures, the reason it was a queue disappears |
| `FABLE-BOT-BRIEF.md` (+`.txt`) | Outbound commission to an external agent to replace the bot brain; work in `/v2bakeoff/` only; ship only on a positive ladder edge; Appendices A/B are verbatim frozen copies of two other docs | **NO** | **YES** — completed and answered (BOT-V3-RACE-PLANNER is its deliverable). Its appendices are copies that will drift — the exact copy-vs-pointer failure the project warns about |
| `ux-audit-v3/FINDINGS.md` (+2 PDFs) | UX audit under a stated brief (cold new player, 375px floor, teach-in-play): 12 ranked findings incl. no guided attention, ~25px sail taps, illegible instruments, how-to-play teaching a game that no longer exists | **PARTIALLY** — audits **`3/`**, but named surfaces survive in `4/` | **PARTIAL** — one generation behind and unverified against `4/`. Its centerpiece recommendation (a `pp3_hints` first-voyage ledger) is **provably unbuilt** in both `3/` and `4/` |

**Recency split is clean:** `TRADE-SYSTEM`, `HARD-WON-LESSONS`, `DRIVING-THE-GAME`,
`BOT-DESIGN-PRINCIPLES`, `BOARD-RENDERING` last touched 2026-08-14; `BOT-V3-RACE-PLANNER` 08-13.
`VERIFICATION-CHECKLIST` and `MODULES` are frozen at 2026-07-31, both `DETERMINISM-*` at 2026-07-30 —
i.e. the four v1-only documents are exactly the four nobody has touched since before `v2/` existed.

---

## 3. `.planning/` inventory

**Headline: no document in `.planning/` mentions `4/`.** A grep for `4/|v2bakeoff|bakeoff|RULES-V2|redesign`
returned 205 hits, every one a false positive (v1's own bakeoff feature, the *island* redesign,
"deferred to v2" debt rows, `3/3 plans executed` progress counters). Zero hits for `RULES-V2`, for
`4/src`, or for the `v2/`, `v2bakeoff/`, `3/` directories. Last substantive `.planning/` commit is
2026-08-02; `4/` runs 2026-08-11 → 08-15. **The planning record is nine days stale and structurally
unaware of the thing that replaced it.**

| Doc (under `.planning/`) | Asserts | Stale because of `4/`? |
|---|---|---|
| `PROJECT.md` | v1.2 shipped; current milestone v1.3 "The Game Comes Alive" (Phases 18–22); codebase is the `src/` refactor of `index.html`; fishing, bakeoff, Firebase multiplayer; bot/human parity invariant; approval gates on badges + storm text | **YES** — v1 layout and v1 rules. Only the parity invariant survives as philosophy |
| `MILESTONES.md` | Archival close-out of v1.2 (Phases 13–17) and v1.0; carried-forward items | **PARTIAL** — history stays true; its carried-forward list points at v1 code paths |
| `ROADMAP.md` | v1.0–v1.2 complete; **Phase 20 "The Board Comes Alive" is the only remaining v1.3 work**; hard gate *"nothing may touch `src/engine/index.js`"*; the once-only determinism re-record scheduled for v1.4 | **YES** — the whole forward roadmap targets v1's `src/ui/board.js` and protects a determinism corpus `4/` already bypassed |
| `REQUIREMENTS.md` | v1.3 requirement IDs mapped to Phases 18–22; a large Future backlog (TUT, ISLAND, ART watercolor, LOAD compression); *"nothing in this milestone touches the rules engine"* | **YES**, with a partial tail — the rule-neutral backlog is the only re-homeable part |
| `STATE.md` | `milestone: v1.3`, 4 of 5 phases, 80%; Phase 20 the only one left; a Decisions/Blockers ledger | **YES** — see the dedicated note below |
| `RETROSPECTIVE.md` | v1.0 retrospective; lesson: GSD artifacts were never populated, keep `.planning/` in lockstep with code | **NO** — and arguably the *most* relevant doc here: its central lesson is exactly what `4/` has now done at larger scale |
| `HANDOFF.md` | v1.0-era handoff; 15 punch-list items on an unmerged branch; three things needing Wyatt | **YES** — was already dead before `4/` existed |
| `COPY-AND-TASTE-REVIEW.md` | Ledger of invented player-facing copy + taste calls awaiting row-by-row approval, cited by v1 `index.html` element ID | **YES** — pinned to v1 strings/selectors. `4/` ran its own approval pass (§5) |
| `REPO-STRUCTURE-AUDIT.md` | Explicit PROPOSAL, unexecuted: `art-review/` is 484 MB / 94% of the tracked repo and publicly downloadable; `.git` is 572 MB; archive 110 media files to an orphan branch | **PARTIAL** — measurements still correct and still un-executed, but it audits a repo without `3/`, `4/`, `v2/`, `v2bakeoff/`. **A `4/` promotion is the natural moment to re-run it** |
| `V1.3-STATUS-2026-08-01.md` | Dated snapshot of an integration branch; narration metrics; Safari CPU 137% → 30–83%; 7 known-unfixed bugs | **YES** — point-in-time, branch since merged |
| `V1.3-V1.4-PLAN.md` | Master plan splitting work into v1.3 (visual/audio, touches no rules) and v1.4 "The Grind" (the one gated engine fix) | **YES — the single most superseded document.** Its organizing principle (defer engine change to one careful v1.4 pass) is moot once a rewritten engine ships |
| `v1.2-MILESTONE-AUDIT.md` | Post-hoc audit of archived v1.2: 22/23 requirements, 5/5 phases; per-phase tech debt | **NO** (mildly partial) — closed audit, historically valid |
| `art-audit.md` | Gemini art-generation runbook + a "do not regenerate" inventory of shipped assets | **PARTIAL** — the asset inventory carries cleanly (`4/` reuses `../assets/` and `../sfx/` with no duplication); its wiring references point at v1's `index.html` |
| `how-to-play-pastry-pirates.md` | Agent playbook: win condition, 15×15 board, rim arcs, BFS `waterRoute`, the v1 action economy | **YES** — teaches mechanics RULES-V2 deletes (fishing, the lee, the sail-budget model). Rim-arc and BFS sections survive |

Also present and equally v1-era, not on the requested list: `PLAYTEST-2026-08-01-PHASE-18-21-22.md`,
`WINDOWS.md`, `art-generation-process.md`.

**`STATE.md` next action, and whether it survives promotion.** It says Phase 20 is the only remaining
v1.3 work: execute 7 planned plans across 5 waves in the `board-wind` workstream (drifting wind dots,
whirlpool arrows, rim-sweep warning, wind scent), plus one open taste question (rim warning colour,
`#2b6f8f` vs amber). **Not meaningful if `4/` is promoted** — those plans edit v1's `src/ui/board.js`
and are wired to v1-only `npm test` guards. `4/` already has its own board/wind/stage rendering and
has landed wind and board work independently. The *intent* is worth re-homing; the plans are not
portable. (Separately, STATE.md's trailing "Operator Next Steps" says *"Phase 13 complete… plan Phase
14"* — it was already ~5 phases stale before `4/` existed.)

**`.planning/todos/pending/` — 39 files.** All dated 2026-07-31 → 2026-08-10, i.e. all predate `4/`.
Most are v1-only or moot (`bots-fish-and-dock-at-tortuga-same-turn` — fishing is removed in `4/`;
`every-client-can-see-every-recipe` — `4/` has no networking; `human-trade-counter-offer` — **`4/`
shipped this**). Three carry `status: closed-*` frontmatter and are misfiled in `pending/`. Seven are
still actionable and should be re-pointed at `4/`: `copy-shipped-vs-approved-gate.md`,
`2026-08-10-usage-stats-firebase-followups.md`, `2026-08-01-sound-effects-still-missing.md`,
`2026-07-31-recipe-art-has-jagged-cutout-edges.md`, `2026-08-01-wind-scent-descriptors.md`,
`2026-08-01-bot-human-parity-audit.md`, `narration-two-schedulers-unenforced.md`.

**`.planning/workstreams/` — 4.** `front-door` (Phase 22), `prompts-polish` (Phase 18),
`sound-clock` (Phase 21) all `status: complete`, 100%. `board-wind` is `status: ready-to-execute`,
Phase 20, 7 plans planned and pushed, **none started** — the only live workstream, and the one `4/`
supersedes.

---

## 4. Rules documents — canonicity finding

### The four files

| File | md5 | Last touched | Verdict |
|---|---|---|---|
| `RULES.md` | `a34d1e06…` | 2026-08-01 | v1 player-facing rules — the short version |
| `Rules_boardgame.md` | `5eda86ea…` | 2026-08-01 | v1 complete tabletop rulebook — the long version. Consistent with `RULES.md` |
| `3/RULES-V2.md` | `191459a6…` | 2026-08-09 | identical |
| **`4/RULES-V2.md`** | `191459a6…` | **2026-08-11** | identical |
| `v2/RULES-V2.md` | `191459a6…` | 2026-08-07 | identical |
| `v2bakeoff/RULES-V2.md` | `191459a6…` | 2026-08-08 | identical |

**All four V2 copies are byte-identical.** There is no `4/`-specific ruleset document. `4/RULES-V2.md`
entered the tree in `511c427` (2026-08-11, *"4: the stage — first playable build of the redesign at
/4"*) as a verbatim copy of `v2bakeoff`'s, and has had **zero commits since**. Over the same window
`4/src/engine/index.js` went 2,268 → 3,313 lines.

Its own header proves it is not `4/`-scoped: line 3 says *"Solo/pass-and-play only… v1 (repo root) is
untouched"*, and line 8 says *"Lives in `v2/` on branch `claude/pastry-pirates-v2-rules-33gp60`"* —
it is still describing `v2/`.

### v1 → v2 rules delta (for the record)

Sailing costs 1 coin on a 9-point wind-priced budget → **free, 4 squares, capped at 2 if any leg is
upwind, the lee deleted**. Storm ~15%, 2 squares + spin + 2 more, with a paid dodge and an aground
penalty → **20%, 3 squares one direction, land simply stops you short, nobody loses a turn**. Dock
heads = a free crate / tails = 3 coins → **heads = treasure, tails = 2, no free crate, buy after
either**. Battle first-to-3-points with a place-swap and a crate-or-5-coins forfeit → **one round, no
swap, crate only**. Trade hails one captain with a +1 harbor tax each → **table-wide broadcast, no
tax, one round of counters**. **Fishing removed**, replaced by Pass. **Battle calls added** (+2 to any
non-combatant who calls it right). v1's flip-off BAKEOFF → *"no bakeoff"* in the doc.

### Spot-checks: `4/RULES-V2.md` vs `4/src/engine/index.js`

| # | Rule as written | Code | Verdict |
|---|---|---|---|
| 1 | Sail 4 squares, capped at 2 if any leg is upwind; crosswind is not upwind | `SAIL_RANGE=4, SAIL_RANGE_UPWIND=2` (`4/src/shared/index.js:328`); path-wide upwind test at `engine/index.js:1812` | **AGREES** |
| 7 | Storm 20%/round, one direction, 3 squares | `storm:0.20` (`engine/index.js:3300`), `STORM_PUSH=3` (`shared/index.js:330`) | **AGREES** |
| 9 | 2🌕 powder; 2🌕 to re-fire | `powder:2, refire:2` (`3279`) | **AGREES** |
| 5 | Correct battle call pays +2🌕 | `callBounty:2` (`3279`) | **AGREES** |
| 11 | Crates per island: 3 at 3–4 players, 1 at 2 players; price = 6 − crates left | `const crates = np===2?1:3` (`3276`); `Math.max(1, crateBase-left)` with `crateBase:6` (`817`, `3291`) | **AGREES** |
| 4 | Table-wide trade, one round only, a counter cannot be countered | `engine/index.js:965–966` states the same rule verbatim | **AGREES** |
| **10** | **"heads = 6🌕 treasure found"** | **`dockHeads:3`** — 6→5 on 2026-08-08 (Wyatt: *"Can we lower treasure to 5?"*, 600-voyage table), then 5→3 on 2026-08-21 (D-30, 300-game sweep). *Line 3291 and the value 5 were correct when this table was written and are dated 2026-08-27; the live field is in `src/engine/index.js`, which is the only thing that answers this question.* | **DOC WRONG** |
| **11** | Prices come only from the 6−stock formula | **`blackMarket:10`** (`3287`) — a sold-out island always has one more crate for a flat 10🌕 (Wyatt, 2026-08-12); plus a second barter price, *"any 2 ingredients"* (`825`, `barterCrate`) | **DOC INCOMPLETE — a whole mechanic missing** |
| **12** | **"No bakeoff"** | **`BAKEOFF_ENABLED=true`** (`shared/index.js:368`); `play(){ return this.cfg.bakeoff ? this.playBakeoff() : this.playClassic(); }` (`3176`); `4/src/engine/bakeoff.js` (211 lines) + `4/src/ui/bakeoff.js` (527 lines); `?bakeoff=0/1` override | **DOC FLATLY CONTRADICTED.** A bake-off minigame is the shipped default. The engine comment at `3236` still reads *"v2 rule 12: there is no bakeoff"* on the now-non-default `playClassic` path |
| 12 | Best Baker = most crates, then coins, then home first | `bakeRank()` at `3241` implements exactly that | **AGREES** (the ranking survives; only the "no bakeoff" headline is wrong) |

**Finding.** `4/RULES-V2.md` is **not canonical and not current**. Seven of ten spot-checks agree, but
the three that fail are not typos — they are a changed economy constant, an entire undocumented
mechanic (the black market and its barter price), and a headline rule inverted by the single largest
feature added to `4/`. The real specifications for `4/` are `docs/TRADE-SYSTEM.md` and
`docs/BOARD-RENDERING.md` (both self-declared Canonical, both `4/`-native), plus the engine's own
unusually dense comments. **Promoting `4/` needs a rewritten v2.2 ruleset document; the existing one
should not be shipped as the rules of the official game.**

---

## 5. Standing design rules — verdicts for `4/`

| Rule | Verdict | Evidence |
|---|---|---|
| **Narration box reveals top-to-bottom** (`back → message → buttons → italic helper`) | **VERIFIED** | `4/src/ui/flow.js:249` builds exactly `${backHtml}` → `.apMsg` → `${slHtml}` → `.apBtns` → `${subHtml}`. `flow.js:645` carries an explicit comment: *"The wind hint goes in `.apSub` — last in the DOM, so it is revealed last, per the standing [rule]"*. **Better than compliance:** `flow.js:230–233` applies the rule's *generative* clause to a brand-new element, placing the quantity slider between message and buttons because *"content is revealed in the order it appears top to bottom (back, message, THIS, buttons, helper text)"*. That is the rule working as designed. `panel.js` gates the button row behind `typewriterReveal()`'s completion, so the order is enforced in time, not just in DOM |
| **Credits / About are NOT in pirate speak** | **VERIFIED** | `4/index.html:1971` — *"made by Wyatt Roy, a designer and overly enthusiastic noodle… my sweet partner Juju"*, `you` not `ye`, all named collaborators intact. Wyatt's plain first-person voice, exactly as the rule requires |
| **Copy approval gate** (`@copy` markers, no draft copy ships) | **VERIFIED** | 107 `@copy` markers across `4/src/`. Commit `503fdc0` (2026-08-14): *"4: every @copy string in the milestone is now approved copy, not a draft"*. Explicit annotations e.g. `orchestrator.js:349` *"APPROVED as written, Wyatt 2026-08-15"*, `lobby.js:290` *"APPROVED as written, Wyatt 2026-08-14"* |
| **CONSISTENCY IS A CORE VALUE**, with the hold-the-sea exception | **VERIFIED** | `4/index.html:1435–1438`: `body.pp4Peek` fades `#pp4Prompt`, `.pp4Bub` (narration bubbles) and `.pp4Stay` (stay-put confirm) to `.13`, and explicitly exempts `#pp4Prompt.pp4Center` (centre-stage intros) at `opacity:1`. `#pp4Veil` is not in the list. **This matches CLAUDE.md's sanctioned-exception text exactly** — unsurprising, since the rule was *earned inside `4/`* (commit `46df917`) |
| **NOTHING IS A CONSTANT** (derive prices from what the game computes) | **VERIFIED** | `acquireTurns()` is the pricing spine — 12+ call sites in `4/src/engine/index.js` (983, 1004, 1045, 1245, 1298, 1302, 1337, 1435, 1485…). `1337`: *"openingBid caps the bid at acquireTurns — what fetching the crate myself would cost"*. No threshold constant in the hail test |
| **Build stamp bumped every merge** (`PP4_STAMP`) | **VERIFIED** | `4/src/ui/stage.js:32` → `"2026-08-15d"`, rendered at `923` as `v4 · build …`. Matches HEAD's date |
| **`CNAME` / `robots.txt` / `sitemap.xml` never leave** | **VERIFIED** | None present in `4/`. `4/` contains only `RULES-V2.md`, favicons, `index.html`, `scripts/`, `src/` |
| **Approval gates on badge redesign + storm-text rewrite** (from `PROJECT.md`) | **UNKNOWN / likely moot** | These are v1.0-era gates recorded in `.planning/HANDOFF.md`, all three resolved in v1.0. `4/` rewrote storms entirely (RULES-V2 §7–8) under its own approvals. No evidence either way that the *v1* gates were re-applied — but they no longer describe anything in `4/` |
| **ASK 2–5 questions / use the question UI / restate mid-flight instructions** | **UNKNOWN** | Session-behaviour rules; not observable from committed artifacts. The commit log is unusually rich in *"Wyatt's ruling"* / *"Wyatt, 2026-08-1x"* citations, which is circumstantial evidence they were followed |

### Two defects found while checking

1. **The About link is broken in `4/`.** `4/index.html:1829` and `:2163` both use
   `href="about.html"` (relative). Served from `playpastrypirates.com/4/` that resolves to
   `/4/about.html`, which **does not exist** — only the root `about.html` does. Should be `../about.html`.
   Compounding it, `4/RULES-V2.md:13` says the build carries *"No `about.html`"*, so the doc and the
   markup disagree about whether the page should be reachable at all.
2. **The root `README.md` is stale and does not mention `4/`.** It also references
   `ONLINE_SETUP.md` and `DESIGN_REPORT.md` — **both missing from the repo** — and points at
   `docs/MODULES.md` as the module contract, which is v1-only.

---

## 6. What promoting `4/` will collide with

**In priority order, on the evidence above.**

1. **Verification coverage is the real exposure.** `npm test` is a 21-script chain, every script
   rooted at root `src/`. **`4/` is covered by 4 gates** (`4/scripts/no_undef_check.js`,
   `seat_arg_check.js`, `dlog_quantity_check.js`, `trade_offer_measure.js`). There is no
   determinism corpus, no `module_graph_check`, `ui_contract_check`, `state_contract_check`,
   `net_contract_check` or `engine_contract_check` for `4/` anywhere. **A green `npm test` says
   nothing about `4/`** — which is precisely the *"a gate scanning the wrong tree is not silent, it is
   reassuring"* trap in `HARD-WON-LESSONS` §3.
2. **`4/` has passed none of `VERIFICATION-CHECKLIST.md` and cannot pass most of it** — Criterion 1
   needs root scripts, Criterion 3 needs Firebase that `4/index.html` does not load.
3. **`4/RULES-V2.md` must not ship as the rules of the official game** (§4).
4. **The CLAUDE.md `Project`/`Architecture` block (lines 184–573) describes v1's monolith** — "all
   JavaScript inline in `<script>` tags", "Firebase config embedded in `index.html` lines 4542–4551",
   "single monolithic HTML file (328 KB)", `index.html:1017–1684` line references. None of this is
   true of `4/`. It is GSD-generated from `PROJECT.md`, so re-basing `PROJECT.md` regenerates it.
5. **Multiplayer is dead in `4/`.** `4/index.html` contains zero occurrences of `firebase` and loads
   one script tag. `4/src/net/` still exists and is still imported but is inert. `PROJECT.md`'s stated
   Core Value — *"playable and fair end-to-end in both Safari and multiplayer"* — cannot be met by
   `4/` as it stands. **This is the biggest product-level decision hiding in the promotion.**
6. **`docs/DRIVING-THE-GAME.md` needs its import paths re-pointed** (`/src/…` → `/4/src/…`) or every
   future playtest probe injects state into the wrong tree — the two-trees hazard again.
7. **`.planning/` needs re-basing, not correcting** — it was deliberately untouched. Three tiers:
   archive as v1 history (`V1.3-V1.4-PLAN`, `ROADMAP` forward half, `STATE`, `REQUIREMENTS` v1.3 half,
   `V1.3-STATUS`, `HANDOFF`, `how-to-play`, `workstreams/board-wind`); keep as closed history
   (`MILESTONES`, `RETROSPECTIVE`, `v1.2-MILESTONE-AUDIT`, the three complete workstreams); re-point
   at `4/` (`REPO-STRUCTURE-AUDIT`, `art-audit`, and the seven live todos listed in §3).
8. **`docs/DETERMINISM-RERECORD-NEXT.md`'s debt is inherited but its economics invert.** The three
   engine/UI violations likely still exist in `4/`'s descendant engine, but with no fixtures there is
   no re-record cost — so the reason it was a *queue* rather than a commit disappears. Worth landing
   before a `4/` corpus is ever captured, since capture freezes whatever is there.
9. **`docs/ux-audit-v3/` should be re-run against `4/`.** It audits `3/`; its centerpiece
   recommendation (a first-voyage hint ledger) is provably unbuilt.
10. **Fix the two small defects in §5** — the `/4/about.html` 404 and the stale `README.md`.

### Reading the rule ledger against `4/`: what was actually violated

**Very little.** `4/` honors every checkable standing design rule (§5), and two of them
(`CONSISTENCY IS A CORE VALUE`, the five-layer board) were *created by* the `4/` work and written into
CLAUDE.md from it. The GSD-workflow rule (*"Do not make direct repo edits outside a GSD workflow"*,
line 561ff) was bypassed — but **by explicit instruction**, recorded in `4/RULES-V2.md:14` and
retroactively blessed by CLAUDE.md's `HOW WYATT PLAYS WHAT YOU BUILT` section. The gap is not
discipline. It is that **`4/` inherited a documentation and verification apparatus built for a
different tree, and nobody has re-pointed it.**
