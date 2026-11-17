// Bambu Studio project 3MF: one object with three parts (body / white / black), each on its own filament.
// Printer + filament settings come from a template project saved from Bambu Studio on an A1 with 3 PLA slots;
// the process is reset to the stock "0.20mm Standard @BBL A1" with a few overrides for print-in-place toys.
import fs from 'fs'; import path from 'path'; import JSZip from 'jszip';
import { indexed } from './lib.mjs';

const SYS = path.join(process.env.APPDATA, 'BambuStudio', 'system', 'BBL');
function preset(kind, name) {
  const all = {};
  (function walk(d) { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory()) walk(p); else if (/\.json$/.test(f.name)) { try { const j = JSON.parse(fs.readFileSync(p, 'utf8')); if (j.name) all[j.name] = j; } catch (e) { } } } })(path.join(SYS, kind));
  const chain = []; let n = name; while (n) { const j = all[n]; if (!j) throw new Error('missing preset ' + n); chain.unshift(j); n = j.inherits; }
  return Object.assign({}, ...chain);
}

export async function loadTemplate(file) {
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  const ps = JSON.parse(await zip.files['Metadata/project_settings.config'].async('string'));
  if ((ps.filament_colour || []).length !== 3) throw new Error('template must have exactly 3 filaments');
  const proc = preset('process', '0.20mm Standard @BBL A1');
  for (const k of Object.keys(proc)) if (k in ps && !['name', 'inherits', 'from', 'type', 'setting_id', 'compatible_printers', 'version'].includes(k)) ps[k] = proc[k];
  const set = (k, v) => { if (!(k in ps)) throw new Error('unknown setting ' + k); ps[k] = Array.isArray(ps[k]) ? ps[k].map(() => String(v)) : String(v); };
  ps.print_settings_id = '0.20mm Standard @BBL A1';
  set('layer_height', 0.2); set('wall_loops', 3); set('sparse_infill_density', '15%');
  set('enable_support', 0); set('brim_type', 'no_brim'); set('enable_prime_tower', 1);
  // purge amounts, from row to column: 1 = body colour, 2 = white, 3 = black
  ps.flush_volumes_matrix = ['0', '550', '180', '200', '0', '150', '420', '650', '0'];
  ps.different_settings_to_system = ['brim_type;wall_loops', '', '', '', ''];
  return { ps };
}

const xmlMesh = (id, uuid, V, T, off) => `  <object id="${id}" p:UUID="${uuid}" type="model">
   <mesh>
    <vertices>
${V.map(p => `     <vertex x="${+(p[0] - off[0]).toFixed(5)}" y="${+(p[1] - off[1]).toFixed(5)}" z="${+(p[2] - off[2]).toFixed(5)}"/>`).join('\n')}
    </vertices>
    <triangles>
${Array.from({ length: T.length / 3 }, (_, i) => `     <triangle v1="${T[i * 3]}" v2="${T[i * 3 + 1]}" v3="${T[i * 3 + 2]}"/>`).join('\n')}
    </triangles>
   </mesh>
  </object>`;

