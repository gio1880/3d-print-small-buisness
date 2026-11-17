// Shared kit for the big-eye animals: shapes, the print-in-place joint, the eye, checks, STL + PNG output.
import Module from 'manifold-3d';
import fs from 'fs';
import zlib from 'zlib';
const wasm = await Module(); wasm.setup();
export const { Manifold, CrossSection } = wasm;

// ---------- basic shapes (mm, head toward +x, z up, plate at z=0)
const SEG = 48;
export const U = (...m) => Manifold.union(m.flat());
export const hull = (...m) => Manifold.hull(m.flat());
export const E = (c, r) => Manifold.sphere(1, SEG).scale(r).translate(c);
export const S = (c, r) => Manifold.sphere(r, 32).translate(c);
export const cap = (p1, r1, p2, r2) => hull(S(p1, r1), S(p2, r2));
export const cyl = (c, r, h, r2 = r) => Manifold.cylinder(h, r, r2, 64).translate(c);
export const floorCut = m => m.trimByPlane([0, 0, 1], 0);
export const chain = list => U(list.slice(1).map((m, i) => hull(list[i], m)));
// body cross-section blob with a wide flat foot so walls start near-vertical on the plate
export const station = (x, ry, h, rx = 5) => hull(E([x, 0, h / 2], [rx, ry, h / 2]), E([x, 0, 0], [rx * 0.85, ry * 0.8, 0.3]));
export const headSolid = (c, r, foot = 0.8) => hull(E(c, r), E([c[0], c[1], 0], [r[0] * foot, r[1] * foot, 0.3]));
export const scaleAbout = (m, c, f) => m.translate([-c[0], -c[1], -c[2]]).scale(f).translate(c);
export const rotZAbout = (m, px, deg) => m.translate([-px, 0, 0]).rotate([0, 0, deg]).translate([px, 0, 0]);
const poly = pts => { let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; } return new CrossSection([a < 0 ? pts.slice().reverse() : pts]); };
export const vol = m => m.volume();
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = a => { const l = Math.hypot(...a); return a.map(x => x / l); };

