#!/usr/bin/env node
/* ceo_brief.mjs — assembles the CEO's brief in ANY repo. Rule 25, made runnable rather than remembered.
 *
 * Wyatt, 2026-08-26: "is CEO in your documentation anywhere? I need to be able to ask you to run CEO too."
 *
 * THE QUESTION THE CEO ANSWERS IS NARROW AND IT IS NOT "IS THIS GOOD WORK".
 * It is: DID THE THING HE ASKED FOR HAPPEN? The documented failure it exists to catch is adjacent,
 * competent, impressive work that misses the ask — 22 fixes shipped, 4 verified, every sentence true,
 * the ask missed. That gap is invisible from inside the work, which is why the reviewer must be a
 * FRESH agent: one that inherits your reasoning inherits your blind spot.
 *
 * THE HOLE THIS CLOSES, and it is the one that mattered: rule 25 says hand the new CEO the PREVIOUS
 * verdict, so it can say whether the same fault is RECURRING. Verdicts that live only in a running
 * session's context vanish when the session ends — so the one mechanism designed to catch a repeat
 * offence silently stops working, with nothing on screen to say so.
 *
 *   node ceo_brief.mjs --ask="<his request, VERBATIM>" [--since=origin/main] [--repo=/abs/path]
 *
 * Prints a complete brief. Paste it into a FRESH agent. Append the verdict afterwards.
 */
import fs from "node:fs";
import path from "node:path";
import { loadAdapter, sh, NO_ADAPTER_NOTICE } from "./adapter.mjs";

const arg = (k, d) => { const a = process.argv.find(s => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };

const A = loadAdapter(arg("repo", undefined));
const REPO = A.repo;
const ask = arg("ask", "");
/* The baseline is production if the repo names one; otherwise the last commit, NOT `origin/null`.
   A baseline nobody nominated produces an empty diff that reads exactly like "nothing changed". */
const since = arg("since", A.values["production-ref"] ? `origin/${A.values["production-ref"]}` : "HEAD~1");
const git = (c) => sh(c, REPO);

/* THE PREVIOUS VERDICT — the whole reason this script exists. Newest entry, cut at the next heading.
   Missing is not silence: it is stated as a finding about the process, because a recurrence check
   that cannot run is exactly the sort of absent guard that reads as a passing one. */
let prev = "**NO PREVIOUS VERDICT ON RECORD.** Say so in your review: the recurrence check cannot run,\n"
         + "and that is itself a finding about the process, not a detail to skip past.";
const verdictText = A.read("verdicts");
if (verdictText) {
  const i = verdictText.indexOf("\n## ");
  if (i >= 0) { const j = verdictText.indexOf("\n## ", i + 4); prev = verdictText.slice(i + 1, j < 0 ? undefined : j).trim(); }
}

/* EVIDENCE THE REPO DECLARES IT HAS. Each one is attempted, and each FAILURE is reported as a
   failure rather than an empty string — the difference between "the build stamp is X" and "this
   repo does not say how to find its build stamp" is the difference between a check and a shrug. */
const evidence = [];
const stampCmd = A.values["build-stamp-command"];
evidence.push(["Build stamp", stampCmd ? (git(stampCmd) || `*(the declared command produced nothing: \`${stampCmd}\`)*`)
                                       : "*(this repo declares no build-stamp-command — WHICH build was reviewed is UNKNOWN)*"]);
const trial = A.read("trial-report");
evidence.push(["Last full test run", trial ? trial.split("\n").slice(0, 6).join("\n")
  : (A.values["trial-report"] ? `*(declared at \`${A.values["trial-report"]}\` but not on disk — whether anything was tested is UNKNOWN)*`
                              : "*(this repo declares no trial-report — whether anything was tested is UNKNOWN)*")]);

const out = `You are the CEO. Repo: ${REPO}. READ-ONLY — do not edit, create or commit. Absolute
paths. Do not start a browser or a server. Bound your effort.

**WYATT ASKED, VERBATIM:**
${ask ? `"${ask}"` : `*** NOT SUPPLIED — rerun with --ask="his exact words". A summary is where the drift
already happened; do not let the reviewer grade a paraphrase. ***`}

**WHAT CHANGED (${since}..HEAD):**
\`\`\`
${git(`git diff --stat ${since}..HEAD`) || `(no diff — is \`${since}\` the right baseline? after a push, try --since=HEAD~1)`}
\`\`\`
Commits:
\`\`\`
${git(`git log --oneline ${since}..HEAD`) || "(none)"}
\`\`\`
Uncommitted:
\`\`\`
${git("git status --porcelain") || "(clean)"}
\`\`\`

**THE EVIDENCE THIS REPO SAYS IT KEEPS:**
${evidence.map(([k, v]) => `**${k}:**\n${v.includes("\n") ? "```\n" + v + "\n```" : v}`).join("\n\n")}

**WHAT WAS DONE, AS CLAIMED:** *(fill this in — files, measurements, and what was NOT done)*

**THE PREVIOUS CEO'S VERDICT:**
${prev}

${A.blindSpots()}

**ANSWER, in this order:**
1. For EACH thing he asked for: DONE / PARTIAL / NOT DONE, with the evidence you checked.
2. What was delivered that he did NOT ask for, and whether it displaced something he did.
3. Any claim unsupported by what is in the repo? Cite file:line.
4. Is the fault from the last verdict fixed, or has it recurred in new clothing?
5. One sentence Wyatt should read first.

**RULES:** Plain English — he is a founder and designer, not an engineer; define any professional
term once, in the same sentence. **You may say NO.** A criticism with no file:line citation is an
opinion, not a finding. Assume the author is flattering himself. Your verdict reaches him in YOUR
words, especially when it is bad — a kind paraphrase makes this whole mechanism theatre.

---
AFTERWARDS: append the verdict to \`${A.values["verdicts"]}\`, newest at the top.
**A verdict nobody recorded is a recurrence check nobody can run.**`;

if (!A.exists) console.log(NO_ADAPTER_NOTICE + "\n");
console.log(out);
if (!ask) process.exit(2);
