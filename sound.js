// Ambient score, synthesised in the browser (no audio files, nothing to licence):
// a low drone, a slow minor "choir", wind, a distant bell. It darkens with depth:
// d = 0 at the wood, 1 on the ice. start() must be called from a click (browsers block sound before one).
export function createSound() {
  let ctx = null, master = null, on = true, depth = 0, bellTimer = 0;
  const parts = {};
  try { on = localStorage.getItem('sound') !== 'off'; } catch (e) {}

  const noiseBuffer = (seconds) => {
    const b = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate), d = b.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }   // brownish
    return b;
  };
  const hall = () => {                                    // a long dark reverb from decaying noise
    const len = ctx.sampleRate * 5, b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    const conv = ctx.createConvolver(); conv.buffer = b; return conv;
  };
  const lfo = (freq, amount, target) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = freq; g.gain.value = amount; o.connect(g).connect(target); o.start(); };

  function build() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 4;
    master.connect(comp).connect(ctx.destination);
    const wet = hall(), wetGain = ctx.createGain(); wetGain.gain.value = 0.55; wet.connect(wetGain).connect(master);

    // drone: three detuned saws an octave apart, behind a slowly breathing low-pass
    const droneF = ctx.createBiquadFilter(); droneF.type = 'lowpass'; droneF.frequency.value = 220; droneF.Q.value = 0.7;
    const droneG = ctx.createGain(); droneG.gain.value = 0.16; droneF.connect(droneG); droneG.connect(master); droneG.connect(wet);
    parts.drone = [36.71, 73.42, 73.9, 110].map((f, i) => { const o = ctx.createOscillator(); o.type = i === 3 ? 'triangle' : 'sawtooth'; o.frequency.value = f;
      const g = ctx.createGain(); g.gain.value = i === 3 ? 0.25 : 0.5; o.connect(g).connect(droneF); o.start(); return o; });
    lfo(0.05, 70, droneF.frequency); parts.droneF = droneF;

    // choir: D minor voices swelling in and out on their own slow clocks; a flat second creeps in with depth
    const choirG = ctx.createGain(); choirG.gain.value = 0.5; choirG.connect(wet);
    const dry = ctx.createGain(); dry.gain.value = 0.12; choirG.connect(dry).connect(master);
    parts.voices = [[146.83, 0.11], [174.61, 0.083], [220, 0.067], [293.66, 0.049], [155.56, 0.071]].map(([f, rate], i) => {
      const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f;
      const vib = ctx.createGain(); vib.gain.value = 0; o.connect(vib);
      const g = ctx.createGain(); g.gain.value = 0.045; vib.connect(g).connect(choirG);
      lfo(rate, 0.045, g.gain); lfo(4.6 + i * 0.3, f * 0.004, o.frequency); o.start();
      vib.gain.value = i === 4 ? 0 : 1; return { o, level: vib.gain, dark: i === 4 };
    });

    // wind: filtered noise that sweeps; fire rumble: the same noise kept very low
    const src = ctx.createBufferSource(); src.buffer = noiseBuffer(6); src.loop = true; src.start();
    const windF = ctx.createBiquadFilter(); windF.type = 'bandpass'; windF.frequency.value = 500; windF.Q.value = 1.4;
    const windG = ctx.createGain(); windG.gain.value = 0.05; src.connect(windF).connect(windG); windG.connect(master); windG.connect(wet);
    lfo(0.07, 260, windF.frequency); lfo(0.13, 0.03, windG.gain); parts.windF = windF; parts.windG = windG;
    const fireF = ctx.createBiquadFilter(); fireF.type = 'lowpass'; fireF.frequency.value = 90;
    const fireG = ctx.createGain(); fireG.gain.value = 0; src.connect(fireF).connect(fireG).connect(master); parts.fireG = fireG;

    parts.wet = wet;
    setDepth(depth, true);
  }

  function bell() {                                       // a far, low toll through the hall
    if (!ctx || !on || ctx.state !== 'running') return;
    const t = ctx.currentTime, base = [98, 110, 87.31][Math.floor(Math.random() * 3)] * (1 - 0.25 * depth);
    [[1, 0.5], [2.01, 0.25], [2.74, 0.16], [5.1, 0.06]].forEach(([m, a]) => {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = base * m;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(a * 0.22, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 7 / Math.sqrt(m));
      o.connect(g).connect(parts.wet); o.start(t); o.stop(t + 8);
    });
  }
  function scheduleBell() { clearTimeout(bellTimer); bellTimer = setTimeout(() => { bell(); scheduleBell(); }, 16000 + Math.random() * 22000); }

  function setDepth(d, now) {
    depth = Math.max(0, Math.min(1, d));
    if (!ctx) return;
    const t = ctx.currentTime, k = now ? 0.01 : 2.5, mid = Math.sin(Math.PI * Math.min(1, depth * 1.25));   // fire peaks around circles 6–8
    parts.drone.forEach((o) => o.detune.setTargetAtTime(-350 * depth, t, k));
    parts.droneF.frequency.setTargetAtTime(240 - 110 * depth, t, k);
    parts.voices.forEach((v) => v.level.setTargetAtTime(v.dark ? depth : 1 - 0.35 * depth, t, k));
    parts.fireG.gain.setTargetAtTime(0.5 * mid, t, k);
    const ice = Math.max(0, depth - 0.8) * 5;                                                              // cold wind on Cocytus
    parts.windG.gain.setTargetAtTime(0.045 + 0.02 * (1 - depth) + 0.11 * ice, t, k);
    parts.windF.frequency.setTargetAtTime(480 + 900 * ice, t, k);
  }

  function apply() { if (master) master.gain.setTargetAtTime(on ? 0.9 : 0, ctx.currentTime, on ? 1.6 : 0.25); }
  function start() {
    if (!ctx) { try { build(); } catch (e) { return; } scheduleBell(); }
    if (ctx.state === 'suspended') ctx.resume();
    apply();
  }
  function toggle() { on = !on; try { localStorage.setItem('sound', on ? 'on' : 'off'); } catch (e) {} if (on) start(); else apply(); return on; }
  document.addEventListener('visibilitychange', () => { if (ctx) { if (document.hidden) ctx.suspend(); else if (on) ctx.resume(); } });

  return { start, toggle, setDepth, get on() { return on; }, get ctx() { return ctx; }, get out() { return master; } };
}
