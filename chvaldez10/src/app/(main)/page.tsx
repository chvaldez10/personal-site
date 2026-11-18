import Hobbies from "@/components/core/hero/Hobbies";
import Projects from "@/components/core/hero/Projects";
import ResumeHighlights from "@/components/core/hero/ResumeHighlights";
import TechFinds from "@/components/core/hero/TechFinds";
import AboutMeJumbotron3D from "@/components/core/hero/showcase/AboutMeJumbotron3D";
import CurrentWorkExperience3D from "@/components/core/hero/showcase/CurrentWorkExperience3D";
import styles from "@/components/core/hero/studio.module.css";

export default function Home() {
  return (
    <div className={styles.home}>
      <AboutMeJumbotron3D />
      <TechFinds />
      <CurrentWorkExperience3D />
      <ResumeHighlights />
      <Projects />
      <Hobbies />
    </div>
  );
}
