import Image from "next/image";
import Link from "next/link";

import { Typography } from "@/components/ui/text";

interface ImageCardProps {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt?: string;
  href?: string;
}

function isValidHref(href: string | undefined): href is string {
  if (!href) return false;
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  try {
    const url = new URL(href);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export default function ImageCard({
  title,
  description,
  imageSrc,
  imageAlt = title,
  href,
}: ImageCardProps) {
  const content = (
    <>
      <div className="relative w-full h-80">
        <Image
          src={imageSrc}
          alt={imageAlt}
          unoptimized={imageSrc.startsWith("https://")}
          fill={true}
          style={{ objectFit: "cover", objectPosition: "center" }}
          className="rounded-t-lg object-center"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black opacity-40 transition-opacity duration-300 group-hover:opacity-0 rounded-t-lg" />
      </div>

      <div className="text-center grow p-4">
        <Typography
          variant="h5"
          text={title}
          className="mb-2 text-gray-800 font-bold"
        />
        <Typography
          variant="p"
          text={description}
          className="text-gray-600 mb-4"
        />
      </div>
    </>
  );

  return (
    <article className="bg-(--brand-secondary-100) shadow-lg rounded-lg overflow-hidden transition-transform transform hover:scale-105 hover:shadow-2xl flex flex-col justify-between group">
      {isValidHref(href) ? (
        <Link
          href={href}
          className="flex grow flex-col justify-between focus-visible:outline-2 focus-visible:outline-offset-2"
          aria-label={`View ${title}`}
        >
          {content}
        </Link>
      ) : (
        content
      )}
    </article>
  );
}
