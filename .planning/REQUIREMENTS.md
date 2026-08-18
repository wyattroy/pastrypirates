# Requirements: Pastry Pirates — v2.0 The New Game

**Defined:** 2026-08-18
**Core Value:** The game must stay playable and fair end-to-end in both Safari and multiplayer — a
storm must not crash the game, and pausing the multiplayer timer must never destroy game state.

> **Read before planning any phase:** `.planning/research/v2.0-intake/` — five reports, 1,803 lines,
> reconstructing the `4/` development period, which produced no GSD artifacts. Every requirement
> below traces to a measured finding in one of them.

> **The milestone order is a constraint, not a preference.** Multiplayer → cutover → desktop. The
> live game must never lose multiplayer, so `4/` stays at `/4` until it can host a networked game.

---

## v2.0 Requirements

### Multiplayer (MP)

The Firebase tags were deliberately removed at `4/index.html:28` with a comment saying how to restore
them. `4/src/net/` is **byte-identical** to the live net layer in `readers`/`registry`/`watchers`/
`writers`; `index.js` differs by 6 lines. This is a revival, not a rebuild — except for the bake-off.

- [ ] **MP-01**: A player can host a networked game from the promoted build and share a room code
- [ ] **MP-02**: A second player can join by room code, claim a seat, and be named without collision
- [ ] **MP-03**: A guest sees the host's board, ships, narration and prompts in sync for a full voyage
- [ ] **MP-04**: A player can take a bake-off turn in a networked game
- [ ] **MP-05**: A rival cannot see the contents of another captain's bowl until the reveal
- [ ] **MP-06**: A player can spend coins mid-bake-off (the pay-to-rewatch button) in a networked game
- [ ] **MP-07**: A player can make and receive trade counter-offers in a networked game
- [ ] **MP-08**: A player can use the coin slider in a networked trade (local-path only today — flagged in `c8e2937` as *"must be closed if /4 ever ships online multiplayer"*)
- [ ] **MP-09**: A multi-captain trade completes inside one turn without stalling the table (~5 sequential round trips today)
- [ ] **MP-10**: Hiding or backgrounding a tab does not pause or resume the shared clock for everyone (`4/src/main.js:148` writes the shared `paused` node; currently safe only because it sits behind `soloBotGame()`)
- [ ] **MP-11**: Fast-forward cannot let one player skip narration other players are still watching (`4/src/state/index.js:99`)
- [ ] **MP-12**: A host who reloads mid-voyage resumes from the decision log with the game intact

### The One New Rule (RULE)

**Wyatt, 2026-08-18:** *"There is just ONE new gameplay rule that i want added to this new build:
passing gives the player one Dubloon and we need to adjust their narration to account for that."*

Pass is the turn-ender that replaced fishing (`RULES-V2.md` §3) — always available, never disabled,
and it narrates one of 50 hand-written sea creatures stored in both persons.

- [ ] **RULE-01**: A captain who passes receives 1 dubloon. All three `{t:"pass"}` emission sites pay it — the human menu (`4/src/ui/flow.js:1861`), `4/src/ui/flow.js:2140`, and the bot fallback (`4/src/engine/index.js:2993`). Per the standing bot/human parity invariant this is not an open question: bots pass, so bots are paid.
- [ ] **RULE-02**: The pass narration tells the captain they were paid, in **both** the addressed and third-person renderings, across all 50 sea-creature entries. The established treatment for a coin gain already exists and should be reused rather than re-invented — `(+1🌕)` inside a `nobrk` span so the name and its amount never split across a line break (G27/P7, `4/src/ui/flow.js:2231`).

> **Sequencing constraint — this rule must land BEFORE TEST-03.** Paying a dubloon changes what the
> engine writes into the event stream, which invalidates any determinism corpus recorded before it.
> Recording the v2 corpus first would mean recording it twice. This is the same one-way re-record
> cost that shaped v1.2's Phase 14 — see `docs/DETERMINISM-RERECORD.md`.

> **Balance note, flagged not blocking.** Paying for the always-available turn-ender creates a
> reason to pass rather than act, which is a new incentive in the economy. It is measurable rather
> than arguable — the race-planner bot ladder that fitted on 27,867 outcomes can be re-run to see
> whether pass-farming beats playing. Worth doing during the phase; not worth debating first.

### Test Harness & Determinism (TEST)

Root `npm test` runs 21 gates and passes — **not one of them loads `4/`**. This is the exact "gate
scanning the wrong tree" trap in `docs/HARD-WON-LESSONS.md` §3.

