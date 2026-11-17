// Short wigglers (17 Nov 2026): the long big-eye animals with only 2 joints (3 moving pieces), about 55-65 mm long.
// The joint is full size (pin, pocket, 12.4 mm spacing, body height at the pins); the head, tail, legs and trim are smaller.
// Head toward +x, plate at z=0, mm. Same colours as the full-size animals.
import { CrossSection, scaleAbout, U, hull, E, S, cap, chain, station, headSolid, eye, skinLine, flexi, Manifold, surf } from './lib.mjs';
import { COLOURS as BC, HEX as BH } from './animals.mjs';

const P = 12.4, pins2 = [0, -P];
const body = st => chain(st.map(s => station(...s)));
const topZ = (st, x) => { for (let i = 0; i < st.length - 1; i++) if (x <= st[i][0] && x >= st[i + 1][0]) { const t = (st[i][0] - x) / (st[i][0] - st[i + 1][0]); return st[i][2] + t * (st[i + 1][2] - st[i][2]); } return st[st.length - 1][2]; };
const spike = (st, x, r = 1.8, h = 3.8, on = null) => Manifold.cylinder(h, r, 0.4, 20).translate([x, 0, Math.min(topZ(st, x), on ? surf(on, [x, 0, 1], [0, 0, 1])[2] : 99) - 1.3]);
const leg = (x, s, f = 0.85) => scaleAbout(U(cap([x, s * 5.5, 6.5], 2.7, [x, s * 10.8, 2.6], 2.4), E([x, s * 11.6, 0], [2.2, 3.1, 3.0])), [x, s * 5, 0], f);
const legs = (x, f) => [leg(x, 1, f), leg(x, -1, f)];
const sideEyes = (H, hc, e, o) => [1, -1].flatMap(s => eye(H, hc, [e[0], s * e[1], e[2]], { toward: [1, 0, -0.15], ...o }).items);
const smile = (H, hc, half, z0, lift) => ({ c: 'black', ...skinLine(H, hc, [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1].map(k => k * half), th => z0 + lift * (th / half) ** 2, 0.68) });
// head shrink: about a point just ahead of the first pin, so the neck still meets the body
const A = [4, 0, 0];
const hs = (m, f) => scaleAbout(m, A, f);
const hp = (p, f) => [A[0] + (p[0] - A[0]) * f, p[1] * f, p[2] * f];
const sx = (m, dx) => m.translate([dx, 0, 0]);
// a short hip behind the second pin, so the tail piece has a body to hold the back legs (was 3 pieces without it)
const hip = (ry, h) => [-P - 7, ry, h, 4];

export function chameleonShort() {
  const f = 0.86, hc0 = [12, 0, 8.6], hc = hp(hc0, f);
  const H = hs(headSolid(hc0, [11.5, 9.6, 10.4]), f);
  const head = U(H, hs(E([21.5, 0, 5.6], [5.2, 5.6, 6.2]), f));
  const st = [[0, 7.6, 15.5], [-P, 8.0, 17.5], hip(7.0, 13.5)];
  const spiral = (() => { const cx = -44, cz = 7.6, out = []; for (let i = 0; i <= 24; i++) { const t = i / 24, a = (-55 - t * 1.4 * 360) * Math.PI / 180, R = 5.4 - 4.2 * t; out.push(S([cx + R * Math.cos(a), 0, cz + R * Math.sin(a)], 3.1 - 1.1 * t)); } return chain(out); })();
  const tail = sx(U(hull(station(-32, 5.4, 10.5, 3), S([-37.3, 0, 3.1], 3.1)), hull(S([-37.3, 0, 3.1], 3.1), S([-40.9, 0, 3.18], 3.1)), spiral), P);
  const on = U(body(st), tail);
  const b = U(head, hs(hull(S([8, 0, 15.5], 3.4), S([1.2, 0, 22.5], 2.1)), f),
    hull(station(...st[0]), E([7, 0, 8], [5, 8.4, 9.2])), body(st), tail,
    [-9.3, -12.6, -15.9, -21.7].map(x => spike(st, x, 1.7, 3.4, on)), legs(-9.9), legs(-P - 9.9));
  return flexi({ name: 'chameleon-short', body: b, pins: pins2, items: [...sideEyes(H, hc, [0.1, 1, 0.1], { size: [5.3, 6.0] }), smile(head, hc, 40, 3.6 * f, 1.6)] });
}

