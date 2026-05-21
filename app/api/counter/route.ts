import { NextResponse } from "next/server";
import { getSponsorshipCounter } from "@/lib/counter";

export const runtime = "edge";

// 60-second stale-while-revalidate cache
export const revalidate = 60;

export async function GET(): Promise<NextResponse> {
  try {
    const counter = await getSponsorshipCounter();
    return NextResponse.json(counter, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.error("Counter fetch failed:", err);
    return NextResponse.json(
      { total_pastors_sponsored: 0, total_donated_cents: 0 },
      { status: 200 }
    );
  }
}
