# Phase 22: The Front Door - Context

**Gathered:** 2026-07-31
**Status:** Ready for planning
**Workstream:** `front-door` — pass `--ws front-door` on every GSD command for this phase.

<domain>
## Phase Boundary

What a first-time visitor meets before and around playing: the moment they name themselves, a real
About page, and what Google shows for the site. Three requirements — FIX-01 (name modal after mode
pick), ABOUT-01/02 (the About page and its link), META-01 (a large Google preview image).

**This workstream owns:** markup in `index.html`, `src/ui/lobby.js`, and a new About page.

**Explicitly not in this phase:** anything that changes game rules, the board, or the engine.
Milestone constraint #1 — nothing in v1.3 may touch `src/engine/index.js` or change what it emits.
If this phase finds it needs an engine change, STOP and re-scope.

**⚠ Shared-file coordination:** Phase 18 (`prompts-polish`) edits the **CSS block** of `index.html`
while this phase edits its **markup**. Different regions, same file. D-07 below was chosen
specifically to keep this phase out of that CSS block.

</domain>

<decisions>
## Implementation Decisions

### The naming moment (FIX-01)

- **D-01:** The welcome-screen name field is **removed entirely**. The new modal becomes the only
  place a player names themself. This resolves the open question flagged in
  `.planning/todos/pending/2026-07-31-name-chosen-in-modal-after-mode-pick.md` ("Does the
  welcome-screen name field go away entirely, or stay as an optional shortcut?") — Wyatt's call,
  2026-07-31: remove it. One place to be named, not two that can disagree.
- **D-02:** Dismissing the modal — the X, the Escape key, or a click outside — **counts as
  confirming** the pre-filled name. The player is never blocked and never nameless. Rationale: the
  name was visible on screen at the moment of dismissal, so it is not a name they never saw, which
  is the actual complaint being fixed.
- **D-03:** The **same modal appears on all four mode cards** (Solo, Pass & Play, Host a Crew, Join
  a Crew), in the same position in the flow. "Join a Crew" then continues to its existing code
  screen (`#stepJoin`). Consistency and a single modal with four callers was chosen over saving
  Join players one click.
- **D-04:** The modal is **pre-filled with the player's last-used name**, remembered in browser
  storage (the game already persists `pp_sess` / `pp_solo` / `pp_id`). A first-time visitor gets a
  suggested captain name from `DEFAULT_NAMES`. The field is never empty — an empty field is what
  currently lets `requireName()` silently fall through to `DEFAULT_NAMES[0]`.

### The About page (ABOUT-01, ABOUT-02)

- **D-05:** The About page is a **real separate page — `about.html`** — with its own URL, added to
  `sitemap.xml` (which today lists only the homepage). Not a modal. **This is the decision META-01
  depends on:** Google indexes URLs, so only a real page gives it a new thing to list and a
  non-hidden image to promote. — **Reversibility:** costly — once `about.html` is live and indexed,
  collapsing it back into a modal means a dead URL that Google has crawled, plus a `sitemap.xml`
  entry and inbound links to retract. Undoing it is not a code-local change.
- **D-06:** The About link appears in **both** places: under the four mode cards on the welcome
  screen, and in the footer beside How to play / Credits. Both are needed —
  `#footerRow` lives inside `#game`, which is `display:none` until a game starts and is
  blurred behind the welcome overlay in `showHome()`, so a footer-only link is not reachable by the
  first-time visitor ABOUT-02 is written for.
- **D-07:** `about.html` gets its **own small stylesheet**, reusing the game's colours and fonts by
  eye. It does **not** extract or modify `index.html`'s inline `<style>` block. Chosen explicitly to
  avoid colliding with Phase 18, which is editing that block concurrently. The duplication is
  accepted and deliberate; the page is mostly text, not a second game screen.

### The rules — deliberate divergence, not drift (ABOUT-01)

- **D-08:** The About page gets **its own copy, written for strangers** deciding whether to play.
  The How-To-Play modal stays as it is — in-game reference for a player who forgot how battles
  score. Different readers, different jobs. **This satisfies the "duplicate deliberately and say
  so" branch of the requirement, and this decision record IS the saying-so.**

  > **Correction to the requirement's premise.** `.planning/REQUIREMENTS.md` warns the rules exist
  > in two places. They exist in **four**: the How-To-Play modal (`index.html:912–936`, full rules
  > inline in pirate voice), `RULES.md` (65 lines), `Rules_boardgame.md` (250 lines), and
  > `.planning/how-to-play-pastry-pirates.md` (196 lines). The About page is a fifth. The
  > "share one source" option was considered and rejected: with no build step it would require a
  > runtime fetch, which keeps the rules text out of `about.html`'s crawlable source — directly
  > working against META-01 — and breaks on `file://`.

- **D-09:** **Claude drafts the About copy; Wyatt approves before it ships.** This is a **blocking
  checkpoint** — the phase cannot be marked complete without sign-off. The approved wording must be
  recorded against `.planning/todos/pending/copy-shipped-vs-approved-gate.md` per milestone
  constraint #3 (copy changes are inventory changes; silent divergence between shipped source and
  Wyatt's approved dispositions is a failure this project has already had).

### The screenshot (ABOUT-01, and the remaining half of META-01)

- **D-10:** The screenshot shows a **busy mid-game board** — ships scattered across the islands,
  crates on the board, the wind spinner visible, captains' holds filling. Not the end-of-voyage
  celebration (shows the payoff, spoils it, and isn't what you'd spend an hour doing) and not a
  staged arrangement.
- **D-11:** **Claude captures several candidate frames by driving a real game**, following
  `docs/DRIVING-THE-GAME.md`; **Wyatt picks the one that ships.** Another approval point, though a
  lighter one than D-09.

### Claude's Discretion

Not discussed — planner and executor decide, consistent with the decisions above:

- Whether the About page's credits repeat the Credits modal's content verbatim or are rewritten for
  the page. (Raised as a possible fifth area; Wyatt chose to proceed without it.)
- Whether `about.html` carries its own `og:` / `twitter:` social-preview tags, or inherits nothing.
- The saved size and format of the screenshot. For reference, the existing `og-image.jpg` is
  1200×663 and is the same artwork as `assets/logo.jpg`.
- The exact wording of the modal's prompt and confirm button (subject to D-09's approval gate),
  and where precisely the About link sits under the mode cards.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and requirements
