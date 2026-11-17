// Two original 4-inch articulated dragons, two colours only: slot 1 = body, slot 2 = accent.
// Built on the print-in-place joint from ../../big-eye-animals (same pin, pocket and ring).
// Head toward +x, plate at z=0, mm. In paint(): 'white' = accent, 'black' = painted back to body colour.
import { U, hull, E, S, cap, chain, station, headSolid, eye, skinLine, flexi, Manifold, CrossSection } from '../../big-eye-animals/_generator/lib.mjs';

const P = 12.4;                                   // joint spacing (same as the tested joint)
const pinsN = n => Array.from({ length: n }, (_, i) => -i * P);
const body = st => chain(st.map(s => station(...s)));
const topZ = (st, x) => { for (let i = 0; i < st.length - 1; i++) if (x <= st[i][0] && x >= st[i + 1][0]) { const t = (st[i][0] - x) / (st[i][0] - st[i + 1][0]); return st[i][2] + t * (st[i + 1][2] - st[i][2]); } return st[st.length - 1][2]; };
const ACC = m => ({ c: 'white', m });

// two-colour eye: raised body-colour oval, big accent pupil, body-colour shine dot
const eyes2 = (H, hc, e, o) => [1, -1].flatMap(s => {
  const it = eye(H, hc, [e[0], s * e[1], e[2]], { toward: [1, 0, -0.15], ...o }).items;
  return [{ m: it[0].m }, { c: 'white', p: it[1].p }, { c: 'black', p: it[2].p }];
});
const smile = (H, hc, half, z0, lift) => ({ c: 'white', ...skinLine(H, hc, [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1].map(k => k * half), th => z0 + lift * (th / half) ** 2, 0.68) });

// ---------- Design A: "Ridgeback" — long serpent dragon, accent ridge plates, horns, spade tail
export function ridgeback() {
  const hc = [11.5, 0, 8.2], H = headSolid(hc, [11, 9.4, 9.8]);
  const brow = s => hull(S([13.5, s * 5.2, 15.2], 1.6), S([8, s * 6.4, 16.4], 1.4));
  const head = U(H, hull(E([15, 0, 6], [6, 7, 6.2]), E([27.4, 0, 4.2], [4.4, 5.4, 4.2])), brow(1), brow(-1));
  const nost = s => S([29.6, s * 2.2, 7.0], 1.25);
  const pins = pinsN(5), ry = [7.6, 8.6, 8.8, 8.3, 6.8], hh = [14, 16, 16.2, 15, 13];
  const st = pins.map((x, i) => [x, ry[i], hh[i]]), L = pins[4];
  const tailBase = hull(station(L - 7, 4.8, 9, 3), S([L - 10.6, 0, 2.6], 2.6));
  const spade = hull(S([L - 10.2, 0, 2.3], 2.3), E([L - 13.6, 5.8, 0], [1.8, 1.8, 3.0]), E([L - 13.6, -5.8, 0], [1.8, 1.8, 3.0]), E([L - 19.6, 0, 0], [1.5, 1.5, 2.5]));
  // tall plate centred over each pin (stays inside the front link's 5.9 mm arc), small spike mid-link
  const plate = i => { const x = pins[i], t = hh[i], k = 0.8 + 0.2 * (t - 13) / 3; return hull(S([x + 3, 0, t - 1.3], 1.1), S([x - 3.4, 0, t - 1.3], 1.1), S([x - 4.4, 0, t + 5.6 * k], 0.9)); };
  const spike = x => Manifold.cylinder(3.6, 1.8, 0.45, 20).translate([x, 0, topZ(st, x) - 1.3]);
  const plates = [1, 2, 3, 4].map(plate), spikes = [pins[0] - 7.6, pins[1] - 8.2, pins[2] - 8.2, pins[3] - 8.2].map(spike);
  const leg = (x, s) => U(cap([x, s * 7, 7], 3, [x, s * 12.4, 2.8], 2.6), E([x, s * 13.2, 0], [2.1, 3.0, 3.3]));
  const b = U(head, hull(station(...st[0]), E([7.5, 0, 8.2], [5, 8.4, 9])), body(st), tailBase,
    leg(pins[0] - 9.9, 1), leg(pins[0] - 9.9, -1), leg(pins[2] - 9.9, 1), leg(pins[2] - 9.9, -1));
  const horn = s => U(cap([5, s * 4.6, 15], 2.5, [-1.5, s * 6.6, 21.5], 1.4), cap([-1.5, s * 6.6, 21.5], 1.4, [-6.4, s * 7.4, 23.2], 0.7));
  return flexi({
    name: 'ridgeback', body: b, pins,
    items: [...plates.map(ACC), ...spikes.map(ACC), ACC(spade), ACC(nost(1)), ACC(nost(-1)), ...eyes2(H, hc, [0.12, 1, 0.16], { size: [5.2, 6.0] }), smile(head, hc, 24, 3.4, 1.6)],
    post: [{ seg: 0, c: 'white', m: U(horn(1), horn(-1)) }]
  });
}

