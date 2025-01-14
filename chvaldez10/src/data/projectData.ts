import { ProjectData } from "@/types/Profile";

export interface ProjectDataCollection {
  [status: string]: ProjectData[];
}

export const projectData: ProjectDataCollection = {
  Active: [
    {
      projectName: "Church Website",
      projectDescription: "This is the website for my church",
      projectImage: "/images/church-image.jpg",
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
  Upcoming: [
    {
      projectName: "TBD",
      projectDescription:
        "I'm not sure what this is yet but I want to do something machine learning related",
      projectImage: "/images/machine-learning-image.jpg",
    },
  ],
  Archived: [
    {
      projectName: "Suite of Dog Apps",
      projectDescription: "A suite of dog apps.",
      projectImage: "/images/dog-image.jpg",
    },
  ],
};
