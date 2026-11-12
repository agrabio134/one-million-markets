import type { Metadata } from "next";
import { PageHead } from "@/components/app/PageHead";
import { MarketsTable } from "@/components/app/MarketsTable";

export const metadata: Metadata = { title: "Markets", description: "Reference markets across the One Million Markets ecosystem." };

export default function MarketsPage() {
  return (
    <div className="hero-grid min-h-screen bg-graphite pb-24">
      <div className="wrap">
        <PageHead index="01" label="Markets" title="Every Market. One Index.">
          Live reference prices for the markets planned across the DEX and Perpetuals. Select a market to open it in the trading interface.
        </PageHead>
        <MarketsTable />
      </div>
    </div>
  );
}
