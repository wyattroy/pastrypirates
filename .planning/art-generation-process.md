# Pastry Pirates — Art Generation Process (how execution actually works)

> **Moved 2026-08-02 from `notes/` to `.planning/`.** `notes/` is gitignored, so this file was
> invisible to everyone but Wyatt's own machine — while **ten-plus tracked planning documents
> linked to it**, including `.planning/codebase/STRUCTURE.md` and five Phase 21 files. Every one
> of those pointers led somewhere unreadable. Wyatt, 2026-08-02: *"move the art-audit note into
> .planning/ so it's shared."* Its sibling `art-generation-process.md` moved with it — they
> cross-reference each other and splitting them would have re-created the same problem.

A field-tested runbook for turning [notes/art-audit.md](art-audit.md) into real images. That doc
defines *what* to generate and the prompts; this doc is *how* to actually drive it end-to-end —
written after running the first batch (20 recipe pastries) and hitting every dead end along the
way, so the next run skips straight to what works.

---

## 0. One-time Chrome setup (do this before the first image of a session)

Two settings, checked once per session — not per image:

1. **Chrome → Settings → Downloads → turn OFF "Ask where to save each file."** If this is on,
   every single download pops a native save dialog that needs a manual click — for a batch of
   20+ images that's a wall of interruptions.
2. **Chrome → Settings → Downloads → Location → set it to the exact staging folder**, e.g.
   `/Users/wyattroy/Documents/Projects/pastrypirates/art-review/pastries`. Gemini's download
   button respects this setting (unlike a lot of automated-download edge cases) — once it's set,
   files land directly in the project folder with zero clicks and zero extra permissions needed,
   since Bash already has full read/write access inside the repo.

If Location is misconfigured or missing, downloads silently fall back to `~/Downloads`, which
Bash **cannot** read due to macOS TCC protection (`ls: Operation not permitted`) — even though the
Read/Write/Edit tools can, if a one-time directory grant is requested via
`mcp__ccd_directory__request_directory`. Prefer fixing the Location setting over relying on that
grant — it's simpler and keeps everything inside the repo.

## 1. Dead ends — don't retry these

Tried and confirmed broken in this environment, so don't waste turns rediscovering them:

- **Browser screenshot → disk.** The `computer` tool's `zoom`/`screenshot` actions have a
  `save_to_disk` flag, but it produces no file discoverable anywhere on the filesystem via Bash,
  Read, or an exhaustive `find`. There is no way to get a screenshot's pixels onto disk this way.
- **Page-JS-triggered download** (`<a download> + .click()` via `javascript_tool`). Looks like it
  fires, but Chrome's automation protections silently swallow it — no file ever lands.
- **Extracting image bytes as base64** via `javascript_tool` (canvas `toDataURL` etc.). Actively
  blocked as a data-exfiltration guard — the tool call errors with `[BLOCKED: Base64 encoded
  data]`. Don't try to route image bytes through the model's own context this way.
- **Navigating to `chrome://...` or `file://...` pages** via the `navigate` tool. It force-prefixes
  `https://` onto the URL regardless, breaking both. (Oddly, macOS's `open <path>` command *does*
  work for opening a local HTML file in the browser — see §4.)
- **Right-click → "Save Image As."** No native context menu surfaces; right-click is intercepted
  by the automation layer.

**What actually works:** Gemini's own in-page download button (the ⬇ icon above each generated
image), clicked via the `computer` tool. That's it. Everything else was a detour.

## 2. Per-image generation loop

For each prompt in `art-audit.md`, repeat:

1. **New chat.** Click "New chat" in the sidebar (top-left, ~`(73, 76)` at typical window size).
   Don't continue one long thread for multiple images — it's flaky. One send silently failed to
   register mid-thread once the layout had shifted (scrolled state, dynamic button position);
   starting fresh each time avoids that class of bug entirely and costs almost nothing extra.
2. **Type the full prompt** (House Style block + the specific asset line, concatenated into one
   message — see art-audit.md §2) into the centered input box.
3. **Screenshot before clicking send.** The send button's y-coordinate shifts with how many lines
   the prompt wraps to; don't hardcode it blind — grab the coordinate from the screenshot each
   time. Enter/Return does **not** submit — it inserts a newline. Must click the send arrow.
4. **Wait ~18s** (two `wait` calls, since a single `computer` wait action caps at 10s), then
   screenshot to confirm the image rendered. Occasionally needs a few more seconds if the icons
   in the top-right of the image are still greyed out (still settling).
5. **Click the download button** (top-right of the generated image, e.g. `(1202, 310)`). Wait
   ~3-4s. Occasionally the first click doesn't register (no "Downloading..." toast) — check for
   the toast in a screenshot, and click again if it's missing before waiting on the filesystem.
