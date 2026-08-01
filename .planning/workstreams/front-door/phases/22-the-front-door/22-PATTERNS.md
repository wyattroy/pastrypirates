# Phase 22: The Front Door - Pattern Map

**Mapped:** 2026-07-31
**Files analyzed:** 8 (`index.html`, `about.html` [new], `sitemap.xml`, `robots.txt`, `src/ui/flow.js`,
`src/ui/lobby.js`, `src/ui/util.js`, `src/orchestrator.js`, `docs/DRIVING-THE-GAME.md`)
**Analogs found:** 7 / 8 (robots.txt needs no change, confirmed only)

RESEARCH.md for this phase already did exhaustive `path:line` discovery (six `#pname` readers, the
persistence gap, the modal-dismiss divergence). This file does not re-derive those findings; it
packages the concrete excerpts a planner needs to write PLAN.md actions, verified by direct reads
this session.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `index.html` (name modal markup, `#stepChoose`) | component (modal markup) | request-response (user confirms, flow proceeds) | `#kofiModal` (`index.html:970-975`) for shell shape; **no exact analog** for dismiss-equals-confirm semantics | role-match, semantics are new |
| `index.html` (About links, welcome + footer) | component (nav link) | request-response (navigation) | `.footerBtn` family, e.g. `#btnShowHow` (`index.html:1078`) | exact |
| `about.html` (new page) | component (static page) | request-response | **No analog exists** — nearest structural relative is `index.html`'s own `<head>` (lines 1-32) and `.rules`/`.modalCard` styling; must be hand-derived, not copied from a sibling page | no analog (see below) |
| `src/ui/flow.js` `wireWelcome()` (4 handlers) | controller (click wiring) | request-response | itself — the four handlers are near-identical siblings; use handler 4 (`choicePassPlay`) as the template for how a handler defers into a screen after reading the name | exact (self-referential) |
| `src/ui/lobby.js` `requireName()` | utility (name resolution) | transform | itself — must become the pre-fill/read chokepoint; closest sibling pattern is `unusedDefaultName()` (`src/shared/index.js:199-208`) for default-name selection | role-match |
| `src/ui/util.js` (new `pp_lastName` persistence fns) | utility (localStorage read/write) | CRUD (localStorage) | `getMyId()` (`src/ui/util.js:1390-1394`, `pp_id`) for the "never cleared" pattern; `saveSession()`/`clearSession()` (`util.js:1396-1397`) for the "paired save/clear" shape | exact (getMyId) |
| `src/orchestrator.js` `createRoom()` name read | controller (network-adjacent) | request-response | itself, line 1113 — one-line change, no new pattern needed | exact |
| `src/orchestrator.js` Feedback modal submit handler | controller (form submit) | request-response | itself, line 1337 — one-line change | exact |
| `src/orchestrator.js` `.modalX` injection loop | shared UI wiring | event-driven (click/backdrop) | itself, lines 1322-1333 — the name modal must NOT be added to this array (dismiss≠confirm elsewhere); its X/backdrop/Escape must be hand-wired separately | exact, explicitly diverges |
| `docs/DRIVING-THE-GAME.md` automation snippets | test/docs | file-I/O (docs, not runtime) | itself, lines 40 and 190 | exact |
| `sitemap.xml` | config | CRUD (static XML) | itself — one more `<url>` block, same shape as the existing homepage entry | exact |
| `robots.txt` | config | n/a | itself — confirmed no change needed (`Allow: /`, only `lab.html` disallowed) | exact, no-op |

## Pattern Assignments

### `index.html` — the name modal (new markup)

**Analog:** `#kofiModal` for card shell (`index.html:970-975`), `#lobby`/`#stepChoose` for placement
context (`index.html:810-834`), `.nameLabel` for the input (`index.html:816-817`, styled at
`index.html:710-711`).

**Shell pattern to copy** (`index.html:970-975`):
```html
<div id="kofiModal" class="modalOverlay" style="display:none">
  <div class="modalCard" style="max-width:420px">
    <div class="modalTitle">🍪 Buy me a cookie</div>
    <div id="kofiPanel" class="kofiPanel"></div>
  </div>
</div>
```
New modal should follow this exact `.modalOverlay` > `.modalCard` > content shape — a sibling div,
NOT a fifth `showStep()` step. Per UI-SPEC "Layout & Visual Hierarchy," content order inside the card
is: heading (`.modalStep h3`-equivalent, 17px/700) → `.nameLabel` input (16px, iOS-zoom exception,
`maxlength="40"`, matching the field being removed) → `button.primary` confirm.

