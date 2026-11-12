/**
 * Integration boundary for order execution.
 *
 * The marketing site and interface previews never place orders directly. When the
 * One Million Markets DEX and Perpetuals contracts are live, implement an adapter
 * for each venue and register it in `adapters`. Until then every venue reports
 * `live: false` and the UI keeps submit actions disabled.
 */
export type OrderSide = "buy" | "sell";
export type SpotOrder = { market: string; side: OrderSide; size: number; limitPrice?: number };
export type PerpOrder = SpotOrder & { leverage: number; reduceOnly?: boolean };

export interface ExecutionAdapter<O> {
  venue: "dex" | "perpetuals";
  live: boolean;
  quote(order: O): Promise<{ price: number; fee: number | null }>;
  submit(order: O): Promise<{ txHash: `0x${string}` }>;
}

function notLive<O>(venue: "dex" | "perpetuals"): ExecutionAdapter<O> {
  return {
    venue,
    live: false,
    async quote() { throw new Error(`${venue} execution is not live yet.`); },
    async submit() { throw new Error(`${venue} execution is not live yet.`); },
  };
}

export const adapters = {
  dex: notLive<SpotOrder>("dex"),
  perpetuals: notLive<PerpOrder>("perpetuals"),
};
