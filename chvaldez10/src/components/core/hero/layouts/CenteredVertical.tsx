import React from "react";

import { HeroLayoutProps } from "@/types/shared";

const CenteredVertical: React.FC<HeroLayoutProps> = ({ children }) => {
  return <div className="min-h-screen flex-items-center">{children}</div>;
};

export default CenteredVertical;
