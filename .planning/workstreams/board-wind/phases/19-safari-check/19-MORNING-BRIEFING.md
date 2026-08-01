# Morning briefing — Phase 19 (Safari check)

Written overnight, 1 Aug 2026. You went to bed just after the phase asked you its one question.
Here is where things stand, what I decided on your own authority, and the one thing that needs you.

---

## 1. Do this first (about a minute)

**Tap this on your iPhone, on the home wifi:**

http://192.168.1.3:8934/index.html?wind=1

The Mac is still serving it (it has been all night). You should get the normal Pastry Pirates
lobby — the "Ye came to the sunny shores of Tortuga" screen. **Nothing about it will look new.**
That is correct and expected: the wind dots do not exist yet. All this is checking is whether your
phone can see the Mac at all.

Then tell me one of three things:

| Say this | Means |
|---|---|
| **go-ahead** | The phone loaded the page, and yes — build the dots the planned way. |
| **phone-failed** | The phone could not open the page. |
| **stop-and-rescope** | Something above sounds wrong; stop and re-think. |

That single answer unblocks the remaining four plans, which are written and waiting.

### What you are actually agreeing to with "go-ahead"

Two things, and the second is the one with teeth:

- **The phone reached the build.** Just that.
- **Where the dots get their random numbers.** Each dot needs a few random numbers — where it
  starts, how fast it drifts, how far it sways. The game already has its own stream of random
  numbers that every player's browser walks through in step; that is what keeps everyone in a
  multiplayer room seeing the same game, and 31 saved test games check it line for line. If the
  decoration pulled numbers out of *that* stream, every player's game would quietly drift apart and
  all 31 saved games would stop matching — a re-record job already scheduled for a later milestone.
  So the dots get their **own separate private stream** instead, started from the game's number so
  everyone still sees identical weather, but taking nothing out of the game's own stream. This is
  exactly what the storm rain already does. It is also what you already decided (D-12); the plan is
  just confirming it before walking through the door.

---

## 2. What I got done while you slept

Two of the six plans' worth of work, plus one thing that was quietly broken before I started.

- **Plan 19-01, first half — done.** The build is being served on port 8934 (a port never used
  before, so nothing hands back stale code), and `19-SAFARI-RUN.md` is written. That file is your
  script for the Safari afternoon: every link, both runs in order, no console commands, nothing to
  memorise.
- **Plan 19-02 — done, both halves.** There is now an automatic guard
  (`scripts/wind_dot_contract_check.js`) that runs as part of the test suite and refuses the
  specific kinds of animation code that caused BUG-01. It was deliberately written *before* the code
  it guards, so everything built later lands against a live gate rather than a promise.
- **A pre-existing break in the test suite — fixed** (see decision 2 below).

The test suite is green: 23 of 23 checks pass, and none of the 31 determinism fixtures moved.

---

## 3. Decisions I made without you — please sanity-check these two

### Decision 1 — I did NOT answer your checkpoint for you

I could have recorded "go-ahead" and let the whole phase run overnight. I decided not to, for one
reason: **the first half of that question asks whether your phone loaded the page, and nobody has
looked at your phone.** This phase exists to produce one trustworthy number about how much your
iPhone can handle. Writing down an unobserved fact as the foundation of that number would poison the
exact thing the phase is for. (The system's own safety rules also block auto-approving this kind of
gate, which I take as confirmation rather than an obstacle.)

**What this cost:** plans 19-03, 19-04, 19-05 and 19-06 did not run. They are fully written and will
go straight through once you answer.

**What I did instead**, so the answer is as cheap as possible for you: I verified from the Mac side
that the page genuinely *works* at that address — not just that the server responds, but that the
game actually boots. In Chrome, pointed at the phone's exact URL: the game loads, the board renders,
the lobby appears, there are no errors in the console, and `?wind=1` correctly does nothing yet. So
if your phone fails to load it, that is a phone-or-router matter, not a broken build — which is
useful to know before you spend an afternoon on it.

### Decision 2 — I fixed something outside this workstream's remit

`npm test` was already failing on this branch before Phase 19 started, and it blocked the phase
(every plan verifies against a green test suite).

The cause: back when milestone v1.2 was archived, two of your narration-review files were moved into
the archive folder — but the audit page was never updated, so it was still looking for them in the
old place and falling over.

I fixed it, in commit `4546c82`. Rather than just re-pointing at the new location, I made both
places try the archive first and the old spot second, because branches in this repo sit on *both*
sides of that move and a single hard-coded path would only ever be right on one of them.

**Two things you should know:**

1. This touched `art-review/` and `scripts/`, which are **outside the board-wind workstream's
   declared scope** (D-14 says this workstream owns `src/ui/board.js` and sprite assets). I judged
   it worth doing because it blocked everything and it is a stale-path fix with the original data
   fully intact. Recorded as deviation id 3 in `.planning/WINDOWS.md`. **Revert it freely if you
   disagree** — it is one self-contained commit.
2. **A check had been silently skipping.** The script version of that same lookup swallowed the
   error and carried on with nothing, which meant assertion 8 — the one verifying all 209 of your
   reviewed narration dispositions are accounted for — had not actually been running since the
   archive. It runs again now and passes (202 carried across, 6 retired on your own merge
   instruction, 1 whose mechanic you removed). Worth knowing that it was dark for a while.

---

## 4. Still to come, once you answer

| Plan | What it builds | Needs you? |
|---|---|---|
| 19-03 | The tracer: dots on screen, one animation loop, touch panel | No |
| 19-04 | The full fade-and-wobble motion, the 0–100 dial | No |
| 19-05 | The frame-rate meter and the plain-English summary | No |
| 19-06 | Chrome pre-flight, then **your two Safari runs** → `19-VERDICT.md` | **Yes — the afternoon** |

19-03 through 19-05 should run unattended. 19-06 is the one that needs your Safari afternoon, and
`19-SAFARI-RUN.md` is the script for it.

---

## 5. To restart

Just answer the question in section 1. If the session has been cleared, this restarts the phase:

```
/gsd-execute-phase 19 --ws board-wind
```

**One housekeeping note:** the server on port 8934 is still running, deliberately — it needs to stay
up for your phone test and the Safari runs. Tell me when you want it stopped.

---

### Overnight commits

```
f26b08f  docs(19-02): mark plan complete in board-wind workstream STATE/ROADMAP
72b32d4  docs(19-02): add plan summary for wind-dot contract guard
07ce920  feat(19-02): wire wind_dot_contract_check.js into npm test
4546c82  fix: read phase 15's review files from both sides of the v1.3 archive   ← decision 2
26a5590  docs(19): record pre-existing npm test break blocking 19-02 Task 2
7b0502d  feat(19-02): add wind_dot_contract_check.js Wave 0 guard
979041a  feat(19-01): serve branch on port 8934 and write the Safari run protocol
```
