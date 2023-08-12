/** @type {import('next').NextConfig} */
import remarkGfm from "remark-gfm";
import nextPWA from "next-pwa";
import withMDX from "@next/mdx";
import withBundleAnalyzer from "@next/bundle-analyzer";
const nextBundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});
const withPWA = nextPWA({
  dest: "public",
});
const nextMDX = withMDX({
  extension: /\.mdx?$/,
  options: {
    // If you use remark-gfm, you'll need to use next.config.mjs
    // as the package is ESM only
    // https://github.com/remarkjs/remark-gfm#install
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
    // If you use `MDXProvider`, uncomment the following line.
    // providerImportSource: "@mdx-js/react",
  },
});

const nextConfig = {
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  reactStrictMode: false,
  swcMinify: true,
};

export default nextBundleAnalyzer(nextMDX(withPWA(nextConfig)));
