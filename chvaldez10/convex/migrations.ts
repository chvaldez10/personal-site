import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { logoFields } from "./schema";

const { legacyId: _legacyId, ...legacyFields } = logoFields;
export const importData = internalMutation({
  args: {
    logos: v.array(v.object({ id: v.number(), ...legacyFields })),
    flags: v.array(v.object({ name: v.string(), enabled: v.boolean() })),
    resumeStorageId: v.id("_storage"),
  },
  returns: v.object({ logos: v.number(), flags: v.number() }),
  handler: async (ctx, args) => {
    if (args.logos.length > 200 || args.flags.length > 50)
      throw new Error("Import batch is too large.");
    for (const [sortOrder, row] of args.logos.entries()) {
      const { id, ...fields } = row;
      const existing = await ctx.db
        .query("brandLogos")
        .withIndex("by_legacyId", (q) => q.eq("legacyId", id))
        .unique();
      const values = { ...fields, legacyId: id, sortOrder };
      // Preserve migrated media when a legacy export is replayed.
      if (existing?.cloudflareImageId) values.src = existing.src;
      if (existing) await ctx.db.patch("brandLogos", existing._id, values);
      else await ctx.db.insert("brandLogos", values);
    }
    for (const flag of args.flags) {
      const existing = await ctx.db
        .query("featureFlags")
        .withIndex("by_name", (q) => q.eq("name", flag.name))
        .unique();
      if (existing) await ctx.db.patch("featureFlags", existing._id, flag);
      else await ctx.db.insert("featureFlags", flag);
    }
    const existingResume = await ctx.db
      .query("siteAssets")
      .withIndex("by_name", (q) => q.eq("name", "resume"))
      .unique();
    if (existingResume)
      await ctx.db.patch("siteAssets", existingResume._id, {
        storageId: args.resumeStorageId,
      });
    else
      await ctx.db.insert("siteAssets", {
        name: "resume",
        storageId: args.resumeStorageId,
      });
    return { logos: args.logos.length, flags: args.flags.length };
  },
});

export const legacyImage = internalQuery({
  args: { legacyId: v.number() },
  returns: v.union(
    v.object({ src: v.string(), imageId: v.union(v.string(), v.null()) }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("brandLogos")
      .withIndex("by_legacyId", (q) => q.eq("legacyId", args.legacyId))
      .unique();
    return row
      ? { src: row.src, imageId: row.cloudflareImageId ?? null }
      : null;
  },
});

export const setCloudflareImage = internalMutation({
  args: { legacyId: v.number(), imageId: v.string(), src: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("brandLogos")
      .withIndex("by_legacyId", (q) => q.eq("legacyId", args.legacyId))
      .unique();
    if (!row) throw new Error("Logo does not exist.");
    await ctx.db.patch("brandLogos", row._id, {
      cloudflareImageId: args.imageId,
      src: args.src,
    });
    return null;
  },
});

export const status = internalQuery({
  args: {},
  returns: v.object({
    logos: v.number(),
    flags: v.number(),
    migratedImages: v.number(),
    resumeConfigured: v.boolean(),
  }),
  handler: async (ctx) => {
    const logos = await ctx.db
      .query("brandLogos")
      .withIndex("by_sortOrder")
      .take(201);
    const flags = await ctx.db
      .query("featureFlags")
      .withIndex("by_name")
      .take(51);
    const resume = await ctx.db
      .query("siteAssets")
      .withIndex("by_name", (q) => q.eq("name", "resume"))
      .unique();
    return {
      logos: logos.length,
      flags: flags.length,
      migratedImages: logos.filter((logo) => !!logo.cloudflareImageId).length,
      resumeConfigured: !!resume,
    };
  },
});
