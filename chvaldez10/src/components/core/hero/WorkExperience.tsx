import React from "react";

// Components
import CenteredLayout from "./layouts/CenteredLayout";
import TicketItem from "./molecules/TicketItem";

const TechFind: React.FC = () => {
  return (
    <CenteredLayout>
      {/* Verbiage */}
      <div className="content">
        <p className="text-2xl lg:text-4xl  font-bold">Header</p>

        <p className="mt-4 md:text-base">Description</p>
      </div>

      {/* Content */}
      <TicketItem />
    </CenteredLayout>
  );
};

export default TechFind;
