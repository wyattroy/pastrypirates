/* THE CHECKS — one definition each, run identically in every mode and at every width.
 *
 * This file exists because the alternative was ten scripts named after ten bugs, which is what got
 * written first and is why 22 fixes shipped with 4 verified. A check that lives in a script named
 * after one bug can only ever answer that bug, in whatever mode that script happened to boot.
 *
 * EVERY CHECK RETURNS ONE OF THREE THINGS, and the third is the important one:
 *   {ok:true}                 the thing held
 *   {ok:false, why}           the thing broke, with what was measured
 *   {skip:"reason"}           NOT APPLICABLE OR NOT REACHED — never silently a pass
 *
 * A check that cannot see its subject must SKIP, never pass. The whole failure this file answers
 * was a green report over a screen nobody had looked at.
 */

/* Every check is `page => expression string`, evaluated in the page and returning JSON. */
export const CHECKS = [
  {
    id: "no-blank-narration",
    what: "a narration box on screen always has text in it",
    expr: `JSON.stringify((()=>{
      const vis=e=>{const r=e.getBoundingClientRect();const s=getComputedStyle(e);
        return r.width>1&&r.height>1&&s.display!=='none'&&s.visibility!=='hidden';};
      const m=[...document.querySelectorAll('#actionPanel .apMsg:not(.fadeOut)')].filter(vis)[0];
      if(!m) return {skip:"no narration box on screen"};
      const t=(m.innerText||'').trim();
      return t ? {ok:true} : {ok:false, why:"a box is painted with no text in it"};
    })())`,
  },
  {
    id: "parens-unbroken",
    what: "a parenthetical never splits across two lines",
    expr: `JSON.stringify((()=>{
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>1&&r.height>1};
      const boxes=[...document.querySelectorAll('#actionPanel .apMsg, .narrBubble')].filter(vis);
      if(!boxes.length) return {skip:"no narration on screen"};
      let pairs=0, split=0, sample=null;
      for(const box of boxes){
        if(!(box.innerText||'').includes('(')) continue;
        const nodes=[];const w=document.createTreeWalker(box,NodeFilter.SHOW_TEXT);
        let n;while(n=w.nextNode())if(n.nodeValue)nodes.push(n);
        const topOf=(nd,o)=>{const rg=document.createRange();rg.setStart(nd,o);
          rg.setEnd(nd,Math.min(o+1,nd.nodeValue.length));
          const r=rg.getBoundingClientRect();return r.height?r.top:null;};
        let open=null;
        for(const nd of nodes){const s=nd.nodeValue;
          for(let i=0;i<s.length;i++){
            if(s[i]==='(')open={nd,i,top:topOf(nd,i)};
            else if(s[i]===')'&&open){pairs++;const ct=topOf(nd,i);
              if(open.top!==null&&ct!==null&&Math.abs(ct-open.top)>2){split++;sample=(box.innerText||'').slice(0,60);}
              open=null;}}}
      }
      if(!pairs) return {skip:"no parentheticals on screen yet"};
      return split ? {ok:false, why:split+" of "+pairs+" split — e.g. "+JSON.stringify(sample)} : {ok:true};
    })())`,
  },
  {
    id: "no-sideways-scroll",
    what: "the page never scrolls sideways at this width",
    expr: `JSON.stringify((()=>{
      const over=document.documentElement.scrollWidth-innerWidth;
      if(over<=1) return {ok:true};
      const worst=[...document.querySelectorAll('*')]
        .map(e=>({t:e.tagName+(e.id?'#'+e.id:'')+(e.className&&typeof e.className==='string'?'.'+e.className.split(' ')[0]:''),
                  r:Math.round(e.getBoundingClientRect().right)}))
        .filter(o=>o.r>innerWidth+1).sort((a,b)=>b.r-a.r).slice(0,3);
      return {ok:false, why:over+"px over; worst: "+worst.map(o=>o.t+"@"+o.r).join(", ")};
    })())`,
  },
  {
    id: "art-not-broken",
    what: "no ingredient renders as a broken-image placeholder",
    expr: `JSON.stringify((()=>{
      const imgs=[...document.querySelectorAll('img')].filter(i=>/assets\\//.test(i.src||''));
      const svg=[...document.querySelectorAll('image')].filter(i=>/assets\\//.test(i.getAttribute('href')||''));
      const total=imgs.length+svg.length;
      if(!total) return {skip:"no art on screen"};
      const dead=imgs.filter(i=>i.complete&&i.naturalWidth===0);
      return dead.length
        ? {ok:false, why:dead.length+" of "+total+" failed to load, e.g. "+(dead[0].src||'').split('/').slice(-2).join('/')}
        : {ok:true};
    })())`,
  },
  {
    id: "actor-matches-turn",
    what: "exactly one captain is lit, and it is the one being asked",
    expr: `JSON.stringify((()=>{
      const rows=[...document.querySelectorAll('[id^=prow]')];
      if(!rows.length) return {skip:"no captains box"};
      const lit=rows.filter(r=>r.classList.contains('activeTurn'));
      if(lit.length>1) return {ok:false, why:lit.length+" captains lit at once"};
      const hd=[...document.querySelectorAll('.bkoHd')].find(e=>e.getBoundingClientRect().width>1);
      if(!hd) return lit.length===1 ? {ok:true} : {skip:"nobody lit and no bench — between beats"};
      // a bench is up: the captain lit must be the one whose bench it is
      const title=(hd.innerText||'').replace(/attempt.*$/s,'').trim();
      const baker=title.split(',')[0].split("'")[0].trim();
      if(!lit.length) return {ok:false, why:"a bench is up for "+JSON.stringify(baker)+" and NO captain is lit"};
      const litName=(lit[0].innerText||'').split(String.fromCharCode(10))[0].trim();
      return litName===baker ? {ok:true}
        : {ok:false, why:"bench is "+JSON.stringify(baker)+" but "+JSON.stringify(litName)+" is lit"};
    })())`,
  },
  {
    id: "stage-controls-glow",
    what: "a stage's own button carries the attention glow",
    expr: `JSON.stringify((()=>{
      const vis=e=>{const r=e.getBoundingClientRect();const s=getComputedStyle(e);
        return r.width>1&&r.height>1&&s.display!=='none'&&s.visibility!=='hidden';};
      const b=[...document.querySelectorAll('#actionPanel .apBtn.ahoyGlow')].filter(vis)[0];
      if(!b) return {skip:"no ceremony button on screen"};
      const a=getComputedStyle(b).animationName;
      return /pp4Glow/.test(a) ? {ok:true} : {ok:false, why:"runs "+JSON.stringify(a)+", not pp4Glow"};
    })())`,
  },
  {
    id: "bakeoff-titled",
    what: "the bake-off card names the captain whose bake it is",
    expr: `JSON.stringify((()=>{
      const hd=[...document.querySelectorAll('.bkoHd')].find(e=>e.getBoundingClientRect().width>1);
      if(!hd) return {skip:"no bench on screen"};
      const t=(hd.innerText||'').replace(/attempt.*$/s,'').trim();
      return /Yer Bake-Off|'s Bake-Off/.test(t) ? {ok:true} : {ok:false, why:"reads "+JSON.stringify(t)};
    })())`,
  },
  {
    id: "watch-again-quiet",
    what: "Watch again does not shout for attention",
    expr: `JSON.stringify((()=>{
      const w=document.getElementById('bkoWatch');
      if(!w) return {skip:"no bench on screen"};
      const a=getComputedStyle(w).animationName;
      return a==='none' ? {ok:true} : {ok:false, why:"runs "+JSON.stringify(a)};
    })())`,
  },
  {
    id: "battle-card-centred",
    what: "a battle card sits centred, not hung off a boat",
    expr: `JSON.stringify((()=>{
      const box=document.getElementById('pp4Prompt');
      if(!box||!box.querySelector('.btl')) return {skip:"no battle card on screen"};
      return box.classList.contains('centered')
        ? {ok:true} : {ok:false, why:"battle card is placed, not centred"};
    })())`,
  },
  {
    id: "stay-square-offered",
    what: "a captain asked to sail is offered the stay square",
    expr: `JSON.stringify((()=>{
      const cells=[...document.querySelectorAll('.sailCell')];
      if(!cells.length) return {skip:"not being asked to sail"};
      const stay=document.querySelectorAll('.pp4StayCell').length;
      return stay ? {ok:true} : {ok:false, why:cells.length+" sail squares and NO stay square"};
    })())`,
  },
];
