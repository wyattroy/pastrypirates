# Process machinery audit — what exists, what is alive, what has rotted

**Audited 2026-08-30, on branch `claude/cloud-handoff-planning-a9ay1u` (338 commits ahead of
`origin/main`, whose last commit is 2026-08-27).** Every claim below was checked against the disk
and the git log on that date, not recalled. All paths are absolute.

**The headline in one sentence: the machinery that runs the WORK is alive and unusually
well-evidenced — ledger, sea trial, gear, CEO, the fence hooks — while the machinery that describes
the work (the rulebook, the GSD phase system, three of the status files, and several hand-typed
numbers) has forked, died, or drifted, and the two halves now contradict each other in specific,
citable places.**

---

## 1. Inventory

Verdicts: **ALIVE** (used this week, evidence it works) · **DECAYING** (exists, partially used or
already drifting) · **DEAD** (nobody uses it) · **CONTRADICTED** (says something the repo's own
record disproves).

| # | Mechanism | Purpose | Evidence of use | Verdict |
|---|---|---|---|---|
| 1 | **The rulebook** — `/Users/wyattroy/Documents/Projects/pastrypirates/.claude/CLAUDE.md` | 28 standing rules, loaded every session | Grown to 1,164 lines / 28 rules on this branch (line 80). Referenced constantly by hooks, skills, ledger entries. | **ALIVE and CONTRADICTED** — it has FORKED: `origin/main`'s copy is 990 lines / 25 rules and still carries the retired "no edits outside a GSD workflow" block. See §2-A. |
| 2 | Hook: `.claude/hooks/cto-staging-only.cjs` | While the CTO lock is held, `main` (= production) is unreachable | Registered in `.claude/settings.json` PreToolUse; measured against four spellings of a push to main, all denied (`/Users/wyattroy/Documents/Projects/pastrypirates/.claude/OFFICERS.md:44-49`). No lock currently held. | **ALIVE** |
| 3 | Hook: `.claude/hooks/qa-gear-first.cjs` | Denies the first game-code edit per session until the QA gear is stated | Registered; its own header records the 2026-08-26 incident it answers. Cited by the ledger as one of the two hooks that "hold" (`/Users/wyattroy/Documents/Projects/pastrypirates/.planning/CTO-LEDGER.md:133`). | **ALIVE** |
| 4 | Hook: `.claude/hooks/read-the-doc-first.cjs` | Denies the first touch of a subsystem until its design doc is named | 94 session-state folders under `.claude/hooks/.read-state/` — it has fired in ~94 sessions. | **ALIVE** |
| 5 | Hook: `.claude/hooks/ceo-cadence-fence.cjs` | Denies a commit once 5 game-code commits land with `.planning/CEO-REVIEWS.md` untouched | Registered; built on CEO Review 10's own recommendation after the per-item rule failed twice as prose (its header, lines 1-11). | **ALIVE** |
| 6 | Hook: `.claude/hooks/playtest-checklist-last.cjs` + `session-base.cjs` | On Stop: if THIS session changed the game, demand a playtest checklist for Wyatt | Fired wrongly on 2026-08-30 (demanded a checklist from a session that changed nothing); `session-base.cjs` was added the same day to record the session's start commit so the diff is "what did *I* change" (its header quotes Wyatt's complaint). | **ALIVE**, freshly repaired |
| 7 | Hook: `.claude/hooks/cloud-session-start.sh` | Cloud-container browser/TLS setup; no-op on the laptop | Registered SessionStart; the cloud sea trials of 08-27→08-31 depended on it. | **ALIVE** (cloud only) |
| 8 | Hook: `.claude/org/hooks/no-idle-offer.cjs` | A turn may not end on an offer ("…unless you want the tester first" killed a run) | Registered on Stop and SubagentStop; header documents the single 2026-08-30 incident. | **ALIVE**, new, one incident of evidence |
| 9 | **GSD hook suite** — 23 `gsd-*` files in `.claude/hooks/`, 13 registrations in `.claude/settings.local.json` (context-monitor, read-guard, workflow-guard, prompt-guard, graphify, phase-boundary, …) | Enforce/instrument the GSD phase workflow | They run on every session and most tool calls. But `gsd-workflow-guard.js` is default-off and `workflow_guard` is absent from `/Users/wyattroy/Documents/Projects/pastrypirates/.planning/config.json`, so the enforcement half is inert; the rest instruments a phase system ruled historical (§2-B). | **DECAYING** — cost paid every tool call, benefit tied to a dead loop |
| 10 | Skills: `.claude/skills/{ceo,cto,team}/SKILL.md` | The typed entry points `/ceo`, `/cto`, `/team` | Vendored 2026-08-30 from claude-kit (`.claude/org/VENDORED-FROM`); a duplicate hand-written `/ceo` command was created and deleted the same day (git: "org: the EA replaces the shift worker, and my duplicate /ceo is deleted"). All three appear in the live skill list. | **ALIVE**, one day old |
| 11 | **Org kit** — `.claude/org/` (bin/adapter, ceo_brief, cto_supervise, templates, MANIFEST.sha256) | Vendored copy of the cross-project officer kit | `scripts/qa/org_vendor_check.mjs` is one of the 54 gates in `npm test` (`/Users/wyattroy/Documents/Projects/pastrypirates/package.json`), so drift from the kit fails the build. | **ALIVE**, one day old |
| 12 | **Agent team** — `.claude/agents/team-*.md` + `.claude-team/` working files | Twin-lead crew: measurer, builders, tester, checker, sweeper | `.claude-team/` holds heartbeats, four PREDICTION files, findings and a 9KB PROGRESS.md from the W7/W9 run, all committed 2026-08-30. The W7 race fix and W9 publish-order work in the ledger came from this crew. | **ALIVE** |
| 13 | **GSD quick loop** — `/gsd-quick`, artifacts in `.planning/quick/` | Small-task loop with a per-item paper trail; Wyatt's 2026-08-28 ruling says every backlog item gets one | 29 folders; 13 created in the week before the ruling. **Newest is 2026-08-29** — the W7/W9 items closed 08-30/31 through the team + ledger with no quick folder. The first post-ruling item already recorded a deviation: the workflow dispatches into a git worktree, which rule 16 retired (`/Users/wyattroy/Documents/Projects/pastrypirates/.planning/CTO-LEDGER.md:135`). | **DECAYING** — ruled mandatory three days ago, already being routed around |
| 14 | **GSD phase loop** — `/gsd-execute-phase` etc.; 71 commands in `.claude/commands/`, 36 agent defs (~600KB) in `.claude/agents/gsd-*.md`, `.claude/gsd-core/` (v1.8.0, project-local) | Discuss → plan → execute milestones | `.planning/phases/` untouched since the cutover. On 2026-08-28 `/gsd-autonomous` read ROADMAP.md and proposed re-planning the already-shipped cutover (`CTO-LEDGER.md:130`). Wyatt's ruling: phases are for milestones only; none is in flight. | **DEAD for now, by ruling** (`.claude/CLAUDE.md:1022-1043`) — kept for the next milestone |
| 15 | **Sea trial** — `/Users/wyattroy/Documents/Projects/pastrypirates/scripts/sea_trial.mjs` (297 lines) + `scripts/playtest_gate.mjs` + vision judge | Rule 24: every change sails; report with build stamp and NOT-RUN column | `.planning/SEA-TRIAL.md`: FULL run 2026-08-30, 10/10 legs, 104 min, on the cloud container. Archive begun at `.planning/sea-trials/`. Three trials ran on 08-30 alone. Own honesty gates in `npm test` (trial_honesty, trial_version, trial_report_ownership). | **ALIVE** — the most exercised instrument in the repo, and the most repaired (judge blindness diagnosed and fixed 08-31, `CTO-LEDGER.md` TRIAL entries) |
| 16 | **Gear** — `scripts/qa/gear.mjs` (191 lines) | Chooses testing depth from files touched, never by feel | Called by the sea trial, by `qa-gear-first.cjs`, and documented as the entry step in `docs/QA-PROCESS.md`. | **ALIVE** |
| 17 | **CEO review** — `scripts/qa/ceo_brief.mjs`, `.claude/CEO-BRIEF.md`, `.planning/CEO-REVIEWS.md` | Fresh-context agent judges whether the ASK happened; verdict verbatim, newest-first | 37 reviews in a 1,640-line file; newest is Review 36, dated 2026-08-31 (i.e., last night). Reviews have caught real faults (Review 8's false crew-phone claim; Review 10 demanding the cadence fence) and produced one false alarm that the process itself then corrected (Review 36's "36 structural failures" — withdrawn at `CTO-LEDGER.md`, 01:25 entries). | **ALIVE** |
| 18 | **CTO supervision** — `scripts/qa/cto_supervise.mjs` (252 lines), `/cto` skill, `.planning/.cto-lock`, `scripts/qa/cto_gate_check.js` in `npm test` | A supervisor that derives worker health from the ledger; does no product work | The DONE-PENDING-CEO state exists because the supervisor and the ledger format drifted inside one session (`CTO-LEDGER.md:26-31`). No lock is currently held. Same-day churn: the 2026-08-30 commit renames the role ("the EA replaces the shift worker") while `.claude/OFFICERS.md` and the skill still describe the shift worker. | **ALIVE but churning** |
| 19 | **Ledger + backlog** — `.planning/CTO-LEDGER.md` (539 lines, 56 heartbeats) + `.planning/BACKLOG.md` (760 lines) | The live record (what happened) and the mandate (what may be worked on) | Entries through 2026-08-31T01:25Z — hours old. The ROADMAP banner, TEAM.md, OFFICERS.md and CLAUDE.md §5 all point here as the truth. Corrections are made in the open (three self-corrections in one night, each labelled). | **ALIVE** — this is the spine of the whole system |
| 20 | `.planning/CTO-QUESTIONS.md` (480 lines) | Parked questions; mechanism defaults after 10 min, taste never | Q-17 through Q-21 open; the file's own banner corrects a false claim about phone push (nothing pushes; the file is the only channel). | **ALIVE** |
| 21 | **Memory dir** — `.claude/memory/` (README + DECISIONS.md) | "Durable memory, disposable instance": Wyatt's rulings, dated, with the alternative | Created 2026-08-30; DECISIONS.md already carries the one-director plan handle and three reporting rulings from 08-30/31. All three skills instruct reading it first. | **ALIVE**, one day old — and already drifting (README says "the 27 standing rules"; there are 28 — `.claude/memory/README.md:25`) |
| 22 | **QA script fleet** — `scripts/qa/` (71 files) + ~20 checks in `scripts/` | Per-defect gates and one-shot probes | 34 of the 71 are wired into `npm test` (54 gates total, `package.json` `gates.total`); the other ~37 are one-shot measurers/probes (t01–t18, `*_measure`, `*_probe`, `*_shot`, seed_drill) kept for re-use. The wired half runs on every test; `gate_count_check.js` fails the build if the count drifts. | **ALIVE but accreting** — gates went 19 → 54 in about four days, and every per-bug gate runs forever (see §2-C) |
| 23 | `.planning/STATE.md` (617 lines) + `.planning/ROADMAP.md` (1,218 lines) | GSD's status files | ROADMAP opens with "⛔ THIS FILE IS HISTORICAL. DO NOT PLAN FROM IT" (Wyatt's 2026-08-28 ruling); STATE last touched 08-28, frontmatter still says phase 02.2 in-progress. Both still sit where GSD commands read them. | **CONTRADICTED** — explicitly non-authoritative, still present, still machine-readable |
| 24 | **Handoffs** — 20 `HANDOFF-*.md` files in `.planning/` | Cross-session context transfer | Near-daily since 08-20; newest 2026-08-30-MORNING (124 lines, honest "net game-code change: zero" headline). | **ALIVE** |
| 25 | **Health check** — `node .claude/gsd-core/bin/gsd-tools.cjs validate health` (rule 21) + `docs/PLANNING-HEALTH.md` | Structural check of `.planning/` | Last recorded run 2026-08-28 (`CTO-LEDGER.md:134`): 0 errors, 36 warnings, 33 known noise. Its own doc says to treat the verdict as "close to meaningless" (`.claude/CLAUDE.md`, §5). It validates the phase structure that was ruled historical the same day. | **DECAYING** |
| 26 | **Mentor charter import** — `/Users/wyattroy/.claude/CLAUDE.md` imports `@/Users/wyattroy/Projects/claude-kit/mentor/CHARTER.md` | Global coaching charter for every project | **That path does not exist.** The kit lives at `/Users/wyattroy/Documents/Projects/claude-kit/mentor/CHARTER.md`. The import fails silently in every session; only the separately-installed mentor plugin skill still delivers coaching. | **DEAD pointer** |

