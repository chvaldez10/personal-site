import { FaGithub } from "react-icons/fa";
import { TriangleAlert } from "lucide-react";
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
      <div className={styles.hazardSign}>
        <TriangleAlert aria-hidden="true" />
        <strong>Caution: Ideas in motion</strong>
      </div>

      <Typography
        variant="h1"
        text="I'm Christian"
        className="leading-tight mt-2"
      />

      <Typography
        variant="p"
        text="I like making things I use every day, and things others can use too. I get an idea, build it, test it, and keep improving it. Welcome to my workspace."
        className="mx-auto mt-4 max-w-xl leading-7 text-gray-800"
      />

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <BrandedLink
          href="https://www.linkedin.com/in/chvaldez10/"
          target="_blank"
        >
          Say hello
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
