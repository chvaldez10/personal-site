import { z } from "zod";

const responseSchema = z.object({
  steps: z.array(
    z.object({
      type: z.string(),
      content: z
        .array(
          z.object({
            type: z.string(),
            data: z.string().optional(),
            mime_type: z.string().optional(),
          }),
        )
        .optional(),
    }),
  ),
});

export class AudioGenerationError extends Error {
  constructor(
    message: string,
    public status: number,
    public retryAfter?: string,
  ) {
    super(message);
  }
}

export async function generateGeminiAudio(
  modelId: string,
  voiceId: string,
  text: string,
) {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key)
    throw new AudioGenerationError("Coaching audio is not configured.", 503);

  let response: Response;
  try {
    response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          model: modelId,
          input: [
            {
              type: "user_input",
              content: [
                {
                  type: "text",
                  text,
                  annotations: [
                    {
                      type: "speech_metadata",
                      style:
                        "Natural, conversational MMA coach. Confident and encouraging, with a moderately brisk rhythm and short pauses between sentences. Give clear technical direction with restrained emphasis, without a motivational speech.",
                    },
                  ],
                },
              ],
            },
          ],
          response_format: { type: "audio" },
          generation_config: { speech_config: [{ voice: voiceId }] },
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(30000),
      },
    );
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError")
      throw new AudioGenerationError(
        "Audio generation took too long. Try again.",
        504,
      );
    throw new AudioGenerationError(
      "The voice service is unavailable. Try again later.",
      503,
    );
  }

  if (response.status === 429)
    throw new AudioGenerationError(
      "Google is limiting voice requests for this model. Check its quota in AI Studio and try again after it resets.",
      429,
      response.headers.get("retry-after") ?? undefined,
    );
  if (!response.ok)
    throw new AudioGenerationError(
      response.status === 401 || response.status === 403
        ? "This voice model is unavailable for the configured account."
        : "Coaching audio could not be generated. Try again later.",
      503,
    );

  let raw: unknown;
  try {
    raw = await response.json();
  } catch {
    throw new AudioGenerationError(
      "The voice service returned invalid audio.",
      502,
    );
  }
  const parsed = responseSchema.safeParse(raw);
  const audio = parsed.success
    ? parsed.data.steps
        .filter((step) => step.type === "model_output")
        .flatMap((step) => step.content ?? [])
        .findLast((content) => content.type === "audio")
    : null;
  if (
    !audio?.data ||
    audio.mime_type !== "audio/wav" ||
    audio.data.length > 6_000_000
  )
    throw new AudioGenerationError(
      "The voice service returned invalid audio.",
      502,
    );

  const bytes = Buffer.from(audio.data, "base64");
  if (bytes.length < 44 || bytes.toString("ascii", 0, 4) !== "RIFF")
    throw new AudioGenerationError(
      "The voice service returned invalid audio.",
      502,
    );
  return bytes;
}
