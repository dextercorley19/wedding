import Link from "next/link"
import { Calendar, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="font-serif text-xl">
              Sami & Dexter
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/#details" className="text-sm hover:text-foreground/70 transition-colors">
                Details
              </Link>
              <Link href="/gallery" className="text-sm hover:text-foreground/70 transition-colors">
                Gallery
              </Link>
              <Link href="/rehearsal-dinner" className="text-sm hover:text-foreground/70 transition-colors">
                Rehearsal Dinner
              </Link>
              <Link href="/rsvp" className="text-sm hover:text-foreground/70 transition-colors">
                RSVP
              </Link>
              <Link href="/registry" className="text-sm hover:text-foreground/70 transition-colors">
                Registry
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <img src="/beach-proposal.jpg" alt="Beach proposal" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <div className="relative text-center space-y-6 px-4 text-white">
          <h1 className="font-serif text-6xl md:text-8xl text-balance drop-shadow-lg">Sami & Dexter</h1>
          <p className="text-xl md:text-2xl drop-shadow-md">June 15, 2025</p>
          <p className="text-lg drop-shadow-md">We're getting married!</p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/rsvp">RSVP Now</Link>
          </Button>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-serif text-4xl md:text-5xl mb-8">Our Story</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            We met in the summer of 2019 at a mutual friend's gathering. What started as a conversation about our shared
            love of adventure turned into countless memories together.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Five years later, Dexter proposed during a beautiful sunset on the beach. We can't wait to celebrate this
            next chapter with all of you.
          </p>
        </div>
      </section>

      {/* Event Details */}
      <section id="details" className="py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-serif text-4xl md:text-5xl text-center mb-16">Event Details</h2>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Ceremony */}
            <div className="space-y-6">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img src="/27_ceremony-area-Newport-Beach-Country-Club-wedding-photographer.jpg" alt="Ceremony venue" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-4">
                <h3 className="font-serif text-2xl">Ceremony</h3>
                <div className="space-y-3 text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Saturday, June 15, 2025</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 mt-0.5 shrink-0" />
                    <p>4:00 PM</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Garden Estate</p>
                      <p className="text-sm">123 Vineyard Lane</p>
                      <p className="text-sm">Napa Valley, CA 94558</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reception */}
            <div className="space-y-6">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src="/34135813_1738752159505266_6750061028635049984_o.jpg"
                  alt="Reception venue"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-4">
                <h3 className="font-serif text-2xl">Reception</h3>
                <div className="space-y-3 text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Saturday, June 15, 2025</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 mt-0.5 shrink-0" />
                    <p>6:00 PM - 11:00 PM</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Garden Estate</p>
                      <p className="text-sm">123 Vineyard Lane</p>
                      <p className="text-sm">Napa Valley, CA 94558</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-20 space-y-8">
            <h3 className="font-serif text-3xl text-center">Timeline</h3>
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex gap-6">
                <div className="w-24 shrink-0 text-right">
                  <span className="font-medium">3:30 PM</span>
                </div>
                <div className="flex-1 pb-6 border-l-2 pl-6">
                  <h4 className="font-medium mb-1">Guest Arrival</h4>
                  <p className="text-sm text-muted-foreground">Please arrive early to find your seats</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-24 shrink-0 text-right">
                  <span className="font-medium">4:00 PM</span>
                </div>
                <div className="flex-1 pb-6 border-l-2 pl-6">
                  <h4 className="font-medium mb-1">Ceremony Begins</h4>
                  <p className="text-sm text-muted-foreground">The celebration starts!</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-24 shrink-0 text-right">
                  <span className="font-medium">5:00 PM</span>
                </div>
                <div className="flex-1 pb-6 border-l-2 pl-6">
                  <h4 className="font-medium mb-1">Cocktail Hour</h4>
                  <p className="text-sm text-muted-foreground">Drinks and light appetizers on the terrace</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-24 shrink-0 text-right">
                  <span className="font-medium">6:00 PM</span>
                </div>
                <div className="flex-1 pb-6 border-l-2 pl-6">
                  <h4 className="font-medium mb-1">Reception & Dinner</h4>
                  <p className="text-sm text-muted-foreground">Dinner service and toasts</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-24 shrink-0 text-right">
                  <span className="font-medium">8:00 PM</span>
                </div>
                <div className="flex-1 pb-6 border-l-2 pl-6">
                  <h4 className="font-medium mb-1">Dancing</h4>
                  <p className="text-sm text-muted-foreground">Let's party!</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-24 shrink-0 text-right">
                  <span className="font-medium">11:00 PM</span>
                </div>
                <div className="flex-1 pl-6">
                  <h4 className="font-medium mb-1">Send Off</h4>
                  <p className="text-sm text-muted-foreground">Sparkler exit</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Travel & Accommodations */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-serif text-4xl md:text-5xl text-center mb-12">Travel & Stay</h2>
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="font-serif text-2xl">Getting There</h3>
              <p className="text-muted-foreground leading-relaxed">
                The venue is located in beautiful Napa Valley, approximately 1 hour north of San Francisco. We recommend
                flying into San Francisco International Airport (SFO) or Oakland International Airport (OAK).
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-serif text-2xl">Where to Stay</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">We have room blocks at the following hotels:</p>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Napa Valley Lodge</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">456 Main Street, Yountville, CA</p>
                    <p className="text-sm text-muted-foreground">Book by May 15, 2025 | Group Code: SARAHMICHAEL</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Valley Inn & Suites</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">789 Valley Road, Napa, CA</p>
                    <p className="text-sm text-muted-foreground">Book by May 15, 2025 | Group Code: SARAHMICHAEL</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>We can't wait to celebrate with you!</p>
          <p className="mt-2">Sami & Dexter | June 15, 2025</p>
        </div>
      </footer>
    </div>
  )
}
