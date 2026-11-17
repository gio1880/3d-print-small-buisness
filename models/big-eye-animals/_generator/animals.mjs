// The six animals + the joint test piece. Head toward +x, plate at z=0, sizes in mm.
import { CrossSection, scaleAbout, U, hull, E, S, cap, chain, station, headSolid, eye, skinLine, flexi, bird, Manifold, surf } from './lib.mjs';

const P = 12.4;                                   // spacing between joints
const pinsN = n => Array.from({ length: n }, (_, i) => -i * P);
const body = st => chain(st.map(s => station(...s)));
const topZ = (st, x) => { for (let i = 0; i < st.length - 1; i++) if (x <= st[i][0] && x >= st[i + 1][0]) { const t = (st[i][0] - x) / (st[i][0] - st[i + 1][0]); return st[i][2] + t * (st[i + 1][2] - st[i][2]); } return st[st.length - 1][2]; };
// spikes sit 1.3 mm into the back. Past the last station the back drops toward the tail, so pass `on` (the body) to use the real
// surface there; otherwise the spike's flat base hangs in the air (support check 17 Nov 2026).
const spike = (st, x, r = 1.8, h = 3.8, on = null) => Manifold.cylinder(h, r, 0.4, 20).translate([x, 0, Math.min(topZ(st, x), on ? surf(on, [x, 0, 1], [0, 0, 1])[2] : 99) - 1.3]);
const leg = (x, s) => U(cap([x, s * 5.5, 6.5], 2.7, [x, s * 10.8, 2.6], 2.4), E([x, s * 11.6, 0], [2.2, 3.1, 3.0]));
const legs = x => [leg(x, 1), leg(x, -1)];
const sideEyes = (H, hc, e, o) => [1, -1].flatMap(s => eye(H, hc, [e[0], s * e[1], e[2]], { toward: [1, 0, -0.15], ...o }).items);
const smile = (H, hc, half, z0, lift) => ({ c: 'black', ...skinLine(H, hc, [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1].map(k => k * half), th => z0 + lift * (th / half) ** 2, 0.68) });

export function chameleon() {
  const hc = [12, 0, 8.6], H = headSolid(hc, [11.5, 9.6, 10.4]);
  const head = U(H, E([21.5, 0, 5.6], [5.2, 5.6, 6.2]));
  const st = [[0, 7.6, 15.5], [-P, 8.0, 18.5], [-2 * P, 7.3, 14.5]];
  const spiral = (() => { const cx = -44, cz = 7.6, out = []; for (let i = 0; i <= 24; i++) { const t = i / 24, a = (-55 - t * 1.4 * 360) * Math.PI / 180, R = 5.4 - 4.2 * t; out.push(S([cx + R * Math.cos(a), 0, cz + R * Math.sin(a)], 3.1 - 1.1 * t)); } return chain(out); })();
  const tail = U(hull(station(-32, 5.4, 10.5, 3), S([-37.3, 0, 3.1], 3.1)), hull(S([-37.3, 0, 3.1], 3.1), S([-40.9, 0, 3.18], 3.1)), spiral);
  const b = U(head, hull(S([8, 0, 15.5], 3.4), S([1.2, 0, 22.5], 2.1)),
    hull(station(...st[0]), E([8, 0, 8.6], [5, 8.6, 9.6])), body(st), tail,
    [-9.3, -12.6, -15.9, -21.7, -25, -28.3].map(x => spike(st, x, 1.8, 3.8, U(body(st), tail))), legs(-9.9), legs(-P - 9.9));
  return flexi({ name: 'chameleon', body: b, pins: pinsN(3), items: [...sideEyes(H, hc, [0.1, 1, 0.1], { size: [5.6, 6.3] }), smile(head, hc, 40, 3.6, 1.8)] });
}

