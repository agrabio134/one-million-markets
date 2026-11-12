"use client";
import { useEffect, useMemo, useState } from "react";
import { createPublicClient, createWalletClient, custom, parseUnits, type Hash } from "viem";
import artifact from "@/lib/token-artifact.json";
import { LAUNCH_CHAINS, launchChain, chainLabel } from "@/lib/chains";
import { useWallet } from "@/lib/wallet";
import { fmt, shortAddr } from "@/lib/format";
import { IconExternal } from "../Icons";

type Form = { name: string; symbol: string; supply: string; decimals: string; description: string; chainId: number };
type Launch = { address: string; tx: string; chainId: number; name: string; symbol: string; supply: string; decimals: number; at: number; description?: string };
type Phase = { s: "idle" } | { s: "switching" } | { s: "signing" } | { s: "pending"; hash: Hash } | { s: "done"; launch: Launch } | { s: "error"; msg: string };

const LS = "omm.launches.v1";
const STEPS = ["Details", "Network", "Review & deploy"] as const;

function loadLaunches(): Launch[] { try { return JSON.parse(localStorage.getItem(LS) ?? "[]"); } catch { return []; } }
function saveLaunches(l: Launch[]) { try { localStorage.setItem(LS, JSON.stringify(l)); } catch {} }

function validate(f: Form) {
  const e: Partial<Record<keyof Form, string>> = {};
  if (!f.name.trim()) e.name = "Required.";
  else if (f.name.trim().length > 40) e.name = "40 characters maximum.";
  if (!/^[A-Z0-9]{1,11}$/.test(f.symbol)) e.symbol = "1–11 characters, A–Z and 0–9.";
  const sup = f.supply.replace(/,/g, "");
  if (!/^\d+$/.test(sup) || BigInt(sup || "0") <= 0n) e.supply = "Whole number greater than zero.";
  else if (BigInt(sup) > 1_000_000_000_000_000n) e.supply = "Maximum 1,000,000,000,000,000.";
  const d = Number(f.decimals);
  if (!/^\d+$/.test(f.decimals) || d > 18) e.decimals = "0–18.";
  if (f.description.length > 280) e.description = "280 characters maximum.";
  return e;
}

function errMsg(e: unknown) {
  const x = e as { shortMessage?: string; message?: string; code?: number };
  if (x?.code === 4001 || /rejected|denied/i.test(x?.message ?? "")) return "Transaction rejected in wallet.";
  if (/insufficient funds/i.test(x?.message ?? "")) return "Insufficient test ETH for gas on this network.";
  return x?.shortMessage ?? x?.message ?? "Deployment failed.";
}

