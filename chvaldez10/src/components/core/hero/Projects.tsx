"use client";

import { Fragment, useState } from "react";
import { Slash } from "lucide-react";
import ProjectGallery from "./molecules/ProjectGallery";
import { projectData } from "@/constants/projectData";

export default function Projects() {
  const statuses = Object.keys(projectData);
  const [activeStatus, setActiveStatus] = useState(statuses[0]);
  return (
    <section
      className="min-h-screen flex-items-center bg-(--brand-secondary-100) py-24 sm:py-32"
      id="projects"
      aria-labelledby="projects-heading"
    >
      <div className="home-container">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="projects-heading"
            className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl"
          >
            Things I’m working on
          </h2>
          <p className="mt-4 text-base leading-7 text-gray-700">
            Some are in progress, some are still ideas, and some I keep
            improving.
          </p>
        </div>
        <fieldset
          aria-label="Filter projects by status"
          className="mt-6 flex flex-wrap items-center justify-center gap-1.5 py-4 text-sm text-muted-foreground"
        >
          {statuses.map((status, index) => (
            <Fragment key={status}>
              <button
                type="button"
                aria-pressed={status === activeStatus}
                onClick={() => setActiveStatus(status)}
                aria-controls="project-results"
                className={
                  "rounded-md px-2 py-1 transition-transform duration-300 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 " +
                  (status === activeStatus
                    ? "bg-yellow-500 text-white hover:bg-yellow-400"
                    : "hover:bg-gray-200")
                }
              >
                {status}
              </button>
              {index < statuses.length - 1 && (
                <Slash
                  aria-hidden="true"
                  className="h-3.5 w-3.5 text-gray-500"
                />
              )}
            </Fragment>
          ))}
        </fieldset>
        <div id="project-results" className="mt-4" aria-live="polite">
          <ProjectGallery projects={projectData[activeStatus] || []} />
        </div>
      </div>
    </section>
  );
}
