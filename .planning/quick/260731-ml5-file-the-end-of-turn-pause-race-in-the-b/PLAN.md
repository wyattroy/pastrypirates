---
task: file-the-end-of-turn-pause-race-and-make-the-driving-doc-discoverable
quick_id: 260731-ml5
type: quick
created: 2026-07-31
baseline_commit: 197cac2
documentation_only: true
files_modified:
  - .planning/todos/pending/pause-cannot-beat-end-of-turn-expiry.md
  - .planning/ROADMAP.md
  - docs/DRIVING-THE-GAME.md
  - .claude/CLAUDE.md
  - docs/VERIFICATION-CHECKLIST.md
  - docs/MODULES.md
  - .planning/STATE.md
autonomous: true
requirements: [CLOCK-02]

must_haves:
  truths:
    - "The end-of-turn pause race exists as a standalone todo in .planning/todos/pending/ with the same eleven frontmatter fields the d41 todo uses, and its cause is marked SUSPECTED in every place the cause is described"
    - "The todo carries a how-to-reproduce note that names the armed-watcher technique as the only way to hit the window, because a hand-driven session cannot"
    - "The ROADMAP Milestone Backlog gives the finding exactly one home, so the section's own 'nothing is unassigned' promise stays true"
    - "The v1.2 milestone audit is byte-unchanged — it stays a historical record, and the todo cross-references it rather than the reverse"
    - "docs/DRIVING-THE-GAME.md has a section 5d, positioned after 5c and before section 6, carrying a runnable armed-watcher skeleton with live Firebase listeners and a stop() that detaches them"
    - "Section 5d records the five things that actually cost time this session: detach the listeners, hold a visible state long enough for a human, resolve your own turn afterwards, gate any autoplay driver, and never let two drivers share the blind #scPause toggle"
    - "Four files a future Claude session plausibly reads FIRST now point at docs/DRIVING-THE-GAME.md, each for a reason stated in this plan"
    - "The GSD:profile-start..GSD:profile-end block in .claude/CLAUDE.md is byte-identical to its committed form"
    - "Nothing under src/ is modified, staged, or committed"
  artifacts:
    - .planning/todos/pending/pause-cannot-beat-end-of-turn-expiry.md
    - docs/DRIVING-THE-GAME.md
    - .claude/CLAUDE.md
  key_links:
    - "todo -> .planning/v1.2-MILESTONE-AUDIT.md `phase: post-audit-findings`: the todo becomes the canonical home and points BACK at the audit; the audit is not rewritten"
    - "todo -> section 5d: the reproduction instruction and the technique that makes reproduction possible must point at each other, or the todo is unactionable"
    - "section 5d -> 13-VERIFICATION.md: the measured traces are the evidence that the technique works; the doc must not restate them"
    - "new CLAUDE.md section -> outside every GSD marker block: inside one, the next regeneration from codebase/*.md overwrites it"
---

<objective>
Three pieces of documentation work Wyatt asked for on 2026-07-31, all downstream of the session that
closed Phase 13's last two checks.

1. File the end-of-turn pause race as a real backlog item, in the project's real backlog convention,
   with its cause honestly marked suspected — and give it exactly one home on the ROADMAP.
2. Write down the technique that made that session's checks possible at all: an in-page watcher that
   arms itself and fires at page speed, because a hand-driven browser session cannot hit a
   sub-second window.
3. Put a pointer to `docs/DRIVING-THE-GAME.md` in the small number of files a future session
   actually reads first — chiefly `.claude/CLAUDE.md`, which is loaded into every session and does
   not mention the doc at all today.

Purpose: two of these are the same failure in different clothes. A finding recorded only inside a
milestone audit is archaeology; a runbook nobody is pointed at is a runbook nobody reads. The v1.2
audit's own headline lesson was that evidence generated in one session never flowed back to where the
next session would look. This is that counter-move, applied twice.

Output: one new todo file, one new documentation section, four pointers, and one ROADMAP row edited.
No code.
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
</execution_context>

<context>
@.planning/todos/pending/d41-two-greyed-states-never-eyeballed.md
@docs/DRIVING-THE-GAME.md
@.planning/v1.2-MILESTONE-AUDIT.md
@.planning/ROADMAP.md
</context>

<boundaries>
**HARD — this task is documentation only.**

- Nothing under `src/` may be created, modified, staged or committed. Not one line.
- No engine change, no `package.json` change, no `scripts/` change, no `index.html` change.
- `npm test` is NOT required, because no code is touched. Do not run it as a substitute for the
  checks below; run the checks below.
