// Round 3 (17 Nov 2026): new round minis, about 1.3 in, built like the chibis: one round body, the top spins on the
// cone seat (no joint, nothing to come apart). Bunny, hamster, penguin, frog, hedgehog, chick, pig.
// Faces sit above the spin line (the cut is a 45° cone, z = r + 0.4), so snouts and beaks stay high on the head.
import { U, hull, E, S, cap, chain, eye, skinLine, bird, scaleAbout, surf } from './lib.mjs';

export const ALL = {}, COLOURS = {}, HEX = {};
const hc = [0, 0, 17.5];
const egg = (w = 1, h = 1) => hull(E([0, 0, 17.5 * h], [12, 13 * w, 13 * h]), E([0, 0, 6], [10, 10.5 * w, 6]), E([0, 0, 0], [9, 9 * w, 0.3]));
const fat = (m, c, f = 1.12) => ({ m, p: scaleAbout(m, c, f) });
const eyes = (H, o = {}) => [1, -1].flatMap(s => eye(H, o.hc ?? hc, [0.8, s * (o.spread ?? 0.5), o.up ?? 0.3], { toward: [0, -s, -0.1], size: o.size ?? [4.0, 4.6], pupil: [0.58, 0.62], off: [0.14, -0.06], hl: [-0.3, 0.42], dot: 0.95 }).items.map(i => ({ ...i, on: 'top' })));
const grin = (H, half, z0, lift = 1.2) => ({ c: 'black', on: 'top', ...skinLine(H, hc, [-1, -0.5, 0, 0.5, 1].map(k => k * half), th => z0 + lift * (th / half) ** 2, 0.6) });
const feet = (x = 8.2, y = 5.6) => [1, -1].map(s => E([x, s * y, 0], [3.6, 2.9, 3.0]));
const floorTail = pts => chain(pts.map(([x, y, r]) => S([x, y, r * 0.7], r)));
const chibi = (name, o) => bird({ name, egg: o.H, upper: o.upper ?? [], lower: o.lower ?? [], tail: null, zc: 3.4, items: o.items ?? [] });
// a point on the face: straight out from the head centre at height z
const face = (H, z, y = 0) => surf(H, [0, y, z], [1, 0, 0]);
// something that sticks out of the face, with a chin that slopes back into the head at 45° (no start in mid-air)
const poke = (H, z, out, r, drop = 2.4) => { const f = face(H, z); return hull(E([f[0] - 0.6, 0, z], [r[0], r[1], r[2]]), S([f[0] + out, 0, z - 0.3], Math.min(r[1], r[2]) * 0.55), S([f[0] - drop - 0.6, 0, z - drop - r[2]], 0.6)); };
const blk = (on, m, c) => ({ c: 'black', on, ...fat(m, c) });
const wht = (on, m, c) => ({ c: 'white', on, ...fat(m, c) });
// wing / arm bump on the side of the base, tip resting on the plate
const sideBump = (s, c, r, tip) => hull(E([c[0], s * c[1], c[2]], r), S([tip[0], s * tip[1], tip[2]], 0.8));

ALL['bunny-mini'] = () => {
  const H = egg(0.95);
  const ear = s => hull(E([-1, s * 4.2, 27], [2.4, 3, 2]), E([-2.4, s * 5.6, 38.5], [1.8, 2.8, 2.6]));
  const inner = s => E([-0.2, s * 5.2, 33.5], [1.4, 1.7, 4.4]);
  const nose = E([face(H, 16.4)[0] - 0.2, 0, 16.4], [1.1, 1.6, 1.1]);
  const tail = E([-11, 0, 0], [3.4, 3.6, 5.4]);
  return chibi('bunny-mini', {
    H, upper: [ear(1), ear(-1)], lower: [tail, ...feet()],
    items: [...[1, -1].map(s => ({ c: 'white', on: 'top', p: inner(s) })), ...eyes(H, { size: [4.2, 4.8] }), blk('top', nose, [11.6, 0, 16.4]),
      grin(H, 14, 13.6, 0.6), wht('base', tail, [-11, 0, 2]), ...feet().map(m => wht('base', m, [8.2, 0, 0]))]
  });
};

