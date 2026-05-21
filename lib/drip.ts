import { createSupabaseServiceClient } from "@/lib/supabase";
import type { DonationRow } from "@/lib/ledger";

const DRIP_SCHEDULE: Array<{ key: string; days: number }> = [
  { key: "drip_01_welcome",     days: 0  },
  { key: "drip_02_chapter1",    days: 2  },
  { key: "drip_03_masterclass", days: 5  },
  { key: "drip_04_multiply",    days: 8  },
  { key: "drip_05_checkin",     days: 14 },
  { key: "drip_06_testimony",   days: 21 },
  { key: "drip_07_nextsteps",   days: 30 },
  { key: "drip_08_sustaining",  days: 45 },
  { key: "drip_09_community",   days: 60 },
  { key: "drip_10_alumni",      days: 90 },
];

export async function enrollSubscriber(donation: DonationRow): Promise<void> {
  const supabase = createSupabaseServiceClient();

  // Upsert subscriber (idempotent — email is UNIQUE)
  const { data: subscriber, error: subError } = await supabase
    .from("subscribers")
    .upsert(
      {
        email: donation.customer_email,
        first_name: donation.customer_name?.split(" ")[0] ?? null,
        order_id: donation.id,
        subscribed_at: donation.created_at,
      },
      { onConflict: "email", ignoreDuplicates: false }
    )
    .select("id")
    .single();

  if (subError) throw new Error(`Failed to upsert subscriber: ${subError.message}`);

  const now = new Date(donation.created_at);
  const queueRows = DRIP_SCHEDULE.map(({ key, days }) => {
    const scheduledFor = new Date(now);
    scheduledFor.setDate(scheduledFor.getDate() + days);
    return {
      subscriber_id: subscriber.id,
      template_key: key,
      scheduled_for: scheduledFor.toISOString(),
    };
  });

  // Insert all 10 queue rows — ignore duplicates (idempotent retry)
  const { error: queueError } = await supabase
    .from("email_queue")
    .upsert(queueRows, { onConflict: "subscriber_id,template_key", ignoreDuplicates: true });

  if (queueError) throw new Error(`Failed to schedule drip emails: ${queueError.message}`);
}
