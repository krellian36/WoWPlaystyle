"use client";

import { useEffect, useRef } from "react";

type ResetConfirmModalProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ResetConfirmModal({ open, onCancel, onConfirm }: ResetConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-[2px]"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-title"
        aria-describedby="reset-copy"
        className="relative w-full max-w-md border border-[#c9a227]/40 bg-[#090b10] px-6 py-6 shadow-[0_24px_70px_rgba(0,0,0,0.55)]"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="pointer-events-none absolute left-0 top-0 h-3.5 w-3.5 border-l-2 border-t-2 border-[#5ce1e6]" />
        <span className="pointer-events-none absolute right-0 top-0 h-3.5 w-3.5 border-r-2 border-t-2 border-[#5ce1e6]" />
        <span className="pointer-events-none absolute bottom-0 left-0 h-3.5 w-3.5 border-b-2 border-l-2 border-[#c9a227]" />
        <span className="pointer-events-none absolute bottom-0 right-0 h-3.5 w-3.5 border-b-2 border-r-2 border-[#c9a227]" />

        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#5ce1e6]/80">
          Confirm
        </p>
        <h2
          id="reset-title"
          className="mt-1 font-display text-2xl tracking-wide text-[#f3e6b8]"
        >
          Reset playstyle
        </h2>
        <p id="reset-copy" className="mt-4 text-[15px] leading-relaxed text-white/70">
          Are you sure you want to reset? Unsaved changes will be lost. Consider exporting
          your JSON or PNGs first.
        </p>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center border border-white/15 px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/70 transition hover:border-white/30 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center border border-[#ff8f8f]/50 bg-[#ff8f8f]/10 px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#ff8f8f] transition hover:bg-[#ff8f8f]/20"
          >
            Confirm Reset
          </button>
        </div>
      </div>
    </div>
  );
}
