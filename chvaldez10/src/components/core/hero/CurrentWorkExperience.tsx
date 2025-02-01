import React from "react";

// Components
import HeroStack from "./layouts/HeroStack";
import ThermalTicket from "./molecules/ThermalTicket";
import { Typography } from "@/components/ui/text";

const CurrentWorkExperience: React.FC = () => {
  return (
    <HeroStack id="current-work-experience">
      {/* Verbiage */}
      <div className="content">
        <Typography
          variant="h2"
          text="Software QA Analyst"
          className="text-2xl lg:text-4xl font-bold"
        />

        <Typography
          variant="p"
          text="At Showpass, we're all about making live experiences unforgettable. As a Software QA Analyst, I ensure our software runs smoothly so fans can focus on the fun!"
          className="mt-4 text-sm sm:text-base text-gray-800"
        />
      </div>

      {/* Content */}
      <ThermalTicket />
    </HeroStack>
  );
};

export default CurrentWorkExperience;
