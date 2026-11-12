import type { Metadata } from "next";
import { PageHead } from "@/components/app/PageHead";
import { RiskText } from "@/components/Footer";

export const metadata: Metadata = { title: "Risk disclosure" };

export default function RiskPage() {
  return (
    <div className="min-h-screen bg-obsidian pb-24">
      <div className="wrap">
        <PageHead index="—" label="Resources" title="Risk Disclosure." />
        <div className="g12"><div className="col-span-3" /><div className="col-span-7 grid gap-6 text-[16px] leading-[27px] text-mist">
          <RiskText className="!text-[16px] !leading-[27px] !text-mist" />
          <p className="m-0">Leverage: a small adverse price move can liquidate a leveraged position and lose the full margin posted. Liquidation estimates shown in the interface exclude fees and funding and are illustrative.</p>
          <p className="m-0">Launchpad: tokens you deploy are created by your wallet and are your responsibility. Deployment is irreversible. Testnet tokens have no monetary value.</p>
          <p className="m-0">Reference data: prices, charts and order books are sourced from a third-party public exchange feed and may be delayed or unavailable.</p>
        </div></div>
      </div>
    </div>
  );
}
