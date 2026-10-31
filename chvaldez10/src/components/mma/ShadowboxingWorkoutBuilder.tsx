"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import Link from "next/link";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { z } from "zod";
import { Button } from "@/components/ui/buttons/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import CoachingAudioBuilder from "@/components/mma/CoachingAudioBuilder";
import RoundEditor from "@/components/mma/RoundEditor";
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
import { minutes, type WorkoutRound } from "@/lib/workouts/draft";

const generationResponseSchema = z.object({ workout: workoutSchema });
const generationErrorSchema = z.object({ error: z.string() });
const draftKey = "shadowboxing-session-draft-v1";
const draftSchema = z.object({
  title: z.string().max(80),
  targetMinutes: z.string().max(4),
  roundLengthMinutes: z.string().max(3),
  discipline: z.string().max(40),
  focus: z.string().max(40),
  rounds: z
    .array(
      z.object({
        name: z.string().max(80),
        lengthMinutes: z.string().max(3),
        objective: z.string().max(240),
        coachingCue: z.string().max(180),
        techniqueReminder: z.string().max(160),
      }),
    )
    .max(12),
});

interface RoundDrag {
  pointerId: number;
  sourceId: number;
  targetId: number | null;
}

const sampleRounds: WorkoutRound[] = [
  {
    id: 1,
    name: "Movement",
    lengthMinutes: "3",
    objective: "Keep a balanced stance while moving in and out of range.",
    coachingCue: "Stay light and let your feet set the distance.",
    techniqueReminder: "Keep your stance under you as you step.",
  },
];

