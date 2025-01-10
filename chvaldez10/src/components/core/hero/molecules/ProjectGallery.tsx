import React from "react";

interface ProjectGalleryProps {
  projectName: string;
  projectDescription: string;
}

const ProjectGallery: React.FC<ProjectGalleryProps> = ({
  projectName,
  projectDescription,
}) => {
  return (
    <>
      <div className="bg-white shadow rounded-lg p-6">
        <h2>{projectName}</h2>
        <p>{projectDescription}</p>
      </div>
    </>
  );
};

export default ProjectGallery;
