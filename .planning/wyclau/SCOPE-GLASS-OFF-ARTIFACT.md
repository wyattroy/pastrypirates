# Scope — move the Glass off the artifact so a woken Blade can move it

**His ruling, 2026-09-06, through the question UI:** *"Move your input off the artifact, into
Firebase"* — chosen over a read-only staging mirror, a Mac hand-off, and doing nothing.

**The defect this closes, in his words:** *"the actual gap is that once the blade woke up, the page
did not update."* Measured: the Bell rang at `13:01:30Z` and at least ten more times through
`16:58:02Z` — 3h57m of live relay — while the Glass sat at its `2026-09-04T11:53Z` generation.

## Why this is the only option that closes it

A Bell-rung watch is `claude -p` and **has no Artifact tool at all** — so it can neither READ the
page (no harvest) nor WRITE it (no publish). Every design that leaves his decisions inside the
artifact keeps a mandatory interactive session in the loop, and that session is what died.

**What a headless watch CAN already do, both measured 2026-09-06 rather than assumed:**

| capability | evidence |
|---|---|
| render the whole page to any file | `glass.mjs --chart=<path> --out=<path>`, `scripts/wyclau/glass.mjs:121` — "writes ONE file, the one you named, and touches nothing else" |
| publish to a real tappable URL | `npm run deploy:staging`, any branch, no approval — a `-p` session shipped `two-machines.html` this way today |

So the render and the publish are both solved. **The only piece that must move is where his writing
lives** — today `glassState`, which exists only inside the artifact.

## ⛔ THE THREAT IS WRITE, NOT READ — AND HE CAUGHT THAT, NOT THIS SCOPE

**Wyatt, 2026-09-06, choosing real authentication:** *"If other people are able to add or change
parts of my Glass watch, they could completely break the game."*

> ### ⚠ THE SECTION THAT WAS HERE ASKED THE WRONG QUESTION, AND ITS FOUR OPTIONS WERE ALL SHAPED BY IT
>
> It was headed *"THE PRIVACY PROBLEM"* and every option traded off **who can READ his notes** —
> curtain, noindex, robots.txt, a rule to stop the database handing his words out. **All of that
> is real and none of it is the danger.** He was offered a menu about confidentiality and answered
> about **integrity**, which is the axis nobody had put on the table.

**WHY HE IS RIGHT, and it is the whole reason this build is not a status page.** The Glass is not
something a watch DISPLAYS — it is something a watch **OBEYS**. Trace what one typed sentence does:

| what he types | what it becomes | who acts on it |
|---|---|---|
| an idea | a row in `.planning/wyclau/INBOX.md`, then a Chart row with a handle | a watch takes it as its one item |
| **DO NOW** | `chartkeeper --do-now`, rank 9,000,000, **displacing whatever was pinned** | the next Bell-rung watch starts on it |
| a ruling | an entry in `.claude/memory/DECISIONS.md` under `## RULED` | every future session treats it as settled law |
| a row comment | text filed onto that specific item | whoever picks the item up |

**So an unauthenticated WRITE path is not a leak — it is a stranger with commit-adjacent authority
over an autonomous build system.** Anyone who found the URL could pin work, retire a question with
a verdict he never gave, or write a "ruling" that every later session obeys as his. **The harvest
is the trust boundary**, and today it trusts the store completely because the store was an artifact
only he could write.

