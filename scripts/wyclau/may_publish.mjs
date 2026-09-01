#!/usr/bin/env node
// VENDORED FROM claude-kit (plugins/wyclau) — edit THERE, not here. Re-vendor: `bash install.sh vendor <repo> wyclau` from claude-kit. Drift is caught by scripts/qa/vendor_check.mjs.
/* may_publish.mjs — may THIS session publish the Glass, or should it defer to the Bosun?
 *
 * ONE PUBLISHER IS THE DEFAULT, AND IT STAYS THE DEFAULT. Wyatt's ruling, 2026-08-31: one WORKER,
 * everything else scaffolding. The failure it was written against is measured — the Razer engine
 * and a second session both published within five minutes and the platform's own conflict guard
 * fired three times. Other sessions write .planning/wyclau/GLASS-NOTE.md and commit; the Bosun
 * folds it in on its next pulse.
 *
 * WHAT THIS ADDS, AND ONLY THIS: the one-publisher rule was written against two sessions RACING,
 * not against a session RESCUING a page that has stopped moving. On 2026-09-01 Wyatt was reading a
 * Glass whose clock had been frozen for over two hours while the engine was genuinely alive, and
 * the rule as written said nobody else could fix it. So: measured staleness, and nothing else, is
 * the override.
 *
 * EXIT CODES ARE THE INTERFACE:  0 = you may publish.  1 = defer to the Bosun.
 *
 * THE THRESHOLD IS NOT INVENTED HERE. It defaults to the same 45 minutes the watchdog uses to
 * decide an engine is DEAD (`watchdog.ps1 -StaleMinutes`), and callers pass their own in. The
 * reasoning is one sentence: if the page has not been published for longer than it takes this
 * system to conclude the engine is gone, the Bosun is not about to rescue it, so somebody else
 * may. Anything shorter and this quietly becomes a second publisher rather than a rescue.
 */
"use strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const MAY_PUBLISH = 0;
export const DEFER = 1;

const readStamp = (p) => {
  let raw;
  try { raw = fs.readFileSync(p, "utf8"); } catch { return null; }
  const iso = raw.split("\t")[0]?.trim();
  const t = iso ? Date.parse(iso) : NaN;
  return Number.isFinite(t) ? t : null;
};

export function mayPublish(dir, { staleMinutes }) {
  const wy = path.join(dir, ".planning", "wyclau");
  const hb = readStamp(path.join(wy, "HEARTBEAT"));
  const lp = readStamp(path.join(wy, "LAST-PUBLISH"));

  // No pulse at all: there is no evidence of a Bosun in this tree to defer TO, and nothing to
  // rescue either. Deferring would be deferring to nobody.
  if (hb === null) {
    return { code: MAY_PUBLISH, reason: "no HEARTBEAT here -- there is no Bosun in this tree to defer to" };
  }

  // Pulses exist but nothing was ever published: the page Wyatt opens has never been written by
  // anyone. One publisher cannot mean no publisher.
  if (lp === null) {
    return { code: MAY_PUBLISH, reason: "pulses exist but no publish was ever recorded -- publish it; one publisher cannot mean none" };
  }

  const lagMin = (hb - lp) / 60000;
  if (lagMin > staleMinutes) {
    return {
      code: MAY_PUBLISH,
      reason: `the last pulse is ${lagMin.toFixed(0)} min newer than the last publish (over ${staleMinutes}) -- the page has stopped moving, rescue it`,
    };
  }
  return {
    code: DEFER,
    reason: `the page is current (pulse is ${lagMin.toFixed(0)} min ahead of the last publish, under ${staleMinutes}) -- defer, one publisher stands`,
  };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  const arg = (k, d) => {
    const hit = process.argv.slice(2).find((a) => a.startsWith(`--${k}=`));
    return hit ? hit.slice(k.length + 3) : d;
  };
  const staleMinutes = Number(arg("stale-minutes", "45"));
  const { code, reason } = mayPublish(arg("dir", process.cwd()), {
    staleMinutes: Number.isFinite(staleMinutes) ? staleMinutes : 45,
  });
  console.log(reason);
  process.exit(code);
}
