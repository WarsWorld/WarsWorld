// [upstream] https://github.com/vercel/next.js/issues/5318
// https://github.com/vercel/next.js/discussions/35969
// https://github.com/vercel/next.js/pull/57656

/** @type {import("next").NextConfig} */
const nextConfig = {
  /** We run eslint as a separate task in CI */
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
};

export default nextConfig;
