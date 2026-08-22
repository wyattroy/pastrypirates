# What to playtest — morning of 2026-08-22

**Build to look for: `2026-08-22b`.** On a phone it is in the ☰ menu; on desktop the ☰ is gone and
the stamp sits at the bottom of the new menu block under the captains box. **If it shows an older letter, stop and say so** — there
is no build step and nothing is ever a cache, so an old stamp means the work is not on `main`.

**Where:** `playpastrypirates.com/4` — the same place you always playtest.

> **How to use this.** Each line is a thing to LOOK at, with what "right" means. They are grouped by
> where you will be when you can see them, not by what was changed, so you can just play and glance
> down. **Anything not on this list is fair game too** — the list is what I claim I fixed, not a
> limit on what you should notice.

---

## FIRST — the phone, because that is where tonight's work went

40 of the 53 things the automatic reviewer disliked yesterday were on the phone. The four biggest
causes are fixed. **Play a solo voyage on your phone and watch for these.**

| # | Look at | What right looks like | Why it's on the list |
|---|---|---|---|
| 1 | **Any long question** — a trade ask, a battle prompt | The whole white box is on screen. No word cut off at the right edge. | This alone was 17 of the 40. The box used to choose its position while it was still small, then grow off the screen. |
| 2 | **"Tap and hold the sea to reveal the board"** | It never sits on top of a button. | It was drawing itself across "Stay put" and the ✓ button. |
| 3 | **A sail prompt with "Stay put" showing** | Every yellow square you could sail to is tappable — none hidden under the button. | "Stay put" was covering nine sail squares in one measured game. A move you cannot tap. |
| 4 | **The recipe picker on Day 1** | Solid cards. No "CAPTAINS" or captain names showing through them. | The whole prompt layer was slightly see-through. |
| 5 | **Top-left corner, during a prompt with a ‹ back button** | No grey half-circle poking above "DAY N". | The back circle had no floor and slid up behind the ribbon. |

**Also on phone, and worth telling me if it still looks wrong:** the empty grey band under CAPTAINS
that the reviewer kept flagging. You said you never see it, and you were right — the test was
emulating a phone with no browser bar. Nothing in the game changed for it.

---

## SECOND — your afternoon list (Group E)

**Narration timing — the one thing to judge by feel, not by looking.** You asked for 15% faster
reading, applied to everything. Play a voyage and see whether it now moves at your pace.

| Line length | Was on screen | Now |
|---|---|---|
| Short ("Blown into the trade winds!") | 2.9 s | **2.1 s** |
| Medium (~78 characters) | 3.4 s | **4.3 s** |
| Long — the ceiling | 5.3 s | **4.6 s** |

Short lines give back about three quarters of a second each. Medium lines got *longer*, and that is
the curve you picked — you chose the two anchor points yourself and the middle band follows from
them. If the medium ones now drag, that is the number to tell me about.

| # | Look at | What right looks like |
|---|---|---|
| 6 | **Any narration bubble** | It never pops up and vanishes in the same instant. One that used to be marked for removal **1 millisecond after it appeared** now stays 4.3 s. |
| 7 | **A dock coin flip** | The "flips TAILS" line is readable. It used to spend 40% of its life underneath the flip veil, where you could not see it. |
| 8 | **A storm** | **One** sentence summarising the whole storm, not a line per captain. Captains stopped by another ship are named in it — 82 of them used to be missing from their own summary. |
| 9 | **The black market**, first time a shelf runs dry | The ceremony appears even when a **bot** empties the shelf. A bot takes the first dry shelf in 76% of solo voyages, so three players in four have never seen this. |
| 10 | **The Dock petal** | Ingredient picture, the word Dock, and a *spinning* coin — no number, because the price has not landed yet. No anchor. |
| 11 | **Buying a crate** | The sound and the crate pop land **on your click**, not after the narration has finished. |
| 12 | **The recipe card** | Option C as you picked it: the gradient runs right up to the line under the title with no hard edge, and the picture is not cramped against the description. |

### One I do NOT claim is fixed — please judge it yourself

**Your item 1, "the prompt buttons are hard to notice."** The sail-square pulse was added to the
prompt buttons as you asked. But when it was measured, the action menu was drawing as a **centred
card**, not the radial fan — and those buttons *already* pulsed, near-identically. So the change
helps the flat button rows that had no pulse at all, and probably does not answer your actual
complaint. **Making them louder is your taste call.** Tell me how much louder.

### Not established, so not claimed

- **The guest's wind pill in a crew game.** The two-browser run did not happen — the lobby would not
  start without more captains. So nothing is proven about the guest side of that.
