// checks.mjs — UNIVERSAL structural invariants. These know NOTHING about captains cards, Arrgh
// buttons or empty towers by name. They know only about ROLES — things a player clicks, things a
// player reads, and the containers that hold them — and assert a handful of rules that must hold on
// EVERY screen of EVERY mode. This is the opposite of the piecemeal gate Wyatt (rightly) rejected:
// add no rule per bug; these five general rules already catch the whole class today's four bugs
// came from, and the ones not hit yet. The vision judge (vision.mjs) is the catch-all above them.

// MEASURE — an in-page expression string. Collects role-based element sets with the rects and flags
// each rule needs. Returns null-safe plain data (returnByValue over CDP).
export const MEASURE = `(() => {
  const vis = el => { const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < 0.05) return false;
    const r = el.getBoundingClientRect(); return r.width > 1 && r.height > 1; };
  const R = el => { const r = el.getBoundingClientRect(); return { l:r.left, t:r.top, r:r.right, b:r.bottom, w:r.width, h:r.height }; };
  const topmostAt = (el, x, y) => { const hit = document.elementFromPoint(x, y); return !!(hit && (hit === el || el.contains(hit) || hit.contains(el))); };
  const uniq = new Set();
  // THINGS A PLAYER CLICKS — every interactive control the game presents, by class, deduped.
  const clickSel = '.apBtn, .btlBtn, .sailCell, .recipeCard, .bkoCard, .apSlider, #flipCoinWrap.active, .recipeList button';
  const interactive = [...document.querySelectorAll(clickSel)].filter(vis).map(el => {
    const r = el.getBoundingClientRect(), cx = r.left + r.width/2, cy = r.top + r.height/2;
    return { tag: el.className.toString().slice(0,40) || el.id, text: (el.textContent||'').trim().slice(0,24), rect: R(el), topmost: topmostAt(el, cx, cy),
      disabled: el.disabled || el.classList.contains('apDisabled') || el.getAttribute('aria-disabled') === 'true' }; });
  // THINGS A PLAYER READS — text that must not be clipped or overrun.
  const textSel = '.pname, .apMsg, .pp4Bub:not(.ambient), .prowRecipe, .pp4CerTitle, .coins, .bkoName';
  const text = [...document.querySelectorAll(textSel)].filter(vis).map(el => {
    const inner = el.firstElementChild && getComputedStyle(el).overflow !== 'visible' ? el.firstElementChild : el;
    return { text: (el.textContent||'').trim().slice(0,30), rect: R(el), scrollW: el.scrollWidth, clientW: el.clientWidth,
      innerScrollW: el.firstElementChild ? el.firstElementChild.scrollWidth : el.scrollWidth }; });
  // CONTAINERS that should hug their content, not stretch empty. A full-viewport backdrop (a dim
  // overlay) is exempt — big empty space is its job. Everything else is a card and should fit.
  const panelSel = '#pp4Cap, #actionPanel, #captainsPanel, .recipeList, .bko';
  const panels = [...document.querySelectorAll(panelSel)].filter(vis).map(el => {
    const kids = [...el.children].filter(vis); const box = kids.length
      ? { t: Math.min(...kids.map(k=>k.getBoundingClientRect().top)), b: Math.max(...kids.map(k=>k.getBoundingClientRect().bottom)),
          l: Math.min(...kids.map(k=>k.getBoundingClientRect().left)), r: Math.max(...kids.map(k=>k.getBoundingClientRect().right)) } : null;
    const cs = getComputedStyle(el); const bg = cs.backgroundColor;
    const rect = R(el); const backdrop = rect.w > innerWidth*0.85 && rect.h > innerHeight*0.85;
    return { tag: el.id || el.className.toString().slice(0,30), rect, content: box, backdrop,
      contentH: box ? box.b - box.t : rect.h, contentW: box ? box.r - box.l : rect.w }; });
  return { iw: innerWidth, ih: innerHeight, interactive, text, panels };
})()`;

// judge a measurement. Returns [{ok, rule, what}] — one entry per check that ran. General rules only.
export function structuralChecks(m) {
  const out = []; const F = (ok, rule, what) => out.push({ ok, rule, what });
  const IB = 2;                                     // sub-pixel tolerance
  const withinVP = r => r.l >= -IB && r.t >= -IB && r.r <= m.iw + IB && r.b <= m.ih + IB;
  const overlaps = (a, b, tol = 3) => Math.min(a.r, b.r) - Math.max(a.l, b.l) > tol && Math.min(a.b, b.b) - Math.max(a.t, b.t) > tol;

  // 1. every clickable control is fully on screen (nothing a player must reach is off the edge)
  const off = m.interactive.filter(e => !e.disabled && !withinVP(e.rect)).map(e => `${e.text || e.tag}`);
  F(off.length === 0, "on-screen", off.length ? `clickable off-screen: ${off.slice(0,6).join(", ")}` : "all clickables on screen");

  // 2. every clickable control is the topmost thing at its own centre (not hidden under something)
  const occ = m.interactive.filter(e => !e.disabled && withinVP(e.rect) && !e.topmost).map(e => `${e.text || e.tag}`);
  F(occ.length === 0, "not-occluded", occ.length ? `clickable covered by something else: ${occ.slice(0,6).join(", ")}` : "all clickables reachable");

  // 3. no two DISTINCT clickable controls overlap (piled buttons, a control on a control)
  const piles = [];
  for (let i = 0; i < m.interactive.length; i++) for (let j = i+1; j < m.interactive.length; j++)
    if (overlaps(m.interactive[i].rect, m.interactive[j].rect)) piles.push(`${m.interactive[i].text||m.interactive[i].tag}/${m.interactive[j].text||m.interactive[j].tag}`);
  F(piles.length === 0, "no-pile", piles.length ? `overlapping controls: ${piles.slice(0,5).join(", ")}` : "no overlapping controls");

  // 4. no readable text is clipped by its own box (name into coin, label cut off)
  const clip = m.text.filter(t => t.innerScrollW > t.clientW + 3).map(t => `"${t.text}" (${t.innerScrollW}>${t.clientW})`);
  F(clip.length === 0, "no-clip", clip.length ? `text clipped by its box: ${clip.slice(0,5).join(", ")}` : "no clipped text");

  // 5. no content card is stretched far past its content (the empty-tower class). Backdrops exempt.
  const empty = m.panels.filter(p => !p.backdrop && p.content && p.rect.h > p.contentH + 90).map(p => `${p.tag} (${p.rect.h|0}px box vs ${p.contentH|0}px content)`);
  F(empty.length === 0, "hug-content", empty.length ? `panel stretched empty: ${empty.join(", ")}` : "panels hug their content");
  return out;
}
