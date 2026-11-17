// node sheet-minis.mjs -> ../previews/minis.png (every 1.3 in mini in a grid) and ../previews/shorts.png (the short wigglers)
import path from 'path';
import { ALL, COLOURS } from './catalog.mjs';
import { render, vol } from './lib.mjs';
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')).replace(/%20/g, ' ').replace(/%23/g, '#');
function sheet(file, names, cols, dx, dy, view) {
  const parts = [];
  names.forEach((n, i) => {
    const a = ALL[n](), x = -Math.floor(i / cols) * dx, y = (i % cols) * dy, mv = m => m.translate([x, y, 0]);
    parts.push({ m: mv(a.body), rgb: COLOURS[n] });
    if (vol(a.white) > 0) parts.push({ m: mv(a.white), rgb: [250, 250, 250] });
    if (vol(a.black) > 0) parts.push({ m: mv(a.black), rgb: [28, 28, 30] });
  });
  render(path.join(here, '..', 'previews', file), parts, view);
}
const NEW = /^(bunny|hamster|penguin|frog|hedgehog|chick|pig|polar-bear|reindeer|snowman)-/;
const minis = Object.keys(ALL).filter(n => n.endsWith('-mini') && !NEW.test(n)).concat('octopus');
const only = process.argv.slice(2);
const want = f => !only.length || only.includes(f);
if (want('minis.png')) sheet('minis.png', minis, 7, 62, 50, { az: -12, el: 26, W: 1600, H: 760 });
if (want('minis-new.png')) sheet('minis-new.png', Object.keys(ALL).filter(n => n.endsWith('-mini') && NEW.test(n)), 5, 62, 50, { az: -12, el: 26, W: 1600, H: 800 });
if (want('shorts.png')) sheet('shorts.png', Object.keys(ALL).filter(n => n.endsWith('-short')), 5, 82, 48, { az: -20, el: 34, W: 1600, H: 1000 });
if (want('keychains.png')) sheet('keychains.png', Object.keys(ALL).filter(n => n.endsWith('-keychain')), 8, 62, 50, { az: -12, el: 26, W: 1600, H: 800 });
