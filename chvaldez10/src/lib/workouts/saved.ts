import { z } from "zod";
import {
  MAX_PRACTICE_MINUTES,
  MAX_ROUND_MINUTES,
  MAX_SESSION_MINUTES,
} from "./limits.mjs";
import { disciplines, focuses, workoutSchema } from "./schema";

export const savedWorkoutSchema = z.object({
  title: z.string().trim().min(2).max(80),
  discipline: z.enum(disciplines),
  focus: z.enum(focuses),
  targetMinutes: z.number().int().min(1).max(MAX_PRACTICE_MINUTES),
  roundLengthMinutes: z.number().int().min(1).max(MAX_ROUND_MINUTES),
  rounds: workoutSchema.shape.rounds.refine(
    (rounds) =>
      rounds.reduce((sum, round) => sum + round.lengthMinutes, 0) <=
      MAX_SESSION_MINUTES,
  ),
});
