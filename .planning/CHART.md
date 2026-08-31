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
- [ ] 24-hour unattended engine run, zero silent stalls — GATED: passive, monitor only; nothing to DO but watch the clock since the Razer hour (16:19Z)
- [ ] Rulebook cutover: `CLAUDE-next.md` replaces `.claude/CLAUDE.md`; war stories → `.claude/rules/*.md` at their triggers — GATED: at the quiet moment, needs the parallel fix session closed
- [ ] Memory consolidation: five homes → one + pointers — GATED: same quiet moment
- [ ] Pruning: kill-list generated (GSD phase machinery, dead files), archived in git, deleted; goes on the Glass for the record — GATED: same quiet moment
- [x] Gate retirement policy wired (quiet per-bug gates → archive; suite ceiling) — SHIPPED 2026-08-31 19:52Z. `gates.ceiling` in `package.json` (started at the exact current total, 71, so the next gate is the first conscious decision) + `scripts/qa/gate_ceiling_check.mjs`, red-proofed by planting `total=72` on the real file and watching it fail before restoring it. `scripts/qa/quiet_gate_report.mjs` (advisory, NOT in `npm test` — retirement stays a human call, per `docs/HARD-WON-LESSONS.md` §12i) lists real wired-in per-bug gates only, after a scoping bug caught before shipping: it first matched every `w##_/q##_` FILE in `scripts/qa/`, including one-off probes never wired into the suite at all. `scripts/qa/gate_archive/` exists for retirements. Full policy: `docs/GATE-RETIREMENT.md`. npm test 71/71.
- [x] **Glass v2 — the two-way interface** (ideas box on the page; the page saves itself; sessions woken by his writes; harvest rule in the Door; gate `glass_roundtrip_check`, red-proofed both ways) — shipped 2026-08-31, first live save pending Wyatt's first tap
- [ ] wyclau source moves to claude-kit as the kit's first module; pastrypirates vendors it *(his pick 2026-08-31)*
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
| **⚠ MAIN IS 465 COMMITS BEHIND THIS BRANCH.** All of this session's work (and everything back to 2026-08-26 22:56Z — five days) has landed on `claude/cloud-handoff-planning-a9ay1u`, not `main`. `main` is frozen at `a416af71` ("retire /staging from the live site"); this branch has 465 commits ahead, 0 behind, no PR open, nothing merged. Real players are on code that is five days and 465 commits stale. Rough shape of what's waiting: 105 docs, 61 fix, 38 ledger, 28 feat, plus glass/watchdog/wyclau/trial/test work — the whole Bosun/Glass/Stop-hook system this session built exists only on this branch. | This is a release decision, not a mechanism one — CLAUDE.md's own release process requires your approval before anything merges to `main`, and 465 commits is too large to wave through. Recommend: sea-trial this branch at FULL gear, deploy it to staging for you to play, then merge on your say-so — exactly the normal release loop, just very overdue. I have not touched `main` and will not without your word. | 2026-08-31 21:30Z |
| Does the Glass's Ideas box still corrupt the page after a save? The real trigger was never found — CEO Review 54 disproved the original theory in a real browser. Two of your three complaints are fixed and verified (the button re-enables, confirms honestly); the corruption itself is not confirmed fixed. | Try the Ideas box once more on the live page. If it's still broken, a screenshot of the exact moment (and whether it happened right after the save, or later) would help far more than another local simulation — this needs the real host, which nothing here can reproduce. | 2026-08-31 21:20Z |

## RULED — his answers, and what each one unblocks

**Harvested 2026-08-31 from the Helm's state block, over an hour after he made them.** Full
record with the failure it exposes: [`.claude/memory/DECISIONS.md`](../.claude/memory/DECISIONS.md).

| item | HIS RULING | now |
|---|---|---|
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

- **Wyatt, LIVE BUG REPORT, 2026-08-31 21:00Z, two screenshots**: *"after I send something to you in the ideas box, the page css breaks; and i'm not sure if the idea was sent. i need to be able to send another idea immediately afterwards, without waiting. i need to know that my first idea was sent, and added to the chart."* → **TWO OF THREE FIXED AND VERIFIED. THE THIRD — THE ACTUAL CORRUPTION — IS UNEXPLAINED. STILL OPEN, NOT SHIPPED-AND-CLOSED.**
  - **✅ Fixed, verified**: "send another immediately, without waiting" and "know it was sent" — the Send button's success handler was an empty comment (relied entirely on the platform's own view reload, never re-enabled, never confirmed). Now updates local state, clears the box, repaints the visible list, shows an honest confirmation ("Saved to the page — a session will harvest it to the Chart soon." — not overclaiming it's already in the Chart), and re-enables immediately. Same fix applied to the rulings-save flow for consistency (rule 8). Gate `scripts/qa/glass_send_confirms_check.mjs`, red-proofed against the exact pre-fix empty handler.
  - **⚠ CORRECTION, CEO Review 54, IN THE OPEN — the page-corruption fix is NOT proven.** The original entry here said "root cause measured": a comment reading `// The state block is a JSON <script>, so...` — a literal, unescaped, tag-shaped substring inside the real client script element. **That claim was wrong, and the review caught it properly**: it regenerated the exact pre-fix page and rendered it in a real, unmodified headless Chrome — it came up completely clean, no corruption. Per the HTML5 spec, a bare `<script>` (no slash) inside running script content is not special; only `</script` ends it. A follow-up check here (4 rounds of the real client-side self-publish escaping, simulated in Node) also never drifted. **So the actual mechanism that broke Wyatt's live page is still unknown** — most plausibly something specific to the Claude Artifact host's own internal rendering/patching pipeline when `cap.publish()` runs live, which cannot be reproduced or inspected from outside that system. The comment was still reworded (bad practice regardless, and the gate `scripts/qa/glass_script_tag_purity_check.mjs` was kept and WIDENED to check the whole document, not just two known blocks — a real improvement CEO Review 54 also asked for) — but it must not be called a proven fix for his exact symptom. **Needs Wyatt to try the Ideas box again on the live page and say whether the corruption still happens** — parked here rather than asked via the question UI, per his standing instruction. npm test 74/74.
- **Wyatt, written on the Glass, 2026-08-31 20:40:18Z**: *"Edits for The Glass: 1. Move 'Tasks' to
  go above 'Shipped Today' 2. Make Shipped Today expandable, with each thing shipped in its own
  pill, clickable to see more information about that commit 3. reformat the pages so Shipped Today
  is in the left column, and Your Rulings is on the right column. On mobile, one column with
  Shipped Today is on top."* → **SCHEDULED, next Glass-focused session.** All three are real,
  concrete UI work (reorder a section, make list items expandable with per-commit detail, a
  responsive two-column layout) — not urgent, not blocking any Chart item, and needs the same
  render-and-screenshot discipline (rule 19) the redesign itself used. Recommend building all three
  together rather than piecemeal, since (2) and (3) both touch the Shipped Today card's markup.
- **CEO Review 51's small finding**: `quiet_gate_report.mjs`'s naming convention (`^[wq]\d+_`)
  misses `a1_bake_now_check.mjs` / `a2_bot_bake_watch_check.mjs` — two real per-item gates that are
  neither structural nor currently reportable as retirement candidates. → **PARKED, low priority**:
  widen the regex to also match `a\d+_` whenever someone is next in `quiet_gate_report.mjs` for
  another reason; not worth a standalone session, since the report already covers every gate that
  matches its stated convention and found zero candidates either way today.

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
