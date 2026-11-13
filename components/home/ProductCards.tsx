"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePoll } from "@/lib/usePoll";
import type { Candle, Ticker } from "@/lib/markets";
import { PriceChart } from "@/components/trade/PriceChart";
import { fmtPct, fmtPrice } from "@/lib/format";

const IconLayers = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round" /></svg>
);
const IconCandles = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3v4M6 17v4M12 6v3M12 19v2M18 2v5M18 15v4" stroke="currentColor" strokeWidth="1.4" /><rect x="4" y="7" width="4" height="10" stroke="currentColor" strokeWidth="1.4" fill="none" /><rect x="10" y="9" width="4" height="10" fill="currentColor" /><rect x="16" y="7" width="4" height="8" stroke="currentColor" strokeWidth="1.4" fill="none" /></svg>
);
const IconInfinity = () => (
  <svg width="26" height="22" viewBox="0 0 28 24" aria-hidden="true"><path d="M8 7c-3 0-5 2.3-5 5s2 5 5 5c4.5 0 7.5-10 12-10 3 0 5 2.3 5 5s-2 5-5 5c-4.5 0-7.5-10-12-10z" stroke="currentColor" strokeWidth="1.8" fill="none" /></svg>
);

function CardShell({ icon, title, headline, desc, href, cta, children }: {
  icon: React.ReactNode; title: string; headline: string; desc: string; href: string; cta: string; children: React.ReactNode;
}) {
  return (
    <article className="metal-card grid min-w-0 gap-4 px-5 py-4 text-platinum [grid-template-columns:minmax(0,1.12fr)_minmax(0,1fr)] max-[1180px]:[grid-template-columns:minmax(0,1fr)]">
      <div className="flex flex-col">
        <div className="flex items-center gap-3 text-silver"><span className="text-offwhite">{icon}</span><span className="font-wide text-[13.5px] font-semibold tracking-[0.04em] text-offwhite">{title}</span></div>
        <h3 className="m-0 mt-3 text-[16.5px] font-semibold tracking-[-0.01em] text-offwhite">{headline}</h3>
        <p className="mb-0 mt-2 text-[12.5px] leading-[19px] text-mist">{desc}</p>
        <div className="mt-auto pt-3"><Link href={href} className="btn btn-metal-sm btn-xs !h-9 !px-4">{cta} <span className="arr" aria-hidden="true">↗</span></Link></div>
      </div>
      <div className="metal-inset tilt min-w-0 p-3">{children}</div>
    </article>
  );
}

function LaunchMini() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [supply, setSupply] = useState("1,000,000");
  return (
    <form className="flex h-full flex-col gap-1.5" onSubmit={(e) => {
      e.preventDefault();
      const q = new URLSearchParams();
      if (name) q.set("name", name);
      if (symbol) q.set("symbol", symbol);
      q.set("supply", supply.replace(/[^0-9]/g, ""));
      router.push(`/launchpad?${q}`);
    }}>
      <div className="text-[13px] font-medium text-offwhite">Create Token</div>
      <label><span className="sr-only">Token name</span><input className="mini-field" placeholder="Token Name" value={name} maxLength={32} onChange={(e) => setName(e.target.value)} /></label>
      <label><span className="sr-only">Token symbol</span><input className="mini-field num" placeholder="Token Symbol" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10))} /></label>
      <label className="flex items-center justify-between gap-2 border-b border-[#262a30] pb-2 text-[12px] text-mist">
        <span className="whitespace-nowrap">Total Supply</span>
        <input className="num w-20 min-w-0 border-0 bg-transparent text-right text-[12px] text-platinum focus:outline-none" inputMode="numeric" value={supply}
          onChange={(e) => { const d = e.target.value.replace(/[^0-9]/g, ""); setSupply(d ? Number(d).toLocaleString("en-US") : ""); }} aria-label="Total supply" />
      </label>
      <button type="submit" className="btn btn-metal-sm btn-xs mt-auto !h-9 w-full !justify-center">Launch Token</button>
    </form>
  );
}

