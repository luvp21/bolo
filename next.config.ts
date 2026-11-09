import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Kept deliberately plain so route handlers and client components behave the
  // way most docs and examples assume. Do not re-enable cacheComponents or
  // partialPrefetching unless you have time to spare.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
