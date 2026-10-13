import React from "react";

import { HeroLayoutProps } from "@/types/shared";

const HeroStack: React.FC<HeroLayoutProps> = ({ children, background, id }) => {
  return (
    <>
      <div
        className={`min-h-screen flex-items-center py-24 sm:py-32 ${background}`}
        id={id}
      >
        <div className="home-container grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-12">
          {children}
        </div>
      </div>
    </>
  );
};

export default HeroStack;
