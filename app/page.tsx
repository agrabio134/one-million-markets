import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/home/Reveal";
import { LiveExperience } from "@/components/home/LiveExperience";
import { ProductCards } from "@/components/home/ProductCards";

function Tag({ n, children, dark = false }: { n: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <div className={`label flex items-center gap-3 ${dark ? "text-ink-2" : "text-mist"}`}>
      <span className={`rounded-sm border px-1.5 py-px text-[10px] ${dark ? "border-ink-2/40 text-obsidian" : "border-[#3a3f46] text-platinum"}`}>{n}</span>
      <span className="tracking-[0.14em]">{children}</span>
      <span className={`h-px w-14 ${dark ? "bg-ink-2/40" : "bg-[#3a3f46]"}`} />
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section id="top" className="hero-v2 border-b border-[rgba(231,233,236,.1)]" aria-labelledby="hero-title">
        <div className="wrap relative z-10 grid min-h-[640px] items-center gap-6 py-14 [grid-template-columns:minmax(0,6fr)_minmax(0,4.6fr)_170px] max-[1180px]:[grid-template-columns:minmax(0,1fr)_minmax(0,1fr)] max-[960px]:[grid-template-columns:minmax(0,1fr)] max-[960px]:py-10">
          <div className="relative z-20 flex flex-col">
            <div className="fade"><Tag n="01">THE MILLION ECOSYSTEM</Tag></div>
            <h1 id="hero-title" className="font-wide metal-text m-0 mt-8 whitespace-nowrap text-[clamp(30px,4.15vw,62px)] font-extrabold leading-[1.02] tracking-[-0.01em] max-[960px]:whitespace-normal max-[960px]:text-[clamp(34px,10vw,56px)]">
              <span className="mask"><span>ONE MILLION.</span></span>
              <span className="mask d2"><span>EVERY MARKET.</span></span>
            </h1>
            <p className="fade d1 mb-0 mt-7 max-w-[540px] text-[18px] leading-[29px] text-[#c9cdd2]">
              Launch tokens, trade decentralized assets, and access perpetual markets through one connected ecosystem.
            </p>
            <div className="fade d2 sm-stack mt-9 flex items-center gap-4">
              <Link className="btn btn-metal min-w-[210px] !justify-center !gap-3" href="/markets">Enter Markets <span className="arr" aria-hidden="true">↗</span></Link>
              <a className="btn btn-ghost-metal min-w-[210px] !justify-center" href="#ecosystem">Explore Ecosystem</a>
            </div>
            <nav aria-label="Products" className="fade d3 mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[rgba(231,233,236,.12)] pt-5">
              <Link className="label text-mist no-underline hover:text-white" href="/launchpad"><span className="text-platinum">01</span>&nbsp; LAUNCHPAD</Link>
              <span aria-hidden="true" className="sm-hide text-[#3a3f46]">/</span>
              <Link className="label text-mist no-underline hover:text-white" href="/dex"><span className="text-platinum">02</span>&nbsp; DEX</Link>
              <span aria-hidden="true" className="sm-hide text-[#3a3f46]">/</span>
              <Link className="label text-mist no-underline hover:text-white" href="/perpetuals"><span className="text-platinum">03</span>&nbsp; PERPETUALS</Link>
            </nav>
          </div>

          {/* Art: statue + coin */}
          <div className="relative h-[560px] max-[960px]:order-first max-[960px]:-mt-4 max-[960px]:h-[330px]">
            <Image src="/brand/statue.webp" alt="The official One Million Markets silver statue" width={1254} height={1254} priority
              sizes="(max-width: 960px) 110vw, 760px"
              className="statue-fade coin-in absolute left-[-18%] top-[-10%] w-[118%] max-w-none max-[960px]:left-[-6%] max-[960px]:top-[-8%] max-[960px]:w-[92%]" />
            <Image src="/brand/coin.webp" alt="The official One Million Coin" width={800} height={800} priority
              sizes="(max-width: 960px) 55vw, 380px"
              className="coin-mask blend-lighten fade d2 absolute right-[-6%] top-[22%] w-[58%] max-w-none max-[1180px]:right-[-4%] max-[960px]:right-[-4%] max-[960px]:top-[30%] max-[960px]:w-[50%]" />
          </div>

          {/* Side plate */}
          <aside className="side-plate fade d3 flex flex-col gap-5 self-center px-6 py-7 max-[1180px]:col-span-full max-[1180px]:flex-row max-[1180px]:justify-between max-[1180px]:py-5 max-[640px]:flex-col">
            <div className="text-[13px] leading-[18px] text-[#c9cdd2]">ONE<br />MILLION<br />MARKETS</div>
            <span className="h-px w-6 bg-[#717780] max-[1180px]:hidden" />
            <div className="text-[13px] text-[#c9cdd2]">EST. 2026</div>
            <span className="h-px w-6 bg-[#717780] max-[1180px]:hidden" />
            <div className="num text-[13px] leading-[18px] text-[#e7e9ec]">1,000,000<br />$MILLION</div>
          </aside>
        </div>
      </section>

      {/* ECOSYSTEM */}
      <section id="ecosystem" className="brushed scroll-mt-20 py-16 text-obsidian">
        <div className="wrap">
          <div className="grid items-end gap-8 [grid-template-columns:minmax(0,1.2fr)_minmax(0,1fr)_auto] max-[960px]:[grid-template-columns:minmax(0,1fr)]">
            <div>
              <Tag n="01" dark>THE ECOSYSTEM</Tag>
              <h2 className="font-wide metal-text-dark m-0 mt-5 text-[clamp(26px,2.9vw,42px)] font-extrabold leading-[1.04] min-[961px]:whitespace-nowrap">THREE PRODUCTS.<br />ONE CONNECTED SYSTEM.</h2>
            </div>
            <p className="m-0 max-w-[420px] border-l border-ink-2/40 pl-6 text-[15px] leading-6 text-ink-2">
              One Million Markets brings token creation, decentralized exchange, and perpetual trading into a unified financial environment.
            </p>
            <div className="hatch h-6 w-40 max-[960px]:hidden" aria-hidden="true" />
          </div>
          <Reveal className="mt-10"><ProductCards /></Reveal>
        </div>
      </section>

      {/* NATIVE ASSET STRIP */}
      <section id="token" className="strip-v2 relative scroll-mt-20 overflow-hidden border-y border-[rgba(231,233,236,.1)]">
        <Image src="/brand/coin.webp" alt="" width={800} height={800} sizes="420px"
          className="blend-lighten pointer-events-none absolute left-[-120px] top-1/2 w-[420px] -translate-y-1/2 opacity-90 max-[960px]:hidden" />
        <div className="wrap relative grid items-center gap-8 py-12 [grid-template-columns:200px_minmax(0,1.3fr)_repeat(3,minmax(0,1fr))] max-[960px]:[grid-template-columns:repeat(2,minmax(0,1fr))]">
          <div className="max-[960px]:hidden" />
          <div className="max-[960px]:col-span-full">
            <Tag n="02">THE NATIVE ASSET</Tag>
            <div className="font-wide metal-text mt-3 text-[clamp(34px,3.4vw,50px)] font-extrabold leading-none">$MILLION</div>
            <p className="mb-0 mt-3 max-w-[320px] text-[13px] leading-5 text-mist">The native Solana token of One Million Markets, with a fixed total supply of 1,000,000.</p>
          </div>
          {[["1,000,000", "TOTAL SUPPLY"], ["$MILLION", "TOKEN SYMBOL"], ["1M.markets", "OFFICIAL WEBSITE"]].map(([v, k]) => (
            <div key={k} className="border-l border-[rgba(231,233,236,.16)] pl-8 max-[640px]:pl-4">
              <div className="font-wide metal-text text-[clamp(20px,2vw,30px)] font-bold">{v}</div>
              <div className="label mt-2 text-muted">{k}</div>
            </div>
          ))}
        </div>
      </section>

      {/* LIVE PRODUCT */}
      <section id="markets" className="sec scroll-mt-20 bg-[linear-gradient(180deg,#0c0e11,#07080a)] py-28">
        <div className="wrap">
          <div className="sm-stack flex items-end justify-between gap-8">
            <div>
              <Tag n="03">THE PLATFORM</Tag>
              <h2 className="font-wide metal-text m-0 mt-5 text-[clamp(30px,3.6vw,52px)] font-extrabold leading-[1.02]">BUILT FOR THE<br />WAY MARKETS MOVE.</h2>
            </div>
            <p className="m-0 max-w-[380px] text-[15px] leading-6 text-mist">Live reference prices, charts and order books. Switch between spot and perpetuals without leaving the terminal.</p>
          </div>
          <Reveal className="mt-12"><LiveExperience /></Reveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="hero-v2 border-t border-[rgba(231,233,236,.1)]">
        <div className="wrap relative z-10 grid items-center gap-10 py-24 [grid-template-columns:minmax(0,1.4fr)_minmax(0,1fr)] max-[960px]:[grid-template-columns:minmax(0,1fr)]">
          <div>
            <Tag n="04">1M.MARKETS</Tag>
            <h2 className="font-wide metal-text m-0 mt-6 text-[clamp(44px,6vw,96px)] font-extrabold leading-[0.95]">THE MARKET<br />IS YOURS.</h2>
            <div className="sm-stack mt-10 flex items-center gap-4">
              <Link className="btn btn-metal min-w-[220px] !justify-center !gap-3" href="/markets">Enter Markets <span className="arr" aria-hidden="true">↗</span></Link>
              <Link className="btn btn-ghost-metal min-w-[220px] !justify-center" href="/launchpad">Launch a Token</Link>
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-[420px]">
            <Image src="/brand/coin.webp" alt="" width={800} height={800} sizes="420px" className="blend-lighten h-full w-full" />
          </div>
        </div>
      </section>
    </>
  );
}
