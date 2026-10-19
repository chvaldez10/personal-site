import { connection } from "next/server";
import { fetchQuery } from "convex/nextjs";
import type { FunctionReturnType } from "convex/server";
import { api } from "@convex/_generated/api";
import {
  projectData,
  projectSectionDefaults,
  ProjectStatus,
  type ProjectDataCollection,
} from "@/constants/projectData";
import ProjectBrowser from "./ProjectBrowser";

export default async function Projects() {
  await connection();
  let content: FunctionReturnType<typeof api.projects.list> | null = null;
  try {
    content = await fetchQuery(api.projects.list, {});
  } catch {
    console.error("Projects are temporarily unavailable.");
  }
  if (content?.section) {
    const grouped: ProjectDataCollection = {
      [ProjectStatus.InProgress]: [],
      [ProjectStatus.Ideation]: [],
      [ProjectStatus.Maintenance]: [],
    };
    for (const project of content.projects) {
      grouped[project.status].push({
        projectName: project.projectName,
        projectDescription: project.projectDescription,
        projectImage: project.projectImage,
        ...(project.projectGithub ? { projectGithub: project.projectGithub } : {}),
      });
    }
    return (
      <ProjectBrowser
        heading={content.section.heading}
        description={content.section.description}
        projects={grouped}
      />
    );
  }
  return <ProjectBrowser {...projectSectionDefaults} projects={projectData} />;
}
