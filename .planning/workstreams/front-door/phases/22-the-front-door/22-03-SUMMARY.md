---
phase: 22-the-front-door
plan: 03
subsystem: ui
tags: [static-html, seo, navigation, front-door]

# Dependency graph
requires:
  - phase: 22-01
    provides: the modal-driven welcome screen (#stepChoose, #nameModal) this plan adds a link beside
  - phase: 22-02
    provides: about.html, the navigation target both new links point at
provides:
  - "Two About-page links in index.html: #lnkAboutWelcome (welcome screen, reachable pre-game) and #lnkAboutFooter (in-game footer row)"
  - "Verified survival of META-01's already-shipped robots meta and JSON-LD image field through this phase's markup edits"
affects: [about-page, seo, front-door]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "New footer-style controls that need zero new CSS: reuse .footerBtn (already anchor-safe via text-decoration:none/display:inline-block) and add an empty modifier class purely for naming-convention/future-hook purposes"

key-files:
  created: []
  modified:
    - index.html

key-decisions:
  - "Both About links use <a class=\"footerBtn footerAbout\">, not <button> — real same-origin navigation, not a modal trigger"
  - "footerAbout carries no CSS rule of its own — base .footerBtn already supplies correct anchor rendering, keeping this plan's diff to zero lines in the <style> block Phase 18 concurrently owns"
  - "Welcome-screen link placed between .choiceRow and the muted playtesting notice, spaced with an inline style attribute (matching the existing inline-style precedent in that exact spot) rather than a new CSS rule"

requirements-completed: [ABOUT-02, META-01]

coverage:
  - id: D1
    description: "Welcome-screen About link (#lnkAboutWelcome) added under the mode-card row, reachable before any game starts"
    requirement: "ABOUT-02"
    verification:
      - kind: unit
        ref: "grep -c 'id=\"lnkAboutWelcome\"' index.html == 1, line 830 between .choiceRow close and muted notice"
        status: pass
      - kind: automated_ui
        ref: "node scripts/ui_contract_check.js (D-29 pirate-register scan)"
        status: pass
    human_judgment: true
    rationale: "Live click-through navigation and visual placement were not exercised — no browser-automation tool available this session. Logged as WINDOWS.md entry #7 (unrun-verify)."
  - id: D2
    description: "Footer-row About link (#lnkAboutFooter) added after Ko-Fi and before Leave game"
    requirement: "ABOUT-02"
    verification:
      - kind: unit
        ref: "grep -c 'id=\"lnkAboutFooter\"' index.html == 1, line 1102 inside #footerRow between btnKofi and btnLeave"
        status: pass
    human_judgment: true
    rationale: "Live click-through navigation and narrow-width wrap behavior (320/375/480px, Safari + Chrome) were not exercised — no browser-automation tool available this session. Logged as WINDOWS.md entry #7 (unrun-verify)."
  - id: D3
    description: "META-01's robots meta (max-image-preview:large) and JSON-LD image field verified byte-identical to the 22-RESEARCH.md baseline after this phase's markup edits"
    requirement: "META-01"
    verification:
      - kind: unit
        ref: "diff <(git show HEAD:index.html | sed -n '1,32p') <(sed -n '1,32p' index.html) — zero output"
        status: pass
      - kind: unit
        ref: "grep -c 'name=\"robots\" content=\"index, follow, max-image-preview:large, max-snippet:-1\"' index.html == 1; grep -c '\"image\":\"https://playpastrypirates.com/og-image.jpg\"' index.html == 1"
        status: pass
    human_judgment: false
  - id: D4
    description: "Zero lines added to index.html's inline <style> block (D-07 coordination boundary with Phase 18's concurrent CSS edits)"
    verification:
      - kind: unit
        ref: "style-block line count identical between HEAD and working tree"
        status: pass
    human_judgment: false

duration: 12min
completed: 2026-08-01
status: complete
---

# Phase 22 Plan 3: About Page Links Summary

**Two `.footerBtn`-styled anchors added to index.html — one under the welcome-screen mode cards, one in the in-game footer row — both pointing at about.html with zero new CSS, plus a verified diff proving META-01's SEO markup survived untouched.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-08-01T05:11:00Z
- **Completed:** 2026-08-01T05:23:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Added `<a id="lnkAboutWelcome" class="footerBtn footerAbout" href="about.html">ℹ️ About</a>` inside `#stepChoose`, placed between the closing `.choiceRow` tag and the muted playtesting notice, wrapped in a centered inline-styled `<div>` — reachable by a first-time visitor before any game starts, closing the gap `#footerRow` alone (hidden until `#game` is visible) could not close.
- Added the same anchor with id `lnkAboutFooter` inside `#footerRow`, as the row's seventh control, positioned after the Ko-Fi button and before the destructive Leave-game button.
- `.footerAbout` was added to the markup on both anchors with deliberately zero CSS rule — the base `.footerBtn` rule already supplies `text-decoration:none`, `display:inline-block`, and the teal border/background/text treatment UI-SPEC's Color section requires (never orange, since this is navigation, not the page's primary action).
- Verified META-01's two already-shipped lines (the `robots` meta with `max-image-preview:large` at line 15, and the JSON-LD `image` field at line 28) are byte-identical to both the `22-RESEARCH.md` baseline and `git show HEAD:index.html` lines 1-32 — a clean `diff` with zero output.
- Confirmed `robots.txt` still allows everything except `/lab.html` (unmodified) and `sitemap.xml` still lists `https://playpastrypirates.com/about.html` (unmodified) — `git status --porcelain robots.txt sitemap.xml` returned empty, proving neither file was touched by this task.
- Confirmed the `<style>` block gained zero lines (line count identical to `HEAD`), respecting Phase 18's concurrent-edit boundary on that region.

