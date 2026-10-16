// The data format, conversion of older saves, and the rules the tooltip and sheet follow. No DOM here.

export const RARITY_COLORS = {
  poor: '#9d9d9d', common: '#ffffff', uncommon: '#1eff00',
  rare: '#0070dd', epic: '#a335ee', legendary: '#ff8000',
};
export const RARITIES = Object.keys(RARITY_COLORS);
export const BINDINGS = { '': '', pickup: 'Binds when picked up', equip: 'Binds when equipped' };
export const ORIGIN_TYPES = { drop: 'Drop', quest: 'Quest', crafted: 'Crafted' };
export const CATALYST_TYPES = { none: 'None', quest: 'Quest', crafting: 'Crafting' };
export const FALLBACK_ICON = 'inv_misc_questionmark';

export class NotAPlaystyleError extends Error {
  constructor(message = "That file isn't a WoWPlaystyle save.") {
    super(message);
    this.name = 'NotAPlaystyleError';
  }
}

export function newId() {
  return Math.random().toString(36).slice(2, 10);
}

export function blankItem() {
  return {
    id: newId(), name: '', rarity: 'epic', itemLevel: null, binding: 'pickup',
    slot: '', type: '', stats: '', flavor: '', icon: '', inSet: true, equipped: true,
    origin: { type: 'drop', baseName: '', details: '' },
    catalyst: { type: 'crafting', professions: '', details: '', reagents: [] },
  };
}

export function blankPlaystyle() {
  return { version: 2, name: '', description: '', set: { name: '', bonuses: [] }, items: [blankItem()] };
}

/* ---------- sets ---------- */
export const hasSet = p => p.set.name.trim() !== '';
export const setPieces = p => (hasSet(p) ? p.items.filter(i => i.inSet) : []);
export const equippedCount = p => setPieces(p).filter(i => i.equipped).length;
export const bonusActive = (p, bonus) => equippedCount(p) >= bonus.pieces;

/* ---------- text rules ---------- */
const EFFECT_LINE = /^(equip|use|chance on hit)\s*:/i;
const PRIMARY_LINE = /^[+-]?\d[\d,.]*\s+(strength|agility|intellect|stamina|spirit|armor)\b/i;
const SECONDARY_LINE = /^\+\s*\d/;

export function statLineClass(line) {
  const text = line.trim();
  if (EFFECT_LINE.test(text)) return 'green';
  if (PRIMARY_LINE.test(text)) return 'white';
  if (SECONDARY_LINE.test(text)) return 'green';
  return 'white';
}

const PROFESSIONS = [
  [/blacksmith/i, 'trade_blacksmithing'],
  [/leatherwork/i, 'trade_leatherworking'],
  [/tailor/i, 'trade_tailoring'],
  [/alchem/i, 'trade_alchemy'],
  [/engineer/i, 'trade_engineering'],
  [/enchant/i, 'trade_engraving'],
  [/jewelcraft/i, 'inv_misc_gem_01'],
  [/inscription|scribe/i, 'inv_inscription_tradeskill01'],
  [/mining|miner/i, 'trade_mining'],
  [/herbalis/i, 'trade_herbalism'],
  [/skinn/i, 'inv_misc_pelt_wolf_01'],
  [/cook/i, 'inv_misc_food_15'],
];

export function professionIcons(text) {
  return PROFESSIONS
    .map(([pattern, icon]) => ({ at: text.search(pattern), icon }))
    .filter(match => match.at >= 0)
    .sort((a, b) => a.at - b.at)
    .map(match => match.icon);
}

export function slug(text) {
  return String(text)
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'playstyle';
}

export function iconUrl(name, size = 'large') {
  const file = String(name).trim().split('/').pop().toLowerCase().replace(/\.(jpg|jpeg|png)$/, '');
  return `https://wow.zamimg.com/images/wow/icons/${size}/${encodeURIComponent(file || FALLBACK_ICON)}.jpg`;
}

/* ---------- loading and saving ---------- */
const str = v => (typeof v === 'string' ? v : v == null ? '' : String(v));
const oneOf = (v, allowed, fallback) => (typeof v === 'string' && Object.hasOwn(allowed, v) ? v : fallback);
const list = v => (Array.isArray(v) ? v : []);

