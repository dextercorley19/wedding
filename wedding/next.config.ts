import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The registry used to be its own page; it now lives in the `#registry`
  // section of the home page. Links we've already shared still work.
  async redirects() {
    return [
      { source: "/registry", destination: "/#registry", permanent: true },
      // An unused scaffold page used to live at `/rehearsal-dinner`; the real
      // rehearsal dinner RSVP is at `/thenightbefore`.
      { source: "/rehearsal-dinner", destination: "/thenightbefore", permanent: true },
    ];
  },
};

export default nextConfig;
