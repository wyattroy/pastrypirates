---
phase: quick
plan: 260821-wkd
type: quick
autonomous: true
requirements: []
---

# Quick Task 260821-wkd: Record the cloud-QA proof verdict in docs/GIT-AND-DEPLOY.md §7

## Objective

The first cloud session (2026-08-21, branch `claude/pastry-pirates-cloud-qa-a9jkeg`) ran all four
items of §7's proof recipe and all four passed — item 3 only after a two-part browser TLS fix that
the next cloud session must know about. §7's own instruction is that the verdict replaces the
placeholder section, dated. Do exactly that, and nothing else: **docs-only, one file, no game
code, no `PP4_STAMP` bump, no branch switching.**

## Context

- `/home/user/pastrypirates/docs/GIT-AND-DEPLOY.md` — the only file this task may touch. The
  target is the final section of §7: the `### THE PROOF` heading at line 328 through the end of
  the file (the heading, the "verdict goes here" paragraph, the 4-item recipe list, and the
  closing "laptop stays the QA machine" warning — the warning is superseded by the verdict, since
  items 2 and 3 both passed).
- The doc's voice, to match: terse, evidence-first, war-story. Every claim carries its number or
  its command. Bold the load-bearing facts. Fenced bash for anything a session will copy-paste
  (the doc already does this — e.g. the `sed` one-liner near line 312).
- §7's existing "fails SILENTLY" warning (near line 295) — the verdict cross-references it, because
  the Chromium TLS failure presents exactly as it predicts.

## Tasks

### Task 1 — replace the proof placeholder with the dated verdict (auto)

Edit `/home/user/pastrypirates/docs/GIT-AND-DEPLOY.md`: replace the entire `### THE PROOF`
section (line 328 to end of file) with a new dated verdict section. Do not quote the old
placeholder status text anywhere in the new content — state the new status, don't restate the
old one. Required content, in this shape:

**Heading:** `### THE PROOF — RAN 2026-08-21, all four items passed.` (may append the session
branch `claude/pastry-pirates-cloud-qa-a9jkeg` to the heading or first line — the verdict must
name it either way).

**The four items, each with its key numbers:**

1. `node .claude/gsd-core/bin/gsd-tools.cjs validate health` — ran; known-noise W019s only.
   Also verified: `state get`, `progress`, and the full command list respond; **zero
   laptop-absolute paths** remain in `.claude/commands`, `.claude/agents`, `.claude/gsd-core`;
   GSD **1.8.0 project-local**.
2. Solo mouse-QA at 1400×900 (`node 4/scripts/mouse_qa.mjs <out> 1400 900 8611 9611`) — **past
   the bar**: the bar was Day 6, the run played a full voyage to the end-of-voyage card at
   **Day 14** — 1158 ticks, 72 real-mouse actions, 115 screenshots, **0 findings, 0 console
   errors**. Screenshots verified readable by eye (Day-1 board and the end-of-voyage card).
3. Two-Chrome crew game via `mp_rig.mjs` — **passed, after a required environment fix (below)**.
   Host created real Firebase room **AGHR**, guest joined; both sides screenshotted and compared
   — rosters identical, each side's own seat highlighted, host showing "Start the voyage!" against
   the guest's "Waiting for the host…". Room torn down, processes killed.
4. `curl -s https://playpastrypirates.com/4/src/ui/stage.js | grep PP4_STAMP` — returned
   **`2026-08-21g`**, the live stamp.

**The environment fix, as a sub-heading the next cloud session applies BEFORE any browser QA** —
without it, item 3 fails exactly as this section's own "fails SILENTLY" warning predicts:
the Firebase SDK never loads and a Host click produces **no room code at all**. The cloud
container routes HTTPS through Anthropic's TLS-inspecting egress proxy; `curl` works out of the
box, Chromium does not, for two separate reasons, both fixable in-container:

