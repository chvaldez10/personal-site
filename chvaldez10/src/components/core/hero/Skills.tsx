import React from "react";

// Components
import CenteredLayout from "./layouts/CenteredLayout";
import SkillsBubble from "./molecules/SkillsBubble";

const Skills: React.FC = () => {
  return (
    <CenteredLayout>
      <div className="content">Hello</div>
      <SkillsBubble />
    </CenteredLayout>
  );
};

export default Skills;
