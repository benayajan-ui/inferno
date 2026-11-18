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
  v_view:   ['וירגיליוס', 'זה הגיהנום. תשעה מעגלים יורדים אל לב האדמה, ובכל אחד עונש שנולד מן החטא עצמו. הבט למטה, במעגל השני: הגופים המרחפים באוויר הם מי שנסחפו אחרי תשוקתם. עכשיו הסערה סוחפת אותם, לנצח.'],
  v_vest:   ['וירגיליוס', 'אלה מי שחיו בלי לבחור. השמיים דחו אותם, וגם התופת אינה רוצה בהם. הבט בהם, ועבור.'],
  soul1:    ['נשמה', 'לא עשיתי רע. לא עשיתי טוב. לא עשיתי דבר.'],
  soul2:    ['נשמה', 'רצתי אחרי כל דגל, ואף אחד מהם לא היה שלי.'],
  charon:   ['כארון', 'אוי לכם, נשמות רשעות! ואתה, נשמה חיה, התרחק מן המתים!'],
  v_charon: ['וירגיליוס', 'כארון, אל תכעס. כך רוצים במקום שבו יכולים כל מה שרוצים.'],
  v_task:   ['וירגיליוס', 'הוא לא יפליג בסירה ריקה. הער שלוש נשמות שכבר מחכות על שפת המים. לא את הרצים.'],
  s_a:      ['נשמה', 'סוף סוף. חיכיתי כאן כל כך הרבה זמן.'],
  s_b:      ['נשמה', 'אני מפחד מהמים, ובכל זאת אני רוצה לעבור.'],
  s_c:      ['נשמה', 'קח אותי מכאן. כל מקום עדיף על החוף הזה.'],
  d_a:      ['נשמה', 'אני לא יכול לעצור. הדגל!'],
  d_b:      ['נשמה', 'אל תעכב אותי. הוא בורח!'],
  charon_go:['כארון', 'הסירה מלאה. עלה, נשמה חיה, ושתוק.'],
  v_boat:   ['וירגיליוס', 'אל תביט במים. בצד השני מחכים מי שלא חטאו, ובכל זאת לא יראו את האור.'],
  v_land:   ['וירגיליוס', 'כאן יורדים. המדרגות האלה מובילות אל המעגל הראשון.'],
};
// the notebook: the poem Dante is writing as he goes
const NOTES = [
  ['Nel mezzo del cammin di nostra vita / mi ritrovai per una selva oscura', 'בחצי דרכם של חיינו מצאתי את עצמי ביער אפל', 'א׳, 1–2'],
  ['Lasciate ogne speranza, voi ch\'intrate', 'הניחו כל תקווה, אתם הנכנסים', 'ג׳, 9'],
  ['non ragioniam di lor, ma guarda e passa', 'אל נדבר בהם; הבט, ועבור', 'ג׳, 51'],
  ['Questi non hanno speranza di morte', 'לאלה אין אפילו תקווה למות', 'ג׳, 46'],
  ['Caron dimonio, con occhi di bragia', 'כארון השד, שעיניו גחלים', 'ג׳, 109'],
];

