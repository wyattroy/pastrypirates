# Requirements: Pastry Pirates — v1.2 Playtest Fixes & Polish

**Defined:** 2026-07-25
**Core Value:** The game must stay playable and fair end-to-end in both Safari and multiplayer — a storm must not crash the game, and pausing the multiplayer timer must never destroy game state. This milestone clears a second live-playtest punch list without regressing that value: the critical multiplayer clock stall is the headline fix, and all engine-adjacent changes (storm movement) must preserve deterministic replay.

**Source:** `notes/edits for pastry pirates-2.pdf` (live Safari multiplayer playtest). Large new features from that punch list — interactive tutorial, sound effects, island redesign — are intentionally deferred (see Future Requirements).

## v1 Requirements

Requirements for the v1.2 milestone. Each maps to a roadmap phase.

### Turn Clock (CLOCK)

- [x] **CLOCK-01**: In a multiplayer game (2+ windows), the turn clock starts running normally so the first turn begins — the game no longer stalls "paused" before it starts, and no timer off/on toggle workaround is needed *(critical)*
- [x] **CLOCK-02**: A play/pause control is available in multiplayer games so any player can pause without missing bot actions
- [x] **CLOCK-03**: The large "PAUSED" image is itself a clickable button that resumes the clock when pressed

### Storm Movement (STORM)

