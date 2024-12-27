import React from "react";

export interface NavbarLinks {
  label: string;
  href: string;
}

export interface HeroLayoutProps {
  children: React.ReactNode;
  background?: string;
}
