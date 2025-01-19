import React from "react";

import { HeroLayoutProps } from "@/types/shared";

const HeroStack: React.FC<HeroLayoutProps> = ({ children, background, id }) => {
  return (
    <>
      <div className={`min-h-screen flex-items-center ${background}`} id={id}>
        <div className="container grid grid-cols-1 md:grid-cols-2 items-center gap-4 w-10/12">
          {children}
        </div>
      </div>
    </>
  );
};

export default HeroStack;
