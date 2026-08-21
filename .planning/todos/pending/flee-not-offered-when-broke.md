---
id: flee-not-offered-when-broke
title: A broke defender is never offered the flee prompt — ruled NOT a bug
status: closed-not-a-bug
type: ruling
severity: low
area: gameplay
created: 2026-07-30
source: Phase 15 playtest notes (Wyatt, 2026-07-30)
resolves_phase: null
regression: false
---

## The observation

Fleeing a battle costs 1🌕. A defender with 0 coins who flips double-tails is simply never shown the
flee prompt — the option vanishes silently, with no line explaining why.

## The site this ruling protects

`src/orchestrator.js:536`:

```js
if(bothTails&&a<need&&d<need&&def.coins>=1){
```

The `def.coins>=1` conjunct is what suppresses the prompt. There is **no** `else` branch and **no**
"ye're too broke to flee" narration anywhere — that absence is deliberate, not an oversight.

## Wyatt's ruling

> "we don't need to keep reminding a broke player that they're too broke to flee every time they
> flip double-tails."

**Ruled NOT a bug. Closed.** No copy is to be written for this branch.

## Why this file exists

A future dead-copy sweep in the D-33/D-34/D-40/D-41 family looks for guarded branches that render
nothing and asks whether a missing line should be added or the branch removed. This one will look
exactly like an unfinished branch: a solvency gate with no user-visible explanation.

**Read this before "completing" it.** The silence is the approved behaviour. Double-tails can recur
many times in a single battle-heavy game, and a repeated "ye cannot afford to flee" line was
considered and rejected as nagging. Neither add the line nor remove the `def.coins>=1` gate.

## Re-confirmed 2026-07-30 (session 2), and extended

He was asked again, in the session-2 playtest, and gave the same answer with the reason attached:

> "in this case, we don't need to keep reminding a broke player that they're too broke to flee every
> time they flip double-tails lol. keep it as is."

### AND NOW THE CLAUSE THAT IS GENUINELY NEW, and urgent: NO GREYED BUTTON EITHER

**This branch is a deliberate EXCEPTION to the D-41 family.** That family — greying an unaffordable
control and stating the reason beneath it, instead of letting it vanish — now has **six** instances:

| # | Control | Finding |
|---|---------|---------|
| 1 | Attack | D-41 |
| 2 | Trade | D-41 |
| 3 | "coins only" trade offer | D-41 extended |
| 4 | hail Counter | D-41 extended |
| 5 | dock buy-on-tails | F9 |
| 6 | **storm anchor** | **G10, 2026-07-30** |

Six instances is a pattern, and the next dead-copy or affordance sweep will reason by analogy
straight into this branch: *"a solvency gate that renders nothing — the other six grey out and
explain, so this one should too."*

**It should not.** Do not add a greyed "Flee (−1🌕)" button with a `Yer too broke to flee` reason,
and do not add the reason to an existing button. The difference from all six above is FREQUENCY:
those are once-per-decision prompts, whereas double-tails recurs many times inside a single battle,
so the same explanation would be shown over and over in one fight. That repetition is precisely what
Wyatt rejected, twice.

**Neither the narration nor the button. The branch renders nothing, on purpose.**

## Checked against the 2026-08-21 trade-dead-end fix — NOT the same fault, this ruling stands

A separate fault this same night (`.planning/debug/resolved/captain-cannot-take-turn.md`,
`.planning/phases/02.2-a-captain-who-cannot-take-their-turn/02.2-FINAL-QA-2026-08-21.md`) was a
broke captain getting soft-locked in a trade give-prompt with no escape — surface-similar
("broke captain denied something"), so it was checked against this ruling before being touched.

**They are different fault-families and the fix does not touch this branch.** The trade dead end
was a genuine SOFTLOCK — the whole table waited on a captain with literally no valid move, forever,
once per turn at most. This flee gate is a HIGH-FREQUENCY, NON-BLOCKING omission — the option
silently vanishes and the battle continues fine without it, and it can recur many times inside one
fight, which is exactly why Wyatt rejected a greyed button + reason here (see above). The trade fix
added a greyed button + reason (matching the D-41 family this branch is deliberately exempt from);
it did not add anything to `orchestrator.js:536`'s `def.coins>=1` gate, and nothing about the fix
generalizes to it. **This ruling is unchanged and still in force.**
