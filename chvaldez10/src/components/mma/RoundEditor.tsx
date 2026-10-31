import type { PointerEvent } from "react";
import { GripVertical } from "lucide-react";
import { Button } from "@/components/ui/buttons/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { minutes, type WorkoutRound } from "@/lib/workouts/draft";
import { workoutInputClass } from "./fieldStyles";

type RoundEditorProps = {
  round: WorkoutRound;
  index: number;
  count: number;
  dragging: boolean;
  dropTarget: boolean;
  onUpdate: (id: number, changes: Partial<Omit<WorkoutRound, "id">>) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onRemove: (id: number) => void;
  onDragStart: (event: PointerEvent<HTMLButtonElement>, id: number) => void;
  onDragMove: (event: PointerEvent<HTMLButtonElement>) => void;
  onDragEnd: (event: PointerEvent<HTMLButtonElement>) => void;
  onDragCancel: (event: PointerEvent<HTMLButtonElement>) => void;
};

export default function RoundEditor({
  round,
  index,
  count,
  dragging,
  dropTarget,
  onUpdate,
  onMove,
  onRemove,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDragCancel,
}: RoundEditorProps) {
  return (
    <li
      data-round-id={round.id}
      className={cn(
        "rounded-2xl border border-orange-200 bg-white p-5 shadow-sm sm:p-6",
        dragging
          ? "opacity-60"
          : dropTarget && "ring-2 ring-pink-600 ring-offset-2",
      )}
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
            onPointerDown={(event) => onDragStart(event, round.id)}
            onPointerMove={onDragMove}
            onPointerUp={onDragEnd}
            onPointerCancel={onDragCancel}
            onLostPointerCapture={onDragCancel}
            onKeyDown={(event) => {
              if (event.key === "ArrowUp" && index > 0) {
                event.preventDefault();
                onMove(index, -1);
              } else if (event.key === "ArrowDown" && index < count - 1) {
                event.preventDefault();
                onMove(index, 1);
              }
            }}
            aria-label={`Drag round ${index + 1} to reorder, or use arrow keys`}
            className="touch-none cursor-grab select-none active:cursor-grabbing"
          >
            <GripVertical aria-hidden="true" />
            Drag
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={index === 0}
            onClick={() => onMove(index, -1)}
            aria-label={`Move round ${index + 1} up`}
          >
            Up
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={index === count - 1}
            onClick={() => onMove(index, 1)}
            aria-label={`Move round ${index + 1} down`}
          >
            Down
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onRemove(round.id)}
            aria-label={`Remove round ${index + 1}`}
            className="text-red-700 hover:bg-red-50 hover:text-red-800 focus-visible:ring-red-700"
          >
            Remove
          </Button>
        </div>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
        <div>
          <Label htmlFor={`round-${round.id}-name`} className="text-gray-800">
            Round name
          </Label>
          <Input
            id={`round-${round.id}-name`}
            value={round.name}
            onChange={(event) =>
              onUpdate(round.id, { name: event.target.value })
            }
            maxLength={80}
            placeholder="e.g. Defense and counters"
            aria-invalid={!round.name.trim()}
            className={workoutInputClass}
          />
        </div>
        <div>
          <Label htmlFor={`round-${round.id}-length`} className="text-gray-800">
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
              onUpdate(round.id, { lengthMinutes: event.target.value })
            }
            aria-label={`Round ${index + 1} length in minutes`}
            aria-invalid={minutes(round.lengthMinutes, 30) === null}
            className={workoutInputClass}
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
              onUpdate(round.id, { objective: event.target.value })
            }
            rows={2}
            maxLength={240}
            placeholder="What technique will you work on?"
            aria-invalid={!round.objective.trim()}
            className="mt-2"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={`round-${round.id}-cue`} className="text-gray-800">
            Coaching cue (optional)
          </Label>
          <Textarea
            id={`round-${round.id}-cue`}
            value={round.coachingCue}
            onChange={(event) =>
              onUpdate(round.id, { coachingCue: event.target.value })
            }
            rows={2}
            maxLength={180}
            placeholder="A short instruction you can use during the round"
            className="mt-2"
          />
        </div>
        <div className="sm:col-span-2">
          <Label
            htmlFor={`round-${round.id}-reminder`}
            className="text-gray-800"
          >
            Technique reminder (optional)
          </Label>
          <Input
            id={`round-${round.id}-reminder`}
            value={round.techniqueReminder}
            onChange={(event) =>
              onUpdate(round.id, { techniqueReminder: event.target.value })
            }
            maxLength={160}
            placeholder="e.g. Keep your chin tucked"
            className={workoutInputClass}
          />
        </div>
      </div>
    </li>
  );
}