export function dragon() {
  const hc = [11.5, 0, 8.4], H = headSolid(hc, [11, 9.6, 10]);
  const head = U(H, E([21.5, 0, 5.6], [6.4, 6.2, 6.0]), S([25.2, 2.5, 10.2], 1.4), S([25.2, -2.5, 10.2], 1.4));
  const st = [[0, 7.6, 15], [-P, 8.2, 16], [-2 * P, 7.8, 14.5], [-3 * P, 7.2, 12]];
  const tip = U(hull(station(-44.2, 5.2, 9, 3), S([-48, 0, 2.6], 2.6)), hull(S([-47.5, 0, 2.2], 2.4), E([-50.5, 6.4, 0], [1.9, 1.9, 3.2]), E([-50.5, -6.4, 0], [1.9, 1.9, 3.2]), E([-59.5, 0, 0], [1.6, 1.6, 2.6])));
  const b = U(head, hull(station(...st[0]), E([7.5, 0, 8.4], [5, 8.6, 9.2])), body(st), tip,
    [-10.2, -15.4, -22.6, -27.8, -35, -40.2].map(x => spike(st, x, 2.1, 4.8, U(body(st), tip))), legs(-9.9), legs(-P - 9.9));
  const wing = s => new CrossSection([[[-7.2, -2.5], [-6.6, 16.5], [-9.6, 15.6], [-11.2, 10.6], [-15.4, 12.4], [-13.6, 5.6], [-15.2, 3.2], [-14.6, -2.5]]]).extrude(2.4).translate([0, 0, -1.2]).rotate([90, 0, 0]).rotate([-38 * s, 0, 0]).translate([0, s * 3.8, 13.4]);
  const horn = s => cap([5, s * 4.4, 15.5], 2.4, [-2.6, s * 6.8, 23.6], 0.8);
  return flexi({
    name: 'dragon', body: b, pins: pinsN(4), items: [...sideEyes(H, hc, [0.12, 1, 0.12], { size: [5.4, 6.1] }), smile(head, hc, 38, 3.4, 1.8)],
    post: [{ seg: 0, c: 'body', m: U(horn(1), horn(-1)) }, { seg: 1, c: 'body', m: U(wing(1), wing(-1)) }]
  });
}

export function axolotl() {
  const hc = [10.5, 0, 7.2], H = headSolid(hc, [11, 12.4, 8.6]);
  const st = [[0, 7.6, 13], [-P, 8.0, 13.5], [-2 * P, 7.3, 12.5]];
  const tail = U(hull(station(-32, 5.0, 10.5, 3), E([-38, 0, 5.5], [5, 2.4, 6.2])), E([-43, 0, 6.4], [10, 1.7, 6.9]));
  const b = U(H, hull(station(...st[0]), E([7, 0, 7.2], [5, 9.5, 8])), body(st), tail,
    E([-12.8, 0, 12.8], [4.2, 1.5, 3.2]), E([-25.2, 0, 12.2], [4.2, 1.5, 3.2]), legs(-9.9), legs(-P - 9.9));
  const gill = (s, a, c) => cap([a[0], s * a[1], a[2]], 2.9, [c[0], s * c[1], c[2]], 1.5);
  const gills = s => U(gill(s, [2.5, 9, 10.5], [-3.2, 12.6, 16.4]), gill(s, [4, 9.8, 10.5], [2.6, 15.2, 17.6]), gill(s, [6, 10, 10], [8.4, 14.6, 15.8]));
  return flexi({
    name: 'axolotl', body: b, pins: pinsN(3),
    items: [...sideEyes(H, hc, [0.6, 0.8, 0.2], { size: [4.7, 5.2] }), smile(H, hc, 24, 3.6, 1.6)],
    post: [{ seg: 0, c: 'body', m: U(gills(1), gills(-1)) }]
  });
}

