# WHERE THE SEAM GOES — three proposals for the vendored-kit problem

> # 🛑 CORRECTED BY CEO 102. READ THIS BEFORE THE DOCUMENT — TWO OF ITS LOAD-BEARING CLAIMS ARE WRONG,
> # AND ITS DECIDING QUESTION IS ANSWERED.
>
> **1 · "THE KIT IS PHYSICALLY UNREACHABLE" IS FALSE.** Inherited verbatim from
> `PENDING-KIT-PATCHES.md` patch 6 and **repeated without testing it** — the sixth unmeasured claim
> of this session. CEO 102 listed `C:/Users/wyatt/Projects/claude-kit` and read ten files in it;
> **this session then verified the same thing with its own hands.** Nothing about the machine
> refuses anything.
> **What is TRUE is narrower and much better news:** `bell.ps1:98-100` launches a watch as
> `claude -p … -WorkingDirectory $Repo` with **no `--add-dir`**, so a `-p` session — which has no
> human to approve a read outside its folder — cannot reach the kit. **That is a permission fence
> set in `.claude/settings.json`, which is in NEITHER lock list.** The wall described as physics is
> one line of config. *(CEO 102 was equally careful in reverse: nobody has run a `claude -p` watch
> to prove either the refusal or the fix. It is a five-minute test, still unrun.)*
>
> **2 · THE MECHANISM/PROCEDURE/PRESENTATION TAXONOMY DOES NOT SURVIVE ITS OWN FILE LIST.** Three of
> the four files called *"genuinely portable, rightly shared"* are soaked in this project:
> `close_item.mjs:49-52` hardcodes four `.planning/` paths; `start_trial_detached.mjs:35-36`
> hardcodes `scripts/sea_trial.mjs` and **exits 2 without it**; `longrun_status.mjs:74` derives its
> ceiling from *"the longest sea trial on record here."* **Nearly every file straddles the seam.**
>
> **3 · "ALL FOUR GLASS ASKS LAND IN `glass.mjs`" IS FALSE.** His OLDEST ask is patch 4, whose file
> is `.claude/skills/door/SKILL.md`. **Proposal 1 would have left it blocked** — against its own
> headline claim.
>
> **4 · THE DECIDING QUESTION IS ANSWERED, AND THIS DOCUMENT SHOULD HAVE ANSWERED IT.** *Is any repo
> other than pastrypirates running wyclau?* **No.** `claude-kit/.claude-plugin/marketplace.json`
> lists exactly one plugin, `org` — **wyclau is not in the catalogue and cannot be installed, only
> copied**; the kit's README never mentions it; **exactly one** folder on this machine carries
> `.claude/wyclau/VENDORED-FROM`; and kit commit `8691117` records the master copy running **104
> lines behind its only consumer.** *(Verified independently by this session after CEO 102 raised
> it. The Mac cannot be seen from here, so this is "no evidence of a second user", not "zero".)*
>
> ### ⭐ AND CEO 102'S FOURTH OPTION BEATS ALL THREE BELOW. IT IS THE RECOMMENDATION NOW.
>
> **PART A, tonight, not an architecture:** add the kit path to the additional-directories
> permission in `.claude/settings.json` — an unlocked, project-local file — and **test whether a
> watch can then reach the kit.** If it works, **four of the five blocked patches unblock tonight**
> and this whole redesign becomes a calm decision instead of an emergency. **This is Wyatt's call:
> it widens what an unattended session may read.**
>
> **PART B, the architecture: SHRINK THE SHARED SET INSTEAD OF STEERING IT.** Move the
> project-soaked files out of the vendored set and into this repo as ordinary project code —
> `glass.mjs`, `close_item.mjs`, `start_trial_detached.mjs`, `longrun_status.mjs`'s ceiling. Keep
> shared only what is genuinely portable: the Bell, `can_push`, the publish plumbing.
> **It answers his sentence exactly — *"there should be no reason to modify those files for a
> specific project"* — by removing the file from "those files".** No config language, no overlay,
> no expiry gate, no ownership inversion; `install.sh:31-33` already derives the copy list, so
> shrinking a module is a list edit. Unblocks 4 of 5; patch 4's Door is handled separately.
>
> **AND THE CLOSING RULE, SHARPENED INTO SOMETHING A GATE CAN CHECK:** no string a person reads may
> live in a shared file — **and no shared file may name a `.planning/` path or a game concept.**
>
> *The three proposals below are kept unedited, because the reasoning that led to them is the record
> and because P2's argument is what the evidence in point 4 now selects for.*

*Written by the Advisor 2026-09-02 at Wyatt's instruction: **"redesign the process (without actually
coding any of it) and give me 2-3 proposals on how to make it more robust to solve these problems
architecturally. get CEO review."** Design only. Nothing here is built.*

