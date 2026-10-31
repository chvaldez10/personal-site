import type { GenerationRequest } from "./schema";

export function roundSchedule(targetMinutes: number, preferredRoundMinutes: number) {
  const count = Math.min(12, Math.ceil(targetMinutes / preferredRoundMinutes));
  const base = Math.floor(targetMinutes / count);
  const extra = targetMinutes % count;
  return Array.from({ length: count }, (_, index) => base + (index < extra ? 1 : 0));
}

export function workoutPrompt(request: GenerationRequest, schedule: number[]) {
  const system = [
    "You are a concise, technically precise shadowboxing coach.",
    "Design solo striking practice around technical objectives, never fixed punch or kick combinations or numbered strike sequences.",
    "Each round needs one observable objective and one short, natural coaching cue written like a coach speaking to an athlete.",
    "Add a brief technique reminder to about one in three rounds; use an empty string for the other rounds.",
    "Favor balance, guard recovery, range, angles, timing, defense, and controlled movement. Avoid contact drills, injury claims, and unrealistic intensity.",
    "Return only the requested JSON structure. Do not add markdown or extra fields.",
  ].join(" ");

  const user = JSON.stringify({
    task:
      request.mode === "customize"
        ? "Refine the current workout into a coherent technical progression. Use the existing rounds and notes as guidance, but rewrite weak objectives."
        : "Create a new technical shadowboxing workout from scratch. Choose varied round objectives without relying on the current workout.",
    discipline: request.discipline,
    focus: request.focus,
    targetMinutes: request.targetMinutes,
    roundLengthsMinutes: schedule,
    instructions: `Return exactly ${schedule.length} rounds, in the same order as the round lengths. Keep objectives distinct and suitable for the selected style and focus.`,
    ...(request.mode === "customize"
      ? { notes: request.notes, currentRounds: request.currentRounds }
      : {}),
    ...(request.previousObjectives.length
      ? { avoidRepeatingObjectives: request.previousObjectives }
      : {}),
  });

  return { system, user };
}
