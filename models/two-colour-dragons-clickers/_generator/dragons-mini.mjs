// Small versions of the two two-colour dragons (17 Nov 2026). Slot 1 = body, slot 2 = accent.
//  -mini  : chibi, about 33 mm each way. Sitting baby dragon; the head spins on the body (big-eye bird() cone seat, no tail joint).
//           The tail curls round the body on the plate, so it is part of the base.
//  -short : the same dragon with only 2 joints, about 55 mm long. The joint stays full size; head, tail, legs and trim shrink.
// In paint(): 'white' = accent, 'black' = painted back to body colour (build.mjs adds it back to the body).
import { U, hull, E, S, cap, chain, station, headSolid, eye, skinLine, flexi, bird, surf, Manifold, CrossSection } from '../../big-eye-animals/_generator/lib.mjs';

const P = 12.4, d2r = Math.PI / 180;
const body = st => chain(st.map(s => station(...s)));

// two-colour eye (as in dragons.mjs): raised body-colour oval, accent pupil, body-colour shine dot
const eyes2 = (H, hc, e, o, toward = s => [1, 0, -0.15]) => [1, -1].flatMap(s => {
  const it = eye(H, hc, [e[0], s * e[1], e[2]], { toward: toward(s), ...o }).items;
  return [{ m: it[0].m }, { c: 'white', p: it[1].p }, { c: 'black', p: it[2].p }];
});
const smile = (H, hc, half, z0, lift, r = 0.6) => ({ c: 'white', ...skinLine(H, hc, [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1].map(k => k * half), th => z0 + lift * (th / half) ** 2, r) });
const top = it => ({ ...it, on: 'top' }), base = it => ({ ...it, on: 'base' });
const fat = (m, c, f = 1.12) => ({ m, p: m.translate(c.map(v => -v)).scale(f).translate(c) });

// ---------- chibi parts shared by both minis
const HC = [0, 0, 15.5];
// a point on the egg's surface, angle th from straight up, toward the back (-x), plus an outward push
const backPt = (hr, th, out = 0, y = 0) => { const a = th * d2r; return [-(hr[0] + out) * Math.sin(a), y, HC[2] + (hr[2] + out) * Math.cos(a)]; };
// tail on the plate, curling round the -y side from the back toward the front; returns the tail and its end point + direction
function curlTail(r0 = 1, phis = [180, 212, 244, 274, 300], rr = [11.2, 12.4, 13.0, 12.8, 12.0], th = [3.0, 2.7, 2.4, 2.1, 1.8]) {
  const pts = phis.map((p, i) => [rr[i] * Math.cos(p * d2r), rr[i] * Math.sin(p * d2r), th[i] * r0]);
  const tail = chain(pts.map((p, i) => S(p, th[i])));
  const end = pts[pts.length - 1], prev = pts[pts.length - 2];
  const dir = [end[0] - prev[0], end[1] - prev[1]], L = Math.hypot(...dir);
  return { tail, pts, end, dir: [dir[0] / L, dir[1] / L] };
}
const feet = () => [1, -1].map(s => E([8.6, s * 5.8, 0], [4.0, 3.3, 3.5]));

