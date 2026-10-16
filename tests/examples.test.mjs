import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { migrate, hasSet, setPieces, professionIcons } from '../model.js';

const dir = new URL('../examples/', import.meta.url);
const read = async file => JSON.parse(await readFile(new URL(file, dir), 'utf8'));
const known = new Set((await readFile(new URL('./fixtures/known-icons.txt', import.meta.url), 'utf8')).split(/\r?\n/).filter(Boolean));

test('there are nine examples and the Mage one exists', async () => {
  const index = await read('index.json');
  assert.equal(index.length, 9);
  assert.ok(index.some(x => x.file === 'mage-arcane-architect.json'));
});

test('every example is already in the current format and uses only real icons', async () => {
  for (const { file, name } of await read('index.json')) {
    const raw = await read(file);
    const p = migrate(raw);
    assert.deepEqual(p, raw, `${file} is normalised`);
    assert.equal(p.name, name);
    assert.ok(hasSet(p), file);
    assert.equal(setPieces(p).length, p.items.length, file);
    for (const item of p.items) {
      for (const icon of [item.icon, ...item.catalyst.reagents.map(r => r.icon), ...professionIcons(item.catalyst.professions)]) {
        assert.ok(known.has(icon), `${file}: ${icon}`);
      }
    }
  }
});

test('the Paladin set uses one name', async () => {
  assert.equal((await read('paladin-sunbreaker-artillery.json')).set.name, 'Sunbreaker Artillery');
});
