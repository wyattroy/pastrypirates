# CEO reviews — newest at the TOP, append-only

**Never edit an old verdict.** A review that turned out wrong is evidence about the reviewer and
belongs on the record exactly as it was written. Each CEO is handed the previous verdict so it can
say whether a fault is *recurring* — which is the check this file exists to make possible.

---

## 2026-09-12 · `086beee8`..`5eff19e4` · eleven commits · **THE PAPERWORK IS EXCELLENT AND THE GAME DID NOT MOVE**

**Reviewed:** his ten asks in the captain's-box stream, oldest first, ending with *"This process is
not working."* Repo-read-only by instruction: no browser, no server. **`npm test` deliberately NOT
run** — this repo's own record (`b684271a`) says one gate in it starts a browser, and I was told not
to. Everything below is read off the files, off the committed art's pixels, and off the session's own
transcript. `git fetch` run before any statement about git.

**My one sentence for Wyatt, verbatim:**

> **Everything you ruled on yesterday got written down properly for the first time — but from 6pm to
> 11:37pm not one line of the game changed, the plaque still cannot fit four captains because the
> picture was ordered at 2:1 when a division anyone could have done that morning says it needs 1.6:1,
> and the crates-on-one-line you called "awesome" is still not on staging for you to play.**

**Verdicts**

| ask | verdict |
|---|---|
| #1 — the pill covers the card, write it somewhere durable | **DONE** — and done properly, in the one place a machine reads |
| #2 — crates on one line, his settings | **DONE in code · NOT ON STAGING**, so he still has not played it |
| #3 — sugar cane art review | **DONE** — four shapes, shown at play size, he picked one; the winner is not in the game yet |
| #3 — the new plaque art review | **DONE** — both round-1 rejected, round 3 produced |
| #4 — previews at the real game size, not squares | **DONE** |
| #5 — more weathered, a little darker | **DONE** |
| #6 — the new art not showing in the mockup | **DONE** |
| #7 — four captains only · card gradient · 25% fill · a real tuner | **DONE** |
| #8 — "did you even QA this?" | **PARTIAL** — that fault fixed; the replacement shipped with a row cut off |
| #9 — "the center area is messed up" | superseded by #10 |
| #10 — two source pictures at the box's size | **PARTIAL** — model adopted, tuner rebuilt, **no art generated** |
| this turn — the handoff prompt | **DONE, and it is good** — three cited corrections below |

---

### The one number that cost the whole evening