// ---------- the joint: a vertical pin inside a tented pocket, a flat ring around it. No supports, no bridges over 8 mm.
// Locking pin (17 Nov 2026): the first printed dragon came apart because the pin was a straight post and the ring sat on
// the plate with nothing under it, so a link lifted straight off. Now the pin bulges in the middle (45° slopes, prints
// without support) and the ring's hole is the pin's shape grown by GAP all round, so the ring is trapped above and below.
// ROUT/POCK grew 0.25 mm to keep the ring wall over 1 mm around the wider hole.
export const J = { PIN: 1.6, BULGE: 2.7, GAP: 0.45, RIN: 2.45, ROUT: 4.3, POCK: 4.75, ARC: 5.9, BITE: 6.7, RH: 3.0, PZ: 3.6, TW: 3.0, SLOT: 48, PHI: 25 };
const circ = (px, r) => CrossSection.circle(r, 72).translate([px, 0]);
const wedge = (px, deg, L) => { const a = deg * Math.PI / 180; return poly([[px, 0], [px - L * Math.cos(a), -L * Math.sin(a)], [px - 3 * L, 0], [px - L * Math.cos(a), L * Math.sin(a)]]); };
export const frontRegion = px => poly([[px, -400], [px + 400, -400], [px + 400, 400], [px, 400]]).add(circ(px, J.ARC));
export const rearRegion = px => wedge(px, 90 - J.PHI, 200).subtract(circ(px, J.BITE));
export const tall = cs => cs.extrude(90).translate([0, 0, -1]);
// pin radius by height: base PIN, out at 45° to BULGE, straight, back in at 45° to PIN, then straight to the top
const pinR = z => { const a = J.BULGE - J.PIN, z1 = a, z2 = a + 0.6, z3 = 2 * a + 0.6; return z < 0 ? J.PIN : z < z1 ? J.PIN + z : z < z2 ? J.BULGE : z < z3 ? J.BULGE - (z - z2) : J.PIN; };
// the pin grown by g in every direction (a ball of radius g rolled over it): the ring's hole
function pinShape(px, g) {
  const top = J.PZ + J.POCK + 0.3, pts = [[0, g ? -1 : 0]];
  for (let z = g ? -1 : 0; z <= top + 1e-6; z += 0.05) {
    let r = g ? 0 : pinR(z);
    if (g) for (let dz = -g; dz <= g + 1e-9; dz += g / 12) r = Math.max(r, pinR(Math.min(top, Math.max(0, z + dz))) + Math.sqrt(Math.max(0, g * g - dz * dz)));
    pts.push([r, z]);
  }
  pts.push([0, top]);
  return Manifold.revolve(poly(pts), 72).translate([px, 0, 0]);
}
export function jointParts(px, { cap = false, flat = null } = {}) {
  // slot roof (support check 17 Nov 2026): the slot the tongue swings in used to have a flat 1.5 mm-wide ceiling
  // 0.6 mm above the tongue, an 8.4 mm bridge that could sag onto it. Now it is a 45° tent rising from both slot sides
  // (peak about 8 mm up at the back edge). Where the piece is too low for that (the birds' rump, the turtle's tail joint),
  // Birds (cap: true) clip it with a shallow cone (z <= 9.6 - 0.9 r): a short lintel 1.3 mm above the tongue; their rump is a
  // full circle, so the lintel has side walls to hang from. Spine animals use flat: z instead where the tent is too tall:
  // a short bridge between the slot walls. (A cone there floats where the body narrows behind the pin.) flexi() picks z.
  const sl = J.SLOT * Math.PI / 180;
  let roof = Manifold.hull([wedge(px, J.SLOT, 12).extrude(0.05).translate([0, 0, J.PZ - 0.05]), Manifold.cube([0.01, 0.01, 0.01]).translate([px - 8, 0, J.PZ + 8 * Math.sin(sl)])]);
  if (cap) roof = roof.intersect(cyl([px, 0, 0], 9.6 / 0.9, 9.6, 0));
  if (flat) roof = roof.trimByPlane([0, 0, -1], -flat);
  const pocket = U(cyl([px, 0, -1], J.POCK, J.PZ + 1), cyl([px, 0, J.PZ - 0.05], J.POCK, J.POCK, 0),
    wedge(px, J.SLOT, 12).extrude(J.PZ + 1).translate([0, 0, -1]), roof);
  const pin = pinShape(px, 0), hole = pinShape(px, J.GAP);
  const ring = circ(px, J.ROUT).extrude(J.RH).subtract(hole);
  const tongue = Manifold.cube([J.BITE + 2.2 - J.RIN - 0.6, J.TW, J.RH]).translate([px - J.BITE - 2.2, -J.TW / 2, 0]).subtract(hole);
  // shell that must be covered by the sculpt so the pocket never breaks through the skin
  const guard = U(cyl([px, 0, 0.2], J.POCK + 0.8, J.PZ), cyl([px, 0, J.PZ + 0.2], J.POCK + 0.8, J.POCK + 0.8, 0.3));
  // roofGuard: the roof lifted 1 mm along its ridge (|y| < 1.2, r < 5.4); if any of it is outside the piece, the tent would
  // poke through the top skin. (Out at the slot edges the slot is open to the side anyway, so those don't count.)
  const roofGuard = roof.translate([0, 0, 1.0]).intersect(cyl([px, 0, J.PZ + 0.3], 5.4, 30)).intersect(Manifold.cube([20, 2.4, 40], true).translate([px, 0, 20]));
  return { pocket, pin, ring, tongue, guard, roofGuard };
}

