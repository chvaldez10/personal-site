import { z } from "zod";

export const workoutDraftKey = "shadowboxing-session-draft-v1";

export const workoutDraftSchema = z.object({
  title: z.string().max(80),
  targetMinutes: z.string().max(4),
  roundLengthMinutes: z.string().max(3),
  discipline: z.string().max(40),
  focus: z.string().max(40),
  rounds: z
    .array(
      z.object({
        name: z.string().max(80),
        lengthMinutes: z.string().max(3),
        objective: z.string().max(240),
        coachingCue: z.string().max(180),
        techniqueReminder: z.string().max(160),
      }),
    )
    .max(12),
});

type StoredDraft = z.infer<typeof workoutDraftSchema>;

export type WorkoutRound = StoredDraft["rounds"][number] & { id: number };

export type WorkoutDraft = Omit<StoredDraft, "rounds"> & {
  rounds: WorkoutRound[];
};

export const initialWorkoutDraft: WorkoutDraft = {
  title: "Movement reset",
  targetMinutes: "3",
  roundLengthMinutes: "3",
  discipline: "MMA",
  focus: "Technique",
  rounds: [
    {
      id: 1,
      name: "Movement",
      lengthMinutes: "3",
      objective: "Keep a balanced stance while moving in and out of range.",
      coachingCue: "Stay light and let your feet set the distance.",
      techniqueReminder: "Keep your stance under you as you step.",
    },
  ],
};

export function serializeWorkoutDraft(draft: WorkoutDraft) {
  return JSON.stringify({
    title: draft.title,
    targetMinutes: draft.targetMinutes,
    roundLengthMinutes: draft.roundLengthMinutes,
    discipline: draft.discipline,
    focus: draft.focus,
    rounds: draft.rounds.map(
      ({ name, lengthMinutes, objective, coachingCue, techniqueReminder }) => ({
        name,
        lengthMinutes,
        objective,
        coachingCue,
        techniqueReminder,
      }),
    ),
  } satisfies StoredDraft);
}

export function hydrateWorkoutDraft(draft: StoredDraft): WorkoutDraft {
  return {
    ...draft,
    rounds: draft.rounds.map((round, index) => ({ ...round, id: index + 1 })),
  };
}

export function moveWorkoutRound(
  rounds: WorkoutRound[],
  sourceId: number,
  targetId: number,
) {
  if (sourceId === targetId) return rounds;
  const sourceIndex = rounds.findIndex((round) => round.id === sourceId);
  const targetIndex = rounds.findIndex((round) => round.id === targetId);
  if (sourceIndex < 0 || targetIndex < 0) return rounds;

  const next = [...rounds];
  const [moved] = next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, moved);
  return next;
}

export function minutes(value: string, maximum: number): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= maximum
    ? parsed
    : null;
}
