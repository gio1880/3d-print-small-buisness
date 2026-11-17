// node build.mjs [name ...]  -> ../dragons/*.3mf, ../clickers/*.3mf, ../stl/, ../previews/, report.json
import fs from 'fs'; import path from 'path';
import { DRAGONS } from './dragons.mjs';
import { MINIS } from './dragons-mini.mjs';
import { CLICKERS, fitTest, stemFitTest } from './clickers.mjs';
import { loadTemplate, write3mf } from '../../big-eye-animals/_generator/mf.mjs';
import { U, writeSTL, render, overhang, vol } from '../../big-eye-animals/_generator/lib.mjs';

import { SPOOL, flushFor, PAIR } from './colours.mjs';
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')).replace(/%20/g, ' ').replace(/%23/g, '#');
const out = path.join(here, '..');
for (const d of ['dragons', 'clickers', 'stl', 'previews']) fs.mkdirSync(path.join(out, d), { recursive: true });
const repFile = path.join(here, 'report.json'), report = fs.existsSync(repFile) ? JSON.parse(fs.readFileSync(repFile)) : {};
const TEMPLATE = process.env.BAMBU_TEMPLATE || path.join(process.env.USERPROFILE, 'Downloads', 'Cardboard Perforation Tool.3mf');
const tpl = await loadTemplate(TEMPLATE);
const jobs = { ...Object.fromEntries(Object.entries({ ...DRAGONS, ...MINIS }).map(([k, f]) => [k, ['dragons', f]])), ...Object.fromEntries(Object.entries(CLICKERS).map(([k, f]) => [k, ['clickers', f]])), 'switch-fit-test': ['clickers', fitTest], 'stem-fit-test': ['clickers', stemFitTest] };
const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(jobs);

for (const n of names) {
  const t0 = Date.now(), [kind, make] = jobs[n], a = make();
  const isDragon = kind === 'dragons';
  const body = isDragon ? a.body.add(a.black) : a.body, acc = isDragon ? a.white : a.accent;
  const all = isDragon ? U(a.segs) : a.all, bb = all.boundingBox();
  const [c1, c2] = PAIR[n], hasAcc = acc && vol(acc) > 0.001;
  const r = { kind, ...a.rep, colours: PAIR[n], size: bb.max.map((x, i) => +(x - bb.min[i]).toFixed(1)), zMin: +bb.min[2].toFixed(3), cm3: { body: +(vol(body) / 1000).toFixed(2), accent: hasAcc ? +(vol(acc) / 1000).toFixed(3) : 0 }, overhang: overhang(all), tris: all.numTri() };
  const parts = [{ m: body, rgb: SPOOL[c1].rgb }]; if (hasAcc) parts.push({ m: acc, rgb: SPOOL[c2].rgb });
  writeSTL(path.join(out, 'stl', n + '-body.stl'), body);
  if (hasAcc) writeSTL(path.join(out, 'stl', n + '-accent.stl'), acc);
  writeSTL(path.join(out, 'stl', n + '-one-colour.stl'), all);
  // two-piece clickers: pictures of the assembled clicker; the print layout gets its own picture
  const asmParts = a.asm ? [{ m: a.asm.body, rgb: SPOOL[c1].rgb }, ...(vol(a.asm.accent) > 0.001 ? [{ m: a.asm.accent, rgb: SPOOL[c2].rgb }] : [])] : parts;
  render(path.join(out, 'previews', n + '.png'), asmParts, { az: -38, el: isDragon ? 20 : 30 });
  if (a.asm) {
    render(path.join(out, 'previews', n + '-plate.png'), parts, { az: -60, el: 40 });
    render(path.join(out, 'previews', n + '-top.png'), asmParts, { az: -90, el: 89 });
    const half = m => m.trimByPlane([0, 1, 0], 0);
    render(path.join(out, 'previews', n + '-section.png'), [{ m: half(a.asm.base), rgb: SPOOL[c1].rgb }, { m: half(a.asm.cap), rgb: SPOOL[c2].rgb }], { az: -90, el: 6 });
  } else if (isDragon) {
    render(path.join(out, 'previews', n + '-side.png'), parts, { az: -90, el: 4 });
    render(path.join(out, 'previews', n + '-top.png'), parts, { az: -90, el: 89 });
    const pal = [[230, 120, 60], [70, 150, 220], [120, 190, 90], [220, 190, 60], [170, 110, 200], [90, 200, 190]];
    render(path.join(out, 'previews', n + '-under.png'), a.segs.map((m, i) => ({ m, rgb: pal[i % pal.length] })), { az: -90, el: -89 });
  }
  const ps = JSON.parse(JSON.stringify(tpl.ps));
  ps.flush_volumes_matrix = ['0', String(flushFor(c1, c2)), '0', String(flushFor(c2, c1)), '0', '0', '0', '0', '0'];
  const pp = [{ name: n + ' body', m: body, extruder: 1 }]; if (hasAcc) pp.push({ name: n + ' accent', m: acc, extruder: 2 });
  await write3mf(path.join(out, kind, n + '.3mf'), n, pp, [SPOOL[c1].hex, SPOOL[c2].hex, SPOOL[c2].hex], { ps }, bb);
  report[n] = r; console.log(n, ((Date.now() - t0) / 1000).toFixed(1) + 's', JSON.stringify(r));
}
fs.writeFileSync(repFile, JSON.stringify(report, null, 1));
