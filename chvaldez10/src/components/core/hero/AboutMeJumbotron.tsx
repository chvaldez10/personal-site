import { FaGithub } from "react-icons/fa";
import styles from "./hero.module.css";
import {
  BrandedLink,
  SocialButton,
  PdfDialogButton,
} from "@/components/ui/buttons";
import { Typography } from "@/components/ui/text";
import MakersBench from "./MakersBench";

export default function AboutMeJumbotron() {
  return (
    <section className={styles.hero}>
      <MakersBench />
      <div className={`${styles.heroContent} home-container`}>
        <AboutDescription />
      </div>
    </section>
  );
}

const AboutDescription = () => {
  return (
    <div className={`${styles.intro} content`}>
      <div className="flex items-center justify-center gap-2 sm:gap-4">
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
        text="I like making useful things from rough ideas. I sketch, build, test, and refine until the details feel right. Explore the bench to see how I work."
        className="mx-auto mt-4 max-w-xl leading-7 text-gray-800"
      />

      <div className="mt-8 flex flex-wrap justify-center gap-2">
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
