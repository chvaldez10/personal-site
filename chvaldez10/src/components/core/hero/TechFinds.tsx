import React from "react";

// Components
import BubbleIcons from "./molecules/BubbleIcons";
import CenteredVertical from "./layouts/CenteredVertical";

import { fetchBrandLogos } from "@/actions/fetchMedia";
import { Typography } from "@/components/ui/text";

const TechFinds: React.FC = async () => {
  const brandLogos = await fetchBrandLogos();

  return (
    <CenteredVertical
      background={"bg-[var(--brand-secondary-100)]"}
      id="tech-finds"
    >
      {/* Verbiage */}
      <div className="content text-center py-4">
        <Typography variant="h2" text="Tech finds for my day to day" className="text-gray-800" />
        
        <Typography variant="p" text="Discover the tools and technologies that enhance my daily workflow." className="mt-4 text-sm sm:text-base text-gray-600" />
      </div>

      {/* Content */}
      <BubbleIcons brandLogos={brandLogos} />
    </CenteredVertical>
  );
};

export default TechFinds;
