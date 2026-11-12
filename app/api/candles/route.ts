import { NextResponse, type NextRequest } from "next/server";
import { getCandles } from "@/lib/feed";
import { GRANULARITIES, MARKET_IDS } from "@/lib/markets";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("market") ?? "";
  const g = Number(req.nextUrl.searchParams.get("g") ?? 3600);
  if (!MARKET_IDS.has(id) || !GRANULARITIES.some((x) => x.sec === g)) {
    return NextResponse.json({ error: "Unknown market or interval." }, { status: 400 });
  }
  try {
    const data = await getCandles(id, g);
    return NextResponse.json({ ts: Date.now(), data }, {
      headers: { "Cache-Control": "public, s-maxage=20, stale-while-revalidate=60" },
    });
  } catch {
    return NextResponse.json({ error: "Chart data is unavailable." }, { status: 503 });
  }
}
