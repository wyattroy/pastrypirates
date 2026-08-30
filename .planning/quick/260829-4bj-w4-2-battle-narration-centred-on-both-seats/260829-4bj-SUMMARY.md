---
quick_id: 260829-4bj
description: "W4-2 — a fight's narration is about two captains, so it is not anchored to one"
status: complete
date: 2026-08-29
gates: "scripts/qa/w42_battle_bubble_check.mjs (chain 40 -> 41)"
---

# W4-2 — done. Last item in Waves 4 + 6.

## His report, corrected once and sharpened once by measurement

> **Guest battle narration box is not centred.** (narrowed: the tap-to-sail box IS centred, so this
> is specific to the BATTLE box)

**Measured in a real two-browser crew game before changing anything:**

- **Not guest-only.** The battle result sat **44px right of centre on BOTH seats**.
- **Within ONE battle, two lines were drawn two different ways:**
  - `"Dough Hook attacks Flaky Jack!"` → off **0** (centred)
  - `"Dough Hook wins 1–0…"` → off **44** (anchored to a boat)

## The cause, and why it is not "bubbles are broken"

A bubble with a **subject** anchors to that captain's boat and grows a tail. **That is the design and
it is right** for *"Flaky Jack takes the wheel"*. `panel.js` set the subject as `e.p ?? e.a ?? null`,
and a battle event is `{t:"battle", a:attacker, d:defender}` — so the result was handed to the
**attacker**, one of two fighters, arbitrarily. The opening line is emitted straight from the
orchestrator with no subject, hence centred.

## The rule, derived from the event's own shape

**An event that names TWO captains is not about one of them.** It takes no subject, so its bubble is
ambient and centred — matching the opening line of the same fight. Derived from `e.d != null && e.a
!= null && e.d !== e.a`, never a list of event type names that would need editing every time a
two-captain event is added.

**The codebase already said this out loud one layer up**, in the camera hold: *"the director should
focus battles on the players fighting, not the player calling the battle."* Anchoring the result to
one fighter was the same fault one layer down.

## Measured at the seam, rather than waiting for a battle to happen by chance

| event | bubble |
|---|---|
| `{t:battle, a:0, d:2}` | **ambient (centred)** |
| `{t:dock, p:1}` | anchored to seat 1 |
| `{t:sail, p:3}` | anchored to seat 3 |
| `{t:fish, a:2}` | anchored to seat 2 |
| `{t:battle, a:1, d:1}` (self) | anchored to seat 1 |

A live crew run also confirms the halves still behave: a single-captain dock flip anchored at 29px on
both seats, multi-captain lines at 0.

## The gate had to be fixed twice before it was honest

Once for failing a **correct** tree (it read one line while the logic spanned two — an assertion that
breaks on a safe refactor teaches sessions to loosen it), and once for a real hole red-proofing
found: wiping the subject to a bare `null` strips anchoring from **every** line, and a check that
only looked at `stage.js`'s machinery still passed, because the machinery was intact with nothing
feeding it. It now checks both ends. Three defeats tried, three caught.
