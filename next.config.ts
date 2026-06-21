import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Hosts paste arbitrary image URLs when creating listings, so allow any HTTPS host.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
