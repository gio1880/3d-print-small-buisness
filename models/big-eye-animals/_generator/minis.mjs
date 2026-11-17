// Minis, about 1.3 in (33 mm) each way, sized like the small store-bought desk figures (17 Nov 2026).
//  - sitters (owl, parrot, panda, cat, dog): the same designs shrunk; spin seat and tail joint stay full size inside.
//  - chibis: short, chunky versions of the long animals; the top spins on the body, nothing bends.
import { SCALE, U, hull, E, S, cap, chain, eye, skinLine, bird, scaleAbout, surf, CrossSection } from './lib.mjs';
import { ALL as BIG, COLOURS as BC, HEX as BH } from './animals.mjs';

export const ALL = {}, COLOURS = {}, HEX = {};
const shrink = (n, k) => () => { SCALE.k = k; try { const a = BIG[n](); return { ...a, name: n + '-mini' }; } finally { SCALE.k = 1; } };
for (const [n, k] of Object.entries({ owl: 0.8, parrot: 0.72, panda: 0.84, cat: 0.76, dog: 0.84 })) {
  ALL[n + '-mini'] = shrink(n, k); COLOURS[n + '-mini'] = BC[n]; HEX[n + '-mini'] = BH[n];
}

// ---------- chibis: one round body, the top spins on the cone seat, everything else is a fixed feature
const hc = [0, 0, 17.5];
const egg = (w = 1) => hull(E(hc, [12, 13 * w, 13]), E([0, 0, 6], [10, 10.5 * w, 6]), E([0, 0, 0], [9, 9 * w, 0.3]));
const fat = (m, c, f = 1.12) => ({ m, p: scaleAbout(m, c, f) });
const eyes = (H, o = {}) => [1, -1].flatMap(s => eye(H, hc, [0.8, s * (o.spread ?? 0.5), o.up ?? 0.3], { toward: [0, -s, -0.1], size: o.size ?? [4.0, 4.6], pupil: [0.58, 0.62], off: [0.14, -0.06], hl: [-0.3, 0.42], dot: 0.95 }).items.map(i => ({ ...i, on: 'top' })));
const grin = (H, half, z0, lift = 1.2) => ({ c: 'black', on: 'top', ...skinLine(H, hc, [-1, -0.5, 0, 0.5, 1].map(k => k * half), th => z0 + lift * (th / half) ** 2, 0.6) });
const feet = (x = 8.2, y = 5.6) => [1, -1].map(s => E([x, s * y, 0], [3.6, 2.9, 3.0]));
// a tail lying on the plate: list of [x, y, r] (each ball sits on the plate)
const floorTail = pts => chain(pts.map(([x, y, r]) => S([x, y, r * 0.7], r)));   // sunk a little: flat strip on the plate
const chibi = (name, o) => bird({ name, egg: o.H, upper: o.upper ?? [], lower: o.lower ?? [], tail: null, zc: 3.4, items: o.items ?? [] });

