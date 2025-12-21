import { ProjectData } from "@/types/Profile";

// Define enums for project statuses
export enum ProjectStatus {
  InProgress = "In Progress",
  Ideation = "Ideation",
  Maintenance = "Maintenance",
}

export interface ProjectDataCollection {
  [status: string]: ProjectData[];
}

export const projectData: ProjectDataCollection = {
  [ProjectStatus.InProgress]: [
    {
      projectName: "K-pop Profile",
      projectDescription: "A K-pop profile showcasing my favorite group",
      projectImage: "/images/kpop-image.jpg",
    },
  ],
  [ProjectStatus.Ideation]: [
    {
      projectName: "TBD",
      projectDescription:
        "I'm planning to create an app that provides common QA tools for software testing",
      projectImage: "/images/toolbox.jpg",
    },
  ],
  [ProjectStatus.Maintenance]: [
    {
      projectName: "Church Website",
      projectDescription: "A website for my church",
      projectImage: "/images/church-image.jpg",
      projectGithub: "https://github.com/chvaldez10/cfmc-web-app",
    },
  ],
};
