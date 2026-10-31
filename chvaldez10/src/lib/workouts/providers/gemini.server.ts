import { z } from "zod";
import { generatedContentSchema } from "../schema";
import type { workoutPrompt } from "../generation";

const geminiResponseSchema = z.object({
  candidates: z.array(
    z.object({
      content: z.object({
        parts: z.array(z.object({ text: z.string().optional() })),
      }),
    }),
  ),
});

export class WorkoutGenerationError extends Error {
  constructor(
    message: string,
    public status: number,
    public retryAfter?: string,
  ) {
    super(message);
  }
}

export async function generateWithGemini(
  modelId: string,
  prompt: ReturnType<typeof workoutPrompt>,
): Promise<unknown> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key)
    throw new WorkoutGenerationError("AI generation is not configured.", 503);

  const schema = z.toJSONSchema(generatedContentSchema);
  delete schema.$schema;

  let response: Response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: prompt.system }] },
          contents: [{ role: "user", parts: [{ text: prompt.user }] }],
          generationConfig: {
            responseFormat: {
              text: { mimeType: "APPLICATION_JSON", schema },
            },
            maxOutputTokens: 3072,
            temperature: 0.8,
          },
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(30000),
      },
    );
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError")
      throw new WorkoutGenerationError(
        "The AI took too long to respond. Please try again.",
        504,
      );
    throw new WorkoutGenerationError(
      "The AI service is unavailable right now. Please try again later.",
      503,
    );
  }

  if (response.status === 429)
    throw new WorkoutGenerationError(
      "The AI is at its free-tier limit. Please try again later.",
      429,
      response.headers.get("retry-after") ?? undefined,
    );
  if (!response.ok)
    throw new WorkoutGenerationError(
      response.status === 401 || response.status === 403
        ? "The selected AI model is not available for this account."
        : "The AI could not generate a workout right now. Please try again later.",
      503,
    );

  let raw: unknown;
  try {
    raw = await response.json();
  } catch {
    throw new WorkoutGenerationError("The AI returned an invalid response.", 502);
  }
  const parsed = geminiResponseSchema.safeParse(raw);
  const text = parsed.success
    ? parsed.data.candidates[0]?.content.parts
        .map((part) => part.text ?? "")
        .join("")
    : null;
  if (!text)
    throw new WorkoutGenerationError(
      "The AI did not return a workout. Please try again.",
      502,
    );
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new WorkoutGenerationError(
      "The AI returned an invalid workout. Please try again.",
      502,
    );
  }
}
