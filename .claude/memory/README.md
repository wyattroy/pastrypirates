# The organisation's memory — the map

**Wyatt, 2026-08-30:** *"I want the CEO to be a long running agent that accumulates the
organization's memory, so it can keep track of all of the decisions that we've made and the strategy
behind it and report back to me, the chairman of the board."*

**And the design that actually delivers that: DURABLE MEMORY, DISPOSABLE INSTANCE.** No agent
remembers anything between sessions. A long-running one fills up and gets summarised away, and
whatever it "knew" that was never written down is gone. So the memory is **files**, and every
officer and every crew member starts fresh and reads them.

That is not a workaround. **Freshness is the CEO's entire value** — one that has been in the room
all week stops being an auditor and becomes a colleague who agrees with you. The role persists; the
instance is thrown away every time.

*(Anthropic's own published answer for long-running agents is the same shape: a progress file that
survives across sessions, read by fresh ones — "the format matters less than the existence".)*

---

## WHERE EVERY KIND OF MEMORY LIVES, and where to WRITE new memory

| kind of memory | file | who appends |
|---|---|---|
| **How to work with Wyatt** — the 27 standing rules, each paid for | [`.claude/CLAUDE.md`](../CLAUDE.md) | rarely; only when he teaches a new rule |
| **What he has DECIDED** — product and process choices, with the reason | [`DECISIONS.md`](DECISIONS.md) | **anyone, the moment he rules on something** |
| **What actually happened** — the append-only work record and heartbeat | [`../../.planning/CTO-LEDGER.md`](../../.planning/CTO-LEDGER.md) | the CTO, continuously |
| **Verdicts on the work** — newest at the TOP | [`../../.planning/CEO-REVIEWS.md`](../../.planning/CEO-REVIEWS.md) | the CEO, after every item |
| **What is open** — the wave list and its evidence | [`../../.planning/BACKLOG.md`](../../.planning/BACKLOG.md) | the CTO |
| **What is waiting on him** — parked questions | [`../../.planning/CTO-QUESTIONS.md`](../../.planning/CTO-QUESTIONS.md) | anyone who needs him |
| **Facts about this repo the officers need** | [`../OFFICERS.md`](../OFFICERS.md) | when the repo changes |
| **How the crew runs and verifies this product** | [`../TEAM.md`](../TEAM.md) | when the product changes |

**The rule that keeps this from rotting: POINT, DO NOT RESTATE.** A pointer cannot go stale; a copy
always can. If a fact lives in one of the files above, link to it rather than repeating it here.

---

## THE ONE THING TO GET RIGHT: where a new ruling goes

**The moment Wyatt decides something, it goes in [`DECISIONS.md`](DECISIONS.md), that same turn,
with the date and the reason.** Not in a commit message, not only in the ledger, not in the running
session's head.

This is the difference between an organisation that accumulates judgment and one that re-asks him
the same question every week. **A decision nobody wrote down is a decision he will have to make
again** — and he notices.

**What belongs there:** anything he chose between options. Product shape, process, scope, priority,
what "done" means. **What does NOT:** how the work went (the ledger), whether it was done right (the
verdicts), or a rule about how to work with him (CLAUDE.md).

---

## Reading order for a fresh officer

1. `.claude/CLAUDE.md` — in full. Every rule was paid for.
2. `DECISIONS.md` — so you do not re-open a settled question.
3. The tail of `CTO-LEDGER.md` — what is happening right now.
4. The top of `CEO-REVIEWS.md` — the last verdict, and whether a fault is recurring.
5. `OFFICERS.md` or `TEAM.md`, depending on which you are.

**A checkpoint his existing rulings already answer is NOT a reason to stop.** Resolve it from this
record, name the ruling you used, and keep going. Only genuinely new decisions reach him.
