// IS A REAL HEADLESS ENGINE (claude.exe -p .../door) RUNNING ON THIS MACHINE, RIGHT NOW?
//
// Shared by every gate that exercises watchdog.ps1 for real against a throwaway fixture repo
// (watchdog_one_engine_check.mjs, watchdog_liveness_check.mjs). watchdog.ps1's own engine check
// is deliberately MACHINE-GLOBAL -- it asks the OS for every `claude.exe -p .../door` process,
// with no way to scope that query to a fixture repo. That is correct production behaviour (only
// one unattended engine should ever run on the Razer, CLAUDE.md section 3), but it means that
// whenever a gate exercising the real script is run FROM INSIDE a live watchdog-started session
// (the normal way this project now runs unattended work), the real watchdog it invokes sees the
// CALLING session's own process and correctly holds off on every fixture tick too -- through no
// fault of the fixture or the script under test.
//
// This is a raw, read-only OS query -- not a second copy of the SPAWN/REFUSE decision under test,
// which stays entirely in watchdog.ps1/should_launch.mjs. It exists only so a gate can tell "the
// script is broken" apart from "a real engine is legitimately holding everything off right now"
// and skip loudly in the second case, the same way these gates already skip loudly off Windows.
//
// Deliberately NOT watchdog.ps1's own `-Filter "Name='claude.exe'" | Where-Object {...-like...}`
// pair: measured directly, that exact combination returned zero hits against a command line that
// plainly contained `-p "/door - ...` (the WQL filter's exact-name match plus -like's globbing did
// not survive the embedded quotes around the Door prompt). Listing PID+CommandLine and testing
// with a plain regex here avoided reproducing that same blind spot.
import { execFileSync } from "node:child_process";

export function realEngineIsRunning() {
  if (process.platform !== "win32") return false;
  try {
    const raw = execFileSync("powershell", [
      "-NoProfile", "-Command",
      "Get-CimInstance Win32_Process -Filter \"Name='claude.exe'\" -ErrorAction Stop | " +
        "ForEach-Object { $_.ProcessId.ToString() + '|' + $_.CommandLine }",
    ], { stdio: "pipe" }).toString();
    return /\|[^\n]*-p[^\n]*\/door/i.test(raw);
  } catch (e) {
    // Cannot see the process table -- same posture as watchdog.ps1 itself: unknown must not be
    // read as "safe to proceed", so report "no engine seen" and let the caller's fixture run,
    // exactly as it did before this preflight existed.
    return false;
  }
}
