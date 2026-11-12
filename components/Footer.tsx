import Link from "next/link";
import { BrandMark } from "./BrandMark";

export function RiskText({ className = "" }: { className?: string }) {
  return (
    <p className={`m-0 text-[13px] leading-[21px] text-muted ${className}`}>
      Digital assets are highly volatile and may lose all of their value. Perpetual contracts and other leveraged products amplify both gains and losses and can result in rapid liquidation. Interacting with smart contracts carries technical risk, including bugs and exploits. Market prices shown in the app are reference data from a third-party public feed; One Million Markets order execution is not yet live. Launchpad deployments currently run on test networks only. Nothing on this site is investment, financial, legal or tax advice. Availability may be restricted in some jurisdictions.
    </p>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-rule bg-obsidian text-platinum">
      <div className="wrap g12 gap-y-10 pb-12 pt-16">
        <div className="col-span-4 flex flex-col gap-5">
          <div className="flex items-center gap-3"><BrandMark size={40} /><span className="font-display text-[16px] font-bold">ONE MILLION MARKETS</span></div>
          <a href="https://1m.markets" className="num self-start border-b border-[#3a3f46] pb-0.5 text-[14px] no-underline">1M.markets</a>
        </div>
        <FooterCol title="Products" links={[["Launchpad", "/launchpad"], ["DEX", "/dex"], ["Perpetuals", "/perpetuals"], ["Markets", "/markets"]]} />
        <FooterCol title="Ecosystem" links={[["$MILLION token", "/#token"], ["Overview", "/#ecosystem"], ["Philosophy", "/#philosophy"]]} />
        <div className="col-span-2"><div className="label mb-3 text-muted">Community</div>
          <div className="flex flex-col text-[14px] leading-8 text-muted"><span>[Official channel]</span><span>[Official channel]</span></div></div>
        <FooterCol title="Resources" links={[["Risk disclosure", "/risk"]]} extra={["[Documentation]", "[Terms]"]} />
      </div>
      <div className="wrap pb-10" id="risk">
        <div className="sm-stack flex gap-6 border-t border-rule pt-6">
          <div className="label w-40 flex-none text-muted">Risk disclosure</div>
          <RiskText className="max-w-[900px]" />
        </div>
        <div className="sm-stack mt-10 flex justify-between gap-4">
          <span className="label text-steel">© 2026 One Million Markets</span>
          <span className="label text-steel">One Million. Every Market.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links, extra = [] }: { title: string; links: [string, string][]; extra?: string[] }) {
  return (
    <nav className="col-span-2" aria-label={title}>
      <div className="label mb-3 text-muted">{title}</div>
      <div className="flex flex-col">
        {links.map(([l, h]) => <Link key={h} href={h} className="text-[14px] leading-8 text-mist no-underline transition-colors hover:text-white">{l}</Link>)}
        {extra.map((e) => <span key={e} className="text-[14px] leading-8 text-muted">{e}</span>)}
      </div>
    </nav>
  );
}
