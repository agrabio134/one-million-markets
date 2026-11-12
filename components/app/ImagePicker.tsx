"use client";
import { useEffect, useRef, useState } from "react";

const ACCEPT = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_BYTES = 4 * 1024 * 1024;
const MAX_DIM = 1024;

/** Downscale large still images in the browser so uploads stay small and fast. GIFs are kept as-is (animation). */
async function prepare(file: File): Promise<File> {
  if (file.type === "image/gif") return file;
  const bmp = await createImageBitmap(file).catch(() => null);
  if (!bmp) return file;
  const scale = Math.min(1, MAX_DIM / Math.max(bmp.width, bmp.height));
  if (scale === 1 && file.size <= MAX_BYTES) { bmp.close(); return file; }
  const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  const type = file.type === "image/jpeg" ? "image/jpeg" : "image/png";
  const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, type, 0.9));
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.\w+$/, type === "image/jpeg" ? ".jpg" : ".png"), { type });
}

export function ImagePicker({ file, onChange, disabled }: { file: File | null; onChange: (f: File | null) => void; disabled?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const u = URL.createObjectURL(file);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  async function take(f?: File | null) {
    setError(null);
    if (!f) return;
    if (!ACCEPT.includes(f.type)) return setError("Use a PNG, JPG, GIF or WebP image.");
    setBusy(true);
    try {
      const out = await prepare(f);
      if (out.size > MAX_BYTES) return setError("Image must be 4 MB or smaller.");
      onChange(out);
    } finally { setBusy(false); }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className={`label ${error ? "text-down" : "text-mist"}`}>Token image</span>
      <div
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); if (!disabled) take(e.dataTransfer.files?.[0]); }}
        className={`flex items-center gap-5 rounded border border-dashed p-4 transition-colors ${drag ? "border-silver bg-[#1a1d21]" : "border-[#3a3f46] bg-well"}`}
      >
        <div className="flex h-24 w-24 flex-none items-center justify-center overflow-hidden rounded-full border border-rule-2 bg-panel">
          {preview ? <img src={preview} alt="Token image preview" className="h-full w-full object-cover" /> : (
            <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true" className="text-steel"><path d="M4 16l4-4 4 4 3-3 5 5M4 4h16v16H4z" stroke="currentColor" strokeWidth="1.3" fill="none" /><circle cx="15.5" cy="8.5" r="1.5" fill="currentColor" /></svg>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <div className="text-[14px] text-platinum">{file ? file.name : "Drop an image here, or choose a file"}</div>
          <div className="text-[12px] text-muted">{file ? `${(file.size / 1024).toFixed(0)} KB · ${file.type.replace("image/", "").toUpperCase()}` : "PNG, JPG, GIF or WebP · square works best · up to 4 MB"}</div>
          <div className="flex gap-2">
            <button type="button" className="btn btn-line btn-xs" onClick={() => input.current?.click()} disabled={disabled || busy}>{busy ? "Processing…" : file ? "Replace" : "Choose image"}</button>
            {file && <button type="button" className="btn btn-line btn-xs" onClick={() => onChange(null)} disabled={disabled}>Remove</button>}
          </div>
        </div>
        <input ref={input} type="file" accept={ACCEPT.join(",")} className="sr-only" tabIndex={-1} aria-label="Token image file"
          onChange={(e) => { take(e.target.files?.[0]); e.target.value = ""; }} />
      </div>
      {error && <span role="alert" className="text-[12px] text-down">{error}</span>}
    </div>
  );
}
