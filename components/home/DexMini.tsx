"use client";
import Link from "next/link";
import { useState } from "react";
import { usePoll } from "@/lib/usePoll";
import type { Candle, Ticker } from "@/lib/markets";
import { PriceChart } from "@/components/trade/PriceChart";
import { fmtPct, fmtPrice } from "@/lib/format";

export function DexMini() {
  const candles = usePoll<Candle[]>("/api/candles?market=SOL-USD&g=3600", 60_000);
  const tickers = usePoll<Ticker[]>("/api/markets", 15_000);
  const t = tickers.data?.find((x) => x.id === "SOL-USD");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  return (
    <div className="rounded border border-rule-2 bg-well">
      <div className="flex items-center justify-between border-b border-[#262a30] px-4 py-3.5">
        <div className="flex items-baseline gap-3">
          <span className="text-[14px] font-semibold">SOL / USD</span>
          <span className="num text-[14px]">{fmtPrice(t?.last)}</span>
          <span className={`num text-[12px] ${t?.change == null ? "text-muted" : t.change >= 0 ? "text-up" : "text-down"}`}>{fmtPct(t?.change)}</span>
        </div>
        <span className="label flex items-center gap-2 text-muted"><span className="dot dot-live" />Reference</span>
      </div>
      <div className="grid [grid-template-columns:minmax(0,1fr)_200px] max-[640px]:[grid-template-columns:minmax(0,1fr)]">
        <div className="border-r border-[#262a30]"><PriceChart candles={candles.data} loading={candles.loading} error={candles.error} height={180} compact /></div>
        <div className="flex flex-col gap-2.5 p-3.5">
          <div className="seg">
            <button className="seg-btn" data-on={side === "buy" ? "buy" : undefined} onClick={() => setSide("buy")}>Buy</button>
            <button className="seg-btn" data-on={side === "sell" ? "sell" : undefined} onClick={() => setSide("sell")}>Sell</button>
          </div>
          <div className="flex justify-between text-[12px] text-muted"><span>Reference</span><span className="num text-platinum">{fmtPrice(t?.last)}</span></div>
          <Link href="/dex?market=SOL-USD" className="btn btn-line btn-xs mt-auto">Open terminal <span className="arr" aria-hidden="true">→</span></Link>
        </div>
      </div>
    </div>
  );
}
