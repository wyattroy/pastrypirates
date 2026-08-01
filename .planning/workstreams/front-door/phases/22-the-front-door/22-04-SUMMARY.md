---
phase: 22-the-front-door
plan: 04
subsystem: ui
tags: [about-page, screenshot, seo, static-html]

requires:
  - phase: 22-the-front-door (plan 02)
    provides: about.html hero block with placeholder src/width/height/alt and the TODO(D-11) marker
provides:
  - "assets/about-screenshot.jpg installed as the About-page hero image, wired with its real intrinsic dimensions"
  - "assets/about-candidates/ (the five Task-1 captured candidates) deleted — superseded by Wyatt's direct choice"
  - "TODO(D-11) marker removed from about.html"
affects: [front-door, about-page, meta-01]

tech-stack:
  added: []
  patterns: ["intrinsic width/height attributes copied verbatim from sips output, never scaled or rounded"]

key-files:
  created: []
  modified:
    - about.html
    - assets/about-screenshot.jpg
    - assets/about-candidates/ (deleted)

key-decisions:
  - "Wyatt supplied assets/about-screenshot.jpg directly (1320x888) rather than choosing among the five 1200x663 candidates Task 1 captured — see Deviations."

requirements-completed: [ABOUT-01, META-01]

coverage:
  - id: D1
    description: "About page hero displays a real mid-game board screenshot at its true intrinsic dimensions (1320x888), with no placeholder or TODO(D-11) marker remaining"
    requirement: ABOUT-01
    verification:
      - kind: other
        ref: "grep -c 'assets/about-screenshot.jpg' about.html == 1; grep -c 'TODO(D-11)' about.html == 0; sips -g pixelWidth -g pixelHeight assets/about-screenshot.jpg == 1320x888 matching the img width/height attrs"
        status: pass
    human_judgment: false
  - id: D2
    description: "The shipped screenshot is a real mid-game frame Wyatt approved, not staged and not the end-of-voyage screen"
    requirement: ABOUT-01
    verification: []
    human_judgment: true
    rationale: "Whether the specific frame is genuinely representative and not staged is a visual/context judgment only Wyatt can make; he supplied the file directly as part of this session's review."

duration: 20min
completed: 2026-08-01
status: complete
---

# Phase 22 Plan 04: About-page hero screenshot Summary

**Installed Wyatt's chosen 1320x888 mid-game board capture as the About-page hero, replacing the og-image.jpg placeholder and removing the TODO(D-11) sign-off marker.**

## Performance

- **Duration:** ~20 min (within a combined session covering both 22-04 Task 3 and all of 22-05)
- **Tasks:** 1 (Task 3 — install chosen frame; Tasks 1-2 of this plan were completed in a prior session, commit `c9e9054`)
- **Files modified:** 2 (`about.html`, plus the asset swap)

## Accomplishments
- `assets/about-screenshot.jpg` (1320x888, ~1.49:1) is the About-page hero, `src`/`width`/`height` all pointing at the real file
- Hero `alt` text rewritten to describe this specific frame: ships scattered among islands, cargo crates on docks, wind compass visible
- The screenshot sign-off marker (`TODO(D-11)`) is gone
- `assets/about-candidates/` (the five 1200x663 frames captured in the prior session, `c9e9054`) deleted — Wyatt's own supplied image superseded that candidate set entirely
- `og:image`/`twitter:image` left untouched, still pointing at `og-image.jpg`, per the plan's explicit instruction

## Task Commits

Combined into the umbrella commit for this session (see plan 22-05's summary for the full commit list) since both plans' remaining work landed together:

1. **Task 3: Install the chosen frame and remove the placeholder** — `b2395ec` (`feat(22-04,22-05): ship the About page with Wyatt's reviewed images and copy`)

## Files Created/Modified
- `about.html` - hero `<img>` now points at `assets/about-screenshot.jpg` with `width="1320" height="888"` and frame-specific alt text; `TODO(D-11)` comment removed
- `assets/about-screenshot.jpg` - the shipped hero image (new)
- `assets/about-candidates/` - deleted (5 files: `candidate-1.jpg` … `candidate-5.jpg`)

## Decisions Made
- Wyatt supplied the shipped screenshot directly rather than choosing among Task 1's five captured candidates — see Deviations below for the full reasoning and its effect on the plan's must-have dimensions.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 4 - already resolved by direct human instruction] Wyatt supplied a different frame than any of the five captured candidates, at a different aspect ratio**

- **Found during:** Task 3 (install chosen frame)
- **Issue:** Plan 22-04's Task 1 (prior session, `c9e9054`) captured five candidates normalized to 1200x663 (the ~1.81:1 og-image.jpg reference ratio) for Task 2's checkpoint. Wyatt did not pick among those five; he instead supplied `assets/about-screenshot.jpg` directly at 1320x888 (~1.49:1) — a different frame and a different aspect ratio than the plan's must-have `"the shipped screenshot is at least 1200 pixels wide... displayed at its real intrinsic dimensions of roughly 1.81:1, matching og-image.jpg"`.
- **Resolution:** This is not an auto-fix — it is Wyatt exercising the D-11 approval gate the plan built for exactly this purpose ("Claude captures candidates... Wyatt picks the one that ships" — nothing in D-11 requires the pick come from the captured set). His supplied file satisfies the width floor (1320 ≥ 1200) and every other must-have except the specific 1.81:1 ratio figure, which the plan itself flagged as provisional ("Unless D-11's chosen frame dictates otherwise" — UI-SPEC Implementation Note 4). Installed as directed; the five captured candidates are now superseded and were deleted along with `assets/about-candidates/`.
- **Files modified:** `about.html`, `assets/about-screenshot.jpg`, `assets/about-candidates/` (removed)
- **Verification:** `sips -g pixelWidth -g pixelHeight assets/about-screenshot.jpg` reports 1320x888, matching the `width`/`height` attributes in `about.html` exactly; width floor (≥1200) satisfied.
- **Committed in:** `b2395ec`

---

**Total deviations:** 1 (a human decision superseding a plan default, not a code defect — recorded per Rule 4's spirit even though no question was needed since Wyatt supplied the resolution directly)
**Impact on plan:** The reference aspect ratio in the plan's must-haves (1.81:1) does not hold for the shipped asset; the width-floor and attribute-accuracy must-haves do. This is a deliberate, approved substitution, not scope creep.

## Issues Encountered
None beyond the deviation above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- META-01's remaining half (an in-page image for Google to promote) is now shipped; META-03 (Google re-crawl) remains Wyatt's own Search Console action, outside this phase's reach.
- ABOUT-01's screenshot requirement is satisfied; no blockers for the rest of Phase 22.

---
*Phase: 22-the-front-door*
*Completed: 2026-08-01*

## Self-Check: PASSED

All created/modified files verified to exist; `assets/about-candidates/` confirmed deleted; commit `b2395ec` verified present in git log.
