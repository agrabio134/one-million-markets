"use client";
import type { Book } from "@/lib/markets";
import { fmt, fmtPrice } from "@/lib/format";

export function OrderBook({ book, error, base, rows = 8 }: { book: Book | null; error: string | null; base: string; rows?: number }) {
  if (error && !book) return <div role="alert" className="p-5 text-[13px] text-[#d9b3aa]">{error}</div>;
  if (!book) return <div className="grid gap-2 p-4">{Array.from({ length: rows }).map((_, i) => <div key={i} className="skeleton h-4" />)}</div>;

  const asks = book.asks.slice(0, rows);
  const bids = book.bids.slice(0, rows);
  let at = 0, bt = 0;
  const askRows = asks.map((l) => ({ ...l, tot: (at += l.sz) }));
  const bidRows = bids.map((l) => ({ ...l, tot: (bt += l.sz) }));
  const max = Math.max(at, bt) || 1;
  const spread = asks[0] && bids[0] ? asks[0].px - bids[0].px : null;
  const mid = asks[0] && bids[0] ? (asks[0].px + bids[0].px) / 2 : null;

  const Row = ({ px, sz, tot, side }: { px: number; sz: number; tot: number; side: "bid" | "ask" }) => (
    <div className="num relative grid grid-cols-3 px-4 py-[5px] text-[12px]">
      <span className={`absolute bottom-px top-px right-0 ${side === "bid" ? "bg-[rgba(127,209,168,.08)]" : "bg-[rgba(232,144,127,.08)]"}`} style={{ width: `${(tot / max) * 100}%` }} />
      <span className={`relative ${side === "bid" ? "text-up" : "text-down"}`}>{fmtPrice(px)}</span>
      <span className="relative text-right">{fmt(sz, 4)}</span>
      <span className="relative text-right text-muted">{fmt(tot, 4)}</span>
    </div>
  );

  return (
    <div aria-label="Reference order book">
      <div className="label grid grid-cols-3 border-b border-[#1e2227] px-4 py-2.5 text-muted"><span>Price</span><span className="text-right">Size ({base})</span><span className="text-right">Total</span></div>
      <div className="flex flex-col-reverse">{askRows.map((r) => <Row key={`a${r.px}`} {...r} side="ask" />)}</div>
      <div className="num flex justify-between border-y border-[#1e2227] bg-well px-4 py-2 text-[12px]">
        <span className="text-platinum">{fmtPrice(mid)}</span>
        <span className="text-muted">Spread {spread !== null ? fmtPrice(spread) : "—"}</span>
      </div>
      <div>{bidRows.map((r) => <Row key={`b${r.px}`} {...r} side="bid" />)}</div>
    </div>
  );
}

/** Walk the reference book to estimate an average fill for a market order of `size`. */
export function estimateFill(book: Book | null, side: "buy" | "sell", size: number) {
  if (!book || size <= 0) return null;
  const levels = side === "buy" ? book.asks : book.bids;
  let left = size, cost = 0;
  for (const l of levels) {
    const take = Math.min(left, l.sz);
    cost += take * l.px; left -= take;
    if (left <= 0) break;
  }
  const filled = size - Math.max(0, left);
  if (filled <= 0) return null;
  const avg = cost / filled;
  const top = levels[0]?.px ?? avg;
  return { avg, filled, partial: left > 0, impact: top ? (Math.abs(avg - top) / top) * 100 : 0 };
}