---

## 2. Contradictions and overlaps

### A. The rulebook itself has forked — and the fork is live

- The branch's `.claude/CLAUDE.md` is 1,164 lines, **28 rules**, and carries Wyatt's 2026-08-28 GSD
  ruling ("quick loop for items, real phases for milestones; ROADMAP/STATE not authoritative" —
  lines 1022–1043).
- `origin/main`'s copy is 990 lines, **25 rules**, and still carries the old auto-generated block:
  *"Do not make direct repo edits outside a GSD workflow"* — the exact sentence the ruling replaced
  because it "had been ignored all week" (`CTO-LEDGER.md:132`).
- `origin/main` is 338 commits behind and has not moved since 2026-08-27. **Any session that starts
  from `main` — including cloud sessions cloned fresh — is handed the retired rulebook.** This
  audit session itself received the stale 25-rule copy in its context while the working tree held
  the 28-rule one: the trap CLAUDE.md's own warning box describes, happening today, in the other
  direction (branch ahead of context rather than behind).

### B. GSD: ruled two-thirds dead, still fully installed and still running

The 2026-08-28 ruling keeps `/gsd-quick` and reserves phases for milestones. What remains on disk
and in motion regardless:

- 13 GSD hook registrations in `.claude/settings.local.json` fire on SessionStart, PreToolUse,
  PostToolUse, Stop, SubagentStop and PreCompact of **every** session — instrumentation for a phase
  loop nobody is in.
