---
phase: 22-the-front-door
plan: 02
subsystem: ui
tags: [vanilla-html-css, static-page, seo, ko-fi-embed]

# Dependency graph
requires: []
provides:
  - "about.html — a real, separately-addressable static page at repo root, sibling of index.html, listed in sitemap.xml (D-05)"
  - "about.html's own <style> block (no shared CSS with index.html — D-07)"
  - "aboutKofiBtn/aboutKofiPanel — a duplicated, lazily-mounted Ko-Fi iframe embed with byte-identical sandbox attribute to src/ui/lobby.js:74"
  - "TODO(D-09) and TODO(D-11) greppable placeholder markers for Plan 05 (copy sign-off) and Plan 04 (screenshot pick)"
affects: [22-04, 22-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Standalone static page duplicating index.html's head-block pattern (favicon links, robots meta, og:/twitter: tags) with page-specific values and no Firebase SDK / no JSON-LD"
    - "Lazily-mounted third-party iframe embed, duplicated (not shared) across two files, sandbox attribute kept byte-identical by contract rather than by code reuse"

key-files:
  created: [about.html]
  modified: [sitemap.xml]

key-decisions:
  - "Split the plan's two tasks into two commits even though both write the same new file — Task 1 (head/stylesheet/hero) built and verified first, Task 2 (rules/credits/Ko-Fi/sitemap) added afterward — to honor per-task atomic commits despite about.html being a brand-new file."
  - "Fixed two spacing values that mirrored index.html's non-4-multiple originals (.rules p's 6px paragraph margin, a button's 11px padding) to 8px/12px respectively, to satisfy the plan's own acceptance criterion that every margin/padding/gap in about.html's stylesheet be a multiple of 4 — the plan's read_first prose and its acceptance_criteria briefly disagreed on this one point; the machine-checked gate governed."
  - "Reworded the robots-meta explanatory HTML comment to avoid literally containing the string 'max-image-preview:large' a second time, since the acceptance criterion counts exact occurrences of that string and comments count toward grep matches."
  - "Put the hero <img> tag's attributes on a single line so the alt-text acceptance-criteria regex (which does not span newlines) could match it."

patterns-established:
  - "about.html is the first standalone HTML page in this repo with zero shared JS/CSS with index.html — future static pages should follow the same self-contained head+style+inline-script shape, not the modal/step machinery index.html uses."

requirements-completed: [ABOUT-01]

coverage:
  - id: D1
    description: "about.html exists as a real, separately-addressable page, served as a sibling of index.html, listed in sitemap.xml, and reachable by direct URL (D-05)."
    requirement: "ABOUT-01"
    verification:
      - kind: other
        ref: "curl -sI http://localhost:8543/about.html returns 200; grep -c 'playpastrypirates.com/about.html' sitemap.xml equals 1; python3 xml.dom.minidom parses sitemap.xml"
        status: pass
    human_judgment: false
  - id: D2
    description: "about.html contains all four ABOUT-01 elements: rules, a screenshot, credits, and a Ko-Fi button."
    requirement: "ABOUT-01"
    verification:
      - kind: other
        ref: "grep -c 'id=\"aboutShot\"' / 'id=\"aboutKofiBtn\"' / 'id=\"aboutKofiPanel\"' about.html each equal 1; rules and credits <div class=\"abtCard\"> blocks present"
        status: pass
    human_judgment: false
  - id: D3
    description: "The About page's rules are deliberately distinct copy from the How-To-Play modal, written for a stranger, naming the Isle of Tortuga (never Barbados) — D-08."
    requirement: "ABOUT-01"
    verification:
      - kind: other
        ref: "grep -c 'Isle of Tortuga' about.html >= 1; grep -ci 'barbados' about.html equals 0; direct read comparison against index.html:927-948 confirms no shared sentences"
        status: pass
    human_judgment: false
  - id: D4
    description: "about.html carries its own stylesheet and does not read, import, or modify index.html's inline <style> block (D-07); index.html is untouched by this plan."
    verification:
      - kind: other
        ref: "grep -cE '<link[^>]+stylesheet' about.html equals 0; git status --porcelain index.html empty"
        status: pass
    human_judgment: false
  - id: D5
    description: "The Ko-Fi button opens the widget in-page (not a navigation), contacts ko-fi.com only after the first press, and carries the byte-identical sandbox attribute from src/ui/lobby.js:74."
    requirement: "ABOUT-01"
    verification:
      - kind: other
        ref: "grep -cE '<iframe[^>]+src=' about.html equals 0 (no static src in markup); grep -c 'allow-scripts allow-forms allow-popups allow-same-origin' about.html equals 1, string diffed byte-for-byte against src/ui/lobby.js:74"
        status: pass
    human_judgment: true
    rationale: "Static analysis proves the src is assigned only inside the click handler and the sandbox string matches, but confirming the actual Network-tab behavior (zero requests to ko-fi.com pre-click, panel appears in-page post-click without navigation) needs a live browser pass. No browser-automation tool was available in this execution session — logged to .planning/WINDOWS.md as unrun-verify, entry 6."
  - id: D6
    description: "Populated/loading/error states for the hero screenshot and page layout match UI-SPEC E3/E4: eager load, explicit width/height, full-sentence alt text, two-column hero stacking to reading order at 480px."
    verification:
      - kind: other
        ref: "grep -cE '<img[^>]*loading=' about.html equals 0; grep -c 'width=\"1200\"'/'height=\"663\"' each equal 1; grep -cE '<img[^>]+alt=\"[^\"]{40,}\"' about.html equals 1; max-width:480px breakpoint present"
        status: pass
    human_judgment: true
    rationale: "Grep confirms the required attributes exist; confirming the two-column hero actually renders correctly at 1440px and stacks correctly at 480px (and that an over-long blurb wraps without displacing the screenshot) is a genuine visual check requiring a browser. No browser-automation tool was available — logged to .planning/WINDOWS.md as unrun-verify, entry 5."

# Metrics
duration: ~25min
completed: 2026-08-01
status: complete
---

# Phase 22 Plan 02: About page (ABOUT-01) Summary

**Standalone `about.html` — own head block, own stylesheet, two-column hero, stranger-facing rules naming the Isle of Tortuga, a rewritten credits list, and a duplicated lazily-mounted Ko-Fi iframe embed with a byte-identical sandbox attribute — plus a second `sitemap.xml` entry.**

## Performance

- **Duration:** ~25 min
- **Completed:** 2026-08-01T05:09:00Z
- **Tasks:** 2/2
- **Files modified:** 2 (about.html created, sitemap.xml modified)

## Accomplishments
- A real, crawlable `about.html` page — no build step, no shared JS or CSS with `index.html` — carrying its own `<head>` (title, description, canonical, `robots` `max-image-preview:large`, `og:`/`twitter:` tags) and its own `<style>` block re-declaring the game's colours/font by eye (D-05, D-07).
- A two-column hero row (title + blurb left, screenshot right, equal top alignment, 32px gap) that stacks to reading order at the project's existing 480px breakpoint, per UI-SPEC's Layout & Visual Hierarchy.
- The hero screenshot points at the committed `og-image.jpg` (1200×663) with eager loading, explicit `width`/`height`, and a 40+ character descriptive `alt` sentence — the exact asset META-01 exists to let Google promote.
- Fresh, stranger-facing rules copy (goal, turn shape, coming home) deliberately distinct from the in-game How-To-Play modal, naming the homeport as the **Isle of Tortuga** — never Barbados, `RULES.md`'s stale place-name (D-08).
- A rewritten credits list (same people, same gratitude as the Credits modal, laid out as a readable vertical list at 8px spacing) with every external link keeping `target="_blank" rel="noopener"`.
- A duplicated, lazily-mounted Ko-Fi iframe embed (`aboutKofiBtn`/`aboutKofiPanel`) whose `sandbox` attribute is byte-identical to `src/ui/lobby.js:74` and whose `src` is assigned only on first click — a visitor who never presses the button never contacts ko-fi.com.
- `sitemap.xml` gained a second `<url>` entry for `about.html` (monthly, priority 0.5); the homepage entry is untouched and the file still parses as valid XML.
- `robots.txt` confirmed (not edited) to need no change — `about.html` is not caught by its single `Disallow: /lab.html` rule.
- Two greppable, unmistakable placeholder markers — `TODO(D-09)` (twice: above the hero, above the rules card) and `TODO(D-11)` (once, above the hero image) — mark the draft copy and placeholder screenshot as pending Wyatt's sign-off in Plans 05 and 04 respectively.

## Task Commits

1. **Task 1: about.html — head block, own stylesheet, and the hero row** — `648d0f7` (feat)
2. **Task 2: About page content — rules, credits, lazily-mounted Ko-Fi — and the sitemap entry** — `f8efb1f` (feat)

**Plan metadata:** (this commit, following)

## Files Created/Modified
- `about.html` - New standalone page: head block, own stylesheet, two-column hero, rules card, credits card, Ko-Fi card with inline embed script
- `sitemap.xml` - Added a second `<url>` entry for `about.html`

## Decisions Made
See `key-decisions` in frontmatter. Summary: split the plan's two tasks into two commits despite both touching the same new file (Task 1 wrote the head/style/hero shell and was fully verified before Task 2 appended content); fixed two non-multiple-of-4 spacing values the plan's own prose had mirrored from index.html's originals, to satisfy the plan's machine-checked spacing gate; adjusted a comment and the image tag's line-wrapping so two of the plan's own regex-based acceptance criteria could actually match.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - bug] Two spacing values in about.html's own stylesheet were not multiples of 4**
- **Found during:** Task 1's own verification pass (before commit)
- **Issue:** The plan's action text said to mirror `.rules p`'s `6px` paragraph margins "by eye," but the same task's acceptance criteria requires every `margin`/`padding`/`gap` value in `about.html` to be divisible by 4. `.abtRules p { margin: 6px 0; }` and `#aboutKofiBtn`'s `padding: 11px 20px;` both violated that gate.
- **Fix:** Changed to `margin: 8px 0;` and `padding: 12px 20px;` — both on the UI-SPEC's declared 8-point scale (4/8/16/24/32/48) and visually indistinguishable from the mirrored originals.
- **Files modified:** about.html
- **Verification:** `grep -oE '(margin|padding|gap)[^;]*: *[0-9]+px' about.html | grep -oE '[0-9]+px' | sort -un` — all values divisible by 4.
- **Committed in:** 648d0f7 (Task 1 commit, before the first commit was made — no separate fix commit needed)

