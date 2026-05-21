import { NextResponse } from "next/server";

export function GET(): NextResponse {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://multiplyordie.com";
  const content = `User-agent: *
Allow: /
Disallow: /api/
Sitemap: ${siteUrl}/sitemap.xml
`;
  return new NextResponse(content, {
    headers: { "Content-Type": "text/plain" },
  });
}
