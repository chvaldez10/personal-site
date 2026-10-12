import { v } from "convex/values";
import { internalQuery, query, env } from "./_generated/server";
import { currentOwner, ownerEmail, requireOwner } from "./permissions";

export const current = query({
  args: {},
  returns: v.union(v.object({ email: v.string() }), v.null()),
  handler: async (ctx) => {
    const owner = await currentOwner(ctx);
    return owner?.email ? { email: owner.email } : null;
  },
});

export const setupAvailable = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const email = ownerEmail();
    if (!email || !env.OWNER_SETUP_KEY) return false;
    return !(await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .first());
  },
});

export const requireAccess = internalQuery({
  args: {},
  returns: v.id("users"),
  handler: async (ctx) => (await requireOwner(ctx))._id,
});
