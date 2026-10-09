// Local sample content. These images are served from public/logos.

export interface CompanyLogo {
  src: string;
  alt: string;
  referralLink?: string;
  label?: string;
  description: string;
}

export const appLogos: CompanyLogo[] = [
  {
    src: "/logos/aldente.png",
    alt: "Aldente Logo",
    label: "Aldente",
    description: "MacOS app to limit the charge on your MacBook.",
  },
  {
    src: "/logos/arc.svg",
    alt: "Arc Logo",
    label: "Arc",
    description: "A browser built for the modern web.",
    referralLink: "https://arc.net/gift/4dfb9ec0",
  },
  {
    src: "/logos/browser-stack.svg",
    alt: "BrowserStack Logo",
    label: "BrowserStack",
    description: "A platform for browser testing and automation.",
  },
  {
    src: "/logos/canva.svg",
    alt: "Canva Logo",
    // label: "Canva",
    description: "A design tool for creating visual content.",
  },
  {
    src: "/logos/coda.svg",
    alt: "Coda Logo",
    label: "Coda",
    description: "A note-taking app for building applications.",
  },
  {
    src: "/logos/color-hunt.svg",
    alt: "Color Hunt Logo",
    label: "Color Hunt",
    description: "A color palette generator.",
  },
  {
    src: "/logos/cursor.png",
    alt: "Cursor Logo",
    label: "Cursor",
    description: "An AI-powered code editor.",
  },
  {
    src: "/logos/logitech.svg",
    alt: "Logitech Logo",
    // label: "Logitech",
    description: "Software to customize your mouse and keyboard.",
  },
  {
    src: "/logos/open-ai.svg",
    alt: "OpenAI Logo",
    label: "OpenAI",
    description: "An AI research and deployment company.",
  },
  {
    src: "/logos/raycast.svg",
    alt: "Raycast Logo",
    label: "Raycast",
    description: "A productivity tool for macOS.",
  },
  {
    src: "/logos/supabase.svg",
    alt: "Supabase Logo",
    label: "Supabase",
    description: "A database for building applications.",
  },
  {
    src: "/logos/warp.svg",
    alt: "Warp Logo",
    // label: "Warp",
    description: "A terminal for the modern web.",
    referralLink: "https://app.warp.dev/referral/M93VEN",
  },
  {
    src: "/logos/youtube.svg",
    alt: "Youtube Logo",
    label: "Youtube",
    description: "A video streaming service.",
  },
  {
    src: "/logos/youtube-music.svg",
    alt: "Youtube Music Logo",
    label: "Youtube Music",
    description: "A music streaming service.",
  },
  {
    src: "/logos/zen.svg",
    alt: "Zen Logo",
    label: "Zen",
    description: "Another browser designed for the modern web.",
  },
];
