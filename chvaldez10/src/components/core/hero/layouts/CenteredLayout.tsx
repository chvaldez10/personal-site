import React from "react";

import { HeroLayoutProps } from "@/types/shared";

const CenteredLayout: React.FC<HeroLayoutProps> = ({
  children,
  background,
}) => {
  return (
    <>
      <div
        className={`${background} h-screen flex flex-col justify-center items-center`}
      >
        <div className="container grid grid-cols-1 md:grid-cols-2 items-center md:gap-4 w-10/12">
          {children}
        </div>
      </div>
    </>
  );
};

export default CenteredLayout;
