import { FaGithub } from "react-icons/fa";
import { TriangleAlert } from "lucide-react";
import {
  BrandedLink,
  PdfDialogButton,
  SocialLink,
} from "@/components/ui/buttons";
import WorkbenchPreview from "./WorkbenchPreview";
import styles from "./showcase.module.css";

export default function AboutMeJumbotron3D() {
  return (
    <section className={styles.about} aria-labelledby="about-heading">
      <div className={`home-container ${styles.aboutLayout}`}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>
            <TriangleAlert size={16} aria-hidden="true" />
            Caution · Ideas in motion
          </p>
          <h1 id="about-heading">I&apos;m Christian</h1>
          <p className={styles.description}>
            I’m a software QA analyst who likes making useful things. I build,
            test, and improve ideas as I go. Welcome to my workspace.
          </p>
          <div className={styles.contact}>
            <BrandedLink href="mailto:christianvaldez021@gmail.com">
              Say hello
            </BrandedLink>
            <SocialLink
              icon={<FaGithub />}
              variant="link"
              size="icon"
              href="https://github.com/chvaldez10"
              aria-label="GitHub"
            />
            <PdfDialogButton
              variant="link"
              size="icon"
              pdfUrl="/api/resume"
              downloadUrl="/api/resume?download=1"
              label="Resume"
            />
          </div>
        </div>
        <WorkbenchPreview />
      </div>
    </section>
  );
}
