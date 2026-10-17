import { defineApp } from "convex/server";
import { v } from "convex/values";
import rateLimiter from "@convex-dev/rate-limiter/convex.config.js";

const app = defineApp({
  env: {
    OWNER_EMAIL: v.string(),
    OWNER_SETUP_KEY: v.optional(v.string()),
    CLOUDFLARE_ACCOUNT_ID: v.string(),
    CLOUDFLARE_IMAGES_ACCOUNT_HASH: v.string(),
    CLOUDFLARE_IMAGES_VARIANT: v.string(),
    CLOUDFLARE_IMAGES_API_TOKEN: v.string(),
  },
});

app.use(rateLimiter);

export default app;