- [ ] **TEST-01**: `4/src/ui/stage.js` imports under Node without throwing (bare `addEventListener` at `:190` makes the largest new module — 1,545 lines — untestable headlessly today)
- [ ] **TEST-02**: `4/scripts/no_undef_check.js` exits 0 (fails today, exit 1)
- [ ] **TEST-03**: A determinism corpus exists for the v2 engine and verifies green
- [ ] **TEST-04**: The contract gates — engine, module graph, net, state, UI — run against the promoted tree
- [ ] **TEST-05**: `npm test` covers the promoted game, and its gate count is stated in `package.json`
- [ ] **TEST-06**: Host/guest parity is mechanically gated, not maintained by discipline
- [ ] **TEST-07**: The two dangling citations are made true or removed — `4/src/orchestrator.js:880` and `4/src/ui/util.js:1484` each claim a check gates them; neither check exists

### Cutover (CUT)

A one-way promotion. `4/` forked 2026-08-11; the root has had no code commit since 2026-08-02.

- [ ] **CUT-01**: `playpastrypirates.com` serves the promoted game
- [ ] **CUT-02**: Today's game stays playable at `/classic`, so no existing bookmark breaks
- [ ] **CUT-03**: `v2/`, `v2bakeoff/` and `3/` are removed from the working tree (~40k lines; preserved in git history)
- [ ] **CUT-04**: The promoted game is indexable — `noindex, nofollow` removed from `4/index.html:10`, `robots.txt` `Disallow: /4/` resolved, `sitemap.xml` correct, and the page title no longer reads `v3 bot test`
- [ ] **CUT-05**: Every image resolves from the root (`ASSET_BASE="../assets/"` at `4/src/shared/index.js:24` points one directory above the app)
- [ ] **CUT-06**: The About page is reachable from the promoted game (`about.html` links 404 at `/4` today)
- [ ] **CUT-07**: A returning player's saved voyage and preferences survive the cutover
- [ ] **CUT-08**: `CNAME`, `robots.txt` and `sitemap.xml` are correct for exactly one live deployment and appear in no other tree

### Desktop & Widescreen (DESK)

`4/` has **no desktop layout** — not broken, absent. Zero `min-width` media queries in the build.
The stage camera derives its height from window aspect ratio (`4/src/ui/stage.js:227`), so the clamp
that shows the whole board can only fire on a portrait phone.

- [ ] **DESK-01**: The whole board is visible on a laptop screen without dragging (5.9 of 15 rows at 1440×900 today; 6.5 of 15 at 2560×1440)
- [ ] **DESK-02**: A legal sail square and a battle opponent are never off-screen on a wide display (`camFitSail()` promises this and cannot deliver it in landscape)
- [ ] **DESK-03**: On a wide screen the captains occupy a right-hand column rather than a 2560px-wide band
- [ ] **DESK-04**: Controls are sized and placed for a mouse on desktop, not for a thumb (~60 hardcoded pixel values — 66px circles, 290px bubbles, 250px captains band)
- [ ] **DESK-05**: Hover states are visible on the primary controls (`#pp4Prompt.radial .apBtn` at specificity 1-1-1 beats `.apBtn:hover` at 0-2-0, so hover is dead on every prompt button)
- [ ] **DESK-06**: The game is playable with a mouse and keyboard — cursor affordance on the draggable board, wheel zoom, and a visible focus ring
- [ ] **DESK-07**: Board and boat art is crisp on a high-resolution display (boats are 136×221 sources shown at up to 3.4×)
- [ ] **DESK-08**: The phone layout is visually unchanged by the desktop work

### The Written Record (DOC)

`4/RULES-V2.md` was copied in on 2026-08-11 and never edited — byte-identical across `v2/`,
`v2bakeoff/`, `3/` and `4/`, header still reading "Lives in `v2/`". 3 of 10 spot-checked rules
disagree with the code.

- [ ] **DOC-01**: The ruleset document describes the game the code actually plays — including the bake-off (its §12 is currently titled "No bakeoff"), the black market (absent entirely), and dock heads at 5 not 6
- [ ] **DOC-02**: The ~40 design rulings that exist only in commit bodies are recorded in `docs/`
- [ ] **DOC-03**: The 13 copy strings approved on 2026-08-14 are recorded outside the git log
- [ ] **DOC-04**: The rejection graveyard — rim routing, wind-aware routing, three hail-reach shapes, two forecast-on-dial designs, the harbormaster 2-for-1 — is readable without git archaeology
- [ ] **DOC-05**: Docs addressed to `v2/`, `v2bakeoff/` or `3/` are re-pointed at the promoted tree
- [ ] **DOC-06**: `docs/DRIVING-THE-GAME.md` import paths target the promoted tree, so a playtest probe cannot inject state into the wrong copy
- [ ] **DOC-07**: `README.md` describes the promoted game and the `/classic` URL

