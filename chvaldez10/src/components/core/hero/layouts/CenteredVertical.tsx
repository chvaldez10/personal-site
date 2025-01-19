import React from "react";

import { HeroLayoutProps } from "@/types/shared";

const CenteredVertical: React.FC<HeroLayoutProps> = ({
  children,
  background,
  id,
}) => {
  return (
    <div className={`min-h-screen flex-items-center ${background}`} id={id}>
      <div className="container w-10/12 space-y-4">{children}</div>
    </div>
  );
};

export default CenteredVertical;
