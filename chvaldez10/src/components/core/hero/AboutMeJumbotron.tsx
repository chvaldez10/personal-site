// Original code from https://www.creative-tim.com/twcomponents/component/hero-section-1

import { FC } from "react";
import Image from "next/image";
import { FaGithub } from "react-icons/fa";

// Styles
import styles from "./hero.module.css";

// Components
import {
  BrandButton,
  SocialButton,
  PdfDialogButton,
} from "@/components/ui/buttons";
import { Typography } from "@/components/ui/text";
import { HeroStack } from "@/components/core/hero";

const AboutMeJumbotron: FC = () => {
  return (
    <HeroStack background={styles.gradientBackground}>
      <AboutDescription />

      {/* Image  */}
      <div className="mt-12 mx-auto">
        <Image
          src="/gifs/sandbox.gif"
          width={640}
          height={640}
          alt="Sandbox GIF"
          className="w-full h-auto max-w-xs md:max-w-md lg:max-w-lg"
          loading="lazy"
          unoptimized
        />
      </div>
    </HeroStack>
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
      <Typography
        variant="h1"
        text="I'm Christian"
        className="leading-tight mt-2"
      />

      {/* Subheader */}
      <Typography
        variant="p"
        text="What does that mean? I am someone who is eager to tackle challenges in software, from design and development to testing and shipping products. Why a sandbox? Because in a sandbox, you can experiment, fail, and learn."
        className="text-gray-800 mt-4"
      />

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
          pdfUrl="https://dvxqlvpokfujnpdwfuom.supabase.co/storage/v1/object/public/meda/docs/Christian-Valdez_Resume.pdf" // media is a typo
          className="items-start hover-scale-effect"
          label="Resume"
        ></PdfDialogButton>
      </div>
    </div>
  );
};