- `.planning/workstreams/front-door/ROADMAP.md` — the Phase 22 detail section: goal, the four
  requirement IDs, and six success criteria. Also carries the META-01 half-shipped note.
- `.planning/workstreams/front-door/REQUIREMENTS.md` — workstream scope, the four requirements
  verbatim, and the milestone-wide constraints.
- `.planning/REQUIREMENTS.md` §"The Front Door — Phase 22" and §"About Page (ABOUT)" — the fuller
  ABOUT-01/02 reasoning, including the Ko-Fi overlap and the "this is also the real fix for
  META-01" note.
- `.planning/V1.3-V1.4-PLAN.md` §"Phase 5 — The Front Door" — the plain-language statement of intent
  ("stop losing people before they've played"). Note this doc numbers the phase 5, not 22.

### Per-item detail
- `.planning/todos/pending/2026-07-31-name-chosen-in-modal-after-mode-pick.md` — FIX-01's full
  problem statement, the proposed three-step flow, and the interactions with UI-05, UI-06 and
  LOAD-03. Its one open question is resolved by D-01.
- `.planning/todos/pending/copy-shipped-vs-approved-gate.md` — where D-09's approved wording must be
  recorded.

### Constraints and process
- `docs/DRIVING-THE-GAME.md` — **required reading before any browser automation**, per project
  CLAUDE.md. Needed for D-11's screenshot capture. Two traps called out: `#flipCoinWrap` *is* the
  flip button (not an `.apBtn`), and a window narrower than ~1 second cannot be hand-driven — use
  the armed watcher in §5d.
- `docs/DETERMINISM-RERECORD-NEXT.md` §7–8 — why milestone constraint #1 exists. Not expected to be
  relevant to this phase; cited so the executor knows what it must not disturb.
- `.planning/PROJECT.md` — the standing design invariant (bots have the same rules and affordances
  as humans). Not expected to bear on this phase.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable assets

- **`#kofiModal`** (`index.html:962`) — already built for KOFI-01 in Phase 16, and already opened
  from two places: the footer (`#btnKofi`, `index.html:1085`) and the Credits modal
  (`#btnKofiCredits`, `index.html:948`). **ABOUT-01's Ko-Fi button is a third pointer at this same
  modal, not a new integration.** Wyatt's recorded preference (2026-07-31): the button must open the
  Ko-Fi widget in-page, not navigate to the Ko-Fi website.
- **`DEFAULT_NAMES`** (`src/shared/index.js:194`) and **`unusedDefaultName()`**
  (`src/shared/index.js:199`) — the existing captain-name list and the "pick one nobody is using"
  helper. D-04's pre-fill should draw from these rather than introduce a new name source.
- **`.footerBtn` styling** (`index.html:138–147`) — the shared look for footer buttons, including
  the Ko-Fi variant. D-06's footer link should match.
