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
  # No engine running and nobody has touched a tool for this long = IDLE, and idle is the failure
  # Wyatt named on 2026-08-31. Far shorter than StaleMinutes on purpose: that governs an engine
  # that is running but silent; this governs a tree where nothing is running at all.
  [int]$IdleMinutes = 10,
  # Log what would be launched instead of launching it, so a gate can exercise THIS script
  # rather than a paraphrase of it. Everything else runs identically.
  [switch]$DryRun
)

$heartbeat  = Join-Path $Repo ".planning\wyclau\HEARTBEAT"
$restarts   = Join-Path $Repo ".planning\wyclau\restarts.log"
$lastLaunch = Join-Path $Repo ".planning\wyclau\LAST-LAUNCH"
$lastActivity = Join-Path $Repo ".planning\wyclau\LAST-ACTIVITY"
$now = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

# LIVENESS IS EVIDENCE, NOT NARRATION -- READ BOTH CLOCKS AND TRUST THE NEWER.
#
# HEARTBEAT is a DELIBERATE pulse: a session narrates what it is doing through glass.mjs, so it is
# a statement of intent. A session that is busy and simply not narrating is indistinguishable from
# one that has died. That is not hypothetical -- on 2026-08-31 the engine launched at 15:09:01Z
# worked until ~15:24Z, went quiet WITHOUT EXITING, and at 16:16:02Z this script read 52 minutes of
# silence and launched a second engine into the tree. Nothing was broken; the signal was wrong.
# CEO Review 44 parked exactly this one window before it fired.
#
# LAST-ACTIVITY is stamped by a PreToolUse hook on EVERY tool call ANY session makes -- including
# interactive ones, which the Door's pulse rule never reached and which therefore looked dead to
# this script while a person was typing at them. It is evidence rather than narration.
#
# ABSENT IS NOT ALIVE. A tree where the hook has never run has no LAST-ACTIVITY, and then this
# behaves exactly as it always did -- otherwise a missing file would wedge the watchdog shut,
# which is the failure the whole mechanism exists to prevent.
# IS AN ENGINE ACTUALLY RUNNING? ASK THE OS, NOT A FILE.
#
# Earned 2026-08-31, when Wyatt found the engine "sitting idle -- that is the exact thing that I
# NEVER want to have happen." Every signal below this block is a RECENCY signal: HEARTBEAT is
# narration recency, LAST-ACTIVITY is tool-call recency. Both answer "was something alive lately?"
# NEITHER ANSWERS "IS AN ENGINE WORKING RIGHT NOW?" -- so an interactive session parked at its
# prompt reads as alive, takes the hold-off branch below, and SUPPRESSES the relaunch while
# nothing in the tree is working at all. That is not a stall the old logic could see; it is the
# absence of work wearing a stall's clothes.
#
# This file already rejected a PID file, for a good reason stated below: "a PID file lies the
# moment a session dies without cleaning up." That objection does NOT apply to asking the OS for
# its live process table, which cannot go stale by construction. The headless engine is
# distinguishable from Wyatt's Claude desktop app (also claude.exe) by its command line: only the
# engine carries -p together with the Door prompt.
$engineProcs = $null
try {
  $engineProcs = @(Get-CimInstance Win32_Process -Filter "Name='claude.exe'" -ErrorAction Stop |
    Where-Object { $_.CommandLine -and $_.CommandLine -like '*-p*/door*' })
} catch {
  # Cannot see the process table. UNKNOWN MUST NOT MEAN IDLE -- a watchdog that cannot look is not
  # a watchdog that should launch forever -- so fall through to the recency signals unchanged.
  $engineProcs = $null
}
$engineRunning = ($engineProcs -ne $null) -and ($engineProcs.Count -gt 0)

$hbTime = if (Test-Path $heartbeat)    { (Get-Item $heartbeat).LastWriteTime }    else { $null }
$laTime = if (Test-Path $lastActivity) { (Get-Item $lastActivity).LastWriteTime } else { $null }
$stamps = @($hbTime, $laTime) | Where-Object { $_ -ne $null }

if (-not $engineRunning -and $engineProcs -ne $null) {
  # NOTHING IS RUNNING. The only question left is whether a person has their hands in this tree
  # right now: launching an engine under Wyatt's fingers is the 16:16Z collision. But a session
  # that has not touched a tool in $IdleMinutes is not working -- it is parked at a prompt, which
  # is precisely the state he never wants to see, and waiting out StaleMinutes to notice it is
  # forty-five minutes of nothing happening.
  $humanBusy = ($laTime -ne $null) -and (((Get-Date) - $laTime).TotalMinutes -lt $IdleMinutes)
  if ($humanBusy) {
    $laMin = [math]::Round(((Get-Date) - $laTime).TotalMinutes)
    Add-Content $restarts "$now`tno engine running, but a session was active $laMin min ago (idle window $IdleMinutes) -- held off"
    exit 0
  }
  $reason = "NO ENGINE RUNNING and nothing active for $IdleMinutes+ min -- starting one (idle is the failure, not only stalling)"
} elseif ($stamps.Count -eq 0) {
  # Neither file exists: the engine has never run here, or they were cleared.
  # A stall by definition -- said distinctly so the Glass can show which case it was.
  $reason = "no heartbeat or activity file found -- launching the engine fresh"
} else {
  $newest = ($stamps | Sort-Object -Descending)[0]
  $age = (Get-Date) - $newest

  # THE HOLD-OFF MUST NEVER BE SILENT. If HEARTBEAT alone would say "alive" (narration is fresh),
  # staying quiet is the original behaviour and needs no line. But if the heartbeat itself is
  # stale and only LAST-ACTIVITY is keeping this engine from a restart, that is CEO Review 46's
  # case: the stamp is one shared file per repo, so ANY session touching the tree -- a human, a
  # subagent, a second engine -- can hold off a restart on a dead one's behalf. Silence there is
  # indistinguishable from a watchdog that died. Log it, every time, so the exit test's claim
  # ("zero SILENT stalls, every gap explained by a logged line") stays true through this path too.
  $hbAlive = ($hbTime -ne $null) -and (((Get-Date) - $hbTime).TotalMinutes -le $StaleMinutes)
  if ($age.TotalMinutes -le $StaleMinutes) {
    if (-not $hbAlive -and $laTime -ne $null) {
      $laMin = [math]::Round(((Get-Date) - $laTime).TotalMinutes)
      Add-Content $restarts "$now`theartbeat stale, but LAST-ACTIVITY $laMin min old -- held off, NOT restarting (someone is in the tree)"
    }
    exit 0   # alive; do nothing further
  }
  $mins = [math]::Round($age.TotalMinutes)
  $reason = "no sign of life ($mins min > $StaleMinutes) -- restarting the engine"
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
$doorPrompt = "/door - the watchdog started you because nothing was working in this tree. Orient, note it in the ledger, pulse the Glass, then work the Chart CONTINUOUSLY: finish an item, record it, and take the next one. Do not stop after a single item - stopping is the failure this engine exists to prevent. Stop only when the Chart has nothing unblocked left, and say so."
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
