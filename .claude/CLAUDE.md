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
| 6 | **Never report a defect as confirmed before you have measured it** | [§1](#1-working-with-wyatt) |
| 7 | **Do not build tooling when the ask is to fix the game** | [§1](#1-working-with-wyatt) |
| 8 | **Consistency is a core value** — same gesture, same behaviour, everywhere | [§2](#2-design-rules) |
| 9 | **Nothing is a constant** — derive it from what the game already computes | [§2](#2-design-rules) |
| 10 | **Read the graveyard** — what was tried and rejected lives in the git log | [§2](#2-design-rules) |
| 11 | **The narration box reveals top to bottom, in DOM order** | [§2](#2-design-rules) |
| 12 | **The credits and About page are NOT in pirate speak** | [§2](#2-design-rules) |
| 13 | **Bots and humans have identical rules and affordances** | [§2](#2-design-rules) |
| 14 | **`CNAME`, `robots.txt`, `sitemap.xml` never leave this repo** | [§3](#3-safety--where-getting-it-wrong-costs-real-damage) |
| 15 | **`git fetch` before you trust any ref; keep `main` synced both ways** — *and if the pull moved this file, re-read it* | [§3](#3-safety--where-getting-it-wrong-costs-real-damage) |
| 16 | **Work in the main checkout — worktrees are retired** | [§3](#3-safety--where-getting-it-wrong-costs-real-damage) |
| 17 | **Kill every headless Chrome and server you start, before you reply** | [§3](#3-safety--where-getting-it-wrong-costs-real-damage) |
| 18 | **Absolute paths always — two trees share one internal layout** | [§3](#3-safety--where-getting-it-wrong-costs-real-damage) |
| 19 | **PLAY THE GAME in two tabs to find what's wrong, and screenshot your own work before handing it over** | [§1](#1-working-with-wyatt) |
| 20 | **Read the subsystem's own design doc before writing a line** | [§4](#4-before-you-touch-a-subsystem) |
| 21 | **Run the health check before reporting status or closing a phase** | [§5](#5-project-status-and-planning) |
| 22 | **READ EVERY SCREENSHOT HE SENDS, PIXEL BY PIXEL. Never skip one** — he built it for you at real cost | [§1](#1-working-with-wyatt) |

> **22 rules, and three of them used to be six.** *Ask* and *ask with the UI* were one instruction
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

**The mechanism, measured — do not re-derive it, and do not guess at it as an earlier session did.**
Remote control is armed **once**, when a session starts (or when the 🌐 globe in the session's top bar
is clicked). A **15-minute idle timeout then tears it down, and it never re-arms itself.** "Idle"
means *Wyatt* is not typing — it is **completely blind to whether work is happening**. The proof is in
`~/Library/Logs/Claude/main1.log`:

```
2026-08-18 13:10:26  Enabling remote control for session local_1d43c178…     <- armed, once
2026-08-19 09:09:12  [WarmLifecycle:session] Idle timeout reached, disconnecting local_1d43c178…
2026-08-19 09:28:46  … 09:43:46 … 09:58:46 … 10:13:46   (every ~15 min)      <- never re-armed
                     [WarmLifecycle:session] Starting idle timeout … 900s
```

**Every one of those disconnects fired while a subagent was running flat out.** So the long
autonomous run — precisely when he most needs to watch from his phone — is the exact case that kills
his ability to. A brand-new session works, which is why "just start a new one" looks like a fix and
is really just a fresh 15-minute clock.

**There is NO re-arm. This is the part that matters.** Arming happens only inside
`LocalSessions.start`, from the auto-enable preference (`[rcAutoEnable] verdict: enable=true
source=explicit_pref` — Wyatt has it ON, which is why a brand-new session is reachable by itself).
Once the idle recycle has taken a session's bridge, **nothing brings it back**: the app bundle
contains no UI string for enabling, disabling or re-connecting remote control on a running session.
**The 🌐 globe is the browser preview panel, not remote control** — a session sent him there twice
before checking, which is how this note got written.

**So the rule is not "re-arm it," it is: work he needs to watch from his phone must run in a session
started for that purpose.** A long-lived session silently stops being phone-visible, permanently, and
neither he nor you can tell from inside it.

- **When he says he is stepping away, offer the handoff in that same reply** — a fresh session picks
  up from `.planning/` on disk, and `/gsd-execute-phase {N}` skips every plan that already has a
  SUMMARY. The cost of handing off is near zero; the cost of not is his whole window.
- **Never assert a cause for this without reading `~/Library/Logs/Claude/main1.log` first.** Two
  confident wrong answers were given on 2026-08-19 — "local sessions are never phone-reachable"
  (his had been, the day before) and "click the globe" — before anyone opened the log that says it
  outright.

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

### Work in the main checkout — worktrees are retired

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

```bash
pkill -f remote-debugging-port; pkill -f http.server
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

**Current milestone: v2.0 "The New Game"** — promoting the `4/` redesign to become the official game.
Start at [`.planning/STATE.md`](../.planning/STATE.md), then
[`.planning/ROADMAP.md`](../.planning/ROADMAP.md). The intake research that reconstructs the `4/`
development period is [`.planning/research/v2.0-intake/`](../.planning/research/v2.0-intake/) — read
the relevant report before planning any phase; it is the only synthesis of a period that left no GSD
artifacts.

### Run the health check before reporting status or closing a phase

```bash
node ~/.claude/gsd-core/bin/gsd-tools.cjs validate health
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

### GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:skills-start source:skills/ -->

### Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

---

## 6. How the work reaches Wyatt's phone

Wyatt, 2026-08-14: *"playpastrypirates.com continues serving its normal version; but
playpastrypirates.com/4 is serving the version that we are working on."*

`playpastrypirates.com` is GitHub Pages serving **`main`, from the repo root, no build step, no
deploy workflow.** What is on `main` *is* what is live.

| URL | Served from |
|---|---|
| `playpastrypirates.com` | repo root — the game real players play |
| `playpastrypirates.com/4` | `4/` — **the milestone under development**, what he playtests |

> **This changes at v2.0's cutover (Phase 6):** `4/` becomes the root, today's game moves to
> `/classic`. Update this table in the same commit.

**So pushing work-in-progress to `main` is normal, not a release** — the live domain is how he
playtests, and it is the only route at all when he is away from the laptop. Merging does not touch
the root game; they are different files. **Treat the *diff* as the thing to check, not the push.**

Every time: commit on the session's branch → **bump `PP4_STAMP` in `4/src/ui/stage.js`** → prove the
diff touches only the milestone → push, pull, verify zero → tell him the build stamp to look for.

**The tell that a session skipped this: he reports an old build stamp.** It is never a cache — there
is no build step. **If he cannot see it, it is not on `main`.**

Full loop and the incident that earned it: [`docs/GIT-AND-DEPLOY.md`](../docs/GIT-AND-DEPLOY.md) §5.

---

<!-- GSD:project-start source:PROJECT.md -->

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
