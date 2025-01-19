import React from "react";

// Components
import HeroStack from "./layouts/HeroStack";
import ThermalTicket from "./molecules/ThermalTicket";

const TechFind: React.FC = () => {
  return (
    <HeroStack id="current-work-experience">
      {/* Verbiage */}
      <div className="content">
        <p className="text-2xl lg:text-4xl  font-bold">Software QA Analyst</p>

        <p className="mt-4 md:text-base">
          Showpass&apos;s mission is to provide event organizers with tools that
          elavate the fan experience. In the grand scheme of things, I am
          responsible for ensuring that the software is working as expected.
        </p>
      </div>

      {/* Content */}
      <ThermalTicket />
    </HeroStack>
  );
};

export default TechFind;
