import {
  AboutMeJumbotron,
  TechFinds,
  CurrentWorkExperience,
} from "@/components/core/hero";

export default async function Home() {
  return (
    <>
      <AboutMeJumbotron />
      <TechFinds />
      <CurrentWorkExperience />
    </>
  );
}
