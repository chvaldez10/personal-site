import React from "react";

// Components
import CenteredLayout from "./layouts/CenteredLayout";
import BubbleIcons from "./molecules/BubbleIcons";

const TechFind: React.FC = () => {
  return (
    <CenteredLayout>
      <div className="content">Tech finds I cant live without</div>
      <BubbleIcons />
    </CenteredLayout>
  );
};

export default TechFind;
