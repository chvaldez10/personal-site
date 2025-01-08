import { createClient } from "@/utils/supabase/server";
import { BrandLogos } from "@/types/supabase";

export async function fetchBrandLogos(): Promise<BrandLogos[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("brand_logos").select("*");

  if (error) {
    console.error("Error fetching brand logos:", error);
    return [];
  }

  return data as BrandLogos[];
}
