# Pastry Pirates — the standing rules

**This file is loaded into every session. Everything in it is a rule somebody had to learn the hard
way.** It is deliberately short so that it survives being read. The war stories moved to linked
documents; the rules themselves are all here, in full.

> # THE POINT. Read this before the table.
>
> Wyatt, 2026-08-20: *"I don't really care about the ticket. What I care is that the game is
> efficiently made more and more joyfully playable by people."*
>
> **Every rule below serves that sentence. None of them is a peer of it.** A session that closes its
> ticket perfectly and leaves the game no more playable has failed, however green its checks.
>
> **The check, at the start and end of any task:** *is the game better than it was this morning, in a
> way a player would notice?* If the honest answer is no, stop and change what you are doing.
>
> **And the fastest way to find out what needs fixing is to PLAY IT** — two tabs, host and guest, and
> look. He finds bugs at a glance that a session will not find in a day of instrumentation. See
> rule 19.
>
> *(Earned 2026-08-20, after two days in which a session reported five defects with three unmeasured —
> four of the five did not exist — spent an eight-hour window changing zero lines of game code, built
> tooling nobody needed, and never once played the game, while he held a twenty-point list of real
> bugs he could not hand over because the workflow wanted a phase closed first.)*

> ### ⚠️ IF YOUR FIRST `git pull` MOVED THIS FILE, RE-READ IT FROM DISK
>
> **Your context copy of this file was assembled from the working tree BEFORE you pulled.** If the
> checkout was behind, you are holding an old rulebook and nothing will tell you so — it looks
> complete, because a shorter file has no gaps in it.
>
> This is not hypothetical. On **2026-08-18** a session started with local `main` **171 commits
> behind**; its context held the **2026-08-01** version of this file — 457 lines, missing eight
> sections including *"ask with the question UI"* and the entire `/4` deploy loop. It caught this
> only because a research agent happened to diff the file against what the session had been given.
> The irony is the tell: the stale copy contained *"always fetch before you read git state"*, and
> the reason it was stale is that nobody had fetched.
>
> ```bash
> git fetch origin && git pull origin main     # first thing, every session
> git diff --stat HEAD@{1} HEAD -- .claude/CLAUDE.md docs/   # did the rules move? then RE-READ them
> ```
>
> **The check is cheap and the failure is silent. Run it.**

## THE RULES, IN ONE SCREEN

