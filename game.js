// First-person demo: from the dark wood, through the gate and the stair tunnel, to Charon's shore.
// Lives only in game.html; the site (index.html) does not load this file.
import * as THREE from 'three';
import { MeshBVH } from 'https://cdn.jsdelivr.net/npm/three-mesh-bvh@0.7.8/build/index.module.js';

const S = 0.364, ZF = S * -32, GATE = 150, EYE = 1.66;
const rad = (d) => d * Math.PI / 180;
// p(r, angle, height): a point on the funnel; g(x, y, height): the gate's own frame (x = outwards from the pit)
const p = (r, a, y) => new THREE.Vector3(r * Math.cos(rad(a)), y, -r * Math.sin(rad(a)));
const g = (x, y, h) => p(Math.hypot(x, y), GATE + Math.atan2(y, x) * 180 / Math.PI, h);
const stairY = (r) => (r <= 55.2 ? ZF : r >= 71 ? 0 : ZF + (r - 55.2) * (-ZF / (71 - 55.2)));

// what is said, by whom; the files are voice/<id>.mp3
const LINES = {
  v_start:  ['וירגיליוס', 'אל תפחד. אני וירגיליוס. הדרך היחידה מכאן עוברת למטה. בוא אחריי, אל השער.'],
  v_beasts: ['וירגיליוס', 'שלוש החיות לא יתנו לך לעלות אל ההר. אל תילחם בהן. חזור אל השער.'],
  gate:     ['השער', 'הניחו כל תקווה, אתם הנכנסים.'],
  v_tunnel: ['וירגיליוס', 'כאן משאירים כל פחד מאחור. רד בזהירות. אני לפניך.'],
  v_vest:   ['וירגיליוס', 'אלה מי שחיו בלי לבחור. השמיים דחו אותם, וגם התופת אינה רוצה בהם. הבט בהם, ועבור.'],
  soul1:    ['נשמה', 'לא עשיתי רע. לא עשיתי טוב. לא עשיתי דבר.'],
  soul2:    ['נשמה', 'רצתי אחרי כל דגל, ואף אחד מהם לא היה שלי.'],
  charon:   ['כארון', 'אוי לכם, נשמות רשעות! ואתה, נשמה חיה, התרחק מן המתים!'],
  v_charon: ['וירגיליוס', 'כארון, אל תכעס. כך רוצים במקום שבו יכולים כל מה שרוצים.'],
  v_end:    ['וירגיליוס', 'הסירה מחכה. מעבר לנהר מתחיל המעגל הראשון.'],
};
// the notebook: the poem Dante is writing as he goes
const NOTES = [
  ['Nel mezzo del cammin di nostra vita / mi ritrovai per una selva oscura', 'בחצי דרכם של חיינו מצאתי את עצמי ביער אפל', 'א׳, 1–2'],
  ['Lasciate ogne speranza, voi ch\'intrate', 'הניחו כל תקווה, אתם הנכנסים', 'ג׳, 9'],
  ['non ragioniam di lor, ma guarda e passa', 'אל נדבר בהם; הבט, ועבור', 'ג׳, 51'],
  ['Questi non hanno speranza di morte', 'לאלה אין אפילו תקווה למות', 'ג׳, 46'],
  ['Caron dimonio, con occhi di bragia', 'כארון השד, שעיניו גחלים', 'ג׳, 109'],
];

