import type { Metadata } from "next";
import HobbyHero from "@/components/hobbies/HobbyHero";
import ShadowboxingWorkoutBuilder from "@/components/mma/ShadowboxingWorkoutBuilder";
import { availableAudioOptions } from "@/lib/workouts/audio/models.server";
import { availableWorkoutModels } from "@/lib/workouts/models.server";
import { workoutOwnerAccess } from "@/lib/workouts/owner.server";

export const metadata: Metadata = {
  title: "MMA | Christian Valdez",
  description: "Christian Valdez's MMA hub and shadowboxing training space.",
};

export default async function MmaPage() {
  const isOwner = (await workoutOwnerAccess()) === "owner";
  const [models, audioOptions] = isOwner
    ? await Promise.all([availableWorkoutModels(), availableAudioOptions()])
    : [[], { models: [], voices: [] }];

  return (
    <>
      <HobbyHero
        title="MMA"
        eyebrow="Hobbies / MMA"
        description="A space for my interest in mixed martial arts, from the skill and strategy in a fight to the work behind it."
        imageSrc="/images/octagon.jpg"
        imageAlt="An MMA octagon inside an arena"
        imageClassName="object-cover object-[center_65%]"
        sectionHref="#shadowboxing"
        sectionLinkText="Explore shadowboxing practice"
      />

      <section
        id="shadowboxing"
        aria-labelledby="shadowboxing-heading"
        className="scroll-mt-20 bg-white py-24 sm:py-32"
      >
        <div className="home-container">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-[0.22em] text-orange-700 uppercase">
              Training
            </p>
            <h2
              id="shadowboxing-heading"
              className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl"
            >
              Shadowboxing practice
            </h2>
            <p className="mt-5 text-base leading-7 text-gray-700">
              Take a few minutes to work on one skill before or after training,
              or during a break. Set a technical objective for each round, then
              practice at your own pace.{" "}
              {isOwner && "You can also generate a plan with AI."}
            </p>
          </div>
          <ShadowboxingWorkoutBuilder
            isOwner={isOwner}
            models={models}
            voiceModels={audioOptions.models}
            voices={audioOptions.voices}
          />
        </div>
      </section>
    </>
  );
}
