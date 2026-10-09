import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { brandLogosSchema } from "@/lib/validation/brandLogos";
import { createClient } from "@/utils/supabase/server";
import { localLogoSource } from "@/lib/media";
import type { BrandLogos } from "@/types/supabase";
import { cookies } from "next/headers";

// null is unavailable; [] is a successfully loaded but empty collection.
export async function fetchBrandLogos(): Promise<BrandLogos[] | null> {
  // Let Next handle its request-time rendering signal outside application errors.
  if (process.env.SITE_DEMO_MODE !== "true") await cookies();
  try {
    let rows: unknown;
    if (process.env.SITE_DEMO_MODE === "true") {
      rows = JSON.parse(
        await readFile(join(process.cwd(), ".demo/brand-logos.json"), "utf8"),
      );
    } else {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("brand_logos")
        .select("*")
        .abortSignal(AbortSignal.timeout(5000));
      if (error) {
        console.error("Brand logos could not be loaded.");
        return null;
      }
      rows = data;
    }
    const parsed = brandLogosSchema.safeParse(rows);
    if (!parsed.success) {
      console.error("Brand logo data did not match the expected shape.");
      return null;
    }
    return parsed.data.map((row) => ({
      ...row,
      src: localLogoSource(row.src),
    }));
  } catch {
    console.error("Brand logos are temporarily unavailable.");
    return null;
  }
}
