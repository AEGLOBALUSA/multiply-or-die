import type { Metadata } from "next";
import { Fraunces, Inter_Tight } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Multiply or Die — A free book for pastors who refuse to plateau",
  description:
    "Get a free hardback copy of Ashley Evans' new book for pastors. Refuse the plateau. Multiply your church, your impact, and your legacy.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://multiplyordie.com"),
  openGraph: {
    title: "Multiply or Die",
    description:
      "A free hardback book for pastors who refuse to plateau — by Ashley Evans, Futures Church Global.",
    url: "/",
    siteName: "Multiply or Die",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Multiply or Die book cover" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Multiply or Die — A free book for pastors who refuse to plateau",
    description:
      "Get a free hardback copy of Ashley Evans' new book for pastors.",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${interTight.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Book",
              name: "Multiply or Die",
              author: {
                "@type": "Person",
                name: "Ashley Evans",
              },
              publisher: {
                "@type": "Organization",
                name: "Futures Church Global",
                url: "https://futurescollege.com",
              },
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                description: "Free hardback — reader pays shipping",
              },
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
