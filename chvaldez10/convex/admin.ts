import { v } from "convex/values";
import { HOUR, RateLimiter } from "@convex-dev/rate-limiter";
import { internalQuery, mutation, query, env } from "./_generated/server";
import { components } from "./_generated/api";
import { currentOwner, ownerEmail, requireOwner } from "./permissions";

const usageLimits = {
  workoutGeneration: { hourly: 10, daily: 60 },
  coachingAudio: { hourly: 60, daily: 300 },
  imageUpload: { hourly: 30, daily: 150 },
  imageVerification: { hourly: 120, daily: 600 },
};
const usageLimiter = new RateLimiter(components.rateLimiter);

export const consumeExternalRequest = mutation({
  args: {
    kind: v.union(
      v.literal("workoutGeneration"),
      v.literal("coachingAudio"),
      v.literal("imageUpload"),
      v.literal("imageVerification"),
    ),
  },
  returns: v.object({ ok: v.boolean(), retryAfterSeconds: v.number() }),
  handler: async (ctx, { kind }) => {
    const owner = await requireOwner(ctx);
    const limits = usageLimits[kind];

    for (const [window, rate, period] of [
      ["hourly", limits.hourly, HOUR],
      ["daily", limits.daily, 24 * HOUR],
    ] as const) {
      const result = await usageLimiter.limit(ctx, `${kind}:${window}`, {
        key: owner._id,
        config: { kind: "fixed window", rate, period },
      });
      if (!result.ok)
        return {
          ok: false,
          retryAfterSeconds: Math.max(1, Math.ceil(result.retryAfter / 1000)),
        };
    }
    return { ok: true, retryAfterSeconds: 0 };
  },
});

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
