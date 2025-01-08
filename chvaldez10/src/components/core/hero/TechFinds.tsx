import React from "react";

// Components
import BubbleIcons from "./molecules/BubbleIcons";
import CenteredVertical from "./layouts/CenteredVertical";

import { fetchBrandLogos } from "@/actions/fetchMedia";

const TechFind: React.FC = async () => {
  const brandLogos = await fetchBrandLogos();

  return (
    <CenteredVertical background={"bg-[var(--brand-secondary-100)]"}>
      {/* Verbiage */}
      <div className="content text-center">
        <p className="text-2xl lg:text-4xl font-bold">
          Tech finds for my day to day
        </p>

        <p className="mt-4 md:text-base">
          Discover the tools and technologies that enhance my daily workflow.
        </p>
      </div>

      {/* Content */}
      <BubbleIcons brandLogos={brandLogos} />
    </CenteredVertical>
  );
};

export default TechFind;
