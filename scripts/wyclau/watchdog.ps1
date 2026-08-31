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
  [int]$StaleMinutes = 45
)

$heartbeat = Join-Path $Repo ".planning\wyclau\HEARTBEAT"
$restarts  = Join-Path $Repo ".planning\wyclau\restarts.log"
$now = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

if (-not (Test-Path $heartbeat)) {
  # No heartbeat at all: the engine has never run here, or the file was cleared.
  # That is a stall by definition -- but log it distinctly so the Glass can show which case it was.
  Add-Content $restarts "$now`tno heartbeat file found -- launching the engine fresh"
} else {
  $age = (Get-Date) - (Get-Item $heartbeat).LastWriteTime
  if ($age.TotalMinutes -le $StaleMinutes) { exit 0 }   # alive; do nothing, quietly
  $mins = [math]::Round($age.TotalMinutes)
  Add-Content $restarts "$now`theartbeat stale ($mins min > $StaleMinutes) -- restarting the engine"
}

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
$doorPrompt = "/door - you were relaunched by the watchdog after a stall. Orient, note the restart in the ledger, pulse the Glass, and continue the Chart."
Start-Process -FilePath "claude" -WorkingDirectory $Repo -ArgumentList @(
  "-p", "`"$doorPrompt`""
) -WindowStyle Hidden
