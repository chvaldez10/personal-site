import React from "react";

import { HeroLayoutProps } from "@/types/shared";

const CenteredVertical: React.FC<HeroLayoutProps> = ({
  children,
  background,
  id,
}) => {
  return (
    <div className={`min-h-screen flex-items-center ${background}`} id={id}>
      {children}
    </div>
  );
};

export default CenteredVertical;
