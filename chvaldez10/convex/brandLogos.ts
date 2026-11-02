import { v } from "convex/values";
import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { query, mutation } from "./_generated/server";
import { logoFields } from "./schema";
import type { Doc } from "./_generated/dataModel";
import { requireOwner } from "./permissions";
import type { QueryCtx } from "./_generated/server";

const dto = v.object({ id: v.string(), ...logoFields });
function logoDTO({
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
}: Doc<"brandLogos">) {
  return {
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
  };
}
async function readLogos(ctx: QueryCtx) {
  const rows = await ctx.db
    .query("brandLogos")
    .withIndex("by_sortOrder")
    .take(200);
  return rows.map(logoDTO);
}
export const list = query({
  args: {},
  returns: v.array(dto),
  handler: async (ctx) => {
    // Legacy null means visible, just like true. Inactive rows never occupy
    // the public display limit or become dependencies of this query.
    const [active, legacyActive] = await Promise.all([
      ctx.db
        .query("brandLogos")
        .withIndex("by_active_and_sortOrder", (q) => q.eq("active", true))
        .take(200),
      ctx.db
        .query("brandLogos")
        .withIndex("by_active_and_sortOrder", (q) => q.eq("active", null))
        .take(200),
    ]);
    return [...active, ...legacyActive]
      .sort(
        (a, b) =>
          a.sortOrder - b.sortOrder || a._creationTime - b._creationTime,
      )
      .slice(0, 200)
      .map(logoDTO);
  },
});
export const pageForAdmin = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(dto),
  handler: async (ctx, args) => {
    await requireOwner(ctx);
    const result = await ctx.db
      .query("brandLogos")
      .withIndex("by_sortOrder")
      .paginate(args.paginationOpts);
    return { ...result, page: result.page.map(logoDTO) };
  },
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