### Standalone Fixes (FIX)

- [ ] **FIX-01**: Visiting the development build no longer turns the turn clock off in the live game (`4/src/ui/stage.js:1478` force-writes the shared, un-namespaced `pp_timerOff`) — **fix independently of any promotion decision**
- [ ] **FIX-02**: `?ovens=1` (skips the entire 16-day voyage) and `?windhud=1` are gated or removed before the game is public
- [ ] **FIX-03**: The sparse-draft crash at `4/src/orchestrator.js:1591` is fixed, along with the unguarded `.val()` at `:1501` and the unescaped host HTML at `:1239`
- [ ] **FIX-04**: Safari storm performance is re-measured on a real device — the BUG-01 fix is intact, but rain is now full-viewport (~5× paint area) and a 60fps camera tween runs during storms, and this has never been measured on Safari
- [ ] **FIX-05**: The wind-dot prototype's shipping default is a decision, not an accident (`4/src/ui/board.js:570` ships `true` at 20 dots; live deliberately keeps it `false` at 10)
- [ ] **FIX-06**: The dead bot brain is resolved — `planTurnClassic` (`4/src/engine/index.js:2739`, ~210 lines) has zero callers and `planTurn:2197` dispatches to v3 unconditionally

---

## Future Requirements

Acknowledged, not in this milestone.

### Determinism hardening (DTRM)

Irrelevant under host authority; only bites if the design ever moves to true lockstep.

- **DTRM-01**: `Math.exp` at `4/src/engine/index.js:2537` compared against a `1e-12` epsilon
- **DTRM-02**: ~6 sorts without explicit tiebreaks, notably `stormOrder` at `:506` where ties are common

### Back-port to v1 (BACK)

- **BACK-01**: `4/src/main.js:211` and `4/src/orchestrator.js:1697` close real gaps the live game still has — **deferred, not dismissed**: v1 is being retired to `/classic` as a frozen archive, so the value of fixing it is small. Revisit only if `/classic` turns out to get real traffic.

### Carried from v1.3

- **STORM-02**: multiplayer guest storm-push parity — re-assess against the v2 engine; the v1 analysis (that it forces a determinism re-record) may no longer apply
- **META-03**: Google Search Console verification — Wyatt's own action, and now blocked behind CUT-04

---

## Out of Scope

| Feature | Reason |
|---|---|
| Any new gameplay rule **beyond RULE-01** | v2.0 promotes and hardens the game that exists. **One sanctioned exception**, granted by Wyatt on 2026-08-18: passing pays a dubloon (RULE-01/02). Every further rule change invalidates the determinism corpus being recorded and the spec being written from the code, so a second exception costs a re-record — raise it as a v2.1 candidate, not as scope creep here. |
| Merging v1 fixes into the new tree | One-way cutover. Root has had no code commit since 2026-08-02, so there is nothing to merge. |
| Phase 20 "The Board Comes Alive" (v1.3) | Retired unbuilt. `4/` built drifting wind and whirlpools independently, and v1 is being retired to `/classic`. |
| Keeping `v2/`, `v2bakeoff/`, `3/` on disk | Five copies make every "which file?" question ambiguous. All three are fully preserved in git history. |
| A bundler/minifier toolchain | The no-build-step principle survives the promotion — `4/` is already native ES modules. |
| TypeScript migration | Unchanged from v1: out of scope. |
| Rival bowls visible during the bake-off | Wyatt's call, 2026-08-18: private until the reveal, matching how the scene feels solo. Recorded here so the cheaper always-visible option is not re-proposed as a shortcut when MP-05 proves hard. |
| A centred phone column on desktop | Wyatt's call, 2026-08-18: true widescreen. Recorded so the letterbox option is not revived as a schedule saver. |

---

## Traceability

Populated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| _(pending roadmap)_ | — | — |

**Coverage:**
- v2.0 requirements: 50 total (MP 12, CUT 8, DESK 8, DOC 7, TEST 7, FIX 6, RULE 2)
- Mapped to phases: 0 (roadmap pending)
- Unmapped: 50 ⚠️

---
*Requirements defined: 2026-08-18*
*Last updated: 2026-08-18 after v2.0 milestone opening*