- **(a) Chromium's cert store.** Install `libnss3-tools` (`apt-get update && apt-get install -y
  libnss3-tools`), split `/root/.ccr/ca-bundle.crt` into one file per certificate, and import
  each into `sql:$HOME/.pki/nssdb` with
  `certutil -A -n <name> -t "C,," -i <cert> -d sql:$HOME/.pki/nssdb`. The load-bearing certs are
  the Anthropic egress-gateway CAs. Present these as a fenced bash block, copy-paste ready.
- **(b) The gateway RESETS Chromium's TLS 1.3 ClientHello mid-handshake** (net_error **-101**;
  curl's TLS 1.3 passes; feature-flag disables for ML-KEM/ECH did not help). Workaround: launch
  Chromium with `--ssl-version-max=tls1.2` — **TLS verification stays ON**. Cleanest as a
  two-line wrapper script exec'ing `/opt/pw-browsers/chromium` with the flag prepended, exported
  via `CHROME_BIN` (the scripts' resolver honors it). Also fenced, copy-paste ready.
- **`CHROME_BIN` must be set explicitly** to `/opt/pw-browsers/chromium` (a symlink to
  `chromium-1194/chrome-linux/chrome`) — nothing matching is on PATH.
- **The network policy itself needed nothing**: gstatic, `*.firebaseio.com`, googleapis,
  `playpastrypirates.com`, and GitHub push were all reachable through the proxy.

**One line each, at the end:** the root `npm test` and all eight `4/scripts` static gates pass on
bare Node in the container; the repo's `.claude/hooks` (read-the-doc-first) fire correctly in the
cloud. Close with one sentence stating the boundary that stands: the cloud is proven QA-capable
for solo and crew browser QA — Safari and Wyatt's own play remain laptop-only, as the top of §7
already says.

Then commit the one file on the **current branch** (`claude/pastry-pirates-cloud-qa-a9jkeg` — do
not switch branches, do not push to `main`), message
`docs(quick/260821-wkd): record the cloud-QA proof verdict in GIT-AND-DEPLOY §7`.

**Verify (all automated, run from the repo root):**
- `grep -q 'RAN 2026-08-21' docs/GIT-AND-DEPLOY.md` — dated verdict present
- `! grep -q 'NOT YET RUN' docs/GIT-AND-DEPLOY.md` — placeholder fully replaced
- `grep -q 'ssl-version-max=tls1.2' docs/GIT-AND-DEPLOY.md && grep -q 'libnss3-tools' docs/GIT-AND-DEPLOY.md && grep -q 'CHROME_BIN' docs/GIT-AND-DEPLOY.md` — both halves of the TLS fix and the binary path recorded
- `grep -q 'AGHR' docs/GIT-AND-DEPLOY.md && grep -q '2026-08-21g' docs/GIT-AND-DEPLOY.md` — the crew-game and live-stamp evidence carried
- `git diff --name-only HEAD~1 -- 4/ src/ index.html` prints **nothing** after the commit (no
  game code touched — CLAUDE.md §3's own check), and
  `git show --name-only --format= HEAD` lists only `docs/GIT-AND-DEPLOY.md`

**Done:** the placeholder section is gone; a dated verdict stands in its place stating all four
items passed with their numbers, the two-part TLS fix is recorded with copy-paste commands, the
doc's voice holds, and exactly one file is committed on the current branch.

## Success Criteria

- §7 ends with the dated verdict, not the placeholder — a session reading the doc cold learns the
  recipe is proven and what the next cloud session must set up first.
- All four proof items recorded with their key numbers (W019-only health check; Day 14 / 1158
  ticks / 72 actions / 115 screenshots / 0 findings / 0 console errors; room AGHR with both-side
  screenshot comparison; live stamp `2026-08-21g`).
- The two-part Chromium TLS fix (certutil import + `--ssl-version-max=tls1.2` wrapper via
  `CHROME_BIN`) is copy-paste executable from the doc, and states that TLS verification stays on.
- The bare-Node gates line and the hooks line are present.
- `docs/GIT-AND-DEPLOY.md` is the only file in the commit; no `PP4_STAMP` change; branch unchanged.
