import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: ["nextstepjs"],
  outputFileTracingIncludes: {
    "/api/contract-pdf/[slug]": ["node_modules/pdfkit/js/data/*.afm"],
    "/app/api/contract-pdf/[slug]/route": ["node_modules/pdfkit/js/data/*.afm"],
  },
};

export default nextConfig;
