// Keychain versions (17 Nov 2026): every mini with a loop on top of the head for a keyring or backpack clip.
// The loop is a teardrop standing across the head (flat side to the front): its point and its inner hole both rise at
// 45°, so it prints without support. It rides on the spinning top, so the head still turns.
import { CrossSection, Manifold, U, surf } from './lib.mjs';

const TH = 2.8, R = 3.8, HOLE = 2.0;
const tear = r => CrossSection.hull([CrossSection.circle(r, 48), CrossSection.square([0.02, 0.02], true).translate([0, r * Math.SQRT2])]);
export function loop(top) {
  const c = top + 2.6;   // outer bottom 1.2 mm under the head top; hole bottom 0.6 mm above it
  return tear(R).subtract(tear(HOLE)).extrude(TH).rotate([90, 0, 0]).rotate([0, 0, 90]).translate([-TH / 2, 0, c]);
}
export function withLoop(make, name) {
  return () => {
    const a = make(), top = surf(a.segs[0], [0, 0, 0.5], [0, 0, 1])[2], L = loop(top);
    const segs = [a.segs[0].add(L), ...a.segs.slice(1)];
    const body = a.body.add(L.subtract(a.white).subtract(a.black));
    return { ...a, name, body, segs, rep: { ...a.rep, name, loopTop: +(top + 2.6 + R * Math.SQRT2).toFixed(1), pieces: segs.map(s => s.decompose().length), totalPieces: U(segs).decompose().length } };
  };
}
// built from the other lists in catalog.mjs
export function keychains(all, colours, hex) {
  const ALL = {}, COLOURS = {}, HEX = {};
  for (const n of Object.keys(all).filter(n => n.endsWith('-mini') || n === 'octopus')) {
    const k = n.replace(/-mini$/, '') + '-keychain';
    ALL[k] = withLoop(all[n], k); COLOURS[k] = colours[n]; HEX[k] = hex[n];
  }
  return { ALL, COLOURS, HEX };
}
