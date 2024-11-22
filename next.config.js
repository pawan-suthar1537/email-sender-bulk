/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa");

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  distDir: "build",
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV !== "development",
  },
};

module.exports = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV !== "development",

  register: true,
  skipWaiting: true,
})(nextConfig);
