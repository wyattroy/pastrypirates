# Pastry Pirates — how we work

**Every rule here was learned the hard way, and the file is short so that it survives being read.**
If something is not in here, it is not a rule. Target: **under 200 lines** — models reliably follow
about 150–200 instructions and Claude Code spends ~50 of them before this file is read, so a rule
added without one removed makes every other rule weaker.

> ## THE POINT — read this before anything else
>
> Wyatt, 2026-08-20: *"I don't really care about the ticket. What I care is that the game is
> efficiently made more and more joyfully playable by people."*
>
> **At the start and end of any task:** *is the game better than it was this morning, in a way a
> player would notice?* If the honest answer is no, stop and change what you are doing. A session
> that closes its ticket perfectly and leaves the game no more playable has failed, however green
> its checks.

---

## Working with Wyatt

**He is a designer, not an engineer. He has said so many times. Believe him.**
**Taste, placement, wording and "how much is enough" are his. Mechanism is yours.**

**Ask 2–5 questions before building anything non-trivial — with the question UI, never as prose.**
Ask before writing code, not after a review round. Never ask what the codebase or a measurement can
answer; go find out, then ask only what is genuinely his call, with the measurement in the question
("at 360px it fits beside the clock by 2px — does that count as room?"). Mark a recommendation. He
often replies with a better third answer; that reply is the most valuable part.

**Never ask which item to do first.** *"don't ask me my preference for order: just do the work.
Every time."* Sequencing is yours. The rule above is about INTENT, never about order.

**Finish everything you can, and never hand back a list you could have shortened.** *"you should
ALWAYS complete ALL WORK THAT YOU CAN and if you have BLOCKING questions, write them into a
checklist artifact for me and MOVE ON WITH ALL OTHER WORK."* A diagnosis is not a delivery. **A
question only blocks the item it is about** — park that one, keep going. Park it somewhere durable:
`.planning/BACKLOG.md` for work, `.claude/memory/DECISIONS.md` for rulings. A list that lives only
in a chat reply is gone when the session ends.

**Plain English, and state the size.** Say what breaks for a player, then how you know. Nouns from
the game — dubloons, the Pass button — not from the toolchain. The test: *could he repeat your
sentence to someone who has played the game?* Every proposal says what a player will experience
differently, how much of the problem it covers ("5 of ~20"), and what it leaves undone. **A plan he
cannot size is a plan he cannot redirect.**

### Evidence, in the order it is worth having
1. **Play the game, in two tabs, and look at it** — the highest-value thing available, and it takes
   minutes. Play *before* analysis. Before handing him any change, screenshot the rendered picture,
   both sides in multiplayer. `docs/DRIVING-THE-GAME.md` first, before you touch a browser.
2. **Read every screenshot he sends, pixel by pixel. Never skip one.** Compare a pair element by
   element. His annotations are a floor, not a ceiling.
3. **Never report a defect as confirmed before you have measured it.** **A comment is not a
   measurement.** When a check condemns something known to work, suspect the check first. When the
   question is *"is this drawn wrong?"*, **pose the board**: same seed, before and after.

**Restate every mid-flight instruction in your next reply** — one line. When he refers back to
something he told you, **scroll up**; don't hunt through git.

**One sheet, one shape: BLOCKING QUESTIONS AT THE TOP, then checks with pass/fail/comments.**
Wyatt, 2026-09-09: *"items parked with questions [go] into our consistent Playtest artifact... with
blocking questions at the top, and the playtestable items below."* A question is not a check — it
has no pass, only an answer, and until it has one a piece of work is stopped. Give each one its
options and your recommendation. Answers come out FIRST when he copies his notes.

**Hand him a link he can tap, never a file path.** Anything he is meant to read, tick or use is
published as a page. **A markdown file is not a deliverable.** If you cannot publish, say so and
publish to staging instead.

**His list outranks yours.** He plays this game; you do not. If a process step stands between him
and telling you what is wrong, break the step. And say when the ask is not the biggest lever —
*"you asked for X; I think Y would do more for a player"* is a designer's job and he wants it.

**Do not build tooling when the ask is to fix the game.** Say so in one line and park it.

**Before he walks away, make sure he can still reach the work from his phone.**
- **Ask him to confirm the phone link works** when he says he is stepping away — the only reliable
  signal there is. **NEVER TELL HIM IT IS DOWN**: you cannot know that, and two sessions have told
  him so *while he was reading on his phone*. Say what you observed and ask.
- **He re-arms it himself** with `/remote-control`; a session cannot. In a remote session ask with
  `--text` mode — the menus do not render in the Claude app, so a normal question reads as a stall.
- **Front-load every decision before he goes**, and never leave a run silently blocked.

**His rulings live in [`.claude/memory/DECISIONS.md`](memory/DECISIONS.md).** Answer from them.
Never re-ask a settled question.

---

## How the game is designed

**ONE PIPE, ONE RENDERER, ONE INPUT DOOR.** Host/guest decides who *computes* and who *creates the
room* — never what a player *sees*. Human/bot decides only *how an action is chosen* — never what
may be done. Everything else is one path: the engine emits, one consumer draws, one door takes
actions in. **When a second consumer of the same thing appears, converge** — make the first go
through the new path too, never run two side by side. If the answer to *"what makes these two
agree?"* is "nothing, we keep them in step", that is the defect, before a line is written.

**Consistency is a core value.** An interaction that behaves differently in two places is a bug
unless Wyatt chose the exception. Change one, sweep every surface it touches, and say which.

**Nothing is a constant.** A hardcoded price, threshold or cap stands in for a quantity that moves
by an order of magnitude across a voyage. Derive it — the elegant version almost always *deletes*
code.

**Bots and humans have identical rules and affordances**, so any "should bots be allowed to…?" is
already answered. When the two differ, levelling the human *up* is frequently the right answer.

