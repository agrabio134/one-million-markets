"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useTickers } from "@/components/trade/Terminal";
import { FEED_NAME, type Ticker } from "@/lib/markets";
import { fmtCompact, fmtPct, fmtPrice } from "@/lib/format";

type Key = "name" | "last" | "change" | "volume" | "range";

export function MarketsTable() {
  const { data, error, loading, updatedAt } = useTickers();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ k: Key; dir: 1 | -1 }>({ k: "volume", dir: -1 });

  const rows = useMemo(() => {
    const val = (t: Ticker, k: Key): number | string => {
      if (k === "name") return t.base;
      if (k === "volume") return (t.volume ?? 0) * (t.last ?? 0);
      if (k === "range") return t.high && t.low ? (t.high - t.low) / t.low : 0;
      return (t[k] as number | null) ?? -Infinity;
    };
    return (data ?? [])
      .filter((t) => !q || `${t.base} ${t.name}`.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => { const x = val(a, sort.k), y = val(b, sort.k); return (x > y ? 1 : x < y ? -1 : 0) * sort.dir; });
  }, [data, q, sort]);

  const Th = ({ k, children, right }: { k: Key; children: string; right?: boolean }) => (
    <th scope="col" aria-sort={sort.k === k ? (sort.dir === 1 ? "ascending" : "descending") : "none"} className={`border-b border-[#262a30] px-5 py-3 font-medium ${right ? "text-right" : "text-left"}`}>
      <button className="label cursor-pointer border-0 bg-transparent p-0 text-muted hover:text-white" onClick={() => setSort((s) => ({ k, dir: s.k === k ? (s.dir === 1 ? -1 : 1) : -1 }))}>
        {children}{sort.k === k ? (sort.dir === 1 ? " ↑" : " ↓") : ""}
      </button>
    </th>
  );

  return (
    <div className="panel overflow-hidden">
      <div className="sm-stack flex items-center justify-between gap-4 border-b border-[#262a30] px-5 py-3">
        <label className="block"><span className="sr-only">Search markets</span>
          <input className="field field-sans !h-10 w-72 sm-full" type="search" placeholder="Search by asset" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <span className="label flex items-center gap-2 text-muted">
          <span className={`dot ${error ? "!bg-down" : "dot-live"}`} />
          {error ? "Feed unavailable — retrying" : updatedAt ? `Updated ${new Date(updatedAt).toLocaleTimeString("en-US")}` : "Loading"}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-[14px]">
          <thead><tr>
            <Th k="name">Market</Th><Th k="last" right>Price</Th><Th k="change" right>24h</Th>
            <Th k="range" right>24h range</Th><Th k="volume" right>24h volume (USD)</Th>
            <th scope="col" className="label border-b border-[#262a30] px-5 py-3 text-right font-medium text-muted">Open in</th>
          </tr></thead>
          <tbody>
            {loading && !data && Array.from({ length: 6 }).map((_, i) => (
              <tr key={i}><td colSpan={6} className="px-5 py-3"><div className="skeleton h-5" /></td></tr>
            ))}
            {error && !data && (
              <tr><td colSpan={6} className="p-8"><div role="alert" className="rounded border border-[#5a2f27] bg-[#1e1412] p-5 text-[13px] text-[#f4b3a4]">{error} Prices will appear automatically when the feed recovers.</div></td></tr>
            )}
            {rows.map((t) => (
              <tr key={t.id} className="transition-colors hover:bg-[#1a1d21]">
                <td className="border-b border-[#1e2227] px-5 py-3.5"><div className="font-medium">{t.base} / {t.quote}</div><div className="text-[12px] text-muted">{t.name}</div></td>
                <td className="num border-b border-[#1e2227] px-5 py-3.5 text-right">{fmtPrice(t.last)}</td>
                <td className={`num border-b border-[#1e2227] px-5 py-3.5 text-right ${t.change == null ? "text-muted" : t.change >= 0 ? "text-up" : "text-down"}`}>{fmtPct(t.change)}</td>
                <td className="num border-b border-[#1e2227] px-5 py-3.5 text-right text-mist">{fmtPrice(t.low)} – {fmtPrice(t.high)}</td>
                <td className="num border-b border-[#1e2227] px-5 py-3.5 text-right">{t.volume && t.last ? `$${fmtCompact(t.volume * t.last)}` : "—"}</td>
                <td className="border-b border-[#1e2227] px-5 py-3.5 text-right">
                  <span className="inline-flex gap-2">
                    <Link className="btn btn-line btn-xs" href={`/dex?market=${t.id}`}>Spot</Link>
                    <Link className="btn btn-line btn-xs" href={`/perpetuals?market=${t.id}`}>Perp</Link>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="label border-t border-[#262a30] px-5 py-3 text-muted">Source: {FEED_NAME}. Reference only — not One Million Markets order books.</div>
    </div>
  );
}
