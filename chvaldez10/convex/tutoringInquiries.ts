import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import schema from "./schema";
import { requireOwner } from "./permissions";

const status = v.union(
  v.literal("new"),
  v.literal("contacted"),
  v.literal("closed"),
);
const subject = v.union(
  v.literal("math"),
  v.literal("science"),
  v.literal("both"),
);

export const submit = mutation({
  args: {
    contactName: v.string(),
    email: v.string(),
    grade: v.number(),
    subject,
    message: v.string(),
    website: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (args.website) return null;
    const contactName = args.contactName.trim();
    const email = args.email.trim().toLowerCase();
    const message = args.message.trim();
    if (
      contactName.length < 2 ||
      contactName.length > 100 ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !Number.isInteger(args.grade) ||
      args.grade < 7 ||
      args.grade > 12 ||
      message.length < 10 ||
      message.length > 1000
    ) {
      throw new ConvexError("Please check the form and try again.");
    }
    await ctx.db.insert("tutoringInquiries", {
      contactName,
      email,
      grade: args.grade,
      subject: args.subject,
      message,
      status: "new",
    });
    return null;
  },
});

export const listForOwner = query({
  args: { status },
  returns: v.array(schema.doc("tutoringInquiries")),
  handler: async (ctx, args) => {
    await requireOwner(ctx);
    return ctx.db
      .query("tutoringInquiries")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .take(100);
  },
});

export const setStatus = mutation({
  args: { id: v.id("tutoringInquiries"), status },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwner(ctx);
    await ctx.db.patch("tutoringInquiries", args.id, { status: args.status });
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("tutoringInquiries") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwner(ctx);
    await ctx.db.delete("tutoringInquiries", args.id);
    return null;
  },
});
