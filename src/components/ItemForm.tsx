"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import {
  CATALYST_TYPES,
  ORIGIN_TYPES,
  RARITIES,
  RARITY_LIST,
  readSetPieces,
  SET_BONUS_ACTIVE,
  SET_BONUS_INACTIVE,
  wowIconUrl,
  type Catalyst,
  type CatalystType,
  type ItemData,
  type ItemSet,
  type Origin,
  type OriginType,
  type Rarity,
  type Reagent,
  type SetBonus,
  type SetPiece,
} from "@/lib/item";

const FIELD_CLASS =
  "w-full border border-white/10 bg-black/50 px-3 py-2.5 text-[15px] text-[#f4efe4] outline-none transition placeholder:text-white/25 focus:border-[#5ce1e6]/70 focus:ring-1 focus:ring-[#5ce1e6]/40";

type ItemFormProps = {
  item: ItemData;
  onChange: (patch: Partial<ItemData>) => void;
  onDelete: () => void;
  canDelete: boolean;
};

const EMPTY_ORIGIN: Origin = { type: "Drop", details: "" };
const EMPTY_CATALYST: Catalyst = { type: "None", details: "", reagents: [] };

export function ItemForm({ item, onChange, onDelete, canDelete }: ItemFormProps) {
  const setBonuses = item.setBonuses ?? [];
  const itemSet = item.itemSet ?? { name: "", pieces: [] };
  const setPieces = readSetPieces(itemSet.pieces);
  const origin = item.origin ?? EMPTY_ORIGIN;
  const catalyst = item.catalyst ?? EMPTY_CATALYST;
  const reagents = catalyst.reagents ?? [];

  function updateOrigin(patch: Partial<Origin>) {
    onChange({ origin: { ...origin, ...patch } });
  }

  function updateCatalyst(patch: Partial<Catalyst>) {
    onChange({ catalyst: { ...catalyst, reagents, ...patch } });
  }

  function updateReagent(index: number, patch: Partial<Reagent>) {
    updateCatalyst({
      reagents: reagents.map((reagent, reagentIndex) =>
        reagentIndex === index ? { ...reagent, ...patch } : reagent,
      ),
    });
  }

  function updateItemSet(patch: Partial<ItemSet>) {
    onChange({
      itemSet: {
        name: itemSet.name,
        pieces: setPieces,
        ...patch,
      },
    });
  }

  function updatePiece(index: number, patch: Partial<SetPiece>) {
    updateItemSet({
      pieces: setPieces.map((piece, pieceIndex) =>
        pieceIndex === index ? { ...piece, ...patch } : piece,
      ),
    });
  }

  function updateBonus(index: number, patch: Partial<SetBonus>) {
    onChange({
      setBonuses: setBonuses.map((bonus, bonusIndex) =>
        bonusIndex === index ? { ...bonus, ...patch } : bonus,
      ),
    });
  }

  return (
    <div className="space-y-3">
      <SectionLabel>Identity</SectionLabel>

      <Field label="Name">
        <input
          id="item-name"
          className={FIELD_CLASS}
          value={item.name}
          autoComplete="off"
          spellCheck={false}
          placeholder="Nightfall, Edge of Dusk"
          onChange={(event) => onChange({ name: event.target.value })}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Rarity">
          <div className="relative">
            <select
              id="item-rarity"
              className={`${FIELD_CLASS} appearance-none pr-10`}
              value={item.rarity}
              onChange={(event) => onChange({ rarity: event.target.value as Rarity })}
            >
              {RARITY_LIST.map((rarity) => (
                <option key={rarity} value={rarity}>
                  {rarity}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c9a227]" />
          </div>
          <div className="mt-2 flex gap-1.5" aria-hidden>
            {RARITY_LIST.map((rarity) => (
              <span
                key={rarity}
                title={rarity}
                className={`h-1 flex-1 ${item.rarity === rarity ? "opacity-100" : "opacity-25"}`}
                style={{ backgroundColor: RARITIES[rarity].color }}
              />
            ))}
          </div>
        </Field>

        <Field label="Item Level">
          <input
            id="item-level"
            className={FIELD_CLASS}
            type="number"
            min={0}
            inputMode="numeric"
            value={item.itemLevel}
            onChange={(event) => {
              const value = event.target.value;
              if (value === "") {
                onChange({ itemLevel: 0 });
                return;
              }
              const parsed = Number(value);
              if (Number.isFinite(parsed)) {
                onChange({ itemLevel: Math.max(0, Math.round(parsed)) });
              }
            }}
          />
        </Field>
      </div>

      <Field label="Type" hint="Slot or weapon">
        <input
          id="item-type"
          className={FIELD_CLASS}
          value={item.type}
          autoComplete="off"
          placeholder="Two-Hand Sword"
          onChange={(event) => onChange({ type: event.target.value })}
        />
      </Field>

      <SectionLabel>Appearance</SectionLabel>

      <Field label="Icon Name" hint="Wowhead file">
        <div className="flex items-center gap-3">
          <LiveIcon iconName={item.iconName} />
          <input
            id="item-icon"
            className={`${FIELD_CLASS} min-w-0 flex-1`}
            value={item.iconName}
            list="wow-icon-names"
            autoComplete="off"
            spellCheck={false}
            placeholder="inv_sword_39"
            onChange={(event) => onChange({ iconName: event.target.value })}
          />
        </div>
        <IconSourceLink />
        <datalist id="wow-icon-names">
          <option value="inv_sword_39" />
          <option value="inv_chest_plate16" />
          <option value="inv_helmet_06" />
          <option value="inv_jewelry_ring_36" />
          <option value="inv_misc_gem_pearl_06" />
          <option value="spell_holy_blessingofstrength" />
        </datalist>
        <p className="mt-2 break-all font-mono text-[11px] leading-relaxed text-white/35">
          {wowIconUrl(item.iconName) ?? "Leave this blank to use the generic icon."}
        </p>
      </Field>

      <SectionLabel>Inscription</SectionLabel>

      <Field label="Stats" hint="One per line">
        <textarea
          id="item-stats"
          className={`${FIELD_CLASS} min-h-[104px] resize-y leading-snug`}
          value={item.stats}
          placeholder={"+184 Strength\n+142 Critical Strike"}
          onChange={(event) => onChange({ stats: event.target.value })}
        />
      </Field>

      <Field label="Description" hint="Flavor text">
        <textarea
          id="item-description"
          className={`${FIELD_CLASS} min-h-[64px] resize-y leading-snug`}
          value={item.description}
          placeholder="The blade remembers every sunset it has ended."
          onChange={(event) => onChange({ description: event.target.value })}
        />
      </Field>

      <SectionLabel>Item Set</SectionLabel>

      <Field label="Set Name">
        <input
          id="item-set-name"
          className={FIELD_CLASS}
          value={itemSet.name}
          autoComplete="off"
          spellCheck={false}
          placeholder="Scales of the Awakened"
          onChange={(event) => updateItemSet({ name: event.target.value })}
        />
      </Field>

      <div>
        <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c9a227]">
          Set Pieces
        </span>
        <div className="space-y-2">
          {setPieces.map((piece, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 border border-white/10 bg-black/30 p-2 sm:flex-row sm:items-center"
            >
              <input
                className={`${FIELD_CLASS} min-w-0 sm:flex-1`}
                value={piece.name}
                autoComplete="off"
                spellCheck={false}
                placeholder="Hauberk of the Awakened"
                aria-label={`Set piece ${index + 1}`}
                onChange={(event) => updatePiece(index, { name: event.target.value })}
              />
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <label
                  className="flex shrink-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                  style={{ color: piece.isActive ? SET_BONUS_ACTIVE : SET_BONUS_INACTIVE }}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[#1eff00]"
                    checked={piece.isActive}
                    onChange={(event) => updatePiece(index, { isActive: event.target.checked })}
                  />
                  Active
                </label>
                <button
                  type="button"
                  className="inline-flex h-10 shrink-0 items-center border border-white/10 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50 transition hover:border-[#ff8f8f]/40 hover:text-[#ff8f8f]"
                  onClick={() =>
                    updateItemSet({
                      pieces: setPieces.filter((_, pieceIndex) => pieceIndex !== index),
                    })
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-2 inline-flex items-center gap-2 border border-[#c9a227]/30 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c9a227] transition hover:bg-[#c9a227]/10"
          onClick={() => updateItemSet({ pieces: [...setPieces, { name: "", isActive: true }] })}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Set Piece
        </button>
      </div>

      <SectionLabel>Set Bonuses</SectionLabel>

      <div className="space-y-2">
        {setBonuses.map((bonus, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 border border-white/10 bg-black/30 p-2 sm:flex-row sm:items-center"
          >
            <input
              className={FIELD_CLASS}
              value={bonus.text}
              autoComplete="off"
              spellCheck={false}
              placeholder="(2) Set: Your attacks shatter the ground."
              aria-label={`Set bonus ${index + 1}`}
              onChange={(event) => updateBonus(index, { text: event.target.value })}
            />
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <label
                className="flex shrink-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                style={{ color: bonus.isActive ? SET_BONUS_ACTIVE : SET_BONUS_INACTIVE }}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[#1eff00]"
                  checked={bonus.isActive}
                  onChange={(event) => updateBonus(index, { isActive: event.target.checked })}
                />
                Active
              </label>
              <button
                type="button"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-white/10 text-white/50 transition hover:border-[#ff8f8f]/40 hover:text-[#ff8f8f]"
                aria-label={`Remove set bonus ${index + 1}`}
                onClick={() =>
                  onChange({
                    setBonuses: setBonuses.filter((_, bonusIndex) => bonusIndex !== index),
                  })
                }
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          className="inline-flex items-center gap-2 border border-[#c9a227]/30 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c9a227] transition hover:bg-[#c9a227]/10"
          onClick={() => onChange({ setBonuses: [...setBonuses, { text: "", isActive: true }] })}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Set Bonus
        </button>
      </div>

      <SectionLabel>Origin</SectionLabel>

      <Field label="Base Item">
        <input
          id="item-base"
          className={FIELD_CLASS}
          value={item.baseItemName ?? ""}
          autoComplete="off"
          spellCheck={false}
          placeholder="Fractured Sun-Lens"
          onChange={(event) => onChange({ baseItemName: event.target.value })}
        />
      </Field>

      <Field label="Origin Type">
        <div className="relative">
          <select
            id="item-origin-type"
            className={`${FIELD_CLASS} appearance-none pr-10`}
            value={origin.type}
            onChange={(event) => updateOrigin({ type: event.target.value as OriginType })}
          >
            {ORIGIN_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c9a227]" />
        </div>
      </Field>

      <Field label="Origin Details" hint="Zone, boss, or instruction">
        <textarea
          id="item-origin-details"
          className={`${FIELD_CLASS} min-h-[64px] resize-y leading-snug`}
          value={origin.details}
          placeholder="Drops from the final boss of a mid-tier dungeon."
          onChange={(event) => updateOrigin({ details: event.target.value })}
        />
      </Field>

      <SectionLabel>Catalyst Process</SectionLabel>

      <Field label="Catalyst Type">
        <div className="relative">
          <select
            id="item-catalyst-type"
            className={`${FIELD_CLASS} appearance-none pr-10`}
            value={catalyst.type}
            onChange={(event) => updateCatalyst({ type: event.target.value as CatalystType })}
          >
            {CATALYST_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c9a227]" />
        </div>
      </Field>

      {catalyst.type === "Quest" ? (
        <Field label="Details" hint="Quest instruction">
          <textarea
            id="item-catalyst-details"
            className={`${FIELD_CLASS} min-h-[64px] resize-y leading-snug`}
            value={catalyst.details}
            placeholder="Complete the quest: The Shattered Sun"
            onChange={(event) => updateCatalyst({ details: event.target.value })}
          />
        </Field>
      ) : null}

      {catalyst.type === "Crafting" ? (
        <>
          <Field label="Details" hint="Upgrade or restoration step">
            <textarea
              id="item-catalyst-details"
              className={`${FIELD_CLASS} min-h-[64px] resize-y leading-snug`}
              value={catalyst.details}
              placeholder="Polish the fractured lens, then infuse it with dusk."
              onChange={(event) => updateCatalyst({ details: event.target.value })}
            />
          </Field>

          <Field label="Profession">
            <input
              id="item-profession"
              className={FIELD_CLASS}
              value={catalyst.profession ?? ""}
              autoComplete="off"
              spellCheck={false}
              placeholder="Jewelcrafter"
              onChange={(event) => updateCatalyst({ profession: event.target.value })}
            />
          </Field>

          <div>
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c9a227]">
              Reagents
            </span>
            <div className="space-y-2">
              {reagents.map((reagent, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 border border-white/10 bg-black/30 p-2"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      className={`${FIELD_CLASS} sm:w-20`}
                      type="number"
                      min={0}
                      inputMode="numeric"
                      aria-label={`Reagent ${index + 1} quantity`}
                      value={reagent.quantity}
                      onChange={(event) => {
                        const value = event.target.value;
                        if (value === "") {
                          updateReagent(index, { quantity: 0 });
                          return;
                        }
                        const parsed = Number(value);
                        if (Number.isFinite(parsed)) {
                          updateReagent(index, { quantity: Math.max(0, Math.round(parsed)) });
                        }
                      }}
                    />
                    <input
                      className={`${FIELD_CLASS} min-w-0 sm:flex-1`}
                      aria-label={`Reagent ${index + 1} name`}
                      value={reagent.name}
                      autoComplete="off"
                      spellCheck={false}
                      placeholder="Sun-Lens Fragment"
                      onChange={(event) => updateReagent(index, { name: event.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <LiveIcon iconName={reagent.iconName} />
                    <input
                      className={`${FIELD_CLASS} min-w-0 flex-1`}
                      aria-label={`Reagent ${index + 1} icon`}
                      value={reagent.iconName}
                      autoComplete="off"
                      spellCheck={false}
                      placeholder="inv_misc_gem_pearl_06"
                      onChange={(event) => updateReagent(index, { iconName: event.target.value })}
                    />
                    <button
                      type="button"
                      className="inline-flex h-10 shrink-0 items-center border border-white/10 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50 transition hover:border-[#ff8f8f]/40 hover:text-[#ff8f8f]"
                      onClick={() =>
                        updateCatalyst({
                          reagents: reagents.filter((_, reagentIndex) => reagentIndex !== index),
                        })
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="mt-2 inline-flex items-center gap-2 border border-[#c9a227]/30 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c9a227] transition hover:bg-[#c9a227]/10"
              onClick={() =>
                updateCatalyst({
                  reagents: [...reagents, { name: "", quantity: 1, iconName: "" }],
                })
              }
            >
              <Plus className="h-3.5 w-3.5" />
              Add Reagent
            </button>
          </div>
        </>
      ) : null}

      <button
        type="button"
        onClick={onDelete}
        disabled={!canDelete}
        title={canDelete ? "Remove this item from the playstyle" : "A playstyle keeps at least one item"}
        className="inline-flex w-full items-center justify-center gap-2 border border-[#ff8f8f]/30 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff8f8f] transition hover:bg-[#ff8f8f]/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete Item
      </button>
    </div>
  );
}

function IconSourceLink() {
  return (
    <p className="mt-1.5 text-[11px] leading-relaxed text-white/40">
      <a
        href="https://www.wowhead.com/icons"
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-white/20 underline-offset-2 transition hover:text-[#5ce1e6]"
      >
        Find icons at https://www.wowhead.com/icons
      </a>
    </p>
  );
}

function LiveIcon({ iconName }: { iconName: string }) {
  const url = wowIconUrl(iconName);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [url]);

  if (!url || failed) {
    return (
      <span
        className="h-10 w-10 shrink-0 border border-dashed border-white/30 bg-[#12141a]"
        aria-hidden
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      width={40}
      height={40}
      crossOrigin="anonymous"
      draggable={false}
      className="h-10 w-10 shrink-0 border border-white/15 object-cover"
      onError={() => setFailed(true)}
    />
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/35">
        {children}
      </span>
      <span className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c9a227]">
          {label}
        </span>
        {hint ? (
          <span className="text-[11px] tracking-wide text-white/35">{hint}</span>
        ) : null}
      </span>
      {children}
    </label>
  );
}
