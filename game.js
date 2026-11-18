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
  // --- the first circle: Limbo ---
  l_in:     ['וירגיליוס', 'זה המעגל הראשון. אין כאן ייסורים, רק געגוע בלי תקווה. כאן גם ביתי.'],
  l_soul1:  ['נשמה', 'לא חטאנו. רק נולדנו לפני הזמן.'],
  l_soul2:  ['נשמה', 'אין כאן כאב. יש רק געגוע שאין לו סוף.'],
  l_poets:  ['וירגיליוס', 'אלה ארבעת גדולי המשוררים. הם יתעוררו רק לפי סדרם. הקשב למה שכל אחד אומר.'],
  p0:       ['הומרוס', 'אני הראשון. שרתי על מלחמה אחת, ועל דרך ארוכה הביתה.'],
  p1:       ['הורטיוס', 'אני בא אחריו. כל חיי צחקתי על חולשות בני האדם.'],
  p2:       ['אובידיוס', 'שלישי אני. סיפרתי על גופים שהחליפו צורה.'],
  p3:       ['לוקנוס', 'אחרון. שרתי על רומא שנלחמה בעצמה.'],
  l_sixth:  ['וירגיליוס', 'הם מקבלים אותך ביניהם. אתה השישי בחבורה.'],
  l_back:   ['וירגיליוס', 'עכשיו נרד. המדרגות מאחורינו.'],
  l_down:   ['וירגיליוס', 'מכאן מתחיל הגיהנום האמיתי.'],
  // --- the second circle: the lustful ---
  c2_in:    ['וירגיליוס', 'מינוס עומד בפתח ושופט כל נשמה. מספר הפעמים שהוא כורך את זנבו הוא מספר המעגל שאליו תרד.'],
  c2_soul:  ['נשמה', 'אני מחכה לשמוע לאיזה מעגל.'],
  minos:    ['מינוס', 'אתה שבא אל בית הכאב, ראה היטב לאן אתה נכנס, ובמי אתה בוטח!'],
  v_minos:  ['וירגיליוס', 'אל תחסום את דרכו. כך רוצים במקום שבו יכולים כל מה שרוצים.'],
  c2_task:  ['וירגיליוס', 'הבט אל הסערה. מצא את השניים שעפים יחד ואינם נפרדים.'],
  francesca:['פרנצ\'סקה', 'האהבה הובילה אותנו אל מוות אחד.'],
  d_faint:  ['דנטה', 'ונפלתי, כפי שנופל גוף מת.'],
  // --- the third circle: the gluttons ---
  c3_in:    ['וירגיליוס', 'התעוררת. אנחנו במעגל השלישי. הגשם הזה אינו נפסק לעולם.'],
  c3_task:  ['וירגיליוס', 'קרברוס חוסם את הדרך. אסוף חופן בוץ מן האדמה, והשלך אל לועותיו.'],
  c3_empty: ['וירגיליוס', 'לא בידיים ריקות. חפש את הבוץ.'],
  c3_ok:    ['וירגיליוס', 'הוא שותק, כמו כלב שקיבל את מנתו. עבור.'],
  ciacco:   ['צ\'אקו', 'אתה שמובילים אותך דרך הגיהנום הזה, זהה אותי אם תוכל.'],
  c3_end:   ['וירגיליוס', 'הוא לא יקום עוד, עד קול החצוצרה.'],
  c3_out:   ['וירגיליוס', 'בוא. המדרגות הבאות מאחורינו, ליד קרברוס.'],
  // --- the fourth circle: the hoarders and the wasters ---
  c4_in:    ['וירגיליוס', 'כאן מי שאגרו ומי שפיזרו. שני חטאים הפוכים, ועונש אחד.'],
  plutus:   ['פלוטוס', 'פאפה סאטאן, פאפה סאטאן, אלפה!'],
  v_plutus: ['וירגיליוס', 'שתוק, זאב ארור. אכול את עצמך בזעמך.'],
  c4_task:  ['וירגיליוס', 'הם מגלגלים סלעים זה מול זה, לנצח. נסה להעיר אחד מהם. כל אחד.'],
  c4_none:  ['וירגיליוס', 'אי אפשר לזהות אף אחד מהם. חיים בלי הבחנה מחקו את פניהם.'],
  c4_out:   ['וירגיליוס', 'נחזור. המדרגות יורדות מכאן אל הביצה.'],
  // --- the fifth circle: the Styx and the gate of Dis ---
  phlegyas: ['פלגיאס', 'הגעת סוף סוף, נשמה ארורה!'],
  v_phleg:  ['וירגיליוס', 'פלגיאס, הפעם אתה צועק לשווא. נהיה שלך רק עד שנחצה את הביצה.'],
  argenti:  ['פיליפו ארג\'נטי', 'מי אתה, שבא לפני זמנך?'],
  v_arg:    ['וירגיליוס', 'הרחק מכאן, אל שאר הכלבים!'],
  dis_in:   ['וירגיליוס', 'זו העיר דיס. מעבר לחומה הזאת מתחילה התופת התחתונה.'],
  demons:   ['השדים', 'מי זה, שבלי מוות הולך בממלכת המתים?'],
  furies:   ['הפוריות', 'תבוא מדוזה, ונהפוך אותו לאבן!'],
  medusa:   ['וירגיליוס', 'הסתובב! אל תביט אל המגדל! מי שרואה אותה לא שב עוד למעלה.'],
  stone:    ['וירגיליוס', 'אמרתי לך להסתובב. שוב: הפנה את מבטך!'],
  angel_in: ['וירגיליוס', 'עכשיו הבט. מישהו בא על פני המים.'],
  angel:    ['השליח', 'מדוע אתם מתנגדים לרצון שאי אפשר לעצור?'],
  dis_open: ['וירגיליוס', 'השער פתוח. בוא.'],
};
// the notebook: the poem Dante is writing as he goes
const NOTES = [
  ['Nel mezzo del cammin di nostra vita / mi ritrovai per una selva oscura', 'בחצי דרכם של חיינו מצאתי את עצמי ביער אפל', 'א׳, 1–2'],
  ['Lasciate ogne speranza, voi ch\'intrate', 'הניחו כל תקווה, אתם הנכנסים', 'ג׳, 9'],
  ['non ragioniam di lor, ma guarda e passa', 'אל נדבר בהם; הבט, ועבור', 'ג׳, 51'],
  ['Questi non hanno speranza di morte', 'לאלה אין אפילו תקווה למות', 'ג׳, 46'],
  ['Caron dimonio, con occhi di bragia', 'כארון השד, שעיניו גחלים', 'ג׳, 109'],
  ['sì ch\'io fui sesto tra cotanto senno', 'והייתי שישי בין חכמים כאלה', 'ד׳, 102'],
  ['Amor condusse noi ad una morte', 'האהבה הובילה אותנו אל מוות אחד', 'ה׳, 106'],
  ['E caddi come corpo morto cade', 'ונפלתי, כפי שנופל גוף מת', 'ה׳, 142'],
  ['Cerbero, fiera crudele e diversa', 'קרברוס, חיה אכזרית ומשונה', 'ו׳, 13'],
  ['Pape Satàn, pape Satàn aleppe!', 'קריאתו הסתומה של פלוטוס', 'ז׳, 1'],
  ['ad ogne conoscenza or li fa bruni', 'עכשיו הם כהים מכדי שיזהו אותם', 'ז׳, 54'],
  ['Or se\' giunta, anima fella!', 'הגעת סוף סוף, נשמה ארורה!', 'ח׳, 18'],
  ['Volgiti \'n dietro e tien lo viso chiuso', 'פנה לאחור, ועצום את עיניך', 'ט׳, 55'],
];

