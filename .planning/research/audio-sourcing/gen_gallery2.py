#!/usr/bin/env python3
"""Round-2 audition page. Same visual system as round 1; different storage key so his round-1
picks are never overwritten."""
import json, os, html

WS = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(WS, "gallery2.json")))
SLOTS = D["slots"]

# His round-1 keeps, carried forward read-only so the whole picture stays in one place.
LOCKED = [
 ("Cannon — the opening broadside", "explosion_med_long_tail_01.wav", "Sonniss"),
 ("Victory", "EFX EXT GROUP Battle Celebration 02 A.wav", "Sonniss"),
 ("Time running low — the warning", "Beep,Clean,Pure,Simple,High,x4,Fast.wav", "Sonniss"),
 ("Time up — the buzzer", "Beep,Buzz,Clean,Tight,Mid,x3.wav", "Sonniss"),
 ("Wind — the compass turns", "Designed Fire - Winds - Binaural, swoosh, waves 02.wav", "Sonniss"),
 ("The sea — ambient bed", "Ocean Waves 2017 Kauai Night Waves.WAV", "Sonniss"),
 ("Bake-off — the covers come down", "impactWood_light_000.ogg + bookClose.ogg", "Kenney"),
 ("Bake-off — correct, rising ladder", "jingles-pizzicato_02.ogg", "Kenney"),
 ("The ovens fire up", "sm-fire-firewood-small-03-DPAmono.wav", "Sonniss"),
 ("Hailing the table", "EFX EXT GROUP Unrest Murmur 01 A .wav", "Sonniss"),
 ("A deal struck", "Coins_Hand_Jingle_Movement_Takes_6.wav", "Sonniss"),
 ("The anchor bites", "Heavy_Chain-Foley_On_Wood.wav", "Sonniss"),
 ("The storm shoves you", "Thunder_Boom_005 + Thunder_Crack_016", "Sonniss"),
 ("The coin lands", "chipLay1.ogg", "Kenney"),
 ("Interface tap", "click_001.ogg", "Kenney"),
 ("Something in the water", "Bluezone_BC0256_water_splash_008.wav", "Sonniss"),
 ("Blocked", "impactWood_heavy_000.ogg", "Kenney"),
 ("Rigging creak", "BOAT_078 Pulleys + Wood Door Creaks", "Sonniss"),
]

n_c = sum(len(s["cands"]) for s in SLOTS)
n_cc0 = sum(1 for s in SLOTS for c in s["cands"] if c["lic"] == "CC0")


def bars(env):
    return "".join('<i style="height:%d%%"></i>' % max(3, v) for v in env) if env else ""


def card(sid, i, c):
    lic = "cc0" if c["lic"] == "CC0" else "rf"
    licl = {"CC0": "CC0", "Royalty-free (games)": "Royalty-free"}.get(c["lic"], c["lic"])
    src = c["src"]
    true_l = ("%.1f LUFS" % c["lufs"]) if c["lufs"] is not None else "—"
    return f'''<article class="cand" data-k="{sid}:{i}">
  <button class="wave" type="button" aria-label="Play {html.escape(c['name'])}">
    <span class="bars">{bars(c['env'])}</span><span class="play">▶</span></button>
  <div class="meta">
    <p class="fn" title="{html.escape(c['name'])}">{html.escape(c['name'])}</p>
    <p class="lib">{html.escape(src)} · {html.escape(c['lib'][:40])}</p>
    <p class="nums"><span>{c['dur']}s</span><span>{true_l}</span><span class="lic {lic}">{licl}</span></p>
  </div>
  <div class="verdict">
    <button class="keep" type="button" data-v="keep">Keep</button>
    <button class="rej" type="button" data-v="reject">Reject</button></div>
  <audio preload="none" src="data:audio/mpeg;base64,{c['audio']}"></audio>
</article>'''


