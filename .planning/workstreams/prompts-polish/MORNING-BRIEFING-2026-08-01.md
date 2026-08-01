# Morning briefing — Phase 18 `prompts-polish`, overnight 2026-07-31 → 08-01

Morning, Wyatt. Everything below is on `claude/gsd-plan-phase-18-bfdc7b`. **Nothing merged, nothing
pushed.**

---

## FINAL STATUS — all six autonomous plans are done

**18-01 through 18-06 complete. 18-07 is yours** — it's the phase gate and holds the blocking human
checkpoint, so I stopped there deliberately rather than running out of steam.

| Check | Result |
|---|---|
| Plans complete | 6 of 7 (18-07 reserved for you) |
| All 10 FIX items | Implemented |
| `npm test` | **green, exit 0** |
| `src/engine/index.js` | **byte-identical** to before Phase 18 — no determinism re-record triggered |
| `src/ui/board.js` | one line only (FIX-08), as agreed |
| Working tree | clean |
| Open broken windows | 6 — all browser-verification gaps, all yours (see below) |

### What each plan shipped

- **18-01** — buttons wait for the typewriter; the fading line stays where it sat; the box re-measures on resize *(FIX-03/10/16)*
- **18-02** — win banner only prints "a" when the recipe name takes one; no recipe renamed *(FIX-08)*
- **18-03** — storm-drift line gone; **7** unwrapped coin sites fixed (research found 4 your notes missed) + a permanent anchored gate so an 8th can't sneak in *(FIX-04/21)*
- **18-04** — an empty hold is no longer described as a bribe; fixed in the orchestrator so the engine stays untouched *(FIX-07)*
- **18-05** — the shot clock now starts when the buttons become clickable, with a frozen clock during the reveal *(D-02)*
- **18-06** — primary buttons restyled; captain circles gone everywhere; **both** chip treatments built and toggleable *(FIX-06/09/17)*

### Three things the executors caught that the plans got wrong

Worth knowing, because they're the kind of thing that silently ships broken:

1. **18-04** found `isBribe` was missing the `spoilN>=5` amount gate its own spec required — a 2-coin
   spoil would have rendered the wrong framing. Self-caught and fixed before committing.
2. **18-05** found a contradiction *inside its own plan*: the action text said to call `armClock(seat)`
   in the closure, but the acceptance criterion demanded `grep -c 'armClock' == 1`. Both couldn't be
   true. It resolved it and documented the deviation.
3. **18-05** also caught that arming by `currentTurnSeat()` would be a real regression — a battle
   sub-decision (side bet, defender flee) can ask a seat that isn't the turn owner. The plan didn't
   flag it.

It also **proved** the `withShotClock` trap rather than asserting it: temporarily reverted the fix,
confirmed `shotClockForce` stays `null` forever after the arm (which would hang the table on a
non-responding seat), then restored and re-verified green.

### FIX-06: the count is 10, not 12

Confirmed by enumeration — **9 static `class="primary"` sites + 1 dynamic**. Your roadmap's success
criterion 8 says 12. It's one CSS rule either way, so no work changed, but **criterion 8 should be
corrected to 10 or verification will fail on a technicality.** Say the word and I'll fix it.

### The 6 open items — all yours, all browser-dependent

None of these are blocked by code; they're blocked by needing a real browser I couldn't get.

| # | What |
|---|---|
| 3 | FIX-16 ghost first-frame rect |
| 4 | FIX-10 `.apBtn` containment at 320/375/390 + rotation |
| 6, 7 | 18-05's clock sampling on host and guest |
| 8 | A **real** minor display gap 18-05 found: during a *remote* seat's reveal, your screen shows the old idle dash instead of the frozen clock. Cosmetic only — it never shortens anyone's window — and flagged rather than guessed at |
| 9 | The six FIX-09 renders (treatments A/B × 320/375/390) for your D-03 choice |

**Nothing was faked.** Every executor was told not to claim a browser check it couldn't run, and none
did.

---

## Read this first — three things need you

### 1. Other sessions were running all night, and one collided with me

I found three sibling worktrees active while I worked:

