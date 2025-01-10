"use client";

import { useState } from "react";
import { Slash } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import ProjectGallery from "./molecules/ProjectGallery";

const projectData = [
  {
    projectName: "Active Projects",
    projectDescription: "These are the projects I am currently working on",
  },
  {
    projectName: "Completed Projects",
    projectDescription: "These are the projects I have completed",
  },
  {
    projectName: "Upcoming Projects",
    projectDescription: "These are the projects I have planned",
  },
];

export default function Projects() {
  const [activeContainer, setActiveContainer] = useState<number>(0);

  const containers = projectData.map((project) => (
    <ProjectGallery
      key={project.projectName}
      projectName={project.projectName}
      projectDescription={project.projectDescription}
    />
  ));

  return (
    <div className="min-h-screen w-10/12 mx-auto">
      <BreadcrumbWithCustomSeparator setActiveContainer={setActiveContainer} />
      <div className="mt-4">{containers[activeContainer]}</div>
    </div>
  );
}

function BreadcrumbWithCustomSeparator({
  setActiveContainer,
}: {
  setActiveContainer: (index: number) => void;
}) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Container 1 */}
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => setActiveContainer(0)}>
            Active Projects
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator>
          <Slash />
        </BreadcrumbSeparator>

        {/* Container 2 */}
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => setActiveContainer(1)}>
            Completed Projects
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator>
          <Slash />
        </BreadcrumbSeparator>

        {/* Container 3 */}
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => setActiveContainer(2)}>
            Upcoming Projects
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
