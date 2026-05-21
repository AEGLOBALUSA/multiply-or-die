import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { insertDonationPending } from "@/lib/ledger";
import { checkRateLimit } from "@/lib/rate-limit";
import { trackEvent } from "@/lib/analytics";

export const runtime = "nodejs";

const SHIPPING_PRICES: Record<string, string> = {
  standard: process.env.STRIPE_PRICE_SHIPPING_STANDARD ?? "",
  priority: process.env.STRIPE_PRICE_SHIPPING_PRIORITY ?? "",
};

const SHIPPING_AMOUNTS: Record<string, number> = {
  standard: 995,
  priority: 1295,
};

const CheckoutSchema = z.object({
  shipping_option: z.enum(["standard", "priority"]),
  donation_cents: z.number().int().min(0).max(5_000_000),
  customer_email: z.string().email(),
  customer_name: z.string().max(120).optional(),
  utm: z
    .object({
      utm_source: z.string().optional(),
      utm_medium: z.string().optional(),
      utm_campaign: z.string().optional(),
      utm_content: z.string().optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Rate limit: 5 requests per IP per minute
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = await checkRateLimit(`checkout:${ip}`, 5, 60);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { shipping_option, donation_cents, customer_email, customer_name, utm } =
    parsed.data;

  const shippingPriceId = SHIPPING_PRICES[shipping_option];
  if (!shippingPriceId) {
    return NextResponse.json(
      { error: "Shipping price not configured. Contact support." },
      { status: 500 }
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://multiplyordie.com";

  try {
    // Build line items — server owns all amounts
    type LineItem = {
      price?: string;
      quantity: number;
      price_data?: {
        currency: string;
        unit_amount: number;
        product_data: {
          name: string;
          description: string;
          tax_code: string;
        };
      };
    };

    const lineItems: LineItem[] = [
      { price: shippingPriceId, quantity: 1 },
    ];

    if (donation_cents > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          unit_amount: donation_cents,
          product_data: {
            name: "Multiply It Forward",
            description: "Tax-deductible donation to Futures Church Global (501(c)(3))",
            tax_code: "txcd_10000000",
          },
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      line_items: lineItems as any,
      payment_intent_data: {
        metadata: {
          shipping_option,
          donation_cents: String(donation_cents),
          customer_email,
          customer_name: customer_name ?? "",
          utm_source: utm?.utm_source ?? "",
          utm_campaign: utm?.utm_campaign ?? "",
          utm_medium: utm?.utm_medium ?? "",
        },
      },
      success_url: `${siteUrl}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/?cancelled=1`,
      expires_at: Math.floor(Date.now() / 1000) + 1800,
    });

    if (!session.payment_intent || typeof session.payment_intent !== "string") {
      throw new Error("Stripe session missing payment_intent");
    }

    // Write pending row — idempotent
    await insertDonationPending({
      stripe_payment_intent_id: session.payment_intent,
      customer_email,
      customer_name,
      shipping_option,
      shipping_amount_cents: SHIPPING_AMOUNTS[shipping_option],
      donation_amount_cents: donation_cents,
    });

    await trackEvent("checkout_initiated", { shipping_option, donation_cents }, {
      ip,
      utm,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session. Please try again." },
      { status: 500 }
    );
  }
}
