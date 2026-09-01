// VENDORED FROM claude-kit (plugins/wyclau) — edit THERE, not here. Re-vendor: `bash install.sh vendor <repo> wyclau` from claude-kit. Drift is caught by scripts/qa/vendor_check.mjs.
/* wyclau-thresholds.cjs — the numbers that MORE THAN ONE file has to agree on.
 *
 * WHY THIS FILE EXISTS, and it is a whole bug rather than a tidiness preference. CEO Review 56
 * found a DEADLOCK between two thresholds that were never compared to each other:
 *
 *   - the Stop hook's brake 1 refuses to let a session end its turn while the pulse is more than
 *     PUBLISH_LAG_THRESHOLD_MIN newer than the last publish -- "you may not stop until you publish";
 *   - may_publish.mjs decides whether a session is ALLOWED to publish at all, since one-publisher
 *     is the standing rule -- "defer, the Bosun owns this page".
 *
 * The second was first written with its own, larger number (45 minutes, reasoned from the
 * watchdog's own staleness window). Both numbers were defensible alone. Together they opened a
 * live window -- any lag between 20 and 45 minutes -- where a session was ORDERED to publish and
 * FORBIDDEN from publishing, and could do neither. It could not stop, and it could not clear the
 * condition stopping it.
 *
 * THE FIX IS NOT A BETTER SECOND NUMBER. It is that there is only one number. Whenever brake 1
 * would hold a session, somebody must be permitted to publish -- that is a RELATIONSHIP, and the
 * only way to keep a relationship true is to stop storing it twice (CLAUDE.md rule 9, and rule
 * 23's design-time question: what makes these two agree? Nothing, unless they are one thing).
 *
 * A .cjs so the Stop hook (CommonJS) can require it directly; the ESM helpers reach it through
 * createRequire. If you add a third reader, read it from here too -- do not copy the value.
 */
"use strict";

module.exports = {
  /* The Door's own stated pulse cadence, made mechanical: a pulse Wyatt cannot see is not a pulse.
     READ BY: .claude/hooks/wyclau-stop-keep-working.cjs (brake 1, which blocks a stop on it) and
     scripts/wyclau/may_publish.mjs (which must permit a publish wherever brake 1 can block one). */
  PUBLISH_LAG_THRESHOLD_MIN: 20,
};
