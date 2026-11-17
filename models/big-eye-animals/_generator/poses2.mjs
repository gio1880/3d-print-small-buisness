// Round 2 (17 Nov 2026): new long animals as 2-joint short wigglers in the big-eye style.
// Snake, otter, long-neck dino, fox, seal, caterpillar. Head toward +x, plate at z=0, mm. Same joint as every other short.
import { scaleAbout, U, hull, E, S, cap, chain, station, headSolid, eye, skinLine, flexi, Manifold } from './lib.mjs';

const P = 12.4, pins2 = [0, -P];
const body = st => chain(st.map(s => station(...s)));
const fat = (m, c, k = 1.12) => ({ m, p: scaleAbout(m, c, k) });
const paint = (c, m, at, k) => ({ c, ...fat(m, at, k) });
const leg = (x, s, f = 0.85) => scaleAbout(U(cap([x, s * 5.5, 6.5], 2.7, [x, s * 10.8, 2.6], 2.4), E([x, s * 11.6, 0], [2.2, 3.1, 3.0])), [x, s * 5, 0], f);
const legsAt = (x, f = 0.9) => [leg(x, 1, f), leg(x, -1, f)];
const HC = [12, 0, 10.5];
const head = (r = [9.5, 10.5, 10.5]) => headSolid(HC, r, 0.8);
const neck = (ry, h) => hull(station(0, ry, h), E([7, 0, 9], [5, ry + 0.4, 8.5]));
const EO = { size: [4.0, 4.6], pupil: [0.56, 0.6], off: [0.14, -0.06], hl: [-0.3, 0.42], dot: 0.9 };
const frontEyes = (H, hc, e, o) => [1, -1].flatMap(s => eye(H, hc, [e[0], s * e[1], e[2]], { toward: [0, -s, -0.1], ...o }).items);
const smileF = (H, hc, half, z0, lift) => ({ c: 'black', ...skinLine(H, hc, [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1].map(k => k * half), th => z0 + lift * (th / half) ** 2, 0.62) });
const plateBall = (x, y, r) => E([x, y, r * 0.65], [r, r, r]);   // sits low so its underside stays steep enough to print

export function snakeShort() {
  const hc = [11, 0, 7.2], H = headSolid(hc, [10, 9.6, 7.6], 0.85);
  const st = [[0, 7.4, 12.5], [-P, 7.6, 12.5], [-P - 7, 6.6, 11, 4]];
  const tail = chain([[-P - 9, 0, 5], [-P - 14, 3.5, 4.4], [-P - 19, 6, 3.7], [-P - 24, 4, 3], [-P - 28, -0.5, 2.4], [-P - 31, -3.5, 1.8]].map(([x, y, r]) => plateBall(x, y, r)));
  const fork = s => hull(E([23.4, 0, 0], [0.8, 0.7, 1.1]), E([25.6, s * 1.3, 0], [0.8, 0.6, 1.0]));   // each tip grows out of the tongue
  const tongue = U(E([21, 0, 0], [3.6, 0.9, 1.2]), fork(1), fork(-1));
  const b = U(H, hull(station(0, 7.4, 12.5), E([7, 0, 6.8], [5, 8.4, 6.8])), body(st), tail, tongue);
  const band = x => ({ c: 'black', p: Manifold.cube([2.4, 40, 40]).translate([x - 1.2, -20, -1]) });
  return flexi({
    name: 'snake-short', body: b, pins: pins2,
    items: [...[-4.5, -9, -16.5, -21, -P - 13.5, -P - 19.5, -P - 25].map(band), { c: 'black', m: tongue, p: tongue },
      ...frontEyes(H, hc, [0.62, 0.55, 0.56], { ...EO, size: [3.8, 4.4] }), smileF(H, hc, 26, 4.2, 1.2)]
  });
}

