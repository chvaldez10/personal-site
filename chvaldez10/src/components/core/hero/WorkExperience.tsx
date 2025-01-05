import React from "react";

// Components
import HeroStack from "./layouts/HeroStack";
import ThermalTicket from "./molecules/ThermalTicket";

const TechFind: React.FC = () => {
  return (
    <HeroStack>
      {/* Verbiage */}
      <div className="content">
        <p className="text-2xl lg:text-4xl  font-bold">Header</p>

        <p className="mt-4 md:text-base">Description</p>
      </div>

      {/* Content */}
      <ThermalTicket />
    </HeroStack>
  );
};

export default TechFind;
