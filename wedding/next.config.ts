import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The registry used to be its own page; it now lives in the `#registry`
  // section of the home page. Links we've already shared still work.
  async redirects() {
    return [{ source: "/registry", destination: "/#registry", permanent: true }];
  },
};

export default nextConfig;
