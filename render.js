// HTML for the WoW tooltip and the drop → crafting sheet. Strings only, so the stage, the exports
// and the tests all use the same markup.
import {
  RARITY_COLORS, BINDINGS, ORIGIN_TYPES, hasSet, setPieces, equippedCount, bonusActive,
  statLineClass, professionIcons, iconUrl,
} from './model.js';

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = value => String(value).replace(/[&<>"']/g, c => ESCAPES[c]);

const icon = (name, size, cls) =>
  `<img class="${cls}" src="${iconUrl(name, size)}" alt="" crossorigin="anonymous">`;
const lines = text => text.split('\n').map(l => l.trim()).filter(Boolean);
const filled = text => text.trim() !== '';
const unquote = text => text.trim().replace(/^["“]|["”]$/g, '');

export function tooltipHTML(item, p, { setBlock = true } = {}) {
  const out = [`<p class="tt-name" style="color:${RARITY_COLORS[item.rarity]}">${esc(item.name || 'Unnamed item')}</p>`];
  if (item.itemLevel != null) out.push(`<p class="c-yellow">Item Level ${item.itemLevel}</p>`);
  if (item.binding) out.push(`<p class="c-white">${BINDINGS[item.binding]}</p>`);
  if (filled(item.slot) || filled(item.type)) {
    out.push(`<p class="tt-split c-white"><span>${esc(item.slot)}</span><span>${esc(item.type)}</span></p>`);
  }
  for (const line of lines(item.stats)) out.push(`<p class="c-${statLineClass(line)}">${esc(line)}</p>`);

  if (setBlock && hasSet(p) && item.inSet) {
    const pieces = setPieces(p);
    out.push(`<p class="tt-gap c-yellow">${esc(p.set.name)} (${equippedCount(p)}/${pieces.length})</p>`);
    for (const piece of pieces) {
      out.push(`<p class="tt-indent ${piece.equipped ? 'c-setpiece' : 'c-grey'}">${esc(piece.name || 'Unnamed item')}</p>`);
    }
    p.set.bonuses.forEach((bonus, i) => {
      out.push(`<p class="${i === 0 ? 'tt-gap ' : ''}${bonusActive(p, bonus) ? 'c-green' : 'c-grey'}">(${bonus.pieces}) Set: ${esc(bonus.text)}</p>`);
    });
  }
  if (filled(item.flavor)) out.push(`<p class="tt-gap c-yellow">"${esc(unquote(item.flavor))}"</p>`);

  return `<div class="tt-wrap">${icon(item.icon, 'large', 'tt-icon')}<div class="tt">${out.join('')}</div></div>`;
}

// One editable region of the sheet. Exports render with editing off and get plain divs.
function part(editing, target, cls, inner, label) {
  return editing
    ? `<div class="${cls} editable" role="button" tabindex="0" data-edit="${esc(target)}" aria-label="${esc(label)}">${inner}</div>`
    : `<div class="${cls}">${inner}</div>`;
}

const ARROW = '<div class="col-arrow" aria-hidden="true">↑</div>';
const originEmpty = o => !filled(o.baseName) && !filled(o.details);
const catalystEmpty = c =>
  c.type === 'none' || (!filled(c.professions) && !filled(c.details) && !c.reagents.some(r => filled(r.name)));

function catalystHTML(c) {
  if (c.type === 'quest') return `<div class="step-label">Quest</div><p class="step-text">${esc(c.details)}</p>`;
  const professions = filled(c.professions)
    ? `<p class="prof">${professionIcons(c.professions).map(n => icon(n, 'medium', 'ic-sm')).join('')}<span>${esc(c.professions)}</span></p>`
    : '';
  const reagents = c.reagents.filter(r => filled(r.name))
    .map(r => `<p class="reagent">${icon(r.icon, 'medium', 'ic-sm')}<span class="qty">${r.quantity}×</span>${esc(r.name)}</p>`)
    .join('');
  return `<div class="step-label">Restored by</div>${professions}${filled(c.details) ? `<p class="step-text">${esc(c.details)}</p>` : ''}${reagents}`;
}

function originHTML(o) {
  return `<div class="step-label">${ORIGIN_TYPES[o.type]}</div>`
    + (filled(o.baseName) ? `<p class="step-item c-grey">${esc(o.baseName)}</p>` : '')
    + (filled(o.details) ? `<p class="step-text">${esc(o.details)}</p>` : '');
}

function columnHTML(item, p, editing) {
  const name = item.name || 'item';
  const parts = [part(editing, `item:${item.id}:tooltip`, 'col-tooltip', tooltipHTML(item, p, { setBlock: false }), `Edit ${name}`)];
  if (!catalystEmpty(item.catalyst)) {
    parts.push(ARROW, part(editing, `item:${item.id}:catalyst`, 'step', catalystHTML(item.catalyst), `Edit how ${name} is restored`));
  } else if (editing) {
    parts.push(ARROW, part(true, `item:${item.id}:catalyst`, 'step ghost', '<p>+ Crafting step</p>', `Add a crafting step to ${name}`));
  }
  if (!originEmpty(item.origin)) {
    parts.push(ARROW, part(editing, `item:${item.id}:origin`, 'step', originHTML(item.origin), `Edit where ${name} drops`));
  } else if (editing) {
    parts.push(ARROW, part(true, `item:${item.id}:origin`, 'step ghost', '<p>+ Where it drops</p>', `Add where ${name} drops`));
  }
  return `<div class="col">${parts.join('')}</div>`;
}

export function sheetHTML(p, { editing = false } = {}) {
  const cols = Math.min(Math.max(p.items.length + (editing ? 1 : 0), 1), 4);
  const head = part(editing, 'playstyle', 'sheet-head',
    `<h1>${esc(p.name || 'Untitled playstyle')}</h1>${filled(p.description) ? `<p class="sheet-desc">${esc(p.description)}</p>` : ''}`,
    'Edit the playstyle name and description');

  let setbar = '';
  if (hasSet(p)) {
    const bonuses = p.set.bonuses
      .map(b => `<span class="${bonusActive(p, b) ? 'c-green' : 'c-grey'}">(${b.pieces}) Set: ${esc(b.text)}</span>`)
      .join('');
    setbar = part(editing, 'set', 'setbar', `<span class="setbar-name c-yellow">${esc(p.set.name)}</span><span class="setbar-bonuses">${bonuses}</span>`, 'Edit the set');
  } else if (editing) {
    setbar = part(true, 'set', 'setbar ghost', '<span>+ Make these items a set</span>', 'Make these items a set');
  }

  const columns = p.items.map(item => columnHTML(item, p, editing)).join('')
    + (editing ? '<button type="button" class="col add-item" data-edit="add">+ Add item</button>' : '');

  return `<div class="sheet" style="--cols:${cols}">${head}${setbar}<div class="sheet-cols">${columns}</div>`
    + '<p class="sheet-foot">Made with WoWPlaystyle · krellian36</p></div>';
}
