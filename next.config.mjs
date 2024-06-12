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
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Firebase-Token, X-Password",
          },
        ],
      },
    ];
  },
};

export default nextBundleAnalyzer(withPWA(nextConfig));
