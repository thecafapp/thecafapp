/** @type {import('next').NextConfig} */
import nextPWA from "next-pwa";
import withBundleAnalyzer from "@next/bundle-analyzer";
import schoolConfig from "./caf.config.json";
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
  env: {
    NEXT_PUBLIC_SCHOOL_NAME: schoolConfig.schoolName,
    NEXT_PUBLIC_SCHOOL_ID: schoolConfig.schoolId,
    NEXT_PUBLIC_APP_TITLE: schoolConfig.branding.appTitle,
    NEXT_PUBLIC_CAF_NAME: schoolConfig.branding.cafName,
    NEXT_PUBLIC_APP_DOMAIN: schoolConfig.branding.domain,
    NEXT_PUBLIC_AUTH_METHOD: schoolConfig.auth.method,
    NEXT_PUBLIC_RESTRICT_AUTH_EMAIL_DOMAINS: schoolConfig.auth.restrictGoogleDomains,
    NEXT_PUBLIC_ALLOWED_AUTH_EMAIL_DOMAIN: schoolConfig.auth.allowedGoogleDomain,
    NEXT_PUBLIC_SCHOOL_THEME: schoolConfig.theme,
  }
};

export default nextBundleAnalyzer(withPWA(nextConfig));
