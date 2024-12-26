import React from "react";
import Link from "next/link";
import { Button, ButtonProps } from "./button";

interface SocialButtonProps extends ButtonProps {
  icon: React.ReactNode;
  href: string;
}

const SocialButton = React.forwardRef<HTMLButtonElement, SocialButtonProps>(
  ({ icon, className, href, ...props }, ref) => {
    return (
      <Link
        href={href}
        target="_blank"
        className="hover-scale-effect"
        style={{ textDecoration: "none" }}
      >
        <Button
          className={`flex items-center gap-2 rounded-full ${className}`}
          ref={ref}
          {...props}
        >
          {icon}
          {props.children}
        </Button>
      </Link>
    );
  }
);
SocialButton.displayName = "SocialButton";

export { SocialButton };
