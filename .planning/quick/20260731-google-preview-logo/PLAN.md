---
phase: quick-20260731-google-preview-logo
plan: 01
type: execute
wave: 1
depends_on: []
autonomous: true
requirements: [META-01]
files_modified:
  - index.html
---

<objective>
Make the Pastry Pirates logo appear as the preview image beside the site's Google search result.

Wyatt, 2026-07-31, on seeing a live `pastry pirates` search where Fandom and IMDb each carried a
thumbnail and `playpastrypirates.com` carried none: *"we want pastry pirates to have as big an image
as possible"* and *"i want it to be the logo, which appears on the home page already."*
</objective>

<situation>

**The image already exists and is already the logo.** `og-image.jpg` is the same artwork as the
homepage logo (`assets/logo.jpg`), at 1200x663 rather than 900x502 — larger, and above Google's
1200px-wide preference. It serves HTTP 200. **No new asset is needed.**

Verified live 2026-07-31 against `https://playpastrypirates.com`:

| Asset | State |
|---|---|
| `og:image` + Twitter card tags (`:11-21`) | present |
| `og-image.jpg` | HTTP 200, 1200x663, 171 KB — the logo artwork |
| `favicon.ico` / `favicon.png` | HTTP 200; 256x256 square; **confirmed rendering in his own Google result screenshot** |
| `robots.txt` / `sitemap.xml` | crawlable, sitemap referenced |
| JSON-LD `VideoGame` (`:22-24`) | present, **no `image` field** |
| `<meta name="robots">` | **absent entirely** |

The site is indexed and ranking — his screenshot proves it. So this is not a crawling problem and
not a missing-asset problem. Two specific signals are missing.

**Why `og:image` was never going to fix this.** Google largely ignores Open Graph when choosing a
result thumbnail; those tags serve iMessage/Slack/Facebook link previews, which were never the
complaint. Adding more Open Graph would have changed nothing.

</situation>

<tasks>

**Task 1 — permit a large image preview.** Add to `<head>`:

```html
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
```

The page has **no robots meta tag at all** today, so Google applies its default, which is a small
thumbnail or none. `max-image-preview:large` is the specific directive that permits the large one.

**Task 2 — give the structured data an image.** Add `"image"` to the existing JSON-LD `VideoGame`
block pointing at `https://playpastrypirates.com/og-image.jpg`. That block is one of Google's main
sources for a result image and is currently silent about pictures.

</tasks>

<constraints>

- **Do NOT touch `og:image`, `twitter:image`, or either favicon.** All verified correct and working;
  the favicon is confirmed rendering in a live Google result. Changing them risks a working thing.
- No new image asset — `og-image.jpg` is already the logo at a better size than the homepage copy.
- `npm test` must stay green and `src/engine/index.js` must stay byte-identical (no engine surface
  is involved, so this is a floor, not a goal).
- The JSON-LD must still parse as valid JSON after the edit — a malformed block is worse than no
  block, because Google discards the whole thing silently.

</constraints>

<verification>

1. `npm test` exits 0.
2. The JSON-LD block parses via `JSON.parse` and reports `image`.
3. The robots meta tag is present with `max-image-preview:large`.

**Not verifiable here, and must not be claimed:** whether Google actually shows the image. That
depends on Google re-crawling the page, which takes days to weeks and is outside this repo. This
change makes the image *available and permitted*; it cannot make Google display it on a schedule.
See **META-03** — registering the site in Google Search Console is what makes the crawl observable
and lets indexing be requested rather than waited on.

</verification>
</content>
