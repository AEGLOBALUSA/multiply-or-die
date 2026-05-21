import { Resend } from "resend";
import { render } from "@react-email/render";
import type { DonationRow } from "@/lib/ledger";

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

const FROM = `${process.env.RESEND_FROM_NAME ?? "Multiply or Die"} <${
  process.env.RESEND_FROM_EMAIL ?? "orders@multiplyordie.com"
}>`;

export async function sendOrderConfirmation(donation: DonationRow): Promise<void> {
  const { OrderConfirmationEmail } = await import("@/emails/order-confirmation");
  const element = OrderConfirmationEmail({ donation });
  if (!element) throw new Error("OrderConfirmationEmail returned null");
  const html = await render(element);

  const { error } = await getResend().emails.send({
    from: FROM,
    to: donation.customer_email,
    subject: "Your book is on its way — Multiply or Die",
    html,
  });

  if (error) throw new Error(`Failed to send order confirmation: ${error.message}`);
}

export async function sendDonationReceipt(donation: DonationRow): Promise<void> {
  if (donation.donation_amount_cents === 0) return; // No receipt for zero-donation orders

  const { DonationReceiptEmail } = await import("@/emails/donation-receipt");
  const element = DonationReceiptEmail({ donation });
  if (!element) throw new Error("DonationReceiptEmail returned null (zero-donation order)");
  const html = await render(element);

  const { error } = await getResend().emails.send({
    from: FROM,
    to: donation.customer_email,
    subject: `Your Tax Receipt — ${process.env.FCG_LEGAL_NAME ?? "Futures Church Global"}`,
    html,
  });

  if (error) throw new Error(`Failed to send donation receipt: ${error.message}`);
}
