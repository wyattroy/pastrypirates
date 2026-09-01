# THE CHART — the one plan

*Wyclau's single plan file (charter part 1). The launch line worked backwards from the date, the
idea inbox, and what's blocked on Wyatt. Sessions: enter through the Door
(`.claude/skills/door/SKILL.md`), claim before editing, keep this file current — it is the source
the Glass derives from.*

**Until the cutover, the per-bug game backlog stays in [`BACKLOG.md`](BACKLOG.md)** — the
Razer engine works from it. This file owns the launch line and the reboot. *(The Mac fix session
that was also working it is archived as of 2026-08-31.)*

---

## THE LAUNCH LINE

Mission: the Reddit launch (overdue since ~2026-07-30; the date gets committed at the end of
step 2). Wyatt's five-item bar is step 3.

| # | Step | State |
|---|---|---|
| 1 | **The reboot** (Door, Glass, watchdog, rulebook, memory, pruning) | **IN PROGRESS** — see checklist below |
| 2 | **The foundation** (one-director rebuild, 6 steps) | **DONE, in every step that can be.** Steps 1-5 shipped (step 5 as the narrow half, his ruling, 2026-08-31); step 6 largely already enforced by existing gates. **Launch date proposed here.** |
| 3 | **The launch list**: finished feel solo+crew · tutorial · analytics · code-privacy decision · SEO | not started; sized at step 2 |
| 4 | **Launch, then the till** (accounts + paid merch, +1 month) | not started |

## STEP 1 CHECKLIST — the reboot (estimate 2–3 days from 2026-08-31; re-sized end of day one)

*Open items carrying `GATED:` are not currently actionable — say why right after the marker. This
is the literal string the keep-working Stop hook parses (`.claude/hooks/wyclau-stop-keep-working.cjs`)
to tell "nothing left to do" from "something left, but it waits on Wyatt/a dependency" — keep it
exact, or the hook is wrong in whichever direction this list is wrong.*

- [x] Charter approved (2026-08-31, amendment: daily lessons)
- [x] The Chart exists (this file)
- [x] The Door exists (`.claude/skills/door/SKILL.md`)
- [x] The Glass generator exists (`scripts/wyclau/glass.mjs`) and the first Glass is published
- [x] Watchdog scripts + Razer setup guide exist (`scripts/wyclau/`)
- [x] **The Razer hour** — watchdog registered, engine launched, stall test passed through the scheduled task (2026-08-31 16:19Z)
- [x] **Root-cause the sea trial's crash — FOUND AND FIXED, 2026-09-01 01:15Z.** Widened the harness's own console-error capture (200→2000 chars, commit `27a9f382`) to get the full stack trace, then ran a targeted single-leg repro (`--max-min=2`, fails fast instead of waiting the full 35 min): `pn(e.p)` → `pname()` → `NAMES[i].replace(...)` crashed at `narrateCurrentBody` on a `"turn"` event whose `.p` was `undefined`. Traced to `src/ui/flow.js`: commit `b3c7b12c` ("rename the player `p` to `player`... function by function") mechanically renamed the LOCAL VARIABLE `p`→`player` and swept the EVENT SCHEMA FIELD NAME along with it, **nine times** — `g.ev({t:"turn",p:p.idx})` became `g.ev({t:"turn",player:player.idx})`, for `purse`, `dock`, `openoffer` (×2), `sail` (×3), `turn` (×2). The engine's own emission of the same five event types (`src/engine/index.js`, never touched by that rename) still correctly used `p:`; `narrationSubjects()` reads `.p` unconditionally for every event type, so this broke narration/camera-tracking for the whole live turn loop, not just the crash. **Fixed all 9 sites** (`p:player.idx`, keeping the renamed local variable). New gate `scripts/qa/event_actor_field_check.mjs` derives the canonical actor-carrying event types from the engine's own emissions (never a hand-typed list — exactly the kind of list that drifted silently here) and checks every UI-layer emission matches; red-proofed against the pre-fix code (8 of 9 sites caught structurally). npm test 75/75. **Verified by re-running the exact repro that first reproduced the crash**: the voyage now progresses past Day 1 into Day 2/3 with real, varied gameplay (sail squares, calls, trades, offers) and zero console errors — the only "FAIL" is a benign 2-minute timeout from the deliberately short diagnostic cap. Full sea trial now running to get a complete, real verdict before recommending staging.
- [x] **THE SEA TRIAL CANNOT FINISH WHILE THE VISION JUDGE IS BROKEN — FOUND AND FIXED 2026-09-01, both halves.** *(1)* `scripts/lib/judge_mode.mjs` — when step 1b has just proven the judge blind, the fleet is handed `--judge=queue` instead of `--judge=on`: the screens are still captured and still judgeable later, so nothing visual is forfeited, only deferred. UNKNOWN is deliberately not treated as SHUT, or a broken *check* would silently stop judging everywhere. *(2)* a circuit breaker in `judgeAll` for a judge that dies mid-run, which (1) cannot catch: once no screen has produced a usable verdict and a whole group has failed both batched and one-by-one, it is declared dead rather than paying a timeout on every remaining screen. Gate `scripts/qa/judge_shut_defers_check.mjs`, 10 checks, RED first, red-proofed both ways through an injected seam. npm test 76/76. **⚠ MY ORIGINAL FILING BELOW WAS WRONG ON THE MECHANISM and is kept, corrected, rather than edited away:** I said there was "no timeout behind it". There is — 120s per screen, 300s per batch, both firing correctly. The real fault is that **a timeout does not resolve to FATAL**, so the designed rescue fires when the judge is ABSENT and is missed when it is merely BROKEN. The original filing: The 01:10Z run hung for 80 of its 111 minutes: all seven Chromium legs finished their voyages by 01:42:45Z and then stalled inside the judge, with zero leg results recorded. The trial's own step 1b had already printed *"can the judge open a screenshot? FAIL — the eyes are SHUT"* — in this run and the one before it — and then launched ten legs that would each hang in that same judge. The designed fallback (`JUDGE_MODE=queue`, *"THE JUDGE IS DEAD, NOT THE SCREENS. Defer rather than forfeit"*) is only reached when `judgeAll` RETURNS a fatal; it hangs instead, and there is no timeout behind it. **Two things to fix, neither done yet:** the judge needs a timeout so its fallback can actually fire, and step 1b's verdict must be ACTED on rather than merely printed — a check that warns and is then ignored is not a gate. *(Corrected in the open: I first told Wyatt the final legs were "actively writing screenshots this minute". They were not — I had read Chrome cache-file timestamps as leg progress. The newest real screenshot was 80 minutes old.)*
- [x] **Sail the three Safari legs, which had never once run on this machine — SAILING, 2026-09-01 04:50Z.**
  Two faults, both Windows-only, both invisible anywhere else. (1) The WebKit browser was never
  installed here — a documented setup step nobody had run. (2) `openWebKit()` handed a RAW
  Windows path to `import()`, which ESM reads as the protocol `c:` and rejects, so it reported
  "playwright not found" while playwright was installed and importable; `playwrightDir()` next
  door had always wrapped paths in `pathToFileURL`, so this was the drift `wk.mjs`'s own comment
  predicted. Now one resolver. **Verified by sailing: 44 and 30 screenshots off the WebKit legs,
  where every previous trial recorded a failure.** Safari is a stated core requirement, so this
  closes a hole in the merge evidence rather than adding polish.
  ⚠ The cached failure records had to be deleted first or `readDone()` would have replayed them —
  it resumes any leg with a record at the current stamp and never checks whether it succeeded.

