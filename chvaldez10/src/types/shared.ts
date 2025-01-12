import React from "react";

export interface NavbarLinks {
  label: string;
  href: string;
}

export interface HeroLayoutProps {
  children: React.ReactNode;
  background?: string;
}

export interface ProjectData {
  projectName: string;
  projectDescription: string;
}