**Nine of his messages went to one picture. Only ONE of them (#5, "more weathered and a little
darker") was him judging the art.** The other six — #4, #6, #7, #8, #9, #10 — were him reporting that
the *preview* was broken: squares instead of the real box, art that did not appear, an impossible
two-captain table, a double rope, a wrecked centre, and finally the whole mechanism.

**The fault was visible before a single image was generated.** `.claude/memory/DECISIONS.md` records
the round-2 prompt asking for **"2:1 (the box's real shape)"**. It is not the box's real shape. The
row rulings written down that same day give the arithmetic: band 31 + four 32px rows + 3px gaps +
padding = **204px of content in a 390px-wide box**. Allow for a rope and the picture has to be about
**1.6:1**. At 2:1 — and at the 2.11:1 that was actually drawn — the fourth captain does not fit, and
no amount of slicing, knotting or tuning can make it fit.

**The decision that should have been made differently, and when:** on 2026-09-11, at the round-2
prompt, before any art was ordered. Divide 390 by 204 first. Everything after it — the CSS nine-slice,
the four masked knots, the wood crop, three complete tuner rebuilds, and his *"your system is
completely failing"* — is downstream of one division that was skipped. **Three of the tuner's rebuilds
were machinery, not the thing he asked for. He deleted all three himself in #10.**

**And the arithmetic that proves it is printed inside the tuner he was sent.** The tuner computes
`SHORT by 41px: the picture wants to be 1.61:1` and draws the box with `overflow:hidden`, so the
fourth captain is clipped. I re-derived it: at 390 wide, 2.11:1 gives 185px of picture, 14% inset top
and bottom leaves 133px of board, the rows need 174px. **The page told the CTO it did not fit, and it
was published to him anyway.** That is the moment to have stopped — not after he replied.

---

### What is actually in the repo after all of it

```
git diff --stat 34168a43..HEAD   →  15 files, 100 insertions
```

**Not one of them is a game file.** Six of the seven art-stream commits touch only
`DECISIONS.md`, `BACKLOG.md` and `CURRENT-SHEET.md`; the seventh commits eight source JPEGs into
`art-review/`. The last time the game itself changed was **16:15 local on 09-11**. The captain's box a
player opens today has no plaque, no rope and no wood.

**And three game commits are stranded before staging.** `.planning/CURRENT-SHEET.md` names staging as
`dd56bb96`; `dev` is `5eff19e4`. Between them sit `2791099e` (his whole phone playtest, eleven game
files), `301725e8` (crates on one line — the thing he called *"awesome... Implement it"*) and
`34168a43`. **He has not been able to play a single fix he asked for on 09-11.** Production
(`origin/main` = `a473be4b`) is from 2026-09-06; that part is normal and not a fault.

**Housekeeping is clean**, and it should be said: `dev` is pushed and matches `origin/dev` exactly
(nothing stranded on the Air), and `node scripts/qa/stray_probe_check.mjs` passes — no abandoned
browsers on this machine.

---

### #1 — the pill. DONE, and it is the best-executed item here.

The ruling is in the **single** ```accepted fence (`docs/INTENDED-BEHAVIOUR.md:368-382`), which is the
one `scripts/lib/vision.mjs:38-47` reads at runtime and **throws** rather than run without. There is
no second fence to drift out of step with. It is also at `.claude/memory/DECISIONS.md:2330`, in a
comment above the rule itself (`index.html:3160-3162`, which explicitly retires the two older comments
that worried about what the pill covers), and the probe that flagged it is deleted. I opened
`sea-trial-shots/judge-results.json`: **exactly 8 entries flipped to PASS, each carrying the reason.**
This is what "write it somewhere durable" should look like every time.

### #2 — the crates. His numbers, faithfully. One claim in the record is wrong.

`src/ui/util.js:193` — `HOLD_GAP_PX=3, HOLD_MAX_OVERLAP=0.35`. His settings exactly. The tuner's model
matches the real game rather than approximating it (`--rowH1` 32/40 and `--rowGap` 3/4 at
`index.html:3377` and `index.html:3437`). The rebuild is guarded against churn by comparing the string
it wrote (`src/ui/board.js:1808-1813`), which is the right guard.

**But "the newest crate on top" is written in three places and the code does not do it.** Other
captains' crates are `hold.slice().sort()` (`src/ui/board.js:1798`) and the viewer's own are in recipe
order (`src/ui/board.js:1784`), so the crate that sits on top is the last one *alphabetically* or the
last in the recipe — never the newest. Invisible to a player; wrong in `src/ui/util.js:188`, in the
tuner's footer, and now in the new handoff's §5.

### The handoff written this morning — good, with three corrections

It is measured, specific, honest about A and B being nearly the same shape, and it names the real
constraint. I checked its arithmetic end to end and **every number reconciles**: 204px and 255px of
content match the stylesheet's own row and padding rules; 1.55 / 1.69 / 2.47 follow from those plus the
rope; the canvas sizes, rope thicknesses and twist counts all follow from 2048px wide. Three things to
fix before a cleared session acts on it:

1. **§6 names the wrong cause, and a session sent to fix it will edit a rule that never runs.** It
   cites `index.html:1765` for the fourth captain being cut off at 390×664. That line lives inside
   `body.pp4Stage.pp4Side #pp4Col` — the side-by-side column. At 390 wide the layout takes the stacked
   branch and **removes** `pp4Side` (`src/ui/stage.js:3121`). The clamp that actually applies on a
   phone is set inline at **`src/ui/stage.js:3158`**. The bug may well be real — it is a probe reading
   I cannot re-run without a browser — but the cause is misattributed.
2. **"Rope thickness is fixed at 24 screen pixels" is a choice, not a measurement**, and it sits in a
   section headed *"read off the running game, not guessed"*. It is the one number that decides how
   much edge the rope eats — which is exactly what he complained about. On a phone it takes 19% of the
   box's height. Mark it as the CTO's pick and put it to him.
3. **The §6 bug is on no list** — the handoff says so itself. That is the previous verdict's finding
   (I) starting over in a new file.

---

### 2. Delivered that he did NOT ask for — and it did not displace anything

- **Eight source images committed to `art-review/`** (~18 MB). Not asked for, correct anyway: they
  cannot be regenerated, and the commit message says so.
- **`DECISIONS.md` grew 352 lines.** Not asked for. It is the single biggest improvement in this set.
- **Nothing displaced work he asked for.** The evening's cost was three tuner rebuilds on mechanisms
  he later deleted — that is a wrong-turn cost, not a substitution.

### 3. Claims the repo does not support

| claim | where | what I measured |
|---|---|---|
| "the board starts **13.6%** in from the top and bottom and about **9%** from the sides", stated as measured off the round-3 art | `.claude/memory/DECISIONS.md:2470`, and the same sentence in the tuner | Scanning `plaque-r3-keyed.png` myself: **top 12.2%, bottom 12.1–12.9%, right 5.0–6.0%, left 5.0–9.1%** (unstable — the border is hand-painted and uneven). **The 9% side figure is roughly 1.6× the rope's real thickness**, i.e. ~13px per side of good wood thrown away on a 390px box. Method: variance-threshold scan; I name its wobble rather than hide it. Part of the "gratuitous space on the edges" he complained about is this number, not the picture. |
| "the newest on top" | `src/ui/util.js:188`, tuner footer, handoff §5 | `src/ui/board.js:1798` sorts; `:1784` uses recipe order |
| "the three sugar-cane variants he asked for are not generated" | the CTO's own brief to me | **Four were generated and he picked the tied bundle** (`DECISIONS.md:2413`; four JPEGs in `88078de4`). The three un-generated ones are the *follow-ups* he asked for after picking, correctly parked with a real reason. The account understates its own work — rarer than flattery, and still inaccurate. |
| "the rope eats roughly 13.6% of the height at top and bottom" in his screenshot | the CTO's own brief | that is the tuner's **setting** (`insetY` 14), not a measurement of what he saw |

### 4. Is the last verdict's fault fixed, or recurring?

**Split, and the split matters.**

- **Finding (I) — "his rulings exist nowhere but this conversation": FIXED, decisively.** Every ruling
  I spot-checked is in `DECISIONS.md` in his own words, and the pill ruling went further and reached
  the code path that reads it. Two verdicts in a row named this; it has been answered.
- **"Stale facts written into the source": RECURRED.** The 13.6%/9% pair and "newest on top" are now
  baked into a durable file as measurements, and the 9% is the evidence the layout rests on.
- **A NEW fault, and it is larger than either:** an evening's work that **cannot reach a player**, and
  three approved fixes stalled before staging. The previous two verdicts judged fixes that were at
  least in the game. This one judges a day that produced rulings, art files and an excellent handoff —
  and moved nothing a player can see.

### 5. Did the CTO spend its own head on reading it could have delegated?

**I measured this rather than guessed it**, by streaming the session's own transcript without reading
it into my context. Since 2026-09-11:

- **597 Bash calls in the main thread, ~945,000 characters (~236k tokens) of tool output — and ZERO
  subagents.** Not one delegation all day. The only `Agent` call in the window is the CEO audit itself,
  this morning. `sed -n` ranges alone poured **392,615 characters** (~98k tokens) of source into the
  main thread; `grep -n` another ~102,000.
- **The per-call discipline is genuinely good and I want to say so**: no single result exceeded 20,000
  characters, `| cut -c1-200` appears repeatedly, the megabytes of base64 art were written to
  `*_uris.json` by scripts and spliced into pages by scripts so they **never** entered context, and the
  probes return summaries rather than dumps. The fault is the aggregate, not any one read.
- **The exceptions hold and I am NOT counting them:** the 15:40–15:57 UTC reading run across
  `flow.js`, `orchestrator.js`, `engine/index.js`, `panel.js`, `pilot.js` and `stage.js` (~80k chars)
  landed **34 minutes before `2791099e`, which edited exactly those files** — a file under active edit,
  main-thread by design. The 88 `browser_batch` calls are the rendered game and the art rounds
  (rule 19). Wyatt's own words and screenshots are his.
- **The clearly delegatable reads I can name:** `.planning/art-generation-process.md` read **three
  times** in the main thread (02:05, 02:06 and 04:08 UTC, ~30,000 characters total) — a runbook, read
  to follow, re-read twice; and `scripts/qa/_crew_motion_check.mjs` read whole (200 lines, 6,980 chars)
  to check one behaviour, on a day it was never edited. Small on their own.

**The honest conclusion: bulk reading is not what broke this day.** Zero delegation across ~236k
tokens of tool output on the day he said the process is not working is a real signal — but the thing
that actually cost the evening was one skipped division, not a full context window.

### 6. One sentence Wyatt should read first

> **Everything you ruled on yesterday got written down properly for the first time — but from 6pm to
> 11:37pm not one line of the game changed, the plaque still cannot fit four captains because the
> picture was ordered at 2:1 when a division anyone could have done that morning says it needs 1.6:1,
> and the crates-on-one-line you called "awesome" is still not on staging for you to play.**

---

## 2026-09-10 · `c61bdddb` + `3c54758f` · two commits · **MIXED — #1 is half-fixed, #2's "too big" is not answered**

**Reviewed:** his #1 (the cards jump after the swap), his #2 (the sizes were for desktop; the cards
are too big; the padding round the picture is wrong), and his 14.1 (the wait line on the host).
Repo-read-only, by instruction: no browser, no probe, no server. `npm test` run once — **exit 0,
0 failures.** Everything below is read from the files and from arithmetic done on the numbers those
files declare.

