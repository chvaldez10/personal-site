import { connection } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";
import type { BrandLogo } from "@/types/media";
export async function fetchBrandLogos(): Promise<BrandLogo[] | null> {
  await connection();
  try {
    return await fetchQuery(api.brandLogos.list, {});
  } catch {
    console.error("Brand logos are temporarily unavailable.");
    return null;
  }
}
