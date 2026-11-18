import { fetchMutation } from "convex/nextjs";
import { api } from "@convex/_generated/api";

export async function reserveWorkoutRequest(
  kind: "workoutGeneration" | "coachingAudio",
  token: string,
): Promise<Response | null> {
  try {
    const usage = await fetchMutation(
      api.admin.consumeExternalRequest,
      { kind },
      { token },
    );
    if (usage.ok) return null;
    return Response.json(
      {
        error: `Usage limit reached. Try again in ${usage.retryAfterSeconds} seconds.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(usage.retryAfterSeconds),
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch {
    console.error("External request usage could not be verified.");
    return Response.json(
      { error: "Usage limits could not be verified. Please try again." },
      { status: 503 },
    );
  }
}
