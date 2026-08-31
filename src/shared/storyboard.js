// src/shared/storyboard.js
//
// ============================================================================
// THE STORYBOARD TIER — pure derivations from the event stream to what should be drawn.
// ============================================================================
// Rule 23 (ONE DISPLAY PATH) asks one question at design time: *what makes these two agree?*
// The only durable answer is that there is one of them. This file is where "one of them" lives
// for facts the screen needs: given the event stream and a playhead, what is true right now?
//
// PURE, AND THE PURITY IS GATED RATHER THAN REMEMBERED. This file sits in `src/shared/`, and
// scripts/module_graph_check.js asserts "shared imports nothing from src/ (leaf tier)". So it
// cannot reach the DOM, appState, the network, or anything under src/ui/ without failing the
// build. That is deliberate: a pure derivation with a discipline-only promise of purity is a
// promise that gets broken by the first convenient import.
//
// WHAT IT DOES NOT DO: it never writes anything. The writer for the active seat is
// applyActiveSeat() in src/ui/util.js — one derivation here, one writer there.
//
// FIRST INHABITANT (2026-08-31): the active seat. It was derived in three places; two of them
// now call in here. The third — consumeEvent()'s applyActiveSeat(e.p) — is deliberately NOT
// rerouted, and the reason is in the note on deriveActiveSeat below.

/* WHICH EVENTS ESTABLISH WHOSE TURN IT IS.
   Extracted verbatim from the private backward walk that lived in src/ui/board.js, where the
   list was earned rather than guessed: the walk originally knew only about `turn`, and a bake
   is not a turn — the engine emits {t:"ovens",p} when a captain steps up and {t:"bake",p} for
   each attempt — so during a bake the most recent `turn` was still the PREVIOUS captain's and
   the ring pointed at them. `ovens` and `bake` are in this list because of that. */
export const TURN_ESTABLISHING = Object.freeze(["turn", "ovens", "bake"]);

/* WHERE THE WALK STOPS. A new round is a clean slate: nothing before it establishes whose turn
   it is now. Walking past it would resurrect the previous round's last captain. */
export const TURN_BOUNDARY = Object.freeze(["newround"]);

/* THE NARROWER QUESTION, AND IT IS DELIBERATELY STILL A DIFFERENT ONE.
   Two callers ask only "who last took the wheel", ignoring the bake: board.js's activeTurnSeat()
   (the ripple ring that follows a ship) and util.js's currentTurnSeat(). Passing this keeps their
   answer byte-for-byte what it was while giving them the SAME WALK as everyone else.
   RULED, 2026-08-31. Wyatt: **"no ripple ring in the ovens."** So TURN_ONLY is the ring's answer,
   and this is no longer an open question — do not reopen it as a patch.
   WHAT THE RULING FIXED, because the split was worse than the note above realised: render() was
   NOT passing a list at all, and an omitted option is not "no answer" — it is the DEFAULT answer,
   TURN_ESTABLISHING. So one of the two ring sites already counted the bake. On the stream
   [newround, turn p1, sail p1, ovens p3, bake p3] the two sites returned seat 1 and seat 3.
   The two ring derivations therefore disagreed (measured 2026-08-31; whether both paths ring in
   the same bake ON SCREEN was not established, and this comment no longer says they do). Both ring
   sites now pass TURN_ONLY explicitly; the CAPTAINS BOX keeps TURN_ESTABLISHING, because ovens/bake
   were added to that list for T-09 and narrowing it would revert a fix Wyatt asked for on
   2026-08-26. scripts/qa/ripple_one_answer_check.mjs fails the build if either comes apart —
   asserting AGREEMENT first and his ruling second, so a reversal moves both together. */
export const TURN_ONLY = Object.freeze(["turn"]);

/* HOW FAR BACK. Also carried over from board.js unchanged. A bound, not a tuning constant:
   this walk runs inside render(), and an unbounded backward scan over a long voyage's event
   stream is a render cost that grows with the length of the game. */
export const DEFAULT_LOOKBACK = 80;

/* THE BOUNDS GUARD, shared with applyActiveSeat().
   Two guards, both deliberate, both inherited from util.js's applyActiveSeat:
   - null in, null out. An event carrying no seat (`newround`, `anchorHold`, `windmove`, `storm`,
     `blownOut`) must LEAVE THE INDICATOR ALONE rather than blank it. Measured 2026-08-31: 46 of
     200 samples land on such an event, and the null return is what keeps the ribbon lit.
   - a seat is used as an index into the players array, and the `ev` node is host-authoritative.
     That is the same trust already relied on for board positions, but a bounded index costs
     nothing and a trusted one eventually does (T-02.2-08). */
export function normalizeSeat(seat, seatCount) {
  if (seat == null) return null;
  if (!Number.isInteger(seat)) return null;
  if (!Number.isInteger(seatCount) || seatCount <= 0) return null;
  return seat >= 0 && seat < seatCount ? seat : null;
}

/* THE ONE DERIVATION OF "WHOSE TURN IS IT" FROM THE STREAM.
   A backward walk from the playhead to the most recent event that establishes a turn, stopping
   at a round boundary. Returns a seat index, or null when nothing in range establishes one.

   MEASURED BEFORE IT WAS MOVED (measurer, 2026-08-31, two-browser crew room FQXH, 200 paired
   samples): this walk reproduced the live appState.curSeat 154/154 on the host and 154/154 on
   the guest, returning null on the 46 samples whose event carries no seat. It is not a second
   opinion about the active seat; it is the same answer, computed from the stream.

   WHY consumeEvent() DOES NOT CALL THIS, and do not "converge" it without measuring first.
   src/orchestrator.js:1601 runs applyActiveSeat(e.p) for the event it is consuming, and `p`
   rides turn/sail/dock/pass/attack — a WIDER set than TURN_ESTABLISHING. Routing that call
   through this walk would narrow it, which is a behaviour change to the one consumer both tiers
   run, on a path that was measured correct. Two questions, honestly distinct: consumeEvent asks
   "which seat does THIS event name", this asks "who holds the turn at this playhead". */
export function deriveActiveSeat(events, playhead, opts) {
  if (!Array.isArray(events)) return null;
  const lookback = (opts && Number.isInteger(opts.lookback)) ? opts.lookback : DEFAULT_LOOKBACK;
  /* NO SILENT DEFAULT. Every caller in src/ states its list, and the one that DIDN'T is the whole
     reason the ripple ring had two answers (2026-08-31): an omitted option looked like "no opinion"
     and was in fact an opinion, the wider one. A default that is never deliberately chosen is a
     trap with no user, so asking without saying which question you mean is now an ERROR rather
     than a guess. This is the same lesson as rule 9 from the other side: the danger is not only a
     hardcoded constant, it is a constant nobody realises they are using. */
  if (!opts || !Array.isArray(opts.establishing)) {
    throw new TypeError("deriveActiveSeat: say which events establish a turn — pass {establishing: TURN_ONLY} or {establishing: TURN_ESTABLISHING}. An omitted list used to mean TURN_ESTABLISHING silently, and that is how the ripple ring came to have two answers.");
  }
  const establishing = opts.establishing;
  const start = Number.isInteger(playhead) ? Math.min(playhead, events.length - 1) : -1;
  for (let i = start; i >= 0 && i > start - lookback; i--) {
    const e = events[i];
    if (!e) continue;
    if (establishing.includes(e.t)) return e.p == null ? null : e.p;
    if (TURN_BOUNDARY.includes(e.t)) return null;
  }
  return null;
}
