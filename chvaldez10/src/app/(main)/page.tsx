import {
  AboutMeJumbotron,
  TechFinds,
  CurrentWorkExperience,
  Projects,
} from "@/components/core/hero";

export default async function Home() {
  return (
    <>
      <AboutMeJumbotron />
      <TechFinds />
      <CurrentWorkExperience />
      <Projects />
    </>
  );
}
