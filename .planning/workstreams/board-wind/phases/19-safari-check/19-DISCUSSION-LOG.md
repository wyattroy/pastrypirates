# Phase 19: Safari Check - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-31
**Phase:** 19-safari-check (workstream `board-wind`, requirement WIND-00)
**Areas discussed:** How the dots get drawn · Where the prototype runs · How smooth is judged · How the dial is driven

---

## How the dots get drawn

**Tension surfaced before the question:** the roadmap gives two instructions that pull against each
other — *"reuse the pre-baked-tile approach rather than inventing a new animation path"* versus
*"Safari survives up to about this many dots."* A baked picture slides as one sheet and has no dot
count to dial. Both could not fully be true.

| Option | Description | Selected |
|--------|-------------|----------|
| Real individual dots | Test the unknown. Sliding sheets are already proven safe by the shipped storm, so re-testing teaches nothing. Only version where "how many" is a real number. | ✓ |
| Build both, compare in one voyage | Sheet version is near copy-paste from the rain code. Side-by-side comparison, but risks drifting into judging the look — which the roadmap forbids here. | |
| Sliding sheets only | Strictly follow "reuse the proven path". Lowest risk, but learns little and returns pass/fail instead of a number. | |

**User's choice:** Real individual dots
**Notes:** The technical mechanism for each dot (overlay elements vs canvas vs SVG) was explicitly
left to research and planning.

---

## Gate scope — which of Phase 20's three animations get tested

| Option | Description | Selected |
|--------|-------------|----------|
| Dots only | Dots dominate cost — potentially dozens vs a handful of arrows and whirlpools. Keeps the dial measuring one clean variable. | ✓ |
| All three together | Measures the real Phase 20 load, but a stutter wouldn't identify which of the three caused it. | |
| Dots first, add others if dots pass easily | Adaptive, but the second half might not happen inside the afternoon. | |

**User's choice:** Dots only — and asked to write freeform (see below)

---

## Wyatt's motion spec (freeform, volunteered)

> *"the dots should fade in and out as they drift, and if they're moving north, they should jitter
> west and east along their path smoothly as if the breeze is blowing. also there only needs to be
> 5-10 dots on screen at any time"*

**Consequence flagged back:** at 5–10 dots the gate's premise changed. That is fewer moving pieces
than the storm's 4 rain layers already run today, and both fading and sliding are compositor-cheap —
the BUG-01 killers (live gradients, masks, blur) appear nowhere in the spec. The gate's question
therefore shifted from *"how many can Safari carry"* to *"can a never-stopping animation coexist with
narration, ship moves and storms across a whole voyage."* Also noted: this tunes what the roadmap
said would be untuned first guesses — an improvement, but it removes the dial's original purpose.

---

## What the dial measures / what counts as a PASS

| Option | Description | Selected |
|--------|-------------|----------|
| Headroom, then a full voyage | Dial up past 10 to find where Safari hurts, then lock to 10 and play a full game. Cheap now the build is small, still yields the number. | ✓ |
| Full voyage only | Fastest; little doubt 5–10 fits. But no sense of remaining room for Phase 20. | |
| Headroom only | Clean number quickly, but a short dial-twiddling session misses leaks, gradual slowdown, and storm interactions — where the real risk sits. | |

**User's choice:** Headroom, then a full voyage
**Later amendment:** dial range raised to **0–100** at Wyatt's request.

---

## Where the prototype runs

**Findings surfaced first:** `lab.html` is a 121KB pre-refactor standalone copy that does not load
`src/ui/board.js` — it would measure different code and could not answer the full-game question. The
game has no URL-parameter handling anywhere today. Safari caches ES modules aggressively and `?cb=`
does not clear them, so reload-to-change-a-setting risks measuring the previous build.

| Option | Description | Selected |
|--------|-------------|----------|
| Real game, behind an off switch | Only setup that literally proves "a full game plays smoothly". On a pass, Phase 20 starts from code already in the right file. | ✓ |
| Separate page loading the same modules | Keeps index.html untouched, but a second page to maintain and the work still has to move into board.js later. | |
| Existing lab.html | Zero risk, but measures a different board and cannot answer the full-game question. Advised against. | |