// parts: [{ name, m (Manifold), extruder }]   colours: ['#rrggbb' x3]
export async function write3mf(file, title, parts, colours, tpl, bbox) {
  const ps = JSON.parse(JSON.stringify(tpl.ps));
  if (colours[0].toUpperCase() === '#FFFFFF') ps.flush_volumes_matrix[6] = '650'; // white body: black -> slot 1 needs the full purge
  ps.filament_colour = colours; if ('filament_multi_colour' in ps) ps.filament_multi_colour = colours;
  const c = [(bbox.min[0] + bbox.max[0]) / 2, (bbox.min[1] + bbox.max[1]) / 2, (bbox.min[2] + bbox.max[2]) / 2], h = bbox.max[2] - bbox.min[2];
  const meshes = parts.map(p => indexed(p.m)), today = new Date().toISOString().slice(0, 10), N = parts.length, top = N + 1;
  const head = '<?xml version="1.0" encoding="UTF-8"?>\n<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02" xmlns:BambuStudio="http://schemas.bambulab.com/package/2021" xmlns:p="http://schemas.microsoft.com/3dmanufacturing/production/2015/06" requiredextensions="p">\n';
  const objs = head + ' <metadata name="BambuStudio:3mfVersion">1</metadata>\n <resources>\n' + meshes.map((g, i) => xmlMesh(i + 1, `000${i + 1}0000-81cb-4c03-9d28-80fed5dfa1dc`, g.V, g.T, c)).join('\n') + '\n </resources>\n <build/>\n</model>\n';
  const main = head + ` <metadata name="Application">BambuStudio-${ps.version || '02.02.01.58'}</metadata>
 <metadata name="BambuStudio:3mfVersion">1</metadata>
 <metadata name="CreationDate">${today}</metadata>
 <metadata name="ModificationDate">${today}</metadata>
 <metadata name="Designer">WDS STEM Lab</metadata>
 <metadata name="Title">${title}</metadata>
 <resources>
  <object id="${top}" p:UUID="00000001-61cb-4c03-9d28-80fed5dfa1dc" type="model">
   <components>
${parts.map((p, i) => `    <component p:path="/3D/Objects/object_1.model" objectid="${i + 1}" p:UUID="000${i + 1}0000-b206-40ff-9872-83e8017abed1" transform="1 0 0 0 1 0 0 0 1 0 0 0"/>`).join('\n')}
   </components>
  </object>
 </resources>
 <build p:UUID="2c7c17d8-22b5-4d84-8835-1976022ea369">
  <item objectid="${top}" p:UUID="00000002-b1ec-4553-aec9-835e5b724bb4" transform="1 0 0 0 1 0 0 0 1 128 128 ${+(h / 2).toFixed(4)}" printable="1"/>
 </build>
</model>
`;
  const faces = meshes.map(g => g.T.length / 3);
  const ms = `<?xml version="1.0" encoding="UTF-8"?>
<config>
  <object id="${top}">
    <metadata key="name" value="${title}"/>
    <metadata key="extruder" value="1"/>
    <metadata face_count="${faces.reduce((a, b) => a + b, 0)}"/>
${parts.map((p, i) => `    <part id="${i + 1}" subtype="normal_part">
      <metadata key="name" value="${p.name}"/>
      <metadata key="matrix" value="1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 1"/>
      <metadata key="extruder" value="${p.extruder}"/>
      <mesh_stat face_count="${faces[i]}" edges_fixed="0" degenerate_facets="0" facets_removed="0" facets_reversed="0" backwards_edges="0"/>
    </part>`).join('\n')}
  </object>
  <plate>
    <metadata key="plater_id" value="1"/>
    <metadata key="plater_name" value=""/>
    <metadata key="locked" value="false"/>
    <model_instance>
      <metadata key="object_id" value="${top}"/>
      <metadata key="instance_id" value="0"/>
      <metadata key="identify_id" value="91"/>
    </model_instance>
  </plate>
  <assemble>
   <assemble_item object_id="${top}" instance_id="0" transform="1 0 0 0 1 0 0 0 1 0 0 ${+(h / 2).toFixed(4)}" offset="0 0 0" />
  </assemble>
</config>
`;
  const z = new JSZip();
  z.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>\n <Default Extension="png" ContentType="image/png"/>\n <Default Extension="gcode" ContentType="text/x.gcode"/>\n</Types>\n');
  z.file('_rels/.rels', '<?xml version="1.0" encoding="UTF-8"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n <Relationship Target="/3D/3dmodel.model" Id="rel-1" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>\n</Relationships>\n');
  z.file('3D/_rels/3dmodel.model.rels', '<?xml version="1.0" encoding="UTF-8"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n <Relationship Target="/3D/Objects/object_1.model" Id="rel-1" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>\n</Relationships>\n');
  z.file('3D/3dmodel.model', main); z.file('3D/Objects/object_1.model', objs);
  z.file('Metadata/project_settings.config', JSON.stringify(ps, null, 4)); z.file('Metadata/model_settings.config', ms);
  z.file('Metadata/slice_info.config', '<?xml version="1.0" encoding="UTF-8"?>\n<config>\n  <header>\n    <header_item key="X-BBL-Client-Type" value="slicer"/>\n    <header_item key="X-BBL-Client-Version" value="' + (ps.version || '02.02.01.58') + '"/>\n  </header>\n</config>\n');
  fs.writeFileSync(file, await z.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
}