export function surf(H, from, dir) {
  const d = norm(dir); let lo = 0, hi = 60;
  for (let i = 0; i < 22; i++) { const t = (lo + hi) / 2; if (vol(H.intersect(S([from[0] + d[0] * t, from[1] + d[1] * t, from[2] + d[2] * t], 0.12))) > 1e-7) lo = t; else hi = t; }
  return [from[0] + d[0] * lo, from[1] + d[1] * lo, from[2] + d[2] * lo];
}
// a thin raised line on the skin (smiles): balls along surface points, trimmed to sit about 0.3 mm proud
export function skinLine(H, hc, thetas, zf, r = 0.85) {
  const pts = thetas.map(th => { const a = th * Math.PI / 180; return surf(H, [hc[0], 0, zf(th)], [Math.cos(a), Math.sin(a), 0]); });
  const raw = chain(pts.map(p => S(p, r)));
  return { m: raw.intersect(scaleAbout(H, hc, 1.03)), p: raw };
}
// ---------- the eye: white oval, big black pupil low and forward, one white shine dot. Raised 0.5 mm, 2 mm deep.
export function eye(H, hc, e, o) {
  const d = norm(e);
  let lo = 0, hi = 60;
  for (let i = 0; i < 22; i++) { const t = (lo + hi) / 2; if (vol(H.intersect(S([hc[0] + d[0] * t, hc[1] + d[1] * t, hc[2] + d[2] * t], 0.12))) > 1e-7) lo = t; else hi = t; }
  const t = lo, c = [hc[0] + d[0] * t, hc[1] + d[1] * t, hc[2] + d[2] * t];
  const n = o.normal ? norm(o.normal) : d;
  const v = norm(sub([0, 0, 1], n.map(x => x * n[2]))), u = cross(v, n);
  const s = Math.sign(dot(u, o.toward)) || 1;
  const M = [...u, 0, ...v, 0, ...n, 0, ...c, 1];
  const prism = (ax, ay, ox, oy) => CrossSection.circle(1, 64).scale([ax, ay]).translate([ox, oy]).extrude(12).translate([0, 0, -8]).transform(M);
  const inner = scaleAbout(H, hc, 1 - 1.6 / t), shell = scaleAbout(H, hc, 1 + (o.raise ?? 0.5) / t).subtract(inner), fat = scaleAbout(H, hc, 1 + 2.5 / t).subtract(inner);
  const [w, h] = o.size, k = o.pupil ?? [0.56, 0.62], off = o.off ?? [0.2, -0.1];
  const px = s * off[0] * w, py = off[1] * h, pw = k[0] * w, ph = k[1] * h;
  const hl = o.hl ?? [-0.32, 0.42];
  return {
    at: c, items: [
      // optional dark patch behind the eye (panda): [half-width, half-height, shift outward, shift up]
      ...(o.patch ? [{ c: 'black', m: prism(o.patch[0], o.patch[1], -s * o.patch[2], o.patch[3]).intersect(shell), p: prism(o.patch[0] + 0.06, o.patch[1] + 0.06, -s * o.patch[2], o.patch[3]).intersect(fat) }] : []),
      { c: 'white', m: prism(w, h, 0, 0).intersect(shell), p: prism(w + 0.06, h + 0.06, 0, 0).intersect(fat) },
      { c: 'black', p: prism(pw, ph, px, py).intersect(fat) },
      { c: 'white', p: prism(o.dot ?? 1.0, o.dot ?? 1.0, px + s * hl[0] * pw, py + hl[1] * ph).intersect(fat) },
    ]
  };
}

// ---------- colour bookkeeping: later items paint over earlier ones
export function paint(total, items, hardware) {
  let W = null, K = null;
  for (const it of items) {
    const v = it.p || it.m;
    if (it.c === 'white') { if (K) K = K.subtract(v); W = W ? W.add(v) : v; }
    else if (it.c === 'black') { if (W) W = W.subtract(v); K = K ? K.add(v) : v; }
  }
  const none = Manifold.cube([1, 1, 1]).translate([0, 0, -50]).intersect(Manifold.cube([1, 1, 1]));
  if (hardware) { if (W) W = W.subtract(hardware); if (K) K = K.subtract(hardware); }
  let body = total; if (W) body = body.subtract(W); if (K) body = body.subtract(K);
  return { body, white: W ? W.intersect(total) : none, black: K ? K.intersect(total) : none };
}

