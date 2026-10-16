// The editor: state, the live sheet, the edit panel, toolbar actions, autosave and undo.
import { blankItem, blankPlaystyle, migrate, parsePlaystyle, serialize, newId, iconUrl, FALLBACK_ICON } from './model.js';
import { sheetHTML, esc } from './render.js';
import { panelHTML } from './panel.js';

const STORAGE_KEY = 'wowplaystyle:v2';
const FIRST_EXAMPLE = 'mage-arcane-architect.json';
const TOAST_MS = 8000;

const $ = id => document.getElementById(id);
const stage = $('stage');
const inner = $('stage-inner');
const panel = $('panel');
const toastEl = $('toast');

// edit is null or { kind: 'playstyle' | 'set' | 'item', id, part, from }
const state = { playstyle: null, edit: null, exporting: false };
let toastTimer = 0;
let saveTimer = 0;
let storageWarned = false;
let undoSnapshot = null;
let iconTimer = 0;

/* ---------- the sheet ---------- */
function renderSheet() {
  inner.innerHTML = sheetHTML(state.playstyle, { editing: true });
  markSelection();
  fitStage();
}

function markSelection() {
  const edit = state.edit;
  for (const el of inner.querySelectorAll('[data-edit]')) {
    const target = el.dataset.edit;
    const selected = !!edit && (edit.kind === 'item' ? target.startsWith(`item:${edit.id}:`) : target === edit.kind);
    el.classList.toggle('is-selected', selected);
  }
}

// Scale the sheet down to fit the stage; it's never scaled up.
function fitStage() {
  const sheet = inner.firstElementChild;
  if (!sheet) return;
  inner.style.zoom = '1';
  const style = getComputedStyle(stage);
  const room = stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  inner.style.zoom = String(Math.min(1, room / sheet.offsetWidth));
}

function changed() {
  renderSheet();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveLocal, 300);
}

function saveLocal() {
  try {
    localStorage.setItem(STORAGE_KEY, serialize(state.playstyle));
  } catch {
    if (storageWarned) return;
    storageWarned = true;
    toast("This browser won't let the page keep your work, so use Save before you leave.");
  }
}

/* ---------- edit panel ---------- */
const currentItem = () => state.playstyle.items.find(item => item.id === state.edit?.id);
const finePointer = matchMedia('(pointer: fine)');

function openEditor(target) {
  if (target === 'add') {
    const item = blankItem();
    state.playstyle.items.push(item);
    changed();
    target = `item:${item.id}:tooltip`;
  }
  const [kind, id, part] = target.split(':');
  state.edit = { kind, id, part, from: target };
  panel.hidden = false;
  renderPanel();
  markSelection();
  fitStage();
  const section = (part && panel.querySelector(`[data-section="${part}"]`)) || panel.querySelector('.panel-body');
  section.scrollIntoView({ block: 'start' });
  // Focusing on a phone would pop the keyboard over the sheet the moment you tap it.
  if (finePointer.matches) section.querySelector('input, select, textarea')?.focus({ preventScroll: true });
}

function renderPanel() {
  if (!state.edit) return;
  if (state.edit.kind === 'item' && !currentItem()) {
    closeEditor(false);
    return;
  }
  panel.innerHTML = panelHTML(state.playstyle, state.edit);
}

function closeEditor(restoreFocus = true) {
  const from = state.edit?.from;
  state.edit = null;
  panel.hidden = true;
  panel.innerHTML = '';
  markSelection();
  fitStage();
  if (restoreFocus && from) inner.querySelector(`[data-edit="${CSS.escape(from)}"]`)?.focus();
}

function setPath(target, path, value) {
  const keys = path.split('.');
  const last = keys.pop();
  keys.reduce((obj, key) => obj[key], target)[last] = value;
}

function readValue(el) {
  if (el.type === 'checkbox') return el.checked;
  if (el.dataset.type === 'int') return el.value === '' ? null : Math.max(0, parseInt(el.value, 10) || 0);
  if (el.dataset.type === 'count') return Math.max(1, parseInt(el.value, 10) || 1);
  return el.value;
}

function updateIconField(input) {
  const field = input.closest('.field');
  const img = field.querySelector('img');
  delete img.dataset.fallback;
  img.classList.remove('icon-missing');
  img.src = iconUrl(input.value);
  field.querySelector('.icon-warning').hidden = true;
  const q = input.value.trim();
  field.querySelector('.icon-search').href = q ? `https://www.wowhead.com/icons/name:${encodeURIComponent(q)}` : 'https://www.wowhead.com/icons';
}

panel.addEventListener('input', event => {
  const el = event.target;
  const field = el.dataset.field;
  if (!field) return;
  const target = state.edit.kind === 'item' ? currentItem() : state.playstyle;
  const apply = () => {
    setPath(target, field, readValue(el));
    if ('icon' in el.dataset) updateIconField(el);
    if ('rerender' in el.dataset) {
      renderPanel();
      panel.querySelector(`[data-field="${CSS.escape(field)}"]`)?.focus();
    }
    changed();
  };
  // Icon names are looked up on Wowhead, so wait until typing pauses.
  if ('icon' in el.dataset) {
    clearTimeout(iconTimer);
    iconTimer = setTimeout(apply, 400);
  } else {
    apply();
  }
});

