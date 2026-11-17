// node sheet.mjs  -> ../previews/family.png (every animal in one picture)
import path from 'path';
import { ALL, COLOURS } from './animals.mjs';
import { render, vol } from './lib.mjs';
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')).replace(/%20/g, ' ').replace(/%23/g, '#');
const spots = {
  chameleon: [0, 0], parrot: [35, -62], dragon: [0, 62], axolotl: [-105, 0], shark: [-105, 62], owl: [-45, -62],
  alligator: [10, 124], turtle: [-105, 124], panda: [-120, -62], cat: [-20, -135], dog: [75, -135]
};
const parts = [];
for (const [n, [x, y]] of Object.entries(spots)) {
  const a = ALL[n](), mv = m => m.translate([x, y, 0]);
  parts.push({ m: mv(a.body), rgb: COLOURS[n] });
  if (vol(a.white) > 0) parts.push({ m: mv(a.white), rgb: [250, 250, 250] });
  if (vol(a.black) > 0) parts.push({ m: mv(a.black), rgb: [28, 28, 30] });
}
render(path.join(here, '..', 'previews', 'family.png'), parts, { az: -52, el: 28, W: 1500, H: 1000 });
