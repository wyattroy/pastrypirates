---
quick_id: 260824-wkw
description: "The pulse-debug system: hypothesis+evidence ledgers, the ?debug=pulse beacon, a WebKit engine in the rig, and the standalone workflow handoff plan"
date: 2026-08-24
status: complete
---

# Quick task 260824-wkw — SUMMARY

Shipped as build 2026-08-24g. Instruments only — no bug-fix code.

- **Ledgers** (.planning/debug-pulse/HYPOTHESES.md, EVIDENCE.md): every theory with
  kill-criteria and his rulings recorded; every measurement to date, timestamped and labelled.
- **The beacon**: QA'd in the rig — chip renders, VIS/BOX/PROMPT entries recorded, zero presence
  without the flag (measured). Caught-and-fixed its own first bug (chip referenced before
  creation — the diagnostic probe found it before shipping).
- **The WebKit runner**: real WebKitGTK 2.52 driven headless (WebKitWebDriver + xvfb; apt route —
  Playwright's CDN is 403-blocked by the container's network allowlist, documented). Red-proof
  ran and produced an HONEST SURPRISE: this WebKit resolves var()-in-keyframes correctly (both
  test pages swing 10.5px), so the 24d flat-video mechanism is downgraded to UNCONFIRMED in the
  ledger — possibly an early stuck-clock (H1) episode, which would unify the whole history.
- **WORKFLOW-PLAN.md**: the complete standalone handoff — principles, existing instruments with
  usage, environment facts (allowlist, apt ephemerality), the 7-phase skill design for
  /oracle-debug, his seven directives, and the hardening backlog (tick watchdog, inert hover
  rule, version-lock, the H1 fix-in-waiting that must NOT ship before confirmation).
- apt installs (webkit2gtk-driver, xvfb, epiphany) are container-ephemeral — reinstall commands
  are in the plan; the scripts and ledgers are durable in git.
