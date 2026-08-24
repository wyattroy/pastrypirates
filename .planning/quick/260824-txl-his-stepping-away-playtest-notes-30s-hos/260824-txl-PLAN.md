---
quick_id: 260824-txl
description: "His stepping-away playtest notes: 30s host grace, one-tap recipe confirm after a peek, Enter submits names, the stay-put redesign"
date: 2026-08-24
---

# Quick task 260824-txl — PLAN

**Execution note:** executed directly in the orchestrating context (pattern of 5qz/nh8/oyh — the
session held his verbatim designs and he had stepped away: autonomous, no blocking questions, his
notes were the spec).

## His notes (2026-08-24 evening, from build 24c), the spec

1. **#1+#2**: host tab-close killed the game for the guest before he could reload. His design: a
   30-second window, guest reads "yer matey has left the game... Let's give 'em 30 seconds to
   return before callin' off yer voyage".
2. **#13**: selected recipe card + board peek must confirm with ONE more tap, not two — "tapping
   the board does not clear the selected state, so it should not force two taps."
3. **#17 tweak**: Enter in the name field triggers the continue button.
4. **#21 redesign**: no Stay put button while sailing; yellow flashing square behind the boat
   ("ideally behind... okay on top if too hard, tell me why"); tap own boat → the normal Stay put
   appears; delete Aye/Keep-sailin' entirely (Keep sailin' broke the consistent-back-button value).
5. His #23 paste was the stale 24c report — superseded by builds 24d/e; retest, not rework.

## Tasks

1. `hostGoneGrace()` — one 30s helper for both hostgone callers, his message as a wait line.
2. recipeGuard: internal focusBtn follows the visible selection — outside taps change nothing.
3. Enter→continue on every name field (modal, join code+name, four pass-and-play rows).
4. Stay-put redesign: hidden `#apStay`, `.pp4StayCell` under the boat (sailHost z2 < ships z4 —
   behind for free), boat/square tap reveals, confirm pair + `.pp4Stay` CSS deleted; the boat's
   cell rides the prompt spec (`spec.pos`) so both tiers draw from the authoritative value.
5. QA (solo probe + two-window grace probe, both legs), gates, ship as 2026-08-24f, new checklist.
