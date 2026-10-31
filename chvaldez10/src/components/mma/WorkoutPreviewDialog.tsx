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
import type { WorkoutRound } from "@/lib/workouts/draft";
import { workoutInputClass } from "./fieldStyles";

type SaveControls = {
  title: string;
  onTitleChange: (title: string) => void;
  onSave: (asNew?: boolean) => void;
  saved: boolean;
  hasUnsavedChanges: boolean;
  saving: boolean;
  disabled: boolean;
  error: string;
  notice: string;
};

type WorkoutPreviewDialogProps = {
  rounds: WorkoutRound[];
  target: number | null;
  targetMinutes: string;
  plannedMinutes: number;
  roundLengthsValid: boolean;
  canPreview: boolean;
  discipline: string;
  focus: string;
  save?: SaveControls;
};

export default function WorkoutPreviewDialog({
  rounds,
  target,
  targetMinutes,
  plannedMinutes,
  roundLengthsValid,
  canPreview,
  discipline,
  focus,
  save,
}: WorkoutPreviewDialogProps) {
  return (
    <>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-orange-200 bg-(--brand-secondary-100) p-5 sm:p-6">
        <div>
          <p className="font-semibold text-gray-900">
            {plannedMinutes} of {targetMinutes || "—"} minutes planned
          </p>
          <output className="mt-1 block text-sm text-gray-700">
            {target === null
              ? "Enter a practice time from 1 to 180 minutes."
              : !roundLengthsValid
                ? "Set every round length from 1 to 30 minutes."
                : plannedMinutes === target
                  ? "Your rounds match the practice time."
                  : plannedMinutes < target
                    ? `Add ${target - plannedMinutes} minutes of rounds to reach your target.`
                    : `Your rounds are ${plannedMinutes - target} minutes over your target.`}
          </output>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" disabled={!canPreview} className="px-5">
              {save ? "Preview and save" : "Preview session"}
            </Button>
          </DialogTrigger>
          <DialogContent
            overlayClassName="bg-gray-950/45"
            className="flex max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-2xl border-orange-200 bg-white p-0 text-gray-900"
          >
            <div className="shrink-0 border-b border-orange-100 px-5 pt-5 pb-4 sm:px-7 sm:pt-7">
              <DialogHeader className="pr-7 text-left">
                <DialogTitle className="text-2xl font-bold tracking-tight">
                  Session preview
                </DialogTitle>
                <DialogDescription className="pt-1 text-sm leading-6 text-gray-700">
                  {rounds.length} {rounds.length === 1 ? "round" : "rounds"} ·{" "}
                  {plannedMinutes} minutes planned
                </DialogDescription>
              </DialogHeader>
              <dl className="mt-4 grid grid-cols-3 gap-3 text-xs">
                <div>
                  <dt className="text-gray-600">Style</dt>
                  <dd className="mt-0.5 font-semibold">{discipline}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Focus</dt>
                  <dd className="mt-0.5 font-semibold">{focus}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Target</dt>
                  <dd className="mt-0.5 font-semibold">{targetMinutes} min</dd>
                </div>
              </dl>
            </div>

            {/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- The scrollable round list needs keyboard focus for Page Up and Page Down. */}
            <section
              aria-label="Session rounds"
              tabIndex={0}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-2 pr-3 [scrollbar-gutter:stable] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-orange-300 [&::-webkit-scrollbar-track]:bg-orange-50 sm:px-7 sm:pr-5"
            >
              {target !== null && plannedMinutes !== target && (
                <p className="border-b border-orange-100 py-3 text-xs leading-5 text-orange-900">
                  Your rounds total {plannedMinutes} minutes, which differs from
                  your {target}-minute target.
                </p>
              )}
              <ol className="divide-y divide-orange-100">
                {rounds.map((round, index) => (
                  <li key={round.id} className="py-4 first:pt-2 last:pb-2">
                    <div className="flex items-baseline gap-3">
                      <span className="shrink-0 text-xs font-bold tabular-nums text-orange-700">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="min-w-0 flex-1 font-semibold text-gray-950">
                        {round.name.trim()}
                      </h3>
                      <span className="shrink-0 text-xs font-medium text-gray-600">
                        {round.lengthMinutes} min
                      </span>
                    </div>
                    <div className="mt-2 pl-7 text-sm leading-6 text-gray-700">
                      <p>{round.objective.trim()}</p>
                      {round.coachingCue.trim() && (
                        <p className="mt-2">
                          <strong className="text-gray-900">Coach:</strong>{" "}
                          {round.coachingCue.trim()}
                        </p>
                      )}
                      {round.techniqueReminder.trim() && (
                        <p className="mt-2 text-orange-900">
                          <strong>Remember:</strong>{" "}
                          {round.techniqueReminder.trim()}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
            {/* oxlint-enable jsx-a11y/no-noninteractive-tabindex */}

            <div className="shrink-0 border-t border-orange-200 bg-(--brand-secondary-100) px-5 py-4 sm:px-7">
              {save && (
                <div className="max-w-md">
                  <Label htmlFor="saved-workout-name" className="text-gray-800">
                    Session name
                  </Label>
                  <Input
                    id="saved-workout-name"
                    value={save.title}
                    onChange={(event) => save.onTitleChange(event.target.value)}
                    maxLength={80}
                    className={workoutInputClass}
                  />
                  {save.saved && save.hasUnsavedChanges && (
                    <p className="mt-2 text-xs text-orange-900">
                      Unsaved changes
                    </p>
                  )}
                </div>
              )}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Back to editing
                  </Button>
                </DialogClose>
                {save && (
                  <div className="flex flex-wrap gap-2">
                    {save.saved && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => save.onSave(true)}
                        disabled={save.disabled}
                      >
                        Save as new
                      </Button>
                    )}
                    <Button
                      type="button"
                      onClick={() => save.onSave()}
                      disabled={save.disabled}
                    >
                      {save.saving
                        ? "Saving…"
                        : save.saved
                          ? "Save changes"
                          : "Save session"}
                    </Button>
                  </div>
                )}
              </div>
              {save?.error && (
                <p role="alert" className="mt-3 text-sm text-red-700">
                  {save.error}
                </p>
              )}
              {save?.notice && (
                <p aria-live="polite" className="mt-3 text-sm text-gray-700">
                  {save.notice}
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {!canPreview && (
        <p className="mt-2 text-sm text-gray-600">
          Add at least one round and complete every name, length, and technical
          objective to preview.
        </p>
      )}
    </>
  );
}
