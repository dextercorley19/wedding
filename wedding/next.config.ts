import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The registry used to be its own page; it now lives in the `#registry`
  // section of the home page. Links we've already shared still work.
  async redirects() {
    return [
      { source: "/registry", destination: "/#registry", permanent: true },
      // The rehearsal dinner RSVP lives at `/nightbefore`. It was briefly at
      // `/thenightbefore`, and an unused scaffold page before that at
      // `/rehearsal-dinner` — both still resolve, in case either was shared.
      { source: "/rehearsal-dinner", destination: "/nightbefore", permanent: true },
      { source: "/thenightbefore", destination: "/nightbefore", permanent: true },
    ];
  },
};

export default nextConfig;
