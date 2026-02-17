/** @type {import('next').NextConfig} */
const nextConfig = {};
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
