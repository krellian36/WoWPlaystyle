export const RARITIES = {
  Common: { color: "#ffffff", glow: "rgba(255, 255, 255, 0.28)" },
  Uncommon: { color: "#1eff00", glow: "rgba(30, 255, 0, 0.38)" },
  Rare: { color: "#0070dd", glow: "rgba(0, 112, 221, 0.5)" },
  Epic: { color: "#a335ee", glow: "rgba(163, 53, 238, 0.55)" },
  Legendary: { color: "#ff8000", glow: "rgba(255, 128, 0, 0.55)" },
} as const;

export type Rarity = keyof typeof RARITIES;

export const RARITY_LIST = Object.keys(RARITIES) as Rarity[];

export type SetBonus = {
  text: string;
  isActive: boolean;
};

export type SetPiece = {
  name: string;
  isActive: boolean;
};

export type ItemSet = {
  name: string;
  pieces: SetPiece[];
};

export const SET_BONUS_ACTIVE = "#1eff00";
export const SET_BONUS_INACTIVE = "#808080";

export type Reagent = {
  name: string;
  quantity: number;
  iconName: string;
};

export const ORIGIN_TYPES = ["Drop", "Quest", "Crafting"] as const;
export type OriginType = (typeof ORIGIN_TYPES)[number];
export type Origin = { type: OriginType; details: string };

export const CATALYST_TYPES = ["None", "Quest", "Crafting"] as const;
export type CatalystType = (typeof CATALYST_TYPES)[number];
export type Catalyst = {
  type: CatalystType;
  details: string;
  profession?: string;
  reagents: Reagent[];
};

export type ItemData = {
  name: string;
  rarity: Rarity;
  itemLevel: number;
  type: string;
  stats: string;
  description: string;
  iconName: string;
  setBonuses: SetBonus[];
  itemSet?: ItemSet;
  baseItemName: string;
  origin: Origin;
  catalyst: Catalyst;
};

export type Playstyle = {
  playstyleName: string;
  description: string;
  items: ItemData[];
};

export const defaultItem: ItemData = {
  name: "Nightfall, Edge of Dusk",
  rarity: "Legendary",
  itemLevel: 639,
  type: "Two-Hand Sword",
  stats: "+184 Strength\n+276 Stamina\n+142 Critical Strike\n+98 Haste",
  description: "The blade remembers every sunset it has ended.",
  iconName: "inv_sword_39",
  setBonuses: [
    { text: "(2) Set: Your attacks shatter the ground.", isActive: true },
    { text: "(4) Set: Colossal Blows increase your Strength.", isActive: false },
  ],
  itemSet: {
    name: "Scales of the Awakened",
    pieces: [
      { name: "Hauberk of the Awakened", isActive: false },
      { name: "Gauntlets of the Awakened", isActive: false },
      { name: "Crown of the Awakened", isActive: false },
      { name: "Legguards of the Awakened", isActive: false },
      { name: "Talons of the Awakened", isActive: false },
    ],
  },
  baseItemName: "Fractured Sun-Lens",
  origin: {
    type: "Drop",
    details: "Drops from the final boss of a mid-tier dungeon.",
  },
  catalyst: {
    type: "Crafting",
    details: "Polish the fractured lens, then infuse it with dusk.",
    profession: "Master Jewelcrafter",
    reagents: [
      { name: "Sun-Lens Fragment", quantity: 4, iconName: "inv_misc_gem_pearl_06" },
      { name: "Enchanted Dust", quantity: 2, iconName: "inv_misc_dust_01" },
    ],
  },
};