**2. [Rule 1 - bug] The robots-meta explanatory comment doubled the acceptance criterion's literal match count**
- **Found during:** Task 1's own verification pass
- **Issue:** `grep -c 'max-image-preview:large' about.html` must equal exactly 1 per the acceptance criteria, but an explanatory HTML comment above the `<meta name="robots">` tag also spelled out the same string, making the count 2.
- **Fix:** Reworded the comment to describe the directive without repeating its literal value verbatim ("The large-image-preview permission below is a per-URL directive...").
- **Files modified:** about.html
- **Verification:** `grep -c 'max-image-preview:large' about.html` equals 1.
- **Committed in:** 648d0f7 (Task 1 commit)

**3. [Rule 1 - bug] Multi-line `<img>` tag defeated the alt-text acceptance-criteria regex**
- **Found during:** Task 1's own verification pass
- **Issue:** `grep -cE '<img[^>]+alt="[^"]{40,}"' about.html` must be at least 1, but the hero `<img>` tag's attributes were split across two lines and standard `grep` does not match across newlines, so the check returned 0 even though the alt text (a full descriptive sentence, well over 40 characters) was present.
- **Fix:** Collapsed the `<img>` tag onto a single line.
- **Files modified:** about.html
- **Verification:** `grep -cE '<img[^>]+alt="[^"]{40,}"' about.html` equals 1.
- **Committed in:** 648d0f7 (Task 1 commit)