export function createGame({ scene, camera, renderer, sound, detail, kept, LOD }) {
  const game = { active: false, ended: false };
  const $ = (id) => document.getElementById(id);
  const ray = new THREE.Ray(), DOWN = new THREE.Vector3(0, -1, 0), v = new THREE.Vector3(), v2 = new THREE.Vector3();
  let bvh = null;
  const pos = g(84, 0.6, 0), keys = new Set();
  let yaw = 0, pitch = 0, bob = 0, moved = 0;
  const stick = { x: 0, y: 0 }, touches = new Map();

  // --- collision: the rock, the stairs and the gate become one invisible mesh with a BVH ---------
  function buildCollider() {
    const SOLID = /^(Funnel_|Entrance_(Steps|Tunnel|Backing|HellGate)|Kerb_|Gate_(Pillar|Lintel))/, chunks = []; let n = 0;
    scene.updateMatrixWorld(true);
    scene.traverse((o) => {
      if (!o.isMesh || o.isInstancedMesh) return;
      let name = ''; for (let q = o; q && !name; q = q.parent) name = q.userData.name || '';
      if (!SOLID.test(name)) return;
      const geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
      const a = geo.attributes.position.clone().applyMatrix4(o.matrixWorld).array;
      chunks.push(a); n += a.length;
    });
    const all = new Float32Array(n); let k = 0; for (const c of chunks) { all.set(c, k); k += c.length; }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(all, 3));
    bvh = new MeshBVH(geo);
    game.triangles = n / 9;
  }
  const cast = (origin, dir, far) => { ray.origin.copy(origin); ray.direction.copy(dir); return bvh.raycastFirst(ray, THREE.DoubleSide, 0, far); };
  const groundAt = (x, y, z) => { const h = cast(v.set(x, y + 1.1, z), DOWN, 7); return h ? h.point.y : null; };

  function tryMove(dx, dz) {
    const len = Math.hypot(dx, dz); if (len < 1e-6) return false;
    const dir = v2.set(dx / len, 0, dz / len);
    const hit = cast(v.set(pos.x, pos.y + 0.95, pos.z), dir, len + 0.12);            // only stops walking straight through a wall
    if (hit) return hit;
    let nx = pos.x + dx, nz = pos.z + dz;
    const gy = groundAt(nx, pos.y, nz);
    if (gy === null || gy > pos.y + 0.6 || gy < pos.y - 1.6) return true;          // too high a step, or a drop
    if (gy < -10.4 && gy > -12.8) { const r = Math.hypot(nx, nz); if (r < 52.86) { nx *= 52.86 / r; nz *= 52.86 / r; } }   // the Acheron
    pos.x = nx; pos.z = nz; pos.y += (gy - pos.y) * 0.5;
    return false;
  }
  // keep a body's width from the rock: eight short feelers at chest height push you back out, so you slide along rough walls
  const FEEL = Array.from({ length: 8 }, (_, i) => new THREE.Vector3(Math.cos(i * Math.PI / 4), 0, Math.sin(i * Math.PI / 4)));
  function keepClear() {
    for (const d of FEEL) { const h = cast(v.set(pos.x, pos.y + 0.95, pos.z), d, 0.36);
      if (h) { const push = 0.36 - h.distance; pos.x -= d.x * push; pos.z -= d.z * push; } }
  }
  // the shore is packed with statues: open a walking lane beside the river, and remember where the others stand
  const grid = new Map(), cell = (x, z) => Math.round(x) + ',' + Math.round(z);
  function clearLane() {
    const zero = new THREE.Matrix4().set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0), w = new THREE.Vector3(); let gone = 0;
    for (const e of LOD) {
      let moving = false; for (let q = e.low.parent; q; q = q.parent) if ((q.userData.name || '').startsWith('ANIM_')) moving = true;
      if (moving) continue;
      e.low.updateMatrixWorld(true); let changed = false;
      for (let i = 0; i < e.low.count; i++) {
        w.fromArray(e.base, i * 16 + 12).applyMatrix4(e.low.matrixWorld);
        const r = Math.hypot(w.x, w.z); if (r < 50) continue;
        const a = (Math.atan2(-w.z, w.x) * 180 / Math.PI + 360) % 360;
        if (Math.abs(w.y - ZF) < 1.2 && a > 110 && a < 153 && r > 52.7 && r < 53.75) { e.base.fill(0, i * 16, i * 16 + 16); e.low.setMatrixAt(i, zero); changed = true; gone++; continue; }
        const k = cell(w.x, w.z); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(w.x, w.y, w.z);
      }
      if (changed) e.low.instanceMatrix.needsUpdate = true;
    }
    game.cleared = gone;
  }
  function aroundStatues() {
    const cx = Math.round(pos.x), cz = Math.round(pos.z);
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) { const list = grid.get((cx + i) + ',' + (cz + j)); if (!list) continue;
      for (let k = 0; k < list.length; k += 3) { if (Math.abs(list[k + 1] - pos.y) > 1.5) continue;
        const dx = pos.x - list[k], dz = pos.z - list[k + 2], d = Math.hypot(dx, dz);
        if (d < 0.5 && d > 1e-4) { pos.x += dx / d * (0.5 - d); pos.z += dz / d * (0.5 - d); } } }
  }
  function walk(dt) {
    let f = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) - stick.y;
    let s = (keys.has('KeyD') ? 1 : 0) - (keys.has('KeyA') ? 1 : 0) + stick.x;
    if (keys.has('ArrowLeft')) yaw += dt * 1.9; if (keys.has('ArrowRight')) yaw -= dt * 1.9;
    const m = Math.hypot(f, s); if (m > 1) { f /= m; s /= m; }
    const speed = (keys.has('ShiftLeft') || keys.has('ShiftRight') ? 5.6 : 3.1) * dt;
    const sin = Math.sin(yaw), cos = Math.cos(yaw);
    const dx = (-sin * f + cos * s) * speed, dz = (-cos * f - sin * s) * speed;
    if (m > 0.05) {
      const hit = tryMove(dx, dz);
      if (hit && hit !== true) {                                                   // slide along the wall
        const n = hit.face.normal; let nx = n.x, nz = n.z; const nl = Math.hypot(nx, nz) || 1; nx /= nl; nz /= nl;
        const d = dx * nx + dz * nz; tryMove(dx - d * nx, dz - d * nz);
      }
      aroundStatues(); keepClear(); moved += speed; bob += speed * 2.1;
    }
    const gy = groundAt(pos.x, pos.y, pos.z); if (gy !== null) pos.y += (gy - pos.y) * Math.min(1, dt * 14);
    camera.position.set(pos.x, pos.y + EYE + Math.sin(bob) * 0.028, pos.z);
    camera.rotation.set(pitch, yaw, 0, 'YXZ');
  }

  // --- the guide: Virgil glides ahead and waits at each stop until you come near --------------------
  const PATH = [[g(76.6, 0.9, 0), 1], [g(72.6, 0.2, 0), 0], [g(70, 0, stairY(70)), 1], [g(66, 0, stairY(66)), 0], [g(62, 0, stairY(62)), 1],
    [g(58, 0, stairY(58)), 0], [g(55.2, 0, ZF), 1], [p(53.5, 148.6, ZF), 0], [p(53.35, 145.5, ZF), 1], [p(53.3, 141, ZF), 0],
    [p(53.3, 136, ZF), 1], [p(53.25, 130, ZF), 0], [p(53.25, 124.6, ZF), 1]];
  let guide = null, guideAt = 0, guideLight = null, guideHi = false;
  function setupGuide() {
    for (const o of kept) if (/^(Dante_(Wood|Gate|Acheron)|Virgil_(Wood|Acheron))$/.test(o.userData.name)) o.visible = false;   // you are Dante
    const src = kept.find((o) => o.userData.name === 'Virgil_Gate'); if (!src) return;
    src.updateMatrixWorld(true); const q = new THREE.Quaternion(), sc = new THREE.Vector3();
    src.matrixWorld.decompose(v, q, sc); scene.attach(src);
    guide = src; guide.scale.copy(sc); guide.position.copy(PATH[0][0]); guide.frustumCulled = false;
    guideLight = new THREE.PointLight(0xa9bcff, 5, 7, 1.7); scene.add(guideLight);
  }
  function moveGuide(dt) {
    if (!guide) return;
    if (!guideHi && detail.has(guide.userData.meshKey)) { const [geo, mat] = detail.get(guide.userData.meshKey)[0]; guide.geometry = geo; guide.material = mat; guideHi = true; }
    const target = PATH[guideAt][0], d = v.copy(target).sub(guide.position), dist = d.length();
    if (dist > 0.03) { guide.position.addScaledVector(d, Math.min(1, 2.7 * dt / dist)); if (dist > 0.3) face(guide, d.x, d.z, dt * 5); }
    else if (guideAt < PATH.length - 1 && (!PATH[guideAt][1] || guide.position.distanceTo(pos) < 4.6)) guideAt++;
    else face(guide, pos.x - guide.position.x, pos.z - guide.position.z, dt * 3);      // waiting: he looks back at you
    guideLight.position.copy(guide.position).y += 2.1;
  }
  // the generated statues face +Z; turn one towards a direction, smoothly
  function face(o, dx, dz, k) { const want = Math.atan2(dx, dz); let d = want - o.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); o.rotation.set(0, o.rotation.y + d * Math.min(1, k), 0); }

  // --- voices and subtitles: one line at a time, never locking the controls -------------------------
  const queue = []; let speaking = null;
  // a new line from the guide replaces one that is still waiting its turn, so the talk never lags behind the place
  function say(id, after, keep) { if (!keep) for (let i = queue.length - 1; i >= 0; i--) if (!queue[i].keep) queue.splice(i, 1); queue.push({ id, after, keep }); }
  // souls do not wait in line: they speak from where they stand, quieter with distance, under the guide's voice
  const murmurs = [];
  function murmur(id, at) {
    const [who, text] = LINES[id]; const a = new Audio(`voice/${id}.mp3`); a.volume = 0;
    const m = { a, at, t: 0, max: 2 + text.length * 0.075 }; murmurs.push(m);
    a.addEventListener('loadedmetadata', () => { m.max = a.duration + 0.3; }); a.play().catch(() => {});
    $('gWho2').textContent = who; $('gText2').textContent = text; $('gSub2').classList.add('on');
  }
  function murmuring(dt) {
    for (let i = murmurs.length - 1; i >= 0; i--) { const m = murmurs[i]; m.t += dt;
      const d = Math.hypot(m.at.x - pos.x, m.at.z - pos.z); m.a.volume = sound.on ? Math.max(0, Math.min(0.85, 1.1 - d / 9)) : 0;
      if (m.t > m.max || d > 11) { m.a.pause(); murmurs.splice(i, 1); if (!murmurs.length) $('gSub2').classList.remove('on'); } }
  }
  function speak(dt) {
    if (speaking) { speaking.t += dt; if (speaking.done || speaking.t > speaking.max) { $('gSub').classList.remove('on'); if (speaking.after) speaking.after(); speaking = null; } return; }
    const next = queue.shift(); if (!next) return;
    const [who, text] = LINES[next.id];
    $('gWho').textContent = who; $('gText').textContent = text; $('gSub').classList.add('on');
    speaking = { t: 0, max: 2.2 + text.length * 0.075, done: false, after: next.after };
    const a = new Audio(`voice/${next.id}.mp3`); a.volume = sound.on ? 1 : 0;
    a.addEventListener('loadedmetadata', () => { if (speaking) speaking.max = a.duration + 0.5; });
    a.addEventListener('ended', () => { if (speaking) speaking.done = true; });
    a.play().catch(() => {});                                                          // no file or no sound: the subtitle still runs its time
    speaking.audio = a;
  }

  // --- awakenings: a statue stirs and lights up as you come near ------------------------------------
  const woken = [];
  function wake(at, obj, turn) {
    const l = new THREE.PointLight(0xffd7a0, 0, 6, 1.8); l.position.copy(at).y += 2.2; scene.add(l);
    woken.push({ l, t: 0, obj, turn, at });
  }
  function stir(dt) {
    for (const w of woken) {
      w.t += dt; const k = Math.min(1, w.t / 0.5);
      w.l.intensity = 5 * k * (1 - 0.5 * Math.min(1, Math.max(0, w.t - 0.5) / 2)) + Math.sin(w.t * 5) * 0.15;
      if (w.obj) { w.obj.getWorldPosition(v); w.l.position.set(v.x, v.y + 2.2, v.z); if (w.turn) face(w.obj, pos.x - v.x, pos.z - v.z, dt * 4); }
    }
  }

  // --- the notebook ---------------------------------------------------------------------------------
  const got = new Set();
  function note(i) {
    if (got.has(i)) return; got.add(i);
    $('gNote').textContent = `המחברת ${got.size}/${NOTES.length}`; $('gNote').classList.add('new'); setTimeout(() => $('gNote').classList.remove('new'), 1600);
    $('gList').replaceChildren(...NOTES.map(([it, he, ref], k) => { const li = document.createElement('li');
      if (got.has(k)) { li.innerHTML = '<i lang="it"></i><span></span><small></small>'; li.children[0].textContent = it; li.children[1].textContent = he; li.children[2].textContent = 'התופת, ' + ref; }
      else { li.className = 'empty'; li.textContent = '· · ·'; } return li; }));
  }

  // --- what happens where ---------------------------------------------------------------------------
  const find = (name) => kept.find((o) => o.userData.name === name);
  const TRIG = [
    { at: p(58.4, 150, 0), r: 7, top: true, run: () => { say('v_beasts'); for (const n of ['Beast_Leopard', 'Beast_Lion', 'Beast_SheWolf']) { const o = find(n); if (o) wake(o.getWorldPosition(new THREE.Vector3()), o, false); } } },
    { at: g(76, 0, 0), r: 4.6, run: () => { say('gate'); note(1); wake(g(72.4, 0, 3.2)); } },
    { at: g(65.5, 0, stairY(65.5)), r: 2.6, run: () => say('v_tunnel') },
    { at: g(54.4, 0, ZF), r: 2.6, run: () => { say('v_vest'); note(2); } },
    { at: p(53.3, 143, ZF), r: 2.8, run: () => { murmur('soul1', p(54.0, 142.4, ZF)); note(3); wake(p(54.0, 142.4, ZF)); } },
    { at: p(53.3, 133.5, ZF), r: 2.8, run: () => { murmur('soul2', p(54.0, 132.8, ZF)); wake(p(54.0, 132.8, ZF)); } },
    { at: p(53.25, 126, ZF), r: 3.6, run: () => { const c = find('Charon'); if (c) wake(c.getWorldPosition(new THREE.Vector3()), c, true);
        say('charon', () => note(4), true); say('v_charon', null, true); say('v_end', end, true); } },
  ];
  function triggers() { for (const t of TRIG) if (!t.done && Math.hypot(t.at.x - pos.x, t.at.z - pos.z) < t.r && Math.abs(t.at.y - pos.y) < (t.top ? 1.2 : 3)) { t.done = true; t.run(); } }

  function end() { game.ended = true; $('gEndN').textContent = `${got.size} מתוך ${NOTES.length} שורות במחברת`; $('gEnd').classList.add('on'); if (document.pointerLockElement) document.exitPointerLock(); }

  // --- input ----------------------------------------------------------------------------------------
  function bind() {
    const el = renderer.domElement;
    addEventListener('keydown', (e) => { keys.add(e.code); if (e.code === 'KeyN' || e.code === 'Tab') { e.preventDefault(); $('gBook').classList.toggle('on'); } });
    addEventListener('keyup', (e) => keys.delete(e.code));
    addEventListener('blur', () => keys.clear());
    const lock = () => { try { const r = el.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch (e) {} };
    game.lock = lock;
    el.addEventListener('click', () => { if (game.active && !game.ended && !matchMedia('(pointer: coarse)').matches) lock(); });
    let drag = false;
    el.addEventListener('mousedown', () => { drag = true; }); addEventListener('mouseup', () => { drag = false; });
    document.addEventListener('mousemove', (e) => { if (!drag || document.pointerLockElement === el) return; yaw -= e.movementX * 0.004; pitch = Math.max(-1.3, Math.min(1.3, pitch - e.movementY * 0.004)); });
    document.addEventListener('pointerlockchange', () => $('gHint').classList.toggle('paused', game.active && !document.pointerLockElement));
    document.addEventListener('mousemove', (e) => { if (document.pointerLockElement !== el) return; yaw -= e.movementX * 0.0022; pitch = Math.max(-1.3, Math.min(1.3, pitch - e.movementY * 0.0022)); });
    // touch: left half of the screen is a walking stick, right half turns the head
    el.addEventListener('touchstart', (e) => { for (const t of e.changedTouches) touches.set(t.identifier, { x0: t.clientX, y0: t.clientY, x: t.clientX, y: t.clientY, left: t.clientX < innerWidth / 2 }); }, { passive: true });
    el.addEventListener('touchmove', (e) => { for (const t of e.changedTouches) { const s = touches.get(t.identifier); if (!s) continue;
      if (s.left) { stick.x = Math.max(-1, Math.min(1, (t.clientX - s.x0) / 55)); stick.y = Math.max(-1, Math.min(1, (t.clientY - s.y0) / 55)); }
      else { yaw -= (t.clientX - s.x) * 0.005; pitch = Math.max(-1.3, Math.min(1.3, pitch - (t.clientY - s.y) * 0.005)); }
      s.x = t.clientX; s.y = t.clientY; } }, { passive: true });
    const up = (e) => { for (const t of e.changedTouches) { const s = touches.get(t.identifier); if (s && s.left) stick.x = stick.y = 0; touches.delete(t.identifier); } };
    el.addEventListener('touchend', up); el.addEventListener('touchcancel', up);
    $('gNote').addEventListener('click', () => $('gBook').classList.toggle('on'));
    $('gBook').addEventListener('click', () => $('gBook').classList.remove('on'));
    addEventListener('resize', () => { if (game.active) { camera.fov = 68; camera.updateProjectionMatrix(); } });
  }

  game.start = () => {
    buildCollider(); clearLane(); setupGuide(); bind();
    camera.near = 0.07; camera.fov = 68; camera.updateProjectionMatrix();
    const gy = groundAt(pos.x, 1, pos.z); pos.y = gy === null ? 0 : gy;
    yaw = Math.atan2(pos.x, pos.z);                                                     // face the pit: the gate is straight ahead
    document.body.classList.add('playing');
    game.active = true; note(0); say('v_start');
    if (!matchMedia('(pointer: coarse)').matches) game.lock();
    setTimeout(() => $('gHint').classList.add('seen'), 9000);
  };
  game.update = (dt) => { if (!game.ended) walk(dt); else camera.rotation.set(pitch, yaw, 0, 'YXZ'); moveGuide(dt); triggers(); speak(dt); murmuring(dt); stir(dt); };
  // for automated checks: jump to a place on the route
  game.debug = { pos, goto: (r, a, y) => { pos.copy(p(r, a, y)); }, look: (y, x = 0) => { yaw = y; pitch = x; }, state: () => ({ pos: pos.toArray().map((n) => +n.toFixed(2)), yaw: +yaw.toFixed(2), guideAt, got: [...got], queue: queue.length, speaking: speaking && LINES[queue.id], ended: game.ended, tris: game.triangles, cleared: game.cleared, moved: +moved.toFixed(1) }) };
  return game;
}
