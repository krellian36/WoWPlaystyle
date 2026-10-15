import type { ReactNode } from "react";

type FrameProps = {
  eyebrow: string;
  title: string;
  aside?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

export function Frame({ eyebrow, title, aside, children, footer }: FrameProps) {
  return (
    <section className="relative flex flex-col border border-[#c9a227]/30 bg-[#090b10]/88 shadow-[0_24px_70px_rgba(0,0,0,0.35)] lg:h-full lg:overflow-hidden">
      <span className="pointer-events-none absolute left-0 top-0 h-3.5 w-3.5 border-l-2 border-t-2 border-[#5ce1e6]" />
      <span className="pointer-events-none absolute right-0 top-0 h-3.5 w-3.5 border-r-2 border-t-2 border-[#5ce1e6]" />
      <span className="pointer-events-none absolute bottom-0 left-0 h-3.5 w-3.5 border-b-2 border-l-2 border-[#c9a227]" />
      <span className="pointer-events-none absolute bottom-0 right-0 h-3.5 w-3.5 border-b-2 border-r-2 border-[#c9a227]" />

      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-5 py-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#5ce1e6]/80">
            {eyebrow}
          </p>
          <h2 className="font-display text-xl tracking-wide text-[#f3e6b8]">{title}</h2>
        </div>
        {aside}
      </header>

      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      {footer}
    </section>
  );
}