// ---------- support check (17 Nov 2026): slice at 0.2 mm layers as the piece sits on the plate; see supports.mjs
export const LAYER = 0.2, D = LAYER * Math.tan(55 * Math.PI / 180);

// widest the region is, from the inside: largest r where offset(-r) still leaves something
function width(cs) { let lo = 0, hi = 15; for (let i = 0; i < 12; i++) { const r = (lo + hi) / 2; if (cs.offset(-r, 'Round').isEmpty()) hi = r; else lo = r; } return 2 * lo; }
const bb = cs => { const b = cs.bounds(); return [b.min[0], b.min[1], b.max[0], b.max[1]].map(v => +v.toFixed(1)); };

export function supportCheck(m, { minArea = 0.4, z0 = LAYER / 2 } = {}) {
  const top = m.boundingBox().max[2], floating = [], over = [];
  let prev = null;
  for (let z = z0; z < top; z += LAYER) {
    const L = m.slice(z);
    if (prev) {
      // hairlines thinner than 0.12 mm are dropped by the slicer, so they hold nothing up: open the layer below first
      prev = prev.offset(-0.06, 'Round').offset(0.06, 'Round');
      for (const c of L.decompose()) {
        const a = c.area(); if (a < 0.02) continue;
        if (c.intersect(prev).area() < 0.005 && width(c) >= 0.12) floating.push({ z: +z.toFixed(2), area: +a.toFixed(2), box: bb(c) });
      }
      const supp = prev.offset(D, 'Round', 2, 24), un = L.subtract(supp);
      for (const c of un.decompose()) {
        const a = c.area(); if (a < minArea) continue;
        const w = width(c);
        // bridge = held by supported plastic on two opposite sides (anchor patches at least ~w apart); else a cantilever
        const anchors = c.offset(0.25, 'Round').subtract(c).intersect(supp).intersect(L).decompose().filter(p => p.area() > 0.02).map(p => { const b = p.bounds(); return [(b.min[0] + b.max[0]) / 2, (b.min[1] + b.max[1]) / 2]; });
        let span = 0; for (const p of anchors) for (const q of anchors) span = Math.max(span, Math.hypot(p[0] - q[0], p[1] - q[1]));
        over.push({ z: +z.toFixed(2), area: +a.toFixed(2), w: +w.toFixed(2), bridge: anchors.length >= 2 && span >= 0.8 * w, box: bb(c) });
      }
    }
    prev = L;
  }
  return { floating, over };
}

// group the per-layer overhang slivers into features (same xy area, consecutive layers) and keep the ones that matter
export function features(over, { gap = 0.45 } = {}) {
  const f = [];
  for (const o of over) {
    const hit = f.find(g => o.z - g.z1 <= LAYER * 1.6 && o.box[0] <= g.box[2] + 1 && o.box[2] >= g.box[0] - 1 && o.box[1] <= g.box[3] + 1 && o.box[3] >= g.box[1] - 1);
    if (hit) { hit.bridge = hit.bridge && o.bridge; hit.z1 = o.z; hit.area += o.area; hit.maxLayer = Math.max(hit.maxLayer, o.area); hit.w = Math.max(hit.w, o.w); hit.box = [Math.min(hit.box[0], o.box[0]), Math.min(hit.box[1], o.box[1]), Math.max(hit.box[2], o.box[2]), Math.max(hit.box[3], o.box[3])]; }
    else f.push({ z0: o.z, z1: o.z, area: o.area, maxLayer: o.area, w: o.w, bridge: o.bridge, box: o.box.slice() });
  }
  return f.map(g => ({ ...g, area: +g.area.toFixed(1), maxLayer: +g.maxLayer.toFixed(1) })).sort((a, b) => b.area - a.area);
}

