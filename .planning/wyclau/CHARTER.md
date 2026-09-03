# The Wyclau Charter — v1.0, IN FORCE

**APPROVED by Wyatt 2026-08-31**, verbatim: *"Charter is approved with only one correction: I
learn fast, so I want learnings or lessons every day, not once per week."* The amendment is
applied throughout: **one short lesson per day**, tied to the live work.

Drafted 2026-08-31 from the founding note (`WYATTS-NOTE-2026-08-30.md`), the interview rulings
(`INTERVIEW-2026-08-30.md`), and the four evidence reports in this folder. The presentation copy
Wyatt reads is a published artifact; THIS file is the canonical copy sessions work from.

## The requirement above the others

Wyatt, on trust: *"a dependable agent that never stops building, that i can see is making progress
whenever I check in on it, and i never have to worry is shut down or stalled."* The mission it
serves: the overdue Reddit launch — five-item bar (finished feel solo+crew, tutorial, analytics,
code privacy, SEO), date committed once sized, logins + paid merch within a month after.

His three fears are design constraints: it must change something real (delete more than it adds),
it must not be slower (Principle 7's weight budget), and it must restore his sense of AGENCY —
the fast idea→visible-change feedback loop of small projects, rebuilt at scale (the Chart's
every-idea-gets-a-fate-within-a-day rule exists for this).

## Seven principles (the claude-kit-portable core)

1. **One of everything.** One plan, one door, one status page, one memory home. Two things kept
   matching by discipline always drifted; everything made singular never did.
2. **Rules execute or expire.** A rule is a hook, a gate, or a script. Prose is context, not
   enforcement — the record shows prose rules fail and trigger-firing hooks hold.
3. **Instruments earn trust like features do.** A new checker is quarantined until it has
   demonstrably caught the bug it was built for (red-proof both directions).
4. **The liveness layer lives outside the worker.** In-session supervisors die with the session;
   the watchdog is an OS-level scheduled task that cannot.
5. **Wyatt's attention is the scarcest resource.** Batched decision rounds with recommendations
   and measurements; reports lead with player-visible outcomes, sized; corrections surfaced only
   when they change a decision; taste parked, never defaulted.
6. **Derived, never hand-typed.** Status, counts, indexes, kill-lists are generated.
7. **Ceremony scales to stakes.** Weight budget: fresh session productive in ~2 minutes; process
   overhead on a small item under ~10. Wyclau feeling slower than raw work is a bug in wyclau.

## The seven parts

| Part | What it is | Replaces |
|---|---|---|
| **The Chart** | One plan file: launch line worked backwards from the date + idea inbox. Every idea gets a visible fate (shipped / scheduled / parked-with-reason) within a day. | ROADMAP.md, STATE.md, BACKLOG.md, wave lists |
| **The Door** | One entry command for every work session: sync, read Chart + memory index, state the situation in 5 lines, continue the top unblocked item or take instruction. | 71 GSD commands; hand-aimed sessions |
| **The Engine** | The working session on the Razer + the **watchdog**: an OS scheduled task (outside Claude) that checks the last-progress timestamp every few minutes and relaunches the engine through the Door when stale, noting the restart on the Glass. | EA/CTO supervisor |
| **The Glass** | One published status page, regenerated at every heartbeat/item-close: running-now, last-progress timestamp (page shows staleness itself), shipped-today in player terms, launch progress, blocked-on-Wyatt queue with recommendations. **ONE PUBLISHER, 2026-08-31:** only the Bosun publishes it. Another session writes into the tracked `.planning/wyclau/GLASS-NOTE.md` instead — the Bosun folds it in and clears it on its next pulse. | Checking in and wondering |
| **The Proof** | Kept on evidence: fresh-context CEO per item (durable verdicts), prediction-first, posed comparisons, claim-before-edit ledger. Sharpened: before Wyatt sees a build, full voyages played to the end card in all three modes + host/guest screenshots compared. Added: instrument quarantine; gate retirement (quiet per-bug gates move to an archive; the suite gets a ceiling). | 54-and-growing gates; Wyatt as QA |
| **The Memory** | CLAUDE.md ≤ ~150 lines (rules only) · `.claude/rules/*.md` with path triggers for subsystem lore · one dated DECISIONS file for Wyatt's rulings, verbatim · hooks for must-happens · auto-memory holds pointers. | The 1,164-line rulebook; five memory homes |
| **The Boardroom** | 1–2 batched question rounds/day via the question UI, recommendations marked, measurements included. Reports lead with what now works. Teaching: plain English first, real term once, ~one short lesson a week when a concept keeps mattering. | Interruptions; jargon; the correction stream |

## The apprenticeship (the "HUGE goal": learning)

Wyatt's open-floor ruling: learning is a co-equal goal — *"so that one day, when i lead a blended
team of humans as well as agents, i lead them skillfully and compassionately and clearly."* The
skills wyclau practices on him ARE that job's skills, so it is designed in, not appended:

- **Decisions arrive in executive shape** (options, trade-offs, recommendation, numbers) — every
  Boardroom round is a leadership rep.
- **Term-once always; one ≤5-minute lesson a DAY** tied to the live work, never homework
  (Wyatt's approval amendment, 2026-08-31: "I learn fast").
- **The Captain's log** *(renamed from "the chairman's log" at his ask, 2026-09-01)*: a derived record on the Glass of concepts he now owns and the decisions
  made with them. Mentor coaches the asking; this teaches the deciding.
- **A monthly retro on how he directed**, not what shipped.

## The launch line

1. **The reboot** (ESTIMATE 2–3 days — no measured basis yet; honestly re-sized at the end of
   day one; starts on approval): build Door + Glass + watchdog; rewrite the
   rulebook; consolidate memory; generate the kill-list, archive, delete. Exit test: engine runs
   24h unattended with zero silent stalls; fresh session productive inside 2 minutes. Game code
   untouched; the parallel fix session continues.
2. **The foundation** (~a week of engine work): the one-director rebuild (six steps; storyboard
   module already landed via the parallel session). **Launch date proposed and committed here**,
   with step 3 fully sized.
3. **The launch list** (sized at step 2): finished feel solo+crew, tutorial, analytics, the
   code-privacy decision (open — collides with "no build step"; gets its own Boardroom round),
   SEO. Everything lands through the full Proof.
4. **Launch, then the till** (+1 month): Reddit; then accounts + paid merch get their own
   planning round (real user data, real money — a new engineering class).

## The kill-list (pre-approved direction; generated list goes on the Glass for the record)

GSD phase machinery (71 commands, ~600KB agent defs, 13 always-firing hooks) · ROADMAP/STATE/
BACKLOG (absorbed into the Chart) · the long rulebook (reborn ≤150 lines) · four of five memory
homes · permanent per-bug gates (retirement policy) · agent team as a default (kept only for
genuinely parallel exploration).

## Standing permissions (interview rulings)

Without per-ask approval: ship to staging · merge to the shared working branch · big overnight
token spends · reorganize .planning/ and docs/. **Production always requires Wyatt.** Taste is
never defaulted — parked to the morning batch with a recommendation.

## Putting a choice in front of him — NUMBER OR LETTER THE OPTIONS

**His words, 2026-09-03 10:22 AM ET, pinned DO NOW on the Glass (`INBOX-20260903T142249Z`):**
*"Change the buttons that say Do It and Don't to Approve and Deny— and always when giving me
options to choose number or letter them"*

**"always" is his word, and it is the whole rule.** It governs **anywhere he is choosing** — the
labels in a question-UI card, a `BLOCKED ON WYATT` row that offers alternatives, a reply that lays
out three ways to go, a recommendation with a fallback beside it.

**Why, in terms of how he actually answers:** he replies in a few words, often from a phone.
*"B, but keep the coin"* is a sentence he can send in one breath. *"The second one — the one about
the coin"* is one he has to compose, against a list he has to re-read to index. **An unlabelled
list makes him do counting we could have done for him.**

**What he did NOT ask for:** the options re-ordered, shortened, or fewer of them. Numbering is
additive; nothing else about how options reach him changes. The recommendation still goes first
and still says so (rule 1).

⚠ **AND THIS IS THE WRONG HOME. IT BELONGS IN `.claude/CLAUDE.md` §1 AND `.claude/memory/DECISIONS.md`,
AND UNTIL IT GETS THERE THIS RULE IS ONE HOP OFF EVERY SESSION'S PATH.** Those two files are loaded
before a session ever opens this one; the Door does not name this file at all. Chart row `T-224`
carries the move.

⚠ **AND THE REASON IT LANDED HERE WAS STATED TOO WIDELY THE FIRST TIME — CORRECTED BY CEO 172,
BECAUSE AN OVER-STATED CONSTRAINT IS HOW A TEMPORARY FENCE BECOMES A PERMANENT EXCUSE.** What was
measured on 2026-09-03 is that **this watch's Edit tool was refused on both files.** What was
WRITTEN was that this answers `INBOX-20260902T2143Z` with a *"no for `.claude/` generally"* — and
that is false. `.claude/CLAUDE.md` was edited by a session on 2026-09-02 (`eee58a5d`) and
`.claude/memory/DECISIONS.md` the same day (`04d73d21`) — **and `04d73d21` is the very precedent
this section cites**, his *"always write to me in my local time"* rule, hand-written into
`DECISIONS.md` by a session one day earlier. So the class of rule this one is cannot reach the
canonical home is a class that reached it yesterday. The fence is on one agent's tool, not on the
file.

## Risks, named

1. The watchdog needs one ~30–60 min Razer session with Wyatt; "never stalls" is not claimable
   before it exists.
2. Code privacy vs "no build step" is a real, undecided architecture choice.
3. Wyclau can die by growing, like its predecessors: monthly pruning pass; any part that hasn't
   fired in a month justifies itself or goes.
