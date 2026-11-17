// Round 4 (17 Nov 2026): winter minis, built like the chibis (top spins on the cone seat). Polar bear, reindeer, snowman.
// Three colours as usual (body + white + black). The snowman's body colour is orange: the carrot nose, scarf and hat;
// the snow is painted white.
import { U, hull, E, S, cap, chain, eye, skinLine, bird, scaleAbout, surf, Manifold } from './lib.mjs';

export const ALL = {}, COLOURS = {}, HEX = {};
const hc = [0, 0, 17.5];
const egg = (w = 1, h = 1) => hull(E([0, 0, 17.5 * h], [12, 13 * w, 13 * h]), E([0, 0, 6], [10, 10.5 * w, 6]), E([0, 0, 0], [9, 9 * w, 0.3]));
const fat = (m, c, f = 1.12) => ({ m, p: scaleAbout(m, c, f) });
const eyes = (H, o = {}) => [1, -1].flatMap(s => eye(H, o.hc ?? hc, [0.8, s * (o.spread ?? 0.5), o.up ?? 0.3], { toward: [0, -s, -0.1], size: o.size ?? [4.0, 4.6], pupil: [0.58, 0.62], off: [0.14, -0.06], hl: [-0.3, 0.42], dot: 0.95 }).items.map(i => ({ ...i, on: 'top' })));
const feet = (x = 8.2, y = 5.6) => [1, -1].map(s => E([x, s * y, 0], [3.6, 2.9, 3.0]));
const chibi = (name, o) => bird({ name, egg: o.H, upper: o.upper ?? [], lower: o.lower ?? [], tail: null, zc: 3.4, items: o.items ?? [] });
const face = (H, z, y = 0, c = [0, 0, 0]) => surf(H, [c[0], y, z], [1, 0, 0]);
const poke = (H, z, out, r, drop = 2.4, c) => { const f = face(H, z, 0, c); return hull(E([f[0] - 0.6, 0, z], r), S([f[0] + out, 0, z - 0.3], Math.min(r[1], r[2]) * 0.55), S([f[0] - drop - 0.6, 0, z - drop - r[2]], 0.6)); };
const blk = (on, m, c) => ({ c: 'black', on, ...fat(m, c) });
const wht = (on, m, c) => ({ c: 'white', on, ...fat(m, c) });

ALL['polar-bear-mini'] = () => {
  const H = egg(1.02);
  const ear = s => E([-0.6, s * 8.4, 27.4], [2, 3, 2.8]);
  const muzzle = poke(H, 15.6, 2.2, [2.4, 3.6, 2.6], 2.2);
  const nose = E([face(H, 15.6)[0] + 2.2, 0, 16.2], [1.1, 1.7, 1.2]);
  return chibi('polar-bear-mini', {
    H, upper: [ear(1), ear(-1), muzzle], lower: [...feet()],
    items: [...eyes(H, { size: [3.6, 4.2], up: 0.34, spread: 0.46 }), blk('top', nose, [14, 0, 16.2]),
      ...[1, -1].map(s => ({ c: 'black', on: 'top', p: E([0.4, s * 8.6, 27.4], [1, 1.6, 1.6]) })), ...feet().map(m => blk('base', m, [8.2, 0, 0]))]
  });
};

