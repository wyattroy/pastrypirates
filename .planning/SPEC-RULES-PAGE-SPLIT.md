# The rules page — the content split, for Wyatt to approve

*Written by the watch of 2026-09-02 6:30 PM ET for `INBOX-20260902T190723Z`. **No code was
written**, at his instruction: "Do not write any code this session. Come back with a recommendation
and let me approve it." The **five** questions this document recommends against are rows in
`.planning/CHART.md`'s `BLOCKED ON WYATT`, which his page renders as **Your Call** — the four he
asked for, plus a fifth that only bites once the Credits page ships.*

---

## THE FINDING THAT CHANGES THE QUESTION — you do not have two accounts of the rules. You have one correct one and one that is wrong.

He framed this as *"two overlapping accounts of the rules"*, and the honest answer after reading
both is that they do not overlap the way that implies. **The in-game modal is right. The public
About page is wrong in three places, and one of them teaches an action the game does not have.**

| what `about.html` tells a stranger | what the game actually does | where that is measured |
|---|---|---|
| your turn is dock / attack / trade / **fish** for a quick coin | the four actions are **Dock · Attack · Trade · Muse**. There is no fish. | `src/ui/flow.js:2310, 2318, 2322, 2416` — the four `opts.push` calls that build the action buttons. Fishing was deleted outright, not disabled: `src/ui/flow.js:301`, *"v2 rule 3: fishing is gone entirely."* |
| **dock and flip a coin for a crate** | the flip pays **coins**; buying a crate is a separate step at a price that rises as the island empties | the modal's own `data-rule="dockHeads"` / `dockTails"` / `crateBase"` spans, `index.html:2835-2836` |
| get home first and **"declare victory: first baker home wins"**; the bake-off is what happens **if two captains arrive the same round** | docking home lights your ovens **that turn**, and you win by **naming your shuffled crates back in the recipe's own order, from memory**. Every captain bakes. Two on the same day bake **together** — no contest. | `BAKEOFF_ENABLED = true`, `src/shared/index.js:466`; the rules text at `index.html:2846-2850` |
| the wind **"sets your sailing budget for the turn — cheap with it, dear against it"** | **sailing is FREE.** The wind caps your RANGE, it does not charge you: move up to the sail range, and the whole move is capped the moment your route bites into the wind. | `about.html:181-182` against `index.html:2833`, *"Sailing is **free**"* |

**So a stranger who arrives from Google reads the wrong rules, and a player who opens the modal
reads the right ones.** That is backwards, and it is a stronger argument for giving the rules a real
page than the SEO one he opened with.

⚠ **THE FOURTH ROW WAS FOUND BY THE CEO, NOT BY THIS WATCH, and this document said "three places"
until it was.** Worth recording: the first three were caught by comparing About against the modal,
and the fourth needed somebody comparing About against the modal *again*, cold. **The count is not
the point — the point is that nobody has ever checked this page against the game it describes**,
which is the argument for deleting the section rather than correcting it, one more time.

⚠ **The word counts in his note (765 / 1,665) are HIS, taken from an earlier session's count. This
watch did not re-count them** — the shell here refused every counting command it tried, and the
decision does not turn on the exact figures. Flagged rather than quietly repeated as measured.

---

## THE RECOMMENDATION, IN ONE PARAGRAPH

**Give the modal's text a URL of its own at `/rules.html`, and take the rules OUT of About rather
than adding a third account.** About stops teaching the game and goes back to being what it is — the
page that makes someone want to play — keeping its hero, its screenshots and the captains' quotes,
with two or three sentences of flavour and a link to the rules. **The in-game modal keeps the full
text and stays the source it is generated from.** That leaves **two** pages where there are two
today, one of them newly correct, and nothing competing for the same search.

---

## THE FOUR QUESTIONS, AND WHY EACH IS RECOMMENDED THE WAY IT IS

### Q1 — which page becomes THE rules page?

**Recommended: a new `/rules.html`, carrying the modal's text.**