- 71 `/gsd-*` commands and ~600KB of GSD agent definitions in `.claude/agents/` stay discoverable;
  `/gsd-autonomous` already misfired once against the stale roadmap (`CTO-LEDGER.md:130`).
- Rule 21 still orders the GSD health check before any status answer (`.claude/CLAUDE.md:71,994`),
  which validates phase artifacts the same file declares non-authoritative 50 lines later.
- The quick loop's own ruling is being routed around in practice (inventory row 13): the mandate
  ("every item gets a quick artifact") and the practice (team + ledger, no artifact since 08-29)
  diverged within two days.

### C. Hand-typed numbers, in a repo whose own convention forbids them

Three different gate counts stand in prose right now: **19** (`.claude/CLAUDE.md:1099`), **51**
(`.claude/TEAM.md:31`, written 2026-08-30), **54** (`package.json` `gates.total`, the derived
truth). `gate_count_check.js` guards only `package.json` — the docs rot freely, and TEAM.md drifted
within days of being "verified against the repo". The same failure mode CLAUDE.md §5 names
("never hand-type a number that can be counted") — in the rulebook itself.

### D. Auto-generated blocks lying inside CLAUDE.md

`.claude/CLAUDE.md:1068` — the `GSD:skills` block — says **"No project skills found"** while
`.claude/skills/` holds ceo, cto and team. A fresh session reading the rulebook top to bottom is
told the org skills do not exist.

