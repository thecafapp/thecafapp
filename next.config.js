/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
});
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
};

module.exports = withPWA(nextConfig);