- **Existing modal pattern** — `#howToPlayModal`, `#creditsModal`, `#kofiModal` all follow the same
  `.modalOverlay` / `.modalCard` structure. The new name modal should follow it too.

### Established patterns

- **The name is read in exactly one place.** `requireName()` (`src/ui/lobby.js:92–97`) does
  `($("pname").value||"").trim()` and falls back to `DEFAULT_NAMES[0]`. `src/orchestrator.js:1113`
  does the same read inline. **Both must be updated together** when `#pname` is removed per D-01 —
  a missed second reader is the obvious way to break this.
- **Naming collision to watch:** `pname` is used for two unrelated things — the DOM id of the input
  field, and `pname()` in `src/ui/util.js`, which renders a *seat's* display name and handles HTML
  escaping (`pn()` → `pname()` → `escHtml`). Removing the input must not touch the function.
- **Welcome-screen step switching** — `showStep()` (`src/ui/lobby.js:90`) toggles among
  `stepChoose` / `stepHost` / `stepJoin` / `stepPassPlay`. The name modal has to fit this machinery
  or deliberately sit outside it.
- **No build step.** The site is static, served directly. Anything requiring compilation,
  bundling, or a runtime fetch of local files is out of character and, for the rules, was
  explicitly rejected in D-08.

### Integration points

- **`#stepChoose`** (`index.html:813–834`) — holds the name label/input to be removed (D-01) and the
  four `.choiceCard` buttons that will trigger the modal (D-03). D-06's welcome-screen About link
  goes here too.
- **`#choiceSolo` / `#choicePassPlay` / `#choiceHost` / `#choiceJoin`** (`index.html:819–831`) —
  the four handlers the modal must intercept. Note UI-05 already made `#choiceHost` call
  `createRoom()` directly, skipping `#stepHost`; see the comment at `index.html:837`.
- **`#footerRow`** (`index.html:1077`) — six buttons today; D-06 adds a seventh. It lives inside
  `#game` (`index.html:1031`, `style="display:none"`), which is why D-06 needs the welcome-screen
  link as well.
- **`sitemap.xml`** — one entry today (the homepage). D-05 adds `about.html`.
- **`robots.txt`** — allows everything except `lab.html`. `about.html` needs no change here, but
  should be confirmed not accidentally disallowed.
- **`index.html:11–28`** — the already-shipped META-01 half: the `robots` meta with
  `max-image-preview:large` (line 15) and the JSON-LD `VideoGame` block's `image` field (line 28).
  **Verify these survive this phase's markup edits** — success criterion 6 depends on them.

</code_context>

<specifics>
## Specific Ideas

- **META-01 is already half-shipped and must not be re-done.** Quick task
  `20260731-google-preview-logo` (2026-07-31) added both levers the requirement names. Its recorded
  finding: `og:image` was never the lever — Google largely ignores Open Graph for result
  thumbnails; the missing piece was the `robots` meta, which the page did not have at all. The
  remaining half is the in-page screenshot from ABOUT-01, which is why the two are planned together.
- **Displaying the preview cannot be forced from the repo.** It needs a Google re-crawl, days to
  weeks. That is META-03 — Wyatt's own Search Console action, not build work, and worth starting
  well before this phase lands. Do not write a success criterion that depends on Google actually
  showing the image.
- **The modal's prompt line** suggested in the source todo: *"What do they call ye, captain?"* —
  a starting point for D-09's draft, not a locked string.
- **The bug in one sentence**, for anyone writing acceptance criteria: leave the name box blank
  today and `requireName()` returns `DEFAULT_NAMES[0]` — "Davy Scones" — which is also the text in
  the field's placeholder. That is precisely how players "end up as a captain they never chose."

</specifics>

<deferred>
## Deferred Ideas

- **Extracting `index.html`'s inline CSS into a shared stylesheet.** Considered under D-07 and
  rejected for this phase — it would rewrite the block Phase 18 is actively editing. Worth doing
  once v1.3's concurrent workstreams have closed; it is the real fix for the duplication D-07
  accepts.
- **Consolidating the four existing copies of the rules.** Out of scope here: this phase only
  commits to not making the divergence *accidental*. `RULES.md`, `Rules_boardgame.md`, the
  How-To-Play modal and `.planning/how-to-play-pastry-pirates.md` remain four separate documents.
- **META-03 — Google Search Console verification.** Not code, not build work. Wyatt's own action,
  slow to take effect, and the thing that actually makes the preview image appear.

</deferred>

---

*Phase: 22-the-front-door*
*Context gathered: 2026-07-31*