The alternative he raised himself — grow About's "How it plays" into the rules page — costs more
than it looks. About is doing a different job: it is the page that sells the game, with the hero
shot, the screenshots and the captains' quotes. Bolting the full rules into it makes one long page
that is neither, and it is the page most likely to be linked from elsewhere, so its own ranking is
worth protecting for "pastry pirates" rather than diluting for "pastry pirates rules".

**And a new page does not create the three-way competition he was worried about, because About's
rules section leaves in the same change.** Two pages, two jobs.

### Q2 — what does About keep?

**Recommended: keep the hero, the screenshots, the captains' quotes and the credits list. Delete
"How it plays" and replace it with two or three sentences plus a link to the rules page.**

Not migrate it — **delete it.** Every specific thing it says is either wrong (the table above) or
said better in the modal. Rewriting it as a short teaser is less work than correcting it, and a
teaser cannot drift because it makes no claims a rule change could falsify.

⚠ **One thing this collides with, flagged rather than assumed:** his next-but-one idea
(`INBOX-20260902T190737Z`) pulls **Credits** out into its own page so he has a URL to send
collaborators. If that ships, does About keep its credits list too, or link out? **This watch's
recommendation is that About keeps a short list and links to the full page** — collaborators reading
About should still see the names — but that is his call, and it is the **fifth** question on his Your
Call card ("once Credits has its own page, does About keep its credits list?"), not Q4 below.

### Q3 — does the in-game modal show the full text, or a short version that links out?

**Recommended: the modal keeps the FULL text, and there is a measured reason it must.**

`src/orchestrator.js:2501-2510`: every amount in the modal is an empty `<b data-rule="…">` span,
filled at open time from `rulesFacts(cfg)` — **the cfg of the voyage being played right now.** A
two-player table genuinely has different crate prices from a four-player one, and the modal tells
each table the truth about itself. A static page can only ever show the four-seat default.

So a modal that linked out would (a) replace live numbers with generic ones, and (b) navigate a
player away from the board mid-turn, on a shot clock. **Both are worse than the thing it saves.**

**The consequence for the page, which is the next item's problem and is named here so it is not
discovered late:** the page is the copy that cannot be live, so its numbers must be **generated**
from the same `rulesFacts` at publish time, never typed. There is no build step in this project, so
that means a script a watch runs and a gate that fails when the page and `rulesFacts` disagree —
exactly the shape of `scripts/qa/rules_page_check.mjs`, which already fails the build on a digit
typed into the modal's prose. **That is the honest answer to his "what makes these two agree?"
question in `INBOX-20260902T190730Z`, and it is answerable without a build step.**

### Q4 — what register does the rules page speak in?

**Recommended: pirate speak — because it IS the modal's text, unchanged.**

The voice boundary (`.claude/CLAUDE.md` §2) puts credits and About in his own plain first-person
voice and everything inside the game world in pirate speak. A rules page sits on the line: a
stranger reads it before playing, but every sentence in it is about the game world.

**The tie-breaker is the one-source constraint, not taste.** If the page speaks plainly and the
modal speaks pirate, they are two texts that must be kept in step by hand — which is the exact
defect he cited rule 23 about. **One register is the price of one source.** If he would rather the
page read plainly, then the modal has to change too, and the answer to that is his.

---

## WHAT THIS WATCH DID NOT DO, DELIBERATELY

- **No code.** His words: *"Do not write any code this session."* `src/`, `index.html` and
  `about.html` are untouched — `git diff` for this item shows only `.planning/`.
- **Did not fix the three wrong sentences in About.** They are a real defect a player can see, and
  fixing them belongs to whichever split he approves — a correction written today could be deleted
  tomorrow by Q2's answer. Filed as a Chart row so it cannot be lost either way.
- **Did not start the rules page.** `INBOX-20260902T190730Z` is explicitly blocked on this approval
  by his own sentence: *"following the content split I approved in the previous session."*
