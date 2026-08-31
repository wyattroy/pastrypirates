# THE WATCHDOG (wyclau charter, part 3) -- Windows / the Razer.
#
# The liveness layer lives OUTSIDE the worker: this runs from Task Scheduler, not from any
# Claude session, so it cannot die with one. Every run: read the heartbeat the engine stamps
# via glass.mjs; if it is older than the threshold, log a restart and relaunch the engine
# through the Door.
#
# STATUS: UNPROVEN until the Razer hour. Nothing may claim "the engine never stalls" before
# this is registered and has survived a deliberate stall test (kill the engine, watch this
# revive it, see the restart on the Glass).
#
# Register (run once, in an elevated PowerShell, path adjusted to the Razer's checkout):
#   $repo = "C:\path\to\pastrypirates"
#   schtasks /Create /TN "wyclau-watchdog" /SC MINUTE /MO 10 /TR `
#     "powershell -NoProfile -ExecutionPolicy Bypass -File $repo\scripts\wyclau\watchdog.ps1 -Repo $repo"

param(
  [Parameter(Mandatory=$true)][string]$Repo,
  [int]$StaleMinutes = 45,
  # Must be at least the pulse cadence the Door promises the engine keeps (20 minutes), for the
  # reason spelled out at the one-engine guard below.
  [int]$LaunchGraceMinutes = 25,
  # Log what would be launched instead of launching it, so a gate can exercise THIS script
  # rather than a paraphrase of it. Everything else runs identically.
  [switch]$DryRun
)

$heartbeat  = Join-Path $Repo ".planning\wyclau\HEARTBEAT"
$restarts   = Join-Path $Repo ".planning\wyclau\restarts.log"
$lastLaunch = Join-Path $Repo ".planning\wyclau\LAST-LAUNCH"
$now = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

if (-not (Test-Path $heartbeat)) {
  # No heartbeat at all: the engine has never run here, or the file was cleared.
  # That is a stall by definition -- but say so distinctly so the Glass can show which case it was.
  $reason = "no heartbeat file found -- launching the engine fresh"
} else {
  $age = (Get-Date) - (Get-Item $heartbeat).LastWriteTime
  if ($age.TotalMinutes -le $StaleMinutes) { exit 0 }   # alive; do nothing, quietly
  $mins = [math]::Round($age.TotalMinutes)
  $reason = "heartbeat stale ($mins min > $StaleMinutes) -- restarting the engine"
}

# ONE ENGINE AT A TIME. This guard is what makes the file safe to leave running unattended.
#
# A stale heartbeat does not mean no engine is running. It means no engine has PULSED. An engine
# that is booting, orienting through the Door, or simply mid-item has not pulsed either -- and
# without this guard every tick launches another one on top of it. Two unattended sessions on one
# branch is the hazard CLAUDE.md section 3 exists for; a watchdog that manufactures them on a
# timer is not a liveness layer.
#
# WHY TIME AND NOT A LOCK: there is no cross-process lock available here, and a PID file lies the
# moment a session dies without cleaning up -- it would wedge the watchdog shut forever, which is
# the exact failure this mechanism was built to prevent. A grace window degrades the right way: a
# genuinely dead engine is still restarted, just one window later.
#
# WHY THE GRACE MUST BE >= THE DOOR'S 20-MINUTE PULSE CADENCE: with anything shorter, a healthy
# engine working a long item is indistinguishable from a dead one on EVERY tick. Not hypothetical
# -- on 2026-08-31 the stall test's temporary -StaleMinutes 5 ran against a 10-minute task cadence
# while the Door promised a pulse only every 20 minutes, and those three numbers cannot coexist.
if (Test-Path $lastLaunch) {
  $since = (Get-Date) - (Get-Item $lastLaunch).LastWriteTime
  if ($since.TotalMinutes -lt $LaunchGraceMinutes) {
    $m = [math]::Round($since.TotalMinutes)
    Add-Content $restarts "$now`tstale, but an engine was launched $m min ago (grace $LaunchGraceMinutes) -- NOT spawning a second"
    exit 0
  }
}

Add-Content $restarts "$now`t$reason"

# Relaunch through the Door. The engine re-orients itself from the Chart; no state is assumed.
# (claude must be on PATH for the scheduled task's user. Verified during the Razer hour.)
#
# The prompt is PRE-QUOTED because Start-Process does not quote ArgumentList elements:
# an element containing spaces reaches the child as that many separate arguments, so an
# unquoted prompt hands claude '-p /door - you were relaunched ...' split apart, and it
# dies on usage in a hidden window with no trace. (Observed on the Razer 2026-08-31:
# task tick 14:59Z logged its stale line and no engine ever pulsed; this quoting is the
# standard documented Start-Process behavior, applied as the fix.) The working directory
# is pinned rather than inherited for the same reason: nothing here may depend on the
# caller's state. ASCII ONLY in this file -- PowerShell 5.1 reads BOM-less UTF-8 as
# cp1252, and a pretty dash contains a byte it parses as a closing quote.
Set-Location $Repo
# Keep this prompt free of double quotes: the pre-quoting below cannot survive one.
$doorPrompt = "/door - you were relaunched by the watchdog after a stall. Orient, note the restart in the ledger, pulse the Glass, and continue the Chart."
if ($DryRun) {
  Add-Content $restarts "$now`tDRYRUN would launch the engine"
} else {
  try {
    Start-Process -FilePath "claude" -WorkingDirectory $Repo -ArgumentList @(
      "-p", "`"$doorPrompt`""
    ) -WindowStyle Hidden
    # Reset the clock for the engine just launched. Orientation was MEASURED at 11m14s on
    # the Razer (launch 15:09:01Z -> first pulse 15:20:15Z, 2026-08-31), which is longer
    # than the 10-minute tick -- without this stamp the next tick reads the booting engine
    # as stalled and stacks a second one on it. CEO Review 44, finding 4.
    #
    # NOT under -DryRun: this stamp makes the engine look alive to the NEXT tick, which
    # would send that tick out at the top before it ever reaches the one-engine guard --
    # so a dry run would silently measure the heartbeat check instead of the guard.
    $stampNow = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    Set-Content $heartbeat "$stampNow`trelaunched by watchdog; engine orienting"
  } catch {
    # A "restarting" line with no launch behind it is a log that lies. Say what failed,
    # in the same file the next reader will open. CEO Review 44, finding 3.
    Add-Content $restarts "$now`tlaunch FAILED: $($_.Exception.Message)"
  }
}

# Record WHEN an engine was last launched. Read by the one-engine guard above.
#
# UNCONDITIONAL, and both halves of that are deliberate. Under -DryRun, because the guard is
# the thing the gate exists to exercise and it has nothing to read otherwise. After a FAILED
# launch, because retrying a failing launch every tick is a hot loop; one window later is the
# right degradation, and the heartbeat was not stamped, so it does come back.
Set-Content -Path $lastLaunch -Value $now -Encoding ascii