export function createGame({ scene, camera, renderer, sound, detail, kept, LOD, ANIM }) {
  const game = { active: false, ended: false };
  const $ = (id) => document.getElementById(id);
  const ray = new THREE.Ray(), DOWN = new THREE.Vector3(0, -1, 0), v = new THREE.Vector3(), v2 = new THREE.Vector3();
  let bvh = null;
  const pos = g(84, 0.6, 0), keys = new Set();
  let yaw = 0, pitch = 0, bob = 0, moved = 0, coast = 0;
  const stick = { x: 0, y: 0 }, touches = new Map();

  // --- collision: the rock, the stairs and the gate become one invisible mesh with a BVH ---------
  function buildCollider() {
    const SOLID = /^(Funnel_|Entrance_(Steps|Tunnel|Backing|HellGate)|Kerb_|Stair_|Gate_(Pillar|Lintel))/, chunks = []; let n = 0;
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
    if (gy < -10.4 && gy > -12.8) { const r = Math.hypot(nx, nz);                    // the Acheron: you stay on the bank you are on
      if (r < 52.86 && r > 50.98) { const side = Math.hypot(pos.x, pos.z) > 52 ? 52.86 : 50.98; nx *= side / r; nz *= side / r; } }
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
        if (Math.abs(w.y - ZF) < 1.2 && a > 98 && a < 153 && r > 52.7 && r < 53.75) { e.base.fill(0, i * 16, i * 16 + 16); e.low.setMatrixAt(i, zero); changed = true; gone++; continue; }
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
    if (phase === 'sail') return ride(dt);
    const m = Math.hypot(f, s); if (m > 1) { f /= m; s /= m; }
    const speed = (keys.has('ShiftLeft') || keys.has('ShiftRight') ? 5.6 : 3.1) * dt;
    const sin = Math.sin(yaw), cos = Math.cos(yaw);
    const roll = coast * Math.min(1, dt * 2.6); coast -= roll;                          // the wheel: a push forward or back that eases out
    const dx = (-sin * f + cos * s) * speed - sin * roll, dz = (-cos * f - sin * s) * speed - cos * roll;
    if (m > 0.05 || Math.abs(roll) > 0.002) {
      const hit = tryMove(dx, dz);
      if (hit && hit !== true) {                                                   // slide along the wall
        const n = hit.face.normal; let nx = n.x, nz = n.z; const nl = Math.hypot(nx, nz) || 1; nx /= nl; nz /= nl;
        const d = dx * nx + dz * nz; tryMove(dx - d * nx, dz - d * nz);
      }
      aroundStatues(); keepClear(); moved += m > 0.05 ? speed : Math.abs(roll); bob += speed * 2.1;
    }
    const gy = groundAt(pos.x, pos.y, pos.z); if (gy !== null) pos.y += (gy - pos.y) * Math.min(1, dt * 14);
    camera.position.set(pos.x, pos.y + EYE + Math.sin(bob) * 0.028, pos.z);
    camera.rotation.set(pitch, yaw, 0, 'YXZ');
  }

  // --- the guide: Virgil glides ahead and waits at each stop until you come near --------------------
  const PATH = [[g(76.6, 0.9, 0), 1], [g(72.6, 0.2, 0), 0], [g(70, 0, stairY(70)), 1], [g(66, 0, stairY(66)), 0], [g(62, 0, stairY(62)), 1],
    [g(58, 0, stairY(58)), 0], [g(55.2, 0, ZF), 1], [p(53.5, 148.6, ZF), 0], [p(53.35, 145.5, ZF), 1], [p(53.3, 141, ZF), 0],
    [p(53.3, 136, ZF), 1], [p(53.25, 130, ZF), 0], [p(53.25, 124.6, ZF), 1]];
  let guide = null, guideAt = 0, guideLight = null, guideHi = false, guideRide = false;
  function setupGuide() {
    for (const o of kept) if (/^(Dante_(Wood|Gate|Acheron)|Virgil_(Wood|Acheron))$/.test(o.userData.name)) o.visible = false;   // you are Dante
    const src = kept.find((o) => o.userData.name === 'Virgil_Gate'); if (!src) return;
    src.updateMatrixWorld(true); const q = new THREE.Quaternion(), sc = new THREE.Vector3();
    src.matrixWorld.decompose(v, q, sc); scene.attach(src);
    guide = src; guide.userData.fwd = -1; guide.scale.copy(sc); guide.position.copy(PATH[0][0]); guide.frustumCulled = false;
    guideLight = new THREE.PointLight(0xa9bcff, 5, 7, 1.7); scene.add(guideLight);
  }
  function moveGuide(dt) {
    if (!guide) return;
    if (guideRide) { guide.getWorldPosition(v); guideLight.position.set(v.x, v.y + 2.1, v.z); if (phase === 'landed') face(guide, pos.x - v.x, pos.z - v.z, dt * 3); return; }
    if (!guideHi && detail.has(guide.userData.meshKey)) { const [geo, mat] = detail.get(guide.userData.meshKey)[0]; guide.geometry = geo; guide.material = mat; guideHi = true; }
    const target = PATH[guideAt][0], d = v.copy(target).sub(guide.position), dist = d.length();
    if (dist > 0.03) { guide.position.addScaledVector(d, Math.min(1, 2.7 * dt / dist)); if (dist > 0.3) face(guide, d.x, d.z, dt * 5); }
    else if (guideAt < PATH.length - 1 && (!PATH[guideAt][1] || guide.position.distanceTo(pos) < 4.6)) guideAt++;
    else face(guide, pos.x - guide.position.x, pos.z - guide.position.z, dt * 3);      // waiting: he looks back at you
    guideLight.position.copy(guide.position).y += 2.1;
  }
  // which way a statue's face points was measured on the meshes in Blender: the souls look along +Z, Virgil along -Z (userData.fwd = -1)
  const qq = new THREE.Quaternion(), eul = new THREE.Euler();
  function face(o, dx, dz, k) { const f = o.userData.fwd || 1; let want = Math.atan2(dx * f, dz * f);
    if (o.parent && o.parent !== scene) { o.parent.getWorldQuaternion(qq); want -= eul.setFromQuaternion(qq, 'YXZ').y; }   // a statue riding a turning boat
    let d = want - o.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); o.rotation.set(0, o.rotation.y + d * Math.min(1, k), 0); }

  // --- voices and subtitles: one line at a time, never locking the controls -------------------------
  const queue = []; let speaking = null;
  // a new line from the guide replaces one that is still waiting its turn, so the talk never lags behind the place
  function say(id, after, keep) { for (let i = queue.length - 1; i >= 0; i--) if (!queue[i].keep) queue.splice(i, 1); queue.push({ id, after, keep }); }
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

  // --- awakenings: a real statue leaves the frozen crowd. It turns to you, straightens, warms from marble to flesh, breathes
  const WARM = new THREE.Color(1.0, 0.72, 0.56), alive = [], ZERO = new THREE.Matrix4().set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  function liven(o, turn) {
    o.material = o.material.clone();
    const l = new THREE.PointLight(0xffd2a0, 0, 5, 1.8); scene.add(l);
    alive.push({ o, turn, t: 0, sy: o.scale.y, c0: o.material.color.clone(), l });
    return o;
  }
  // pull the statue nearest to a point out of its instanced batch, so it can move on its own
  function extract(at, reach = 2.4, only = null) {
    let best = null, bd = reach; const w = new THREE.Vector3();
    for (const e of LOD) {
      if (!/^Fig_/.test(e.key) || /Lying|Crawl|Flying/.test(e.key) || (only && !only.test(e.key))) continue;
      let moving = false; for (let q = e.low.parent; q; q = q.parent) if ((q.userData.name || '').startsWith('ANIM_')) moving = true;
      if (moving) continue;
      for (let i = 0; i < e.low.count; i++) { if (e.base[i * 16 + 15] === 0) continue;
        w.fromArray(e.base, i * 16 + 12).applyMatrix4(e.low.matrixWorld); const d = Math.hypot(w.x - at.x, w.z - at.z);
        if (Math.abs(w.y - at.y) < 1.5 && d < bd) { bd = d; best = { e, i }; } }
    }
    if (!best) return null;
    const { e, i } = best, m = new THREE.Matrix4().fromArray(e.base, i * 16).premultiply(e.low.matrixWorld);
    const [geo, mat] = detail.has(e.key) ? detail.get(e.key)[0] : [e.low.geometry, e.low.material];
    const o = new THREE.Mesh(geo, mat.clone()), q = new THREE.Quaternion();
    m.decompose(o.position, q, o.scale); o.rotation.set(0, new THREE.Euler().setFromQuaternion(q, 'YXZ').y, 0);
    if (e.low.instanceColor) o.material.color.fromArray(e.low.instanceColor.array, i * 3);
    e.base.fill(0, i * 16, i * 16 + 16); e.low.setMatrixAt(i, ZERO); e.low.instanceMatrix.needsUpdate = true;
    o.userData.meshKey = e.key; scene.add(o); return o;
  }
  const souls = [];
  function stir(dt) {
    for (const a of alive) {
      a.t += dt; const k = Math.min(1, a.t / 0.9), e = k * k * (3 - 2 * k);
      if (!a.hi && detail.has(a.o.userData.meshKey)) { const [geo, mat] = detail.get(a.o.userData.meshKey)[0];       // a living statue is always the detailed one
        a.o.geometry = geo; a.o.material = mat.clone(); a.hi = true; }
      a.o.material.color.copy(a.c0).lerp(WARM, 0.85 * e);
      if (a.o.material.emissive) a.o.material.emissive.setRGB(0.11 * e, 0.05 * e, 0.025 * e);
      a.o.scale.y = a.sy * (1 + 0.035 * e + 0.013 * Math.sin(a.t * 2.3) * e);           // straightens, then breathes
      a.o.getWorldPosition(v);
      if (a.turn) face(a.o, pos.x - v.x, pos.z - v.z, dt * 3.2);
      a.l.position.set(v.x + (pos.x - v.x) * 0.35, v.y + 1.9, v.z + (pos.z - v.z) * 0.35); a.l.intensity = 2.4 * e;
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
    { at: p(58.4, 150, 0), r: 7, top: true, run: () => { say('v_beasts'); for (const n of ['Beast_Leopard', 'Beast_Lion', 'Beast_SheWolf']) { const o = find(n); if (o) liven(o, false); } } },
    { at: g(76, 0, 0), r: 4.6, run: () => { say('gate'); note(1); } },
    { at: g(65.5, 0, stairY(65.5)), r: 2.6, run: () => say('v_tunnel') },
    { at: g(55.4, 0, ZF), r: 2.6, run: () => say('v_view', null, true) },                 // the pit opens in front of you
    { at: p(53.3, 147, ZF), r: 2.2, run: () => { say('v_vest', null, true); note(2); } },
    { at: p(53.3, 143, ZF), r: 2.8, run: () => { const o = souls[0]; if (o) liven(o, true); murmur('soul1', o ? o.position : p(54.0, 142.4, ZF)); note(3); } },
    { at: p(53.3, 133.5, ZF), r: 2.8, run: () => { const o = souls[1]; if (o) liven(o, true); murmur('soul2', o ? o.position : p(54.0, 132.8, ZF)); } },
    { at: p(53.25, 126, ZF), r: 3.6, run: () => { const c = find('Charon'); if (c) liven(c, false);
        say('charon', () => note(4), true); say('v_charon', null, true); say('v_task', () => { questOn = true; task(); }, true); } },
  ];
  function triggers() { for (const t of TRIG) if (!t.done && Math.hypot(t.at.x - pos.x, t.at.z - pos.z) < t.r && Math.abs(t.at.y - pos.y) < (t.top ? 1.2 : 3)) { t.done = true; t.run(); } }

  // --- Charon's boat: it will not sail empty. Wake three souls who already wait at the water's edge; they board, then you may ---
  const BOAT_R = 51.85, DOCK = 120, LAND = 83.7, BOAT_YAW = 0.7388;                       // the hull is turned 42 degrees inside its group
  let boat = null, boatA = DOCK, boatY = 0, phase = 'walk', aboard = 0, sailT = 0, side = -1, questOn = false, canBoard = false, nag = 0;
  const quest = [], tv = new THREE.Vector3();
  const seat = (u, out) => { const a = rad(boatA); return out.set(boat.position.x + Math.sin(a) * u, boatY - 0.12, boat.position.z + Math.cos(a) * u); };
  function placeBoat(a) { boatA = a; const q = p(BOAT_R, a, 0); boat.position.x = q.x; boat.position.z = q.z; boat.rotation.set(0, rad(a) - Math.PI / 2 - BOAT_YAW, 0); }
  function setupBoat() {
    boat = ANIM.CharonBoat && ANIM.CharonBoat.o; if (!boat) return; delete ANIM.CharonBoat;        // the game steers it from here on
    boatY = boat.position.y; placeBoat(DOCK);
    const c = find('Charon'); if (c) { boat.updateMatrixWorld(true); c.getWorldPosition(v); const a = rad(boatA); side = (v.x - boat.position.x) * Math.sin(a) + (v.z - boat.position.z) * Math.cos(a) > 0 ? -1 : 1; }
  }
  function setupQuest() {
    // three who wait at the water (right) and two who still run after the flag (wrong), a little past Charon
    const spec = [[116, 1, 's_a', 0.1], [113.4, 0, 'd_a'], [110.5, 1, 's_b', 0.6], [107.3, 0, 'd_b'], [104.5, 1, 's_c', 1.1]];
    for (const [a, ok, line, u] of spec) {
      const o = extract(p(53.2, a, ZF), 4.5, ok ? /Despair|Kneeling|WalkBowed/ : /Running/); if (!o) continue;
      const q = p(ok ? 52.98 : 54.0, a, 0); o.position.x = q.x; o.position.z = q.z;
      if (ok) o.rotation.y = Math.atan2(-q.x, -q.z);                                      // they stand looking at the river
      quest.push({ o, ok, line, u: (u || 0) * side });
    }
  }
  function task() { $('gTask').textContent = !questOn ? '' : aboard < 3 ? `הער שלוש נשמות שמחכות על שפת המים · ${aboard}/3` : 'הסירה מלאה. עלה אליה'; $('gTask').classList.toggle('on', questOn); }
  function runQuest(dt) {
    if (!boat || phase !== 'walk') return;
    if (questOn) { for (const q of quest) { if (q.done) continue;
        if (Math.hypot(q.o.position.x - pos.x, q.o.position.z - pos.z) < 2.1) { q.done = true; liven(q.o, true); murmur(q.line, q.o.position); q.wait = 2.6; } }
      if (aboard < 3 && (nag += dt) > 55) { nag = -1e9; say('v_task'); } }
    for (const q of quest) { if (!q.ok || !q.done || q.on) continue;
      if ((q.wait -= dt) > 0) continue;                                                   // it speaks first, then walks to the boat
      const al = alive.find((x) => x.o === q.o); if (al) al.turn = false;
      seat(q.u, tv); const dx = tv.x - q.o.position.x, dz = tv.z - q.o.position.z, d = Math.hypot(dx, dz);
      if (d > 0.08) { const st = Math.min(d, 1.5 * dt); q.o.position.x += dx / d * st; q.o.position.z += dz / d * st; q.o.position.y += (tv.y - q.o.position.y) * Math.min(1, dt * 3); face(q.o, dx, dz, dt * 5); }
      else { q.on = true; boat.attach(q.o); aboard++; task(); if (aboard === 3) { canBoard = true; say('charon_go', null, true); } } }
    if (canBoard && Math.hypot(boat.position.x - pos.x, boat.position.z - pos.z) < 2.4) board();
  }
  function board() {
    phase = 'sail'; sailT = 0; canBoard = false; questOn = false; task();
    yaw = rad(boatA) + Math.PI; pitch = -0.08;                                           // you sit at the far end from Charon, looking the way the boat goes
    if (guide) { guideRide = true; seat(-0.4 * side, tv); boat.attach(guide); guide.position.copy(boat.worldToLocal(tv.clone())); }
    say('v_boat', null, true);
  }
  function ride(dt) {
    sailT += dt; const total = (DOCK - LAND) * Math.PI / 180 * BOAT_R / 1.8, k = Math.min(1, sailT / total), e = k * k * (3 - 2 * k);
    placeBoat(DOCK + (LAND - DOCK) * e); boat.position.y = boatY + Math.sin(sailT * 1.3) * 0.03;
    seat(1.7 * side, pos); pos.y += 0.05;
    camera.position.set(pos.x, pos.y + EYE - 0.25 + Math.sin(sailT * 1.3) * 0.03, pos.z); camera.rotation.set(pitch, yaw, 0, 'YXZ');
    if (k === 1) land();
  }
  // the stair to the first circle starts on the inner bank at 84 degrees and runs down to 89 (measured in Blender)
  function land() {
    phase = 'landed'; const q = p(50.55, 84.2, 0), gy = groundAt(q.x, ZF, q.z); pos.set(q.x, gy === null ? ZF : gy, q.z);
    yaw = Math.atan2(-Math.sin(rad(84.2)), -Math.cos(rad(84.2))) + Math.PI;               // look down the stair, towards 89 degrees
    if (guide) { scene.attach(guide); const w = p(50.5, 90.4, 0), wy = groundAt(w.x, -14.2, w.z); guide.position.set(w.x, wy === null ? -14.8 : wy, w.z); guide.rotation.set(0, guide.rotation.y, 0); }
    say('v_land', null, true); TRIG.push({ at: p(50.5, 89.3, -14.8), r: 1.3, run: end });
  }

  function end() { game.ended = true; $('gEndN').textContent = `${got.size} מתוך ${NOTES.length} שורות במחברת · המעגל הראשון בהמשך`; $('gEnd').classList.add('on'); if (document.pointerLockElement) document.exitPointerLock(); }

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
    el.addEventListener('wheel', (e) => { if (!game.active || game.ended) return; e.preventDefault(); coast = Math.max(-6, Math.min(6, coast - Math.sign(e.deltaY) * 1.4)); }, { passive: false });
    addEventListener('resize', () => { if (game.active) { camera.fov = 68; camera.updateProjectionMatrix(); } });
  }

  game.start = () => {
    buildCollider(); setupBoat();
    // the two souls that will speak are taken out of the crowd first and stood by the rock wall, clear of the walking lane
    for (const a of [142.4, 132.8]) { const o = extract(p(53.3, a, ZF), 3.2); if (o) { const q = p(54.0, a, 0); o.position.x = q.x; o.position.z = q.z; } souls.push(o); }
    setupQuest(); clearLane(); setupGuide(); bind();
    camera.near = 0.07; camera.fov = 68; camera.updateProjectionMatrix();
    const gy = groundAt(pos.x, 1, pos.z); pos.y = gy === null ? 0 : gy;
    yaw = Math.atan2(pos.x, pos.z);                                                     // face the pit: the gate is straight ahead
    document.body.classList.add('playing');
    game.active = true; note(0); say('v_start');
    if (!matchMedia('(pointer: coarse)').matches) game.lock();
    setTimeout(() => $('gHint').classList.add('seen'), 9000);
  };
  game.update = (dt) => { if (!game.ended) walk(dt); else camera.rotation.set(pitch, yaw, 0, 'YXZ'); moveGuide(dt); triggers(); runQuest(dt); speak(dt); murmuring(dt); stir(dt); };
  // for automated checks: jump to a place on the route
  game.debug = { pos, goto: (r, a, y) => { pos.copy(p(r, a, y)); }, look: (y, x = 0) => { yaw = y; pitch = x; }, state: () => ({ pos: pos.toArray().map((n) => +n.toFixed(2)), yaw: +yaw.toFixed(2), guideAt, got: [...got], queue: queue.length, speaking: speaking && LINES[queue.id], ended: game.ended, phase, aboard, boatA: +boatA.toFixed(1), quest: quest.map((q) => (q.ok ? 'ok' : 'no') + (q.on ? '+' : q.done ? '!' : '')).join(' '), alive: alive.length, tris: game.triangles, cleared: game.cleared, moved: +moved.toFixed(1) }) };
  return game;
}