export function dragonShort() {
  const f = 0.86, hc0 = [11.5, 0, 8.4], hc = hp(hc0, f);
  const H = hs(headSolid(hc0, [11, 9.6, 10]), f);
  const head = U(H, hs(U(E([21.5, 0, 5.6], [6.4, 6.2, 6.0]), S([25.2, 2.5, 10.2], 1.4), S([25.2, -2.5, 10.2], 1.4)), f));
  const st = [[0, 7.6, 15], [-P, 8.2, 16], hip(7.0, 12.5)];
  const tip = sx(U(hull(station(-44.2, 5.2, 9, 3), S([-48, 0, 2.6], 2.6)), hull(S([-47.5, 0, 2.2], 2.4), E([-50.5, 6.4, 0], [1.9, 1.9, 3.2]), E([-50.5, -6.4, 0], [1.9, 1.9, 3.2]), E([-59.5, 0, 0], [1.6, 1.6, 2.6]))), 2 * P);
  const on = U(body(st), tip);
  const b = U(head, hull(station(...st[0]), E([7, 0, 8], [5, 8.4, 9])), body(st), tip,
    [-10.2, -15.4, -22.6].map(x => spike(st, x, 1.9, 4.2, on)), legs(-9.9), legs(-P - 9.9));
  const wing = s => scaleAbout(new CrossSection([[[-7.2, -2.5], [-6.6, 16.5], [-9.6, 15.6], [-11.2, 10.6], [-15.4, 12.4], [-13.6, 5.6], [-15.2, 3.2], [-14.6, -2.5]]]).extrude(2.4).translate([0, 0, -1.2]).rotate([90, 0, 0]).rotate([-38 * s, 0, 0]).translate([0, s * 3.8, 13.4]), [-9, s * 3.8, 13.4], 0.7);
  const horn = s => hs(cap([5, s * 4.4, 15.5], 2.4, [-2.6, s * 6.8, 23.6], 0.8), f);
  return flexi({
    name: 'dragon-short', body: b, pins: pins2, items: [...sideEyes(H, hc, [0.12, 1, 0.12], { size: [5.2, 5.9] }), smile(head, hc, 38, 3.6, 1.6)],
    post: [{ seg: 0, c: 'body', m: U(horn(1), horn(-1)) }, { seg: 1, c: 'body', m: U(wing(1), wing(-1)) }]
  });
}

export function axolotlShort() {
  const f = 0.86, hc0 = [10.5, 0, 7.2], hc = hp(hc0, f);
  const H = hs(headSolid(hc0, [11, 12.4, 8.6]), f);
  const st = [[0, 7.6, 13], [-P, 8.0, 13.5], hip(6.8, 11.5)];
  const tail = sx(U(hull(station(-32, 5.0, 10.5, 3), E([-38, 0, 5.5], [5, 2.4, 6.2])), E([-43, 0, 6.4], [10, 1.7, 6.9])), P);
  const b = U(H, hull(station(...st[0]), E([6.5, 0, 6.5], [5, 9.2, 7.4])), body(st), tail,
    E([-12.8, 0, 12.8], [4.2, 1.5, 3.2]), legs(-9.9), legs(-P - 9.9));
  const gill = (s, a, c) => cap([a[0], s * a[1], a[2]], 2.9, [c[0], s * c[1], c[2]], 1.5);
  const gills = s => hs(U(gill(s, [2.5, 9, 10.5], [-3.2, 12.6, 16.4]), gill(s, [4, 9.8, 10.5], [2.6, 15.2, 17.6]), gill(s, [6, 10, 10], [8.4, 14.6, 15.8])), f);
  return flexi({
    name: 'axolotl-short', body: b, pins: pins2,
    items: [...sideEyes(H, hc, [0.6, 0.8, 0.2], { size: [4.5, 5.0] }), smile(H, hc, 24, 4.4, 1.4)],
    post: [{ seg: 0, c: 'body', m: U(gills(1), gills(-1)) }]
  });
}