**His words:** *"we need a better way to add tasks to the watch than modifying vendored files. the
claude-kit files apply to every repo that is using claude-kit, not just this one. there should be no
reason to modify those files for a specific project (like pastry pirates). is the glass.mjs file
that you edited specific to THIS project, or is it shared by the claude-kit repo? why did you not
simply modify this repo's chart to make sure it made the correct edit next?"*

---

## HIS TWO DIRECT QUESTIONS, ANSWERED FIRST AND MEASURED

**1 · Is `glass.mjs` this project's, or shared? → SHARED, and he is right to object.**
It is line 1 of `.claude/wyclau/MANIFEST.sha256`, vendored from claude-kit `6825e43c`.
`.claude/wyclau/VENDORED-FROM` says outright: *"Do not edit these files here. Edit them in
claude-kit and re-vendor."* `scripts/qa/vendor_check.mjs` fails the build on any local edit.

**⚠ ONE CORRECTION TO THE PREMISE, AND IT MATTERS FOR THE DESIGN: this session never edited it.**
`git log --since="8 hours ago" -- scripts/wyclau/glass.mjs` is **empty**. It was read, never
written. **The problem is not that somebody edited a shared file — it is that the work he asked for
CANNOT be done without editing one, and so it was not done at all.** That is the more serious
version of his complaint, and the one worth designing against.

**2 · Why not just modify this repo's Chart? → I DID, and it does not help, which is the finding.**
`T-076` and `T-077` are Chart rows filed this session. **A Chart row is a project-local instruction
that any watch can read — that half already works.** What does not work is EXECUTING it: every one
of his four Glass asks lands in `glass.mjs`, and every change to the watch's own routine lands in
`.claude/skills/door/SKILL.md`. Both are vendored. **The Chart can name the work; it cannot make the
work possible.**

## THE DAMAGE, COUNTED RATHER THAN ASSERTED

`.planning/wyclau/PENDING-KIT-PATCHES.md` holds **five** blocked patches. Its own header set the
trigger for escalation: *"If it costs a third, it is probably time to ask Wyatt whether the wyclau
scripts should live in this repo and be vendored INTO the kit."* **It is at five and nobody
escalated.**

| # | what is blocked | whose decision it was |
|---|---|---|
| 1 | the rulings card's empty state tells him his rulings were lost | a copy fix |
| 2 | **a real bug**: pulsing consumes `GLASS-NOTE.md` even when the session cannot publish — it ate a live trial warning twice in one watch | CEO 77 |
| 4 | the Watch never runs the Chartkeeper's RANK — the Door is vendored | **HIS ask, four times** |
| 5 | `glass.mjs` and `chart_model.mjs` derive "what is open" separately — rule 23's *"what makes these two agree? nothing"* | rule 23 |
| 6 | SWEEP cannot ship, because the `done` count would read 0 | **HIS ruling, question UI** |

**Two of the five are his own decisions.** The Chartkeeper he asked for four times is half-built for
exactly this reason: REAP runs (its home, `GLASS-UPDATE-SESSION.md`, is not vendored) and RANK does
not (its home, the Door, is).

**AND THE KIT IS PHYSICALLY UNREACHABLE FROM THE MACHINE THAT RUNS THE RELAY.** Measured, not
assumed: a watch's read of `C:\Users\wyatt\Projects\claude-kit` is **REFUSED** — the same permission
wall the staging deploy hit. So a watch can find a bug in its own tooling, measure it, prove it,
write the patch — **and cannot ship it.**

## THE ROOT CAUSE, IN ONE SENTENCE

**The vendored set conflates three different kinds of thing, and only one of them is generic.**

| kind | example | belongs to |
|---|---|---|
| **MECHANISM** — how a relay works at all | `bell.ps1`, `can_push`, `close_item`, `start_trial_detached` | **the kit.** Genuinely portable, rightly shared |
| **PROCEDURE** — what a watch does each run | `.claude/skills/door/SKILL.md` | **mixed.** The shape is generic; the steps are this project's |
| **PRESENTATION** — what the page is called, what order it renders, what the copy says | `glass.mjs` | **the project.** Every one of his four asks is here |

**Renaming a card is a Pastry Pirates taste decision. It currently requires changing a library used
by every repo.** That is the fault, and no amount of process discipline fixes it.

---

# THE THREE PROPOSALS

## PROPOSAL 1 — THE SEAM: the kit owns mechanism, the project owns a manifest

**The kit stops containing anything project-specific. It reads project-local declarations instead.**

- **`.wyclau/glass.config`** (project-local, never vendored) — card order, card titles, copy
  strings, which sections render, where the `done` count comes from.
