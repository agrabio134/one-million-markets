import "server-only";
import { MARKETS, type Ticker, type Candle, type Book } from "./markets";

const BASE = "https://api.exchange.coinbase.com";
const HEADERS = { "User-Agent": "one-million-markets/1.0", Accept: "application/json" };

async function get<T>(path: string, revalidate: number): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: HEADERS, next: { revalidate } });
  if (!res.ok) throw new Error(`Feed ${res.status} for ${path}`);
  return (await res.json()) as T;
}

type Stats = { open: string; high: string; low: string; last: string; volume: string };

export async function getTickers(): Promise<Ticker[]> {
  const rows = await Promise.all(
    MARKETS.map(async (m) => {
      try {
        const s = await get<Stats>(`/products/${m.id}/stats`, 10);
        const last = Number(s.last), open = Number(s.open);
        return {
          ...m, last, open, high: Number(s.high), low: Number(s.low), volume: Number(s.volume),
          change: open ? ((last - open) / open) * 100 : null,
        } satisfies Ticker;
      } catch {
        return { ...m, last: null, open: null, high: null, low: null, volume: null, change: null } satisfies Ticker;
      }
    })
  );
  if (rows.every((r) => r.last === null)) throw new Error("Feed unavailable");
  return rows;
}

export async function getCandles(id: string, granularity: number): Promise<Candle[]> {
  const raw = await get<number[][]>(`/products/${id}/candles?granularity=${granularity}`, granularity >= 3600 ? 60 : 20);
  return raw
    .map(([t, l, h, o, c, v]) => ({ t, o, h, l, c, v }))
    .sort((a, b) => a.t - b.t)
    .slice(-120);
}

export async function getBook(id: string, depth = 12): Promise<Book> {
  const raw = await get<{ bids: string[][]; asks: string[][] }>(`/products/${id}/book?level=2`, 2);
  const map = (rows: string[][]) => rows.slice(0, depth).map(([p, s]) => ({ px: Number(p), sz: Number(s) }));
  return { bids: map(raw.bids), asks: map(raw.asks), ts: Date.now() };
}
