// node sheet.mjs  -> ../previews/clickers-all.png and ../previews/dragons-both.png (group pictures)
import path from 'path';
import { CLICKERS } from './clickers.mjs';
import { DRAGONS } from './dragons.mjs';
import { render } from '../../big-eye-animals/_generator/lib.mjs';
import { SPOOL, PAIR } from './colours.mjs';
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')).replace(/%20/g, ' ').replace(/%23/g, '#');
const out = path.join(here, '..', 'previews');

const GROUPS = {
  'clickers-all': ['square', 'circle', 'triangle', 'star', 'heart', 'hexagon', 'gear', 'star-of-david', 'flower', 'donut', 'paw', 'shield', 'keychain-tag', 'hamburger'],
  'clickers-food': ['pizza', 'cookie', 'cupcake', 'ice-cream', 'strawberry', 'watermelon', 'taco', 'sushi', 'donut', 'hamburger', 'macaron', 'cookie-sandwich'],
  'clickers-animals': ['bee', 'ladybug', 'frog', 'panda', 'cat-face', 'turtle', 'paw'],
};
const only = process.argv.slice(2);
for (const [file, names] of Object.entries(GROUPS)) {
  if (only.length && !only.includes(file)) continue;
  const parts = [], cols = names.length > 8 ? 5 : 4, pitch = 66;
  names.forEach((n, i) => {
    const a = CLICKERS[n](), [c1, c2] = PAIR[n], x = (i % cols) * pitch, y = -Math.floor(i / cols) * pitch;
    parts.push({ m: a.asm.body.translate([x, y, 0]), rgb: SPOOL[c1].rgb }, { m: a.asm.accent.translate([x, y, 0]), rgb: SPOOL[c2].rgb });
  });
  render(path.join(out, file + '.png'), parts, { az: -90, el: 55, W: 1400, H: 1000 });
}
if (only.length) { console.log('ok'); process.exit(0); }

const dp = []; Object.keys(DRAGONS).forEach((n, i) => {
  const a = DRAGONS[n](), [c1, c2] = PAIR[n];
  dp.push({ m: a.body.add(a.black).translate([0, -i * 48, 0]), rgb: SPOOL[c1].rgb }, { m: a.white.translate([0, -i * 48, 0]), rgb: SPOOL[c2].rgb });
});
render(path.join(out, 'dragons-both.png'), dp, { az: -50, el: 30, W: 1300, H: 900 });
console.log('ok');
