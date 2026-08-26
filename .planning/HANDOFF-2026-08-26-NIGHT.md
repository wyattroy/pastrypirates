> # ⚠ SUPERSEDED — written an hour BEFORE the cutover, and it describes the old layout.
> **Read [`HANDOFF-2026-08-26-CUTOVER.md`](HANDOFF-2026-08-26-CUTOVER.md) instead.** `4/` is now the
> repo root and v1 is at `classic/`, so every path below is wrong. Kept for its findings only.

# Handoff — 2026-08-26, night

**Live build: `2026-08-26j`.** `main` level with `origin/main`. 5 commits this session.
**The first full 8-leg sea trial in this project's history completed — twice.**

> ## READ THIS FIRST
> **Five separate instruments were wrong today, and none of them looked broken.** The lessons are
> [`docs/HARD-WON-LESSONS.md` §10](../docs/HARD-WON-LESSONS.md); the process they produced is
> [`docs/QA-PROCESS.md` → THE WHOLE LOOP, END TO END](../docs/QA-PROCESS.md). If you change how
> anything is tested, read that section before you touch it.

---

## 0. THE ONE UNFIXED THING THAT MATTERS — sail squares a guest cannot tap

`crew-phone`, guest, during a **tap-to-sail** prompt — `crew-phone-guest-006-settled.png`:

```
FAIL on-screen      : clickable off-screen: sailCell, sailCell
FAIL not-occluded   : sailCell covered by #pp4Cap
FAIL sail-clickable : 3 sail square(s) covered
```

**This is D-38's "one unacceptable outcome": a control the player cannot hit.** Two sail squares are
off-screen and one sits under the captains panel, so a guest on a phone has legal moves they cannot
reach. **It is on the SETTLED shot, not mid-animation** — the gate separates those (`fails` vs
`motionOnly` in `playtest_gate.mjs`), and this is in `fails`.

**NOT FIXED. It is the highest-value thing on this list.** The board's visible band and the captains
panel are fighting over the bottom of a phone screen. Start at
[`docs/BOARD-RENDERING.md`](../docs/BOARD-RENDERING.md) and the `boardBand()` / `capBandBottom()`
pair in `4/src/ui/stage.js`.

---

## 1. WHAT SHIPPED (build `2026-08-26j`, all pushed)

| commit | what a player gets |
|---|---|
| `8f4beae3` | **The Firebase repair listener was being refused.** Two consumers registered under one key, so the second — the repair that clears *"yer matey has left the game"* — never attached. A host's brief signal drop left the guest stuck on that message forever. |
| `18768f02` | **"Play again!" was burying ~52px of the end-of-voyage stats** where no scrolling could reach them. Now reserves the button's own measured height. AND **an orphaned full stop** after the coin icon — fixed centrally in `emojify()`; the sweep found five sites. |
| `80285005` | **The trial was screenshotting half-typed sentences** and reporting good copy as broken. |
| `a26ddf13`, `13d38cf0` | Two rulebook corrections (below). |

## 2. WHAT THE FINAL TRIAL FOUND (`2026-08-26j`, 105 min, 8 of 8 legs sailed)

- **281 screens, 194 settled cleanly (69%).**
- **3 structural failures, all one screen — §0 above.** Everything else structurally clean.
- **Safari ran for the first time ever** and completed a voyage to day 19. Playwright is installed
  at `/tmp/pw` (deliberately NOT a repo dependency); run with `PW_DIR=/tmp/pw`.
- **16 judge findings, roughly half false.** The real ones: the "Play again!" overlap (see §3) and
  the orphaned full stop (fixed). The false ones are catalogued in §10e of HARD-WON-LESSONS.

## 3. THE DECISION WAITING FOR WYATT — "Play again!" over the awards

Flagged **six times across two trials**, on every phone leg and on Safari. It is **the documented
design**: sticky was chosen because the alternative (the button below the fold, unreachable) was
ruled worse — *"a control you cannot hit is the one unacceptable outcome"*, `4/index.html` above
`.pp4Again`.

**A third option exists that satisfies both rules and has NOT been built:** pin the button as a
FOOTER outside the scroller, with the scrollport ending above it. Always visible, never covering.
**The cost is real** — `#statsWrap` is also the draggable park sheet (D-14, `wireEovDrag`), so this
is surgery on a gesture that needs hand-verification. **Do not do it casually.**

## 4. TWO RULEBOOK CORRECTIONS

- **`WarmLifecycle` is NOT remote control** (`a26ddf13`). It keeps a session *process* warm. Both
  the old rule ("there is NO re-arm") and this session's rewrite ("it is DOWN") made the identical
  misread from the same log lines. **The log records no "down" state at all** and the bridge
  self-heals. `~/.claude/bin/rc-state.sh` can no longer print DOWN. Wyatt re-arms by typing
  `/remote-control`; a session cannot — `Skill("remote-control")` refuses outright.
- **Predict before you measure** (`13d38cf0`), filed *inside* rule 6 rather than as a 26th rule.
  Wyatt proposed tracing the whole codebase; audited against four wrong calls it would have caught
  1.5, and it cannot see the emergent failures that actually cost this project.

## 5. STILL BROKEN / NOT DONE

- **§0 — the unreachable sail squares.** Highest value.
- **The seeded-defect drill still cannot fail.** `4/scripts/qa/seed_drill.mjs` grades by grepping
  output for `FAIL`/`✗`, which an *unseeded* leg also prints. Proved with a control run. **Until it
  is fixed there is still no evidence this process catches Wyatt's bugs.**
- **`deny` is still never exercised** on crew-phone. A theory that it shared a cause with the
  covering bug was written down in advance and **disproved** by the trial. Unexplained.
- **31% of screens still hit the settle cap**, all reporting `churn: geometry` (the text class is
  gone). Something moves >8px for 2.6s+; the churn field now says which half, so it is diagnosable.
- **His 35-item playtest: 22 addressed, 4 verified on screen, 5 parked, 8 untouched.**
- **Nothing gates the push.** Still true.

## 6. THE ROAD TO `/4` BECOMING THE GAME

**Phase 6 (The Cutover) is not started and is gated behind Phases 02.15, 02.2, 3 and 5** — see
[`ROADMAP.md`](ROADMAP.md). Phase 5 (Trade Over the Wire) has not begun.

**Every mechanical blocker Phase 6 names is still true — verified 2026-08-26:**

| | |
|---|---|
| `4/index.html:10` | still `noindex, nofollow` — **at root this de-indexes the live game from Google** |
| `4/index.html:11` | title still reads *"Pastry Pirates — v3 bot test"* |
| assets | **24** `../assets/` literals plus `ASSET_BASE="../assets/"` — every image breaks at root |
| `robots.txt` | still `Disallow: /4/` |
| flags | `?ovens=1` skips the voyage, `?windhud=1` opens a tuning panel — both player-reachable |
| Safari storm | **never measured on a real device on this build.** A stated gate, and Wyatt's to do |

## 7. WHERE TO PICK UP

1. **Fix §0** — the sail squares a guest cannot tap. It is the only structural failure in 281 screens
   and it is the class the rules call unacceptable.
2. **Fix the seed drill** so the process has evidence behind it.
3. **Ask Wyatt about §3** before touching the end-of-voyage button.
4. **Read [`QA-PROCESS.md` → THE WHOLE LOOP](../docs/QA-PROCESS.md) before writing any check** — and
   red-proof it.
