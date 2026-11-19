export const arenaAspect = 1.5;
export const maxPortraitPan = 0.155;

export type ArenaFraming = {
  zoom: number;
  x: number;
  y: number;
  portraitPan: number;
};

export type ArenaScene = "concert" | "octagon";

export const arenas: Record<
  ArenaScene,
  { src: string; alt: string; framing: ArenaFraming }
> = {
  concert: {
    src: "/images/kpop-arena.webp",
    alt: "",
    framing: { zoom: 0.75, x: 0.53, y: 0.53, portraitPan: 0.18 },
  },
  octagon: {
    src: "/images/mma-arena.webp",
    alt: "A lit octagon seen from cageside in a packed arena",
    framing: { zoom: 0.78, x: 0.5, y: 0.5, portraitPan: 0 },
  },
};
