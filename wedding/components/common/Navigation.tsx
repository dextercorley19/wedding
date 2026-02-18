"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-serif text-xl">
            Sami & Dexter
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/#details" className="text-sm hover:text-foreground/70 transition-colors">
              Details
            </Link>
            <Link href="/rsvp" className="text-sm hover:text-foreground/70 transition-colors">
              RSVP
            </Link>
            <Link href="/registry" className="text-sm hover:text-foreground/70 transition-colors">
              Registry
            </Link>
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
          <div className="md:hidden mt-4 pb-4 space-y-2 transition-all duration-200 ease-in-out">
            <Link
              href="/#details"
              className="block py-2 px-4 text-base hover:bg-muted rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Details
            </Link>
            <Link
              href="/rsvp"
              className="block py-2 px-4 text-base hover:bg-muted rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              RSVP
            </Link>
            <Link
              href="/registry"
              className="block py-2 px-4 text-base hover:bg-muted rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Registry
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