| Worktree | What it was doing |
|---|---|
| `gsd-plan-phase-21-4961ad` | Executing plan 21-03. **Its 21-01 commit modified `src/ui/board.js`** |
| `gsd-plan-phase-22-2a6acf` | Logged *"red npm test from archived dispositions path"* — **the same bug I fixed** |
| `gsd-plan-phase-19-182a17` | Also writing you an overnight briefing |

**Two consequences you should decide on:**

- **Possible duplicate fix.** I fixed the red `npm test` (details in §3). Worktree 22 independently
  logged the same defect. If it also *fixed* it, you'll have two fixes for one bug on two branches.
  Check before merging.
- **`src/ui/board.js` is genuinely contested.** Phase 21 touched it for audio hooks. I still took the
  one line FIX-08 needs (the win banner's "a"), because the regions are far apart and leaving FIX-08
  half-built was worse. Merge should be clean, but it is the one place two workstreams touched the
  same file.

### 2. A number in your roadmap is wrong — my error

Success criterion 8 says *"The **12** solid-orange `button.primary` buttons…"*. The tree has
**nine** static `class="primary"` sites plus one dynamic. I copied "12" out of your REQUIREMENTS.md
into the criterion without checking it against the code.

It doesn't change the work — it's one CSS rule either way — but the criterion will fail verification
on a technicality. **Want me to correct it to 9 + 1 dynamic?**

### 3. Two things only you can close

- **FIX-09 — pick a chip treatment.** Plan 18-06 builds *both* narrow-screen options live and renders
  six images (2 treatments × 320/375/390). 18-07 applies your pick and deletes the loser. My steer:
  Option B (own full-width row) matches how the recipe row already behaves on narrow screens.
- **Safari narrow-window check (success criterion 1).** Explicitly a human-on-real-Safari job, same
  as the v1.2 Phase 17 playtest. I have not claimed it and no agent can.

---

## What actually got done

| | |
|---|---|
| Phase 18 defined | It didn't exist in a form GSD could read — written from your REQUIREMENTS.md |
| Research | 750 lines; corrected several stale line refs, found 4 `.nobrk` sites your notes missed |
| Plans | 7 plans, 6 waves, 10/10 FIX items covered |
| Plan verification | Passed (iteration 2) |
| **18-01 complete** | FIX-03 + FIX-10 + FIX-16 — the interlocking panel group |
| 18-02 | In flight when this was written |
| `npm test` | **Green, exit 0** — for the first time on this branch |

### Decisions I made for you

| Decision | Why | Reversible |
|---|---|---|
| Wrote the missing `### Phase 18:` roadmap section | GSD refused to plan without it (`malformed_roadmap`) | Yes |
| Widened ownership to `src/orchestrator.js`, `src/main.js`, `src/ui/flow.js` | You said "widen it safely" — nobody owned these | Yes |
| Skipped the UI-SPEC | You approved | Yes |
| Authored `18-VALIDATION.md` by hand | Checker blocked on it; it's a template artifact, so writing it beat re-running research | Yes |
| Took the `board.js` line for FIX-08 | See §1 | Yes — revert one line |
| Fixed a pre-existing red test outside phase scope | See §3 below | Yes |

---

## §3 — The pre-existing broken thing I fixed (out of scope, deliberately)

`npm test` was **already red** on this branch before Phase 18 started. I proved it by checking out
`f07a474` (before any 18-01 code) in a scratch worktree and reproducing the identical failure.

**Cause:** `a63e194 chore: archive v1.2 milestone` moved
`.planning/phases/15-narration-audit-fixes/` into `.planning/milestones/v1.2-phases/…`, but
`art-review/narration-audit.html` still fetched the old path. Both `15-DISPOSITIONS-FINAL.json` and
`15-ADDRESSED2-APPROVED.json` 404'd.

**This was worse than a red test.** That page is your narration review tool. It has been rendering
**zero cards** since the archive — the "stuck on loading" failure its own assertion 10 exists to
catch. You may have hit it and assumed the page was just broken.

**Fix (`a637266`):** page and checker now try the live phase directory first, then fall back to the
v1.2 archive — so it survives this archive and the next one. 23/23 groups, exit 0.

I fixed it rather than only flagging it because every remaining plan's acceptance criteria include
"npm test green", and they'd all have been verifying against a red baseline.

---

## What I verified myself, honestly

**The tracer gate — buttons wait for the typewriter.** The executor stopped and asked for a human
browser check. Rather than rubber-stamp it, I drove Chrome:

| t | text length | buttons | pendingReveal |
|---|---|---|---|
| 30.9ms | 0 | hidden | true |
| 92.9ms | 3 | hidden | true |
| 1093.6ms | 25 (final) | hidden | true |
| 1093.8ms | 25 | **visible** | false |

Reduced motion: `pendingReveal` never applied; buttons visible at 7.5ms with 0 characters while text
grew past 165. Correct.

**Caveats I'm not hiding:**
- Tab was backgrounded, so Chrome throttled the typewriter's timer. The ~1000ms is not a real-world
  reveal duration — only the *ordering* was tested.
- Reduced motion was exercised by patching `matchMedia` (the exact API `panel()` reads), not DevTools
  emulation.
- **Chrome background-tab throttling corrupted three separate measurements** before I identified it.
  It pauses rAF, which freezes `resizePanel`'s height pin at `0px` and makes the panel look broken
  when it isn't. Anyone doing layout verification here needs the tab foregrounded. Worth adding to
  `docs/DRIVING-THE-GAME.md`.

**Still open (logged in `.planning/WINDOWS.md` as windows #3 and #4):** the driven-browser
acceptance criteria for FIX-16 (ghost first-frame rect) and FIX-10 (`.apBtn` containment at
320/375/390 + rotation).

**These cannot be closed by automation from this setup, and I confirmed why rather than guessing.**
The MCP browser tab is *hidden* (`document.hidden: true`, `outerWidth: 0`). That means:

- `requestAnimationFrame` never fires — and `resizePanel`'s re-measure runs inside a rAF debounce, so
  the FIX-10 fix physically cannot demonstrate itself there
- `resize_window` returns success but does **not** move `window.innerWidth`, so a 320/375/390 sweep is
  impossible

They need a real visible browser window, or your own. They fold into your 18-07 checkpoint, which is
the right place for them. I wrote the whole trap up as §8b of `docs/DRIVING-THE-GAME.md` so the next
session doesn't lose the time I did.

---

## Two mistakes I made

1. **I deleted my own worktree.** A cleanup loop used `grep -v "$(pwd)$"` to exclude it, but
   `git worktree list` lines end with the SHA, so the anchor matched nothing and the filter excluded
   nothing. **No work was lost** — all commits were already on the branch, and restoring the worktree
   at the same path let the still-running executor finish and commit its SUMMARY. Your other seven
   worktrees were untouched, which was luck: the loop died on the first removal when the cwd vanished.
2. **I misdiagnosed a browser hang as my own fault.** I reported freezing the renderer with a resize
   storm. I hadn't — the call awaited `requestAnimationFrame` in a hidden tab, where rAF never fires,
   so the promise never resolved and the tool timed out at 45s. The renderer was never frozen and
   nothing was damaged. Root cause was the same hidden-tab throttling behind everything else above.

I also told you mid-session that the 18-01 SUMMARY was lost. It wasn't — the executor was still
running, and restoring the worktree let it finish and commit. Correcting both here.

**The through-line:** one environment fact — the MCP browser tab is hidden — produced four separate
false conclusions tonight (a phantom clipping bug, two wrong duration measurements, and a phantom
renderer freeze). It is now documented as §8b of `docs/DRIVING-THE-GAME.md`.

---

## Housekeeping

- Local server running on **port 8481** (8477 was killed — it was serving from the deleted worktree).
  `pkill -f 'http.server 8481'` when you're done.
- One quality note: plan 18-01 had an acceptance criterion of `grep -c 'syncBoardRAF' == 3`. The
  executor wrote a *comment* mentioning that identifier, tripped the count to 4, and reworded the
  comment rather than the criterion. Behaviour is identical and it was documented honestly — but it's
  code being shaped by a brittle grep. Worth avoiding in future plans.
- The other three workstreams (19–22) still have the **same** missing `### Phase N:` sections that
  blocked me. They'll each hit it. I left them alone rather than risk clobbering a live session.
