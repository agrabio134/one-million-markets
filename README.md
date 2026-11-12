# One Million Markets — 1M.markets

Next.js 15 · React 19 · TypeScript · Tailwind CSS 4 · Solana web3.js · Wallet Adapter

## Run
    npm install
    npm run dev        # http://localhost:3000
    npm run build && npm start

## Deploy (Vercel)
    npx vercel --prod

No environment variables are required for devnet.

## What is live
- Marketing site, Markets index, DEX and Perpetuals terminals, Launchpad, Risk page.
- Solana wallet connection via Wallet Standard (Phantom, Solflare, Backpack and others auto-detected).
- Reference market data (prices, candles, order books) via `/api/markets`, `/api/candles`, `/api/book`,
  proxied server-side from Coinbase Exchange public endpoints (`lib/feed.ts`).
- Order estimates: average fill walked against the reference book, notional, margin, liquidation.
- Launchpad: creates a fixed-supply SPL token (Token-2022 with on-chain name/ticker/URI metadata) in one
  wallet-signed transaction, mints the full supply to the creator and revokes the mint authority (`lib/spl.ts`).
  Devnet works out of the box, with a devnet SOL airdrop button.

## Environment variables
- `NEXT_PUBLIC_SOLANA_MAINNET_RPC` — enables Solana Mainnet in the Launchpad. Use a dedicated RPC
  (Helius, Triton, QuickNode…); the public mainnet endpoint rejects browser traffic. Unset = devnet only.
- `NEXT_PUBLIC_SOLANA_DEVNET_RPC` — optional override for devnet.

## What is not live (by design)
Order execution. `lib/execution.ts` defines the adapter interface for DEX and Perpetuals; both report
`live: false`, so submit buttons stay disabled. Implement the adapters when protocol contracts exist.

## Brand assets
`public/brand/coin.webp`, `public/brand/statue.webp` — optimized derivatives of the official artwork.