6. **Rename off the download.** Gemini names files unpredictably
   (`Gemini_Generated_Image_<random16>.png`), and duplicate clicks can produce a `(1)` suffix.
   Find the newest matching file and move it to the canonical name:
   ```bash
   cd art-review/<batch>
   NEWEST=$(ls -t Gemini_Generated_Image_*.png 2>/dev/null | head -1)
   [ -n "$NEWEST" ] && mv "$NEWEST" "<NN>-<slug>.png"
   ```
   If nothing matches, wait a couple more seconds and retry — downloads of the full-res (~1024x1024,
   4-6MB) image aren't always instant.
7. **Track progress with TaskCreate/TaskUpdate** — one task per asset, marked `in_progress` before
   generating and `completed` right after the rename succeeds. Makes it trivial to resume a batch
   that gets interrupted (extension disconnects happened once mid-run and reconnected fine).

## 3. Background color: near-black, not transparent, not bright green

Two corrections landed here, both worth keeping:

- **Gemini does not produce real alpha transparency.** Its in-app preview shows a checkerboard
  behind generated images, but that's a UI placeholder — the actual PNG has a real, solid
  background. Asking for "transparent background" produces unpredictable results.
- **A bright chroma-key green (#00FF00) is precise but unreviewable** — too glaring to judge art
  against. Use **solid flat near-black, hex `#000001`** instead: visually reads as a plain dark
  backdrop (fine to review art against directly, no keying needed just to *look* at it), while
  being one hex digit off pure black so it's still a distinct, known value for a later
  programmatic keying pass. When keying for real, threshold a range near black (AI output isn't
  perfectly uniform) rather than an exact-match on `#000001`.

Occasionally Gemini ignores the background instruction anyway (one image rendered on white). Not
worth fighting — capture it as-is and flag it in the review gallery rather than retrying
automatically; regeneration is a call for the user to make, not an automatic retry loop.

## 4. Building the review gallery

After a batch finishes, generate a static HTML page (`art-review/gallery.html`) — full-size image,
filename, the exact prompt used (in a collapsible `<details>`), and a `<textarea>` per card for
notes. Built this with a small Python script (list of `(filename, title, prompt)` tuples → f-string
HTML) rather than hand-writing 20 near-identical cards — much less error-prone, and easy to extend
for the next batch.

Open it for the user with **`open <path>` via Bash**, not the browser `navigate` tool (that one
force-breaks on `file://`, per §1). `open` hands off to the OS's default-browser association and
works fine.

**Persistence (fixed after batch 1):** the first version of this gallery had plain `<textarea>`
boxes with no save/submit — feedback vanished on reload, and there's no reliable way for the
assistant to read a live tab's DOM back after the fact (confirmed: a `javascript_tool` read-back
came back empty, either because it was a fresh reload or a different window than the one the user
actually typed into — `open`-launched static pages aren't reliably the same tab handle the
automation still holds). Fixed by adding, in every gallery template going forward:

- **Autosave to `localStorage`** on every keystroke, keyed per-batch (e.g.
  `pastrypirates_art_review_batch1_feedback`), restored on page load — survives a reload in the
  same browser profile.
- **An "Export feedback (JSON)" button** in a sticky toolbar — collects every non-empty textarea
  into `{filename: note}` and downloads it as `art-review-feedback.json` via a `Blob` + `<a
  download>` triggered by the user's own click (a real user gesture, so unlike the automation's own
  attempts at this in §1, this one isn't blocked).
- **A "Copy feedback to clipboard" button** as a lower-friction alternative to the file download.
- **A "Clear all feedback" button** (with a confirm dialog) that wipes every textarea and the
  `localStorage` entry — needed because autosave means stale feedback from a prior round otherwise
  sits in the boxes forever, which is confusing when starting a fresh review pass.

Still true: don't try to read a gallery's feedback back through browser automation after the fact.
Either have the user export/copy the JSON and paste it into chat, or — if screenshots are all
that's available — read the feedback directly off the screenshots the user provides.

## 4.5. Non-square aspect ratios

Not every UI element is 1:1 — check the actual in-game element before assuming square. When the
user pasted a screenshot of the real turn-timer widget, it turned out to be a wide horizontal card
(~16:9), not square. Gemini *can* follow a non-square aspect ratio if you say so explicitly in
words (e.g. "WIDESCREEN LANDSCAPE ORIENTATION, aspect ratio 16:9, much wider than tall") — it
actually rendered at 2752×1536 (≈16:9) on the first try once asked this way. Don't default every
prompt to "1:1 square" without checking what shape the target UI slot actually is.

