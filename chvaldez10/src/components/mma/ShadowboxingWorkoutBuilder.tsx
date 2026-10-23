"use client";

import { useRef, useState, type PointerEvent } from "react";
import { GripVertical } from "lucide-react";
import { Button } from "@/components/ui/buttons/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface WorkoutRound {
  id: number;
  name: string;
  lengthMinutes: string;
  objective: string;
}

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
  },
  {
    id: 2,
    name: "Defense",
    lengthMinutes: "3",
    objective:
      "Return to guard after every strike and move off the center line.",
  },
  {
    id: 3,
    name: "Combinations",
    lengthMinutes: "3",
    objective: "Finish each combination with an angle change.",
  },
];

const disciplines = ["MMA", "Muay Thai", "Kickboxing", "Boxing"];
const focuses = [
  "Technique",
  "Footwork",
  "Defense",
  "Combinations",
  "Conditioning",
];

const inputClass =
  "mt-2 h-11 border-orange-200 bg-white text-base text-gray-900 shadow-none focus-visible:ring-orange-600 md:text-base";
function minutes(value: string, maximum: number): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= maximum
    ? parsed
    : null;
}

export default function ShadowboxingWorkoutBuilder() {
  const [targetMinutes, setTargetMinutes] = useState("9");
  const [roundLengthMinutes, setRoundLengthMinutes] = useState("3");
  const [discipline, setDiscipline] = useState("MMA");
  const [focus, setFocus] = useState("Technique");
  const [rounds, setRounds] = useState<WorkoutRound[]>(sampleRounds);
  const [draggedRoundId, setDraggedRoundId] = useState<number | null>(null);
  const [dropRoundId, setDropRoundId] = useState<number | null>(null);
  const nextRoundId = useRef(4);
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
    if (roundLength === null) return;
    const id = nextRoundId.current++;
    setRounds((current) => [
      ...current,
      {
        id,
        name: "",
        lengthMinutes: String(roundLength),
        objective: "",
      },
    ]);
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
        <h3 className="text-xl font-bold text-gray-900">Workout setup</h3>
        <div className="mt-6 space-y-5">
          <div>
            <Label htmlFor="workout-duration" className="text-gray-800">
              Workout duration (minutes)
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
              className={inputClass}
            />
            <p
              id="workout-duration-help"
              className="mt-2 text-xs text-gray-600"
            >
              Your target time, from 1 to 180 minutes.
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
              className={inputClass}
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
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Rounds</h3>
            <p className="mt-1 text-sm text-gray-600">
              Drag a round by its handle or use Up and Down. Set a name, length,
              and technical objective for each round.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={addRound}
            disabled={roundLength === null}
            className="h-10 border-orange-300 bg-white px-4 text-orange-900 hover:bg-orange-50 hover:text-orange-900 focus-visible:ring-orange-600"
          >
            Add round
          </Button>
        </div>

        {rounds.length === 0 ? (
          <p className="mt-5 rounded-2xl border border-dashed border-orange-300 p-8 text-center text-gray-700">
            No rounds yet. Add a round to build your workout.
          </p>
        ) : (
          <ol className="mt-5 space-y-4">
            {rounds.map((round, index) => (
              <li
                key={round.id}
                data-round-id={round.id}
                className={`rounded-2xl border border-orange-200 bg-white p-5 shadow-sm sm:p-6 ${
                  draggedRoundId === round.id
                    ? "opacity-60"
                    : dropRoundId === round.id
                      ? "ring-2 ring-pink-600 ring-offset-2"
                      : ""
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-bold tracking-wide text-orange-700 uppercase">
                    Round {index + 1}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onPointerDown={(event) => startDrag(event, round.id)}
                      onPointerMove={updateDrag}
                      onPointerUp={endDrag}
                      onPointerCancel={cancelDrag}
                      onLostPointerCapture={cancelDrag}
                      onKeyDown={(event) => {
                        if (event.key === "ArrowUp" && index > 0) {
                          event.preventDefault();
                          moveRound(index, -1);
                        } else if (
                          event.key === "ArrowDown" &&
                          index < rounds.length - 1
                        ) {
                          event.preventDefault();
                          moveRound(index, 1);
                        }
                      }}
                      aria-label={`Drag round ${index + 1} to reorder, or use arrow keys`}
                      className="touch-none cursor-grab border-orange-200 bg-white text-gray-800 select-none hover:bg-orange-50 active:cursor-grabbing focus-visible:ring-orange-600"
                    >
                      <GripVertical aria-hidden="true" />
                      Drag
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={index === 0}
                      onClick={() => moveRound(index, -1)}
                      aria-label={`Move round ${index + 1} up`}
                      className="border-orange-200 bg-white text-gray-800 hover:bg-orange-50 focus-visible:ring-orange-600"
                    >
                      Up
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={index === rounds.length - 1}
                      onClick={() => moveRound(index, 1)}
                      aria-label={`Move round ${index + 1} down`}
                      className="border-orange-200 bg-white text-gray-800 hover:bg-orange-50 focus-visible:ring-orange-600"
                    >
                      Down
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setRounds((current) =>
                          current.filter((item) => item.id !== round.id),
                        )
                      }
                      aria-label={`Remove round ${index + 1}`}
                      className="text-red-700 hover:bg-red-50 hover:text-red-800 focus-visible:ring-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
                  <div>
                    <Label
                      htmlFor={`round-${round.id}-name`}
                      className="text-gray-800"
                    >
                      Round name
                    </Label>
                    <Input
                      id={`round-${round.id}-name`}
                      value={round.name}
                      onChange={(event) =>
                        updateRound(round.id, { name: event.target.value })
                      }
                      maxLength={80}
                      placeholder="e.g. Defense and counters"
                      aria-invalid={!round.name.trim()}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor={`round-${round.id}-length`}
                      className="text-gray-800"
                    >
                      Minutes
                    </Label>
                    <Input
                      id={`round-${round.id}-length`}
                      type="number"
                      min={1}
                      max={30}
                      step={1}
                      value={round.lengthMinutes}
                      onChange={(event) =>
                        updateRound(round.id, {
                          lengthMinutes: event.target.value,
                        })
                      }
                      aria-label={`Round ${index + 1} length in minutes`}
                      aria-invalid={minutes(round.lengthMinutes, 30) === null}
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label
                      htmlFor={`round-${round.id}-objective`}
                      className="text-gray-800"
                    >
                      Technical objective
                    </Label>
                    <Textarea
                      id={`round-${round.id}-objective`}
                      value={round.objective}
                      onChange={(event) =>
                        updateRound(round.id, { objective: event.target.value })
                      }
                      rows={2}
                      maxLength={240}
                      placeholder="What technique will you work on?"
                      aria-invalid={!round.objective.trim()}
                      className="mt-2"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-orange-200 bg-(--brand-secondary-100) p-5 sm:p-6">
          <div>
            <p className="font-semibold text-gray-900">
              {plannedMinutes} of {targetMinutes || "—"} minutes planned
            </p>
            <output className="mt-1 block text-sm text-gray-700">
              {target === null
                ? "Enter a workout duration from 1 to 180 minutes."
                : !roundLengthsValid
                  ? "Set every round length from 1 to 30 minutes."
                  : plannedMinutes === target
                    ? "Your rounds match the workout duration."
                    : plannedMinutes < target
                      ? `Add ${target - plannedMinutes} minutes of rounds to reach your target.`
                      : `Your rounds are ${plannedMinutes - target} minutes over your target.`}
            </output>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                type="button"
                disabled={!canPreview}
                className="h-11 bg-pink-700 px-5 text-white hover:bg-pink-800 focus-visible:ring-pink-700"
              >
                Preview workout
              </Button>
            </DialogTrigger>
            <DialogContent
              overlayClassName="bg-gray-950/45"
              className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl border-orange-200 bg-white p-6 text-gray-900 sm:p-8"
            >
              <DialogHeader className="pr-6 text-left">
                <DialogTitle className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Workout preview
                </DialogTitle>
                <DialogDescription className="pt-1 text-base leading-6 text-gray-700">
                  Review the complete round plan before your session.
                </DialogDescription>
              </DialogHeader>
              <dl className="grid grid-cols-2 gap-4 rounded-xl bg-(--brand-secondary-100) p-5 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-gray-600">Style</dt>
                  <dd className="mt-1 font-semibold">{discipline}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Focus</dt>
                  <dd className="mt-1 font-semibold">{focus}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Target</dt>
                  <dd className="mt-1 font-semibold">{targetMinutes} min</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Planned</dt>
                  <dd className="mt-1 font-semibold">{plannedMinutes} min</dd>
                </div>
              </dl>
              {target !== null && plannedMinutes !== target && (
                <p className="rounded-lg border border-orange-300 bg-orange-50 p-3 text-sm text-orange-900">
                  Your rounds total {plannedMinutes} minutes, which differs from
                  your {target}-minute target.
                </p>
              )}
              <ol className="space-y-3">
                {rounds.map((round, index) => (
                  <li
                    key={round.id}
                    className="rounded-xl border border-orange-200 p-4"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-bold">
                        Round {index + 1}: {round.name.trim()}
                      </h3>
                      <span className="text-sm text-gray-600">
                        {round.lengthMinutes} min
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-gray-700">
                      {round.objective.trim()}
                    </p>
                  </li>
                ))}
              </ol>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="justify-self-start border-orange-300 bg-white text-orange-900 hover:bg-orange-50 hover:text-orange-900 focus-visible:ring-orange-600"
                >
                  Back to editing
                </Button>
              </DialogClose>
            </DialogContent>
          </Dialog>
        </div>
        {!canPreview && (
          <p className="mt-2 text-sm text-gray-600">
            Add at least one round and complete every name, length, and
            technical objective to preview.
          </p>
        )}
      </div>
    </div>
  );
}