export function ridgebackMini() {
  const hr = [12, 12.6, 13.5], H = headSolid(HC, hr, 0.77);
  const snout = E([10.2, 0, 17.0], [4.6, 6.0, 4.0]);
  const face = U(H, snout);
  const nost = s => S([14.4, s * 2.1, 18.4], 1.0);
  const horn = s => cap([-2, s * 5.5, 26.5], 1.9, [-7, s * 7.4, 31.4], 0.8);
  // back plates on the head's back, tips leaning up
  const plate = (th, h) => { const b1 = backPt(hr, th - 9, -1.4), b2 = backPt(hr, th + 9, -1.4), t = backPt(hr, th - 26, h); return hull(S(b1, 0.8), S(b2, 0.8), S(t, 0.55)).scale([1, 0.7, 1]); };
  const plates = [plate(32, 3.8), plate(62, 4.2), plate(90, 3.8)];
  const { tail, pts, end, dir } = curlTail();
  const per = [-dir[1], dir[0]], at = (f, s) => [end[0] + dir[0] * f + per[0] * s, end[1] + dir[1] * f + per[1] * s, 0];
  const spade = hull(S([end[0], end[1], 1.6], 1.6), E(at(2.2, 3.2), [1.3, 1.3, 1.9]), E(at(2.2, -3.2), [1.3, 1.3, 1.9]), E(at(5.6, 0), [1.1, 1.1, 1.7]));
  const tspike = p => Manifold.cylinder(2.6, 1.1, 0.35, 16).translate([p[0], p[1], 2 * p[2] - 0.9]);
  const belly = E([9.6, 0, 6.4], [1.6, 5.0, 4.4]);
  return bird({
    name: 'ridgeback-mini', egg: H, upper: [snout], lower: [tail, ...feet()], tail: null,
    items: [...eyes2(H, HC, [0.72, 0.52, 0.52], { size: [4.3, 4.9], pupil: [0.6, 0.64], off: [0.12, -0.06], hl: [-0.3, 0.42], dot: 0.85 }, s => [0, -s, -0.1]).map(top),
      ...[1, -1].map(s => top({ c: 'white', m: nost(s) })), top(smile(face, [10.2, 0, 17], 42, 15.4, 0.9)),
      ...[1, -1].map(s => top({ c: 'white', m: horn(s) })), ...plates.map(m => top({ c: 'white', m })),
      base({ c: 'white', m: spade }), ...[pts[1], pts[2], pts[3]].map(p => base({ c: 'white', m: tspike(p) })),
      base({ c: 'white', ...fat(belly, [9.6, 0, 6.4], 1.0) })]
  });
}

export function puffMini() {
  const hr = [12.4, 13.2, 14], H = headSolid(HC, hr, 0.77);
  const snout = E([10.6, 0, 16.8], [4.2, 6.4, 3.8]);
  const face = U(H, snout);
  const nost = s => S([14.4, s * 2.2, 18.0], 1.0);
  const cheek = s => E([9.4, s * 7.8, 16.0], [1.6, 2.2, 1.5]);   // above the spin line
  const horn = s => cap([-1, s * 5.2, 27.2], 1.9, [-4.4, s * 6.4, 31.6], 0.85);
  const nub = th => S(backPt(hr, th, -0.6), 1.5);
  // little fan wings on the back of the head, standing out at an angle (they spin with the head)
  const wpts = [[-6.8, -2.5], [-4.0, 19.5], [-7.0, 18.4], [-8.6, 14.8], [-11.6, 16.6], [-12.6, 11.8], [-15.2, 12.2], [-12.8, 6.0], [-11.4, 3.0], [-11.4, -2.5]].map(([x, y]) => [x * 0.85, y * 0.56]);
  const wing = s => new CrossSection([wpts]).extrude(1.6).translate([0, 0, -0.8]).rotate([90, 0, 0]).rotate([-50 * s, 0, 0]).translate([-1.5, s * 8.4, 16.2]);
  const { tail, end, dir } = curlTail();
  const per = [-dir[1], dir[0]], at = (f, s) => [end[0] + dir[0] * f + per[0] * s, end[1] + dir[1] * f + per[1] * s, 0];
  const flame = hull(S([end[0], end[1], 1.6], 1.6), E(at(2.6, 2.8), [1.2, 1.2, 2.0]), E(at(2.6, -2.8), [1.2, 1.2, 2.0]), E(at(4.8, 1.4), [0.9, 0.9, 1.7]), E(at(4.8, -1.4), [0.9, 0.9, 1.7]), E(at(6.6, 0), [1.0, 1.0, 2.0]));
  return bird({
    name: 'puff-mini', egg: H, upper: [snout], lower: [tail, ...feet()], tail: null,
    items: [...eyes2(H, HC, [0.74, 0.52, 0.48], { size: [4.8, 5.4], pupil: [0.6, 0.64], off: [0.12, -0.06], hl: [-0.3, 0.42], dot: 0.9 }, s => [0, -s, -0.1]).map(top),
      ...[1, -1].map(s => top({ c: 'white', m: nost(s) })), ...[1, -1].map(s => top({ c: 'white', ...fat(cheek(s), [9.4, s * 7.8, 16.0], 1.0) })),
      top(smile(face, [10.6, 0, 16.8], 40, 15.2, 0.9)),
      ...[1, -1].map(s => top({ c: 'white', m: horn(s) })), ...[34, 60, 86].map(th => top({ c: 'white', m: nub(th) })),
      ...[1, -1].map(s => top({ c: 'white', m: wing(s) })),
      base({ c: 'white', m: flame })]
  });
}

