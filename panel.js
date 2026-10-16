// HTML for the edit panel. Every input names the property it edits in data-field, as a dotted path
// relative to the playstyle (playstyle and set panels) or to the item (item panel).
import { BINDINGS, ORIGIN_TYPES, CATALYST_TYPES, iconUrl } from './model.js';
import { esc } from './render.js';

const RARITY_LABELS = { poor: 'Poor', common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' };
const BINDING_LABELS = { '': 'None', pickup: BINDINGS.pickup, equip: BINDINGS.equip };

const label = text => `<span class="field-label">${text}</span>`;
const text = (name, field, value, extra = '') =>
  `<label class="field">${label(name)}<input type="text" data-field="${field}" value="${esc(value)}" autocomplete="off" ${extra}></label>`;
const area = (name, field, value, rows, extra = '') =>
  `<label class="field">${label(name)}<textarea data-field="${field}" rows="${rows}" ${extra}>${esc(value)}</textarea></label>`;
const number = (name, field, value, type) =>
  `<label class="field">${label(name)}<input type="number" min="${type === 'count' ? 1 : 0}" inputmode="numeric" data-field="${field}" data-type="${type}" value="${value ?? ''}"></label>`;
const select = (name, field, value, options, extra = '') =>
  `<label class="field">${label(name)}<select data-field="${field}" ${extra}>${
    Object.entries(options).map(([v, l]) => `<option value="${esc(v)}"${v === value ? ' selected' : ''}>${esc(l)}</option>`).join('')
  }</select></label>`;
const searchUrl = value => (value.trim() ? `https://www.wowhead.com/icons/name:${encodeURIComponent(value.trim())}` : 'https://www.wowhead.com/icons');

function iconField(name, field, value) {
  const id = `f-${field.replace(/\./g, '-')}`;
  return `<div class="field"><label for="${id}">${label(name)}</label>
    <div class="icon-field"><img src="${iconUrl(value)}" alt="" crossorigin="anonymous"><input id="${id}" type="text" data-field="${field}" data-icon value="${esc(value)}" placeholder="inv_staff_13" spellcheck="false" autocomplete="off"></div>
    <p class="icon-warning" hidden>No Wowhead icon has that name.</p>
    <a class="icon-search" href="${searchUrl(value)}" target="_blank" rel="noopener">Browse Wowhead icons ↗</a></div>`;
}

const removeButton = (action, index, what) =>
  `<button type="button" class="icon-btn" data-panel-action="${action}" data-index="${index}" aria-label="Remove ${what}">✕</button>`;

function shell(title, body) {
  return `<div class="panel-head"><h2 id="panel-title">${title}</h2>`
    + '<button type="button" class="icon-btn" data-panel-action="close" aria-label="Close the editor">✕</button></div>'
    + `<div class="panel-body">${body}</div>`;
}

function playstyleBody(p) {
  return `<fieldset><legend>Playstyle</legend>${text('Name', 'name', p.name, 'placeholder="Mage – Arcane Architect"')}`
    + `${area('Description', 'description', p.description, 4, 'placeholder="How this playstyle fights, in a sentence or two."')}</fieldset>`;
}

function setBody(p) {
  const bonuses = p.set.bonuses.map((b, i) => `<div class="list-row">
      <input type="number" min="1" inputmode="numeric" data-field="set.bonuses.${i}.pieces" data-type="count" value="${b.pieces}" aria-label="Pieces needed for bonus ${i + 1}">
      <input type="text" data-field="set.bonuses.${i}.text" value="${esc(b.text)}" placeholder="Feedback Loop deals 15% more damage." aria-label="Bonus ${i + 1} effect">
      ${removeButton('remove-bonus', i, `bonus ${i + 1}`)}</div>`).join('');
  const pieces = p.items.map((item, i) => `<div class="piece-row"><span>${esc(item.name || `Item ${i + 1}`)}</span>
      <label><input type="checkbox" data-field="items.${i}.inSet" data-rerender${item.inSet ? ' checked' : ''}> In set</label>
      <label><input type="checkbox" data-field="items.${i}.equipped"${item.equipped ? ' checked' : ''}${item.inSet ? '' : ' disabled'}> Equipped</label></div>`).join('');
  return `<fieldset><legend>Set</legend>${text('Set name', 'set.name', p.set.name, 'placeholder="Ley-Line Weaver"')}
      <p class="hint">Leave it empty if these items aren't a set.</p></fieldset>
    <fieldset><legend>Bonuses</legend>${p.set.bonuses.length ? '<div class="list-head"><span>Pieces</span><span>Effect</span></div>' : ''}${bonuses}
      <button type="button" class="add-btn" data-panel-action="add-bonus">+ Add bonus</button></fieldset>
    <fieldset><legend>Pieces</legend><p class="hint">Equipped pieces count toward the (2/3) total on tooltips and turn bonuses green.</p>${pieces}</fieldset>`;
}

function catalystFields(c) {
  if (c.type === 'quest') return area('Quest', 'catalyst.details', c.details, 3, 'placeholder="Complete the quest: The Shattered Sun"');
  if (c.type !== 'crafting') return '';
  const reagents = c.reagents.map((r, i) => `<div class="reagent-edit"><div class="list-row">
      <input type="number" min="1" inputmode="numeric" data-field="catalyst.reagents.${i}.quantity" data-type="count" value="${r.quantity}" aria-label="Reagent ${i + 1} amount">
      <input type="text" data-field="catalyst.reagents.${i}.name" value="${esc(r.name)}" placeholder="Leyline Dust" aria-label="Reagent ${i + 1} name">
      ${removeButton('remove-reagent', i, `reagent ${i + 1}`)}</div>
      ${iconField(`Reagent ${i + 1} icon`, `catalyst.reagents.${i}.icon`, r.icon)}</div>`).join('');
  return text('Professions', 'catalyst.professions', c.professions, 'placeholder="Master Jewelcrafter & Enchanter"')
    + area('What they do', 'catalyst.details', c.details, 3, 'placeholder="Recut the crystal and realign its leylines."')
    + `${c.reagents.length ? '<div class="list-head"><span>Amount</span><span>Reagent</span></div>' : ''}${reagents}`
    + '<button type="button" class="add-btn" data-panel-action="add-reagent">+ Add reagent</button>';
}

function itemBody(item, index, total) {
  const o = item.origin;
  return `<fieldset data-section="tooltip"><legend>Tooltip</legend>
      ${text('Name', 'name', item.name, 'placeholder="Prism of the Router"')}
      <div class="row">${select('Rarity', 'rarity', item.rarity, RARITY_LABELS)}${number('Item level', 'itemLevel', item.itemLevel, 'int')}</div>
      ${select('Binding', 'binding', item.binding, BINDING_LABELS)}
      <div class="row">${text('Slot', 'slot', item.slot, 'placeholder="Trinket"')}${text('Type', 'type', item.type, 'placeholder="Plate, Mace…"')}</div>
      ${iconField('Icon', 'icon', item.icon)}
      ${area('Stats and effects', 'stats', item.stats, 5, 'placeholder="+140 Intellect&#10;+115 Haste&#10;Equip: …"')}
      <p class="hint">One per line. Equip:, Use: and secondary stats turn green.</p>
      ${area('Flavor text', 'flavor', item.flavor, 2)}</fieldset>
    <fieldset data-section="catalyst"><legend>Crafting step</legend>
      ${select('Type', 'catalyst.type', item.catalyst.type, CATALYST_TYPES, 'data-rerender')}${catalystFields(item.catalyst)}</fieldset>
    <fieldset data-section="origin"><legend>Where it drops</legend>
      ${select('Type', 'origin.type', o.type, ORIGIN_TYPES)}
      ${text('Base item', 'origin.baseName', o.baseName, 'placeholder="Shattered Prism of the Router"')}
      <p class="hint">Shown as a grey Poor-quality item, before it's restored.</p>
      ${area('Details', 'origin.details', o.details, 2, 'placeholder="An arcane anomaly in Dire Maul."')}</fieldset>
    <div class="panel-actions">
      <button type="button" data-panel-action="move-left"${index === 0 ? ' disabled' : ''}>← Move</button>
      <button type="button" data-panel-action="move-right"${index === total - 1 ? ' disabled' : ''}>Move →</button>
      <button type="button" data-panel-action="duplicate">Duplicate</button>
      <button type="button" class="danger" data-panel-action="delete"${total === 1 ? ' disabled' : ''}>Delete</button>
    </div>`;
}

export function panelHTML(p, edit) {
  if (edit.kind === 'playstyle') return shell('Playstyle', playstyleBody(p));
  if (edit.kind === 'set') return shell('Set', setBody(p));
  const index = p.items.findIndex(item => item.id === edit.id);
  return shell('Item', itemBody(p.items[index], index, p.items.length));
}