export function sharkShort() {
  const f = 0.84, hc0 = [11, 0, 7.8], hc = hp(hc0, f);
  const H = hs(headSolid(hc0, [11, 9.2, 9.4]), f);
  const head = U(H, hs(hull(E([14, 0, 6.6], [7, 7.4, 7.2]), E([27.5, 0, 3.4], [3, 3.6, 3.4])), f));
  const st = [[0, 7.6, 14.5], [-P, 8.0, 15], hip(6.4, 11.5)];
  const thin = m => m.scale([1, 0.62, 1]);
  const tail = sx(U(hull(station(-32, 4.8, 9, 3), S([-36.2, 0, 4], 3.4)), thin(hull(S([-35, 0, 6.5], 3.2), S([-39.5, 0, 3], 3), S([-44, 0, 16.5], 1.8))), thin(cap([-36, 0, 3.2], 3.2, [-43.5, 0, 1.2], 2.1))), P);
  const fin = thin(hull(S([-8.4, 0, 13.4], 2), S([-15.6, 0, 13.4], 2), S([-16.2, 0, 22.5], 1.6)));
  const pec = s => hull(E([-7.8, s * 6.5, 0], [1.6, 1.6, 3.2]), E([-10.4, s * 6.5, 0], [1.6, 1.6, 3.2]), E([-10.4, s * 14.5, 0], [1.5, 1.5, 2.0]));
  const b = U(head, hull(station(...st[0]), E([7, 0, 7.4], [5, 8.2, 8.4])), body(st), tail, fin, pec(1), pec(-1));
  return flexi({ name: 'shark-short', body: b, pins: pins2, items: [...sideEyes(H, hc, [0.2, 1, 0.16], { size: [5.0, 5.5] }), smile(head, hc, 44, 2.6 * f, 1.9)] });
}

export function alligatorShort() {
  const f = 0.78, hc0 = [10, 0, 7], hc = hp(hc0, f);
  const H = hs(headSolid(hc0, [10, 9, 8.8]), f);
  const head = U(H, hs(U(hull(E([13, 0, 5.4], [6, 7, 5.6]), E([30, 0, 3.2], [4.2, 5.2, 3.7])), S([31.6, 2.3, 6.4], 1.4), S([31.6, -2.3, 6.4], 1.4)), f));
  const st = [[0, 7.6, 13.5], [-P, 8.4, 14], hip(7.2, 11.5)];
  const tip = sx(hull(station(-56.6, 5, 8.5, 3), E([-70, 0, 0], [3, 1.8, 3.6])), 3 * P);
  const on = U(body(st), tip);
  const scute = (x, y) => Manifold.cylinder(3.2, 1.6, 0.5, 16).translate([x, y, Math.min(topZ(st, x), surf(on, [x, y, 1], [0, 0, 1])[2]) - 1.9 - Math.abs(y) * 0.25]);
  const rows = [...[-9.3, -12.6, -15.9].flatMap(x => [scute(x, 2.7), scute(x, -2.7)]), scute(-21.7, 0), scute(-25, 0)];
  const b = U(head, hull(station(...st[0]), E([7, 0, 6.8], [5, 8.0, 7.6])), body(st), tip, rows, legs(-9.9), legs(-P - 9.9));
  return flexi({ name: 'alligator-short', body: b, pins: pins2, items: [...sideEyes(H, hc, [0.08, 1, 0.3], { size: [4.7, 5.1] }), smile(head, hc, 26, 3.0 * f, 1.2)] });
}

