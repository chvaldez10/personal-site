import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";
import { brandClassName, BrandContent, brandStyle } from "./brandAppearance";

export default function BrandedButton({
  children,
  className,
  style,
  type = "button",
  ...props
}: ComponentPropsWithRef<"button">) {
  return (
    <button
      {...props}
      type={type}
      className={cn(brandClassName, className)}
      style={{ ...brandStyle, ...style }}
    >
      <BrandContent>{children}</BrandContent>
    </button>
  );
}
