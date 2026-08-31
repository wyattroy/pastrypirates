# THE CHART — the one plan

*Wyclau's single plan file (charter part 1). The launch line worked backwards from the date, the
idea inbox, and what's blocked on Wyatt. Sessions: enter through the Door
(`.claude/skills/door/SKILL.md`), claim before editing, keep this file current — it is the source
the Glass derives from.*

**Until the cutover moment (see below), the per-bug game backlog stays in
[`BACKLOG.md`](BACKLOG.md)** — a live fix session is working from it and the ground doesn't move
under a working crew. This file owns the launch line and the reboot.

---

## THE LAUNCH LINE

Mission: the Reddit launch (overdue since ~2026-07-30; the date gets committed at the end of
step 2). Wyatt's five-item bar is step 3.

| # | Step | State |
|---|---|---|
| 1 | **The reboot** (Door, Glass, watchdog, rulebook, memory, pruning) | **IN PROGRESS** — see checklist below |
| 2 | **The foundation** (one-director rebuild, 6 steps) | **further along than the plan says — see below.** Steps 1, 2, 3 and 4 done; step 5 open; step 6 largely already enforced. **Launch date proposed here.** |
| 3 | **The launch list**: finished feel solo+crew · tutorial · analytics · code-privacy decision · SEO | not started; sized at step 2 |
| 4 | **Launch, then the till** (accounts + paid merch, +1 month) | not started |

## STEP 1 CHECKLIST — the reboot (estimate 2–3 days from 2026-08-31; re-sized end of day one)

- [x] Charter approved (2026-08-31, amendment: daily lessons)
- [x] The Chart exists (this file)
- [x] The Door exists (`.claude/skills/door/SKILL.md`)
- [x] The Glass generator exists (`scripts/wyclau/glass.mjs`) and the first Glass is published
- [x] Watchdog scripts + Razer setup guide exist (`scripts/wyclau/`)
- [ ] **The Razer hour** — watchdog registered, engine launched *(BLOCKED ON WYATT: book it)*
- [ ] 24-hour unattended engine run, zero silent stalls (the exit test — claimable only after the Razer hour)
- [ ] Rulebook cutover: `CLAUDE-next.md` replaces `.claude/CLAUDE.md`; war stories → `.claude/rules/*.md` at their triggers *(AT THE QUIET MOMENT — needs the parallel fix session closed)*
- [ ] Memory consolidation: five homes → one + pointers *(same quiet moment)*
- [ ] Pruning: kill-list generated (GSD phase machinery, dead files), archived in git, deleted; goes on the Glass for the record *(same quiet moment)*
- [ ] Gate retirement policy wired (quiet per-bug gates → archive; suite ceiling)
- [x] **Glass v2 — the two-way interface** (ideas box on the page; the page saves itself; sessions woken by his writes; harvest rule in the Door; gate `glass_roundtrip_check`, red-proofed both ways) — shipped 2026-08-31, first live save pending Wyatt's first tap
- [ ] wyclau source moves to claude-kit as the kit's first module; pastrypirates vendors it *(his pick 2026-08-31)*
- [ ] **Fold the Helm into the Glass** — one interface, not two kept in step (the engine's own flag, 2026-08-31; the Glass links the Helm meanwhile)

## BLOCKED ON WYATT

| Question | Recommendation | Since |
|---|---|---|
| **Step 5 — do the narrow half, or the whole rename?** | Narrow half: move the three drawing branches behind the Decider, leave the two questions as two. **This is the call a session got wrong once and corrected — it should be yours.** | 2026-08-31 |
| **Move the pass-and-play hand-over ahead of the turn?** | Build both behind a switch and play them — it changes feel, and feel is yours | 2026-08-31 |
| **Fix the live audio defect?** (8s of storm at full volume per ship, one deleted line) | Yes — the best ratio of player-noticeable gain to risk this week | 2026-08-31 |
| **Correct the plan document** to match what is actually built? | Yes — three of its steps describe finished work, and a session has already re-planned finished work once | 2026-08-31 |
| Book the Razer hour (~30–60 min at that machine) | Sooner is better — "never stalls" is unclaimable until the watchdog exists | 2026-08-31 |
| Name the quiet moment for the cutover (when the parallel fix session can pause for ~an hour) | Tell any session "cutover now" when your fix session is between items | 2026-08-31 |

**All six are on one tappable page:** <https://claude.ai/code/artifact/0a8acdc5-e1ca-476d-833e-5b7623e0b3fb>

## THE FOUNDATION, AS MEASURED 2026-08-31 — not as the plan describes it

*The plan (`architecture-one-director.html`) was written from a reading that predates several
convergences. Every row below was checked against the tree, not against the document.*

| step | the plan says | the tree says |
|---|---|---|
| 1 · storyboard, route one kind through it | to build | **DONE.** `present()` in `src/shared/storyboard.js`, `playStoryboard()` in `src/ui/flow.js`, `sail` converted. No player-visible change — see step 2. |
| 2 · put the route on the event, guest walks real water — *"first visible win"* | to build | **ALREADY SHIPPED.** The route rides on the event as `draw.route` and `consumeEvent` walks it on every client. There is no visible win left to claim. |
| 3 · one fact for whose turn it is | struck by measurement | **DONE**, by commit `5e9ee2b1`, before the run that checked it. `setActor` has one caller. |
| 4 · storyboard parity gate | to build, after two kinds | **DONE**, built after one kind on purpose — the plan's own reason is to guard the migration rather than certify it. Golden file, one process, no browser. |
| 5 · the Decider interface | to build | **OPEN, and honestly so.** Its machinery mostly exists as two orthogonal predicates; 13 mode reads remain and 3 decide what is *drawn*. See the question above. |
| 6 · delete old paths, layering gate strict | to build | **LARGELY ALREADY ENFORCED.** All three layering rules the plan asks for already fail the build; proven by planting each violation. |

## THE IDEA INBOX

*Drop ideas here in any words, any time, through any session ("add to the chart: …"). Each gets a
fate — SHIPPED / SCHEDULED (where) / PARKED (why) — with a recommendation, within a day.*

*(empty — nothing waiting)*

## FATES DECIDED

- **"The Glass becomes our two-way interface"** (Wyatt, 2026-08-31) → **SCHEDULED**: Glass v2
  today after the Razer hour; wyclau source homes in claude-kit now. GitHub Pages was considered
  and set aside for the private interface (public by nature, no write path without glue) —
  **reconsider at launch** as a public, player-facing status page for the game.
