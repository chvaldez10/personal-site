"use client";

import { useState } from "react";
import ProjectGallery from "./molecules/ProjectGallery";
import { projectData } from "@/constants/projectData";

export default function Projects() {
  const statuses = Object.keys(projectData);
  const [activeStatus, setActiveStatus] = useState(statuses[0]);
  return (
    <section
      className="min-h-screen flex-items-center bg-(--brand-secondary-100)"
      id="projects"
    >
      <div className="w-10/12">
        <fieldset
          aria-label="Filter projects by status"
          className="flex flex-wrap justify-center gap-2 py-4"
        >
          {statuses.map((status) => (
            <button
              type="button"
              key={status}
              aria-pressed={status === activeStatus}
              onClick={() => setActiveStatus(status)}
              aria-controls="project-results"
              className={
                "rounded-md px-3 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 " +
                (status === activeStatus
                  ? "bg-yellow-500 text-gray-950"
                  : "hover:bg-gray-200")
              }
            >
              {status}
            </button>
          ))}
        </fieldset>
        <div id="project-results" className="mt-4" aria-live="polite">
          <ProjectGallery projects={projectData[activeStatus] || []} />
        </div>
      </div>
    </section>
  );
}
