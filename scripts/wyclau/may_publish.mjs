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
 * ⚠ THE THRESHOLD IS THE STOP HOOK'S, NOT ONE OF ITS OWN, AND THIS WAS A REAL DEADLOCK.
 * The first version of this file reasoned its way to 45 minutes -- the watchdog's own "the engine
 * is dead" window -- which is defensible on its own and WRONG in company. CEO Review 56 found why:
 * the Stop hook's brake 1 refuses to let a session end its turn while the pulse is more than
 * PUBLISH_LAG_THRESHOLD_MIN (20) newer than the last publish. Any threshold here above 20 opens a
 * live window -- a 25-minute gap, say -- in which brake 1 says "you may not stop until you publish"
 * and this file says "defer, you may not publish". THE SESSION CAN THEN DO NEITHER: it cannot stop,
 * and it cannot clear the condition stopping it.
 *
 * So the number is READ from .claude/hooks/wyclau-thresholds.cjs, where brake 1 reads it too. The
 * rule it encodes is a relationship, not a quantity: WHEREVER BRAKE 1 CAN BLOCK A STOP, SOMEBODY
 * MUST BE PERMITTED TO PUBLISH. A relationship stored in two places is a relationship that will
 * drift (CLAUDE.md rule 9; rule 23's "what makes these two agree?").
 */
"use strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

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

/* Read brake 1's own threshold out of the tree being judged, so the two can never disagree.
   The fallback is deliberately the SAME value rather than a larger "safe" one: erring high is
   exactly the deadlock this whole arrangement exists to prevent, so if the shared file cannot be
   read, this errs toward PERMITTING a publish rather than toward forbidding one. */
export const FALLBACK_PUBLISH_LAG_MIN = 20;
export function brakeThreshold(dir) {
  try {
    const require_ = createRequire(import.meta.url);
    const v = require_(path.join(dir, ".claude", "hooks", "wyclau-thresholds.cjs")).PUBLISH_LAG_THRESHOLD_MIN;
    return Number.isFinite(v) && v > 0 ? v : FALLBACK_PUBLISH_LAG_MIN;
  } catch { return FALLBACK_PUBLISH_LAG_MIN; }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  const arg = (k, d) => {
    const hit = process.argv.slice(2).find((a) => a.startsWith(`--${k}=`));
    return hit ? hit.slice(k.length + 3) : d;
  };
  const dir = arg("dir", process.cwd());
  const override = Number(arg("stale-minutes", ""));
  const { code, reason } = mayPublish(dir, {
    staleMinutes: Number.isFinite(override) && override > 0 ? override : brakeThreshold(dir),
  });
  console.log(reason);
  process.exit(code);
}
