---
created: 2026-08-01T00:20:00.000Z
title: Narration breaks lines mid-chunk — hanging coins and parentheses, split units in the awards
area: ui
severity: minor
files:
  - index.html:280-281 (.nobrk — the mechanism, and its own comment saying where to apply it)
  - src/ui/util.js (narration string building — the `(+N🌕)` sites)
  - the end-of-voyage awards screen (stat + unit pairs)
---

## Problem

Wyatt, 2026-08-01:

> *"All narration should intelligently split lines up without breaking up words or coherent items. It
> looks bad in two places I noticed — **and I'm confused about why one of them still happens because
> I thought we fixed it in a different batch of bug fixes.**"*

Two specific rules he gave:

1. **A trailing amount is one block.** If a line ends with `(+1🌕)`, that whole chunk moves to the
   next line together. **Never a hanging parenthesis, never a stranded coin image.**
2. **In the end-of-voyage awards, a quantity and its unit stay together** — "squares travelled" must
   sit with its number, not wrap away from it.

## The mechanism already exists — that is why one case "still happens"

`index.html:281`:

```css
.nobrk { white-space: nowrap; }
```

and its own comment immediately above (`:280`) says how it is meant to be used:

> *"…break — wrap it in this class **at the string-building level wherever it appears**."*

So this was solved once, as a class that must be **applied at every site that builds such a string**.
It is not automatic. **Wyatt's confusion is well-founded: the fix exists, it was simply never applied
everywhere**, and each new narration line since is a fresh chance to forget it.

## Solution — and do not just patch the two he saw

Patching the two visible cases repeats the original mistake and guarantees a third report later.

1. **Sweep every narration site that emits a trailing `(+N🌕)` / `(-N🌕)` / parenthetical** and wrap
   the whole chunk in `.nobrk`. The fishing lines (`+1🌕` / `+2🌕`), battle spoils, side bets and the
   timeout lines all have this shape.
2. **Better: build the chunk in one helper** rather than relying on each call site to remember. A
   single `amt()`-style helper that returns the wrapped span makes the correct thing the default,
   and is what stops this recurring. Follow the existing convention — `fmtItem()` and `ilabelImg()`
   already centralise similar formatting.
3. **Awards screen:** wrap each stat's number and unit together.
4. **Do not apply `.nobrk` to whole sentences** — `white-space:nowrap` on a long line will force
   horizontal overflow instead of wrapping, which on a narrow phone is a worse bug than the one being
   fixed. It goes on the small indivisible chunk only.

**Check the interaction with FIX-09 and FIX-10.** Both are about narrow screens. A `nowrap` chunk
that cannot break is exactly the kind of thing that widens a container unexpectedly — verify the
narration box and the captains row still behave at 320px after this lands.

**Source:** Wyatt, 2026-08-01.