**CONFIDENTIALITY IS STILL REAL AND IS NOW THE SECOND REQUIREMENT, NOT THE FIRST.** The database
answers unauthenticated reads on the paths the game uses — and **CEO 233 re-measured this rather
than repeating the probe that produced today's false outage:** `visits`, `starts`, `rooms`, `fins`
and `presence` all answer **HTTP 200** to an unauthenticated shallow GET (`rooms` handed back live
room codes), while `usage`, `games` and the root answer 401. **Reads only were measured; no write
was attempted, and nothing here claims anything about write access.**
⚠ **CORRECTED, CEO 233 finding 9: this sentence used to cite `INBOX-20260906T2010Z`, which is
Wyatt's own Netlify request and NOT a measurement.** The traffic measurement lives in
`SCOPE-NETLIFY-ONE-REPO.md:115`. Its line is worth keeping: *"A true claim behind a citation that
does not contain it is how a false one gets through next time."*
⚑ **AND THE INFERENCE THIS SECTION USED TO DRAW WAS A NON-SEQUITUR (CEO 233 finding 2).** It read
"no rules file in the repo" as "the database is unprotected." **Firebase rules never live in a
repo; they live in the console.** A database on its factory default answers the root read — **his
root read is DENIED while five children are open, so non-default per-path rules ALREADY EXIST in
his console and nobody has read them.** That changes the job from *write rules from scratch* to
**edit rules whose current text is unknown to this plan** — and it is why the first hour of this
work is reading what is already there, not writing. There are no security rules in this repo —
`find` returns no `database.rules.json` and no `firebase.json` — and staging is a public URL. His
choice of real auth covers both axes at once, which is why it is worth the extra day.

**WHAT THIS MAKES NON-NEGOTIABLE:**

1. **Auth on WRITES is load-bearing, not a hardening pass.** A build that ships reads-locked and
   writes-open has solved the lesser half and left the whole danger standing.
2. **The rule lives in his Firebase console, so that half is HIS HANDS** — like the `T-220` hook
   edits. No session can reach it. Naming it now rather than on the day the work is ready.
3. **A signed-out page must REFUSE to write, visibly** — never silently drop what he typed. Losing
   his words is the one failure this whole subsystem exists to prevent.

## ✅ THE BUILD-STOPPER, AND HIS RULING THAT CLOSES IT

**CEO 233's finding 3, and it would have stopped the build cold:** this plan requires a store that
**refuses signed-out reads** and a **headless watch that reads it**. Both cannot be true unless the
watch carries a credential — and this repo is public (`CURTAIN-DELIVERED.md:3`), so it cannot be
committed. **The plan named one blocker in his hands and there were two.**

**HIS RULING, 2026-09-06, through the question UI — "A Firebase service key, kept outside the repo
on each machine":** Google issues a service-account key for exactly this. It sits in a
git-ignored path, **installed once per machine** — Blade and Mac separately — and nothing secret
ever enters the public repo.

**What that makes non-negotiable in the build:**

1. **The key path is in `.gitignore` BEFORE the first key is written**, not after. A gate asserts it.
2. **A watch with no key FAILS LOUDLY.** It must never quietly skip the harvest and publish anyway —
   that is a republish without a harvest, which is the one act that deletes his words.
3. **The key is per-machine and hand-installed**, so a fresh machine is a two-step setup, and that
   step is written down where the Door can find it rather than in somebody's memory.

## The shape of the build

- `glass.mjs` reads `ideas`/`rulings`/`comments` from the RTDB path instead of the inline
  `glassState` block, and the page writes them back there. **One display path FOR THE RENDERER,
  and that claim is scoped deliberately (CEO 233 finding 5) — it used to be asserted where a reader
  took it to cover the STORE, and the store is the thing this plan doubles.** The same
  generator, the same page, the same harvest script; only the STORE changes (rule 23).
- `harvest_glass.mjs` gains a mode that reads the store directly, so a headless watch harvests
  without an Artifact tool. Its idempotence key stays his own `at` timestamp.
- ⛔ **THE CUTOVER DAY IS AN OPEN DESIGN QUESTION, NOT A DETAIL — CEO 233 finding 5, and it is
  UNANSWERED.** The plan says the artifact stays alive until the new page has carried a full day
  without loss. **For that day there are TWO live surfaces he can type into, and nothing says which
  one the harvest reads.** Its words: *"Read both and his words duplicate; read one and the other's
  words are lost silently."* `CLAUDE.md` rule 23 names this exact shape — *"two things kept in sync
  by discipline are two things that will drift."* **This must be settled by him before a line is
  built; it is not ours to pick.**
- ⛔ **AND HIS LINK CHANGES, WHICH THIS PLAN NEVER SAID (CEO 233 finding 7).** Publishing through
  `deploy:staging` lands at a different address from the artifact URL hardcoded in `CLAUDE.md` §5.
  **The fix, if it works, changes the page he opens** — he needs to know that before, not after.
