import { cache } from "react";
import { z } from "zod";

const modelsResponseSchema = z.object({
  models: z.array(
    z.object({
      name: z.string(),
      supportedGenerationMethods: z.array(z.string()).optional(),
    }),
  ),
});

export const availableGeminiModelIds = cache(async (): Promise<Set<string>> => {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return new Set();

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000",
      {
        headers: { "x-goog-api-key": key },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!response.ok) {
      console.error("Gemini model availability check failed.", response.status);
      return new Set();
    }
    const parsed = modelsResponseSchema.safeParse(await response.json());
    if (!parsed.success) {
      console.error("Gemini model availability response was invalid.");
      return new Set();
    }
    return new Set(
      parsed.data.models
        .filter((model) =>
          model.supportedGenerationMethods?.includes("generateContent"),
        )
        .map((model) => model.name),
    );
  } catch {
    console.error(
      "Gemini model availability check is temporarily unavailable.",
    );
    return new Set();
  }
});
