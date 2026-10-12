import { fetchQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";
export async function fetchWaffleSwitch(
  name: string,
): Promise<{ is_active: boolean } | null> {
  if (name !== "enable_signup") return null;
  try {
    return { is_active: await fetchQuery(api.featureFlags.signupEnabled, {}) };
  } catch {
    return null;
  }
}