export function turtleShort() {
  const f = 0.8, hc0 = [10.5, 0, 8.4], hc = hp(hc0, f);
  const H = hs(headSolid(hc0, [10.5, 9.6, 9.6]), f);
  const neck = hull(station(0, 7.2, 12.5), E([6.5, 0, 7.4], [5, 7.6, 7.6]));
  const k = 0.78, dx = 3.5, C = [-24, 0, 0];
  const sh = m => m.translate([24, 0, 0]).scale([k, k, 1]).translate([-24 + dx, 0, 0]);   // shell shrinks in length and width only, so it still hides the tail joint
  const tp = -24 - 16 * k + dx;   // tail pin, moved in with the shell
  const dome = sh(E([-24, 0, 3], [17, 15.5, 13.5])), rim = sh(E([-24, 0, 1.2], [19, 17.5, 4.2]));
  const rump = Manifold.hull([Manifold.cylinder(5, 5.9, 5.9, 48).translate([tp, 0, 0]), Manifold.cylinder(9.8, 3.6, 3.6, 32).translate([tp, 0, 0])]);
  const plate = (x, y, r) => { const dz = 13.5 * Math.sqrt(Math.max(0.05, 1 - ((x + 24) / 17) ** 2 - (y / 15.5) ** 2)); return sh(E([x, y, 3 + dz - 0.9], [r, r, 1.9])); };
  const plates = [plate(-24, 0, 5.2), ...[0, 60, 120, 180, 240, 300].map(a => plate(-24 + 10.2 * Math.cos(a * Math.PI / 180), 9.2 * Math.sin(a * Math.PI / 180), 4.0))];
  const flip = (x, s, out, back) => sh(hull(E([x, s * 13, 0], [3.2, 3, 3.6]), E([x + back, s * (13 + out), 0], [3.4, 2.6, 2.6])));
  const tail = hull(E([tp - 8.5, 0, 0], [3, 3.6, 4]), E([tp - 12.5, 0, 0], [2, 1.6, 2.2]));
  const b = U(H, neck, dome, rim, rump, plates, flip(-15.5, 1, 7.5, 0), flip(-15.5, -1, 7.5, 0), flip(-31, 1, 5.5, -2), flip(-31, -1, 5.5, -2), tail);
  return flexi({ name: 'turtle-short', body: b, pins: [0, tp], items: [...sideEyes(H, hc, [0.42, 0.88, 0.14], { size: [5.0, 5.6] }), smile(H, hc, 20, 3.2, 1.2)] });
}

export function flexiDragonShort() {
  const f = 0.86, hc0 = [11.5, 0, 8.2], hc = hp(hc0, f);
  const H = hs(headSolid(hc0, [11, 9.4, 9.8]), f);
  const head = U(H, hs(U(hull(E([15, 0, 6], [6, 7.2, 6.4]), E([31, 0, 4], [4.6, 5.4, 4.4])), S([32.8, 2.4, 7.6], 1.5), S([32.8, -2.4, 7.6], 1.5)), f));
  const ry = [7.6, 8.8, 7.2], hh = [14, 16, 12.5];
  const st = [0, -P, -P - 7].map((x, i) => [x, ry[i], hh[i], i === 2 ? 4 : 5]), L = pins2[1];
  const tip = U(hull(station(L - 7, 5.2, 8.5, 3), S([L - 10.8, 0, 2.6], 2.6)), hull(S([L - 10.3, 0, 2.2], 2.4), E([L - 13.3, 6.0, 0], [1.9, 1.9, 3.0]), E([L - 13.3, -6.0, 0], [1.9, 1.9, 3.0]), E([L - 18.5, 0, 0], [1.6, 1.6, 2.6])));
  const plate = i => { const x = pins2[i], t = hh[i], kk = 0.75 + 0.25 * (hh[i] - 10.5) / 6; return hull(S([x + 3, 0, t - 1.2], 1.1), S([x - 3.4, 0, t - 1.2], 1.1), S([x - 4.6, 0, t + 6 * kk], 0.9)); };
  const b = U(head, hull(station(...st[0]), E([7, 0, 7.8], [5, 8.2, 8.6])), body(st), tip, plate(1),
    legs(-9.9), legs(L - 9.9));
  const horn = s => hs(cap([5, s * 4.6, 15], 2.5, [-3.5, s * 7, 24.5], 0.8), f);
  return flexi({
    name: 'flexi-dragon-short', body: b, pins: pins2, items: [...sideEyes(H, hc, [0.1, 1, 0.14], { size: [5.1, 5.8] }), smile(head, hc, 24, 3.4 * f, 1.4)],
    post: [{ seg: 0, c: 'body', m: U(horn(1), horn(-1)) }]
  });
}

export const ALL = {
  'chameleon-short': chameleonShort, 'dragon-short': dragonShort, 'axolotl-short': axolotlShort, 'shark-short': sharkShort,
  'alligator-short': alligatorShort, 'turtle-short': turtleShort, 'flexi-dragon-short': flexiDragonShort
};
export const COLOURS = {}, HEX = {};
for (const n of Object.keys(ALL)) { const b = n.replace(/-short$/, ''); COLOURS[n] = BC[b]; HEX[n] = BH[b]; }
