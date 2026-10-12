import { v } from "convex/values";
import { query } from "./_generated/server";

// The imported setting never opens public registration. Setup is owner-only.
export const signupEnabled = query({
  args: {},
  returns: v.boolean(),
  handler: () => false,
});
