# Handoff — the night of 2026-08-28 → 29

**Branch:** `claude/cloud-handoff-planning-a9ay1u` · **Head:** `5b23ee49` · **Gates:** 39, green
**Build stamp:** `2026.08.28.4` — deliberately NOT bumped yet; it moves once before the staging deploy.

This is the durable record. The blow-by-blow is [`CTO-LEDGER.md`](CTO-LEDGER.md) (append-only, one
entry per item) and every CEO verdict is verbatim in [`CEO-REVIEWS.md`](CEO-REVIEWS.md). This file is
what to read first if you are picking the work up cold.

---

## 1. WYATT'S RULINGS THIS WINDOW — these outrank anything inferred

| ruling | in his words | where it now lives |
|---|---|---|
| **The captains box** | *"I want tablet view to go wall to wall in line with the board. I want desktop view to have some padding around it like it currently is."* | `index.html`, the stacked `#pp4Cap` rules; held by `w44_captains_width_check.mjs` |
| **The page background** | *"i want the page's 5-gradient background to show up behind it. On all screen widths, including phone."* | the `html` surround left `@media(min-width:601px)`; held by `w43_one_background_check.mjs` |
| **The top bar** | *"remove this gradient (in red) from the top bar too."* | `#pp4Ribbon` paints nothing |
| **GSD, which half** | *keep the window on the game; add `/gsd-quick` to each item* | `CLAUDE.md` §5, rewritten |
| **Context discipline** | *"compress your context more aggressively so you don't get stupid and stale"* | check 5 in `scripts/qa/ceo_brief.mjs` |

**A ruling he made that reverses an older ruling of his own, flagged because it is easy to trip over
later:** W4-5 moves the sea hint next to the recipe card. In playtest 21 he had asked for the
opposite — *"a pill over the water… away from the sheet entirely."* The newer ruling wins; both are
recorded at the line in `src/ui/stage.js` where the old pin used to be. **If he ever asks why the
hint is not over the sea any more, that is the answer, and reverting is one line.**

---

## 2. WHAT SHIPPED — 22 commits

**Five backlog items, all four-stepped (gate red first → fix → gate green → matched-pair render → CEO):**

- **W4-3** the page's 5-gradient ground paints at every width, phone included; nothing paints over it.
- **W4-8** the top bar's dark gradient is gone; the page ground runs under it at every width.
- **W4-1** the prompt/recipe card is centred **in every mode, from one cause** — the base rule's
  `margin:0 auto` was being replaced by two later rules. After: card centre 0px off both the window
  centre and the board centre at 1200 and 390 (was 53px and 6px left).
- **W4-4** the captains box, both halves: wall-to-wall on tablet / air kept on desktop per his
  ruling, and the rows fill the card (13px from its inner edge at all three sizes, was 84–111px).
- **W4-5** the sea hint sits 6px above the card instead of 295px away, and pulses from the one
  shared attention vocabulary.

**Process and instruments:**

- `ROADMAP.md` marked **historical** — its status table had been wrong for 215 commits and is what
  `/gsd-autonomous` reads. The live record is the ledger plus `BACKLOG.md`'s wave list.
- `CLAUDE.md` §5 rewritten to his GSD ruling, replacing a rule the project had ignored all week.
- **A false claim of mine retracted and gated.** I told him rule 21's health check "cannot run in a
  cloud session". It runs fine — I had checked the `~/.claude/…` path the rulebook printed, which is
  a Mac path. `doc_command_check.js` now **fails** a home-rooted `node ~/…` command instead of
  skipping it, and caught the fault in two files.
- `ceo_brief.mjs` gained a fifth check on context discipline, with the exceptions stated so it cannot
  punish reading his screenshots.
- Chain 36 → **39 gates**.

---

## 3. THE ONE RECURRING FAULT, AND IT IS MINE

**Five consecutive CEO reviews have now named the same thing: a gate's pass line claims more than the
gate checks, and a report claims more ground than the change covers.**

