import React from "react";
import Link from "next/link";
import Image from "next/image";

interface ProjectGalleryProps {
  projects: {
    projectName: string;
    projectDescription: string;
  }[];
}

const ProjectGallery: React.FC<ProjectGalleryProps> = ({ projects }) => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {projects.map((project, index) => (
          <div
            key={index}
            className="bg-[var(--brand-secondary-100)] shadow-lg rounded-lg p-6 h-96 transition-transform transform hover:scale-105 hover:shadow-2xl flex flex-col justify-between"
          >
            {/* image */}
            <div className="relative w-full h-1/2">
              <Image
                src={"/images/church-image.jpg"}
                alt={project.projectName}
                fill={true}
                sizes="width: 100%"
                style={{ objectFit: "cover", objectPosition: "center" }}
                className="rounded-t-lg object-center"
                loading="lazy"
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black opacity-50 transition-opacity duration-300 hover:opacity-0 rounded-t-lg" />
            </div>

            {/* description */}
            <div className="text-center flex-grow">
              <h2 className="text-xl font-semibold mb-2">
                {project.projectName}
              </h2>
              <p className="text-gray-700 mb-4">{project.projectDescription}</p>
            </div>

            {/* github repo */}
            <div className="text-center">
              <span className="text-sm">
                Github repo:{" "}
                <Link
                  href={"https://github.com/chvaldez10/personal-site"}
                  target="_blank"
                  className="text-blue-500 hover:text-blue-700 underline"
                >
                  click me
                </Link>
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ProjectGallery;
