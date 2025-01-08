import { createClient } from "@/utils/supabase/server";
import { PublicSchema } from "@/types/supabase";

export async function fetchBrandLogos(): Promise<
  PublicSchema["Tables"]["brand_logos"]["Row"][]
> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("brand_logos").select("*");

  if (error) {
    console.error("Error fetching brand logos:", error);
    return [];
  }

  return data as PublicSchema["Tables"]["brand_logos"]["Row"][];
}
