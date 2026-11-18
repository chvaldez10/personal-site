import { FaGithub } from "react-icons/fa";
import { ArrowDown } from "lucide-react";
import { Button, PdfDialogButton, SocialLink } from "@/components/ui/buttons";
import WorkbenchPreview from "./WorkbenchPreview";
import styles from "./showcase.module.css";

export default function AboutMeJumbotron3D() {
  return (
    <section className={styles.about} aria-labelledby="about-heading">
      <WorkbenchPreview
        intro={
          <div className={styles.intro}>
            <p className={styles.eyebrow}>Software QA Analyst</p>
            <h1 id="about-heading">
              I&apos;m <span>Christian.</span>
            </h1>
            <p className={styles.description}>
              I like making useful things. I build, test, and improve ideas as I
              go. Welcome to my workspace.
            </p>
          </div>
        }
      >
        <div className={styles.contact}>
          <Button asChild size="lg" className={styles.primary}>
            <a href="#tech-finds">
              Explore the workspace <ArrowDown aria-hidden="true" />
            </a>
          </Button>
          <div className={styles.introLinks}>
            <a href="mailto:christianvaldez021@gmail.com">Say hello</a>
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
      </WorkbenchPreview>
    </section>
  );
}
