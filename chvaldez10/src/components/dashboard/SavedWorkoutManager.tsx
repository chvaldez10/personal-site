"use client";

import { useState } from "react";
import Link from "next/link";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/buttons/button";

export default function SavedWorkoutManager() {
  const { isAuthenticated } = useConvexAuth();
  const workouts = useQuery(
    api.shadowboxingWorkouts.list,
    isAuthenticated ? {} : "skip",
  );
  const remove = useMutation(api.shadowboxingWorkouts.remove);
  const [removingId, setRemovingId] =
    useState<Id<"shadowboxingWorkouts"> | null>(null);
  const [error, setError] = useState("");

  async function removeWorkout(id: Id<"shadowboxingWorkouts">, title: string) {
    if (!window.confirm(`Delete “${title}” permanently?`)) return;
    setRemovingId(id);
    setError("");
    try {
      await remove({ id });
    } catch {
      setError("Could not delete the session. Please try again.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div>
      <Button asChild>
        <Link href="/hobbies/mma#shadowboxing">Build a session</Link>
      </Button>
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {error}
        </p>
      )}
      {workouts === undefined ? (
        <p className="mt-6 text-sm text-gray-700">Loading sessions…</p>
      ) : workouts.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-orange-200 bg-white p-6 text-sm text-gray-700">
          No saved sessions yet. Build one on the MMA page and save it here.
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {workouts.map((workout) => (
            <li
              key={workout._id}
              className="rounded-xl border border-orange-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-950">
                  {workout.title}
                </h2>
                <time
                  className="shrink-0 text-xs text-gray-600"
                  dateTime={new Date(workout.updatedAt).toISOString()}
                >
                  {new Date(workout.updatedAt).toLocaleDateString()}
                </time>
              </div>
              <p className="mt-2 text-sm text-gray-700">
                {workout.discipline} · {workout.focus} · {workout.rounds.length}{" "}
                {workout.rounds.length === 1 ? "round" : "rounds"} ·{" "}
                {workout.rounds.reduce(
                  (sum, round) => sum + round.lengthMinutes,
                  0,
                )}{" "}
                min
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <Link
                    href={`/hobbies/mma?workout=${workout._id}#shadowboxing`}
                  >
                    Edit and practice
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => void removeWorkout(workout._id, workout.title)}
                  disabled={removingId === workout._id}
                >
                  {removingId === workout._id ? "Deleting…" : "Delete"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
