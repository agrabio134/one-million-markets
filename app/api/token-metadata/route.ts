import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "nodejs";

const MAX_BYTES = 4 * 1024 * 1024; // stays under Vercel's 4.5 MB request limit
const TYPES: Record<string, { ext: string; magic: (b: Uint8Array) => boolean }> = {
  "image/png": { ext: "png", magic: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  "image/jpeg": { ext: "jpg", magic: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  "image/gif": { ext: "gif", magic: (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 },
  "image/webp": { ext: "webp", magic: (b) => b[0] === 0x52 && b[1] === 0x49 && b[8] === 0x57 && b[9] === 0x45 },
};
const bytes = (s: string) => new TextEncoder().encode(s).length;

/** Uploads a token image and writes its metadata JSON. Returns the JSON URL to store on-chain as the token URI. */
export async function POST(req: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Image upload is not configured on this deployment." }, { status: 503 });
  }
  let form: FormData;
  try { form = await req.formData(); } catch { return NextResponse.json({ error: "Upload is too large or malformed." }, { status: 413 }); }

  const name = String(form.get("name") ?? "").trim();
  const symbol = String(form.get("symbol") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const image = form.get("image");

  if (!name || bytes(name) > 32) return NextResponse.json({ error: "Name must be 1–32 characters." }, { status: 400 });
  if (!/^[A-Z0-9]{1,10}$/.test(symbol)) return NextResponse.json({ error: "Ticker must be 1–10 characters, A–Z and 0–9." }, { status: 400 });
  if (description.length > 280) return NextResponse.json({ error: "Description must be 280 characters or fewer." }, { status: 400 });

  let imageUrl: string | null = null;
  let imageType: string | null = null;
  if (image instanceof File && image.size > 0) {
    const t = TYPES[image.type];
    if (!t) return NextResponse.json({ error: "Use a PNG, JPG, GIF or WebP image." }, { status: 415 });
    if (image.size > MAX_BYTES) return NextResponse.json({ error: "Image must be 4 MB or smaller." }, { status: 413 });
    const buf = new Uint8Array(await image.arrayBuffer());
    if (!t.magic(buf)) return NextResponse.json({ error: "That file is not a valid image." }, { status: 415 });
    const blob = await put(`tokens/${symbol.toLowerCase()}.${t.ext}`, Buffer.from(buf), {
      access: "public", addRandomSuffix: true, contentType: image.type, cacheControlMaxAge: 31536000,
    });
    imageUrl = blob.url; imageType = image.type;
  }

  const metadata = {
    name, symbol, description,
    ...(imageUrl ? { image: imageUrl, properties: { files: [{ uri: imageUrl, type: imageType }], category: "image" } } : {}),
  };
  const json = await put(`tokens/${symbol.toLowerCase()}.json`, JSON.stringify(metadata, null, 2), {
    access: "public", addRandomSuffix: true, contentType: "application/json", cacheControlMaxAge: 31536000,
  });
  if (bytes(json.url) > 200) return NextResponse.json({ error: "Metadata URL too long." }, { status: 500 });

  return NextResponse.json({ uri: json.url, image: imageUrl });
}
