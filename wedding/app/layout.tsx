import type React from "react";
import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Geist_Mono, Pinyon_Script, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { GlobalPasswordGate } from "@/components/common/GlobalPasswordGate";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});
const pinyon = Pinyon_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
});

export const metadata: Metadata = {
  title: "Sami & Dexter | October 24, 2026",
  description:
    "Join us as we celebrate our wedding on October 24, 2026 in Newport Beach, California",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 2,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${geistMono.variable} ${playfair.variable} ${pinyon.variable}`}
    >
      <body className="font-sans antialiased">
        <GlobalPasswordGate>{children}</GlobalPasswordGate>
        <Analytics />
      </body>
    </html>
  );
}
