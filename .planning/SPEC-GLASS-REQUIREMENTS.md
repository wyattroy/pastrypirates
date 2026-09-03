# WHAT THE GLASS HAS TO DO — the requirements, free of how

*Written by the Advisor 2026-09-02, 8:05 PM ET, at his instruction: **"write a scoping document for
everything that the Glass needs to do. add to the end all of your learnings about the limitations and
failings. then feed that scoping document to a new session to have it bluesky design a new version of
the glass."***

> ## ⚠ TO WHOEVER DESIGNS FROM THIS: READ THIS BOX FIRST
>
> **This document deliberately says WHAT and never HOW.** No storage engine, no hosting, no
> framework. That is not vagueness — **the current Glass's every failing traces to one early
> implementation choice nobody revisited**, and naming a mechanism here would hand you the same
> rut. Part 3 is the evidence; read it before you design, not after.
>
> **You are being asked to design freely.** If the answer is not a web page, say so. If two of the
> requirements below are in tension, say which and pick one. **Where you disagree with a requirement,
> argue with it — they are drawn from a year of watching one person use one tool, and some of them
> are habits wearing the costume of needs.**
>
> **The one thing that is NOT open: it exists to serve Wyatt.** Not sessions, not the record. Every
> requirement below is downstream of that.

---

## PART 1 — WHAT IT IS FOR

**The Glass is the surface between Wyatt and a fleet of AI sessions working on his game.** He is not
reading a dashboard about a system; **he is steering the system through it.** It has one reader.

**HIS OWN WORDS, 2026-08-31, when it was created:** *"it becomes our interface."*

Three jobs, in the order they matter:

1. **He sees what is happening** — what is being worked on now, what moved, what is stuck.
2. **He decides things** — questions reach him, his answers reach the work.
3. **He directs** — new instructions and ideas enter the system through it.

**Everything else is decoration.** When a requirement below conflicts with one of those three, the
three win.

---

## PART 2 — WHAT IT MUST DO

### A. SHOW HIM THE TRUE STATE

