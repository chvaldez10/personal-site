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
import {
  parseOwnerWorkoutRequest,
  workoutErrorResponse,
} from "@/lib/workouts/request.server";
import { reserveWorkoutRequest } from "@/lib/workouts/usage.server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const parsed = await parseOwnerWorkoutRequest(request, audioRequestSchema, {
    signedOut: "Sign in to generate coaching audio.",
    forbidden: "Only the site owner can generate coaching audio.",
    unavailable: "Sign-in could not be verified. Try again.",
    invalid: "Check the audio settings and try again.",
  });
  if ("response" in parsed) return parsed.response;

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

  const limited = await reserveWorkoutRequest("coachingAudio", parsed.token);
  if (limited) return limited;

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
      return workoutErrorResponse(
        error.message,
        error.status,
        error.retryAfter,
      );
    console.error("Coaching audio generation failed unexpectedly.");
    return Response.json(
      { error: "Coaching audio could not be generated. Try again." },
      { status: 500 },
    );
  }
}