export const defaultPlaystyle: Playstyle = {
  playstyleName: "Warrior - Lodestone Colossus",
  description:
    "Break the colossus with dusk-forged steel, then hold the breach behind a wall of living stone.",
  items: [
    defaultItem,
    {
      name: "Lodestone Bulwark",
      rarity: "Epic",
      itemLevel: 639,
      type: "Shield",
      stats: "+92 Strength\n+310 Stamina\n+71 Versatility",
      description: "The stone still answers the mountain.",
      iconName: "inv_shield_06",
      setBonuses: [
        { text: "(2) Set: Your attacks shatter the ground.", isActive: true },
        { text: "(4) Set: Colossal Blows increase your Strength.", isActive: false },
      ],
      baseItemName: "Raw Lodestone",
      origin: {
        type: "Drop",
        details: "Drops from the Lodestone Colossus at the end of the scenario.",
      },
      catalyst: {
        type: "None",
        details: "",
        reagents: [],
      },
    },
  ],
};

export function createBlankItem(): ItemData {
  return {
    name: "New Item",
    rarity: "Epic",
    itemLevel: 639,
    type: "",
    stats: "",
    description: "",
    iconName: "",
    setBonuses: [],
    baseItemName: "",
    origin: {
      type: "Drop",
      details: "",
    },
    catalyst: {
      type: "None",
      details: "",
      reagents: [],
    },
  };
}

export function createBlankPlaystyle(): Playstyle {
  return {
    playstyleName: "",
    description: "",
    items: [createBlankItem()],
  };
}

type SaveFilePickerWindow = Window & {
  showSaveFilePicker?: (options: {
    suggestedName?: string;
    types?: Array<{
      description?: string;
      accept: Record<string, string[]>;
    }>;
  }) => Promise<{
    createWritable: () => Promise<{
      write: (data: string) => Promise<void>;
      close: () => Promise<void>;
    }>;
  }>;
};

export function isPlaystyleSaveAbort(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: unknown }).name === "AbortError"
  );
}

