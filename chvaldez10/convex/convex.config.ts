import { defineApp } from "convex/server";
import { v } from "convex/values";

export default defineApp({
  env: {
    OWNER_EMAIL: v.optional(v.string()),
    OWNER_SETUP_KEY: v.optional(v.string()),
    CLOUDFLARE_ACCOUNT_ID: v.optional(v.string()),
    CLOUDFLARE_IMAGES_ACCOUNT_HASH: v.optional(v.string()),
    CLOUDFLARE_IMAGES_VARIANT: v.optional(v.string()),
    CLOUDFLARE_IMAGES_API_TOKEN: v.optional(v.string()),
  },
});
