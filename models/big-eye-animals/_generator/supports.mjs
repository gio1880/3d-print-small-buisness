// Support check: slices a piece at 0.2 mm layers (as it sits on the plate) and finds what would need supports.
//   node supports.mjs [animal ...]   -> prints a table and writes supports.json
// Per layer it compares the slice with the one below:
//   floating  = a separate island with nothing at all under it (truly needs support)
//   overhang  = plastic sticking out past the layer below by more than D (0.2 mm layer at 55° from vertical = 0.29 mm)
// Every colour is checked together (any colour holds up the next layer), and the gaps between moving pieces count as air.
import fs from 'fs'; import path from 'path';
import { U } from './lib.mjs';

import { LAYER, D, supportCheck, features, verdict } from './lib.mjs';
export { LAYER, D, supportCheck, features, verdict };

if (process.argv[1] && process.argv[1].endsWith('supports.mjs')) {
  const { ALL } = await import('./animals.mjs');
  const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')).replace(/%20/g, ' ').replace(/%23/g, '#');
  const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(ALL), res = {};
  for (const n of names) {
    const a = ALL[n](), all = U(a.segs);
    const { floating, over } = supportCheck(all), fs_ = features(over);
    // colour inlays: a white/black part whose bottom layer has no plastic of any colour under it is already in `floating`/`over` above
    res[n] = { floating, features: fs_.filter(g => verdict(g) !== 'ok' || (g.bridge && g.w >= 1.2)).map(g => ({ ...g, verdict: verdict(g) === 'ok' ? 'bridge ok' : verdict(g) })) };
    console.log(n, 'floating:', floating.length, 'fix:', res[n].features.filter(g => g.verdict === 'FIX').length, 'watch:', res[n].features.filter(g => g.verdict === 'watch').length);
    for (const x of floating) console.log('   FLOAT', JSON.stringify(x));
    for (const g of res[n].features) console.log('  ', g.verdict, JSON.stringify(g));
  }
  fs.writeFileSync(path.join(here, 'supports.json'), JSON.stringify(res, null, 1));
}
