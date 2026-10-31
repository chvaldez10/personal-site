export interface WorkoutRound {
  id: number;
  name: string;
  lengthMinutes: string;
  objective: string;
  coachingCue: string;
  techniqueReminder: string;
}

export function minutes(value: string, maximum: number): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= maximum
    ? parsed
    : null;
}
