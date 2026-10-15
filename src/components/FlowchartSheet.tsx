"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { ItemTooltip } from "@/components/ItemTooltip";
import { wowIconUrl, type Catalyst, type Origin, type Playstyle } from "@/lib/item";

export function FlowchartSheet({ playstyle }: { playstyle: Playstyle }) {
  const title = playstyle.playstyleName.trim() || "Untitled Playstyle";
  const description = playstyle.description?.trim() ?? "";

  return (
    <section
      className="inline-flex w-max flex-col gap-10 p-16"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 70% 42% at 12% 0%, rgba(255, 179, 71, 0.14), transparent 52%), radial-gradient(ellipse 60% 40% at 88% 0%, rgba(92, 225, 230, 0.12), transparent 50%), linear-gradient(180deg, #17140f 0%, #0b0d12 46%, #07080c 100%)",
      }}
    >
      <header>
        <p className="text-[12px] font-semibold uppercase tracking-[0.42em] text-[#5ce1e6]">
          Playstyle flow
        </p>
        <h2 className="mt-2 font-display text-5xl font-bold tracking-wide text-[#f3e6b8]">
          {title}
        </h2>
        {description ? (
          <p className="mt-4 max-w-3xl text-[17px] font-medium leading-relaxed text-white/65">
            {description}
          </p>
        ) : null}
        <div className="mt-4 h-px w-48 bg-gradient-to-r from-[#c9a227] to-transparent" />
      </header>

      <div className="flex flex-col gap-12">
        {playstyle.items.map((item, index) => {
          const origin = item.origin ?? { type: "Drop" as const, details: "" };
          const catalyst = item.catalyst ?? { type: "None" as const, details: "", reagents: [] };
          const showCatalyst = catalyst.type !== "None";

          return (
            <div key={`${item.name}-${index}`} className="flex flex-row items-center gap-6">
              <OriginNode baseItemName={item.baseItemName?.trim() ?? ""} origin={origin} />
              <ArrowRight className="h-7 w-7 shrink-0 text-[#c9a227]" aria-hidden />
              {showCatalyst ? (
                <>
                  <CatalystNode catalyst={catalyst} />
                  <ArrowRight
                    className="h-7 w-7 shrink-0"
                    style={{ color: catalyst.type === "Quest" ? "#ffd100" : "#ffb347" }}
                    aria-hidden
                  />
                </>
              ) : null}
              <ItemTooltip item={item} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function OriginNode({ baseItemName, origin }: { baseItemName: string; origin: Origin }) {
  const details = origin.details.trim();
  const typeColor = origin.type === "Quest" ? "#ffd100" : "#00ccff";

  return (
    <div className="flex w-64 shrink-0 flex-col gap-3 border border-white/15 bg-[#1a1c22] px-5 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/40">
        Origin
      </p>
      <p className="break-words font-display text-xl leading-tight text-[#e7e1d4]">
        {baseItemName || "Unnamed base"}
      </p>
      <div className="mt-1 border-t border-white/10 pt-3">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.28em]"
          style={{ color: typeColor }}
        >
          {origin.type}
        </p>
        {details ? (
          <p className="mt-1 break-words text-[13px] font-medium leading-snug text-white/55">
            {details}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function CatalystNode({ catalyst }: { catalyst: Catalyst }) {
  if (catalyst.type === "Quest") {
    const details = catalyst.details.trim();
    return (
      <div
        className="flex w-72 shrink-0 flex-col gap-3 border bg-[#101418] px-5 py-4"
        style={{ borderColor: "#ffd10059" }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#ffd100]">
          Quest
        </p>
        {details ? (
          <p className="break-words text-sm font-medium leading-snug text-[#e7e1d4]">{details}</p>
        ) : null}
      </div>
    );
  }

  const profession = catalyst.profession?.trim() ?? "";
  const details = catalyst.details.trim();
  const reagents = catalyst.reagents ?? [];

  return (
    <div className="flex w-[26rem] shrink-0 flex-col gap-3 border border-[#ffb347]/45 bg-[#14110e] px-5 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#ffb347]/80">
        Catalyst
      </p>
      {profession ? (
        <span className="inline-flex w-fit border border-[#ffb347]/55 bg-[#ffb347]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ffb347]">
          {profession}
        </span>
      ) : null}
      {details ? (
        <p className="break-words text-[13px] font-medium leading-snug text-[#f3e6b8]">{details}</p>
      ) : null}
      {reagents.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {reagents.map((reagent, index) => (
            <div
              key={`${reagent.name}-${index}`}
              className="inline-flex max-w-full items-center gap-2 border border-white/10 bg-black/45 py-1 pl-1 pr-2.5"
            >
              <LiveIcon iconName={reagent.iconName} size={28} />
              <span className="shrink-0 text-[12px] font-semibold text-[#ffb347]">
                x{reagent.quantity}
              </span>
              <span className="truncate text-[13px] font-medium text-[#e7e1d4]">
                {reagent.name.trim() || "Unnamed reagent"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[13px] font-medium text-white/40 italic">No reagents specified.</p>
      )}
    </div>
  );
}

function LiveIcon({ iconName, size }: { iconName: string; size: number }) {
  const url = wowIconUrl(iconName);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [url]);

  if (!url || failed) {
    return (
      <span
        className="shrink-0 border border-dashed border-white/30 bg-[#12141a]"
        style={{ width: size, height: size }}
        aria-hidden
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      width={size}
      height={size}
      crossOrigin="anonymous"
      draggable={false}
      className="shrink-0 border border-white/10 object-cover"
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
    />
  );
}