- `git status --porcelain -- src/` must return zero lines before each of the three commits.
- Do not fix the pause race. This task records it and records the open decision. The fix is Wyatt's
  call and is not in scope.
- Do not rewrite `.planning/v1.2-MILESTONE-AUDIT.md`. See the decision below.
</boundaries>

<decisions_taken_before_planning>
These were settled by reading the repo, not assumed. Each is reversible and each is stated so Wyatt
can overrule it in one line.

**The milestone is v1.3, not v1.4.** Evidence, all pointing the same way: `.planning/STATE.md`
frontmatter says *"v1.2 SHIPPED 2026-07-31 and archived — ready for /gsd-new-milestone"* and
`stopped_at` says *"Next: /gsd-new-milestone"*; `.planning/ROADMAP.md` Phase 18 and
`.planning/v1.2-MILESTONE-AUDIT.md` both say NARR-07 is *"deferred to v1.3"*. No milestone after v1.2
has been created, so nothing has moved the numbering. There is no v1.4 anywhere in the repo. The todo
therefore says v1.3 and says why.

**Severity: `low`.** Judged from the evidence, not from how annoying it felt. It fires only when all
of multiplayer AND the timer on AND a pause attempted in the last ~1s coincide; the measured width of
the window is the Firebase round-trip (**116ms** on the one run we have a trace for, `13-VERIFICATION.md`)
plus up to one 500ms tick. Impact when it fires is bounded and non-corrupting: one coin moves under
the documented "too slow" penalty and one turn is lost. No state loss, no crash, no determinism
impact, fully recoverable. That is a fairness papercut, and `low` is what this repo has used for
papercuts (`d41`, `narration-two-schedulers-unenforced`). It is NOT `medium`: `medium` here is
`every-client-can-see-every-recipe`, which changes outcomes table-wide. **Recorded as a judgement
Wyatt can raise** — the argument for raising it is that the player acted deliberately to prevent the
penalty and was penalized anyway, which is worse than a papercut in feel even if it is one in effect.

**`type: bug`, a value not yet used in this repo** (existing values: `verification-gap`, `gap`,
`design`, `ruling`, `feature`, `concern`). Deliberate. The *behaviour* is observed and wrong; only the
*cause* is suspected, and `type` describes the behaviour. `design` was the runner-up — the open
decision really is architectural — but leading with `design` would soften an observed misbehaviour
into a discussion topic.

**`regression: false`, and the todo must say why.** Before CLOCK-02 there was no multiplayer pause at
all, so there was no prior behaviour to regress from. This is a limit of a new capability, not a break
of an old one. It is also **not** a Phase 13 verification failure — Phase 13's checks 2 and 3 both
passed — and the audit already says so.

**The audit stays as written.** `.planning/v1.2-MILESTONE-AUDIT.md` line 34 records this finding under
`phase: post-audit-findings`. That file is a dated historical record of what one audit found on one
day; rewriting it to point forward would make it a worse record, not a better one. The todo becomes
the canonical home and cross-references the audit as its origin. The link runs todo → audit, never
audit → todo. This is the one place in the task where the obvious tidy-up is the wrong move.

**ROADMAP placement: `Fair Play Online`, with its rationale widened by one clause — and this is a
widening, not a fit.** Stated plainly because the instruction was to be honest here. No group in
`## Milestone Backlog` fits cleanly. Ruled out and why: *The Gated Re-Record* is for items that
require the one-way `--capture` (this fix is UI-tier — `src/orchestrator.js` and `src/ui/util.js` —
and touches no event the engine emits, so it must NOT be parked behind the re-record); *Platform
Debt* is explicitly *"no player sees any of it"* and a player saw this one; *Narration Pacing*,
*Look & Feel*, *Fast to Load*, *Welcome Aboard* and *Island Redesign* are all unrelated; the v1.2 tail
*Economy Correctness* is about coins and crates being minted or deleted, whereas this penalty is
legitimate and correctly applied — the bug is that it could not be prevented. `Fair Play Online`
today reads *"Both are about the negotiation being honest between players who cannot see each other"*
— negotiation is narrower than this item, so the cell gets one added clause covering the shared clock.
The alternative was a new single-item row, which is more honest to the current wording but adds a
group carrying one item. Widening is the smaller change and keeps the section's stated promise that
*"Every open backlog item has exactly one home below — nothing is unassigned"* true. **If Wyatt
prefers a standalone row, that is a one-line change and this plan is not defending the choice.**

