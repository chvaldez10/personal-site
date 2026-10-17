import { FaGithub } from "react-icons/fa";
import styles from "./hero.module.css";
import {
  BrandedLink,
  SocialButton,
  PdfDialogButton,
} from "@/components/ui/buttons";
import { Typography } from "@/components/ui/text";
import { HeroStack } from "@/components/core/hero";
import ProcessCardStack from "./ProcessCardStack";

export default function AboutMeJumbotron() {
  return (
    <HeroStack background={styles.gradientBackground}>
      <AboutDescription />
      <ProcessCardStack />
    </HeroStack>
  );
}

const AboutDescription = () => {
  return (
    <div className="content">
      <div className="flex items-center gap-2 sm:gap-4">
        <hr className="w-4 sm:w-6 h-1 bg-orange-500 border-none" />
        <span className="text-sm sm:text-lg font-medium text-gray-600">
          Self-Proclaimed Product Engineer
        </span>
      </div>

      <Typography
        variant="h1"
        text="I'm Christian"
        className="leading-tight mt-2"
      />

      <Typography
        variant="p"
        text="I like taking an idea from its first sketch to something people can use—shaping the experience, writing the code, testing the edges, and learning along the way. Explore the cards to see how I think about that process."
        className="mt-4 max-w-xl leading-7 text-gray-800"
      />

      <div className="flex flex-wrap gap-2 mt-8">
        <BrandedLink
          href="https://www.linkedin.com/in/chvaldez10/"
          target="_blank"
        >
          Get In Touch
        </BrandedLink>

        <SocialButton
          icon={<FaGithub />}
          variant="link"
          size="iconFit"
          href="https://github.com/chvaldez10"
        ></SocialButton>

        <PdfDialogButton
          variant="link"
          size="iconFit"
          pdfUrl="/api/resume"
          downloadUrl="/api/resume?download=1"
          className="items-start hover-scale-effect"
          label="Resume"
        ></PdfDialogButton>
      </div>
    </div>
  );
};
