"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  useConvex,
  useConvexAuth,
  useMutation,
  usePaginatedQuery,
} from "convex/react";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { z } from "zod";
import { Button } from "@/components/ui/buttons/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PaginatedListFooter from "@/components/ui/PaginatedListFooter";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import CoachingAudioBuilder from "@/components/mma/CoachingAudioBuilder";
import WorkoutRounds from "./WorkoutRounds";
import WorkoutPreviewDialog from "@/components/mma/WorkoutPreviewDialog";
import { workoutInputClass } from "@/components/mma/fieldStyles";
import type {
  VoiceModelOption,
  VoiceOption,
} from "@/lib/workouts/audio/schema";
import {
  disciplines,
  focuses,
  workoutSchema,
  type WorkoutModelOption,
} from "@/lib/workouts/schema";
import { savedWorkoutSchema } from "@/lib/workouts/saved";
import {
  hydrateWorkoutDraft,
  initialWorkoutDraft,
  minutes,
  moveWorkoutRound,
  serializeWorkoutDraft,
  workoutDraftKey,
  workoutDraftSchema,
  type WorkoutDraft,
  type WorkoutRound,
} from "@/lib/workouts/draft";

const generationResponseSchema = z.object({ workout: workoutSchema });
const generationErrorSchema = z.object({ error: z.string() });