**Its one sentence for Wyatt, verbatim:**

> **The big 100px jump you filmed is genuinely found and genuinely fixed — but a smaller 15px
> version of the very same jump is still there on a desktop window narrower than about 1000px, by
> the CTO's own measurement; "the cards are TOO big" was not acted on and was not written down
> anywhere you will ever see it again; and the commit that did all this also wiped your own edit to
> CLAUDE.md and pushed it before putting it back.**

**Verdicts**

| ask | verdict |
|---|---|
| #1 — the cards jump after the swap | **PARTIAL** — the ~100px cause is right and fixed; a 15px cause survives on desktop |
| #2 — the sizes were for DESKTOP only | **PARTIAL** — the three enlargements are correctly gated; two changes still reach a phone |
| #2 — "you made the cards TOO big" | **NOT DONE**, and not parked anywhere durable |
| #2 — the padding round the recipe image | **PARTIAL** — the picture's half is right; the number it was matched TO does not reconcile |
| 14.1 — the wait line on the host | **DONE** for the symptom he reported, with two unguarded edges |

---

### #1 — the jump. The big cause is right. A smaller one is still live on desktop.

**The diagnosis is correct and well evidenced.** `height:auto` on the artwork made the card's height
a function of that pastry's shape, the front card changes identity on a swap, and the row's height
follows the front card — so the stack lurched. `aspect-ratio:1.35` + `object-fit:contain`
(`index.html:3058-3060`) removes it. I confirmed the pastry shapes myself by reading the WebP
headers: they really do run from 1.049 to a good deal wider, so the mechanism is real.