// ---------- short wigglers: 2 joints
const KH = 0.8;   // head and trim scale
const sc = (m, k = KH) => m.scale(k);
const scp = (p, k = KH) => p.map(v => v * k);

export function ridgebackShort() {
  const hc0 = [11.5, 0, 8.2], H0 = headSolid(hc0, [11, 9.4, 9.8]);
  const brow = s => hull(S([13.5, s * 5.2, 15.2], 1.6), S([8, s * 6.4, 16.4], 1.4));
  const head0 = U(H0, hull(E([15, 0, 6], [6, 7, 6.2]), E([27.4, 0, 4.2], [4.4, 5.4, 4.2])), brow(1), brow(-1));
  const H = sc(H0), hc = scp(hc0), head = sc(head0);
  const nost = s => sc(S([29.6, s * 2.2, 7.0], 1.25));
  const pins = [0, -P], ry = [7.6, 7.2], hh = [14.5, 14.5];   // last station 7.2: wider leaves crumbs beside the tail joint, narrower a thin wall
  const st = pins.map((x, i) => [x, ry[i], hh[i]]), L = pins[1];
  const tailBase = hull(station(L - 7, 4.6, 9, 3), S([L - 10.2, 0, 2.5], 2.5));
  const spade = hull(S([L - 9.8, 0, 2.2], 2.2), E([L - 12.6, 5.0, 0], [1.6, 1.6, 2.8]), E([L - 12.6, -5.0, 0], [1.6, 1.6, 2.8]), E([L - 17.6, 0, 0], [1.4, 1.4, 2.4]));
  const plate = (x, t) => hull(S([x + 3, 0, t - 1.3], 1.1), S([x - 3.4, 0, t - 1.3], 1.1), S([x - 4.4, 0, t + 4.4], 0.9));
  const spikeAt = (x, on) => Manifold.cylinder(3.0, 1.6, 0.4, 20).translate([x, 0, surf(on, [x, 0, 1], [0, 0, 1])[2] - 1.2]);
  const trunk = U(hull(station(...st[0]), E([6.5, 0, 7.6], [4.6, 7.6, 8.2])), body(st), tailBase);
  const leg = (x, s) => U(cap([x, s * 6.4, 6.4], 2.6, [x, s * 10.8, 2.6], 2.3), E([x, s * 11.5, 0], [1.9, 2.7, 3.0]));
  const b = U(head, trunk, leg(-9.9, 1), leg(-9.9, -1));
  const horn = s => sc(U(cap([5, s * 4.6, 15], 2.5, [-1.5, s * 6.6, 21.5], 1.4), cap([-1.5, s * 6.6, 21.5], 1.4, [-6.4, s * 7.4, 23.2], 0.7)));
  return flexi({
    name: 'ridgeback-short', body: b, pins,
    items: [{ c: 'white', m: plate(pins[1], hh[1]) }, { c: 'white', m: spikeAt(-7.6, trunk) }, { c: 'white', m: spikeAt(L - 6.4, trunk) }, { c: 'white', m: spade },
      { c: 'white', m: nost(1) }, { c: 'white', m: nost(-1) }, ...eyes2(H, hc, [0.12, 1, 0.16], { size: [4.4, 5.0] }), smile(head, hc, 24, 2.8, 1.3)],
    post: [{ seg: 0, c: 'white', m: U(horn(1), horn(-1)) }]
  });
}

