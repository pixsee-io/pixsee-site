/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@pixsee/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.mux.com",
      },
      {
        protocol: "https",
        hostname: "api-staging.pixsee.io",
      },
    ],
  },
};

module.exports = nextConfig;
