import {
  AboutMeJumbotron,
  TechFinds,
  CurrentWorkExperience,
} from "@/components/core/hero";

import { fetchBrandLogos } from "@/actions/fetchMedia";

export default async function Home() {
  const brandLogos = await fetchBrandLogos();

  if (!brandLogos) {
    console.error("No brand logos found");
  } else {
    console.log(brandLogos);
  }

  return (
    <>
      <AboutMeJumbotron />
      <TechFinds />
      <CurrentWorkExperience />
    </>
  );
}
