// Fidget clicker holders for ONE standard MX-style mechanical keyboard switch (Cherry MX, Gateron, Kailh Box, Outemu...)
// plus any MX keycap. Two colours: slot 1 = body, slot 2 = accent (flush inlay in the top 3 layers, or a stacked layer).
// Prints right side up, no supports: floor, open pocket, then a 1.5 mm top plate with a 14.1 mm square hole the switch clips into.
import { Manifold, CrossSection, U } from '../../big-eye-animals/_generator/lib.mjs';

// CAVD (space under the plate) is for a switch with its pins CLIPPED (17 Nov 2026): the housing hangs 3.5 mm below the plate,
// plus ~1.3 mm for stubs. Snip both metal pins and the plastic centre post (and the two side posts on 5-pin switches) flush.
// With pins left on, CAVD must go back to 8.8 (3.3 mm pins) and every clicker gets 4 mm taller.
export const SW = { HOLE: 14.1, PLATE: 1.5, CAV: 15.8, CAVD: 4.8, FLOOR: 1.6, INLAY: 0.6, WALL: 1.6 };
export const HT = SW.FLOOR + SW.CAVD + SW.PLATE;            // 7.9 mm (was 11.9 with pins)
export const MAXW = 38;     // biggest outline (mm) a clicker is allowed; bigger designs shrink to this, then grow back only if the switch won't fit
const R = (cs, d) => cs.offset(d, 'Round', 2, 48);
const roundAll = (cs, r) => R(R(R(R(cs, -r), r), r), -r);   // rounds outside and inside corners
const rsq = (w, r, h = w) => R(CrossSection.square([w - 2 * r, h - 2 * r], true), r);
const circ = (r, c = [0, 0]) => CrossSection.circle(r, 120).translate(c);
const ell = (rx, ry, c = [0, 0], deg = 0) => CrossSection.circle(1, 72).scale([rx, ry]).rotate(deg).translate(c);
const poly = pts => { let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; } return new CrossSection([a < 0 ? pts.slice().reverse() : pts]); };
const ngon = (n, r, start = 90) => poly(Array.from({ length: n }, (_, i) => { const a = (start + i * 360 / n) * Math.PI / 180; return [r * Math.cos(a), r * Math.sin(a)]; }));
const star = (n, ro, ri) => poly(Array.from({ length: 2 * n }, (_, i) => { const a = (90 + i * 180 / n) * Math.PI / 180, r = i % 2 ? ri : ro; return [r * Math.cos(a), r * Math.sin(a)]; }));
const band = (cs, w) => cs.subtract(R(cs, -w));
const slab = (cs, z0, z1) => cs.extrude(z1 - z0 + 0.002).translate([0, 0, z0 - 0.001]); // tiny overlap so stacked slabs fuse

// outline -> solid with a 0.4 mm stepped chamfer at the foot and 0.6 mm at the top edge (steps = 0.2 mm layers)
function shell(o, H = HT) {
  return U(slab(R(o, -0.4), 0, 0.2), slab(R(o, -0.2), 0.2, 0.4), slab(o, 0.4, H - 0.6), slab(R(o, -0.2), H - 0.6, H - 0.4), slab(R(o, -0.4), H - 0.4, H - 0.2), slab(R(o, -0.6), H - 0.2, H));
}
// the 5 mm hole through the floor takes any pin stub, and lets you push the switch out from underneath with a pen
const pocket = () => U(slab(rsq(SW.CAV, 0.8), SW.FLOOR, HT - SW.PLATE), slab(CrossSection.square([SW.HOLE, SW.HOLE], true), HT - SW.PLATE - 0.5, HT + 1), slab(circ(2.5), -1, SW.FLOOR + 0.1));
const inlay = cs => slab(cs, HT - SW.INLAY, HT + 0.01);