// a feature is a problem when one layer leaves a wide flat patch hanging (w = how far it reaches past the layer below)
// a bridge (held on two sides) is fine up to 10 mm across; w is its span
export const verdict = g => g.bridge ? (g.w > 10 ? 'FIX' : g.w > 6 ? 'watch' : 'ok') : g.w >= 1.2 && g.maxLayer >= 3 ? 'FIX' : g.w >= 0.8 && g.area >= 4 ? 'watch' : 'ok';


// is anything in this link floating, or a wide cantilever, from 1 mm under the slot ceiling up? (whole link: a clipped
// box cuts horns and gills into fake islands; links can't hold each other up, so one link alone is a fair test)
export function slotBad(seg, px) {
  const { floating, over } = supportCheck(seg, { z0: J.PZ - 0.9 });
  return floating.length > 0 || features(over).some(g => verdict(g) === 'FIX');
}

// ---------- a spine animal: sculpt once, then cut into linked segments at each pin
export function flexi({ name, body, items = [], pins, post = [] }) {
  const sculpt = floorCut(U(body, items.filter(i => i.m).map(i => i.m)));
  const n = pins.length, segs = [], rep = { name, segments: n + 1 };
  for (let k = 0; k <= n; k++) {
    let reg = null;
    if (k > 0) reg = rearRegion(pins[k - 1]);
    if (k < n) reg = reg ? reg.intersect(frontRegion(pins[k])) : frontRegion(pins[k]);
    let s = sculpt.intersect(tall(reg));
    for (const p of post.filter(p => p.seg === k)) s = s.add(floorCut(p.m));
    segs.push(s);
  }
  const hw = []; rep.thinWall = [];
  rep.roofCap = [];
  pins.forEach((px, j) => {
    // tallest slot roof that keeps 1 mm of skin on top and leaves nothing starting in mid-air
    let jp = null;
    for (const flat of [null, 7.6, 7.2, 6.8, 6.4, 6.0, 5.6, 5.2, 4.8]) {
      const t = jointParts(px, { flat });
      // only where the body is (behind the body's end the slot simply opens out the back)
      if (vol(t.roofGuard.intersect(tall(segs[j].slice(J.PZ + 0.1))).subtract(segs[j])) > 0.01) { rep.roofTried = (rep.roofTried || []).concat(j + ':' + (flat ?? 'tent') + ' skin'); continue; }
      if (slotBad(segs[j].subtract(t.pocket), px)) { rep.roofTried = (rep.roofTried || []).concat(j + ':' + (flat ?? 'tent') + ' bad'); continue; }
      jp = t; rep.roofCap.push(flat ?? 'tent'); break;
    }
    if (!jp) { jp = jointParts(px, { cap: true }); rep.roofCap.push('cone (check)'); }
    rep.thinWall.push(+vol(jp.guard.subtract(segs[j]).subtract(tall(wedge(px, J.SLOT + 12, 12)))).toFixed(2));
    segs[j] = segs[j].subtract(jp.pocket).add(jp.pin);
    segs[j + 1] = segs[j + 1].add(jp.ring).add(jp.tongue);
    hw.push(jp.pin, jp.ring, jp.tongue);
  });
  // free swing at each joint
  rep.swing = pins.map((px, j) => {
    const lim = sgn => { let ok = 0; for (let a = 4; a <= 40; a += 4) { if (vol(rotZAbout(segs[j + 1], px, sgn * a).intersect(segs[j])) > 0.02) break; ok = a; } return ok; };
    return [lim(1), lim(-1)];
  });
  rep.pieces = segs.map(s => s.decompose().length);
  const total = U(segs);
  rep.totalPieces = total.decompose().length;
  const col = paint(total, [...items, ...post], U(hw));
  return { name, ...col, segs, rep };
}

