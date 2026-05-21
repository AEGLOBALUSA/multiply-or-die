import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest): NextResponse {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' https://js.stripe.com https://player.vimeo.com https://fast.wistia.net`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https://*.supabase.co https://*.stripe.com https://i.vimeocdn.com https://embed-ssl.wistia.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `frame-src https://js.stripe.com https://hooks.stripe.com https://player.vimeo.com https://fast.wistia.net`,
    `connect-src 'self' https://api.stripe.com https://*.supabase.co https://vitals.vercel-insights.com`,
    `media-src 'self' https://*.wistia.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `upgrade-insecure-requests`,
  ].join("; ");

  const res = NextResponse.next({
    request: {
      headers: new Headers({
        ...Object.fromEntries(req.headers),
        "x-nonce": nonce,
      }),
    },
  });

  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
