"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { EIP1193Provider } from "viem";

type ProviderInfo = { uuid: string; name: string; icon: string; rdns: string };
type Detected = { info: ProviderInfo; provider: EIP1193Provider };
type Status = "idle" | "connecting" | "connected" | "error";

type WalletCtx = {
  status: Status;
  address: `0x${string}` | null;
  chainId: number | null;
  error: string | null;
  wallets: Detected[];
  provider: EIP1193Provider | null;
  pickerOpen: boolean;
  openPicker: () => void;
  closePicker: () => void;
  connect: (w?: Detected) => Promise<void>;
  disconnect: () => void;
  switchChain: (chainId: number, add?: AddChainParams) => Promise<void>;
};

export type AddChainParams = {
  chainId: string; chainName: string; rpcUrls: string[];
  nativeCurrency: { name: string; symbol: string; decimals: number }; blockExplorerUrls?: string[];
};

const Ctx = createContext<WalletCtx | null>(null);
const LS_KEY = "omm.wallet.rdns";

function readLS(): string | null { try { return localStorage.getItem(LS_KEY); } catch { return null; } }
function writeLS(v: string | null) { try { v ? localStorage.setItem(LS_KEY, v) : localStorage.removeItem(LS_KEY); } catch {} }

function errMessage(e: unknown): string {
  const anyE = e as { code?: number; shortMessage?: string; message?: string };
  if (anyE?.code === 4001) return "Request rejected in wallet.";
  if (anyE?.code === -32002) return "A request is already pending in your wallet.";
  return anyE?.shortMessage ?? anyE?.message ?? "Wallet error.";
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<Detected[]>([]);
  const [active, setActive] = useState<Detected | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const triedRestore = useRef(false);

  // EIP-6963 multi-wallet discovery, with a window.ethereum fallback.
  useEffect(() => {
    const found = new Map<string, Detected>();
    const onAnnounce = (ev: Event) => {
      const d = (ev as CustomEvent<Detected>).detail;
      if (!d?.info?.uuid || found.has(d.info.rdns)) return;
      found.set(d.info.rdns, d);
      setWallets(Array.from(found.values()));
    };
    window.addEventListener("eip6963:announceProvider", onAnnounce as EventListener);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    const t = window.setTimeout(() => {
      const eth = (window as unknown as { ethereum?: EIP1193Provider }).ethereum;
      if (found.size === 0 && eth) {
        found.set("injected", { info: { uuid: "injected", name: "Browser wallet", icon: "", rdns: "injected" }, provider: eth });
        setWallets(Array.from(found.values()));
      }
    }, 400);
    return () => { window.removeEventListener("eip6963:announceProvider", onAnnounce as EventListener); clearTimeout(t); };
  }, []);

  // Silent reconnect to the previously used wallet.
  useEffect(() => {
    if (triedRestore.current || wallets.length === 0) return;
    const rdns = readLS();
    const w = rdns ? wallets.find((x) => x.info.rdns === rdns) : null;
    if (!w) return;
    triedRestore.current = true;
    (async () => {
      try {
        const accts = (await w.provider.request({ method: "eth_accounts" })) as string[];
        if (accts?.[0]) {
          const cid = (await w.provider.request({ method: "eth_chainId" })) as string;
          setActive(w); setAddress(accts[0] as `0x${string}`); setChainId(parseInt(cid, 16)); setStatus("connected");
        }
      } catch {}
    })();
  }, [wallets]);

  // Account and network change listeners.
  useEffect(() => {
    const p = active?.provider as (EIP1193Provider & { removeListener?: (e: string, f: (...a: unknown[]) => void) => void }) | undefined;
    if (!p?.on) return;
    const onAccounts = (a: unknown) => {
      const list = a as string[];
      if (!list?.length) { setAddress(null); setStatus("idle"); writeLS(null); }
      else setAddress(list[0] as `0x${string}`);
    };
    const onChain = (c: unknown) => setChainId(parseInt(String(c), 16));
    p.on("accountsChanged", onAccounts as never);
    p.on("chainChanged", onChain as never);
    return () => { p.removeListener?.("accountsChanged", onAccounts); p.removeListener?.("chainChanged", onChain); };
  }, [active]);

  const connect = useCallback(async (w?: Detected) => {
    const target = w ?? (wallets.length === 1 ? wallets[0] : null);
    if (!target) { setPickerOpen(true); return; }
    setStatus("connecting"); setError(null);
    try {
      const accts = (await target.provider.request({ method: "eth_requestAccounts" })) as string[];
      const cid = (await target.provider.request({ method: "eth_chainId" })) as string;
      setActive(target); setAddress(accts[0] as `0x${string}`); setChainId(parseInt(cid, 16));
      setStatus("connected"); writeLS(target.info.rdns); setPickerOpen(false);
    } catch (e) {
      setStatus("error"); setError(errMessage(e));
    }
  }, [wallets]);

  const disconnect = useCallback(() => {
    setActive(null); setAddress(null); setChainId(null); setStatus("idle"); setError(null); writeLS(null);
  }, []);

  const switchChain = useCallback(async (id: number, add?: AddChainParams) => {
    const p = active?.provider;
    if (!p) throw new Error("Connect a wallet first.");
    const hex = `0x${id.toString(16)}`;
    try {
      await p.request({ method: "wallet_switchEthereumChain", params: [{ chainId: hex }] });
    } catch (e) {
      const code = (e as { code?: number })?.code;
      if ((code === 4902 || code === -32603) && add) {
        await p.request({ method: "wallet_addEthereumChain", params: [add] } as never);
      } else throw new Error(errMessage(e));
    }
  }, [active]);

  const value = useMemo<WalletCtx>(() => ({
    status, address, chainId, error, wallets, provider: active?.provider ?? null, pickerOpen,
    openPicker: () => { setError(null); setPickerOpen(true); }, closePicker: () => setPickerOpen(false),
    connect, disconnect, switchChain,
  }), [status, address, chainId, error, wallets, active, pickerOpen, connect, disconnect, switchChain]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWallet() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useWallet must be used inside WalletProvider");
  return v;
}