// ---------- a bird: top half spins on a cone seat (shaft down to the plate keeps it captive), tail wags on a joint
// SCALE.k < 1 shrinks the animal (minis) but keeps the spin seat and tail joint full size so they still print and move.
// The tail shrinks about its root (x = -20) so it still meets the joint.
export const SCALE = { k: 1 };
export function bird({ name, egg, upper = [], lower = [], tail, pinX = -11.3, zc = 4, g = 0.7, items = [] }) {
  const k = SCALE.k;
  if (k !== 1) {
    const sc = m => m.scale(k);
    egg = sc(egg); upper = [upper].flat().map(sc); lower = [lower].flat().map(sc);
    items = items.map(i => ({ ...i, m: i.m && sc(i.m), p: i.p && sc(i.p) }));
    if (tail) tail = scaleAbout(tail, [-20, 0, 0], k);
  }
  const R = 60, prof = (a, b) => Manifold.revolve(poly(a.concat(b)), 96);
  const Ureg = prof([[0, 0], [5, 0], [5, 1], [3, 3], [3, zc], [R, zc + R - 3]], [[R, 200], [0, 200]]);
  const Lreg = prof([[5 + g, 0], [R, 0], [R, zc + R - 3 - g]], [[3 + g, zc], [3 + g, 3], [5 + g, 1]]);
  const top = floorCut(U(egg, upper, items.filter(i => i.on === 'top' && i.m).map(i => i.m))).intersect(Ureg);
  if (!tail) {   // spin only, no tail joint (octopus, 17 Nov 2026)
    const base = floorCut(U(egg, lower, items.filter(i => i.on === 'base' && i.m).map(i => i.m))).intersect(Lreg);
    const rep = { name, spinClash: [0, 30, 60, 90, 135, 180].map(a => +vol(top.rotate([0, 0, a]).intersect(base)).toFixed(3)) };
    const total = U(top, base);
    rep.pieces = [top, base].map(s => s.decompose().length); rep.totalPieces = total.decompose().length;
    const col = paint(total, items.map(i => ({ ...i, p: (i.p || i.m).intersect(i.on === 'top' ? Ureg : Lreg) })));
    return { name, ...col, segs: [top, base], rep };
  }
  const jp = jointParts(pinX, { cap: true });
  const rump = hull(cyl([pinX, 0, 0], J.ARC, 5), cyl([pinX, 0, 0], 3.4, k < 1 ? 9.8 : 8.2));   // minis: taller so the roof over the pin stays thick
  let base = floorCut(U(egg, rump, lower, items.filter(i => i.on === 'base' && i.m).map(i => i.m))).intersect(Lreg);
  const thin = jp.guard.subtract(base).subtract(tall(wedge(pinX, J.SLOT + 12, 12)));
  const rep = { name, thinWall: [+vol(thin).toFixed(2)] }; if (process.env.THINBOX && vol(thin) > 0.01) { const b = thin.boundingBox(); rep.thinBox = [...b.min, ...b.max].map(v => +v.toFixed(1)); }
  base = base.subtract(jp.pocket).add(jp.pin);
  const tl = floorCut(tail).intersect(tall(rearRegion(pinX))).add(jp.ring).add(jp.tongue);
  const lim = sgn => { let ok = 0; for (let a = 4; a <= 40; a += 4) { if (vol(rotZAbout(tl, pinX, sgn * a).intersect(base)) > 0.02) break; ok = a; } return ok; };
  rep.swing = [[lim(1), lim(-1)]];
  rep.spinClash = [0, 30, 60, 90, 135, 180].map(a => +vol(top.rotate([0, 0, a]).intersect(base)).toFixed(3));
  const total = U(top, base, tl);
  rep.pieces = [top, base, tl].map(s => s.decompose().length); rep.totalPieces = total.decompose().length;
  const col = paint(total, items.map(i => ({ ...i, p: (i.p || i.m).intersect(i.on === 'top' ? Ureg : Lreg) })), U(jp.pin, jp.ring, jp.tongue));
  return { name, ...col, segs: [top, base, tl], rep };
}

