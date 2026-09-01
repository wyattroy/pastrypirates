# THE INBOX — Wyatt's words, verbatim

*Wyclau's one instruction queue (the Watch redesign, 2026-09-01 — DECISIONS.md "THE RELAY
REDESIGN", ruling 6). His words land here the moment he says them — typed by the Advisor in the
same turn, or harvested off the Glass. **Every watch reads this file first and works OPEN items
before anything on the Chart.** Items close only through `scripts/wyclau/close_item.mjs`, which
writes the fate here, the tick on the Chart when one exists, and the ledger entry together.*

**Entry format** (the close gate parses `## INBOX-…`, `solution:` and `status:` — keep them exact):

```
## INBOX-<UTC, e.g. 20260901T1730Z> — <short title>
> <his words, verbatim — never paraphrased>
solution: <his stated solution verbatim, if he gave one | none stated>
status: OPEN | CLAIMED by <watch/session> | DONE <date> — <pointer> | PARKED — <reason>
```

Every item gets a visible fate within a day (charter: the Chart's every-idea-gets-a-fate rule).

---

## INBOX-20260901T0000Z — worked example (the fix that seeded this file)
> "the bosun spent 4 days making stupid tooling instead of simply fixing the sail square problem
> by zooming the camera out more -- a solution that i told it at the beginning"
solution: zoom the camera out more
status: DONE 2026-09-01 — fixed the day the Inbox was born, his solution first, posed pair proven; CEO Review 66, commits 76c49bcc/52abc448. Kept as the format's worked example.
