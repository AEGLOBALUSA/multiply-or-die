import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import {
  getDonationByPaymentIntent,
  markDonationSucceeded,
  markDonationFailed,
  markDonationRefunded,
  markReceiptSent,
} from "@/lib/ledger";
import { sendOrderConfirmation, sendDonationReceipt } from "@/lib/email";
import { enrollSubscriber } from "@/lib/drip";
import type Stripe from "stripe";

export const runtime = "nodejs";

// CRITICAL: Next.js App Router must NOT parse the body.
// Stripe signature verification requires the raw bytes.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Read raw body as text — NEVER call req.json() in this handler
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Always return 200 promptly — Stripe retries on non-2xx
  try {
    await handleEvent(event);
  } catch (err) {
    // Log but don't fail the response — prevents infinite Stripe retries on transient errors
    console.error(`Webhook handler error for ${event.type}:`, err);
  }

  return NextResponse.json({ received: true });
}

async function handleEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSucceeded(pi);
      break;
    }
    case "payment_intent.payment_failed": {
      const pi = event.data.object as Stripe.PaymentIntent;
      await markDonationFailed(pi.id);
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const piId =
        typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id;
      if (piId) await markDonationRefunded(piId);
      break;
    }
    default:
      // Ignore unhandled event types
      break;
  }
}

async function handlePaymentSucceeded(pi: Stripe.PaymentIntent): Promise<void> {
  // Idempotency check — Stripe delivers at-least-once
  const existing = await getDonationByPaymentIntent(pi.id);
  if (existing?.status === "succeeded") {
    console.log(`Duplicate webhook for ${pi.id} — already processed`);
    return;
  }

  const chargeId =
    typeof pi.latest_charge === "string" ? pi.latest_charge : pi.latest_charge?.id ?? "";

  const donation = await markDonationSucceeded(pi.id, chargeId);

  // Send emails in parallel — failures logged but don't block each other
  const emailResults = await Promise.allSettled([
    sendOrderConfirmation(donation),
    sendDonationReceipt(donation),
  ]);

  emailResults.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(`Email ${i === 0 ? "confirmation" : "receipt"} failed for ${pi.id}:`, result.reason);
    }
  });

  // Mark receipt sent if the receipt email succeeded
  if (emailResults[1].status === "fulfilled" && donation.donation_amount_cents > 0) {
    await markReceiptSent(donation.id).catch(console.error);
  }

  // Enroll in masterclass drip sequence
  await enrollSubscriber(donation).catch((err) =>
    console.error(`Drip enrollment failed for ${pi.id}:`, err)
  );
}
