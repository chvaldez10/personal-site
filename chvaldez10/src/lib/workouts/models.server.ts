import type { WorkoutModelOption } from "./schema";
import { availableGeminiModelIds } from "./gemini-models.server";

const modelCatalog = [
  {
    id: "gemini-3.5-flash-lite",
    label: "Gemini 3.5 Flash-Lite",
    provider: "gemini",
  },
  {
    id: "gemini-3.1-flash-lite",
    label: "Gemini 3.1 Flash-Lite",
    provider: "gemini",
  },
] as const;

export type WorkoutModelConfig = (typeof modelCatalog)[number];

export async function availableWorkoutModels(): Promise<WorkoutModelOption[]> {
  const available = await availableGeminiModelIds();
  return modelCatalog
    .filter((model) => available.has(`models/${model.id}`))
    .map(({ id, label, provider }) => ({ id, label, provider }));
}

export async function resolveWorkoutModel(id: string) {
  const available = await availableWorkoutModels();
  if (!available.some((model) => model.id === id)) return null;
  return modelCatalog.find((model) => model.id === id) ?? null;
}
