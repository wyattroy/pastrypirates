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
status: DONE 2026-09-01 — CEO 67, commit 0caf85c (3 game files)

## INBOX-20260901T1520Z — REMOVE the sea hint's pulse animation (reverses his own W4-5 ruling)
> "just remove the animation from the \"Click and hold the sea\" -- it works in chrome but still
> doesnt' work in safari and it's not worth fixing"
solution: remove the animation from the hint (his words — not debug it further)
status: DONE 2026-09-01 — CEO 71, commit 373bd99 (2 game files); his solution first: commit 373bd99

## INBOX-20260901T1335Z — compress the images + preload all assets (LAUNCH CRITICAL, his words)
> "There's one more SUPER important step we must finish before launch -- compressing the images to
> make the game load MUCH faster. it's about 18mb of images, from memory. but the only one that
> needs to be as big as it is is the board itself -- everyhting else should be resized and
> compressed according to its maximum pixel size in the real gameplay. this is launch critical; as
> part of it, we need to load all game assets up front; i notice sometimes that the \"fire the
> ovens\" graphic loads dynamically when it is called, which will make it appear blank on slow
> connections. Bad engineerign!"
solution: resize/compress every image to its maximum real-gameplay pixel size (board excepted); preload all assets up front (his words)
status: OPEN — written on the Glass 13:35:23Z. His routing: LAUNCH CRITICAL → belongs on the Chart's launch list (step 3) as a named item, worked through the Proof (measure the real 18MB first, before/after load times).

## INBOX-20260901T1340Z — the Glass bakes in line breaks (his routing: backlog)
> "one small note about formatting on the glass-- you seem to be baking in line breaks, which
> hints at a page construction that's messier than it should be. add to the backlog."
solution: none stated
status: OPEN (backlog, his routing) — cause already known: the lesson renders LESSONS.md's hard-wrapped source lines through white-space:pre-line, so every source newline becomes a visible break, and `*crash-only design*` shows raw asterisks (no markdown pass). Fix shape: join lines within a paragraph, break only on blank lines; render *…* as emphasis or strip it.

## INBOX-20260901T1341Z — paste screenshots into the Glass (his routing: much later)
> "also, it'd be great if there were some way to copy-paste in screenshots into the glass; but
> that's a nice to have for much later"
solution: none stated
status: PARKED — his own routing: "nice to have for much later". (Mechanism exists when wanted: the artifact assets capability stores images a page collects.)

## INBOX-20260901T1351Z — storm animation pauses at the second of three squares
> "There's a weird storm animation bug where the storm moves players smoothly to their second (of
> 3) squares, pauses them there, then moves them to the 3rd square. I wonder if this is an
> indexing issue— the storm should smoothly move players to their final square in one move"
solution: the storm should smoothly move players to their final square in one move (his stated target; his hypothesis: an indexing issue — check it FIRST, ruling 7)
status: CLAIMED by watch 16:49:20Z (Wy-Blade) — measuring first (posed probe), see CTO-LEDGER.md

## INBOX-20260901T1332Z — attack buttons land on the WRONG captain
> "Sometimes, the buttons to attack a captain (when there are two options, eg. you're adjacent to
> two captains) place the buttons on top of the wrong captain -- eg Davy Scones button will not be
> on top of Davy Scones, it'll be on top of Crustbeard. Fix this universally, not through patches,
> so that the buttons that refer to selecting a player are always drawn next to them, not on top
> of, or next to, someone else."
solution: fix universally, not through patches — one rule places every player-selecting button beside its player (his words)
status: DONE 2026-09-01 — CEO 69, commit f2dff2c (2 game files); his solution first: commit f2dff2c

## INBOX-20260901T1440Z — the detached trial pops a visible black console on Windows (close = dead trial)
> Wyatt, mid-Blade-hour: "this strange window popped up automatically, do you know what it's
> doing?" — a black `C:\Program Files\nodejs\node.exe` console, which is the detached release
> trial itself (screenshot in the session record, read element by element).
solution: none stated
status: OPEN — mechanism known: Node ignores `windowsHide` for `detached: true` console children on Windows, so start_trial_detached.mjs's trial gets its own visible console (black — stdio goes to the log). The hazard is real, not cosmetic: one accidental ✕ kills an 85-minute trial silently. Fix shape: launch the detached child windowless on Windows (e.g. via a hidden powershell wrapper or CREATE_NO_WINDOW-equivalent), red-proofed on the Blade. Vendored file — fix in claude-kit.

