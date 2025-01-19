import React from "react";

import { HeroLayoutProps } from "@/types/shared";

const HeroStack: React.FC<HeroLayoutProps> = ({ children, background, id }) => {
  return (
    <>
      <div className={`${background} min-h-screen flex-items-center`} id={id}>
        <div className="container grid grid-cols-1 md:grid-cols-2 items-center md:gap-4 w-10/12">
          {children}
        </div>
      </div>
    </>
  );
};

export default HeroStack;
