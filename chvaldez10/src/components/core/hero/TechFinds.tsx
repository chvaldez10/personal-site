import MarqueeIcons from "./molecules/MarqueeIcons";
import CenteredVertical from "./layouts/CenteredVertical";
import { fetchBrandLogos } from "@/lib/data/brandLogos";
import { Typography } from "@/components/ui/text";

export default async function TechFinds() {
  const brandLogos = await fetchBrandLogos();
  return (
    <CenteredVertical background="bg-white" id="tech-finds">
      <div className="content py-4 text-center">
        <Typography
          variant="h2"
          text="Tools I use every day"
          className="text-xl text-gray-800 sm:text-2xl"
        />
        <Typography
          variant="p"
          text="The apps and tools I reach for when I’m building, testing, or figuring something out."
          className="mt-4 text-sm text-gray-600 sm:text-base"
        />
      </div>
      {brandLogos === null ? (
        <output className="px-6 py-10 text-center text-muted-foreground">
          My tools are temporarily unavailable. Please try again later.
        </output>
      ) : brandLogos.length === 0 ? (
        <p className="px-6 py-10 text-center text-muted-foreground">
          I haven’t added any tools here yet.
        </p>
      ) : (
        <MarqueeIcons brandLogos={brandLogos} />
      )}
    </CenteredVertical>
  );
}
