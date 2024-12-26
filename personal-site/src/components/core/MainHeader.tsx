import React from "react";
import "@/styles/main-header.css";

const MainHeader: React.FC = () => {
  return (
    <div className="h-screen gradient-background flex flex-col justify-center items-center text-center">
      <h1 className="text-6xl font-extrabold text-white drop-shadow-lg">
        I&apos;m Christian
      </h1>
      <p className="text-xl text-white mt-2 drop-shadow-md">
        I like to build things
      </p>
      <div className="mt-4">
        <button className="btn">Button 1</button>
        <button className="btn ml-4">Button 2</button>
      </div>
    </div>
  );
};

export default MainHeader;
