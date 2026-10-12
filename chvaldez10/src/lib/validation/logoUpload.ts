import { z } from "zod";

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

export const logoUploadSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Add a label.")
    .max(120, "Keep the label within 120 characters."),
  alt: z
    .string()
    .trim()
    .min(1, "Add an image description.")
    .max(250, "Keep the image description within 250 characters."),
  description: z
    .string()
    .trim()
    .min(1, "Add details.")
    .max(2000, "Keep the details within 2,000 characters."),
  referralLink: z
    .string()
    .trim()
    .max(2048, "The website link is too long.")
    .refine((value) => {
      if (!value) return true;
      try {
        const url = new URL(value);
        return url.protocol === "https:" && !url.username && !url.password;
      } catch {
        return false;
      }
    }, "Use an HTTPS website link.")
    .transform((value) => value || undefined),
});
