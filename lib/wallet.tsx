"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ConnectionProvider, WalletProvider as AdapterProvider, useWallet as useAdapter, type WalletContextState } from "@solana/wallet-adapter-react";
import { WalletReadyState, type WalletError, type WalletName } from "@solana/wallet-adapter-base";
import { cluster } from "./solana";

type Status = "idle" | "connecting" | "connected" | "error";
export type DetectedWallet = { name: WalletName; icon: string; installed: boolean };

type Ctx = {
  status: Status;
  address: string | null;
  walletName: string | null;
  wallets: DetectedWallet[];
  error: string | null;
  pickerOpen: boolean;
  openPicker: () => void;
  closePicker: () => void;
  connect: (name: WalletName) => void;
  disconnect: () => void;
  /** Raw adapter state for signing (sendTransaction, signTransaction, publicKey). */
  adapter: WalletContextState;
};

const WalletCtx = createContext<Ctx | null>(null);

function messageFor(e: WalletError | Error): string {
  const m = e?.message || e?.name || "Wallet error.";
  if (/reject|denied|cancel/i.test(m) || e?.name === "WalletConnectionError" && /User rejected/i.test(m)) return "Request rejected in wallet.";
  if (e?.name === "WalletNotReadyError") return "That wallet is not installed in this browser.";
  return m;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<string | null>(null);
  const onError = useCallback((e: WalletError) => setError(messageFor(e)), []);
  return (
    <ConnectionProvider endpoint={cluster("devnet").rpc!}>
      {/* Empty list: Wallet Standard wallets (Phantom, Solflare, Backpack, …) register themselves. */}
      <AdapterProvider wallets={[]} autoConnect onError={onError}>
        <Inner error={error} setError={setError}>{children}</Inner>
      </AdapterProvider>
    </ConnectionProvider>
  );
}

function Inner({ children, error, setError }: { children: ReactNode; error: string | null; setError: (e: string | null) => void }) {
  const a = useAdapter();
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => { if (a.connected) { setPickerOpen(false); setError(null); } }, [a.connected, setError]);

  const wallets = useMemo<DetectedWallet[]>(() => a.wallets
    .filter((w) => w.readyState === WalletReadyState.Installed || w.readyState === WalletReadyState.Loadable)
    .map((w) => ({ name: w.adapter.name, icon: w.adapter.icon, installed: w.readyState === WalletReadyState.Installed })), [a.wallets]);

  const connect = useCallback((name: WalletName) => {
    setError(null);
    if (a.wallet?.adapter.name === name && !a.connected) { a.connect().catch(() => {}); return; }
    a.select(name); // autoConnect connects once the wallet is selected
  }, [a, setError]);

  const value = useMemo<Ctx>(() => ({
    status: a.connected ? "connected" : a.connecting ? "connecting" : error ? "error" : "idle",
    address: a.publicKey?.toBase58() ?? null,
    walletName: a.wallet?.adapter.name ?? null,
    wallets, error, pickerOpen,
    openPicker: () => { setError(null); setPickerOpen(true); },
    closePicker: () => setPickerOpen(false),
    connect,
    disconnect: () => { a.disconnect().catch(() => {}); },
    adapter: a,
  }), [a, wallets, error, pickerOpen, connect, setError]);

  return <WalletCtx.Provider value={value}>{children}</WalletCtx.Provider>;
}

export function useWallet() {
  const v = useContext(WalletCtx);
  if (!v) throw new Error("useWallet must be used inside WalletProvider");
  return v;
}
