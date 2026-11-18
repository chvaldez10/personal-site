import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "@convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

export type WorkoutOwnerAccess =
  | { status: "owner"; token: string }
  | { status: "signedOut" | "forbidden" | "unavailable" };

export async function workoutOwnerAccess(): Promise<WorkoutOwnerAccess> {
  let token: string | undefined;
  try {
    token = await convexAuthNextjsToken();
  } catch {
    return { status: "unavailable" };
  }
  if (!token) return { status: "signedOut" };

  try {
    return (await fetchQuery(api.admin.current, {}, { token }))
      ? { status: "owner", token }
      : { status: "forbidden" };
  } catch {
    return { status: "unavailable" };
  }
}
