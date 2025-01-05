import React from "react";

import { HeroLayoutProps } from "@/types/shared";

const CenteredVertical: React.FC<HeroLayoutProps> = ({
  children,
  background,
}) => {
  return (
    <div className={`min-h-screen flex-items-center ${background}`}>
      {children}
    </div>
  );
};

export default CenteredVertical;
