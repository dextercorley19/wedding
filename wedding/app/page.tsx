import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/common/Navigation";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <div className="relative h-full w-full">
            <Image
              src="/IMG_4372.JPG"
              alt="Wedding hero"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <div className="relative text-center space-y-6 px-4 text-white">
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-balance drop-shadow-lg">
            Sami & Dexter
          </h1>
          <p className="text-xl md:text-2xl drop-shadow-md">October 24, 2026</p>
          <p className="text-lg drop-shadow-md">Newport Beach, California</p>
        </div>
      </section>

      {/* Proposal Gallery */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16 font-serif text-muted-foreground">
            <p className="text-lg leading-relaxed">
              We’re so excited to celebrate this weekend with all of our favorite people!
            </p>
            <p className="text-lg leading-relaxed">
              While formal invitations will follow, we wanted to share a few details to help with
              travel planning. We’ll continue updating this site as the weekend approaches.
            </p>
            <p className="text-lg leading-relaxed">
              Here are a few photos from our engagement in Maui, HI
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
              <Image
                src="/IMG_4371.JPG"
                alt="Proposal moment 1"
                fill
                className="object-cover"
                loading="lazy"
                sizes="(min-width: 768px) 33vw, 100vw"
              />
            </div>
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
              <Image
                src="/IMG_4373.JPG"
                alt="Proposal moment 2"
                fill
                className="object-cover"
                loading="lazy"
                sizes="(min-width: 768px) 33vw, 100vw"
              />
            </div>
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
              <Image
                src="/IMG_4370 (2).jpg"
                alt="Proposal moment 3"
                fill
                className="object-cover"
                loading="lazy"
                sizes="(min-width: 768px) 33vw, 100vw"
              />
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
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <Image
                  src="/27_ceremony-area-Newport-Beach-Country-Club-wedding-photographer.jpg"
                  alt="Ceremony venue"
                  fill
                  className="object-cover"
                  loading="lazy"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
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
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <Image
                  src="/34135813_1738752159505266_6750061028635049984_o.jpg"
                  alt="Reception venue"
                  fill
                  className="object-cover"
                  loading="lazy"
                  sizes="(min-width: 768px) 50vw, 100vw"
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
        </div>
      </section>

      {/* Travel & Accommodations */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-serif text-4xl md:text-5xl text-center mb-12">Travel & Stay</h2>
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="font-serif text-2xl">Getting There</h3>
              <p className="text-muted-foreground leading-relaxed">We recommend flying into:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• John Wayne Airport (SNA) — 15 minutes from Newport Beach</li>
                <li>• Long Beach Airport (LGB) — ~35 minutes</li>
                <li>• Los Angeles (LAX) — ~1 hour depending on traffic</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Rideshare (Uber/Lyft) is readily available.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-serif text-2xl">Where to Stay</h3>
              <p className="text-muted-foreground leading-relaxed">
                We are gauging interest in room blocks and will update shortly.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                In the meantime, nearby options include:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Vea Hotel</li>
                <li>• Courtyard by Marriott Irvine</li>
                <li>
                  • Airbnb or VRBO on Balboa Island, Newport Peninsula, or generally anywhere in
                  Newport Beach.
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                We recommend booking early, as October is a popular time in Newport.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-serif text-4xl md:text-5xl text-center mb-12">FAQ</h2>
          <div className="space-y-8">
            <div>
              <h3 className="font-serif text-2xl mb-2">When should I RSVP?</h3>
              <p className="text-muted-foreground">
                Formal invitations will be sent closer to the wedding date.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-2xl mb-2">Can I bring a plus one?</h3>
              <p className="text-muted-foreground">
                Plus ones will be named on your invitation if included.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-2xl mb-2">What will the weather be like?</h3>
              <p className="text-muted-foreground">
                Newport Beach in October is typically sunny and mild, with cooler evenings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>We can&rsquo;t wait to celebrate with you!</p>
          <p className="mt-2">Sami & Dexter | October 24, 2026</p>
        </div>
      </footer>
    </div>
  );
}
