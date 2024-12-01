/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa");
const BundleAnalyzer = require("@next/bundle-analyzer");

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

const withBundleAnalyzer = BundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// PWA configuration
const withPWAConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV !== "production",
  register: true,
  skipWaiting: true,
});

// Compose both configurations
module.exports = withBundleAnalyzer(withPWAConfig(nextConfig));
