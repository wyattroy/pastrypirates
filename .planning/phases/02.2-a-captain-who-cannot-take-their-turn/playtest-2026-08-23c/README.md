# The four-leg gate on build 2026-08-23c — the first run where every leg finished

| leg | result |
|---|---|
| solo-desktop | **END OF VOYAGE, day 15** |
| solo-phone | **END OF VOYAGE, day 14** |
| passplay-phone | **END OF VOYAGE, day 12** |
| crew-desktop | **END OF VOYAGE, day 15 — HOST AND GUEST BOTH** (test1 / test2, real Firebase room) |

**This is the first time the crew leg has completed at all.** It never ran on 2026-08-22 (the gate
hung), and the attempt before that could not start a lobby.

## The numbers, against two nights ago

| | 2026-08-21 (build g) | tonight (23c) |
|---|---|---|
| vision-judge failures | **53** | **5** |
| structural failures | 4 | **3**, all one rule |
| legs reaching an end of voyage | 1 of 4 | **4 of 4** |

The judge ran at all tonight because Wyatt re-authenticated the `claude` CLI — it had been returning
"OAuth session expired" for every screen, which the gate used to report as 67 unparseable replies.

## The five judge findings, verbatim — the work queue

1. `solo-phone-014` — trade offer text hidden behind the coin slider box; only fragments visible,
   and the "Toasty Wheat" label clipped by the slider's rounded bottom edge.
2. `solo-desktop-003` — on the selected recipe card the "Bake this!" button sits on top of the plate
   icon, hiding nearly all of it. The unselected card's icon is fully visible, so it reads as
   layering rather than style.
3. `solo-phone-017` — Deny/Counter/Accept circles overlap the bottom of the italic helper bubble
   above them.
4. `passplay-phone-027` — **"Attack −2" is largely hidden behind "Pass +1"**, only a sliver visible.
   Worth attention: Group F's fan work (D-44) was meant to end exactly this, so either a case slips
   through the derived gap or something else places these two.
5. `crew-desktop-host-001` — no narration/prompt box for the host when the context says there should
   be one, plus a large empty band below the CAPTAINS list. Possibly the D-20 reveal gate caught
   mid-animation; **not measured, so not claimed.**

## The three structural failures — all one rule, all known

`no-cover-ask: "sailCell" over "<captain>: tap to sail"` — a sail square covering the ask pill.
Group G could not baseline it (it fires roughly once per fifteen days of sailing) and measured that
its own clamp cannot reach it: a sail prompt's pill is 36px and the ceiling is `capT - 42`. **This is
the pill's placement, NOT the narration bubble's** — a different fault from the one the bubble
obstacle work addressed.

## Also seen

One console error on the crew leg: `duplicate attach refused` for the Firebase `.info/connected`
watcher. Phase 4 made `watchBattle` attach on every client with a room; this is adjacent and worth a
look, but it is a refusal working as designed rather than a crash.

Seven screens "never stopped moving before being checked" across the legs — recorded, not failed
(see the settle note in `4/scripts/lib/checks.mjs`). That is the cap doing its job on a board where
sail squares bounce permanently.
