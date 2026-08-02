# 18-COPY-CHANGES.md — Phase 18's copy-change ledger

**Phase:** 18 Prompts & Polish (`prompts-polish` workstream)
**Written:** 2026-08-02, retroactively — see "Why this file is dated after the phase shipped" below.
**Gate it feeds:** `.planning/todos/pending/copy-shipped-vs-approved-gate.md`

Per v1.3 milestone constraint 3 ("copy changes are inventory changes"), every change this phase made
to player-facing text is recorded here, matched **by label and by literal text, never by line
number** — the `AD_HOC_META` line-number keying drifted twice before and that rule is non-negotiable.

---

## Why this file is dated after the phase shipped

Plan 18-07 was the phase-closing plan that was supposed to write this file. It never ran. Phase 18
was merged and marked shipped on 2026-08-02 on the strength of Wyatt's live Safari playtest (12
items, all passing) rather than this ledger.

**What that did and did not cost.** Each plan's executor had already logged its own row directly into
the gate todo as it went, so six of the seven plans' copy changes were captured in real time — the
ledger was distributed, not absent. But the two things only a phase-closing pass would catch were
missed, and one of them was a real defect:

1. **An unlogged copy change shipped** — the credits `ye hear` → `you hear` edit (row 8), made during
   the post-plan playtest batch. Found 2026-08-02 by diffing the shipped string against the gate's
   own record. This is precisely the drift class the gate exists to catch, and it was caught by hand
   again, which is the uncomfortable part the gate todo already names.
2. **A gate row went stale** — the FIX-09 row still described both chip treatments as live and
   awaiting a decision, six commits after the decision was made and the loser deleted.

Both are corrected in the gate todo as of 2026-08-02.

---

## The ledger

`Kind` distinguishes a genuine text change (what the gate is actually about) from a
structural/visual change logged only out of the abundance of caution this project has settled on.

| # | Plan / FIX | Kind | Site (`@copy` id) | File | The change |
|---|---|---|---|---|---|
| 1 | 18-02 / FIX-08 | **text** | `adhoc.voyageend.victory` | `src/ui/board.js:772` | Win banner's hardcoded `"baked a "` became `"baked "` + a per-recipe article from `recipeArticle()`. Unchanged for the 13 singular-title recipes; the 8 plural-title recipes no longer print "a" before the title. Grammar correction to an approved line, not a rewrite — the `@copy` id is unchanged so Wyatt's approval still traces here. |
| 2 | 18-03 / FIX-04 | **text (removal)** | `table:windmove` (table-driven, no adhoc id) | `src/ui/util.js:329` | Both viewer variants of `"{captain} is/yer blown by the storm"` removed together; the builder now returns only its `caps` entry (`🌬️ drifts`). Wyatt's own instruction, 2026-07-31. His Phase 15 disposition for this card is now moot — the line it approved no longer ships. |
| 3 | 18-03 / FIX-21 | structural | 7 narration sites (aground, 4 sidebet-won, 2 sidebet-lost, turn-order draw) | `src/ui/util.js`, `src/ui/flow.js` | Markup only: trailing signed-coin parentheticals wrapped in `<span class="nobrk">` so they cannot orphan across a wrap. No word, sign or amount changed. Sidebet ternaries reformatted one branch per line — structural, confirmed via `git diff -U0`. |
| 4 | 18-04 / FIX-07 | **text (new line)** | new `battle` spoil clause (table-driven, beside `table:battle`) | `src/ui/util.js` | A genuinely new line: `{loser} gives up {spoil}.` / `Ye give up {spoil}.`, ruled verbatim by Wyatt 2026-07-31. Fires only when the loser's hold was empty AND the coin take hit the 5-coin clamp — a case that previously rendered the bribe wording incorrectly. Bribe wording itself unchanged. No prior disposition covered this case; it never had its own line. |
| 5 | 18-06 / FIX-06 | visual | every `button.primary` (9 static + 1 dynamic `.apBtn`) plus `#btnConfirmLeave` | `index.html` | Solid orange fill → outline + pale fill, recipe taken verbatim from `.footerKofi`. `#btnConfirmLeave` gains the red destructive treatment. No label changed on any of the 10 sites. |
| 6 | 18-06 / FIX-17 | visual | captain colour swatch, player rows + lobby seat list | `src/ui/util.js`, `src/ui/lobby.js`, `index.html` | `<span class="dot">` deleted from both templates; every other `HEXCOL[i]` consumer untouched. No text at either site. |
| 7 | 18-06 → **2438aa3** / FIX-09 | visual | ingredient chips, narrow captains box | `index.html` | 18-06 built two candidate treatments behind `body.chipsOwnRow`. **Wyatt chose Treatment B on 2026-08-01** (*"I LOVE true — it's so much better"*); Treatment A was deleted in commit `2438aa3`, so exactly one treatment ships and no unreachable CSS remains. The container-query threshold (460px) is derived, not guessed — the arithmetic is in the CSS comment. |
| 8 | **playtest batch `10b3bbc`** | **text** | `#creditsModal` credit clause (no `@copy` id — static markup, an extractor blind spot) | `index.html` | `"who later wrote every sound effect **ye** hear"` → `"…every sound effect **you** hear"`. **Never logged until 2026-08-02.** Shipped during the P6/P8–P12 playtest batch. See the flag below. |