**Section 5d cites BOTH copies of `13-VERIFICATION.md`.** The instruction named
`.planning/phases/13-multiplayer-turn-clock/13-VERIFICATION.md`. That path is a working directory
that `/gsd-cleanup` archives, which would leave a permanent doc in `docs/` pointing at a moved file.
The archive copy at `.planning/milestones/v1.2-phases/13-multiplayer-turn-clock/13-VERIFICATION.md`
is the durable one and was confirmed **byte-identical today** (`diff -q`, exit 0). The doc names the
working path first, as instructed, and the archive path as the one that survives cleanup.

**Where the four pointers go, and where they do not.**

| File | Decision | Why a session would look there |
|---|---|---|
| `.claude/CLAUDE.md` | **ADD** | It is loaded into **every** session's context automatically and is the only file here with that property. It does not mention the doc at all today — the single highest-value gap in the repo, and the only one that requires no one to go looking |
| `docs/VERIFICATION-CHECKLIST.md` | **ADD one clause** | Already the "what to verify" half of the pair, already carries a prominent callout at line 68 naming §4a. A session doing a verification pass reads it by definition. One clause naming §5d, not a new section |
| `docs/MODULES.md` | **ADD one line** | The strongest of the secondary links, because following MODULES.md verbatim walks you into the trap: it prints `python3 -m http.server 8000` as *the* canonical dev server, and §1 of DRIVING-THE-GAME exists to say that reusing a port serves cached ES modules and has produced phantom bugs three times. A session that reads only MODULES.md will use 8000 every time |
| `.planning/STATE.md` | **ADD to the existing bullet** | Every GSD command loads it. Its `Blockers/Concerns` already has an *"MP test-harness gotcha"* bullet that points at MEMORY.md but not at the repo's own runbook — a genuine gap sitting in exactly the right neighbourhood. Extend that bullet; do **not** add a new one, because that section is already very long and a new bullet there is bloat |
| `README.md` | **REJECT** | Public-facing, aimed at people who want to play the game or run the Python sim. `docs/MODULES.md` earns its place in `## What's here` because it is the local-dev contract anyone running the game needs; a browser-automation runbook is not that. Adding it makes the readme less honest about what it is for |
| `.continue-here.md` | **NO CHANGE** | Already points at the doc (line 63, naming §4a). Also a transient per-session handoff — a pointer added here has a lifespan of days |
| `.planning/HANDOFF.md` | **REJECT** | Stale. Names branch `claude/gsd-new-project-skill-40272a` and says *"nothing merged, pushed, or PR'd"*, which has been untrue for three milestones. A pointer in a document nobody trusts is noise |
| `.planning/PROJECT.md` | **REJECT** | `.claude/CLAUDE.md`'s project block is generated **from** it (`<!-- GSD:project-start source:PROJECT.md -->`), so a pointer here would either duplicate the CLAUDE.md one or fight it on the next regeneration |
| `AGENTS.md`, `CONTRIBUTING.md` | **REJECT** | Neither exists. Creating a file whose only content is a pointer is the definition of a pointer in a place nobody reads |
| `RULES.md`, `Rules_boardgame.md` | **REJECT** | Player-facing game rules. Wrong audience entirely |

Four pointers, each with a distinct reason. That is the whole set.

**A known risk on the CLAUDE.md edit, recorded rather than hidden.** That file is assembled from GSD
marker blocks (`GSD:project-*`, `GSD:stack-*`, `GSD:conventions-*`, `GSD:architecture-*`,
`GSD:skills-*`, `GSD:workflow-*`, `GSD:profile-*`), several sourced from `.planning/codebase/*.md`.
Content placed *inside* a block is overwritten the next time that block regenerates. The new section
therefore goes **between** `<!-- GSD:workflow-end -->` and `<!-- GSD:profile-start -->`, outside every
block. That is the safest available position; it is not a guarantee, because a future GSD command
that rewrites the file wholesale would still take it. Worth re-checking after any `/gsd-map-codebase`
or `/gsd-profile-user` run.
</decisions_taken_before_planning>

<tasks>

