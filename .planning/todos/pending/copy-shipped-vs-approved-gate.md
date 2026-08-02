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

## Phase 21 addition — 2026-08-01

Per milestone constraint 3 ("copy changes are inventory changes"), phase 21 (`sound-clock`
workstream, plan 21-04) shipped three new player-facing strings. None of these has yet been
through a disposition review — recorded here so they do not silently diverge the way the four
approved rewrites above did.

| String | File | Status |
|---|---|---|
| "Mute the sound" (unmuted-state tooltip on `#btnMute`) | `src/ui/panel.js`, `setClockUI()` | not yet reviewed |
| "Turn the sound back on" (muted-state tooltip on `#btnMute`) | `src/ui/panel.js`, `setClockUI()` | not yet reviewed |
| ", and who later wrote every sound effect ye hear" (Luis Zanforlin's sound-effects credit clause) | `index.html`, `#creditsModal` | not yet reviewed — **and no longer the shipped text: `ye` became `you` in playtest commit `10b3bbc`. See the 2026-08-02 correction row in the ledger below.** |

**No `@copy` marker on the two mute tooltips, deliberately.** The `@copy` id space is bound to
`art-review/`'s node-group table through `scripts/narration_audit_check.js`; a new `misc.sound.*`
category would need registering there before a marker could be added without reddening `npm test`.
That registration is real work outside this phase's scope — filed here as a named follow-up
(wire `misc.sound.mutetooltip.on`/`misc.sound.mutetooltip.off` into the node-group table and add
the matching `@copy` markers above the two tooltip assignments in `setClockUI()`), not an
oversight or a silent gap.

## The trap in the input

Assertion 8 of `scripts/narration_audit_check.js` reads the dispositions file through
`try { … } catch { return null }`, and `runChecks` only *pushes* the assertion when the input is
non-null. Its input lives under `.planning/`, which this project's own `/gsd-cleanup` archives and
`/gsd-pr-branch` strips. **Lose the file and the assertion does not fail — it vanishes**, while the
totals line re-derives itself and prints a healthy `PASS`. Any new gate built on the dispositions
must **refuse rather than skip** when its input is missing. `checkStormRainSeeded`
(`scripts/ui_contract_check.js:718`) is the working example; copy it.

## Copy changes logged against this gate (milestone constraint 3)

Per v1.3's milestone constraint 3, every copy change made while this gate remains unbuilt is
recorded here by hand, since nothing yet compares shipped text to approved dispositions
automatically.

| Date | Plan | Site (`@copy` id) | File | Change | Note |
|------|------|--------------------|------|--------|------|
| 2026-08-01 | 18-02 (FIX-08) | `adhoc.voyageend.victory` | `src/ui/board.js:772` | The win banner's hardcoded `"baked a "` is now `"baked "` + a per-recipe article (`""` or `"a "`) derived from `recipeArticle(winRecipe)` (`src/ui/recipe.js`). Wording is unchanged for the 13 singular-title recipes; for the 8 plural-title recipes (Cinnamon-Sugar Churros, Spiced Fudge Brownies, Cinnamon Snaps, Snickerdoodle Bites, Crispy Cocoa Snaps, Dark Chocolate Cream Puffs, French Pots de Crème, Mexican Chocolate Pots) the banner no longer prints "a" in front of the title. | Not a rewrite of Wyatt-approved prose — a grammar-correctness fix to an existing approved line, scoped to FIX-08. The `@copy adhoc.voyageend.victory` id is unchanged, so his prior approval mark still traces to this site. |
| 2026-08-01 | 18-03 (FIX-04) | `table:windmove` (`EVENT_NARRATION.windmove`, table-driven — no `@copy` adhoc id) | `src/ui/util.js:329` | Both viewer variants of `"{captain} is/yer blown by the storm"` are removed together — the builder now returns only its `caps` entry (`🌬️ drifts`, unchanged), producing no narration text on either the neutral or the addressed path. `art-review/narration-table-baseline.json`'s `table:windmove` card re-pinned to the silent shape (`silent:true, neutral:null, variants:[]`), matching `table:end`/`table:turn`. | A full removal, not a rewrite — Wyatt's own instruction (2026-07-31, `.planning/todos/pending/2026-07-31-remove-blown-by-the-storm-line.md`), also ruled in `prompts-polish/ROADMAP.md` D-07/NARR-05 ("both viewer variants together"). His prior Phase 15 disposition for this card (`"Crustbeard is blown by the storm"` / `"Crustbeard -- yer blown by the storm"`) is now moot — the line it approved no longer ships. |
| 2026-08-01 | 18-03 (FIX-21) | 7 narration sites (aground, 4 sidebet-won, 2 sidebet-lost, turn-order draw) — see `18-03-SUMMARY.md` | `src/ui/util.js`, `src/ui/flow.js` | Markup only — every trailing signed-coin parenthetical at these 7 sites is now wrapped in `<span class="nobrk">...</span>` so it cannot orphan across a line wrap. No word, sign, or amount changed in any approved string; `narration_audit_check.js` assertion 8's migration count is unaffected. | Not a copy change under this gate's own definition (no text differs), logged here anyway per an abundance of caution since the sidebet ternaries were reformatted (one branch per line) to give each new span its own line — the reformat is structural, not textual, confirmed by `git diff -U0` inspection in the SUMMARY. |
| 2026-08-01 | 18-04 (FIX-07) | new `battle` spoil clause, no prior `@copy` adhoc id (table-driven; sits beside `table:battle`'s existing bribe/cleaned-out clauses) | `src/ui/util.js` (both the neutral/winner `spoilClause` chain and the separate loser-addressed composite chain) | A genuinely NEW line, not a rewrite of an existing approved string: `{loser} gives up {spoil}.` (neutral/winner) and `Ye give up {spoil}.` (loser-addressed), ruled verbatim by Wyatt 2026-07-31. It fires only when the loser's hold was empty AND the coin take reached the 5-coin clamp ceiling — a case that previously, incorrectly, rendered the existing bribe wording (`{loser} bribes their way out of giving away a crate with {spoil}.`). The bribe wording itself is unchanged and still ships for genuine bribes (`spoilChosen:true`). No prior Phase 15 disposition covered this case since it never had its own line before. | Root cause: `src/orchestrator.js`'s battle event gained a new `spoilChosen` boolean (orchestrator-tier only, never added to `src/engine/index.js` — milestone constraint 1), so `src/ui/util.js` can now tell "loser genuinely chose coins over a crate" apart from "loser had no crate to choose from." See `.planning/todos/pending/2026-07-31-bribe-narration-fires-with-an-empty-hold.md` for the full root-cause note and `18-04-SUMMARY.md` for verification. |
| 2026-08-01 | 18-06 (FIX-06) | every `button.primary` site (9 static `class="primary"` sites + 1 dynamic `.apBtn` site in `src/ui/flow.js`) plus `#btnConfirmLeave` | `index.html` (CSS block + `#btnConfirmLeave` markup) | Visual only, no word changed: `button.primary`/`button.primary:hover`/`.apBtn.primary:hover` restyled from a solid orange fill to the outline + pale-fill recipe taken verbatim from `.footerKofi`/`.footerKofi:hover`. `#btnConfirmLeave` additionally gains the `.footerLeave` red destructive recipe (label unchanged, `class="primary big footerLeave"` — kept `primary` so the enumerated button count doesn't move) via a `button.footerLeave` specificity bump over `button.primary`. | Not a copy change under this gate's own definition (no text differs on any of the 10 sites) — logged anyway per the same abundance-of-caution precedent 18-03's FIX-21 row set for a structural-only CSS/markup change. |
| 2026-08-01 | 18-06 (FIX-17) | captain colour swatch, player rows + lobby seat list | `src/ui/util.js` (`buildPlayerRows`), `src/ui/lobby.js` (`renderSeatList`), `index.html` (CSS) | Visual only, no word changed: the `<span class="dot">` swatch is deleted from both templates; every other `HEXCOL[i]` consumer (row tint, `--rowcol` border, `.pname` colour) is untouched. `.prowTop`'s grid drops its 14px dot column; `.player-row .dot`/`.seat .dot` rules deleted. | Not a copy change (no text at either site) — logged for the same abundance-of-caution reason as the FIX-06 row above. |
| 2026-08-01 | 18-06 (FIX-09) | ingredient chips, narrow captains box (container query, 460px) | `index.html` (CSS) | Visual only, no word changed. **RESOLVED 2026-08-01; this row corrected 2026-08-02.** 18-06 built two candidate treatments toggleable via `body.chipsOwnRow` per D-03; Wyatt chose **Treatment B** (*"I LOVE true — it's so much better"*) and Treatment A was deleted in commit `2438aa3`. Exactly one treatment ships, so no unreachable CSS remains. | Not a copy change (no text anywhere in this fix) — logged for the same abundance-of-caution reason as the two rows above. **Until 2026-08-02 this row still read "Neither chosen yet — 18-07 deletes the loser," which went stale the moment the decision landed: the choice was made and the loser deleted, but 18-07 never ran to update the record.** |
| 2026-08-02 | playtest batch `10b3bbc` (P6/P8–P12) | `#creditsModal` credit clause — **no `@copy` id**; static `index.html` markup, a known extractor blind spot (see DESIGN INTENT above) | `index.html` | **A one-word text change, logged retroactively.** `"who later wrote every sound effect **ye** hear"` → `"…every sound effect **you** hear"`. Shipped during the post-plan Safari playtest batch and never recorded at the time. | **RESOLVED — Wyatt confirmed 2026-08-02 that `you` is deliberate:** the credits page is not in the game world, so it is not written in pirate speak. The shipped text was correct all along; **the inventory was wrong to have recorded a `ye` form.** The deeper problem was that this rule was unwritten — he had told an earlier session the same thing and it was lost. Now captured as THE VOICE BOUNDARY below. |

---

## DESIGN INTENT — THE VOICE BOUNDARY (Wyatt, stated at least twice; written down 2026-08-02)

> "the design intent is that the credits page is not 'in the game world' so it isn't written in
> pirate speak."

**Player-facing text has two registers, and the divide is diegetic — whether the words come from
inside the game world or from outside it.**

| Register | Voice | Where |
|---|---|---|
| **Inside the game world** | Pirate speak — `ye`, `yer`, `blowin'`, captain-address | Narration, battle/trade/dock lines, prompts, buttons, the board, the lobby, End of Voyage |
| **Outside the game world** | Wyatt's own plain first-person voice | Credits, the About page, and anywhere he speaks as himself to a real person |

The credits thank real people — Luis, Nick Lesko, Xavaar, his parents, Juju — in his own voice ("a
designer and overly enthusiastic noodle", "my sweet partner Juju"). Pirate speak there would put a
costume on a genuine thank-you.

### What this means for the gate

1. **A `ye`/`you` difference between credits-or-About copy and the rest of the game is CORRECT.** Any
   check that flags it is emitting a false positive.
2. **Any disposition recording credits copy in pirate voice has recorded it wrong.** This file's own
   Phase 21 entry did exactly that (`", and who later wrote every sound effect ye hear"`), which is
   how a correct shipped string came to look like drift.
3. **When the gate is eventually built, register must be an attribute of a copy site**, not something
   inferred from the words — otherwise a well-meaning consistency pass will pirate-ify the credits.

### Why this is written here rather than remembered

**Wyatt had already told a previous session this exact rule, and it was lost.** An unwritten voice
rule cannot survive a context reset: each new session re-derives it from surrounding text, and one of
them eventually "fixes" `you` back to `ye` in perfect good faith. Also written into
`.claude/CLAUDE.md` so it is inherited without anyone having to find this file.

---

## DESIGN INTENT added 2026-08-02 — audit coverage, not just audit accuracy

Wyatt, 2026-08-02: **"no player-facing copy should sit outside of the audit tool, this is a design
intent."**

This todo has so far been about copy the audit *knows about* but never compared against his
approvals. This is the other half: **copy the audit cannot see at all.** A string the extractor never
reaches is worse than an unverified one, because it is invisible rather than merely unchecked — it
will never appear on a review card, so he cannot approve it, reject it or even know it exists.

### Known blind spots, found 2026-08-02

| Site | Why the extractor misses it |
|---|---|
| `#bootLoader .bootMsg` — *"Hoisting the sails…"* | static markup in `index.html`; the extractor scans call sites |
| the same node, set to *"Reconnecting to yer voyage…"* by `boot()` | a `textContent =` assignment, not a call site |
| every other static string in `index.html` (welcome byline, choice-card labels, room screen, footer buttons) | same reason — nothing walks the markup |

Discovered concretely: adding the reconnecting line, a real piece of player-facing copy, produced a
`@copy` marker that **bound to nothing** and the audit gate rejected it. The marker was removed and
the string shipped unregistered — consistent with how the loader's existing message is treated, and
exactly the hole this note exists to close.

### What "covered" has to mean

1. The extractor gains a **markup pass** over `index.html` for player-facing text nodes, alongside
   the existing call-site scan — otherwise the whole welcome screen stays invisible to review.
2. It gains a pass for **`textContent`/`innerHTML` assignments of literal strings** in `src/`.
3. `@copy` ids become bindable at those sites, so a marker is a promise the gate can keep.
4. A gate then asserts the inverse of today's rule: not merely that every marker binds to a site,
   but that **every player-facing string is reachable by some card**. Until that exists, the count
   of uncovered strings is unknown — nobody has ever measured it.

**Until then, every session that adds player-facing copy outside a call site must flag it to Wyatt
directly in its reply**, because the tool cannot. That is a workaround for a missing gate, not a
substitute for one.