// ---------- mesh out
export function tris(m) {
  const g = m.getMesh(), P = g.vertProperties, np = g.numProp, T = g.triVerts, out = new Float32Array(T.length * 3);
  for (let i = 0; i < T.length; i++) { out[i * 3] = P[T[i] * np]; out[i * 3 + 1] = P[T[i] * np + 1]; out[i * 3 + 2] = P[T[i] * np + 2]; }
  return out;
}
export function indexed(m) { const g = m.getMesh(), np = g.numProp, V = []; for (let i = 0; i < g.vertProperties.length; i += np) V.push([g.vertProperties[i], g.vertProperties[i + 1], g.vertProperties[i + 2]]); return { V, T: Array.from(g.triVerts) }; }
export function writeSTL(file, m) {
  const t = tris(m), n = t.length / 9, buf = Buffer.alloc(84 + n * 50); buf.write('big-eye-animals', 0); buf.writeUInt32LE(n, 80); let o = 84;
  for (let i = 0; i < n; i++) {
    const a = [t[i * 9], t[i * 9 + 1], t[i * 9 + 2]], b = [t[i * 9 + 3], t[i * 9 + 4], t[i * 9 + 5]], c = [t[i * 9 + 6], t[i * 9 + 7], t[i * 9 + 8]];
    let nn = cross(sub(b, a), sub(c, a)); const l = Math.hypot(...nn) || 1; nn = nn.map(x => x / l);
    for (const p of [nn, a, b, c]) for (const x of p) { buf.writeFloatLE(x, o); o += 4; } o += 2;
  }
  fs.writeFileSync(file, buf);
}
// area of steep unsupported skin (more than `deg` from vertical, facing down, above the first layer)
export function overhang(m, deg = 52) {
  const t = tris(m), lim = -Math.sin(deg * Math.PI / 180); let area = 0; const bins = {};
  for (let i = 0; i < t.length; i += 9) {
    const a = [t[i], t[i + 1], t[i + 2]], b = [t[i + 3], t[i + 4], t[i + 5]], c = [t[i + 6], t[i + 7], t[i + 8]];
    const nn = cross(sub(b, a), sub(c, a)), A = Math.hypot(...nn) / 2; if (A < 1e-9) continue;
    const z = (a[2] + b[2] + c[2]) / 3; if (z < 0.25) continue;
    if (nn[2] / (2 * A) < lim) { area += A; const k = Math.round((a[0] + b[0] + c[0]) / 30) * 10 + ',z' + Math.round(z / 4) * 4; bins[k] = (bins[k] || 0) + A; }
  }
  return { area: +area.toFixed(1), worst: Object.entries(bins).sort((p, q) => q[1] - p[1]).slice(0, 6).map(([k, v]) => k + ':' + v.toFixed(1)) };
}

