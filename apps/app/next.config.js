/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@pixsee/ui"],
  serverExternalPackages: [
    "@privy-io/react-auth",
    "@privy-io/server-auth",
    "@farcaster/mini-app-solana",
    "@farcaster/frame-sdk",
    "@reown/appkit",
    "@walletconnect/ethereum-provider",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.mux.com",
      },
      {
        protocol: "https",
        hostname: "stream.mux.com",
      },
      {
        protocol: "https",
        hostname: "api-staging.pixsee.io",
      },
    ],
  },
};

const disablePWA =
  process.env.NODE_ENV === "development" &&
  process.env.ENABLE_PWA_DEV !== "true";

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: disablePWA,
  register: true,
  skipWaiting: true,
});

module.exports = withPWA(nextConfig);
