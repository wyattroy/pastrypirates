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

## INBOX-20260901T1309Z — guest camera stuck FULLY zoomed out (⚠ possible regression of today's sail-cam fix — investigate BEFORE the merge)
> "The guest's camera sometimes stops reframing the action; i can't yet figure out the pattern to
> replicate the bug, but there is some interaction that causes the camera to become FULLY zoomed
> out, and stay that way, until the guest refreshes their page."
solution: none stated
status: CLAIMED by the advisor session, 2026-09-01 — written on the Glass 13:08:57Z, the same hour he playtested the sail-cam fix on staging. The new containment pass zooms OUT only; "fully zoomed out and stays" is exactly the failure shape a runaway pass would produce. Prediction and measurement before any code.

## INBOX-20260901T1314Z — Muse narrations missing in Multiplayer
> "The Muse narrations are now missing from all narration in Multiplayer -- they don't seem to be
> firing at all, or maybe they get wiped away IMMEDIATELY"
solution: none stated
status: OPEN — written on the Glass 13:14:06Z. A "now missing" = a regression somewhere in the one-director convergences; find WHEN it broke (git log, rule 10) before measuring where.

## INBOX-20260901T1310Z — the Glass's "Your Rulings — In Hand" needs a triage lifecycle
> "The Glass's Your Rulings -- In Hand are stale; there must be a process that triages them and
> adds them to the Tasks list, then removes them from the Your Rulings list"
solution: triage each ruling into the Tasks list, then remove it from the Your Rulings list (his words, lightly compressed)
status: OPEN — written on the Glass 13:10:15Z. A wyclau process item: the RULED table needs states (ruled → triaged-to-task → done, only open ones rendered), derived on the Glass, hand-typed nowhere.

## INBOX-20260901T1315Z — the release trial, first Watch cargo
> Ruling 12, THE RELAY REDESIGN (question put to him with the recommendation marked, his pick):
> "First job of the new engine — the rebuilt relay's shakedown cargo IS the release: run the
> trial in a way that survives session death, stage it, hand you the link."
solution: none stated
status: OPEN — first watch: `node scripts/wyclau/start_trial_detached.mjs --label="release trial, 2026.09.01.2, full gear"`, then END; later watches read its report. Staging already serves this build and Wyatt's five-item checklist PASSED 2026-09-01 — the trial is the LAST merge gate before his final say-so. Do not babysit it in-session; do not start a second (check LONG-RUN and the ledger first).

## INBOX-20260901T0000Z — worked example (the fix that seeded this file)
> "the bosun spent 4 days making stupid tooling instead of simply fixing the sail square problem
> by zooming the camera out more -- a solution that i told it at the beginning"
solution: zoom the camera out more
status: DONE 2026-09-01 — fixed the day the Inbox was born, his solution first, posed pair proven; CEO Review 66, commits 76c49bcc/52abc448. Kept as the format's worked example.
