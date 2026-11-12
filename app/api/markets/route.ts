import { NextResponse } from "next/server";
import { getTickers } from "@/lib/feed";
import { FEED_NAME } from "@/lib/markets";

export const revalidate = 10;

export async function GET() {
  try {
    const data = await getTickers();
    return NextResponse.json({ source: FEED_NAME, ts: Date.now(), data }, {
      headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30" },
    });
  } catch (e) {
    return NextResponse.json({ error: "Reference market feed is unavailable." }, { status: 503 });
  }
}