export default function ShadowboxingWorkoutBuilder({
  isOwner,
  models,
  voiceModels,
  voices,
}: {
  isOwner: boolean;
  models: WorkoutModelOption[];
  voiceModels: VoiceModelOption[];
  voices: VoiceOption[];
}) {
  const [draft, setDraft] = useState(initialWorkoutDraft);
  const {
    title: workoutName,
    targetMinutes,
    roundLengthMinutes,
    discipline,
    focus,
    rounds,
  } = draft;
  const [savedWorkoutId, setSavedWorkoutId] =
    useState<Id<"shadowboxingWorkouts"> | null>(null);
  const [selectedSavedId, setSelectedSavedId] = useState("");
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    serializeWorkoutDraft(initialWorkoutDraft),
  );
  const [saving, setSaving] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveNotice, setSaveNotice] = useState("");
  const [workoutSession, setWorkoutSession] = useState(0);
  const loadedFromUrl = useRef(false);
  const { isAuthenticated } = useConvexAuth();
  const convex = useConvex();
  const {
    results: savedWorkouts,
    status: savedStatus,
    loadMore: loadMoreSaved,
  } = usePaginatedQuery(
    api.shadowboxingWorkouts.page,
    isOwner && isAuthenticated ? {} : "skip",
    { initialNumItems: 12 },
  );
  const saveToConvex = useMutation(api.shadowboxingWorkouts.save);
  const [modelId, setModelId] = useState(models[0]?.id ?? "");
  const [generationMode, setGenerationMode] = useState<"customize" | "fresh">(
    "customize",
  );
  const [generationNotes, setGenerationNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [generationNotice, setGenerationNotice] = useState("");
  const [lastGeneratedRounds, setLastGeneratedRounds] = useState<
    WorkoutRound[]
  >([]);
  const nextRoundId = useRef(initialWorkoutDraft.rounds.length + 1);

  const requestPending = saving || loadingSaved || generating;
  const target = minutes(targetMinutes, 180);
  const roundLength = minutes(roundLengthMinutes, 30);
  const roundMinutes = rounds.map((round) => minutes(round.lengthMinutes, 30));
  const roundLengthsValid = roundMinutes.every((length) => length !== null);
  const plannedMinutes = roundMinutes.reduce<number>(
    (total, length) => total + (length ?? 0),
    0,
  );
  const roundsComplete =
    rounds.length > 0 &&
    roundLengthsValid &&
    rounds.every((round) => round.name.trim() && round.objective.trim());
  const canPreview = target !== null && roundsComplete;
  const currentSnapshot = serializeWorkoutDraft(draft);
  const hasUnsavedChanges = currentSnapshot !== savedSnapshot;
  const availableModelId = models.some((model) => model.id === modelId)
    ? modelId
    : (models[0]?.id ?? "");

  function applySavedWorkout(workout: Doc<"shadowboxingWorkouts">) {
    setDraftReady(false);
    try {
      window.localStorage.removeItem(workoutDraftKey);
    } catch {
      /* Browser storage is optional. */
    }
    const loaded = hydrateWorkoutDraft({
      title: workout.title,
      targetMinutes: String(workout.targetMinutes),
      roundLengthMinutes: String(workout.roundLengthMinutes),
      discipline: workout.discipline,
      focus: workout.focus,
      rounds: workout.rounds.map((round) => ({
        ...round,
        lengthMinutes: String(round.lengthMinutes),
      })),
    });
    setDraft(loaded);
    setSavedWorkoutId(workout._id);
    setSelectedSavedId(workout._id);
    setSavedSnapshot(serializeWorkoutDraft(loaded));
    nextRoundId.current = loaded.rounds.length + 1;
    setLastGeneratedRounds([]);
    setGenerationNotice("");
    setWorkoutSession((current) => current + 1);
    setSaveError("");
    setSaveNotice(`Loaded ${workout.title}.`);
    const url = new URL(window.location.href);
    url.searchParams.set("workout", workout._id);
    window.history.replaceState(window.history.state, "", url);
  }

  useEffect(() => {
    if (loadedFromUrl.current || !isOwner || !isAuthenticated) return;
    const id = new URLSearchParams(window.location.search).get("workout");
    if (!id) {
      loadedFromUrl.current = true;
      return;
    }
    let cancelled = false;
    void convex
      .query(api.shadowboxingWorkouts.get, { id })
      .then((workout) => {
        if (cancelled) return;
        loadedFromUrl.current = true;
        if (workout) applySavedWorkout(workout);
        else
          setSaveError(
            "That saved session is unavailable. Choose another session or start a new draft.",
          );
      })
      .catch(() => {
        if (!cancelled)
          setSaveError(
            "The saved session could not be loaded. Try opening it again from the dashboard.",
          );
      });
    return () => {
      cancelled = true;
    };
  }, [convex, isOwner, isAuthenticated]);

  useEffect(() => {
    if (!isOwner) return;
    const timer = window.setTimeout(() => {
      if (new URLSearchParams(window.location.search).has("workout")) return;
      try {
        const raw = window.localStorage.getItem(workoutDraftKey);
        if (raw) {
          const parsed = workoutDraftSchema.safeParse(JSON.parse(raw));
          if (parsed.success) {
            const restored = hydrateWorkoutDraft(parsed.data);
            setDraft(restored);
            nextRoundId.current = restored.rounds.length + 1;
            setSaveNotice(
              "Restored your unsaved session draft from this browser.",
            );
          } else setSaveError("The local draft could not be restored.");
        }
      } catch {
        setSaveError(
          "Browser storage is unavailable. Use Save session to keep your plan.",
        );
      }
      setDraftReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isOwner]);

  useEffect(() => {
    if (!draftReady || !isOwner) return;
    if (!hasUnsavedChanges) {
      try {
        window.localStorage.removeItem(workoutDraftKey);
      } catch {
        /* Browser storage is optional. */
      }
      return;
    }
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(workoutDraftKey, currentSnapshot);
      } catch {
        setSaveError(
          "Browser storage is unavailable. Use Save session to keep your plan.",
        );
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [draftReady, hasUnsavedChanges, isOwner, currentSnapshot]);

  async function saveWorkout(asNew = false) {
    if (requestPending || !isOwner || !isAuthenticated) return;
    setSaveError("");
    setSaveNotice("");
    const parsed = savedWorkoutSchema.safeParse({
      title: workoutName,
      discipline,
      focus,
      targetMinutes: target,
      roundLengthMinutes: roundLength,
      rounds: rounds.map((round) => ({
        ...round,
        lengthMinutes: Number(round.lengthMinutes),
      })),
    });
    if (!parsed.success) {
      setSaveError(
        "Add a name and complete 1–12 rounds with coaching cues. Workouts can be up to 45 minutes.",
      );
      return;
    }
    setSaving(true);
    try {
      const id = await saveToConvex({
        id: asNew ? undefined : (savedWorkoutId ?? undefined),
        ...parsed.data,
      });
      setSavedWorkoutId(id);
      setSelectedSavedId(id);
      setSavedSnapshot(currentSnapshot);
      setDraftReady(false);
      try {
        window.localStorage.removeItem(workoutDraftKey);
      } catch {
        /* Browser storage is optional. */
      }
      setSaveNotice(
        asNew || !savedWorkoutId
          ? "Session saved. Keep tuning it anytime."
          : "Session changes saved.",
      );
      const url = new URL(window.location.href);
      url.searchParams.set("workout", id);
      window.history.replaceState(window.history.state, "", url);
    } catch {
      setSaveError(
        "Could not save the session. Check your connection and try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function loadSelectedWorkout() {
    if (!selectedSavedId || requestPending) return;
    if (
      hasUnsavedChanges &&
      !window.confirm("Replace your unsaved session changes?")
    )
      return;
    setLoadingSaved(true);
    setSaveError("");
    try {
      const workout = await convex.query(api.shadowboxingWorkouts.get, {
        id: selectedSavedId,
      });
      if (workout) applySavedWorkout(workout);
      else
        setSaveError(
          "That saved session is unavailable. Your current draft is still here.",
        );
    } catch {
      setSaveError(
        "Could not load the session. Your current draft is still here. Please try again.",
      );
    } finally {
      setLoadingSaved(false);
    }
  }

  function updateDraft(changes: Partial<WorkoutDraft>) {
    setDraft((current) => ({ ...current, ...changes }));
  }

  function updateRounds(update: (current: WorkoutRound[]) => WorkoutRound[]) {
    setDraft((current) => ({ ...current, rounds: update(current.rounds) }));
  }

  function updateRound(id: number, changes: Partial<Omit<WorkoutRound, "id">>) {
    updateRounds((current) =>
      current.map((round) =>
        round.id === id ? { ...round, ...changes } : round,
      ),
    );
  }

  function changeRoundLength(value: string) {
    const length = minutes(value, 30);
    setDraft((current) => ({
      ...current,
      roundLengthMinutes: value,
      rounds:
        length === null
          ? current.rounds
          : current.rounds.map((round) => ({
              ...round,
              lengthMinutes: String(length),
            })),
    }));
  }

  function addRound() {
    if (roundLength === null || rounds.length >= 12) return;
    const id = nextRoundId.current++;
    updateRounds((current) => [
      ...current,
      {
        id,
        name: "",
        lengthMinutes: String(roundLength),
        objective: "",
        coachingCue: "",
        techniqueReminder: "",
      },
    ]);
  }

  async function generateWorkout() {
    if (
      requestPending ||
      target === null ||
      roundLength === null ||
      !availableModelId
    )
      return;
    if (generationMode === "customize" && !roundLengthsValid) {
      setGenerationError("Set every round length from 1 to 30 minutes first.");
      return;
    }

    setGenerating(true);
    setGenerationError("");
    setGenerationNotice("");
    try {
      const response = await fetch("/api/workouts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId: availableModelId,
          mode: generationMode,
          targetMinutes: target,
          preferredRoundMinutes: roundLength,
          discipline,
          focus,
          notes: generationMode === "customize" ? generationNotes : "",
          currentRounds:
            generationMode === "customize"
              ? rounds.slice(0, 12).map((round) => ({
                  name: round.name,
                  lengthMinutes:
                    minutes(round.lengthMinutes, 30) ?? roundLength,
                  objective: round.objective,
                  coachingCue: round.coachingCue,
                  techniqueReminder: round.techniqueReminder,
                }))
              : [],
          previousObjectives: lastGeneratedRounds.map(
            (round) => round.objective,
          ),
        }),
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        const parsed = generationErrorSchema.safeParse(payload);
        setGenerationError(
          parsed.success
            ? parsed.data.error
            : "The session could not be generated. Please try again.",
        );
        return;
      }
      const parsed = generationResponseSchema.safeParse(payload);
      if (!parsed.success) {
        setGenerationError(
          "The AI returned an invalid session. Please try again.",
        );
        return;
      }
      const generated = parsed.data.workout.rounds;
      const nextRounds = generated.map((round) => ({
        ...round,
        id: nextRoundId.current++,
        lengthMinutes: String(round.lengthMinutes),
      }));
      updateDraft({ rounds: nextRounds });
      setLastGeneratedRounds(nextRounds);
      setGenerationNotice(
        "Session generated. Edit any round or regenerate it.",
      );
    } catch {
      setGenerationError(
        "The AI service could not be reached. Your current session is still here.",
      );
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:items-start">
      <div className="rounded-2xl border border-orange-200 bg-(--brand-secondary-100) p-6 shadow-sm sm:p-8">
        <h3 className="text-xl font-bold text-gray-900">Practice setup</h3>
        <div className="mt-6 space-y-5">
          <div>
            <Label htmlFor="workout-duration" className="text-gray-800">
              Practice time (minutes)
            </Label>
            <Input
              id="workout-duration"
              type="number"
              min={1}
              max={180}
              step={1}
              value={targetMinutes}
              onChange={(event) =>
                updateDraft({ targetMinutes: event.target.value })
              }
              aria-invalid={target === null}
              aria-describedby="workout-duration-help"
              className={workoutInputClass}
            />
            <p
              id="workout-duration-help"
              className="mt-2 text-xs text-gray-600"
            >
              Start with one 3-minute round; adjust the time when you need to.
            </p>
          </div>
          <div>
            <Label htmlFor="round-length" className="text-gray-800">
              Round length (minutes)
            </Label>
            <Input
              id="round-length"
              type="number"
              min={1}
              max={30}
              step={1}
              value={roundLengthMinutes}
              onChange={(event) => changeRoundLength(event.target.value)}
              aria-invalid={roundLength === null}
              aria-describedby="round-length-help"
              className={workoutInputClass}
            />
            <p id="round-length-help" className="mt-2 text-xs text-gray-600">
              Updates every round. You can still edit each round&apos;s minutes.
            </p>
          </div>
          <div>
            <Label
              id="workout-discipline-label"
              htmlFor="workout-discipline"
              className="text-gray-800"
            >
              Style
            </Label>
            <Select
              id="workout-discipline"
              value={discipline}
              onValueChange={(value) => updateDraft({ discipline: value })}
              options={disciplines.map((option) => ({
                value: option,
                label: option,
              }))}
              aria-labelledby="workout-discipline-label"
              wrapperClassName="mt-2"
            />
          </div>
          <div>
            <Label
              id="training-focus-label"
              htmlFor="training-focus"
              className="text-gray-800"
            >
              Training focus
            </Label>
            <Select
              id="training-focus"
              value={focus}
              onValueChange={(value) => updateDraft({ focus: value })}
              options={focuses.map((option) => ({
                value: option,
                label: option,
              }))}
              aria-labelledby="training-focus-label"
              wrapperClassName="mt-2"
            />
          </div>
          {isOwner && (
            <div className="border-t border-orange-200 pt-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold tracking-[0.16em] text-orange-700 uppercase">
                  Saved sessions
                </p>
                <Link
                  href="/dashboard/workouts"
                  className="text-sm font-semibold text-orange-800 underline underline-offset-4 hover:text-orange-900 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
                >
                  Dashboard
                </Link>
              </div>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                Review and save your plan from Preview and save below. Open a
                saved plan here, or manage them in the dashboard.
              </p>
              {savedWorkoutId && hasUnsavedChanges && (
                <p className="mt-2 text-xs text-orange-900">Unsaved changes</p>
              )}
              {savedWorkouts.length > 0 && (
                <div className="mt-5 border-t border-orange-200 pt-5">
                  <Label htmlFor="saved-workout-list" className="text-gray-800">
                    Open a saved session
                  </Label>
                  <Select
                    id="saved-workout-list"
                    value={selectedSavedId}
                    onValueChange={setSelectedSavedId}
                    disabled={requestPending}
                    options={[
                      ...savedWorkouts.map((workout) => ({
                        value: workout._id,
                        label: workout.title,
                      })),
                      ...(savedWorkoutId &&
                      !savedWorkouts.some(
                        (workout) => workout._id === savedWorkoutId,
                      )
                        ? [{ value: savedWorkoutId, label: workoutName }]
                        : []),
                    ]}
                    placeholder="Choose a session"
                    wrapperClassName="mt-2"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={loadSelectedWorkout}
                    disabled={!selectedSavedId || requestPending}
                    className="mt-3"
                  >
                    {loadingSaved ? "Loading…" : "Load session"}
                  </Button>
                  <PaginatedListFooter
                    status={savedStatus}
                    count={savedWorkouts.length}
                    itemLabel="sessions"
                    onLoadMore={() => loadMoreSaved(12)}
                  />
                </div>
              )}
              {saveError && (
                <p role="alert" className="mt-3 text-sm text-red-700">
                  {saveError}
                </p>
              )}
              {saveNotice && (
                <p aria-live="polite" className="mt-3 text-sm text-gray-700">
                  {saveNotice}
                </p>
              )}
            </div>
          )}
          {isOwner && (
            <div className="border-t border-orange-200 pt-6">
              <p className="text-xs font-bold tracking-[0.16em] text-orange-700 uppercase">
                AI session
              </p>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                Generate technical round objectives, then edit anything you
                want. Each generation uses one API request.
              </p>
              <a
                href="#coaching-audio"
                className="mt-2 inline-block text-sm font-semibold text-orange-800 underline underline-offset-4 hover:text-orange-900 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
              >
                Voice and audio settings ↓
              </a>
              {models.length ? (
                <div className="mt-5 space-y-5">
                  <div>
                    <Label
                      id="ai-model-label"
                      htmlFor="ai-model"
                      className="text-gray-800"
                    >
                      Model
                    </Label>
                    <Select
                      id="ai-model"
                      value={availableModelId}
                      onValueChange={setModelId}
                      options={models.map((model) => ({
                        value: model.id,
                        label: model.label,
                      }))}
                      aria-labelledby="ai-model-label"
                      wrapperClassName="mt-2"
                    />
                  </div>
                  <div>
                    <Label
                      id="generation-mode-label"
                      htmlFor="generation-mode"
                      className="text-gray-800"
                    >
                      Starting point
                    </Label>
                    <Select
                      id="generation-mode"
                      value={generationMode}
                      onValueChange={(value) =>
                        setGenerationMode(
                          value === "fresh" ? "fresh" : "customize",
                        )
                      }
                      options={[
                        { value: "customize", label: "Use my current rounds" },
                        { value: "fresh", label: "Create a new session" },
                      ]}
                      aria-labelledby="generation-mode-label"
                      wrapperClassName="mt-2"
                    />
                  </div>
                  {generationMode === "customize" && (
                    <div>
                      <Label htmlFor="ai-notes" className="text-gray-800">
                        Extra direction (optional)
                      </Label>
                      <Textarea
                        id="ai-notes"
                        value={generationNotes}
                        onChange={(event) =>
                          setGenerationNotes(event.target.value)
                        }
                        maxLength={500}
                        rows={3}
                        placeholder="e.g. More defensive movement and fewer power shots"
                        className="mt-2"
                      />
                    </div>
                  )}
                  <Button
                    type="button"
                    onClick={generateWorkout}
                    disabled={
                      requestPending ||
                      target === null ||
                      roundLength === null ||
                      (generationMode === "customize" && !roundLengthsValid)
                    }
                    className="w-full"
                  >
                    {generating
                      ? "Generating…"
                      : lastGeneratedRounds.length > 0
                        ? "Regenerate session"
                        : "Generate session"}
                  </Button>
                  {generationMode === "customize" && !roundLengthsValid && (
                    <p className="text-sm text-orange-900">
                      Set every round length from 1 to 30 minutes first.
                    </p>
                  )}
                  <p role="alert" className="text-sm text-red-700">
                    {generationError}
                  </p>
                  <p aria-live="polite" className="text-sm text-gray-700">
                    {generationNotice}
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6 text-gray-700">
                  AI models are unavailable. Check the server API key and model
                  access, then refresh this page.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <WorkoutRounds
          key={workoutSession}
          rounds={rounds}
          canAdd={roundLength !== null && rounds.length < 12}
          onAdd={addRound}
          onUpdate={updateRound}
          onMove={(sourceId, targetId) =>
            updateRounds((current) =>
              moveWorkoutRound(current, sourceId, targetId),
            )
          }
          onRemove={(id) =>
            updateRounds((current) =>
              current.filter((round) => round.id !== id),
            )
          }
        />

        <WorkoutPreviewDialog
          rounds={rounds}
          target={target}
          targetMinutes={targetMinutes}
          plannedMinutes={plannedMinutes}
          roundLengthsValid={roundLengthsValid}
          canPreview={canPreview}
          discipline={discipline}
          focus={focus}
          save={
            isOwner
              ? {
                  title: workoutName,
                  onTitleChange: (title) => updateDraft({ title }),
                  onSave: (asNew) => void saveWorkout(asNew),
                  saved: savedWorkoutId !== null,
                  hasUnsavedChanges,
                  saving,
                  disabled: requestPending || !isAuthenticated,
                  error: saveError,
                  notice: saveNotice,
                }
              : undefined
          }
        />
      </div>
      {isOwner && (
        <div className="lg:col-span-2">
          <CoachingAudioBuilder
            key={workoutSession}
            rounds={rounds}
            generatedRounds={lastGeneratedRounds}
            models={voiceModels}
            voices={voices}
          />
        </div>
      )}
    </div>
  );
}
