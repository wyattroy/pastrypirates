# The Razer hour — making "never silently stalls" true

*The one-time setup from the charter's risk list. Until every box below is checked, the engine's
dependability is a design, not a fact — no session may claim otherwise.*

**What you need:** the Razer, ~30–60 minutes, Claude Code installed and logged in there.

## The steps (a session at the Razer walks you through these)

1. **Clone/update the repo** on the Razer; note its path (call it `$repo`).
2. **Prove `claude` works headless there:** `claude -p "say ok"` from a terminal in `$repo`.
3. **Register the watchdog** (elevated PowerShell — the exact command is at the top of
   `scripts/wyclau/watchdog.ps1`, with `$repo` substituted). Every 10 minutes it checks the
   heartbeat; stale > 45 min ⇒ it logs to `restarts.log` and relaunches the engine through the
   Door.
4. **Launch the engine once by hand:** `claude -p "/door"` — watch it orient, claim work, and
   pulse the Glass.
5. **THE STALL TEST — the step that makes it real.** Kill the engine process on purpose. Wait.
   The watchdog must revive it within ~10 minutes of the heartbeat going stale, the restart must
   appear in `restarts.log`, and the Glass must show fresh progress after. A watchdog that has
   never caught a deliberate stall is an instrument that has never been proven able to fail —
   the exact class of tool this project learned not to trust.
6. **Arm your phone:** run `/remote-control` in the engine session yourself (only you can), and
   confirm the Glass link opens on your phone: the engine republishes it as it works.

## After the hour

The Chart's exit test begins: **24 hours unattended, zero silent stalls** — every gap in the
heartbeat explained by a logged restart. Then, and only then, the charter's keel sentence is
claimable.

## Honest limits

- The watchdog revives the engine; it cannot revive the *machine* (sleep, updates, power). Task
  Scheduler should be set to run whether or not you are logged in; disable sleep-on-idle for
  mains power.
- `claude -p` must be on PATH for the scheduled task's user — step 2 verifies this, and the hour
  isn't done until the stall test passes with the task, not just the terminal.