export function createGame({ scene, camera, renderer, sound, detail, kept, LOD, ANIM }) {
  const game = { active: false, ended: false };
  const $ = (id) => document.getElementById(id);
  const ray = new THREE.Ray(), DOWN = new THREE.Vector3(0, -1, 0), v = new THREE.Vector3(), v2 = new THREE.Vector3();
  let bvh = null;
  const pos = g(84, 0.6, 0), keys = new Set();
  let yaw = 0, pitch = 0, bob = 0, moved = 0, coast = 0, crouch = 0, wakeT = -1;
  const stick = { x: 0, y: 0 }, touches = new Map();

  // --- collision: the rock, the stairs and the gate become one invisible mesh with a BVH ---------
  function buildCollider() {
    const SOLID = /^(Funnel_|Entrance_(Steps|Tunnel|Backing|HellGate)|Kerb_|Stair_|Castle_(?!Stream)|Gate_(Pillar|Lintel))/, chunks = []; let n = 0;
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
        const r = Math.hypot(w.x, w.z); if (r < 40) continue;
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
    // the big figures are solid; Virgil and the souls on the narrow shore are not, or they would block the way
    for (const o of solids) { if (!o.visible) continue; o.getWorldPosition(v); if (Math.abs(v.y - pos.y) > 1.6) continue;
      const R = o.userData.solidR || 0.48, dx = pos.x - v.x, dz = pos.z - v.z, d = Math.hypot(dx, dz); if (d < R && d > 1e-4) { pos.x += dx / d * (R - d); pos.z += dz / d * (R - d); } }
  }
  const solids = [];
  function walk(dt) {
    let f = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) - stick.y;
    let s = (keys.has('KeyD') ? 1 : 0) - (keys.has('KeyA') ? 1 : 0) + stick.x;
    if (keys.has('ArrowLeft')) yaw += dt * 1.9; if (keys.has('ArrowRight')) yaw -= dt * 1.9;
    if (phase === 'sail') return ride(dt);
    if (phase === 'styx') return ride2(dt);
    const m = Math.hypot(f, s); if (m > 1) { f /= m; s /= m; }
    const speed = (wakeT >= 0 && wakeT < 2.6 ? 0 : keys.has('ShiftLeft') || keys.has('ShiftRight') ? 5.6 : 3.1) * dt;
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
    camera.position.set(pos.x, pos.y + EYE - crouch + Math.sin(bob) * 0.028, pos.z);
    camera.rotation.set(pitch, yaw, 0, 'YXZ');
  }

  // --- the guide: Virgil glides ahead and waits at each stop until you come near --------------------
  const PATH = [[g(76.6, 0.9, 0), 1], [g(72.6, 0.2, 0), 0], [g(70, 0, stairY(70)), 1], [g(66, 0, stairY(66)), 0], [g(62, 0, stairY(62)), 1],
    [g(58, 0, stairY(58)), 0], [g(55.2, 0, ZF), 1], [p(53.5, 148.6, ZF), 0], [p(53.35, 145.5, ZF), 1], [p(53.3, 141, ZF), 0],
    [p(53.3, 136, ZF), 1], [p(53.25, 130, ZF), 0], [p(53.25, 124.6, ZF), 1]];
  let guide = null, guideAt = 0, guideLight = null, guideHi = false, guideRide = false;
  function setupGuide() {
    for (const o of kept) if (/^(Dante|Virgil)_/.test(o.userData.name) && o.userData.name !== 'Virgil_Gate') o.visible = false;   // you are Dante; Virgil walks with you
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
    alive.push({ o, turn, t: 0, sy: o.scale.y, c0: o.material.color.clone(), l }); if (o.userData.solidR && !solids.includes(o)) solids.push(o);
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
  const find = (name) => kept.find((o) => o.userData.name === name) || kept.find((o) => (o.userData.name || '').startsWith(name + '_'));   // the beasts are Beast_Lion_01 ...
  const TRIG = [
    { at: p(58.4, 150, 0), r: 7, top: true, run: () => { say('v_beasts'); for (const n of ['Beast_Leopard', 'Beast_Lion', 'Beast_SheWolf']) { const o = find(n); if (o) liven(o, false); } } },
    { at: g(76, 0, 0), r: 4.6, run: () => { say('gate'); note(1); } },
    { at: g(65.5, 0, stairY(65.5)), r: 2.6, run: () => say('v_tunnel') },
    { at: g(55.4, 0, ZF), r: 2.6, run: () => { title('המבוא', 'חוף האכרון'); say('v_view', null, true); } },                 // the pit opens in front of you
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
    say('v_land', null, true); TRIG.push({ at: p(50.5, 89.3, -14.8), r: 1.3, run: enterLimbo });
  }

  // ======================= the circles after the river =========================================
  const L1 = S * -40.6, L2 = S * -49.3;                                                  // floors of Limbo and of the second circle
  const arc = (r, a0, a1, y, n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 3))) => Array.from({ length: n + 1 }, (_, i) => p(r, a0 + (a1 - a0) * i / n, y));
  const stair2 = Array.from({ length: 7 }, (_, i) => p(47.1, 95.6 - i * 0.9, L1 - 0.2 + (L2 - L1) * i / 6));   // top at 96 degrees, foot at 90
  const ROUTES = {
    // the first stair stands on the outer half of the ledge between 84 and 89 degrees: the road passes inside it
    limboIn: [p(50.5, 90.2, L1), p(48.9, 89.6, L1), ...arc(48.7, 88, 82, L1), ...arc(50.0, 79, 60, L1), p(49.8, 57.5, L1)],          // the castle wall starts near 43 degrees: the poets stand before it
    limboOut: [...arc(49.9, 58, 79, L1), ...arc(48.7, 82, 92, L1), p(48.2, 95.0, L1), ...stair2, p(46.6, 89.4, L2)],
    toMinos: [...arc(44.8, 88.5, 81.5, L2)],
    toLovers: [...arc(44.8, 83, 99.5, L2)],
  };
  // the guide takes a new road: he starts at its first point and waits every third point and at the end
  function route(name) { const pts = ROUTES[name]; PATH.length = 0; pts.forEach((q, i) => PATH.push([q, i % 3 === 2 || i === pts.length - 1 ? 1 : 0]));
    guideAt = 0; guideRide = false; if (guide) { if (guide.parent !== scene) scene.attach(guide); guide.rotation.set(0, guide.rotation.y, 0); if (guide.position.distanceTo(pts[0]) > 6) guide.position.copy(pts[0]); } }
  // a lane through the crowd along the roads, so nobody has to walk through statues
  function clearAlong(pts, w, all) {
    const q = new THREE.Vector3(), ab = new THREE.Vector3(), ap = new THREE.Vector3(); let gone = 0;
    for (const e of LOD) {
      let moving = false; for (let o = e.low.parent; o; o = o.parent) if ((o.userData.name || '').startsWith('ANIM_')) moving = true;
      if ((moving && !all) || !/^(Fig_|Char_)/.test(e.key)) continue;
      e.low.updateMatrixWorld(true); let changed = false;
      for (let i = 0; i < e.low.count; i++) { if (e.base[i * 16 + 15] === 0) continue;
        q.fromArray(e.base, i * 16 + 12).applyMatrix4(e.low.matrixWorld);
        for (let k = 0; k + 1 < pts.length; k++) { const a = pts[k], b = pts[k + 1]; if (Math.abs(q.y - (a.y + b.y) / 2) > 1.8) continue;
          ab.subVectors(b, a); ap.subVectors(q, a); const t = Math.max(0, Math.min(1, (ap.x * ab.x + ap.z * ab.z) / (ab.x * ab.x + ab.z * ab.z || 1)));
          if (Math.hypot(ap.x - ab.x * t, ap.z - ab.z * t) < w) { e.base.fill(0, i * 16, i * 16 + 16); e.low.setMatrixAt(i, ZERO); changed = true; gone++; break; } } }
      if (changed) e.low.instanceMatrix.needsUpdate = true;
    }
    return gone;
  }
  // a chapter title that rises and fades when a new place begins
  let titleT = 0;
  function title(big, small) { $('gTitleB').textContent = big; $('gTitleS').textContent = small || ''; $('gTitle').classList.add('on'); clearTimeout(titleT); titleT = setTimeout(() => $('gTitle').classList.remove('on'), 4200); }
  const hud = (text) => { $('gTask').textContent = text || ''; $('gTask').classList.toggle('on', !!text); };
  const save = (cp) => { try { localStorage.setItem('inferno_cp', cp); } catch (e) {} };
  const speaker = (at, reach, to) => { const o = extract(at, reach); if (o && to) { o.position.x = to.x; o.position.z = to.z; } return o; };

  // --- Limbo: the four poets wake only in their own order (Homer, Horace, Ovid, Lucan: Inferno IV, 88-90) ---
  const poets = [], spoke = { l1: null, l2: null, c2: null, c3: null }; let poetAt = 0, poetsOn = false;
  function setupStages() {
    const order = [2, 0, 3, 1];                                                          // who stands where: Ovid, Homer, Lucan, Horace
    order.forEach((rank, i) => { const o = find('Poet_' + i); if (!o) return; scene.attach(o); const q = p(48.55, 54.9 - i * 2.5, 0);
      o.position.x = q.x; o.position.z = q.z; o.userData.fwd = -1; o.userData.solidR = 0.45; o.rotation.set(0, Math.atan2(q.x, q.z), 0); solids.push(o); poets.push({ o, rank, away: true }); });
    spoke.l1 = speaker(p(50.2, 78, L1), 3.5, p(50.65, 78, 0)); spoke.l2 = speaker(p(50.2, 64, L1), 3.5, p(50.65, 64, 0));
    spoke.c2 = speaker(p(45.8, 86, L2), 3, p(45.9, 86, 0));
    game.lane = clearAlong(ROUTES.limboIn, 0.85) + clearAlong(arc(49.75, 58, 46, L1), 0.8) + clearAlong(arc(48.55, 56.5, 46, L1), 0.7) + clearAlong(ROUTES.limboOut, 0.85) + clearAlong(ROUTES.toMinos, 0.6) + clearAlong(ROUTES.toLovers, 0.75);
    setupGluttony(); setupAvarice(); setupStyx();
    for (const n of ['Storm', 'Storm2']) if (ANIM[n]) ANIM[n].p.y += 1.5;                 // the storm flies over your head, not through it
    for (const n of ['Francesca', 'Paolo']) { const o = find(n); if (o) { scene.attach(o); lovers.push({ o, y: o.position.y }); } }
  }
  function enterLimbo() {
    phase = 'limbo'; save('limbo'); title('לימבו', 'המעגל הראשון'); route('limboIn'); say('l_in', null, true);
    TRIG.push({ at: p(50.0, 79.5, L1), r: 2.6, run: () => { if (spoke.l1) liven(spoke.l1, true); murmur('l_soul1', spoke.l1 ? spoke.l1.position : p(50.6, 78, L1)); } },
      { at: p(50.0, 65.5, L1), r: 2.6, run: () => { if (spoke.l2) liven(spoke.l2, true); murmur('l_soul2', spoke.l2 ? spoke.l2.position : p(50.6, 64, L1)); } },
      { at: p(49.8, 59.5, L1), r: 3, run: () => say('l_poets', () => { poetsOn = true; hud('הער את ארבעת המשוררים לפי סדרם · 0/4'); }, true) });
  }
  function runPoets() {
    if (!poetsOn) return;
    for (const q of poets) { const d = Math.hypot(q.o.position.x - pos.x, q.o.position.z - pos.z);
      if (d > 2.6) { q.away = true; continue; } if (d > 1.7 || !q.away || q.woke) continue;
      q.away = false;
      if (q.rank === poetAt) { q.woke = true; liven(q.o, true); murmur('p' + q.rank, q.o.position); poetAt++; hud(`הער את ארבעת המשוררים לפי סדרם · ${poetAt}/4`);
        if (poetAt === 4) { poetsOn = false; hud(''); say('l_sixth', () => { note(5); route('limboOut'); say('l_back', null, true);
          TRIG.push({ at: p(47.3, 95.4, L1), r: 1.5, run: () => say('l_down') }, { at: p(46.9, 90.0, L2), r: 1.4, run: enterLust }); }, true); } }
      else murmur('p' + q.rank, q.o.position);                                             // out of turn: he speaks, and stays stone
    }
  }

  // --- the second circle: Minos at the door, then the two who fly together in the storm (Inferno V) ---
  const lovers = []; let loversOn = false, loversDown = 0, faintT = -1;
  function enterLust() {
    phase = 'lust'; save('lust'); title('התאוותנים', 'המעגל השני'); route('toMinos'); say('c2_in', null, true);
    TRIG.push({ at: p(44.8, 86.5, L2), r: 2.4, run: () => { if (spoke.c2) liven(spoke.c2, true); murmur('c2_soul', spoke.c2 ? spoke.c2.position : p(45.9, 86, L2)); } },
      { at: p(44.8, 81.5, L2), r: 3, run: () => { const m = find('Minos'); if (m) { m.userData.solidR = 0.9; liven(m, false); }
        say('minos', null, true); say('v_minos', null, true); say('c2_task', () => { loversOn = true; hud('מצא בסערה את השניים שעפים יחד'); route('toLovers'); }, true); } });
  }
  function runLovers(dt) {
    for (const l of lovers) l.o.position.y = l.y + Math.sin(performance.now() / 900 + l.y) * 0.12 - loversDown;        // they drift, and come down when called
    if (!lovers.length) return;
    const o = lovers[0].o, d = Math.hypot(o.position.x - pos.x, o.position.z - pos.z);
    if (loversOn && d < 3.4 && Math.abs(pos.y - L2) < 1.5) { loversOn = false; hud(''); for (const l of lovers) liven(l.o, false);
      faintT = -2; say('francesca', () => { note(6); say('d_faint', () => { note(7); faintT = 0; }, true); }, true); }
    if (faintT === -2) loversDown = Math.min(1.75, loversDown + dt * 0.9);
    if (faintT >= 0) { faintT += dt; $('gFade').style.opacity = Math.min(1, faintT / 2.6); pitch = Math.min(1.2, pitch + dt * 0.35);
      if (faintT > 3.2) { faintT = -1; enterGluttony(true); } }
  }
  // the figures the game handles one by one are shown in their detailed version as soon as it has loaded
  let upT = 0;
  function upgrade(dt) { if ((upT += dt) < 1) return; upT = 0;
    for (const o of kept) { if (o.userData.hi || !o.visible || o === guide || !detail.has(o.userData.meshKey)) continue;
      const [geo, mat] = detail.get(o.userData.meshKey)[0], c = o.material.color ? o.material.color.clone() : null; o.geometry = geo; o.material = mat.clone(); if (c && alive.some((a) => a.o === o)) o.material.color.copy(c); o.userData.hi = true; } }
  function stages(dt) { upgrade(dt); if (phase === 'limbo') runPoets(); runLovers(dt); if (phase === 'gluttony') runGluttony(dt); if (phase === 'avarice') runAvarice(dt); }

  // --- the third circle: you come to under the rain; Cerberus bars the way until he is fed a fistful of mud (Inferno VI, 22-33) ---
  const L3 = S * -58; let cerb = null, mud = false, fed = false, c3On = false, nagged = false; const mounds = [], shots = [];
  ROUTES.c3 = [p(41.8, 92.6, L3), ...arc(41.6, 94, 97, L3)];
  ROUTES.c3b = [...arc(41.3, 98, 107.5, L3)];
  function setupGluttony() {
    cerb = find('Cerberus'); if (cerb) { cerb.userData.solidR = 2.5; solids.push(cerb); }
    game.lane += clearAlong(arc(41.6, 89.5, 109, L3), 0.85);
    spoke.c3 = speaker(p(42.4, 106.5, L3), 3.5, p(42.6, 106.5, 0));
    const geo = new THREE.SphereGeometry(0.3, 12, 6);
    for (const [r, a] of [[40.9, 93.6], [43.3, 94.6], [43.2, 92.4]]) { const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x2c1d12, roughness: 0.5, emissive: 0x7a5a26, emissiveIntensity: 0 }));
      m.position.copy(p(r, a, L3 + 0.04)); m.scale.set(1, 0.4, 1); m.visible = false; scene.add(m); mounds.push(m); }
  }
  function enterGluttony(fromFaint) {
    phase = 'gluttony'; save('gluttony'); title('הגרגרנים', 'המעגל השלישי');
    const q = p(42.2, 91.2, L3), gy = groundAt(q.x, L3, q.z); pos.set(q.x, gy === null ? L3 : gy, q.z); yaw = rad(91.2); pitch = fromFaint ? 0.9 : 0;
    if (fromFaint) { wakeT = 0; crouch = 1.15; }
    route('c3'); if (guide) guide.position.copy(ROUTES.c3[0]);
    say('c3_in', null, true); say('c3_task', () => { c3On = true; for (const m of mounds) m.visible = true; hud('אסוף חופן בוץ והשלך אותו לקרברוס'); }, true);
  }
  function runGluttony(dt) {
    if (wakeT >= 0) { wakeT += dt; const k = Math.min(1, wakeT / 4.2), e = k * k * (3 - 2 * k);                   // you open your eyes and get up
      $('gFade').style.opacity = Math.max(0, 1 - Math.max(0, wakeT - 0.6) / 2.4); crouch = 1.15 * (1 - e); if (wakeT < 4.2) pitch = 0.9 * (1 - e); else wakeT = -1; }
    for (const m of mounds) if (m.visible) { m.material.emissiveIntensity = 0.5 + 0.35 * Math.sin(performance.now() / 420 + m.position.x);
      if (c3On && !mud && !fed && Math.hypot(m.position.x - pos.x, m.position.z - pos.z) < 0.95) { mud = true; m.visible = false; hud('בידך חופן בוץ. התקרב לקרברוס'); } }
    if (cerb && c3On && !fed) { cerb.getWorldPosition(v); const d = Math.hypot(v.x - pos.x, v.z - pos.z);
      if (d < 3.7 && mud) { mud = false; fed = true; hud('');                                                      // the throw
        const ball = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), new THREE.MeshStandardMaterial({ color: 0x2c1d12, roughness: 0.6 })); scene.add(ball);
        shots.push({ ball, t: 0, from: camera.position.clone(), to: new THREE.Vector3(v.x, v.y + 1.5, v.z) }); }
      else if (d < 3.2 && !nagged) { nagged = true; say('c3_empty'); } }
    for (let i = shots.length - 1; i >= 0; i--) { const sh = shots[i]; sh.t += dt / 0.55; const t = Math.min(1, sh.t);
      sh.ball.position.lerpVectors(sh.from, sh.to, t); sh.ball.position.y += Math.sin(t * Math.PI) * 0.9;
      if (t === 1) { scene.remove(sh.ball); shots.splice(i, 1); calm(); } }
  }
  function calm() {
    if (cerb) { liven(cerb, false); cerb.userData.solidR = 1.15; }
    note(8); say('c3_ok', null, true); route('c3b');
    TRIG.push({ at: p(41.6, 105, L3), r: 2.6, run: () => { if (spoke.c3) liven(spoke.c3, true); say('ciacco', null, true); say('c3_end', null, true); say('c3_out', leaveGluttony, true); } });
  }

  // --- the fourth circle: Plutus collapses at a word; the pushers cannot be woken, because nobody can tell them apart (Inferno VII) ---
  const L4 = S * -66.7; let plutus = null, plutusDown = -1, c4On = false, tried = []; const pushers = [];
  const stair4 = Array.from({ length: 7 }, (_, i) => p(40.05, 95.6 - i * 1.0, L3 - 0.2 + (L4 - L3) * i / 6));   // top at 96 degrees, foot at 89
  ROUTES.c3out = [...arc(40.95, 105, 97.5, L3), p(40.5, 96.4, L3), ...stair4, p(39.6, 88.6, L4)];
  ROUTES.toPlutus = [...arc(38.7, 88, 67, L4)];
  ROUTES.c4 = [...arc(38.3, 64, 46, L4)];
  function setupAvarice() {
    plutus = find('Plutus'); if (plutus) { plutus.userData.solidR = 1.5; solids.push(plutus); }
    game.lane += clearAlong(ROUTES.c3out, 0.8) + clearAlong([...ROUTES.toPlutus, ...ROUTES.c4, ...ROUTES.c4out], 0.9, true);
    // the two rows stand still in the game, so that the lane stays open; the boulders along it are cleared like the statues
    const road = [...ROUTES.toPlutus, ...ROUTES.c4, ...ROUTES.c4out], lows = new Set(LOD.map((e) => e.low)), q = new THREE.Vector3(), m = new THREE.Matrix4();
    for (const n of ['Pushers1', 'Pushers2']) { const a = ANIM[n]; if (!a) continue; delete ANIM[n]; a.o.updateMatrixWorld(true);
      a.o.traverse((c) => { if (!c.isInstancedMesh || lows.has(c)) return; let changed = false;
        for (let i = 0; i < c.count; i++) { c.getMatrixAt(i, m); q.setFromMatrixPosition(m).applyMatrix4(c.matrixWorld); if (q.lengthSq() < 1) continue;
          let near = false; for (const w of road) if (Math.hypot(w.x - q.x, w.z - q.z) < 1.25) { near = true; break; }
          if (near) { c.setMatrixAt(i, ZERO); changed = true; } else { const k = cell(q.x, q.z); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(q.x, q.y, q.z); } }
        if (changed) c.instanceMatrix.needsUpdate = true; }); }
    for (const e of LOD) { if (e.key !== 'Fig_Pushing_nb') continue; e.low.updateMatrixWorld(true);
      for (let i = 0; i < e.low.count; i++) { if (e.base[i * 16 + 15] === 0) continue; q.fromArray(e.base, i * 16 + 12).applyMatrix4(e.low.matrixWorld);
        const a = (Math.atan2(-q.z, q.x) * 180 / Math.PI + 360) % 360; if (a > 40 && a < 70 && Math.abs(q.y - L4) < 1.5) pushers.push(q.clone()); } }
  }
  function leaveGluttony() { route('c3out'); TRIG.push({ at: p(39.9, 89.2, L4), r: 1.4, run: enterAvarice }); }
  function enterAvarice() {
    phase = 'avarice'; save('avarice'); title('הקמצנים והבזבזנים', 'המעגל הרביעי'); route('toPlutus'); say('c4_in', null, true);
    TRIG.push({ at: p(38.7, 67.5, L4), r: 3.2, run: () => { if (plutus) liven(plutus, false);
      say('plutus', () => note(9), true); say('v_plutus', () => { plutusDown = 0; }, true);
      say('c4_task', () => { c4On = true; route('c4'); hud('נסה להעיר את דוחפי הסלעים · 0/3'); }, true); } });
  }
  const dull = [];
  function runAvarice(dt) {
    if (plutus && plutusDown >= 0 && plutusDown < 1) { plutusDown = Math.min(1, plutusDown + dt / 1.4);                 // he falls like sails when the mast snaps
      const a = alive.find((x) => x.o === plutus), k = plutusDown * plutusDown; if (a) a.sy = (a.sy0 = a.sy0 || a.sy) * (1 - 0.6 * k); plutus.rotation.z = 0.5 * k; plutus.userData.solidR = 1.5 - 1.1 * k; }
    for (let i = dull.length - 1; i >= 0; i--) { const d = dull[i]; d.t += dt; d.l.intensity = 3 * Math.max(0, 1 - d.t / 1.6) * (0.6 + 0.4 * Math.sin(d.t * 30)); if (d.t > 1.6) { scene.remove(d.l); dull.splice(i, 1); } }
    if (!c4On) return;
    for (const q of pushers) { if (Math.hypot(q.x - pos.x, q.z - pos.z) > 1.7 || tried.some((t) => t.distanceTo(q) < 2.5)) continue;
      tried.push(q); const l = new THREE.PointLight(0x9aa2b0, 0, 5, 1.8); l.position.set(q.x, q.y + 1.8, q.z); scene.add(l); dull.push({ l, t: 0 });   // a cold flicker, and nothing
      hud(`נסה להעיר את דוחפי הסלעים · ${tried.length}/3`);
      if (tried.length === 3) { c4On = false; hud(''); say('c4_none', () => note(10), true); say('c4_out', leaveAvarice, true); } break; }
  }

  // --- the fifth circle: the stair ends in the marsh, so it is all done from Phlegyas' boat: the crossing, the shut gate of Dis,
  //     Medusa (turn your eyes away), and the messenger who opens the gate with a touch (Inferno VIII-IX) ---
  const L5 = S * -75.2, B2R = 35.6, B2_YAW = 0.1684, GATE_A = 55, DIS = p(33.9, GATE_A, L5 + 4);
  const stair5 = Array.from({ length: 7 }, (_, i) => p(36.52, 84.4 + i * 1.0, L4 - 0.2 + (L5 - L4) * i / 6));    // top at 84 degrees, foot at 91
  ROUTES.c4out = [...arc(38.3, 46, 82, L4), p(37.3, 83.8, L4), ...stair5];
  let b2 = null, b2A = 92, b2Y = 0, sail2 = -1, disT = -1, medT = -1, angel = null, angelT = -1, doorT = -1, stoned = -1, glow = null, doors = [], argentiSaid = false;
  function placeB2(a, out = 0) { b2A = a; const q = p(B2R + out, a, 0); b2.position.x = q.x; b2.position.z = q.z; b2.rotation.set(0, rad(a) - Math.PI / 2 - B2_YAW, 0); }
  const seat2 = (u, out) => { const a = rad(b2A); return out.set(b2.position.x + Math.sin(a) * u, b2Y - 0.12, b2.position.z + Math.cos(a) * u); };
  function setupStyx() {
    b2 = ANIM.PhlegyasBoat && ANIM.PhlegyasBoat.o; if (b2) { delete ANIM.PhlegyasBoat; b2Y = b2.position.y; }
    angel = find('Heavenly_Messenger'); if (angel) { scene.attach(angel); angel.visible = false; }
    scene.traverse((o) => { if (o.isMesh && /^Dis_Gate_Door/.test(o.userData.name || '')) doors.push(o); });
    glow = new THREE.PointLight(0x7dff8a, 0, 26, 1.4); glow.position.copy(p(33.9, GATE_A, -17.2)); scene.add(glow);
  }
  function leaveAvarice() { route('c4out'); TRIG.push({ at: p(36.5, 89.6, L5 + 0.4), r: 1.5, run: enterStyx }); }
  function enterStyx() {
    phase = 'styx'; save('styx'); title('הסטיקס', 'המעגל החמישי'); hud('');
    if (b2) placeB2(91.5); sail2 = 0; yaw = rad(91.5) + Math.PI; pitch = -0.05;
    if (guide && b2) { guideRide = true; seat2(0.35, tv); b2.attach(guide); guide.position.copy(b2.worldToLocal(tv.clone())); }
    say('phlegyas', () => note(11), true); say('v_phleg', null, true);
  }
  function ride2(dt) {
    if (!b2) return;
    if (sail2 >= 0) { sail2 += dt; const total = (91.5 - 62.5) * Math.PI / 180 * B2R / 1.45, k = Math.min(1, Math.max(0, sail2 - 2.5) / total), e = k * k * (3 - 2 * k);
      placeB2(91.5 + (62.5 - 91.5) * e, 0.75 * e);                                         // it stops a few metres short of the gate, out in the marsh, so the wall and the tower are in view
      if (k > 0.42 && !argentiSaid) { argentiSaid = true; say('argenti', null, true); say('v_arg', null, true); }
      if (k === 1) { sail2 = -1; disT = 0; say('dis_in', null, true); say('demons', null, true); say('furies', null, true); say('medusa', () => { medT = 0; hud('הסתובב! אל תביט אל המגדל'); }, true); } }
    b2.position.y = b2Y + Math.sin(performance.now() / 770) * 0.03;
    seat2(1.25, pos); pos.y += 0.05;
    camera.position.set(pos.x, pos.y + EYE - 0.25, pos.z); camera.rotation.set(pitch, yaw, 0, 'YXZ');
    // Medusa: five seconds of rising green light; when it peaks you must be looking away from the tower, and stay so for three more
    const gx = DIS.x - pos.x, gz = DIS.z - pos.z, gl = Math.hypot(gx, gz) || 1, facing = (-Math.sin(yaw) * gx - Math.cos(yaw) * gz) / gl > -0.1;
    if (medT >= 0) { medT += dt; glow.intensity = 60 * Math.min(1, medT / 5) * (0.85 + 0.15 * Math.sin(medT * 9));
      if (medT > 5 && facing) { medT = -1; stoned = 0; hud(''); }
      else if (medT > 8) { medT = -1; glow.intensity = 0; hud(''); note(12); say('angel_in', () => { angelT = 0; if (angel) { angel.visible = true; liven(angel, false); } }, true); } }
    if (stoned >= 0) { stoned += dt; const f = $('gFade'); f.style.background = '#8d8d88'; f.style.opacity = Math.min(1, stoned / 0.9) * (stoned > 2.6 ? Math.max(0, 1 - (stoned - 2.6) / 1.2) : 1);   // you turn to stone, then it is undone
      glow.intensity = Math.max(0, glow.intensity - dt * 40);
      if (stoned > 3.8) { stoned = -1; f.style.background = '#000'; f.style.opacity = 0; say('stone', () => { medT = 0; hud('הסתובב! אל תביט אל המגדל'); }, true); } }
    if (angelT >= 0 && angel) { angelT += dt; const k = Math.min(1, angelT / 6), e = k * k * (3 - 2 * k), q = p(35.4 - 0.75 * e, 80 - (80 - 55.6) * e, 0);
      angel.position.x = q.x; angel.position.z = q.z;
      if (k === 1) { angelT = -1; say('angel', () => { doorT = 0; }, true); } }
    if (doorT >= 0) { doorT += dt; for (const d of doors) d.position.y -= dt * 0.9;                                    // the doors sink away
      if (doorT > 3.2) { doorT = -1; for (const d of doors) d.visible = false; say('dis_open', () => end('סוף הפרק הראשון'), true); } }
  }

  function end(title) { game.ended = true; if (typeof title === 'string') { $('gEnd').querySelector('h2').textContent = title; try { localStorage.removeItem('inferno_cp'); } catch (e) {} } $('gEndN').textContent = `${got.size} מתוך ${NOTES.length} שורות במחברת · המעגל הראשון בהמשך`; $('gEnd').classList.add('on'); if (document.pointerLockElement) document.exitPointerLock(); }

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

  // where a saved game picks up: how many notebook lines you already hold, where you stand, what begins
  const CPS = { limbo: [5, p(50.5, 89.3, L1), enterLimbo], lust: [6, p(46.9, 90.0, L2), enterLust], gluttony: [8, p(42.2, 91.2, L3), () => enterGluttony(false)], avarice: [9, p(39.9, 89.2, L4), enterAvarice], styx: [11, p(36.5, 90.3, L5), enterStyx] };
  game.saved = () => { try { return localStorage.getItem('inferno_cp'); } catch (e) { return null; } };
  game.start = (cp) => {
    buildCollider(); setupBoat();
    // the two souls that will speak are taken out of the crowd first and stood by the rock wall, clear of the walking lane
    for (const a of [142.4, 132.8]) { const o = extract(p(53.3, a, ZF), 3.2); if (o) { const q = p(54.0, a, 0); o.position.x = q.x; o.position.z = q.z; } souls.push(o); }
    setupQuest(); setupStages(); clearLane(); setupGuide(); bind();
    camera.near = 0.07; camera.fov = 68; camera.updateProjectionMatrix();
    const gy = groundAt(pos.x, 1, pos.z); pos.y = gy === null ? 0 : gy;
    yaw = Math.atan2(pos.x, pos.z);                                                     // face the pit: the gate is straight ahead
    document.body.classList.add('playing');
    game.active = true; note(0);
    if (CPS[cp]) {                          // pick up where the last visit stopped
      for (const t of TRIG) t.done = true; for (let i = 1; i < CPS[cp][0]; i++) note(i);
      if (boat) placeBoat(LAND);
      const q = CPS[cp][1]; pos.copy(q); const y0 = groundAt(q.x, q.y, q.z); if (y0 !== null) pos.y = y0;
      yaw = rad(90) + Math.PI;                                                          // both roads start towards the smaller angles
      CPS[cp][2]();
      if (guide) guide.position.copy(PATH[0][0]);
    } else { say('v_start'); title('היער האפל', 'בחצי דרכם של חיינו'); }
    if (!matchMedia('(pointer: coarse)').matches) game.lock();
    setTimeout(() => $('gHint').classList.add('seen'), 9000);
  };
  game.update = (dt) => { if (!game.ended) walk(dt); else camera.rotation.set(pitch, yaw, 0, 'YXZ'); moveGuide(dt); triggers(); runQuest(dt); stages(dt); speak(dt); murmuring(dt); stir(dt); };
  // for automated checks: jump to a place on the route
  game.debug = { pos, goto: (r, a, y) => { pos.copy(p(r, a, y)); }, figs: () => kept.filter((k) => k.visible && !/^(Dante|Virgil)_/.test(k.userData.name)).map((k) => k.userData.name + ':' + k.userData.meshKey + ':' + (k.userData.hi ? 'hi' : 'lo') + ':' + k.geometry.attributes.position.count), ground: (r, a, y) => { const q = p(r, a, y); return groundAt(q.x, y, q.z); }, look: (y, x = 0) => { yaw = y; pitch = x; }, state: () => ({ pos: pos.toArray().map((n) => +n.toFixed(2)), yaw: +yaw.toFixed(2), guideAt, got: [...got], queue: queue.length, speaking: speaking && LINES[queue.id], ended: game.ended, sail2: +sail2.toFixed(1), medT: +medT.toFixed(1), stoned: +stoned.toFixed(1), angelT: +angelT.toFixed(1), doors: doors.length, tried: tried.length, pushers: pushers.length, mud, fed, lane: game.lane, poetAt, lovers: lovers.length, phase, aboard, boatA: +boatA.toFixed(1), quest: quest.map((q) => (q.ok ? 'ok' : 'no') + (q.on ? '+' : q.done ? '!' : '')).join(' '), alive: alive.length, tris: game.triangles, cleared: game.cleared, moved: +moved.toFixed(1) }) };
  return game;
}
