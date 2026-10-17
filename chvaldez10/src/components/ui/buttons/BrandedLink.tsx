import type { ComponentPropsWithRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { brandClassName, BrandContent, brandStyle } from "./brandAppearance";

export default function BrandedLink({
  children,
  className,
  style,
  target,
  rel,
  ...props
}: ComponentPropsWithRef<typeof Link>) {
  return (
    <Link
      {...props}
      target={target}
      rel={rel ?? (target === "_blank" ? "noopener noreferrer" : undefined)}
      className={cn(brandClassName, className)}
      style={{ ...brandStyle, ...style }}
    >
      <BrandContent>{children}</BrandContent>
    </Link>
  );
}
