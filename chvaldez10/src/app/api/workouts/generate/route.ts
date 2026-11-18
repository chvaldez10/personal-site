import {
  generatedContentSchema,
  generationRequestSchema,
  workoutSchema,
} from "@/lib/workouts/schema";
import { roundSchedule, workoutPrompt } from "@/lib/workouts/generation";
import { resolveWorkoutModel } from "@/lib/workouts/models.server";
import {
  parseOwnerWorkoutRequest,
  workoutErrorResponse,
} from "@/lib/workouts/request.server";
import { reserveWorkoutRequest } from "@/lib/workouts/usage.server";
import {
  generateStructuredWorkout,
  WorkoutGenerationError,
} from "@/lib/workouts/providers/index.server";

export async function POST(request: Request) {
  const parsed = await parseOwnerWorkoutRequest(
    request,
    generationRequestSchema,
    {
      signedOut: "Sign in to generate a workout.",
      forbidden: "Only the site owner can generate workouts.",
      unavailable: "Sign-in could not be verified. Please try again.",
      invalid: "Check the workout settings and try again.",
    },
  );
  if ("response" in parsed) return parsed.response;

  const model = await resolveWorkoutModel(parsed.data.modelId);
  if (!model)
    return Response.json(
      {
        error: "That AI model is unavailable. Refresh the page and try again.",
      },
      { status: 503 },
    );

  const schedule = roundSchedule(
    parsed.data.targetMinutes,
    parsed.data.preferredRoundMinutes,
  );
  const prompt = workoutPrompt(parsed.data, schedule);

  const limited = await reserveWorkoutRequest(
    "workoutGeneration",
    parsed.token,
  );
  if (limited) return limited;

  try {
    const raw = await generateStructuredWorkout(model, prompt);
    const content = generatedContentSchema.safeParse(raw);
    if (!content.success || content.data.rounds.length !== schedule.length)
      throw new WorkoutGenerationError(
        "The AI returned an incomplete workout. Please try again.",
        502,
      );

    const workout = workoutSchema.parse({
      rounds: content.data.rounds.map((round, index) => ({
        ...round,
        lengthMinutes: schedule[index],
      })),
    });
    return Response.json({ workout });
  } catch (error) {
    if (error instanceof WorkoutGenerationError)
      return workoutErrorResponse(
        error.message,
        error.status,
        error.retryAfter,
      );
    console.error("Workout generation failed unexpectedly.");
    return Response.json(
      { error: "The workout could not be generated. Please try again." },
      { status: 500 },
    );
  }
}
