import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@fontsource-variable/inter-tight";
import "./globals.css";
import { WalletProvider } from "@/lib/wallet";
import { SiteHeader } from "@/components/SiteHeader";
import { WalletPicker } from "@/components/WalletPicker";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://1m.markets"),
  title: { default: "One Million Markets — One Million. Every Market.", template: "%s · One Million Markets" },
  description: "Launch tokens, trade decentralized assets, and access perpetual markets through one connected ecosystem on Solana. $MILLION — fixed supply of 1,000,000.",
  openGraph: {
    title: "One Million Markets",
    description: "One Million. Every Market. Launchpad, DEX and Perpetuals under one identity.",
    url: "https://1m.markets", siteName: "One Million Markets", type: "website",
  },
  twitter: { card: "summary_large_image", title: "One Million Markets", description: "One Million. Every Market." },
};

export const viewport: Viewport = { themeColor: "#0B0D10", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-platinum focus:px-4 focus:py-2 focus:text-obsidian">Skip to content</a>
        <WalletProvider>
          <SiteHeader />
          <main id="main">{children}</main>
          <Footer />
          <WalletPicker />
        </WalletProvider>
      </body>
    </html>
  );
}