// ================= TWO-PIECE CLICKERS (17 Nov 2026): no keycap. The printed top half IS the cap.
// Base (shape outline) holds the switch; the cap (same outline) presses onto the switch stem with a printed cross socket.
// Heights from the Cherry MX datasheet, measured from the top of the plate (P): housing top +6.6, stem top +10.2, travel 4.0.
//   'lid'   : base = full-outline foot + a smaller neck around the switch; cap = roof + skirt that slides over the neck (hides the switch)
//   'split' : base and cap are both full outline with a visible 4.5 mm gap that closes when pressed (sandwich foods)
export const TWO = {
  ZS: HT - 5.9,   // lid: height of the base foot (shoulder) above the plate bed: 0.5 mm below the skirt when fully pressed
  GAP: 0.45,      // lid: side clearance between skirt and neck
  SKIRT: 1.6,     // lid: skirt wall
  WELL: 16.4,     // open well above the switch plate: clears the 15.6 mm housing (was 18 for a switch puller; now the switch pushes out through the floor hole)
  UP: 6.0,        // base walls rise this far above the plate (switch housing is 6.6)
  ROOF_U: 11.2,   // cap roof underside above the plate at rest (pressed: 7.2, clears the housing at 6.6)
  ROOF_T: 2.4,    // cap roof thickness
  SKIRT_B: -1.4,  // lid: skirt bottom at rest, relative to the plate top (pressed: -5.4, shoulder is at -5.9)
  SPLIT_B: 10.5,  // split: cap bottom face at rest (pressed 6.5, base top is 6.0)
  SPLIT_T: 3.0,   // split: cap thickness
  POST_R: 2.8, POST_B: 6.8, SOCK_TOP: 10.5,  // socket post under the cap: grips the stem from 6.8 to 10.2
  CROSS_L: 4.15, CROSS_W: 1.30,               // printed cross socket (MX spec 4.1 x 1.17; FDM shrinks holes). Tune with stem-fit-test.
  TRAVEL: 4.0,
};
const P = HT;
const cross = (z0, z1, L = TWO.CROSS_L, W = TWO.CROSS_W) => slab(CrossSection.square([L, W], true).add(CrossSection.square([W, L], true)), z0, z1);
// stepped edge: list of [inset, z0, z1]
const stack = (o, steps) => U(steps.map(([d, z0, z1]) => slab(d ? R(o, -d) : o, z0, z1)));
const housing = () => Manifold.hull([Manifold.cube([15.4, 15.4, 0.01], true).translate([0, 0, P]), Manifold.cube([11.5, 10.5, 0.01], true).translate([0, 0, P + 6.6])]);