def slot_html(s):
    said = f'<p class="said">{html.escape(s["said"])}</p>' if s.get("said") else ""
    gap = f'<p class="gap"><b>Still a gap.</b> {html.escape(s["gap"])}</p>' if s["gap"] else ""
    cards = "".join(card(s["id"], i, c) for i, c in enumerate(s["cands"]))
    return f'''<section class="slot">
  <header class="sh"><h3>{html.escape(s['title'])}</h3>
    <span class="len">{html.escape(s['length'])}</span>
    <span class="cnt" data-cnt="{s['id']}"></span></header>
  <p class="why">{html.escape(s['why'])}</p>
  {said}{gap}<div class="cands">{cards}</div>
</section>'''


locked_rows = "".join(
    f'<tr><td>{html.escape(m)}</td><td class="f">{html.escape(f)}</td><td class="s">{html.escape(s)}</td></tr>'
    for m, f, s in LOCKED)

CSS = open(os.path.join(WS, "gallery.html"), encoding="utf-8").read()
CSS = CSS[CSS.index("<style>"):CSS.index("</style>") + 8]

PAGE = f'''<title>Pastry Pirates — Sound Audition, Round 2</title>
{CSS}
<style>
.locked{{width:100%;border-collapse:collapse;font-family:var(--mono);font-size:.72rem;margin-top:.8rem}}
.locked td{{padding:.34rem .6rem;border-bottom:1px solid var(--rule);vertical-align:top}}
.locked td.f{{color:var(--text3)}}
.locked td.s{{color:var(--text3);text-align:right;white-space:nowrap}}
.struck{{display:flex;gap:.6rem;flex-wrap:wrap;margin-top:.7rem}}
.struck span{{font-family:var(--mono);font-size:.68rem;text-decoration:line-through;
 color:var(--text3);border:1px solid var(--rule);padding:.2em .6em;border-radius:2px}}
details.lockedwrap{{background:var(--paper2);border:1px solid var(--rule);padding:1rem 1.2rem;margin-top:1.4rem}}
details.lockedwrap summary{{cursor:pointer;font-weight:600;font-size:1rem}}
</style>

<div class="wrap">
<header class="mast">
  <p class="eyebrow">Round 2 · the eight you sent back · {n_c} new candidates</p>
  <h1>Same moments, hunted in the game's own world this time.</h1>
  <p class="stand">You rejected every option in eight slots. Fair — I gave you game audio where the
    game wants a ship making the noise. These come from a pirate battle library, a dedicated
    seagull library, a macaw, a galley and a drum kit.</p>
</header>

<div class="stats">
  <div class="stat"><b>8</b><span>Slots re-searched</span></div>
  <div class="stat"><b>{n_c}</b><span>New candidates</span></div>
  <div class="stat"><b>{n_cc0}</b><span>CC0 — no strings</span></div>
  <div class="stat"><b>2</b><span>Slots struck on your word</span></div>
  <div class="stat"><b>18</b><span>Already settled in round 1</span></div>
</div>

<div class="note">
  <h3>What changed since round 1</h3>
  <p><b>A new source.</b> Round 1 only had Kenney and the Sonniss mirror — and that mirror turns out
  to carry just two to five files per library, not the whole thing, which is why the parrot was thin
  and there was no gull at all. I added <b>OpenGameArt</b>, which is fully CC0 and gave 637 more
  files, including a pack called <b>battle-at-sea</b> — actual cannon fire and cannonballs striking
  hulls — and a library of nothing but seagulls.</p>
  <p><b>Licence checked per pack, not per filter.</b> Two OpenGameArt packs were dropped whole
  because they list CC0 <em>alongside</em> CC-BY-SA or GPL, and there is no way to tell which file
  carries which. Guessing wrong on a game that ships on a real domain is not a small mistake.</p>
  <p><b>Same rules as before:</b> I cannot hear any of this, everything is level-matched to within
  about a decibel so you are judging the sound and not the mastering, and previews are trimmed to
  each file's loudest moment.</p>
  <div class="struck"><span>The ovens go cold</span><span>Paying the kitchen hand</span></div>
</div>

<div class="bar">
  <span class="tally" id="tally"></span><span class="sp"></span>
  <button type="button" id="clear">Clear all</button>
  <button type="button" id="export">Export picks</button>
</div>

<div class="tier">
  <div class="tierhead"><span class="tnum">Round 2</span><h2>The eight sent back</h2>
    <span class="tmeta">{len(SLOTS)} slots</span></div>
  {''.join(slot_html(s) for s in SLOTS)}
</div>

<details class="lockedwrap">
  <summary>Already settled in round 1 — 18 moments, for reference</summary>
  <table class="locked">{locked_rows}</table>
</details>

<footer>
  Pastry Pirates sound audition, round 2 · 19 August 2026<br>
  Sources: OpenGameArt (CC0) · Kenney (CC0) · Sonniss #GameAudioGDC (royalty-free for game use)<br>
  Level-matched to −20 dBFS RMS, peak-limited, mono 32kHz — audition quality only
</footer>
</div>

<dialog id="dlg">
  <h3>Your round-2 picks</h3>
  <textarea id="out" readonly></textarea>
  <div class="row"><button type="button" id="copy">Copy</button><button type="button" id="close">Close</button></div>
</dialog>

<script>
(function(){{
  var KEY = "pp_sfx_picks_r2";     // separate key — round 1 picks are never touched
  var picks = {{}};
  try {{ picks = JSON.parse(localStorage.getItem(KEY) || "{{}}"); }} catch(e) {{ picks = {{}}; }}
  var cards = Array.prototype.slice.call(document.querySelectorAll(".cand"));
  var cur = null;

  function save(){{ try {{ localStorage.setItem(KEY, JSON.stringify(picks)); }} catch(e) {{}} }}

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
    var audio = c.querySelector("audio"), bars = c.querySelectorAll(".bars i");
    c.querySelector(".wave").addEventListener("click", function(){{
      if (cur === c) {{ stop(); return; }}
      stop(); cur = c; c.classList.add("playing");
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
    if (!confirm("Clear every round-2 keep and reject?")) return;
    picks = {{}}; save(); paint();
  }});

  var DATA = {json.dumps({s["id"]: {"title": s["title"], "tier": s["tier"],
      "cands": [{"name": c["name"], "lib": c["lib"], "src": c["src"], "lic": c["lic"]}
                for c in s["cands"]]} for s in SLOTS})};

  document.getElementById("export").addEventListener("click", function(){{
    var out = {{ round: 2, generated: new Date().toISOString(),
                kept: [], rejected: [], still_undecided: [] }};
    Object.keys(DATA).forEach(function(sid){{
      var slot = DATA[sid], any = false;
      slot.cands.forEach(function(c, i){{
        var v = picks[sid + ":" + i];
        var row = {{ slot: sid, moment: slot.title, tier: slot.tier, file: c.name,
                    library: c.lib, source: c.src, licence: c.lic }};
        if (v === "keep") {{ out.kept.push(row); any = true; }}
        else if (v === "reject") out.rejected.push(row);
      }});
      if (!any) out.still_undecided.push({{ slot: sid, moment: slot.title }});
    }});
    document.getElementById("out").value = JSON.stringify(out, null, 2);
    document.getElementById("dlg").showModal();
  }});
  document.getElementById("copy").addEventListener("click", function(){{
    var t = document.getElementById("out"); t.select();
    try {{ document.execCommand("copy"); this.textContent = "Copied"; }} catch(e) {{}}
    var self = this; setTimeout(function(){{ self.textContent = "Copy"; }}, 1400);
  }});
  document.getElementById("close").addEventListener("click", function(){{
    document.getElementById("dlg").close();
  }});
  document.addEventListener("keydown", function(e){{ if (e.key === "Escape") stop(); }});
  paint();
}})();
</script>
'''

open(os.path.join(WS, "gallery2.html"), "w").write(PAGE)
print("wrote gallery2.html  %.2f MB" % (len(PAGE) / 1048576))
