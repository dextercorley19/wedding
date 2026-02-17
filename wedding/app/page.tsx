import Link from "next/link"
import { Calendar, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/common/Navigation"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <img src="/IMG_4370 (2).jpg" alt="Wedding hero" className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <div className="relative text-center space-y-6 px-4 text-white">
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-balance drop-shadow-lg">Sami & Dexter</h1>
          <p className="text-xl md:text-2xl drop-shadow-md">October 24, 2026</p>
          <p className="text-lg drop-shadow-md">We're getting married!</p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/rsvp">RSVP Now</Link>
          </Button>
        </div>
      </section>

      {/* Proposal Gallery */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-serif text-4xl md:text-5xl text-center mb-16">The Proposal</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img src="/IMG_4371.JPG" alt="Proposal moment 1" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img src="/IMG_4373.JPG" alt="Proposal moment 2" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img src="/IMG_4372.JPG" alt="Proposal moment 3" className="w-full h-full object-cover" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* Event Details */}
      <section id="details" className="py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-serif text-4xl md:text-5xl text-center mb-16">Event Details</h2>

          <div className="grid md:grid-cols-2 gap-6 md:gap-12">
            {/* Ceremony */}
            <div className="space-y-6">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img src="/27_ceremony-area-Newport-Beach-Country-Club-wedding-photographer.jpg" alt="Ceremony venue" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="space-y-4">
                <h3 className="font-serif text-2xl">Ceremony</h3>
                <div className="space-y-3 text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Saturday, October 24, 2026</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 mt-0.5 shrink-0" />
                    <p>5:00 PM</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Newport Beach Country Club</p>
                      <p className="text-sm">One Clubhouse Dr</p>
                      <p className="text-sm">Newport Beach, CA 92660</p>
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
                  loading="lazy"
                />
              </div>
              <div className="space-y-4">
                <h3 className="font-serif text-2xl">Reception</h3>
                <div className="space-y-3 text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Saturday, October 24, 2026</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 mt-0.5 shrink-0" />
                    <p>6:30 PM - 10:30 PM</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Newport Beach Country Club</p>
                      <p className="text-sm">One Clubhouse Dr</p>
                      <p className="text-sm">Newport Beach, CA 92660</p>
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
              <div className="flex gap-4 md:gap-6">
                <div className="w-16 md:w-24 shrink-0 text-right">
                  <span className="font-medium text-sm md:text-base">4:30 PM</span>
                </div>
                <div className="flex-1 pb-6 border-l-2 pl-4 md:pl-6">
                  <h4 className="font-medium mb-1">Guest Arrival</h4>
                  <p className="text-sm text-muted-foreground">Please arrive early to find your seats</p>
                </div>
              </div>
              <div className="flex gap-4 md:gap-6">
                <div className="w-16 md:w-24 shrink-0 text-right">
                  <span className="font-medium text-sm md:text-base">5:00 PM</span>
                </div>
                <div className="flex-1 pb-6 border-l-2 pl-4 md:pl-6">
                  <h4 className="font-medium mb-1">Ceremony Begins</h4>
                  <p className="text-sm text-muted-foreground">The celebration starts!</p>
                </div>
              </div>
              <div className="flex gap-4 md:gap-6">
                <div className="w-16 md:w-24 shrink-0 text-right">
                  <span className="font-medium text-sm md:text-base">5:30 PM</span>
                </div>
                <div className="flex-1 pb-6 border-l-2 pl-4 md:pl-6">
                  <h4 className="font-medium mb-1">Cocktail Hour</h4>
                  <p className="text-sm text-muted-foreground">Drinks and light appetizers on the terrace</p>
                </div>
              </div>
              <div className="flex gap-4 md:gap-6">
                <div className="w-16 md:w-24 shrink-0 text-right">
                  <span className="font-medium text-sm md:text-base">6:30 PM</span>
                </div>
                <div className="flex-1 pb-6 border-l-2 pl-4 md:pl-6">
                  <h4 className="font-medium mb-1">Reception & Dinner</h4>
                  <p className="text-sm text-muted-foreground">Dinner service and toasts</p>
                </div>
              </div>
              <div className="flex gap-4 md:gap-6">
                <div className="w-16 md:w-24 shrink-0 text-right">
                  <span className="font-medium text-sm md:text-base">7:30 PM</span>
                </div>
                <div className="flex-1 pb-6 border-l-2 pl-4 md:pl-6">
                  <h4 className="font-medium mb-1">Dancing</h4>
                  <p className="text-sm text-muted-foreground">Let's party!</p>
                </div>
              </div>
              <div className="flex gap-4 md:gap-6">
                <div className="w-16 md:w-24 shrink-0 text-right">
                  <span className="font-medium text-sm md:text-base">10:30 PM</span>
                </div>
                <div className="flex-1 pl-4 md:pl-6">
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
                The venue is located in beautiful Newport Beach, Orange County, approximately 1 hour south of Los Angeles. We recommend
                flying into Los Angeles International Airport (LAX) or John Wayne Airport (SNA) in Orange County.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-serif text-2xl">Where to Stay</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">We have room blocks at the following hotels:</p>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Balboa Bay Resort</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">651 Yacht Club Drive, Newport Beach, CA 92663</p>
                    <p className="text-sm text-muted-foreground">Book by August 24, 2026 | Group Code: SAMIANDDEXTER</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Island Hotel Newport Beach</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">690 Newport Center Drive, Newport Beach, CA 92660</p>
                    <p className="text-sm text-muted-foreground">Book by August 24, 2026 | Group Code: SAMIANDDEXTER</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Pelican Hill Resort</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">22551 Pelican Hill Road South, Newport Beach, CA 92657</p>
                    <p className="text-sm text-muted-foreground">Book by August 24, 2026 | Group Code: SAMIANDDEXTER</p>
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
          <p className="mt-2">Sami & Dexter | October 24, 2026</p>
        </div>
      </footer>
    </div>
  )
}
