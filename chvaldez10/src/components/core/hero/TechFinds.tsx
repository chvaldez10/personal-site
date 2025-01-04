import React from "react";

// Components
import CenteredLayout from "./layouts/CenteredLayout";
import BubbleIcons from "./molecules/BubbleIcons";

const TechFind: React.FC = () => {
  return (
    <CenteredLayout>
      {/* Verbiage */}
      <div className="content order-first md:order-last text-center">
        <p className="text-2xl lg:text-4xl  font-bold">
          Tech finds for my day to day
        </p>

        <p className="mt-4 md:text-base">
          Discover the tools and technologies that enhance my daily workflow.
        </p>
      </div>

      {/* Content */}
      <BubbleIcons />
    </CenteredLayout>
  );
};

export default TechFind;
