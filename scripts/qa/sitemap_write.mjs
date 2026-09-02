/* Regenerate `sitemap.xml` with every `<lastmod>` DERIVED from git.
 *
 *   node scripts/qa/sitemap_write.mjs            # rewrite the file
 *   node scripts/qa/sitemap_write.mjs --print    # print it, touch nothing
 *
 * WHY THIS IS A SCRIPT AND NOT AN EDIT. Wyatt, 2026-09-02, 3:07 PM ET: *"DERIVE the dates, do not
 * hand-type them — an inaccurate lastmod gets discounted by Google, and a hand-typed date is wrong
 * the moment work continues."* On this branch `index.html` is committed most days, so a date typed
 * today is wrong tomorrow, and wrong silently: Google's response to a sitemap it can prove stale is
 * to stop trusting the dates, which nothing on our side ever observes.
 *
 * WHAT IT KEEPS AND WHAT IT DROPS. The URL list is read out of the EXISTING file rather than
 * invented here — which pages belong in the index is an editorial decision (`robots.txt` disallows
 * `lab.html` and `stats.html` in both trees, and `/4/`; `/classic` is kept out of the index a
 * different way, by `noindex,follow` on the page itself) — and a generator that rediscovered the
 * page list by walking the directory would quietly re-add every one of them.
 *
 * ⚠ AND IT KEEPS THE `<loc>` AND NOTHING ELSE FROM AN ENTRY. An earlier version of this comment
 * said *"everything else about an entry is preserved in the order it was written"*, and that was a
 * behavioural claim about code that does not do it — CEO 122's finding 2. The writer below emits
 * `<loc>` and `<lastmod>`, full stop, so an `<xhtml:link>` alternate or an `<image:image>` added by
 * hand would be dropped on the next run, in silence. Both entries are `loc`-only today so nothing
 * is lost; **the next person to add a tag here has to teach this function about it first.**
 *
 * ⚠ `sitemap.xml` IS A SITE-IDENTITY FILE (rule 14, `docs/GIT-AND-DEPLOY.md` §1). It must never be
 * copied into the preview or staging tree — `deploy-staging.sh:154` already excludes it, and this
 * script deliberately touches nothing but the one file at the repo root. Do not "helpfully" teach
 * it to write a second copy anywhere.
 *
 * The gate that keeps this true is `sitemap_lastmod_check.mjs`, which recomputes the same dates and
 * fails when the file on disk disagrees. This script exists so that fixing that failure is one
 * command instead of an invitation to type a date.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readOrigin, locToFile, gitLastCommitDate } from "./sitemap_lastmod_check.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const SITEMAP = path.join(ROOT, "sitemap.xml");

const origin = readOrigin();
const xml = fs.readFileSync(SITEMAP, "utf8");

const blocks = xml.match(/<url>[\s\S]*?<\/url>/g) || [];
if (!blocks.length) {
  console.error("sitemap_write: no <url> entries found — refusing to write an empty sitemap");
  process.exit(1);
}

const entries = [];
for (const block of blocks) {
  const loc = (block.match(/<loc>\s*([^<]+?)\s*<\/loc>/) || [])[1];
  if (!loc) { console.error("sitemap_write: a <url> entry has no <loc> — refusing"); process.exit(1); }

  const mapped = locToFile(loc, origin);
  if (mapped.error) { console.error(`sitemap_write: ${loc} ${mapped.error} — refusing`); process.exit(1); }
  if (!fs.existsSync(path.join(ROOT, mapped.rel))) {
    console.error(`sitemap_write: ${loc} -> ${mapped.rel} does not exist in this repo — refusing`);
    process.exit(1);
  }

  /* REFUSE, NEVER SUBSTITUTE. An uncommitted page has no derivable date, and the two tempting
     fallbacks — today, or the file's mtime — are both fabrications that would read to a crawler
     exactly like a real one. His whole point is that a wrong date costs more than a missing one. */
  const lastmod = gitLastCommitDate(mapped.rel);
  if (!lastmod) {
    console.error(`sitemap_write: ${mapped.rel} has never been committed, so no lastmod can be derived — refusing`);
    process.exit(1);
  }
  entries.push({ loc, rel: mapped.rel, lastmod });
}

const out =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  entries.map((e) =>
    `  <url>\n` +
    `    <loc>${e.loc}</loc>\n` +
    `    <lastmod>${e.lastmod}</lastmod>\n` +
    `  </url>\n`).join("") +
  `</urlset>\n`;

if (process.argv.includes("--print")) {
  process.stdout.write(out);
} else {
  fs.writeFileSync(SITEMAP, out);
  for (const e of entries) console.log(`  ${e.loc} -> ${e.rel} @ ${e.lastmod}`);
  console.log(`sitemap_write: wrote ${entries.length} url(s) to sitemap.xml, every date from git log -1 --format=%cs`);
}
