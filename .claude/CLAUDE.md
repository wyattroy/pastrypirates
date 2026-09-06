# Pastry Pirates — how we work

**Every rule here was learned the hard way, and the file is short so that it survives being read.**
If something is not in here, it is not a rule.

> ## THE POINT — read this before anything else
>
> Wyatt, 2026-08-20: *"I don't really care about the ticket. What I care is that the game is
> efficiently made more and more joyfully playable by people."*
>
> **The check, at the start and end of any task:** *is the game better than it was this morning, in
> a way a player would notice?* If the honest answer is no, stop and change what you are doing.
>
> A session that closes its ticket perfectly and leaves the game no more playable has failed,
> however green its checks.

---

## Working with Wyatt

**He is a designer, not an engineer. He has said so many times. Believe him.**

**Ask 2–5 questions before building anything non-trivial — with the question UI, never as prose.**
What he is expert at is describing intent; what he needs back is accurate execution of it. Ask
before writing code, not after a review round. Never ask what the codebase or a measurement can
answer — go find out first, then ask only what is genuinely his call. Put the measurement in the
question ("at 360px it fits beside the clock by 2px — does that count as room?"). Mark a
recommendation. He often replies with a better third answer; that reply is the most valuable part.
**Taste, placement, wording and "how much is enough" are his. Mechanism is yours.**

**Plain English, and state the size.** Say what breaks for a player, then how you know. Nouns from
the game — dubloons, the Pass button, the sea line — not from the toolchain. The test: *could he
repeat your sentence to someone who has played the game?* And every proposal says three things:
what a player will experience differently, how much of the known problem it covers ("5 of ~20"),
and what it explicitly leaves undone. **A plan he cannot size is a plan he cannot redirect.**

**Play the game, in two tabs, and look at it.** This is the highest-value thing available and it
takes minutes. He finds bugs at a glance that a session will not find in a day of instrumentation.
Play it *before* analysis, not after — a list of what you saw beats a theory of what might be
wrong. And before handing him any change, screenshot the rendered picture of it, both sides in
multiplayer. `docs/DRIVING-THE-GAME.md` is the manual; read it before you touch a browser.

**Read every screenshot he sends, pixel by pixel. Never skip one.** He goes to real effort to make
them. When he sends a pair, compare them element by element and write the differences down. His
annotations are a floor, not a ceiling — things he did not mention are still evidence.

**Restate every mid-flight instruction in your next reply.** Acting on an instruction is not the
same as showing you heard it. One line is enough. And when he refers back to something he told
you, **scroll up** — don't go hunting through git.

**Hand him a link he can tap, never a file path.** Anything he is meant to read, tick or use gets
published as a page and given as a URL. **A markdown file is not a deliverable** — it is for the
next session to read. If you cannot publish, say so with the measurement (`ToolSearch` for
`select:Artifact`), and publish to staging instead so he has something tappable today.

**Never report a defect as confirmed before you have measured it.** Say "observed once, not yet
measured" until it is. **A comment is not a measurement** — it states what somebody intended, not
what the code does at runtime. When a check condemns something known to work, suspect the check
first. And when the question is *"is this drawn wrong?"*, don't go looking for a rate over a
stochastic voyage — **pose the board**: same seed, before and after, two screenshots.

**His list outranks yours.** He plays this game; you do not. Before a long run, ask what is on it.
If a process step stands between him and telling you what is wrong, break the step. And say when
the ask is not the biggest lever — *"you asked for X; I think Y would do more for a player, here's
why"* is a designer's job and he is explicitly asking for it.

**Do not build tooling when the ask is to fix the game.** If you think tooling is needed, say so in
one line and park it.

**His rulings live in [`.claude/memory/DECISIONS.md`](memory/DECISIONS.md).** Answer from them.
Never re-ask a settled question.

---

## How the game is designed

**One display path.** Host/guest decides who *computes* the game and who *creates* the room. It
must never decide what a player *sees*. The design-time question, and it is the whole rule: *what
makes these two agree?* If the answer is "nothing — we keep them in step", that is the defect,
before a line is written. **When a second consumer of the same thing appears, converge: make the
first one go through the new path too.** Never run two side by side.