<task type="auto">
  <name>Task 1: File the pause race as a todo, and give it one home on the ROADMAP</name>
  <files>.planning/todos/pending/pause-cannot-beat-end-of-turn-expiry.md, .planning/ROADMAP.md</files>
  <read_first>
    .planning/todos/pending/d41-two-greyed-states-never-eyeballed.md — the model for frontmatter shape AND voice; match both
    .planning/v1.2-MILESTONE-AUDIT.md lines 32-34 — the `phase: post-audit-findings` entry this todo supersedes as canonical home
    .planning/ROADMAP.md lines 432-463 — the Milestone Backlog section, its stated promise, and the Fair Play Online row at line 455
    src/orchestrator.js lines 171-200 — `togglePause` writes the flag; only the host branch of `watchPause` calls `applyPauseState`
    src/ui/util.js lines 1265-1298 — `applyPauseState` clears the interval; `shotClockTick` runs on its own 500ms interval and expires at 30000ms
  </read_first>
  <action>
Write a new todo at `.planning/todos/pending/pause-cannot-beat-end-of-turn-expiry.md`. Read the d41
todo first and match it on both axes: the eleven frontmatter fields in the same order (`id`, `title`,
`status`, `type`, `severity`, `area`, `created`, `source`, `resolves_phase`, `regression`,
`accepted_by`), and the voice — short declarative headings, bold only on the load-bearing sentence,
tables where a table is genuinely clearer, no filler.

Frontmatter values are fixed by this plan and are not the executor's call: id
`pause-cannot-beat-end-of-turn-expiry`, status `pending`, type `bug`, severity `low`, area
`multiplayer`, created `2026-07-31`, resolves_phase `null`, regression `false`, accepted_by naming
Wyatt, 2026-07-31, and his own deferral of it to the v1.3 backlog. `source` names the session that
closed Phase 13's checks 2 and 3 and points at the audit's `post-audit-findings` entry. The `title`
states the observed behaviour, not the suspected cause.

Body content is specified in Appendix B. Three rules bind the writing of it and are not negotiable.
First, the observed behaviour and the suspected mechanism are separated into different sections, and
every sentence describing the mechanism is marked as suspected — it came from a code read and was
never isolated with a test. Second, the impact is recorded at exactly the size it is: one coin under
the documented penalty and one lost turn, no state corruption. Resist any wording that makes it
sound larger. Third, the todo points BACK at `.planning/v1.2-MILESTONE-AUDIT.md` as its origin and
declares itself the canonical home from here on; the audit file is not touched by this task at all.

Then edit `.planning/ROADMAP.md`. In the `## Milestone Backlog` candidate table, the `Fair Play
Online` row currently lists two items and justifies the grouping as being about honest negotiation.
Add this finding to its Contents cell by its todo id, and widen the `Why grouped this way` cell by
one clause so the rationale covers fairness between remote players including the shared turn clock —
not just negotiation. Say in the SUMMARY that this is a widening of an existing group rather than a
clean fit, and that a standalone row is the alternative if Wyatt prefers it. Change nothing else in
that section; in particular leave the three protective-ruling todos named in the paragraph below the
table alone.
  </action>
  <verify>
    <automated>
    TODO=.planning/todos/pending/pause-cannot-beat-end-of-turn-expiry.md; \
    test -f "$TODO" && \
    test "$(head -13 "$TODO" | grep -cE '^(id|title|status|type|severity|area|created|source|resolves_phase|regression|accepted_by):')" -eq 11 && \
    grep -qi 'suspected' "$TODO" && \
    grep -q 'v1.2-MILESTONE-AUDIT' "$TODO" && \
    grep -q 'DRIVING-THE-GAME' "$TODO" && \
    grep -q 'timerOff' "$TODO" && \
    grep -q 'pause-cannot-beat-end-of-turn-expiry' .planning/ROADMAP.md && \
    git diff --quiet HEAD -- .planning/v1.2-MILESTONE-AUDIT.md && \
    test -z "$(git status --porcelain -- src/)" && echo TASK1-OK
    </automated>
  </verify>
  <done>
The todo exists with all eleven d41 frontmatter fields, marks the cause suspected, cites the audit as
its origin, and names the armed-watcher technique in its reproduction note. The ROADMAP's Fair Play
Online row carries it, so no open backlog item is unassigned. `.planning/v1.2-MILESTONE-AUDIT.md` has
zero diff. `src/` is clean.
  </done>
</task>

<task type="auto">
  <name>Task 2: Add section 5d — the armed watcher — to docs/DRIVING-THE-GAME.md</name>
  <files>docs/DRIVING-THE-GAME.md</files>
  <read_first>
    docs/DRIVING-THE-GAME.md in full (279 lines) — §4a, §5c and §8 are the tonal models; §5b is the structural model for a code-carrying section
    .planning/phases/13-multiplayer-turn-clock/13-VERIFICATION.md lines 237-263 — the method section and the Run 2 trace this technique produced
  </read_first>
  <action>
