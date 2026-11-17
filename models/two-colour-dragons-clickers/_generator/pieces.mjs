// node pieces.mjs <dragon>  -> lists every separate piece in each link with its bounding box (to find floating bits)
import { DRAGONS } from './dragons.mjs';
const a = DRAGONS[process.argv[2]]();
a.segs.forEach((s, k) => s.decompose().forEach(p => { const b = p.boundingBox(); console.log('link', k, 'vol', p.volume().toFixed(1), 'x', b.min[0].toFixed(1), b.max[0].toFixed(1), 'y', b.min[1].toFixed(1), b.max[1].toFixed(1), 'z', b.min[2].toFixed(1), b.max[2].toFixed(1)); }));
