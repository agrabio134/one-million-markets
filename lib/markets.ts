/** Reference markets. Prices come from a public exchange feed and are shown for
 *  reference only — One Million Markets order execution is not yet live. */
export type MarketDef = { id: string; base: string; quote: string; name: string };

export const MARKETS: MarketDef[] = [
  { id: "BTC-USD", base: "BTC", quote: "USD", name: "Bitcoin" },
  { id: "ETH-USD", base: "ETH", quote: "USD", name: "Ether" },
  { id: "SOL-USD", base: "SOL", quote: "USD", name: "Solana" },
  { id: "LINK-USD", base: "LINK", quote: "USD", name: "Chainlink" },
  { id: "AVAX-USD", base: "AVAX", quote: "USD", name: "Avalanche" },
  { id: "ARB-USD", base: "ARB", quote: "USD", name: "Arbitrum" },
  { id: "OP-USD", base: "OP", quote: "USD", name: "Optimism" },
  { id: "DOGE-USD", base: "DOGE", quote: "USD", name: "Dogecoin" },
  { id: "UNI-USD", base: "UNI", quote: "USD", name: "Uniswap" },
  { id: "AAVE-USD", base: "AAVE", quote: "USD", name: "Aave" },
];

export const MARKET_IDS = new Set(MARKETS.map((m) => m.id));
export const DEFAULT_MARKET = "ETH-USD";
export const FEED_NAME = "Coinbase Exchange public market data";

export function marketById(id?: string | null): MarketDef {
  return MARKETS.find((m) => m.id === id) ?? MARKETS.find((m) => m.id === DEFAULT_MARKET)!;
}

export type Ticker = {
  id: string; base: string; quote: string; name: string;
  last: number | null; open: number | null; high: number | null; low: number | null;
  volume: number | null; change: number | null;
};
export type Candle = { t: number; o: number; h: number; l: number; c: number; v: number };
export type BookLevel = { px: number; sz: number };
export type Book = { bids: BookLevel[]; asks: BookLevel[]; ts: number };

export const GRANULARITIES = [
  { key: "15m", sec: 900, label: "15M" },
  { key: "1h", sec: 3600, label: "1H" },
  { key: "6h", sec: 21600, label: "6H" },
  { key: "1d", sec: 86400, label: "1D" },
] as const;