### E. Memory lives in at least five places, already disagreeing

1. `.claude/CLAUDE.md` (rules), 2. `.claude/memory/DECISIONS.md` (rulings), 3. the user-level
auto-memory (`~/.claude/projects/...pastrypirates/memory/MEMORY.md` — ~30 entries overlapping
CLAUDE.md: worktree retirement, screenshot rules, CEO, predict-before-measure), 4.
`docs/HARD-WON-LESSONS.md` (1,546 lines), 5. handoffs + ledger. The one-day-old memory README
already miscounts the rules (§1 row 21). Nothing reconciles these; the same lesson is maintained
by hand in two or three of them.

### F. Supervisor churn faster than its own documentation

The shift worker (`cto_supervise.mjs`, 2026-08-27) was renamed/replaced by "the EA" in a
2026-08-30 commit while `.claude/OFFICERS.md`, the `/cto` skill and CLAUDE.md still describe the
shift worker. Three days from design to rename, with the docs one generation behind.

### G. Trial reports in four places

`.planning/SEA-TRIAL.md` (authoritative per `.claude/OFFICERS.md:16`), `.planning/sea-trials/`
(archive, one file), plus `SEA-TRIAL-LOCAL.md`, `SEA-TRIAL-REBUILD.md` and
`SEA-TRIAL-w7-starboard.md` loose in `.planning/`. The `--report=` ownership rule (CLAUDE.md §3)
solved the overwrite hazard and created a scatter nobody indexes.

---

## 3. The context-load problem

What the standing rules force a fresh session to read **before its first useful action** on a
typical bug fix:

