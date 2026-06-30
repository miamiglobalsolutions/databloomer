import type { NextConfig } from "next";
import {
  AGING_ROOF_INDEX_LEGACY_PATH,
  AGING_ROOF_INDEX_PATH,
} from "./src/lib/reports/report-routes";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@electric-sql/pglite"],
  async redirects() {
    return [
      {
        source: AGING_ROOF_INDEX_LEGACY_PATH,
        destination: AGING_ROOF_INDEX_PATH,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
