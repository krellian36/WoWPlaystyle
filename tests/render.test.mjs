import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { migrate, blankPlaystyle, blankItem } from '../model.js';
import { tooltipHTML, sheetHTML } from '../render.js';

const mage = migrate(JSON.parse(await readFile(new URL('./fixtures/v1/mage-arcane-architect-data.json', import.meta.url), 'utf8')));

test('tooltip shows the set count and greys bonuses that are not active', () => {
  const p = structuredClone(mage);
  p.items[1].equipped = false;
  p.items[2].equipped = false;
  const html = tooltipHTML(p.items[0], p);
  assert.match(html, /Ley-Line Weaver \(1\/3\)/);
  assert.match(html, /c-grey">\(3\) Set: Feedback Loop/);
  assert.match(html, /c-setpiece">Prism of the Router/);
  assert.match(html, /c-grey">Mantle of the Node-Walker/);
});

test('tooltip turns the bonus green when the set is complete', () => {
  assert.match(tooltipHTML(mage.items[0], mage), /c-green">\(3\) Set: Feedback Loop/);
});

test('tooltip lines come in WoW order with WoW colours', () => {
  const html = tooltipHTML(mage.items[0], mage);
  let last = -1;
  for (const s of ['Prism of the Router', 'Item Level 645', 'Trinket', '+140 Intellect', '+115 Haste', 'Equip: Replaces', 'Ley-Line Weaver (3/3)', '(3) Set:', 'refocused facets']) {
    const at = html.indexOf(s);
    assert.ok(at > last, `${s} out of order`);
    last = at;
  }
  assert.match(html, /c-white">\+140 Intellect/);
  assert.match(html, /c-green">\+115 Haste/);
  assert.match(html, /color:#a335ee/);
  assert.match(html, /c-yellow">"The refocused facets/);
});

test('tooltip escapes what people type', () => {
  const p = structuredClone(mage);
  p.items[0].name = '<img src=x onerror=alert(1)>';
  assert.ok(!tooltipHTML(p.items[0], p).includes('<img src=x'));
});

test('a blank item renders without optional lines and with the question-mark icon', () => {
  const p = blankPlaystyle();
  const html = tooltipHTML(p.items[0], p);
  assert.match(html, /Unnamed item/);
  assert.ok(!html.includes('Item Level'));
  assert.ok(!html.includes('Set:'));
  assert.match(html, /inv_misc_questionmark\.jpg/);
});

test('sheet shows the set bonus once, in the set bar', () => {
  const html = sheetHTML(mage);
  assert.equal(html.split('(3) Set:').length - 1, 1);
  assert.match(html, /class="setbar"/);
});

test('sheet has a column per item with crafting and drop steps', () => {
  const html = sheetHTML(mage);
  assert.equal(html.match(/class="col"/g).length, 3);
  assert.match(html, /Restored by/);
  assert.match(html, /Shattered Prism of the Router/);
  assert.match(html, /trade_engraving/);
  assert.match(html, /1×<\/span>Flawless Arcane Diamond/);
  assert.match(html, /Made with WoWPlaystyle · krellian36/);
});

test('the export sheet has no editing affordances', () => {
  const html = sheetHTML(mage);
  assert.ok(!html.includes('data-edit'));
  assert.ok(!html.includes('Add item'));
});

test('the editing sheet makes every part clickable', () => {
  const html = sheetHTML(mage, { editing: true });
  const id = mage.items[0].id;
  for (const target of ['playstyle', 'set', 'add', `item:${id}:tooltip`, `item:${id}:catalyst`, `item:${id}:origin`]) {
    assert.ok(html.includes(`data-edit="${target}"`), target);
  }
});

test('empty steps are left out of exports and offered while editing', () => {
  const p = blankPlaystyle();
  p.items[0].catalyst.type = 'none';
  const exported = sheetHTML(p);
  assert.ok(!exported.includes('Restored by'));
  assert.ok(!exported.includes('setbar'));
  const editing = sheetHTML(p, { editing: true });
  assert.match(editing, /\+ Crafting step/);
  assert.match(editing, /\+ Where it drops/);
  assert.match(editing, /\+ Make these items a set/);
});

test('columns cap at four per row', () => {
  const p = blankPlaystyle();
  p.items = Array.from({ length: 6 }, blankItem);
  assert.match(sheetHTML(p), /--cols:4/);
  p.items = p.items.slice(0, 2);
  assert.match(sheetHTML(p), /--cols:2/);
  assert.match(sheetHTML(p, { editing: true }), /--cols:3/);
});