Insert a new section `## 5d. Hitting a sub-second window — arm a watcher, do not click` into
`docs/DRIVING-THE-GAME.md`, positioned immediately after the end of §5c (the lockstep trustworthiness
table, which ends at line 233) and immediately before `## 6. Inspecting state` (line 235). Nothing
above or below that seam changes.

Match the file's voice exactly — it is blunt, written from things that actually went wrong, and
explicit about what cost time. It states costs in real numbers because they were measured. Do not
soften it into advice.

The content is specified in Appendix A: a problem paragraph, a fix paragraph, the code skeleton
verbatim from Appendix A with its comments intact, five hard-won specifics as a bullet list, and a
closing pointer at Phase 13's verification traces. Two things must survive the writing. The specific
mistake named in the problem paragraph is reading state first and acting second — by the time the read
returns the window is gone — and the cost is stated as two turns lost to expiry, one of them lost
inside exactly that read. And the `stop()` bullet must be accurate about why: the watcher-inventory
gate in `scripts/net_contract_check.js` counts watchers declared in `src/net/watchers.js` against
`registry.attach()` calls in source, so it will NOT catch a listener you attached from the console.
The reason to detach is that a leaked listener keeps firing into a page that otherwise accounts for
every watcher it owns — do not write it as though a test will catch you, because it will not.

The closing pointer says this technique is what closed Phase 13's checks 2 and 3 and names where the
measured traces live: the working copy at
`.planning/phases/13-multiplayer-turn-clock/13-VERIFICATION.md`, and the archive copy under
`.planning/milestones/v1.2-phases/` as the one that survives a `/gsd-cleanup`. Point at them; do not
restate the traces here.
  </action>
  <verify>
    <automated>
    D=docs/DRIVING-THE-GAME.md; \
    awk '/^## 5c\./{a=NR} /^## 5d\./{b=NR} /^## 6\./{c=NR} END{exit !(a&&b&&c&&a<b&&b<c)}' "$D" && \
    grep -q "off('value'" "$D" && \
    grep -q '__ppWatch' "$D" && \
    grep -q 'scPause' "$D" && \
    grep -q 'net_contract_check' "$D" && \
    grep -q '13-VERIFICATION.md' "$D" && \
    grep -q 'v1.2-phases' "$D" && \
    test "$(git diff -- "$D" | grep -c '^-[^-]')" -eq 0 && \
    test -z "$(git status --porcelain -- src/)" && echo TASK2-OK
    </automated>
  </verify>
  <done>
§5d sits between §5c and §6. It carries a runnable skeleton with an arming poll, a fire-once guard, a
timestamped trace, live `.on('value')` listeners and a `stop()` that detaches them; the five specifics
including the shared-`#scPause`-toggle trap; and a pointer to both copies of Phase 13's verification
traces. `src/` is clean.
  </done>
</task>

<task type="auto">
  <name>Task 3: Point the four files a session reads first at docs/DRIVING-THE-GAME.md</name>
  <files>.claude/CLAUDE.md, docs/VERIFICATION-CHECKLIST.md, docs/MODULES.md, .planning/STATE.md</files>
  <read_first>
    .claude/CLAUDE.md lines 378-399 — the workflow block, its closing marker, and the profile block that must not be touched
    docs/VERIFICATION-CHECKLIST.md lines 66-72 — the existing callout naming §4a
    docs/MODULES.md lines 9-28 — the "An HTTP server is required" section that prints port 8000
    .planning/STATE.md line 152 — the existing "MP test-harness gotcha" bullet under Blockers/Concerns
  </read_first>
  <action>
Four edits, all small. Every one is an `Edit` on an existing file — none of these files may be
rewritten wholesale.

**`.claude/CLAUDE.md`.** Add a short section titled around driving and playtesting the game, placed
**between** `<!-- GSD:workflow-end -->` and `<!-- GSD:profile-start -->` — outside every GSD marker
block, for the reason in the decisions section above. Keep it to roughly five or six lines: this file
is loaded into every session and bloat here has a real, repeated cost. It says `docs/DRIVING-THE-GAME.md`
is required reading before any browser or playtest automation, and teases exactly the two traps that
most often waste a session — that the flippenator coin `#flipCoinWrap` IS the flip button rather than
an `.apBtn`, which stalled three separate attempts, and that a window narrower than about a second
cannot be hand-driven and needs the armed watcher in §5d. Nothing else. Do not add examples, do not
add a table. Leave the `GSD:profile-start`..`GSD:profile-end` block byte-identical; it is generated
and carries its own instruction not to be hand-edited.

