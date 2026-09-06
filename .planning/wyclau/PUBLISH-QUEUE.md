# Publish queue

A git-tracked handoff, not a live message: a session with no Artifact tool (every Bell-launched
watch) appends a finished page here instead of depending on a cross-session message that might
never be read. A session that DOES hold the Artifact tool runs
`node scripts/wyclau/publish_queue.mjs` at Door orientation, asks Wyatt once for everything open
(question UI, not prose), publishes what he approves, and closes each row with
`--mark-published --ticket=T-NNN --url=<url>`. See the script's own header for the full contract.

- [ ] `T-261` — comment boxes added (13, glassState-backed), needs republish so Wyatt can use them — `.planning/wyclau/T-261-SFX-PRD.html`
