import { FC } from "react";
import Link from "next/link";
import Image from "next/image";

import { ProjectData } from "@/types/Profile";

interface ProjectGalleryProps {
  projects: ProjectData[];
}

const ProjectGallery: FC<ProjectGalleryProps> = ({ projects }) => {
  return (
    <div className="content">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map((project, index) => (
          <div
            key={index}
            className="bg-[var(--brand-secondary-100)] shadow-lg rounded-lg overflow-hidden transition-transform transform hover:scale-105 hover:shadow-2xl flex flex-col justify-between group cursor-pointer"
          >
            {/* Image */}
            <div className="relative w-full h-80">
              <Image
                src={project.projectImage}
                alt={project.projectName}
                fill={true}
                style={{ objectFit: "cover", objectPosition: "center" }}
                className="rounded-t-lg object-center"
                loading="lazy"
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black opacity-40 transition-opacity duration-300 group-hover:opacity-0 rounded-t-lg" />
            </div>

            {/* Description */}
            <div className="text-center flex-grow p-4">
              <h2 className="text-lg md:text-xl font-bold mb-2 text-gray-800">
                {project.projectName}
              </h2>
              <p className="text-gray-600 mb-4">{project.projectDescription}</p>
            </div>

            {/* GitHub Repository Link */}
            {project.projectGithub && (
              <div className="text-center p-4">
                <span className="text-sm text-gray-600">
                  GitHub repo:{" "}
                  <Link
                    href={project.projectGithub}
                    target="_blank"
                    className="text-pink-500 hover:underline"
                  >
                    link
                  </Link>
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectGallery;