**Input pattern to copy** (`index.html:816-817`, the field being removed — reuse its attributes on
the new modal's input):
```html
<label class="nameLabel">Yer captain name
  <input type="text" id="pname" maxlength="40" placeholder="e.g. Davy Scones"></label>
```
Styling already exists at `index.html:710-711` (`.nameLabel`, `.nameLabel input`) — reuse verbatim,
no new CSS class needed for the input itself.

**Primary button class** (`index.html:125-126`):
```css
button.primary { background: var(--accent); color: #fff; border-color: var(--accent); }
button.primary:hover { filter: brightness(1.1); }
```
Apply `class="primary"` to the confirm button — this is the one accent-orange element the UI-SPEC
reserves for it.

**CSS-block coordination warning:** `.modalOverlay`/`.modalCard`/`.nameLabel`/`button.primary` rules
all live in `index.html`'s single `<style>` block (lines ~669-722), which **Phase 18 is concurrently
editing**. This phase's markup work (`#stepChoose`, new modal div, About links) does not require any
NEW CSS rules — everything needed already exists — so this phase should add ZERO lines to the
`<style>` block. If a new rule is truly unavoidable (e.g. a two-column About-page hero — but that
belongs in `about.html`'s own stylesheet per D-07, not here), flag it explicitly as a merge-conflict
risk with Phase 18 rather than adding it silently.

### `index.html` — welcome-screen `#pname` field removal (D-01)

**Site to remove** (`index.html:816-817`):
```html
<label class="nameLabel">Yer captain name
  <input type="text" id="pname" maxlength="40" placeholder="e.g. Davy Scones"></label>
```
This exact block is what the new modal's input pattern is copied FROM before this site is deleted.

### `index.html` — About links (D-06, welcome screen + footer)

**Analog — footer button pattern** (`index.html:1077-1086`):
```html
<div id="footerRow">
  <button id="btnShowHow" class="footerBtn footerHow" type="button">📖 How to play</button>
  <button id="btnShowCredits" class="footerBtn footerCredits" type="button">🎗️ Credits</button>
  <button id="btnShowLog" class="footerBtn footerLog" type="button">📜 Captain's log</button>
  <button id="btnShowFeedback" class="footerBtn footerFeedback" type="button">💬 Feedback</button>
  <button id="btnKofi" class="footerBtn footerKofi" type="button">🍪 Buy me a cookie</button>
  <button id="btnLeave" class="footerBtn footerLeave" type="button">🚪 Leave game</button>
</div>
```
New footer entry: an `<a>` (not `<button>`, since it navigates, not opens a modal) styled
`class="footerBtn footerAbout"` (new modifier class, following the existing `.footerHow`/
`.footerCredits`/etc. naming convention — each gets its own modifier for possible per-button color
overrides even though most currently share teal). Per UI-SPEC Color section, use the teal treatment
(matching `.footerHow`/`.footerCredits`), NOT orange accent — this is navigation, not a CTA.

**Welcome-screen placement** — no existing analog for a link under `.choiceRow`; nearest sibling is
the `.muted`/`#fbnote` informational lines already under the cards (`index.html:829-831`). Insert the
About link as a small line/link in that same area, per D-06's "under the four mode cards" instruction.

### `about.html` — NEW page (no analog exists in this repo)

**Finding:** There is no second static HTML page in this repo to copy from — `lab.html` is a
developer/debug tool, not a public content page, and shares `index.html`'s script/module graph
(out of scope to verify here, but structurally not a template for a standalone page). D-07 explicitly
requires `about.html` to have **no shared JS** and its **own stylesheet**, so this genuinely is new
machinery, not a reuse case. The parts of `index.html` that MUST be duplicated (per D-07 and
RESEARCH.md's Recommended Project Structure):

**Head block to duplicate/adapt** (`index.html:1-32`, verified stable — RESEARCH.md flags this
region as NOT subject to Phase 18's concurrent edits, since Phase 18's scope is the `<style>` block
only, which starts after this):
```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<link rel="icon" type="image/png" href="favicon.png">
<link rel="shortcut icon" href="favicon.ico">
<link rel="apple-touch-icon" href="favicon.png">
<title>Pastry Pirates on the Sugar Seas — Online</title>
<meta name="description" content="A free browser pirate board game. ...">
<link rel="canonical" href="https://playpastrypirates.com/">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<meta property="og:type" content="website">
<meta property="og:title" content="Pastry Pirates on the Sugar Seas">
<meta property="og:description" content="...">
<meta property="og:url" content="https://playpastrypirates.com/">
<meta property="og:image" content="https://playpastrypirates.com/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="663">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Pastry Pirates on the Sugar Seas">
<meta name="twitter:description" content="...">
<meta name="twitter:image" content="https://playpastrypirates.com/og-image.jpg">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"VideoGame", ...}
</script>
<!-- Firebase SDK tags NOT needed on about.html — no game logic runs there -->
<meta name="viewport" content="width=device-width, initial-scale=1">
```
For `about.html`: same favicon links, a **new** `<title>` ("About — Pastry Pirates on the Sugar
Seas"), a new `<meta name="description">` written for the About page's own content, `<link
rel="canonical" href="https://playpastrypirates.com/about.html">`, and per RESEARCH.md Assumption A2
either duplicate the `og:`/`twitter:` block with about.html-specific values or omit it entirely
(Claude's discretion per CONTEXT.md). Do NOT include the Firebase script tags — `about.html` has no
game logic. The `robots` meta and JSON-LD `VideoGame` block are specific to the game page; `about.html`
does not need to duplicate the JSON-LD (it's describing the game, which already has a canonical URL)
but may carry its own minimal `AboutPage`/`WebPage` JSON-LD at the planner's discretion — not required
by any decision record.

**Rules/content-block styling to mirror by eye** (`index.html:663-666`, since `.rules` already exists
as a named class for exactly this kind of prose block):
```css
.rules { font-size: 13.5px; line-height: 1.55; }
.rules h4 { margin: 12px 0 4px; color: var(--teal); font-size: 14px; }
.rules p { margin: 6px 0; }
```
`about.html`'s own stylesheet (D-07) should declare equivalent rules under its own class names (not
`import` or `@import` `index.html`'s block — that would defeat D-07's isolation).

**Card/section surface to mirror** (`index.html:672-674`):
```css
.modalCard { background: linear-gradient(175deg, #ffffff, var(--parch2) 250%); border: 3px solid var(--teal);
  border-radius: 20px; padding: 26px 28px 22px; max-width: 440px; width: 100%; text-align: center;
  box-shadow: 0 20px 50px rgba(10,35,40,.5), 0 0 0 6px rgba(253,182,61,.18); }
```
UI-SPEC's Color section says About-page content sections sit on "the same white/parchment card
treatment" — `about.html`'s own stylesheet should declare an equivalent (not identical width/centering,
since About is a full page not a modal) rounded white/parchment card class.

**Page background gradient to mirror** (`body` rule, referenced at `index.html:41` per UI-SPEC):
```css
linear-gradient(160deg, #dcece9 0%, #e6efe1 45%, #f5f0dd 100%)
```

**No analog found for:** the two-column hero layout (title+blurb left / screenshot right, UI-SPEC
"Layout & Visual Hierarchy") — this is new CSS, original to `about.html`, not copied from anywhere.

### `src/ui/flow.js` `wireWelcome()` — the four click handlers to intercept

**Current state, verbatim** (`src/ui/flow.js:1687-1699`):
```js
export function wireWelcome(){
  $("choiceSolo").onclick=()=>{if(!requireName())return;startSinglePlayer();};
  $("choiceHost").onclick=()=>{if($("choiceHost").classList.contains("disabled"))return;if(!requireName())return;netHandlers().onCreateRoom();};
  $("choiceJoin").onclick=()=>{if($("choiceJoin").classList.contains("disabled"))return;$("joinName").value=$("pname").value;showStep("stepJoin");};
  $("choicePassPlay").onclick=()=>{$("ppName0").value=($("pname").value||"").trim();showStep("stepPassPlay");};
  $("btnStartPassPlay").onclick=()=>{ ... };
  document.querySelectorAll("#lobby [data-back]").forEach(b=>{b.onclick=()=>showStep("stepChoose");});
}
```
**Pattern to follow:** each handler is a short arrow function assigned to `.onclick`, disabled-check
first (Host/Join only), then a name-touching line, then the mode's next step. The modal insertion
point is exactly where `requireName()`/`$("pname").value` is read today — replace each of those four
reads with "open modal, and on confirm run the rest of this handler's body." Since all four bodies
differ after the name step, the modal's confirm callback needs to be parameterized per mode (e.g.
pass a continuation function), matching this file's existing closure-based style (`saveSoloState()`,
`resumeSoloGame()` etc. all take/close over plain values, not classes).

### `src/ui/lobby.js` `requireName()` — becomes the read chokepoint

**Current state** (`src/ui/lobby.js:92-97`):
```js
export function requireName(){
  const v=($("pname").value||"").trim();
  return v?v.slice(0,40):DEFAULT_NAMES[0];
}
```
**Pattern:** keep this function's signature/shape (small, pure, returns a trimmed/capped string with
a fallback) but repoint its read from `$("pname").value` to the new persisted/modal-confirmed value.
`showStep()` sits immediately above it (`lobby.js:89-91`) — same file, same section header
(`/* ================= welcome modal ================= */`, line 88) — new modal open/close functions
belong in this same section.

### `src/shared/index.js` `unusedDefaultName()` — default-name source for the modal's placeholder

**Pattern to reuse verbatim** (`src/shared/index.js:199-208`, cited in RESEARCH.md, not re-read this
session but already fully quoted there):
```js
function unusedDefaultName(seats,preferIdx){
  const taken=new Set();
  Object.keys(seats||{}).forEach(k=>{
    const s=seats[k]||{};
    const nm=s.id?(s.name||"").trim():DEFAULT_NAMES[+k];
    if(nm)taken.add(nm);
  });
  if(preferIdx!=null&&!taken.has(DEFAULT_NAMES[preferIdx]))return DEFAULT_NAMES[preferIdx];
  return DEFAULT_NAMES.find(nm=>!taken.has(nm))||DEFAULT_NAMES[preferIdx||0];
}
```
Use this (not a new name list) as the fallback when `pp_lastName` has never been set (first-time
visitor, D-04's second sentence).

### `src/ui/util.js` — new durable `pp_lastName` persistence

**Analog — the "never cleared" precedent, `pp_id`** (`src/ui/util.js:1390-1394`):
```js
export function getMyId(){
  let id=null;try{id=localStorage.getItem("pp_id");}catch(e){}
  if(!id){id="u"+Math.random().toString(36).slice(2,10);try{localStorage.setItem("pp_id",id);}catch(e){}}
  return id;
}
```
Comment at `util.js:1388` explicitly documents `pp_id`/`pp_timerOff` as "structurally excluded" from
the `SESSION_SCHEMA_V`/`SOLO_SCHEMA_V` clearing mechanism — the new `pp_lastName` key should be
documented the same way, in the same comment block (`util.js:1381-1389`), when added.

**Analog — the save/clear pair shape, `pp_sess`** (`src/ui/util.js:1396-1397`):
```js
export function saveSession(){try{localStorage.setItem("pp_sess",JSON.stringify({v:SESSION_SCHEMA_V,room:appState.room,mySeat:appState.mySeat,isHost:appState.isHost}));}catch(e){}}
export function clearSession(){try{localStorage.removeItem("pp_sess");}catch(e){}}
```
New functions (e.g. `saveLastName(v)`/`getLastName()`) should follow this exact try/catch-swallow
shape (`localStorage` write/read wrapped in `try{}catch(e){}`, no logging, silent failure — matches
this codebase's documented "silent failure preferred for optional operations" convention) but must
NOT be namespaced under `SESSION_SCHEMA_V` — write a plain string value (or `{v:1,name}` if versioning
is wanted independently later), not gated by the existing schema constants, per RESEARCH.md Pitfall 2.

**All required call sites for the new function** (RESEARCH.md's six-reader inventory, verified this
session at each cited line):
1. `src/ui/lobby.js:93` — `requireName()`
2. `src/orchestrator.js:1113` — `createRoom()`: `const name=($("pname").value||"").trim().slice(0,40)||DEFAULT_NAMES[0];`
3. `src/orchestrator.js:1337` — Feedback submit: `name:($("pname").value||"").trim()||null` inside `netSetFeedback(...)` call
4. `src/ui/flow.js:1698` — `choiceJoin` handler: `$("joinName").value=$("pname").value;`
5. `src/ui/flow.js:1699` — `choicePassPlay` handler: `$("ppName0").value=($("pname").value||"").trim();`
6. `docs/DRIVING-THE-GAME.md:40,190` — automation snippets (see below)

### `src/orchestrator.js` — the `.modalX` injection loop (the "closes but never confirms" pattern)

**Verbatim, current** (`src/orchestrator.js:1322-1333`):
```js
["howToPlayModal","creditsModal","logModal","feedbackModal","recipeModal","kofiModal"].forEach(id=>{
  const ov=$(id);if(!ov)return;
  const card=ov.querySelector(".modalCard");
  if(card&&!card.querySelector(".modalX")){
    card.style.position="relative";
    const x=document.createElement("button");
    x.className="modalX";x.type="button";x.innerHTML=iconImg(CLOSE_X_IMG);x.setAttribute("aria-label","Close");
    x.onclick=()=>{ov.style.display="none";};
    card.insertBefore(x,card.firstChild);
  }
  ov.addEventListener("click",e=>{if(e.target===ov)ov.style.display="none";});
});
```
**Explicit divergence for the name modal:** do NOT add the new modal's id to this array. Its X button,
backdrop click, AND a new Escape-key listener (none exist anywhere in the codebase today — verified
by RESEARCH.md's grep) must all call one shared "confirm and proceed" function instead of
`ov.style.display="none"`. This is genuinely new machinery, not reuse — the loop above is the closest
sibling but is explicitly the wrong tool for D-02's semantics.

**Modal-that-gates-a-flow check (explicitly answered):** No existing modal in this codebase requires
confirmation before an action proceeds — the six modals in the array above only ever close, and the
pre-game screens (`#lobby`, `#lobbyRoom`, `#passOverlay`) that DO gate the flow are non-dismissible by
design (comment at `orchestrator.js:1319-1321`, confirmed: "Pre-game/blocking modals ... are
deliberately NOT dismissible this way — they gate the game and must be answered."). **The new name
modal is the first "dismissible AND gates a flow" surface in the codebase.** Planner should treat this
as new interaction machinery, budget accordingly, and not expect to find a closer analog by searching
further.

### `src/orchestrator.js` — one-line repoints

**`createRoom()`** (`orchestrator.js:1112`):
```js
const name=($("pname").value||"").trim().slice(0,40)||DEFAULT_NAMES[0];
```
**Feedback submit** (`orchestrator.js:1337`, inside `$("btnSendFeedback").onclick`):
```js
if(appState.db)netSetFeedback(appState.db,Date.now(),{text,room:appState.room||null,name:($("pname").value||"").trim()||null,t:Date.now()},e=>console.error("feedback write failed",e));
```
Both become reads of the new `getLastName()`-style function instead of `$("pname").value`.

### `docs/DRIVING-THE-GAME.md` — stale automation snippets

**Site 1** (`docs/DRIVING-THE-GAME.md:40-41`, "§3 Start a solo game"):
```js
document.getElementById('pname').value = 'Wyatt';
document.getElementById('choiceSolo').click();
```
**Site 2** (`docs/DRIVING-THE-GAME.md:189-190`, "§5c guest join"):
```js
document.getElementById('pname').value = 'Claude';
document.getElementById('choiceJoin').click();
```
Both must be rewritten to: click the mode card first (opens the new modal), then interact with
whatever the modal's confirm control's id resolves to (planner's choice — not yet fixed). This edit
must land in the SAME task/plan that creates the modal, per RESEARCH.md Pitfall 3, since D-11's
screenshot-capture session depends on this doc's recipe working.

### `sitemap.xml` — new `<url>` entry

**Current, full file:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://playpastrypirates.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```
**Pattern:** add a second `<url>` block, same shape, lower priority (e.g. `0.5`) since it's a
secondary page:
```xml
<url>
  <loc>https://playpastrypirates.com/about.html</loc>
  <changefreq>monthly</changefreq>
  <priority>0.5</priority>
</url>
```

### `robots.txt` — confirmed no change needed

**Current, full file:**
```
User-agent: *
Allow: /
Disallow: /lab.html

Sitemap: https://playpastrypirates.com/sitemap.xml
```
`about.html` is not disallowed by any rule here. No edit required — the planner should still include
a one-line verification task (confirm `about.html` isn't caught by a future rule) rather than a
code-change task.

## Shared Patterns

### Dismissible modal shell (structure + CSS)
**Source:** `index.html:669-680` (`.modalOverlay`/`.modalCard`/`.modalX` CSS), `index.html:970-975`
(`#kofiModal` markup as the cleanest minimal example)
**Apply to:** the new name modal's markup (shell only — dismiss behavior diverges, see below)

### Modal open (one-line assignment)
**Source:** `src/orchestrator.js:1313`, e.g. `$("btnShowHow").onclick=()=>{$("howToPlayModal").style.display="flex";};`
**Apply to:** whatever triggers the name modal open (each of the four mode-card clicks)

### Modal close-only (`.modalX` injection loop) — explicitly NOT to be reused as-is
**Source:** `src/orchestrator.js:1322-1333`
**Apply to:** the other six existing modals only. The new name modal needs hand-written X/backdrop/
Escape handlers that all call a shared confirm function, not `ov.style.display="none"`.

### localStorage read/write/clear, try-catch-swallow shape
**Source:** `src/ui/util.js:1390-1394` (`getMyId`, never cleared), `1396-1397` (`saveSession`/
`clearSession`, cleared pair)
**Apply to:** new `pp_lastName` persistence functions in `src/ui/util.js`

### Default-name fallback
**Source:** `src/shared/index.js:199-208` (`unusedDefaultName()`), `DEFAULT_NAMES` array (same file)
**Apply to:** the modal's placeholder/pre-fill when no `pp_lastName` is set yet

### Footer button markup + `.footerBtn` styling
**Source:** `index.html:1077-1086` (six existing buttons), `.footerBtn` CSS at `index.html:135`
**Apply to:** the new About footer link (D-06)

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `about.html` (whole file) | component (static page) | request-response | No second standalone HTML page exists in this repo (`lab.html` is a dev tool sharing the module graph, not a content-page template). Must be hand-derived from `index.html`'s `<head>` block and `.rules`/`.modalCard` styling, duplicated per D-07 rather than shared. See "Pattern Assignments → about.html" above for exactly which parts to duplicate. |
| Name modal's dismiss-equals-confirm behavior | interaction logic | event-driven | No existing modal in the codebase combines "dismissible" with "gates a flow requiring confirmation" — confirmed by direct inspection of `orchestrator.js:1319-1333`'s own comment. This is new machinery; RESEARCH.md's Pattern 2 and this file's "modal-that-gates-a-flow check" both independently confirm the same finding. |
| About page two-column hero layout | layout/CSS | n/a | UI-SPEC's own "Layout & Visual Hierarchy" section (added post-verification) describes this as new, original layout — no existing two-column responsive hero exists elsewhere in `index.html` to copy from. |
| Escape-key handling | event listener | event-driven | Zero matches anywhere in the codebase (`grep` for `keydown`/`Escape`/`keyCode`, per RESEARCH.md). Must be written from scratch for this one modal only — do not generalize to the other six modals (out of scope). |

## Metadata

**Analog search scope:** `index.html` (full file read via targeted greps + line reads), `src/ui/flow.js`
(lines 1685-1730), `src/ui/lobby.js` (lines 85-100), `src/ui/util.js` (lines 1380-1420),
`src/orchestrator.js` (lines 1105-1140, 1305-1340), `docs/DRIVING-THE-GAME.md` (lines 35-45, 185-195),
`sitemap.xml`, `robots.txt` — all full files.
**Files scanned:** 8 direct reads/greps this session, cross-checked against RESEARCH.md's prior
exhaustive pass (which already cites `src/shared/index.js` in full).
**Pattern extraction date:** 2026-07-31