## Task Commits

Each task was committed atomically:

1. **Task 1: Both About links, and the META-01 head-block close-out** - `ea65be8` (feat)

**Plan metadata:** committed separately per `<final_commit>` step below.

## Files Created/Modified
- `index.html` - Added two `<a class="footerBtn footerAbout">` anchors (welcome screen + footer row); zero other lines changed, head block (1-32) and `<style>` block byte/line-identical to HEAD.

## Decisions Made
- Used an `<a>` element rather than a `<button>` for both links (real navigation, not a modal trigger), matching the plan's closed decision.
- Spaced the welcome-screen link's wrapper `<div>` with an inline `style` attribute rather than a CSS class, since this plan's constraint was zero new lines in the `<style>` block and `index.html` already uses inline styles in the immediately adjacent muted-notice `<div>`.
- Left `.footerAbout` with no CSS rule as specified — confirmed the link renders correctly under the inherited `.footerBtn` styling with no visible-wrong-without-a-rule condition, so no merge-conflict flag was needed.

## Deviations from Plan

None — plan executed exactly as written. No Rule 1-4 auto-fixes were needed.

## Issues Encountered

None. All named verification gates (`ui_contract_check.js`, `no_undef_check.js`, `module_graph_check.js`, `state_contract_check.js`, `determinism_baseline.js --verify`) passed on first run.

**Browser verification not run:** No browser-automation tool was available in this executor session. The plan's consolidated `<human-check>` — About-link click-through from both surfaces, the four mode-card modal flows, and the narrow-width wrap check (320/375/480px) in both Safari and Chrome — was **not performed**. This is explicitly logged rather than assumed: `.planning/WINDOWS.md` entry #7 (`unrun-verify`, phase 22, file `index.html`) records the gap for the coordinator, who has browser tools, to close out. The local server on `http://localhost:8543` remains running for that pass; `about.html` and `index.html` both confirmed serving 200 via `curl -sI` during this session.

**On the Google preview image (META-01/META-03 boundary):** this phase supplies the in-page permission (`robots` meta) and the field Google's crawler reads (`image` in JSON-LD) — both verified intact. Whether Google actually renders the large thumbnail in search results depends on a re-crawl that takes days to weeks and is entirely outside this repo's control; that is META-03, Wyatt's own Search Console action. Nothing in this summary or the shipped source claims the preview is currently showing.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- D-06 (both About links) and META-01 (SEO markup survival) are both closed for this plan's scope.
- Plan 22-04 (screenshot capture, blocked on Wyatt's D-11 pick) and Plan 22-05 (About-page copy sign-off, blocked on Wyatt's D-09) remain the phase's outstanding waves.
- The unrun browser pass (WINDOWS.md #7) should be closed by the coordinator, which has browser-automation tools, before the phase is marked fully verified.

---
*Phase: 22-the-front-door*
*Completed: 2026-08-01*

## Self-Check: PASSED

- FOUND: index.html
- FOUND: .planning/workstreams/front-door/phases/22-the-front-door/22-03-SUMMARY.md
- FOUND: commit ea65be8
