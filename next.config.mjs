/** @type {import('next').NextConfig} */
import nextPWA from "next-pwa";
import withBundleAnalyzer from "@next/bundle-analyzer";
const nextBundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});
const withPWA = nextPWA({
  dest: "public",
});

const nextConfig = {
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  reactStrictMode: false,
  swcMinify: true,
};

export default nextBundleAnalyzer(withPWA(nextConfig));
