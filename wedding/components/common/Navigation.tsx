"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "/#details", label: "Details" },
  { href: "/#events", label: "Events" },
  { href: "/#attire", label: "Attire" },
  { href: "/#travel", label: "Travel" },
  { href: "/#registry", label: "Registry" },
];

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-sm border-b border-sage/25">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="suite-script text-2xl">
            Sami &amp; Dexter
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-7">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="suite-label text-xs text-muted-foreground hover:text-hydrangea-deep transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Button asChild size="sm">
              <Link href="/rsvp">RSVP</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-1 transition-all duration-200 ease-in-out">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 px-4 suite-label text-xs hover:bg-accent/50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="px-4 pt-3">
              <Button asChild className="w-full">
                <Link href="/rsvp" onClick={() => setMobileMenuOpen(false)}>
                  RSVP
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
