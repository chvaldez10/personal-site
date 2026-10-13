import React from "react";

import { HeroLayoutProps } from "@/types/shared";

const CenteredVertical: React.FC<HeroLayoutProps> = ({
  children,
  background,
  id,
}) => {
  return (
    <div
      className={`min-h-screen flex-items-center py-24 sm:py-32 ${background}`}
      id={id}
    >
      <div className="home-container space-y-4">{children}</div>
    </div>
  );
};

export default CenteredVertical;
