# Phase 19 — Safari Run Protocol

This is the one file with everything you need for the Safari afternoon: the links to tap, the
order to run them in, and where the numbers get written down. Nothing here requires opening a
console or typing anything — just tapping links on your Mac and your phone.

## 1. Serving and the fresh port

The branch build is being served from a small local web server running on this Mac, on port
**8934**.

- **Desktop link (Mac Safari):** http://localhost:8934/index.html
- **Phone link (iPhone Safari, same wifi as the Mac):** http://192.168.1.3:8934/index.html

**Why the port matters:** Safari (and Chrome) hang on to old code for a port that has already
served a build once — even if you reload the page, you can end up looking at yesterday's version
without knowing it. Every time the code changes and needs re-testing, a brand new port number gets
used, never one that has served a build before this session. This bites harder on the phone,
because the phone has no easy "hard reload" the way a desktop browser does — so if something looks
wrong on the phone, the first thing to check is whether it's a fresh port, not a real bug.

**Ports already used this session:**
- 8934 — first serve, phase 19

## 2. Turning the prototype on

A normal build of the game shows nothing new at all — no dots, no dial, nothing different from
what you've already seen. The **only** thing that turns the wind-dot prototype on is adding
`?wind=1` to the end of the web address. That's it — once the page opens with that on the end,
every control you need (the on/off switch, the dial, the readout) is already on screen and works
by touch/tap, nothing hidden behind a menu.

- **Desktop enable link:** http://localhost:8934/index.html?wind=1
- **Phone enable link:** http://192.168.1.3:8934/index.html?wind=1

Just tap/click those links directly — no need to type the `?wind=1` part yourself.

## 3. The two runs, in order

Once the prototype is on, there are two runs to do, always in this order:

1. **Run 1 — the headroom run.** Turn the dial up toward 100 dots and get a feel for roughly where
   it starts to look choppy or the phone/Mac starts to struggle. This just finds the rough ceiling
   — no need to be precise.
2. **Run 2 — the real test.** Lock the dial to **10** dots and play a full voyage — narration
   typing, ships moving, storms arriving and leaving, the works — with the dots running the whole
   time in the background.

**Both runs happen twice each** — once in Safari on the Mac, and once in Safari on the iPhone.
The phone's result is the one that counts for the final decision, not the Mac's — the Mac is just
a first look.

## 4. Where the answer goes

Once both runs are done on both devices, the numbers and the verdict get written into a file
called `19-VERDICT.md` at the end of this phase. You don't need to do anything with that file
yourself — just play the two runs and describe what you saw when asked, and it gets recorded
there.

## 5. Phone reachability and go-ahead

**Date:** 2026-08-01
**Port used:** 8934
**LAN address:** 192.168.1.3
**Phone link used:** http://192.168.1.3:8934/index.html

**What happened:** Wyatt's iPhone opened the phone link above over wifi and the page loaded
successfully. Separately, on the Mac side, the same address was checked and confirmed to answer
with a normal "page found" response, and the build was driven in a desktop browser at that exact
address to confirm it boots cleanly end to end — the board renders, the lobby renders, and nothing
odd shows up in the background diagnostics across a reload. The `?wind=1` link was also checked and,
as expected at this stage, it changes nothing yet — no dots, no dial, no switch — because building
those is the next step (plan 19-03), not this one.

**The randomness question:** Wyatt was asked where the wind dots should get their random numbers
from — the game's own shared stream (the one that keeps every player's game in sync) or a separate,
private stream that starts from the game's number but never touches the shared one. He confirmed
the separate private stream — the same approach the storm rain already uses safely today. This means
the game's own numbers are never touched by the dots, every player in a room still sees the same
weather, and the 31 saved test games that check the game's numbers keep matching. It's also the
answer that goes with the standing promise that nothing in this phase changes the game engine
itself.

**Selected option:** go-ahead — the phone opened the page, and the separate-private-stream approach
is confirmed. The prototype (plan 19-03) is cleared to begin.

## 6. Chrome pre-flight checklist

_(Added later, by plan 19-06.)_
