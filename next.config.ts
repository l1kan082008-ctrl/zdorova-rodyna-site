import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 85, 90],
    deviceSizes: [384, 640, 750, 828, 1080, 1280, 1600, 1920, 2560],
    imageSizes: [32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 86400,
    remotePatterns: ["doctors", "locations", "services", "banners"].map((folder) => ({
      protocol: "https" as const,
      hostname: "*.public.blob.vercel-storage.com",
      port: "",
      pathname: `/${folder}/**`,
      search: "",
    })),
  },
};

export default nextConfig;
