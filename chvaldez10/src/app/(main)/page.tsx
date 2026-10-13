import {
  AboutMeJumbotron,
  TechFinds,
  CurrentWorkExperience,
  ResumeHighlights,
  Projects,
} from "@/components/core/hero";

export default async function Home() {
  return (
    <>
      <AboutMeJumbotron />
      <TechFinds />
      <CurrentWorkExperience />
      <ResumeHighlights />
      <Projects />
    </>
  );
}