- **A Buy pill that overhung the right edge by 63px** on an older build does not reproduce now. The
  wider desktop column is probably hiding it rather than fixing it; expect it back at a narrow width.

---

## THIRD — the seven things you typed at me last night (Group F)

| # | Look at | What right looks like | The number behind it |
|---|---|---|---|
| 13 | **The action circles on a phone** | Clear air between them. They used to read as one packed slab. | ~3px apart → **~15px**. The gap is now a quarter of the circle's own size, so it stays right if the circles ever change. |
| 14 | **A prompt with your boat in a corner** | The whole cluster moves out into open water rather than stacking on itself. | It warns in the log if it ever still has to pile, so a silent squeeze can't pass as a pass. |
| 15 | **Pass** | The **bottom** circle, every time, whichever way the fan points. | Two of five fan directions used to put crates *below* Pass. |
| 16 | **The italic "why is this greyed out" line** | Beside the choices, never lying across them. | It was 23px deep across four circles. |
| 17 | **Every coin flip** — dock and battle | All take the same beat. | **1.5s, six flips measured, all within 100ms.** Before: dock 335ms, battle 648ms — a 315ms spread. |
| 18 | **The wind and forecast, on tablet and desktop** | Legible in the header row, in front of the dark gradient. The ⏩ can no longer be drawn on top of them. | Your screenshot — this and the "hidden behind the gradient" item were **one** fault. |
| 19 | **A tall window** (your tablet shape) | The captains box is a card with air under it, not a slab flush to the bottom edge. | It had 84px of dead cream inside it. |
| 20 | **Desktop menu** | The menu items sit under the captains box; no hamburger. The turn-clock row is gone from the menu everywhere — the ⏱ chip in the header row is the only control for it. | |
| 21 | **Phone: end of a voyage** | **"Play again!" is on screen.** | It was 212px below the fold — you had to know to scroll. |
| 22 | **Phone: docking** | "Docking at…" appears **once**. | It was printing twice, one copy hidden behind the flip coin. |
| 23 | **Phone: the captains list** | The fourth captain is not sliced by the bottom edge. | |
| 24 | **Phone: the recipe picker** | The two cards' ingredient lists line up even when one title wraps to three lines. | |
| 25 | **Phone: the recipe picker, first screen of the game** | **Both recipe cards fit on screen** — you can see all five ingredients and the bottom edge of each card. | They used to be cut off mid-list by the bottom of the screen, with no cue that it scrolled. Cards ended 1px from the edge; now 12px clear. |

**One of your five did not reproduce.** The faint **"hov."** text on a board tile: every text node
and every attribute in the document was walked at phone size, and it is in neither — nor anywhere in
the source. Reported with the measurement rather than counted as fixed. If you see it again, a
screenshot of it would settle it.

## FOURTH — two off your twenty-two (Group D): items 6 and 16

**Item 6 — the Bake-Off card.** You asked that it not come back once you have attempted your bake.
What was actually happening was worse: **it never left.** Once your ovens lit, the card stayed on
screen through your verdict, through the whole of the next day's play, and straight into the next
attempt — with the narration stacking up unreadably behind it and the board dimmed the entire time.

| Look at | What right looks like |
|---|---|
| **The moment your bake is scored** | You get a few seconds to read "N of 5 in place…" — longer if the sentence is longer — and then **the card goes**, and you are back on the board. |
| **The rest of that day** | You can see the board, the boats and the narration. Nothing is behind a spent card. |
| **The next day, if you missed some** | A **fresh** Bake-Off card arrives for attempt 2. That is a new prompt, not the old one still sitting there. |

*If you play a crew game where two captains bake on the same day, that is the case this was for —
you should be able to watch theirs happen.* **See the note in the record below before you try it.**

**Item 16 — you keep the name you type.** Until tonight the join screen wrote whatever you typed
straight onto the seat with no check at all, so two captains could end up sharing a name.

| Look at | What right looks like |
|---|---|
| **Join a crew and type a name a REAL person at the table already has** | A red line appears **under the name box** — *"Arrgh — a captain aboard already sails as X. Pick another name, matey."* **No popup.** Your typed name stays in the box, you edit it, and Join works. |
| **Type a name one of the BOT captains has** (Davy Scones, Crustbeard, Dough Hook, Flaky Jack) | **You get it.** You are let straight in under that name, and the bot quietly takes a different one. Nobody at the table shares a name. |
| **"Change yer name" in the lobby** | Same rule, same words. If a real person has that name, the name box reopens with the red line under it. |

---

## FIFTH — a whole voyage in each mode

The bar is **complete voyages to the end-of-voyage card**, not stretches of play — that bar is what
found a nine-day-old softlock the first night it was used.

