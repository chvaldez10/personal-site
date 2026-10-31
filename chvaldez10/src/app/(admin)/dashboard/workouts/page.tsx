import SavedWorkoutManager from "@/components/dashboard/SavedWorkoutManager";

export default function WorkoutsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Shadowboxing sessions</h1>
        <p className="mt-2 text-sm leading-6 text-gray-700">
          Keep named plans here while you tune their rounds and coaching cues.
          New drafts stay in this browser; audio clips stay cached on the device
          where you prepare them.
        </p>
      </div>
      <SavedWorkoutManager />
    </section>
  );
}
