import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "@convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

export async function workoutOwnerAccess(): Promise<
  "owner" | "signedOut" | "forbidden" | "unavailable"
> {
  let token: string | undefined;
  try {
    token = await convexAuthNextjsToken();
  } catch {
    return "unavailable";
  }
  if (!token) return "signedOut";

  try {
    return (await fetchQuery(api.admin.current, {}, { token }))
      ? "owner"
      : "forbidden";
  } catch {
    return "unavailable";
  }
}