// chameleon: tall casque on the head, spiral tail standing up behind
ALL['chameleon-mini'] = () => {
  const H = egg(0.95);
  const casque = hull(S([2, 0, 29], 2.2), S([-6, 0, 30.5], 1.6), S([-9, 0, 24], 2.4));
  const spiral = (() => { const cx = -17.5, cz = 6.4, out = []; for (let i = 0; i <= 24; i++) { const t = i / 24, a = (-70 - t * 1.4 * 360) * Math.PI / 180, R = 4.6 - 3.6 * t; out.push(S([cx + R * Math.cos(a), 0, cz + R * Math.sin(a)], 2.4 - 0.9 * t)); } return chain(out); })();
  const tailRoot = hull(S([-9, 0, 3], 3), S([-15.5, 0, 2.2], 2.2));
  return chibi('chameleon-mini', { H, upper: [casque], lower: [spiral, tailRoot, ...feet()], items: [...eyes(H, { size: [4.3, 4.8] }), grin(H, 30, 13.4, 1.0)] });
};
// dragon (purple): horns, little wings, snout with nostrils, tail with an arrow tip curled round on the plate
ALL['dragon-mini'] = () => {
  const H = egg();
  const snout = hull(E([9.5, 0, 15.2], [3.5, 5.2, 3.0]), S([5, 0, 13.8], 2)), nos = s => S([12.6, s * 1.8, 16.2], 0.9);   // above the spin line
  const horn = s => cap([-1, s * 6.5, 27.2], 2.0, [-6.5, s * 9, 33], 0.7);
  // wings: thin fans growing up and out from the back (every edge rises at 40°+, so nothing starts in mid-air)
  const wing = s => { const P = ([x, y, z], r = 0.8) => S([x, s * y, z], r); return U(hull(P([-9.6, 5, 19], 1.0), P([-9.4, 5.6, 25], 1.0), P([-13.8, 11, 30.5]), P([-14.6, 10.4, 26.2])), hull(P([-9.6, 5, 19], 1.0), P([-14.6, 10.4, 26.2]), P([-14.2, 9.2, 23.6]))); };
  const tail = floorTail([[-9, 0, 3.4], [-13.5, -4, 2.8], [-14, -9.5, 2.3], [-10.6, -13.6, 1.9], [-6, -15.2, 1.6]]);
  const tip = hull(S([-6, -15.2, 1.4], 1.4), E([-3, -14.6, 0], [1.3, 3.2, 1.4]), E([-1.4, -16.2, 0], [1.6, 0.9, 1.2]));
  return chibi('dragon-mini', { H, upper: [snout, nos(1), nos(-1), horn(1), horn(-1), wing(1), wing(-1)], lower: [tail, tip, ...feet()], items: [...eyes(H, { up: 0.36 }), grin(H, 22, 13.6, 0.8)] });
};
// axolotl (pink): three gill fronds each side, wide smile, tail fin on the plate
ALL['axolotl-mini'] = () => {
  const H = egg(1.05);
  const gill = (s, a, c) => cap([a[0], s * a[1], a[2]], 2.0, [c[0], s * c[1], c[2]], 1.1);
  const gills = s => U(gill(s, [-2, 11, 20], [-5, 15.4, 26.5]), gill(s, [-1, 12, 18], [-3.4, 17.6, 21.6]), gill(s, [0, 12.2, 15.8], [-1.6, 17.4, 15.4]));
  const tail = hull(E([-10, 0, 3.4], [3, 3, 3.4]), E([-18, 0, 4.6], [5, 1.2, 4.6]));
  return chibi('axolotl-mini', { H, upper: [gills(1), gills(-1)], lower: [tail, ...feet()], items: [...eyes(H, { spread: 0.55, size: [3.8, 4.3] }), grin(H, 34, 13.8, 0.9)] });
};
// shark (blue): dorsal fin on top, tail fin behind, side fins on the plate, white belly
ALL['shark-mini'] = () => {
  const H = egg(0.95), thin = m => m.scale([1, 0.55, 1]);
  const dorsal = thin(hull(S([2, 0, 27.5], 2.2), S([-7, 0, 26], 2.2), S([-7, 0, 34.5], 1.2)));
  const tail = U(thin(hull(S([-9.5, 0, 4], 3.4), S([-15, 0, 4], 2.6))), thin(hull(S([-15, 0, 4], 2.4), S([-20.5, 0, 14], 1.4), S([-18, 0, 4.5], 2.2))), thin(hull(S([-15, 0, 3], 2.4), S([-20.5, 0, 1.4], 1.4))));
  const pec = s => hull(E([2, s * 9, 0], [2.4, 2, 2.6]), E([-1.5, s * 15.5, 0], [1.6, 1.4, 1.4]));
  const belly = E([8.4, 0, 6.5], [3, 7, 6.8]);
  return chibi('shark-mini', { H, upper: [dorsal], lower: [tail, pec(1), pec(-1)], items: [...eyes(H, { size: [3.9, 4.4] }), { c: 'white', on: 'base', ...fat(belly, [8.4, 0, 6.5], 1.06) }, grin(H, 30, 13.6, 1.4)] });
};
// alligator (dark green): long snout, nostril bumps, back bumps, tail curled on the plate
ALL['alligator-mini'] = () => {
  const H = egg();
  // snout stays above the spin line (it rises 1 mm per mm outward), so it sits high with the eyes on top, like a real gator
  const snout = hull(E([6, 0, 19.6], [4, 6.2, 3.4]), E([15.4, 0, 19.8], [3, 4.8, 2.4]), S([3, 0, 18], 3));
  const nos = s => S([16.8, s * 1.9, 21.8], 0.9);
  const bumps = [[-8, 4, 26], [-8, -4, 26], [-11.2, 4, 20], [-11.2, -4, 20]].map(([x, y, z]) => S(surf(H, [0, 0, z], [x, y, 0]), 1.4));
  const tail = floorTail([[-9, 0, 3.4], [-13.6, 4, 2.8], [-14, 9.6, 2.3], [-10.4, 13.6, 1.9], [-5.6, 15, 1.5], [-1.6, 14.6, 1.1]]);
  const tbumps = [[-13.6, 4, 5.3], [-14, 9.6, 4.3], [-10.4, 13.6, 3.6]].map(([x, y, z]) => S([x, y, z], 1.0));
  return chibi('alligator-mini', { H, upper: [snout, nos(1), nos(-1), ...bumps], lower: [tail, ...tbumps, ...feet(7.6, 6.4)], items: [...eyes(H, { up: 0.62, spread: 0.46, size: [3.6, 4.1] })] });
};
// flexi dragon (orange): wingless, swept horns, back plates down the head, tail with plates curled on the plate
ALL['flexi-dragon-mini'] = () => {
  const H = egg();
  const snout = hull(E([9.5, 0, 15.2], [3.5, 5.2, 3.0]), S([5, 0, 13.8], 2)), nos = s => S([12.6, s * 1.8, 16.2], 0.9);   // above the spin line
  const horn = s => U(cap([-2, s * 6, 27], 2.0, [-8, s * 7.6, 31], 1.1), cap([-8, s * 7.6, 31], 1.1, [-12.4, s * 8.4, 32.4], 0.6));
  // back plates: thin fins standing out from the back of the head, the tip swept up
  const plate = (z, h) => { const p = surf(H, [0, 0, z], [-1, 0, 0.2]); return hull(S([p[0] + 1.2, 0, p[2] - 1.6], 0.75), S([p[0] + 1.2, 0, p[2] + 1.6], 0.75), S([p[0] - h, 0, p[2] + h * 0.9], 0.55)); };
  const tp = [[-9, 0, 3.4], [-13.5, 4, 2.8], [-14, 9.5, 2.3], [-10.6, 13.6, 1.9], [-6, 15.2, 1.6]];
  const tplate = ([x, y, r]) => hull(S([x, y, r * 0.7 + r - 0.8], 1.0), S([x, y, r * 0.7 + r + 2.6], 0.5));
  return chibi('flexi-dragon-mini', { H, upper: [snout, nos(1), nos(-1), horn(1), horn(-1), plate(27.5, 3.2), plate(22.5, 3.6), plate(17.5, 3.2)], lower: [floorTail(tp), ...tp.slice(1, 4).map(tplate), ...feet()], items: [...eyes(H, { up: 0.36 }), grin(H, 22, 13.6, 0.8)] });
};
// turtle (teal): shell + head spin together on a flat belly with four flippers and a stub tail
ALL['turtle-mini'] = () => {
  const dome = E([-3, 0, 4], [13, 12.5, 12.5]), rim = E([-3, 0, 3.4], [14, 13.4, 3.4]);
  const hcT = [8.5, 0, 21], head = hull(E(hcT, [7.2, 7.8, 7.4]), S([3, 0, 14], 4));   // head held high so the spin line (45° cone) never cuts it
  const H = U(hull(dome, rim, E([-3, 0, 0], [11.5, 11, 0.3])), head);
  const plate = (x, y, r) => { const p = surf(dome, [-3, 0, 4], [x, y, 0.95]); return E([p[0], p[1], p[2] - 0.8], [r, r, 1.6]); };
  const plates = [E([-3, 0, 15.9], [4.2, 4.2, 1.5]), ...[0, 60, 120, 180, 240, 300].map(a => plate(Math.cos(a * Math.PI / 180) * 0.62, Math.sin(a * Math.PI / 180) * 0.62, 3.2))];
  const flip = (x, s, back) => hull(E([x, s * 10, 0], [3, 2.6, 2.6]), E([x + back, s * 15.6, 0], [3.2, 2.1, 1.8]));
  const tail = hull(E([-15, 0, 0], [2.6, 2.6, 2.6]), E([-18.6, 0, 0], [1.4, 1.4, 1.6]));
  const items = [1, -1].flatMap(s => eye(head, hcT, [0.8, s * 0.5, 0.3], { toward: [0, -s, -0.1], size: [3.4, 3.9], pupil: [0.58, 0.62], off: [0.14, -0.06], hl: [-0.3, 0.42], dot: 0.9 }).items.map(i => ({ ...i, on: 'top' })));
  return bird({ name: 'turtle-mini', egg: H, upper: plates, lower: [flip(5, 1, 2), flip(5, -1, 2), flip(-10, 1, -2), flip(-10, -1, -2), tail], tail: null, zc: 3.4, items });
};
for (const n of ['chameleon', 'dragon', 'axolotl', 'shark', 'alligator', 'turtle', 'flexi-dragon']) { COLOURS[n + '-mini'] = BC[n]; HEX[n + '-mini'] = BH[n]; }
