"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { usePoll } from "@/lib/usePoll";
import { GRANULARITIES, marketById, MARKETS, FEED_NAME, type Book, type Candle, type Ticker } from "@/lib/markets";
import { fmt, fmtCompact, fmtPct, fmtPrice, parseNum } from "@/lib/format";
import { adapters } from "@/lib/execution";
import { useWallet } from "@/lib/wallet";
import { PriceChart } from "./PriceChart";
import { OrderBook, estimateFill } from "./OrderBook";
import { Modal } from "../Modal";

export type Mode = "spot" | "perp";
const LEVERAGE = [1, 2, 3, 5, 10, 20];

export function useTickers() {
  return usePoll<Ticker[]>("/api/markets", 10_000);
}

export function Terminal({ mode, initialMarket, embedded = false, onModeChange }: {
  mode: Mode; initialMarket?: string; embedded?: boolean; onModeChange?: (m: Mode) => void;
}) {
  const [marketId, setMarketId] = useState(marketById(initialMarket).id);
  const [g, setG] = useState<number>(3600);
  const [query, setQuery] = useState("");
  const m = marketById(marketId);
  const tickers = useTickers();
  const candles = usePoll<Candle[]>(`/api/candles?market=${marketId}&g=${g}`, 30_000);
  const book = usePoll<Book>(`/api/book?market=${marketId}`, 4_000);
  const t = tickers.data?.find((x) => x.id === marketId) ?? null;
  const last = book.data?.bids[0] && book.data?.asks[0] ? (book.data.bids[0].px + book.data.asks[0].px) / 2 : t?.last ?? null;
  const symbol = mode === "perp" ? `${m.base}-PERP` : `${m.base} / ${m.quote}`;

  const list = (tickers.data ?? MARKETS.map((x) => ({ ...x, last: null, change: null } as Ticker)))
    .filter((x) => !query || `${x.base} ${x.name}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="panel overflow-hidden">
      {/* App bar */}
      <div className="flex flex-wrap items-center justify-between gap-6 border-b border-[#262a30] px-5">
        <div role="tablist" aria-label="Product" className="flex gap-6">
          {embedded ? (
            <>
              <button role="tab" aria-selected={mode === "spot"} className="tab" onClick={() => onModeChange?.("spot")}>Spot</button>
              <button role="tab" aria-selected={mode === "perp"} className="tab" onClick={() => onModeChange?.("perp")}>Perpetuals</button>
            </>
          ) : (
            <>
              <Link href="/dex" className="tab" aria-current={mode === "spot" ? "page" : undefined}>Spot</Link>
              <Link href="/perpetuals" className="tab" aria-current={mode === "perp" ? "page" : undefined}>Perpetuals</Link>
            </>
          )}
          <Link href="/launchpad" className="tab sm-hide">Launchpad</Link>
          <Link href="/markets" className="tab sm-hide">Markets</Link>
        </div>
        <label className="sm-hide relative block py-2">
          <span className="sr-only">Search markets</span>
          <input className="field field-sans !h-9 w-60 !text-[13px]" type="search" placeholder="Search markets" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </div>
      <div className="label flex items-center gap-3 border-b border-[#262a30] bg-well px-5 py-2 text-mist">
        <span className={`dot ${tickers.error ? "!bg-down" : "dot-live"}`} />
        {tickers.error ? "Reference feed unavailable — retrying" : `Reference prices · ${FEED_NAME} · Execution not live`}
      </div>

      <div className="grid [grid-template-columns:minmax(0,3fr)_minmax(0,6fr)_minmax(0,3fr)] max-[1100px]:[grid-template-columns:minmax(0,1fr)_minmax(0,1fr)] max-[720px]:[grid-template-columns:minmax(0,1fr)]">
        {/* Markets */}
        <div className="min-w-0 border-r border-[#262a30] max-[720px]:border-b max-[720px]:border-r-0">
          <div className="label grid border-b border-[#262a30] px-4 py-3 text-muted [grid-template-columns:1.3fr_1fr_.8fr]">
            <span>Market</span><span className="text-right">Price</span><span className="text-right">24h</span>
          </div>
          <div className={`${embedded ? "max-h-[420px]" : "max-h-[560px]"} overflow-y-auto`}>
            {list.map((x) => (
              <button key={x.id} aria-pressed={x.id === marketId} onClick={() => setMarketId(x.id)}
                className="row-btn items-center border-b border-[#1e2227] px-4 py-3 text-[13px] [grid-template-columns:1.3fr_1fr_.8fr]">
                <span className="font-medium">{mode === "perp" ? `${x.base}-PERP` : `${x.base} / ${x.quote}`}</span>
                <span className="num text-right">{x.last === null ? <span className="skeleton inline-block h-3 w-14" /> : fmtPrice(x.last)}</span>
                <span className={`num text-right ${x.change === null ? "text-muted" : x.change >= 0 ? "text-up" : "text-down"}`}>{fmtPct(x.change)}</span>
              </button>
            ))}
            {list.length === 0 && <div className="p-5 text-[13px] text-muted">No markets match “{query}”.</div>}
          </div>
          <div className="flex flex-col gap-1.5 p-4">
            <div className="label text-muted">24h volume · reference</div>
            <div className="num text-[13px]">{t?.volume ? `${fmtCompact(t.volume)} ${m.base}` : "—"}</div>
          </div>
        </div>

        {/* Chart + book */}
        <div className="flex min-w-0 flex-col border-r border-[#262a30] max-[1100px]:order-first max-[1100px]:col-span-full max-[1100px]:border-b max-[1100px]:border-r-0">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#262a30] px-5 py-3.5">
            <div className="flex items-baseline gap-3.5">
              <h2 className="m-0 font-display text-[22px] font-bold tracking-[-0.02em]">{symbol}</h2>
              <span className="num text-[20px]" aria-live="polite">{fmtPrice(last)}</span>
              <span className={`num text-[13px] ${t?.change == null ? "text-muted" : t.change >= 0 ? "text-up" : "text-down"}`}>{fmtPct(t?.change)}</span>
            </div>
            <div className="flex gap-1" role="group" aria-label="Interval">
              {GRANULARITIES.map((x) => <button key={x.key} className="pill" aria-pressed={g === x.sec} onClick={() => setG(x.sec)}>{x.label}</button>)}
            </div>
          </div>
          <div className="border-b border-[#262a30]">
            <PriceChart candles={candles.data} loading={candles.loading} error={candles.error} height={embedded ? 300 : 360} />
          </div>
          <div className="grid grid-cols-4 border-b border-[#262a30] max-[720px]:grid-cols-2">
            {[["24h high", t?.high], ["24h low", t?.low], ["24h open", t?.open], ["Mid", last]].map(([k, v]) => (
              <div key={k as string} className="border-r border-[#1e2227] px-4 py-3 last:border-r-0">
                <div className="label text-muted">{k as string}</div><div className="num mt-1 text-[13px]">{fmtPrice(v as number | null)}</div>
              </div>
            ))}
          </div>
          {!embedded && <div className="max-[720px]:hidden"><OrderBook book={book.data} error={book.error} base={m.base} /></div>}
          {embedded && <div className="max-[720px]:hidden"><OrderBook book={book.data} error={book.error} base={m.base} rows={5} /></div>}
        </div>

        {/* Order entry */}
        <OrderPanel mode={mode} base={m.base} quote={m.quote} symbol={symbol} price={last} book={book.data} />
      </div>
    </div>
  );
}

function OrderPanel({ mode, base, quote, symbol, price, book }: {
  mode: Mode; base: string; quote: string; symbol: string; price: number | null; book: Book | null;
}) {
  const wallet = useWallet();
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [sizeStr, setSizeStr] = useState("0.50");
  const [lev, setLev] = useState(5);
  const [mmr, setMmr] = useState("0.5");
  const [review, setReview] = useState(false);
  const isPerp = mode === "perp";
  const size = parseNum(sizeStr);
  const fill = useMemo(() => estimateFill(book, side, size), [book, side, size]);
  const px = fill?.avg ?? price ?? 0;
  const value = size * px;
  const L = isPerp ? lev : 1;
  const m = parseNum(mmr) / 100;
  const margin = value / L;
  const liq = isPerp && px ? (side === "buy" ? px * (1 - 1 / L + m) : px * (1 + 1 / L - m)) : null;
  const liqDist = liq && px ? Math.abs(px - liq) / px * 100 : null;
  const invalid = size <= 0;
  const venueLive = isPerp ? adapters.perpetuals.live : adapters.dex.live;

  return (
    <div className="flex min-w-0 flex-col gap-4 p-5">
      <div className="flex items-center justify-between"><span className="label text-platinum">{isPerp ? "Open position" : "Swap"}</span><span className="label text-muted">Market order</span></div>
      <div className="seg">
        <button className="seg-btn" data-on={side === "buy" ? "buy" : undefined} aria-pressed={side === "buy"} onClick={() => setSide("buy")}>{isPerp ? "Long" : "Buy"}</button>
        <button className="seg-btn" data-on={side === "sell" ? "sell" : undefined} aria-pressed={side === "sell"} onClick={() => setSide("sell")}>{isPerp ? "Short" : "Sell"}</button>
      </div>
      <label className="relative flex flex-col gap-2">
        <span className="label text-muted">Size</span>
        <input className="field !pr-16" inputMode="decimal" value={sizeStr} aria-invalid={invalid}
          onChange={(e) => setSizeStr(e.target.value.replace(/[^0-9.]/g, ""))} />
        <span className="num absolute bottom-[13px] right-3.5 text-[12px] text-muted">{base}</span>
      </label>
      {isPerp && (
        <>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between"><span className="label text-muted">Leverage</span><span className="num text-[12px]">{lev.toFixed(1)}×</span></div>
            <div className="grid grid-cols-6 gap-1" role="group" aria-label="Leverage">
              {LEVERAGE.map((x) => <button key={x} className="pill !min-w-0" aria-pressed={lev === x} onClick={() => setLev(x)}>{x}×</button>)}
            </div>
          </div>
          <label className="relative flex flex-col gap-2">
            <span className="label text-muted">Maintenance margin (assumption)</span>
            <input className="field !pr-10" inputMode="decimal" value={mmr} onChange={(e) => setMmr(e.target.value.replace(/[^0-9.]/g, ""))} />
            <span className="num absolute bottom-[13px] right-3.5 text-[12px] text-muted">%</span>
          </label>
        </>
      )}
      <dl className="m-0 flex flex-col gap-2.5 border-t border-[#262a30] pt-3.5 text-[13px]">
        <Row k={fill ? "Est. avg fill (ref. book)" : "Reference price"} v={fmtPrice(px || null)} />
        {fill && <Row k="Price impact" v={`${fill.impact.toFixed(3)}%${fill.partial ? " · exceeds book depth" : ""}`} />}
        <Row k={isPerp ? "Notional" : "Est. value"} v={`${fmt(value, 2)} ${quote}`} />
        {isPerp && <Row k="Required margin" v={`${fmt(margin, 2)} ${quote}`} />}
        {isPerp && <Row k="Est. liquidation" v={liq && size > 0 ? fmtPrice(liq) : "—"} />}
        <Row k="Fees" v="Set at launch" />
      </dl>
      {isPerp && liqDist !== null && size > 0 && (
        <div>
          <div className="flex justify-between"><span className="label text-muted">Distance to liquidation</span><span className="num text-[12px]">{liqDist.toFixed(2)}%</span></div>
          <div className="mt-2 h-1 bg-[#262a30]"><div className="h-1" style={{ width: `${Math.min(100, liqDist * 2)}%`, background: liqDist < 5 ? "#f0a797" : liqDist < 15 ? "#e6b76a" : "#e7e9ec" }} /></div>
        </div>
      )}
      {wallet.status === "connected" ? (
        <button className="btn btn-silver w-full" disabled={invalid || !price} onClick={() => setReview(true)}>
          Review {isPerp ? (side === "buy" ? "long" : "short") : side} <span className="arr" aria-hidden="true">→</span>
        </button>
      ) : (
        <button className="btn btn-silver w-full" onClick={wallet.openPicker}>Connect wallet <span className="arr" aria-hidden="true">→</span></button>
      )}
      <p className="m-0 text-[12px] leading-[18px] text-muted">Estimates use reference market data. Orders cannot be submitted until One Million Markets {isPerp ? "Perpetuals" : "DEX"} contracts are live.</p>

      <Modal open={review} onClose={() => setReview(false)} title="Order review" label={isPerp ? "Perpetuals" : "DEX"}>
        <dl className="m-0 mt-5 grid gap-2.5 text-[13px]">
          <Row k="Market" v={symbol} />
          <Row k="Side" v={isPerp ? (side === "buy" ? `Long ${lev}×` : `Short ${lev}×`) : side === "buy" ? "Buy" : "Sell"} />
          <Row k="Size" v={`${fmt(size, 4)} ${base}`} />
          <Row k="Est. avg fill" v={fmtPrice(px)} />
          <Row k={isPerp ? "Notional" : "Est. value"} v={`${fmt(value, 2)} ${quote}`} />
          {isPerp && <Row k="Required margin" v={`${fmt(margin, 2)} ${quote}`} />}
          {isPerp && <Row k="Est. liquidation" v={fmtPrice(liq)} />}
        </dl>
        <div className="mt-5 rounded border border-rule-2 bg-well px-4 py-3 text-[13px] leading-5 text-mist">
          {venueLive ? "Ready to submit." : "Execution is not live yet. This order can be reviewed but not submitted."}
        </div>
        <div className="mt-5 flex gap-2">
          <button className="btn btn-line btn-sm flex-1" onClick={() => setReview(false)}>Close</button>
          <button className="btn btn-silver btn-sm flex-1" disabled={!venueLive}>Submit order</button>
        </div>
      </Modal>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-4 text-muted"><dt>{k}</dt><dd className="num m-0 text-right text-platinum">{v}</dd></div>;
}
