import type { Metadata } from "next";
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

  return <KpopPlayer groups={featured ?? []} unavailable={groups === null} />;
}
