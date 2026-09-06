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
answers unauthenticated reads (`INBOX-20260906T2010Z`), there are no security rules in this repo —
`find` returns no `database.rules.json` and no `firebase.json` — and staging is a public URL. His
choice of real auth covers both axes at once, which is why it is worth the extra day.

**WHAT THIS MAKES NON-NEGOTIABLE:**

1. **Auth on WRITES is load-bearing, not a hardening pass.** A build that ships reads-locked and
   writes-open has solved the lesser half and left the whole danger standing.
2. **The rule lives in his Firebase console, so that half is HIS HANDS** — like the `T-220` hook
   edits. No session can reach it. Naming it now rather than on the day the work is ready.
3. **A signed-out page must REFUSE to write, visibly** — never silently drop what he typed. Losing
   his words is the one failure this whole subsystem exists to prevent.

## The shape of the build

- `glass.mjs` reads `ideas`/`rulings`/`comments` from the RTDB path instead of the inline
  `glassState` block, and the page writes them back there. **One display path** — the same
  generator, the same page, the same harvest script; only the STORE changes (rule 23).
- `harvest_glass.mjs` gains a mode that reads the store directly, so a headless watch harvests
  without an Artifact tool. Its idempotence key stays his own `at` timestamp.
- The artifact stays alive as-is during the cutover and is retired only once the staging page has
  carried a full day without loss.

## What must be RED first (rule 24, four steps)

- **a check that FAILS while the store accepts an unauthenticated WRITE** — the integrity gate, and
  the first thing written, before any code. It is the one that stops a stranger pinning work.
- a check that FAILS while the store answers an unauthenticated READ — the confidentiality gate,
  second because he ranked it second, not because it is optional
- a check that FAILS if a signed-out page can silently swallow something he typed instead of
  refusing visibly
- a check that FAILS if his writing can be lost — the existing `harvest_glass` idempotence proof,
  re-pointed at the new store

## Sizing, honestly

**2–3 days, tooling not game code** (his choice of real authentication adds about a day over the curtain, and it buys integrity as well as confidentiality). It is not hard; it is delicate, because the thing being moved
is the one store in this project that holds words only he can produce. **And it is BLOCKED on one
thing only he can do** — the Firebase rule — which is worth knowing before the work starts rather
than on the day it is ready to ship.