export function shark() {
  const hc = [11, 0, 7.8], H = headSolid(hc, [11, 9.2, 9.4]);
  const head = U(H, hull(E([14, 0, 6.6], [7, 7.4, 7.2]), E([27.5, 0, 3.4], [3, 3.6, 3.4])));
  const st = [[0, 7.6, 14.5], [-P, 8.0, 15], [-2 * P, 7.2, 12.5]];
  const thin = m => m.scale([1, 0.62, 1]);
  const tail = U(hull(station(-32, 4.8, 9, 3), S([-36.2, 0, 4], 3.4)), thin(hull(S([-35, 0, 6.5], 3.2), S([-39.5, 0, 3], 3), S([-46, 0, 19], 1.9))), thin(cap([-36, 0, 3.2], 3.2, [-44.5, 0, 1.2], 2.1)));
  const fin = thin(hull(S([-8.4, 0, 13.4], 2), S([-16.2, 0, 13.4], 2), S([-17, 0, 24.5], 1.7)));
  const pec = s => hull(E([-7.8, s * 6.5, 0], [1.6, 1.6, 3.2]), E([-10.4, s * 6.5, 0], [1.6, 1.6, 3.2]), E([-10.4, s * 16, 0], [1.5, 1.5, 2.0]));
  const b = U(head, hull(station(...st[0]), E([7.5, 0, 7.8], [5, 8.4, 8.8])), body(st), tail, fin, pec(1), pec(-1));
  return flexi({ name: 'shark', body: b, pins: pinsN(3), items: [...sideEyes(H, hc, [0.2, 1, 0.16], { size: [5.2, 5.7] }), smile(head, hc, 44, 2.6, 2.2)] });
}

// ---- birds
const fat = (m, c) => ({ m, p: scaleAbout(m, c, 1.12) });
const frontEyes = (H, hc, e, o) => [1, -1].flatMap(s => eye(H, hc, [e[0], s * e[1], e[2]], { toward: [0, -s, -0.1], ...o }).items.map(i => ({ ...i, on: 'top' })));
const toes = s => [-26, 0, 26].map(a => { const r = a * Math.PI / 180, c = [9.3 + 2.6 * Math.cos(r), s * 5.6 + 2.6 * Math.sin(r), 0]; return E([0, 0, 0], [3.3, 1.25, 1.7]).rotate([0, 0, a]).translate(c); });
const tailFan = (len, w) => { let t = hull(E([-21, 0, 0], [3.6, 5.6, 5.2]), E([-20 - len, w, 0], [2.4, 2.0, 2.6]), E([-20 - len, -w, 0], [2.4, 2.0, 2.6]), E([-22.5 - len, 0, 0], [2.4, 2.2, 3.0])); for (const y of [-2.1, 2.1]) t = t.subtract(Manifold.cube([len + 2, 0.9, 3]).translate([-24 - len, y - 0.45, 2.4])); return t; };
// tip z 0.6: the tip is the lowest point, so it rests on the plate (it started in mid-air before 17 Nov 2026)
const wingBump = (s, c, r, tip) => hull(E([c[0], s * c[1], c[2]], r), S([tip[0], s * tip[1], tip[2]], 0.8));

export function parrot() {
  const hc = [0, 0, 15.5], hr = [14, 15, 20.5], H = headSolid(hc, hr, 0.77);
  const beak = hull(E([12.3, 0, 20.4], [1.9, 3.7, 4.9]), S([17.8, 0, 20.0], 1.0));
  const crest = U(hull(S([0, 0, 34], 2.4), S([-3.5, 0, 39.4], 1.1)), hull(S([-3, 0, 33.2], 2.2), S([-8.2, 0, 37.2], 1.0)), hull(S([2.6, 0, 33.6], 2.0), S([1.6, 0, 38], 1.0)));
  const wing = s => wingBump(s, [-2, 13.2, 9.5], [6.6, 3.0, 5.4], [-4, 12.4, 0.6]);
  return bird({
    name: 'parrot', egg: H, upper: [crest], lower: [wing(1), wing(-1)], tail: tailFan(13, 4.6),
    items: [...frontEyes(H, hc, [0.77, 0.47, 0.47], { size: [5.3, 6.3], pupil: [0.52, 0.6], off: [0.24, -0.06], hl: [-0.1, 0.46], dot: 1.05 }),
    { c: 'white', on: 'top', ...fat(beak, [12.3, 0, 20.4]) }, ...[1, -1].flatMap(s => toes(s).map(m => ({ c: 'black', on: 'base', ...fat(m, [9.3, s * 5.6, 0]) })))]
  });
}