Plans **18-01** (interlocking panel group) and **18-05** (shot clock defers to the buttons) changed no
player-facing text. 18-05's summary states it explicitly: only existing `play in` / `waiting` /
`seconds` / `or pay` / `or gain` literals are reused, `no new copy`.

---

## ✅ Row 8 resolved — `you` is deliberate, and here is the rule behind it

**Wyatt confirmed 2026-08-02:** `you` is correct and intentional.

> "the design intent is that the credits page is not 'in the game world' so it isn't written in
> pirate speak."

So this was never drift in the wording — it was drift in the *record*. The shipped text was right all
along; the inventory carried a `ye` form that should never have been recorded in that shape.

**He had told a previous session this same thing, and it was lost.** That is the real failure here,
and it is bigger than one word: an unwritten voice rule cannot survive a context reset, so every
future session re-litigates it and one of them eventually "corrects" `you` back to `ye` in good
faith. The rule is now in `.claude/CLAUDE.md` (inherited by every session) and in the copy gate's
design-intent section.

## The voice boundary

**Player-facing text has two registers, and the divide is diegetic — whether the words come from
inside the game world or from outside it.**

| Register | Voice | Where |
|---|---|---|
| **Inside the game world** | Pirate speak — `ye`, `yer`, `blowin'`, captain-address | Narration, battle/trade/dock lines, prompts, buttons, the board, the lobby, End of Voyage |
| **Outside the game world** | Wyatt's own plain first-person voice | Credits, the About page, and anywhere he speaks as himself to a real person |

The credits are Wyatt thanking real people — Luis, Nick Lesko, Xavaar, his parents, Juju — in his own
voice ("a designer and overly enthusiastic noodle", "my sweet partner Juju"). Pirate speak there
would put a costume on a genuine thank-you.

**Practical consequence:** a `ye`/`you` difference between the credits-and-About copy and the rest of
the game is **correct and expected**, not an inconsistency to fix. Any future audit that flags it is
emitting a false positive, and any disposition that records credits copy in pirate voice has recorded
it wrong.

---

## Chain this ledger sits in

`@copy` marker in source → extractor `id` → card id → alias map → Wyatt's 209 dispositions.

Row 8 sits **outside** that chain, and could not have been inside it: static `index.html` markup is a
known extractor blind spot, documented in the gate todo's "DESIGN INTENT added 2026-08-02" section
(*"no player-facing copy should sit outside of the audit tool, this is a design intent"*). Row 8 is a
concrete instance of that gap producing a real, if small, divergence — worth citing when that work
is picked up.