- [x] **STORM-01**: During a storm the boat moves one square at a time across the full dir1+dir2 push (up to 4 squares), and docking/aground checks evaluate at the correct square — fixing the false "the dock held fast" message when the boat is still a square away from the dock
  - **Scope amended at Phase 14 close (2026-07-26, Wyatt's decision):** the square-by-square
    animation is delivered for **solo play and the multiplayer host's own screen**. Multiplayer
    *guests* still see the boat arrive at its final square, because a guest renders purely from the
    broadcast event feed and the intermediate storm squares deliberately emit no event — adding one
    would force another full re-record of the determinism corpus. The narration half of STORM-01
    (correct square, no false "dock held fast") IS correct for guests too, since narration derives
    from the event stream. Guest animation parity is logged as a backlog item, not a gap.

### Bot Behavior (AI)

- [x] **AI-01**: The bot "hail humans" turn structure follows an intended, decided rule — a bot that hails/parleys the human no longer appears to take two actions in one turn (hail *and* fish/dock/etc.) unless that is the deliberately chosen behavior. The rule (does a hail consume the bot's turn action, or is it a free pre-action negotiation?) is decided with Wyatt during Phase 14, then implemented; if the rule must also apply to bot-vs-bot it is mirrored in the deterministic engine's `takeTurn` so replay/determinism stays consistent *(design decision — pre-existing since v1.0; src/ui/flow.js:584-612)*

### Narration (NARR)

- [x] **NARR-01**: A full audit of every narration branch (storm, docking, battle, trade, bribe, etc.) is delivered to Wyatt, cataloguing thematic repetitions/inconsistencies with a pruning recommendation *(audit deliverable — pruning applied after Wyatt reviews)*
- [x] **NARR-02**: The missing "broke" narration line is restored
- [x] **NARR-03**: The storm intro line reads "First, the storm pushes you {dir1}" instead of the "pushes everyone 2 squares, then 2 more south" phrasing
- [x] **NARR-04**: The bribe line is context-smart — "with 2 🪙" when a crate is given, and "paid 5 🪙" when the player has no crates to give
- [x] **NARR-05**: Whenever the narration box describes an action *you* (the local player) took, it addresses you in 2nd person ("you") instead of 3rd person ("{your name}") — making the narration read more naturally. This includes the "already anchored safely" line (which currently only appears for other players/bots) and every other self-referential narration branch
- [x] **NARR-06**: Non-prompt (blue-box) narration holds ~10% less time on screen before the next line comes in *(reworded 2026-07-30 at Wyatt's clarification — the criterion was always hold length, never fade)*

### UI / UX Polish (UI)

- [ ] **UI-01**: Padding between the flippenator row, gameboard, narrator, captains box, and footer is audited and normalized to consistent spacing
- [ ] **UI-02**: Icons that rise out of boats stay fully opaque for 1 second, then begin fading at the current rate (fade starts later)
- [ ] **UI-03**: The moveable-square orange highlight has its max size reduced by 10%
- [ ] **UI-04**: Moveable squares have a more distinct mouse-hover effect
- [ ] **UI-05**: Clicking "Host a Crew" goes straight to the lobby/seat screen, skipping the redundant intermediate "Create the game" screen
- [ ] **UI-06**: The lobby shows each name once — your seat reads "{name} – you" (or "{captain} – you" when no name is typed), and joined players show their name once (no "Crustbeard – Crustbeard" doubling)
- [ ] **UI-07**: At end-of-voyage the empty narration/action box (`#actionPanel`) is hidden/collapsed once the End-of-Voyage summary appears, instead of staying on screen large and empty *(pre-existing since v1.0; src/ui/panel.js `liveDone` branch)*

### Link & Social Preview (META)

> **RE-SCOPED 2026-07-31.** Both original requirements were written as "add these"; both were already
> shipped with v1.0 on 2026-07-24 and verified live this session. What is actually missing is
> narrower and different. Evidence, all checked against `https://playpastrypirates.com`:
>
> | Asset | State |
> |---|---|
> | `og:image` + Twitter card tags (`index.html:11-21`) | present |
> | `og-image.jpg` | HTTP 200, 1200×663, 171 KB |
> | `favicon.ico` / `favicon.png` | HTTP 200; PNG is 256×256 square |
> | `<link rel="icon">` (`index.html:5-7`) | present |
> | `robots.txt` / `sitemap.xml` | crawlable, sitemap referenced |
> | JSON-LD `VideoGame` schema (`index.html:22-24`) | present — **but carries no `image` field** |
>
> Wyatt's screenshot of a live `pastry pirates` Google search (2026-07-31) shows the site **indexed,
> ranking, and rendering its favicon correctly** — the Fandom and IMDb results above it each carry a
> square thumbnail and `playpastrypirates.com` carries none. So META-02 is satisfied in the wild, and
> META-01's failure is specific to Google's result thumbnail, not to link previews.
>
> **`og:image` is not the lever.** Google largely ignores Open Graph for result thumbnails; that tag
> serves iMessage/Slack/Facebook, which were never the complaint.

- [ ] **META-01** *(revised)*: A Google search result for the site shows a large preview image. Requires two additions: a `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">` directive (**the page has no robots meta tag at all today**, so Google defaults to a small thumbnail or none), and an `image` field on the existing JSON-LD `VideoGame` block. Wyatt: *"we want pastry pirates to have as big an image as possible."*
- [x] **META-02**: The site serves a favicon — **satisfied**; verified serving and confirmed rendering in a live Google result 2026-07-31. No code change required.
- [ ] **META-03** *(new)*: The site is verified in Google Search Console with indexing requested, so favicon/thumbnail crawl state is observable rather than guessed at. **Not a code change — Wyatt's own action**, and the slowest-moving piece (crawl latency is days to weeks), so it should start well before the code lands.

> **Depends on [ABOUT-01](#about-page-about--added-2026-07-31-high-priority) for its best outcome.** Google prefers a thumbnail it can find *in the page*.
> The board is drawn in code and `og-image.jpg` is never displayed as an `<img>` anywhere, so today
> there is no in-page image to promote. The About page's screenshot supplies exactly that.

### Support Button (KOFI)

- [ ] **KOFI-01**: A Ko-Fi "Buy me a cookie" button appears both in the footer (right of Feedback, styled the same) and in the Credits modal (after the credits text, at the bottom), using the provided Ko-Fi embed

### Verification (VERIFY)

- [ ] **VERIFY-01**: A manual Safari + Chrome multiplayer playtest (two windows) confirms the critical clock stall is fixed and a game starts and plays through end-to-end
- [x] **VERIFY-02**: The determinism regression harness stays green (31/31) — storm-movement and any engine-adjacent changes do not break lockstep replay

## Future Requirements

Deferred to a later milestone. Tracked but not in this roadmap.

### Board Atmosphere (WIND) — added 2026-07-31, HIGH PRIORITY

Requested by Wyatt 2026-07-31: *"more features that i want to add to the backlog, high in the
priority list, ideally which can be done in parallel instead of series."*

**All three are drawing-layer only — no engine change, so no determinism re-record.** That is the
property that makes them genuinely parallelizable, and it must be preserved: nothing here may touch
`src/engine/index.js` or what it emits into the event stream.

- **WIND-01**: On every non-storm turn the board carries a wind animation — small dots fluttering slowly and jitterily across it, **with none of the storm's darkening**. Built by reusing the storm's existing four-layer tiled-PNG machinery (`stormLayerSpecs()` / `buildStormLayers()` / the `.rlayer` CSS, `src/ui/board.js:272-340`) with a new dot sprite in place of `rain-streaks.png`.
- **WIND-02**: The trade-wind arrows flow along the rim channel into the whirlpool rather than sitting still. Today `src/ui/board.js:134-142` draws one static `WIND_ARROW_IMG` per channel square, rotated to the clockwise tangent.
- **WIND-03**: Each whirlpool rotates, making it visually clear that it is what stops the wind. Today a static `TRADE_SWIRL_IMG` is drawn at each quadrant's drop-off square (same block).

**Three constraints, each earned from a bug this project already paid for:**

1. **Seed the jitter from a PRIVATE stream — `mulberry32(game.seed)`, never `game.r()`.** This is G19's rule verbatim. Storm rain was jittered with unseeded `Math.random()` and cached per browser, so two players in one room saw permanently different weather (measured 0.818s/200.5px against 0.534s/264.7px). Drawing from `game.r()` instead would be worse still — it advances the seeded game stream and desyncs every client *and* all 31 determinism fixtures. `ui_contract_check.js` assertion 8 already gates both failure modes for rain; the wind layer needs the same treatment.
2. **Safari must be re-verified, and this is the largest such risk the project has taken.** BUG-01 was a Safari near-crash caused by storm-overlay compositing, and the real fix was a pre-baked PNG tile. WIND-01 puts a permanently-running animated layer on *every ordinary turn* — the same class of cost, on a far bigger surface than a storm that appears occasionally. A Safari pass is a gate here, not a courtesy.
3. **The new sprite must tile seamlessly.** The existing machinery derives `--drop` from the tile period (`PERIOD*scale`) precisely so each layer loops without a seam; a sprite whose dimensions don't respect that coupling will visibly jump.

**Already built — do NOT re-scope (checked 2026-07-31):** *"Move the boat quickly square by square
along the trade winds"* was on Wyatt's 2026-07-31 list, but it shipped as **G14 on 2026-07-30** and is
live on `main`. `animateRimSweepIfAny()` (`src/ui/flow.js:374`) steps the ship one square at a time
along the arc at `RIM_SWEEP_STEP_MS` = 95 ms (`src/ui/util.js:975`), for host and guest alike, and it
re-derives the path geometrically rather than adding to the event stream. Wyatt ruled **"drop it —
already done"** on 2026-07-31. If the pacing is ever revisited, it is a one-constant tuning change,
not a feature.

### About Page (ABOUT) — added 2026-07-31, HIGH PRIORITY

- **ABOUT-01**: A beautiful About page exists containing the rules, a screenshot of the game in action, the credits, and the Ko-Fi "buy me a coffee" button.
- **ABOUT-02**: The About page is reachable by its own link from the homepage.

**Two overlaps to resolve during planning, not during execution:**

- **The rules already exist twice** — in the How-To-Play modal (`index.html`, the `<h4>`/`<p>` rules block around `:760`) and in `RULES.md` / `Rules_boardgame.md`. Decide deliberately whether the About page shares one source with the modal or deliberately duplicates it; a third divergent copy of the rules is the failure mode.
- **The Ko-Fi button is already KOFI-01** (v1.2 Phase 16, footer + Credits modal). ABOUT-01 is a third placement of the same embed, not a new integration — sequence it after KOFI-01 or share the markup.

**This is also the real fix for META-01.** The screenshot is the first in-page image the site has ever
had, and an in-page image is what Google promotes into a result thumbnail. Plan the two together.

### Narration Pacing (NARR) — deferred from v1.2 (2026-07-31)

Phase 18 was scoped in v1.2's roadmap and cites NARR-07, but **NARR-07 was never written into this
file** — the phase referenced a requirement that did not exist. Recorded here rather than invented
retroactively into the v1 section, because it was not delivered in v1.2.

- **NARR-07**: Narration reads as running commentary that never gates play. `flash()` is awaited at
  **27 call sites** today, each blocking the game loop for `typewriter reveal + msgHoldMs(text) +
  500ms`; after this work, narration timing is a display concern only. A player who acts before a
  line finishes must not stall anyone else, the next line must replace the current one for every
  player at once, and host and guest must share one timing source (`msgHoldMs`) so the D-57 failure
  mode cannot recur. **Success is judged by a real two-player playtest before and after** — removing
  the block must not make a busy round unreadable, and no unit test can settle that.

Partially tracked already by `.planning/todos/pending/narration-two-schedulers-unenforced.md`
(`flash()` and `showNarration()` are two schedulers on one element, recorded and unenforced).

### Interactive Tutorial (TUT) — deferred from v1.2

- **TUT-01**: A 30–60s interactive tutorial that walks new players through the goal, board features (Tortuga, islands, ingredients, boats, rival boats, wind compass, click-to-move), the captains box (your row, needed ingredients red/green/yellow, dubloons), the flippenator, the turn clock, the narration box, and the steps of a turn — following best practices for games of this type
- **TUT-02**: When the tutorial finishes, the player is automatically dropped into a solo game continuing with the choices they made during the tutorial
- **TUT-03**: A thin yellow "How To Play" button sits above the four play-mode buttons, beneath the Player Name field, to launch the tutorial

### Sound Effects (AUDIO) — deferred from v1.2

- **AUDIO-01**: Luis's sound effects (staged in `sfx/`) play at appropriate game moments, on by default (e.g., `fishing.mp3` also plays when dropping anchor in a storm)
- **AUDIO-02**: A mute button sits to the right of the turn clock
- **AUDIO-03**: Luis is credited for the sound effects in the Credits modal

### Island Redesign (ISLAND) — deferred from v1.2

- **ISLAND-01**: Every island is 4 squares (not 3)
- **ISLAND-02**: Each island has a unique shape/orientation
- **ISLAND-03**: An island's ingredients are placed on adjacent squares
- **ISLAND-04**: Island art is placed on the square that has no ingredient
- *(Note: touches deterministic board generation — must be re-baselined against the determinism oracle)*

### Asset Loading (LOAD) — deferred from v1.2 (found during Phase 13 discussion, 2026-07-25)

- **LOAD-01**: On a slow internet connection the game must not reveal itself until its assets are ready — the boot loader should stay up until loading completes, instead of being hidden after a fixed 6s cap that a slow connection blows past. *(Observed live: game appeared with art still streaming in. Root cause: `Promise.race([preloadAssets(), setTimeout(…, 6000)])` at `src/orchestrator.js:1076` hides the loader after whichever comes first — the 6s escape hatch wins on slow connections. The 6s cap exists to avoid a hung loader on a dead image host, so any fix must preserve a bailout for genuinely failed/offline asset hosts, e.g. a longer/adaptive timeout or progress-based reveal rather than removing the cap.)*
- **LOAD-02**: The preload set should cover all first-view art, not just the board cluster — `preloadAssets()` at `src/ui/util.js:707` currently waits only for board/dock/wind/trade/logo/boats/islands/ingredients and omits icons (3.4 MB), badges, compass, and clock, so those still pop in. *(Context: total initial download is ~18 MB of images — board.png alone is 4.5 MB, pastries 5.3 MB, icons 3.4 MB. Asset-size reduction/optimization is a separate, larger concern and is out of scope for this loading-gate fix.)*
- **LOAD-03**: `playpastrypirates.com` must load fast for every visitor without forcing the full ~18 MB game download up front. The **welcome screen is the default first screen** for anyone who has never visited — the "hoisting the sails" boot loader must NOT appear before it. Heavy game assets are downloaded **only after the player chooses to play** (e.g., clicks a play-mode button), and the "hoisting the sails" load screen is shown at THAT point — gating entry into the game itself, not the initial site visit. *(Wyatt, 2026-07-25. This supersedes the current boot flow where `preloadAssets()` + boot loader run at page load in `boot()` — LOAD-01/02's "keep the loader up until assets are ready" applies to this post-play load gate, not the initial welcome paint. Lazy-loading the 18 MB is the core win; also complements any future asset-size reduction.)*
- **LOAD-04**: Optimize the game's image assets to shrink the total package from ~18 MB down to a target of **~3–5 MB**, without a visible quality drop in-game. This is the asset-size-reduction concern LOAD-02 explicitly deferred (distinct from the loading-gate/lazy-load fixes): compress and right-size the heavy art — board.png (~4.5 MB), pastries (~5.3 MB), icons (~3.4 MB) are the biggest wins — via e.g. PNG→optimized-PNG/WebP conversion, resolution/dimension trimming to actual on-screen size, and stripping metadata. Complements LOAD-01/02/03 (a 3–5 MB package makes the load gate near-instant on most connections) and any future work, but stands alone as its own optimization pass. *(Wyatt, 2026-07-25. Keep the emoji fallback path intact; must still run correctly in Safari and Chrome.)*

### Carried forward from v1.1 (still deferred)

- **NETMOD-01**: Migrate from Firebase compat SDK to the modular v9+ SDK (cleaner unsubscribe story)
- **DX-01**: JSDoc typedefs for event objects to reduce loosely-typed event bugs
- **DX-02**: Isolated pure replay-runner function extracted proactively (only if the replay seam surfaces bugs)

## Out of Scope

Explicitly excluded for v1.2. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Interactive tutorial, sound effects, island redesign | Large features split out of v1.2 by decision (2026-07-25); each warrants its own milestone slice — island redesign additionally touches deterministic board generation |
| Bundler / minifier toolchain (Vite/esbuild/rollup) | Native ES modules preserve the "no build step" principle |
| TypeScript migration | Out of scope; multiplies blast radius |
| New game modes or mechanics beyond the deferred features | Still expansion, not this polish pass |

## Traceability

Which phases cover which requirements. Populated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CLOCK-01 | Phase 13 | Complete |
| CLOCK-02 | Phase 13 | Complete |
| CLOCK-03 | Phase 13 | Complete |
| STORM-01 | Phase 14 | Complete |
| AI-01 | Phase 14 | Complete |
| NARR-07 | Phase 18 | **Deferred to v1.3** — never planned; see Future Requirements |
| NARR-01 | Phase 15 | Complete |
| NARR-02 | Phase 15 | Complete |
| NARR-03 | Phase 15 | Complete |
| NARR-04 | Phase 15 | Complete |
| NARR-05 | Phase 15 | Complete |
| NARR-06 | Phase 15 | Complete |
| UI-01 | Phase 16 | Pending |
| UI-02 | Phase 16 | Pending |
| UI-03 | Phase 16 | Pending |
| UI-04 | Phase 16 | Pending |
| UI-05 | Phase 16 | Pending |
| UI-06 | Phase 16 | Pending |
| UI-07 | Phase 16 | Pending |
| META-01 | Phase 16 | Pending |
| META-02 | Phase 16 | Pending |
| KOFI-01 | Phase 16 | Pending |
| VERIFY-01 | Phase 17 | Pending |
| VERIFY-02 | Phase 14 | Complete |

**Coverage:**

- v1 requirements: 23 total
- Mapped to phases: 23 (Phases 13–17)
- Unmapped: 0

**Per-phase counts:** Phase 13 (3) · Phase 14 (3) · Phase 15 (6) · Phase 16 (10) · Phase 17 (1) = 23

---
*Requirements defined: 2026-07-25*
*Traceability populated: 2026-07-25 (roadmap created — Phases 13–17)*
*Updated 2026-07-25 — folded two backlog bugs into scope: AI-01 (bot hail/action rule → Phase 14) and UI-07 (EOV empty narration box → Phase 16)*
