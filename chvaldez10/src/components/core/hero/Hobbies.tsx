import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import styles from "./studio.module.css";

const hobbies = [
  {
    title: "MMA",
    imageSrc: "/images/showcase/hobby-octagon.webp",
    description: "The technique, strategy, and energy of mixed martial arts.",
    href: "/hobbies/mma",
  },
  {
    title: "K-pop",
    imageSrc: "/images/kpop-arena.webp",
    description: "The music, performances, and creativity of K-pop.",
    href: "/hobbies/k-pop",
  },
];

export default function Hobbies() {
  return (
    <section
      id="hobbies"
      aria-labelledby="hobbies-heading"
      className={`${styles.section} ${styles.hobbySection}`}
    >
      <div className={styles.inner}>
        <div className={styles.splitHeading}>
          <h2 id="hobbies-heading" className={styles.sectionTitle}>
            What I enjoy outside of work
          </h2>
          <p className={styles.sectionCopy}>
            MMA and K-pop are two interests I keep coming back to.
          </p>
        </div>
        <div className={styles.hobbyDoors}>
          {hobbies.map(({ description, href, imageSrc, title }) => (
            <Link
              key={href}
              href={href}
              prefetch={false}
              className={styles.hobbyDoor}
              aria-label={`View ${title}`}
            >
              <Image src={imageSrc} alt="" fill loading="lazy" unoptimized />
              <div className={styles.hobbyCopy}>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
              <span className={styles.hobbyArrow}>
                <ArrowUpRight aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
