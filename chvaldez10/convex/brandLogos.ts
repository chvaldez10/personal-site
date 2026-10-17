import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { logoFields } from "./schema";
import { requireOwner } from "./permissions";
import type { QueryCtx } from "./_generated/server";

const dto = v.object({ id: v.string(), ...logoFields });
async function readLogos(ctx: QueryCtx) {
  const rows = await ctx.db
    .query("brandLogos")
    .withIndex("by_sortOrder")
    .take(200);
  return rows.map(
    ({
      _id,
      legacyId,
      alt,
      label,
      description,
      src,
      active,
      referral_link,
      created,
      updated,
    }) => ({
      id: _id,
      legacyId,
      alt,
      label,
      description,
      src,
      active,
      referral_link,
      created,
      updated,
    }),
  );
}
export const list = query({
  args: {},
  returns: v.array(dto),
  handler: async (ctx) =>
    (await readLogos(ctx)).filter((logo) => logo.active !== false),
});
export const listForAdmin = query({
  args: {},
  returns: v.array(dto),
  handler: async (ctx) => {
    await requireOwner(ctx);
    return readLogos(ctx);
  },
});
export const setActive = mutation({
  args: { id: v.id("brandLogos"), active: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwner(ctx);
    await ctx.db.patch("brandLogos", args.id, {
      active: args.active,
      updated: new Date().toISOString(),
    });
    return null;
  },
});
