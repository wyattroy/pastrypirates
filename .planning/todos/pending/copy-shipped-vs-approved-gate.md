---
id: copy-shipped-vs-approved-gate
title: Nothing compares shipped copy against Wyatt's 209 approved dispositions — 125 of 144 fields unmeasured
status: pending
type: gap
severity: high
area: narration
created: 2026-07-30
source: Phase 15 verification (audit tool Tasks 5/6/7) + F4's three measurement passes
resolves_phase: null
regression: false
accepted_by: Wyatt, 2026-07-30, at the Phase 15 ship gate ("ship now, carry both")
---

## The gap

Wyatt reviewed and approved **209 pieces of player-facing game text** on the narration audit page.
Getting those words into the source was done by **a human retyping a list**. No script has ever
compared the shipped text against `15-COPY-APPROVED.md` or the approval fields of
`15-DISPOSITIONS-FINAL.json`.

The Phase 15 verifier's words: **the phase's most significant residual.**

This is not a hypothetical. **Four of his approved rewrites shipped missing**, and the only reason we
know about those four is that someone went looking by hand.

## The honest numbers

F4 made three narrowing passes over 144 reviewed non-merge approval fields (37 unapplied → 19 → 3
hand-verified, plus F3's intro banner = 4 genuinely missing, since fixed):

| Bucket | Count | What is actually known |
|---|---|---|
| Conclusively settled | **19** | hand-verified, byte-level |
| Fragments present, order unverified | **84** | every distinctive fragment appears in source; **word order and line identity were never checked** |
| Unjudgeable mechanically | **41** | too placeholder-heavy for a fragment match to mean anything |

So: **19 of 144 are proven.** The heuristic establishes that the copy is broadly applied. It does not
establish that it is right. **Nothing is known to be wrong — this is unmeasured area, not a defect.**

## Why the accepted-residual ruling is safe but not comfortable

At the ship gate Wyatt chose to ship and carry this rather than build the gate first. Two things make
that defensible: the copy has been through two recorded live playtests, and every known divergence
found by hand has been fixed. One thing makes it uncomfortable: **the mechanism whose absence caused
the original loss is still absent**, so a recurrence would be found the same way — by luck.

## The chain that must not break

`@copy` marker in source → extractor `id` → card id → alias map → Wyatt's 209 dispositions.

## If it is taken up

Three pieces, and they are separable:

- **Task 5 — the comparison.** Assert shipped source literal == approved text, per row. The pattern
  to copy already exists in the tree: for the `pirateVoice()` breach, each of 15 shipped literals was
  asserted byte-equal to `pirateVoice(<the same literal at baseline 9ddd214>)`. That proves
  **shipped == approved**, not "looks converted." Do the same at scale.
- **Task 6 — the applier.** Remove the human from the transport.
- **Task 7 — a permanent scope rule**, so a new copy site cannot be added outside the inventory.

Two matching rules learned the hard way, both non-negotiable:

- **Never re-match an approved row to source by line number.** The `AD_HOC_META` line-number keying
  drifted twice. Match by label and by the literal text.
- **D-16 is absolute:** Wyatt's notes are words only — the notes box could not carry inline icon
  markup. **The absence of an icon from a note is never an instruction to remove it.**

## The trap in the input

Assertion 8 of `scripts/narration_audit_check.js` reads the dispositions file through
`try { … } catch { return null }`, and `runChecks` only *pushes* the assertion when the input is
non-null. Its input lives under `.planning/`, which this project's own `/gsd-cleanup` archives and
`/gsd-pr-branch` strips. **Lose the file and the assertion does not fail — it vanishes**, while the
totals line re-derives itself and prints a healthy `PASS`. Any new gate built on the dispositions
must **refuse rather than skip** when its input is missing. `checkStormRainSeeded`
(`scripts/ui_contract_check.js:718`) is the working example; copy it.

## Phase 22 approvals — 2026-08-01

Recorded by the executor for the front-door workstream (Phase 22, plans 22-04/22-05), against
Wyatt's direct review of 2026-08-01. This is a **per-string record for this one phase**, not the
automated shipped-vs-approved comparison the "If it is taken up" section above describes — that
gap is still open. Each literal below is quoted from a fresh read of source **after** the edits
landed, per this file's own rule against re-matching by line number or paraphrase.

| Surface | File : Line | Shipped literal | Disposition |
|---|---|---|---|
| About — page title | `about.html:127` | `About Pastry Pirates` | Approved as drafted |
| About — hero blurb | `about.html:128-131` | `Pastry Pirates is a free browser pirate board game — sail a grid of islands, gather baking ingredients, trade and battle rival captains, and race home to become the Best Baker on the Sugar Seas. Play solo against AI captains, pass the wheel around one screen, or sail with friends online — no login, no download, 2 to 4 players.` | Approved as drafted |
| About — top primary CTA (new, feedback item 1) | `about.html:122` | `⚓ Play Pastry Pirates` | Approved as edited — new element added per Wyatt's feedback, not in the original UI-SPEC draft |
| About — hero image alt | `about.html:134` | `A mid-game view of the Pastry Pirates board, with ships scattered among the islands, cargo crates on the docks, and the wind compass showing the round's direction.` | Approved as edited — rewritten for the shipped `about-screenshot.jpg` frame (D-11), replacing the placeholder `og-image.jpg` alt text |
| About — rules: "The goal" heading | `about.html:141` | `The goal` | Approved as drafted |
| About — rules: "The goal" paragraph | `about.html:144-145` | `Every captain starts with a secret recipe of five ingredients. Collect them all, sail home to the Isle of Tortuga, and declare victory — first baker home wins.` | Approved as drafted |
| About — cocoa-island image alt (new, feedback item 3) | `about.html:143` | `A cocoa island tile, one of the ingredient islands captains dock at to fill their hold.` | Approved as edited — new interspersed image |
| About — rules: "Your turn" heading | `about.html:147` | `Your turn` | Approved as drafted |
| About — rules: "Your turn" paragraph | `about.html:150-154` | `Each round the wind sets your sailing budget for the turn — cheap with it, dear against it. Once you've sailed, you take one action: dock at an island and flip a coin for a crate, attack a nearby ship for a shot at their cargo, trade with any other captain, or fish for a quick coin. Storms roll in occasionally and shove every ship a few squares, so keep an eye on the sky.` | Approved as edited — `parley` replaced with `trade` per feedback item 4 |
| About — flippenator image alt (new, feedback item 3) | `about.html:149` | `The Flippenator — the coin captains flip for every action, with the turn clock counting down beside it.` | Approved as edited — new interspersed image |
| About — rules: "Coming home" heading | `about.html:156` | `Coming home` | Approved as drafted |
| About — rules: "Coming home" paragraph | `about.html:157-158` | `Once you've gathered every ingredient on your map, race back to the Isle of Tortuga. If more than one captain makes it home the same round, it comes down to a head-to-head bake-off.` | Approved as drafted |
| About — rules note pointing at in-game How to play | (removed) | *(the `.abtRulesNote` paragraph and its CSS rule were deleted per feedback item 6)* | Approved removal — Wyatt asked for this paragraph gone outright |
| About — example recipes heading (new, feedback item 5) | `about.html:163` | `Example recipes` | Approved as edited — new section |
| About — example recipes intro line (new, feedback item 5) | `about.html:164` | `Every captain sails with a random five-ingredient recipe — here's what two of them look like.` | Approved as edited — new section |
| About — recipes image alt (new, feedback item 5) | `about.html:165` | `Two example recipe cards, a Mexican Chocolate Torte and a Cinnamon Sponge Cake, each listing its five required ingredients.` | Approved as edited — new section |
| About — testimonials heading (new, feedback item 7) | `about.html:169` | `What the captains are saying` | Approved as edited — new section |
| About — testimonial 1 | `about.html:171` | `"This game made me hungry"` — Davy Scones | Approved as edited — exact quote and attribution supplied by Wyatt |
| About — testimonial 2 | `about.html:172` | `"I'm going to actually bake my recipe in real life"` — Crustbeard | Approved as edited — exact quote and attribution supplied by Wyatt |
| About — testimonial 3 | `about.html:173` | `"YARRRRRGH I always be flippin' tails."` — Flaky Jack | Approved as edited — exact quote and attribution supplied by Wyatt |
| About — testimonial 4 | `about.html:174` | `"Have ye met me pet candycrab?"` — Dough Hook | Approved as edited — exact quote and attribution supplied by Wyatt |
| About — credits section | `about.html:179-187` | (unchanged six-item credits list, byte-identical to the draft) | Approved as drafted |
| About — Ko-Fi button label | `about.html:192` | `🍪 Buy me a cookie` | Approved as drafted |
| About — Ko-Fi CSS comment (feedback item 1) | `about.html:90-93` | `/* Ko-Fi — secondary CTA. The page's primary CTA is the "⚓ Play Pastry Pirates" link at the top of the page (added per Wyatt's playtesting feedback, 2026-08-01) — accent orange is reserved for that button now, not this one. Styled as a lighter outline treatment so the two read as primary/secondary at a glance. */` | Approved as edited — updates the now-false "single primary CTA" claim Wyatt flagged |
| Name modal — prompt heading | `index.html:884` | `What do they call ye, captain?` | Approved as drafted |
| Name modal — field label | `index.html:885` | `Yer captain name` | Approved as drafted |
| Name modal — input placeholder | `index.html:886` | `e.g. Davy Scones` | Approved as drafted |
| Name modal — confirm button | `index.html:887` | `Aye, that's me name` | Approved as drafted |
| Welcome screen — data-collection notice | `index.html:831` | `Thanks for playtesting! Anonymized move data is recorded to help improve the game — nothing beyond the name you confirm after picking how to play is collected.` | Approved as drafted — unchanged this plan; its `REGISTER_CHROME_EXCEPTIONS` anchor in `scripts/ui_contract_check.js:306` still matches verbatim, so no anchor update was needed |
| Welcome screen — About link label | `index.html:830` | `ℹ️ About` | Approved as drafted |
| Footer — About link label | `index.html:1102` | `ℹ️ About` | Approved as drafted |
| Rules prose — Trade action (D-19 rename completed here) | `index.html:938`, `RULES.md:51`, `Rules_boardgame.md:163,181,233,246` | `Trade` replaces `Parley` throughout rules prose (in-game How-To-Play modal, `RULES.md`, `Rules_boardgame.md`); prose occurrences in `.planning/how-to-play-pastry-pirates.md:101,151,175` also updated. Engine config flag `cfg.parley` and the narration event-type key `t:"parley"` are unchanged by design (renaming either breaks `src/engine/index.js` and the narration/replay contract). | Approved as edited — Wyatt: *"'parley' has been renamed 'trade' — remove the word parley from this, and from all rules"* |

**Note on scope:** this table covers every player-visible string shipped or changed by Phase 22
(plans 22-01 through 22-05), assembled from a fresh read of `about.html` and `index.html` after
all edits landed. It is a manual per-phase record, not the automated `Task 5` comparison the gap
above describes — that mechanism is still unbuilt, and this table does not close it.
