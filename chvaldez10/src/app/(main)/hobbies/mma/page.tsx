import type { Metadata } from "next";
import HobbyHero from "@/components/hobbies/HobbyHero";
import ShadowboxingWorkoutBuilder from "@/components/mma/ShadowboxingWorkoutBuilder";

export const metadata: Metadata = {
  title: "MMA | Christian Valdez",
  description: "Christian Valdez's MMA hub and shadowboxing training space.",
};

export default function MmaPage() {
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
        sectionLinkText="Explore shadowboxing training"
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
              Shadowboxing Training
            </h2>
            <p className="mt-5 text-base leading-7 text-gray-700">
              Build a session one round at a time. Choose your style and focus,
              set a technical objective for each round, then review the full
              plan.
            </p>
          </div>
          <ShadowboxingWorkoutBuilder />
        </div>
      </section>
    </>
  );
}