export function otterShort() {
  const H = head([9.4, 10, 9.5]);
  const st = [[0, 7.8, 13.5], [-P, 8.6, 14], [-P - 7, 7.6, 12.5, 4]];
  const ear = s => E([10, s * 7.8, 17.2], [1.8, 2.6, 2.4]);
  const muzzle = E([19.6, 0, 8], [3.6, 5.2, 3.4]), nose = E([22.8, 0, 9.6], [1.2, 2, 1.3]);
  const tail = hull(E([-P - 9, 0, 0], [4, 5, 6.5]), E([-P - 27, 0, 0], [2.6, 2.6, 2.6]));
  const b = U(H, neck(7.8, 13.5), body(st), ear(1), ear(-1), muzzle, legsAt(-9.9), legsAt(-P - 9.9), tail);
  const whiskers = [1, -1].flatMap(s => [[21.6, 3.2, 9.4], [22, 3.6, 8.2], [21.6, 3.2, 7]].map(([x, y, z]) => ({ c: 'black', p: S([x, s * y, z], 0.55) })));
  return flexi({
    name: 'otter-short', body: b, pins: pins2,
    items: [...frontEyes(H, HC, [0.74, 0.5, 0.44], EO), paint('white', muzzle, [19.6, 0, 8]), paint('black', nose, [22.8, 0, 9.6]), ...whiskers]
  });
}

// long-neck dinosaur: round head on a neck that rises at about 55°, so the chin and neck print without support
export function dinoShort() {
  const hc = [14.5, 0, 27], H = E(hc, [5.6, 5.4, 5.4]);
  const st = [[0, 8.2, 15], [-P, 9.2, 16.5], [-P - 7, 8.4, 14, 4]];
  const neckUp = U(hull(station(2, 7.6, 14), S([11.5, 0, 22.5], 4.2)), hull(S([11.5, 0, 22.5], 4.2), H));
  const tail = U(hull(station(-P - 7, 7, 12, 3), E([-P - 16, 2, 0], [3.4, 3.4, 4.2])), hull(E([-P - 16, 2, 0], [3.4, 3.4, 4.2]), E([-P - 24, 5.5, 0], [2.2, 2.2, 2.4])));
  const plates = [-6, -10.5, -15, -19.5].map(x => hull(S([x + 1.8, 0, 14.6], 1.2), S([x - 1.8, 0, 14.6], 1.2), S([x - 0.4, 0, 19.2], 0.9)));
  const b = U(neckUp, body(st), legsAt(-9.9, 1.05), legsAt(-P - 9.9, 1.05), tail, plates);
  return flexi({
    name: 'dino-short', body: b, pins: pins2,
    items: [...[1, -1].flatMap(s => eye(H, hc, [0.72, s * 0.55, 0.3], { toward: [0, -s, -0.1], ...EO, size: [2.7, 3.1], dot: 0.7 }).items),
      smileF(H, hc, 22, 26.2, 0.8),   // at the middle of the face: lower down the head faces the plate and the smile would start in mid-air
{ c: 'white', p: U(plates) }]
  });
}

export function foxShort() {
  const H = head([9.2, 10, 9.5]);
  const st = [[0, 7.4, 13.5], [-P, 8, 14], [-P - 7, 7.2, 12.5, 4]];
  const ear = s => hull(E([10.4, s * 5.4, 16.8], [2.6, 3.4, 2]), S([9.8, s * 7.4, 25.5], 0.8));
  const snout = hull(E([17, 0, 7], [4, 5.6, 4]), E([23, 0, 0], [2, 2, 4.4]));
  const nose = E([24.4, 0, 4.4], [1.1, 1.6, 1.2]);
  const tail = chain([[-P - 9, 0, 4.4], [-P - 15, 3, 5], [-P - 19.5, 8.5, 5.2], [-P - 19, 14.5, 4.4], [-P - 15.5, 18, 3.2]].map(([x, y, r]) => plateBall(x, y, r)));
  const b = U(H, neck(7.4, 13.5), body(st), ear(1), ear(-1), snout, legsAt(-9.9), legsAt(-P - 9.9), tail);
  return flexi({
    name: 'fox-short', body: b, pins: pins2,
    items: [...frontEyes(H, HC, [0.7, 0.52, 0.48], EO), paint('white', snout, [19, 0, 5]), paint('black', nose, [24.4, 0, 4.4]),
      ...[1, -1].map(s => ({ c: 'black', p: S([9.8, s * 7.2, 24.6], 2.8) })),
      ...[-9.9, -P - 9.9].flatMap(x => [1, -1].map(s => ({ c: 'black', p: E([x, s * 11, 0], [3.6, 3.8, 3.4]) }))),
      { c: 'white', p: S([-P - 15.5, 18, 2], 4.8) }]
  });
}

