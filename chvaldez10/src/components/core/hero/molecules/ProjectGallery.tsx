import React from "react";

interface ProjectGalleryProps {
  projects: {
    projectName: string;
    projectDescription: string;
  }[];
}

const ProjectGallery: React.FC<ProjectGalleryProps> = ({ projects }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((project, index) => (
          <div
            key={index}
            className="bg-[var(--brand-secondary-100)] shadow rounded-lg p-6 h-96 transition-transform transform hover:scale-105 hover:shadow-lg"
          >
            <h2>{project.projectName}</h2>
            <p>{project.projectDescription}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default ProjectGallery;
