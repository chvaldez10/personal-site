import type { Metadata } from "next";
import HobbyHero from "@/components/hobbies/HobbyHero";

export const metadata: Metadata = {
  title: "K-pop | Christian Valdez",
  description: "A home for Christian Valdez's K-pop interests.",
};

const collections = [
  {
    id: "artists",
    title: "Favourite artists",
    description: "A place to share the artists I keep coming back to.",
  },
  {
    id: "songs",
    title: "Favourite songs",
    description: "Songs I want to highlight will live here.",
  },
  {
    id: "playlists",
    title: "Playlists",
    description: "Playlists I want to share will live here.",
  },
];

export default function KpopPage() {
  return (
    <>
      <HobbyHero
        title="K-pop"
        eyebrow="Hobbies / Music"
        description="A home for the music, performances, and creativity I enjoy in K-pop."
        imageSrc="/images/kpop-image.jpg"
        imageAlt="A K-pop display in a city street"
        sectionHref="#collections"
        sectionLinkText="Explore the collections"
      />

      <section
        id="collections"
        aria-labelledby="collections-heading"
        className="scroll-mt-20 bg-white py-24 sm:py-32"
      >
        <div className="home-container">
          <p className="text-xs font-bold tracking-[0.22em] text-orange-700 uppercase">
            K-pop
          </p>
          <h2
            id="collections-heading"
            className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl"
          >
            What I&apos;m listening to
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-gray-700">
            I&apos;ll add my favourites here as I go.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {collections.map((collection) => (
              <section
                key={collection.id}
                id={collection.id}
                aria-labelledby={`${collection.id}-heading`}
                className="rounded-2xl border border-orange-200 bg-(--brand-secondary-100) p-6 shadow-sm sm:p-8"
              >
                <h3
                  id={`${collection.id}-heading`}
                  className="text-xl font-bold text-gray-900"
                >
                  {collection.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-gray-700 sm:text-base">
                  {collection.description}
                </p>
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
