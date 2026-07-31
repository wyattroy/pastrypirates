---
id: host-enabled-without-firebase-after-solo-resume
title: After a solo resume, boot() returns before fbInit() — Host/Join stay enabled with no Firebase, and Host then lies about why
status: pending
type: bug
severity: medium
area: boot/multiplayer
created: 2026-07-30
found: browser verification of UI-05 (Phase 16), 2026-07-30
origin: PRE-EXISTING — the early return predates Phase 16; UI-05 shortens the path to it by one click
regression: false
---

## What happens

`boot()` (`src/orchestrator.js` ~1314) resumes an in-progress solo game and **returns early**:

```js
if(solo&&solo.seed!=null&&solo.strategies){resumeSoloGame(solo);return;}
const fbOk=fbInit();                       // <-- never reached
if(!fbOk){
  $("choiceHost").classList.add("disabled");
  $("choiceJoin").classList.add("disabled");
  $("fbnote").style.display="";
  return;
}
```

So on that path `appState.db` is **null**, and the three lines that would tell the player so — the
two `disabled` classes and the `#fbnote` explanation — never run. Confirmed live:

```
hasSolo: true       gameVisible: "block"     stepChoose: "block"
hostDisabled: false joinDisabled: false      fbnote: "none"      appState.db: null
```

Clicking **Host a Crew** then calls `createRoom()` → `netCreateRoom(null, …)` throws → the catch
fires this alert:

> *"Arrgh, the server's got too many pirates baking right now! Try a Solo game instead?"*

**That message is not true.** The server is fine; Firebase was never initialised in this tab. It is
the same wording `joinRoom` uses for a genuine capacity failure (D-60 deliberately shares it), so a
real capacity problem and this one are indistinguishable to a player *and* to us in a bug report.

A native `alert()` also blocks the renderer, which is why this first presented as "the tab froze."

## How it was found, and why it is easy to miss

Hit while browser-verifying UI-05. The trigger in that session was the known shared-`localStorage`
harness gotcha — a second tab picked up `pp_solo` written by a solo game running in the first tab.
**But the harness is only how it was reached, not the cause.** Any player with a saved solo game in
progress who opens the page is on this path.

Worth stating plainly: this is dimension 3 from 15-LEARNINGS #1 — the string is present, spelled
right, and reachable; it just renders in a state it does not describe.

## Why it matters slightly more now

UI-05 removed the `#stepHost` screen, so "Host a Crew" goes straight to `createRoom()`. Before, a
player met the misleading alert after two clicks; now it is one. The bug is unchanged; the path is
shorter.

## Fix shape (NOT done — needs Wyatt, because it is partly copy)

Two separable pieces:

1. **Mechanical, safe:** call `fbInit()` *before* the solo-resume early return, or apply the
   disabled/`#fbnote` treatment on that path too. Then Host/Join are correctly greyed and the
   existing `#fbnote` explains why — **no new copy needed**, and it matches the D-40/D-41 convention
   that a dead control explains itself rather than failing on click.
2. **Copy, his call:** `createRoom` should probably distinguish "no database handle at all" from "the
   write failed." The first is a local/setup condition; the second is the capacity case the current
   sentence describes. That needs a second string, which is his to write — see the standing rule.

Do **not** simply delete the alert: a silent no-op on Host would be worse than a misleading message.
