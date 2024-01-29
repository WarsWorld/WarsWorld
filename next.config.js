/** @type {import("next").NextConfig} */
module.exports = {
  /** We run eslint as a separate task in CI */
  eslint: { ignoreDuringBuilds: process.env.CI !== undefined },
  reactStrictMode: false,
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
};