**User's choice:** Real game, behind an off switch

---

## What happens to the code after the verdict

**Tension surfaced:** the roadmap says this phase *"ships nothing final"*, but also warns that
staleness — not conflicts — is what has actually cost this project time (a branch once drifted 34
commits behind and made a shipped milestone look unfinished).

| Option | Description | Selected |
|--------|-------------|----------|
| Merge it, switched off | Lands but never runs; nothing visible, no cost to a player. Honours "ships nothing final" where it matters, and merges back promptly. | ✓ |
| Hold on the branch until Phase 20 | Nothing extra reaches the live site, but the branch sits through all of Phase 20 — the exact drift the roadmap warns about. | |
| Merge, then strip the switch out | Tidiest live site, but throws away the code the roadmap says should become Phase 20's starting point. | |

**User's choice:** Merge it, switched off

---

## How smooth is judged

| Option | Description | Selected |
|--------|-------------|----------|
| Live number + end-of-voyage summary | Readout while playing, worst dips recorded, one plain summary at the end. Catches slow decay an eye would miss. | ✓ |
| Live readout only | Simplest, but a bad moment late in a voyage could slip past while deciding a move. | |
| Eye alone, no instrument | Zero build, but "survives up to about this many" stays a feeling and Phase 20 gets no budget. | |

**User's choice:** Live number + end-of-voyage summary
**Notes:** Safari's built-in developer tools were ruled out — they need the Develop menu enabled and
Web Inspector driven live, which is friction while also playing a game. Precedent cited: the v1.0
storm retune was settled with measured numbers (0.818s/200.5px vs 0.534s/264.7px).

---

## How the dial is driven

| Option | Description | Selected |
|--------|-------------|----------|
| On-screen control beside the readout | Nothing to memorise; wind it up mid-voyage and watch the number react in one glance. Literally the "dial" the requirement asks for. | ✓ |
| Keyboard keys | No clutter, fast to nudge, but invisible and risks clashing with existing game input. | |
| Setting in the web address | Each run unambiguous, but every change ends the voyage and reloads — straight into the Safari caching trap. Advised against. | |

**User's choice:** On-screen control beside the readout

---

## Mobile scope and the fail bar

**Raised as a remaining gap** alongside "what counts as a FAIL". Wyatt answered both at once:
*"allow me to increaSE number of dots up to 100, and also see how it'll perform on mobile"*.

**Practical wrinkle flagged:** this is branch code and is not on playpastrypirates.com, so the phone
reaches it via the local test server over wifi (bound beyond localhost, at the Mac's network
address). The Safari module-cache trap bites harder on a phone, which cannot easily be cleared — a
fresh port per build is the reliable answer.

| Option | Description | Selected |
|--------|-------------|----------|
| Phone must pass too | Both hold at 10 dots or the gate fails. The phone's ceiling — not the Mac's — becomes Phase 20's budget. | ✓ |
| Mac decides, phone informational | Keeps the phase moving if the phone is marginal, but Phase 20 inherits a problem rather than a decision. | |
| Phone sets a separate lower budget | Most realistic, but Phase 20 then carries two settings instead of one. | |

**User's choice:** Phone must pass too

---

## Claude's Discretion

- The technical mechanism for each dot — how a dot is represented and moved. A leaning was recorded
  (small elements moved with compositor-only transforms and opacity, as the closest safe extension of
  the proven BUG-01 fix) but explicitly as a leaning for research to confirm or overturn, not a bind.
- Placement, styling and wording of the readout and dial panel.
- Whether the dot sprite is a baked image or a drawn shape.
- How the headroom run's stepping is structured (increments, dwell time per step).

## Deferred Ideas

- Rim-arrow flow (WIND-02) and whirlpool rotation (WIND-03) — excluded from the gate, go straight
  into Phase 20.
- Tuning how the dots look — Phase 20's job; the roadmap is explicit that nobody judges the look here.
- Any per-device dot-count strategy (e.g. fewer dots on small screens) — a Phase 20 design decision.
  D-09 chose a single shared budget set by the phone rather than two separate budgets.
