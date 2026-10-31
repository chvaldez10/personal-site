import { z } from "zod";

export const disciplines = ["MMA", "Muay Thai", "Kickboxing", "Boxing"] as const;
export const focuses = [
  "Technique",
  "Footwork",
  "Defense",
  "Combinations",
  "Conditioning",
] as const;

const roundContentSchema = z.object({
  name: z.string().trim().min(2).max(80),
  objective: z.string().trim().min(12).max(240),
  coachingCue: z.string().trim().min(8).max(180),
  techniqueReminder: z.string().trim().max(160),
});

export const generatedContentSchema = z.object({
  rounds: z.array(roundContentSchema).min(1).max(12),
});

export const workoutSchema = z.object({
  rounds: z
    .array(roundContentSchema.extend({ lengthMinutes: z.number().int().min(1).max(30) }))
    .min(1)
    .max(12),
});

export const generationRequestSchema = z.object({
  modelId: z.string().min(1).max(80),
  mode: z.enum(["customize", "fresh"]),
  targetMinutes: z.number().int().min(1).max(180),
  preferredRoundMinutes: z.number().int().min(1).max(30),
  discipline: z.enum(disciplines),
  focus: z.enum(focuses),
  notes: z.string().trim().max(500),
  currentRounds: z
    .array(
      z.object({
        name: z.string().trim().max(80),
        lengthMinutes: z.number().int().min(1).max(30),
        objective: z.string().trim().max(240),
        coachingCue: z.string().trim().max(180),
        techniqueReminder: z.string().trim().max(160),
      }),
    )
    .max(12),
  previousObjectives: z.array(z.string().trim().max(240)).max(12),
});

export type GenerationRequest = z.infer<typeof generationRequestSchema>;
export type GeneratedWorkout = z.infer<typeof workoutSchema>;

export type WorkoutModelOption = {
  id: string;
  label: string;
  provider: string;
};