function moveItem(step) {
  const items = state.playstyle.items;
  const from = items.indexOf(currentItem());
  const to = from + step;
  if (to < 0 || to >= items.length) return null;
  [items[from], items[to]] = [items[to], items[from]];
  return `[data-panel-action="${step < 0 ? 'move-left' : 'move-right'}"]:not(:disabled)`;
}

// Each action changes state and may return a selector to focus once the panel is redrawn.
const panelActions = {
  'add-bonus': () => {
    const bonuses = state.playstyle.set.bonuses;
    bonuses.push({ pieces: (bonuses.at(-1)?.pieces ?? 1) + 1, text: '' });
    return `[data-field="set.bonuses.${bonuses.length - 1}.text"]`;
  },
  'remove-bonus': index => { state.playstyle.set.bonuses.splice(index, 1); },
  'add-reagent': () => {
    const reagents = currentItem().catalyst.reagents;
    reagents.push({ name: '', quantity: 1, icon: '' });
    return `[data-field="catalyst.reagents.${reagents.length - 1}.name"]`;
  },
  'remove-reagent': index => { currentItem().catalyst.reagents.splice(index, 1); },
  'move-left': () => moveItem(-1),
  'move-right': () => moveItem(1),
  duplicate: () => {
    const items = state.playstyle.items;
    const at = items.indexOf(currentItem());
    const copy = { ...structuredClone(items[at]), id: newId() };
    items.splice(at + 1, 0, copy);
    state.edit = { kind: 'item', id: copy.id, part: 'tooltip', from: `item:${copy.id}:tooltip` };
    toast(`Duplicated ${copy.name || 'the item'}`);
  },
  delete: () => {
    const item = currentItem();
    remember();
    state.playstyle.items = state.playstyle.items.filter(i => i !== item);
    closeEditor(false);
    toast(`Deleted ${item.name || 'the item'}`, { undo: true });
  },
};

panel.addEventListener('click', event => {
  const button = event.target.closest('[data-panel-action]');
  if (!button) return;
  const action = button.dataset.panelAction;
  if (action === 'close') {
    closeEditor();
    return;
  }
  const focus = panelActions[action](Number(button.dataset.index));
  changed();
  renderPanel();
  if (focus) panel.querySelector(focus)?.focus();
});

/* ---------- icons that don't exist ---------- */
function onIconError(event) {
  const img = event.target;
  if (!(img instanceof HTMLImageElement) || img.dataset.fallback) return;
  img.dataset.fallback = '1';
  img.classList.add('icon-missing');
  img.src = iconUrl(FALLBACK_ICON, img.src.includes('/medium/') ? 'medium' : 'large');
  img.closest('.field')?.querySelector('.icon-warning')?.removeAttribute('hidden');
}
stage.addEventListener('error', onIconError, true);
panel.addEventListener('error', onIconError, true);

/* ---------- clicking the sheet ---------- */
inner.addEventListener('click', event => {
  const el = event.target.closest('[data-edit]');
  if (el) openEditor(el.dataset.edit);
});
inner.addEventListener('keydown', event => {
  if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[role="button"][data-edit]')) {
    event.preventDefault();
    openEditor(event.target.dataset.edit);
  }
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const menu = document.querySelector('details.menu[open]');
  if (menu) {
    menu.open = false;
    menu.querySelector('summary').focus();
  } else if (!panel.hidden) {
    closeEditor();
  }
});

/* ---------- undo ---------- */
function remember() {
  undoSnapshot = structuredClone(state.playstyle);
}

/* ---------- toast ---------- */
function toast(message, { undo = false } = {}) {
  toastEl.innerHTML = `<span>${esc(message)}</span>${undo ? '<button type="button" data-action="undo">Undo</button>' : ''}`;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.hidden = true; }, TOAST_MS);
}

/* ---------- examples ---------- */
async function fetchExample(file) {
  const res = await fetch(`examples/${encodeURIComponent(file)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return migrate(await res.json());
}

/* ---------- start ---------- */
async function start() {
  let saved = null;
  let note = '';
  try { saved = localStorage.getItem(STORAGE_KEY); } catch { /* storage blocked: start from the example */ }
  if (saved) {
    try { state.playstyle = parsePlaystyle(saved); } catch { note = "Your last session couldn't be restored, so here's the Mage example instead."; }
  }
  if (!state.playstyle) {
    try { state.playstyle = await fetchExample(FIRST_EXAMPLE); } catch { state.playstyle = blankPlaystyle(); }
  }
  renderSheet();
  if (note) toast(note);
}

new ResizeObserver(fitStage).observe(stage);
document.fonts.ready.then(fitStage);
start();
