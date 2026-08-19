#!/usr/bin/env python3
"""Render gallery.json into a self-contained audition page."""
import json, os, html

WS = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(WS, "gallery.json")))
SLOTS = D["slots"]

TIER_NAME = {1: "Must have", 2: "Nice to have", 3: "Lower priority"}
TIER_NOTE = {
 1: "The game is wrong without these. Seven of the nine are moments you named yourself.",
 2: "Where the game gets its character — most of it the bake-off, which is currently silent end to end.",
 3: "Polish. Real, but none of it changes how the game feels the way the tiers above do.",
}

n_c = sum(len(s["cands"]) for s in SLOTS)
n_cc0 = sum(1 for s in SLOTS for c in s["cands"] if c["lic"] == "CC0")
n_rf = n_c - n_cc0
n_gap = sum(1 for s in SLOTS if s["gap"] or not s["cands"])


def bars(env):
    if not env:
        return ""
    return "".join('<i style="height:%d%%"></i>' % max(3, v) for v in env)


def card(slot, i, c):
    lic = "cc0" if c["lic"] == "CC0" else "rf"
    licl = "CC0" if c["lic"] == "CC0" else "Royalty-free"
    true_l = ("%.1f LUFS" % c["lufs"]) if c["lufs"] is not None else "—"
    return f'''<article class="cand" data-k="{slot['id']}:{i}">
  <button class="wave" type="button" aria-label="Play {html.escape(c['name'])}">
    <span class="bars">{bars(c['env'])}</span><span class="play">▶</span>
  </button>
  <div class="meta">
    <p class="fn" title="{html.escape(c['name'])}">{html.escape(c['name'])}</p>
    <p class="lib">{html.escape(c['lib'][:52])}</p>
    <p class="nums"><span>{c['dur']}s source</span><span>{true_l}</span><span class="lic {lic}">{licl}</span></p>
  </div>
  <div class="verdict">
    <button class="keep" type="button" data-v="keep">Keep</button>
    <button class="rej" type="button" data-v="reject">Reject</button>
  </div>
  <audio preload="none" src="data:audio/mpeg;base64,{c['audio']}"></audio>
</article>'''


def slot_html(s):
    said = f'<p class="said">{html.escape(s["said"])}</p>' if s.get("said") else ""
    gap = f'<p class="gap"><b>Gap.</b> {html.escape(s["gap"])}</p>' if s["gap"] else ""
    if s["cands"]:
        body = '<div class="cands">' + "".join(card(s, i, c) for i, c in enumerate(s["cands"])) + "</div>"
    else:
        body = '<p class="empty">Nothing usable found in any CC0 library. This one goes to ElevenLabs.</p>'
    return f'''<section class="slot" id="{s['id']}" data-slot="{s['id']}">
  <header class="sh">
    <h3>{html.escape(s['title'])}</h3>
    <span class="len">{html.escape(s['length'])}</span>
    <span class="cnt" data-cnt="{s['id']}"></span>
  </header>
  <p class="why">{html.escape(s['why'])}</p>
  {said}{gap}{body}
</section>'''


tiers = ""
for t in (1, 2, 3):
    ss = [s for s in SLOTS if s["tier"] == t]
    tiers += f'''<div class="tier">
  <div class="tierhead"><span class="tnum">Tier {t}</span><h2>{TIER_NAME[t]}</h2>
    <span class="tmeta">{len(ss)} slots</span></div>
  <p class="tnote">{TIER_NOTE[t]}</p>
  {''.join(slot_html(s) for s in ss)}
</div>'''