export function owl() {
  const hc = [0, 0, 15], hr = [14, 15.5, 19], H = headSolid(hc, hr, 0.77);
  const tuft = s => cap([0.5, s * 8, 28.5], 3.2, [0, s * 11.6, 36.8], 0.9);
  const beak = hull(E([12.9, 0, 19.2], [1.5, 2.1, 3.0]), S([16.1, 0, 19.3], 0.75));
  const wing = s => wingBump(s, [-2, 13.6, 9.5], [6.8, 3.0, 5.4], [-4, 12.6, 0.6]);
  return bird({
    name: 'owl', egg: H, upper: [tuft(1), tuft(-1)], lower: [wing(1), wing(-1), ...toes(1), ...toes(-1)], tail: tailFan(7, 4.2),
    items: [...frontEyes(H, hc, [0.77, 0.48, 0.47], { size: [6.0, 6.2], pupil: [0.56, 0.56], off: [0.12, -0.04], hl: [-0.3, 0.42], dot: 1.1 }),
    { c: 'black', on: 'top', ...fat(beak, [12.9, 0, 19.2]) }]
  });
}

// ---- two plain links to test the joint fit before printing a whole animal
export function jointTest() {
  return flexi({ name: 'joint-test', body: body([[4, 7.6, 12], [-P, 7.6, 12], [-P - 6, 7.2, 11]]), pins: [0] });
}

export const ALL = { chameleon, parrot, dragon, axolotl, shark, owl, 'joint-test': jointTest };
export const COLOURS = { chameleon: [120, 200, 40], parrot: [215, 35, 35], dragon: [120, 70, 200], axolotl: [245, 150, 180], shark: [60, 140, 215], owl: [150, 100, 60], 'joint-test': [150, 150, 150] };
export const HEX = { chameleon: '#7AC943', parrot: '#C12E1F', dragon: '#5E43B7', axolotl: '#F5A3C7', shark: '#0086D6', owl: '#8E5A3A', 'joint-test': '#898989' };

// ---- added 16 Nov (second batch)
export function alligator() {
  const hc = [10, 0, 7], H = headSolid(hc, [10, 9, 8.8]);
  const head = U(H, hull(E([13, 0, 5.4], [6, 7, 5.6]), E([30, 0, 3.2], [4.2, 5.2, 3.7])), S([31.6, 2.3, 6.4], 1.4), S([31.6, -2.3, 6.4], 1.4));
  const st = [[0, 7.6, 13.5], [-P, 8.4, 14], [-2 * P, 8.0, 13], [-3 * P, 7.3, 11.5], [-4 * P, 7.2, 10.5]];
  const tip = hull(station(-56.6, 5, 8.5, 3), E([-70, 0, 0], [3, 1.8, 3.6]));
  const scute = (x, y) => Manifold.cylinder(3.2, 1.6, 0.5, 16).translate([x, y, topZ(st, x) - 1.9 - Math.abs(y) * 0.25]);
  const rows = [0, 1, 2, 3].flatMap(k => [-9.3, -12.6, -15.9].flatMap(x => k < 2 ? [scute(x - k * P, 2.7), scute(x - k * P, -2.7)] : [scute(x - k * P, 0)]));
  const b = U(head, hull(station(...st[0]), E([7, 0, 7], [5, 8.2, 8])), body(st), tip, rows, legs(-9.9), legs(-2 * P - 9.9));
  return flexi({ name: 'alligator', body: b, pins: pinsN(5), items: [...sideEyes(H, hc, [0.08, 1, 0.3], { size: [4.9, 5.3] }), smile(head, hc, 26, 3.0, 1.4)] });
}