- ⛔ **A PUBLIC STAGING PAGE SHIPS THE CHART AS PLAIN HTML, and the confidentiality gate cannot see
  it (CEO 233 finding 7).** The gate protects `ideas`/`rulings`/`comments` in the store; the rows,
  the progress and the notes are **baked into the page before any auth exists**, so the gate list
  as written would go green over them. Either the page goes behind his `stats.html`-style curtain
  as well, or he accepts that half being readable. **His call, and it is not currently asked.**

## What must be RED first (rule 24, four steps)

- **a check that FAILS while the store accepts an unauthenticated WRITE** — the integrity gate, and
  the first thing written, before any code. It is the one that stops a stranger pinning work.
- a check that FAILS while the store answers an unauthenticated READ — the confidentiality gate,
  second because he ranked it second, not because it is optional
- a check that FAILS if a signed-out page can silently swallow something he typed instead of
  refusing visibly
- **A CHECK THAT FAILS IF THE FINAL PRE-CUTOVER HARVEST RETURNS ANYTHING** — the whole of the
  migration risk under his ruling, and the only gate that half of it needs now. The paragraph below
  is kept because its lesson outlives this decision.
- ⛔ **(HISTORICAL, AND STILL WORTH READING) A CHECK THAT FAILS IF A MIGRATION LOSES ANYTHING — AND
  THE ONE THIS PLAN USED TO NAME CANNOT DO IT.** CEO 233 finding 4, and it is the sharpest thing in that review: this line offered
  *"the existing `harvest_glass` idempotence proof, re-pointed at the new store"*, and
  `scripts/wyclau/harvest_glass.mjs:38-42` says in its own header that it **verifies the new entry
  ARRIVED and does NOT verify the destination's other content survived** — *"A write that lands and
  wipes everything else counts as a success here."* **This plan cited, as its loss-protection, a
  gate whose own source says it cannot see this failure.** The real check counts every entry before
  and after and fails on any drop, and it is written before the migration runs, not after.
- ✅ **HOW HIS EXISTING WORDS CROSS — HIS RULING, 2026-09-06: "Start the new store empty — the
  Chart already has it all."** And his reasoning is right and is the thing that makes it safe: an
  idea or ruling is harvested onto the Chart within minutes of him typing it, so `glassState` is a
  **staging area, not the record**. Nothing durable lives only there. No copy, no reconciliation,
  no count-both-sides migration — **there is nothing to migrate.**
  ⚠ **THE ONE GAP HE ACCEPTED, AND IT IS CLOSED BY BUILDING RATHER THAN BANKED.** Anything he types
  between the last harvest and the switch exists ONLY in the artifact and would be dropped — small,
  and exactly the kind of loss he would never notice. **So the cutover's final act, before the new
  store goes live, is a HARVEST of the artifact, gated:** run it, and **refuse to switch while it
  returns anything at all.** A clean read is the proof the gap is empty; a non-empty one means carry
  those entries and re-run. That costs minutes and removes the only way his choice can cost him a
  word. *(This is his ruling implemented safely, not overridden — he chose no migration, and this is
  how "no migration" is made true rather than assumed.)*

## Sizing, honestly

**RE-SIZED AGAIN AFTER HIS TWO RULINGS: 2½–3½ days, tooling not game code, ONE open question left.**
His "start empty" ruling removes the migration work entirely — CEO 233's finding 4 is answered by a
decision rather than by code, which is the cheapest kind of answer there is. **The only question
still open is which single page is authoritative on cutover day.** The previous figure was
**3–4 days, tooling not game code, and TWO of the open questions are his, not ours.** The audit's words: *"The estimate is honest about the work the plan describes and does
not cover the work the plan is missing."* One blocker is now closed (the service key, his ruling);
two remain open and unanswered — **how his existing writing migrates, and which single page is
authoritative on cutover day.** The old figure was **2–3 days, tooling not game code** (his choice of real authentication adds about a day over the curtain, and it buys integrity as well as confidentiality). It is not hard; it is delicate, because the thing being moved
is the one store in this project that holds words only he can produce. **And it is BLOCKED on one
thing only he can do** — the Firebase rule — which is worth knowing before the work starts rather
than on the day it is ready to ship.
