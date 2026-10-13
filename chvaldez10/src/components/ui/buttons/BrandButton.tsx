import type { ReactNode } from "react";
import Link from "next/link";
import { Slot } from "@radix-ui/react-slot";

export default function BrandButton({
  children,
  href = "https://www.linkedin.com/in/chvaldez10/",
  openInNewTab = true,
  asChild = false,
}: {
  children: ReactNode;
  href?: string;
  openInNewTab?: boolean;
  asChild?: boolean;
}) {
  const className =
    "hover-scale-effect relative flex items-center rounded-xl bg-linear-to-r from-yellow-500 to-pink-500 px-8 py-4 text-base font-medium text-white hover:from-pink-500 hover:to-yellow-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-700";
  if (asChild) {
    return (
      <Slot
        className={className}
        style={{ textDecoration: "none", color: "white" }}
      >
        {children}
      </Slot>
    );
  }
  return (
    <Link
      href={href}
      target={openInNewTab ? "_blank" : undefined}
      rel={openInNewTab ? "noopener noreferrer" : undefined}
      className={className}
      style={{ textDecoration: "none", color: "white" }}
    >
      {children}
      <span
        aria-hidden="true"
        className="absolute top-0 right-0 h-4 w-4 animate-ping rounded-full bg-linear-to-r from-orange-400 to-orange-700"
      />
    </Link>
  );
}
