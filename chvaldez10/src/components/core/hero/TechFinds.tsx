import React from "react";

// Components
import BubbleIcons from "./molecules/BubbleIcons";
import CenteredVertical from "./layouts/CenteredVertical";

import { fetchBrandLogos } from "@/actions/fetchMedia";

const TechFinds: React.FC = async () => {
  const brandLogos = await fetchBrandLogos();

  return (
    <CenteredVertical
      background={"bg-[var(--brand-secondary-100)]"}
      id="tech-finds"
    >
      {/* Verbiage */}
      <div className="content text-center py-4">
        <p className="text-2xl lg:text-4xl font-bold">
          Tech finds for my day to day
        </p>

        <p className="mt-4 text-sm sm:text-base">
          Discover the tools and technologies that enhance my daily workflow.
        </p>
      </div>

      {/* Content */}
      <BubbleIcons brandLogos={brandLogos} />
    </CenteredVertical>
  );
};

export default TechFinds;
