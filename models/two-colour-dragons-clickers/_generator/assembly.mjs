// node assembly.mjs pizza frog hamburger  -> ../previews/assembly-<name>.png
// Exploded (left: base, switch, printed cap) and assembled (right). The switch is a stand-in at Cherry MX datasheet sizes.
import path from 'path';
import { CLICKERS, HT } from './clickers.mjs';
import { Manifold, U, render } from '../../big-eye-animals/_generator/lib.mjs';
import { SPOOL, PAIR } from './colours.mjs';
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')).replace(/%20/g, ' ').replace(/%23/g, '#');

const box = (w, d, z0, z1, w2 = w, d2 = d) => Manifold.hull([Manifold.cube([w, d, 0.01], true).translate([0, 0, z0]), Manifold.cube([w2, d2, 0.01], true).translate([0, 0, z1])]);
// MX switch, z = 0 at the top of the plate: housing +6.6, stem top +10.2, 5.0 below the plate, pins clipped
function mxSwitch() {
  // pins and centre post clipped flush (the bases are made for clipped switches): only short stubs left
  const lower = U(box(13.9, 13.9, -5.0, 0), Manifold.cylinder(0.6, 2.0, 2.0, 32).translate([0, 0, -5.6]));
  const upper = U(box(15.6, 15.6, 0, 0.8), box(15.4, 15.4, 0.8, 6.6, 11.5, 10.5));
  const cross = U(Manifold.cube([4.0, 1.2, 3.6], true), Manifold.cube([1.1, 4.0, 3.6], true)).translate([0, 0, 6.6 + 1.8]);
  return { housing: U(lower, upper), stem: cross };
}

for (const n of process.argv.slice(2)) {
  const a = CLICKERS[n](), [c1, c2] = PAIR[n], sw = mxSwitch(), A = a.asm;
  const p = (m, rgb, dx, dz) => m ? [{ m: m.translate([dx, 0, dz]), rgb }] : [];
  const hous = [40, 40, 44], stem = [40, 90, 210];
  const set = (dx, lift) => [
    ...p(A.baseBody, SPOOL[c1].rgb, dx, 0), ...p(A.baseAcc, SPOOL[c2].rgb, dx, 0),
    ...p(sw.housing, hous, dx, HT + lift), ...p(sw.stem, stem, dx, HT + lift),
    ...p(A.capBody, SPOOL[c1].rgb, dx, 2.2 * lift), ...p(A.capAcc, SPOOL[c2].rgb, dx, 2.2 * lift),
  ];
  const w = A.base.boundingBox(), gap = (w.max[0] - w.min[0]) + 25;
  render(path.join(here, '..', 'previews', 'assembly-' + n + '.png'), [...set(0, 24), ...set(gap, 0)], { az: -62, el: 20, W: 1300, H: 760 });
  console.log('assembly-' + n + '.png');
}
