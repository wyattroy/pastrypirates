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
export const CHINK_SLOT_S = 0.5, CHINK_LEAD_S = 0.03, CHINK_SLOTS = 3;   // 0.35 until 2026-09-16's Silver, which rings for 0.45s
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
    /* ROUND 2 (2026-09-16): "I also don't love the coin chink sound" — three coins built like real coins on his tuner, rendered from its
       recipe: a struck disc rings at several inharmonic pitches at once (ring), a purse is a low muffled knock (thump). He picked A. */
    const ring=(t,f0,ratios,amps,decays)=>ratios.forEach((r,i)=>ping(t,f0*r,decays[i],"sine",amps[i],(i*7)%11-5));
    const thump=(t,dur,gain,lp)=>{ const n=a.createBufferSource(), buf=a.createBuffer(1,Math.ceil(sr*dur),sr), d=buf.getChannelData(0);
      for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2);
      n.buffer=buf; const f=a.createBiquadFilter(); f.type="lowpass"; f.frequency.value=lp; const g=a.createGain(); g.gain.value=gain;
      n.connect(f).connect(g).connect(out); n.start(t); };
    /* A — Silver: one bright coin, ringing */ ring(A,2650,[1,1.59,2.14,2.65],[.22,.12,.07,.04],[.45,.3,.19,.12]); noise(A,.006,.07,5000);
    /* B — Into the purse */ ring(B,2150,[1,1.6,2.2],[.2,.1,.05],[.2,.14,.09]); noise(B,.005,.06,3500); thump(B,.05,.5,180);
                              ring(B+.055,2290,[1,1.62],[.07,.03],[.12,.08]); thump(B+.055,.03,.25,160);
    /* C — On the pile */ ring(D,1900,[1,1.55,2.3],[.18,.08,.04],[.26,.17,.1]); noise(D,.006,.06,3000);
                          [45,85,130].forEach((ms,i)=>ring(D+ms/1000,2350+i*140,[1,1.71],[.05-i*.012,.02],[.07,.045]));
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
