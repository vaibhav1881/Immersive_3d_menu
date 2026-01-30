import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // Allow cross-origin requests from local network for mobile testing
  allowedDevOrigins: [
    'http://192.168.29.220:3000',
    'http://localhost:3000',
  ],
};

export default nextConfig;
