"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandMark } from "./BrandMark";
import { IconClose, IconMenu } from "./Icons";
import { WalletButton } from "./WalletButton";

const NAV = [
  { href: "/markets", label: "Markets" },
  { href: "/launchpad", label: "Launchpad" },
  { href: "/dex", label: "DEX" },
  { href: "/perpetuals", label: "Perpetuals" },
  { href: "/#ecosystem", label: "Ecosystem" },
];

export function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const inApp = NAV.slice(0, 4).some((n) => path.startsWith(n.href));
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", esc); document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header className="fade sticky top-0 z-50 border-b border-rule bg-obsidian">
        <div className="wrap flex h-[76px] items-center justify-between gap-8">
          <Link href="/" aria-label="One Million Markets — home" className="flex items-center gap-3 text-offwhite no-underline">
            <BrandMark />
            <span className="font-display text-[15px] font-bold tracking-[-0.01em]">ONE MILLION MARKETS</span>
          </Link>
          <nav aria-label="Primary" className="md-hide flex gap-9">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="navlink" aria-current={path === n.href ? "page" : undefined}>{n.label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {inApp ? <WalletButton className="md-hide" /> : (
              <Link href="/markets" className="btn btn-silver btn-sm md-hide">Launch App <span className="arr" aria-hidden="true">→</span></Link>
            )}
            <button className="btn btn-line btn-icon md-only" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}><IconMenu /></button>
          </div>
        </div>
      </header>
      {open && (
        <div className="overlay flex flex-col bg-obsidian" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="wrap flex h-[76px] w-full items-center justify-between border-b border-rule">
            <span className="label text-muted">Menu / Index</span>
            <button className="btn btn-line btn-icon" aria-label="Close menu" onClick={() => setOpen(false)}><IconClose /></button>
          </div>
          <nav aria-label="Mobile" className="wrap w-full flex-1 overflow-y-auto pt-4">
            {NAV.map((n, i) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
                className="flex items-baseline gap-5 border-b border-rule py-5 font-display text-[40px] font-bold tracking-[-0.04em] text-offwhite no-underline hover:text-silver">
                <span className="label text-steel">0{i + 1}</span>{n.label}
              </Link>
            ))}
          </nav>
          <div className="wrap flex w-full flex-col gap-4 pb-8">
            <WalletButton className="w-full [&>button]:w-full" />
            <span className="label text-muted">1M.markets · 1,000,000 $MILLION</span>
          </div>
        </div>
      )}
    </>
  );
}