export function turtle() {
  const hc = [10.5, 0, 8.4], H = headSolid(hc, [10.5, 9.6, 9.6]);
  const neck = hull(station(0, 7.2, 12.5), E([7, 0, 8], [5, 8.4, 8.6]));
  const sc = [-24, 0, 3], dome = E(sc, [17, 15.5, 13.5]), rim = E([-24, 0, 1.2], [19, 17.5, 4.2]), rump = Manifold.hull([Manifold.cylinder(5, 5.9, 5.9, 48).translate([-40, 0, 0]), Manifold.cylinder(9.8, 3.6, 3.6, 32).translate([-40, 0, 0])]);
  // shell plates: low bumps, one in the middle and six around it
  const plate = (x, y, r) => { const dz = 13.5 * Math.sqrt(Math.max(0.05, 1 - ((x + 24) / 17) ** 2 - (y / 15.5) ** 2)); return E([x, y, 3 + dz - 0.9], [r, r, 1.9]); };
  const plates = [plate(-24, 0, 5.2), ...[0, 60, 120, 180, 240, 300].map(a => plate(-24 + 10.2 * Math.cos(a * Math.PI / 180), 9.2 * Math.sin(a * Math.PI / 180), 4.0))];
  const flip = (x, s, out, back) => hull(E([x, s * 13, 0], [3.2, 3, 3.6]), E([x + back, s * (13 + out), 0], [3.4, 2.6, 2.6]));
  const tail = hull(E([-48.5, 0, 0], [3, 3.6, 4]), E([-55, 0, 0], [2, 1.6, 2.2]));
  const b = U(H, neck, dome, rim, rump, plates, flip(-15.5, 1, 7.5, 0), flip(-15.5, -1, 7.5, 0), flip(-31, 1, 5.5, -2), flip(-31, -1, 5.5, -2), tail);
  return flexi({ name: 'turtle', body: b, pins: [0, -40], items: [...sideEyes(H, hc, [0.42, 0.88, 0.14], { size: [5.2, 5.8] }), smile(H, hc, 20, 3.4, 1.4)] });
}

export function panda() {
  const hc = [0, 0, 15.5], H = headSolid(hc, [14.5, 16, 19.5], 0.77);
  const ear = s => E([-1, s * 11.2, 32], [2.8, 4.8, 4.8]);
  const muzzle = E([11.6, 0, 19.2], [3.6, 5.4, 4.2]);
  const nose = E([14.9, 0, 20.4], [1.3, 2.3, 1.6]);
  const arm = s => wingBump(s, [1.5, 14, 9.5], [5.6, 3.2, 5.2], [3.5, 13, 0.6]);
  const foot = s => E([10.2, s * 7.6, 0], [5.2, 4, 4.6]);
  const tail = hull(E([-21.2, 0, 0], [3.4, 5, 4.8]), E([-24.6, 0, 0], [2.6, 3.6, 3.8]));
  const blk = (m, on, c) => ({ c: 'black', on, ...fat(m, c) });
  return bird({
    name: 'panda', egg: H, upper: [muzzle], tail,
    items: [...[1, -1].map(s => blk(ear(s), 'top', [-1, s * 11.2, 32])),
    ...frontEyes(H, hc, [0.76, 0.47, 0.52], { size: [3.9, 4.6], pupil: [0.6, 0.62], off: [0.14, -0.04], hl: [-0.28, 0.4], dot: 1.0, patch: [6.2, 6.9, 1.0, -0.4] }),
    blk(nose, 'top', [14.9, 0, 20.4]),
    ...[1, -1].flatMap(s => [blk(arm(s), 'base', [1.5, s * 14, 9.5]), blk(foot(s), 'base', [10.2, s * 7.6, 0])])]
  });
}
Object.assign(ALL, { alligator, turtle, panda });
Object.assign(COLOURS, { alligator: [70, 150, 60], turtle: [40, 170, 150], panda: [245, 245, 240] });
Object.assign(HEX, { alligator: '#3F8E43', turtle: '#00AE9D', panda: '#FFFFFF' });