**But the second cause was fixed on phones only, and desktop needs it too.** The title reservation
is behind `@media (max-width: 900px)` (`index.html:2987-2989`). The CTO's own probe result, written
into the comment three lines above it, says **"card 250 -> longest is 54px"** and a one-line title is
39px. The card is **250px wide from the stylesheet** (`index.html:2753`) whenever the captains box is
not a side column beside the board — and that side-column decision is made in JavaScript from the
window's height as well as its width (`src/ui/stage.js:3049`), so a window of, say, 950 x 800 is
"desktop" to the CSS (over 901) but still gets the 250px card. In that window the reservation does
not apply, the two titles differ by 15px, and **the stack jumps on every swap.** Same defect, one
seventh the size.

The same gap covers the ordinary laptop case: stage.js's own comment says the derived card is
**"~245 at 1280"** (`src/ui/stage.js:3675`) — narrower than 250, so titles wrap there too, and the
probe never measured anything between 250 and 365 (`scripts/qa/_recipe_title_lines.mjs:26`).

**So the claim "card heights EQUAL at 1920, at 820, at 768 and at 390 — a swap cannot resize the
stack at any size" is false.** Four widths were measured; the band where it still moves was not one
of them. The four numbers are probably all true. The sentence they were used to support is not.

**Does the card's floor rescue it? No — that rule does nothing at all.** `min-height:
calc(var(--rcW) * 0.87)` (`index.html:2799-2800`) is the rule carrying his "make the cards larger
vertically by 50%". Working it out from the file's own numbers, the card's actual content comes to
about 0.97–1.02 of its width at every desktop size, and the floor is 0.87 — so **the floor is never
reached and the rule has no effect.** The card's height is now decided entirely by
`aspect-ratio:1.35`. Worth knowing before anyone tries to re-dial his 50% by touching that line.

**Does the fixed shape re-create his "far too much empty space" complaint? No, and I want to say so
plainly.** With the box at 1.35 and the picture fitted inside it, the *widest* pastry gets about
**19px of dead space above and below** on a 365px card, and the *squarest* gets about 34px at each
SIDE and none top or bottom. He complained about **66px above and below**. This is roughly a third
of that, and it has mostly moved to the sides. That is a fair trade, honestly made.

**Three numbers written into the source are wrong** — the same fault the last verdict named.
- `index.html:3041` and the commit body: the pastries "run from 1.049 (Mayan Cocoa Souffle) to
  **1.515** (Caramel Slice)". Measured from the files: the widest is **1.615 — Crispy Cocoa Snaps
  (`assets/pastries/11-crispy-cocoa-snaps.webp`, 512x317)**. The CTO missed the widest of the
  twenty-one while claiming to have measured all of them.
- `index.html:3044`: "six of the first eight sit between 1.32 and 1.40". **Four do** (1.330, 1.326,
  1.323, 1.320); 1.403 and 1.463 do not, and 1.049 and 1.515 plainly do not.
- `index.html:3060` says the card is now **"340 tall at 1920"**; the commit message for the same
  change says **"353 tall at 1920"**. One of the two is stale, and whoever reads the file next gets
  the wrong one.

---

### #2 — desktop-only. The gating is real and the braces are clean. Two things still reach a phone.

**I checked the braces the way I was asked to, and they are correct.** Parsing the whole stylesheet
with comments stripped: the `@media (min-width: 901px)` block that starts at `index.html:3023` closes
at `index.html:3065` and encloses exactly two rules — the 52px ingredient icons and the `.recipeThumb`
block. Nothing was swept in. The other two blocks (`index.html:2798-2801`, `index.html:2987-2989`)
are also correctly closed, and the file's brace nesting balances end to end. **No leak.**

**But "below it the card is byte-for-byte what it was" is not true.** I rebuilt the card's complete
rule set from the last build before his 09-10 asks (`f5b5091d`) and from HEAD, and diffed them. Below
901px, three things differ:

1. **`padding: 6px 6px 8px` → `padding: 9px 9px 12px`** (`index.html:2786`) — **unscoped, still
   applies on every phone and tablet.** It sits directly under a comment headed "⭐ HIS 2026-09-10
   SIZES" (`index.html:2784`). This is exactly the thing he complained about, left in place.
2. **A new `min-height: 54px` on the title** below 901px (`index.html:2988`) — the phone's card is
   now up to 15px taller than it was. Defensible (it is what makes the phone stop jumping) but it is
   a change to the mobile card's look, and it should have been said, not denied.
3. The swap transition 0.15s → 0.38s — his own 380, a motion change, correctly applied everywhere.

Netting 1 and 2 out: a 390px phone's card is roughly **7–22px taller** than before his desktop asks,
not identical. The honest sentence was "everything that made it *bigger on purpose* is gated; the
padding and the title reservation still apply, here is why" — not "byte-for-byte".

---

### #2 — "you made the cards TOO big." NOT DONE, and the dodge is the paperwork, not the argument.

**The argument itself is legitimate.** His video is a narrow window; the enlargement was ungated;
removing it below 901px genuinely changes what he was looking at. Measuring the back card at 7–12px
inside the panel and saying so is the right instinct. I would not call the reasoning a dodge.

**Two things make it NOT DONE anyway.**

First, **shrinking the card does not help the back card fit — it hurts.** The back card is pinned at
`top:10px` and scaled to `.965` (`index.html:2847`, `index.html:2857`), so it hangs below the front
card by roughly `10px minus 3.5% of the card's height`, plus a little more from its 1.1° tilt. On a
tall card that is negative — it tucks inside. **The shorter the card gets, the further the back one
protrudes.** So the 21–34px reduction the padding fix delivered as a side effect moves the back
card's bottom edge the *wrong* way. If "doesn't fit in the space available to it" means the back card
poking past the sheet, this change makes it very slightly worse, not better. I could not measure it —
no browser — so this is arithmetic, not a confirmed defect. It is the first thing to check.

