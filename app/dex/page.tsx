import type { Metadata } from "next";
import { Terminal } from "@/components/trade/Terminal";
import { PageHead } from "@/components/app/PageHead";

export const metadata: Metadata = { title: "DEX", description: "Discover and trade decentralized assets through an interface built for clarity." };

export default async function DexPage({ searchParams }: { searchParams: Promise<{ market?: string }> }) {
  const { market } = await searchParams;
  return (
    <div className="hero-grid min-h-screen bg-graphite pb-24">
      <div className="wrap">
        <PageHead index="02" label="DEX" title="Markets in Motion.">
          Live reference prices, charts and order book depth. Swap execution opens when the One Million Markets DEX contracts are live.
        </PageHead>
        <Terminal mode="spot" initialMarket={market} />
      </div>
    </div>
  );
}
