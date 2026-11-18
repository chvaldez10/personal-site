import type { z } from "zod";
import { workoutOwnerAccess, type WorkoutOwnerAccess } from "./owner.server";

const accessErrorStatus = { signedOut: 401, forbidden: 403, unavailable: 503 };
type AccessError = Exclude<WorkoutOwnerAccess["status"], "owner">;

export function workoutErrorResponse(
  error: string,
  status: number,
  retryAfter?: string,
) {
  return Response.json(
    { error },
    {
      status,
      headers:
        retryAfter && /^\d+$/.test(retryAfter)
          ? { "Retry-After": retryAfter }
          : undefined,
    },
  );
}

export async function parseOwnerWorkoutRequest<Schema extends z.ZodType>(
  request: Request,
  schema: Schema,
  messages: Record<AccessError | "invalid", string>,
): Promise<{ data: z.output<Schema>; token: string } | { response: Response }> {
  const access = await workoutOwnerAccess();
  if (access.status !== "owner") {
    return {
      response: workoutErrorResponse(
        messages[access.status],
        accessErrorStatus[access.status],
      ),
    };
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { response: workoutErrorResponse("Invalid request body.", 400) };
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return { response: workoutErrorResponse(messages.invalid, 400) };
  return { data: parsed.data, token: access.token };
}
