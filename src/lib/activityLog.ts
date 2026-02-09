import { supabase } from "@/integrations/supabase/client";

export async function logActivity(
  action: string,
  targetType: string,
  targetTitle: string
) {
  const { data: { session } } = await supabase.auth.getSession();
  const email = session?.user?.email || "unknown";

  await supabase.from("activity_logs").insert({
    user_email: email,
    action,
    target_type: targetType,
    target_title: targetTitle,
  });
}