---

**Total deviations:** 3 auto-fixed (Rule 1 — all three are the plan's own verification gates catching mismatches between its prose and its regex-based checks, not implementation bugs against the requirement).
**Impact on plan:** None on scope or behavior. All three fixes bring the committed file into agreement with the plan's own acceptance criteria; no requirement, decision record, or UI-SPEC contract was affected.

## Issues Encountered

**No browser-automation tool was available in this execution session** (no chrome-devtools/Playwright MCP or equivalent). Both tasks' `<human-check>` verification steps — the visual hero-row check (two-up at 1440px, stacked at 480px, over-long-blurb wrap test) and the content-stacking/network-behavior/rules-divergence check — were not run. All *static* acceptance criteria for both tasks were run and pass. Per this session's browser-verification rules, these are logged as `unrun-verify` in `.planning/WINDOWS.md` (entries 5 and 6) rather than claimed as passed. **A local server remains running on `http://localhost:8543`** for whoever runs these passes; do not stop it.

## Known Stubs

None are code stubs in the traditional sense — the page is fully implemented, functional, and standalone. The two intentional, plan-mandated placeholders are:

- **`TODO(D-09)`** (about.html, above the hero block and above the rules card) — the page title, hero blurb, and rules copy are Claude's draft, pending Wyatt's explicit sign-off in Plan 22-05 per the blocking gate recorded in `22-CONTEXT.md`. Not a defect; this is the plan's own required "obvious, greppable placeholder" per the plan's `<critical_context>`.
- **`TODO(D-11)`** (about.html, immediately above the hero `<img>` tag) — the hero image currently points at the existing committed `og-image.jpg` as a real, correctly-sized stand-in; Plan 22-04 drives a real game, captures candidate mid-game frames, and Wyatt picks the one that ships (D-11), at which point this marker and the `og-image.jpg` reference are both removed.

Neither placeholder is logged to `.planning/WINDOWS.md` — both are explicitly plan-mandated, tracked by their own gated downstream plans (22-04, 22-05), and already carry `<!-- planner-discipline-allow: TODO(D-09) -->` / `TODO(D-11)` exemptions in the PLAN.md frontmatter.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- `about.html` is fully renderable, verifiable-by-grep, and served 200 from the local dev server; ready for Plan 22-04 to swap in the real screenshot and Plan 22-05 to swap in approved copy.
- The exact draft strings Plan 05's sign-off gate needs to review: page title ("About Pastry Pirates"), hero blurb ("Pastry Pirates is a free browser pirate board game — sail a grid of islands, gather baking ingredients, trade and battle rival captains, and race home to become the Best Baker on the Sugar Seas. Play solo against AI captains, pass the wheel around one screen, or sail with friends online — no login, no download, 2 to 4 players."), rules section (three `<h3>` blocks: "The goal", "Your turn", "Coming home", plus the closing note pointing to the in-game How to play screen), and the credits list (six entries, same people as the Credits modal, rewritten for list form).
- The Ko-Fi embed's in-page behavior is implemented per D-07's fallback contract (byte-identical sandbox, lazy mount on click) but its live in-browser confirmation is the recorded unrun-verify item above — flag this to whoever runs the D-11 screenshot-capture session in Plan 04, since driving that page is a good opportunity to also close this check.
- `git diff --stat index.html robots.txt` remains empty; this plan touched only `about.html` and `sitemap.xml`, exactly as scoped.
- `npm run` / named-gate subset (`no_undef_check`, `module_graph_check`, `ui_contract_check`, `state_contract_check`, `determinism_baseline --verify`) all re-confirmed green after these commits — this plan's changes are outside `src/**` and `index.html` and do not affect any of them.

---
*Phase: 22-the-front-door*
*Completed: 2026-08-01*

## Self-Check: PASSED

- FOUND: `about.html`
- FOUND: `.planning/workstreams/front-door/phases/22-the-front-door/22-02-SUMMARY.md`
- FOUND: commit `648d0f7` (Task 1)
- FOUND: commit `f8efb1f` (Task 2)
- No unexpected file deletions in either task commit.
