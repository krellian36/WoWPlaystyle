import test from 'node:test';
import assert from 'node:assert/strict';
import {
  statLineClass, professionIcons, slug, iconUrl, blankPlaystyle, blankItem,
  hasSet, setPieces, equippedCount, bonusActive,
} from '../model.js';

const ICONS = 'https://wow.zamimg.com/images/wow/icons';

test('statLineClass colours lines the way WoW does', () => {
  assert.equal(statLineClass('+140 Intellect'), 'white');
  assert.equal(statLineClass('+310 Stamina'), 'white');
  assert.equal(statLineClass('1,250 Armor'), 'white');
  assert.equal(statLineClass('+115 Haste'), 'green');
  assert.equal(statLineClass('+98 Critical Strike'), 'green');
  assert.equal(statLineClass('Equip: Replaces Arcane Missiles with Deploy Relay.'), 'green');
  assert.equal(statLineClass('Use: Summon a relay.'), 'green');
  assert.equal(statLineClass('Chance on hit: Burns the target.'), 'green');
  assert.equal(statLineClass('  equip: lower case still counts'), 'green');
  assert.equal(statLineClass('Unique-Equipped'), 'white');
});

test('professionIcons finds each profession in the order written', () => {
  assert.deepEqual(professionIcons('Master Jewelcrafter & Enchanter'), ['inv_misc_gem_01', 'trade_engraving']);
  assert.deepEqual(professionIcons('Blacksmith, Leatherworker'), ['trade_blacksmithing', 'trade_leatherworking']);
  assert.deepEqual(professionIcons('Engineering and Alchemy'), ['trade_engineering', 'trade_alchemy']);
  assert.deepEqual(professionIcons('Master Tailor & Alchemist'), ['trade_tailoring', 'trade_alchemy']);
  assert.deepEqual(professionIcons('Archaeologist'), []);
  assert.deepEqual(professionIcons(''), []);
});

test('slug makes safe file names', () => {
  assert.equal(slug('Mage – Arcane Architect'), 'mage-arcane-architect');
  assert.equal(slug('Mage - Arcane Architect'), 'mage-arcane-architect');
  assert.equal(slug("Charged Thunder-Striker's Baton"), 'charged-thunder-strikers-baton');
  assert.equal(slug('Pokémon Café'), 'pokemon-cafe');
  assert.equal(slug('   '), 'playstyle');
});

test('iconUrl accepts names, file names and full URLs', () => {
  assert.equal(iconUrl('inv_staff_13'), `${ICONS}/large/inv_staff_13.jpg`);
  assert.equal(iconUrl(' INV_Staff_13.jpg ', 'medium'), `${ICONS}/medium/inv_staff_13.jpg`);
  assert.equal(iconUrl(`${ICONS}/large/inv_staff_13.jpg`), `${ICONS}/large/inv_staff_13.jpg`);
  assert.equal(iconUrl(''), `${ICONS}/large/inv_misc_questionmark.jpg`);
});

test('set math follows in-set and equipped flags', () => {
  const p = blankPlaystyle();
  p.set = { name: 'Ley-Line Weaver', bonuses: [{ pieces: 2, text: 'a' }, { pieces: 3, text: 'b' }] };
  p.items = [blankItem(), blankItem(), blankItem(), blankItem()];
  p.items[3].inSet = false; // equipped but not part of the set: must not count

  assert.equal(setPieces(p).length, 3);
  assert.equal(equippedCount(p), 3);
  assert.ok(bonusActive(p, p.set.bonuses[1]));

  p.items[1].equipped = false;
  p.items[2].equipped = false;
  assert.equal(equippedCount(p), 1);
  assert.ok(!bonusActive(p, p.set.bonuses[0]));

  p.set.name = '   ';
  assert.ok(!hasSet(p));
  assert.equal(setPieces(p).length, 0);
});

test('blank items get unique ids', () => {
  const ids = new Set(Array.from({ length: 50 }, () => blankItem().id));
  assert.equal(ids.size, 50);
});
