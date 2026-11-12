"use client";
import { useState } from "react";
import { useWallet } from "@/lib/wallet";

const TABS = ["Positions", "Open orders", "Risk model"] as const;

export function PositionsPanel() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Positions");
  const w = useWallet();
  return (
    <section className="panel mt-6" aria-label="Account">
      <div role="tablist" className="flex gap-6 border-b border-[#262a30] px-5">
        {TABS.map((t) => <button key={t} role="tab" aria-selected={tab === t} className="tab" onClick={() => setTab(t)}>{t}</button>)}
      </div>
      <div className="p-6">
        {tab === "Risk model" ? (
          <div className="grid gap-6 text-[14px] leading-6 text-mist md:grid-cols-3">
            <div><div className="label mb-2 text-platinum">Required margin</div>Notional ÷ leverage. Notional is size × estimated average fill against the reference order book.</div>
            <div><div className="label mb-2 text-platinum">Liquidation estimate</div>Long: entry × (1 − 1/leverage + maintenance). Short: entry × (1 + 1/leverage − maintenance). Excludes fees and funding.</div>
            <div><div className="label mb-2 text-platinum">Final parameters</div>Maintenance margin, fees, funding and leverage caps are set by the Perpetuals protocol at launch and will replace these assumptions.</div>
          </div>
        ) : (
          <div className="rounded border border-dashed border-[#3a3f46] p-7">
            <div className="font-display text-[22px] font-bold tracking-[-0.02em]">{tab === "Positions" ? "No open positions." : "No open orders."}</div>
            <p className="mb-0 mt-2 text-[13px] text-mist">
              {w.status === "connected" ? "Positions opened on One Million Markets Perpetuals will appear here once trading is live." : "Connect a wallet to see your account once Perpetuals is live."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