function holder({ name, outline, accent, cut, pits, style = 'lid', baseAcc, baseSolid, dome = 0.6, capT = TWO.SPLIT_T }) {
  // grow the design until the switch, walls and neck fit inside it
  const needLid = rsq(TWO.WELL + 2.4, 1.2), needLow = rsq(SW.CAV + 2 * SW.WALL, 0.8 + SW.WALL);
  const fits = o => needLow.subtract(o).area() < 0.01 && needLid.subtract(style === 'lid' ? R(o, -(TWO.SKIRT + TWO.GAP)) : o).area() < 0.01;
  const ob = outline.bounds(), big = Math.max(ob.max[0] - ob.min[0], ob.max[1] - ob.min[1]);
  let k = Math.min(1, MAXW / big); while (!fits(outline.scale([k, k])) && k < 1.8) k += 0.02;
  const sc = cs => cs && cs.scale([k, k]);
  const o = sc(outline), acc = sc(accent), pit = sc(pits), hole = sc(cut);
  const top = P + TWO.UP, well = slab(rsq(TWO.WELL, 1.2), P, top + 1);
  const chamferTop = (z) => [[0.2, z - 0.6, z - 0.4], [0.4, z - 0.4, z - 0.2], [0.6, z - 0.2, z]];

  // ---- base
  let base;
  if (style === 'lid') {
    const neck = R(o, -(TWO.SKIRT + TWO.GAP));
    base = U(stack(o, [[0.4, 0, 0.2], [0.2, 0.2, 0.4], [0, 0.4, TWO.ZS]]), stack(neck, [[0, TWO.ZS - 0.01, top - 0.6], ...chamferTop(top)]));
  } else base = baseSolid ? baseSolid(top) : stack(o, [[0.4, 0, 0.2], [0.2, 0.2, 0.4], [0, 0.4, top - 0.6], ...chamferTop(top)]);
  base = base.subtract(pocket()).subtract(well); if (hole) base = base.subtract(slab(hole, -1, 99));
  let bAcc = baseAcc ? baseAcc(top, o).intersect(base) : null;

  // ---- cap (assembled position)
  let cap, capTop;
  const post = Manifold.cylinder(TWO.ROOF_U - TWO.POST_B + 0.01, TWO.POST_R, TWO.POST_R, 40).translate([0, 0, P + TWO.POST_B]);
  if (style === 'lid') {
    const z0 = P + TWO.ROOF_U; capTop = z0 + TWO.ROOF_T;
    const roof = stack(o, [[0, z0, capTop - dome], ...Array.from({ length: Math.round(dome / 0.2) }, (_, i) => [0.2 * (i + 1), capTop - dome + 0.2 * i, capTop - dome + 0.2 * (i + 1)])]);
    const skirt = slab(o.subtract(R(o, -TWO.SKIRT)), P + TWO.SKIRT_B, z0 + 0.01);
    cap = U(roof, skirt, post);
  } else {
    const z0 = P + TWO.SPLIT_B; capTop = z0 + capT;
    const slabCap = stack(o, [[0.4, z0, z0 + 0.2], [0.2, z0 + 0.2, z0 + 0.4], [0, z0 + 0.4, capTop - dome], ...Array.from({ length: Math.round(dome / 0.2) }, (_, i) => [0.2 * (i + 1), capTop - dome + 0.2 * i, capTop - dome + 0.2 * (i + 1)])]);
    cap = U(slabCap.subtract(slab(rsq(14.6, 1.0), z0 - 1, P + TWO.ROOF_U)), post);
  }
  cap = cap.subtract(cross(P + TWO.POST_B - 1, P + TWO.SOCK_TOP));
  if (pit) cap = cap.subtract(slab(pit, capTop - SW.INLAY, capTop + 1));
  if (hole) cap = cap.subtract(slab(hole, -1, 99));
  const cAcc = acc ? slab(acc, capTop - SW.INLAY, capTop + 0.01).intersect(cap) : null;

  // ---- checks: nothing touches at rest or fully pressed (post excluded: it rides inside the housing like a keycap's)
  const down = m => m.translate([0, 0, -TWO.TRAVEL]);
  const capNoPost = cap.subtract(Manifold.cylinder(40, TWO.POST_R + 0.3, TWO.POST_R + 0.3, 40).translate([0, 0, P]));
  const rep = {
    name, style, scale: +k.toFixed(2), basePieces: base.decompose().length, capPieces: cap.decompose().length,
    clashRest: +cap.intersect(base).volume().toFixed(3), clashPressed: +down(cap).intersect(base).volume().toFixed(3),
    housingPressed: +down(capNoPost).intersect(housing()).volume().toFixed(3),
    height: +capTop.toFixed(1),
  };
  // ---- print layout: base upright, cap flipped (roof / top face on the bed) beside it
  const bb = base.boundingBox(), flip = m => m.rotate([180, 0, 0]).translate([bb.max[0] - bb.min[0] + 6, 0, capTop]);
  const none = Manifold.cube([0.01, 0.01, 0.01]).translate([0, 0, -9]).intersect(Manifold.cube([1, 1, 1]));
  const bodyB = bAcc ? base.subtract(bAcc) : base, bodyC = cAcc ? cap.subtract(cAcc) : cap;
  const accAll = [bAcc, cAcc].filter(Boolean);
  const body = U(bodyB, flip(bodyC)), accentP = accAll.length ? U(bAcc || none, cAcc ? flip(cAcc) : none) : none;
  return {
    name, body, accent: accentP, all: U(base, flip(cap)), rep,
    asm: { body: U(bodyB, bodyC), accent: accAll.length ? U(accAll) : none, base, cap, baseBody: bodyB, baseAcc: bAcc, capBody: bodyC, capAcc: cAcc },
  };
}

