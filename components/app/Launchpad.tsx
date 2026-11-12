"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { buildLaunchTx, U64_MAX } from "@/lib/spl";
import { CLUSTERS, cluster, explorerUrl, solscanUrl, type ClusterKey } from "@/lib/solana";
import { useWallet } from "@/lib/wallet";
import { fmt, shortAddr } from "@/lib/format";
import { IconExternal } from "../Icons";
import { ImagePicker } from "./ImagePicker";

type Form = { name: string; symbol: string; supply: string; decimals: string; description: string; cluster: ClusterKey };
type Launch = { mint: string; sig: string; cluster: ClusterKey; name: string; symbol: string; supply: string; decimals: number; at: number; description?: string; image?: string | null };
type Phase = { s: "idle" } | { s: "uploading" } | { s: "building" } | { s: "signing" } | { s: "pending"; sig: string } | { s: "done"; launch: Launch } | { s: "error"; msg: string };

const LS = "omm.sol.launches.v1";
const STEPS = ["Details", "Network", "Review & launch"] as const;

function loadLaunches(): Launch[] { try { return JSON.parse(localStorage.getItem(LS) ?? "[]"); } catch { return []; } }
function saveLaunches(l: Launch[]) { try { localStorage.setItem(LS, JSON.stringify(l)); } catch {} }
const bytes = (s: string) => new TextEncoder().encode(s).length;

function validate(f: Form) {
  const e: Partial<Record<keyof Form, string>> = {};
  if (!f.name.trim()) e.name = "Required.";
  else if (bytes(f.name.trim()) > 32) e.name = "32 characters maximum.";
  if (!/^[A-Z0-9]{1,10}$/.test(f.symbol)) e.symbol = "1–10 characters, A–Z and 0–9.";
  const d = Number(f.decimals);
  if (!/^\d+$/.test(f.decimals) || d > 9) e.decimals = "0–9.";
  if (!/^\d+$/.test(f.supply) || BigInt(f.supply || "0") <= 0n) e.supply = "Whole number greater than zero.";
  else if (!e.decimals && BigInt(f.supply) * 10n ** BigInt(d) > U64_MAX) e.supply = "Too large for these decimals. Lower the supply or decimals.";
  if (f.description.length > 280) e.description = "280 characters maximum.";
  return e;
}

function errMsg(e: unknown) {
  const x = e as { message?: string; name?: string; logs?: string[] };
  const m = x?.message ?? "";
  if (/reject|denied|cancel/i.test(m)) return "Transaction rejected in wallet.";
  if (/insufficient|0x1\b|debit an account/i.test(m)) return "Not enough SOL to pay rent and fees on this network.";
  if (/blockhash/i.test(m)) return "The network took too long to confirm. Check the explorer, then try again if needed.";
  if (/too large/i.test(m)) return "Metadata too long for one transaction. Shorten the name or URI.";
  return m || "Launch failed.";
}

