import { z } from "zod";
import { disciplines, focuses, workoutSchema } from "./schema";

export const savedWorkoutSchema = z.object({
  title: z.string().trim().min(2).max(80),
  discipline: z.enum(disciplines),
  focus: z.enum(focuses),
  targetMinutes: z.number().int().min(1).max(180),
  roundLengthMinutes: z.number().int().min(1).max(30),
  rounds: workoutSchema.shape.rounds.refine(
    (rounds) =>
      rounds.reduce((sum, round) => sum + round.lengthMinutes, 0) <= 45,
  ),
});
