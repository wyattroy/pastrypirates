// THE CHINK A COIN MAKES LANDING IN THE PURSE — Wyatt, 2026-09-15: "the 'tick' sound of the coin is the wrong sound -- we
// want a coin 'chink' sound whenever a coin goes into the purse."
// ONE FILE OF THREE SLOTS, like the cork pop and the marimba: slot 0 is chink A, 1 is B, 2 is C — the same three he hears
// on the Game Feel Tuner, rendered here with the tuner's own recipe, node for node. So his pick is a one-number change in
// src/ui/audio.js (CHINK_PICK) and never another render.
//   node .planning/research/audio-sourcing/render_coin_chink.mjs
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "../../..");
const { launch, attach, killAll, sleep } = await import(pathToFileURL(path.join(REPO, "scripts/mp_rig.mjs")).href);
const PAGE_VOLUME = 0.7;                       // the tuner's own default volume — the level he heard them at
export const CHINK_SLOT_S = 0.35, CHINK_LEAD_S = 0.03, CHINK_SLOTS = 3;
const PROFILE = path.join(process.env.TMPDIR || "/tmp", "pp-render-coin-chink");
launch(9907, PROFILE);
const C = await attach(9907);
try {
  await C.send("Page.navigate", { url: "about:blank" }); await sleep(800);
  const b64 = await C.ev(`(async()=>{
    const sr=48000, secs=${CHINK_SLOTS * CHINK_SLOT_S};
    const a=new OfflineAudioContext(1,Math.ceil(sr*secs),sr), out=a.createGain(); out.gain.value=${PAGE_VOLUME}; out.connect(a.destination);
    // the tuner's ping() and noise(), unchanged but for taking a start time
    const ping=(t,f,dur,type,gain,detune)=>{ const o=a.createOscillator(), g=a.createGain();
      o.type=type||"triangle"; o.frequency.value=f; if(detune)o.detune.value=detune;
      g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(gain,t+0.004); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
      o.connect(g).connect(out); o.start(t); o.stop(t+dur+0.02); };
    const noise=(t,dur,gain,hp)=>{ const n=a.createBufferSource(), buf=a.createBuffer(1,Math.ceil(sr*dur),sr), d=buf.getChannelData(0);
      for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3);
      n.buffer=buf; const f=a.createBiquadFilter(); f.type="highpass"; f.frequency.value=hp||2000;
      const g=a.createGain(); g.gain.value=gain; n.connect(f).connect(g).connect(out); n.start(t); };
    const S=${CHINK_SLOT_S}, L=${CHINK_LEAD_S};
    const A=0*S+L, B=1*S+L, D=2*S+L;
    /* A — a short bright chink */ ping(A,2350,0.18,"triangle",0.25); ping(A,3520,0.12,"sine",0.12,8); noise(A,0.05,0.05,4000);
    /* B — a fatter, lower clink */ ping(B,1180,0.26,"triangle",0.3); ping(B,1770,0.16,"sine",0.14); noise(B,0.09,0.08,1500);
    /* C — two-stage, a coin settling */ ping(D,2650,0.14,"sine",0.2); ping(D+0.055,2180,0.2,"triangle",0.22); noise(D,0.04,0.04,5000);
    const d=(await a.startRendering()).getChannelData(0), bytes=new Uint8Array(d.length*2); let peak=0;
    for(let i=0;i<d.length;i++){ if(Math.abs(d[i])>peak)peak=Math.abs(d[i]); const v=Math.max(-32768,Math.min(32767,Math.round(d[i]*32767))); bytes[2*i]=v&255; bytes[2*i+1]=(v>>8)&255; }
    let s=""; for(let i=0;i<bytes.length;i+=8192) s+=String.fromCharCode.apply(null,bytes.subarray(i,i+8192));
    return JSON.stringify({b64:btoa(s),peak}); })()`);
  const { b64: pcm64, peak } = JSON.parse(b64);
  const pcm = Buffer.from(pcm64, "base64"), wav = Buffer.alloc(44);
  wav.write("RIFF", 0); wav.writeUInt32LE(36 + pcm.length, 4); wav.write("WAVE", 8); wav.write("fmt ", 12); wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(48000, 24); wav.writeUInt32LE(96000, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
  wav.write("data", 36); wav.writeUInt32LE(pcm.length, 40);
  const out = path.join(HERE, "voyage-sounds-wav"); fs.mkdirSync(out, { recursive: true });
  const wf = path.join(out, "coin-chink.wav");
  fs.writeFileSync(wf, Buffer.concat([wav, pcm]));
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", wf, "-ac", "1", "-ar", "48000", "-c:a", "libmp3lame", "-b:a", "96k", path.join(REPO, "sfx", "coin-chink.mp3")]);
  console.log(`rendered coin-chink: ${CHINK_SLOTS} slots of ${CHINK_SLOT_S}s, peak ${peak.toFixed(3)} -> sfx/coin-chink.mp3`);
} finally { await killAll(); }
