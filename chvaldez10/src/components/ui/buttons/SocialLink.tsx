import { forwardRef, type ComponentPropsWithRef, type ReactNode } from "react";
import Link from "next/link";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";

type SocialLinkProps = Omit<ComponentPropsWithRef<typeof Link>, "children"> &
  VariantProps<typeof buttonVariants> & {
    icon: ReactNode;
    children?: ReactNode;
  };

const SocialLink = forwardRef<HTMLAnchorElement, SocialLinkProps>(
  (
    {
      icon,
      children,
      className,
      variant,
      size,
      target = "_blank",
      rel,
      style,
      ...props
    },
    ref,
  ) => {
    return (
      <Link
        {...props}
        ref={ref}
        target={target}
        rel={rel ?? (target === "_blank" ? "noopener noreferrer" : undefined)}
        className={cn(
          buttonVariants({ variant, size }),
          "flex items-center gap-2 rounded-full hover-scale-effect",
          className,
        )}
        style={{ textDecoration: "none", ...style }}
      >
        {icon}
        {children}
      </Link>
    );
  },
);
SocialLink.displayName = "SocialLink";

export { SocialLink };
