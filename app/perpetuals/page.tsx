import type { Metadata } from "next";
import { Terminal } from "@/components/trade/Terminal";
import { PageHead } from "@/components/app/PageHead";
import { PositionsPanel } from "@/components/app/PositionsPanel";

export const metadata: Metadata = { title: "Perpetuals", description: "Perpetual market interfaces with position and risk-management workflows." };

export default async function PerpPage({ searchParams }: { searchParams: Promise<{ market?: string }> }) {
  const { market } = await searchParams;
  return (
    <div className="hero-grid min-h-screen bg-graphite pb-24">
      <div className="wrap">
        <PageHead index="03" label="Perpetuals" title="Trade Beyond Spot.">
          Size, leverage, margin and liquidation estimates computed against live reference prices. Position opening is not live yet.
        </PageHead>
        <Terminal mode="perp" initialMarket={market} />
        <PositionsPanel />
      </div>
    </div>
  );
}
