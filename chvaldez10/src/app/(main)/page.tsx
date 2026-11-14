import {
  TechFinds,
  ResumeHighlights,
  Projects,
  Hobbies,
} from "@/components/core/hero";
import AboutMeJumbotron3D from "@/components/core/hero/showcase/AboutMeJumbotron3D";
import CurrentWorkExperience3D from "@/components/core/hero/showcase/CurrentWorkExperience3D";

export default async function Home() {
  return (
    <>
      <AboutMeJumbotron3D />
      <TechFinds />
      <CurrentWorkExperience3D />
      <ResumeHighlights />
      <Projects />
      <Hobbies />
    </>
  );
}
