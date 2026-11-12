# One Million Markets — 1M.markets

Next.js 15 · React 19 · TypeScript · Tailwind CSS 4 · viem

## Run
    npm install
    npm run dev        # http://localhost:3000
    npm run build && npm start

## Deploy (Vercel)
    npx vercel --prod

No environment variables are required.

## What is live
- Marketing site, Markets index, DEX and Perpetuals terminals, Launchpad, Risk page.
- Wallet connection (EIP-6963 multi-wallet discovery + injected fallback).
- Reference market data (prices, candles, order books) via `/api/markets`, `/api/candles`, `/api/book`,
  proxied server-side from Coinbase Exchange public endpoints (`lib/feed.ts`).
- Order estimates: average fill walked against the reference book, notional, margin, liquidation.
- Launchpad: deploys a fixed-supply ERC-20 (`contracts/MillionLaunchToken.sol`) from the user's wallet on
  Base Sepolia, Ethereum Sepolia or Arbitrum Sepolia (`lib/chains.ts`).

## What is not live (by design)
Order execution. `lib/execution.ts` defines the adapter interface for DEX and Perpetuals; both report
`live: false`, so submit buttons stay disabled. Implement the adapters when protocol contracts exist.

## Brand assets
`public/brand/coin.webp`, `public/brand/statue.webp` — optimized derivatives of the official artwork.
