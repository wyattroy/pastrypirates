# The Razer hour — making "never silently stalls" true

*The one-time setup from the charter's risk list. Until every box below is checked, the engine's
dependability is a design, not a fact — no session may claim otherwise.*

**What you need:** the Razer, ~30–60 minutes, Claude Code installed and logged in there.

## The steps (a session walks you through these; steps 2, 3 and 8 are YOURS alone)

1. **Clone/update the repo** on the Razer; note its path (call it `$repo`).
2. **Trust the workspace** — open `claude` interactively in `$repo` once, accept the
   folder-trust prompt, exit. Until that prompt is accepted, every project permission in
   `.claude/settings.json` is silently dropped — headless runs don't ask, they just stall.
   (Found the hard way, 2026-08-31: `hasTrustDialogAccepted: false` dropped all 88 entries and
   nothing said so.)
3. **Grant the engine its hands** — replace the `"permissions"` object in
   `.claude/settings.json` with the block below, then commit and push it. **This step is yours
   by design, not by accident: the harness refuses to let a session write its own permission
   grants, with or without your approval on record.** (That refusal was verified twice — in a
   cloud session. Confirm it once on the Razer itself, by asking the engine session to add an
   allow entry and watching it be refused, before you trust the stall test: if a local session
   CAN edit this file, unscoped `Write` plus `git push origin claude/*` would let it widen its
   own grants. A claim is only good where it was measured.)

   **Be honest about what this block is.** An engine that can `Write` any file and then run
   `node scripts/<anything>` can run whatever it writes — dropping the old `python3 -c` /
   `node -e` entries is hygiene, not a fence. The engine must edit game code to do its job, so
   that trade is inherent. What is ACTUALLY fenced: production (`git push origin main` is not
   granted), publishing to staging where you play, and your secrets (the deny block):

   ```json
   "permissions": {
     "allow": [
       "Bash(node --check *)",
       "Bash(git rev-list *)",
       "Bash(git fetch *)",
       "Bash(curl -s -o /dev/null *)",
       "mcp__github__actions_list",
       "mcp__github__actions_get",
       "Bash(node scripts/*)",
       "Bash(node .claude/gsd-core/bin/gsd-tools.cjs *)",
       "Bash(npm test*)",
       "Bash(git status*)",
       "Bash(git diff *)",
       "Bash(git log *)",
       "Bash(git show *)",
       "Bash(git pull *)",
       "Bash(git add *)",
       "Bash(git commit *)",
       "Bash(git push origin claude/*)",
       "Bash(git rev-parse *)",
       "Bash(pkill -f remote-debugging-port*)",
       "Bash(pkill -f http.server*)",
       "Bash(curl -s https://playpastrypirates.com/*)",
       "Bash(curl -s https://staging.playpastrypirates.com/*)",
       "Edit",
       "Write"
     ],
     "deny": [
       "Read(.env)",
       "Read(.env.*)",
       "Read(.secrets)"
     ]
   },
   ```

   What is deliberately NOT here: `git push origin main` (production stays human),
   `./scripts/deploy-staging.sh` (publishing where you play stays human), `git checkout`
   (the engine stays on its branch), and any bare interpreter (`node -e`, `python3`).
4. **Prove the engine can pulse headless:**

   ```powershell
   claude -p "Run exactly this command and show its output: node scripts/wyclau/glass.mjs --note 'headless permission probe'"
   ```

   then confirm `.planning\wyclau\HEARTBEAT` was just written. This step used to be
   `claude -p "say ok"` — a check that uses no tools, so it passed on a machine where the
   engine could not stamp its own heartbeat. **A check that cannot fail on the thing it
   certifies certifies nothing.**
5. **Register the watchdog** (elevated PowerShell — the exact command is at the top of
   `scripts/wyclau/watchdog.ps1`, with `$repo` substituted). Every 10 minutes it checks the
   heartbeat; stale > 45 min ⇒ it logs to `restarts.log` and relaunches the engine through the
   Door.
6. **Launch the engine once by hand:** `claude -p "/door"` — watch it orient, claim work, and
   pulse the Glass.
7. **THE STALL TEST — the step that makes it real.** Kill the engine process on purpose. Wait.
   The watchdog must revive it within ~10 minutes of the heartbeat going stale, the restart must
   appear in `restarts.log`, and the Glass must show fresh progress after. A watchdog that has
   never caught a deliberate stall is an instrument that has never been proven able to fail —
   the exact class of tool this project learned not to trust. (Run literally this waits out the
   full 45-minute staleness; registering the task with `-StaleMinutes 5` for the test and
   re-registering at 45 after it passes exercises the identical path in ~15 minutes.)
8. **Arm your phone:** run `/remote-control` in the engine session yourself (only you can), and
   confirm the Glass link opens on your phone: the engine republishes it as it works.

## After the hour

The Chart's exit test begins: **24 hours unattended, zero silent stalls** — every gap in the
heartbeat explained by a logged restart. Then, and only then, the charter's keel sentence is
claimable.

## Honest limits

- The watchdog revives the engine; it cannot revive the *machine* (sleep, updates, power). Task
  Scheduler should be set to run whether or not you are logged in; disable sleep-on-idle for
  mains power.
- `claude -p` must be on PATH for the scheduled task's user — step 4 exercises this, and the hour
  isn't done until the stall test passes with the task, not just the terminal.
