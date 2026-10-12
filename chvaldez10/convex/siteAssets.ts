import { v } from "convex/values";
import { query } from "./_generated/server";

export const resume = query({
  args: {},
  returns: v.union(v.string(), v.null()),
  handler: async (ctx) => {
    const asset = await ctx.db
      .query("siteAssets")
      .withIndex("by_name", (q) => q.eq("name", "resume"))
      .unique();
    if (!asset) return null;
    const metadata = await ctx.db.system.get("_storage", asset.storageId);
    if (!metadata || metadata.contentType !== "application/pdf") return null;
    return ctx.storage.getUrl(asset.storageId);
  },
});
