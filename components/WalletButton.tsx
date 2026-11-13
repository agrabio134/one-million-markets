"use client";
import { useEffect, useRef, useState } from "react";
import { useWallet } from "@/lib/wallet";
import { shortAddr } from "@/lib/format";

export function WalletButton({ className = "" }: { className?: string }) {
  const w = useWallet();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close); document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [open]);

  if (w.status !== "connected" || !w.address) {
    return (
      <button className={`btn btn-metal btn-sm !h-11 ${className}`} onClick={w.openPicker} disabled={w.status === "connecting"}>
        {w.status === "connecting" ? "Connecting…" : "Connect wallet"}
      </button>
    );
  }
  return (
    <div className={`relative ${className}`} ref={ref}>
      <button className="btn btn-line btn-sm w-full" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="flex items-center gap-2"><span className="dot dot-live" />{shortAddr(w.address)}</span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded border border-rule-2 bg-graphite p-2 shadow-[0_12px_32px_rgba(0,0,0,.45)]">
          <div className="px-3 py-2">
            <div className="label text-muted">Connected</div>
            <div className="num mt-1 break-all text-[12px] text-platinum">{w.address}</div>
            <div className="label mt-3 text-muted">Wallet</div>
            <div className="mt-1 text-[13px]">{w.walletName} · Solana</div>
          </div>
          <button role="menuitem" className="row-btn mt-1 rounded px-3 py-2.5 text-[13px]"
            onClick={() => { navigator.clipboard?.writeText(w.address!).catch(() => {}); setOpen(false); }}>Copy address</button>
          <button role="menuitem" className="row-btn rounded px-3 py-2.5 text-[13px] text-down" onClick={() => { w.disconnect(); setOpen(false); }}>Disconnect</button>
        </div>
      )}
    </div>
  );
}
