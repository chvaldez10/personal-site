import type { VoiceModelConfig } from "../models.server";
import { generateGeminiAudio } from "./gemini.server";

export { AudioGenerationError } from "./gemini.server";

const adapters = {
  gemini: generateGeminiAudio,
} satisfies Record<
  VoiceModelConfig["provider"],
  (modelId: string, voiceId: string, text: string) => Promise<Buffer>
>;

export function generateCoachingAudio(
  model: VoiceModelConfig,
  voiceId: string,
  text: string,
) {
  return adapters[model.provider](model.id, voiceId, text);
}