**The narration box reveals top to bottom, in DOM order** — back button, message, buttons, helper
text.

**Credits and the About page are not in pirate speak.** They are outside the game world; he thanks
real people in his own voice. A `ye`/`you` difference there is correct. Never "fix" it.

**Read the graveyard before re-running a settled argument** — what was tried and thrown away lives
in commit messages, not design docs: `git log --all --oneline --grep="<subsystem>" -i` and
`git log --all --format="%H %s" -S "<the number or fn>"`.

---

## Where getting it wrong costs real damage

**`CNAME`, `robots.txt` and `sitemap.xml` never leave this repo.** Pages reads `CNAME` as a *claim*
on the domain — a second repo containing it takes the live game down for real players. Two sessions
came within one command of this. Never hand-roll a deploy sync.

**`git fetch` before you trust any ref.** `origin/main` is this machine's last-downloaded snapshot.
Local `main` once sat 457 commits behind and produced a confident, wrong conclusion. Never report
git state from memory — re-run the command.

**Kill every headless browser and local server you start, before you reply.** He has twice found
abandoned probes cooking the laptop he was working on. `node scripts/qa/stray_probe_check.mjs`
reports the truth; `pkill` does not exist in Git Bash on Windows.

**Absolute paths, always.** More than one tree shares an internal layout, so a mis-rooted edit opens
a real file, applies cleanly, passes `node --check`, and modifies the wrong copy — every safety
signal reporting success. Ask: `git rev-parse --show-toplevel`.

**He works on two machines** (a MacBook Air and a Windows laptop, `Wy-Blade`) — which one he is
sitting at is not which one you are running on. **Both share the one `dev` branch, so `git pull
--rebase` before every commit**, and never end a session holding commits that exist on no other
machine: one sat three days holding 40 hours of work and a hand-made drawing that existed nowhere
else on Earth.

---

## The workflow

**One branch: `dev`.** All work happens there. No branch per bug, no branch per session.

```bash
git checkout dev && git pull origin dev     # always start here
npm test                                    # the gates — exit 0
node scripts/sea_trial.mjs                  # sail it; writes .planning/SEA-TRIAL.md
npm run deploy:staging -- "what changed"    # -> staging.playpastrypirates.com
```

**Then he plays staging and gives a verdict.** The build stamp must read
`<stamp>-staging@<sha>`; a bare stamp means he is looking at production and the publish did not
land.

**On his approval, and only then**, `dev` merges into `main` — served to real players within a
minute. No build step, no other gate; reversible by reverting the merge.

> **Staging is published by COPY into a separate repo**, so **git ancestry cannot answer "did my
> work ship?"** — `node scripts/where_is_my_work.mjs` asks the sites themselves. Production being
> older than `dev` is normal, not a fault to report.

**Show finished work to a fresh reviewer before showing it to him** — the `ceo` skill, on request or
when a change is big. Its question is narrow: *did the thing he asked for actually happen?* Adjacent,
competent work that misses the ask is what it catches. Its verdict reaches him in its words,
especially when it is bad.

---

## Read the subsystem's own doc before writing a line

| Touching… | Read first |
|---|---|
| Anything that trades | [`docs/TRADE-SYSTEM.md`](../docs/TRADE-SYSTEM.md) |
| Sound, music, the mute control | [`docs/AUDIO.md`](../docs/AUDIO.md) |
| Anything drawn on the board | [`docs/BOARD-RENDERING.md`](../docs/BOARD-RENDERING.md) |
| Bot behaviour or tuning | [`docs/BOT-DESIGN-PRINCIPLES.md`](../docs/BOT-DESIGN-PRINCIPLES.md), [`docs/BOT-V3-RACE-PLANNER.md`](../docs/BOT-V3-RACE-PLANNER.md) |
| Browser or playtest automation | [`docs/DRIVING-THE-GAME.md`](../docs/DRIVING-THE-GAME.md) |
| Git, deploying, the live domain | [`docs/GIT-AND-DEPLOY.md`](../docs/GIT-AND-DEPLOY.md) |
| Testing or trusting any instrument | [`docs/QA-PROCESS.md`](../docs/QA-PROCESS.md) |
| **Anything that looks like a host/guest bug** | [`docs/INTENDED-BEHAVIOUR.md`](../docs/INTENDED-BEHAVIOUR.md) — *the things that look wrong and are not. He has explained the same one three times* |
| Everything, at session start | [`docs/HARD-WON-LESSONS.md`](../docs/HARD-WON-LESSONS.md) |

**Two facts that save the most time.** An HTML overlay mapped to board coordinates **must** be added
to `CAM_HTML_LAYERS` or it detaches when the director zooms; and anything animating continuously
must be HTML, not SVG — Chrome cannot composite an SVG transform animation at all.

**Commit messages use `-F -` and a quoted heredoc, never `-m "…"`.** This repo's messages contain
backticks, quotes and `$`, which break a double-quoted shell argument.

---

## The project

**Pastry Pirates** — a browser pirate-themed pastry board game, solo against AI captains or
real-time multiplayer via Firebase. Vanilla HTML/CSS/JS, ES modules, **no build step**. Must run
correctly in Safari and Chrome.

**If a fact belongs to the game, put it in the ENGINE and emit an event.** The engine is seeded
(`mulberry32`), but **there is no live determinism corpus** — the verify is out of `npm test` and
fails 31/31 seeds, and the fixtures belong to the frozen `classic/` engine. So a new event costs
nothing, and a UI-tier workaround for an engine-shaped fact is how a guest ends up unable to see
what the host can. *(Evidence and his ruling: `DECISIONS.md`, 2026-09-09. Whoever binds a corpus
again edits this paragraph in the same commit.)*