**`docs/VERIFICATION-CHECKLIST.md`.** The blockquote callout beginning at line 68 already sends the
reader to the driving doc and names the flippenator trap. Extend that same blockquote by one clause
naming §5d for any check that has to land inside a specific second. Do not add a second callout and
do not restructure the existing one.

**`docs/MODULES.md`.** In the "An HTTP server is required" section, immediately after the fenced
`python3 -m http.server 8000` block and its surrounding prose, add one line pointing at
`docs/DRIVING-THE-GAME.md` §1 for the reason a browser-verification pass must pick a port it has never
loaded — both Chrome and Safari cache ES modules per URL, so port reuse serves the old build after a
hard reload. Frame it as the exception that applies to verification passes, not as a correction to the
canonical port, which is right for ordinary local dev.

**`.planning/STATE.md`.** Under `## Accumulated Context` → `Blockers/Concerns`, extend the existing
`**MP test-harness gotcha:**` bullet at line 152 with a clause pointing at `docs/DRIVING-THE-GAME.md`
as the repo's own runbook for driving the game, alongside the MEMORY.md reference it already carries.
Extend that bullet — do not add a new one. That section is already very long and a fresh bullet there
is the bloat this task is supposed to be avoiding.

Do not touch `README.md`. The reasoning is in the decisions section and it is deliberate.
  </action>
  <verify>
    <automated>
    grep -q 'DRIVING-THE-GAME' .claude/CLAUDE.md && \
    grep -q 'DRIVING-THE-GAME' docs/VERIFICATION-CHECKLIST.md && \
    grep -q 'DRIVING-THE-GAME' docs/MODULES.md && \
    grep -q 'DRIVING-THE-GAME' .planning/STATE.md && \
    awk '/GSD:workflow-end/{a=NR} /DRIVING-THE-GAME/{if(!b)b=NR} /GSD:profile-start/{c=NR} END{exit !(a&&b&&c&&a<b&&b<c)}' .claude/CLAUDE.md && \
    diff <(git show HEAD:.claude/CLAUDE.md | sed -n '/GSD:profile-start/,/GSD:profile-end/p') <(sed -n '/GSD:profile-start/,/GSD:profile-end/p' .claude/CLAUDE.md) && \
    git diff --quiet HEAD -- README.md && \
    test -z "$(git status --porcelain -- src/)" && echo TASK3-OK
    </automated>
  </verify>
  <done>
All four files point at `docs/DRIVING-THE-GAME.md`. The CLAUDE.md pointer sits between the workflow
block's closing marker and the profile block's opening marker, so it is inside no GSD marker block,
and the profile block diffs clean against its committed form. `README.md` has zero diff. `src/` is
clean.
  </done>
</task>

</tasks>

<appendix_a>
## Appendix A — content spec for §5d

**Problem paragraph.** Every browser-tool round-trip costs 1–2 seconds. The shot clock is 30 seconds
with the penalty at 20 and expiry at 30. Any check that must land inside a specific second — pausing
at the top of a turn, or catching a state within a tick of a transition — cannot be hand-driven. This
session lost **two turns to expiry** trying, including one lost while reading state to decide what to
click. Name that as the specific mistake: reading first and acting second, because by the time the
read returns the window is gone.

**Fix paragraph.** Install a watcher that arms itself and fires the whole sequence in-page at page
speed. You are then reading a recording, not racing a clock. Attach live Firebase listeners rather
than polling, so the shared-state transitions are captured event-driven with no polling lag.

**Code skeleton — reproduce verbatim, comments included.**

```js
const S = () => window.__pp_app_state_debug();
const T0 = Date.now(); const trace = [];
const log = (k, x) => trace.push(Object.assign({ms: Date.now()-T0, kind:k}, x));

// live listeners beat polling — no lag on the shared-state transitions
const pRef = S().db.ref('rooms/'+S().room+'/paused');
const pCb = s => log('fb.paused', {v: s.val()});
pRef.on('value', pCb);

let fired = false;
const armIv = setInterval(() => {
  if (fired) return;
  const cs = S().clockState;
  if (cs && cs.seat === S().mySeat && !cs.paused && (cs.deadline - Date.now()) > 24000) {
    fired = true; clearInterval(armIv); run();      // a FRESH clock on my seat
  }
}, 100);

window.__ppWatch = { trace, stop: () => { pRef.off('value', pCb); clearInterval(armIv); } };
```

