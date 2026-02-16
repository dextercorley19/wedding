"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <a href="/" className="font-serif text-xl">
            Sami & Dexter
          </a>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <a href="/#details" className="text-sm hover:text-foreground/70 transition-colors">
              Details
            </a>
            <a href="/gallery" className="text-sm hover:text-foreground/70 transition-colors">
              Gallery
            </a>
            <a
              href="/rehearsal-dinner"
              className="text-sm hover:text-foreground/70 transition-colors"
            >
              Rehearsal Dinner
            </a>
            <a href="/rsvp" className="text-sm hover:text-foreground/70 transition-colors">
              RSVP
            </a>
            <a href="/registry" className="text-sm hover:text-foreground/70 transition-colors">
              Registry
            </a>
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
          <div className="md:hidden mt-4 pb-4 space-y-2">
            <a
              href="/#details"
              className="block py-2 px-4 text-base hover:bg-muted rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Details
            </a>
            <a
              href="/gallery"
              className="block py-2 px-4 text-base hover:bg-muted rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Gallery
            </a>
            <a
              href="/rehearsal-dinner"
              className="block py-2 px-4 text-base hover:bg-muted rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Rehearsal Dinner
            </a>
            <a
              href="/rsvp"
              className="block py-2 px-4 text-base hover:bg-muted rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              RSVP
            </a>
            <a
              href="/registry"
              className="block py-2 px-4 text-base hover:bg-muted rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Registry
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