// ---------- Design B: "Puff" — chubby winged baby dragon, big head, accent wings, horns, back nubs, flame tail
export function puff() {
  const hc = [12, 0, 9.4], H = headSolid(hc, [12.2, 10.8, 11]);
  const head = U(H, E([21.2, 0, 6.2], [6.2, 7.4, 5.8]));
  const nost = s => S([26.6, s * 2.3, 8.2], 1.2);
  const cheek = s => E([16.5, s * 8.6, 5.6], [2.4, 1.0, 1.6]);
  const pins = pinsN(4), st = [[0, 8.2, 16], [-P, 9.8, 18], [-2 * P, 9.4, 17], [-3 * P, 6.8, 14]], L = pins[3];
  // tail end and flame root rest on the plate (they hovered 0.4-0.6 mm up; support check 17 Nov 2026)
  const tail = U(hull(station(L - 7, 4.8, 10, 3), S([L - 11, 0, 3], 3)), hull(S([L - 11, 0, 3], 3), S([L - 17, 0, 2.6], 2.6)));
  const flame = hull(S([L - 17, 0, 2.4], 2.4), E([L - 20.6, 5.0, 0], [1.9, 1.9, 3.4]), E([L - 20.6, -5.0, 0], [1.9, 1.9, 3.4]), E([L - 24.4, 2.4, 0], [1.4, 1.4, 2.8]), E([L - 24.4, -2.4, 0], [1.4, 1.4, 2.8]), E([L - 28, 0, 0], [1.5, 1.5, 3.4]));
  const nub = x => Manifold.cylinder(3.0, 2.0, 0.6, 20).translate([x, 0, topZ(st, x) - 1.2]);
  const nubs = [-8.6, -16, -21.2, -28.4, -33.6].map(nub);
  const leg = (x, s) => U(cap([x, s * 6.5, 7.2], 3.2, [x, s * 12.2, 2.8], 2.8), E([x, s * 13, 0], [2.4, 3.2, 3.4]));
  const b = U(head, hull(station(...st[0]), E([7.5, 0, 9.4], [5, 9.4, 10.2])), body(st), tail,
    leg(pins[0] - 9.9, 1), leg(pins[0] - 9.9, -1), leg(pins[2] - 9.9, 1), leg(pins[2] - 9.9, -1));
  // wings: flat scalloped fans standing out at an angle from link 1 (fixed, they do not flap).
  // The low part stays ahead of joint 2 (x > -11.4) so link 2 can swing; only the high tips reach back.
  const wing = s => new CrossSection([[[-6.8, -2.5], [-4.0, 19.5], [-7.0, 18.4], [-8.6, 14.8], [-11.6, 16.6], [-12.6, 11.8], [-15.2, 12.2], [-12.8, 6.0], [-11.4, 3.0], [-11.4, -2.5]]]).extrude(2.4).translate([0, 0, -1.2]).rotate([90, 0, 0]).rotate([-40 * s, 0, 0]).translate([0, s * 4.4, 14.2]);
  const horn = s => cap([6, s * 4.8, 17.6], 2.4, [1.4, s * 6.2, 24.6], 0.9);
  return flexi({
    name: 'puff', body: b, pins,
    items: [...nubs.map(ACC), ACC(flame), ACC(nost(1)), ACC(nost(-1)), ACC(cheek(1)), ACC(cheek(-1)), ...eyes2(H, hc, [0.18, 1, 0.14], { size: [6.0, 6.8] }), smile(head, hc, 30, 3.6, 1.8)],
    post: [{ seg: 0, c: 'white', m: U(horn(1), horn(-1)) }, { seg: 1, c: 'white', m: U(wing(1), wing(-1)) }]
  });
}

export const DRAGONS = { ridgeback, puff };
