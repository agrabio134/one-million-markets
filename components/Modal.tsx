"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { IconClose } from "./Icons";

export function Modal({ open, onClose, title, label, children, width = 440 }: {
  open: boolean; onClose: () => void; title: string; label?: string; children: ReactNode; width?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const node = ref.current;
    node?.querySelector<HTMLElement>("button, a, input, select, textarea")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && node) {
        const f = Array.from(node.querySelectorAll<HTMLElement>("button:not(:disabled), a[href], input, select, textarea"));
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; prev?.focus?.(); };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="overlay scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="modal-title"
        className="w-full rounded-md border border-rule-2 bg-graphite shadow-[0_24px_64px_rgba(0,0,0,.5)]" style={{ maxWidth: width }}>
        <div className="flex items-center justify-between border-b border-[#262a30] px-5 py-4">
          <span className="label text-muted">{label ?? "One Million Markets"}</span>
          <button className="btn btn-line btn-icon !h-9 !w-9" aria-label="Close" onClick={onClose}><IconClose s={12} /></button>
        </div>
        <div className="px-6 pb-6 pt-7">
          <h2 id="modal-title" className="m-0 font-display text-[28px] font-bold tracking-[-0.03em] text-offwhite">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  );
}
