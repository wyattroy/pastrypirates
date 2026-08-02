# Roadmap — v1.3 workstream `front-door`

**Milestone:** v1.3 The Game Comes Alive (The Front Door)
**Overview of the whole milestone:** [`../../V1.3-V1.4-PLAN.md`](../../V1.3-V1.4-PLAN.md)

## Phases in this workstream

- [x] **Phase 22: The Front Door** — SHIPPED 2026-08-02, live on playpastrypirates.com. You name yourself after choosing how to play, a real About page, and a Google preview image (FIX-01, ABOUT-01/02, META-01).
  **Plus LOAD-03, the front door's speed** (also shipped): a static blurred backdrop instead of a live game rendered only to be hidden, and a boot that decides the journey before painting — first-time visitor sees the home screen at ~170ms; a mid-game refresh never sees the welcome screen at all.
  - [x] **DONE 2026-08-02 — LOAD-03 complete.** `renderDecorativeBoard()` is gone, replaced by `seedIdleGameState()`: the welcome screen now builds NO board, NO ship elements and NO captain rows, while still satisfying the codebase-wide invariant that `appState.game` always exists (269 reads, only 52 guarded — the reason it could not simply be deleted). The `appState.decorative` flag added earlier the same day went with it, since nothing could reach the End-of-Voyage heuristic before a real game any more. Welcome screen idle: 11.1% CPU / 60 layouts-per-sec -> 1.7% / 0. See `.planning/todos/done/2026-08-02-welcome-should-not-construct-a-game.md`. **This workstream has no open items.**

## Phase Details

### Phase 22: The Front Door

**Goal**: Stop losing people before they've played — the game asks for your name at the moment you've decided to play, a real About page gives the site something to show both visitors and Google, and the site's search result carries a large preview image.
**Depends on**: Nothing. Phases 18, 21 and 22 are mutually independent and may be planned and executed concurrently (v1.3 REQUIREMENTS.md, "Parallelism"). The one coordination point is `index.html` — Phase 18 edits its CSS block, Phase 22 edits its markup.
**Requirements**: FIX-01, ABOUT-01, ABOUT-02, META-01
**Success Criteria** (what must be TRUE):

  1. Clicking any of the four play-mode buttons (Solo, Host a Crew, Join a Crew, Pass & Play) opens a name modal before the mode's flow continues; it is pre-filled with the current default or last-used name, and confirming proceeds into that mode's existing flow. *(FIX-01)*
  2. There is exactly one place a player names themself — the welcome-screen name field no longer competes with the modal, and the modal writes to the same single source of truth the lobby reads from, so no "Crustbeard – Crustbeard" doubling returns. *(FIX-01)*
  3. An About page exists containing the rules, a screenshot of the game in action, the credits, and the Ko-Fi button. *(ABOUT-01)*
  4. The About page does not become a third divergent copy of the rules — it either shares one source with the How-To-Play modal / `RULES.md`, or duplicates deliberately with that decision recorded in the phase's CONTEXT.md. *(ABOUT-01)*
  5. The About page is reachable by its own link from the homepage. *(ABOUT-02)*
  6. The site serves an in-page image — the About page screenshot — which is what Google can promote into a result thumbnail; the already-shipped `max-image-preview:large` robots meta and JSON-LD `image` field are verified still present in `index.html`. *(META-01)*

**Plans**: 5/5 plans executed

Plans:
**Wave 1**

- [x] 22-01-PLAN.md — The naming moment: name modal after mode pick, one read chokepoint, durable last-used name (FIX-01) *(wave 1)*
- [x] 22-02-PLAN.md — `about.html`: head block, own stylesheet, hero, rules, credits, Ko-Fi embed, sitemap entry (ABOUT-01) *(wave 1)*

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 22-03-PLAN.md — Both About links on the homepage, and the META-01 head-block close-out (ABOUT-02, META-01) *(wave 2)*
- [x] 22-04-PLAN.md — Capture mid-game screenshot candidates, Wyatt picks, install the chosen frame (ABOUT-01, META-01) *(wave 2, has a blocking checkpoint)*

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 22-05-PLAN.md — Copy sign-off gate: Wyatt approves every player-visible string, recorded against the copy gate (ABOUT-01) *(wave 3, has a blocking checkpoint)*

**UI hint**: yes

> **META-01 is already half-shipped.** Quick task `20260731-google-preview-logo` (2026-07-31) added
> both levers this requirement names — the `robots` meta with `max-image-preview:large`
> (`index.html:15`, the page previously had no robots meta at all) and the `image` field on the
> JSON-LD `VideoGame` block (`index.html:28`). Those permit a large image; they do not supply one.
> What remains is the in-page screenshot that ABOUT-01 produces, which is why the two are planned
> together. Displaying it also needs a Google re-crawl (days to weeks) that cannot be forced from
> the repo — that is META-03, Wyatt's own Search Console action, not build work.

> **FIX-01 has one open question for discuss-phase**: does the welcome-screen name field go away
> entirely, or stay as an optional shortcut? Removing it is the cleaner answer — one place to name
> yourself rather than two that can disagree — but it is Wyatt's call
> (`.planning/todos/pending/2026-07-31-name-chosen-in-modal-after-mode-pick.md`).

## Boundaries

**This workstream owns:** markup in `index.html`, `src/ui/lobby.js`, and a new About page

**Runs concurrently with:** the other v1.3 workstreams — `prompts-polish`, `board-wind`,
`sound-clock`, `front-door` — except where noted below.

**⚠ Shared-file risk:** this workstream edits **the markup** of `index.html` while `prompts-polish`
edits **the CSS block** of the same file. Different regions, same file — expect merge friction and
sequence the `index.html` touches deliberately rather than assuming they are independent.

## Staying current — this project's demonstrated failure mode

> **⚠ Compare against `origin/main`, not a bare local `main` ref.** `main` **is** this project's
> trunk and is healthy — it carries the full `src/` module tree and serves the live site at
> playpastrypirates.com. But on 2026-07-31 a local `main` ref was found parked at `2ddbf97`, a v1.0
> snapshot predating the v1.1 module refactor, with no `src/` at all. Reading it produced a
> confident and entirely wrong conclusion ("main is a dead v1.0 snapshot") that cost most of a
> session. **Tell:** if a diff against the base looks absurdly large, or shows `src/` as newly
> added, you are reading a stale ref — run `git rev-parse origin/main` before concluding anything.

> **Where the v1.3 planning lives.** `.planning/workstreams/` and phases 18–22 are **not on
> `origin/main` yet** — as of 2026-07-31 they sat 32 commits ahead, on
> `claude/backlog-milestone-planning-93eb10`. A worktree cut from `main` cannot see these phases,
> and `/gsd-plan-phase N --ws <name>` will report the phase as not found. Fast-forward such a
> worktree to that branch. Being *ahead* of `main` is the normal state for v1.3 work — do not
> "fix" it. And pass `--ws <name>` explicitly on every GSD command rather than relying on an
> active-workstream setting.

**Staleness, not conflicts, is what has actually cost this project time.** A branch drifted 34
commits behind and made a shipped milestone look unfinished; the repo already carries several
stale worktrees. So:

1. **Branch from the current v1.3 planning branch** when you start.
2. **Merge back promptly** when a phase completes — do not let a workstream sit.
3. **Pull in before planning a new phase**, so you are planning against what actually shipped.
