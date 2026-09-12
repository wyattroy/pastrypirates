# The chairman interview — 2026-08-30/31

24 questions asked through the question UI in six rounds, per the founding note's request.
Answers recorded faithfully; write-ins verbatim. These are RULINGS — the wyclau design answers
to them, and future sessions cite them instead of re-asking.

## Round 1 — Goals and horizon

1. **What is Pastry Pirates in two years?** → *A living game I grow for years.*
2. **Who should be playing it in a year?** → Write-in: *"i wanted to launch this on reddit a month
   ago. every day that it's not ready makes me anxious."* **The launch is overdue and the anxiety
   is daily.**
3. **How real are the login/paid-merch ideas?** → *Within a month of launch.* Accounts and payment
   are near-term architecture, not someday-maybe.
4. **What shipped thing would make you happiest next?** → *The game feels finished* — pacing,
   sound, polish, small delights.

## Round 2 — The launch bar, the fun

5. **What does "ready to launch" mean?** → Write-in, the five-item launch bar, verbatim:
   1. *finish feeling solo and crew*
   2. *tutorial for first-time players*
   3. *site analytics*
   4. *privacy/build step that stops others from stealing the code and copying it*
   5. *SEO that means someone can google "pastry pirates" and it comes up*
   (Note: item 4 collides with the standing "no build step" rule — a real architecture decision,
   flagged, not yet made.)
6. **A committed launch date?** → *Yes — set a date and plan backwards*, picked together once the
   work is sized.
7. **What was the fun, when it was fun?** → Write-in first: *"feeling agency to affect change and
   create a playable vision — same as [watching my idea come alive fast], but with a focus on my
   own agency to affect a feedback loop"* — plus: watching ideas come alive fast, the creative
   back-and-forth, learning and getting better.
8. **What kills the fun today?** → *Being the QA* + *huge effort, tiny result* + *repeating
   myself.* (Notably NOT "wrong reports" — the wound is the burden and the ratio, not the candour.)

## Round 3 — Trust and rhythm

9. **What rebuilds trust fastest?** → Write-in, verbatim, the single most load-bearing answer of
   the interview:
   > *"a process/system that actually worked — it's why i'm writing this to you now. if we can
   > create one, i don't care whether it works on small or big wins, or how fast it is; it must
   > catch its own mistakes, report accurately and truthfully, and actually work. it has to not
   > disrupt my day in order to stay on track. i have to know that even when i'm not looking at
   > it, it's still running — that's a big one. currently, the processes just stop, randomly, and
   > unless i check in on claude, nothing will get done. it's a constant frustration. so maybe
   > that — a dependable agent that never stops building, that i can see is making progress
   > whenever I check in on it, and i never have to worry is shut down or stalled."*
10. **How should bad news reach you?** → *Only corrections that change my decisions.*
    Self-corrections that don't affect him go in the log, not in his face.
11. **How often pulled in for decisions?** → *A few decision points per day, batched* —
    well-prepared rounds like this interview; live interruptions only for emergencies and
    blocking taste calls.
12. **Ideal day shape?** → *Varies too much to fix* — design for flexibility; any session must
    pick up the thread at any hour.

## Round 4 — How work flows

13. **One front door for all work sessions?** → *Yes — one door, always.*
14. **What do you see when you check in?** → *One live status page* — a single link: what's
    running, last progress timestamp, what shipped today, what's blocked on him. Stale timestamp
    = something's wrong, no interpretation needed.
15. **Bar before a build reaches your eyes?** → *Claude played full voyages in all three modes +
    host/guest screenshots compared.* He playtests for taste and fun, never for "does it work."
16. **The one-director rebuild vs the launch list?** → *It's the foundation — do it early.*
    Finish-feel in crew sits on top of it.

## Round 5 — The existing machinery

17. **Prune the accumulated machinery?** → *Prune aggressively.* Archive-then-delete; git history
    is the safety net; the keep-list is built from evidence.
18. **Rewrite CLAUDE.md to ~150 lines?** → *Yes — rewrite it.* War stories move to
    trigger-loaded files; must-happen rules become hooks.
19. **Consolidate the five memory systems?** → *One system.* One home for every ruling and
    lesson, one index, detail at its trigger.
20. **Teaching built in?** → *Term-once plus occasional short lessons* — plain English first, the
    real term named once; a deliberate five-minute explainer when a concept keeps mattering, at
    most one a week.

## Round 6 — Autonomy and the open floor

21. **Standing permissions (no per-ask approval):** ship to staging · merge to the shared working
    branch · big overnight token spends · reorganize planning/docs files. **Production remains
    approval-only, always.**
22. **Where does the engine live?** → *The Razer, as the workhorse.* Cloud for bounded
    side-tasks; MacBook joins at night.
23. **Blocked on taste at 3am?** → *Park it, keep building elsewhere.* The question joins the
    morning batch with a recommendation attached. Taste is never defaulted.
24. **The open floor** → Write-in, verbatim:
    > *"i'm worried that all of your interview questions, though they sound good, will yeild
    > nothing. i'm worried that the thing they yield will operate slower than i want. i'm worried
    > that somehow, none of it will restore my abundant sense of agency that i feel when building
    > small projects with you. i'm also hopeful — i have inherent hope in you, and in our
    > collaboration. i want to rebuild trust. i have already learned so much from you, i want to
    > learn more. one other HUGE goal of all of this is learning — that's why mentor was the
    > first thing i built. i want you to advise me, teach me, coach me. so that one day, when i
    > lead a blended team of humans as well as agents, i lead them skillfully and compassionately
    > and clearly, from all we have learned together."*

## Also ruled during setup (before the interview proper)

- **Scope:** everything on the table — GSD, the team structure, the rulebook itself.
- **Parallel work:** his fix sessions continue during the design phase; the cutover moment (when
  wyclau replaces rules/hooks) happens at a quiet moment with fix sessions closed.
- **Where wyclau lives:** designed general, proven in this repo first, extracted to claude-kit
  once it holds.