- **A1. What is being worked on right now**, in the words of the work, not an identifier. *(His own
  correction, 2026-09-02: "i don't know or care about the 'T-088 · claimed 16:49Z' — i want to know
  the content of it.")*
- **A2. Whether anything is being worked on at all.** A surface that shows the last thing when
  nothing is live is worse than one that says "nothing". *(Earned: a page that kept showing a
  finished item as if it were live.)*
- **A3. How fresh what he is reading is** — and, critically, **freshness of the underlying work,
  not of the page.** He ruled the wording himself: *"🟢 Progress: 6 min ago. 🟢 Updated: 4 min ago."*
- **A4. The task list, ordered by what should happen next**, with a reason he can overrule. Not file
  order, not age. *(He has asked for this five times.)*
- **A5. What is waiting on HIM**, separated from what is waiting on us.
- **A6. What shipped**, so progress is visible without reading commits.
- **A7. It must never show him a question he has already answered.** *(Six instances in one day.
  This is not a nice-to-have; it is the single most damaging failure in the current design.)*

### B. LET HIM DECIDE

- **B1. A question reaches him with the homework already done** — the measurement in the question,
  concrete options, a marked recommendation.
- **B2. He can answer in one gesture**, and in his own words when the buttons do not fit. **His
  written note always outranks the button.**
- **B3. His answer is visibly received.** He must never have to wonder whether it landed.
- **B4. The question disappears once answered** — see A7. **Recording the answer and retiring the
  question must be ONE act.**
- **B5. His answer reaches the work without a human relaying it.**
- **B6. His answers are never lost, never truncated, never paraphrased.** *(A page that truncated
  his words at a line wrap is a real fault from today.)*

### C. LET HIM DIRECT

- **C1. He can write an instruction or an idea at any time**, in any words, without choosing a
  category or a destination.
- **C2. What he writes cannot be destroyed by anything the system does.** *(Today his ideas lived in
  exactly one place — the page — from the moment he pressed the button until a session copied them
  out. Seven of them were once seven seconds from being unprotected.)*
- **C3. He can say THIS ONE, NOW**, and the system must act on that ordering.
- **C4. Every idea gets a visible fate** — shipped, scheduled, or parked with a reason — within a
  day.
- **C5. A newer instruction outranks an older one.** *(Today's ordering did the opposite: his newest
  instruction was mechanically his lowest-priority one.)*

### D. PROPERTIES THE WHOLE THING MUST HAVE

- **D1. What he sees is the truth of the system, or it says it does not know.** No surface may state
  something it has not checked. *(The recurring fault of the current one.)*
- **D2. "The record changed" and "he can see it" must be ONE event, not two.**
- **D3. It works on his phone.** He directs from a phone as often as a laptop.
- **D4. It is legible in seconds.** Not a wall of text; he has said so repeatedly.
- **D5. Any session can read from it and write to it** — including an unattended one. *(Today only
  a human-started session can update it, which is why the page is often hours stale.)*
- **D6. Concurrent writers must not clobber each other.** Three sessions and Wyatt all write today.
- **D7. It must be honest about its own health** — if it cannot reach the work, it says so rather
  than showing stale data as if it were fresh.
- **D8. It must not require his attention to keep working.** No step that depends on him noticing.

### E. WHAT IT MUST NEVER DO

- **E1. Never lose or alter his words.**
- **E2. Never ask him something he has answered.**
- **E3. Never show him a number or state it has not verified.**
- **E4. Never require a human to relay his decisions into the work.**
- **E5. Never make him the transport between two parts of the system.** *(He has repeatedly been the
  thing carrying information from one session to another.)*

---

## PART 3 — WHAT WENT WRONG WITH THE CURRENT ONE

*Every item measured on 2026-09-02 unless noted. This is the part that should shape the design.*

### THE ROOT: IT IS A DOCUMENT, NOT A STORE

The Glass is an HTML file regenerated from `CHART.md` and re-uploaded to change. **His writing lives
inside that same file.** Almost every failure below is a corollary.

### THE FAILINGS, GROUPED BY WHAT CAUSED THEM

**1. Re-uploading has a ceiling — and the ceiling was hit.**
`429 — daily publish limit reached (200)`. His answer sat correct in the record from 7:43:48 PM and
could not reach his screen until UTC midnight. **The mechanism that keeps his page current is what
exhausted the quota that then could not update it.**

**2. The record and the page are two artefacts updated by two acts — four divergences in one day.**
Rows retired at 6:26 PM while his page still read "Your call (2)". A fix he cannot see is
indistinguishable from nothing having happened.

**3. His words and ours share one file, so regenerating can destroy his writing.**
The entire "harvest before you republish" apparatus — a hook, a stamp, a runbook, a gate — exists
only to manage this. **Seven of his ideas were seven seconds from being unprotected**: a harvest ran
at 3:07:08 PM, found the box empty, stamped itself fresh; his first idea landed at 3:07:15 PM; the
stamp then said "safe to republish" for thirty minutes.
*(Later measured: the platform refuses a stale overwrite, so the loss was not silent — but nobody
knew that, and the whole apparatus was built on the assumption it was.)*

**4. Answering and retiring are separate acts — SIX instances in twelve hours.**
He answers; a session records the answer; **nothing removes the question.** Three hand-repairs in one
day. The last one is the sharpest evidence: a harvest wrote *"all five rules-page questions in the
Your Call table above are now answered"* — **and left all five asking**, because it had authority for
one half of the job and not the other.

**5. Ordering is decided in two places that disagree.**
The task list is ranked by score; the thing that picks the next job takes the **oldest** open
instruction. So the top of his list is not what gets worked — measured over ninety minutes, ranks 1,
2, 3 and 5 were never claimed while three older items were. **And his newest instruction was the last
of 25 in the queue that decides what happens next.**

**6. Only a human-started session can update it.**
An unattended watch has no publishing tool. So the page goes stale whenever no human session is
running — which is most of the time.

**7. Identity by prose.**
A question's id was the first 40 characters of its own text. **Two different questions on one item
produce the same id** — proven by construction — so his answer to one would retire the other and the
record would show him answering a question he never saw.

**8. Surfaces that state what they have not checked.**
A field named `artifactVersion` held a timestamp. A label reading *"N tasks look already finished"*
covered three unrelated conditions. A stamp called a harvest receipt recorded only that a session had
looked. **In every case the NAME was right, which is exactly why nobody noticed.**

**9. Text mangling.**
His words were cut off at markdown line wraps. A paragraph in a section that only renders table rows
was silently invisible — a real question waited while the card truthfully reported zero.

**10. He became the transport.**
Repeatedly the fastest path from one session's knowledge to another's was Wyatt noticing and saying
something.

### THE PATTERN UNDERNEATH ALL OF IT

**Two things that must agree, kept in step by discipline rather than by construction, always drift.**
The record and the page. The answer and the question. The stamp and the state. The rank and the
queue. **Every failure above is one instance.**

**The design question for the new Glass is not "which database".** It is: **for each pair of things
that must agree, what makes them the same thing?**

---

## PART 4 — CONSTRAINTS THAT ARE REAL

- **It cannot go down.** It is how he sees everything; a broken replacement is a day of blindness,
  not an inconvenience. **Run the new one beside the old until he says it is better.**
- **`CNAME`, `robots.txt`, `sitemap.xml` never leave the game's repo.** Two sessions have nearly
  taken the live domain down this way.
- **The current Glass is private to his account. Most alternatives are not.** Whether his working
  record may be world-readable is **his** decision and it gates the design.
- **The game's live Firebase database exists and is already used.** *(And a probe today found every
  room code world-readable, unauthenticated — flagged separately, not this design's problem.)*
- **`.planning/` is excluded from the staging deploy, and that deploy runs `rsync --delete`.**
  Anything hosted in the staging repo is wiped by the next game deploy unless explicitly excluded.

---

## PART 5 — WHAT WOULD MAKE A NEW DESIGN OBVIOUSLY BETTER

A design answers these or it is not finished:

1. **What makes "the record changed" and "he sees it" the same event?**
2. **What makes his answer and the question's disappearance the same act?**
3. **Where do his words live such that nothing we do can destroy them?**
4. **How does an unattended session read his decisions and write progress?**
5. **What is a question's identity, such that two similar questions cannot collide?**
6. **What decides what is worked on next, and is it the same thing he is looking at?**
7. **How does the page tell him it does not know, rather than showing him something stale?**
8. **What does he give up** — and is he being asked, or told?
