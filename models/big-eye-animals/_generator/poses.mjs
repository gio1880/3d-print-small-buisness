// New poses (17 Nov 2026): the round sitters re-posed long and low so they can be 2-joint short wigglers like the
// chameleon and dragon. Dog lying down (chin on paws), cat in a stretch, panda walking, parrot flying (wings flat on the plate).
// Same joint, spacing and colours as the other shorts. Head toward +x, plate at z=0, mm. Front-facing big eyes.
import { scaleAbout, U, hull, E, S, cap, chain, station, headSolid, eye, flexi, Manifold } from './lib.mjs';
import { COLOURS as BC, HEX as BH } from './animals.mjs';

const P = 12.4, pins2 = [0, -P];
const body = st => chain(st.map(s => station(...s)));
const fat = (m, c, k = 1.12) => ({ m, p: scaleAbout(m, c, k) });
const paint = (c, m, at, k) => ({ c, ...fat(m, at, k) });
const leg = (x, s, f = 0.85) => scaleAbout(U(cap([x, s * 5.5, 6.5], 2.7, [x, s * 10.8, 2.6], 2.4), E([x, s * 11.6, 0], [2.2, 3.1, 3.0])), [x, s * 5, 0], f);
// big eyes looking forward (the sitters' style) on a head facing +x
const frontEyes = (H, hc, e, o) => [1, -1].flatMap(s => eye(H, hc, [e[0], s * e[1], e[2]], { toward: [0, -s, -0.1], ...o }).items);
const HC = [12, 0, 10.5];
const head = (r = [9.5, 10.5, 10.5]) => headSolid(HC, r, 0.8);
const neck = (ry, h) => hull(station(0, ry, h), E([7, 0, 9], [5, ry + 0.4, 8.5]));
const EO = { size: [4.0, 4.6], pupil: [0.56, 0.6], off: [0.14, -0.06], hl: [-0.3, 0.42], dot: 0.9 };

export function dogShort() {
  const H = head();
  const st = [[0, 7.8, 14], [-P, 8.4, 14.5], [-P - 7, 7.6, 13, 4]];
  // floppy ears that fall down the side of the head and rest on the plate
  const ear = s => hull(E([10, s * 7.4, 18.2], [3.2, 2.2, 2.4]), E([8.6, s * 12.6, 0], [3.4, 2.2, 3.2]));
  const muzzle = E([19.4, 0, 8.6], [4.2, 5.4, 4]), nose = E([23.4, 0, 10.6], [1.4, 2.3, 1.6]);
  const paw = s => hull(E([16, s * 5.2, 0], [4, 3, 3.4]), E([24.5, s * 5.4, 0], [3, 2.8, 3]));     // front paws under the chin
  const haunch = s => U(E([-P - 6.5, s * 7.8, 0], [6, 3.6, 7.5]), E([-P - 1.5, s * 8.6, 0], [4, 2.8, 3]));   // back leg folded, foot forward
  const tail = chain([[-P - 9, 0, 9.5, 2.6], [-P - 12.5, 0, 14.5, 2.2], [-P - 14.5, 0, 19.5, 1.8]].map(([x, y, z, r]) => S([x, y, z], r)));
  const b = U(H, neck(7.8, 14), body(st), muzzle, paw(1), paw(-1), haunch(1), haunch(-1), tail);
  const e = [0.74, 0.5, 0.42];
  const eyes = [...eye(H, HC, [e[0], e[1], e[2]], { toward: [0, -1, -0.1], ...EO }).items,
    ...eye(H, HC, [e[0], -e[1], e[2]], { toward: [0, 1, -0.1], ...EO, patch: [5.6, 6.0, 0.8, 0.5] }).items];
  return flexi({
    name: 'dog-short', body: b, pins: pins2,
    items: [...[1, -1].map(s => ({ c: 'black', m: ear(s), p: scaleAbout(ear(s), [9.5, s * 10, 9], 1.08) })), ...eyes,
      paint('white', muzzle, [19.4, 0, 8.6]), paint('black', nose, [23.4, 0, 10.6])]
  });
}

export function catShort() {
  const H = head([9.5, 10.5, 10]);
  // the stretch: chest low, hips up, front paws reaching forward
  const st = [[0, 7.4, 13.5], [-P, 7.8, 15.5], [-P - 7, 7.4, 16.5, 4]];
  const ear = s => hull(E([10.6, s * 5.6, 17.6], [2.6, 3.6, 2]), S([10.2, s * 7.8, 25.2], 0.8));
  const inner = s => scaleAbout(ear(s), [10.6, s * 6.4, 20], 0.62).translate([1.4, 0, 0]);
  const cheek = s => E([20, s * 2.6, 8.4], [2.6, 2.9, 2.4]);
  const nose = hull(E([21.8, 0, 11], [1.1, 1.5, 1]), S([21.6, 0, 10.2], 0.5));
  const paw = s => hull(E([15, s * 5, 0], [4, 2.8, 3.2]), E([27, s * 4.6, 0], [3.2, 2.6, 2.8]));
  const tail = chain([[-P - 9, 11, 2.6], [-P - 13.5, 15.5, 2.4], [-P - 15, 21, 2.2], [-P - 13.6, 25.6, 2], [-P - 10.6, 27.6, 1.8]].map(([x, z, r]) => S([x, 0, z], r)));
  const b = U(H, neck(7.4, 13.5), body(st), paw(1), paw(-1), leg(-P - 9.9, 1), leg(-P - 9.9, -1), tail, ear(1), ear(-1));
  return flexi({
    name: 'cat-short', body: b, pins: pins2,
    items: [...[1, -1].map(s => ({ c: 'white', p: inner(s) })), ...frontEyes(H, HC, [0.72, 0.5, 0.44], EO),
      ...[1, -1].map(s => paint('white', cheek(s), [20, s * 2.6, 8.4])), paint('black', nose, [21.8, 0, 10.6]),
      ...[1, -1].map(s => ({ c: 'white', p: E([25.5, s * 4.7, 0], [4.4, 3.4, 3.6]) }))]
  });
}

