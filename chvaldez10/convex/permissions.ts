import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import { env, type MutationCtx, type QueryCtx } from "./_generated/server";

export function ownerEmail() {
  return env.OWNER_EMAIL?.trim().toLowerCase();
}

export async function currentOwner(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId || !ownerEmail()) return null;
  const user = await ctx.db.get("users", userId);
  if (!user?.email || user.email.toLowerCase() !== ownerEmail()) return null;
  return user;
}

export async function requireOwner(ctx: QueryCtx | MutationCtx) {
  const owner = await currentOwner(ctx);
  if (!owner) throw new ConvexError("Dashboard access required.");
  return owner;
}

// Runs in the account-creation transaction: competing setups read the same
// indexed range, so Convex retries a conflict and the second creation is denied.
export async function createOwnerUser(
  ctx: Pick<MutationCtx, "db">,
  email: string,
) {
  if (!ownerEmail() || email !== ownerEmail()) {
    throw new ConvexError("Account setup is not authorized.");
  }
  const existing = await ctx.db
    .query("users")
    .withIndex("email", (q) => q.eq("email", email))
    .first();
  if (existing) throw new ConvexError("Account setup is closed.");
  return ctx.db.insert("users", { email });
}
