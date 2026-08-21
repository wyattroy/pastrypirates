// checks.mjs — UNIVERSAL structural invariants. These know NOTHING about captains cards, Arrgh
// buttons or empty towers by name. They know only about ROLES — things a player clicks, things a
// player reads, and the containers that hold them — and assert a handful of rules that must hold on
// EVERY screen of EVERY mode. This is the opposite of the piecemeal gate Wyatt (rightly) rejected:
// add no rule per bug; these five general rules already catch the whole class today's four bugs
// came from, and the ones not hit yet. The vision judge (vision.mjs) is the catch-all above them.

// MEASURE — an in-page expression string. Collects role-based element sets with the rects and flags
// each rule needs. Returns null-safe plain data (returnByValue over CDP).
export const MEASURE = `(() => {
  let __uid0 = 0;
  const vis = el => { const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < 0.05) return false;
    const r = el.getBoundingClientRect(); return r.width > 1 && r.height > 1; };
  const R = el => { const r = el.getBoundingClientRect(); return { l:r.left, t:r.top, r:r.right, b:r.bottom, w:r.width, h:r.height }; };
  const mark = el => { if (!el.__qaId) el.__qaId = 'q' + (++__uid0); return el.__qaId; };
  const topmostAt = (el, x, y) => { const hit = document.elementFromPoint(x, y); return !!(hit && (hit === el || el.contains(hit) || hit.contains(el))); };
  // THINGS A PLAYER CLICKS — every interactive control the game presents, by class, deduped.
  const clickSel = '.apBtn, .btlBtn, .sailCell, .recipeCard, .bkoCard, .apSlider, #flipCoinWrap.active, .recipeList button';
  // vis() already excludes display:none / visibility:hidden / zero-size — so a lobby control that
  // does not exist for this mode (#btnStart is display:none in solo) is never treated as "offered
  // to the player". A gate that fires on something the player cannot see teaches its reader to
  // dismiss it, which is worse than no gate (HARD-WON-LESSONS.md).
  const interactive = [...document.querySelectorAll(clickSel)].filter(vis).map(el => {
    const r = el.getBoundingClientRect(), cx = r.left + r.width/2, cy = r.top + r.height/2;
    const hit = document.elementFromPoint(cx, cy);
    const top = !!(hit && (hit === el || el.contains(hit) || hit.contains(el)));
    // ROUND CONTROLS ARE ROUND. The prompt circles are 66px with border-radius:50%, and a
    // box-vs-box test calls two diagonal neighbours "overlapping" when their corners clip by a few
    // pixels while the circles themselves are comfortably apart. Measured on the phone leg: centres
    // 73.5px apart, diameter 66 — visibly not touching — reported as a pile three times a voyage.
    // A gate that cries wolf teaches its reader to dismiss it, so the shape has to be part of the
    // measurement rather than an assumption.
    const br = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
    const round = br >= Math.min(el.getBoundingClientRect().width, el.getBoundingClientRect().height) / 2 - 1;
    return { id: mark(el), round, chain: (() => { const out = []; let n = el; while (n && n !== document.body) { if (n.__qaId) out.push(n.__qaId); n = n.parentElement; } return out; })(),
      tag: el.className.toString().slice(0,40) || el.id, text: (el.textContent||'').trim().slice(0,24), rect: R(el), topmost: top,
      // WHAT covers it, not just THAT it is covered — a finding you cannot act on is half a finding.
      coveredBy: top ? null : (hit ? ((hit.id ? '#'+hit.id : '') + '.' + String(hit.className||'').trim().split(/\s+/).slice(0,2).join('.') + ' <' + hit.tagName.toLowerCase() + '>').slice(0,60) : 'nothing (outside any element)'),
      disabled: el.disabled || el.classList.contains('apDisabled') || el.getAttribute('aria-disabled') === 'true' }; });
  // THINGS A PLAYER READS — text that must not be clipped or overrun.
  const textSel = '.pname, .apMsg, .pp4Bub:not(.ambient), .prowRecipe, .pp4CerTitle, .coins, .bkoName';
  const text = [...document.querySelectorAll(textSel)].filter(vis).map(el => {
    const inner = el.firstElementChild && getComputedStyle(el).overflow !== 'visible' ? el.firstElementChild : el;
    return { id: mark(el), tag: (el.className||'').toString().slice(0,30), isAsk: el.classList.contains('apMsg'),
      text: (el.textContent||'').trim().slice(0,30), rect: R(el), scrollW: el.scrollWidth, clientW: el.clientWidth,
      // the chain of ids from this node up, so a control INSIDE a text block (or vice versa) is
      // never mistaken for one covering the other
      chain: (() => { const out = []; let n = el; while (n && n !== document.body) { if (n.__qaId) out.push(n.__qaId); n = n.parentElement; } return out; })(),
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
    // A FULL-WIDTH BOTTOM SHEET IS ALLOWED TO FILL ITS BAND; A FLOATING CARD IS NOT. On phone the
    // captains box is pinned edge-to-edge at the foot of the screen and rises to meet the board —
    // playtest 4's design, and the space under its rows is deliberate. Beside the board on desktop
    // it is a floating card, and the same slack is the empty cream tower Wyatt objected to. The
    // discriminator is structural (spans the full width AND sits on the bottom edge), not a name.
    const sheet = rect.w >= innerWidth - 2 && rect.b >= innerHeight - 2;
    return { tag: el.id || el.className.toString().slice(0,30), rect, content: box, backdrop, sheet,
      contentH: box ? box.b - box.t : rect.h, contentW: box ? box.r - box.l : rect.w }; });
  return { iw: innerWidth, ih: innerHeight, interactive, text, panels };
})()`;

