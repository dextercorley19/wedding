export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="font-serif text-xl">
              Sami & Dexter
            </a>
            <div className="flex items-center gap-6">
              <a href="/#details" className="text-sm hover:text-foreground/70 transition-colors">
                Details
              </a>
              <a href="/gallery" className="text-sm hover:text-foreground/70 transition-colors">
                Gallery
              </a>
              <a href="/rehearsal-dinner" className="text-sm hover:text-foreground/70 transition-colors">
                Rehearsal Dinner
              </a>
              <a href="/rsvp" className="text-sm hover:text-foreground/70 transition-colors">
                RSVP
              </a>
              <a href="/registry" className="text-sm hover:text-foreground/70 transition-colors">
                Registry
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="font-serif text-5xl md:text-6xl text-center mb-4">The Propsoal</h1>
          <p className="text-center text-muted-foreground mb-16">
            A few moments we shared together after getting engaged on the beach in Maui
          </p>

          {/* Photo Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img
                src="/images/img-4371.jpeg"
                alt="Sami and Dexter embracing on the beach at sunset"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img
                src="/images/img-4373.jpeg"
                alt="Sami and Dexter hugging on the beach after engagement"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img
                src="/images/img-4372.jpeg"
                alt="Sami and Dexter kissing on the beach at sunset"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img
                src="/images/img-4180.jpg"
                alt="Sami's engagement ring on green grass"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img
                src="/images/img-0092-20-282-29.jpeg"
                alt="Sami and Dexter together on the beach with mountains in background"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img
                src="/images/img-0105.jpg"
                alt="Sami showing her engagement ring with a hibiscus flower"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
