"use client";

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <a href="/" className="font-serif text-xl">
            Sami & Dexter
          </a>
          <div className="flex items-center gap-6">
            <a
              href="/#details"
              className="text-sm hover:text-foreground/70 transition-colors"
            >
              Details
            </a>
            <a
              href="/gallery"
              className="text-sm hover:text-foreground/70 transition-colors"
            >
              Gallery
            </a>
            <a
              href="/rehearsal-dinner"
              className="text-sm hover:text-foreground/70 transition-colors"
            >
              Rehearsal Dinner
            </a>
            <a
              href="/rsvp"
              className="text-sm hover:text-foreground/70 transition-colors"
            >
              RSVP
            </a>
            <a
              href="/registry"
              className="text-sm hover:text-foreground/70 transition-colors"
            >
              Registry
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