## INBOX-20260901T1317Z — the "Tap and hold the sea" hint's attention animation flashes rapidly
> "\"Tap and hold the sea to reveal the board\" tooltip hint's attention-animation, which should be
> the same gentle orange gradient as the other attention buttons that are on stages, instead
> flashes many many times per second -- the css or something on this animation is broken. Debug."
solution: none stated (target look: the same gentle orange gradient as the other stage attention buttons — his words)
status: DONE 2026-09-01 — CEO 70, no game diff — no fix was written for this item; measured clean in three poses and the thrash theory red-proofed clean; his sighting (13:17Z) predates 0caf85c1 (13:25:57Z), whose orphan sweep is the INFERRED, NEVER PROVEN cause -- guest-only, and his sighting mode was never obtained; closed on his own Chrome test

RE-OPEN TRIGGER, kept live at CEO 70's instruction (the cause is unproven, so this is the only
thing standing between this and a silent recurrence): any fresh-profile sighting of the flash on
build >= .3 re-opens this item. The 10-second check is `localStorage.removeItem('pp4_peekUsed')`
then reload. STILL MISSING, and named so nobody treats it as settled: the MODE of his original
sighting (solo or crew guest) was asked for and never obtained — the inferred cause is guest-only,
so a solo sighting would mean something else is still out there.

## INBOX-20260901T1319Z — redesign the hold: what you NEED vs what you HAVE (pre-launch backlog, his priority)
> "In a recent playtest, a new player did not know how to understand their hold. they didn't
> realize that the red squares were ingredients they still needed; they thought that they already
> had them. add this to the eventual backlog (NOT urgent, but must be done pre-Reddit launch): we
> need to redesign the hold to make it clearer what you need, and what you have. I think there
> should be a separate \"recipe\" box somewhere, so that everyone's hold can simply look the same,
> and the recipe box can get checked off automatically as you acquire those ingredients"
solution: a separate recipe box that checks off automatically; every hold looks the same (his words)
status: PARKED — his own routing: "NOT urgent, but must be done pre-Reddit launch" → belongs on the Chart's launch list (step 3, finished feel), added there at the next Chart pass.

## INBOX-20260901T1322Z — mini spinning coins above bot boats at dock flips (nice-to-have)
> "Eventual nice to have: bot turns at docks should have mini spinning coins appear above their
> boats when they're flipping at the dock. we already hear their sound, we should see it too."
solution: none stated
status: PARKED — his own routing: "Eventual nice to have" → idea inbox, after launch items.

## INBOX-20260901T1314Z — Muse narrations missing in Multiplayer
> "The Muse narrations are now missing from all narration in Multiplayer -- they don't seem to be
> firing at all, or maybe they get wiped away IMMEDIATELY"
solution: none stated
status: DONE 2026-09-01 — CEO 68, commit 841507a (2 game files)

## INBOX-20260901T1310Z — the Glass's "Your Rulings — In Hand" needs a triage lifecycle
> "The Glass's Your Rulings -- In Hand are stale; there must be a process that triages them and
> adds them to the Tasks list, then removes them from the Your Rulings list"
solution: triage each ruling into the Tasks list, then remove it from the Your Rulings list (his words, lightly compressed)
status: OPEN — written on the Glass 13:10:15Z. A wyclau process item: the RULED table needs states (ruled → triaged-to-task → done, only open ones rendered), derived on the Glass, hand-typed nowhere. ORDER NOTE for the first watch: the release-trial entry (INBOX-20260901T1315Z) outranks this despite being 5 minutes younger — his ruling 12 names the trial as the first Watch cargo; take that first.

## INBOX-20260901T1315Z — the release trial, first Watch cargo
> Ruling 12, THE RELAY REDESIGN (question put to him with the recommendation marked, his pick):
> "First job of the new engine — the rebuilt relay's shakedown cargo IS the release: run the
> trial in a way that survives session death, stage it, hand you the link."
solution: none stated
status: IN FLIGHT — re-sailed 2026-09-01T16:44:08Z from the repaired Blade at a clean tree
(HEAD `27fb9c48`, `can_push.mjs` green, build `2026.09.01.6`). Detached, pid 38460, run
`2026-09-01T1644Z-Wy-Blade`, FULL gear, 10 legs (solo-desktop/phone/tablet, passplay-phone/
desktop, crew-desktop/phone, solo-desktop/phone/tablet-wk). Report:
`.planning/SEA-TRIAL-2026-09-01T1644Z-Wy-Blade.md`. Log:
`.planning/wyclau/detached/trial-2026-09-01T1644Z-Wy-Blade.out`. The prior run (started
14:19:35Z) is the one this item already declared COMPROMISED (mid-run rebase); it is now
STALLED per `longrun_status.mjs` and superseded by this one. Next watch: read the report,
do not start a second trial while this pid is alive.

## INBOX-20260901T0000Z — worked example (the fix that seeded this file)
> "the bosun spent 4 days making stupid tooling instead of simply fixing the sail square problem
> by zooming the camera out more -- a solution that i told it at the beginning"
solution: zoom the camera out more
status: DONE 2026-09-01 — fixed the day the Inbox was born, his solution first, posed pair proven; CEO Review 66, commits 76c49bcc/52abc448. Kept as the format's worked example.
