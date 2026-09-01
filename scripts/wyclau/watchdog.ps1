# THE WATCHDOG (wyclau charter, part 3) -- Windows / the Razer.
# VENDORED FROM claude-kit (plugins/wyclau) -- edit THERE, not here. Re-vendor from a claude-kit checkout on THIS machine: bash install.sh vendor <repo> wyclau. Drift is caught by scripts/qa/vendor_check.mjs.
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

# THE JUDGEMENT LEFT POWERSHELL, 2026-09-01 (the chain audit's architectural move).
#
# Everything this script used to decide here -- is the tree alive, is a human in it, is silence a
# stall -- is now scripts/wyclau/should_launch.mjs, which exits 0 to LAUNCH and 1 to hold off and
# prints one plain reason either way. THE REASON IS TESTABILITY, AND IT IS NOT CEREMONY: no check
# that runs in CI, in a cloud container, or on Wyatt's Mac can execute PowerShell, so for as long
# as this logic lived here the only available instrument was grepping this file for strings --
# exactly the "instrument that measures something other than what it names" this project keeps
# paying for. The node helper is driven as a real subprocess by scripts/qa/wyclau_chain_audit_check.mjs
# against real fixture trees, so its decisions are checked by behaviour rather than by reading.
#
# WHAT STAYED HERE, and it is the one thing that had to: whether a claude.exe with -p /door is
# alive. That is a genuinely Windows-only fact, so it is measured above and PASSED IN as a flag.
#
# WHAT CHANGED IN THE DECISION ITSELF (the fault Wyatt reported): LAST-ACTIVITY no longer buys a
# hold-off on its own. It is stamped by a PreToolUse hook on every tool call by any session, so
# HIS OWN TYPING kept it warm while the Chart did not move, and this script held off for hours
# waiting on a signal that was never going to change. A tool call is not progress; a commit is.
$engineFlag = if ($engineRunning) { "running" } elseif ($engineProcs -eq $null) { "running" } else { "absent" }
if ($engineProcs -eq $null) {
  # CANNOT SEE THE PROCESS TABLE. Unknown is reported as "running" on purpose: of the two possible
  # errors, suppressing a needed launch is recoverable one window later, while stacking a second
  # engine onto a live one is the two-sessions-on-one-branch hazard CLAUDE.md section 3 exists for.
  # Logged every tick so a hold-off this script cannot justify is never silent.
  Add-Content $restarts "$now`tcannot read the process table -- assuming an engine IS running and holding off (see CLAUDE.md section 3)"
}

# RESOLVED FROM THIS SCRIPT'S OWN DIRECTORY, NOT FROM $Repo. The helper is part of the watchdog's
# installation and ships beside it; the tree being judged arrives as --dir. Using $Repo instead was
# wrong twice over: it assumed every judged tree carries a copy of the tooling, and it broke
# watchdog_one_engine_check.mjs, which points a real watchdog at a bare fixture repo on purpose --
# the decider vanished, every tick held off, and the gate could no longer see the question it
# exists to ask. Found by running the suite, not by reading.
$decider = Join-Path $PSScriptRoot "should_launch.mjs"
$reason = $null
$shouldLaunch = $false
try {
  $deciderOut = & node $decider "--dir=$Repo" "--engine=$engineFlag" "--stale-minutes=$StaleMinutes" 2>&1
  $deciderCode = $LASTEXITCODE
  $reason = ($deciderOut | Out-String).Trim()
  if ($deciderCode -eq 0) {
    $shouldLaunch = $true
  } elseif ($deciderCode -eq 1) {
    # A hold-off must never be silent -- the exit test's claim is "zero SILENT stalls, every gap
    # explained by a logged line", and that has to survive this path too.
    Add-Content $restarts "$now`thold off: $reason"
    exit 0
  } else {
    Add-Content $restarts "$now`tshould_launch.mjs exited $deciderCode (expected 0 or 1) -- holding off rather than acting on a verdict this cannot read: $reason"
    exit 0
  }
} catch {
  # A watchdog that cannot run its own decider must not fall back to launching forever.
  Add-Content $restarts "$now`tcould not run should_launch.mjs ($($_.Exception.Message)) -- holding off; a watchdog that cannot judge must not spawn"
  exit 0
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
    # PP_BOSUN=1 -- the env stamp the keep-working Stop hook gates on (Quartermaster's design,
    # 2026-08-31: the hook must fire ONLY in a session the watchdog started, never in Wyatt's own
    # terminal or a cloud session). A child process inherits the parent's environment BY DEFAULT,
    # so setting this on the CURRENT process, immediately before the call, is the whole mechanism.
    # ⚠ CEO Review 53 finding, corrected: an earlier version of this comment claimed Start-Process
    # "has no environment-isolation switch" -- false, and never checked. `(Get-Command
    # Start-Process).Parameters.Keys` DOES list `-UseNewEnvironment` (verified on PS 5.1.26100.9168).
    # The behaviour here was always correct -- that switch is simply never passed -- but the comment
    # told the next reader a footgun was impossible when it is one flag away. DO NOT ADD
    # -UseNewEnvironment here; doing so silently breaks the stamp and this hook will never fire.
    $env:PP_BOSUN = "1"
    Start-Process -FilePath "claude" -WorkingDirectory $Repo -ArgumentList @(
      "-p", "`"$doorPrompt`""
    ) -WindowStyle Hidden
    # THE LAUNCH STAMP IS GONE, 2026-09-01 (the chain audit's fix 5b), and what it used to do is
    # worth stating so nobody puts it back. A line here used to write the heartbeat file directly,
    # with the text "relaunched by watchdog; engine orienting". (Deliberately not spelled out as
    # code: the gate that enforces this reads the file for that write, and a quoted example of the
    # forbidden line is indistinguishable from the line itself -- it failed exactly that way once.)
    # THE LAUNCHER WAS VOUCHING FOR AN ENGINE THAT MAY NEVER HAVE STARTED. Start-Process returns
    # as soon as it has handed the request to the OS, so a launch that FAILED to become a working
    # session still left a fresh heartbeat behind it, and the next several ticks read that stamp
    # and believed a live engine was orienting. A heartbeat is supposed to be evidence; this was
    # the launcher writing its own alibi -- the same fault as the timer-driven Monitor of
    # 2026-08-31, in a different place.
    #
    # THE ENGINE STAMPS IT INSTEAD, when it actually orients: the Door's step 3 pulses the Glass
    # (glass.mjs writes HEARTBEAT), so the first stamp now means a session really reached the
    # Chart. Nothing is lost from the anti-stacking guard, which never read HEARTBEAT: LAST-LAUNCH
    # below is written unconditionally and the $LaunchGraceMinutes window (25 min, against a
    # MEASURED 11m14s orientation on the Razer, 2026-08-31) is what stops the next tick stacking a
    # second engine onto one that is still booting. CEO Review 44 finding 4 stays answered.
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