function planSnapshot(
  title: string,
  targetMinutes: string,
  roundLengthMinutes: string,
  discipline: string,
  focus: string,
  rounds: WorkoutRound[],
) {
  return JSON.stringify({
    title,
    targetMinutes,
    roundLengthMinutes,
    discipline,
    focus,
    rounds: rounds.map(({ id: _id, ...round }) => round),
  });
}

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
  const [targetMinutes, setTargetMinutes] = useState("3");
  const [roundLengthMinutes, setRoundLengthMinutes] = useState("3");
  const [discipline, setDiscipline] = useState("MMA");
  const [focus, setFocus] = useState("Technique");
  const [rounds, setRounds] = useState<WorkoutRound[]>(sampleRounds);
  const [workoutName, setWorkoutName] = useState("Movement reset");
  const [savedWorkoutId, setSavedWorkoutId] =
    useState<Id<"shadowboxingWorkouts"> | null>(null);
  const [selectedSavedId, setSelectedSavedId] = useState("");
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    planSnapshot("Movement reset", "3", "3", "MMA", "Technique", sampleRounds),
  );
  const [saving, setSaving] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveNotice, setSaveNotice] = useState("");
  const [audioSession, setAudioSession] = useState(0);
  const loadedFromUrl = useRef(false);
  const { isAuthenticated } = useConvexAuth();
  const savedWorkouts = useQuery(
    api.shadowboxingWorkouts.list,
    isOwner && isAuthenticated ? {} : "skip",
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
  const [hasGenerated, setHasGenerated] = useState(false);
  const [lastGeneratedRounds, setLastGeneratedRounds] = useState<
    WorkoutRound[]
  >([]);
  const previousObjectives = useRef<string[]>([]);
  const [draggedRoundId, setDraggedRoundId] = useState<number | null>(null);
  const [dropRoundId, setDropRoundId] = useState<number | null>(null);
  const nextRoundId = useRef(2);
  const activeDrag = useRef<RoundDrag | null>(null);

  const target = minutes(targetMinutes, 180);
  const roundLength = minutes(roundLengthMinutes, 30);
  const roundLengthsValid = rounds.every(
    (round) => minutes(round.lengthMinutes, 30) !== null,
  );
  const plannedMinutes = rounds.reduce(
    (total, round) => total + (minutes(round.lengthMinutes, 30) ?? 0),
    0,
  );
  const roundsComplete =
    rounds.length > 0 &&
    roundLengthsValid &&
    rounds.every((round) => round.name.trim() && round.objective.trim());
  const canPreview = target !== null && roundsComplete;
  const currentSnapshot = planSnapshot(
    workoutName,
    targetMinutes,
    roundLengthMinutes,
    discipline,
    focus,
    rounds,
  );
  const hasUnsavedChanges = currentSnapshot !== savedSnapshot;
  const availableModelId = models.some((model) => model.id === modelId)
    ? modelId
    : (models[0]?.id ?? "");

  function applySavedWorkout(
    workout: NonNullable<typeof savedWorkouts>[number],
  ) {
    setDraftReady(false);
    try {
      window.localStorage.removeItem(draftKey);
    } catch {
      /* Browser storage is optional. */
    }
    const loadedRounds = workout.rounds.map((round, index) => ({
      ...round,
      id: index + 1,
      lengthMinutes: String(round.lengthMinutes),
    }));
    setWorkoutName(workout.title);
    setTargetMinutes(String(workout.targetMinutes));
    setRoundLengthMinutes(String(workout.roundLengthMinutes));
    setDiscipline(workout.discipline);
    setFocus(workout.focus);
    setRounds(loadedRounds);
    setSavedWorkoutId(workout._id);
    setSelectedSavedId(workout._id);
    setSavedSnapshot(
      planSnapshot(
        workout.title,
        String(workout.targetMinutes),
        String(workout.roundLengthMinutes),
        workout.discipline,
        workout.focus,
        loadedRounds,
      ),
    );
    nextRoundId.current = loadedRounds.length + 1;
    previousObjectives.current = [];
    setLastGeneratedRounds([]);
    setHasGenerated(false);
    setGenerationNotice("");
    setAudioSession((current) => current + 1);
    setSaveError("");
    setSaveNotice(`Loaded ${workout.title}.`);
    const url = new URL(window.location.href);
    url.searchParams.set("workout", workout._id);
    window.history.replaceState(window.history.state, "", url);
  }

  useEffect(() => {
    if (loadedFromUrl.current || !savedWorkouts) return;
    const timer = window.setTimeout(() => {
      if (loadedFromUrl.current) return;
      loadedFromUrl.current = true;
      const id = new URLSearchParams(window.location.search).get("workout");
      const workout = savedWorkouts.find((item) => item._id === id);
      if (workout) applySavedWorkout(workout);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [savedWorkouts]);

  useEffect(() => {
    if (!isOwner) return;
    const timer = window.setTimeout(() => {
      if (new URLSearchParams(window.location.search).has("workout")) return;
      try {
        const raw = window.localStorage.getItem(draftKey);
        if (raw) {
          const parsed = draftSchema.safeParse(JSON.parse(raw));
          if (parsed.success) {
            const draft = parsed.data;
            setWorkoutName(draft.title);
            setTargetMinutes(draft.targetMinutes);
            setRoundLengthMinutes(draft.roundLengthMinutes);
            setDiscipline(draft.discipline);
            setFocus(draft.focus);
            setRounds(
              draft.rounds.map((round, index) => ({ ...round, id: index + 1 })),
            );
            nextRoundId.current = draft.rounds.length + 1;
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
        window.localStorage.removeItem(draftKey);
      } catch {
        /* Browser storage is optional. */
      }
      return;
    }
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(draftKey, currentSnapshot);
      } catch {
        setSaveError(
          "Browser storage is unavailable. Use Save session to keep your plan.",
        );
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [draftReady, hasUnsavedChanges, isOwner, currentSnapshot]);

  async function saveWorkout(asNew = false) {
    if (saving || !isOwner || !isAuthenticated) return;
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
        window.localStorage.removeItem(draftKey);
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

  function loadSelectedWorkout() {
    const workout = savedWorkouts?.find((item) => item._id === selectedSavedId);
    if (!workout) return;
    if (
      hasUnsavedChanges &&
      !window.confirm("Replace your unsaved session changes?")
    )
      return;
    applySavedWorkout(workout);
  }

  function updateRound(id: number, changes: Partial<Omit<WorkoutRound, "id">>) {
    setRounds((current) =>
      current.map((round) =>
        round.id === id ? { ...round, ...changes } : round,
      ),
    );
  }

  function changeRoundLength(value: string) {
    setRoundLengthMinutes(value);
    const length = minutes(value, 30);
    if (length !== null) {
      setRounds((current) =>
        current.map((round) => ({
          ...round,
          lengthMinutes: String(length),
        })),
      );
    }
  }

  function addRound() {
    if (roundLength === null || rounds.length >= 12) return;
    const id = nextRoundId.current++;
    setRounds((current) => [
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
      generating ||
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
          previousObjectives: previousObjectives.current,
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
      setRounds(nextRounds);
      setLastGeneratedRounds(nextRounds);
      previousObjectives.current = generated.map((round) => round.objective);
      setHasGenerated(true);
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

  function moveRound(index: number, direction: -1 | 1) {
    setRounds((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  function moveRoundTo(sourceId: number, targetId: number) {
    setRounds((current) => {
      const sourceIndex = current.findIndex((round) => round.id === sourceId);
      const targetIndex = current.findIndex((round) => round.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex)
        return current;
      const next = [...current];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  }

  function startDrag(event: PointerEvent<HTMLButtonElement>, sourceId: number) {
    if (
      activeDrag.current ||
      (event.pointerType === "mouse" && event.button !== 0)
    )
      return;
    activeDrag.current = {
      pointerId: event.pointerId,
      sourceId,
      targetId: null,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggedRoundId(sourceId);
    setDropRoundId(null);
  }

  function updateDrag(event: PointerEvent<HTMLButtonElement>) {
    const drag = activeDrag.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const target = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>("[data-round-id]");
    const targetId = target ? Number(target.dataset.roundId) : null;
    drag.targetId = targetId === drag.sourceId ? null : targetId;
    setDropRoundId(drag.targetId);
  }

  function endDrag(event: PointerEvent<HTMLButtonElement>) {
    const drag = activeDrag.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    updateDrag(event);
    activeDrag.current = null;
    setDraggedRoundId(null);
    setDropRoundId(null);
    if (drag.targetId !== null) moveRoundTo(drag.sourceId, drag.targetId);
  }

  function cancelDrag(event: PointerEvent<HTMLButtonElement>) {
    if (activeDrag.current?.pointerId !== event.pointerId) return;
    activeDrag.current = null;
    setDraggedRoundId(null);
    setDropRoundId(null);
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
              onChange={(event) => setTargetMinutes(event.target.value)}
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
              onValueChange={setDiscipline}
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
              onValueChange={setFocus}
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
              {savedWorkouts && savedWorkouts.length > 0 && (
                <div className="mt-5 border-t border-orange-200 pt-5">
                  <Label htmlFor="saved-workout-list" className="text-gray-800">
                    Open a saved session
                  </Label>
                  <Select
                    id="saved-workout-list"
                    value={selectedSavedId}
                    onValueChange={setSelectedSavedId}
                    options={savedWorkouts.map((workout) => ({
                      value: workout._id,
                      label: workout.title,
                    }))}
                    placeholder="Choose a session"
                    wrapperClassName="mt-2"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={loadSelectedWorkout}
                    disabled={!selectedSavedId || saving}
                    className="mt-3"
                  >
                    Load session
                  </Button>
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
                      generating ||
                      target === null ||
                      roundLength === null ||
                      (generationMode === "customize" && !roundLengthsValid)
                    }
                    className="w-full"
                  >
                    {generating
                      ? "Generating…"
                      : hasGenerated
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Rounds</h3>
            <p className="mt-1 text-sm text-gray-600">
              Drag a round by its handle or use Up and Down. Set a name, length,
              and technical objective for each round. Sessions support up to 12
              rounds.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={addRound}
            disabled={roundLength === null || rounds.length >= 12}
          >
            Add round
          </Button>
        </div>

        {rounds.length === 0 ? (
          <p className="mt-5 rounded-2xl border border-dashed border-orange-300 p-8 text-center text-gray-700">
            No rounds yet. Add one to build your session.
          </p>
        ) : (
          <ol className="mt-5 space-y-4">
            {rounds.map((round, index) => (
              <RoundEditor
                key={round.id}
                round={round}
                index={index}
                count={rounds.length}
                dragging={draggedRoundId === round.id}
                dropTarget={dropRoundId === round.id}
                onUpdate={updateRound}
                onMove={moveRound}
                onRemove={(id) =>
                  setRounds((current) =>
                    current.filter((item) => item.id !== id),
                  )
                }
                onDragStart={startDrag}
                onDragMove={updateDrag}
                onDragEnd={endDrag}
                onDragCancel={cancelDrag}
              />
            ))}
          </ol>
        )}

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
                  onTitleChange: setWorkoutName,
                  onSave: (asNew) => void saveWorkout(asNew),
                  saved: savedWorkoutId !== null,
                  hasUnsavedChanges,
                  saving,
                  disabled: saving || !isAuthenticated,
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
            key={audioSession}
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