Concrete instances this window, all fixed: a check that read `:not(.pp4Side)` as if it were the side
layout; one that matched the side layout's own box instead of the panel inside the stacked one; one
that counted writes in one function while a third sat in another; one that tested a variable's *name*
rather than what it was assigned from; a summary that said "fixed at every screen size" when the phone
had moved four pixels.

**What actually catches these: running the gate red AND READING WHICH LINES PASSED.** A gate can go
red on one assertion while another silently cannot fail. Then break it on purpose, once per way you
can think of — that is what turned up the two that escaped on W4-5.

**And one that is worth knowing on its own:** a gate counted a `hint.style.top` inside a *graveyard
comment* quoting a deleted line, and failed a correct tree. Instruments now strip comments before
counting. "A comment is not a measurement", turned on the instrument itself.

---

## 4. TRAPS THIS WINDOW PAID FOR — do not re-derive these

1. **`pkill -f <pattern>` matches your own command line and kills the shell.** It happened three
   times, and once it silently ate a commit. Kill by pid.
2. **A naive "click the first visible button" driver never leaves day 1.** `docs/DRIVING-THE-GAME.md`
   §4 says so in advance and §5b is the loop that actually plays. Two attempts were wasted before
   reading it.
3. **A metric can be plausible and still measure nothing.** An "ink width" check reported a row 98%
   full when it was visibly three-quarters empty, because the hold placeholder is right-aligned and
   spans the row whether or not anything is in it. **The answer came from opening the screenshot.**
4. **A comment describing runtime is intent, not fact.** `peekHintTick`'s header says it runs "inside
   whichever prompt box is up". It did not. That cost a whole fix that went gate-green and moved
   nothing — caught only by taking the after-measurement.
5. **A probe killed by a wall-clock limit loses everything if it writes at the end.** Write
   incrementally.

---

## 5. STILL OPEN

**Backlog, in the order I would take them:**

| item | what it needs |
|---|---|
| **W6-1** | the coin slider should appear greyed with the button reading "Nah" when the player is broke. No crew rig needed — the next one to do. |
| **W4-7** | board/captains card may overflow the right edge at 390px. **Observed once, never measured.** Measure the rects before believing it. |
| **W4-2** | guest battle narration box not centred. **Needs a real two-browser crew game.** |
| **W4-6** | the 🦜 Start button glow. Measured `pp4Glow` in solo, so not reproducible there — but he said *"on host or guest"*, and rule 23 says those are two orchestrations. **Needs the crew rig.** |

**The crew rig has failed twice tonight and is the main blocker.** Use `scripts/mp_rig.mjs`'s
`makeHost`/`makeGuest` with the §5b driver — do not hand-roll a click loop.

**After the wave:** Wave 3 (5 glitches), Wave 5 (3 art items), the guest sail-squares, SEO. Then bump
the build stamp, sail a FULL sea trial, and deploy to staging — **he does not play staging until the
whole scope passes.**

**Parked for him, do not decide:**
- **Q-15** — a hook that fires when a session is about to read something bulky. He chose to wait for
  evidence from the CEO check first.
- **Q-16** — the wind pill still paints its own dark wash, and it sits *inside* the rectangle he drew
  on the top-bar screenshot. Default if he never answers: leave it.
- **The tutorial proposal** — [`TUTORIAL-PROPOSAL.md`](TUTORIAL-PROPOSAL.md) and its artifact await
  his ruling.

---

## 6. HOW TO PICK THIS UP

```bash
git fetch origin && git pull --rebase origin claude/cloud-handoff-planning-a9ay1u
npm test                                    # 39 gates, exit 0
node .claude/gsd-core/bin/gsd-tools.cjs validate health    # NOT the ~/.claude path
```

Then read the last ~10 entries of [`CTO-LEDGER.md`](CTO-LEDGER.md), claim your item there before
editing it (**assume a second session is live on this branch**), and follow the four steps. Every item
gets a `/gsd-quick` artifact and its own fresh-context CEO review before the next item starts.
