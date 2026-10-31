import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import schema from "./schema";
import { requireOwner } from "./permissions";

const round = v.object({
  name: v.string(),
  lengthMinutes: v.number(),
  objective: v.string(),
  coachingCue: v.string(),
  techniqueReminder: v.string(),
});

const details = {
  title: v.string(),
  discipline: v.string(),
  focus: v.string(),
  targetMinutes: v.number(),
  roundLengthMinutes: v.number(),
  rounds: v.array(round),
};

function text(value: string, label: string, minimum: number, maximum: number) {
  const trimmed = value.trim();
  if (trimmed.length < minimum || trimmed.length > maximum)
    throw new ConvexError(`${label} must be ${minimum}–${maximum} characters.`);
  return trimmed;
}

function minutes(value: number, label: string, maximum: number) {
  if (!Number.isInteger(value) || value < 1 || value > maximum)
    throw new ConvexError(`${label} must be 1–${maximum} minutes.`);
  return value;
}

export const list = query({
  args: {},
  returns: v.array(schema.doc("shadowboxingWorkouts")),
  handler: async (ctx) => {
    const owner = await requireOwner(ctx);
    return ctx.db
      .query("shadowboxingWorkouts")
      .withIndex("by_ownerId_and_updatedAt", (q) => q.eq("ownerId", owner._id))
      .order("desc")
      .take(50);
  },
});

export const save = mutation({
  args: { id: v.optional(v.id("shadowboxingWorkouts")), ...details },
  returns: v.id("shadowboxingWorkouts"),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const title = text(args.title, "Session name", 2, 80);
    const discipline = text(args.discipline, "Style", 2, 40);
    const focus = text(args.focus, "Focus", 2, 40);
    const targetMinutes = minutes(args.targetMinutes, "Target", 180);
    const roundLengthMinutes = minutes(
      args.roundLengthMinutes,
      "Round length",
      30,
    );
    if (args.rounds.length < 1 || args.rounds.length > 12)
      throw new ConvexError("Save 1–12 rounds per session.");
    const rounds = args.rounds.map((item) => ({
      name: text(item.name, "Round name", 2, 80),
      lengthMinutes: minutes(item.lengthMinutes, "Round length", 30),
      objective: text(item.objective, "Objective", 12, 240),
      coachingCue: text(item.coachingCue, "Coaching cue", 8, 180),
      techniqueReminder: text(
        item.techniqueReminder,
        "Technique reminder",
        0,
        160,
      ),
    }));
    if (rounds.reduce((sum, item) => sum + item.lengthMinutes, 0) > 45)
      throw new ConvexError("Saved audio sessions can be at most 45 minutes.");
    const document = {
      ownerId: owner._id,
      title,
      discipline,
      focus,
      targetMinutes,
      roundLengthMinutes,
      rounds,
      updatedAt: Date.now(),
    };
    if (args.id) {
      const existing = await ctx.db.get("shadowboxingWorkouts", args.id);
      if (!existing || existing.ownerId !== owner._id)
        throw new ConvexError("Session not found.");
      await ctx.db.replace("shadowboxingWorkouts", args.id, document);
      return args.id;
    }
    const saved = await ctx.db
      .query("shadowboxingWorkouts")
      .withIndex("by_ownerId_and_updatedAt", (q) => q.eq("ownerId", owner._id))
      .take(50);
    if (saved.length >= 50)
      throw new ConvexError(
        "You can save up to 50 sessions. Delete one first.",
      );
    return ctx.db.insert("shadowboxingWorkouts", document);
  },
});

export const remove = mutation({
  args: { id: v.id("shadowboxingWorkouts") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const owner = await requireOwner(ctx);
    const workout = await ctx.db.get("shadowboxingWorkouts", id);
    if (!workout || workout.ownerId !== owner._id)
      throw new ConvexError("Session not found.");
    await ctx.db.delete("shadowboxingWorkouts", id);
    return null;
  },
});
