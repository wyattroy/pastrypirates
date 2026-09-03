# PREDICTION — should the sweep gate assert over the number line, or over handles it can see existed?

**Written 2026-09-03T09:50Z, before touching the gate.**

## THE OBSERVATION

`chart_sweep_conserves_check` is red again: **60 allocated handles owned by nothing**, `T-144`…
onwards. Cause, measured first: the highest OWNED handle is now **`T-206`** — another session minted
`T-204`, `T-205`, `T-206` by hand. The gate takes its ceiling from `max(owned)` and calls every
unused integer below it a vanished row.

**This is the second time tonight.** My own `T-203` did it at 84 orphans, of which 68 were phantom.
Two independent sessions, same keystroke, same false red. **A fault that recurs from two different
hands is the design's, not the hands'.**

## WHAT I EXPECT

**Flag only handles there is EVIDENCE ever existed — i.e. that appear as text somewhere in the two
charts or the log — and the count collapses to the genuinely lost ones.** A hand-minted `T-206`
leaves `T-144`…`T-205` with no trace anywhere, so they stop being accused. A row that was really
swept away leaves its handle in `CHART-LOG.md`; a row deleted from the Chart usually leaves
references behind in other rows or the ledger.

That is the peer's suggestion from earlier tonight, and it is right in shape: *"assert over handles
it can OBSERVE having existed, not over the integer sequence. A gap in a number line is not a fact
about a row."*

## WHAT WOULD PROVE ME WRONG

1. **If it collapses to ZERO, the gate has been weakened into uselessness** — because a row deleted
   with every mention of it would then be invisible, which is precisely the disappearance this gate
   exists to catch. **Test: after the change, does the 12-row dismissal set I filed earlier still
   register as owned-and-archived rather than vanishing from the check's view?**
2. **If the genuinely-lost rows lose their handles too** — the four `T-120`…`T-123` that were
   real losses earlier tonight were only detectable *because* the sequence was walked. If the new
   rule cannot see a row that left no text, say so plainly as a reduction in power, not a fix.
3. **If "appears as text" matches its own error message.** The gate PRINTS the missing handles. If
   its output is ever read back in, every accused handle becomes "evidence it existed" and the check
   silently stops firing. **That is the self-referential trap and I should check for it explicitly.**

## THE TRAP

I have now fixed this gate twice and it is red a third time. **The pull is to make the red go away
rather than to make the check right** — and a gate that cannot fail is the fault this whole session
has been about. If the honest answer is "the ceiling model is fine and sessions must stop minting
handles", the fix is a guard on minting, not a loosened assertion.
