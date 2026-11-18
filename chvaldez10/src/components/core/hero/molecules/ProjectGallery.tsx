import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ProjectData } from "@/types/Profile";
import { publicWebUrl } from "@/lib/links";
import styles from "../studio.module.css";

export default function ProjectGallery({
  projects,
}: {
  projects: ProjectData[];
}) {
  return (
    <ul className={styles.projectGallery}>
      {projects.map((project, index) => {
        const href = publicWebUrl(project.projectGithub);
        return (
          <li key={`${project.projectName}-${index}`}>
            <article className={styles.project}>
              <div className={styles.projectImage}>
                <Image
                  src={project.projectImage}
                  alt=""
                  fill
                  loading="lazy"
                  sizes="(min-width: 112rem) 64rem, (min-width: 48rem) 55vw, 90vw"
                  unoptimized={project.projectImage.startsWith("https://")}
                />
              </div>
              <div className={styles.projectCopy}>
                <h3>{project.projectName}</h3>
                <p>{project.projectDescription}</p>
                {href && (
                  <Link
                    href={href}
                    className={styles.textLink}
                    aria-label={`View ${project.projectName} on GitHub`}
                  >
                    View on GitHub <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                )}
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