ALL['hamster-mini'] = () => {
  const H = egg(1.1, 0.96);
  const ear = s => E([-1, s * 8.6, 27], [1.8, 2.8, 2.6]);
  const cheek = s => E([7.6, s * 7.4, 14.6], [3.6, 3.8, 3.2]);
  const nose = E([face(H, 16.6)[0] - 0.2, 0, 16.6], [1, 1.5, 1]);
  const paw = s => E([9.6, s * 3, 8.6], [2.4, 2.2, 2.2]);   // little hands held up on the belly (base)
  return chibi('hamster-mini', {
    H, upper: [ear(1), ear(-1), cheek(1), cheek(-1)], lower: [...feet(), paw(1), paw(-1)],
    items: [...eyes(H, { size: [3.8, 4.4], spread: 0.48, up: 0.34 }), blk('top', nose, [11.4, 0, 16.6]),
      ...[1, -1].map(s => wht('top', cheek(s), [7.6, s * 7.4, 14.6])), ...[1, -1].map(s => ({ c: 'white', on: 'top', p: E([-0.6, s * 8.8, 27.4], [1.2, 1.6, 1.6]) })),
      { c: 'white', on: 'base', p: E([9.6, 0, 6], [4.4, 7.6, 6.4]) }, ...[1, -1].map(s => ({ c: 'white', on: 'base', p: E([9.6, s * 3, 8.6], [2.8, 2.6, 2.6]) }))]
  });
};

ALL['penguin-mini'] = () => {
  const H = egg(0.95, 1.04);
  const beak = poke(H, 17.4, 2.6, [1.4, 1.8, 1.4], 1.8);
  const flipper = s => sideBump(s, [-1, 11.6, 10], [4, 2, 5.4], [-3, 11.4, 0.6]);
  return chibi('penguin-mini', {
    H, upper: [beak], lower: [flipper(1), flipper(-1), ...feet(8.4, 4.4)],
    items: [{ c: 'white', on: 'top', p: hull(E([8.6, 4, 18.4], [5, 4.2, 4.6]), E([8.6, -4, 18.4], [5, 4.2, 4.6]), E([9, 0, 12], [5, 7, 4])) },
      { c: 'white', on: 'base', p: E([8.4, 0, 8], [5.4, 8, 9]) },
      ...eyes(H, { size: [3.6, 4.2], up: 0.32, spread: 0.44 }), blk('top', beak, [12, 0, 17]), ...feet(8.4, 4.4).map(m => blk('base', m, [8.4, 0, 0]))]
  });
};

ALL['frog-mini'] = () => {
  const H = egg(1.12, 0.9);
  const bulge = s => E([2.6, s * 6.2, 26.4], [4.4, 4.4, 4]);   // the eye bumps on top
  const hc2 = s => [2.6, s * 6.2, 26.4];
  const bigEye = s => eye(U(H, bulge(s)), hc2(s), [0.85, s * 0.3, 0.42], { toward: [0, -s, -0.1], size: [3.0, 3.4], pupil: [0.6, 0.64], off: [0.1, -0.04], hl: [-0.3, 0.42], dot: 0.75 }).items.map(i => ({ ...i, on: 'top' }));
  const foot = s => hull(E([7.6, s * 6.4, 0], [3, 2.4, 2.4]), E([12.4, s * 9.4, 0], [1.8, 2.2, 1.4]), E([10.2, s * 11.2, 0], [1.6, 1.8, 1.4]));
  const back = s => hull(E([-6, s * 9.4, 0], [5.4, 3, 5]), E([1.4, s * 12.2, 0], [2.6, 2, 1.6]));
  return chibi('frog-mini', {
    H, upper: [bulge(1), bulge(-1)], lower: [foot(1), foot(-1), back(1), back(-1)],
    items: [...bigEye(1), ...bigEye(-1), { c: 'black', on: 'top', ...skinLine(H, hc, [-1, -0.5, 0, 0.5, 1].map(k => k * 38), th => 13.4 + 1.4 * (th / 38) ** 2, 0.6) },
      { c: 'white', on: 'base', p: E([9.4, 0, 6], [4.2, 8, 6.4]) }]
  });
};

