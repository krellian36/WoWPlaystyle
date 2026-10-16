// Converts Krell's original example files (tests/fixtures/v1) into examples/ in the current format,
// applying the few mechanical fixes below. Run: node scripts/convert-examples.mjs
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { migrate, serialize, slug } from '../model.js';

// These names 404 on Wowhead's CDN (checked 2026-10-15). Each is swapped for the closest real icon.
const ICON_FIXES = {
  inv_shoulder_cloth_raidmage_p_01: 'inv_shoulder_25',
  inv_misc_dirt_02: 'inv_misc_dust_06',
  inv_misc_ingot_01: 'inv_ingot_mithril',
};
// The Paladin file used two names for one set.
const SET_NAME_FIXES = { 'paladin-sunbreaker-artillery': 'Sunbreaker Artillery' };

const fixIcon = name => ICON_FIXES[name] ?? name;
const src = new URL('../tests/fixtures/v1/', import.meta.url);
const out = new URL('../examples/', import.meta.url);
await mkdir(out, { recursive: true });

const index = [];
for (const file of (await readdir(src)).filter(f => f.endsWith('.json')).sort()) {
  const p = migrate(JSON.parse(await readFile(new URL(file, src), 'utf8')));
  const name = slug(p.name);
  if (SET_NAME_FIXES[name]) p.set.name = SET_NAME_FIXES[name];
  p.items.forEach((item, i) => {
    item.id = `${name}-${i + 1}`; // stable ids so the files diff cleanly
    item.icon = fixIcon(item.icon);
    for (const r of item.catalyst.reagents) r.icon = fixIcon(r.icon);
  });
  await writeFile(new URL(`${name}.json`, out), serialize(p));
  index.push({ file: `${name}.json`, name: p.name });
}
await writeFile(new URL('index.json', out), `${JSON.stringify(index, null, 2)}\n`);
console.log(`Wrote ${index.length} examples`);
