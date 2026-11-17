// node build.mjs [animal ...]   -> ../stl/<animal>-{body,white,black,all}.stl, ../previews/<animal>.png, report.json
import fs from 'fs'; import path from 'path';
import { ALL, COLOURS, HEX } from './animals.mjs';
import { loadTemplate, write3mf } from './mf.mjs';
import { U, writeSTL, render, overhang, vol } from './lib.mjs';
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')).replace(/%20/g, ' ').replace(/%23/g, '#');
const out = path.join(here, '..'), names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(ALL);
for (const d of ['stl', 'previews']) fs.mkdirSync(path.join(out, d), { recursive: true });
const repFile = path.join(here, 'report.json'), report = fs.existsSync(repFile) ? JSON.parse(fs.readFileSync(repFile)) : {};
const TEMPLATE = process.env.BAMBU_TEMPLATE || path.join(process.env.USERPROFILE, 'Downloads', 'Cardboard Perforation Tool.3mf');
const tpl = fs.existsSync(TEMPLATE) ? await loadTemplate(TEMPLATE) : null; if (!tpl) console.log('no template project found, skipping .3mf');
for (const n of names) {
  const t0 = Date.now(), a = ALL[n](), all = U(a.segs), bb = all.boundingBox();
  const r = { ...a.rep, size: bb.max.map((x, i) => +(x - bb.min[i]).toFixed(1)), zMin: +bb.min[2].toFixed(3), cm3: { body: +(vol(a.body) / 1000).toFixed(2), white: +(vol(a.white) / 1000).toFixed(3), black: +(vol(a.black) / 1000).toFixed(3) }, overhang: overhang(all), tris: all.numTri() };
  const parts = [{ m: a.body, rgb: COLOURS[n] }];
  writeSTL(path.join(out, 'stl', n + '-body.stl'), a.body);
  if (vol(a.white) > 0) { writeSTL(path.join(out, 'stl', n + '-white.stl'), a.white); parts.push({ m: a.white, rgb: [250, 250, 250] }); }
  if (vol(a.black) > 0) { writeSTL(path.join(out, 'stl', n + '-black.stl'), a.black); parts.push({ m: a.black, rgb: [28, 28, 30] }); }
  writeSTL(path.join(out, 'stl', n + '-one-colour.stl'), all);
  render(path.join(out, 'previews', n + '.png'), parts, { az: -38, el: 20 });
  render(path.join(out, 'previews', n + '-side.png'), parts, { az: -90, el: 4 });
  render(path.join(out, 'previews', n + '-top.png'), parts, { az: -90, el: 89 });
  render(path.join(out, 'previews', n + '-front.png'), parts, { az: 0, el: 8 });
  // underside with one colour per moving piece, to see the joints
  const pal = [[230, 120, 60], [70, 150, 220], [120, 190, 90], [220, 190, 60], [170, 110, 200], [90, 200, 190]];
  render(path.join(out, 'previews', n + '-under.png'), a.segs.map((m, i) => ({ m, rgb: pal[i % pal.length] })), { az: -90, el: -89 });
  if (tpl) { const pp = [{ name: n + ' body', m: a.body, extruder: 1 }]; if (vol(a.white) > 0) pp.push({ name: n + ' white', m: a.white, extruder: HEX[n] === '#FFFFFF' ? 1 : 2 }); if (vol(a.black) > 0) pp.push({ name: n + ' black', m: a.black, extruder: 3 }); await write3mf(path.join(out, n + '.3mf'), 'Big-eye ' + n, pp, [HEX[n], '#FFFFFF', '#000000'], tpl, bb); }
  report[n] = r; console.log(n, ((Date.now() - t0) / 1000).toFixed(1) + 's', JSON.stringify(r));
}
fs.writeFileSync(repFile, JSON.stringify(report, null, 1));
