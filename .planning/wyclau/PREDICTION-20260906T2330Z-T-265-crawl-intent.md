# PREDICTION — T-265, npm test RED on crawl_intent_check.mjs (cloudflare-cutover.html)

**Written before the fix, per the Proof's rule 6 requirement.**

## What I expect

`cloudflare-cutover.html` is written in the Artifact-publish fragment format (rule 27: no
`<!doctype>`/`<html>`/`<head>`/`<body>`, starts at `<title>`) but was committed directly into the
repo root, where GitHub Pages serves it as a real, live, standalone page. `crawl_sets.mjs`'s
`declaredIntent()` requires an actual `<head>` tag to exist in the source (`src.search(/<head\b/i)`)
before it will even look for a `<meta name="robots">` tag inside it — so a bare meta tag with no
`<head>` wrapper would NOT be recognized, confirmed by reading the function directly rather than
guessing.

**The fix:** wrap the existing content in a real, minimal HTML document — `<!doctype html>`,
`<html lang="en">`, `<head>` (charset, viewport, `<meta name="robots" content="noindex, nofollow">`,
a one-line comment why, then the existing `<title>` and `<style>` unchanged), `</head>`, `<body>`
around the existing `.wrap` div and `<script>` unchanged, `</body></html>`. This mirrors the
convention already used by `two-machines.html` — another internal/reference page, noindex, full
document structure — for consistency (rule 8).

**I expect:** `node scripts/qa/crawl_intent_check.mjs` goes PASS, and `npm test` returns to green
(144/144, since the previous watch left it green before this regression landed). No visual or
functional change to the page — the script queries elements by class/id which are unaffected by
being inside `<body>` instead of floating at document root; no screenshot is owed because this is
not game code (`index.html`/`src/` untouched) and gear should read NONE.

## What would prove me wrong

- `npm test` still fails after the edit — either the same gate (meaning I misread `declaredIntent`
  or missed another served/public-set contradiction it creates) or a different, newly-broken gate
  (e.g. an HTML-structure gate that objects to a second `<html>` tag pattern, or `gear.mjs`
  classifying this as game code).
- The checklist page visibly breaks (ticks/notes stop saving, progress bar stops updating) when
  loaded in a browser after the wrap — would mean the body/script boundary mattered in a way I did
  not expect.
- `gear.mjs` reports anything other than NONE, meaning this needs a sea trial I have not planned for.