// ---- long flexi dragon in the classic maker style: many links, one back plate per link, wingless
export function flexiDragon() {
  const hc = [11.5, 0, 8.2], H = headSolid(hc, [11, 9.4, 9.8]);
  const head = U(H, hull(E([15, 0, 6], [6, 7.2, 6.4]), E([31, 0, 4], [4.6, 5.4, 4.4])), S([32.8, 2.4, 7.6], 1.5), S([32.8, -2.4, 7.6], 1.5));
  const ry = [7.4, 7.4, 7.6, 9.0, 8.8, 8.6, 8.8, 9.0, 8.2, 7.8, 7.5, 7.3, 7.2], hh = [13.5, 13.5, 14, 16.5, 16, 15.5, 15.5, 16, 14, 13, 12, 11, 10.5];
  const pins = pinsN(13), st = pins.map((x, i) => [x, ry[i], hh[i]]), L = pins[12];
  const tip = U(hull(station(L - 7, 5.2, 8.5, 3), S([L - 10.8, 0, 2.6], 2.6)), hull(S([L - 10.3, 0, 2.2], 2.4), E([L - 13.3, 6.6, 0], [1.9, 1.9, 3.2]), E([L - 13.3, -6.6, 0], [1.9, 1.9, 3.2]), E([L - 23, 0, 0], [1.6, 1.6, 2.6])));
  const plate = (i) => { const x = pins[i], t = hh[i], k = 0.75 + 0.25 * (hh[i] - 10.5) / 6; return hull(S([x + 3, 0, t - 1.2], 1.1), S([x - 3.4, 0, t - 1.2], 1.1), S([x - 4.6, 0, t + 6 * k], 0.9)); };
  const leg = (x, s) => U(cap([x, s * 7, 7], 3, [x, s * 12.6, 2.8], 2.6), E([x, s * 13.4, 0], [2.0, 3.0, 3.3]));
  const b = U(head, hull(station(...st[0]), E([7.5, 0, 8.2], [5, 8.4, 9])), body(st), tip, pins.slice(1).map((_, i) => plate(i + 1)),
    leg(pins[2] - 9.9, 1), leg(pins[2] - 9.9, -1), leg(pins[6] - 9.9, 1), leg(pins[6] - 9.9, -1));
  const horn = s => cap([5, s * 4.6, 15], 2.5, [-3.5, s * 7, 24.5], 0.8);
  return flexi({
    name: 'flexi-dragon', body: b, pins, items: [...sideEyes(H, hc, [0.1, 1, 0.14], { size: [5.3, 6.0] }), smile(head, hc, 24, 3.4, 1.6)],
    post: [{ seg: 0, c: 'body', m: U(horn(1), horn(-1)) }]
  });
}
Object.assign(ALL, { 'flexi-dragon': flexiDragon });
Object.assign(COLOURS, { 'flexi-dragon': [240, 110, 35] });
Object.assign(HEX, { 'flexi-dragon': '#F26B21' });

// ---- added 17 Nov: sitting cat and dog in the round two-piece style (head + chest spin, tail wags)
const sitLegs = (paw) => [1, -1].flatMap(s => [cap([7.2, s * 6, 10.5], 3.3, [9.6, s * 6.4, 3.4], 3.0), E([-3.5, s * 12, 6.5], [7, 3.6, 6.2])]);
const curlTail = pts => chain(pts.map(([x, z, r]) => S([x, 0, z], r)));

