import { createSupabaseServiceClient } from "@/lib/supabase";

export interface UTMData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
}

/** Server-side event tracking — called from route handlers. */
export async function trackEvent(
  eventName: string,
  properties: Record<string, unknown>,
  meta: { ip?: string; utm?: UTMData; session_id?: string }
): Promise<void> {
  try {
    const supabase = createSupabaseServiceClient();
    const ip_hash = meta.ip ? await hashIp(meta.ip) : null;

    await supabase.from("analytics_events").insert({
      event_name: eventName,
      properties,
      utm_source: meta.utm?.utm_source ?? null,
      utm_medium: meta.utm?.utm_medium ?? null,
      utm_campaign: meta.utm?.utm_campaign ?? null,
      utm_content: meta.utm?.utm_content ?? null,
      ip_hash,
      session_id: meta.session_id ?? null,
    });
  } catch {
    // Analytics must never block the main flow
  }
}

async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const ALLOWED_EVENTS = new Set([
  "page_view",
  "pwyc_slider_moved",
  "checkout_initiated",
  "checkout_completed",
  "checkout_cancelled",
  "email_subscribed",
]);

/** Validates an event name against the allowlist. */
export function isAllowedEvent(name: string): boolean {
  return ALLOWED_EVENTS.has(name);
}
