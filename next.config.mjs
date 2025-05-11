import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import("next").NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, "src/frontend/styles")],
  },
  eslint: { ignoreDuringBuilds: process.env.CI !== undefined },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (config) => {
    config.resolve = {
      ...config.resolve,
      extensionAlias: {
        ".js": [".ts", ".tsx", ".js", ".jsx"],
      },
    };
    return config;
  },
};

export default nextConfig;
