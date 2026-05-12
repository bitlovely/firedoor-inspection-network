import { createAdminClient } from "@/lib/supabase/admin";

export async function isAdminBearer(authHeader: string | null): Promise<boolean> {
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  const supabase = createAdminClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) return false;
  return user.app_metadata?.role === "admin";
}