export function sealShort() {
  const H = head([9.6, 10.2, 9.6]);
  const st = [[0, 8, 13.5], [-P, 8.8, 14], [-P - 7, 7.4, 11.5, 4]];
  const muzzle = E([19.4, 0, 7.6], [3.8, 5.4, 3.4]), nose = E([22.8, 0, 9.2], [1.2, 1.9, 1.2]);
  const back = U(hull(station(-P - 7, 7, 11, 3), E([-P - 14, 0, 0], [3, 3.4, 3.8])), ...[1, -1].map(s => hull(E([-P - 14, s * 1.5, 0], [2.4, 2.4, 2.6]), E([-P - 21, s * 6.4, 0], [2.2, 2, 1.8]), E([-P - 22.5, s * 2.6, 0], [1.6, 1.6, 1.6]))));
  // starts 6.7 mm behind the neck pin so it clears the head piece when the joint swings (like the parrot's wings)
  const flipper = s => hull(E([-6, s * 7.2, 0], [2.6, 2, 2.6]), E([-9.4, s * 15, 0], [2.2, 1.6, 1.6]));
  const b = U(H, neck(8, 13.5), body(st), muzzle, back);
  return flexi({
    name: 'seal-short', body: b, pins: pins2,
    items: [...frontEyes(H, HC, [0.74, 0.48, 0.42], { ...EO, size: [4.2, 4.8], pupil: [0.72, 0.76] }), paint('black', nose, [22.8, 0, 9.2]),
      ...[1, -1].flatMap(s => [[21.4, 2.8, 7.6], [21, 3.7, 6.4], [21.8, 2.2, 6.6]].map(([x, y, z]) => ({ c: 'black', p: S([x, s * y, z], 0.5) })))],
    post: [{ seg: 1, c: 'body', m: U(flipper(1), flipper(-1)) }]
  });
}

export function caterpillarShort() {
  const H = head([9.2, 10, 10]);
  const st = [[0, 7.6, 13], [-P, 7.8, 13], [-P - 7, 7.2, 12, 4]];
  const humps = [-4.5, -9, -16.5, -21].map(x => E([x, 0, 8], [3.6, 8.2, 6.4]));
  const end = hull(station(-P - 7, 7.2, 12, 4), E([-P - 13, 0, 0], [4, 6.4, 8.6]));
  const antenna = s => U(cap([10.6, s * 4, 18], 1.1, [9, s * 6.6, 25], 0.8), S([8.8, s * 6.9, 25.6], 1.4));
  const feet = [-4.5, -9, -16.5, -21, -P - 12].flatMap(x => [1, -1].map(s => E([x, s * 7.6, 0], [1.9, 1.9, 2.2])));
  const b = U(H, neck(7.6, 13), body(st), humps, end, antenna(1), antenna(-1), feet);
  return flexi({
    name: 'caterpillar-short', body: b, pins: pins2,
    items: [...frontEyes(H, HC, [0.74, 0.5, 0.42], EO), smileF(H, HC, 28, 5.8, 1.4),
      ...feet.map(m => ({ c: 'black', p: m })), ...[1, -1].map(s => ({ c: 'black', p: S([8.8, s * 6.9, 25.6], 1.6) }))]
  });
}

export const ALL = { 'snake-short': snakeShort, 'otter-short': otterShort, 'dino-short': dinoShort, 'fox-short': foxShort, 'seal-short': sealShort, 'caterpillar-short': caterpillarShort };
export const COLOURS = { 'snake-short': [228, 189, 104], 'otter-short': [142, 90, 58], 'dino-short': [0, 174, 157], 'fox-short': [255, 106, 19], 'seal-short': [245, 245, 240], 'caterpillar-short': [122, 201, 67] };
export const HEX = { 'snake-short': '#E4BD68', 'otter-short': '#8E5A3A', 'dino-short': '#00AE9D', 'fox-short': '#FF6A13', 'seal-short': '#FFFFFF', 'caterpillar-short': '#7AC943' };