- [ ] **Re-sail `crew-desktop`, the one leg with no clean result — two separate faults found in it.**
  *(a)* It hung the 03:07Z trial: it overran its own 35-minute cap by 17 minutes having produced
  no screenshot, because the cap was a loop condition (`while (Date.now() - t0 < MAX_MS)`) and a
  loop condition is only consulted BETWEEN iterations — one await that never resolves runs past it
  forever. Fixed with a real deadline (`withDeadline`, a race), gate `leg_deadline_check.mjs`
  driving it against a promise that genuinely never settles.
  *(b)* Its retry then died with `EBUSY: resource busy or locked` deleting its browser profile,
  because a browser from the killed run still held the directory and Windows will not unlink an
  open file. Fixed: a profile is scratch, so if it cannot be cleared the mount uses a sibling path
  (`freshProfileDir`, shared by both mounts).
  **Both fixes are in; the leg simply needs re-running** once the Safari batch is home — delete
  `sea-trial-shots/legs/crew-desktop--2026.08.31.2.json` first, for the resume reason above.
- [ ] Full sea trial, re-run against the fixed 465-commit branch, build `2026.08.31.2` — **RUNNING and VERIFIED HEALTHY at 03:35Z**: `node scripts/qa/trial_health.mjs` → *PROGRESSING*, 5/10 legs, newest screenshot seconds old, crew-phone driving. **Check it with that command rather than by eye** — it was built tonight precisely because a wedged trial looks identical to a working one from the process table, and it is red-proofed against tonight's actual 80-minute hang. Running as `.planning/SEA-TRIAL-465-check-3.md` with `--judge=off`, the path that can actually reach a gameplay verdict. This run is also the first live exercise of the chain audit's long-run marker: it wrote `.planning/wyclau/LONG-RUN` at `4/10 legs` with `staleAfterMinutes: 53` **derived from its own 35-minute leg cap**, and `should_launch.mjs` read it and held off — the case that previously required a timer pulsing HEARTBEAT on the trial's behalf. *(Earlier attempts, for the record:)* **first attempt at 01:16Z FAILED FAST and TAUGHT SOMETHING REAL**: the trial's own resume-cache is keyed by build stamp, and since I hadn't bumped it, it silently replayed the STALE PRE-FIX crash data instead of re-testing, then crashed its own reporting code (`P.coverage.entries is not a function`) trying to summarize the differently-shaped cached data. Bumped the stamp (`node scripts/bump-build.mjs`, `2026.08.31.1`→`.2`, commit `a4785183`) so the next run is genuine, not cached. Re-launching now. NOT GATED on purpose.
- [ ] 24-hour unattended engine run, zero silent stalls — GATED: passive, monitor only; nothing to DO but watch the clock since the Razer hour (16:19Z)
- [ ] Rulebook cutover: `CLAUDE-next.md` replaces `.claude/CLAUDE.md`; war stories → `.claude/rules/*.md` at their triggers — GATED: at the quiet moment, needs the parallel fix session closed
- [ ] Memory consolidation: five homes → one + pointers — GATED: same quiet moment
- [ ] Pruning: kill-list generated (GSD phase machinery, dead files), archived in git, deleted; goes on the Glass for the record — GATED: same quiet moment
- [x] Gate retirement policy wired (quiet per-bug gates → archive; suite ceiling) — SHIPPED 2026-08-31 19:52Z. `gates.ceiling` in `package.json` (started at the exact current total, 71, so the next gate is the first conscious decision) + `scripts/qa/gate_ceiling_check.mjs`, red-proofed by planting `total=72` on the real file and watching it fail before restoring it. `scripts/qa/quiet_gate_report.mjs` (advisory, NOT in `npm test` — retirement stays a human call, per `docs/HARD-WON-LESSONS.md` §12i) lists real wired-in per-bug gates only, after a scoping bug caught before shipping: it first matched every `w##_/q##_` FILE in `scripts/qa/`, including one-off probes never wired into the suite at all. `scripts/qa/gate_archive/` exists for retirements. Full policy: `docs/GATE-RETIREMENT.md`. npm test 71/71.
- [x] **Glass v2 — the two-way interface** (ideas box on the page; the page saves itself; sessions woken by his writes; harvest rule in the Door; gate `glass_roundtrip_check`, red-proofed both ways) — shipped 2026-08-31, first live save pending Wyatt's first tap
- [x] **Full sea trial against the 465-commit branch — RAN, FAILED 2026-08-31 23:56Z.** Started 21:31:53Z, 144 min, `.planning/SEA-TRIAL-465-check.md`. **7 of 10 legs FAILED with the identical crash** (every Chromium leg — solo, pass-and-play, crew, desktop/phone/tablet): `TypeError: Cannot read properties of undefined (reading 'replace') at pname (src/ui/util.js:289:27) at pn (...)`. `pname(i)` does `NAMES[i].replace(...)`; `pn()` wraps it and is called all over event narration as `pn(e.p)`/`pn(order[i])` with an event-participant or turn-order index. Traced the likely site: `showTurnOrderIntro()` (`src/ui/flow.js:2965`) succeeded (its own screen rendered, screenshot-confirmed) — the crash lands in the FIRST post-turn-order event narration, most likely the dock heads/tails line (`src/ui/util.js:499`, `pn(e.p)`), which crashes uniformly across every mode right at the start of day 1. Checked the graveyard (rule 10): the recent `p`→`player` local-variable rename (`b3c7b12c`) is function-scoped by design and does not touch the engine's event emission (`this.ev({t:"dock",p:p.idx,...})` at `src/engine/index.js:996` is unchanged) — RULED OUT as the cause, not confirmed as it. 3 WebKit legs (`-wk`) additionally NOT RUN — Playwright isn't installed on this machine (`~/.pw` missing), a Razer setup gap, not a code defect. **NOT MEASURED YET**: the exact line producing the undefined index — the crash trace was truncated by the test harness's own 200-char console-capture limit, found and widened to 2000 chars (`scripts/lib/cdp.mjs`, commit `27a9f382`) so the next run will show it directly; a quick single-leg repro to get that trace timed out after 10 min without completing and was not re-attempted this session. **NOT DEPLOYED TO STAGING** — a build that cannot finish a single voyage is not ready to show him.
- [x] **wyclau source moves to claude-kit as the kit's second module; pastrypirates vendors it — SHIPPED 2026-08-31.** *(his pick 2026-08-31)* `claude-kit/plugins/wyclau/` now holds the canonical edit source (glass.mjs, mark_glass_published.mjs, watchdog.ps1/.sh, wyclau-pulse.cjs, wyclau-stop-keep-working.cjs, Door SKILL.md); `install.sh` generalized to multi-module (`vendor/check <repo> [module]`, default `org`), the `org` case unchanged. pastrypirates' `.claude/wyclau/` is a pure tracking anchor (VENDORED-FROM + MANIFEST.sha256, 7 files hashed) — the real files stay exactly where they already worked (`scripts/wyclau/*`, `.claude/hooks/wyclau-*.cjs`, `.claude/skills/door/SKILL.md`), nothing moved or renamed. Verified byte-identical to pastrypirates' current source before vendoring. **CEO Review 55: YES**, independently verified all seven points (full text in `CEO-REVIEWS.md`); its one actionable flag (no local marker showing a file is vendored) fixed same-pass — a header comment added to all seven files, both repos, re-vendored. `bash install.sh check <this repo> wyclau` reports IN STEP against claude-kit `e61b4fe`. npm test 74/74.
- [x] Mechanically enforce the Glass harvest rule — `.claude/hooks/glass-harvest-first.cjs` + gate `glass_harvest_hook_check` (red first on the unregistered-hook case, red-proofed both ways), 2026-08-31
- [x] **THE KEEP-WORKING STOP HOOK — SHIPPED 2026-08-31.** Wyatt: *"why have you stopped working? your mission is to continuously work until every single task is finished... we already know that behavioral fixes get ignored."* `.claude/hooks/wyclau-stop-keep-working.cjs`, registered in `settings.json`'s `Stop` array. First shipped **firing in every session, interactive included** (his live correction that day, overriding his own first answer "only unattended"); **superseded the same day by the Quartermaster's scope change**: fires ONLY in a session `scripts/wyclau/watchdog.ps1` started, gated on an environment stamp (`$env:PP_BOSUN = "1"`, set immediately before `Start-Process`, inherited by the child) rather than an inference — never in Wyatt's terminal, never in a cloud session. **The preemption slot (`PREEMPT.md`) was removed in the same change** — it existed to protect Wyatt's interactive window, which no longer runs this hook at all; steering now goes through the Chart's `BLOCKED ON WYATT` table as normal. Three brakes remain, in order: (0) `stop_hook_active` never blocks twice in one turn; (1) the Glass publish lag (moved here from `npm test`, CEO Review 52); (2) gives up on the 4th check of the same stuck item with no commit landing in between, having blocked on 1/2/3 (an off-by-one CEO Review 52 also found and fixed — the first version gave up after only 2 blocks); (3) allows the stop once every open `STEP 1 CHECKLIST` line is either done or carries the literal marker `GATED:` — including indented lines, another CEO Review 52 finding (the original regex only matched column zero). The Door's 6th situation-report line, "watchdog stamp: PRESENT/ABSENT", is the Quartermaster's silent-failure guard for `Start-Process`'s env inheritance, which could not be tested from a container. Gate `scripts/qa/wyclau_stop_hook_check.mjs`, 16 cases against the real hook file (never a copy — HARD-WON-LESSONS §12i), red-proofed in both directions per the Quartermaster's instruction: `PP_BOSUN` unset with real unblocked work present still allows the stop; a planted broken gate blocks when it should not. npm test 72/72.
- [x] **GLASS REDESIGN — Wyatt's seven priorities, in his words** — SHIPPED 2026-08-31 18:37Z, rendered and screenshotted locally (light + dark) before publishing, one real mojibake bug found and fixed by looking at the picture. Full detail in `scripts/wyclau/glass.mjs`'s own header.
  - **[x] LAST PROGRESS VS PAGE PUBLISHED — SHIPPED 2026-08-31 20:04Z.** His measured finding: the dot read 🔴 54 min ago while a commit had landed 12 minutes earlier, because the old code drove the dot from `state.generatedAt` (page age) not real evidence. Two numbers now shown and computed separately: "last progress" (the newer of HEARTBEAT/LAST-ACTIVITY, read BEFORE this run's own write, so running glass.mjs is never mistaken for progress) and "page published" (`generatedAt`). **Traced and stated honestly, not oversold**: since the page is static once published, neither number can retroactively reflect work that happens AFTER the last generation — the exact reported false alarm is closed only by the third part, republishing being made mechanical. Red-proofed: ran genuinely red before the first publish+mark, genuinely green after.
    - **⚠ CORRECTION, CEO Review 52, SAME DAY, IN THE OPEN.** The line above originally said the publish-lag check lived in `scripts/qa/glass_publish_lag_check.mjs`, wired into `npm test`. CEO Review 52 found that real and correct — AND a genuine defect: it made the game's own release gate (`npm test`, required green before staging/merge per CLAUDE.md §6) dependent on whether the wyclau DASHBOARD had been republished recently. A stale Glass could have blocked a real game fix from reaching players. **Moved the same day**: the check now lives as a brake inside `.claude/hooks/wyclau-stop-keep-working.cjs` (fires on session Stop, never on `npm test`); the standalone gate script was deleted; `gates.total`/`ceiling` correctly dropped 72→71 with the removal, then rose 71→72 again for the Stop-hook's own gate (`scripts/qa/wyclau_stop_hook_check.mjs`, 14 cases, red-proofed both by planting a broken hook and by fabricating an unregistered `settings.json`). Also corrected the same review caught: `glass.mjs`'s own comment had overclaimed that an "administrative re-run… now correctly shows an older last progress" as settled behaviour — measured instead, `.claude/hooks/wyclau-pulse.cjs` stamps LAST-ACTIVITY on every tool call rate-limited to one minute, so during active work the two numbers are typically within about a minute of each other; the comment now says so.
  1. Save space -- remove "Pastry Pirates -- the engine's one honest window. Branch claude/cloud-handoff-planning-a9ay1u."
  2. "I want to see that the work is being done, right at the top, at a glance. A small emoji + a timestamp since last progress is perfect -- remove the entire 'Alive' box."
  3. Rename "Write to Claude" to **Ideas** and put it below Your Call.
  4. Reformat Shipped Today: **remove the commit codes -- they mean nothing to me** -- make them more visual and clearer to read, ideally 5-7 words each. His two examples of what is inscrutable: "`f3d3ee9b` ledger: the harvest hazard fired for real (safely) -- evidence, not prediction" and "`3934d9d4` ledger: retract the Glass v2 claim -- the Mac boardroom session claimed first, and holds it". Put below Your Call. *(Note for whoever builds it: a generator cannot summarise a bad subject line into a good one. The durable half is a commit convention -- sessions write a subject he can read -- with the generator stripping prefixes, hashes and everything after the dash. Say which half you did.)*
  5. Put **Your Call in its own box** (above Shipped Today), and **show him a few test calls** so he can check the format is intuitive.
  6. **Merge "On the Chart" with "The Reboot Checklist" -- one source of tasks**, reprioritised as needed, which the Blade Pirates process is always working. *(This item lives in the merged list once it exists.)*
  7. Reformat everything to look **more like a dashboard**, easily scannable, and **matching the colours of the game**.

- [x] **ONE PUBLISHER for the Glass** — SHIPPED 2026-08-31. `.planning/wyclau/GLASS-NOTE.md`, tracked: another session writes there and commits instead of publishing; the Bosun folds it into the page and resets the file on its next pulse. Gate `glass_note_relay_check.mjs`, red-proofed (the pre-fix code cannot even run the check — the mechanism did not exist to test). Screenshotted before shipping.
- [x] **Fold the Helm into the Glass** — decision cards live INSIDE the Glass, derived from this file's own tables; the Helm URL serves a retirement notice (2026-08-31, his instruction)

## BLOCKED ON WYATT

| Question | Recommendation | since |
|---|---|---|

## RULED — his answers, and what each one unblocks

**Harvested 2026-08-31 from the Helm's state block, over an hour after he made them.** Full
record with the failure it exposes: [`.claude/memory/DECISIONS.md`](../.claude/memory/DECISIONS.md).

| item | HIS RULING | now |
|---|---|---|
| The Glass's Ideas box corrupting the page after a save | **Reported four times** | **ROOT-CAUSED AND FIXED 2026-09-01.** The page's own escaper was a no-op, so every save wrote a live closing script tag into the document and broke it. Found by clicking Send in a real browser and rendering what the page saved. Gate `glass_self_publish_check.mjs`, red first. Awaiting his look on the live page. |
| Merge the 465-commit branch to `main` via the normal release loop | **"Do it" / "re merge: do it, a"** — ruled on the Glass 2026-08-31 23:39:57Z, confirmed live in chat the same message, choosing option (a) (run the trial now with active foreground monitoring) | **IN PROGRESS.** Sea trial ran 2026-08-31 21:31Z-23:56Z, **FAILED** — 7/7 Chromium legs crashed identically in `pname()` (`src/ui/util.js:289`), not yet root-caused; 3 WebKit legs did not run (Playwright not installed on this machine). NOT deployed to staging, NOT merged — a build that cannot finish a voyage is not ready to show him. Root-cause investigation is a real, open CHART checklist item. |
| Live audio defect (8s full-volume storm per ship) | **"Yes — delete the line"** | **CLOSED, NOT BUILT — the ruling was on a stale premise.** Measured 2026-08-31 18:12Z: `soundForEvent({t:"anchorHold"})` returns `{name:"fishing",bus:"master"}`, `EVENT_SOUND` declares `anchorHold` exactly once (`src/ui/audio.js:105`), and `node scripts/audio_mapping_test.js` PASSes all three of DEFECT-1/2's own regression guards. The fix shipped at the cutover, commit `fb74eedc`, before today — `docs/AUDIO.md`'s own correction box says so and names this exact trap. There is no line to delete. Same shape as the sea-trial-PR correction the same day: a question was put to him from a stale reading. |
| Pass-and-play hand-over ahead of the turn | **"Just move it"** — no A/B switch, make the change | **ALREADY SHIPPED before the ruling was harvested.** Commit `ae75fe63` ("the device changes hands before the screen changes captain"), 2026-08-31 12:51Z — over four hours before his 17:08Z ruling reached anyone. `humanTurn()`'s own comment quotes him: *"Move it, I trust the plan."* All three pass-and-play hand-over sites (turn, secret draft, bake) gate before the screen switches captain; `node scripts/qa/handover_before_turn_check.mjs` PASSes, including its red-proof of the backwards order. Nothing to build. |
| One-director step 5 (Decider scope) | **"Narrow half"** — three drawing branches behind the Decider; the two questions stay two | **ALREADY SHIPPED before the ruling was harvested.** Commit `44dc853e` ("step 5, the narrow half: the secrecy rules move to one pure place"), 2026-08-31 12:54Z — over four hours before the 17:09Z ruling. `mayRevealRecipe`/`offersRecipeCheck`/`showsThinkingIndicator` in `src/shared/visibility.js` are the one pure rule; `board.js`/`stage.js` supply facts (`sharedDevice: appState.passAndPlay`) rather than branching. `decisionIsLocal` still the sole other predicate, unmerged, per the ruling. Both `scripts/qa/decider_table_check.mjs` and `scripts/qa/visibility_rules_shared_check.mjs` PASS, red-proofed. Nothing to build. |
| The plan document vs the measured tree | **"Yes — make the measured table the plan of record"** | **DONE 2026-08-31 18:35Z.** The only one of the four genuinely unbuilt when picked up. Republished [One Engine, One Director](https://claude.ai/code/artifact/715b29fe-fe33-4038-9e61-a20ef6676570) §07: each of the six migration steps now carries its real status inline (four SHIPPED, one dead-premise-closed, one largely-enforced) instead of reading as a plain to-build list; the footer's "nothing has been built" claim corrected to match. Nothing else on the page touched. |
| The cutover moment | **"After the exit test verdict"** — the 24-hour no-silent-stall run finishes first | SCHEDULED, gated on the exit test |
| The Razer hour | done 2026-08-31, 16:19Z | closed |

## THE FOUNDATION, AS MEASURED 2026-08-31 — not as the plan describes it

*The plan (`architecture-one-director.html`) was written from a reading that predates several
convergences. Every row below was checked against the tree, not against the document.*

| step | the plan says | the tree says |
|---|---|---|
| 1 · storyboard, route one kind through it | to build | **DONE.** `present()` in `src/shared/storyboard.js`, `playStoryboard()` in `src/ui/flow.js`, `sail` converted. No player-visible change — see step 2. |
| 2 · put the route on the event, guest walks real water — *"first visible win"* | to build | **ALREADY SHIPPED.** The route rides on the event as `draw.route` and `consumeEvent` walks it on every client. There is no visible win left to claim. |
| 3 · one fact for whose turn it is | struck by measurement | **DONE**, by commit `5e9ee2b1`, before the run that checked it. `setActor` has one caller. |
| 4 · storyboard parity gate | to build, after two kinds | **DONE**, built after one kind on purpose — the plan's own reason is to guard the migration rather than certify it. Golden file, one process, no browser. |
| 5 · the Decider interface | to build | **DONE, the narrow half — shipped 12:54Z, ruled 17:09Z.** Two orthogonal predicates stay two, per his ruling. The three mode reads that decided what is *drawn* moved to one pure rule module, `src/shared/visibility.js`; the drawing code only supplies facts. |
| 6 · delete old paths, layering gate strict | to build | **LARGELY ALREADY ENFORCED.** All three layering rules the plan asks for already fail the build; proven by planting each violation. |

## THE IDEA INBOX

*Drop ideas here in any words, any time, through any session ("add to the chart: …"). Each gets a
fate — SHIPPED / SCHEDULED (where) / PARKED (why) — with a recommendation, within a day.*

- **Wyatt, LIVE BUG REPORT, 2026-08-31 21:00Z, two screenshots**: *"after I send something to you in the ideas box, the page css breaks; and i'm not sure if the idea was sent. i need to be able to send another idea immediately afterwards, without waiting. i need to know that my first idea was sent, and added to the chart."* → **ALL THREE NOW FIXED — THE CORRUPTION WAS ROOT-CAUSED 2026-09-01 03:50Z, AFTER THREE WRONG ATTEMPTS. Awaiting only his own look at the live page.** *(This line said "THE THIRD — THE ACTUAL CORRUPTION — IS UNEXPLAINED" for two days, and that was true when written. The escaper the page uses to save itself was a no-op — authored inside a template literal, its backslashes halved on the way out, so it replaced `<` with `<` — and every self-publish therefore wrote a live closing script tag into the document, ending the real script early and turning the rest of the page into stray markup. Found by clicking Send in a real browser and rendering what came back. Gate `glass_self_publish_check.mjs`, red first.)*
  - **✅ Fixed, verified**: "send another immediately, without waiting" and "know it was sent" — the Send button's success handler was an empty comment (relied entirely on the platform's own view reload, never re-enabled, never confirmed). Now updates local state, clears the box, repaints the visible list, shows an honest confirmation ("Saved to the page — a session will harvest it to the Chart soon." — not overclaiming it's already in the Chart), and re-enables immediately. Same fix applied to the rulings-save flow for consistency (rule 8). Gate `scripts/qa/glass_send_confirms_check.mjs`, red-proofed against the exact pre-fix empty handler.
  - **⚠ CORRECTION, CEO Review 54, IN THE OPEN — the page-corruption fix is NOT proven.** The original entry here said "root cause measured": a comment reading `// The state block is a JSON <script>, so...` — a literal, unescaped, tag-shaped substring inside the real client script element. **That claim was wrong, and the review caught it properly**: it regenerated the exact pre-fix page and rendered it in a real, unmodified headless Chrome — it came up completely clean, no corruption. Per the HTML5 spec, a bare `<script>` (no slash) inside running script content is not special; only `</script` ends it. A follow-up check here (4 rounds of the real client-side self-publish escaping, simulated in Node) also never drifted. **So the actual mechanism that broke Wyatt's live page is still unknown** — most plausibly something specific to the Claude Artifact host's own internal rendering/patching pipeline when `cap.publish()` runs live, which cannot be reproduced or inspected from outside that system. The comment was still reworded (bad practice regardless, and the gate `scripts/qa/glass_script_tag_purity_check.mjs` was kept and WIDENED to check the whole document, not just two known blocks — a real improvement CEO Review 54 also asked for) — but it must not be called a proven fix for his exact symptom. **Needs Wyatt to try the Ideas box again on the live page and say whether the corruption still happens** — parked here rather than asked via the question UI, per his standing instruction. npm test 74/74.
  - **2026-08-31, ATTEMPT 2 — also reported still broken.** Redesigned to blank the body to a few plain words BEFORE calling `cap.publish()`, reloading once the publish promise settled either way. Wyatt: *"the glass ideas section is still broken."* Gate `glass_self_heal_reload_check.mjs` verified the mechanism was actually shipped; it did not verify the mechanism actually fixes his symptom, which remained unmeasurable from outside the live host.
  - **2026-09-01, ATTEMPT 3 — removed `location.reload()` from the flow entirely, not yet confirmed.** Two different reload timings (1400ms after publish; immediately before, blanked) both still corrupted, per his own reports — evidence the reload itself is implicated, not its timing. Send/ruling handlers now mutate `state` in memory, repaint synchronously via the existing `renderIdeas`/`paintAsk`, and call `cap.publish()` in the background with no navigation at all. This also directly answers his original ask ("send another idea immediately, without waiting") better than either reload-based version did. Gate `glass_optimistic_save_check.mjs` (replacing `glass_self_heal_reload_check.mjs`) verifies no `location.reload()` remains in the send/ruling paths and that both update state before publishing. **Still not proof the corruption is gone — same limitation as attempts 1 and 2: it cannot be reproduced outside the live authenticated host.** Needs Wyatt to try the Ideas box again and say whether it still happens.
- **Wyatt, written on the Glass, 2026-08-31 20:40:18Z**: *"Edits for The Glass: 1. Move 'Tasks' to
  go above 'Shipped Today' 2. Make Shipped Today expandable, with each thing shipped in its own
  pill, clickable to see more information about that commit 3. reformat the pages so Shipped Today
  is in the left column, and Your Rulings is on the right column. On mobile, one column with
  Shipped Today is on top."* → **SCHEDULED, next Glass-focused session.** All three are real,
  concrete UI work (reorder a section, make list items expandable with per-commit detail, a
  responsive two-column layout) — not urgent, not blocking any Chart item, and needs the same
  render-and-screenshot discipline (rule 19) the redesign itself used. Recommend building all three
  together rather than piecemeal, since (2) and (3) both touch the Shipped Today card's markup.
  → **ALL THREE SHIPPED 2026-09-01 04:15Z**, built together as recommended. (1) Tasks now sits above
  Shipped Today. (2) Each commit is its own pill, closed by default, opening to that commit's real
  reasoning — its body, with the `Co-Authored-By`/session trailers stripped by SHAPE so a renamed
  trailer cannot leak back in; the hash and relative time sit at the foot. (3) Two columns at
  ≥46rem, Shipped left and Rulings right, one column below that with Shipped on top — source order
  already puts Shipped first, so the phone case is the grid simply not applying, with no second
  ordering rule to keep in step. The sheet widens to 62rem only where the grid applies (at 40rem the
  columns came out 311px and the rulings table wrapped every other word). Rendered and screenshotted
  at 1100px and 375px, zero horizontal overflow at either. **Three real defects were found by
  looking at the picture rather than the numbers**: raw `~~` markdown reaching the page (the Chart's
  markers were stripped in three ad-hoc places and `~~` was missed in all of them — now one
  `unmark()`); an answered question still rendering as an open "Your call" because its row had been
  edited in place instead of moved to RULED; and the Tasks card counting harvested ideas as open
  work — it read only each bullet's FIRST line, while an idea's fate is written in the lines
  underneath, so "12 open" was really 6.
- **CEO Review 51's small finding**: `quiet_gate_report.mjs`'s naming convention (`^[wq]\d+_`)
  misses `a1_bake_now_check.mjs` / `a2_bot_bake_watch_check.mjs` — two real per-item gates that are
  neither structural nor currently reportable as retirement candidates. → **PARKED, low priority**:
  widen the regex to also match `a\d+_` whenever someone is next in `quiet_gate_report.mjs` for
  another reason; not worth a standalone session, since the report already covers every gate that
  matches its stated convention and found zero candidates either way today.

- **Wyatt, written on the Glass AND said live, 2026-09-01 02:13:52Z**: *"Make Glass truly mobile
  friendly— it is too wide for phone because not all its divs are constrained, so the 'your ruling'
  section forces the whole page to be too wide. Also, I like the headline on 'progress' under the
  status emoji, but make it a headline, a sentence or two, not a paragraph. Lastly, I can see the
  bosun working right now, but the status shows red. You have to fix the way you report status so
  that it's only red if the bosun is truly not working or running any subprocesses. Page is still
  broken after submitting an idea, same error as before."* → **THREE SHIPPED AS CODE, ONE
  UNCONFIRMED (the corruption — his to verify).** *(Framing corrected TWICE in the open: the first
  version said "shipped, three of four", counting a process promise as a working fix — CEO Review 56
  was right to call that out. The third item was then genuinely fixed with a mechanism later the
  same day, so the count is honest now for a different reason than it was first claimed.)*
  - **Mobile width**: root cause was `table{width:100%}` under the default `table-layout:auto` —
    a minimum, not a ceiling; a long unbroken token in a ruling's cell (a path, a command) stretched
    the whole page past the viewport. Fixed with `table-layout:fixed` plus `overflow-wrap:anywhere`
    on the table cells and on `.sheet` itself, so a future long string in any card can't reopen this.
  - **Headline, not a paragraph**: added `shortNote()` in `glass.mjs`, capping the displayed pulse
    note to its first sentence or two (~200 chars) regardless of how long a session's `--note` is.
  - **False red while actually working — NOT FIXED IN CODE, and it should not be filed as done.**
    CEO Review 56: *"Wyatt asked to fix the way you report status, and what shipped is a habit, not
    a mechanism."* What follows is the honest reason, not a defence: the dot is correct given what
    it can see — it counts
    minutes since the LAST PUBLISH, and this session had been pulsing HEARTBEAT locally every 15
    minutes (via a background Monitor) without republishing the artifact at the same cadence, so
    the live page's clock was ticking from a stale snapshot even though the worker was genuinely
    alive. This is not fixable from inside the static page — there's no live channel for it to poll.
    Fixed by republishing NOW, and going forward this session will republish on every Monitor
    heartbeat (~15 min) during long waits, not only at item boundaries, keeping the published
    snapshot comfortably inside the 45-minute/watchdog-tied threshold. The 45-minute threshold
    itself is unchanged — it's tied to the watchdog's own restart contract (see the page's own meta
    line), so loosening it would misrepresent that, not fix this.
    **✅ NOW FIXED WITH A MECHANISM — 2026-09-01 03:45Z.** The chain audit's fix 1 supplied the
    missing signal (`LONG-RUN`, written by the job itself), and the Glass now reads it: the live
    page shows **"⚙️ sea trial, 10 legs — 5/10 legs, still running"** instead of a red dot, because
    the job says what it is doing rather than the page guessing from a clock. Rendered and
    screenshotted at 375px before shipping (rule 19). **It cannot become a new lie:** a missing,
    malformed, future-dated or expired marker falls back to the ordinary clock, so nothing can hold
    the light green — that would be the 2026-08-31 timer heartbeat rebuilt on the page. Gate
    `scripts/qa/glass_longrun_status_check.mjs`, 6 checks, red first, including both
    cannot-hold-it-green cases. npm test 77/77.
  - **Idea-submit corruption — attempt 3, see the entry above.** Same underlying bug as the
    2026-08-31 report; folded into that entry rather than duplicated here.
- **"testing"** (written on the Glass, 2026-09-01 03:14:37Z, minutes after the reload-free rewrite
  shipped) → **HARVESTED, and it carries real evidence about the corruption bug.** The idea reached
  `glassState.ideas` intact and the page saved a clean new version — so the SAVE path works on the
  no-reload design. What that cannot tell us is what he SAW: the reported fault was always a
  rendering one (his own View Source showed the stored HTML was clean), so only he can say whether
  the page still garbled. **Left open in BLOCKED ON WYATT for exactly that reason** — the third
  attempt is unconfirmed, not confirmed, until he says so.
- **"Test to send to the chart"** (written on the Glass, 18:27:43Z) → **SHIPPED, and this IS the
  fate.** Read literally: the two-way save it exercises is exactly what it tested — the idea
  reached `glassState.ideas` on the live artifact and this harvest is that path completing end to
  end for the first time since Glass v2 shipped. No further action; the mechanism it was testing
  now has its first real proof.

## FATES DECIDED

- **"The Glass becomes our two-way interface"** (Wyatt, 2026-08-31) → **SCHEDULED**: Glass v2
  today after the Razer hour; wyclau source homes in claude-kit now. GitHub Pages was considered
  and set aside for the private interface (public by nature, no write path without glue) —
  **reconsider at launch** as a public, player-facing status page for the game.
