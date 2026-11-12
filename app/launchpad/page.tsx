import type { Metadata } from "next";
import { PageHead } from "@/components/app/PageHead";
import { Launchpad } from "@/components/app/Launchpad";

export const metadata: Metadata = { title: "Launchpad", description: "Create and launch fixed-supply tokens from your own wallet." };

export default function LaunchpadPage() {
  return (
    <div className="hero-grid min-h-screen bg-graphite pb-24">
      <div className="wrap">
        <PageHead index="01" label="Launchpad" title="From Idea to Market.">
          Create a fixed-supply token and deploy it from your own wallet. Available on test networks while mainnet launch is prepared.
        </PageHead>
        <Launchpad />
      </div>
    </div>
  );
}
