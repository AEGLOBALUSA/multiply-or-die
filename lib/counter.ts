import { createSupabaseServiceClient } from "@/lib/supabase";

export interface CounterRow {
  total_pastors_sponsored: number;
  total_donated_cents: number;
  updated_at: string;
}

/** Reads the live sponsorship counter. Anon-readable via RLS. */
export async function getSponsorshipCounter(): Promise<CounterRow> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("sponsorship_counter")
    .select("total_pastors_sponsored, total_donated_cents, updated_at")
    .eq("id", 1)
    .single();

  if (error) throw new Error(`Failed to read counter: ${error.message}`);
  return data as CounterRow;
}
