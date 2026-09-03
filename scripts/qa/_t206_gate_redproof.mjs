#!/usr/bin/env node
/* RED PROOF for `analytics_consent_check.mjs` — CEO 189's own mutations, replayed as a harness.
 *
 * ⛔ WHY THIS EXISTS. CEO 189 reviewed the analytics install (`09f8658c`) and found the gate
 * defending the safety property in the one file that already gets it right, while being blind to
 * the file where a future session would actually get it wrong. Its words: *"the realistic mistake
 * is not editing `src/analytics.js`, it is pasting the snippet the GA console gives you."* It
 * proved that by hand, in an isolated copy, and the gate printed **7/7 PASS** on a page that loads
 * googletagmanager with no consent default at all.
 *
 * **A finding proved by hand once is a finding that comes back.** This turns each of those
 * mutations into something `npm test` re-runs, so the gate can never again go blind to them
 * silently. It is the "show it broken" half of the four steps, kept.
 *
 * HOW IT WORKS, and the part that matters: every mutation is applied to an ISOLATED COPY of the
 * tree, **verified applied before the result is read**, and the gate is then run inside that copy.
 * The live tree is never touched. A CONTROL run with no mutation must PASS — a harness whose
 * control is red proves nothing about its mutants (rule 6: check the instrument reaches its
 * subject before believing it).
 *
 * ⚠ AND EVERY MUTATION NAMES THE MESSAGE IT EXPECTS, not merely a non-zero exit — a lesson this
 * harness taught its own author within the hour. A syntax error was introduced into the gate while
 * fixing it; the gate then CRASHED on every mutant, exited 1, and this harness read all five
 * crashes as catches and printed a clean PASS. **A gate that cannot run looks exactly like a gate
 * that is working**, which is the same vacuity CEO 186 and 188 both found. So a catch now has to
 * come from the case that is supposed to catch it.
 *
 * House convention: no test runner, one PASS/FAIL line per case, every case runs before exit.
 */
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
let failed = 0;
const pass = (m) => console.log(`  PASS  ${m}`);
const fail = (m) => { console.log(`  FAIL  ${m}`); failed++; };

console.log("_t206_gate_redproof — CEO 189's mutations, replayed against analytics_consent_check\n");

/* Only what the gate can read. `assets/` is 6 MB of pictures no gate opens, and copying it would
   make this slow enough that somebody stops running it. */
const COPY = ["src", "classic", "scripts/qa/analytics_consent_check.mjs",
  "index.html", "about.html", "rules.html", "stats.html"];
const SKIP = new Set(["assets", "node_modules", ".git"]);

/* ⚠ THE FIXTURE IS A REAL GIT REPO, and that is not decoration. The gate derives the pages it
   guards from `git ls-files` — the correction that replaced a directory walk which had been
   reporting 1753 pages, because 37 stray `.tmp-*` Chrome profiles were sitting in the repo root
   with 47 pages each. A fixture with no index would make the gate say "git listed no tracked
   pages" and go red for a reason that has nothing to do with the mutation. Staging the copy costs
   about a second and keeps every red below attributable. No commit is needed: `ls-files` reads the
   index. */
function fixture() {
  const dir = mkdtempSync(join(tmpdir(), "pp-t206-"));
  for (const rel of COPY) {
    const from = join(ROOT, rel);
    if (!existsSync(from)) continue;
    cpSync(from, join(dir, rel), {
      recursive: true,
      filter: (s) => !SKIP.has(s.split(/[\\/]/).pop()),
    });
  }
  spawnSync("git", ["init", "-q"], { cwd: dir });
  spawnSync("git", ["add", "-A"], { cwd: dir });
  return dir;
}

/* Re-stage after a mutation, so a file the mutation CREATES or edits is visible to `git ls-files`
   exactly as it would be in the real repo. */
const restage = (dir) => spawnSync("git", ["add", "-A"], { cwd: dir });

/* ⚠ TIDYING UP MUST NEVER CHANGE THE VERDICT. On Windows a just-exited child can still hold a
   handle inside the temp copy, and `rmSync` then throws EBUSY/EPERM. This harness observed exactly
   that once: six consecutive green runs and one exit 1, with no failing case printed — the throw
   came out of the `finally`, after the result had already been decided. **An instrument that can
   fail for a reason that has nothing to do with its subject will eventually report about itself**
   (rule 6), and an intermittent one is the worst kind because it teaches people to re-run until it
   is green. Retries first, and a leftover temp directory is reported, never fatal. */
function cleanup(dir) {
  try { rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); }
  catch (e) { console.log(`  note  could not delete the temp copy ${dir} (${e.code || e.message}) — harmless, and deliberately not allowed to change the verdict`); }
}

/* Run the gate inside the copy. Returns its exit code and its own output. */
function runGate(dir) {
  const r = spawnSync(process.execPath, [join(dir, "scripts", "qa", "analytics_consent_check.mjs")],
    { cwd: dir, encoding: "utf8" });
  return { code: r.status, out: `${r.stdout || ""}${r.stderr || ""}` };
}

/* Google's own snippet, exactly as the GA console hands it to you — no consent call anywhere.
   This is the realistic mistake, and it is the one CEO 189 pasted. */
const RAW_GA_SNIPPET = `<script async src="https://www.googletagmanager.com/gtag/js?id=G-2KK6EZDZSP"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config','G-2KK6EZDZSP');</script>`;