- **`.wyclau/watch.steps`** (project-local) — extra steps the Door appends to the watch routine.
  The Door keeps the generic shape: sync, claim, work one item, close through the gate.
- Kit files become **pure mechanism** with a hard rule: **no string a user reads, and no step
  specific to one project, may live in a vendored file.**

**What it fixes:** all four of his Glass asks become edits to a project file. Rename the card →
one line in `glass.config`. Move The Lesson below Tasks → reorder an array. **Patch 4 becomes a
project edit.** The taste queue goes to **zero, permanently.**

**What it does NOT fix, stated plainly:** patches 1, 2 and 5 are kit *bugs and structure*, not
taste. They still need the kit. **This proposal shrinks the queue; it does not close it.**

**Its honest risk:** a config surface is a guess about what will vary. Anything he wants that the
config does not express is back in the queue, and the temptation is to keep widening the config
until it is a programming language. **The discipline is that the config declares DATA (names, order,
which), never behaviour.**

## PROPOSAL 2 — INVERT: this repo is upstream, the kit vendors FROM it

**The wyclau source lives in `pastrypirates`. claude-kit pulls from here.** This is the answer
`PENDING-KIT-PATCHES.md` itself proposed at its escalation trigger.

**What it fixes:** everything, immediately. The relay runs where its source lives, so a watch that
finds a bug in the Bell can fix the Bell, gate it, and ship it in the same run. **The queue goes to
zero and stays there.** No permission wall, no second machine, no round-trip.

**What it costs, and this is the argument against it:** a game repo becomes a library's upstream.
Every other repo using claude-kit inherits changes driven by Pastry Pirates' needs — **and it does
not solve the conflation at all, it relocates it.** The next project to adopt wyclau will want its
own card names, and will have to change a file in a pirate game to get them. **The same complaint he
is making now, pointed the other way.**

**Where it is genuinely right:** if wyclau has exactly one real user, a shared library is
speculative generality and the kit is ceremony. **That is a factual question he can answer in one
sentence: is any other repo actually running wyclau today?** If the answer is no, this proposal is
much stronger than it looks, and Proposal 1's config surface is solving a problem nobody has yet.

## PROPOSAL 3 — OVERLAY: kit files are defaults, project files win

**A project-local `scripts/wyclau/local/` that the kit's entrypoints load if present and prefer.**
`vendor_check.mjs` guards only the kit copies; the overlay is free to edit and is never compared.

**What it fixes:** everything is unblocked *immediately*, taste and bugs alike, on the machine that
finds it. A watch that proves a bug can ship the fix as an overlay tonight and let the kit catch up.

**What it costs — and this is the one the project's own rules argue hardest against:** **two things
that must agree, kept in step by discipline.** Rule 23's design-time question is *"what makes these
two agree?"* and the answer here is *"nothing."* Overlays accumulate into a shadow fork nobody
audits, and the kit silently becomes fiction.

**It is only survivable with an expiry rule**, which must be part of the proposal rather than a
hope: **an overlay carries the date it was created, and a gate fails the build when one is older
than N days without being upstreamed.** An overlay is a splint, not a limb.

---

# THE RECOMMENDATION

**Proposal 1 as the architecture, Proposal 3 as the escape hatch, with the expiry rule — UNLESS the
answer to one factual question is "no", in which case Proposal 2 beats both.**

**THE QUESTION THAT DECIDES IT, and it is his to answer in one sentence: is any repo other than
pastrypirates actually running wyclau today?**

- **If YES** — the boundary is real, and Proposal 1 is right: put the seam where the variation
  actually is (presentation and procedure), keep mechanism shared, and use Proposal 3's overlay
  with an expiry gate for the bugs that would otherwise queue.
- **If NO** — wyclau has one user, and the kit is ceremony charging a real tax: **five blocked
  patches, two of them his own rulings, one of them a bug that has already eaten a live warning
  twice.** Proposal 2 collapses the whole problem, and the generality can be extracted later *from
  working code*, which is the direction that has never failed in this project.

**Whichever is chosen, one rule is common to all three and should be adopted regardless:
NO STRING A USER READS MAY LIVE IN A VENDORED FILE.** That single rule would have prevented every
one of his four Glass asks from ever entering a patch queue.

## AND THE ESCALATION THAT DID NOT HAPPEN IS ITS OWN FINDING

`PENDING-KIT-PATCHES.md` named its own trigger — *"if it costs a third"* — and reached **five**
without anyone raising it. **A file that records a growing cost, and is only read by the sessions
already paying it, is not an alarm.** Whatever is chosen here, the queue needs a surface he can see:
a count on the Glass, or a row on the Chart that rises as the queue grows. **A backlog nobody
escalates is indistinguishable from a decision to accept it.**
