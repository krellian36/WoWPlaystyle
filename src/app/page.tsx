"use client";

import { useEffect, useRef, useState, type ChangeEvent, type RefObject } from "react";
import { Clapperboard, Download, Files, FolderOpen, Plus, RotateCcw, Save, Swords } from "lucide-react";
import { FlowchartSheet } from "@/components/FlowchartSheet";
import { Frame } from "@/components/Frame";
import { ItemForm } from "@/components/ItemForm";
import { ItemTooltip } from "@/components/ItemTooltip";
import { ResetConfirmModal } from "@/components/ResetConfirmModal";
import {
  createBlankItem,
  createBlankPlaystyle,
  defaultPlaystyle,
  exportPlaystyleJson,
  isPlaystyleSaveAbort,
  parsePlaystyleJson,
  RARITIES,
  toExportFilename,
  toPlaystyleDataFilename,
  toPlaystyleFilename,
  type ItemData,
  type Playstyle,
} from "@/lib/item";

const PLAYSTYLE_STORAGE_KEY = "wowbuilder_active_playstyle";
const STORAGE_DEBOUNCE_MS = 300;

const EXPORT_PIXEL_RATIO = 6;

const EXPORT_BUTTON_CLASS =
  "inline-flex items-center justify-center gap-2 border border-[#5ce1e6]/40 bg-[#5ce1e6]/10 px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#5ce1e6] transition hover:bg-[#5ce1e6]/20 disabled:cursor-wait disabled:opacity-50";

