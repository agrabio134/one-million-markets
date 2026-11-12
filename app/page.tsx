import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/home/Reveal";
import { LiveExperience } from "@/components/home/LiveExperience";
import { DexMini } from "@/components/home/DexMini";

function SecLabel({ n, children, light = false }: { n: string; children: React.ReactNode; light?: boolean }) {
  return (
    <div className={`label flex items-center gap-4 ${light ? "text-ink-muted" : "text-muted"}`}>
      <span className={light ? "text-obsidian" : "text-platinum"}>{n}</span>
      <span className={`h-px w-8 ${light ? "bg-silver" : "bg-[#3a3f46]"}`} />{children}
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* 01 HERO */}
      <section id="top" className="hero-grid border-b border-rule bg-obsidian" aria-labelledby="hero-title">
        <div className="wrap g12 items-stretch pt-[88px]">
          <div className="col-span-7 flex flex-col pb-16">
            <div className="fade"><SecLabel n="01">The Million Ecosystem</SecLabel></div>
            <h1 id="hero-title" className="disp mt-10 text-[clamp(56px,8.6vw,136px)] text-offwhite">
              <span className="mask"><span>ONE MILLION.</span></span>
              <span className="mask d2"><span className="text-[#9ea4ab]">EVERY MARKET.</span></span>
            </h1>
            <p className="fade d1 mb-0 mt-10 max-w-[520px] text-[19px] leading-[30px] text-mist">
              Launch tokens, trade decentralized assets, and access perpetual markets through one connected ecosystem.
            </p>
            <div className="fade d2 sm-stack mt-10 flex items-center gap-3">
              <Link className="btn btn-silver min-w-[220px]" href="/markets">Enter Markets <span className="arr" aria-hidden="true">→</span></Link>
              <a className="btn btn-line min-w-[220px]" href="#ecosystem">Explore Ecosystem <span className="arr" aria-hidden="true">↓</span></a>
            </div>
            <div className="extend mt-14 h-px bg-[#3a3f46]" />
            <nav aria-label="Products" className="fade d3 sm-stack flex items-center gap-8 pt-5">
              <Link className="label text-platinum no-underline hover:text-white" href="/launchpad"><span className="text-steel">01</span> Launchpad</Link>
              <span aria-hidden="true" className="sm-hide text-[#3a3f46]">/</span>
              <Link className="label text-platinum no-underline hover:text-white" href="/dex"><span className="text-steel">02</span> DEX</Link>
              <span aria-hidden="true" className="sm-hide text-[#3a3f46]">/</span>
              <Link className="label text-platinum no-underline hover:text-white" href="/perpetuals"><span className="text-steel">03</span> Perpetuals</Link>
            </nav>
          </div>
          <div className="col-span-5 flex flex-col">
            <div className="coin-frame relative h-full min-h-[600px] overflow-hidden border border-b-0 border-carbon bg-black max-[960px]:mt-6 max-[960px]:min-h-[420px] max-[640px]:min-h-[360px]">
              <Image src="/brand/coin.webp" alt="The official One Million Markets silver coin" width={800} height={800} priority
                sizes="(max-width: 960px) 130vw, 760px" className="coin-in coin-img absolute left-[4%] top-[10%] block w-[132%] max-w-none" />
              <div aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px bg-[rgba(231,233,236,.08)]" />
              <div aria-hidden="true" className="absolute inset-y-0 left-1/2 w-px bg-[rgba(231,233,236,.08)]" />
              <div aria-hidden="true" className="pointer-events-none absolute inset-4 border border-[rgba(231,233,236,.1)]" />
              <div className="label absolute left-8 top-7 text-platinum">Fig. 01</div>
              <div className="label absolute right-8 top-7 text-mist">One Million Markets</div>
              <div className="label absolute bottom-7 left-8 text-mist">Est. 2026</div>
              <div className="label num absolute bottom-7 right-8 text-platinum">1,000,000 $MILLION</div>
              <svg aria-hidden="true" className="absolute bottom-16 left-0 block h-2.5 w-full" preserveAspectRatio="none" viewBox="0 0 400 10">
                {Array.from({ length: 41 }).map((_, t) => <line key={t} x1={t * 10} x2={t * 10} y1={t % 5 === 0 ? 0 : 5} y2="10" stroke="#5b6168" vectorEffect="non-scaling-stroke" />)}
              </svg>
            </div>
          </div>
        </div>
        <div className="border-t border-rule bg-obsidian">
          <dl className="wrap m-0 grid grid-cols-4 max-[640px]:grid-cols-2">
            {[["Products", "03"], ["Total supply", "1,000,000"], ["Token", "$MILLION"], ["Launchpad", "Testnet live"]].map(([k, v], i) => (
              <div key={k} className={`px-6 py-5 ${i === 0 ? "pl-0" : ""} border-r border-rule last:border-r-0 max-[640px]:pl-0`}>
                <dt className="label text-muted">{k}</dt>
                <dd className="num m-0 mt-1.5 flex items-center gap-2 text-[15px] text-offwhite">{i === 3 && <span className="dot dot-live" />}{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 02 ECOSYSTEM */}
      <section id="ecosystem" className="sec scroll-mt-20 bg-offwhite py-36 text-obsidian">
        <div className="wrap">
          <div className="g12 items-end gap-y-8">
            <div className="col-span-3 self-start pt-3.5"><SecLabel n="02" light>Ecosystem</SecLabel></div>
            <h2 className="disp col-span-9 text-[clamp(44px,6vw,92px)]">THREE PRODUCTS.<br />ONE CONNECTED SYSTEM.</h2>
            <div className="col-span-3" />
            <p className="col-span-5 m-0 mt-4 text-[18px] leading-7 text-ink-2">One Million Markets brings token creation, decentralized exchange, and perpetual trading into a unified financial environment.</p>
          </div>

          <div className="g12 mt-24 gap-y-6">
            {/* Launchpad */}
            <Reveal as="article" className="g12 col-span-12 !gap-x-0 overflow-hidden rounded border border-[#dadde1] bg-white">
              <div className="col-span-5 flex flex-col justify-between gap-12 border-r border-[#e3e6e9] p-12 max-[640px]:p-7">
                <div>
                  <div className="label text-ink-muted">Product 01 — Launchpad</div>
                  <h3 className="disp mt-8 text-[56px]">From Idea<br />to Market.</h3>
                  <p className="mb-0 mt-6 max-w-[400px] text-[16px] leading-[26px] text-ink-2">Create and launch tokens through a streamlined experience designed for creators and on-chain communities.</p>
                </div>
                <div><Link className="tlink text-obsidian" href="/launchpad">Explore Launchpad <span className="arr" aria-hidden="true">→</span></Link></div>
              </div>
              <div className="col-span-7 bg-offwhite px-12 py-10 max-[640px]:p-7">
                <div className="flex items-center justify-between border-b border-[#dadde1] pb-4">
                  <div className="flex items-center gap-3"><span className="label">New token</span><span className="label text-ink-muted">Step 1 of 3 · Details</span></div>
                  <span className="label rounded-sm border border-[#c9cdd2] px-2 py-[3px] text-ink-2">Testnet</span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4 max-[640px]:grid-cols-1" aria-hidden="true">
                  {[["Token name", "Northfield Collective"], ["Ticker", "NFC"], ["Total supply", "1,000,000"], ["Decimals", "18"]].map(([k, v]) => (
                    <div key={k} className="flex flex-col gap-2"><span className="label text-ink-2">{k}</span>
                      <div className="flex h-11 items-center rounded border border-[#d3d7dc] bg-white px-3.5 text-[14px] text-[#8a9098]">{v}</div></div>
                  ))}
                </div>
                <div className="mt-6 rounded border border-[#dadde1] bg-white">
                  <div className="label border-b border-[#e3e6e9] px-4 py-3">Launch configuration</div>
                  <div className="grid grid-cols-3">
                    {[["Network", "Base Sepolia"], ["Contract", "Fixed-supply ERC-20"], ["Signed by", "Your wallet"]].map(([k, v], i) => (
                      <div key={k} className={`px-4 py-3.5 ${i < 2 ? "border-r border-[#e3e6e9]" : ""}`}><div className="label text-ink-muted">{k}</div><div className="mt-1 text-[14px]">{v}</div></div>
                    ))}
                  </div>
                </div>
                <div className="sm-stack mt-6 flex items-center justify-between gap-4">
                  <span className="text-[13px] text-ink-muted">Deploys from your wallet on supported testnets.</span>
                  <Link className="btn btn-ink btn-sm" href="/launchpad">Start a launch <span className="arr" aria-hidden="true">→</span></Link>
                </div>
              </div>
            </Reveal>

            {/* DEX */}
            <Reveal as="article" className="col-span-7 flex flex-col gap-10 rounded bg-graphite p-12 text-platinum max-[640px]:p-7">
              <div className="sm-stack flex items-start justify-between gap-6">
                <div><div className="label text-muted">Product 02 — DEX</div><h3 className="disp mt-8 text-[56px] text-offwhite">Markets<br />in Motion.</h3></div>
                <p className="m-0 max-w-[300px] pt-1 text-[16px] leading-[26px] text-mist">Discover and trade decentralized assets through an interface built for clarity and efficient market navigation.</p>
              </div>
              <DexMini />
              <div><Link className="tlink text-platinum" href="/dex">Explore DEX <span className="arr" aria-hidden="true">→</span></Link></div>
            </Reveal>

            {/* Perpetuals */}
            <Reveal as="article" className="col-span-5 flex flex-col gap-10 rounded border border-[#d3d7dc] bg-platinum p-12 max-[640px]:p-7">
              <div>
                <div className="label text-ink-2">Product 03 — Perpetuals</div>
                <h3 className="disp mt-8 text-[56px]">Trade<br />Beyond Spot.</h3>
                <p className="mb-0 mt-6 text-[16px] leading-[26px] text-ink-2">Access perpetual market interfaces designed for active traders, with advanced position and risk-management workflows.</p>
              </div>
              <div className="rounded border border-[#d3d7dc] bg-white">
                <div className="flex justify-between border-b border-[#e3e6e9] px-4 py-3"><span className="text-[14px] font-semibold">Risk calculator</span><span className="label text-ink-muted">Example</span></div>
                <div className="grid grid-cols-3">
                  {[["Entry", "3,380.00"], ["Leverage", "5.0×"], ["Est. liq.", "2,720.90"]].map(([k, v], i) => (
                    <div key={k} className={`px-4 py-3 ${i < 2 ? "border-r border-[#e3e6e9]" : ""}`}><div className="label text-ink-muted">{k}</div><div className="num mt-1 text-[14px]">{v}</div></div>
                  ))}
                </div>
                <div className="border-t border-[#e3e6e9] px-4 pb-4 pt-3">
                  <div className="flex justify-between"><span className="label text-ink-muted">Distance to liquidation</span><span className="num text-[12px]">19.50%</span></div>
                  <div className="mt-2 h-1 rounded-[1px] bg-[#e3e6e9]"><div className="h-1 w-[39%] rounded-[1px] bg-obsidian" /></div>
                </div>
              </div>
              <div><Link className="tlink text-obsidian" href="/perpetuals">Explore Perpetuals <span className="arr" aria-hidden="true">→</span></Link></div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 03 PRODUCT EXPERIENCE */}
      <section id="markets" className="sec scroll-mt-20 border-t border-rule bg-graphite py-36">
        <div className="wrap">
          <div className="g12 items-end gap-y-8">
            <div className="col-span-3 self-start pt-3.5"><SecLabel n="03">Product</SecLabel></div>
            <h2 className="disp col-span-9 text-[clamp(44px,6vw,92px)] text-offwhite">DESIGNED FOR THE<br />WAY MARKETS MOVE.</h2>
          </div>
          <Reveal className="mt-[72px]"><LiveExperience /></Reveal>
        </div>
      </section>

      {/* 04 TOKEN */}
      <section id="token" className="sec scroll-mt-20 bg-platinum py-36 text-obsidian">
        <div className="wrap g12 items-center gap-y-16">
          <div className="col-span-6 flex flex-col">
            <SecLabel n="04" light>The Native Asset</SecLabel>
            <h2 className="disp mt-10 text-[clamp(48px,6.4vw,100px)]">ONE MILLION.<br />FIXED SUPPLY.</h2>
            <p className="mb-0 mt-8 max-w-[460px] text-[18px] leading-7 text-ink-2">$Million is the native token of One Million Markets, with a total supply of 1,000,000 tokens.</p>
            <dl className="m-0 mt-16 grid grid-cols-2 border-t border-obsidian">
              <div className="border-r border-silver pr-6 pt-6"><dd className="num m-0 text-[clamp(28px,3.6vw,52px)] font-medium tracking-[-0.03em]">1,000,000</dd><dt className="label mt-3 text-ink-2">Total supply</dt></div>
              <div className="pl-6 pt-6"><dd className="num m-0 text-[clamp(28px,3.6vw,52px)] font-medium tracking-[-0.03em]">$MILLION</dd><dt className="label mt-3 text-ink-2">Token symbol</dt></div>
            </dl>
          </div>
          <Reveal className="col-span-6">
            <div className="coin-frame relative aspect-square overflow-hidden rounded border border-obsidian bg-black">
              <Image src="/brand/coin.webp" alt="The official $MILLION silver coin" width={800} height={800} sizes="(max-width: 960px) 100vw, 680px" className="coin-img block h-full w-full object-cover" />
              <div aria-hidden="true" className="absolute inset-4 border border-[rgba(231,233,236,.12)]" />
              <div className="label absolute bottom-7 left-8 text-mist">Fig. 02 — $MILLION</div>
              <div className="label num absolute bottom-7 right-8 text-mist">1 / 1,000,000</div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 05 PHILOSOPHY */}
      <section id="philosophy" className="sec scroll-mt-20 border-t border-[#d3d7dc] bg-offwhite py-36 text-obsidian">
        <div className="wrap g12 gap-y-16">
          <Reveal className="col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded bg-black">
              <Image src="/brand/statue.webp" alt="The official One Million Markets silver statue" width={1254} height={1254} sizes="(max-width: 960px) 150vw, 900px"
                className="absolute left-[-32%] top-[-4%] block w-[150%] max-w-none grayscale-[1] contrast-[1.04]" />
              <div aria-hidden="true" className="absolute inset-4 border border-[rgba(231,233,236,.14)]" />
              <div className="label absolute left-8 top-7 text-platinum">Fig. 03</div>
              <div className="label absolute right-8 top-7 text-mist">The Signature</div>
            </div>
          </Reveal>
          <div className="col-span-1" />
          <div className="col-span-6 flex flex-col justify-between gap-16">
            <div>
              <SecLabel n="05" light>Philosophy</SecLabel>
              <h2 className="disp mt-10 text-[clamp(44px,5.4vw,84px)]">ONE VISION.<br />MULTIPLE MARKETS.</h2>
              <p className="mb-0 mt-10 max-w-[560px] font-display text-[26px] font-medium leading-9 tracking-[-0.015em] text-carbon">One Million Markets is building a connected environment for on-chain creators and traders — bringing essential decentralized financial experiences under one identity.</p>
            </div>
            <div className="border-t border-obsidian">
              {[["01", "Create", "Launchpad, for token creators.", "/launchpad"], ["02", "Exchange", "DEX, for spot markets.", "/dex"], ["03", "Extend", "Perpetuals, beyond spot.", "/perpetuals"]].map(([n, h, d, href]) => (
                <Link key={n} href={href} className="grid items-baseline gap-4 border-b border-[#d3d7dc] py-5 no-underline transition-colors hover:bg-white [grid-template-columns:64px_minmax(0,1fr)_minmax(0,1.4fr)]">
                  <span className="label text-ink-muted">{n}</span><span className="font-semibold">{h}</span><span className="text-[15px] text-ink-2">{d}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 06 FINAL CTA */}
      <section className="bg-obsidian text-platinum">
        <div className="wrap sec pb-[120px] pt-40">
          <SecLabel n="06">1M.markets</SecLabel>
          <h2 className="disp mt-12 text-[clamp(56px,11vw,176px)] tracking-[-0.055em] text-offwhite">THE MARKET<br /><span className="text-[#9ea4ab]">IS YOURS.</span></h2>
          <div className="sm-stack mt-16 flex items-end justify-between gap-8 border-t border-carbon pt-8">
            <p className="m-0 text-[19px] leading-[30px] text-mist">Explore the One Million Markets ecosystem.</p>
            <Link className="btn btn-silver min-w-[260px]" href="/markets">Enter Markets <span className="arr" aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>
    </>
  );
}
