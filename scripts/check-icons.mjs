// Checks every icon name used in examples/ against Wowhead's CDN and writes the ones that exist
// to tests/fixtures/known-icons.txt. Needs the network. Run: node scripts/check-icons.mjs
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { iconUrl, professionIcons, FALLBACK_ICON } from '../model.js';

const dir = new URL('../examples/', import.meta.url);
const names = new Set([FALLBACK_ICON]);
for (const file of (await readdir(dir)).filter(f => f.endsWith('.json') && f !== 'index.json')) {
  const p = JSON.parse(await readFile(new URL(file, dir), 'utf8'));
  for (const item of p.items) {
    names.add(item.icon);
    for (const r of item.catalyst.reagents) names.add(r.icon);
    for (const icon of professionIcons(item.catalyst.professions)) names.add(icon);
  }
}

const found = [];
const missing = [];
for (const name of [...names].filter(Boolean).sort()) {
  const res = await fetch(iconUrl(name), { method: 'HEAD' });
  (res.ok ? found : missing).push(name);
}
await writeFile(new URL('../tests/fixtures/known-icons.txt', import.meta.url), `${found.join('\n')}\n`);
if (missing.length) {
  console.error(`Missing on Wowhead: ${missing.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log(`${found.length} icons found`);
}
