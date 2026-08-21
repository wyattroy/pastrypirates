---
phase: quick
plan: 260821-qwv
type: quick
autonomous: true
requirements: [PAR-08]
files_modified:
  - 4/src/ui/stage.js
  - 4/index.html
  - 4/scripts/playtest_gate.mjs
  - 4/scripts/lib/vision.mjs
---

# Quick Task 260821-qwv: The phone layout pass — four placement faults, two instrument faults

## Objective

Wyatt's pick, 2026-08-21 evening: *"phone pass then group e immediately after — finish everything
and qa it all so that i only have to do one playtest."* This is the phone half. The 2026-08-21
playtest gate judged 53 screens failing, 40 on the phone; re-sorted BY CAUSE from the screenshots
(still on disk: `/private/tmp/claude-501/-Users-wyattroy-Documents-Projects-pastrypirates/91e57721-f5bb-4cd1-8845-2233c96ab54c/scratchpad/final/`)
and the code, four placement faults explain ~33 of those 40 and all three structural failures.
Two more "faults" were the instrument (D-42, D-43) and are fixed in the gate, not the game.

**What a player gets:** on a phone, no prompt text box runs off the right edge; the "Tap and hold
the sea" hint never sits on a button; "Stay put" never covers a sail square you have to tap; the
recipe picker is solid instead of see-through; the ◀ back circle never peeks above the ribbon.
**Leaves undone:** fan crowding (~8 findings — measure and note only), Group E, Group D.

## Read first (rule 20; the hook will refuse the first stage.js edit otherwise)