// ---------- tiny software renderer (orthographic, z-buffer, flat shaded) -> PNG
export function render(file, parts, { az = -35, el = 22, W = 900, H = 620, bg = [244, 244, 240], zoom = null } = {}) {
  const SS = 2, w = W * SS, h = H * SS, col = new Uint8Array(w * h * 3), zb = new Float32Array(w * h).fill(-1e9);
  for (let i = 0; i < w * h; i++) { col[i * 3] = bg[0]; col[i * 3 + 1] = bg[1]; col[i * 3 + 2] = bg[2]; }
  const A = az * Math.PI / 180, B = el * Math.PI / 180;
  const f = [Math.cos(B) * Math.cos(A), Math.cos(B) * Math.sin(A), Math.sin(B)]; // toward camera
  const r = norm(cross([0, 0, 1], f)), up = cross(f, r), L = norm([f[0] + 0.5 * r[0] + 0.7 * up[0], f[1] + 0.5 * r[1] + 0.7 * up[1], f[2] + 0.5 * r[2] + 0.7 * up[2]]);
  const all = parts.map(p => ({ t: tris(p.m), rgb: p.rgb }));
  let mn = [1e9, 1e9], mx = [-1e9, -1e9];
  for (const p of all) for (let i = 0; i < p.t.length; i += 3) { const v = [p.t[i], p.t[i + 1], p.t[i + 2]], x = dot(v, r), y = dot(v, up); mn = [Math.min(mn[0], x), Math.min(mn[1], y)]; mx = [Math.max(mx[0], x), Math.max(mx[1], y)]; }
  const sc = zoom ? zoom * SS : Math.min(w * 0.9 / (mx[0] - mn[0]), h * 0.9 / (mx[1] - mn[1])), cx = (mn[0] + mx[0]) / 2, cy = (mn[1] + mx[1]) / 2;
  for (const p of all) {
    const t = p.t;
    for (let i = 0; i < t.length; i += 9) {
      const a = [t[i], t[i + 1], t[i + 2]], b = [t[i + 3], t[i + 4], t[i + 5]], c = [t[i + 6], t[i + 7], t[i + 8]];
      let nn = cross(sub(b, a), sub(c, a)); const l = Math.hypot(...nn); if (l < 1e-12) continue; nn = nn.map(x => x / l);
      if (dot(nn, f) <= 0) continue;
      const sh = 0.42 + 0.58 * Math.max(0, dot(nn, L)), rgb = p.rgb.map(x => Math.min(255, x * sh));
      const P = [a, b, c].map(v => [(dot(v, r) - cx) * sc + w / 2, h / 2 - (dot(v, up) - cy) * sc, dot(v, f)]);
      const x0 = Math.max(0, Math.floor(Math.min(P[0][0], P[1][0], P[2][0]))), x1 = Math.min(w - 1, Math.ceil(Math.max(P[0][0], P[1][0], P[2][0])));
      const y0 = Math.max(0, Math.floor(Math.min(P[0][1], P[1][1], P[2][1]))), y1 = Math.min(h - 1, Math.ceil(Math.max(P[0][1], P[1][1], P[2][1])));
      const den = (P[1][1] - P[2][1]) * (P[0][0] - P[2][0]) + (P[2][0] - P[1][0]) * (P[0][1] - P[2][1]); if (Math.abs(den) < 0.05) continue;
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const l1 = ((P[1][1] - P[2][1]) * (x + 0.5 - P[2][0]) + (P[2][0] - P[1][0]) * (y + 0.5 - P[2][1])) / den, l2 = ((P[2][1] - P[0][1]) * (x + 0.5 - P[2][0]) + (P[0][0] - P[2][0]) * (y + 0.5 - P[2][1])) / den, l3 = 1 - l1 - l2;
        if (l1 < 0 || l2 < 0 || l3 < 0) continue;
        const z = l1 * P[0][2] + l2 * P[1][2] + l3 * P[2][2], k = y * w + x;
        if (z > zb[k]) { zb[k] = z; col[k * 3] = rgb[0]; col[k * 3 + 1] = rgb[1]; col[k * 3 + 2] = rgb[2]; }
      }
    }
  }
  const raw = Buffer.alloc((W * 3 + 1) * H);
  for (let y = 0; y < H; y++) { raw[y * (W * 3 + 1)] = 0; for (let x = 0; x < W; x++) for (let ch = 0; ch < 3; ch++) { let s = 0; for (let dy = 0; dy < SS; dy++) for (let dx = 0; dx < SS; dx++) s += col[((y * SS + dy) * w + x * SS + dx) * 3 + ch]; raw[y * (W * 3 + 1) + 1 + x * 3 + ch] = s / (SS * SS); } }
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const crc = Buffer.alloc(4); crc.writeUInt32BE(zlib.crc32(td) >>> 0); return Buffer.concat([len, td, crc]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
  fs.writeFileSync(file, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
}
