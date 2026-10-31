import type { workoutPrompt } from "../generation";
import type { WorkoutModelConfig } from "../models.server";
import { generateWithGemini } from "./gemini.server";

export { WorkoutGenerationError } from "./gemini.server";

const adapters = {
  gemini: generateWithGemini,
} satisfies Record<
  WorkoutModelConfig["provider"],
  (modelId: string, prompt: ReturnType<typeof workoutPrompt>) => Promise<unknown>
>;

export function generateStructuredWorkout(
  model: WorkoutModelConfig,
  prompt: ReturnType<typeof workoutPrompt>,
) {
  return adapters[model.provider](model.id, prompt);
}
