// Every model the build knows: the full-size animals, the minis, the short wigglers, the re-posed and new shorts
// (poses, poses2), the new round minis (minis2), the winter minis (minis3), and a keychain version of every mini.
import * as big from './animals.mjs';
import * as mini from './minis.mjs';
import { keychains } from './keychain.mjs';
const parts = [big, mini];
for (const f of ['./short.mjs', './poses.mjs', './poses2.mjs', './minis2.mjs', './minis3.mjs']) { try { parts.push(await import(f)); } catch (e) { if (e.code !== 'ERR_MODULE_NOT_FOUND') throw e; } }
const base = { ALL: Object.assign({}, ...parts.map(p => p.ALL)), COLOURS: Object.assign({}, ...parts.map(p => p.COLOURS)), HEX: Object.assign({}, ...parts.map(p => p.HEX)) };
const kc = keychains(base.ALL, base.COLOURS, base.HEX);
export const ALL = { ...base.ALL, ...kc.ALL };
export const COLOURS = { ...base.COLOURS, ...kc.COLOURS };
export const HEX = { ...base.HEX, ...kc.HEX };
