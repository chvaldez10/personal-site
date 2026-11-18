"use client";

import { useState } from "react";
import { Button } from "@/components/ui/buttons/button";
import {
  ProjectStatus,
  type ProjectDataCollection,
} from "@/constants/projectData";
import ProjectGallery from "./molecules/ProjectGallery";
import styles from "./studio.module.css";

const statuses = Object.values(ProjectStatus);
const batchSize = 6;

export default function ProjectBrowser({
  heading,
  description,
  projects,
}: {
  heading: string;
  description: string;
  projects: ProjectDataCollection;
}) {
  const [activeStatus, setActiveStatus] = useState(ProjectStatus.InProgress);
  const [limit, setLimit] = useState(batchSize);
  const activeProjects = projects[activeStatus] ?? [];

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className={`${styles.section} ${styles.projectSection}`}
    >
      <div className={styles.inner}>
        <div className={styles.splitHeading}>
          <div>
            <h2 id="projects-heading" className={styles.sectionTitle}>
              {heading}
            </h2>
            <p className={styles.sectionCopy}>{description}</p>
          </div>
          <fieldset className={styles.projectFilters}>
            <legend className="sr-only">Filter projects by status</legend>
            {statuses.map((status) => (
              <Button
                type="button"
                key={status}
                variant="outline"
                aria-pressed={activeStatus === status}
                aria-controls="project-results"
                onClick={() => {
                  if (activeStatus === status) return;
                  setActiveStatus(status);
                  setLimit(batchSize);
                }}
              >
                {status}{" "}
                <span aria-hidden="true">{projects[status]?.length ?? 0}</span>
              </Button>
            ))}
          </fieldset>
        </div>
        <div id="project-results" className={styles.projectResults}>
          <output className="sr-only">
            {activeProjects.length}{" "}
            {activeProjects.length === 1 ? "project" : "projects"} in{" "}
            {activeStatus}.
          </output>
          {activeProjects.length ? (
            <ProjectGallery projects={activeProjects.slice(0, limit)} />
          ) : (
            <p className={styles.empty}>No projects in this status yet.</p>
          )}
          {activeProjects.length > limit && (
            <Button
              type="button"
              variant="outline"
              className={styles.moreProjects}
              onClick={() => setLimit((current) => current + batchSize)}
            >
              Show more projects
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