// judge a measurement. Returns [{ok, rule, what}] — one entry per check that ran. General rules only.
export function structuralChecks(m) {
  const out = []; const F = (ok, rule, what) => out.push({ ok, rule, what });
  const IB = 2;                                     // sub-pixel tolerance
  const withinVP = r => r.l >= -IB && r.t >= -IB && r.r <= m.iw + IB && r.b <= m.ih + IB;
  const boxOverlap = (a, b, tol = 3) => Math.min(a.r, b.r) - Math.max(a.l, b.l) > tol && Math.min(a.b, b.b) - Math.max(a.t, b.t) > tol;
const overlaps = (a, b, tol = 3) => boxOverlap(a, b, tol);
/* Shape-aware: a circle is a circle. Falls back to boxes whenever either side is rectangular, so
   nothing that used to be caught stops being caught — it only stops reporting two round buttons
   whose CORNERS clip while the buttons themselves are apart. */
const cx = r => r.l + r.w / 2, cy = r => r.t + r.h / 2;
function shapeOverlap(A, B, tol = 3) {
  const a = A.rect, b = B.rect;
  if (A.round && B.round) {
    const ra = Math.min(a.w, a.h) / 2, rb = Math.min(b.w, b.h) / 2;
    return Math.hypot(cx(a) - cx(b), cy(a) - cy(b)) < ra + rb - tol;
  }
  if (A.round !== B.round) {                       // circle vs rectangle: nearest point on the box
    const C = A.round ? a : b, Rr = A.round ? b : a;
    const r = Math.min(C.w, C.h) / 2;
    const px = Math.max(Rr.l, Math.min(cx(C), Rr.r)), py = Math.max(Rr.t, Math.min(cy(C), Rr.b));
    return Math.hypot(cx(C) - px, cy(C) - py) < r - tol;
  }
  return boxOverlap(a, b, tol);
}

  // 1. every clickable control is fully on screen (nothing a player must reach is off the edge)
  const off = m.interactive.filter(e => !e.disabled && !withinVP(e.rect)).map(e => `${e.text || e.tag}`);
  F(off.length === 0, "on-screen", off.length ? `clickable off-screen: ${off.slice(0,6).join(", ")}` : "all clickables on screen");

  // 2. every clickable control is the topmost thing at its own centre (not hidden under something)
  const occ = m.interactive.filter(e => !e.disabled && withinVP(e.rect) && !e.topmost).map(e => `${e.text || e.tag} <- covered by ${e.coveredBy}`);
  F(occ.length === 0, "not-occluded", occ.length ? `clickable covered by something else: ${occ.slice(0,6).join(", ")}` : "all clickables reachable");

  // 3. no two DISTINCT clickable controls overlap (piled buttons, a control on a control)
  const piles = [];
  for (let i = 0; i < m.interactive.length; i++) for (let j = i+1; j < m.interactive.length; j++)
    if (shapeOverlap(m.interactive[i], m.interactive[j])) piles.push(`${m.interactive[i].text||m.interactive[i].tag}/${m.interactive[j].text||m.interactive[j].tag}`);
  F(piles.length === 0, "no-pile", piles.length ? `overlapping controls: ${piles.slice(0,5).join(", ")}` : "no overlapping controls");

  // 4. no readable text is clipped by its own box (name into coin, label cut off)
  const clip = m.text.filter(t => t.innerScrollW > t.clientW + 3).map(t => `"${t.text}" (${t.innerScrollW}>${t.clientW})`);
  F(clip.length === 0, "no-clip", clip.length ? `text clipped by its box: ${clip.slice(0,5).join(", ")}` : "no clipped text");

  // 6. NOTHING MAY COVER A SAIL SQUARE — D-38, Wyatt 2026-08-21: "I think my preference would be to
  //    always keep the prompt and buttons closer to the boat, even if they start to block some of
  //    the board elements. One exception to this rule is for sailing squares, which you have to
  //    click and you cannot click them if they are covered by something."
  //    So covering the BOARD is sanctioned (holding the sea makes prompts transparent, so nothing
  //    is truly lost) and this gate must NOT flag it. What is never acceptable is covering a
  //    control the player has to hit. The sail squares are the case he named, and rules 2 and 3
  //    above already carry the general form for every other control.
  const sail = m.interactive.filter(e => /sailCell/.test(e.tag));
  const others = m.interactive.filter(e => !/sailCell/.test(e.tag));
  const onSail = [];
  for (const cell of sail) {
    if (!cell.topmost && cell.coveredBy) onSail.push(`a sail square <- ${cell.coveredBy}`);
    for (const o of others) if (shapeOverlap(o, cell, 4)) onSail.push(`"${o.text || o.tag}" over a sail square`);
  }
  F(onSail.length === 0, "sail-clickable", onSail.length ? `${onSail.length} sail square(s) covered: ${[...new Set(onSail)].slice(0,4).join(", ")}` : `every sail square clickable (${sail.length})`);

  // 6b. A control covering the QUESTION IT ANSWERS is still a fault — D-38 sanctions covering the
  //     board, not covering the game's own words: hold-the-sea reveals the board beneath a prompt,
  //     it does not reveal text beneath a button. Scoped to the prompt's own message so narration
  //     bubbles over the sea (which D-38 explicitly permits) are left alone.
  const askText = m.text.filter(t => /apMsg/.test(t.tag || "") || t.isAsk);
  const covers = [];
  for (const ctl of m.interactive) for (const t of askText) {
    if (!t.text) continue;
    if (ctl.chain && t.chain && (ctl.chain.includes(t.id) || t.chain.includes(ctl.id))) continue;   // nested — fine
    if (shapeOverlap(ctl, { rect: t.rect, round: false }, 4)) covers.push(`"${ctl.text || ctl.tag}" over "${t.text}"`);
  }
  F(covers.length === 0, "no-cover-ask", covers.length ? `control covering the question it answers: ${covers.slice(0,4).join(", ")}` : "the question is never covered by its own buttons");

  // 5. no content card is stretched far past its content (the empty-tower class). Backdrops exempt.
  const empty = m.panels.filter(p => !p.backdrop && !p.sheet && p.content && p.rect.h > p.contentH + 90).map(p => `${p.tag} (${p.rect.h|0}px box vs ${p.contentH|0}px content)`);
  F(empty.length === 0, "hug-content", empty.length ? `panel stretched empty: ${empty.join(", ")}` : "panels hug their content");
  return out;
}
