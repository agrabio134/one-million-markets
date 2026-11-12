import { NextResponse, type NextRequest } from "next/server";
import { getBook } from "@/lib/feed";
import { MARKET_IDS } from "@/lib/markets";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("market") ?? "";
  if (!MARKET_IDS.has(id)) return NextResponse.json({ error: "Unknown market." }, { status: 400 });
  try {
    const data = await getBook(id);
    return NextResponse.json({ data }, { headers: { "Cache-Control": "public, s-maxage=2, stale-while-revalidate=5" } });
  } catch {
    return NextResponse.json({ error: "Order book is unavailable." }, { status: 503 });
  }
}