// ---------- the designs
export const CLICKERS = {
  square: () => { const o = rsq(26, 4); return holder({ name: 'square', outline: o, accent: band(o, 2.2) }); },
  circle: () => { const o = circ(14); return holder({ name: 'circle', outline: o, accent: band(o, 2.2) }); },
  triangle: () => { const o = roundAll(ngon(3, 27.6), 3); return holder({ name: 'triangle', outline: o, accent: band(o, 2.4) }); },
  star: () => { const o = roundAll(star(5, 31, 18), 1.6); return holder({ name: 'star', outline: o, accent: band(o, 2.2) }); },
  heart: () => {
    const lobe = s => CrossSection.hull([circ(9.8, [s * 7.8, 3.6]), circ(1.6, [0, -19.5])]);
    const o = roundAll(lobe(1).add(lobe(-1)).translate([0, 1.2]), 1.2); return holder({ name: 'heart', outline: o, accent: band(o, 2.2) });
  },
  hexagon: () => { const o = roundAll(ngon(6, 17.4, 0), 2.4); return holder({ name: 'hexagon', outline: o, accent: band(o, 2.2).add(band(R(o, -3.6), 1.0)) }); },
  gear: () => {
    let o = circ(16.4); for (let i = 0; i < 10; i++) o = o.add(poly([[15.6, -2.9], [20.4, -1.7], [20.4, 1.7], [15.6, 2.9]]).rotate(i * 36));
    o = roundAll(o, 0.6); return holder({ name: 'gear', outline: o, accent: o.subtract(circ(16.6)).add(circ(14.6).subtract(circ(13.4))) });
  },
  'star-of-david': () => {
    const t1 = ngon(3, 29, 90), t2 = ngon(3, 29, 270), o = roundAll(t1.add(t2), 1.2);
    return holder({ name: 'star-of-david', outline: o, accent: band(t1, 2.4).add(band(t2, 2.4)).intersect(o) });
  },
  flower: () => {
    let o = circ(14.2); for (let i = 0; i < 6; i++) o = o.add(circ(7.6, [16 * Math.cos(i * Math.PI / 3), 16 * Math.sin(i * Math.PI / 3)]));
    o = roundAll(o, 1.0); return holder({ name: 'flower', outline: o, accent: o.subtract(circ(15.4)) });
  },
  donut: () => {
    const o = circ(16.6);
    const icing = poly(Array.from({ length: 180 }, (_, i) => { const t = i * 2 * Math.PI / 180, r = 14.3 + 1.0 * Math.sin(8 * t) + 0.4 * Math.sin(13 * t + 1); return [r * Math.cos(t), r * Math.sin(t)]; }));
    let spr = null; [[20, 12.6], [62, 12.2], [104, 12.9], [148, 12.4], [196, 12.8], [238, 12.3], [284, 12.9], [326, 12.4]].forEach(([d, r], i) => {
      const a = d * Math.PI / 180, s = R(CrossSection.square([2.6, 0.01], true), 0.55).rotate(d + 60 + i * 37).translate([r * Math.cos(a), r * Math.sin(a)]);
      spr = spr ? spr.add(s) : s;
    });
    return holder({ name: 'donut', outline: o, accent: icing.subtract(spr) });
  },
  paw: () => {
    const toes = [ell(4.6, 5.6, [-13.4, 12.6], 35), ell(4.8, 5.8, [-5.2, 19.6], 10), ell(4.8, 5.8, [5.2, 19.6], -10), ell(4.6, 5.6, [13.4, 12.6], -35)];
    const pad = ell(15.2, 14.2, [0, 0]);
    const o = roundAll(R(R(U2([pad, ...toes.map(t => R(t, 1.6))]), 2.6), -2.6), 0.8);
    return holder({ name: 'paw', outline: o, accent: U2(toes.map(t => R(t, -0.2))) });
  },
  shield: () => {
    const o = roundAll(poly([[-16.5, 18], [16.5, 18], [16.5, 3], [0, -24.5], [-16.5, 3]]), 3).translate([0, -1.5]);
    const chevron = poly([[-11.8, -7.4], [0, -16.6], [11.8, -7.4], [11.8, -10.8], [0, -20], [-11.8, -10.8]]).translate([0, -1.5]).intersect(R(o, -2.2));
    return holder({ name: 'shield', outline: o, accent: band(o, 2.2).add(chevron) });
  },
  'keychain-tag': () => {
    const o = rsq(27, 5, 41).translate([0, 6.5]), ringHole = circ(2.7, [0, 21.6]);
    return holder({ name: 'keychain-tag', outline: o, accent: band(o, 2.0).add(circ(5.0, [0, 21.6]).subtract(ringHole)), cut: ringHole });
  },
  // VISIBLE SPLIT: base = bottom bun + patty (patty is the top 3.6 mm of the base), gap, cap = domed top bun with sesame seeds
  hamburger: () => {
    const bun = circ(16), patty = poly(Array.from({ length: 200 }, (_, i) => { const t = i * 2 * Math.PI / 200, r = 16.4 + 0.5 * Math.sin(14 * t); return [r * Math.cos(t), r * Math.sin(t)]; }));
    const zP = HT + TWO.UP - 3.6;
    const pattyLayer = top => U(slab(R(patty, -0.45), zP, zP + 0.2), slab(patty, zP + 0.2, top));
    const baseSolid = top => U(slab(R(bun, -0.4), 0, 0.2), slab(R(bun, -0.2), 0.2, 0.4), slab(bun, 0.4, zP), pattyLayer(top));
    let seeds = null; for (let i = 0; i < 12; i++) { const d = 15 + i * 30, a = d * Math.PI / 180, r = [5.5, 9.5, 12.8][i % 3]; const s = ell(1.2, 0.62, [r * Math.cos(a), r * Math.sin(a)], d + 90 + (i % 4) * 25); seeds = seeds ? seeds.add(s) : s; }
    return holder({ name: 'hamburger', style: 'split', outline: bun, accent: seeds, baseSolid, baseAcc: top => pattyLayer(top), dome: 3.0, capT: 8 });
  },
  // VISIBLE SPLIT: two domed shells with a cream layer on top of the bottom shell
  macaron: () => {
    const o = circ(16.5), feet = radial(180, t => 16.9 + 0.35 * Math.sin(40 * t));
    const baseSolid = top => U(slab(R(o, -0.8), 0, 0.2), slab(R(o, -0.5), 0.2, 0.4), slab(o, 0.4, 2.6), slab(feet, 2.6, 4.2), slab(o, 4.2, top));
    return holder({ name: 'macaron', style: 'split', outline: o, baseSolid, baseAcc: top => slab(R(o, -0.6), top - 3.0, top + 0.01), dome: 3.0, capT: 8 });
  },
  // VISIBLE SPLIT: two dark cookies with white cream; the cap has a pressed pattern (dimples)
  'cookie-sandwich': () => {
    const o = circ(16.5);
    const pattern = U2([band(circ(12.5), 0.9), ...Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return line([9 * Math.cos(a), 9 * Math.sin(a)], [11.2 * Math.cos(a), 11.2 * Math.sin(a)], 1.0); }), band(circ(14.9), 0.7)]); // outer ring 0.5 mm in (support check 17 Nov): at 15.4 the cap's first layers left a 0.1 mm rim outside it, so the rim above floated
    return holder({ name: 'cookie-sandwich', style: 'split', outline: o, pits: pattern, baseAcc: top => slab(R(o, -0.5), top - 3.0, top + 0.01), dome: 1.0, capT: 6 });
  },
};
function U2(list) { return list.reduce((a, b) => a.add(b)); }
const radial = (n, f) => poly(Array.from({ length: n }, (_, i) => { const t = i * 2 * Math.PI / n, r = f(t); return [r * Math.cos(t), r * Math.sin(t)]; }));
const at = (list, f) => U2(list.map(f));
const line = (a, b, w) => CrossSection.hull([circ(w / 2, a), circ(w / 2, b)]);
const seed = (c, deg) => ell(0.8, 1.3, c, deg);

