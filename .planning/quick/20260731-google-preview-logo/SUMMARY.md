---
phase: quick-20260731-google-preview-logo
status: complete
date: 2026-07-31
tasks_completed: 2
tasks_total: 2
commits: 1
requirements: [META-01]
files_modified:
  - index.html
---

# Google preview image — the logo

## What changed

Two lines in `index.html`'s `<head>`. Nothing else.

1. **`<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">`** — the
   page had no robots meta tag at all, so Google applied its default of a small thumbnail or none.
   This is the directive that permits the large one.
2. **`"image":"https://playpastrypirates.com/og-image.jpg"`** added to the existing JSON-LD
   `VideoGame` block, which described the game in detail but said nothing about a picture.

## The finding that made this small

**`og-image.jpg` was already the logo.** It is the same artwork as the homepage's `assets/logo.jpg`,
at 1200x663 versus 900x502 — larger, and above Google's 1200px-wide preference. No new asset was
needed, and none was made.

Equally, **`og:image` was never the lever.** Google largely ignores Open Graph when picking a result
thumbnail; those tags serve iMessage/Slack/Facebook. The tags were present and correct the whole
time and were never going to produce a Google thumbnail on their own.

## What was deliberately NOT touched

`og:image`, `twitter:image`, `favicon.ico`, `favicon.png` and the `<link rel="icon">` tags. All were
verified serving HTTP 200, and **the favicon is confirmed working** — it renders in Wyatt's own live
Google search screenshot (2026-07-31), which is what retired META-02 as already satisfied.

## Verification

| Check | Result |
|---|---|
| `npm test` | **exit 0**, 23/23 assertion groups |
| JSON-LD parses (`JSON.parse`) | OK — `@type: VideoGame`, `image` present |
| robots meta present | `index, follow, max-image-preview:large, max-snippet:-1` |
| `src/engine/index.js` | untouched (no engine surface involved) |

## The honest limit — read this before judging the change

**This does not make the image appear. It makes it available and permitted.**

Whether Google shows it depends on Google re-crawling the page, which takes days to weeks and cannot
be forced from this repo. Do not treat a Google result that still lacks a thumbnail tomorrow as
evidence this failed.

**The next move is not code — it is META-03**, registering `playpastrypirates.com` in Google Search
Console. That is what turns "we think Google will pick it up" into something observable, and it
allows indexing to be *requested* rather than waited on. It is Wyatt's own action and it is the
slowest-moving piece, so it is worth starting now rather than when more code lands.
