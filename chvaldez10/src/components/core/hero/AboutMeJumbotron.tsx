// Original code from https://www.creative-tim.com/twcomponents/component/hero-section-1

import Image from "next/image";

// Icons
import { FaGithub } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa";

// Styles
import styles from "./hero.module.css";

// Components
import { BrandButton } from "@/components/ui/buttons";

const AboutMeJumbotron = () => {
  return (
    <div
      className={`${styles.gradientBackground} h-screen flex flex-col justify-center items-center`}
    >
      <div className="container grid grid-cols-1 md:grid-cols-2 items-center md:gap-4 w-10/12">
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
      <div className="flex items-center gap-4">
        <hr className="w-6 h-1 bg-orange-500 border-none" />
        <span className="md:text-lg font-medium text-gray-800">
          Self-Proclaimed Product Engineer
        </span>
      </div>

      {/* Header */}
      <p className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mt-2">
        I&apos;m Christian
      </p>

      {/* Subheader */}
      <p className="mt-4 md:text-base">
        What does that mean? I&apos;m someone who is eager to tackle challenges
        in software, from designing and developing to testing and shipping
        products. It may take years, but I&apos;m committed to the journey.
      </p>

      {/* Buttons */}
      <div className="flex gap-4 mt-8">
        <BrandButton>Get In Touch</BrandButton>

        <FaGithub />
        <FaFilePdf />
      </div>
    </div>
  );
};
