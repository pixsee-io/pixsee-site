/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is now stable in Next.js 13+
}

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',                 
  disable: process.env.NODE_ENV === 'development', 
  register: true,            
  skipWaiting: true,          
  // Optional advanced options:
  // cacheOnFrontEndNav: true,
  // aggressiveFrontEndNavCaching: true,
});

module.exports = withPWA(nextConfig);
