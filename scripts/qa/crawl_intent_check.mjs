#!/usr/bin/env node
// Every page GitHub Pages SERVES must say whether Google may index it.
//
// WHY THIS EXISTS. Wyatt ruled "yes" on T-102: his working files were crawlable and a note had
// told him they were not. The note's reasoning was that they are absent from `sitemap.xml` —
// but A SITEMAP IS AN INVITATION, NOT A FENCE. Leaving a page out of it changes nothing about
// whether a crawler that finds the URL any other way may read and index it.
//
// WHY IT IS DERIVED AND NOT A LIST. The set it guards GREW while the ruling sat unactioned:
// `scratchpad/` did not exist when the ruling was written and carries two more pages today.
// A hand-typed Disallow list rots exactly like the thing it guards (CLAUDE.md §6), so this
// gate derives the served set from the repo tree and the public set from `sitemap.xml`, and
// a page added tomorrow is covered the moment it is committed.
//
// WHAT "SERVED" MEANS, and it is measured, not assumed. This repo has no `.nojekyll` and no
// `_config.yml`, so Pages runs Jekyll, which drops any path segment beginning with `.` or `_`.
// That is why `.planning/`'s twenty pages are NOT part of this set — verified against the live
// domain on 2026-09-03: `/.planning/playtest-checklist.html` answers 404 while
// `/art-review/gallery.html` answers 200.

import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (p) => readFileSync(resolve(ROOT, p), "utf8");

// --- the served set: every tracked .html Jekyll will publish -------------------------------
const tracked = execFileSync("git", ["ls-files", "*.html"], { cwd: ROOT, encoding: "utf8" })
  .split("\n")
  .map((s) => s.trim())
  .filter(Boolean);

const jekyllHides = (p) => p.split("/").some((seg) => seg.startsWith(".") || seg.startsWith("_"));
const served = tracked.filter((p) => !jekyllHides(p));

// --- the public set: whatever sitemap.xml invites ------------------------------------------
// A sitemap <loc> is a URL; turn it back into the repo path Pages serves it from.
const sitemap = read("sitemap.xml");
const publicPaths = new Set(
  [...sitemap.matchAll(/<loc>\s*https?:\/\/[^/]+\/([^<]*)<\/loc>/g)].map(([, tail]) =>
    tail === "" || tail.endsWith("/") ? `${tail}index.html` : tail,
  ),
);

// --- what robots.txt fences off ------------------------------------------------------------
const robots = read("robots.txt");
const disallowed = [...robots.matchAll(/^\s*Disallow:\s*(\S+)\s*$/gim)].map(([, v]) => v);
const isDisallowed = (p) =>
  disallowed.some((rule) => (rule.endsWith("/") ? `/${p}`.startsWith(rule) : `/${p}` === rule));

// --- what each page declares about itself --------------------------------------------------
const META = /<meta[^>]+name=["']robots["'][^>]*content=["']([^"']*)["']/i;
const declaredIntent = (p) => {
  const m = META.exec(read(p));
  return m ? m[1].toLowerCase() : null;
};

const failures = [];
for (const p of served) {
  const intent = declaredIntent(p);
  const isPublic = publicPaths.has(p);

  if (isPublic) {
    // An invited page must actually accept the invitation.
    if (!intent || /noindex/.test(intent)) {
      failures.push(`${p} — is in sitemap.xml but ${intent ? `declares "${intent}"` : "declares no crawl intent"}`);
    } else if (isDisallowed(p)) {
      failures.push(`${p} — is in sitemap.xml and ALSO Disallowed in robots.txt; those contradict`);
    }
    continue;
  }

  // Not invited. It must still say so itself, or be fenced.
  if (!intent && !isDisallowed(p)) {
    failures.push(`${p} — is served, is not in sitemap.xml, declares no crawl intent and is not Disallowed`);
  } else if (intent && !/noindex/.test(intent) && !isDisallowed(p)) {
    failures.push(`${p} — is served, is not in sitemap.xml, and declares "${intent}"`);
  }
}

if (failures.length) {
  console.error(`FAIL  ${failures.length} of ${served.length} served page(s) disagree with sitemap.xml about whether Google may index them:`);
  for (const f of failures) console.error(`        • ${f}`);

  // The hint has to match the fault. Red-proofing this gate produced a public page wrongly
  // marked noindex and the advice printed was "add noindex" — the exact opposite of the fix.
  if (failures.some((f) => /declares no crawl intent/.test(f))) {
    console.error(`
      A page absent from sitemap.xml is NOT thereby hidden. Add to its <head>:
          <meta name="robots" content="noindex, nofollow">

      NOINDEX, NOT A robots.txt Disallow, for anything that has already been live. A Disallow
      stops the crawler FETCHING the page, so it can never read a noindex and never drops a URL
      it already holds — the page stays in the index as a bare link forever. Disallow is for
      paths that were never reachable.`);
  }
  if (failures.some((f) => /is in sitemap\.xml/.test(f))) {
    console.error(`
      A page you INVITED in sitemap.xml must accept the invitation. Either let it be indexed,
      or drop its <loc> from sitemap.xml — inviting a crawler to a page that turns it away is
      the one combination that is always a mistake.`);
  }
  process.exit(1);
}

console.log(`PASS  ${served.length} served page(s) each state whether Google may index them (${publicPaths.size} public, ${served.length - publicPaths.size} withheld).`);
