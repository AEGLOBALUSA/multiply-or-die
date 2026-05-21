import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { trackEvent, isAllowedEvent } from "@/lib/analytics";

export const runtime = "edge";

const EventSchema = z.object({
  event_name: z.string().min(1).max(64),
  properties: z.record(z.unknown()).optional().default({}),
  utm: z
    .object({
      utm_source: z.string().optional(),
      utm_medium: z.string().optional(),
      utm_campaign: z.string().optional(),
      utm_content: z.string().optional(),
    })
    .optional(),
  session_id: z.string().max(64).optional(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = EventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid event data" }, { status: 400 });
  }

  const { event_name, properties, utm, session_id } = parsed.data;

  if (!isAllowedEvent(event_name)) {
    return NextResponse.json({ error: "Unknown event" }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  await trackEvent(event_name, properties, { ip, utm, session_id });

  return NextResponse.json({ ok: true });
}
