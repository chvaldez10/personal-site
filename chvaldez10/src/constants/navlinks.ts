import { NavbarLinks } from "@/types/shared";

// Define enums for labels and hrefs
enum NavLinkLabel {
  TechFinds = "Tools",
  Experience = "Experience",
  Background = "Background",
  Projects = "Projects",
}

enum NavLinkHref {
  TechFinds = "tech-finds",
  Experience = "current-work-experience",
  Background = "background",
  Projects = "projects",
}

export const navlinks: NavbarLinks[] = [
  {
    label: NavLinkLabel.TechFinds,
    href: NavLinkHref.TechFinds,
  },
  {
    label: NavLinkLabel.Experience,
    href: NavLinkHref.Experience,
  },
  {
    label: NavLinkLabel.Background,
    href: NavLinkHref.Background,
  },
  // {
  //   label: "Education",
  //   href: "education",
  // },
  {
    label: NavLinkLabel.Projects,
    href: NavLinkHref.Projects,
  },
  // {
  //   label: "Contact",
  //   href: "contact",
  // },
];
