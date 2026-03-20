import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["child_process", "os", "path"],
};

export default nextConfig;
