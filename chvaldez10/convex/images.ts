import { ConvexError, v } from "convex/values";
import { action, internalAction, env } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

type ProviderImage = {
  id: string;
  uploadURL?: string;
  draft?: boolean;
  variants?: string[];
};
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
function config() {
  const {
    CLOUDFLARE_ACCOUNT_ID: account,
    CLOUDFLARE_IMAGES_API_TOKEN: token,
    CLOUDFLARE_IMAGES_ACCOUNT_HASH: hash,
    CLOUDFLARE_IMAGES_VARIANT: variant,
  } = env;
  if (!account || !token || !hash || !variant)
    throw new ConvexError("Image uploads are not configured.");
  return { account, token, hash, variant };
}
function displayURL(imageId: string) {
  const { hash, variant } = config();
  return `https://imagedelivery.net/${encodeURIComponent(hash)}/${encodeURIComponent(imageId)}/${encodeURIComponent(variant)}`;
}
async function providerRequest(
  path: string,
  init: RequestInit = {},
): Promise<ProviderImage> {
  const { account, token } = config();
  let response: Response;
  let body: unknown;
  try {
    response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${account}/images/${path}`,
      {
        ...init,
        signal: init.signal
          ? AbortSignal.any([init.signal, AbortSignal.timeout(15000)])
          : AbortSignal.timeout(15000),
        headers: { Authorization: `Bearer ${token}`, ...init.headers },
      },
    );
    body = await response.json();
  } catch {
    throw new ConvexError("Image service is unavailable. Please try again.");
  }
  if (
    !response.ok ||
    !record(body) ||
    body.success !== true ||
    !record(body.result) ||
    typeof body.result.id !== "string"
  ) {
    throw new ConvexError("Image service could not complete the request.");
  }
  const result = body.result;
  return {
    id: result.id as string,
    ...(typeof result.uploadURL === "string"
      ? { uploadURL: result.uploadURL }
      : {}),
    ...(typeof result.draft === "boolean" ? { draft: result.draft } : {}),
    ...(Array.isArray(result.variants) &&
    result.variants.every((url) => typeof url === "string")
      ? { variants: result.variants as string[] }
      : {}),
  };
}
function validateCompleted(image: ProviderImage, expectedId: string) {
  if (
    image.id !== expectedId ||
    image.draft === true ||
    !image.variants?.includes(displayURL(expectedId))
  ) {
    throw new ConvexError(
      "The image is not ready. Finish uploading and try again.",
    );
  }
}
function text(value: string, name: string, max: number) {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max)
    throw new ConvexError(
      `${name} is required and must be at most ${max} characters.`,
    );
  return trimmed;
}
// Release verification performs a provider read without creating an upload or
// changing database records. Only deployment tooling can invoke it.
export const verifyExistingImage = internalAction({
  args: { imageId: v.string() },
  returns: v.boolean(),
  handler: async (_ctx, { imageId }) => {
    const image = await providerRequest(`v1/${encodeURIComponent(imageId)}`);
    validateCompleted(image, imageId);
    return true;
  },
});
export const requestUpload = action({
  args: { filename: v.string() },
  returns: v.object({ uploadURL: v.string(), imageId: v.string() }),
  handler: async (
    ctx,
    args,
  ): Promise<{ uploadURL: string; imageId: string }> => {
    await ctx.runQuery(internal.admin.requireAccess, {});
    text(args.filename, "Filename", 255);
    const expiresAt = Date.now() + 15 * 60 * 1000;
    const data = new FormData();
    data.set("expiry", new Date(expiresAt).toISOString());
    data.set("requireSignedURLs", "false");
    const image = await providerRequest("v2/direct_upload", {
      method: "POST",
      body: data,
    });
    if (
      !image.uploadURL ||
      !image.uploadURL.startsWith("https://upload.imagedelivery.net/")
    )
      throw new ConvexError("Image service returned an invalid upload link.");
    await ctx.runMutation(internal.imageRecords.remember, {
      imageId: image.id,
      expiresAt,
    });
    return { uploadURL: image.uploadURL, imageId: image.id };
  },
});
export const completeUpload = action({
  args: {
    imageId: v.string(),
    label: v.string(),
    alt: v.string(),
    description: v.string(),
    referralLink: v.optional(v.string()),
  },
  returns: v.id("brandLogos"),
  handler: async (ctx, args): Promise<Id<"brandLogos">> => {
    await ctx.runQuery(internal.admin.requireAccess, {});
    const pending = await ctx.runQuery(internal.imageRecords.pending, {
      imageId: args.imageId,
    });
    if (pending.logoId) return pending.logoId;
    if (pending.expiresAt < Date.now())
      throw new ConvexError("Upload expired. Please choose the file again.");
    const label = text(args.label, "Label", 120);
    const alt = text(args.alt, "Image description", 250);
    const description = text(args.description, "Description", 2000);
    const referralLink = args.referralLink?.trim() || undefined;
    if (referralLink) {
      let url: URL;
      try {
        url = new URL(referralLink);
      } catch {
        throw new ConvexError("Enter a valid website link.");
      }
      if (
        referralLink.length > 2048 ||
        url.protocol !== "https:" ||
        url.username ||
        url.password
      )
        throw new ConvexError("Use an HTTPS website link.");
    }
    const image = await providerRequest(
      `v1/${encodeURIComponent(args.imageId)}`,
    );
    validateCompleted(image, args.imageId);
    return ctx.runMutation(internal.imageRecords.complete, {
      imageId: args.imageId,
      src: displayURL(image.id),
      label,
      alt,
      description,
      ...(referralLink ? { referralLink } : {}),
    });
  },
});
export const migrateLegacyImage = internalAction({
  args: { legacyId: v.number() },
  returns: v.object({
    legacyId: v.number(),
    imageId: v.string(),
    src: v.string(),
    status: v.union(v.literal("uploaded"), v.literal("existing")),
  }),
  handler: async (
    ctx,
    args,
  ): Promise<{
    legacyId: number;
    imageId: string;
    src: string;
    status: "uploaded" | "existing";
  }> => {
    const row = await ctx.runQuery(internal.migrations.legacyImage, args);
    if (!row) throw new ConvexError("Logo does not exist.");
    const imageId = row.imageId ?? `personal-site-logo-${args.legacyId}`;
    let image: ProviderImage;
    let status: "uploaded" | "existing" = "existing";
    try {
      image = await providerRequest(`v1/${encodeURIComponent(imageId)}`);
      validateCompleted(image, imageId);
    } catch {
      if (row.imageId)
        throw new ConvexError("Existing image could not be verified.");
      const source = new URL(row.src);
      if (
        source.origin !== "https://dvxqlvpokfujnpdwfuom.supabase.co" ||
        !source.pathname.startsWith("/storage/v1/object/public/meda/logos/")
      ) {
        throw new ConvexError(
          "Legacy source is not an approved image location.",
        );
      }
      const form = new FormData();
      form.set("url", source.toString());
      form.set("id", imageId);
      form.set("requireSignedURLs", "false");
      try {
        image = await providerRequest("v1", { method: "POST", body: form });
        status = "uploaded";
      } catch {
        // A retry/concurrent run may have created the deterministic image already.
        image = await providerRequest(`v1/${encodeURIComponent(imageId)}`);
      }
      validateCompleted(image, imageId);
    }
    const src = displayURL(image.id);
    await ctx.runMutation(internal.migrations.setCloudflareImage, {
      legacyId: args.legacyId,
      imageId: image.id,
      src,
    });
    return { legacyId: args.legacyId, imageId: image.id, src, status };
  },
});