export function Launchpad() {
  const w = useWallet();
  const [step, setStep] = useState(0);
  const [touched, setTouched] = useState(false);
  const [f, setF] = useState<Form>({ name: "", symbol: "", supply: "1000000", decimals: "18", description: "", chainId: LAUNCH_CHAINS[0].chain.id });
  const [phase, setPhase] = useState<Phase>({ s: "idle" });
  const [launches, setLaunches] = useState<Launch[]>([]);
  useEffect(() => setLaunches(loadLaunches()), []);

  const errors = useMemo(() => validate(f), [f]);
  const detailsOk = Object.keys(errors).length === 0;
  const target = launchChain(f.chainId)!;
  const onRightChain = w.chainId === f.chainId;
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    let v: string | number = e.target.value;
    if (k === "symbol") v = String(v).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11);
    if (k === "supply") v = String(v).replace(/[^0-9]/g, "");
    if (k === "decimals") v = String(v).replace(/[^0-9]/g, "").slice(0, 2);
    if (k === "chainId") v = Number(v);
    setF((s) => ({ ...s, [k]: v }));
  };

  async function switchNet() {
    setPhase({ s: "switching" });
    try {
      const c = target.chain;
      await w.switchChain(c.id, {
        chainId: `0x${c.id.toString(16)}`, chainName: c.name, rpcUrls: [...c.rpcUrls.default.http],
        nativeCurrency: c.nativeCurrency, blockExplorerUrls: [target.explorer],
      });
      setPhase({ s: "idle" });
    } catch (e) { setPhase({ s: "error", msg: errMsg(e) }); }
  }

  async function deploy() {
    if (!w.provider || !w.address) return w.openPicker();
    if (!onRightChain) return switchNet();
    const chain = target.chain;
    try {
      setPhase({ s: "signing" });
      const wallet = createWalletClient({ account: w.address, chain, transport: custom(w.provider) });
      const pub = createPublicClient({ chain, transport: custom(w.provider) });
      const dec = Number(f.decimals);
      const hash = await wallet.deployContract({
        abi: artifact.abi, bytecode: artifact.bytecode as `0x${string}`,
        args: [f.name.trim(), f.symbol, dec, parseUnits(f.supply, dec)],
      });
      setPhase({ s: "pending", hash });
      const rc = await pub.waitForTransactionReceipt({ hash, timeout: 180_000 });
      if (rc.status !== "success" || !rc.contractAddress) throw new Error("Deployment transaction reverted.");
      const launch: Launch = { address: rc.contractAddress, tx: hash, chainId: chain.id, name: f.name.trim(), symbol: f.symbol, supply: f.supply, decimals: dec, at: Date.now(), description: f.description || undefined };
      const next = [launch, ...loadLaunches()].slice(0, 50);
      saveLaunches(next); setLaunches(next); setPhase({ s: "done", launch });
    } catch (e) { setPhase({ s: "error", msg: errMsg(e) }); }
  }

  async function addToWallet(l: Launch) {
    try {
      await w.provider?.request({ method: "wallet_watchAsset", params: { type: "ERC20", options: { address: l.address, symbol: l.symbol, decimals: l.decimals } } } as never);
    } catch {}
  }

  function reset() { setPhase({ s: "idle" }); setStep(0); setTouched(false); setF((s) => ({ ...s, name: "", symbol: "", description: "" })); }

  const busy = phase.s === "signing" || phase.s === "pending" || phase.s === "switching";
  const showErr = (k: keyof Form) => touched && errors[k];

  return (
    <div className="g12 gap-y-6">
      <section className="col-span-8 panel overflow-hidden" aria-label="Create token">
        <div className="sm-stack flex items-center justify-between gap-3 border-b border-[#262a30] px-6 py-4">
          <ol className="m-0 flex list-none gap-6 p-0">
            {STEPS.map((s, i) => (
              <li key={s} className={`label ${i === step ? "text-platinum" : i < step ? "text-mist" : "text-steel"}`} aria-current={i === step ? "step" : undefined}>
                <span className="text-steel">0{i + 1}</span> {s}
              </li>
            ))}
          </ol>
          <span className="badge label">Testnet</span>
        </div>

        {phase.s === "done" ? (
          <div className="p-8">
            <div className="label text-up">Deployed</div>
            <h2 className="disp mt-4 text-[48px]">{phase.launch.name}<span className="text-steel"> · {phase.launch.symbol}</span></h2>
            <dl className="mt-8 grid gap-3 text-[14px]">
              <KV k="Contract" v={<span className="num break-all">{phase.launch.address}</span>} />
              <KV k="Network" v={chainLabel(phase.launch.chainId)} />
              <KV k="Supply minted to you" v={<span className="num">{fmt(Number(phase.launch.supply), 0)} {phase.launch.symbol}</span>} />
            </dl>
            <div className="sm-stack mt-8 flex flex-wrap gap-2">
              <a className="btn btn-silver btn-sm" href={`${launchChain(phase.launch.chainId)!.explorer}/address/${phase.launch.address}`} target="_blank" rel="noreferrer">View on explorer <IconExternal /></a>
              <button className="btn btn-line btn-sm" onClick={() => addToWallet(phase.launch)}>Add to wallet</button>
              <button className="btn btn-line btn-sm" onClick={reset}>Create another</button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {step === 0 && (
              <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
                <Field label="Token name" err={showErr("name")}><input className="field field-sans" value={f.name} onChange={set("name")} placeholder="e.g. Northfield Collective" maxLength={40} aria-invalid={!!showErr("name")} /></Field>
                <Field label="Ticker" err={showErr("symbol")}><input className="field" value={f.symbol} onChange={set("symbol")} placeholder="NFC" aria-invalid={!!showErr("symbol")} /></Field>
                <Field label="Total supply (whole tokens)" err={showErr("supply")} hint={f.supply && !errors.supply ? `${fmt(Number(f.supply), 0)} tokens, fixed. No further minting.` : undefined}>
                  <input className="field" inputMode="numeric" value={f.supply} onChange={set("supply")} aria-invalid={!!showErr("supply")} />
                </Field>
                <Field label="Decimals" err={showErr("decimals")} hint="18 is standard for EVM tokens."><input className="field" inputMode="numeric" value={f.decimals} onChange={set("decimals")} aria-invalid={!!showErr("decimals")} /></Field>
                <div className="col-span-full">
                  <Field label="Description (optional, stored in this browser only)" err={showErr("description")}>
                    <textarea className="field field-sans" rows={3} value={f.description} onChange={set("description")} placeholder="What is this token for?" />
                  </Field>
                </div>
              </div>
            )}
            {step === 1 && (
              <div className="grid gap-5">
                <Field label="Deployment network">
                  <select className="field" value={f.chainId} onChange={set("chainId")}>
                    {LAUNCH_CHAINS.map((c) => <option key={c.chain.id} value={c.chain.id}>{c.label}</option>)}
                  </select>
                </Field>
                <div className="rounded border border-rule-2 bg-well">
                  <div className="grid grid-cols-3 max-[640px]:grid-cols-1">
                    <div className="border-r border-[#1e2227] p-4 max-[640px]:border-b max-[640px]:border-r-0"><div className="label text-muted">Wallet</div><div className="num mt-1 text-[14px]">{w.address ? shortAddr(w.address) : "Not connected"}</div></div>
                    <div className="border-r border-[#1e2227] p-4 max-[640px]:border-b max-[640px]:border-r-0"><div className="label text-muted">Current network</div><div className="mt-1 text-[14px]">{w.address ? chainLabel(w.chainId) : "—"}</div></div>
                    <div className="p-4"><div className="label text-muted">Gas paid in</div><div className="mt-1 text-[14px]">{target.faucetHint}</div></div>
                  </div>
                </div>
                {!w.address ? (
                  <button className="btn btn-silver self-start" onClick={w.openPicker}>Connect wallet <span className="arr" aria-hidden="true">→</span></button>
                ) : !onRightChain ? (
                  <button className="btn btn-silver self-start" onClick={switchNet} disabled={busy}>{phase.s === "switching" ? "Confirm in wallet…" : `Switch to ${target.label}`}</button>
                ) : (
                  <div className="flex items-center gap-2 text-[14px] text-up"><span className="dot dot-live" />Ready on {target.label}</div>
                )}
              </div>
            )}
            {step === 2 && (
              <div className="grid gap-5">
                <dl className="m-0 grid gap-3 rounded border border-rule-2 bg-well p-5 text-[14px]">
                  <KV k="Name" v={f.name} /><KV k="Ticker" v={<span className="num">{f.symbol}</span>} />
                  <KV k="Total supply" v={<span className="num">{fmt(Number(f.supply), 0)}</span>} /><KV k="Decimals" v={<span className="num">{f.decimals}</span>} />
                  <KV k="Network" v={target.label} /><KV k="Recipient of full supply" v={<span className="num">{w.address ? shortAddr(w.address) : "Connect wallet"}</span>} />
                  <KV k="Contract" v="Fixed-supply ERC-20 · no owner, no mint, no pause" />
                </dl>
                {phase.s === "pending" && (
                  <div role="status" className="flex items-center gap-3 rounded border border-rule-2 p-4 text-[13px] text-mist">
                    <span className="dot dot-live" />Waiting for confirmation ·
                    <a className="num" href={`${target.explorer}/tx/${phase.hash}`} target="_blank" rel="noreferrer">{shortAddr(phase.hash)}</a>
                  </div>
                )}
              </div>
            )}

            {phase.s === "error" && <div role="alert" className="mt-5 rounded border border-[#5a2f27] bg-[#1e1412] px-4 py-3 text-[13px] text-[#f4b3a4]">{phase.msg}</div>}

            <div className="sm-stack mt-8 flex items-center justify-between gap-4 border-t border-[#262a30] pt-5">
              <button className="btn btn-line btn-sm" onClick={() => { setPhase({ s: "idle" }); setStep((s) => Math.max(0, s - 1)); }} disabled={step === 0 || busy}>Back</button>
              {step < 2 ? (
                <button className="btn btn-silver btn-sm" onClick={() => { setTouched(true); if (step === 0 && !detailsOk) return; setPhase({ s: "idle" }); setStep((s) => s + 1); }}
                  disabled={step === 1 && (!w.address || !onRightChain)}>Continue <span className="arr" aria-hidden="true">→</span></button>
              ) : (
                <button className="btn btn-silver btn-sm" onClick={deploy} disabled={busy || !detailsOk}>
                  {phase.s === "signing" ? "Confirm in wallet…" : phase.s === "pending" ? "Deploying…" : !w.address ? "Connect wallet" : !onRightChain ? `Switch to ${target.label}` : "Deploy token"} <span className="arr" aria-hidden="true">→</span>
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      <aside className="col-span-4 flex flex-col gap-6">
        <div className="panel p-6">
          <div className="label text-muted">How it works</div>
          <ol className="m-0 mt-4 grid list-none gap-4 p-0 text-[14px] leading-[22px] text-mist">
            <li><span className="num text-platinum">01</span> Define the token. Supply is fixed at deployment.</li>
            <li><span className="num text-platinum">02</span> Connect a wallet on a supported test network.</li>
            <li><span className="num text-platinum">03</span> Sign one transaction. The contract is deployed from your wallet and the full supply is minted to you.</li>
          </ol>
          <p className="mb-0 mt-5 text-[12px] leading-[18px] text-muted">Mainnet launches, liquidity configuration and DEX listing open with the One Million Markets mainnet release.</p>
        </div>
        <div className="panel overflow-hidden">
          <div className="flex justify-between border-b border-[#262a30] px-5 py-3.5"><span className="label text-platinum">My launches</span><span className="label text-muted">This browser</span></div>
          {launches.length === 0 ? (
            <div className="p-5 text-[13px] text-muted">No tokens launched from this browser yet.</div>
          ) : launches.map((l) => (
            <a key={l.address + l.chainId} href={`${launchChain(l.chainId)?.explorer}/address/${l.address}`} target="_blank" rel="noreferrer"
              className="grid gap-1 border-b border-[#1e2227] px-5 py-3 text-[13px] no-underline transition-colors last:border-b-0 hover:bg-[#1e2227]">
              <span className="flex justify-between"><span className="font-medium">{l.name}</span><span className="num text-mist">{l.symbol}</span></span>
              <span className="num flex justify-between text-[12px] text-muted"><span>{shortAddr(l.address)}</span><span>{chainLabel(l.chainId)}</span></span>
            </a>
          ))}
        </div>
      </aside>
    </div>
  );
}

function Field({ label, err, hint, children }: { label: string; err?: string | false; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className={`label ${err ? "text-down" : "text-mist"}`}>{label}</span>
      {children}
      {err ? <span className="text-[12px] text-down">{err}</span> : hint ? <span className="text-[12px] text-muted">{hint}</span> : null}
    </label>
  );
}
function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex justify-between gap-6"><dt className="text-muted">{k}</dt><dd className="m-0 text-right text-platinum">{v}</dd></div>;
}