PAGE = f'''<title>Pastry Pirates — Sound Audition</title>
<style>
:root{{
 --paper:#E9EDEC;--paper2:#F5F7F6;--card:#fff;--rule:#C3CDCB;
 --text:#1B2A31;--text2:#4B5F66;--text3:#6E838A;
 --brass:#A9752A;--verd:#3D8177;--ember:#B2452F;--slate:#6E838A;
 --serif:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;
 --mono:ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,monospace;
}}
@media (prefers-color-scheme:dark){{:root{{
 --paper:#0E1A22;--paper2:#132029;--card:#16242D;--rule:#263A43;
 --text:#DCE5E4;--text2:#9DB0B4;--text3:#75898F;
 --brass:#D9A253;--verd:#5FB3A5;--ember:#D96A50;--slate:#7E939A;}}}}
:root[data-theme=dark]{{--paper:#0E1A22;--paper2:#132029;--card:#16242D;--rule:#263A43;
 --text:#DCE5E4;--text2:#9DB0B4;--text3:#75898F;--brass:#D9A253;--verd:#5FB3A5;--ember:#D96A50;--slate:#7E939A;}}
:root[data-theme=light]{{--paper:#E9EDEC;--paper2:#F5F7F6;--card:#fff;--rule:#C3CDCB;
 --text:#1B2A31;--text2:#4B5F66;--text3:#6E838A;--brass:#A9752A;--verd:#3D8177;--ember:#B2452F;--slate:#6E838A;}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--paper);color:var(--text);font-family:var(--serif);
 font-size:16px;line-height:1.6}}
.wrap{{max-width:1400px;margin:0 auto;padding:0 2rem 7rem}}
.mast{{padding:3.5rem 0 1.75rem;border-bottom:2px solid var(--text)}}
.eyebrow{{font-family:var(--mono);font-size:.68rem;letter-spacing:.16em;text-transform:uppercase;
 color:var(--brass);margin:0 0 1rem}}
h1{{font-size:clamp(2rem,4.2vw,3.1rem);line-height:1.05;letter-spacing:-.02em;font-weight:600;
 margin:0 0 .9rem;max-width:22ch}}
.stand{{color:var(--text2);margin:0;max-width:62ch;font-size:1.05rem}}
.stats{{display:grid;grid-template-columns:repeat(auto-fit,minmax(9rem,1fr));gap:1px;
 background:var(--rule);border:1px solid var(--rule);margin:2rem 0 0}}
.stat{{background:var(--paper);padding:.9rem 1rem}}
.stat b{{display:block;font-family:var(--mono);font-size:1.7rem;font-weight:500;letter-spacing:-.03em;
 font-variant-numeric:tabular-nums;line-height:1.1}}
.stat span{{display:block;font-family:var(--mono);font-size:.63rem;letter-spacing:.1em;
 text-transform:uppercase;color:var(--text3);margin-top:.35rem;line-height:1.4}}
.note{{background:var(--paper2);border:1px solid var(--rule);border-top:3px solid var(--ember);
 padding:1.15rem 1.3rem;margin:2rem 0 0}}
.note h3{{font-size:1rem;margin:0 0 .45rem;font-weight:600}}
.note p{{margin:0 0 .5rem;color:var(--text2);font-size:.95rem;max-width:78ch}}
.note p:last-child{{margin:0}}
.bar{{position:sticky;top:0;z-index:40;background:var(--paper);border-bottom:1px solid var(--rule);
 display:flex;align-items:center;gap:1rem;padding:.7rem 0;margin-top:2rem;flex-wrap:wrap}}
.bar .tally{{font-family:var(--mono);font-size:.72rem;letter-spacing:.05em;color:var(--text2)}}
.bar .tally b{{color:var(--verd)}}
.bar button{{font-family:var(--mono);font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;
 padding:.42em .9em;border:1px solid var(--brass);color:var(--brass);background:none;
 border-radius:2px;cursor:pointer}}
.bar button:hover{{background:var(--brass);color:var(--paper)}}
.bar .sp{{margin-left:auto}}
.tier{{padding:3rem 0 0}}
.tierhead{{display:flex;align-items:baseline;gap:.85rem;border-bottom:2px solid var(--text);
 padding-bottom:.5rem;margin-bottom:.5rem}}
.tnum{{font-family:var(--mono);font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;color:var(--brass)}}
.tierhead h2{{font-size:1.6rem;margin:0;font-weight:600;letter-spacing:-.015em}}
.tmeta{{margin-left:auto;font-family:var(--mono);font-size:.68rem;color:var(--text3);
 letter-spacing:.1em;text-transform:uppercase}}
.tnote{{color:var(--text2);margin:0 0 1.6rem;max-width:70ch;font-size:.97rem}}
.slot{{background:var(--card);border:1px solid var(--rule);padding:1.3rem 1.4rem 1.4rem;margin-bottom:1rem}}
.sh{{display:flex;align-items:baseline;gap:.85rem;flex-wrap:wrap;margin-bottom:.5rem}}
.sh h3{{font-size:1.12rem;margin:0;font-weight:600;letter-spacing:-.01em}}
.len{{font-family:var(--mono);font-size:.66rem;color:var(--text3);border:1px solid var(--rule);
 padding:.16em .5em;border-radius:2px;white-space:nowrap}}
.cnt{{margin-left:auto;font-family:var(--mono);font-size:.66rem;letter-spacing:.09em;
 text-transform:uppercase;color:var(--text3)}}
.cnt.done{{color:var(--verd)}}
.why{{color:var(--text2);margin:0 0 .7rem;max-width:80ch;font-size:.95rem}}
.said{{font-style:italic;color:var(--text3);border-left:2px solid var(--rule);padding-left:.75rem;
 margin:0 0 .8rem;font-size:.92rem;max-width:70ch}}
.gap{{background:var(--paper2);border-left:3px solid var(--ember);padding:.6rem .8rem;margin:0 0 .9rem;
 font-size:.9rem;color:var(--text2);max-width:80ch}}
.gap b{{color:var(--ember)}}
.empty{{font-family:var(--mono);font-size:.8rem;color:var(--ember);margin:.4rem 0 0}}
.cands{{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:.8rem;margin-top:.9rem}}
.cand{{border:1px solid var(--rule);background:var(--paper2);padding:.7rem .8rem .75rem;
 display:flex;flex-direction:column;gap:.55rem;transition:border-color .15s,opacity .15s}}
.cand.keep{{border-color:var(--verd);border-width:2px;padding:calc(.7rem - 1px) calc(.8rem - 1px)}}
.cand.reject{{opacity:.36}}
.wave{{position:relative;display:block;width:100%;height:56px;background:var(--card);
 border:1px solid var(--rule);border-radius:2px;cursor:pointer;padding:0 4px;overflow:hidden}}
.wave:focus-visible{{outline:2px solid var(--brass);outline-offset:2px}}
.bars{{position:absolute;inset:0;display:flex;align-items:center;gap:1px;padding:0 4px}}
.bars i{{flex:1;background:var(--slate);border-radius:.5px;min-height:2px;transition:background .1s}}
.cand.playing .bars i.on{{background:var(--brass)}}
.play{{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
 font-size:1.15rem;color:var(--text);text-shadow:0 0 8px var(--card),0 0 8px var(--card);
 opacity:.82;pointer-events:none}}
.cand.playing .play{{opacity:0}}
.meta{{display:flex;flex-direction:column;gap:.1rem;min-width:0}}
.fn{{font-family:var(--mono);font-size:.68rem;margin:0;color:var(--text);white-space:nowrap;
 overflow:hidden;text-overflow:ellipsis}}
.lib{{font-family:var(--mono);font-size:.62rem;margin:0;color:var(--text3);white-space:nowrap;
 overflow:hidden;text-overflow:ellipsis}}
.nums{{display:flex;gap:.5rem;flex-wrap:wrap;margin:.25rem 0 0;font-family:var(--mono);
 font-size:.6rem;color:var(--text3);font-variant-numeric:tabular-nums;align-items:center}}
.lic{{border:1px solid;padding:.1em .4em;border-radius:2px;letter-spacing:.05em}}
.lic.cc0{{color:var(--verd);border-color:var(--verd)}}
.lic.rf{{color:var(--brass);border-color:var(--brass)}}
.verdict{{display:flex;gap:.4rem;margin-top:auto}}
.verdict button{{flex:1;font-family:var(--mono);font-size:.63rem;letter-spacing:.08em;
 text-transform:uppercase;padding:.4em 0;border:1px solid var(--rule);background:none;
 color:var(--text3);border-radius:2px;cursor:pointer}}
.verdict button:hover{{color:var(--text)}}
.cand.keep .keep{{background:var(--verd);border-color:var(--verd);color:#fff}}
.cand.reject .rej{{background:var(--ember);border-color:var(--ember);color:#fff}}
dialog{{border:1px solid var(--rule);background:var(--card);color:var(--text);max-width:660px;
 width:92%;padding:1.4rem}}
dialog::backdrop{{background:rgba(0,0,0,.55)}}
dialog h3{{margin:0 0 .6rem;font-size:1.1rem}}
dialog textarea{{width:100%;height:340px;font-family:var(--mono);font-size:.7rem;
 background:var(--paper2);color:var(--text);border:1px solid var(--rule);padding:.6rem;resize:vertical}}
dialog .row{{display:flex;gap:.5rem;margin-top:.7rem}}
dialog button{{font-family:var(--mono);font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;
 padding:.45em 1em;border:1px solid var(--brass);color:var(--brass);background:none;cursor:pointer}}
footer{{margin-top:4rem;padding-top:1.4rem;border-top:1px solid var(--rule);font-family:var(--mono);
 font-size:.68rem;line-height:1.8;color:var(--text3)}}
@media (prefers-reduced-motion:reduce){{*{{transition:none!important}}}}
</style>

<div class="wrap">
<header class="mast">
  <p class="eyebrow">Sound audition · {n_c} candidates · 19 August 2026</p>
  <h1>Every sound Pastry Pirates needs, and the free ones I could find for it.</h1>
  <p class="stand">Play, keep, reject. Your picks are saved in this browser as you go — hit
    Export at any point to get the list back out.</p>
</header>

<div class="stats">
  <div class="stat"><b>{len(SLOTS)}</b><span>Moments needing sound</span></div>
  <div class="stat"><b>{n_c}</b><span>Candidates found</span></div>
  <div class="stat"><b>{n_cc0}</b><span>CC0 — no strings</span></div>
  <div class="stat"><b>{n_rf}</b><span>Royalty-free for games</span></div>
  <div class="stat"><b>{n_gap}</b><span>Slots I'd send to ElevenLabs</span></div>
</div>

<div class="note">
  <h3>Read this before you start</h3>
  <p><b>I cannot hear any of these.</b> I found them, measured them and levelled them — I have not
  judged them, because I have no way to. Every "gap" flag below is based on what the file
  <em>is</em>, never on how it sounds. The ears are yours.</p>
  <p><b>Everything is level-matched to the same loudness</b> (within about a decibel), so you are
  choosing a sound rather than whichever library mastered loudest. The real measured loudness of
  each source is printed on its card — that is the number that matters when it ships, not what you
  are hearing now.</p>
  <p><b>Previews are trimmed to the loudest moment</b> of each file — several of these are long
  field recordings that open with a minute of nothing. One-shots run 2.5s, ambient beds 6s.
  <b>Licence:</b> green is CC0 (public domain, no conditions). Amber is the Sonniss GDC bundle —
  free for commercial game use, no attribution, but you may not resell the raw files.</p>
</div>

<div class="bar">
  <span class="tally" id="tally"></span>
  <span class="sp"></span>
  <button type="button" id="clear">Clear all</button>
  <button type="button" id="export">Export picks</button>
</div>

{tiers}

<footer>
  Pastry Pirates sound audition · built 19 August 2026<br>
  Sources: Kenney (CC0) · Sonniss #GameAudioGDC bundles (royalty-free for game use), via gamesounds.xyz<br>
  Previews level-matched to −20 dBFS RMS, peak-limited, mono 32kHz — audition quality only, not the shipping master
</footer>
</div>

<dialog id="dlg">
  <h3>Your picks</h3>
  <textarea id="out" readonly></textarea>
  <div class="row"><button type="button" id="copy">Copy</button><button type="button" id="close">Close</button></div>
</dialog>

<script>
(function(){{
  var KEY = "pp_sfx_picks_v1";
  var picks = {{}};
  try {{ picks = JSON.parse(localStorage.getItem(KEY) || "{{}}"); }} catch(e) {{ picks = {{}}; }}

  var cards = Array.prototype.slice.call(document.querySelectorAll(".cand"));
  var cur = null;

  function save(){{
    try {{ localStorage.setItem(KEY, JSON.stringify(picks)); }} catch(e) {{}}
  }}

  function paint(){{
    cards.forEach(function(c){{
      var v = picks[c.dataset.k];
      c.classList.toggle("keep", v === "keep");
      c.classList.toggle("reject", v === "reject");
    }});
    var kept = 0, decided = 0;
    for (var k in picks) {{ decided++; if (picks[k] === "keep") kept++; }}
    document.getElementById("tally").innerHTML =
      "<b>" + kept + " kept</b> · " + decided + " decided of {n_c}";
    document.querySelectorAll("[data-cnt]").forEach(function(el){{
      var id = el.getAttribute("data-cnt"), n = 0;
      for (var k in picks) if (k.indexOf(id + ":") === 0 && picks[k] === "keep") n++;
      el.textContent = n ? n + " kept" : "";
      el.classList.toggle("done", n > 0);
    }});
  }}

  function stop(){{
    if (!cur) return;
    var a = cur.querySelector("audio");
    a.pause(); a.currentTime = 0;
    cur.classList.remove("playing");
    cur.querySelectorAll(".bars i").forEach(function(b){{ b.classList.remove("on"); }});
    cur = null;
  }}

  cards.forEach(function(c){{
    var audio = c.querySelector("audio");
    var bars  = c.querySelectorAll(".bars i");

    c.querySelector(".wave").addEventListener("click", function(){{
      if (cur === c) {{ stop(); return; }}
      stop();
      cur = c; c.classList.add("playing");
      audio.currentTime = 0;
      audio.play().catch(function(){{ stop(); }});
    }});

    audio.addEventListener("timeupdate", function(){{
      if (cur !== c || !audio.duration) return;
      var upto = Math.floor(audio.currentTime / audio.duration * bars.length);
      for (var i = 0; i < bars.length; i++) bars[i].classList.toggle("on", i <= upto);
    }});
    audio.addEventListener("ended", stop);

    c.querySelectorAll(".verdict button").forEach(function(b){{
      b.addEventListener("click", function(){{
        var k = c.dataset.k, v = b.dataset.v;
        if (picks[k] === v) delete picks[k]; else picks[k] = v;
        save(); paint();
      }});
    }});
  }});

  document.getElementById("clear").addEventListener("click", function(){{
    if (!confirm("Clear every keep and reject?")) return;
    picks = {{}}; save(); paint();
  }});

  var DATA = {json.dumps({s["id"]: {"title": s["title"], "tier": s["tier"],
                                     "cands": [{"name": c["name"], "lib": c["lib"],
                                                "src": c["src"], "lic": c["lic"]}
                                               for c in s["cands"]]} for s in SLOTS})};

  document.getElementById("export").addEventListener("click", function(){{
    var out = {{ generated: new Date().toISOString(), kept: [], rejected: [], undecided_slots: [] }};
    Object.keys(DATA).forEach(function(sid){{
      var slot = DATA[sid], anyKeep = false;
      slot.cands.forEach(function(c, i){{
        var v = picks[sid + ":" + i];
        var row = {{ slot: sid, moment: slot.title, tier: slot.tier,
                    file: c.name, library: c.lib, source: c.src, licence: c.lic }};
        if (v === "keep") {{ out.kept.push(row); anyKeep = true; }}
        else if (v === "reject") out.rejected.push(row);
      }});
      if (!anyKeep) out.undecided_slots.push({{ slot: sid, moment: slot.title, tier: slot.tier }});
    }});
    document.getElementById("out").value = JSON.stringify(out, null, 2);
    document.getElementById("dlg").showModal();
  }});

  document.getElementById("copy").addEventListener("click", function(){{
    var t = document.getElementById("out");
    t.select();
    try {{ document.execCommand("copy"); this.textContent = "Copied"; }} catch(e) {{}}
    var self = this;
    setTimeout(function(){{ self.textContent = "Copy"; }}, 1400);
  }});
  document.getElementById("close").addEventListener("click", function(){{
    document.getElementById("dlg").close();
  }});

  document.addEventListener("keydown", function(e){{ if (e.key === "Escape") stop(); }});
  paint();
}})();
</script>
'''

open(os.path.join(WS, "gallery.html"), "w").write(PAGE)
print("wrote gallery.html  %.1f MB" % (len(PAGE) / 1048576))
