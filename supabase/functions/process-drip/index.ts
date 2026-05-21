import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4";

const TEMPLATE_SUBJECTS: Record<string, string> = {
  drip_01_welcome:     "Welcome to the Masterclass — Day 1",
  drip_02_chapter1:    "Session 2: The First Principle",
  drip_03_masterclass: "Session 3: Your Masterclass Access",
  drip_04_multiply:    "Session 4: What Multiplying Actually Looks Like",
  drip_05_checkin:     "Session 5: Halfway Check-In",
  drip_06_testimony:   "Session 6: A Story from the Field",
  drip_07_nextsteps:   "Session 7: Next Steps",
  drip_08_sustaining:  "Session 8: The Long Game",
  drip_09_community:   "Session 9: You Are Not Alone",
  drip_10_finale:      "Session 10: You Made It — Now What?",
};

Deno.serve(async (req) => {
  // Verify cron secret
  const auth = req.headers.get("Authorization");
  const expected = `Bearer ${Deno.env.get("CRON_SECRET")}`;
  if (auth !== expected) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const resendKey = Deno.env.get("RESEND_API_KEY")!;
  const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") ?? "orders@multiplyordie.com";

  const supabase = createClient(supabaseUrl, serviceKey);
  const resend = new Resend(resendKey);

  // Fetch up to 50 due emails
  const { data: jobs, error } = await supabase
    .from("email_queue")
    .select("id, subscriber_id, template_key, subscribers(email, first_name)")
    .lte("scheduled_for", new Date().toISOString())
    .is("sent_at", null)
    .limit(50);

  if (error) {
    console.error("Failed to fetch email queue:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  let sent = 0;
  let failed = 0;

  for (const job of (jobs ?? [])) {
    const subscriber = Array.isArray(job.subscribers) ? job.subscribers[0] : job.subscribers;
    if (!subscriber?.email) continue;

    const subject = TEMPLATE_SUBJECTS[job.template_key] ?? "A message from Multiply or Die";
    const firstName = subscriber.first_name ?? "Pastor";

    // Simple HTML body — in production, render React Email templates here
    const html = `<p>Hi ${firstName},</p><p>This is ${job.template_key.replace(/_/g, " ")} from the Multiplication Masterclass.</p><p>— Ashley Evans</p>`;

    try {
      await resend.emails.send({
        from: `Multiply or Die <${fromEmail}>`,
        to: subscriber.email,
        subject,
        html,
      });

      await supabase
        .from("email_queue")
        .update({ sent_at: new Date().toISOString() })
        .eq("id", job.id);

      sent++;
    } catch (err) {
      await supabase
        .from("email_queue")
        .update({ error: String(err) })
        .eq("id", job.id);
      failed++;
    }
  }

  return new Response(JSON.stringify({ processed: (jobs ?? []).length, sent, failed }), {
    headers: { "Content-Type": "application/json" },
  });
});