// ---------- food line (17 Nov 2026). The keycap covers the middle 18 mm, so details sit outside it.
Object.assign(CLICKERS, {
  pizza: () => {
    const o = roundAll(poly([[-25, 17], [25, 17], [0, -34]]).add(ell(25, 6.5, [0, 17.5])), 1.5);
    const pep = at([[-15, 11], [15, 11], [0, 14], [0, -18.5], [-5, -12.5], [5.5, -25]], c => circ(c[1] < -20 ? 2.4 : 3.3, c));
    const crust = line([-22, 17.3], [22, 17.3], 1.0);
    return holder({ name: 'pizza', outline: o, accent: pep.intersect(R(o, -1.2)), pits: crust });
  },
  cookie: () => {
    const o = radial(160, t => 16.4 + 0.7 * Math.sin(9 * t) + 0.4 * Math.sin(5 * t + 2));
    const chips = at([[0, 12.6, 1.9], [40, 13.3, 1.6], [78, 12.4, 2.1], [118, 13.4, 1.7], [160, 12.6, 2.0], [205, 13.2, 1.8], [248, 12.5, 2.1], [292, 13.3, 1.6], [330, 12.5, 1.9]],
      ([d, r, s]) => roundAll(ngon(5, s * 1.25, d * 3).translate([r * Math.cos(d * Math.PI / 180), r * Math.sin(d * Math.PI / 180)]), 0.4));
    return holder({ name: 'cookie', outline: o, accent: chips });
  },
  cupcake: () => {
    const wrap = poly([[-13, -26], [13, -26], [17, -8], [-17, -8]]);
    const frost = U2([ell(19.5, 11, [0, -2]), ell(14, 9, [0, 8]), ell(8.5, 7, [0, 15]), circ(3.4, [0, 22])]);
    const o = roundAll(wrap.add(frost), 1.0);
    const pleats = at([-9, -4.5, 0, 4.5, 9], x => line([x * 0.82, -24.5], [x, -14], 1.1));
    return holder({ name: 'cupcake', outline: o, accent: frost.intersect(R(o, -0.01)).add(pleats.intersect(wrap)) });
  },
  'ice-cream': () => {
    const scoop = radial(160, t => 16.6 + (Math.sin(t) < -0.2 ? 1.2 * Math.sin(7 * t) : 0)).translate([0, 4]);
    const cone = poly([[-13.5, -8], [13.5, -8], [0, -40]]);
    const o = roundAll(scoop.add(cone), 1.0);
    const waffle = [-20, -12, -4].flatMap(k => [line([-14, k - 14], [14, k + 14], 1.0), line([14, k - 14], [-14, k + 14], 1.0)]);
    return holder({ name: 'ice-cream', outline: o, accent: scoop.intersect(o), pits: U2(waffle).intersect(R(cone, -1.6)).subtract(R(scoop, 0.6)) });
  },
  strawberry: () => {
    const berry = CrossSection.hull([circ(12.5, [-7, 2]), circ(12.5, [7, 2]), circ(3.5, [0, -21])]);
    const leaves = U2([0, 1, 2, 3, 4].map(i => ell(3.0, 7.2, [0, 0], 0).translate([0, 6]).rotate(-60 + i * 30).translate([0, 10.5]))).add(circ(2, [0, 21]));
    const o = roundAll(berry.add(leaves), 0.8);
    const seeds = at([[-15, 6], [15, 6], [-13, -6], [13, -6], [-9, -13], [9, -13], [0, -12.5], [-4.5, -19], [4.5, -19], [-17, -1], [17, -1]], c => seed(c, c[0] * 2));
    return holder({ name: 'strawberry', outline: o, accent: leaves.subtract(berry.offset(-2.5, 'Round', 2, 48)).intersect(o), pits: seeds });
  },
  watermelon: () => {
    const R0 = 28, cy = 13, half = poly([[-R0 - 1, cy], [R0 + 1, cy], [R0 + 1, cy - R0 - 2], [-R0 - 1, cy - R0 - 2]]);
    const o = roundAll(circ(R0, [0, cy]).intersect(half), 1.2);
    const rind = o.subtract(circ(R0 - 3.4, [0, cy]));
    const seeds = at([[-17, 2, -30], [-10, -9, -15], [0, -11.5, 0], [10, -9, 15], [17, 2, 30], [-21, 9, -45], [21, 9, 45]], ([x, y, d]) => ell(0.9, 1.7, [x, y], d));
    return holder({ name: 'watermelon', outline: o, accent: rind, pits: seeds });
  },
  taco: () => {
    const cy = 9, shell = circ(25, [0, cy]).intersect(poly([[-30, cy], [30, cy], [30, -30], [-30, -30]]));
    const lettuce = poly(Array.from({ length: 61 }, (_, i) => { const x = -22 + 44 * i / 60; return [x, cy + 3.5 + 1.6 * Math.sin(i * 1.3) + 1.4 * Math.cos(i * 0.47)]; }).concat([[22, cy - 3], [-22, cy - 3]]));
    const o = roundAll(shell.add(lettuce), 1.0);
    const fold = line([-21, cy - 7], [21, cy - 7], 1.0).intersect(R(shell, -2.4));
    return holder({ name: 'taco', outline: o, accent: lettuce.intersect(o).subtract(R(shell, -3.4)), pits: fold });
  },
  sushi: () => {
    const o = circ(16);
    const rice = circ(13.4);
    const grains = at([[0, 11.6], [45, 11.8], [90, 11.6], [135, 11.8], [180, 11.6], [225, 11.8], [270, 11.6], [315, 11.8], [22, 10.4], [158, 10.4], [202, 10.4], [338, 10.4]], ([d, r]) => ell(0.6, 1.2, [r * Math.cos(d * Math.PI / 180), r * Math.sin(d * Math.PI / 180)], d + 60));
    return holder({ name: 'sushi', outline: o, accent: rice, pits: grains });
  },
});

