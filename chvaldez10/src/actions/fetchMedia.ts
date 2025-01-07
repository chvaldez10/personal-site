import { createClient } from "@/utils/supabase/server";
import { BrandLogo } from "@/types/supabase/media";

export async function fetchBrandLogos(): Promise<BrandLogo[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("BrandLogo").select("*");

  if (error) {
    console.error("Error fetching brand logos:", error);
    return [];
  }

  return data;
}
