import { z } from "zod";

export const brandLogoSchema = z.object({
  id: z.number().int(),
  alt: z.string(),
  description: z.string(),
  src: z.string().min(1),
  active: z.boolean().nullable(),
  label: z.string().nullable(),
  referral_link: z.string().nullable(),
  created: z.string().nullable(),
  updated: z.string().nullable(),
});
export const brandLogosSchema = z.array(brandLogoSchema);