ALL['reindeer-mini'] = () => {
  const H = egg(0.98);
  // antlers: a main beam and two tines each side, every piece rising at 55° or more
  const antler = s => { const P = ([x, y, z], r) => S([x, s * y, z], r); return U(hull(P([-1, 4.6, 27], 1.6), P([-2.4, 7.6, 34], 1.1)), hull(P([-2.4, 7.6, 34], 1.1), P([-3.4, 8.6, 39.6], 0.8)), hull(P([-1.8, 6.2, 31], 1.0), P([0.6, 7.4, 35.6], 0.7)), hull(P([-2.8, 8, 36], 0.9), P([-5.2, 10.6, 39.2], 0.7))); };
  const ear = s => hull(E([-0.5, s * 9.6, 23.6], [1.6, 2.4, 1.4]), S([-1, s * 12, 28.2], 0.8));
  const muzzle = poke(H, 15.4, 2.4, [2.6, 3.8, 2.6], 2.2);
  const nose = E([face(H, 15.4)[0] + 2.4, 0, 16.2], [1.4, 2.0, 1.5]);
  return chibi('reindeer-mini', {
    H, upper: [antler(1), antler(-1), ear(1), ear(-1), muzzle], lower: [...feet()],
    items: [{ c: 'white', on: 'top', ...fat(muzzle, [12, 0, 15]) }, ...eyes(H, { size: [3.8, 4.4], up: 0.36, spread: 0.47 }), blk('top', nose, [14.4, 0, 16.2]),
      { c: 'white', on: 'base', p: E([9.4, 0, 6], [4.4, 7.4, 6.4]) }, ...feet().map(m => blk('base', m, [8.2, 0, 0]))]
  });
};

ALL['snowman-mini'] = () => {
  const lowC = [0, 0, 8.6], headC = [0, 0, 22.4];
  const H = U(hull(E(lowC, [10.4, 10.4, 8.8]), E([0, 0, 0], [8.4, 8.4, 0.3])), E(headC, [8, 8, 7.8]), cap([0, 0, 12], 6.4, [0, 0, 18], 5.6));
  const scarf = hull(E([0, 0, 16.4], [7.2, 7.2, 1.9]), E([0, 0, 15.2], [6.4, 6.4, 0.6]));
  // beanie: a dome over the top of the head, a cuff, and a pom-pom
  const hat = U(E([0, 0, 25.4], [7.4, 7.4, 5.6]).trimByPlane([0, 0, 1], 26.2), hull(E([0, 0, 26.6], [8.1, 8.1, 1.2]), E([0, 0, 25.6], [7.6, 7.6, 0.4])));
  const pom = S([0, 0, 32.2], 2.4);
  const nose = hull(E([face(H, 20.2, 0, headC)[0] - 0.6, 0, 20.2], [1.4, 1.5, 1.4]), S([face(H, 20.2, 0, headC)[0] + 4, 0, 20], 0.5), S([5.4, 0, 17.4], 0.6));
  const btn = z => { const f = surf(H, [0, 0, z], [1, 0, 0]); return E([f[0] - 0.6, 0, z], [1, 1.3, 1.3]); };
  // the white paint stops just outside the orange parts (a paint edge exactly on their skin leaves white specks)
  const not = U(scaleAbout(scarf, [0, 0, 16], 1.04), scaleAbout(hat, [0, 0, 27], 1.04), scaleAbout(nose, [8, 0, 19.6], 1.06));
  return chibi('snowman-mini', {
    H, upper: [scarf, hat, pom, nose],
    items: [{ c: 'white', on: 'top', p: Manifold.cube([60, 60, 60], true).translate([0, 0, 30]).subtract(not).add(pom) },
      { c: 'white', on: 'base', p: Manifold.cube([60, 60, 60], true).translate([0, 0, 30]) },
      ...[1, -1].flatMap(s => eye(H, headC, [0.88, s * 0.46, 0.0], { toward: [0, -s, -0.1], size: [2.9, 3.1], pupil: [0.6, 0.64], off: [0.14, -0.06], hl: [-0.3, 0.42], dot: 0.8 }).items.map(i => ({ ...i, on: 'top' }))),
      ...[11.6, 6.4, 3].map(z => ({ c: 'black', on: z > 10 ? 'top' : 'base', p: btn(z) }))]
  });
};

const C = { 'polar-bear': [[245, 245, 240], '#FFFFFF'], reindeer: [[142, 90, 58], '#8E5A3A'], snowman: [[255, 106, 19], '#FF6A13'] };
for (const [n, [rgb, hex]] of Object.entries(C)) { COLOURS[n + '-mini'] = rgb; HEX[n + '-mini'] = hex; }
