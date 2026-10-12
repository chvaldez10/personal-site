import { Password } from "@convex-dev/auth/providers/Password";
import {
  ConvexCredentials,
  type ConvexCredentialsUserConfig,
} from "@convex-dev/auth/providers/ConvexCredentials";
import { convexAuth } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import { api } from "./_generated/api";
import { env, type MutationCtx } from "./_generated/server";
import { createOwnerUser, ownerEmail } from "./permissions";
import type { DataModel } from "./_generated/dataModel";

const password = Password({
  profile(params) {
    const email =
      typeof params.email === "string" ? params.email.trim().toLowerCase() : "";
    if (!ownerEmail() || email !== ownerEmail())
      throw new ConvexError("Invalid credentials.");
    if (
      params.flow === "signUp" &&
      (!env.OWNER_SETUP_KEY || params.setupKey !== env.OWNER_SETUP_KEY)
    ) {
      throw new ConvexError("Account setup is not authorized.");
    }
    if (params.flow !== "signIn" && params.flow !== "signUp")
      throw new ConvexError("This login flow is unavailable.");
    return { email };
  },
  validatePasswordRequirements(password) {
    if (
      typeof password !== "string" ||
      password.length < 12 ||
      password.length > 128
    ) {
      throw new ConvexError("Choose a password between 12 and 128 characters.");
    }
  },
});

// Auth.js provider factories place their configured implementation in options.
// Wrap that implementation, not the placeholder authorize on the factory result.
const configuredPassword = (
  password as typeof password & {
    options: ConvexCredentialsUserConfig<DataModel>;
  }
).options;

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    ConvexCredentials<DataModel>({
      ...configuredPassword,
      authorize: async (params, ctx) => {
        if (params.flow === "signUp") {
          const available: boolean = await ctx.runQuery(
            api.admin.setupAvailable,
            {},
          );
          if (!available) throw new ConvexError("Account setup is closed.");
        }
        return configuredPassword.authorize(params, ctx);
      },
    }),
  ],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      const email = ownerEmail();
      if (
        !email ||
        args.type !== "credentials" ||
        args.profile.email !== email ||
        args.existingUserId
      ) {
        throw new ConvexError("Account setup is not authorized.");
      }
      // Convex Auth's callback erases the app schema; restore only the database
      // type here. The callback is executing in this app's mutation context.
      return createOwnerUser({ db: ctx.db as MutationCtx["db"] }, email);
    },
    async beforeSessionCreation(ctx, { userId }) {
      const user = await ctx.db.get(userId);
      if (!user?.email || user.email !== ownerEmail())
        throw new ConvexError("Dashboard access required.");
    },
  },
});