export default function HomePage() {
  const [playstyle, setPlaystyle] = useState<Playstyle>(defaultPlaystyle);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [batchPreview, setBatchPreview] = useState<{ id: string; item: ItemData } | null>(
    null,
  );
  const [exportMode, setExportMode] = useState<"item" | "batch" | "sheet" | null>(null);
  const [status, setStatus] = useState<{ kind: "info" | "error"; text: string } | null>(
    null,
  );
  const [resetOpen, setResetOpen] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!storageReady) return;
    const handle = window.setTimeout(() => {
      try {
        localStorage.setItem(PLAYSTYLE_STORAGE_KEY, JSON.stringify(playstyle));
      } catch {
        setStatus({ kind: "error", text: "Could not save this playstyle in the browser." });
      }
    }, STORAGE_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [playstyle, storageReady]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PLAYSTYLE_STORAGE_KEY);
      if (stored) {
        setPlaystyle(parsePlaystyleJson(stored));
        setSelectedItemIndex(0);
      }
    } catch {
      setStatus({ kind: "error", text: "Saved playstyle could not be restored." });
    } finally {
      setStorageReady(true);
    }
  }, []);

  const selectedItem =
    playstyle.items[Math.min(selectedItemIndex, playstyle.items.length - 1)] ??
    playstyle.items[0];
  const previewItem = batchPreview?.item ?? selectedItem;
  const previewId =
    batchPreview?.id ?? `selected:${selectedItemIndex}:${selectedItem.name}`;
  const rarity = RARITIES[previewItem.rarity];
  const exporting = exportMode !== null;

  async function handleSaveJson() {
    try {
      await exportPlaystyleJson(playstyle);
      setStatus({
        kind: "info",
        text: `Saved ${toPlaystyleDataFilename(playstyle.playstyleName)}`,
      });
    } catch (error) {
      if (isPlaystyleSaveAbort(error)) return;
      const message = error instanceof Error ? error.message : "Could not save that file.";
      setStatus({ kind: "error", text: message });
    }
  }

  function handleLoadClick() {
    fileRef.current?.click();
  }

  function handleLoadFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const loaded = parsePlaystyleJson(String(reader.result ?? ""));
        setPlaystyle(loaded);
        setSelectedItemIndex(0);
        setBatchPreview(null);
        setStatus({ kind: "info", text: `Loaded ${file.name}` });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Could not load that file.";
        setStatus({ kind: "error", text: message });
      }
    };
    reader.onerror = () => {
      setStatus({ kind: "error", text: "Could not read that file." });
    };
    reader.readAsText(file);
  }

  function confirmReset() {
    setPlaystyle(createBlankPlaystyle());
    setSelectedItemIndex(0);
    setBatchPreview(null);
    setResetOpen(false);
    setStatus({ kind: "info", text: "Playstyle reset" });
  }

  function updatePlaystyleName(playstyleName: string) {
    setPlaystyle((current) => ({ ...current, playstyleName }));
  }

  function updatePlaystyleDescription(description: string) {
    setPlaystyle((current) => ({ ...current, description }));
  }

  function updateItem(patch: Partial<ItemData>) {
    setPlaystyle((current) => ({
      ...current,
      items: current.items.map((item, index) =>
        index === selectedItemIndex ? { ...item, ...patch } : item,
      ),
    }));
  }

  function addItem() {
    const nextIndex = playstyle.items.length;
    setPlaystyle((current) => ({
      ...current,
      items: [...current.items, createBlankItem()],
    }));
    setSelectedItemIndex(nextIndex);
  }

  function deleteSelectedItem() {
    if (playstyle.items.length <= 1) return;
    const removeAt = selectedItemIndex;
    setPlaystyle((current) => ({
      ...current,
      items: current.items.filter((_, index) => index !== removeAt),
    }));
    setSelectedItemIndex((index) => Math.min(index, playstyle.items.length - 2));
  }

  async function handleExportCurrent() {
    if (exporting) return;
    setExportMode("item");
    setStatus(null);

    try {
      const filename = toExportFilename(playstyle.playstyleName, selectedItem.name);
      const dataUrl = await capturePreview(previewId);
      const info = await readPngInfo(dataUrl);
      await saveImageFile(dataUrl, filename);
      const alpha = info.transparent ? " · transparent" : "";
      setStatus({
        kind: "info",
        text: `Saved ${filename} · ${info.width}×${info.height}${alpha}`,
      });
    } catch (error) {
      if (isPlaystyleSaveAbort(error)) return;
      const message = error instanceof Error ? error.message : "Export failed";
      setStatus({ kind: "error", text: message });
    } finally {
      setExportMode(null);
    }
  }

  async function handleExportPlaystyle() {
    if (exporting) return;
    const snapshot = playstyle.items.map(cloneItem);
    const playstyleName = playstyle.playstyleName;
    setExportMode("batch");
    setStatus(null);
    const saved: string[] = [];

    try {
      for (let index = 0; index < snapshot.length; index += 1) {
        const item = snapshot[index];
        const id = `batch:${index}`;
        setStatus({
          kind: "info",
          text: `Rendering ${index + 1} of ${snapshot.length}`,
        });
        setBatchPreview({ id, item });
        const dataUrl = await capturePreview(id);
        const filename = toExportFilename(playstyleName, item.name);
        await saveImageFile(dataUrl, filename);
        saved.push(filename);
      }

      const listed = saved.length <= 2 ? saved.join(" · ") : `${saved.length} files`;
      setStatus({ kind: "info", text: `Saved ${listed}` });
    } catch (error) {
      if (isPlaystyleSaveAbort(error)) {
        setStatus(null);
        return;
      }
      const message = error instanceof Error ? error.message : "Export failed";
      setStatus({ kind: "error", text: message });
    } finally {
      setBatchPreview(null);
      setExportMode(null);
    }
  }

  async function handleExportSheet() {
    if (exporting) return;
    const playstyleName = playstyle.playstyleName;
    setExportMode("sheet");
    setStatus(null);

    try {
      await document.fonts.ready;
      const node = await waitForImages(sheetRef);
      const dataUrl = await toPngWithWatermark(node);
      const filename = toPlaystyleFilename(playstyleName);
      const info = await readPngInfo(dataUrl);
      await saveImageFile(dataUrl, filename);
      setStatus({
        kind: "info",
        text: `Saved ${filename} · ${info.width}×${info.height}`,
      });
    } catch (error) {
      if (isPlaystyleSaveAbort(error)) return;
      const message = error instanceof Error ? error.message : "Export failed";
      setStatus({ kind: "error", text: message });
    } finally {
      setExportMode(null);
    }
  }

  async function capturePreview(id: string) {
    await document.fonts.ready;
    const node = await waitForPreview(captureRef, id);
    return toPngWithWatermark(node);
  }

  return (
    <>
    <main className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-4 py-4 sm:px-6 lg:h-screen lg:overflow-hidden lg:px-8">
      <header className="mb-4 flex shrink-0 flex-wrap items-end justify-between gap-4 border-b border-[#c9a227]/20 pb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center border border-[#5ce1e6]/50 bg-[#5ce1e6]/10 text-[#5ce1e6]">
              <Swords className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#5ce1e6]">
                Relic compositor
              </p>
              <h1 className="font-display text-2xl tracking-wide text-[#f3e6b8] sm:text-3xl">
                WoWPlaystyle
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSaveJson}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 border border-[#c9a227]/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#c9a227] transition hover:bg-[#c9a227]/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Save className="h-3.5 w-3.5" aria-hidden />
              Save JSON
            </button>
            <button
              type="button"
              onClick={handleLoadClick}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 border border-[#5ce1e6]/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5ce1e6] transition hover:bg-[#5ce1e6]/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FolderOpen className="h-3.5 w-3.5" aria-hidden />
              Load JSON
            </button>
            <button
              type="button"
              onClick={() => setResetOpen(true)}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 border border-[#ff8f8f]/45 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#ff8f8f] transition hover:bg-[#ff8f8f]/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              Reset
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              className="hidden"
              aria-hidden
              tabIndex={-1}
              onChange={handleLoadFile}
            />
          </div>
        </div>
        <p className="text-sm leading-snug text-white/45 sm:text-right">
          Item Foundry
          <span className="mt-1 block text-[11px] uppercase tracking-[0.22em] text-[#c9a227]/80">
            Playstyles · set bonuses · transparent export
          </span>
        </p>
      </header>

      <div className="grid flex-1 gap-5 lg:min-h-0 lg:grid-cols-2">
        <Frame eyebrow="Channel 01" title="Schematic" aside={<ChannelTag>Data</ChannelTag>}>
          <fieldset
            disabled={exporting}
            className="m-0 flex min-h-0 w-full min-w-0 flex-1 flex-col border-0 p-0 disabled:opacity-60"
            style={{ minInlineSize: 0 }}
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <div className="mb-4 space-y-3">
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c9a227]">
                    Playstyle Name
                  </span>
                  <input
                    id="playstyle-name"
                    className="w-full border border-white/10 bg-black/50 px-3 py-2.5 text-[15px] text-[#f4efe4] outline-none transition placeholder:text-white/25 focus:border-[#5ce1e6]/70 focus:ring-1 focus:ring-[#5ce1e6]/40"
                    value={playstyle.playstyleName}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="Warrior - Lodestone Colossus"
                    onChange={(event) => updatePlaystyleName(event.target.value)}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c9a227]">
                    Playstyle Description
                  </span>
                  <textarea
                    id="playstyle-description"
                    className="min-h-[72px] w-full resize-y border border-white/10 bg-black/50 px-3 py-2.5 text-[15px] leading-snug text-[#f4efe4] outline-none transition placeholder:text-white/25 focus:border-[#5ce1e6]/70 focus:ring-1 focus:ring-[#5ce1e6]/40"
                    value={playstyle.description ?? ""}
                    placeholder="How this playstyle fights, and why these relics belong together."
                    onChange={(event) => updatePlaystyleDescription(event.target.value)}
                  />
                </label>

                <div className="flex flex-wrap items-center gap-2 pb-1">
                  {playstyle.items.map((item, index) => {
                    const selected = index === selectedItemIndex;
                    const label = item.name.trim() || `Item ${index + 1}`;
                    return (
                      <button
                        key={index}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setSelectedItemIndex(index)}
                        className={`inline-flex max-w-[12rem] shrink-0 items-center gap-2 border px-3 py-2 text-left text-[13px] font-semibold tracking-wide transition ${
                          selected
                            ? "border-[#5ce1e6]/70 bg-[#5ce1e6]/10 text-[#f3e6b8]"
                            : "border-white/10 bg-black/30 text-white/50 hover:border-white/25 hover:text-white/80"
                        }`}
                      >
                        <span
                          className="h-1.5 w-1.5 shrink-0"
                          style={{ backgroundColor: RARITIES[item.rarity].color }}
                        />
                        <span className="truncate">{label}</span>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex shrink-0 items-center gap-1.5 border border-[#c9a227]/40 px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#c9a227] transition hover:bg-[#c9a227]/10"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add New Item
                  </button>
                </div>
              </div>

              <ItemForm
                item={selectedItem}
                onChange={updateItem}
                onDelete={deleteSelectedItem}
                canDelete={playstyle.items.length > 1}
              />
            </div>
          </fieldset>
        </Frame>

        <Frame
          eyebrow="Channel 02"
          title="Live Preview"
          aside={
            <span className="mt-1 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1eff00]">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[#1eff00]" />
              {exportMode === "batch" ? "Batch" : exportMode === "sheet" ? "Slide" : "Synced"}
            </span>
          }
          footer={
            <div className="relative z-10 flex shrink-0 flex-col items-center gap-2 border-t border-white/10 bg-[#090b10] px-5 py-4">
              <div className="flex w-full flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCurrent}
                  disabled={exporting}
                  aria-busy={exportMode === "item"}
                  className={EXPORT_BUTTON_CLASS}
                >
                  <Download className="h-4 w-4" aria-hidden />
                  {exportMode === "item" ? "Rendering" : "Export Current Item"}
                </button>
                <button
                  type="button"
                  onClick={handleExportPlaystyle}
                  disabled={exporting}
                  aria-busy={exportMode === "batch"}
                  className={EXPORT_BUTTON_CLASS}
                >
                  <Files className="h-4 w-4" aria-hidden />
                  {exportMode === "batch" ? "Rendering" : "Export Playstyle (Batch)"}
                </button>
                <button
                  type="button"
                  onClick={handleExportSheet}
                  disabled={exporting}
                  aria-busy={exportMode === "sheet"}
                  className={EXPORT_BUTTON_CLASS}
                >
                  <Clapperboard className="h-4 w-4" aria-hidden />
                  {exportMode === "sheet" ? "Rendering" : "Export All-in-One"}
                </button>
              </div>
              <p
                aria-live="polite"
                className={`text-center text-[11px] tracking-wide ${
                  status?.kind === "error" ? "text-[#ff8f8f]" : "text-white/40"
                }`}
              >
                {status?.text ??
                  `${EXPORT_PIXEL_RATIO}× upscale · alpha background · 4K-ready`}
              </p>
            </div>
          }
        >
          <div className="relative flex min-h-0 flex-1 flex-col overflow-auto p-6">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(circle at center, ${rarity.glow}, transparent 58%)`,
              }}
            />
            <div
              id="item-tooltip-capture"
              ref={captureRef}
              data-preview-id={previewId}
              className="relative m-auto inline-block shrink-0 bg-transparent p-14"
            >
              <ItemTooltip item={previewItem} />
            </div>
          </div>
        </Frame>
      </div>
    </main>
    <ResetConfirmModal
      open={resetOpen}
      onCancel={() => setResetOpen(false)}
      onConfirm={confirmReset}
    />
    <div aria-hidden className="pointer-events-none fixed left-[-10000px] top-0">
      <div id="playstyle-sheet" ref={sheetRef} className="inline-block">
        <FlowchartSheet playstyle={playstyle} />
      </div>
    </div>
    </>
  );
}

function ChannelTag({ children }: { children: string }) {
  return (
    <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
      {children}
    </span>
  );
}

function cloneItem(item: ItemData): ItemData {
  const origin = item.origin ?? { type: "Drop" as const, details: "" };
  const catalyst = item.catalyst ?? { type: "None" as const, details: "", reagents: [] };
  return {
    ...item,
    setBonuses: (item.setBonuses ?? []).map((bonus) => ({ ...bonus })),
    itemSet: item.itemSet
      ? {
          name: item.itemSet.name,
          pieces: (item.itemSet.pieces ?? []).map((piece) =>
            typeof piece === "string" ? { name: piece, isActive: false } : { ...piece },
          ),
        }
      : undefined,
    origin: { ...origin },
    catalyst: {
      ...catalyst,
      reagents: (catalyst.reagents ?? []).map((reagent) => ({ ...reagent })),
    },
  };
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

async function saveImageFile(dataUrl: string, filename: string) {
  const picker = (
    window as Window & {
      showSaveFilePicker?: (options: {
        suggestedName?: string;
        types?: Array<{ description?: string; accept: Record<string, string[]> }>;
      }) => Promise<{
        createWritable: () => Promise<{
          write: (data: Blob) => Promise<void>;
          close: () => Promise<void>;
        }>;
      }>;
    }
  ).showSaveFilePicker;
  if (typeof picker === "function") {
    try {
      const handle = await picker({
        suggestedName: filename,
        types: [{ description: "PNG Image", accept: { "image/png": [".png"] } }],
      });
      const writable = await handle.createWritable();
      const blob = await (await fetch(dataUrl)).blob();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (error) {
      if (isPlaystyleSaveAbort(error)) throw error;
    }
  }
  downloadDataUrl(dataUrl, filename);
}

async function readPngInfo(dataUrl: string) {
  const image = new Image();
  image.src = dataUrl;
  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
      transparent: false,
    };
  }

  context.drawImage(image, 0, 0);
  const pixel = context.getImageData(0, 0, 1, 1).data;
  return {
    width: image.naturalWidth,
    height: image.naturalHeight,
    transparent: pixel[3] === 0,
  };
}

const EXPORT_WATERMARK = "Built with WoWPlaystyle by krellian36";

function createExportWatermark() {
  const mark = document.createElement("p");
  mark.dataset.exportWatermark = "true";
  mark.textContent = EXPORT_WATERMARK;
  mark.style.position = "absolute";
  mark.style.right = "18px";
  mark.style.bottom = "14px";
  mark.style.margin = "0";
  mark.style.zIndex = "20";
  mark.style.pointerEvents = "none";
  mark.style.fontSize = "12px";
  mark.style.fontWeight = "600";
  mark.style.letterSpacing = "0.04em";
  mark.style.whiteSpace = "nowrap";
  mark.style.color = "rgba(243, 230, 184, 0.62)";
  mark.style.textShadow = "0 1px 2px rgba(0, 0, 0, 0.7)";
  return mark;
}

async function toPngWithWatermark(node: HTMLElement) {
  const { toPng } = await import("html-to-image");
  const options = { pixelRatio: EXPORT_PIXEL_RATIO, cacheBust: true };
  const hidden = node.getBoundingClientRect().right <= 0;

  if (hidden) {
    const mark = createExportWatermark();
    const previousPosition = node.style.position;
    if (getComputedStyle(node).position === "static") node.style.position = "relative";
    node.appendChild(mark);
    try {
      return await toPng(node, options);
    } finally {
      mark.remove();
      node.style.position = previousPosition;
    }
  }

  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.position = "fixed";
  host.style.left = "-10000px";
  host.style.top = "0";
  host.style.pointerEvents = "none";
  const clone = node.cloneNode(true) as HTMLElement;
  clone.removeAttribute("id");
  clone.querySelectorAll("[data-export-watermark]").forEach((watermark) => watermark.remove());
  if (getComputedStyle(clone).position === "static") clone.style.position = "relative";
  clone.appendChild(createExportWatermark());
  host.appendChild(clone);
  document.body.appendChild(host);
  try {
    await Promise.all(
      Array.from(clone.querySelectorAll("img")).map((image) =>
        image.complete ? Promise.resolve() : image.decode().catch(() => undefined),
      ),
    );
    await delay(60);
    return await toPng(clone, options);
  } finally {
    host.remove();
  }
}

function nextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

async function waitForPreview(
  ref: RefObject<HTMLDivElement>,
  previewId: string,
) {
  const start = performance.now();

  while (performance.now() - start < 8000) {
    const node = ref.current;
    if (node?.dataset.previewId === previewId) {
      const images = Array.from(node.querySelectorAll("img"));
      if (images.every((image) => image.complete)) {
        await delay(60);
        const settled = ref.current;
        const pending = settled
          ? Array.from(settled.querySelectorAll("img")).some((image) => !image.complete)
          : true;
        if (settled?.dataset.previewId === previewId && !pending) {
          return settled;
        }
      }
    }
    await nextFrame();
  }

  throw new Error("Timed out while rendering an item");
}

async function waitForImages(ref: RefObject<HTMLDivElement>) {
  const start = performance.now();

  while (performance.now() - start < 8000) {
    const node = ref.current;
    if (node) {
      const images = Array.from(node.querySelectorAll("img"));
      if (images.every((image) => image.complete)) {
        await delay(60);
        const settled = ref.current;
        const pending = settled
          ? Array.from(settled.querySelectorAll("img")).some((image) => !image.complete)
          : true;
        if (settled && !pending) return settled;
      }
    }
    await nextFrame();
  }

  throw new Error("Timed out while rendering the playstyle");
}

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}
