import type { SupabaseClient } from "@supabase/supabase-js";

/** Human-readable membership number, e.g. FDIN-284719 */
export function formatFdinPin(digits: string): string {
  return `FDIN-${digits}`;
}

function randomSixDigits(): string {
  const n = Math.floor(100_000 + Math.random() * 900_000);
  return String(n);
}

/**
 * Generates a unique FDIN PIN not already present in affiliate_applications.
 */
export async function createUniqueFdinPin(
  supabase: SupabaseClient,
): Promise<string> {
  for (let attempt = 0; attempt < 25; attempt++) {
    const pin = formatFdinPin(randomSixDigits());
    const { data } = await supabase
      .from("affiliate_applications")
      .select("id")
      .eq("fdin_pin", pin)
      .maybeSingle();
    if (!data) return pin;
  }
  const fallback = formatFdinPin(String(Date.now()).slice(-6));
  return fallback;
}

/**
 * Ensures an application row has an FDIN PIN (backfills legacy rows on read).
 */
export async function ensureApplicationFdinPin(
  supabase: SupabaseClient,
  applicationId: string,
): Promise<string | null> {
  const { data: row, error: readErr } = await supabase
    .from("affiliate_applications")
    .select("fdin_pin")
    .eq("id", applicationId)
    .maybeSingle();

  if (readErr) {
    if (/fdin_pin/i.test(readErr.message)) return null;
    throw new Error(readErr.message);
  }
  if (!row) return null;
  if (typeof row.fdin_pin === "string" && row.fdin_pin.trim()) {
    return row.fdin_pin.trim();
  }

  const pin = await createUniqueFdinPin(supabase);
  const { data: updated, error: updateErr } = await supabase
    .from("affiliate_applications")
    .update({ fdin_pin: pin, updated_at: new Date().toISOString() })
    .eq("id", applicationId)
    .is("fdin_pin", null)
    .select("fdin_pin")
    .maybeSingle();

  if (updateErr) {
    if (/fdin_pin/i.test(updateErr.message)) return null;
    throw new Error(updateErr.message);
  }
  if (updated?.fdin_pin) return String(updated.fdin_pin);

  const { data: again } = await supabase
    .from("affiliate_applications")
    .select("fdin_pin")
    .eq("id", applicationId)
    .maybeSingle();
  return again?.fdin_pin ? String(again.fdin_pin) : pin;
}