Second, and this is the real failure: **the item exists nowhere but a commit message.** Nothing was
written to `.planning/BACKLOG.md` or `.claude/memory/DECISIONS.md` — neither file has been touched
since `89ecec72`, before both commits. `.planning/CURRENT-SHEET.md` still names build
`2026.09.07.3-staging@6012fe66`, so the sheet on his phone does not carry these fixes either. **His
CLAUDE.md says in as many words: "A list that lives only in a chat reply is gone when the session
ends."** This one is. **That is the exact fault the previous CEO verdict recorded as finding (I),
recurring nine days later.**

---

### #2 — the padding round the recipe image. Half of it is right; the target it was matched to does not reconcile.

**The picture's own half is correct arithmetic.** `width: calc(100% - 40px)` on a centred image
inside a card with 9px padding puts the picture's edge at 9 + 20 = **29px**. That checks out
(`index.html:3058`).

**The 29 it was matched TO does not.** The claim is "Measured at 1920: picture 15, icon row 9, first
icon 29" (`index.html:3056-3057`). Working the icon row out from the rules in the same file — row
padding 6px a side (`index.html:3011`), a five-column grid with 5px gaps, each icon capped at 52px
(`index.html:3024`) and centred in its column — the first icon's left edge lands at about **21px**
on the widest card the code permits (`RC_CARD_MAX = 375`, `src/ui/stage.js:2287`), and less on a
narrower one. For the icon to sit at 29 the card would have to be about 450px wide, which the code
caps out below.

