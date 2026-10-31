import { z } from "zod";
import { availableGeminiModelIds } from "../gemini-models.server";
import type { VoiceModelOption, VoiceOption } from "./schema";

const modelCatalog = [
  {
    id: "gemini-3.8-flash-tts",
    label: "Gemini 3.8 Flash TTS",
    provider: "gemini",
  },
  {
    id: "gemini-3.8-flash-lite-tts",
    label: "Gemini 3.8 Flash-Lite TTS",
    provider: "gemini",
  },
] as const;

const voiceCatalog = [
  { id: "Alnilam", label: "Alnilam", description: "Firm and direct" },
  { id: "Charon", label: "Charon", description: "Steady and informative" },
  { id: "Achird", label: "Achird", description: "Warm and approachable" },
  { id: "Algenib", label: "Algenib", description: "Low and gravelly" },
] as const;

const voicesResponseSchema = z.object({
  voices: z.array(z.object({ display_name: z.string() })),
});

export type VoiceModelConfig = (typeof modelCatalog)[number];

export function resolveVoiceModel(id: string) {
  return process.env.GEMINI_API_KEY?.trim()
    ? (modelCatalog.find((model) => model.id === id) ?? null)
    : null;
}

export function resolveVoice(id: string) {
  return voiceCatalog.find((voice) => voice.id === id) ?? null;
}

export async function availableAudioOptions(): Promise<{
  models: VoiceModelOption[];
  voices: VoiceOption[];
}> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return { models: [], voices: [] };

  try {
    const [availableModels, voicesResponse] = await Promise.all([
      availableGeminiModelIds(),
      fetch(
        "https://generativelanguage.googleapis.com/v1beta/voices?type=prebuilt&page_size=1000",
        {
          headers: { "x-goog-api-key": key },
          cache: "no-store",
          signal: AbortSignal.timeout(8000),
        },
      ),
    ]);
    if (!voicesResponse.ok) {
      console.error("Gemini audio options could not be checked.");
      return { models: [], voices: [] };
    }
    const voicesResult = voicesResponseSchema.safeParse(
      await voicesResponse.json(),
    );
    if (!voicesResult.success) {
      console.error("Gemini audio options response was invalid.");
      return { models: [], voices: [] };
    }

    const availableVoices = new Set(
      voicesResult.data.voices.map((voice) => voice.display_name),
    );
    return {
      models: modelCatalog
        .filter((model) => availableModels.has(`models/${model.id}`))
        .map(({ id, label, provider }) => ({ id, label, provider })),
      voices: voiceCatalog
        .filter((voice) => availableVoices.has(voice.id))
        .map(({ id, label, description }) => ({ id, label, description })),
    };
  } catch {
    console.error("Gemini audio options are temporarily unavailable.");
    return { models: [], voices: [] };
  }
}
