import {
  resolveVoice,
  resolveVoiceModel,
} from "@/lib/workouts/audio/models.server";
import {
  AudioGenerationError,
  generateCoachingAudio,
} from "@/lib/workouts/audio/providers/index.server";
import {
  audioRequestSchema,
  audioRequestText,
} from "@/lib/workouts/audio/schema";
import { workoutOwnerAccess } from "@/lib/workouts/owner.server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const access = await workoutOwnerAccess();
  if (access === "signedOut")
    return Response.json(
      { error: "Sign in to generate coaching audio." },
      { status: 401 },
    );
  if (access === "forbidden")
    return Response.json(
      { error: "Only the site owner can generate coaching audio." },
      { status: 403 },
    );
  if (access === "unavailable")
    return Response.json(
      { error: "Sign-in could not be verified. Try again." },
      { status: 503 },
    );

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = audioRequestSchema.safeParse(body);
  if (!parsed.success)
    return Response.json(
      { error: "Check the audio settings and try again." },
      { status: 400 },
    );

  const model = resolveVoiceModel(parsed.data.modelId);
  const voice = resolveVoice(parsed.data.voiceId);
  if (!model || !voice)
    return Response.json(
      {
        error:
          "That voice model or voice is unavailable. Refresh and try again.",
      },
      { status: 503 },
    );

  const text = audioRequestText(parsed.data);

  try {
    const audio = await generateCoachingAudio(model, voice.id, text);
    return new Response(new Uint8Array(audio), {
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof AudioGenerationError)
      return Response.json(
        { error: error.message },
        {
          status: error.status,
          headers:
            error.retryAfter && /^\d+$/.test(error.retryAfter)
              ? { "Retry-After": error.retryAfter }
              : undefined,
        },
      );
    console.error("Coaching audio generation failed unexpectedly.");
    return Response.json(
      { error: "Coaching audio could not be generated. Try again." },
      { status: 500 },
    );
  }
}