ALL['hedgehog-mini'] = () => {
  const H = egg(1, 0.94);
  const snout = poke(H, 15.4, 3.6, [2.6, 3.4, 2.6], 2.2);
  // spikes on the back half, every one leaning up at least 50°, so each grows out of the one below it
  const spikes = [];
  for (const [el, n, len] of [[25, 9, 4.6], [48, 7, 4.2], [70, 4, 3.6]]) for (let i = 0; i < n; i++) {
    const az = (110 + (140 / (n - 1)) * i) * Math.PI / 180, e = el * Math.PI / 180;
    const d = [Math.cos(az) * Math.cos(e), Math.sin(az) * Math.cos(e), Math.sin(e)];
    const base = surf(H, hc, d), up = [d[0] * 0.6, d[1] * 0.6, Math.max(d[2], 0.85)];
    spikes.push(hull(S([base[0] - d[0] * 1.2, base[1] - d[1] * 1.2, base[2] - d[2] * 1.2], 2.0), S([base[0] + up[0] * len, base[1] + up[1] * len, base[2] + up[2] * len], 0.5)));
  }
  return chibi('hedgehog-mini', {
    H, upper: [snout, ...spikes], lower: [...feet()],
    items: [{ c: 'white', on: 'top', p: E([9.6, 0, 17], [4.6, 9, 7]) }, ...eyes(H, { size: [3.6, 4.2], up: 0.28, spread: 0.46 }),
      blk('top', E([face(H, 15.4)[0] + 3.4, 0, 15.2], [1.3, 1.6, 1.3]), [14.6, 0, 15.2]), ...feet().map(m => wht('base', m, [8.2, 0, 0]))]
  });
};

ALL['chick-mini'] = () => {
  const H = egg(0.92, 0.94);
  const beak = poke(H, 17.6, 2.4, [1.3, 1.7, 1.2], 1.6);
  const tuft = U(hull(S([0, 0, 28.6], 1.8), S([-1.2, 0, 33], 0.8)), hull(S([-1.4, 0, 28.4], 1.6), S([-4.4, 0, 31.6], 0.7)), hull(S([1.2, 0, 28.4], 1.6), S([2.6, 0, 32.2], 0.7)));
  const wing = s => sideBump(s, [-1.6, 11.4, 10], [4.4, 2, 4.6], [-3.6, 11.2, 0.6]);
  return chibi('chick-mini', {
    H, upper: [beak, tuft], lower: [wing(1), wing(-1), ...feet(8.2, 4.6)],
    items: [...eyes(H, { size: [3.8, 4.4], spread: 0.46 }), blk('top', beak, [12, 0, 17.4]), ...feet(8.2, 4.6).map(m => blk('base', m, [8.2, 0, 0])),
      ...[1, -1].map(s => ({ c: 'white', on: 'base', p: E([-3.6, s * 12, 1.6], [2.6, 2.6, 2.6]) }))]
  });
};

ALL['pig-mini'] = () => {
  const H = egg(1.05);
  const snout = poke(H, 15.8, 1.8, [1.8, 4, 3], 2);
  const f = face(H, 15.8);
  const nostril = s => E([f[0] + 2.7, s * 1.5, 15.6], [0.7, 0.8, 1.1]);
  const ear = s => hull(E([2, s * 7.4, 26.2], [2.6, 3, 1.8]), S([5.4, s * 9.4, 29.4], 0.8));
  const tail = floorTail([[-9.6, 0, 2.6], [-13, 1.2, 1.9], [-14.4, -1.2, 1.6], [-12.6, -3, 1.4], [-11, -1.6, 1.2]]);
  return chibi('pig-mini', {
    H, upper: [snout, ear(1), ear(-1)], lower: [tail, ...feet()],
    items: [...eyes(H, { size: [3.8, 4.4], up: 0.36, spread: 0.5 }), ...[1, -1].map(s => ({ c: 'black', on: 'top', p: nostril(s) })),
      grin(H, 22, 12.6, 0.8), ...feet().map(m => blk('base', m, [8.2, 0, 0]))]
  });
};

const C = { bunny: [[245, 163, 199], '#F5A3C7'], hamster: [[198, 142, 90], '#C68E5A'], penguin: [[10, 41, 137], '#0A2989'], frog: [[122, 201, 67], '#7AC943'], hedgehog: [[142, 90, 58], '#8E5A3A'], chick: [[228, 189, 104], '#E4BD68'], pig: [[245, 163, 199], '#F5A3C7'] };
for (const [n, [rgb, hex]] of Object.entries(C)) { COLOURS[n + '-mini'] = rgb; HEX[n + '-mini'] = hex; }
