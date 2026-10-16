import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { migrate, parsePlaystyle, serialize, NotAPlaystyleError } from '../model.js';

const FIXTURES = new URL('./fixtures/v1/', import.meta.url);
const files = (await readdir(FIXTURES)).filter(f => f.endsWith('.json')).sort();
const load = async file => JSON.parse(await readFile(new URL(file, FIXTURES), 'utf8'));

test('all nine of Krell\'s files are here', () => assert.equal(files.length, 9));

for (const file of files) {
  test(`converts ${file}`, async () => {
    const p = migrate(await load(file));
    assert.equal(p.version, 2);
    assert.ok(p.name.length > 0);
    assert.equal(p.items.length, 3);
    assert.ok(p.set.name.length > 0);
    assert.equal(p.set.bonuses.length, 1);
    assert.equal(p.set.bonuses[0].pieces, 3);
    assert.ok(!p.set.bonuses[0].text.startsWith('('), 'the "(3) Set:" prefix is stripped');
    for (const item of p.items) {
      assert.ok(item.inSet && item.equipped);
      assert.ok(item.name && item.icon && item.origin.baseName);
      assert.ok(['epic', 'legendary'].includes(item.rarity));
    }
    assert.equal(new Set(p.items.map(i => i.id)).size, 3);
  });
}

test('Mage conversion maps every field', async () => {
  const p = migrate(await load('mage-arcane-architect-data.json'));
  const prism = p.items[0];
  assert.equal(p.name, 'Mage - Arcane Architect');
  assert.equal(p.set.name, 'Ley-Line Weaver');
  assert.deepEqual(p.set.bonuses, [{ pieces: 3, text: 'Feedback Loop deals 15% increased damage to targets caught inside the relay network.' }]);
  assert.equal(prism.slot, 'Trinket');
  assert.equal(prism.itemLevel, 645);
  assert.equal(prism.binding, '');
  assert.equal(prism.flavor, 'The refocused facets now splinter single beams into a thousand stars.');
  assert.equal(prism.icon, 'inv_misc_gem_crystal_02');
  assert.deepEqual(prism.origin, {
    type: 'drop',
    baseName: 'Shattered Prism of the Router',
    details: 'Drops from an arcane anomaly boss in a mid-tier magical dungeon (e.g., Dire Maul or Karazhan crypts).',
  });
  assert.equal(prism.catalyst.type, 'crafting');
  assert.equal(prism.catalyst.professions, 'Master Jewelcrafter & Enchanter');
  assert.deepEqual(prism.catalyst.reagents[1], { name: 'Leyline Dust', quantity: 5, icon: 'inv_misc_dust_02' });
  assert.equal(p.items[2].rarity, 'legendary');
});

test('Paladin takes the set name from the first item', async () => {
  const p = migrate(await load('paladin-sunbreaker-artillery-data.json'));
  assert.equal(p.set.name, 'Shattered Sunbreaker');
  assert.ok(p.items.every(i => i.inSet));
});

test('Warrior origin "Crafting" becomes crafted', async () => {
  const p = migrate(await load('warrior-lodestone-colossus-data.json'));
  assert.ok(p.items.every(i => i.origin.type === 'crafted'));
});

test('v1 edge cases: unprefixed bonus, string pieces, missing fields, null items', () => {
  const p = migrate({
    playstyleName: 'X',
    items: [
      { name: 'A', setBonuses: [{ text: 'No prefix bonus', isActive: true }], itemSet: { name: 'S', pieces: ['A', { name: 'B', isActive: false }] } },
      { name: 'B' },
      { name: 'C' },
      null,
    ],
  });
  assert.equal(p.set.name, 'S');
  assert.deepEqual(p.set.bonuses, [{ pieces: 2, text: 'No prefix bonus' }]);
  assert.deepEqual(p.items.map(i => i.inSet), [true, true, false]);
  assert.equal(p.items[0].rarity, 'epic');
  assert.equal(p.items[0].itemLevel, null);
  assert.equal(p.items[0].catalyst.type, 'none');
});

test('v1 without any set gives an empty set', () => {
  const p = migrate({ playstyleName: 'X', items: [{ name: 'A' }] });
  assert.deepEqual(p.set, { name: '', bonuses: [] });
  assert.equal(p.items[0].inSet, false);
});

test('v2 survives a save and load unchanged', async () => {
  const p = migrate(await load('mage-arcane-architect-data.json'));
  assert.deepEqual(parsePlaystyle(serialize(p)), p);
});

test('normalize repairs a hand-edited v2 file', () => {
  const p = migrate({
    version: 2,
    items: [
      { id: 'a', rarity: 'mythic', itemLevel: '700', catalyst: { type: 'crafting', reagents: [{ name: 'Dust', quantity: 0 }] } },
      { id: 'a', origin: { type: 'stolen' } },
    ],
  });
  assert.equal(p.items[0].rarity, 'epic');
  assert.equal(p.items[0].itemLevel, 700);
  assert.equal(p.items[0].catalyst.reagents[0].quantity, 1);
  assert.notEqual(p.items[0].id, p.items[1].id);
  assert.equal(p.items[1].origin.type, 'drop');
  assert.deepEqual(p.set, { name: '', bonuses: [] });
});

test('ids that would break editing are replaced', () => {
  const p = migrate({ version: 2, items: [{ id: 'a:b' }, { id: 'has space' }, { id: 'ok-id_1' }] });
  assert.ok(p.items.slice(0, 2).every(i => /^[\w-]+$/.test(i.id)), p.items.map(i => i.id).join());
  assert.equal(p.items[2].id, 'ok-id_1');
});

test('an empty item list gets one blank item', () => {
  assert.equal(migrate({ version: 2, items: [] }).items.length, 1);
});

test('rejects things that are not playstyles', () => {
  for (const text of ['not json', '42', 'null', '{}', '{"items":"nope"}', '[]']) {
    assert.throws(() => parsePlaystyle(text), NotAPlaystyleError, text);
  }
});