If that arithmetic is right, **the picture is now inset ~8–10px MORE than the ingredients — his
complaint mirrored rather than fixed.** I could not run a browser to settle it, and I am not calling
it confirmed. But it is a measurement stated as fact that the stylesheet does not support, and it is
the single fastest thing to re-check before he sees this.

---

### 14.1 — the wait line. DONE, with two edges nobody is watching.

**The mechanism is right and it is in the right place.** The line was retired only by the panel going
empty and then filling again, and the crew path never passes through empty — so it survived onto the
host's own recipe picker. Keying on panel.js's existing per-prompt stamp instead of inventing a
second clock or reading the text is the correct instinct, and it is one place that covers every
prompt style (`src/ui/stage.js:3581-3584`). The probe is honest, too: it asserts the line **does**
appear first, so a probe that stopped exercising the bug would fail rather than quietly pass
(`scripts/qa/_crew_waitline_check.mjs:66-67`).

**Can it kill the line the instant it is born — the regression the comment above it says was caught
once before? Not on the path he reported.** `panel()` runs the tick synchronously as it finishes, so
by the time a wait line is armed the stamp is already current. Good.

**Two edges are unguarded.**
- **The stamp counts panel renders, not questions.** `const seq=++panelSeq` (`src/ui/panel.js:540`)
  increments on *every* panel draw that has a button row — including a redraw of the *same* question.
  The comment claims "it increments once per question asked" (`src/ui/stage.js:3577`); that is not
  what panel.js does. If anything re-renders the host's panel while he is genuinely waiting, the line
  goes early. The robust version records the stamp where the wait line is armed
  (`src/ui/stage.js:1847`) instead of trusting a value another loop keeps up to date — one line.
- **Reduced motion turns the fix off.** The stamp is only written when `hasButtons && !reduced`
  (`src/ui/panel.js:539`), so a player with "reduce motion" on never gets a stamp and 14.1 comes
  straight back for them.