export function cat() {
  const hc = [0, 0, 15], hr = [14, 16, 18.5], H = headSolid(hc, hr, 0.77);
  const ear = s => hull(E([0.4, s * 8.6, 28.2], [2.7, 5.2, 2.5]), S([0.2, s * 12.2, 39.2], 0.9));
  const innerEar = s => scaleAbout(ear(s), [0.4, s * 9.6, 31], 0.6).translate([1.9, 0, 0]);
  const cheek = s => E([11.1, s * 2.9, 17.4], [3.4, 3.5, 2.9]);
  const nose = hull(E([13.9, 0, 20.4], [1.3, 1.9, 1.2]), S([13.6, 0, 19.3], 0.55));
  const paw = s => E([11.4, s * 6.4, 0], [4.2, 3.4, 3.6]);
  const tail = curlTail([[-21, 3, 3.4], [-27, 3.1, 3.1], [-32, 8, 2.8], [-33.5, 14, 2.6], [-32.6, 20, 2.4], [-30.6, 23.4, 2.2]]);
  return bird({
    name: 'cat', egg: H, upper: [ear(1), ear(-1)], lower: sitLegs(), tail,
    items: [...[1, -1].map(s => ({ c: 'white', on: 'top', p: innerEar(s) })),
    ...frontEyes(H, hc, [0.72, 0.5, 0.56], { size: [5.3, 6.0], pupil: [0.56, 0.6], off: [0.14, -0.06], hl: [-0.3, 0.42], dot: 1.05 }),
    ...[1, -1].map(s => ({ c: 'white', on: 'top', ...fat(cheek(s), [11.1, s * 2.9, 17.4]) })),
    { c: 'black', on: 'top', ...fat(nose, [13.9, 0, 20.4]) },
    ...[1, -1].map(s => ({ c: 'white', on: 'base', ...fat(paw(s), [11.4, s * 6.4, 0]) }))]
  });
}

export function dog() {
  const hc = [0, 0, 15.5], hr = [14, 16, 18.5], H = headSolid(hc, hr, 0.77);
  const ear = s => hull(E([-0.5, s * 9.6, 30.5], [3.6, 3.2, 2.6]), E([0.5, s * 16.2, 20.5], [3.4, 2.0, 3.6]));
  const muzzle = E([10.6, 0, 19.4], [5, 6, 4]);
  const nose = E([15.2, 0, 21.6], [1.8, 2.8, 1.9]);
  const foot = s => E([11.4, s * 6.4, 0], [4.4, 3.6, 3.8]);
  const tail = curlTail([[-21, 3, 3.4], [-26, 3.2, 3.2], [-29, 9, 2.6], [-29.5, 14, 2.2], [-28, 17, 1.8]]);
  const e = [0.73, 0.5, 0.54], eo = { size: [5.2, 5.9], pupil: [0.56, 0.6], off: [0.14, -0.06], hl: [-0.3, 0.42], dot: 1.05 };
  const eyeL = eye(H, hc, [e[0], e[1], e[2]], { toward: [0, -1, -0.1], ...eo }).items;
  const eyeR = eye(H, hc, [e[0], -e[1], e[2]], { toward: [0, 1, -0.1], ...eo, patch: [7.4, 7.8, 1.0, 0.6] }).items;
  return bird({
    name: 'dog', egg: H, upper: [muzzle], lower: [...sitLegs(), foot(1), foot(-1)], tail,
    items: [...[1, -1].map(s => ({ c: 'black', on: 'top', ...fat(ear(s), [0, s * 13, 25.5]) })),
    ...[...eyeL, ...eyeR].map(i => ({ ...i, on: 'top' })),
    { c: 'white', on: 'top', ...fat(muzzle, [10.6, 0, 19.4]) },
    { c: 'black', on: 'top', ...fat(nose, [15.2, 0, 21.6]) }]
  });
}
Object.assign(ALL, { cat, dog });
Object.assign(COLOURS, { cat: [255, 145, 40], dog: [200, 145, 90] });
Object.assign(HEX, { cat: '#FF9016', dog: '#C68E5A' });
