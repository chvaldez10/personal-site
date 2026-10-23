import Image from "next/image";
import Link from "next/link";

interface HobbyHeroProps {
  title: string;
  eyebrow: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  imageClassName?: string;
  sectionHref: string;
  sectionLinkText: string;
}

export default function HobbyHero({
  title,
  eyebrow,
  description,
  imageSrc,
  imageAlt,
  imageClassName = "object-cover",
  sectionHref,
  sectionLinkText,
}: HobbyHeroProps) {
  return (
    <section className="min-h-screen flex-items-center bg-(--brand-secondary-100) py-28 sm:py-32">
      <div className="home-container grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <Link
            href="/#hobbies"
            className="text-sm font-semibold text-pink-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            ← Back to hobbies
          </Link>
          <p className="mt-10 text-xs font-bold tracking-[0.22em] text-orange-700 uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-gray-700">
            {description}
          </p>
          <Link
            href={sectionHref}
            className="mt-8 inline-flex font-semibold text-pink-700 underline decoration-orange-500 decoration-2 underline-offset-4 hover:text-pink-800 focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            {sectionLinkText} ↓
          </Link>
        </div>
        <div className="relative aspect-4/3 overflow-hidden rounded-2xl shadow-lg">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className={imageClassName}
          />
        </div>
      </div>
    </section>
  );
}