// ---------- animals (17 Nov 2026)
Object.assign(CLICKERS, {
  bee: () => {
    const body = ell(19, 14.2, [-2, 0]), head = circ(8.2, [19, 0]), sting = poly([[-20, -2.4], [-20, 2.4], [-26, 0]]);
    const wings = U2([ell(7.5, 10, [-5, 14], 20), ell(6.2, 8.5, [5, 14], -15)]);
    const o = roundAll(U2([body, head, sting, wings]), 1.2);
    const stripes = at([-13, 11.2], x => poly([[x - 2.4, -20], [x + 2.4, -20], [x + 2.4, 20], [x - 2.4, 20]])).intersect(body);
    const wingLines = band(wings, 1.4).subtract(R(body, 0.4));
    return holder({ name: 'bee', outline: o, accent: U2([stripes, head.intersect(o), wingLines, sting.intersect(o)]) });
  },
  ladybug: () => {
    const body = circ(16.5, [0, -2]), head = ell(9.5, 7, [0, 15]);
    const o = roundAll(body.add(head), 1.0);
    const spots = at([[-12, 4, 2.6], [12, 4, 2.6], [-11, -11, 2.8], [11, -11, 2.8], [-4.6, -15.5, 2.0], [4.6, -15.5, 2.0], [-14.2, -4, 1.8], [14.2, -4, 1.8]], ([x, y, r]) => circ(r, [x, y]));
    const seam = line([0, -18.5], [0, -9.8], 1.2);
    return holder({ name: 'ladybug', outline: o, accent: U2([head.subtract(body), spots, seam]).intersect(o) });
  },
  frog: () => {
    const face = ell(21, 15.5, [0, -2]), eyes = at([-1, 1], s => circ(7.4, [s * 11, 13]));
    const o = roundAll(face.add(eyes), 1.4);
    const pupils = at([-1, 1], s => ell(3.4, 2.6, [s * 11, 15]));
    const smile = U2(Array.from({ length: 16 }, (_, i) => { const t = -1 + 2 * i / 15, x = 15 * t; return circ(0.75, [x, -12.4 + 2.6 * t * t]); }).map((c, i, a) => i ? CrossSection.hull([a[i - 1], c]) : c));
    const cheeks = at([-1, 1], s => ell(3, 2, [s * 15.5, -6]));
    return holder({ name: 'frog', outline: o, accent: U2([pupils, smile, cheeks]) });
  },
  panda: () => {
    const head = circ(19), ears = at([-1, 1], s => circ(6.8, [s * 14, 15.5]));
    const o = roundAll(head.add(ears), 1.0);
    const patches = at([-1, 1], s => ell(4.4, 6.2, [s * 12.4, 2.5], s * -25));
    const nose = ell(3.4, 2.4, [0, -12.4]), mouth = U2([line([0, -14.6], [0, -16.2], 0.9), line([0, -16.2], [-2.6, -17.4], 0.9), line([0, -16.2], [2.6, -17.4], 0.9)]);
    return holder({ name: 'panda', outline: o, accent: U2([ears.subtract(head), patches, nose, mouth]).intersect(o) });
  },
  'cat-face': () => {
    const head = ell(19.5, 17, [0, -1]), ears = at([-1, 1], s => roundAll(poly([[s * 6, 10], [s * 19, 4], [s * 17, 24]]), 1.5));
    const o = roundAll(head.add(ears), 0.8);
    const inner = at([-1, 1], s => roundAll(poly([[s * 9.5, 11.5], [s * 16.5, 8.5], [s * 15.8, 19.5]]), 1.0));
    const muzzle = at([-1, 1], s => ell(4.8, 3.6, [s * 4.2, -13]));
    const whiskers = U2([[-1, 1].flatMap(s => [line([s * 10.5, -9], [s * 18, -7], 0.9), line([s * 10.5, -11.5], [s * 18, -12.5], 0.9)])].flat());
    return holder({ name: 'cat-face', outline: o, accent: U2([inner, muzzle, whiskers]).intersect(R(o, -0.8)) });
  },
  turtle: () => {
    const shell = ell(17.5, 15.5), head = circ(5.8, [0, 19.5]), tail = poly([[-2, -14], [2, -14], [0, -20.5]]);
    const flip = (s, y, d) => ell(4.2, 7.2, [s * 16, y], s * d);
    const limbs = U2([flip(1, 9, -50), flip(-1, 9, -50), flip(1, -9, 45), flip(-1, -9, 45)]);
    const o = roundAll(U2([shell, head, tail, limbs]), 1.0);
    const rimLines = at([30, 90, 150, 210, 270, 330], d => { const a = d * Math.PI / 180; return line([11.2 * Math.cos(a), 10 * Math.sin(a)], [16.2 * Math.cos(a), 14.4 * Math.sin(a)], 1.0); });
    return holder({ name: 'turtle', outline: o, accent: U2([head, tail, limbs]).subtract(R(shell, -0.01)).intersect(o).add(band(shell, 1.4)), pits: rimLines });
  },
});