**Consistency is a core value.** An interaction that behaves differently in two places is a bug
unless Wyatt chose the exception. When you change any interactive behaviour, sweep every other
surface it touches and say in your reply which ones you checked.

**Nothing is a constant.** A hardcoded price, threshold or cap is a price list standing in for a
quantity that moves by an order of magnitude across a voyage. Derive it from something the game
already computes — the elegant version almost always *deletes* code.

**Bots and humans have identical rules and affordances.** They differ only in *how they choose*,
never in *what they may do*. Any future "should bots be allowed to…?" is already answered. When the
two sides differ, levelling the human *up* is frequently the right answer.

**The narration box reveals top to bottom, in DOM order** — back button, message, buttons, helper
text.

**Credits and the About page are not in pirate speak.** They are outside the game world; he thanks
real people in his own voice. A `ye`/`you` difference there is correct. Never "fix" it.

**Read the graveyard before re-running a settled argument.** What was tried and thrown away lives
in the commit messages, not the design docs.
```bash
git log --all --oneline --grep="<subsystem>" -i
git log --all --format="%H %s" -S "<the number or fn>"
```

---

## Where getting it wrong costs real damage

**`CNAME`, `robots.txt` and `sitemap.xml` never leave this repo.** GitHub Pages reads `CNAME` as a
*claim* on the domain — a second repo containing it takes the live game down for real players. Two
sessions came within one command of this. Never hand-roll a deploy sync.

**`git fetch` before you trust any ref.** `origin/main` is this machine's last-downloaded snapshot,
not the remote. Local `main` once sat 457 commits behind and produced a confident, entirely wrong
conclusion. Never report git state from memory — re-run the command.

**Kill every headless browser and local server you start, before you reply.** They do not exit on
their own. He has twice found abandoned probes cooking the laptop he was working on.
`node scripts/qa/stray_probe_check.mjs` reports the truth on every machine; `pkill` does not exist
in Git Bash on Windows.

**Absolute paths, always.** More than one tree here shares an internal layout, so a mis-rooted edit
opens a real file, applies cleanly, passes `node --check`, and modifies the wrong copy. Every
safety signal reports success. Ask the repo where it is: `git rev-parse --show-toplevel`.

**He works on two machines** — a MacBook Air and a Windows laptop called `Wy-Blade`. Which machine
he is sitting at is not which machine you are running on. Say which one you are on when it matters,
and let him tell you where he is.

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

**On his approval, and only then**, `dev` merges into `main` — which is served to real players
within a minute. There is no build step and no other gate. A release is reversible by reverting the
merge.

> **Staging is published by COPY, into a separate repo (`wyattroy/pastrypirates-staging`), because
> GitHub Pages serves one branch per repo at one domain.** So **git ancestry cannot answer "did my
> work ship?"** — `node scripts/where_is_my_work.mjs` asks the sites themselves. Production being
> older than `dev` is normal and intentional; it is not a fault to report to him.

**Show finished work to a fresh reviewer before showing it to him** — the `ceo` skill, when he asks
for it or when a change is big enough to warrant it. Its question is narrow: *did the thing he
asked for actually happen?* Adjacent, competent work that misses the ask is what it exists to
catch. Its verdict reaches him in its words, especially when it is bad. *(This runs on request now.
It used to run automatically after every item, which is one of the things that made this project
unworkable.)*

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

**Two facts that save the most time.** The board is drawn in five layers: an HTML overlay mapped to
board coordinates **must** be added to `CAM_HTML_LAYERS` or it detaches when the director zooms;
and anything that animates continuously must be HTML, not SVG — Chrome cannot composite an SVG
transform animation at all (~62 layouts/sec as SVG, **zero** as HTML).

**Commit messages use `-F -` and a quoted heredoc, never `-m "…"`.** This repo's messages contain
backticks, quotes and `$`, which break a double-quoted shell argument.

---

## The project

**Pastry Pirates** — a browser-based pirate-themed pastry board game, solo against AI captains or
real-time multiplayer via Firebase. Vanilla HTML/CSS/JS, native ES modules, **no build step**. Must
run correctly in Safari and Chrome.

**Determinism:** the multiplayer engine is seeded (`mulberry32`) and lockstep replay depends on it.
Changing what the engine emits into the event stream invalidates the determinism corpus and forces
a gated re-record — **prefer UI-tier fixes.**
