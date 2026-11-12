import { clusterApiUrl } from "@solana/web3.js";

export type ClusterKey = "devnet" | "mainnet-beta";
export type ClusterDef = { key: ClusterKey; label: string; rpc: string | null; real: boolean; note: string };

/** Mainnet launches need a dedicated RPC (the public mainnet endpoint rejects browser traffic).
 *  Set NEXT_PUBLIC_SOLANA_MAINNET_RPC in Vercel to enable it. */
const MAINNET_RPC = process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC || null;

export const CLUSTERS: ClusterDef[] = [
  { key: "devnet", label: "Solana Devnet", rpc: process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC || clusterApiUrl("devnet"), real: false, note: "Test network. Tokens have no value." },
  { key: "mainnet-beta", label: "Solana Mainnet", rpc: MAINNET_RPC, real: true, note: MAINNET_RPC ? "Real SOL. Deployment is permanent." : "Not enabled: set NEXT_PUBLIC_SOLANA_MAINNET_RPC." },
];

export function cluster(key: ClusterKey) { return CLUSTERS.find((c) => c.key === key)!; }

export function explorerUrl(kind: "address" | "tx", id: string, key: ClusterKey) {
  const q = key === "devnet" ? "?cluster=devnet" : "";
  return `https://explorer.solana.com/${kind}/${id}${q}`;
}

export function solscanUrl(kind: "token" | "tx", id: string, key: ClusterKey) {
  const q = key === "devnet" ? "?cluster=devnet" : "";
  return `https://solscan.io/${kind}/${id}${q}`;
}