| Mandated reading | Lines | Mandate |
|---|---|---|
| `.claude/CLAUDE.md` (auto-loaded) | 1,164 | every session |
| `docs/HARD-WON-LESSONS.md` — "read ALL of it, before the first tool call" | 1,546 | `.claude/CLAUDE.md:911` and §4 |
| `.planning/CTO-LEDGER.md` + `.planning/BACKLOG.md` (the ruled source of truth for status) | 1,299 | CLAUDE.md:1040-1043 |
| One subsystem doc (e.g. `docs/QA-PROCESS.md` 406, or `docs/DRIVING-THE-GAME.md` 739) | 400–740 | rule 20, enforced by `read-the-doc-first.cjs` |
| `docs/INTENDED-BEHAVIOUR.md` before calling anything a bug | 324 | rule 28 |
| **Total before the first edit** | **~4,300–5,100 lines** | roughly 50–65k tokens — a quarter to a third of a working context window, before any game code is open |

Add the per-tool-call tax: **9 PreToolUse hook processes** (4 project + 5 GSD) plus 4 GSD
PostToolUse hooks run on essentially every tool invocation.

**How much of the mandated text is actionable rule vs war story:** the rules table in CLAUDE.md is
~55 lines; the commands, tables and gear definitions add perhaps another 150–200 actionable lines.
The remaining ~900 lines are incident narrative justifying the rules — deliberately, per the file's
own philosophy, but that puts CLAUDE.md at roughly **80% war story**. HARD-WON-LESSONS is ~95%
narrative by design. Blended across the mandated set, **at least three-quarters of what a fresh
session must ingest is justification, not instruction** — and the project's own ledger concedes the
justifications don't work as enforcement: *"in the SCRIPT it is executed, in the DOC it is
remembered"* (`CTO-LEDGER.md:133`), listing four rules that were in context and ignored, next to
two hooks that held.

The war stories earned their place one at a time; nobody has ever weighed their total. The file's
own header says it is "deliberately short so that it survives being read" — at 1,164 lines and
growing roughly a rule per day (25 → 28 between 08-27 and 08-30), that sentence is no longer true.

---

## 4. What is genuinely load-bearing

The pieces with evidence they prevent real failures — the keep-list for any reboot:

1. **The production fence** — `.claude/hooks/cto-staging-only.cjs`. Measured against four push
   spellings; stands between an autonomous worker and real players, on a repo where `main` IS
   production.
2. **The ledger + claim protocol** — `.planning/CTO-LEDGER.md`, `git pull --rebase`, claim before
   edit. The only coordination that exists across concurrent sessions, and the record that made
   every correction in §2 findable.
3. **The sea trial + gear + the NOT-RUN column** — `scripts/sea_trial.mjs`, `scripts/qa/gear.mjs`.
   Found the unchecked End-of-Voyage screen (4 of 12 legs failing) the first night its judge could
   see; its honesty conventions (build stamp, NOT-RUN, "sailed on" line) caught the
   describing-a-dead-build report.
4. **The derived gates** — `gate_count_check`, `doc_command_check`, `tree_health_check`,
   `game_url_check`, `org_vendor_check`. Each derives its answer instead of keeping a list; the
   doc-command gate caught the home-rooted path in two files the day it was fixed
   (`CTO-LEDGER.md:134`).
5. **The fresh-context CEO with a durable verdict file** — caught the false crew-phone claim
   (Review 8), forced the cadence fence into existence (Review 10), and when it produced a false
   alarm (Review 36) the same evidence discipline corrected it within hours.
6. **The speed-bump hook pattern** — `qa-gear-first`, `read-the-doc-first`, `ceo-cadence-fence`,
   `no-idle-offer`: deny once at the trigger moment, let the retry through. This is the one
   mechanism with a before/after record showing rules-as-prose failing and rules-as-hooks holding.
7. **The question UI + `.claude/memory/DECISIONS.md` + taste-never-defaults**
   (`.planning/CTO-QUESTIONS.md:11-19`) — keeps his decisions his while letting unattended runs
   continue.
8. **Two-tab play and screenshot reading** (rules 19/22) — no automation here, but the record is
   unambiguous: the seven-bug build, the eight diverging surfaces, and the sail-square race were
   all found by looking, after instrumentation missed them.

**And the shortest honest summary of the rot:** everything DEAD or CONTRADICTED above is a
*description* — the roadmap, the stale rulebook on main, the hand-typed gate counts, the skills
block, the broken charter import. Everything ALIVE either *executes* (hooks, gates, scripts) or is
*append-only evidence* (ledger, verdicts, trials). The reboot's cheapest win is to stop maintaining
descriptions that a script could derive — the project already proved that principle six times over.
