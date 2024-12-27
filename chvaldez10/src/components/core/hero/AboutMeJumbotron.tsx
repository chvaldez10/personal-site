// Original code from https://www.creative-tim.com/twcomponents/component/hero-section-1

import { RiFacebookFill } from "react-icons/ri";
import { SiBehance } from "react-icons/si";
import Image from "next/image";

import styles from "./hero.module.css";

// import "@/styles/main-header.css";

const AboutMeJumbotron = () => {
  return (
    <div
      className={`${styles.gradientBackground} h-screen flex flex-col justify-center items-center`}
    >
      <div className="container grid grid-cols-1 md:grid-cols-2 items-center md:gap-4">
        <AboutDescription />

        {/* Image  */}
        <div className="relative mt-10 md:mt-0 px-6 md:px-0 mx-auto">
          <Image
            src="/sandbox-no-bg.gif"
            width={600}
            height={600}
            alt=""
            className="w-full h-auto max-w-xs md:max-w-md lg:max-w-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default AboutMeJumbotron;

const AboutDescription = () => {
  return (
    <div className="content">
      {/* top label */}
      <div className="flex items-center gap-3">
        <hr className="w-6 h-1 bg-orange-500 border-none" />
        <span className="md:text-[18px] font-medium text-gray-800">
          Self-Proclaimed Product Engineer
        </span>
      </div>

      {/* Header */}
      <p className="text-[40px] lg:text-[45px] xl:text-[55px] font-bold leading-tight mt-5 sm:mt-0">
        I&apos;m Christian
      </p>

      {/* Subheader */}
      <p className="mt-5 md:text-md">
        What does that mean? I&apos;m someone who is eager to tackle challenges
        in software, from designing and developing to testing and shipping
        products. It may take years, but I&apos;m committed to the journey.
      </p>

      {/* Buttons */}
      <div className="flex gap-4 mt-10">
        <button className="font-medium text-[16px] flex items-center px-5 py-3 md:py-4 md:px-8 rounded-xl capitalize bg-gradient-to-r from-orange-300 to-orange-500 hover:from-pink-500 hover:to-yellow-500 relative gap-2 transition duration-300 hover:scale-105 text-white shadow-glass">
          Get In Touch
          <span className="animate-ping absolute right-0 top-0 w-3 h-3 rounded-full bg-gradient-to-r from-orange-400 to-orange-700"></span>
        </button>
        <RiFacebookFill />
        <SiBehance />
      </div>
    </div>
  );
};