- [ ] **Solo** to the end card.
- [ ] **Pass-and-play** to the end card.
- [ ] **A crew game** — two devices or two browsers — to the end card, watching both screens.

**One specific thing to check in the crew game, because nobody has been able to prove it:** the
**guest** should draw the wind pill, the clock chip and the day counter exactly like the host. This
is requirement PAR-02. It was reported broken once, then re-measured and found fine, and last
night's attempt to re-establish it never got a lobby started — so it is currently *unproven*, not
*passing*. If your guest screen is missing any of those three, that is a real finding.

**In a crew game, the one thing worth staring at:** the host's screen and the guest's screen should
be showing you the same game. Different wording for the same moment, one side stuck on a prompt the
other has finished, two cameras pointed at different places — those are the class of fault this
phase exists to kill, and they are only visible with both screens side by side.

---

## Things I know are still wrong, so you do not have to report them

**Your call, not a bug:**
1. **The prompt buttons may still be too quiet (your item 1).** The pulse shipped and it does reach
   the real radial petals — an earlier reading that said otherwise turned out to be measuring a
   ceremony card, which is a different screen. But whether it is *loud enough* is taste. Tell me how
   much louder and I will do it in one pass.

**Known, measured, deliberately not touched:**
2. **Two gate failures at tablet width, at the opening only.** They fail identically on the OLD
   build, so they are not from last night. The cause is measured: the check compares the captains
   card against the camera strip rather than the painted board, and at full zoom the square
   letterboxes so the strip runs 91px past the art. The card is sitting over empty void, not over
   the board. **The assertion was deliberately not weakened to make it green** — that belongs with
   the camera work.
3. **A Buy pill that overhung the right edge by 63px** on an older build does not reproduce now.
   The wider desktop column is probably hiding it rather than fixing it. Expect it back at a narrow
   width.
4. **A prompt that has a slider but no helper line** has not been posed, so the slider is not yet
   proven to dodge the button fan the way the helper line now does.

**Suspected but NOT measured — read from the code only, so do not treat it as fact:**
5. **A guest's Bake-Off may be played on the host's screen.** That code has no networked path and
   says so in its own comment, giving the reason "this is all built for v2 which doesn't have
   multiplayer" — true when written, false since Phase 2. **So do not judge item 6 (the Bake-Off
   card) by a crew game** — judge it solo or pass-and-play. Settling it properly is an architecture
   decision that is yours; the cheap way in has been written down so nobody pays to find it twice.

**Not established, so not claimed:**
6. **The guest's wind pill, clock chip and day counter in a crew game (PAR-02).** Pinned in the crew
   section above as something for you to look at.

**A guest's Bake-Off is played on the HOST's screen, not theirs.** Found while fixing item 6, by
reading the code — **not measured, so treat it as a strong suspicion rather than a fact.** The
bake-off has no networked path at all: the function that runs it says so in its own comment, and the
reason given is *"this is all built for v2 which doesn't have multiplayer"* — which was true when it
was written and stopped being true when multiplayer came back in Phase 2. If that reading is right,
then in a crew game the host is shown the guest's bench and asked to play it, while the guest waits
on a single line of narration.

**So do not judge item 6 by a crew game.** Judge it solo or pass-and-play, where it is fixed and
proven. If you do reach a crew bake-off and something like this happens, it is this, it is
pre-existing, and it is not something Group D touched.

*(The rest filled in at the end of the night.)*

---

## The record

**Build `2026-08-22b`**, live at `playpastrypirates.com/4`. It carries Groups E, F and D plus the
recipe-picker fix.

**How well was it checked?** Honestly: **less than I wanted.** The four-mode gate did not complete.

| | |
|---|---|
| solo-desktop | complete voyage to the end card, day 13 |
| solo-phone | **17 days, clean** — 3 structural failures, all at the recipe picker, now fixed |
| passplay-phone | reached day 19 |
| crew-desktop | **never ran** |
| vision judge | **produced nothing** — see below |

**Why the vision half is missing, and it needs YOU:** the `claude` CLI on this machine has an
expired login — *"OAuth session expired and could not be refreshed"*. All 67 judge calls got that
back instead of a verdict. Re-authenticating in a terminal fixes it; I cannot do it for you.

**And the gate itself misbehaved:** it treated the auth failure as 67 bad replies rather than
stopping on the first, then hung instead of exiting and left ten headless Chromes running at 47% of
your CPU for three hours. Killed. The gate needs a fix so it cannot do that again.

**One thing that did NOT reproduce:** in the failed run, solo-phone froze at day 5. On a clean
re-run it played 17 days steadily. Most likely the driver or the machine under load, not the game —
but recorded as did-not-reproduce rather than proven-fine.
