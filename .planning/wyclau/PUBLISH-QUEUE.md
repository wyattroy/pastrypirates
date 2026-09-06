# Publish queue

A git-tracked handoff, not a live message: a session with no Artifact tool (every Bell-launched
watch) appends a finished page here instead of depending on a cross-session message that might
never be read. A session that DOES hold the Artifact tool runs
`node scripts/wyclau/publish_queue.mjs` at Door orientation, asks Wyatt once for everything open
(question UI, not prose), publishes what he approves, and closes each row with
`--mark-published --ticket=T-NNN --url=<url>`. See the script's own header for the full contract.

- [x] `T-261` — comment boxes added (13, glassState-backed), needs republish so Wyatt can use them — `.planning/wyclau/T-261-SFX-PRD.html` — published: https://claude.ai/code/artifact/ed82256e-9196-4ada-bbef-60c4adc7df8d
- [x] `T-263` — his Mac/Blade + staging/production page, written for HIM not for Claude (CEO 221 finding 6) — `two-machines.html` — published: https://staging.playpastrypirates.com/two-machines.html
- [ ] `T-264` — the Cloudflare cutover checklist he ticks — his standing instruction: artifacts, never .md — `cloudflare-cutover.html`
