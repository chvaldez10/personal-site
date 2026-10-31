import { z } from "zod";

export const voicePreviewText =
  "Stay balanced. Let your feet set the distance, then bring your hands back to guard.";

const selection = {
  modelId: z.string().min(1).max(80),
  voiceId: z.string().min(1).max(80),
};

export const audioRequestSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("preview"), ...selection }),
  z.object({
    kind: z.literal("round"),
    ...selection,
    coachingCue: z.string().trim().min(1).max(180),
    techniqueReminder: z.string().trim().max(160),
  }),
  z.object({
    kind: z.literal("transition"),
    ...selection,
    roundNumber: z.number().int().min(1).max(12),
    name: z.string().trim().min(1).max(80),
    objective: z.string().trim().min(1).max(240),
    coachingCue: z.string().trim().max(180),
    techniqueReminder: z.string().trim().max(160),
  }),
]);

export type AudioRequest = z.infer<typeof audioRequestSchema>;

export function audioRequestText(request: AudioRequest): string {
  return request.kind === "preview"
    ? voicePreviewText
    : request.kind === "transition"
      ? [
          `Round ${request.roundNumber}. ${request.name}.`,
          request.objective,
          request.coachingCue,
          request.techniqueReminder,
        ]
          .filter(Boolean)
          .join(" ")
      : [request.coachingCue, request.techniqueReminder]
          .filter(Boolean)
          .join(" ");
}

export type VoiceModelOption = {
  id: string;
  label: string;
  provider: string;
};

export type VoiceOption = {
  id: string;
  label: string;
  description: string;
  provider: string;
};
