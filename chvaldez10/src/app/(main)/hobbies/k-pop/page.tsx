import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { ArrowDown, ArrowLeft } from "lucide-react";
import { api } from "@convex/_generated/api";
import KpopPlayer from "@/components/hobbies/KpopPlayer";
import { Button } from "@/components/ui/buttons/button";
import styles from "./kpop-concert.module.css";

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
    <div className={styles.page}>
      <header className={styles.hero}>
        <Image
          src="/images/kpop-arena.webp"
          alt=""
          fill
          unoptimized
          fetchPriority="high"
          loading="eager"
          className={styles.arena}
        />
        <div className={styles.heroContent}>
          <Link href="/#hobbies" className={styles.back} prefetch={false}>
            <ArrowLeft size={16} aria-hidden="true" />
            Back to hobbies
          </Link>
          <div className={styles.heroCopy}>
            <h1>
              K-pop<span>.</span>
            </h1>
            <p>The groups and songs I keep coming back to.</p>
            <Button asChild size="lg" className={styles.setlistLink}>
              <a href="#songs">
                Explore the setlist <ArrowDown aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      <section
        id="songs"
        aria-labelledby="songs-heading"
        tabIndex={-1}
        className={styles.setlist}
      >
        {featured?.length ? (
          <KpopPlayer groups={featured} />
        ) : (
          <div className={styles.empty}>
            <h2 id="songs-heading">Setlist</h2>
            {!featured ? (
              <p className="text-sm text-gray-700">
                Song previews are temporarily unavailable.
              </p>
            ) : (
              <p className="text-sm text-gray-700">
                Songs I want to highlight will live here.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
