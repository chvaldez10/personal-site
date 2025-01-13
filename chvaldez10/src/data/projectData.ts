import { ProjectData } from "@/types/Profile";

export interface ProjectDataCollection {
  [status: string]: ProjectData[];
}

export const projectData: ProjectDataCollection = {
  Active: [
    {
      projectName: "Church Website",
      projectDescription: "This is the website for my church",
    },
    {
      projectName: "Dayhome Management System",
      projectDescription: "Helper tool for dayhome providers",
    },
    {
      projectName: "K-pop Profile",
      projectDescription: "K-pop profile to showcase favorite group",
    },
  ],
  Upcoming: [
    {
      projectName: "TBD",
      projectDescription: "TBD",
    },
  ],
  Archived: [
    {
      projectName: "School Project 1",
      projectDescription: "School project 1 description",
    },
  ],
};
