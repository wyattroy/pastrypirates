# PREDICTION — written 2026-09-02T00:40Z, BEFORE any measurement

**The finding.** Release trial `2026-09-01T1914Z-Wy-Blade`, leg `passplay-phone`, one structural
failure in ten legs: `no-cover-ask` — *control covering the question it answers: "Call Flaky Jack"
over "Davy Scones — a battle's brewi[ng]"*. The previous trial (`1644Z`) caught the same check
once too, on a different prompt (`"test2"` over `"Fer yer Speckled Eggs the tab"`, crew-phone-host).

**What a player loses.** The battle-call prompt asks you, by name, to pick a winner. The circle you
are meant to tap is drawn on top of the sentence that tells you what is being asked. You can read
the buttons or the question, not both.

## What I expect to find, and why

The call circles run the **anchored** branch of the radial placement
(`src/ui/stage.js`, `if (onBoats)` at ~3130) — each circle sits beside the boat it names, which is
Wyatt's own W5-2 ruling. That branch scores each candidate spot on three things: inside the band,
off every hull, and clear of the OTHER captains' hulls. **It has no term for the ask pill at all.**
The ordinary fan does — `formationOK` refuses any formation that hits `pillB` — so the two
placement regimes disagree about whether the question is an obstacle. That is a rule 23 fault:
two paths that must agree, kept in step by nobody.

The safety net that is supposed to catch it is `liftAskClearOfFan()` (`stage.js:711`), which lifts
the pill above the topmost circle. **I predict it is clamp-bound here**, exactly as CEO review 4
already measured on guest-022 in 2026-08-26: it may not rise above `tSafe - 34`, and in the
anchored case the pill is ALREADY at that ceiling whenever the fight is high on the board —
`mTop = Math.max(tSafe - 34, min(anchor y) - R - 96)` (line 3019) has **no below-the-boats
fallback**, unlike the non-anchored pill three lines down, which does (`above the boat when the
band has room, below it when it does not`, line 3037). So on a phone, a battle near the top of the
board pins the pill at the ceiling and pins the circles at `yMin = tSafe`, and neither can move.
The 3-re-place churn budget is then spent re-deriving the identical layout.

**Concretely, at 390px wide I expect to measure:** pill top at or within ~2px of `tSafe - 34`;
at least one call circle whose centre-to-box distance puts it inside the pill by more than 2px;
and `liftAskClearOfFan` requesting a `lifted` value BELOW its own `tSafe - 34` floor.

## What would prove me WRONG

- **The pill is NOT at its ceiling** when the overlap happens (headroom > ~5px). Then the lift was
  not clamp-bound, and the live cause is host-016's unexplained second mechanism — CEO review 4
  recorded that one as *not established*, and I would be re-running a dead theory (the trap
  CLAUDE.md's "widen the time horizon" box was rewritten to warn about).
- **The fight is NOT near the top of the band** — if the overlap reproduces with the boats
  mid-board, the clamp cannot be the cause and the anchored branch is placing circles onto a pill
  that had plenty of room, which points at the missing obstacle term alone.
- **`onBoats` is false on the failing screen** — then this is not the anchored branch at all and
  everything above is about the wrong code.

## What happened immediately BEFORE (rule: widen the time horizon)

`collectSideBets()` (`src/ui/flow.js:3098`) calls `applyActiveSeat(s.idx)` and then `ask(...)`.
The camera is re-aimed by `camFitSeats(anchorSeats)` (line 2843) only when a captain is outside the
band — so the frame can change in the same tick the pill's top is chosen. Worth checking whether
the pill top is computed against anchors from BEFORE that re-frame.

## Method

Posed, not sailed (rule 26): inject a battle-call prompt at a known seed and viewport, screenshot
before and after. Three probe runs of a stochastic voyage cannot answer a placement question.