function itemLevel(v) {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function count(v) {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function normalizeItem(raw) {
  const origin = raw.origin ?? {};
  const catalyst = raw.catalyst ?? {};
  return {
    id: str(raw.id) || newId(),
    name: str(raw.name),
    rarity: oneOf(raw.rarity, RARITY_COLORS, 'epic'),
    itemLevel: itemLevel(raw.itemLevel),
    binding: oneOf(raw.binding, BINDINGS, ''),
    slot: str(raw.slot),
    type: str(raw.type),
    stats: str(raw.stats),
    flavor: str(raw.flavor),
    icon: str(raw.icon).trim(),
    inSet: raw.inSet !== false,
    equipped: raw.equipped !== false,
    origin: {
      type: oneOf(origin.type, ORIGIN_TYPES, 'drop'),
      baseName: str(origin.baseName),
      details: str(origin.details),
    },
    catalyst: {
      type: oneOf(catalyst.type, CATALYST_TYPES, 'none'),
      professions: str(catalyst.professions),
      details: str(catalyst.details),
      reagents: list(catalyst.reagents).map(r => ({ name: str(r?.name), quantity: count(r?.quantity), icon: str(r?.icon).trim() })),
    },
  };
}

export function normalize(raw) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.items)) throw new NotAPlaystyleError();
  const items = raw.items.filter(i => i && typeof i === 'object').map(normalizeItem);
  const seen = new Set();
  for (const item of items) {
    while (seen.has(item.id)) item.id = newId();
    seen.add(item.id);
  }
  const set = raw.set ?? {};
  return {
    version: 2,
    name: str(raw.name),
    description: str(raw.description),
    set: {
      name: str(set.name),
      bonuses: list(set.bonuses).map(b => ({ pieces: count(b?.pieces), text: str(b?.text) })),
    },
    items: items.length ? items : [blankItem()],
  };
}

// Version 1 is the format of the original Next.js app: every item carried its own copy of the set.
const BONUS_PREFIX = /^\s*\((\d+)\)\s*(?:set\s*:)?\s*/i;
const V1_ORIGIN = { Drop: 'drop', Quest: 'quest', Crafting: 'crafted' };
const pieceName = p => (typeof p === 'string' ? p : str(p?.name));

function fromV1(old) {
  const items = old.items.filter(i => i && typeof i === 'object');
  const setItem = items.find(i => str(i.itemSet?.name).trim());
  const pieceNames = list(setItem?.itemSet?.pieces).map(pieceName);
  const pieceCount = pieceNames.length || items.length;
  const bonuses = list(setItem?.setBonuses ?? items.find(i => list(i.setBonuses).length)?.setBonuses).map(b => {
    const text = str(b?.text);
    const prefix = text.match(BONUS_PREFIX);
    return prefix ? { pieces: Number(prefix[1]), text: text.slice(prefix[0].length) } : { pieces: pieceCount, text };
  });
  const inSet = item => (!setItem ? false : pieceNames.length ? pieceNames.includes(item.name) : Boolean(item.itemSet));

  return {
    version: 2,
    name: old.playstyleName,
    description: old.description,
    set: { name: setItem ? setItem.itemSet.name : '', bonuses: setItem ? bonuses : [] },
    items: items.map(i => ({
      name: i.name,
      rarity: str(i.rarity).toLowerCase(),
      itemLevel: i.itemLevel,
      binding: '',
      slot: i.type,
      type: '',
      stats: i.stats,
      flavor: i.description,
      icon: i.iconName,
      inSet: inSet(i),
      equipped: true,
      origin: { type: V1_ORIGIN[i.origin?.type] ?? 'drop', baseName: i.baseItemName, details: i.origin?.details },
      catalyst: {
        type: str(i.catalyst?.type).toLowerCase(),
        professions: i.catalyst?.profession,
        details: i.catalyst?.details,
        reagents: list(i.catalyst?.reagents).map(r => ({ name: r?.name, quantity: r?.quantity, icon: r?.iconName })),
      },
    })),
  };
}

export function migrate(raw) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.items)) throw new NotAPlaystyleError();
  return normalize(raw.version === 2 ? raw : fromV1(raw));
}

export function parsePlaystyle(text) {
  let raw;
  try { raw = JSON.parse(text); } catch { throw new NotAPlaystyleError(); }
  return migrate(raw);
}

export const serialize = p => `${JSON.stringify(p, null, 2)}\n`;
