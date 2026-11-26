import type { NextConfig } from "next";

import { LEGACY_ROUTES } from "./src/lib/routes";

const nextConfig: NextConfig = {
  // Old URLs from a school's previous template (see src/lib/routes.ts) go to the matching page.
  // Temporary (307), so a school can still switch back to a template that uses them.
  async redirects() {
    return Object.entries(LEGACY_ROUTES).map(([source, destination]) => ({ source, destination, permanent: false }));
  },
};

export default nextConfig;
