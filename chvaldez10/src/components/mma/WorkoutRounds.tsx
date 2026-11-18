"use client";

import { useRef, useState, type PointerEvent } from "react";
import { Button } from "@/components/ui/buttons/button";
import type { WorkoutRound } from "@/lib/workouts/draft";
import RoundEditor from "./RoundEditor";

interface RoundDrag {
  pointerId: number;
  sourceId: number;
  targetId: number | null;
}

export default function WorkoutRounds({
  rounds,
  canAdd,
  onAdd,
  onUpdate,
  onMove,
  onRemove,
}: {
  rounds: WorkoutRound[];
  canAdd: boolean;
  onAdd: () => void;
  onUpdate: (id: number, changes: Partial<Omit<WorkoutRound, "id">>) => void;
  onMove: (sourceId: number, targetId: number) => void;
  onRemove: (id: number) => void;
}) {
  const list = useRef<HTMLOListElement>(null);
  const activeDrag = useRef<RoundDrag | null>(null);
  const [draggedRoundId, setDraggedRoundId] = useState<number | null>(null);
  const [dropRoundId, setDropRoundId] = useState<number | null>(null);

  function moveRound(index: number, direction: -1 | 1) {
    const target = rounds[index + direction];
    if (target) onMove(rounds[index].id, target.id);
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
    const targetId =
      target && target.parentElement === list.current
        ? Number(target.dataset.roundId)
        : null;
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
    if (drag.targetId !== null) onMove(drag.sourceId, drag.targetId);
  }

  function cancelDrag(event: PointerEvent<HTMLButtonElement>) {
    if (activeDrag.current?.pointerId !== event.pointerId) return;
    activeDrag.current = null;
    setDraggedRoundId(null);
    setDropRoundId(null);
  }

  return (
    <>
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
          onClick={onAdd}
          disabled={!canAdd}
        >
          Add round
        </Button>
      </div>

      {rounds.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-dashed border-orange-300 p-8 text-center text-gray-700">
          No rounds yet. Add one to build your session.
        </p>
      ) : (
        <ol ref={list} className="mt-5 space-y-4">
          {rounds.map((round, index) => (
            <RoundEditor
              key={round.id}
              round={round}
              index={index}
              count={rounds.length}
              dragging={draggedRoundId === round.id}
              dropTarget={dropRoundId === round.id}
              onUpdate={onUpdate}
              onMove={moveRound}
              onRemove={onRemove}
              onDragStart={startDrag}
              onDragMove={updateDrag}
              onDragEnd={endDrag}
              onDragCancel={cancelDrag}
            />
          ))}
        </ol>
      )}
    </>
  );
}
