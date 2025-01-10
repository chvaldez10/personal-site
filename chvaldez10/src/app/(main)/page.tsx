import {
  AboutMeJumbotron,
  TechFinds,
  CurrentWorkExperience,
  BreadCrumbsTest,
} from "@/components/core/hero";

export default async function Home() {
  return (
    <>
      <AboutMeJumbotron />
      <TechFinds />
      <CurrentWorkExperience />
      <BreadCrumbsTest />
    </>
  );
}
