import MarqueeIcons from "./molecules/MarqueeIcons";
import CenteredVertical from "./layouts/CenteredVertical";
import { fetchBrandLogos } from "@/lib/data/brandLogos";
import { Typography } from "@/components/ui/text";

export default async function TechFinds() {
  const brandLogos = await fetchBrandLogos();
  return (
    <CenteredVertical background="bg-(--brand-secondary-100)" id="tech-finds">
      <div className="content py-4 text-center">
        <Typography
          variant="h2"
          text="Essential Tech for My Daily Workflow"
          className="text-xl text-gray-800 sm:text-2xl"
        />
        <Typography
          variant="p"
          text="Explore the tools and technologies that streamline my everyday tasks."
          className="mt-4 text-sm text-gray-600 sm:text-base"
        />
      </div>
      {brandLogos === null ? (
        <output className="px-6 py-10 text-center text-muted-foreground">
          Tech Finds are temporarily unavailable. Please try again later.
        </output>
      ) : brandLogos.length === 0 ? (
        <p className="px-6 py-10 text-center text-muted-foreground">
          No Tech Finds have been added yet.
        </p>
      ) : (
        <MarqueeIcons brandLogos={brandLogos} />
      )}
    </CenteredVertical>
  );
}
