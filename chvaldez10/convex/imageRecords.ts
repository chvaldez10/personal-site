import { v, ConvexError } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { requireOwner } from "./permissions";

export const remember = internalMutation({
  args: { imageId: v.string(), expiresAt: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    await ctx.db.insert("pendingImages", { ...args, ownerId: owner._id });
    return null;
  },
});
export const pending = internalQuery({
  args: { imageId: v.string() },
  returns: v.object({
    expiresAt: v.number(),
    logoId: v.union(v.id("brandLogos"), v.null()),
  }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const pending = await ctx.db
      .query("pendingImages")
      .withIndex("by_imageId", (q) => q.eq("imageId", args.imageId))
      .unique();
    if (!pending || pending.ownerId !== owner._id)
      throw new ConvexError("Upload not found.");
    return { expiresAt: pending.expiresAt, logoId: pending.logoId ?? null };
  },
});
export const complete = internalMutation({
  args: {
    imageId: v.string(),
    src: v.string(),
    label: v.string(),
    alt: v.string(),
    description: v.string(),
    referralLink: v.optional(v.string()),
  },
  returns: v.id("brandLogos"),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const pending = await ctx.db
      .query("pendingImages")
      .withIndex("by_imageId", (q) => q.eq("imageId", args.imageId))
      .unique();
    if (!pending || pending.ownerId !== owner._id)
      throw new ConvexError("Upload not found.");
    if (pending.logoId) return pending.logoId;
    if (pending.expiresAt < Date.now())
      throw new ConvexError("Upload expired. Please choose the file again.");
    const latest = await ctx.db
      .query("brandLogos")
      .withIndex("by_sortOrder")
      .order("desc")
      .first();
    const now = new Date().toISOString();
    const logoId = await ctx.db.insert("brandLogos", {
      legacyId: null,
      sortOrder: (latest?.sortOrder ?? -1) + 1,
      alt: args.alt,
      label: args.label,
      description: args.description,
      src: args.src,
      cloudflareImageId: args.imageId,
      active: true,
      referral_link: args.referralLink ?? null,
      created: now,
      updated: now,
    });
    await ctx.db.patch("pendingImages", pending._id, { logoId });
    return logoId;
  },
});
