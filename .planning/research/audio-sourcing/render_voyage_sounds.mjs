// THE SOUNDS OF THE VOYAGE HE PICKED, RENDERED FROM THE PAGE HE PICKED THEM ON (2026-09-14).
// sounds-of-the-voyage.html is the recipe: this opens it in headless Chrome, renders each picked candidate offline with that
// page's own code at the level he heard it (the page's measured candidate gain x its default 70% volume), and writes a WAV
// per stem. ffmpeg makes the mp3s. His notes are already in the page's recipes: the card swish has no thump, and the marimba
// sits two octaves down "so they sound more like big crates".
//   node .planning/research/audio-sourcing/render_voyage_sounds.mjs
//   then: ffmpeg -y -i <stem>.wav -ac 1 -ar 48000 -c:a libmp3lame -b:a 96k sfx/<stem>.mp3   (the script runs it)
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "../../..");
const { launch, attach, killAll, sleep } = await import(pathToFileURL(path.join(REPO, "scripts/mp_rig.mjs")).href);
const PAGE_VOLUME = 0.7;           // the page's own default volume slider — what he listened at
export const MARIMBA_SLOT_S = 0.6, MARIMBA_LEAD_S = 0.04, MARIMBA_SLOTS = 8;
/* stem -> [moment, candidate, how to play it, seconds]. The marimba is ONE FILE OF SLOTS like the cork pop: slot k is the k-th
   lid of a sweep, climbing the page's pentatonic scale, each starting MARIMBA_LEAD_S into its slot so an mp3 decoder's
   priming delay can never clip its attack. Eight slots, more than any bench has crates. */
const STEMS = {
  "card-swish":    ["cards", "a", "c.sounds.whoosh(a,o,0)", 0.45],
  "abacus-click":  ["tick", "b", "c.sounds.tick(a,o,0,0,1)", 0.12],
  "crate-marimba": ["lids", "b", `for(let k=0;k<${MARIMBA_SLOTS};k++) c.sounds.lid(a,o,k*${MARIMBA_SLOT_S}+${MARIMBA_LEAD_S},k)`, MARIMBA_SLOTS * MARIMBA_SLOT_S],
  "crate-chime":   ["verdict", "a", "c.sounds.right(a,o,0)", 0.9],
  "crate-squawk":  ["verdict", "b", "c.sounds.wrong(a,o,0)", 0.5],   // his 2026-09-14 change: the wrong crate squawks
  "award-whoosh":  ["deal", "b", "c.sounds.deal(a,o,0,0)", 0.45],
};
const PROFILE = path.join(process.env.TMPDIR || "/tmp", "pp-render-voyage-sounds");
launch(9903, PROFILE);
const C = await attach(9903);
const out = path.join(HERE, "voyage-sounds-wav");
fs.mkdirSync(out, { recursive: true });
try {
  await C.send("Page.navigate", { url: pathToFileURL(path.join(HERE, "sounds-of-the-voyage.html")).href }); await sleep(2500);
  const only = process.argv.slice(2);   // name stems to render just those
  for (const [stem, [mid, cid, call, secs]] of Object.entries(STEMS)) {
    if (only.length && !only.includes(stem)) continue;
    const b64 = await C.ev(`(async()=>{
      const m=MOMENTS.find(x=>x.id===${JSON.stringify(mid)}), c=m.cands.find(x=>x.id===${JSON.stringify(cid)}), sr=48000;
      const a=new OfflineAudioContext(1,Math.ceil(sr*${secs}),sr), o=a.createGain(); o.gain.value=c.gain*${PAGE_VOLUME}; o.connect(a.destination);
      ${call};
      const d=(await a.startRendering()).getChannelData(0), bytes=new Uint8Array(d.length*2);
      for(let i=0;i<d.length;i++){ const v=Math.max(-32768,Math.min(32767,Math.round(d[i]*32767))); bytes[2*i]=v&255; bytes[2*i+1]=(v>>8)&255; }
      let s=""; for(let i=0;i<bytes.length;i+=8192) s+=String.fromCharCode.apply(null,bytes.subarray(i,i+8192)); return btoa(s); })()`);
    const pcm = Buffer.from(b64, "base64"), wav = Buffer.alloc(44);
    wav.write("RIFF", 0); wav.writeUInt32LE(36 + pcm.length, 4); wav.write("WAVE", 8); wav.write("fmt ", 12); wav.writeUInt32LE(16, 16);
    wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(48000, 24); wav.writeUInt32LE(96000, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
    wav.write("data", 36); wav.writeUInt32LE(pcm.length, 40);
    const wf = path.join(out, stem + ".wav");
    fs.writeFileSync(wf, Buffer.concat([wav, pcm]));
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", wf, "-ac", "1", "-ar", "48000", "-c:a", "libmp3lame", "-b:a", "96k", path.join(REPO, "sfx", stem + ".mp3")]);
    console.log(`rendered ${stem} (${secs}s) from ${mid}/${cid}`);
  }
} finally { await killAll(); }
