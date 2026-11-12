import type { Metadata } from "next";
import { PageHead } from "@/components/app/PageHead";
import { Launchpad } from "@/components/app/Launchpad";

export const metadata: Metadata = { title: "Launchpad", description: "Create fixed-supply SPL tokens on Solana from your own wallet." };

export default function LaunchpadPage() {
  return (
    <div className="hero-grid min-h-screen bg-graphite pb-24">
      <div className="wrap">
        <PageHead index="01" label="Launchpad" title="From Idea to Market.">
          Create a fixed-supply SPL token from your own Solana wallet, with on-chain name and ticker and the mint authority revoked at launch.
        </PageHead>
        <Launchpad />
      </div>
    </div>
  );
}
