"use client";
import { useWallet } from "@/lib/wallet";
import { Modal } from "./Modal";

export function WalletPicker() {
  const w = useWallet();
  return (
    <Modal open={w.pickerOpen} onClose={w.closePicker} title="Connect a Solana wallet" label="Wallet">
      <p className="mt-3 text-[15px] leading-6 text-mist">Connecting shares your public address with this site. It never gives access to your funds.</p>
      <div className="mt-6 flex flex-col gap-2">
        {w.wallets.length === 0 && (
          <div className="rounded border border-dashed border-[#3a3f46] p-5">
            <div className="font-display text-[20px] font-bold tracking-[-0.02em]">No Solana wallet detected.</div>
            <p className="mb-0 mt-2 text-[13px] leading-5 text-mist">Install a Solana wallet such as Phantom, Solflare or Backpack, then reload this page.</p>
          </div>
        )}
        {w.wallets.map((d) => (
          <button key={d.name} className="row-btn items-center gap-3 rounded border border-rule-2 px-4 py-3 [grid-template-columns:32px_1fr_auto]"
            onClick={() => w.connect(d.name)} disabled={w.status === "connecting"}>
            {d.icon ? <img src={d.icon} alt="" width={28} height={28} className="rounded" /> : <span className="h-7 w-7 rounded bg-carbon" />}
            <span className="text-[14px] font-medium">{d.name}</span>
            <span className="label text-muted">{w.status === "connecting" && w.walletName === d.name ? "Waiting…" : "Detected"}</span>
          </button>
        ))}
      </div>
      {w.error && <div role="alert" className="mt-4 rounded border border-[#5a2f27] bg-[#1e1412] px-4 py-3 text-[13px] text-[#f4b3a4]">{w.error}</div>}
    </Modal>
  );
}
