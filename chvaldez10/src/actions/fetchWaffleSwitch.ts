import { createClient } from "@/utils/supabase/server";
import type { WaffleSwitch } from "@/types/supabase";
import { cookies } from "next/headers";

export async function fetchWaffleSwitch(
  name: string,
): Promise<WaffleSwitch | null> {
  if (process.env.SITE_DEMO_MODE === "true") return null;
  // Do not swallow Next's request-time rendering signal as a database failure.
  await cookies();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("waffle_switch")
      .select("*")
      .eq("name", name)
      .abortSignal(AbortSignal.timeout(5000))
      .maybeSingle();
    if (error) {
      console.error("Feature flag could not be loaded.");
      return null;
    }
    return data as WaffleSwitch | null;
  } catch {
    console.error("Feature flags are temporarily unavailable.");
    return null;
  }
}
