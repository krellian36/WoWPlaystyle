import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { migrate, blankPlaystyle } from '../model.js';
import { panelHTML } from '../panel.js';

const mage = migrate(JSON.parse(await readFile(new URL('./fixtures/v1/mage-arcane-architect-data.json', import.meta.url), 'utf8')));
const itemEdit = item => ({ kind: 'item', id: item.id });

test('the item panel has the three sections the sheet links to', () => {
  const html = panelHTML(mage, itemEdit(mage.items[0]));
  for (const section of ['tooltip', 'catalyst', 'origin']) assert.match(html, new RegExp(`data-section="${section}"`));
  assert.match(html, /data-field="catalyst.reagents.1.name" value="Leyline Dust"/);
  assert.match(html, /<option value="epic" selected>/);
});

test('crafting fields only show for crafting steps', () => {
  const p = structuredClone(mage);
  p.items[0].catalyst.type = 'quest';
  const html = panelHTML(p, itemEdit(p.items[0]));
  assert.ok(!html.includes('catalyst.professions'));
  assert.ok(!html.includes('add-reagent'));
  assert.match(html, /data-field="catalyst.details"/);
});

test('values are escaped', () => {
  const p = structuredClone(mage);
  p.items[0].name = '"><script>';
  assert.ok(!panelHTML(p, itemEdit(p.items[0])).includes('"><script>'));
});

test('the only item cannot be deleted, and move buttons respect the ends', () => {
  const p = blankPlaystyle();
  const html = panelHTML(p, itemEdit(p.items[0]));
  assert.match(html, /data-panel-action="delete" disabled/);
  assert.match(html, /data-panel-action="move-left" disabled/);
  assert.match(html, /data-panel-action="move-right" disabled/);
});

test('the set panel lists bonuses and pieces, and equipped needs in-set', () => {
  const p = structuredClone(mage);
  p.items[2].inSet = false;
  const html = panelHTML(p, { kind: 'set' });
  assert.match(html, /data-field="set.bonuses.0.pieces"[^>]*value="3"/);
  assert.match(html, /data-field="items.2.equipped" checked disabled/);
});

test('the playstyle panel edits name and description', () => {
  const html = panelHTML(mage, { kind: 'playstyle' });
  assert.match(html, /data-field="name" value="Mage - Arcane Architect"/);
  assert.match(html, /data-field="description"/);
});
