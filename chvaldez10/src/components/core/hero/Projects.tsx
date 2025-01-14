"use client";

import React, { useState } from "react";
import { Slash } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import ProjectGallery from "./molecules/ProjectGallery";

// data
import { projectData } from "@/data/projectData";

export default function Projects() {
  const [activeProjectStatus, setActiveProjectStatus] = useState<string>(
    Object.keys(projectData)[0]
  );

  const projectKeys = Object.keys(projectData);
  const containers = Object.entries(projectData).map(([status, projects]) => (
    <ProjectGallery key={status} projects={projects} />
  ));

  return (
    <div className="py-8 w-10/12 mx-auto">
      <BreadcrumbWithCustomSeparator
        activeContainer={activeProjectStatus}
        setActiveContainer={setActiveProjectStatus}
      />
      <div className="mt-4">
        {containers[projectKeys.indexOf(activeProjectStatus)]}
      </div>
    </div>
  );
}

function BreadcrumbWithCustomSeparator({
  activeContainer,
  setActiveContainer,
}: {
  activeContainer: string;
  setActiveContainer: (index: string) => void;
}) {
  const breadCrumbListItems = Object.keys(projectData);

  return (
    <Breadcrumb className="flex justify-center">
      <BreadcrumbList>
        {breadCrumbListItems.map((containerName, index) => (
          <React.Fragment key={containerName}>
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={() => setActiveContainer(containerName)}
                className={`px-2 py-1 rounded-md transition-transform transform hover:scale-105 hover:bg-gray-200 ${
                  containerName === activeContainer
                    ? "bg-yellow-500 text-white hover:bg-yellow-400"
                    : ""
                }`}
                style={{ textDecoration: "none" }}
              >
                {containerName}
              </BreadcrumbLink>
            </BreadcrumbItem>

            {index !== breadCrumbListItems.length - 1 && (
              <BreadcrumbSeparator className="text-gray-500">
                <Slash />
              </BreadcrumbSeparator>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
