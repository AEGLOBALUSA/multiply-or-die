import { createSupabaseServiceClient } from "@/lib/supabase";

export interface DonationRow {
  id: string;
  stripe_payment_intent_id: string;
  stripe_charge_id: string | null;
  customer_email: string;
  customer_name: string | null;
  shipping_option: "standard" | "priority";
  shipping_amount_cents: number;
  donation_amount_cents: number;
  book_fmv_cents: number;
  sponsored_pastors: number;
  status: "pending" | "succeeded" | "failed" | "refunded";
  receipt_sent_at: string | null;
  refunded_at: string | null;
  created_at: string;
}

interface InsertDonationData {
  stripe_payment_intent_id: string;
  customer_email: string;
  customer_name?: string;
  shipping_option: "standard" | "priority";
  shipping_amount_cents: number;
  donation_amount_cents: number;
}

export async function insertDonationPending(data: InsertDonationData): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("donations").insert({
    ...data,
    book_fmv_cents: parseInt(process.env.NEXT_PUBLIC_BOOK_FMV_CENTS ?? "2499"),
    status: "pending",
  });

  // UNIQUE violation on stripe_payment_intent_id means idempotent retry — ignore
  if (error && error.code !== "23505") {
    throw new Error(`Failed to insert donation: ${error.message}`);
  }
}

export async function getDonationByPaymentIntent(
  paymentIntentId: string
): Promise<DonationRow | null> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("donations")
    .select("*")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();

  if (error) throw new Error(`Failed to get donation: ${error.message}`);
  return data as DonationRow | null;
}

export async function markDonationSucceeded(
  paymentIntentId: string,
  chargeId: string
): Promise<DonationRow> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("donations")
    .update({ status: "succeeded", stripe_charge_id: chargeId, updated_at: new Date().toISOString() })
    .eq("stripe_payment_intent_id", paymentIntentId)
    .select()
    .single();

  if (error) throw new Error(`Failed to mark donation succeeded: ${error.message}`);
  return data as DonationRow;
}

export async function markReceiptSent(donationId: string): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("donations")
    .update({ receipt_sent_at: new Date().toISOString() })
    .eq("id", donationId);

  if (error) throw new Error(`Failed to mark receipt sent: ${error.message}`);
}

export async function markDonationFailed(paymentIntentId: string): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("donations")
    .update({ status: "failed", updated_at: new Date().toISOString() })
    .eq("stripe_payment_intent_id", paymentIntentId);

  if (error) throw new Error(`Failed to mark donation failed: ${error.message}`);
}

export async function markDonationRefunded(paymentIntentId: string): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("donations")
    .update({
      status: "refunded",
      refunded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_payment_intent_id", paymentIntentId);

  if (error) throw new Error(`Failed to mark donation refunded: ${error.message}`);
}