**The five specifics, as bullets.**

1. **Detach the listeners when done** (`ref.off('value', cb)`). A leaked console listener keeps
   firing into a page that otherwise accounts for every watcher it owns — `src/net/watchers.js` is
   inventory-gated against `registry.attach()` calls by `scripts/net_contract_check.js`. Be accurate
   that the gate reads source and will not catch a console-attached listener; tidiness is the reason,
   not the gate.
2. **Hold a visible state longer than you think.** A 1.5s pause hold was too fast for the human on
   the other browser to register; 8s was unambiguous. While paused the clock is frozen, so a long
   hold costs nothing.
3. **If your seat is on the clock during the run, have the watcher resolve the turn afterwards**
   (e.g. click "Stay put"), or you hand the turn back to expiry the moment the check ends.
4. **Gate any general autoplay driver on a busy flag** while the check runs, or the two collide — the
   §5b driver will happily click through the very prompt the check is sitting on.
5. **Beware a shared toggle with two drivers.** `#scPause` is a blind toggle over one shared flag.
   With a human and a script both clicking it, a click can land on an already-paused game and resume
   it — which reads as "the pause did not work". Agree that exactly one side drives it.

**Closing pointer.** This technique is what closed Phase 13's checks 2 and 3; the measured traces are
in `.planning/phases/13-multiplayer-turn-clock/13-VERIFICATION.md`, with the durable archive copy at
`.planning/milestones/v1.2-phases/13-multiplayer-turn-clock/13-VERIFICATION.md`.
</appendix_a>

<appendix_b>
## Appendix B — content spec for the todo body

Sections, in this order. Headings in the d41 register: short, declarative, no numbering.

**What happened.** Wyatt paused from the host with roughly one second left on the shot clock. The
turn expired anyway, the "too slow" penalty was applied, and play continued. The pause did not take
effect in time to prevent any of it. Bold the one sentence that is the finding: **pausing in the
final ~1 second of a turn does not save the turn.**

**Suspected cause — a code read, not an isolated test.** Mark it suspected in the heading and again in
the prose; do not let a later reader mistake it for established. `togglePause` (`src/orchestrator.js`
lines 176-182) writes the flag to Firebase via `netSetPaused`. The host applies the pause only when
`watchPause`'s callback fires on the round-trip (lines 186-200) and calls `applyPauseState`, which is
what clears the interval. Meanwhile `shotClockTick` (`src/ui/util.js` lines 1292-1298) runs locally on
a 500ms interval and reaches the 30000ms expiry independently of any of that. So there is a window at
the end of every turn that a pause cannot beat, roughly the Firebase round-trip plus up to one 500ms
tick. Give the one round-trip number actually measured — **116ms**, from Phase 13's Run 2 trace — and
label it as a single sample, not a characterisation.

**Impact, at its real size.** One coin moves under the documented penalty; one turn is lost. No state
corruption, no crash, no determinism impact, fully recoverable. This is why severity is `low`, and
say so in the file so the rating does not read as arbitrary.

**Not a regression, and not a Phase 13 failure.** Before CLOCK-02 there was no multiplayer pause at
all, so there is no prior behaviour to have regressed from — this is a limit of a new capability.
Phase 13's checks 2 and 3 both passed; this was found alongside them, not by them. The audit at
`.planning/v1.2-MILESTONE-AUDIT.md` (`phase: post-audit-findings`) is the origin record and says the
same; this todo is the canonical home from here on and that file is deliberately left as written.

**How to reproduce.** Needs a live two-window game with the timer **ON** (`timerOff` false — with the
timer off, `src/ui/panel.js` returns before any paused-state render, so there is nothing to observe),
and a pause fired within ~1s of expiry. That is precisely the sub-second window a hand-driven session
cannot hit, so reproducing it needs the armed-watcher technique in `docs/DRIVING-THE-GAME.md` §5d.

**The decision to make.** Accept the race as a known limit, or have the host apply the pause
optimistically and locally before the round-trip completes. State the cost of the second honestly:
`applyPauseState` is deliberately host-only and the guest branch of `watchPause` deliberately never
mutates the deadline (**D-06**), so an optimistic local apply needs care not to break that authority
split. Note that any fix here is UI-tier — `src/orchestrator.js` and `src/ui/util.js` — and emits no
new event, so it does **not** ride the gated determinism re-record.
</appendix_b>

<threat_model>
## Trust Boundaries

