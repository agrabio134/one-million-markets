"use client";
import { useMemo, useRef, useState } from "react";
import type { Candle } from "@/lib/markets";
import { fmtPrice, fmtCompact } from "@/lib/format";

const W = 1000, H = 320, PAD_T = 16, PAD_B = 28;

export function PriceChart({ candles, loading, error, height = 320, compact = false }: {
  candles: Candle[] | null; loading: boolean; error: string | null; height?: number; compact?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);

  const geo = useMemo(() => {
    if (!candles?.length) return null;
    const lo = Math.min(...candles.map((c) => c.l)), hi = Math.max(...candles.map((c) => c.h));
    const rg = hi - lo || 1;
    const y = (v: number) => PAD_T + (1 - (v - lo) / rg) * (H - PAD_T - PAD_B);
    const step = W / candles.length;
    const vMax = Math.max(...candles.map((c) => c.v)) || 1;
    const ticks = [0, 1, 2, 3].map((k) => hi - (rg * k) / 3);
    return { y, step, lo, hi, vMax, ticks };
  }, [candles]);

  if (error && !candles) {
    return (
      <div role="alert" className="flex items-center justify-center text-[13px] text-[#d9b3aa]" style={{ height }}>
        {error}
      </div>
    );
  }
  if (!geo || !candles) {
    return <div className="p-5" style={{ height }} aria-busy={loading}><div className="skeleton h-full w-full" /></div>;
  }

  const active = hover !== null ? candles[hover] : candles[candles.length - 1];
  const last = candles[candles.length - 1];

  return (
    <div className="relative" style={{ height }}>
      {!compact && (
        <div className="num pointer-events-none absolute left-4 top-3 z-10 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
          <span>{new Date(active.t * 1000).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
          <span>O <b className="font-normal text-platinum">{fmtPrice(active.o)}</b></span>
          <span>H <b className="font-normal text-platinum">{fmtPrice(active.h)}</b></span>
          <span>L <b className="font-normal text-platinum">{fmtPrice(active.l)}</b></span>
          <span>C <b className="font-normal text-platinum">{fmtPrice(active.c)}</b></span>
          <span>Vol <b className="font-normal text-platinum">{fmtCompact(active.v)}</b></span>
        </div>
      )}
      <div ref={box} className="absolute inset-0" style={{ right: compact ? 0 : 72 }}
        onMouseMove={(e) => {
          const r = box.current!.getBoundingClientRect();
          setHover(Math.max(0, Math.min(candles.length - 1, Math.floor(((e.clientX - r.left) / r.width) * candles.length))));
        }}
        onMouseLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" width="100%" height="100%" role="img"
          aria-label={`Price chart, last close ${fmtPrice(last.c)}`} className="block">
          {geo.ticks.map((t) => <line key={t} x1="0" x2={W} y1={geo.y(t)} y2={geo.y(t)} stroke="#22262b" vectorEffect="non-scaling-stroke" />)}
          {!compact && candles.map((c, i) => (
            <rect key={`v${c.t}`} x={i * geo.step + geo.step * 0.2} width={geo.step * 0.6} y={H - (c.v / geo.vMax) * 40} height={(c.v / geo.vMax) * 40} fill="rgba(191,196,202,.08)" />
          ))}
          {compact ? (
            <path d={"M" + candles.map((c, i) => `${(i + 0.5) * geo.step} ${geo.y(c.c)}`).join(" L")} fill="none" stroke="#bfc4ca" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          ) : candles.map((c, i) => {
            const up = c.c >= c.o, col = up ? "#9fd8b8" : "#f0a797", x = (i + 0.5) * geo.step;
            const top = geo.y(Math.max(c.o, c.c)), bot = geo.y(Math.min(c.o, c.c));
            return (
              <g key={c.t}>
                <line x1={x} x2={x} y1={geo.y(c.h)} y2={geo.y(c.l)} stroke={col} vectorEffect="non-scaling-stroke" />
                <rect x={x - geo.step * 0.32} width={geo.step * 0.64} y={top} height={Math.max(1, bot - top)} fill={up ? "#9fd8b8" : "#f0a797"} opacity={hover === i ? 1 : 0.85} />
              </g>
            );
          })}
          <line x1="0" x2={W} y1={geo.y(last.c)} y2={geo.y(last.c)} stroke="#717780" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
          {hover !== null && <line x1={(hover + 0.5) * geo.step} x2={(hover + 0.5) * geo.step} y1="0" y2={H} stroke="#3a3f46" vectorEffect="non-scaling-stroke" />}
        </svg>
      </div>
      {!compact && (
        <div className="num absolute bottom-0 right-0 top-0 flex w-[72px] flex-col justify-between border-l border-[#262a30] px-2 pb-7 pt-3 text-[11px] text-muted" aria-hidden="true">
          {geo.ticks.map((t) => <span key={t}>{fmtPrice(t)}</span>)}
        </div>
      )}
    </div>
  );
}
