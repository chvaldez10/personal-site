import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const logoFields = {
  legacyId: v.union(v.number(), v.null()),
  alt: v.string(),
  label: v.union(v.string(), v.null()),
  description: v.string(),
  src: v.string(),
  active: v.union(v.boolean(), v.null()),
  referral_link: v.union(v.string(), v.null()),
  created: v.union(v.string(), v.null()),
  updated: v.union(v.string(), v.null()),
};

export default defineSchema({
  ...authTables,
  brandLogos: defineTable({
    ...logoFields,
    sortOrder: v.number(),
    cloudflareImageId: v.optional(v.string()),
  })
    .index("by_legacyId", ["legacyId"])
    .index("by_sortOrder", ["sortOrder"])
    .index("by_cloudflareImageId", ["cloudflareImageId"]),
  featureFlags: defineTable({
    name: v.string(),
    enabled: v.boolean(),
  }).index("by_name", ["name"]),
  siteAssets: defineTable({
    name: v.string(),
    storageId: v.id("_storage"),
  }).index("by_name", ["name"]),
  pendingImages: defineTable({
    imageId: v.string(),
    ownerId: v.id("users"),
    expiresAt: v.number(),
    logoId: v.optional(v.id("brandLogos")),
  }).index("by_imageId", ["imageId"]),
  projectSection: defineTable({
    name: v.string(),
    heading: v.string(),
    description: v.string(),
  }).index("by_name", ["name"]),
  projects: defineTable({
    projectName: v.string(),
    projectDescription: v.string(),
    projectImage: v.string(),
    projectGithub: v.optional(v.string()),
    status: v.union(
      v.literal("Building"),
      v.literal("Ideas"),
      v.literal("Maintaining"),
    ),
    sortOrder: v.number(),
  }).index("by_sortOrder", ["sortOrder"]),
  tutoringInquiries: defineTable({
    contactName: v.string(),
    email: v.string(),
    grade: v.number(),
    subject: v.union(
      v.literal("math"),
      v.literal("science"),
      v.literal("both"),
    ),
    message: v.string(),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("closed"),
    ),
  }).index("by_status", ["status"]),
});