function DexMiniCard() {
  const [tab, setTab] = useState<"Swap" | "Trade" | "Pool">("Trade");
  const candles = usePoll<Candle[]>("/api/candles?market=SOL-USD&g=3600", 60_000);
  const tickers = usePoll<Ticker[]>("/api/markets", 15_000);
  const t = tickers.data?.find((x) => x.id === "SOL-USD");
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[12px] font-semibold text-offwhite"><span className="dot dot-live" />SOL / USD</span>
        <span className={`num text-[11px] ${t?.change == null ? "text-muted" : t.change >= 0 ? "text-up" : "text-down"}`}>{fmtPct(t?.change)}</span>
      </div>
      <div className="num text-[13px] text-offwhite">{fmtPrice(t?.last)}</div>
      <div className="min-h-[64px] flex-1"><PriceChart candles={candles.data?.slice(-36) ?? null} loading={candles.loading} error={candles.error} height={64} compact candleMode /></div>
      <div className="grid grid-cols-3 gap-1" role="tablist" aria-label="DEX mode">
        {(["Swap", "Trade", "Pool"] as const).map((x) => (
          <button key={x} role="tab" aria-selected={tab === x} onClick={() => setTab(x)}
            className={`h-8 rounded border text-[11px] transition-colors ${tab === x ? "border-silver bg-[#262a30] text-white" : "border-[#2e3339] text-mist hover:text-white"}`}>{x}</button>
        ))}
      </div>
      <Link href={tab === "Pool" ? "/dex" : "/dex?market=SOL-USD"} className="label text-center text-muted no-underline hover:text-white">Open {tab.toLowerCase()} →</Link>
    </div>
  );
}

function PerpMiniCard() {
  const router = useRouter();
  const [size, setSize] = useState("1,000");
  const [lev, setLev] = useState(20);
  const candles = usePoll<Candle[]>("/api/candles?market=BTC-USD&g=3600", 60_000);
  const tickers = usePoll<Ticker[]>("/api/markets", 15_000);
  const t = tickers.data?.find((x) => x.id === "BTC-USD");
  const go = () => router.push("/perpetuals?market=BTC-USD");
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 whitespace-nowrap text-[12px] font-semibold text-offwhite"><span className="dot dot-live" />BTC-PERP</span>
        <span className="whitespace-nowrap rounded-sm bg-[#1f3a2e] px-1.5 py-0.5 text-[10px] font-medium text-[#a9e4c4]">Long {lev}×</span>
      </div>
      <div className="num text-[13px] text-offwhite">{fmtPrice(t?.last)}</div>
      <PriceChart candles={candles.data?.slice(-48) ?? null} loading={candles.loading} error={candles.error} height={34} compact />
      <label className="flex items-center justify-between gap-2 text-[12px] text-mist">
        <span className="whitespace-nowrap">Size (USD)</span>
        <input className="mini-field num !h-7 !w-24 text-right" inputMode="numeric" value={size}
          onChange={(e) => { const d = e.target.value.replace(/[^0-9]/g, ""); setSize(d ? Number(d).toLocaleString("en-US") : ""); }} />
      </label>
      <label className="flex items-center justify-between gap-2 text-[12px] text-mist">
        <span>Leverage</span>
        <select className="mini-field !h-7 !w-24 text-right" value={lev} onChange={(e) => setLev(Number(e.target.value))}>
          {[1, 2, 3, 5, 10, 20].map((x) => <option key={x} value={x}>{x}×</option>)}
        </select>
      </label>
      <div className="mt-auto grid grid-cols-2 gap-1.5">
        <button className="btn btn-long btn-xs !h-8 !justify-center" onClick={go}>Long</button>
        <button className="btn btn-short btn-xs !h-8 !justify-center" onClick={go}>Short</button>
      </div>
    </div>
  );
}

export function ProductCards() {
  return (
    <div className="grid gap-5 [grid-template-columns:repeat(3,minmax(0,1fr))] max-[1020px]:[grid-template-columns:minmax(0,1fr)]">
      <CardShell icon={<IconLayers />} title="LAUNCHPAD" headline="From Idea to Market." href="/launchpad" cta="Explore Launchpad"
        desc="Create and launch SPL tokens through a streamlined experience for creators and on-chain communities.">
        <LaunchMini />
      </CardShell>
      <CardShell icon={<IconCandles />} title="DEX" headline="Markets in Motion." href="/dex" cta="Explore DEX"
        desc="Discover and trade digital assets through a decentralized exchange built for clarity and efficiency.">
        <DexMiniCard />
      </CardShell>
      <CardShell icon={<IconInfinity />} title="PERPETUALS" headline="Trade Beyond Spot." href="/perpetuals" cta="Explore Perpetuals"
        desc="Access perpetual markets with advanced position and risk management workflows.">
        <PerpMiniCard />
      </CardShell>
    </div>
  );
}
