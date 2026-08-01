# Phase 22: The Front Door - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-31
**Phase:** 22-the-front-door
**Workstream:** front-door
**Areas discussed:** The naming moment, What the About page IS, Where the rules live, The screenshot

---

## The naming moment

### Q1 — What happens to the welcome-screen name box?

| Option | Description | Selected |
|--------|-------------|----------|
| Remove it entirely | The pop-up becomes the only place you name yourself. Kills the actual bug — people don't see the box and end up as a captain they never chose. | ✓ |
| Keep it as a shortcut | Box stays and pre-fills the pop-up. Two naming spots; pop-up becomes a speed bump for anyone who found the box. | |
| Keep it, but skip the pop-up if filled | Rewards people who noticed the box, catches everyone who didn't — but creates two different first-time experiences. | |

**User's choice:** Remove it entirely
**Notes:** Resolves the open question the source todo flagged as Wyatt's call.

### Q2 — What does dismissing the pop-up mean?

| Option | Description | Selected |
|--------|-------------|----------|
| Closing = confirming | Sail as the pre-filled captain. Never blocked, never nameless. The name was on screen when dismissed. | ✓ |
| Closing cancels | Back to the mode cards. Nothing happens by accident, but a misclick outside bounces you backwards. | |
| It can't be closed | Only the confirm button continues. Most forceful; a pop-up with no exit reads as broken. | |

**User's choice:** Closing = confirming

### Q3 — How does "Join a Crew" sequence, given it already asks for a code?

| Option | Description | Selected |
|--------|-------------|----------|
| One screen: name + code together | Single combined screen for Join; plain pop-up for the other three. Saves a step. | |
| Name first, then code | Same pop-up on all four cards, then Join continues to its code screen. Most consistent, one modal with four callers. | ✓ |
| Code first, then name | Lowest-risk edit to the existing join path, but asks the name after they've committed to a room. | |

**User's choice:** Name first, then code
**Notes:** Consistency chosen over saving Join players a click.

### Q4 — What is the pop-up pre-filled with?

| Option | Description | Selected |
|--------|-------------|----------|
| Last-used name, remembered | First visit suggests a pirate name; after that it offers back what you chose. Browser storage already in use. | ✓ |
| A fresh suggested name each time | Stores nothing, but repeat players retype every visit. | |
| Empty, with grey placeholder | Looks most invitingly fillable — but re-creates the exact hole being fixed. | |

**User's choice:** Last-used name, remembered

---

## What the About page IS

### Q1 — Real page or modal?

| Option | Description | Selected |
|--------|-------------|----------|
| A real separate page — about.html | Own URL, added to sitemap.xml. The option that actually serves META-01, since Google indexes addresses. | ✓ |
| Another pop-up, like How to play | Zero new files, guaranteed consistent styling — but no new address for Google and a hidden image is a weak preview candidate. | |
| A real page reusing the game's look | Same as option 1 but sharing index.html's stylesheet — collides with Phase 18, which is editing that CSS block. | |

**User's choice:** A real separate page — about.html

### Q2 — Where does the About link go?

| Option | Description | Selected |
|--------|-------------|----------|
| Both welcome screen and footer | Same one-line link twice. Works for a stranger arriving from Google and for someone mid-voyage. | ✓ |
| Welcome screen only | Satisfies ABOUT-02 exactly and keeps the crowded footer at six buttons. No way back once in a game. | |
| Footer only | Consistent with the existing six — but the footer is blurred behind the welcome overlay, so new visitors never find it. | |

**User's choice:** Both welcome screen and footer
**Notes:** Surfaced during discussion — `#footerRow` lives inside `#game`, which is `display:none` until a game starts. This made footer-only effectively non-compliant with ABOUT-02.

### Q3 — How does about.html get styled, given Phase 18 owns the CSS block?

| Option | Description | Selected |
|--------|-------------|----------|
| Its own small stylesheet | Touches nothing Phase 18 touches. Honest duplication, but it's a page of text, not a second game screen. | ✓ |
| Pull shared styles into a real .css file | Tidiest end state, can't drift — but rewrites the block Phase 18 is actively editing. | |
| Copy the whole style block | No collision, instant visual match — but ~700 lines of mostly board-game styling that drifts silently. | |

**User's choice:** Its own small stylesheet

---

## Where the rules live

### Q1 — How does the About page handle the rules?

| Option | Description | Selected |
|--------|-------------|----------|
| Deliberately different, written for strangers | Short "what this game is" for someone deciding whether to play; modal stays as in-game reference. Text is in the page source, which is what Google reads. | ✓ |
| One shared source, loaded into both | Can never drift — but with no build step the fetch keeps the rules out of about.html's crawlable source, and breaks on file://. | |
| Link to the game's How to play instead | Least new writing, nothing can drift — but ABOUT-01 asks for a page that contains the rules. | |

**User's choice:** Deliberately different, written for strangers
**Notes:** Discussion established the rules exist in **four** places, not the two the requirement assumed: the How-To-Play modal, `RULES.md`, `Rules_boardgame.md`, and `.planning/how-to-play-pastry-pirates.md`.

### Q2 — Who writes the About copy?

| Option | Description | Selected |
|--------|-------------|----------|
| Claude drafts, Wyatt approves before ship | Full draft to react to, plus a hard stop before completion. Matches milestone constraint #3. | ✓ |
| Wyatt writes, Claude leaves the space | Voice is exactly his — but the phase stalls on writing time, and a half-finished front door is worse than none. | |
| Claude writes and it ships | Fastest, but the copy gate exists precisely because shipped wording drifted from approved wording. | |

**User's choice:** Claude drafts, Wyatt approves before ship

---

## The screenshot

### Q1 — What does it show?

| Option | Description | Selected |
|--------|-------------|----------|
| A busy mid-game board | Ships across the islands, crates, wind spinner, holds filling. Answers "what IS this?" in one glance. | ✓ |
| The end-of-voyage celebration | Most joyful frame — but shows the last ten seconds and spoils the payoff. | |
| A composed, arranged shot | Prettiest, most work, and can look subtly wrong to anyone who knows the game. | |

**User's choice:** A busy mid-game board

### Q2 — Who captures it?

| Option | Description | Selected |
|--------|-------------|----------|
| Claude captures candidates, Wyatt picks | Drive a real game per docs/DRIVING-THE-GAME.md, grab several frames, Wyatt chooses. | ✓ |
| Wyatt takes it | Guaranteed a moment he likes, but costs a play session and the phase waits. | |
| Claude captures and chooses | Fastest, but it's the most visible thing the phase produces. | |

**User's choice:** Claude captures candidates, Wyatt picks

---

## Claude's Discretion

Offered as a possible fifth area; Wyatt chose to proceed without discussing them, leaving them to
the planner and executor:

- Whether the About page's credits repeat the Credits modal verbatim or are rewritten for the page.
- Whether `about.html` carries its own `og:` / `twitter:` social-preview tags.
- The saved size and format of the screenshot.
- Exact wording of the modal's prompt and confirm button (still subject to the D-09 approval gate),
  and the precise placement of the About link under the mode cards.

## Deferred Ideas

- Extracting `index.html`'s inline CSS into a shared stylesheet — the real fix for the duplication
  D-07 accepts, but it must wait until v1.3's concurrent workstreams close.
- Consolidating the four existing copies of the rules.
- META-03 (Google Search Console verification) — not code; Wyatt's own action, slow to take effect.
