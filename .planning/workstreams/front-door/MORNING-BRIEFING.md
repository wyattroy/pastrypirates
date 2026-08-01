# Morning briefing — Phase 22, The Front Door

**Night of 2026-07-31 → 2026-08-01.** Worktree `gsd-plan-phase-22-2a6acf`, branch
`claude/gsd-plan-phase-22-2a6acf`, workstream `front-door`. 20 commits.

---

## The short version

Phase 22 is **planned and three-fifths built.** The name modal works, the About page exists, and
both About links are live. I verified all of it in a real browser myself rather than leaving it
for you.

The two things that are **yours to decide** are exactly the two the plan set aside for you, and
work stopped there on purpose:

1. **Pick a screenshot** (D-11) — I played a real game and captured **five candidates** for you.
2. **Sign off the About page copy** (D-09) — written as a draft, clearly marked, not shipped.

Nothing is blocked on anything else.

---

## ⚠️ Four decisions I made that you should look at

### 1. I added a new saved setting, because the one your notes specified doesn't survive

Your CONTEXT.md said the name modal should pre-fill from the game's existing saved-session data.
**It can't** — that data is wiped every time someone clicks "Play again" or "Leave game", which is
how almost every session ends. The pre-fill would have been empty nearly always.

So I added a separate, small saved value that only holds the last name you typed and is never
cleared. It follows the same pattern the game already uses for its device id.

**Verified working:** typed a name, reloaded the page, the modal came back pre-filled with it.
Easy to undo if you'd rather it behaved differently.

### 2. Pass & Play asks your name twice in a row

The modal names you, then Pass & Play's own first-seat box appears already filled in with that
same name. It looks slightly redundant.

**I left it visible and editable.** Reason: Pass & Play seats up to four people on one device, and
that box is still how you name players 2, 3 and 4 — hiding it for seat 1 only would be odd. Your
own D-03 note also said consistency matters more than saving a click. **Say the word and I'll hide
it for the first seat.**

### 3. The About page's "Buy me a cookie" is the same embedded panel as in-game

Rather than a plain link out to Ko-Fi. It matches what players already see, and it opens only when
clicked (nothing loads from Ko-Fi until then). A plain link is the simpler alternative if you
prefer — it's a one-line change.

### 4. The About page's rules are written fresh, for a stranger

Your D-08 said write them new rather than reuse the in-game rules, and that turned out to be well
judged: **`RULES.md` says the home island is "Barbados" while the actual game says "Isle of
Tortuga."** Those two have already drifted apart. The About page says Isle of Tortuga, matching
what people actually play.

---

## 📸 Your screenshot choice (D-11)

I played a real solo game to round 7 — ships spread across the map, island crates taken, three of
four captains carrying ingredients — and captured five frames. **Nothing is staged.** I
deliberately stopped before the end-of-voyage screen, which your notes exclude.

They're in `assets/about-candidates/`. All are 1200×663.

| File | What it shows |
|------|---------------|
| **candidate-1** | Centred. Four ships spread out, every island in frame, home island in the middle. No compass. |
| **candidate-2** | Higher crop — logo *and* compass visible. But the yellow squares are a live "where do you want to sail" prompt, which may read as unfinished UI. |
| **candidate-3** | Centred, later in the game. **My pick.** All four ships nicely spread, every ingredient island visible, clean — no prompt overlay. |
| **candidate-4** | Same moment as 3 but cropped high: logo top-left, full compass top-right, no clutter. Loses the southern islands and only two ships show. |
| **candidate-5** | Middle-ground crop. Most islands, ships spread, compass just clipped at the top edge. |

**The trade-off to know about:** the board is square, the image slot is wide (matching your
existing `og-image.jpg`). So a crop either centres on the islands **or** keeps the compass — it
can't do both. If neither compromise appeals, we could use a different shape for the image, or
capture the board *with* the captains panel beside it, which is naturally wide. Your call.

## ✍️ Your copy sign-off (D-09)

The About page is written and live at `about.html`, but every word is a **draft**. It's marked in
the source with `TODO(D-09)`, and the final plan (22-05) won't pass until those markers are gone
and the copy is recorded against your copy-approval gate. Read the page and tell me what to change.

---

## What actually got built and verified

| Plan | What | Status |
|------|------|--------|
| 22-01 | Name modal after you pick a mode; welcome-screen name field removed | ✅ built + verified in browser |
| 22-02 | `about.html` — rules, credits, Ko-Fi, screenshot slot | ✅ built + verified |
| 22-03 | About links (welcome screen + in-game footer); Google preview tags confirmed intact | ✅ built + verified |
| 22-04 | Screenshot | ⏸ **five candidates captured — waiting on you** |
| 22-05 | Copy sign-off | ⏸ **waiting on you** |

**What I checked in a real browser** (not just "the code looks right"): the modal opens on all four
play buttons pre-filled; confirming starts the right mode; dismissing with ✕, Escape, or a click
outside all **confirm and proceed** rather than cancel; the name persists across reloads; your name
shows once, not twice; both About links navigate; the About page reflows correctly down to 320px.
Zero JavaScript errors throughout.

**A bug I found and fixed while checking:** on phones, the About page had a ~190px gap between the
text and the image — a CSS sizing rule that behaves differently once the layout stacks. Gap is now
the intended 24px and the block is 240px shorter. Desktop unchanged. *This is the entire reason the
visual check exists; the automated checks all passed while it was broken.*

---

## Two things that were already broken before this phase

1. **`npm test` fails on a clean tree** — and it isn't Phase 22's doing. A narration-audit script
   reads a file that was moved into the v1.2 archive during cleanup and never re-pointed. 21 of 22
   check groups pass. It matters because **no plan can honestly use "tests pass" as its bar while
   the baseline is red** — every Phase 22 plan had to check a named subset of scripts instead.
   Written up in `.planning/todos/pending/2026-08-01-npm-test-red-archived-dispositions-path.md`.

2. **Multiplayer hosting can't be tested in this environment** — Firebase never connects from the
   automated browser. I confirmed this happens *identically on the code from before this phase*, so
   it's the environment, not a regression. **Host a Crew still needs one real test from you.**

---

## Where to pick up

`.planning/workstreams/front-door/RESUME-HERE.md` has the precise state. In short:

```bash
/gsd-execute-phase 22 --ws front-door
```

It will stop at the screenshot checkpoint and ask you to choose.

Local test servers are still running on ports 8557 and 8571 (I left them up per your standing
rule). Say the word when you want them stopped.
