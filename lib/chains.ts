import { sepolia, baseSepolia, arbitrumSepolia, type Chain } from "viem/chains";

/** Networks the Launchpad can deploy to. Testnets only until mainnet launch is approved. */
export const LAUNCH_CHAINS: { chain: Chain; label: string; explorer: string; faucetHint: string }[] = [
  { chain: baseSepolia, label: "Base Sepolia", explorer: "https://sepolia.basescan.org", faucetHint: "Base Sepolia ETH" },
  { chain: sepolia, label: "Ethereum Sepolia", explorer: "https://sepolia.etherscan.io", faucetHint: "Sepolia ETH" },
  { chain: arbitrumSepolia, label: "Arbitrum Sepolia", explorer: "https://sepolia.arbiscan.io", faucetHint: "Arbitrum Sepolia ETH" },
];

export function launchChain(id?: number | null) {
  return LAUNCH_CHAINS.find((c) => c.chain.id === id);
}

export function chainLabel(id?: number | null) {
  if (!id) return "—";
  return launchChain(id)?.label ?? `Chain ${id}`;
}
