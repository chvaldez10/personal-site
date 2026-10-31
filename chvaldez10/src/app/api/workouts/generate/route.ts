import {
  generatedContentSchema,
  generationRequestSchema,
  workoutSchema,
} from "@/lib/workouts/schema";
import { roundSchedule, workoutPrompt } from "@/lib/workouts/generation";
import { resolveWorkoutModel } from "@/lib/workouts/models.server";
import { workoutOwnerAccess } from "@/lib/workouts/owner.server";
import {
  generateStructuredWorkout,
  WorkoutGenerationError,
} from "@/lib/workouts/providers/index.server";

export async function POST(request: Request) {
  const access = await workoutOwnerAccess();
  if (access === "signedOut")
    return Response.json(
      { error: "Sign in to generate a workout." },
      { status: 401 },
    );
  if (access === "forbidden")
    return Response.json(
      { error: "Only the site owner can generate workouts." },
      { status: 403 },
    );
  if (access === "unavailable")
    return Response.json(
      { error: "Sign-in could not be verified. Please try again." },
      { status: 503 },
    );

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = generationRequestSchema.safeParse(body);
  if (!parsed.success)
    return Response.json(
      { error: "Check the workout settings and try again." },
      { status: 400 },
    );

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
    console.error("Workout generation failed unexpectedly.");
    return Response.json(
      { error: "The workout could not be generated. Please try again." },
      { status: 500 },
    );
  }
}
