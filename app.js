// The editor: state, the live sheet, the edit panel, toolbar actions, autosave and undo.
import { blankPlaystyle, migrate, parsePlaystyle, serialize } from './model.js';
import { sheetHTML, esc } from './render.js';

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
