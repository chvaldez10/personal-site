import React from "react";

// Components
import HeroStack from "./layouts/HeroStack";
import ThermalTicket from "./molecules/ThermalTicket";

const CurrentWorkExperience: React.FC = () => {
  return (
    <HeroStack id="current-work-experience">
      {/* Verbiage */}
      <div className="content">
        <p className="text-2xl lg:text-4xl font-bold">Software QA Analyst</p>

        <p className="mt-4 text-sm sm:text-base text-gray-800">
          At Showpass, I am dedicated to enhancing the fan experience by
          ensuring that our software functions seamlessly. My role involves
          testing and validating features to deliver a high-quality product.
        </p>
      </div>

      {/* Content */}
      <ThermalTicket />
    </HeroStack>
  );
};

export default CurrentWorkExperience;
