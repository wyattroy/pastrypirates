#!/usr/bin/env bash
# THE WATCHDOG — macOS/Linux variant (MacBook nights). Same contract as watchdog.ps1:
# runs OUTSIDE any Claude session (cron/launchd), revives the engine when the heartbeat
# goes stale. STATUS: UNPROVEN until deliberately stall-tested on the machine it guards.
#
# Register on macOS (crontab -e), every 10 minutes:
#   */10 * * * * /Users/wyattroy/Documents/Projects/pastrypirates/scripts/wyclau/watchdog.sh
set -u
REPO="${WYCLAU_REPO:-/Users/wyattroy/Documents/Projects/pastrypirates}"
STALE_MIN="${WYCLAU_STALE_MIN:-45}"
HB="$REPO/.planning/wyclau/HEARTBEAT"
LOG="$REPO/.planning/wyclau/restarts.log"
NOW="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

if [ ! -f "$HB" ]; then
  echo "$NOW	no heartbeat file found — launching the engine fresh" >> "$LOG"
else
  AGE_MIN=$(( ( $(date +%s) - $(stat -f %m "$HB" 2>/dev/null || stat -c %Y "$HB") ) / 60 ))
  [ "$AGE_MIN" -le "$STALE_MIN" ] && exit 0
  echo "$NOW	heartbeat stale (${AGE_MIN} min > ${STALE_MIN}) — restarting the engine" >> "$LOG"
fi

cd "$REPO" || exit 1
nohup claude -p "/door - you were relaunched by the watchdog after a stall. Orient, note the restart in the ledger, pulse the Glass, and continue the Chart." >> "$REPO/.planning/wyclau/engine.out" 2>&1 &
