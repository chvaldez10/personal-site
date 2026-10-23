import { FC } from "react";

import { ProjectData } from "@/types/Profile";
import ImageCard from "@/components/ui/ImageCard";

interface ProjectGalleryProps {
  projects: ProjectData[];
}

const ProjectGallery: FC<ProjectGalleryProps> = ({ projects }) => {
  return (
    <div className="content">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map((project, index) => (
          <ImageCard
            key={`${project.projectName}-${index}`}
            title={project.projectName}
            description={project.projectDescription}
            imageSrc={project.projectImage}
            href={project.projectGithub}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectGallery;
