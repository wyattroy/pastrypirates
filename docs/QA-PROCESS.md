# How we prove a change to Pastry Pirates

**One process. Four steps. Three gears. Called every time the game's code changes.**

Wyatt, 2026-08-26: *"I want one elegant process that is called every time we need to change the code
of the game. Design this such that small changes can be qa'd quickly, and large changes are qa'd
appropriately, but all using a similar logic."*

> ### WHY THIS EXISTS, and it is not theory
>
> On 2026-08-25/26 a session shipped **22 fixes and verified 4** — all of them in solo mode, on a
> phone-sized screen. It chose how hard to test each fix by feel. It wrote ten separate scripts,
> each named after one bug, eight of them solo-only, and **wired none of them into `npm test`**, so
> none will ever run again.
>
> Nothing in that sentence is unusual. It is what happens by default when the depth of testing is a
> judgement call made by whoever is tired at 3am. **This document removes the judgement call.**

---

## The four steps. They never change, never reorder, and are never skipped.

| | | |
|---|---|---|
| **1** | **Show it broken** | Write the check that FAILS, *before* touching the code. If you cannot make it fail, you have not found the bug — you have found a theory. |
| **2** | **Change the code** | |
| **3** | **Show it fixed** | That same check now passes. Not a different check. The same one. |
| **4** | **Sweep** | Confirm you broke nothing else. |

**Only step 4 changes size**, and step 1 is waived in exactly one gear. Everything else is constant
whether you are fixing a typo or rewriting the wire.

*(Engineers call step 1 → step 3 a **red-green test**: red is the failing check, green is the passing
one. The point of writing it first is that a check written afterwards has never been seen to fail,
so nobody knows whether it can.)*

---

## The three gears — chosen by the files you touched, not by how the change feels

```bash
node 4/scripts/qa/gear.mjs
```

It reads what you actually changed and tells you the gear and the sweep. **It is mechanical on
purpose**: a rule based on how risky a change feels cannot be enforced by anything, and the whole
reason this document exists is that a session picked its own depth by mood.

| Gear | You are here when | Step 1 | The sweep |
|---|---|---|---|
| **COSMETIC** | only words, colours or comments changed | **waived** — a colour proves itself with a screenshot | `npm test` + a screenshot of the one screen |
| **PLUMBING** | **how a mode SERVES the game up** — pass-and-play's hand-the-device gate, crew's room codes / joining / the 30-second grace | **required** | `npm test` + `matrix.mjs --mode=<that mode>` **and the other modes once**, to prove the serving change did not leak into the game |
| **FULL** | **everything else — this is the default** | **required** | `npm test` + `matrix.mjs` (all three modes, three sizes, a real two-browser crew game) |

### The middle gear is a different SUBJECT, not a smaller size

Wyatt, 2026-08-26: *"Each mode should be structurally different just about who the player is playing
against, but the game itself should remain consistent for every player in every mode."*

**Pastry Pirates is one game, not three.** Solo, pass-and-play and crew are three answers to one
question — *who are the other captains, and how does a turn reach them?* Everything else is the same
game, and **a player should not be able to tell which mode they are in** from the board, the
narration, the wording, the pacing or the prompts.

**An earlier version of this document had a gear meaning "behaviour changed inside one mode", and he
threw it out.** That sentence *presumes the fork it is supposed to prevent*: it treats "this only
affects crew" as an ordinary thing to say, then only looks at crew — so a divergence introduced
anywhere else sails through, and the process quietly teaches itself that forking modes is routine.
It is the same failure as the parity gate declaring `localAsk` an acceptable gap: **a process
agreeing, in advance, that a fork is fine.**

So PLUMBING covers only *the seating* — who gets asked, when, and how the device or the wire carries
it. Never what they then see.

**PLUMBING MUST BE EARNED. Everything else defaults to FULL.** That polarity is deliberate: the gear
picker shipped an hour before this paragraph defaulting to the LENIENT answer when it had no
evidence, and dropped real changes into the gear that skips proving them broken.

**The tell that separates plumbing from the game:** if a change can alter what any player sees or can
do, it is **not** plumbing. `pos` went missing from the guest's sail prompt exactly here — it looked
like wire plumbing, and it changed what a guest could *do*. Hence: an edit mentioning a prompt's
payload or a renderer is THE GAME, whatever file it lives in.

*(Engineers call the underlying idea **blast radius**: how much of the product one change can break.
Scaling test effort to blast radius rather than to the size of the bug is called **risk-based
testing**, and it is what every professional team does.)*

---

## The robot that plays the game

```bash
node 4/scripts/qa/matrix.mjs                  # all three modes, three screen sizes
node 4/scripts/qa/matrix.mjs --mode=crew      # one mode
node 4/scripts/qa/matrix.mjs --quick          # phone size only
```

It opens real browsers, plays real voyages, and after every move looks at ten specific things. Then
it prints a grid: down the side, the things to look at; across the top, each mode at each screen
size.

**Every square is one of three things, and the third is the point:**

- **ok** — that thing held
- **FAIL** — it broke, with what was measured
- **·** — **NOBODY LOOKED.** Either the game never reached that state, or the whole combination
  never ran.

**The not-run count is printed at the bottom and it is the number that matters.** "We tested it"
becomes a lie precisely in that column. A check that cannot see its subject **skips** — it never
reports a pass.

*(A set of checks that runs on every change, regardless of size, is a **regression suite** —
"regression" meaning something that used to work and stopped.)*

---

## When the slow sweep runs

Wyatt's ruling, 2026-08-26: **automatically, in the background, and nothing ships until it comes
back clean.** The full three-mode sweep takes 20–30 minutes. Nobody waits for it and nobody has to
remember to run it; it gates the push.

The alternative he rejected — *run it only when asked* — is exactly what happened on 2026-08-25:
the thorough pass existed and nobody ran it.

---

## The rules that make this hold

1. **A check with no evidence returns the STRICT answer, never the lenient one.** The gear picker
   shipped with `[].every(...)` deciding "all changed lines are cosmetic" for an empty diff, which
   dropped real changes into the one gear that skips proving them broken. Caught by pointing it at
   a plain UI file. The same mistake pointed the other way let a narration probe measure a
   `display:none` panel and report PASS.
2. **Red-proof every check before believing it.** Break the thing on purpose; watch the check go
   red; put it back. A check nobody has seen fail is a check nobody should trust.
3. **If it is not in `npm test`, it does not exist.** Ten probes were written on 2026-08-25 and
   none were wired in. None has run since.
4. **The rig is not a bug.** When the two-browser rig breaks, everything stops until it runs. A
   per-bug time budget must never be applied to the thing bugs are tested with — doing that
   silently turned "test every mode" into "test solo", and nobody said so out loud.