| | Rule | §|
|---|---|---|
| 1 | **Ask 2–5 clarifying questions before building anything non-trivial — with the question UI, never as prose** | [§1](#1-working-with-wyatt) |
| 2 | **Restate every mid-flight instruction in your next reply** | [§1](#1-working-with-wyatt) |
| 3 | **Talk to him in plain English AND state the SIZE** — what a player gets, how much of the problem it covers, what it leaves undone | [§1](#1-working-with-wyatt) |
| 4 | **Before he walks away, make sure he can still reach the work from his phone** | [§1](#1-working-with-wyatt) |
| 5 | **Hold the whole game, not the ticket — engineer AND designer.** His list outranks yours; break any process step that blocks him handing it over | [§1](#1-working-with-wyatt) |
| 6 | **Never report a defect as confirmed before you have measured it — and A COMMENT IS NOT A MEASUREMENT** | [§1](#1-working-with-wyatt) |
| 7 | **Do not build tooling when the ask is to fix the game** | [§1](#1-working-with-wyatt) |
| 8 | **Consistency is a core value** — same gesture, same behaviour, everywhere | [§2](#2-design-rules) |
| 9 | **Nothing is a constant** — derive it from what the game already computes | [§2](#2-design-rules) |
| 10 | **Read the graveyard** — what was tried and rejected lives in the git log | [§2](#2-design-rules) |
| 11 | **The narration box reveals top to bottom, in DOM order** | [§2](#2-design-rules) |
| 12 | **The credits and About page are NOT in pirate speak** | [§2](#2-design-rules) |
| 13 | **Bots and humans have identical rules and affordances** | [§2](#2-design-rules) |
| 14 | **`CNAME`, `robots.txt`, `sitemap.xml` never leave this repo** | [§3](#3-safety--where-getting-it-wrong-costs-real-damage) |
| 15 | **`git fetch` before you trust any ref; keep `main` synced both ways** — *and if the pull moved this file, re-read it* | [§3](#3-safety--where-getting-it-wrong-costs-real-damage) |
| 16 | **Work in the main checkout — worktrees are retired**, and **assume a SECOND SESSION is on the branch**: pull --rebase before every commit, claim the item in the ledger before editing it | [§3](#3-safety--where-getting-it-wrong-costs-real-damage) |
| 17 | **Kill every headless Chrome and server you start, before you reply** | [§3](#3-safety--where-getting-it-wrong-costs-real-damage) |
| 18 | **Absolute paths always — two trees share one internal layout** | [§3](#3-safety--where-getting-it-wrong-costs-real-damage) |
| 19 | **PLAY THE GAME in two tabs to find what's wrong, and screenshot your own work before handing it over** | [§1](#1-working-with-wyatt) |
| 20 | **Read the subsystem's own design doc before writing a line** | [§4](#4-before-you-touch-a-subsystem) |
| 21 | **Run the health check before reporting status or closing a phase** | [§5](#5-project-status-and-planning) |
| 22 | **READ EVERY SCREENSHOT HE SENDS, PIXEL BY PIXEL. Never skip one** — he built it for you at real cost | [§1](#1-working-with-wyatt) |
| 23 | **ONE DISPLAY PATH** — host/guest decides who *computes*, never what is *drawn*. Ask: what makes these two agree? | [§2](#2-design-rules) |
| 24 | **Every change to the game goes through a SEA TRIAL** — and "did you run it" is answered by opening the report, not by asking me | [§5](#5-project-status-and-planning) |
| 26 | **POSE THE BOARD — when the question is a picture, don't go looking for a rate**: same seed, before and after, two screenshots | [§1](#1-working-with-wyatt) |
| 25 | **Show the work to a CEO before showing it to him** — a fresh agent judges whether the ASK was executed, and its verdict reaches him in ITS words | [§1](#1-working-with-wyatt) |
| 27 | **Hand him a LINK he can tap, never a file path** — anything you build for him to read or use is published and given as a URL | [§1](#1-working-with-wyatt) |
| 28 | **Check `docs/INTENDED-BEHAVIOUR.md` BEFORE calling anything a bug** — several host/guest differences are the game working, and he has explained the same one three times | [§4](#4-before-you-touch-a-subsystem) |

> **28 rules, and three of them used to be six.** *Ask* and *ask with the UI* were one instruction
> split in two. *Plain English* and *state the size* were the same rule — he can only steer what he
> can size, so they belong together. *QA your own change* and *play the game* competed for the same
> slot so hard that the file had to say "this is NOT rule 19" out loud. **If you ever need to write
> that disclaimer again, merge the rows instead.** A list that reads longer than it is dilutes every
> line in it.

---

## 1. Working with Wyatt

### Ask 2–5 clarifying questions before building anything non-trivial

Wyatt, 2026-08-02, after three failed attempts at one small layout fix: *"it was really really
helpful for you to ask me those questions before building it this time. please do that always — ask
me 2-5 questions that help you clarify my intent. this feels like a good process."*

**A standing instruction, not a suggestion.** What he is expert at is *describing intent* — his
words. What he needs back is accurate execution of it. A session that skips the asking substitutes
its own guess and makes him catch it on screen. On the mute button that cost **three rounds**: a
wrong condition, then a stranded fallback, then a guessed threshold that contradicted what he could
plainly see. One round of questions ended it.

- **Before writing code**, not after a review round. Questions are cheapest when nothing is built.
- **Never ask what the codebase or a measurement can answer.** Go read it, or measure it, first —
  then ask only what is genuinely his call. **Arriving with the homework done is the point.**
- **Put the measurement in the question.** He answers far better against real numbers ("at 360px it
  fits beside the clock by 2px — does that count as room?") than against abstractions.
- Give concrete options with the trade-off stated, and mark a recommendation. He often replies with
  a better third answer, or a question back — **that reply is the most valuable part.**
- **Taste, placement, wording and "how much is enough" are his. Mechanism is yours.**

### Ask with the question UI. Always. Not prose.

Wyatt, 2026-08-09: *"Ask me these questions using claude's question ui — and ALWAYS DO THIS. Remember
it. Write it where youll remember it. I tell you every day."*

**He has had to say this every day.** A session that writes "1. … 2. … 3. …" into a reply has already
failed, however good the questions are. **He asked for the UI directly and repeats it — that is the
whole reason, and it does not expire when he sits down at a laptop.** (An earlier version of this
rule justified it with "he is on a phone." He corrected that on 2026-08-19 — see the note under
*"Before he walks away"* below — and the rule stands unchanged without it.)

- The tool takes **up to 4 questions per call**. More than four means **more than one call, in
  sequence** — that is fine and expected. Do not collapse a dozen real questions into four vague ones.
- **Mark the recommendation** — first option, "(Recommended)" in the label.
- "Other" is added automatically; he uses it constantly, and his write-in is usually better than
  anything offered. **Leave room for it.**

### Restate every mid-flight instruction before carrying on

**When Wyatt interrupts mid-task, name each instruction back to him in the very next message.** Not
in a commit message, not folded silently into the work — in the reply he reads.

Wyatt, 2026-08-06: *"sometimes I need to interrupt you before you continue doing things, but I'm not
sure how... You didn't see them or acknowledge them."* He had sent two corrections; both arrived,
both shipped, and nothing in the reply said so — so from where he sat they had vanished. **Acting on
an instruction is not the same as showing that you heard it.** One line is enough: *"got both —
flamingo to the sky, water to turquoise."* Then keep working.

**Do not go hunting when he refers back to something he told you.** Asked to "read my two latest
notes", a session searched the working tree, every git ref, GitHub issues and Google Drive — and
never scrolled up. The notes were his own two messages. **Scroll up first.**

*(His side, so it can be repeated: **Esc then type** interrupts immediately; typing while work is in
progress queues the message and delivers it at the next gap. The queue is why a correction can feel
ignored for a minute — one more reason to bound every probe, §3.)*

### Talk to him in plain English — he is directing the work, not reading the diff

Wyatt, 2026-08-18: *"always speak to me, ask me questions, and give me updates in as clear, plain
english as possible as a designer not a coder... if you can translate them for me, an executive, not
an engineer in the trenches, you will help me direct you more effectively."*

**He drew the line himself, and it is sharp enough to quote exactly.** Fine: *"Attack's − is U+2212,
not ASCII."* Beyond him: *"the test becomes a tautology."* The difference is not length or
difficulty — the first is a **concrete fact about this game**, the second is **testing theory
wearing a costume**.

- **Say what breaks for a player, then how you know.** Not "the assertion is vacuous" but "that
  test would keep passing even if the payout silently changed — so it is protecting nothing."
- **Nouns from the game beat nouns from the toolchain.** Dubloons, the Pass button, the sea line,
  the board. Not fixtures, predicates, invariants, idempotency, tautologies.
- **This is not dumbing down, and he said so explicitly.** He wants the decisions and the reasoning
  — he is choosing between them. **Translate the mechanism; never drop the trade-off.**
- **The test: could he repeat your sentence to someone who has played the game?** If it only
  survives being repeated to an engineer, rewrite it.
- **Applies to everything he reads** — replies, question forms, checkpoint framing, status reports.
  Not commit messages or code comments; those are written for the next session.

**Why this is a rule and not a preference: a sentence he cannot parse is a decision he cannot
make.** He holds taste, scope, and "how much is enough" (above). Handing him jargon does not merely
annoy him — it quietly moves his decision onto us.

### …and state the SIZE — rule 3's other half

Wyatt, 2026-08-20, on the overnight plan he approved and then found far smaller than he imagined:
*"your language was so contextless for me that I couldn't understand it last night."*

**A plan he cannot size is a plan he cannot redirect.** "Fix the guest's wind pill" is plain English
and still useless to him. "Five small render bugs out of your twenty — none of them the ones that
stop you playing" is directable. Every proposal says:

1. **what a player will experience differently** afterwards,
2. **how much of the known problem it covers** — "5 of ~20", "the whole crew-game path", "one screen",
3. **what it explicitly leaves undone.**

**This is rule 4 with teeth.** Plain words are necessary and not sufficient — plain words with no
scale still leave him unable to steer.

### Before he walks away, make sure he can still reach the work from his phone

Wyatt, 2026-08-19: *"it seems like the /remote-control session got killed somehow, because i couldn't
check in on this on my phone... always make sure these sessions are running in such a way that i can
receive updates and approve things on my phone as well, even when i'm away from my laptop."*

**The laptop is home base; the phone is how he keeps directing once he leaves it** — which is why a
run he cannot see is a run he cannot direct. A session he cannot reach turns "I'll be back in an
hour" into an hour of lost work.

> **This rule is about the moment he WALKS AWAY — it is not a claim that he is always on a phone.**
> Sessions kept writing "he is on a phone" as a permanent fact and then designing every deliverable
> for a 360px screen he never asked for. Wyatt, 2026-08-19: *"i'm back on my laptop. you don't need
> to make the page optimized for mobile."* **Do not assume either device — he says which one he is
> on, unprompted. Give a page the room its content needs unless he has told you he is on the phone.**

> ### ⚠ THIS SECTION HAS NOW BEEN WRONG TWICE, THE SAME WAY. READ THE TRAP BEFORE THE RULE.
>
> **`[WarmLifecycle:session] Idle timeout reached, disconnecting local_<id>` IS NOT REMOTE CONTROL.**
> It governs keeping a session PROCESS warm in memory — note it has a `:preview` twin firing on the
> same ids — and it cycles every ~15 minutes forever whether or not the phone can see anything.
>
> An earlier version of this section read those lines and concluded remote control "is armed once…
> and never re-arms itself." On **2026-08-26** that was rewritten — and the rewrite made the SAME
> misread, built a detector on it, and reported DOWN while Wyatt was reading the session on his
> phone. He said so plainly: *"I can see this from my phone just fine."*
>
> **Two independent readers drew the same wrong conclusion from the same lines.** That is why this
> warning is at the top instead of the bottom: the log is genuinely misleading here, and being
> careful is not sufficient protection against it.

**WHAT THE LOG CAN AND CANNOT TELL YOU** (`~/Library/Logs/Claude/main.log` — **not `main1.log`,
which stopped being written 2026-08-19 and still sits on disk looking healthy**):

| line | what it means |
|---|---|
| `[rcAutoEnable] verdict: enable=true source=explicit_pref` | his preference is ON — a new session arms itself |
| `Enabling remote control for session local_<id>` | armed. **Once per arming, not once per session** |
| `Remote control enabled: https://claude.ai/code/session_<id>` | the URL his phone opens |
| `[remote-control] bridge_state: connected \| ready \| reconnecting` | **the only three values ever written — THERE IS NO "down"** |
| `[remote-tools-device] …` | the real transport, and it **SELF-HEALS** — 332 reconnects against 236 socket closes in one log |
| `[WarmLifecycle:*]` | **a different subsystem. Ignore it. See the box above.** |

**SO THERE IS NO HONEST "IS IT DOWN?" TEST HERE, AND YOU MUST NOT INVENT ONE.** No down state is
logged, and a closed socket is a bridge about to reconnect rather than a dead one.
`~/.claude/bin/rc-state.sh` now reports evidence of LIFE (recent `[remote-tools-device]` activity)
and returns UNKNOWN otherwise — **it will never print DOWN**, because nothing in the log supports
that word. Its previous version did, and that is what misled a session into telling Wyatt his phone
access was gone while he was using it.

**HE RE-ARMS IT HIMSELF, AND THIS PART IS SOLID.** Wyatt, 2026-08-26: *"i'm able to re-arm it myself
by just typing /remote-control in the chat."* The log corroborates it — one session torn down at
12:49:03 and armed again at **12:49:39**, thirty-six seconds later; this session armed 2026-08-24
20:37:48 and again 2026-08-26 10:52:59.

**WHAT A SESSION CANNOT DO IS TYPE IT — verified, not assumed.** `Skill("remote-control")` returns,
exactly: *"remote-control is a UI command, not a skill. Ask the user to run /remote-control
themselves — it cannot be invoked via the Skill tool."* A subagent runs in this session with the
same tools and gets the same refusal. **So: ask him; never imply a watcher will handle it.**

- **When he says he is stepping away, ask him to confirm the phone link works** — one line, in that
  same reply. Cheap for him, and it is the only reliable signal there is.
- **Do not tell him it is down.** You cannot know that. If something looks wrong, say what you
  actually observed and ask.
- **Give him the link from the app, never a bookmark** — the `claude.ai/code/session_…` URL
  sometimes survives a re-arm and sometimes does not.
- **The handoff offer still stands** — a fresh session picks up from `.planning/` on disk, and
  `/gsd-execute-phase {N}` skips every plan that already has a SUMMARY.
- **Never assert a cause here without opening `main.log` first — and then check you are reading the
  remote-control subsystem and not `WarmLifecycle`.** Four wrong answers are now on the record:
  *"local sessions are never phone-reachable"*, *"click the globe"*, *"there is NO re-arm"*, and
  *"it is DOWN"* — the last two both from misreading the same lines.

- **Front-load every decision.** If he is about to be away, ask everything answerable *now*. A run
  that blocks twenty minutes after he leaves burns the whole window for one question.
- **A checkpoint his existing rulings already answer is NOT a reason to stop.** Resolve it from the
  record, **name which ruling you used**, and keep going. Same day: an executor paused to ask whether
  to push an early peek — he had chosen **one drop** that morning. Answering from the record cost
  nothing and saved the window. **Only genuinely new decisions wait for him.**
- **In a remote session, ask with `--text` mode.** The TUI menus do not render through the Claude
  app, so a question asked the normal way is a question he physically cannot answer — it looks to him
  like the run simply stopped.
- **Never leave a run silently blocked.** If you must stop, the reason and the options go into a
  message that reads on a phone screen: short, plain, and with the recommendation first.
- **Report the boundary honestly.** If you cannot tell whether he can see something, say that, rather
  than assuming he can.

### Look at it yourself first — in the browser, with screenshots — before you hand it to him

Wyatt, 2026-08-19: *"add to claude.md that you should always check and QA your own work in browser
with screenshots before passing it off to me."*

**He asked for this after finding SEVEN bugs in about twenty minutes, in a build a session had just
told him was ready and green.** Every one of them was visible on the first screen. He was doing QA
that should never have reached him.

**How a green report and a broken game coexisted, because this is the trap and it will recur:** the
headless shakeout that blessed that build checked *game state* — ship positions, turn order, event
indices, dubloon counts — and every one of those checks passed honestly. It never once looked at
what was **drawn**. So a guest whose prompt rendered as a flat card instead of the radial bloom, a
chat heading stranded behind the ribbon, a narration box that never cleared, and an undimmed board
all sailed straight through. **The checks were not wrong. They were measuring a different thing than
the one that was broken** — and a passing suite made that invisible.

- **Open it. Screenshot it. Look at the picture.** Not the DOM, not `getComputedStyle`, not a state
  dump — the rendered image. Everything that got through that day was obvious in a screenshot and
  invisible to an assertion.
- **In multiplayer, screenshot BOTH sides and compare them.** Host and guest must match (§2). Four
  of the seven were host/guest divergences, and a single-browser probe cannot see one by
  construction.
- **Screenshot the state you changed AND the state next to it.** The chat regression was not in the
  chat sheet; it was a heading peeking out from behind the ribbon three hundred pixels away.
- **Never write "everything is green" on the strength of checks that cannot see pixels.** Say what
  you actually verified and how. **"A green suite proves nothing about what he will see"** belongs
  beside "a green root `npm test` proves nothing about `4/`" (§5) — same failure, different layer.
- **This is not the same as the phone pass.** D-09 stands: his real voyage is still the gate. This
  rule is about not spending that gate on faults you could have seen yourself in one screenshot.

### PLAY THE GAME. In two tabs. And look at it.

Wyatt, 2026-08-20: *"There are so many bugs that I can see at a glance in moments that you would
also be able to see in moments if you simply QA'd the game in a browser yourself, in multiplayer
mode, in two different browser tabs."*

**This is the single highest-value thing available and it takes minutes.** He finds bugs at a glance
that a session will not find in a day of instrumentation, because he *plays* and a session
*measures*. Two days were spent on five phantom defects while the real ones sat in plain sight on the
first screen.

- **Open the game and play it. As a person, not as a probe.** Solo first if you like, then a crew
  game with a host and a guest — two browsers, both driven, a real Firebase room.
- **Do this BEFORE analysis, not after.** A list of what you saw beats a theory of what might be
  wrong. Bring him what you saw.
- **The how is already written down and hard-won.** `docs/DRIVING-THE-GAME.md` is the whole manual —
  §3 solo, §4 the turn loop and the two things that stall every naive driver, §5b the autoplay driver
  that actually plays, §5c driving a guest while a human hosts, §5e injecting the state you want
  instead of playing your way to it. Read it **before** you touch a browser (rule 17), not after you
  are stuck. Sessions have re-derived every one of those lessons the hard way; do not add to the
  count.
**The two halves of rule 19, which used to be two rules fighting each other:**
- **FIND** — play the game routinely to discover what is wrong with it, including things nobody
  asked about. This is the half that keeps getting skipped.
- **CHECK** — before handing any change to Wyatt, look at the rendered picture of it, both sides in
  multiplayer. Earned when he found seven bugs in twenty minutes in a build a session had just
  called green: the checks were honest and were measuring game state, never what was drawn.

### READ EVERY SCREENSHOT HE SENDS. Pixel by pixel. Never skip one.

Wyatt, 2026-08-20: *"When I give you a screenshot, look at it pixel for pixel to learn as much from
it as you can. Never skip a screenshot. I go to extreme effort to give you screenshots that you can
learn from. When you skip them, it makes me furious."*

**A screenshot he sends is the most expensive evidence in the project and the most often wasted.**
He set up the game, reached the exact moment, captured it, cropped it, annotated it, and carried it
into a document — and a session then reads the sentence next to it and skips the image.

**What it cost, the day the rule was written.** His 22-item playtest PDF contains **side-by-side host
and guest screenshots** for items 17, 19, 20 and 21. A session read the prose, went to the code,
counted `isHost` branches, found only a handful that touch rendering, and told him the phase's
premise was wrong — twice, confidently. **The screenshots showed eight surfaces diverging between
host and guest**: a duplicated Ahoy message on the guest only, two different sentences for the same
wait, a host with no narration at all beside a guest still holding its prompt, two cameras pointed at
different parts of the board, sail squares highlighted on one screen and absent on the other, and a
CAPTAINS panel in a different row order on each. **Every one of those was visible in an image that
had been sitting in context, unread.** He had to say *"look at the screenshots and compare them pixel
by pixel"* before anyone did — and the answer was there in one line of code the moment somebody
looked.

- **Open every image he sends, and describe what you SEE before you theorise about why.** Not the
  caption, not the item number next to it — the picture.
- **When he sends a PAIR, compare them element by element** and write the differences down as a
  list. Host vs guest, before vs after, two battles at different moments. **The pair is the point;
  he did not send two images for you to look at one.**
- **Look past what he flagged.** In 17b he commented on two narration sentences. The same image also
  showed the host's recipe picker apparently blank where the guest's was populated — worth raising,
  and it took a direct question to resolve (it was caught mid-animation, and that answer only came
  because someone finally asked). **Things he did not mention are still evidence.**
- **His annotations are a floor, not a ceiling.** A red circle marks what he noticed. It does not
  mark everything the image proves.
- **This is not rule 19 and does not overlap it.** Rule 19 is about pictures YOU make — playing the
  game, and screenshotting your own change before handing it over. **Rule 22 is about pictures HE
  makes.** Different trigger: 19 fires when you are investigating or delivering; 22 fires the moment
  an image arrives. The two failures are also different — 19 is not looking, 22 is being handed the
  answer and not opening it.

### Show the work to a CEO before showing it to him

Wyatt, 2026-08-26: *"Keep CEO — I will use it again every time I ask you to do something to
deliberate on whether or not you have executed what I've asked you to do. So I will always say,
after you've done your work, show it to CEO before you show it to me."*

**The sequence: do the work → spawn a CEO → give him the CEO's verdict → then your own account.**

```bash
node scripts/qa/ceo_brief.mjs --ask="<his request, VERBATIM>"   # prints the whole brief
```

**It is a COMMAND, not a memory exercise** — Wyatt, 2026-08-26: *"I need to be able to ask you to run
CEO too."* It was documented and not runnable, so every session hand-assembled the brief differently.
The script pulls in what changed, the build stamp, the sea trial's current state, and — the part that
was silently broken — **the previous verdict**, from [`.planning/CEO-REVIEWS.md`](../.planning/CEO-REVIEWS.md).

> **APPEND THE VERDICT TO THAT FILE WHEN YOU ARE DONE.** Rule 25 tells you to hand each CEO the
> previous one so it can spot a RECURRING fault. Until 2026-08-26 verdicts lived only in the running
> session's context, so the moment a session ended that check quietly stopped working. **A verdict
> nobody recorded is a recurrence check nobody can run.**

**Why it exists, and it is not about honesty.** On 2026-08-25/26 a session answered his 35-item
playtest by shipping 22 fixes, verifying 4, and reporting success. Nothing in that report was a lie.
**The gap was between what he ASKED for and what was delivered** — and that gap is invisible from
inside the work. The first CEO review found in one pass that the QA process built that morning had
already certified an untested build: *"The unit shipped a process today and its very first output is
a lie."* Every claim in it was verified before being acted on, and every one held.

**How to run it so it stays real:**

- **FRESH CONTEXT, ALWAYS.** A CEO that inherits your reasoning inherits your blind spot. Spawn a
  new one; never continue the last.
- **Hand it three things:** his request **verbatim**, what was actually done (files, commits,
  measurements), and **the previous CEO's verdict** — so it can say whether the same fault recurs.
- **Its question is narrow: *did the thing he asked for happen?*** Not "is this good work".
  **Adjacent, competent, impressive work that misses the ask is exactly what it exists to catch.**
- **Tell it explicitly that it may say NO**, and that a criticism without a file:line citation is an
  opinion.
- **Its verdict reaches him in ITS words, especially when it is bad.** A kind paraphrase makes the
  whole mechanism theatre — and the paraphraser is the one with the motive.

**Where the line is:** it runs after *work* — something built, fixed, measured or shipped. Not after
a question answered or a file handed over.

**AFTER EVERY ITEM, NOT ONCE PER WINDOW.** Wyatt, 2026-08-28: *"I want CEO to review after every
item."* This is the second time he has had to say it (2026-08-28 04:14: *"CEO after every item, not
just at the end"*), and CEO Review 9 caught it recurring: two windows running, one review ran at
the end, after everything had shipped. **The unit is the ITEM — each thing he asked for, closed with
its own fresh-context CEO verdict before the next item starts.** A batch of thirteen asks is
thirteen reviews, not one. Sizing is honest, not theatrical: a one-line copy change gets a short
verdict, an architecture change a long one — but every item gets one, appended to
[`.planning/CEO-REVIEWS.md`](../.planning/CEO-REVIEWS.md) as it lands, so the recurrence check
never has a gap again.

### Hand him a LINK he can tap. Never a file path.

Wyatt, 2026-08-30: *"your html files must always be clickable for me to open on a phone — this link
opens github and is useless. the whole point of the html is that i have no friction when giving you
feedback."*

**A session had just met every requirement of the playtest-checklist hook and then handed him
`.planning/staging-checklist-2026-08-30.html`.** What he tapped was GitHub's *source view*: a
syntax-highlighted listing of the CSS, on a phone, with no checkboxes and no notes boxes. The sheet
was correct, current, and honest, and it was worthless — **because a repo path is not a page.**

**The fault was one line of instruction, and that is the reusable part.** The hook's last line read
*"Then hand him the file path."* **An instruction that ends at the ARTIFACT instead of at HIM
produces a session that stops one step short and believes it finished.** When you write a process
step, end it at the person.

- **PUBLISH IT AND GIVE HIM THE URL** — for a checklist, a report, a comparison, anything he is meant
  to read or use. Not a path, not a GitHub blob URL, not "it's in `.planning/`".
- **Write it in the shape that can be published**: no `<!doctype>`, `<html>`, `<head>` or `<body>` of
  its own — the host supplies those — so the file begins with `<title>` then `<style>`.
- **Assume the phone.** Guard every `localStorage` touch: in a private tab the accessor *throws*
  rather than returning null, and an unguarded read at the top of a script takes the whole page down
  and hands him a blank screen instead of the thing he asked for.
- **`.claude/hooks/playtest-checklist-last.cjs` enforces the shape**, which is the part a hook can
  see, and blocks on a sheet that cannot be published. **It cannot see whether you pasted the URL
  into your reply — that half is this rule.** A CEO review found exactly that gap: a session that
  inherits a good sheet is never blocked, so it is never reminded. **You are the reminder.**

### Hold the whole game, not the current ticket — engineer AND designer

Wyatt, 2026-08-20: *"I want to be able to direct you to think holistically about the project as both
an engineer and a designer and to understand my intentions more clearly… see the bigger picture at
all moments instead of getting completely lost in these tiny details that somehow have scope creep
and end up often being completely irrelevant."*

- **Read the intent, not only the words.** "Fix the whole game" means *make this game good*, not
  *work the list you inferred at midnight*.
- **His list outranks yours.** He plays this game; you do not. Before a long run, ask what is on it.
  If a process step stands between him and telling you what is wrong, **break the step** — take the
  list, re-scope, fix the record afterwards.
- **Say when the ask is not the biggest lever.** *"You asked for X; I think Y would do more for a
  player, here's why"* is a designer's job and he is explicitly asking for it.
- **When he hands you a list, triage and recommend BEFORE fixing** (his pick, 2026-08-20): come back
  with what you think the biggest levers are and why, and let him approve the order.

### Never report a defect as confirmed before you have measured it

**This one cost two days.** At the 02.1 gate five defects were put to him, three in a table beside
measured findings, **none of those three measured** — they came from one screenshot read while the
guest was still behind the opening ceremony card. Four of the five were false. So *"the problems that
aren't even real bugs"* he spent two days on **were generated by a session and handed to him with
unearned confidence.** The table format itself asserted a certainty that did not exist.

- Say **"observed once, not yet measured"** until it is measured, and never place an unmeasured claim
  beside measured ones.
- **Red-proof the instrument before believing it.** Three separate checks in one night measured
  something other than what they named: `offsetParent` (always null for a `position:fixed` element,
  so it condemned the host's own working screen), polling for a prompt while a driver answered it
  every 700ms, and checking for buttons on a prompt kind that draws squares on the board.
- **When a check condemns something known to work, suspect the check first.**
- **Correct the record in the open** when a claim turns out false — see the correction on 02.1's
  Wave 4 row. A requirement marked failed on a bad measurement rots exactly like one marked complete
  on a bad one.

### A comment is not a measurement — and never write one that can rot

Wyatt, 2026-08-25, after being told the narration box waits for the board to stop: *"this is wrong…
the narration box appears while the board is still moving."* The claim had come from a comment in
`panel.js` describing what the code was *meant* to do, repeated to him as fact. He then asked
whether the answer was to stop writing comments at all.

**It is not.** The comments in this repo are the graveyard (rule 10) — what was tried, what was
rejected, what a number cost somebody. Strip them and every settled argument gets re-run. Keep them.

**The rule is about what a comment is FOR, and what it can never be used AS.**

1. **A comment explains WHY. It is never evidence of WHAT the code does at runtime.** Before telling
   Wyatt how something behaves, measure it — or say *"the comment claims X; unverified."* A comment
   is a statement of intent by somebody who has since left the room.
2. **Do not write comments that make behavioural claims, because those rot silently.** *"1400ms,
   because a gate that can wait forever is a game that can hang"* is a REASON and stays true
   forever. *"…so the box appears at once on a still board"* is a claim about runtime — and it is
   the one that misled a session on 2026-08-25. If a behavioural claim really must be written down,
   mark it with how and when it was measured, so the next reader can see it is dated evidence
   rather than a standing fact.
3. **Restating what the line does is noise.** Match the density of the file you are in — long
   `WHY`-comments in `stage.js` and `index.html` are the house style and are load-bearing; a
   comment saying `// increment i` is not.

**Why this is rule 6's other half.** Both failures are the same one: believing something without
measuring it. A screenshot you reasoned about, a check that could not fail, and a comment describing
intent are three faces of the same mistake — **evidence that was never actually gathered.**

### WRITE THE PREDICTION DOWN BEFORE YOU MEASURE — rule 6's working form

Wyatt, 2026-08-26, proposing a bigger version of this and then choosing the small one: *"could you
trace the entire codebase to determine what you expect the behavior to be at every step, so that
you're not making assumptions about the code instead of actually testing it?"*

**The tracing idea was audited against four wrong calls made that day and would have caught one and
a half.** It cannot see the failures that actually cost this project — the orphaned full stop was
the browser's line-breaking around an inline image (no JavaScript to trace), and the buried stats
row was CSS plus content height at one viewport width (in no function at all). **A trace is a very
long, very confident comment**, which is the thing the section above forbids. The repo has already
paid for that once: the auto-generated architecture blocks were deleted on 2026-08-18 for citing
`index.html:1017–1684` for a class that file does not contain.

**So: before any measurement or fix, write down what you expect and WHY — then measure, then say
plainly whether you were right.** It costs about ninety seconds and it caught two wrong answers the
day it was adopted.

- **Name what would prove you WRONG**, in the same note. A prediction with no failing case is a
  wish. *"If no-cover-ask is gone but Deny is still never exercised, my reasoning is wrong"* — it
  was, and the note is why that got reported instead of quietly reframed as a partial win.
- **Write it BEFORE the result exists.** The whole value is that it cannot be retrofitted. A
  prediction composed after the measurement always turns out to have been right.
- **Say which parts were wrong, out loud, in the reply he reads.** On 2026-08-26 a settle fix based
  on `textContent` did nothing; the written prediction is what made that undeniable rather than
  something to rationalise. The wrong fix never shipped.
- **A measurement that cannot fail is not a measurement.** Check the instrument reaches its subject
  before believing it: three times in one day a probe measured a state it had never actually
  created — a settle trace begun after the reveal had finished, an emoji with no custom art
  standing in for an icon, a "card" that resolved to the full-screen container.

### POSE THE BOARD — do not go looking for a rate when the question is a picture

Wyatt, 2026-08-30, after a night that spent itself on this: *"don't touch bubble placement again
without a posed comparison — the same seeded sail prompt, before and after, two screenshots. Three
probe runs and three 85-minute trials couldn't settle a question that two pictures would have.
That's the lesson of the night, and it cost the night to learn it."*

**A driven voyage is a terrible instrument for a layout question.** It yields a handful of samples
an hour, and they swing wildly: three 8-minute runs of one probe gave **7, 12 and 5** judged
captures with completely different cause mixes, and three 85-minute full trials gave **22 → 26 →
31** structural failures on the same ten legs. Nothing in that can tell a fix from a coin flip —
and three changes were shipped on it that same night, and all three reverted.

> **⚠ "TWO PICTURES" IS NOT A CONTRAST WITH THE SEA TRIAL, WHICH ALSO TAKES PICTURES.** Wyatt asked
> exactly this on 2026-09-01 — *"doesn't the sea trial capture pictures? isn't that the entire point
> of the sea trial?"* — and he is right that the wording invites the confusion. It does: it
> screenshots as it sails and runs a vision judge over the result (267 screens judged in one run),
> and that is how the untappable sail square was CAUGHT.
>
> **The distinction is POSED versus SAMPLED, not pictures versus no pictures.** The trial
> photographs whatever happens to occur — a different board and a different set of moments every
> run — so it is an excellent DETECTOR and a useless A/B. A posed comparison photographs *the same
> seeded board and the same prompt, before and after the change*, which is the only thing that can
> answer "did my fix work?". That is why the same ten legs gave 22 → 26 → 31: not noise in the
> judging, different boards.
>
> **So: the trial finds it. A posed pair settles it.** Never read this rule as "don't screenshot" or
> "the trial is worthless" — read it as "a rate over a stochastic voyage cannot answer a question
> you could photograph twice."

**A POSED BOARD ANSWERS IN MINUTES AND CANNOT BE ARGUED WITH.** `docs/DRIVING-THE-GAME.md` §5e —
inject the state you want instead of playing your way to it. Same seed, same prompt, before and
after, two screenshots side by side.

- **WHEN THE QUESTION IS "IS THIS DRAWN WRONG", DO NOT GO LOOKING FOR A RATE.** Ask a geometric
  question instead. The trade-wind lead was settled by one prompt in about a minute
  (`scripts/qa/w14_swept_geometry.mjs`: every square sits where its grid coordinate predicts, to
  0.0px) after a 12-minute crew run had offered four such squares and settled nothing.
- **A small sample and a large one that disagree are not a puzzle.** The large one wins. An
  8-minute probe said coverings went to zero; a 10-voyage trial said they went up. The probe was
  believed, and it was wrong.
- **This is rule 6's other face.** Rule 6 says do not report what you have not measured. This says
  *measuring the wrong quantity is not measuring* — and a rate over a stochastic voyage is the
  wrong quantity for anything you could photograph.

**Enforced, not remembered:** `.claude/hooks/qa-gear-first.cjs` prints it as STEP 0b, at the moment
you are about to change game code.

### WIDEN THE TIME HORIZON — what happened immediately BEFORE the bug?

Wyatt, 2026-08-27, after watching a session measure the same broken screen for two days: *"think
like a top-tier software architect, creatively expanding your pattern recognition scope in time.
what happens right before the bug each time?"*

**A bug you cannot explain from its own moment is usually the consequence of a preceding one.**
When something is INTERMITTENT, or the code at the scene of the crime looks correct, stop asking
*what does this look like* and start asking **what happened just before it — and if that is not
enough, what happened before THAT.**

**The case that earned it.** Sail squares a guest cannot tap: some are drawn off the edge of the
phone. Two days went into measuring WHERE the squares were — their rects, the board's transform,
the camera's scale — and two separate geometry theories were measured dead. One question moved it:
look 180 milliseconds earlier, at the ORDER. `src/ui/flow.js:636` draws the squares, then asks the
camera to frame them **on a `setTimeout`** — so the frame is requested after the fact, not with it.

> ### ⚠ THE MECHANISM THIS PARAGRAPH USED TO NAME WAS MEASURED DEAD, AND THE PARAGRAPH DID NOT SAY SO
>
> It ended: *"and the camera is allowed to REFUSE while a centre-stage card holds the player's
> attention. The squares were correct. The order was not."* **The refusal half is false.**
> `.planning/CTO-LEDGER.md`, 2026-08-29: 18 tap-to-sail prompts on a real 390×844 guest — *"in
> every failing prompt's history the stage reads `-` throughout — no card, no veil — so NOTHING WAS
> REFUSED and there was nothing to overwrite."* That measurement landed two days after this
> paragraph was written, and **nobody reconciled the two**.
>
> **This is not a footnote, it is the trap the whole section is about.** On 2026-09-01 a session
> read this rule, recognised the symptom, predicted the cause it states, and burned a pass
> re-running a theory the project had already buried — the third geometry theory to die on this
> bug. *A rule that names a dead cause does not merely fail to help; it aims the next reader at
> the grave.*
>
> **What still stands, verified:** the 180ms `setTimeout` is real and has never been changed except
> by a rename (`git log -S`, `b3c7b12c`). The ordering fault is genuine. **Its mechanism is open**,
> and the next step is a POSED comparison (rule 26), never a fourth theory.

**Why measuring harder could never have found it:** every measurement was taken at the moment of
the symptom, and the cause had already finished happening. **A snapshot cannot show you a race.**

- **Ask it of the SEQUENCE, not the screen.** What rendered before this? What resolved, arrived,
  timed out or was torn down in the second before? Whose turn ended?
- **Go back TWO steps when one is not enough.** The sail squares needed: squares drawn → camera
  asked late → camera refused because a card was still up. Stopping at step one finds nothing.
- **Intermittent is the tell.** A bug that appears in some runs and not others is almost never a
  wrong constant; it is two things happening in an order nobody fixed.
- **Put it in the prediction.** The prediction note (below) gets a line: *what happened immediately
  before?* If you cannot answer it, you are not ready to measure yet.
- **It applies to instruments too.** "The trial says NOT RUN" — what happened just before? A reboot
  cleared `/tmp`. "The gear says NONE" — what happened just before? A cutover moved the tree.

**This is enforced, not remembered.** `.claude/hooks/qa-gear-first.cjs` prints it as STEP 0 of the
four steps, so it arrives at the moment you are about to change game code rather than at the top of
a file somebody read this morning.

### Do not build tooling when the ask is to fix the game

Infrastructure, harnesses and process improvements are a **substitution** for the ask unless he asked
for them. On 2026-08-19 a session spent much of an eight-hour fix window building a hook — offered to
him from a menu **it put in front of him mid-window and framed as free**. The fault is the offering,
not his choosing. He called the result "thoughtless tool"; from where he sits that is fair, because
the game got no better.

**If you think tooling is needed, say so in one line and park it.** Do not offer it as a live option
while real bugs are waiting.

---

## 2. Design rules

### Consistency is a core value — same gesture, same behaviour, everywhere

Wyatt, 2026-08-12: *"Add consistency as a core value... so it is flagged whenever it is broken, and
only broken intentionally."*

An interaction that behaves differently in two places is a bug **unless Wyatt chose the exception**.
When adding or changing ANY interactive behaviour — a gesture, a fade, a prompt style, an animation,
a pacing constant, a copy register — **sweep every other surface that behaviour touches, make them
match, and say in your reply which surfaces you checked.**

Sanctioned exceptions, each his explicit pick:
- Hold-the-sea fades every floating box (prompts of all styles, narration bubbles, the stay-put
  confirm) but **not** the centre-stage intros or the flip-ceremony veil (2026-08-12).
- The credits/About pages are not in pirate speak — see below.

### ONE DISPLAY PATH. Two things that must agree are one thing, or they will drift.

Wyatt, 2026-08-20, on finding the host and guest drawn by two different orchestrations: *"this is
terrible engineering… it violates my design principles, and it should never have been built."* And,
stating the principle: *"the Gameboard should just be displayed according to a set of rules… We make
changes once, and they get propagated to both players. Regardless of whether they're host or
guests."*

**Host/guest decides who COMPUTES the game and who CREATES the room. It must never decide what a
player SEES.** The same for any future client type — spectator, replay, a second device.

**THE DESIGN-TIME QUESTION, and it is the whole rule:** *what makes these two agree?* If the honest
answer is *"nothing — we keep them in step"*, that is the defect, **before a line is written**. Two
things kept in sync by discipline are two things that will drift; the only durable answer is that
there is one of them.

**How it gets built, because nobody ever chooses it.** It accretes, and every individual commit is
locally reasonable:

1. The game is solo-first. The game loop draws the screen. Correct, and simple.
2. Multiplayer arrives. The host already has a working loop that draws. The cheapest way to give a
   guest a screen is *"broadcast the state, let the guest listen and draw."*
3. **The second director is emergent.** `src/orchestrator.js:2318-2319` — the host runs
   `runLiveNet()` and draws from the game loop; the guest attaches **nine independent listeners**
   that each decide on their own what to draw and when. *(Path and line both corrected 2026-08-26:
   it said `4/src/…:1654`, a tree the cutover deleted and a line that is `const subHtml=…`. The
   fork is one `if/else` pair — verified by reading it, not by grep.)*

**THE TRIGGER — memorise this sentence, because it is the moment the fault is born:** *"the existing
one already works, I'll just add a listener/branch/path for the new case."* **When a SECOND consumer
of the same thing appears, CONVERGE: make the FIRST one go through the new path too.** Never run them
side by side. `watchChat()` is the worked example in this very file — *"every client (including the
host) both sends and listens"* — built converged because both client types already existed when it
was written, and it has never drifted.

**Why no test caught it for three phases.** Both paths call the *same* renderers — `showNarration`,
`localAsk`, `setActor`, `flash`. So every check asking *"does `showNarration` work?"* passes, on both
sides, honestly. **What differs is not the drawing but the orchestration: who calls it, in what
order, and when it is cleared.** A gate that tests a renderer cannot see this by construction. **Two
screens side by side can see it instantly** — which is why rule 19's two-tab pass and rule 22's
screenshot reading are the live detectors for this whole class.

**And the guard already existed, pointed at the wrong tree.** `scripts/host_guest_parity_check.js`
checks that the prompt classes the host path emits equal those the guest path emits — written for
exactly this failure. It reads the ROOT game's `src/`, there is no `4/` copy, and it has been green
throughout on a game nobody is developing. **A gate aimed at the wrong tree is not silent, it is
reassuring** (`docs/HARD-WON-LESSONS.md` §3). **When you add a client type, point the parity gate at
the tree you are actually building.**

**The audit question, when reading existing code:** do not ask whether each branch is individually
correct — that is one level too low, and it is how this was missed on the day it was found. A branch
that does not draw anything can still *select which drawing regime runs*. **Ask what would have to be
true for these two to disagree, and whether anything prevents it.**

### Nothing is a constant — the game is always shifting

Wyatt, 2026-08-14: *"We also dont want constants to drive the [behaviour], because the game is always
shifting!! The bot should calculate an offer that it would accept, and offer something close to that."*

A hardcoded price, margin, threshold or cap is **a price list standing in for a quantity that moves
by an order of magnitude across a voyage.** A bot's first crate and its last crate are not the same
trade. A constant cannot be right for both, and it fails silently.

**Derive it instead, from something the game already computes.** The elegant version almost always
*deletes* code: when a bot was asked to price a trade properly, the answer was `acquireTurns()` —
what fetching the crate itself would cost, which it was already calculating — and the whole hail test
collapsed to one comparison with no threshold in it. Two earlier attempts, both adding a constant,
were longer AND worse.

**The trap in the other direction: replacing a constant with a calculation breaks every test that
reads it** — not merely making them wrong, but making them *vacuous*, unable to fail, which still
reads as protection. A −21.2 ladder regression came from exactly this. **List what reads a quantity,
gates included, before you change how it is produced.**

Detail: `docs/BOT-DESIGN-PRINCIPLES.md` principle 10, and `docs/TRADE-SYSTEM.md`.

### Read the graveyard — what was already tried lives in the GIT LOG

Wyatt, 2026-08-14: *"we already tried many failed attempts at decreasing trade spam; have you read
all those logs?"* I had not, and the answer is nearly always no unless it is asked deliberately.

**A design document says how a subsystem WORKS. It does not say what was already tried and thrown
away, which numbers are deliberately held, or which ruling was earned by a previous failure.** Those
live in commit messages — and this repo's are unusually long *precisely so they can be read that
way*. Reading the design docs end to end is NOT a substitute: proven 2026-08-14, when both were read
that morning and a hard-won result was reversed anyway.

```bash
git log --all --oneline --grep="<subsystem>" -i          # the arguments already had
git log --all --format="%H %s" -S "<the number or fn>"   # where a quantity was last defended
```

**The tell that you are about to re-run a settled argument:** you catch yourself reasoning that some
number going *up* is acceptable because a different number stayed flat. Somebody has already defended
that number. Go read what it cost them.

### The narration box reveals top to bottom, in that order

Wyatt, 2026-08-01: *"Everything in the narration box should appear from top to bottom, in that order.
Remember this intent."*

Whatever sits highest is revealed first: **back button → message text → action buttons → italic
helper text.** That is the DOM order `localAsk()` builds in `src/ui/flow.js` — `.apBack`, `.apMsg`,
`.apBtns`, `.apSub` — and the reveal must follow it.

**This governs anything added to `#actionPanel` in future** — a new element's reveal order follows
its visual position and does not need re-deciding. Two separate playtest findings traced back to
violating it.

### The voice boundary — credits and About are NOT in pirate speak

The divide is diegetic — whether the words come from inside the game world or outside it.

| Register | Voice | Where |
|---|---|---|
| **Inside the game world** | Pirate speak — `ye`, `yer`, captain-address | Narration, battle/trade/dock lines, prompts, buttons, the board, the lobby, End of Voyage |
| **Outside the game world** | Wyatt's own plain first-person voice | Credits, the About page, anywhere he speaks as himself to a real person |

Wyatt, 2026-08-02: *"the design intent is that the credits page is not 'in the game world' so it
isn't written in pirate speak."* The credits thank real people in his own voice. Pirate speak there
would put a costume on a genuine thank-you.

**So a `ye`/`you` difference between the credits/About copy and the rest of the game is correct and
expected. Never "fix" it.** A retroactive audit once flagged the shipped credits line as drift; the
shipped text was right and the record was wrong. **He had already told an earlier session this rule
and it was lost** — which is why it is here.

### Bots and humans have identical rules and affordances

*(Standing invariant — Wyatt, 2026-08-01, "and it has been from the beginning".)*

**If a human cannot do a thing, a bot must not either — and the reverse.** Bots differ only in *how
they choose*, never in *what they may do*. **This answers a whole class of question in advance: any
future "should bots be allowed to…?" is already answered.** Do not raise it as an open decision.

**But parity is a symmetry requirement, not a ceiling on bots.** When the two sides differ, which
side moves is a separate design choice — sometimes the bot loses an affordance, sometimes the human
*gains* one. His example: bots could counter-offer in a trade and humans could not, and the fix was
to **give humans the counter-offer**. Ask "which version makes the better game?" — **levelling the
human up is frequently the right answer.**

Full text, including the practical consequence for the three code paths that must agree:
`.planning/PROJECT.md` → Constraints.

---

## 3. Safety — where getting it wrong costs real damage

**Detail and incident history for every rule in this section: [`docs/GIT-AND-DEPLOY.md`](../docs/GIT-AND-DEPLOY.md).**

### Site-identity files never leave this repo

`CNAME` contains `playpastrypirates.com`, and **GitHub Pages reads that file as a *claim* on the
domain** — a second repo containing it does not fail safe, GitHub unsets the domain on one of them,
and **the live game goes down for real players**. `robots.txt` and `sitemap.xml` are the same hazard
in different clothes.

**Two separate sessions came within one command of doing this**, both hand-rolling an `rsync` to
publish a preview. Deploy with `scripts/deploy-preview.sh` only; never hand-roll the sync. When you
add a file that identifies the live site, add it to `EXCLUDES` in the same commit.

### `git fetch` before you trust any ref — and keep `main` synced both ways

Both `main` and `origin/main` are **local caches**. `origin/main` is not the remote; it is this
machine's last-downloaded snapshot, stale until you fetch.

```bash
git fetch origin                              # before you read, compare, or conclude anything
git push origin main && git pull origin main  # immediately after anything that changes main
git rev-list --count origin/main..main        # 0
git rev-list --count main..origin/main        # 0
```

Local `main` once sat **457 commits behind** — a v1.0 snapshot with no `src/` at all — and reading it
produced a confident, entirely wrong conclusion handed to four parallel sessions as instructions.
**Never report git state from memory or from earlier in the session.** Re-run the command.

### TWO SESSIONS ON ONE BRANCH — assume it, and write for it

**Earned 2026-08-28, by not foreseeing it.** A handoff was written sending a session on Wyatt's Mac
to sail this branch, and an hour later a 24-hour autonomous run was set up on the same branch.
Nobody asked what happens when both are live. A third session was already pushing to it.

**The silent one, which is the dangerous one:** `scripts/sea_trial.mjs` wrote
`.planning/SEA-TRIAL.md` at a hardcoded path, so whichever machine finished last overwrote the
other's verdict — leaving an authoritative-looking report describing a run from somewhere else.
Rule 24 stands on opening that file and believing it. Fixed by `--report=` plus a derived
`sailed on <machine>` line in every report (`scripts/qa/trial_report_ownership_check.mjs`).

**The rules, whenever more than one session may be live:**

- **`git pull --rebase` before every commit.** Two sessions appending to `.planning/CTO-LEDGER.md`
  conflict on every push otherwise; rebased, they stack cleanly.
- **CLAIM THE ITEM IN THE LEDGER BEFORE EDITING IT.** An unclaimed item is available; a claimed one
  belongs to that session until it closes. This is the whole coordination mechanism — there is no
  lock across machines and a lock file in git would lie.
- **Shared artifacts are owned, not shared.** A run that is not the authoritative one writes its
  own file (`--report=`, its own log) and never the file the process tells Wyatt to open.
- **When you write a handoff, name what the other session must not touch** — branch, files,
  and whether it may change game code at all. A handoff that assumes it is the only session is the
  bug this rule exists to stop.

**The only working directory is `/Users/wyattroy/Documents/Projects/pastrypirates`.** `.planning/` is
a tracked directory, so it is **branch-scoped**: a worktree on a stale branch reports an older
project, with no error and no warning. One did exactly that, reporting "0 of 5 phases, nothing
started" when four of five had shipped.

```bash
cd /Users/wyattroy/Documents/Projects/pastrypirates && git rev-parse --show-toplevel
```

### Kill every headless Chrome and local server you start — before you reply

They do not exit on their own. Wyatt found two abandoned probes burning **21% CPU each** alongside 17
stale `http.server` processes, on a machine he was reporting as overheating — **he was debugging a
performance problem while the tooling sent to investigate it was heating his laptop.** Hours after
that rule was written down, a session left **53% CPU across 13 Chrome processes** and he had to ask
again.

- **Bound every long probe** — `for (let i=0;i<N;i++)`, never `while (true)`.
- **Kill it the moment you have the answer**, not when the task ends.
- **Never leave a probe running across a reply.** He is at the keyboard, on the machine it is heating.

> ### ⚠ THE COMMAND THIS RULE USED TO PRINT DOES NOT EXIST ON THE MACHINE THAT RUNS THE RELAY.
>
> It read `pkill -f remote-debugging-port; pkill -f http.server`. **Neither `pkill` nor `pgrep` is
> installed in Git Bash on the Blade** — verified by running them, twice, independently (exit 127,
> "command not found"). So a tidy-up written as `pgrep … || echo "no headless chrome"` **printed the
> all-clear every time, on an empty machine or on a full one.**
>
> **What that cost, 2026-09-02: 183 `chrome.exe` processes carrying `--remote-debugging-port`, the
> oldest more than a day old, holding 15,097 MB, on the laptop he was asleep next to** — while the
> session's own rule-17 check reported no stray probes. **This rule was decorative on Windows for as
> long as Windows has run the relay, and nothing said so.**

**ASK THE GATE, NOT A SHELL BUILTIN — it works on every machine and it says what it actually saw:**

```bash
node scripts/qa/stray_probe_check.mjs      # in npm test; PASS/FAIL, never "all clear" on a blind look
```

**ABANDONED MEANS ORPHANED, which is what this rule always meant.** A debug-port browser whose
launcher is still alive is a probe somebody is *using*; one whose parent has exited is abandoned.
The gate reports parent liveness and judges on that — so a posed board you are in the middle of
photographing (rules 19 and 26) does not fail the build, and a sixteenth probe added tomorrow needs
nobody to register it. *(The first version exempted only a live sea trial, and 15 scripts here
launch browsers while one writes that marker — an exemption pinned to one name, caught by CEO 107.)*

**To actually kill them,** the gate prints the right command for the machine you are on. On Windows
that is a `Get-CimInstance … | Stop-Process`; on Mac and Linux the old `pkill` line is still correct:

```bash
pkill -f remote-debugging-port; pkill -f http.server     # Mac / Linux ONLY — absent in Git Bash
```

### Absolute paths, always

The Bash tool's cwd resets and announces it at the bottom of unrelated output. **More than one tree
in this repo shares an identical internal layout**, so a relative path resolves in *both* — a
mis-rooted edit opens a real file, applies cleanly, passes `node --check`, and modifies the wrong
copy. **Every safety signal reports success.** After each batch of edits, name the tree you should
not be touching and prove you didn't:

```bash
git diff --name-only | grep -v '^4/'   # must print NOTHING when working in 4/
```

---

## 4. Before you touch a subsystem

**Read its own design document first.** On 2026-08-13 a day went into building wind-aware route
costing that `docs/BOT-V3-RACE-PLANNER.md` §4 says, in one sentence, already shipped — in the same
file being edited. **grep cannot surface a capability that exists under a different name.** Ask what
exists by BEHAVIOUR ("does anything here already price a route under the wind?"), ask it of the doc,
and ask before writing code.

| Touching… | Read first |
|---|---|
| Anything that trades | [`docs/TRADE-SYSTEM.md`](../docs/TRADE-SYSTEM.md) |
| Sound, music, or the mute control | [`docs/AUDIO.md`](../docs/AUDIO.md) — **three defects are live; one deleted line fixes two of them** |
| Anything drawn on the board | [`docs/BOARD-RENDERING.md`](../docs/BOARD-RENDERING.md) |
| Bot behaviour or tuning | [`docs/BOT-DESIGN-PRINCIPLES.md`](../docs/BOT-DESIGN-PRINCIPLES.md), [`docs/BOT-V3-RACE-PLANNER.md`](../docs/BOT-V3-RACE-PLANNER.md) |
| Browser or playtest automation | [`docs/DRIVING-THE-GAME.md`](../docs/DRIVING-THE-GAME.md) |
| Git, deploying, the live domain | [`docs/GIT-AND-DEPLOY.md`](../docs/GIT-AND-DEPLOY.md) |
| Reviewing work before he sees it (rule 25) | [`.claude/CEO-BRIEF.md`](CEO-BRIEF.md) + [`.planning/CEO-REVIEWS.md`](../.planning/CEO-REVIEWS.md) |
| **Testing, measuring, or trusting any instrument** | [`docs/QA-PROCESS.md`](../docs/QA-PROCESS.md) — *THE WHOLE LOOP, END TO END*, and [`docs/HARD-WON-LESSONS.md` §10](../docs/HARD-WON-LESSONS.md) — the day five instruments lied |
| **Reporting a discrepancy, or anything that looks like a host/guest bug** | [`docs/INTENDED-BEHAVIOUR.md`](../docs/INTENDED-BEHAVIOUR.md) — *the things that look wrong and are NOT. Three sessions have now made Wyatt explain the same one* |
| **Everything — read at session start** | [`docs/HARD-WON-LESSONS.md`](../docs/HARD-WON-LESSONS.md) |

### Two facts that save the most time

**The board is drawn in FIVE layers.** An HTML overlay mapped to board coordinates **must be added to
`CAM_HTML_LAYERS`** or it detaches the moment the director zooms. And **anything that animates
continuously must be HTML, not SVG** — Chrome cannot composite an SVG transform animation at all: the
same animation measured ~62 layouts/sec as SVG and **zero** as HTML.

**Driving the game:** the flippenator coin `#flipCoinWrap` **is** the flip button (it is not an
`.apBtn` — this stalled three separate attempts), and a window narrower than about a second cannot be
hand-driven, so use the armed watcher in §5d. **Measuring cost is not measuring layout** — the §8a
launch line's `--disable-gpu` is wrong for cost, and an idle headless page stops producing frames so
animations measure as free. Same page, same 5s window: **0.2% CPU / 0 layouts per second** without a
rAF loop, **11.1% / 60** with one. Drive frames, and quote the fps beside every cost figure.

### `docs/HARD-WON-LESSONS.md` — read it at session start

Wyatt, 2026-08-08: *"Write down all of your recent learnings to your document where you record these
— and then tell me what it is called, and make yourself read it before starting new sessions."*

**Read all of it, before the first tool call.** The weaker version of this instruction failed: on
2026-08-08 a session hit **three lessons already written in that file** and paid for each again. All
three were on the page, in those words, unread.

**Re-read a lesson at its TRIGGER, not once at session start.** The session that committed the exact
rescaling failure §0 describes had read the whole file that morning.

If you read nothing else: **do not trust your own reasoning over a measurement.** Verify against an
independent path, never against the suspect itself — and **check that a check can FAIL before
believing it passing.**

---

## 5. Project status and planning

> ### ⚑ START HERE — WYCLAU IS IN FORCE (approved by Wyatt 2026-08-31)
>
> 1. **Enter through the Door** — the `door` skill. It is the one way into a work session: sync,
>    orient, state the situation in five lines, pulse the Glass, work the plan.
> 2. **The plan is [`.planning/CHART.md`](../.planning/CHART.md)** — launch line, checklist, what
>    is blocked on Wyatt, the idea inbox. **Not ROADMAP.md or STATE.md** (both historical).
> 3. **His rulings are [`.claude/memory/DECISIONS.md`](memory/DECISIONS.md)** — answer from them,
>    never re-ask a settled question. A ruling he made that nobody harvested is the failure this
>    system exists to stop (`docs/HARD-WON-LESSONS.md` §12k).
> 4. **The interface is the Glass** — https://claude.ai/code/artifact/74034bde-ad7e-4861-913e-d5d190801af2
>    — where he sees progress, writes ideas, and rules on questions. Pulse it with
>    `node scripts/wyclau/glass.mjs --note "..."`, and **harvest before republishing** (a hook
>    enforces this). The operating agreement is [`.planning/wyclau/CHARTER.md`](../.planning/wyclau/CHARTER.md).
>
> *The full rules rewrite is staged at `.planning/wyclau/CLAUDE-next.md` and lands at the cutover
> — his ruling: after the 24-hour exit test verdict. Until then this box is the entry point and
> the rest of this file still stands.*

**Current milestone: v2.0 "The New Game"** — promoting the `4/` redesign to become the official game.
Historical context only: [`.planning/STATE.md`](../.planning/STATE.md) and
[`.planning/ROADMAP.md`](../.planning/ROADMAP.md). The intake research that reconstructs the `4/`
development period is [`.planning/research/v2.0-intake/`](../.planning/research/v2.0-intake/) — read
the relevant report before planning any phase; it is the only synthesis of a period that left no GSD
artifacts.

### Every change to the game goes through a SEA TRIAL

```bash
node scripts/qa/gear.mjs      # how deep does THIS change have to go?
node scripts/sea_trial.mjs    # run it; writes .planning/SEA-TRIAL.md
```

**Full contract: [`docs/QA-PROCESS.md`](../docs/QA-PROCESS.md)** — read its *"THE WHOLE LOOP, END TO
END"* section before changing how anything is tested. Every step in it exists because skipping it
cost something on 2026-08-26; the war stories are [`HARD-WON-LESSONS.md` §10](../docs/HARD-WON-LESSONS.md).
**A hook stops the first edit to game code in a session and states the gear** — `.claude/hooks/qa-gear-first.cjs`, beside the one that
enforces rule 17.

Wyatt named it on 2026-08-26. A *sea trial* is the naval term for taking a vessel out and testing
everything before it is accepted into service. **He chose it over "QA" deliberately:** *"did you QA
it?"* can be answered evasively — the night before, a session had run *something*, so it could say
yes while **18 of its 22 fixes were unverified**. *"Did you run the sea trial?"* cannot, because a
sea trial leaves a report with a build stamp in it and he can open the report.

**FOUR STEPS, never skipped, never reordered:** show it broken (write the check that FAILS first) →
change it → show it fixed (that SAME check passes) → sweep.

**THREE GEARS, chosen by the files you touched, never by how the change feels:**

| | | |
|---|---|---|
| **COSMETIC** | words, colours, comments | step 1 waived; `npm test` + a screenshot |
| **PLUMBING** | how a mode *serves the game up* — the device hand-off, room codes, joining | that mode, **and the others once** |
| **FULL** | **everything else — the default** | three modes, **three sizes** (desktop / tablet / phone), **both engines**, real mouse |

**The middle gear is a different SUBJECT, not a smaller size.** Wyatt, 2026-08-26: *"Each mode
should be structurally different just about who the player is playing against, but the game itself
should remain consistent for every player in every mode."* An earlier draft had a gear meaning
"behaviour changed inside one mode" and he threw it out — **that sentence presumes the fork it is
supposed to prevent**, then looks only where the fork is. `scripts/mode_fork_check.js` now fails
the build when a new fork appears in code that draws.

**What the report must never lose: the NOT-RUN column.** A leg that could not start is not a leg
that passed. "We tested it" becomes a lie precisely there.

### Run the health check before reporting status or closing a phase

```bash
node .claude/gsd-core/bin/gsd-tools.cjs validate health
```

1. **Before answering "where are we"** or any status question.
2. **Before closing a phase**, alongside `npm test`.

**Surface what it finds in your reply.** A warning you read and dismissed is fine; a warning nobody
looked at is how this project loses days. **Treat the pass/fail verdict as close to meaningless** —
W019 fires permanently on eight files Wyatt keeps deliberately, and W002/W011 are prose-grepping
artefacts. The value is in what it incidentally shows you.

**Detail — every warning code, the full known-noise list, and the four record failures no structural
check can see: [`docs/PLANNING-HEALTH.md`](../docs/PLANNING-HEALTH.md).**

### Three conventions that keep the record honest

1. **Point, don't restate.** A checklist row links to the verification report; it never repeats the
   verdict. A pointer cannot go stale; a copy always can.
2. **Never hand-type a number that can be counted.** Any percentage typed into a document is wrong
   the moment work continues.
3. **No future tense in an append-only record.** A ledger records what happened. **A prediction in a
   log rots into a lie with nobody editing it.**

<!-- GSD:workflow-start source:GSD defaults -->

### GSD — WHICH HALF, AND WHEN. Wyatt's ruling, 2026-08-28.

He asked what integrating GSD costs and buys, and the honest measured answer was that **GSD is two
systems under one name, in opposite health here.** The one-small-task half is alive — 24 folders in
`.planning/quick/`, 13 of them in one week. The phase/roadmap half had been dead for **215 commits**
and was actively misleading: `/gsd-autonomous` read `ROADMAP.md` on 2026-08-28 and proposed
re-planning the cutover, which shipped a week earlier. `ROADMAP.md` now carries a banner saying so.

**THE TWO SYSTEMS ARE NOT COMPETING — THEY GUARD DIFFERENT FAILURES.** GSD's phase loop guards
against *building the wrong thing*. The sea trial and the CEO guard against *shipping the broken
thing*. This project's pain has been almost entirely the second kind, which is why the ledger loop
grew where it did. Neither is a superset of the other.

| the work | the loop |
|---|---|
| **an item** — a playtest-list bug, a copy fix, a layout item | **`/gsd-quick`, then the four steps**: claim it in the ledger, gate RED first, fix, gate green, matched-pair screenshot, per-item CEO. His pick, 2026-08-28: the quick artifact is worth the extra step for the cross-session paper trail. |
| **a milestone** — a cutover, a new mode, the tutorial | a real GSD phase (discuss → plan → execute). Thinking first pays where the thing is big and hard to undo. |

**`ROADMAP.md` AND `STATE.md` ARE NOT AUTHORITATIVE AND NO COMMAND SHOULD PLAN FROM THEM.** The live
record is [`CTO-LEDGER.md`](../.planning/CTO-LEDGER.md) plus
[`BACKLOG.md`](../.planning/BACKLOG.md)'s wave list. Reconciliation is deferred to the start of the
next milestone, when the phase list is rewritten anyway — his call, over spending a fix window on it.

> **⚠ CORRECTION, 2026-08-28, SAME DAY, BY THE SESSION THAT GOT IT WRONG.** The paragraph that was
> here said *"rule 21's health check CANNOT RUN in a cloud session"*, and that was **false**. What
> was actually checked was the `~/.claude/…` path this file used to print — a path that exists on
> Wyatt's Mac and not in a container. **The tool is in the repo**, at
> `.claude/gsd-core/bin/gsd-tools.cjs`, and the check runs fine in the cloud: 0 errors, 36 warnings,
> 33 of them the known W019 noise, plus a phase folder the roadmap does not list, a missing
> validation doc, and a stale worktree this session had left in scratch (since removed).
>
> **The real fault was one character of documentation**, and it is worth more than the wrong claim
> was: a home-rooted path in a doc is a command that works for exactly ONE machine and silently
> misleads every other one. `doc_command_check.js` could not see it, twice over — `~` was not in its
> path pattern, so such a command never matched at all, and behind that sat a `startsWith("~")` skip
> calling it *"outside the repo on purpose"*, which could therefore never fire. **It now FAILS a
> home-rooted command instead of skipping it**, and it caught this one in two files, not one.
>
> **The lesson is rule 6's, again: an instrument that reports NOT FOUND has told you something about
> ITSELF, not about the world.** Ask what it actually looked at before repeating it to him.
<!-- GSD:workflow-end -->

<!-- GSD:skills-start source:skills/ -->

### Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

---

## 6. THE RELEASE PROCESS — staging, then production

**Full contract: [`docs/GIT-AND-DEPLOY.md`](../docs/GIT-AND-DEPLOY.md) §5. The shape, in one screen:**

| environment | address | what it is |
|---|---|---|
| **staging** | `staging.playpastrypirates.com` | where Wyatt plays work in progress. Published from ANY branch |
| **production** | `playpastrypirates.com` | the game real players are in the middle of — `main`, repo root, **no build step** |
| frozen | `playpastrypirates.com/classic` | v1 |

> ### ⚠ TWO REPOSITORIES. THIS FILE DID NOT SAY SO UNTIL 2026-09-06, AND THAT COST HIM A MORNING.
>
> | | repo | what it is |
> |---|---|---|
> | **the source** | `wyattroy/pastrypirates` | **this checkout.** Your branches, and `main`. All work happens here |
> | **the staging host** | `wyattroy/pastrypirates-staging` | **a publish target, not a codebase.** One branch, no development, overwritten by every publish |
>
> **Nobody clones the staging repo and nobody works in it.** It exists only because **GitHub Pages
> serves one branch per repo at one domain** — pointing this repo's Pages at a staging branch would
> take production down. Detail: [`docs/GIT-AND-DEPLOY.md`](../docs/GIT-AND-DEPLOY.md) §5.
>
> **THE VOCABULARY, because the wrong verb is what caused the confusion:**
> - **PUBLISH to staging** — `npm run deploy:staging -- "what changed"`. It **COPIES** your working
>   tree into the staging repo. Any branch, any time, no approval. ***Staging is an address, not a
>   branch — you never "merge to staging."***
> - **RELEASE to production** — that one **IS** a merge, into `main` **in this repo**, and it is
>   served to real players instantly. **His approval, always.**
>
> ⛔ **SO GIT ANCESTRY CANNOT ANSWER "DID MY WORK SHIP?"** Staging is published by copy, so there is
> no ancestry to measure. On 2026-09-06 a session ran `git merge-base --is-ancestor HEAD
> origin/main` → NO, and `git rev-list --count origin/main..HEAD` → 1355, and told him his merge had
> failed. **Both numbers were true and about the wrong subject** — they measured PRODUCTION while he
> was talking about STAGING — and it went on to alarm him that players were on an eleven-day-old
> build, which is accurate, intentional, and not a fault. **Rule 6 again: an instrument that answers
> honestly about the WRONG SUBJECT is the most convincing kind of wrong.**
>
> **ASK THE SITES, NOT GIT. One command, and it prints all three:**
>
> ```bash
> node scripts/where_is_my_work.mjs     # working tree · staging · production, side by side
> ```
>
> **`playpastrypirates.com` being older than your branch is NORMAL** — production is deliberately
> unreleased. That is not a bug to report to him.

**TWO ENVIRONMENTS, ONE SOURCE TREE. Promotion is a MERGE, never a copy.**

1. **ONE SOURCE TREE** — `index.html` + `src/`. **Never a second folder holding "the staging
   version".** That is two things kept in step by memory, and it drifted within twelve hours the one
   day it existed.
2. **PROMOTE THE ARTIFACT** — production changes because the SAME COMMITS moved onto `main`. Copying
   files at release time ships something nobody tested.
3. **ENVIRONMENTS DIFFER BY CONFIGURATION, NOT CONTENT** — same game, different address, its own
   `robots.txt`.
4. **A RELEASE IS REVERSIBLE** — undo a bad one by reverting the merge.

> **Staging is a STAGE, not a copy.** A release does not consume it and no new one is made
> afterwards. It is a permanent address whose contents are replaced each time you publish.

```bash
git checkout -b aug28-topic                  # dated branch: monthDD-topic
npm test                                     # 19 gates, exit 0
node scripts/qa/gear.mjs                     # how deep must this be tested?
node scripts/sea_trial.mjs                   # sail it at that gear
npm run deploy:staging -- "what changed"   # -> staging.playpastrypirates.com
#  ...Wyatt plays staging. Stamp must read <stamp>-STAGING/<branch>.
#  ...ON HIS APPROVAL ONLY:
git checkout main && git merge aug28-topic && git push origin main && git pull origin main
curl -s https://playpastrypirates.com/src/ui/stage.js | grep -o 'PP4_STAMP = "[^"]*"'
```

**The tell that a session skipped this: he reports an old build stamp.** It is never a cache — there
is no build step. **If he cannot see it, it is not on `main`.**

> ### ⚠ EVERY PUSH TO `main` IS SERVED TO REAL PLAYERS IMMEDIATELY
> There is no separate dev tree any more and nothing stands between `main` and the domain.
> **Sail the trial and publish to staging BEFORE you merge, not after.**

### The gates that stop this rotting — one cutover broke SIX instruments and none of them said so

`tree_health_check` (the chain's own paths resolve) · `game_url_check` (the fleet points at a page
that really contains the game) · `doc_command_check` (every `node …` command and link in the docs
exists) · `gate_count_check` (declared gates = gates run) · `gear.mjs` + `qa-gear-first.cjs` (what
counts as game code, by EXCLUSION, strict by default).

**The reusable lesson: a hand-kept list of what to guard rots exactly like the thing it guards.**
Every one of these DERIVES its answer — from `.gitignore`, from the directory, from `package.json`'s
own chain — rather than from a list somebody typed.

---

## Project

**Pastry Pirates** — a browser-based, pirate-themed pastry board game playable solo (against AI
captains) or in real-time multiplayer via Firebase sync. Players sail a grid of islands gathering
ingredients, trading, battling, and racing to bake a winning recipe.

**Core Value:** The game must stay playable and fair end-to-end in both Safari and multiplayer — a
storm must not crash the game, and pausing the multiplayer timer must never destroy game state.

**Stack:** Vanilla HTML/CSS/JS, native ES modules, **no build step**. Firebase Realtime DB for
multiplayer. Python 3 for the offline balance simulator. Must run correctly in Safari and Chrome.

**Determinism:** the multiplayer engine is seeded (`mulberry32`) and lockstep replay depends on it.
Changing what the engine emits into the event stream invalidates the whole determinism corpus and
forces a gated re-record — **prefer UI-tier fixes.**

Living detail: [`.planning/PROJECT.md`](../.planning/PROJECT.md).
<!-- GSD:project-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->

---

> **A note on the auto-generated sections.** The `GSD:stack`, `GSD:conventions` and
> `GSD:architecture` blocks were removed on 2026-08-18. They were 348 lines describing the
> **pre-v1.1 monolith** — citing `index.html:1017–1684` for the Game class and `index.html:5166` for
> asset preloading, when `index.html` is 1,391 lines and contains no `class Game` at all. Every
> session was loading confidently wrong file references. **Regenerate them with
> `/gsd-map-codebase` after the v2.0 cutover**, once the promoted tree is the codebase and the map
> would be true. Do not regenerate before then — it would document a directory that is about to move.
