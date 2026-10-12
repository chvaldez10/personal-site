import type { FunctionReturnType } from "convex/server";
import type { api } from "@convex/_generated/api";
export type BrandLogo = Omit<
  FunctionReturnType<typeof api.brandLogos.list>[number],
  "id"
> & { id: string };
