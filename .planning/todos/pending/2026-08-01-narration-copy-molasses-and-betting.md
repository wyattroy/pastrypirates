---
created: 2026-08-01T00:15:00.000Z
title: Two narration copy fixes — drop the molasses line, make the betting loss clear
area: copy
severity: minor
files:
  - src/ui/flow.js:1236 (the leeward / molasses line)
  - src/ui/util.js:526-535 (sidebet)
---

Two independent copy edits from Wyatt, 2026-08-01.

## 1. Remove "slow as cold molasses in this lee" — too long

`src/ui/flow.js:1236` — the leeward line, in both viewer variants:

> 🏝️ Land's blockin' {name}'s wind — can't sail as far. **Movin' slow as cold molasses in this lee.**
> 🏝️ Land's blockin' yer wind, {name} — can't sail as far. **Movin' slow as cold molasses in this lee.**

**Remove only the final sentence.** The first sentence carries the mechanic (land blocks your wind,
you sail less far); the molasses sentence restates it in flavour and is what makes the line too long.

**Both variants together** — the D-07/NARR-05 contract is that the neutral and addressed forms are
siblings; trimming one and not the other shows differently depending on who is looking.

## 2. Betting: losing means losing the coins you staked

Wyatt: *"if you lose, you lose any coins that you had bet; you don't simply get 0."*

The current line (`src/ui/util.js:527-535`) reads the win as *"1🌕 + double yer bet (+N🌕)"* with
signed amounts. The **losing** branch does not make it clear that the stake is **gone**, so it reads
as a missed gain rather than a real loss.

**Wyatt's words are the rule, not the wording — the exact phrasing is his to write.** This belongs in
his batched copy session (D-06), alongside the other lines waiting on him. Do not invent it.

> **⚠ Check the rules actually match the copy before writing it.** `CR-03` was a confirmed bug where
> **fleeing a battle refunded side bets that were never debited** — a pure credit from nothing. It
> has been fixed, but this item asserts to the player that losing a bet costs them coins. **Verify
> the stake is genuinely debited on every losing path** before shipping copy that promises it is.
> Copy that describes a rule the code does not implement is worse than vague copy.

Also relevant: the how-to-play modal already describes side bets (*"back their call with coin for
double or nothing"*). Keep the two consistent — a third description that drifts is the failure mode
this project has already had once with the rules text.

**Source:** Wyatt, 2026-08-01.
