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
