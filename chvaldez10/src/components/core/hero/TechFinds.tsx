import React from "react";

// Components
import CenteredLayout from "./layouts/CenteredLayout";
import IconBubble from "./molecules/IconBubble";

const TechFind: React.FC = () => {
  return (
    <CenteredLayout>
      <div className="content">Tech finds I cant live without</div>
      <IconBubble />
    </CenteredLayout>
  );
};

export default TechFind;
