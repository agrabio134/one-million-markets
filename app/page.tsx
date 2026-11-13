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
        <div aria-hidden="true" className="plate-tr pointer-events-none absolute right-0 top-0 h-[64px] w-[58%]" />
        <div aria-hidden="true" className="plate-bl pointer-events-none absolute bottom-0 left-0 h-[46px] w-[44%]" />
        <div aria-hidden="true" className="beam pointer-events-none absolute inset-y-0 left-[34%] w-[40%]" />
        <div className="wrap relative z-10 grid min-h-[330px] items-center gap-6 py-5 [grid-template-columns:minmax(0,6fr)_minmax(0,4.7fr)_170px] max-[1180px]:[grid-template-columns:minmax(0,1fr)_minmax(0,1fr)] max-[960px]:[grid-template-columns:minmax(0,1fr)] max-[960px]:py-10">
          <div className="relative z-20 flex flex-col">
            <div className="fade"><Tag n="01">/ THE MILLION ECOSYSTEM</Tag></div>
            <h1 id="hero-title" className="font-wide hero-metal m-0 mt-5 whitespace-nowrap text-[clamp(26px,3.6vw,56px)] font-bold leading-[1.02] tracking-[-0.005em] max-[960px]:whitespace-normal max-[960px]:text-[clamp(34px,10vw,56px)]">
              <span className="mask"><span>ONE MILLION.</span></span>
              <span className="mask d2"><span>EVERY MARKET.</span></span>
            </h1>
            <p className="fade d1 mb-0 mt-3 max-w-[500px] text-[15.5px] leading-[24px] text-[#d3d6da]">
              Launch tokens, trade decentralized assets, and access perpetual markets through one connected ecosystem.
            </p>
            <div className="fade d2 sm-stack mt-5 flex items-center gap-4">
              <Link className="btn btn-metal !h-12 min-w-[200px] !justify-center !gap-3" href="/markets">Enter Markets <span className="arr" aria-hidden="true">↗</span></Link>
              <a className="btn btn-ghost-metal !h-12 min-w-[200px] !justify-center" href="#ecosystem">Explore Ecosystem</a>
            </div>
            <nav aria-label="Products" className="fade d3 mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
              <Link className="label text-mist no-underline hover:text-white" href="/launchpad"><span className="text-platinum">01</span>&nbsp; LAUNCHPAD</Link>
              <span aria-hidden="true" className="sm-hide text-[#3a3f46]">/</span>
              <Link className="label text-mist no-underline hover:text-white" href="/dex"><span className="text-platinum">02</span>&nbsp; DEX</Link>
              <span aria-hidden="true" className="sm-hide text-[#3a3f46]">/</span>
              <Link className="label text-mist no-underline hover:text-white" href="/perpetuals"><span className="text-platinum">03</span>&nbsp; PERPETUALS</Link>
            </nav>
          </div>

          {/* Art: statue + coin */}
          <div className="relative h-[330px] max-[960px]:order-first max-[960px]:-mt-4 max-[960px]:h-[300px]">
            <div className="art-stage absolute bottom-[-20px] left-[-34%] right-[-7%] top-[-20px] overflow-hidden max-[960px]:inset-x-[-20px] max-[960px]:bottom-0 max-[960px]:top-[-56px]">
              <div className="statue-bottom absolute inset-0">
                <Image src="/brand/statue-cutout.webp" alt="The official One Million Markets silver statue" width={1254} height={1254} priority
                  sizes="(max-width: 960px) 120vw, 640px"
                  className="statue-shadow statue-edge coin-in absolute left-[-3%] top-[-6%] h-[118%] w-auto max-w-none max-[960px]:left-[-16%] max-[960px]:top-[2%] max-[960px]:h-[104%]" />
              </div>
              <Image src="/brand/coin.webp" alt="The official One Million Coin" width={800} height={800} priority
                sizes="(max-width: 960px) 60vw, 380px"
                className="coin-mask fade d2 absolute right-[-7%] top-[4%] h-[92%] w-auto max-w-none max-[960px]:right-[-9%] max-[960px]:top-[30%] max-[960px]:h-[60%]" />
            </div>
          </div>

          {/* Side plate */}
          <aside className="side-plate fade d3 flex h-[88%] flex-col justify-center gap-4 self-center px-6 py-7 max-[1180px]:col-span-full max-[1180px]:flex-row max-[1180px]:justify-between max-[1180px]:py-5 max-[640px]:flex-col">
            <div className="text-[14px] leading-[20px] text-[#d3d6da]">ONE<br />MILLION<br />MARKETS</div>
            <span className="h-px w-6 bg-[#717780] max-[1180px]:hidden" />
            <div className="text-[14px] text-[#d3d6da]">EST. 2026</div>
            <span className="h-px w-6 bg-[#717780] max-[1180px]:hidden" />
            <div className="text-[15px] leading-[21px] text-[#e7e9ec]">1,000,000<br />$MILLION</div>
          </aside>
        </div>
      </section>

      {/* ECOSYSTEM */}
      <section id="ecosystem" className="brushed relative scroll-mt-20 py-6 text-obsidian">
        <div className="wrap">
          <div className="grid items-end gap-8 [grid-template-columns:minmax(0,1.2fr)_minmax(0,1fr)_auto] max-[960px]:[grid-template-columns:minmax(0,1fr)]">
            <div>
              <Tag n="01" dark>THE ECOSYSTEM</Tag>
              <h2 className="font-wide metal-text-dark m-0 mt-3 text-[clamp(20px,2.1vw,30px)] font-bold leading-[1.06] min-[961px]:whitespace-nowrap">THREE PRODUCTS.<br />ONE CONNECTED SYSTEM.</h2>
            </div>
            <p className="m-0 max-w-[400px] border-l border-ink-2/40 pl-5 text-[14px] leading-[22px] text-ink-2">
              One Million Markets brings token creation, decentralized exchange, and perpetual trading into a unified financial environment.
            </p>
            <div className="hatch h-5 w-28 self-start max-[960px]:hidden" aria-hidden="true" />
          </div>
          <Reveal className="mt-5"><ProductCards /></Reveal>
        </div>
      </section>

      {/* NATIVE ASSET STRIP */}
      <section id="token" className="strip-v2 relative scroll-mt-20 overflow-hidden border-y border-[rgba(231,233,236,.1)]">
        <Image src="/brand/coin.webp" alt="" width={800} height={800} sizes="360px"
          className="coin-mask blend-lighten pointer-events-none absolute left-[-60px] top-[-40px] w-[300px] opacity-95 max-[960px]:hidden" />
        <div className="wrap relative grid items-center gap-8 py-4 [grid-template-columns:240px_minmax(0,1.2fr)_repeat(3,minmax(0,1fr))] max-[960px]:[grid-template-columns:repeat(2,minmax(0,1fr))]">
          <div className="max-[960px]:hidden" />
          <div className="max-[960px]:col-span-full">
            <Tag n="02">THE NATIVE ASSET</Tag>
            <div className="font-wide hero-metal mt-2 text-[clamp(28px,2.7vw,40px)] font-bold leading-none">$MILLION</div>
          </div>
          {[["1,000,000", "TOTAL SUPPLY"], ["$MILLION", "TOKEN SYMBOL"], ["1M.markets", "OFFICIAL WEBSITE"]].map(([v, k]) => (
            <div key={k} className="border-l border-[rgba(231,233,236,.16)] pl-8 max-[640px]:pl-4">
              <div className="metal-text text-[clamp(20px,1.9vw,28px)] font-medium tracking-[0.01em]">{v}</div>
              <div className="label mt-1.5 text-muted">{k}</div>
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
