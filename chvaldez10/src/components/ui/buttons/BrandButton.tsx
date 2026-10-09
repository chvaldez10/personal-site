import type { ReactNode } from "react";
import Link from "next/link";

export default function BrandButton({
  children,
  href = "https://www.linkedin.com/in/chvaldez10/",
}: {
  children: ReactNode;
  href?: string;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="hover-scale-effect relative flex items-center rounded-xl bg-linear-to-r from-yellow-500 to-pink-500 px-8 py-4 text-base font-medium text-white hover:from-pink-500 hover:to-yellow-500"
      style={{ textDecoration: "none" }}
    >
      {children}
      <span
        aria-hidden="true"
        className="absolute top-0 right-0 h-4 w-4 animate-ping rounded-full bg-linear-to-r from-orange-400 to-orange-700 motion-reduce:animate-none"
      />
    </Link>
  );
}
