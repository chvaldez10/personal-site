import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";
import KpopPlayer from "@/components/hobbies/KpopPlayer";

export const metadata: Metadata = {
  title: "K-pop | Christian Valdez",
  description: "The K-pop groups and songs I keep coming back to.",
};

export default async function KpopPage() {
  await connection();
  const groups = await fetchQuery(api.kpop.listGroups, {}).catch(
    (error: unknown) => {
      console.error("Could not load K-pop songs", error);
      return null;
    },
  );
  const featured = groups?.filter(({ songs }) => songs.length > 0);

  return (
    <div className="min-h-screen bg-[#fff9f3] pb-20 pt-28 sm:pb-28 sm:pt-32">
      <div className="home-container">
        <Link
          href="/#hobbies"
          className="rounded-sm text-sm font-semibold text-pink-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          ← Back to hobbies
        </Link>
        <header className="mb-8 mt-6 sm:mb-10">
          <h1 className="text-6xl font-black tracking-[-0.085em] text-[#261729] sm:text-8xl">
            K-pop<span className="text-[#ae245c]">.</span>
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-[#594251] sm:text-lg">
            The groups and songs I keep coming back to.
          </p>
        </header>
        <section
          id="songs"
          aria-labelledby="songs-heading"
          className="scroll-mt-24"
        >
          <h2
            id="songs-heading"
            className="mb-4 text-xl font-bold tracking-tight text-[#261729]"
          >
            Favourite songs
          </h2>
          {!featured ? (
            <p className="text-sm text-gray-700">
              Song previews are temporarily unavailable.
            </p>
          ) : featured.length === 0 ? (
            <p className="text-sm text-gray-700">
              Songs I want to highlight will live here.
            </p>
          ) : (
            <KpopPlayer groups={featured} />
          )}
        </section>
      </div>
    </div>
  );
}
