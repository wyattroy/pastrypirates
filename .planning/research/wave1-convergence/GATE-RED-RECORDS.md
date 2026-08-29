# Parity-gate rows watched RED before their convergence — Wave 1

Per the gate's own rule: a row added after the fact proves nothing.

## renderAskPrompt DECL row — RED pre-convergence, 2026-08-28T05:55:45.164831Z

```
localAsk           listeners=0  host-loop=6  SUPERSEDED by renderAskPrompt — not a renderer any more — the LOCAL RESPONSE MECHANISM, reached THROUGH renderAskPrompt on both tiers. W1, 2026-08-28.
renderAskPrompt    listeners=0  host-loop=0  shared
```

## Q-18 / gate 48 — `scripts/qa/q18_narr_event_order_check.mjs`, 2026-08-29

**Step 1 of the four steps: the gate, shown FAILING on the broken tree, before the fix.**
CEO Review 25 ran the rebuilt gate against `87cf0e00^` — the tree as it was before the correction —
and got **5 failing assertions, exit 1**, including assertion 9, the one that holds Wyatt's ruling.
So the gate discriminates: it is not merely green on a tree that happens to be right.

**And ELEVEN breakages re-inserted into a scratch mirror, each proven to turn it RED.**
Six from CEO Review 24, all of which had walked past the first version green:

| | breakage | what it does to a player |
|---|---|---|
| B1 | `o["n"]=…` inside `Game.ev` | the engine emits a new field — the whole determinism corpus needs a re-record |
| B2 | `game.events[i].n=…` beside the wire stamp | the engine's own array is dirtied from outside |
| B3 | a second `payload.evN = 0` | every line names event 0, so nothing ever waits — the fix is off |
| B4 | `appState.evSeen=1e9` after the record | the guest's frontier is past every serial — the wait never engages |
| B5 | delete the single `tick();` | **the guest silently loses every held narration line, forever** |
| B6 | `NARR_EVENT_GRACE_MS = 2000` | a two-second stall on a line whose event is late |

Five from CEO Review 25, which walked past the rebuilt version green **and past all 48 gates**:

| | breakage | what it does to a player |
|---|---|---|
| N1 | the engage condition rewritten to `(false)` | the ordering barrier never engages on any line, ever |
| N2 | delete `applySubject();` from `drawIt` | **Wyatt's ruling entirely off**, and W4-2's subject fix with it |
| N3 | capture `myGen` BEFORE the bump | **every held line dropped forever** — B5's catastrophe, by reordering two adjacent lines |
| N4 | `evAt` returns `arr[0]` | the guest computes the subject from the wrong event |
| N5 | `arr[n].n=n` on evAt's own alias | the engine's array dirtied through an alias B2's search cannot see |

A sixth, N6 (inverting `subjectOf`'s rule), is caught by `w42_battle_bubble_check.mjs` instead —
the disclosed division of labour working, not a hole.

**THE RULE ALL ELEVEN TEACH, and it is one rule:** *an assertion that turns on ONE SPELLING of one
thing is not an assertion.* B1 was one property-access spelling. N1 was the presence of a condition
rather than its operands. N3 was two lines in the right order, which no presence test can see. N5
was the same write under a different name. Read the SET, the COUNT, the ORDER, or the OPERANDS —
never merely the presence.
