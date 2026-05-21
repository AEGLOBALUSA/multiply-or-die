import { createSupabaseServiceClient } from "@/lib/supabase";

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

/**
 * Sliding-window rate limiter backed by Supabase.
 * Key format: `{action}:{ip}` — e.g. `checkout:1.2.3.4`
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const supabase = createSupabaseServiceClient();
  const bucket = new Date(
    Math.floor(Date.now() / (windowSeconds * 1000)) * windowSeconds * 1000
  ).toISOString();

  const { data, error } = await supabase.rpc("increment_rate_limit", {
    p_key: key,
    p_bucket: bucket,
    p_max: maxRequests,
  });

  if (error) {
    // Fail open on DB errors so a Supabase outage doesn't block all orders
    console.error("Rate limit check failed:", error);
    return { allowed: true, remaining: maxRequests };
  }

  const count = data as number;
  return { allowed: count <= maxRequests, remaining: Math.max(0, maxRequests - count) };
}
