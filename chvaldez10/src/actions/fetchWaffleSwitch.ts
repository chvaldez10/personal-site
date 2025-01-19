import { createClient } from "@/utils/supabase/server";
import { WaffleSwitch } from "@/types/supabase";

export async function fetchWaffleSwitch(
  waffleSwitchName: string
): Promise<WaffleSwitch | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("waffle_switch")
    .select("*")
    .eq("name", waffleSwitchName)
    .single();

  if (error) {
    console.error("Error fetching waffle switch:", error);
    return null;
  }

  return data as WaffleSwitch;
}