export function puffShort() {
  const hc0 = [12, 0, 9.4], H0 = headSolid(hc0, [12.2, 10.8, 11]);
  const head0 = U(H0, E([21.2, 0, 6.2], [6.2, 7.4, 5.8]));
  const H = sc(H0), hc = scp(hc0), head = sc(head0);
  const nost = s => sc(S([26.6, s * 2.3, 8.2], 1.2));
  const cheek = s => sc(E([16.5, s * 8.6, 5.6], [2.4, 1.0, 1.6]));
  const pins = [0, -P], st = [[0, 8.2, 15.5], [-P, 7.2, 14.8]], L = pins[1];   // 7.2: wider leaves crumbs, narrower a thin wall
  const tail = U(hull(station(L - 7, 4.6, 9.5, 3), S([L - 10.4, 0, 2.8], 2.8)), hull(S([L - 10.4, 0, 2.8], 2.8), S([L - 15, 0, 2.4], 2.4)));
  const flame = hull(S([L - 15, 0, 2.2], 2.2), E([L - 18.2, 4.4, 0], [1.7, 1.7, 3.0]), E([L - 18.2, -4.4, 0], [1.7, 1.7, 3.0]), E([L - 21.4, 2.1, 0], [1.3, 1.3, 2.5]), E([L - 21.4, -2.1, 0], [1.3, 1.3, 2.5]), E([L - 24.4, 0, 0], [1.4, 1.4, 3.0]));
  const trunk = U(hull(station(...st[0]), E([6.5, 0, 8.6], [4.6, 8.6, 9.2])), body(st), tail);
  const nub = x => Manifold.cylinder(2.6, 1.8, 0.6, 20).translate([x, 0, surf(trunk, [x, 0, 1], [0, 0, 1])[2] - 1.1]);
  const leg = (x, s) => U(cap([x, s * 6.2, 6.8], 2.9, [x, s * 11.0, 2.6], 2.5), E([x, s * 11.7, 0], [2.1, 2.9, 3.1]));
  const b = U(head, trunk, leg(-9.9, 1), leg(-9.9, -1));
  // same fan wings as Puff, smaller (72 % long, 62 % tall); the low part stays ahead of joint 2 (x > -11.4)
  const wpts = [[-6.8, -2.5], [-4.0, 19.5], [-7.0, 18.4], [-8.6, 14.8], [-11.6, 16.6], [-12.6, 11.8], [-15.2, 12.2], [-12.8, 6.0], [-11.4, 3.0], [-11.4, -2.5]].map(([x, y]) => [x * 0.72 - 1.2, y * 0.62]);
  const wing = s => new CrossSection([wpts]).extrude(2.2).translate([0, 0, -1.1]).rotate([90, 0, 0]).rotate([-40 * s, 0, 0]).translate([0, s * 4.4, 13.4]);
  const horn = s => sc(cap([6, s * 4.8, 17.6], 2.4, [1.4, s * 6.2, 24.6], 0.9));
  return flexi({
    name: 'puff-short', body: b, pins,
    items: [...[-8.4, -15.8, L - 6.6].map(x => ({ c: 'white', m: nub(x) })), { c: 'white', m: flame }, { c: 'white', m: nost(1) }, { c: 'white', m: nost(-1) },
      { c: 'white', m: cheek(1) }, { c: 'white', m: cheek(-1) }, ...eyes2(H, hc, [0.18, 1, 0.14], { size: [5.0, 5.6] }), smile(head, hc, 30, 2.9, 1.4)],
    post: [{ seg: 0, c: 'white', m: U(horn(1), horn(-1)) }, { seg: 1, c: 'white', m: U(wing(1), wing(-1)) }]
  });
}

export const MINIS = { 'ridgeback-mini': ridgebackMini, 'puff-mini': puffMini, 'ridgeback-short': ridgebackShort, 'puff-short': puffShort };