const MUTATIONS = [
  {
    name: "a raw Google tag pasted into index.html, with no consent default",
    why: "CEO 189 Finding 1 — the page a child loads now writes a cookie, and the gate only ever looked inside src/analytics.js",
    expect: /loads a Google analytics tag directly/,
    apply(dir) {
      const f = join(dir, "index.html");
      const t = readFileSync(f, "utf8");
      const at = t.indexOf("</head>");
      if (at < 0) return null;
      writeFileSync(f, t.slice(0, at) + RAW_GA_SNIPPET + "\n" + t.slice(at));
      return () => readFileSync(f, "utf8").includes("googletagmanager.com/gtag/js?id=");
    },
  },
  {
    name: "the same raw tag pasted into classic/index.html",
    why: 'CEO 189 Finding 4 — /classic is the option he explicitly DECLINED, and the gate\'s notWant list stops one file short of his words',
    expect: /loads a Google analytics tag directly/,
    apply(dir) {
      const f = join(dir, "classic", "index.html");
      if (!existsSync(f)) return null;
      const t = readFileSync(f, "utf8");
      const at = t.indexOf("</head>");
      if (at < 0) return null;
      writeFileSync(f, t.slice(0, at) + RAW_GA_SNIPPET + "\n" + t.slice(at));
      return () => readFileSync(f, "utf8").includes("googletagmanager.com/gtag/js?id=");
    },
  },
  {
    name: "a consent GRANT added to src/orchestrator.js — the back door his 'no banner' ruling forbids",
    why: "CEO 189 Finding 2 — the grant scan reads four typed filenames, and orchestrator.js runs for every player on the game page",
    expect: /something grants consent in/,
    apply(dir) {
      const f = join(dir, "src", "orchestrator.js");
      if (!existsSync(f)) return null;
      writeFileSync(f, readFileSync(f, "utf8") +
        '\nif (typeof window !== "undefined" && window.gtag) window.gtag("consent","update",{ analytics_storage: "granted" });\n');
      return () => /analytics_storage:\s*"granted"/.test(readFileSync(f, "utf8"));
    },
  },
  {
    name: "about.html's script tag replaced by a COMMENT that merely mentions src/analytics.js",
    why: "CEO 189 Finding 3 — the page-coverage case is a bare substring test, so prose satisfies it and About goes unmeasured",
    expect: /do\(es\) not load src\/analytics\.js/,
    apply(dir) {
      const f = join(dir, "about.html");
      const t = readFileSync(f, "utf8");
      const next = t.replace(/<script[^>]*src=["']src\/analytics\.js["'][^>]*><\/script>/,
        "<!-- analytics removed while debugging; see src/analytics.js -->");
      if (next === t) return null;
      writeFileSync(f, next);
      return () => {
        const s = readFileSync(f, "utf8");
        return !/<script[^>]*src=["']src\/analytics\.js["']/.test(s) && s.includes("src/analytics.js");
      };
    },
  },
  {
    name: "the module's own installAnalytics() call commented out — imported everywhere, doing nothing",
    why: "CEO 189 Finding 5 — both driving cases call installAnalytics() by hand, so a dead install reads exactly like a live one",
    expect: /importing src\/analytics\.js installs NOTHING/,
    apply(dir) {
      const f = join(dir, "src", "analytics.js");
      const t = readFileSync(f, "utf8");
      const next = t.replace(/^installAnalytics\(\);$/m, "// installAnalytics();");
      if (next === t) return null;
      writeFileSync(f, next);
      return () => /^\/\/ installAnalytics\(\);$/m.test(readFileSync(f, "utf8"));
    },
  },
];

/* CONTROL FIRST. A mutant that fails a gate which was already failing proves nothing. */
{
  const dir = fixture();
  try {
    const { code, out } = runGate(dir);
    if (code === 0) pass("CONTROL — the gate passes on an unmutated copy of the tree, so every red below is caused by the mutation");
    else fail(`CONTROL — the gate FAILS on an unmutated copy (exit ${code}), so this harness cannot attribute anything to its mutations:\n${out.trim()}`);
  } finally { cleanup(dir); }
}

for (const m of MUTATIONS) {
  const dir = fixture();
  try {
    const verify = m.apply(dir);
    if (!verify) { fail(`could not apply the mutation "${m.name}" — this case cannot see its subject, so it must not report PASS`); continue; }
    if (!verify()) { fail(`the mutation "${m.name}" did not take effect in the copy — a no-op mutation always "passes" and proves nothing`); continue; }
    restage(dir);
    const { code, out } = runGate(dir);
    if (code === 0) fail(`⛔ THE GATE SAYS PASS with ${m.name}.\n        ${m.why}`);
    else if (!m.expect.test(out)) fail(`the gate exits non-zero with ${m.name}, but NOT for the stated reason — nothing matching /${m.expect.source}/ was printed. A gate that crashes exits non-zero too, and would read here as a catch:\n${out.trim().split("\n").slice(-6).join("\n")}`);
    else pass(`the gate catches it, and by the right case: ${m.name}`);
  } finally { cleanup(dir); }
}

console.log(failed
  ? `\nFAIL — ${failed} of ${MUTATIONS.length + 1} case(s). Each one is a way the analytics safety property can be broken while the gate says PASS.`
  : `\nPASS — the control is green and all ${MUTATIONS.length} of CEO 189's mutations are caught.`);
process.exit(failed ? 1 : 0);