export async function exportPlaystyleJson(playstyle: Playstyle): Promise<void> {
  const filename = toPlaystyleDataFilename(playstyle.playstyleName);
  const json = JSON.stringify(playstyle, null, 2);
  const picker = (window as SaveFilePickerWindow).showSaveFilePicker;

  if (typeof picker === "function") {
    try {
      const handle = await picker({
        suggestedName: filename,
        types: [
          {
            description: "WoWPlaystyle playstyle",
            accept: { "application/json": [".json"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(json);
      await writable.close();
      return;
    } catch (error) {
      if (isPlaystyleSaveAbort(error)) throw error;
      downloadPlaystyleJson(json, filename);
    }
  }

  downloadPlaystyleJson(json, filename);
}

function downloadPlaystyleJson(json: string, filename: string) {
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function parsePlaystyleJson(jsonString: string): Playstyle {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error("That file is not valid JSON.");
  }

  if (!isRecord(parsed) || !Array.isArray(parsed.items)) {
    throw new Error("That file is not a playstyle.");
  }

  const items = parsed.items.flatMap((entry) => {
    const item = parseItem(entry);
    return item ? [item] : [];
  });

  return {
    playstyleName: asString(parsed.playstyleName),
    description: asString(parsed.description),
    items: items.length > 0 ? items : [createBlankItem()],
  };
}

const ICON_NAME = /^[a-z0-9_-]+$/i;

/** Proxied Wowhead icon: /proxy/wow-icon/{iconName} → zamimg large jpg */
export function wowIconUrl(iconName: string): string | null {
  const name = iconName.trim().replace(/\.jpe?g$/i, "");
  if (!ICON_NAME.test(name)) return null;
  return `/proxy/wow-icon/${name}`;
}

export function parseStats(stats: string): string[] {
  return stats
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function slugPart(value: string, fallback: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

export function toExportFilename(playstyleName: string, itemName: string): string {
  return `${slugPart(playstyleName, "playstyle")}-${slugPart(itemName, "item")}.png`;
}

export function toPlaystyleFilename(playstyleName: string): string {
  return `${slugPart(playstyleName, "playstyle")}-complete.png`;
}

export function toPlaystyleDataFilename(playstyleName: string): string {
  return `${slugPart(playstyleName, "playstyle")}-data.json`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asRarity(value: unknown): Rarity {
  return typeof value === "string" && value in RARITIES ? (value as Rarity) : "Epic";
}

function asItemLevel(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return 639;
  return Math.max(0, Math.round(parsed));
}

function asOriginType(value: unknown): OriginType {
  return ORIGIN_TYPES.find((type) => type === value) ?? "Drop";
}

function asCatalystType(value: unknown): CatalystType {
  return CATALYST_TYPES.find((type) => type === value) ?? "None";
}

function parseSetBonuses(value: unknown): SetBonus[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!isRecord(entry)) return [];
    return [{ text: asString(entry.text), isActive: entry.isActive === true }];
  });
}

function parseReagents(value: unknown): Reagent[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!isRecord(entry)) return [];
    const quantity = typeof entry.quantity === "number" ? entry.quantity : Number(entry.quantity);
    return [
      {
        name: asString(entry.name),
        quantity: Number.isFinite(quantity) ? Math.max(0, Math.round(quantity)) : 1,
        iconName: asString(entry.iconName),
      },
    ];
  });
}

function parseOrigin(value: unknown): Origin {
  if (!isRecord(value)) return { type: "Drop", details: "" };
  return {
    type: asOriginType(value.type),
    details: asString(value.details),
  };
}

function parseCatalyst(value: unknown): Catalyst {
  if (!isRecord(value)) return { type: "None", details: "", reagents: [] };
  const profession = typeof value.profession === "string" ? value.profession : undefined;
  return {
    type: asCatalystType(value.type),
    details: asString(value.details),
    ...(profession !== undefined ? { profession } : {}),
    reagents: parseReagents(value.reagents),
  };
}

function migrateAcquisition(value: Record<string, unknown>): { origin: Origin; catalyst: Catalyst } {
  const acquisition = isRecord(value.acquisition) ? value.acquisition : null;
  if (!acquisition) {
    return {
      origin: { type: "Drop", details: asString(value.source) },
      catalyst: { type: "None", details: "", reagents: [] },
    };
  }

  const reagents = parseReagents(acquisition.reagents);
  const profession = typeof acquisition.profession === "string" ? acquisition.profession : undefined;
  const hasCraft = Boolean(profession?.trim()) || reagents.length > 0;

  return {
    origin: {
      type: asOriginType(acquisition.type),
      details: asString(acquisition.details) || asString(value.source),
    },
    catalyst: hasCraft
      ? {
          type: "Crafting",
          details: "",
          ...(profession !== undefined ? { profession } : {}),
          reagents,
        }
      : { type: "None", details: "", reagents: [] },
  };
}

function parseProgression(value: Record<string, unknown>): { origin: Origin; catalyst: Catalyst } {
  if (isRecord(value.origin) || isRecord(value.catalyst)) {
    return {
      origin: parseOrigin(value.origin),
      catalyst: parseCatalyst(value.catalyst),
    };
  }
  return migrateAcquisition(value);
}

export function readSetPieces(pieces: unknown): SetPiece[] {
  if (!Array.isArray(pieces)) return [];
  return pieces.flatMap((piece) => {
    if (typeof piece === "string") return [{ name: piece, isActive: false }];
    if (!isRecord(piece)) return [];
    const name = asString(piece.name) || asString(piece.text);
    return [{ name, isActive: piece.isActive === true }];
  });
}

function parseItemSetField(value: unknown): { itemSet?: ItemSet } {
  if (!isRecord(value)) return {};
  return {
    itemSet: {
      name: asString(value.name),
      pieces: readSetPieces(value.pieces),
    },
  };
}

function parseItem(value: unknown): ItemData | null {
  if (!isRecord(value)) return null;
  return {
    name: asString(value.name),
    rarity: asRarity(value.rarity),
    itemLevel: asItemLevel(value.itemLevel),
    type: asString(value.type),
    stats: asString(value.stats),
    description: asString(value.description),
    iconName: asString(value.iconName),
    setBonuses: parseSetBonuses(value.setBonuses),
    ...parseItemSetField(value.itemSet),
    baseItemName: asString(value.baseItemName),
    ...parseProgression(value),
  };
}
