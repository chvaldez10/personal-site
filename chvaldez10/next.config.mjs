/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "dvxqlvpokfujnpdwfuom.supabase.co",
        pathname: "**",
      },
    ],
    dangerouslyAllowSVG: true,
    qualities: [75, 100],
  },
  reactCompiler: true,
};

export default nextConfig;
