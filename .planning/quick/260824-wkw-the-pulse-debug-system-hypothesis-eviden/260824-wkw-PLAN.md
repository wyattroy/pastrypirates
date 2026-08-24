---
quick_id: 260824-wkw
description: "The pulse-debug system: hypothesis+evidence ledgers, the ?debug=pulse beacon, a WebKit engine in the rig, and the standalone workflow handoff plan"
date: 2026-08-24
---

# Quick task 260824-wkw — PLAN

His order, verbatim: "Yes. Do it. Also, write down all of this in a plan that you can use in a
different session that I can hand off to to create this workflow in a stand alone, callable way
for any future session." The beacon is the sanctioned tooling exception (his explicit yes).

Tasks: (1) the two ledgers in .planning/debug-pulse/ seeded with the pulse bug's full current
state; (2) the ?debug=pulse beacon (4/src/ui/pulsebeacon.js, DOM-only, flag-gated dynamic import
in main.js) — VIS/CLOCK/PROMPT/BOX records, per-button LIVE/FROZEN verdicts, timeline liveness
probe, copyable log chip; (3) a real WebKit engine in the rig (webkit2gtk-driver + xvfb via apt —
Playwright's CDN is blocked by the network allowlist) with wk_probe.mjs + wk_redproof.sh;
(4) WORKFLOW-PLAN.md — the standalone handoff for a fresh session to build /oracle-debug.
No bug fixes ship in this batch — instruments only. Stamp 2026-08-24g (beacon is game code).