export function pandaShort() {
  const H = head([9.8, 10.8, 10.5]);
  const st = [[0, 8.2, 14.5], [-P, 9.0, 15.5], [-P - 7, 8.2, 14, 4]];
  const ear = s => E([9.6, s * 7.4, 19.4], [2.4, 3.2, 3.2]);
  const muzzle = E([19.8, 0, 8.6], [3.4, 4.6, 3.4]), nose = E([22.8, 0, 9.8], [1.1, 1.9, 1.3]);
  const legs = x => [1, -1].map(s => leg(x, s, 0.95));
  const tail = hull(E([-P - 10, 0, 5], [2.6, 3.2, 3.2]), E([-P - 9, 0, 0], [2.4, 3, 0.4]));
  const b = U(H, neck(8.2, 14.5), body(st), muzzle, ear(1), ear(-1), legs(-9.9), legs(-P - 9.9), tail);
  const blk = (m, c) => paint('black', m, c, 1.1);
  return flexi({
    name: 'panda-short', body: b, pins: pins2,
    items: [...[1, -1].map(s => blk(ear(s), [9.6, s * 7.4, 19.4])),
      // black shoulder band, like a real panda
      { c: 'black', p: E([-3.5, 0, 9], [4.2, 12, 11]) },
      ...[-9.9, -P - 9.9].flatMap(x => [1, -1].map(s => blk(leg(x, s, 0.95), [x, s * 9, 3]))),
      ...frontEyes(H, HC, [0.74, 0.47, 0.46], { ...EO, size: [3.3, 3.9], patch: [5.0, 5.6, 0.8, -0.3] }),
      blk(nose, [22.8, 0, 9.8])]
  });
}

export function parrotShort() {
  const H = head([9.4, 10, 10.5]);
  const st = [[0, 7.4, 13], [-P, 7.8, 12.5], [-P - 7, 6.8, 11, 4]];
  const beak = hull(E([19.6, 0, 12.2], [2.2, 3, 3.4]), S([23.8, 0, 10.4], 1.0), E([19.6, 0, 6.8], [1.6, 2, 1]));
  const crest = U(hull(S([10.5, 0, 19.6], 2.2), S([6.6, 0, 26.4], 1.0)), hull(S([8, 0, 19.4], 2), S([3.6, 0, 24.6], 0.9)), hull(S([12.6, 0, 19.4], 1.8), S([11, 0, 24.8], 0.9)));
  // wings spread flat on the plate (they ride on the middle piece), with two feather notches each
  const wing = s => {
    // starts 3 mm behind the neck pin (6.7 mm out from it) so it clears the head piece when the joint swings
    let w = hull(E([-5.8, s * 6.4, 0], [2.6, 2, 3.4]), E([-9.8, s * 6.4, 0], [2.2, 2, 3.2]), E([-6, s * 18, 0], [2, 2, 2.2]), E([-10.4, s * 19, 0], [1.8, 2, 1.8]));
    for (const y of [13.5, 16.5]) w = w.subtract(Manifold.cube([3.4, 0.9, 6]).translate([-13.4, s * y - 0.45, -1]));
    return w;
  };
  let tail = hull(E([-P - 7, 0, 0], [3, 5, 5]), E([-P - 23, 5.2, 0], [2.4, 2, 2.4]), E([-P - 23, -5.2, 0], [2.4, 2, 2.4]), E([-P - 25.5, 0, 0], [2.4, 2.2, 2.8]));
  for (const y of [-2.1, 2.1]) tail = tail.subtract(Manifold.cube([12, 0.9, 3]).translate([-P - 28, y - 0.45, 2.2]));
  const b = U(H, neck(7.4, 13), body(st), beak, crest, tail);
  return flexi({
    name: 'parrot-short', body: b, pins: pins2,
    items: [...frontEyes(H, HC, [0.74, 0.48, 0.44], { ...EO, size: [3.8, 4.4] }), paint('white', beak, [19.6, 0, 10])],
    post: [{ seg: 1, c: 'body', m: U(wing(1), wing(-1)) }]
  });
}

export const ALL = { 'dog-short': dogShort, 'cat-short': catShort, 'panda-short': pandaShort, 'parrot-short': parrotShort };
export const COLOURS = {}, HEX = {};
for (const n of Object.keys(ALL)) { const b = n.replace(/-short$/, ''); COLOURS[n] = BC[b]; HEX[n] = BH[b]; }
