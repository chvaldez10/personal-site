// Original code from https://www.creative-tim.com/twcomponents/component/hero-section-1

// React
import { FC } from "react";

// Next
import Image from "next/image";

// Icons
import { FaGithub } from "react-icons/fa";

// Styles
import styles from "./Hero.module.css";

// Components
import {
  BrandButton,
  SocialButton,
  PdfDialogButton,
} from "@/components/ui/buttons";

import { CenteredLayout } from "@/components/core/hero";

const AboutMeJumbotron: FC = () => {
  return (
    <CenteredLayout background={styles.gradientBackground}>
      <AboutDescription />

      {/* Image  */}
      <div className="mt-12 mx-auto">
        <Image
          src="/gifs/sandbox-no-bg.gif"
          width={600}
          height={600}
          alt=""
          className="w-full h-auto max-w-xs md:max-w-md lg:max-w-lg"
        />
      </div>
    </CenteredLayout>
  );
};

export default AboutMeJumbotron;

const AboutDescription = () => {
  return (
    <div className="content">
      {/* top label */}
      <div className="flex items-center gap-2 sm:gap-4">
        <hr className="w-4 sm:w-6 h-1 bg-orange-500 border-none" />
        <span className="text-sm sm:text-lg font-medium text-gray-600">
          Self-Proclaimed Product Engineer
        </span>
      </div>

      {/* Header */}
      <p className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mt-2">
        I&apos;m Christian
      </p>

      {/* Subheader */}
      <p className="mt-4 text-sm sm:text-base text-gray-800">
        What does that mean? I am someone who is eager to tackle challenges in
        software, from design and development to testing and shipping products.
        Why a sandbox? Because in a sandbox, you can experiment, fail, and
        learn.
      </p>

      {/* Buttons */}
      <div className="flex flex-wrap gap-2 mt-8">
        <BrandButton>Get In Touch</BrandButton>

        <SocialButton
          icon={<FaGithub />}
          variant="link"
          size="iconFit"
          href="https://github.com/chvaldez10"
        ></SocialButton>

        <PdfDialogButton
          variant="link"
          size="iconFit"
          pdfUrl="/docs/Christian-Valdez_Resume.pdf"
          className="items-start hover-scale-effect"
          label="Resume"
        ></PdfDialogButton>
      </div>
    </div>
  );
};