// switch fit test: flat 1.5 mm bar, holes 13.9 / 14.0 / 14.1 / 14.2 mm, marked with 1–4 notches
export function fitTest() {
  const sizes = [13.9, 14.0, 14.1, 14.2], pitch = 21;
  let bar = R(CrossSection.square([pitch * 4 - 2, 22], true), 2);
  sizes.forEach((s, i) => {
    const x = (i - 1.5) * pitch; bar = bar.subtract(CrossSection.square([s, s], true).translate([x, 0]));
    for (let k = 0; k <= i; k++) bar = bar.subtract(circ(0.9, [x - 1.8 * i / 2 + 1.8 * k, 11]));
  });
  const m = slab(bar, 0, SW.PLATE);
  return { name: 'switch-fit-test', body: m, accent: null, all: m, rep: { name: 'switch-fit-test', pieces: m.decompose().length } };
}

// cap socket fit test: 4 socket posts printed the same way up as the caps. Cross arm width 1.20 / 1.25 / 1.30 / 1.35 mm (1–4 notches).
// Push each onto a switch stem: pick the one that grips firmly but still goes on by hand, and set CROSS_W in TWO to it.
export function stemFitTest() {
  const widths = [1.20, 1.25, 1.30, 1.35], pitch = 12;
  let plate = R(CrossSection.square([pitch * 4 + 2, 16], true), 2);
  widths.forEach((w, i) => { const x = (i - 1.5) * pitch; for (let k = 0; k <= i; k++) plate = plate.subtract(circ(0.8, [x - 1.6 * i / 2 + 1.6 * k, 8])); });
  let m = slab(plate, 0, 1.6);
  widths.forEach((w, i) => {
    const x = (i - 1.5) * pitch;
    const post = Manifold.cylinder(4.4, TWO.POST_R, TWO.POST_R, 40).translate([x, 0, 1.6 - 0.01]);
    m = m.add(post).subtract(cross(1.6 + 4.4 - 3.7, 1.6 + 4.4 + 1, TWO.CROSS_L, w).translate([x, 0, 0]));
  });
  return { name: 'stem-fit-test', body: m, accent: null, all: m, rep: { name: 'stem-fit-test', pieces: m.decompose().length } };
}