- The probe sleeps 4.2s before judging (`scripts/qa/_crew_waitline_check.mjs:56`), so it cannot tell
  "retired at the right moment" from "retired too early", and it never covers the second wait — the
  one armed after the host picks his own recipe (`src/ui/flow.js:3311`).

---

### What was delivered that he did NOT ask for

- **`c61bdddb` reverted his own edit to `.claude/CLAUDE.md`, in full, and pushed it.** The file in
  that commit is byte-identical to the pre-trim version (`89ecec72`) — his 117-insertion,
  133-deletion trim (`3990a401`) was wiped by a `git add -A` inside a commit that was meant to be two
  CSS fixes. Restored two minutes later in `0d0116a0`, and HEAD is correct now. **His own writing was
  destroyed and re-created, on a shared branch, in a window where the other machine could have pulled
  it.** He should know it happened.
- **Two new probes, neither in the gate chain** — `scripts/qa/_recipe_title_lines.mjs` and
  `scripts/qa/_crew_waitline_check.mjs`. The `_` prefix is this repo's own convention for hand-run
  probes and thirteen others live the same way, so this is not a rule broken. It does mean **nothing
  in `npm test` guards either fix**, and the next person to touch the picker's CSS or the panel's
  stamp will not be told.
- Neither displaced work he asked for. The CLAUDE.md revert cost a commit and a scare, not an item.

### Claims unsupported by what is in the repo

| claim | where | what the repo says |
|---|---|---|
| pastries run 1.049 to **1.515** | `index.html:3041` + commit body | widest is **1.615** — `assets/pastries/11-crispy-cocoa-snaps.webp` |
| "six of the first eight sit between 1.32 and 1.40" | `index.html:3044` | **four** do |
| card is "**340** tall at 1920" | `index.html:3060` | the commit body says **353** for the same measurement |
| "first icon 29" at 1920 | `index.html:3057` | the rules in the same file compute **~21** at the maximum card width |
| "below it the card is byte-for-byte what it was" | commit body | padding `index.html:2786` and title `index.html:2988` both still change the phone's card |
| "a swap cannot resize the stack at any size" | commit body | 901–~1000px windows keep the 250px card with no title reservation; by the CTO's own probe that is a 15px jump |

### Is the last verdict's fault fixed, or recurring?

**Recurring, twice, in new clothing.**

1. **Finding (I) — "his rulings exist nowhere but this conversation."** Recurred exactly. The half of
   #2 that was not done was not written to `.planning/BACKLOG.md`, `.claude/memory/DECISIONS.md` or
   the sheet. Nine days, same fault.
2. **"Stale facts now written into the source."** Recurred. Three wrong numbers are now baked into
   `index.html`'s comments, and one of them (the aspect range) is the evidence the fix rests on.
3. **A softer echo of "bug 3 — the fix's mechanism is absorbed."** The rule carrying his "50% taller"
   ask, `min-height: calc(var(--rcW) * 0.87)` (`index.html:2799`), is a floor the card's own content
   already exceeds at every desktop width. It is not wrong; it is simply doing nothing.

**What genuinely improved on the last verdict:** the fix is a real root cause with real evidence
behind it, the media-query braces are clean where the last one shipped a selector that silently lost,
the probe carries its own red-proof, the CTO says out loud that he guessed twice before measuring,
and `npm test` is green. This is a better piece of work than the one reviewed on 2026-09-08. It is
still not what he asked for on two of five counts.

---

## 2026-09-08 · `a6c2894b`..`2d676cd1` · six commits · **MIXED — one named bug NOT DONE**

**Reviewed:** his three named bugs (coin vanishing, the bot-attack blocker, the desktop recipe
picker), his twelve playtest-artifact notes, the updated artifact, and "do it" on converging the
drain.

**Its one sentence for Wyatt, verbatim:**

> **Nine of your twelve notes are genuinely done and the blocker's mechanism is correctly found —
> but the desktop recipe picker you filed as bug 3 looks pixel-for-pixel the same as before the fix
> in their own screenshots, the tablet picker cuts your captains box in half instead of covering
> it, and the updated playtest artifact you asked for was never made.**

