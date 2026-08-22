# What to playtest — morning of 2026-08-22

**Build to look for:** the stamp in the ☰ menu must read **`v4 · build 2026-08-21…`** with the FINAL
letter recorded at the bottom of this file. **If it shows an older letter, stop and say so** — there
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

## THIRD — a whole voyage in each mode

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

*(Filled in at the end of the night.)*

---

## The record

*(Build stamp, what landed, and the numbers — filled in at the end of the night.)*
