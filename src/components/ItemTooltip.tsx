"use client";

import { useEffect, useState } from "react";
import { Gem } from "lucide-react";
import {
  parseStats,
  readSetPieces,
  RARITIES,
  SET_BONUS_ACTIVE,
  SET_BONUS_INACTIVE,
  wowIconUrl,
  type ItemData,
} from "@/lib/item";

export function ItemTooltip({ item }: { item: ItemData }) {
  const rarity = RARITIES[item.rarity];
  const stats = parseStats(item.stats);
  const iconUrl = wowIconUrl(item.iconName);
  const [iconFailed, setIconFailed] = useState(false);

  useEffect(() => {
    setIconFailed(false);
  }, [iconUrl]);

  const name = item.name.trim() || "Unnamed Item";
  const type = item.type.trim() || "Miscellaneous";
  const description = item.description.trim();
  const setBonuses = (item.setBonuses ?? []).filter((bonus) => bonus.text.trim());
  const itemSet = item.itemSet;
  const setPieces = readSetPieces(itemSet?.pieces);
  const equippedPieces = setPieces.filter((piece) => piece.isActive).length;
  const showSetHeader = Boolean(itemSet && (itemSet.name.trim() || setPieces.length > 0));
  const origin = item.origin ?? { type: "Drop" as const, details: "" };
  const catalyst = item.catalyst ?? { type: "None" as const, details: "", reagents: [] };
  const originDetails = origin.details.trim();
  const originColor = origin.type === "Quest" ? "#ffd100" : "#00ccff";
  const showOrigin = Boolean(originDetails);
  const catalystDetails = catalyst.details.trim();
  const profession = catalyst.profession?.trim() ?? "";
  const reagents = (catalyst.reagents ?? []).filter(
    (reagent) => reagent.name.trim() || reagent.quantity > 0,
  );
  const reagentLine = reagents
    .map((reagent) => `${reagent.quantity}× ${reagent.name.trim() || "Reagent"}`)
    .join(" · ");
  const showCatalystQuest = catalyst.type === "Quest";
  const showCatalystCraft = catalyst.type === "Crafting" && Boolean(profession || catalystDetails || reagentLine);
  const showProgress = showOrigin || showCatalystQuest || showCatalystCraft;
  const showDivider =
    stats.length > 0 || description.length > 0 || showSetHeader || setBonuses.length > 0;

  return (
    <article
      className="relative w-[28rem]"
      style={{
        boxShadow: `0 0 18px ${rarity.glow}, 0 14px 32px rgba(0, 0, 0, 0.5)`,
        transition: "box-shadow 200ms ease",
      }}
    >
      <Corner position="tl" />
      <Corner position="tr" />
      <Corner position="bl" />
      <Corner position="br" />

      <div className="bg-black/90 p-[3px]">
        <div className="p-px" style={{ backgroundColor: rarity.color }}>
          <div className="tooltip-plate border border-[#5a4520]/80 px-4 py-3.5">
            <div className="flex gap-3.5">
              <IconSlot
                url={iconFailed ? null : iconUrl}
                color={rarity.color}
                glow={rarity.glow}
                onFail={() => setIconFailed(true)}
              />
              <div className="min-w-0 flex-1 pt-0.5">
                <h3
                  className="break-words font-display text-[22px] font-bold leading-tight tracking-wide"
                  style={{
                    color: rarity.color,
                    textShadow: `0 2px 2px rgba(0,0,0,0.9), 0 0 14px ${rarity.glow}`,
                  }}
                >
                  {name}
                </h3>
                <p className="mt-1 text-[15px] font-semibold text-[#ffd100]">
                  Item Level {item.itemLevel.toLocaleString("en-US")}
                </p>
                <p className="text-[15px] text-white">{type}</p>
              </div>
            </div>

            {showDivider ? (
              <div className="mt-3 h-px bg-gradient-to-r from-transparent via-[#8d7040] to-transparent" />
            ) : null}

            {stats.length > 0 ? (
              <ul className="mt-2.5 space-y-0.5 text-[15px] font-semibold leading-snug text-[#1eff00]">
                {stats.map((stat, index) => (
                  <li key={`${stat}-${index}`} className="break-words">
                    {stat}
                  </li>
                ))}
              </ul>
            ) : null}

            {description ? (
              <p className="mt-3 break-words text-[14px] font-medium italic leading-snug text-[#ffd100]">
                {description}
              </p>
            ) : null}

            {showSetHeader && itemSet ? (
              <div className="mt-3">
                <p className="break-words text-[15px] font-semibold leading-snug text-[#ffd100]">
                  {itemSet.name} ({equippedPieces}/{setPieces.length})
                </p>
                {setPieces.length > 0 ? (
                  <ul className="mt-0.5 list-none space-y-0.5 text-[15px] font-semibold leading-snug">
                    {setPieces.map((piece, index) => (
                      <li
                        key={`${piece.name}-${index}`}
                        className="list-none break-words"
                        style={{
                          color: piece.isActive ? SET_BONUS_ACTIVE : SET_BONUS_INACTIVE,
                        }}
                      >
                        {piece.name}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            {setBonuses.length > 0 ? (
              <ul
                className={`${showSetHeader ? "mt-1" : "mt-3"} space-y-0.5 text-[15px] font-semibold leading-snug`}
              >
                {setBonuses.map((bonus, index) => (
                  <li
                    key={`${bonus.text}-${index}`}
                    className="break-words"
                    style={{ color: bonus.isActive ? SET_BONUS_ACTIVE : SET_BONUS_INACTIVE }}
                  >
                    {bonus.text}
                  </li>
                ))}
              </ul>
            ) : null}

            {showProgress ? (
              <div className="mt-3 h-px bg-gradient-to-r from-transparent via-[#3a5a66] to-transparent" />
            ) : null}

            {showOrigin ? (
              <p
                className="mt-3 break-words text-[14px] font-semibold leading-snug"
                style={{ color: originColor }}
              >
                {origin.type}: {originDetails}
              </p>
            ) : null}

            {showCatalystQuest ? (
              <p
                className={`${showOrigin ? "mt-1" : "mt-3"} break-words text-[14px] font-semibold leading-snug text-[#ffd100]`}
              >
                Quest{catalystDetails ? `: ${catalystDetails}` : ""}
              </p>
            ) : null}

            {showCatalystCraft ? (
              <div
                className={`${showOrigin ? "mt-1" : "mt-3"} space-y-1 text-[14px] font-semibold leading-snug text-[#ffb347]`}
              >
                {profession ? <p className="break-words">{profession}</p> : null}
                {catalystDetails ? <p className="break-words">{catalystDetails}</p> : null}
                {reagentLine ? <p className="break-words">{reagentLine}</p> : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function IconSlot({
  url,
  color,
  glow,
  onFail,
}: {
  url: string | null;
  color: string;
  glow: string;
  onFail: () => void;
}) {
  return (
    <div
      className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden border bg-black"
      style={{ borderColor: color, boxShadow: `inset 0 0 14px ${glow}` }}
    >
      {url ? (
        // Same-origin proxy keeps html-to-image from tainting the export canvas.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          width={56}
          height={56}
          crossOrigin="anonymous"
          draggable={false}
          className="h-full w-full object-cover"
          onError={onFail}
        />
      ) : (
        <Gem className="h-7 w-7" style={{ color }} strokeWidth={1.5} aria-hidden />
      )}
      <span className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,220,150,0.28)]" />
    </div>
  );
}

function Corner({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const classes = {
    tl: "left-0 top-0 border-l-2 border-t-2",
    tr: "right-0 top-0 border-r-2 border-t-2",
    bl: "bottom-0 left-0 border-b-2 border-l-2",
    br: "bottom-0 right-0 border-b-2 border-r-2",
  }[position];

  return (
    <span
      className={`pointer-events-none absolute z-10 h-3.5 w-3.5 border-[#e4c36a] ${classes}`}
    />
  );
}