## 4.6. Rotating-sprite pivot centering

For any asset that will spin in-game around a fixed point (e.g. the compass needle rotating on
its pivot), the pivot must sit at the exact center of the image canvas — game rotation transforms
rotate around the image's geometric center, so any offset makes the "axle" visibly swing instead
of staying put. Gemini does not reliably center a hub/pivot element even when the rest of the
composition looks centered — measured one real case at 25px off-center vertically out of a 2048px
canvas (via the technique below), enough to be visible once rotated.

**Don't try to prompt-engineer pixel-perfect centering — verify and fix it with actual pixel
measurement instead:**
1. Load the image, build a boolean mask of pixels matching the near-black background color.
2. Downsample the mask (e.g. 8x) and flood-fill inward from the four borders — everything the
   fill reaches is background; whatever near-black region it *doesn't* reach (fully enclosed by
   the opaque artwork) is the hole/pivot. Pure-Python BFS on the downsampled mask is fast even
   without `scipy` (which isn't installed in this environment).
3. Compute that hole's centroid and compare to the canvas center.
4. If it's off, shift the entire image by the offset (pad with the same background color on one
   side, crop the same amount off the other) — no regeneration needed, this is exact pixel math.

## 5. Flagging quality misses

Gemini doesn't always nail the brief — three cases from the pastry batch worth naming as patterns:
drawing the wrong physical form entirely (a soufflé prompt came out as a mortar-and-pestle shape),
misinterpreting a name literally instead of by its description ("cinnamon *snaps*" → a cinnamon
*roll* swirl), and using a palette color from the House Style block in the wrong place (a chocolate
cake's top rendered sea-teal). None of these are worth auto-retrying — capture as generated, flag
it in the gallery with a one-line note above the prompt, and let the user's review decide whether
it needs a regenerate.

## 6. Staging discipline

Everything lands in `art-review/<batch>/` (gitignored — see `.gitignore`), never directly in
`assets/`. Nothing gets cropped, background-keyed, resized, or wired into `index.html` until the
user has reviewed and explicitly approved a specific image. This doc and the generation loop only
cover getting pixels in front of the user for review — integration is a distinct, separately
triggered step per art-audit.md §1.

## 7. Cropping & resizing for integration

Once an image is approved and it's time to actually integrate it (art-audit.md §1 step 6), don't
just background-key and drop the full 2048×2048 generation into `assets/`. These icons render at
emoji scale in-game — typically 15–90px on screen — so shipping the raw generation size is both
wasteful (multi-MB files for something a few dozen pixels wide) and, if the crop is sloppy, actively
harmful: baked-in padding around the design shrinks how big it reads at its real in-game size.

**This bit the ingredient-icon batch once already**: a naive "bounding box of every non-background
pixel" crop got thrown off by stray noise — most reliably, the small gray sparkle/diamond mark
Gemini stamps in the bottom-right corner of every generated image (a UI watermark, not art — visible
in-app but confirmed to never actually land in the saved PNG's *design*, only as isolated noise
pixels near that corner) — plus scattered anti-aliasing specks elsewhere. Both count as
"non-background" under a plain color-distance test, so the computed bbox included them, leaving a
huge margin of dead space around the actual design. The icons then rendered too small in the game,
because a bbox that's 90% empty space still gets resized as if it were 90% design.

**The fix — crop to the largest *significant* foreground region(s), not to every non-background
pixel:**
1. Detect the background color by sampling the four corners (usually near-black `#000001`, but
   check — Gemini occasionally ignores the instruction and renders on white; sample, don't assume).
2. Build a foreground mask via color distance from that background color.
3. Zero out a fixed exclusion zone in the bottom-right corner (~15% of width/height) before doing
   anything else — that's where the watermark sparkle sits; House Style's "centered subject"
   convention means nothing legitimate should ever be there.
4. Label the connected components of what's left. Keep only components above a minimum size
   (e.g. ≥0.05% of total image area) — this drops residual antialiasing noise while still keeping
   real secondary elements (e.g. a star intentionally added off to the side of a wave icon is its
   own disconnected component, and must survive this filter, not just "the single largest blob").
   **Label components on a downsampled copy of the mask (e.g. 8x), then scale the resulting boxes
   back up** — a full-resolution dilation-growth labeler is fine on a clean image but turned into
   minutes-per-image on a noisy source (hundreds of stray single-pixel components, each needing its
   own growth pass across the full 2048x2048 array). Downsampling first cut a 76-file batch from an
   unfinished 20+-minute run to well under a minute, with no measurable loss of bbox accuracy — a
   bounding box tolerates a few pixels of imprecision far better than the actual pixel-level key does.
5. Crop to the union bounding box of the kept components, plus only a token pad (~1%) for
   anti-aliasing safety — the goal is genuinely no buffer space, not a small buffer.
6. **Chroma-key to real alpha transparency *now*, on the still-full-resolution crop from step 5 —
   before any resizing.** Feather it a few values wide at the threshold (matches §3's "AI rendering
   noise isn't perfectly uniform" guidance) rather than a hard binary cutout. Order matters here:
   keying after downsampling was a real bug (see below), not just a theoretical risk — always key
   first, resize second.

   **A plain color-distance threshold is not enough — flood-fill inward from the crop's outer edge
   first, and only key pixels reachable from there.** House Style shading routinely goes near-black
   in shadow/ink areas that are part of the art, not the background (a real case: the shadow in the
   gap between two crossed rolling pins on a coin icon). A global "is this pixel close to the
   background color" test can't tell that shadow apart from actual background, and keys it out too —
   punching a transparent hole in the middle of the art. The fix: build a "could be background"
   candidate mask (color distance under threshold+feather), then flood-fill it inward from the crop's
   four edges — only the region actually *connected* to the border is real background; a
   same-colored patch fully enclosed by non-background pixels is left opaque regardless of how dark
   it is. Do the flood-fill on a downsampled copy too (same technique as step 4) for speed, then
   upsample and dilate the result by a downsample-block's worth of margin before using it to gate the
   alpha computation, so the blocky low-res boundary never eats into real background right at its
   own edge.
7. **Premultiply RGB by alpha before resizing, resize, then un-premultiply.** PIL (and most resize
   implementations) blend the RGB and alpha channels independently. On straight (non-premultiplied)
   alpha, that lets the background's true color bleed into semi-transparent edge pixels during
   downsampling — premultiplying avoids it:
   ```python
   a = arr[..., 3:4] / 255.0
   premult = arr.copy(); premult[..., :3] = arr[..., :3] * a
   resized = np.array(Image.fromarray(premult, "RGBA").resize((size, size), Image.LANCZOS)).astype(float)
   ra = resized[..., 3:4] / 255.0
   out = resized.copy(); out[..., :3] = np.clip(resized[..., :3] / np.where(ra > 0, ra, 1.0), 0, 255)
   ```
8. Resize down with high-quality resampling (Lanczos) to the icon's *actual* target resolution.
   Figure that out from the real CSS/SVG size it renders at in-game (search for the element's class
   or the `popEmoji`/`iconAt` call site), then pick a resolution with reasonable retina headroom —
   not the source generation size. In practice this project's icons land at 128px (small
   inline/button icons, ~15-25px on screen), 320px (board pops, up to ~90px on screen), or 384px (the
   flippenator coin specifically — it's large, always-visible, and has fine filigree detail that
   deserves the extra headroom). All three are still enormous reductions from the 2048px source.

**Caught in production: keying after resize instead of before produced visibly jagged, aliased
edges** — worst on the flippenator coin's fine gold filigree, where the downsample had already
blended thin detail lines into ambiguous colors before the alpha threshold ever saw them, turning a
smooth curve into a blocky staircase. It read fine in a quick glance at the final size, and wasn't
caught until viewed at 100% in Finder / zoomed at the pixel level. **Verifying "does this look like a
clean icon" at a glance is not enough — zoom into the edges of the final cropped-and-resized file
before presenting it or wiring it in**, specifically checking for staircasing on curves and dark/light
fringing around fine detail. Confirm the design fills the frame edge-to-edge with no residual
padding, no watermark/noise fragment, and smooth antialiased edges throughout.

**Also composite the result against a dark, contrasting background before calling it done — not
just against white.** Edge-zooming alone caught the jaggies above but missed a second, worse bug (the
flood-fill fix in step 6): a chunk of the *interior* of the coin-tails icon, between the crossed
rolling pins, had been keyed to transparent along with the real background. Viewed against this
tool's default white backdrop that read as faint discoloration, easy to wave off; composited against
near-black (i.e. how it actually sits in-game) it was an obvious hole. A single glance-check against
one background color is not a substitute for checking against the actual deployment background.

Non-square sources (§4.5) are the default expectation now, not a special case — every crop in this
pipeline preserves the source's natural aspect ratio (bounding only the long side to the target
size) rather than forcing a square. Forcing square once got past review and shipped: a handshake
icon squished into a square canvas read as a subtly-wrong hand shape until someone actually looked
for it. If a resize step is added anywhere without that in mind, re-derive it from this default,
don't reintroduce forced-square as the norm.