- `docs/BOARD-RENDERING.md`, `docs/DISPLAY-RULES.md`, `docs/DRIVING-THE-GAME.md` §8a/§8b
- `.planning/phases/02.2-a-captain-who-cannot-take-their-turn/02.2-CONTEXT.md` D-37..D-43
- `docs/HARD-WON-LESSONS.md` §2 (measure, don't infer) and §4 (probe hygiene)
- Rule 9: nothing is a constant — clamp against measured rects, `vwPx()`, `boardBand()`,
  `capBandBottom()`, `tSafe`. Rule 8: when you fix a placement rule, sweep the sibling boxes that
  obey the same rule and say which you checked.

## Tasks

### Task 1 — the four placement faults (auto)

**Files:** `4/src/ui/stage.js`, `4/index.html`

1. **Right-edge clipping of the ask pill `.apMsg` — 18 judge findings** (`solo-phone-017.png`:
   box starts x≈95 of 390 and runs off; `passplay-phone-023.png`: starts x≈182). In the radial
   branch (`stage.js` ~1940) `const mw = Math.min(msg.offsetWidth || 200, vwPx() - 20)` is read
   BEFORE `msg.style.maxWidth` is capped (~1953) and while the box may be unlaid-out (`offsetWidth`
   0 → 200). `left` is then chosen for a ~200px box, the box grows to its 88% cap, and the right
   edge leaves the screen. The `radKey` memo and the per-turn `pillLock` freeze that wrong `left`.
   **Fix:** apply the cap first, measure after; and in the per-tick section that runs ABOVE the
   memo (where `liftAskClearOfFan` is called) re-clamp `left` every tick against the box's real
   `offsetWidth`: `left = min(left, vwPx() - w - 10)`, `left = max(left, 10)`. Keep `pillLock.cx`;
   only the clamp moves. **Sweep:** the narration bubble `.pp4Bub` (`place()` ~967–1020) was also
   judged clipped (`solo-phone-013/022/023/027`). It re-measures `bw` every 500ms and clamps
   against `band.right` — check whether `boardBand().right` can exceed `vwPx()` on phone and
   whether the first placement happens at `bw=0`; fix by the same rule if so. Also `.apSub` and
   `.apSliderWrap` (~2022–2037) already clamp — confirm, don't touch.
2. **The peek hint on top of buttons — 5 findings + ALL 3 structural failures**
   (`solo-phone-020.png`: hint over "Stay put"; `passplay-phone-023.png`: over the ✓;
   `passplay-phone-024/029`, `solo-desktop-014/022`; gate-log `[1733s]` passplay-phone:
   `sail-clickable: 9 sail square(s) covered: a sail square <- #apStay`, plus `no-pile` and
   `not-occluded` on the same screen). `peekHintTick()` (~273) pins the hint at
   `band.bottom - 44`; the Stay-put card (~2247, `top = capTop - H - 6`, "least-bad: hug the
   captains box") and a cornered fan use the same strip; nothing dodges anything.
   **Fix (two halves):** (a) the hint is `pointer-events:none` text, so IT yields: each tick
   collect the fixed rects of `.apBtn`, `#apStay`, `.apSliderWrap`, `.sailCell`; keep
   `band.bottom - 44` if that strip is clear of all of them, else place it just under the wind
   pill/ribbon (`tSafe`), else hide it for that tick. (b) the Stay-put fallback must NEVER sit on a
   `.sailCell` — D-38's one hard rule. Dodge the sail rects the way the narration bubble already
   does (same search shape: the two vertical spots, then the least-covering), never cover a sail
   square, and say in the summary which spot it takes when nothing is clear.
3. **See-through recipe picker — 6 findings** (`solo-phone-004/005`, `passplay-phone-004/005/007/008`:
   "CAPTAINS" and captain names ghost through the cards). `4/index.html:1534`
   `#pp4Prompt { opacity:.96 }`. **Fix:** the resting prompt layer is opaque (`opacity:1`); the
   hold-the-sea fade (`body.pp4Peek` selector list ~1539) keeps its own faded value. Check the
   `.16s` transition still animates the peek. **Sweep:** confirm the radial fan's circles and the
   ask pill don't rely on that .96 for any look Wyatt approved (git log -S "opacity:.96").
4. **The ◀ back circle peeking above the ribbon — 4 findings** (`passplay-phone-014/015/016/028`:
   a grey half-circle above "DAY N" at top-left). `stage.js` ~1996: `back.style.top = pillB.top +
   (pillB.height - 38)/2` has no floor. **Fix:** clamp into the band (`>= tSafe`) exactly as its
   neighbours do; keep it on the pill's left shoulder.
5. **Fan crowding — NOT in scope.** While you have the screens open, note what you see on
   `passplay-phone-022/027/028`, `solo-phone-021/024/026` in the summary. Change nothing.

**Verify:** `node 4/scripts/no_undef_check.js`; `node 4/scripts/stage_layout_check.mjs --out=DIR`
passes at all five sizes — OPEN the contact sheet and look. Then a posed phone screen for each of
the four faults (DRIVING-THE-GAME §5e, solo only), screenshotted at 390×664, read by you, kept in
`.planning/quick/260821-qwv-phone-layout-pass-right-edge-clipping-hi/shots/`.
**Done:** each of the four has a before/after pair of screenshots and the fix is one clamp/one
property, derived, with the siblings it shares a rule with named.

### Task 2 — the two instrument faults (auto)

**Files:** `4/scripts/playtest_gate.mjs`, `4/scripts/lib/vision.mjs`

1. **D-42.** The phone legs (~line 221: `"solo-phone": { W: 390, H: 844, mobile: true, dsf: 2 }`)
   emulate a phone with no browser bar — 180px a real Safari never gives a page. Wyatt: *"it does
   not appear on my phone, in either safari or chrome… the search bar is down there."* Change both
   phone legs to `H: 664` with a comment naming D-42 (the viewport an iPhone 14-class Safari gives
   the page with its bottom bar). This is the whole "dead space under CAPTAINS" class (8 findings).
2. **D-43.** In the vision rubric add two ACCEPTED lines, phrased over roles (no screen names):
   a scrollable card may be cut at the bottom of the screen (it scrolls); board art may be clipped
   at the board's edge by the camera. Nothing else in the rubric changes.

**Verify:** `node --check` both; the gate's `--legs=solo-phone` boot reaches the first prompt at
664 (`stage_layout_check`'s 390 size should also be re-run at 664 if it takes a height — read it).
**Done:** phone legs are 390×664; rubric carries the two accepted lines.

### Task 3 — prove it on the phone legs, stamp, commit (auto)

1. `node 4/scripts/playtest_gate.mjs --legs=solo-phone,passplay-phone --out=DIR --judge=on`
   (≈20–25 min unattended; headless, `--mute-audio`, own ports). READ every screen the judge fails.
2. Report in the SUMMARY, against yesterday: judge findings **19 / 21** → ?, structural failures
   **3** → ?, and list any remaining finding by cause. The four fixed classes must be at zero or
   the summary says which screen still shows one and why.
3. Bump `PP4_STAMP` in `4/src/ui/stage.js` to `2026-08-21h`.
4. Commit (game fix commit + instrument commit, or one — your call; long commit message in this
   repo's style saying WHY). **Do NOT push** — one drop at the end of the evening (Wyatt's ruling).
5. Kill your own Chrome/server ports before returning: `pkill -f "remote-debugging-port=PORT"`,
   `pkill -f "http.server PORT"`. Never a bare pkill.

**Done:** SUMMARY.md written with the before/after counts, screenshot paths, the sibling sweep,
and the fan-crowding notes; `git status` clean except nothing; stamp `2026-08-21h` in the tree.
