import { ProjectData } from "@/types/Profile";

// Define enums for project statuses
export enum ProjectStatus {
  Active = "Active",
  Upcoming = "Upcoming",
  Archived = "Archived",
}

export interface ProjectDataCollection {
  [status: string]: ProjectData[];
}

export const projectData: ProjectDataCollection = {
  [ProjectStatus.Active]: [
    {
      projectName: "Church Website",
      projectDescription: "This is the website for my church",
      projectImage: "/images/church-image.jpg",
      projectGithub: "https://github.com/chvaldez10/cfmc-web-app",
    },
    {
      projectName: "Dayhome Management System",
      projectDescription: "Helper tool for dayhome providers",
      projectImage: "/images/dayhome-image.jpg",
    },
    {
      projectName: "K-pop Profile",
      projectDescription: "K-pop profile to showcase favorite group",
      projectImage: "/images/kpop-image.jpg",
    },
  ],
  [ProjectStatus.Upcoming]: [
    {
      projectName: "TBD",
      projectDescription:
        "I'm not sure what this is yet but I want to do something machine learning related",
      projectImage: "/images/machine-learning-image.jpg",
    },
  ],
  [ProjectStatus.Archived]: [
    {
      projectName: "Suite of Dog Apps",
      projectDescription: "A suite of dog apps.",
      projectImage: "/images/dog-image.jpg",
    },
  ],
};
