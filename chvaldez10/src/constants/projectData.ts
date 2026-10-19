import type { ProjectData } from "../types/Profile";

// Define enums for project statuses
export enum ProjectStatus {
  InProgress = "Building",
  Ideation = "Ideas",
  Maintenance = "Maintaining",
}

export const projectSectionDefaults = {
  heading: "Things I’m working on",
  description:
    "Some are in progress, some are still ideas, and some I keep improving.",
};

export interface ProjectDataCollection {
  [status: string]: ProjectData[];
}

export const projectData: ProjectDataCollection = {
  [ProjectStatus.InProgress]: [
    {
      projectName: "K-pop Profile",
      projectDescription: "A profile page for my favorite K-pop group.",
      projectImage: "/images/kpop-image.jpg",
    },
  ],
  [ProjectStatus.Ideation]: [
    {
      projectName: "QA Toolbox",
      projectDescription:
        "An idea for the QA tools I reach for most, gathered in one place.",
      projectImage: "/images/toolbox.jpg",
    },
  ],
  [ProjectStatus.Maintenance]: [
    {
      projectName: "Church Website",
      projectDescription: "A website I help maintain for my church.",
      projectImage: "/images/church-image.jpg",
      projectGithub: "https://github.com/chvaldez10/cfmc-web-app",
    },
  ],
};
