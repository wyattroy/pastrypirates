// chrome.mjs — the ONE place the browser drivers learn where the repo and Chrome are.
// Cloud-runnable (2026-08-21, Wyatt: "I want to be able to run all future sessions in the cloud"):
// nothing here is typed for one machine. Importers: mouse_qa.mjs, mp_rig.mjs, stage_layout_check.mjs.
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// repo root from this file's own location (4/scripts/lib -> repo), never a literal path
export const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

// $CHROME_BIN wins; then the PATH (Linux cloud image: google-chrome / chromium / chromium-browser);
// then the Mac app bundle. Fail loudly — a missing binary otherwise reads as "chrome never came up".
export const CHROME = (() => {
  if (process.env.CHROME_BIN) return process.env.CHROME_BIN;
  for (const n of ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]) {
    try { const p = execSync(`command -v ${n}`, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); if (p) return p; } catch {}
  }
  const mac = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  if (fs.existsSync(mac)) return mac;
  console.error("FATAL: no Chrome found — set CHROME_BIN"); process.exit(1);
})();

// Linux containers (the cloud sandbox) need both or headless Chrome dies at launch: the SUID
// sandbox is unavailable when running as root, and /dev/shm is tiny.
export const LINUX_ARGS = process.platform === "linux" ? ["--no-sandbox", "--disable-dev-shm-usage"] : [];