None crossed. This task writes and edits Markdown inside the repository. It adds no code path, no
input handling, no dependency, and no network call.

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-ml5-01 | Tampering | `src/` under a docs-only task | medium | mitigate | `git status --porcelain -- src/` must be empty before each of the three commits; it is asserted in every task's `<automated>` verify |
| T-ml5-02 | Tampering | `.claude/CLAUDE.md` generated blocks | low | mitigate | The new section goes outside every GSD marker block, and the `GSD:profile-*` block is diffed against its committed form in Task 3's verify |
| T-ml5-03 | Repudiation | `.planning/v1.2-MILESTONE-AUDIT.md` as a dated historical record | low | mitigate | The file is not edited; Task 1's verify asserts `git diff --quiet HEAD` on it |
| T-ml5-04 | Information disclosure | The §5d skeleton reads `rooms/{room}` from a live Firebase DB | low | accept | It reads only a room's own already-shared clock/pause state from a client that is already in the room, using the same public config the game ships with. No new access, no credential in the doc |
| T-ml5-SC | Tampering | npm/pip/cargo installs | high | accept | No packages are installed by this task and none may be. `package.json` is out of bounds per `<boundaries>`, so no legitimacy gate applies |
</threat_model>

<verification>
Run from the repo root after all three tasks.

1. `test -z "$(git status --porcelain -- src/)"` — nothing under `src/` was touched, at any point.
2. `git diff --quiet HEAD -- .planning/v1.2-MILESTONE-AUDIT.md README.md package.json index.html` —
   the four files this task must not modify are untouched.
3. `head -13 .planning/todos/pending/pause-cannot-beat-end-of-turn-expiry.md` — eleven frontmatter
   fields, matching the d41 todo's shape and order.
4. `awk '/^## 5c\./{a=NR} /^## 5d\./{b=NR} /^## 6\./{c=NR} END{exit !(a&&b&&c&&a<b&&b<c)}' docs/DRIVING-THE-GAME.md`
   — §5d is between §5c and §6.
5. `grep -l 'DRIVING-THE-GAME' .claude/CLAUDE.md docs/VERIFICATION-CHECKLIST.md docs/MODULES.md .planning/STATE.md`
   — all four pointers landed.
6. `diff <(git show HEAD:.claude/CLAUDE.md | sed -n '/GSD:profile-start/,/GSD:profile-end/p') <(sed -n '/GSD:profile-start/,/GSD:profile-end/p' .claude/CLAUDE.md)`
   — the managed profile block is byte-identical.
7. `grep -c 'pause-cannot-beat-end-of-turn-expiry' .planning/ROADMAP.md` — the finding has a home.
</verification>

<success_criteria>
- The end-of-turn pause race is filed at `.planning/todos/pending/pause-cannot-beat-end-of-turn-expiry.md`,
  in the d41 todo's frontmatter shape and voice, with the cause marked suspected everywhere it is
  described and the impact recorded at its real size.
- The todo names its reproduction precondition (timer ON) and points at §5d as the only way to hit the
  window.
- `.planning/ROADMAP.md`'s Milestone Backlog assigns it exactly one home, keeping the section's own
  "nothing is unassigned" promise true; the widening of the Fair Play Online rationale is flagged in
  the SUMMARY as a judgement call, not presented as a clean fit.
- `.planning/v1.2-MILESTONE-AUDIT.md` is byte-unchanged.
- `docs/DRIVING-THE-GAME.md` §5d exists between §5c and §6, in the file's own blunt voice, with a
  runnable skeleton and the five specifics — including the accurate reason to detach listeners, which
  is not "a test will catch you".
- Four files that a future Claude session plausibly reads first point at the doc; `README.md` does not,
  and the SUMMARY says why.
- Nothing under `src/` was created, modified, staged, or committed. Three commits, one per task.
</success_criteria>

<output>
Write `.planning/quick/260731-ml5-file-the-end-of-turn-pause-race-in-the-b/SUMMARY.md` when done.

It must state, without softening: the milestone the todo was filed against and the evidence for that
number; the severity chosen and the argument for raising it; that the ROADMAP placement is a widening
of `Fair Play Online` rather than a clean fit, with the standalone-row alternative named; the full
list of pointer targets accepted and rejected with one reason each; and that
`.planning/v1.2-MILESTONE-AUDIT.md` was deliberately left as written.

Carry forward as open for Wyatt: **the pause race itself is unfixed and undiagnosed** — the cause is
suspected only, and the accept-versus-optimistic-local-apply decision is his.
</output>