export function Launchpad() {
  const w = useWallet();
  const [step, setStep] = useState(0);
  const [touched, setTouched] = useState(false);
  const [f, setF] = useState<Form>({ name: "", symbol: "", supply: "1000000", decimals: "6", description: "", cluster: "devnet" });
  const [image, setImage] = useState<File | null>(null);
  const uploaded = useRef<{ key: string; uri: string; image: string | null } | null>(null);
  const [phase, setPhase] = useState<Phase>({ s: "idle" });
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [airdrop, setAirdrop] = useState<"idle" | "busy" | "ok" | "fail">("idle");
  useEffect(() => setLaunches(loadLaunches()), []);

  const c = cluster(f.cluster);
  const connection = useMemo(() => (c.rpc ? new Connection(c.rpc, "confirmed") : null), [c.rpc]);
  const errors = useMemo(() => validate(f), [f]);
  const detailsOk = Object.keys(errors).length === 0;
  const showErr = (k: keyof Form) => touched && errors[k];
  const owner = w.adapter.publicKey;

  const refreshBalance = useCallback(async () => {
    if (!connection || !owner) return setBalance(null);
    try { setBalance((await connection.getBalance(owner)) / LAMPORTS_PER_SOL); } catch { setBalance(null); }
  }, [connection, owner]);
  useEffect(() => { refreshBalance(); }, [refreshBalance]);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    let v = e.target.value;
    if (k === "symbol") v = v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
    if (k === "supply") v = v.replace(/[^0-9]/g, "");
    if (k === "decimals") v = v.replace(/[^0-9]/g, "").slice(0, 1);
    setF((s) => ({ ...s, [k]: v }));
  };

  async function requestAirdrop() {
    if (!connection || !owner) return;
    setAirdrop("busy");
    try {
      const sig = await connection.requestAirdrop(owner, LAMPORTS_PER_SOL);
      const bh = await connection.getLatestBlockhash();
      await connection.confirmTransaction({ signature: sig, ...bh }, "confirmed");
      setAirdrop("ok"); refreshBalance();
    } catch { setAirdrop("fail"); }
  }

  async function launch() {
    if (!owner || !w.adapter.sendTransaction) return w.openPicker();
    if (!connection) return;
    try {
      let uri = "", imageUrl: string | null = null;
      if (image || f.description.trim()) {
        const key = [f.name.trim(), f.symbol, f.description.trim(), image?.name, image?.size, image?.lastModified].join("|");
        if (uploaded.current?.key === key) ({ uri, image: imageUrl } = uploaded.current);
        else {
          setPhase({ s: "uploading" });
          const fd = new FormData();
          fd.set("name", f.name.trim()); fd.set("symbol", f.symbol); fd.set("description", f.description.trim());
          if (image) fd.set("image", image);
          const res = await fetch("/api/token-metadata", { method: "POST", body: fd });
          const j = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(j.error ?? "Image upload failed.");
          uri = j.uri; imageUrl = j.image;
          uploaded.current = { key, uri, image: imageUrl };
        }
      }
      setPhase({ s: "building" });
      const { tx, mint } = await buildLaunchTx(connection, owner, {
        name: f.name.trim(), symbol: f.symbol, uri, decimals: Number(f.decimals), supply: BigInt(f.supply),
      });
      const bh = await connection.getLatestBlockhash("confirmed");
      tx.recentBlockhash = bh.blockhash;
      setPhase({ s: "signing" });
      const sig = await w.adapter.sendTransaction(tx, connection, { signers: [mint], preflightCommitment: "confirmed" });
      setPhase({ s: "pending", sig });
      const res = await connection.confirmTransaction({ signature: sig, ...bh }, "confirmed");
      if (res.value.err) throw new Error("The launch transaction failed on-chain.");
      const l: Launch = { mint: mint.publicKey.toBase58(), sig, cluster: f.cluster, name: f.name.trim(), symbol: f.symbol, supply: f.supply, decimals: Number(f.decimals), at: Date.now(), description: f.description || undefined, image: imageUrl };
      const next = [l, ...loadLaunches()].slice(0, 50);
      saveLaunches(next); setLaunches(next); setPhase({ s: "done", launch: l }); refreshBalance();
    } catch (e) { setPhase({ s: "error", msg: errMsg(e) }); }
  }

  function reset() { setPhase({ s: "idle" }); setStep(0); setTouched(false); setF((s) => ({ ...s, name: "", symbol: "", description: "" })); setImage(null); uploaded.current = null; }

  const busy = phase.s === "uploading" || phase.s === "building" || phase.s === "signing" || phase.s === "pending";
  const networkOk = !!owner && !!c.rpc;

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
          <span className="badge label">{c.real ? "Mainnet" : "Devnet"}</span>
        </div>

        {phase.s === "done" ? (
          <div className="p-8">
            <div className="flex items-center gap-5">
              {phase.launch.image && <img src={phase.launch.image} alt="" className="h-20 w-20 rounded-full border border-rule-2 object-cover" />}
              <div className="label text-up">Launched on {cluster(phase.launch.cluster).label}</div>
            </div>
            <h2 className="disp mt-4 text-[48px]">{phase.launch.name}<span className="text-steel"> · {phase.launch.symbol}</span></h2>
            <dl className="mt-8 grid gap-3 text-[14px]">
              <KV k="Mint address" v={<span className="num break-all">{phase.launch.mint}</span>} />
              <KV k="Supply minted to you" v={<span className="num">{fmt(Number(phase.launch.supply), 0)} {phase.launch.symbol}</span>} />
              <KV k="Mint authority" v="Revoked — supply is permanently fixed" />
              <KV k="Freeze authority" v="None" />
            </dl>
            <div className="sm-stack mt-8 flex flex-wrap gap-2">
              <a className="btn btn-silver btn-sm" href={explorerUrl("address", phase.launch.mint, phase.launch.cluster)} target="_blank" rel="noreferrer">Solana Explorer <IconExternal /></a>
              <a className="btn btn-line btn-sm" href={solscanUrl("token", phase.launch.mint, phase.launch.cluster)} target="_blank" rel="noreferrer">Solscan <IconExternal /></a>
              <button className="btn btn-line btn-sm" onClick={() => navigator.clipboard?.writeText(phase.launch.mint).catch(() => {})}>Copy mint</button>
              <button className="btn btn-line btn-sm" onClick={reset}>Create another</button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {step === 0 && (
              <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
                <Field label="Token name" err={showErr("name")}><input className="field field-sans" value={f.name} onChange={set("name")} placeholder="e.g. Northfield Collective" maxLength={32} aria-invalid={!!showErr("name")} /></Field>
                <Field label="Ticker" err={showErr("symbol")}><input className="field" value={f.symbol} onChange={set("symbol")} placeholder="NFC" aria-invalid={!!showErr("symbol")} /></Field>
                <Field label="Total supply (whole tokens)" err={showErr("supply")} hint={f.supply && !errors.supply ? `${fmt(Number(f.supply), 0)} tokens. Mint authority is revoked at launch.` : undefined}>
                  <input className="field" inputMode="numeric" value={f.supply} onChange={set("supply")} aria-invalid={!!showErr("supply")} />
                </Field>
                <Field label="Decimals" err={showErr("decimals")} hint="6 is common for Solana launches; 9 matches SOL."><input className="field" inputMode="numeric" value={f.decimals} onChange={set("decimals")} aria-invalid={!!showErr("decimals")} /></Field>
                <div className="col-span-full">
                  <ImagePicker file={image} onChange={setImage} disabled={busy} />
                </div>
                <div className="col-span-full">
                  <Field label="Description (optional, public)" err={showErr("description")} hint="Shown by wallets and explorers alongside the image.">
                    <textarea className="field field-sans" rows={2} value={f.description} onChange={set("description")} placeholder="What is this token for?" maxLength={280} />
                  </Field>
                </div>
              </div>
            )}
            {step === 1 && (
              <div className="grid gap-5">
                <Field label="Network">
                  <select className="field" value={f.cluster} onChange={set("cluster")}>
                    {CLUSTERS.map((x) => <option key={x.key} value={x.key} disabled={!x.rpc}>{x.label}{x.rpc ? "" : " (not enabled)"}</option>)}
                  </select>
                </Field>
                <p className={`m-0 text-[13px] ${c.real ? "text-[#e6b76a]" : "text-muted"}`}>{c.note}</p>
                <div className="rounded border border-rule-2 bg-well">
                  <div className="grid grid-cols-3 max-[640px]:grid-cols-1">
                    <div className="border-r border-[#1e2227] p-4 max-[640px]:border-b max-[640px]:border-r-0"><div className="label text-muted">Wallet</div><div className="num mt-1 text-[14px]">{w.address ? shortAddr(w.address) : "Not connected"}</div></div>
                    <div className="border-r border-[#1e2227] p-4 max-[640px]:border-b max-[640px]:border-r-0"><div className="label text-muted">Balance</div><div className="num mt-1 text-[14px]">{balance === null ? "—" : `${fmt(balance, 4)} SOL`}</div></div>
                    <div className="p-4"><div className="label text-muted">Est. cost</div><div className="mt-1 text-[14px]">≈ 0.005 SOL rent + fees</div></div>
                  </div>
                </div>
                {!w.address ? (
                  <button className="btn btn-silver self-start" onClick={w.openPicker}>Connect wallet <span className="arr" aria-hidden="true">→</span></button>
                ) : f.cluster === "devnet" && (balance ?? 0) < 0.02 ? (
                  <div className="sm-stack flex items-center gap-3">
                    <button className="btn btn-line btn-sm" onClick={requestAirdrop} disabled={airdrop === "busy"}>{airdrop === "busy" ? "Requesting…" : "Request 1 devnet SOL"}</button>
                    {airdrop === "fail" && <span className="text-[13px] text-down">Faucet is rate-limited. Use <a href="https://faucet.solana.com" target="_blank" rel="noreferrer">faucet.solana.com</a>.</span>}
                    {airdrop === "ok" && <span className="text-[13px] text-up">Devnet SOL received.</span>}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[14px] text-up"><span className="dot dot-live" />Ready on {c.label}</div>
                )}
                <p className="m-0 text-[12px] text-muted">Switch your wallet to {c.real ? "Mainnet" : "Devnet"} as well, so it shows the right balance and simulation.</p>
              </div>
            )}
            {step === 2 && (
              <div className="grid gap-5">
                <dl className="m-0 grid gap-3 rounded border border-rule-2 bg-well p-5 text-[14px]">
                  <KV k="Image" v={image ? <Thumb file={image} /> : <span className="text-muted">None</span>} />
                  <KV k="Name" v={f.name} /><KV k="Ticker" v={<span className="num">{f.symbol}</span>} />
                  <KV k="Total supply" v={<span className="num">{fmt(Number(f.supply), 0)}</span>} /><KV k="Decimals" v={<span className="num">{f.decimals}</span>} />
                  <KV k="Network" v={c.label} /><KV k="Recipient of full supply" v={<span className="num">{w.address ? shortAddr(w.address) : "Connect wallet"}</span>} />
                  <KV k="Token program" v="Token-2022 · on-chain metadata" />
                  {(image || f.description.trim()) && <KV k="Metadata file" v="Uploaded at launch (image + JSON)" />}
                  <KV k="Authorities" v="Mint revoked · no freeze · metadata updatable by you" />
                </dl>
                {c.real && <div className="rounded border border-[#5a4a2a] bg-[#1d1912] px-4 py-3 text-[13px] text-[#e6c88f]">This launch uses real SOL on mainnet and cannot be undone.</div>}
                {phase.s === "pending" && (
                  <div role="status" className="flex items-center gap-3 rounded border border-rule-2 p-4 text-[13px] text-mist">
                    <span className="dot dot-live" />Confirming ·
                    <a className="num" href={explorerUrl("tx", phase.sig, f.cluster)} target="_blank" rel="noreferrer">{shortAddr(phase.sig)}</a>
                  </div>
                )}
              </div>
            )}

            {phase.s === "error" && <div role="alert" className="mt-5 rounded border border-[#5a2f27] bg-[#1e1412] px-4 py-3 text-[13px] text-[#f4b3a4]">{phase.msg}</div>}

            <div className="sm-stack mt-8 flex items-center justify-between gap-4 border-t border-[#262a30] pt-5">
              <button className="btn btn-line btn-sm" onClick={() => { setPhase({ s: "idle" }); setStep((s) => Math.max(0, s - 1)); }} disabled={step === 0 || busy}>Back</button>
              {step < 2 ? (
                <button className="btn btn-silver btn-sm" onClick={() => { setTouched(true); if (step === 0 && !detailsOk) return; setPhase({ s: "idle" }); setStep((s) => s + 1); }}
                  disabled={step === 1 && !networkOk}>Continue <span className="arr" aria-hidden="true">→</span></button>
              ) : (
                <button className="btn btn-silver btn-sm" onClick={launch} disabled={busy || !detailsOk || !c.rpc}>
                  {phase.s === "uploading" ? "Uploading image…" : phase.s === "building" ? "Preparing…" : phase.s === "signing" ? "Approve in wallet…" : phase.s === "pending" ? "Confirming…" : !w.address ? "Connect wallet" : "Launch token"} <span className="arr" aria-hidden="true">→</span>
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
            <li><span className="num text-platinum">01</span> Define the token and upload its image.</li>
            <li><span className="num text-platinum">02</span> Connect a Solana wallet. On devnet you can request free test SOL.</li>
            <li><span className="num text-platinum">03</span> Approve one transaction. It creates the mint with on-chain metadata, sends the full supply to you and revokes minting forever.</li>
          </ol>
          <p className="mb-0 mt-5 text-[12px] leading-[18px] text-muted">Liquidity pools and DEX listing open with the One Million Markets DEX release.</p>
        </div>
        <div className="panel overflow-hidden">
          <div className="flex justify-between border-b border-[#262a30] px-5 py-3.5"><span className="label text-platinum">My launches</span><span className="label text-muted">This browser</span></div>
          {launches.length === 0 ? (
            <div className="p-5 text-[13px] text-muted">No tokens launched from this browser yet.</div>
          ) : launches.map((l) => (
            <a key={l.mint} href={explorerUrl("address", l.mint, l.cluster)} target="_blank" rel="noreferrer"
              className="grid gap-1 border-b border-[#1e2227] px-5 py-3 text-[13px] no-underline transition-colors last:border-b-0 hover:bg-[#1e2227]">
              <span className="flex items-center justify-between gap-3"><span className="flex items-center gap-2.5 font-medium">{l.image ? <img src={l.image} alt="" className="h-6 w-6 rounded-full object-cover" /> : <span className="h-6 w-6 rounded-full bg-carbon" />}{l.name}</span><span className="num text-mist">{l.symbol}</span></span>
              <span className="num flex justify-between text-[12px] text-muted"><span>{shortAddr(l.mint)}</span><span>{cluster(l.cluster).label}</span></span>
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
function Thumb({ file }: { file: File }) {
  const [u, setU] = useState<string | null>(null);
  useEffect(() => { const x = URL.createObjectURL(file); setU(x); return () => URL.revokeObjectURL(x); }, [file]);
  return u ? <img src={u} alt="" className="ml-auto h-10 w-10 rounded-full object-cover" /> : null;
}
function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex justify-between gap-6"><dt className="text-muted">{k}</dt><dd className="m-0 text-right text-platinum">{v}</dd></div>;
}