**Verdicts**

| ask | verdict |
|---|---|
| bug 1 — coin vanishes before the stage | DONE |
| bug 2 — BLOCKER, bot attack | DONE, but never played in a real crew game |
| bug 3 — desktop picker | **NOT DONE** |
| s3 · s4 · s7 · t1 · t2 · t3 · t5 · r3 · r4 | DONE (s7 ungated) |
| s8 Safari | PARTIAL — honestly labelled as a hypothesis |
| r7 cover the captains box | **PARTIAL — the tablet half fails outright** |
| q29 show option 2 | UNVERIFIABLE — "option 2" exists nowhere in the repo |
| the updated playtest artifact | **NOT PRODUCED** *(see CTO note below)* |
| "do it" — the convergence | DONE in substance; the GATE that claims to hold it does not |

**Findings that stand, in its words**

- **bug 3:** the 44px lift is clamped by `topBandPx()` (`stage.js:3269`) and on desktop the captains
  column starts right under the ribbon, so the whole lift is absorbed. *"And a vertical lift cannot
  overlap the board on desktop anyway — the board is to the left, not below."*
- **r7 tablet:** the sheet is a centred column that bisects the captains box, all four names legible
  either side. Cause: `#actionPanel` is still capped at the board's width by a shared classic rule
  (`index.html:2088-2094`) — a rule the repo had already parked as *"a taste call Wyatt has not
  made."* **His r7 IS that ruling, and the parked question was never unparked.**
- **the centring (unasked-for):** blank cream below the card went 145px → 190px and a new ~127px
  band appeared above; ~44% of the sheet is empty. It also sets `justify-content:center` on the
  element that already carries `overflow-y:auto` (`index.html:2331`), so on a short screen the
  title can scroll out of reach and cannot be scrolled back to.
- **the new gate has two holes:** it reads only `flow.js` and `orchestrator.js` (2 of ~11 files), so
  a ride added to `board.js` passes; and one alias (`const _ride = animateSailRoute`) defeats its
  literal regex. The red-proof exercised one shape only.
- **`await liveRender()` widens a pre-existing deadlock hazard** — it now awaits *every* unconsumed
  event, and `localAsk`'s resolver fires only from a tap. Also `panel.js:164` dereferences
  `appState.game` **before** the guard at `:165`, so it can throw synchronously and return no
  promise.
- **`setFlipCoin`'s new guard sits ABOVE `stopFlipSpinSound()`** (`board.js:2397` vs `:2409`), so a
  deferred blanking skips the one line written to stop the spin sound outliving the picture. No live
  path found — a weakened invariant, not a measured bug.
- **stale facts now written into the source:** `docs/AUDIO.md:210` still says the music gap is 60
  (it is 180) and warns against restoring 120; "~57 call sites" is really **48** and that wrong
  number is now in `panel.js:156`, `panel.js:173` and `flow.js:1181`; `panel.js:173` still says
  liveRender "stays synchronous"; nine awaited sites, not eight.
- **`.pp4RcSwap` has no `:focus` rule at all**, so "keep it on the button" is satisfied by the front
  card's ring, not the circle's — keyboard focus on the swap button is invisible.
- **the coin-flip ruling (H):** *"I read it and I agree with the CTO"* — `DECISIONS.md:518-522` is
  scoped word for word to the flip's SOUND. **No conflict.**
- **(I) confirmed:** nothing was written to `.claude/memory/`, `docs/` or `.planning/` except six
  PNGs, so his four rulings and all twelve notes *"exist nowhere but this conversation."*
- **the sail-length retraction is CORRECT** (`storyboard.js:161`). *"The CTO was right to retract,
  and Wyatt was right to push."*
- **§5 (delegation):** *"I cannot answer this one honestly"* — no access to the CTO's thread. Not
  checked, no evidence found.

**Where the CTO disputes it, on the record:** the updated playtest artifact **was** produced and
published (same URL, twice). The CEO is repo-read-only and an Artifact is not a repo file, so it
could not see it — a scope limit of the review, not a miss in the work. Everything else above is
accepted.

**No previous verdict existed.** This file did not exist before today, so the recurrence check
could not run — the CEO named that as a finding about the process, and it is.
