# Storm Text Audit (NARR-06)

**For:** Wyatt — this is the catalogue for you to rewrite. Nothing here has been changed.
**Generated:** 2026-07-22
**Source:** `index.html`

Every piece of text a player can see from the moment a storm is rolled until it resolves. Grouped by when it appears. Line numbers are current-as-of-audit — verify before editing.

---

## 1. Round header — the storm announcement

`index.html:2357` — `EVENT_NARRATION.newround`

| Case | Current text |
|------|--------------|
| **First storm** | `— Round {N}: ⛈️ STORM! Wind blows {DIR}, then {DIR2} —` |
| **Second storm in a row** (`streak >= 2`) | `— Round {N}: ⛈️ The storm's baked in and refuses to cool down! Now it's aiming {DIR}, then {DIR2}. Batten down the hatches, ye scurvy lot! —` |
| *(non-storm, for contrast)* | `— Round {N}: wind blows {DIR} —` |

> **Note — this is where NARR-03 and NARR-04 land.** NARR-03 wants "it's still {DIR}" instead of "now" when the direction repeats. The streak variant above already says "Now it's aiming" — that's the exact string to change. NARR-04 wants added narration for *any* wind (not just storms) holding two turns running ("this southerly is gusting", "won't quit"). There is currently **no** sustained-wind line for non-storm rounds at all — that copy needs to be written from scratch.

---

## 2. Human prompt — blown toward an island

`index.html:3588-3590` — the `ask()` prompt

| Case | Current text |
|------|--------------|
| Normal (has coins) | `{Player}: the storm blows you toward an island! (Flipping is a gamble — tails costs you.)` |
| Broke **and** empty hold | `{Player}: the storm blows you toward an island! Yer broke — if ye run aground, ye'll lose yer turn!` |

### Button labels — `index.html:3578-3587`

| Case | Current text |
|------|--------------|
| Pay option (needs ≥1🌕) | `Pay 1🌕 to dodge` |
| Flip — has coins | `Flip! Heads: dodge. Tails: lose half 🌕` |
| Flip — broke, has crates | `Flip! Heads: dodge. Tails: lose a crate!` |
| Flip — broke, empty hold | `Flip! Heads: dodge. Tails: ye'll lose yer turn!` |

### Flip modal title — `index.html:3595`

`Flip to drop anchor!`

---

## 3. Outcome narration — what happened to the ship

All from `EVENT_NARRATION`, `index.html:2358-2371`.

| Event | Line | Current text |
|-------|------|--------------|
| `windmove` | 2358 | `{Player} drifts with the wind` — caption: `🌬️ drifts` |
| `blownOut` | 2359 | `⛵ A gale blows {Player} out of the harbor!` |
| `dodge` | 2361 | `{Player} pays 1🌕 to dodge an island` — caption: `💨 dodges −1🌕` |
| `anchor` | 2362 | `{Player} flips ⚪HEADS — drops anchor safely!` — caption: `⚪H drops anchor ⚓` |
| `moored` | 2363 | `The dock steadies {Player} from running aground ⚓` |
| `blocked` | 2364 | `Spotting {Other} dead ahead, {Player} strikes sail and holds fast.` |
| `anchorHold` | 2365 | `{Player}'s anchor already down — it holds fast, no need to pay twice in one storm ⚓` |
| `tradewind` | 2366 | `🌀 {Player} is swept along the trade winds around the rim!` |
| `aground` (has crates) | 2368 | `{Player} flips ⚫TAILS — runs aground! A crate of {ingredient} tumbles overboard and floats back to its island ⚠️` — caption: `⚫T aground! {emoji} overboard` |
| `aground` (coins only) | 2368 | `{Player} flips ⚫TAILS — runs aground! Loses half their coins ⚠️` — caption: `⚫T aground! 💥 −half 🌕` |
| `shipwrecked` | 2371 | `{Player} is shipwrecked, and spends their turn making repairs.` — caption: `🛠️ shipwrecked — repairs all turn` |

---

## 4. Trade-wind flash message

`index.html:3615` (also 4180, 4251 — **three copies of the same string**)

| Case | Current text |
|------|--------------|
| It's you | `🌀 The trade winds sweep you around the rim!` |
| It's someone else | `🌀 The trade winds sweep {Player} around the rim!` |

> **Worth knowing:** this string is duplicated at three call sites with slightly different flash durations (1300ms at 3615, 1200ms at 4180 and 4251). If you rewrite it, all three need the same edit — or it should be pulled into one constant. Flagging as a small cleanup opportunity.

---

## 5. Compass HUD label

`index.html:2554` — `stormText.textContent`

Current: `⛈️ STORM` (red `#e63946` while storming)

> **Note:** UI-05 in Phase 4 removes this entirely ("Remove the word STORM from underneath the compass and the emoji/image next to it"). So this one is already slated for deletion — no rewrite needed unless you change your mind.

---

## 6. Rules-panel copy (not narration, but storm-facing)

`index.html:683` — the ⛈️ Storms help section

> Roughly 3 in 20 rounds brews a storm — the only time the wind moves you without your say-so: it forcibly pushes everyone 2 squares, then spins and pushes 2 more. Moored ships are safe — if you docked last turn, sit at a berth, or are at the Isle of Tortuga, the storm can't push you into land. Otherwise, blown at an island you must pay 1🌕 to dodge or flip: heads drop anchor safely, tails run aground — lose half your coins, or a crate if you're broke, or the whole turn to repairs if your hold's empty too! The wind never blows you onto a full dock.

---

## Summary for rewriting

**Total distinct strings: 24** across 6 locations.

Things I noticed while cataloguing, for whatever they're worth:

1. **Voice is inconsistent.** Some lines are full pirate ("Yer broke", "ye scurvy lot", "Batten down the hatches"), others are flat and modern ("{Player} drifts with the wind", "{Player} pays 1🌕 to dodge an island"). The dodge/windmove/aground lines read like system messages; the prompts read like a pirate narrator.

2. **`anchorHold` is the most mechanical line in the set** — "no need to pay twice in one storm" explains a *rule* rather than narrating an *event*. Strongest candidate for a rewrite.

3. **Second-storm line is the only one with real personality** ("baked in and refuses to cool down"). If that's the target voice, most of section 3 is well below it.

4. **No sustained-wind copy exists** for non-storm rounds — NARR-04 needs new writing, not a rewrite.

5. **Three duplicated trade-wind strings** (§4) — rewrite once, apply thrice, or refactor to a constant.

6. `⛈️ STORM` (§5) is slated for removal by UI-05 anyway.

---

*Audit only — no text was modified. Hand back your rewrites and I'll apply them.*
