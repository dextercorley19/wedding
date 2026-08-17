import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Clock, Coffee, Heart, Utensils, Wine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/common/Navigation";
import { FloralCorner, FloralDivider, FloralSprig } from "@/components/common/Floral";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation />

      {/* Hero — the photo, uncovered. Only our names sit over it. */}
      <section className="relative h-screen flex items-end justify-center">
        <div className="absolute inset-0">
          <Image
            src="/IMG_4372.JPG"
            alt="Sami and Dexter on the beach"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          {/* Gradient rather than a flat wash, so the middle of the photo stays clear. */}
          <div className="absolute inset-0 bg-gradient-to-b from-ink/25 via-transparent to-ink/60" />
        </div>

        <div className="relative w-full px-4 pb-20 text-center text-white sm:pb-24">
          <h1 className="suite-script text-6xl sm:text-7xl md:text-8xl text-balance text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
            Sami <span className="text-5xl sm:text-6xl">&amp;</span> Dexter
          </h1>
          <p className="suite-label mt-4 text-white/95 drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]">
            October 24, 2026 — Newport Beach, California
          </p>
        </div>
      </section>

      {/* The invitation, on paper rather than over the photo */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="suite-frame mx-auto max-w-xl px-6 py-12 sm:px-14 sm:py-16 text-center shadow-sm">
            {/* Corner vines, one motif mirrored into all four corners */}
            <FloralCorner className="absolute left-1 top-1 h-14 w-14 sm:h-16 sm:w-16" />
            <FloralCorner className="absolute right-1 top-1 h-14 w-14 -scale-x-100 sm:h-16 sm:w-16" />
            <FloralCorner className="absolute bottom-1 left-1 h-14 w-14 -scale-y-100 sm:h-16 sm:w-16" />
            <FloralCorner className="absolute bottom-1 right-1 h-14 w-14 -scale-100 sm:h-16 sm:w-16" />

            <div className="relative space-y-6">
              <p className="suite-script text-5xl sm:text-6xl">S&amp;D</p>
              <p className="suite-label text-muted-foreground">Together with their families</p>
              <p className="suite-script text-5xl sm:text-6xl md:text-7xl text-balance">
                Sami <span className="text-4xl sm:text-5xl">&amp;</span> Dexter
              </p>
              <p className="suite-label text-muted-foreground">
                Saturday, the twenty-fourth of October
              </p>
              <p className="font-serif text-lg text-muted-foreground">two thousand twenty-six</p>
              <FloralSprig className="pt-1" />
              <div className="space-y-1">
                <p className="suite-script text-3xl sm:text-4xl">Newport Beach Country Club</p>
                <p className="suite-label text-muted-foreground">Newport Beach, California</p>
              </div>
              <div className="pt-4">
                <Button asChild size="lg">
                  <Link href="/rsvp">RSVP</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome note */}
      <section className="pb-24">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <p className="text-xl leading-relaxed text-muted-foreground">
            We&rsquo;re so excited to celebrate this weekend with all of our favorite people!
          </p>
        </div>
      </section>

      <FloralDivider />

      {/* Event Details */}
      <section id="details" className="py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16 space-y-3">
            <p className="suite-label text-sage-deep">The Wedding Day</p>
            <h2 className="font-serif text-4xl md:text-5xl">Ceremony &amp; Reception</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Ceremony */}
            <div className="suite-frame p-8 sm:p-10">
              <div className="relative space-y-4">
                <Heart className="w-7 h-7 text-hydrangea" aria-hidden="true" />
                <h3 className="suite-script text-3xl">Ceremony</h3>
                <div className="space-y-3 text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 mt-1 shrink-0 text-sage" />
                    <p className="font-medium text-foreground">Saturday, October 24, 2026</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 mt-1 shrink-0 text-sage" />
                    <p>4:30 PM</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 mt-1 shrink-0 text-sage" />
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
            <div className="suite-frame p-8 sm:p-10">
              <div className="relative space-y-4">
                <Utensils className="w-7 h-7 text-hydrangea" aria-hidden="true" />
                <h3 className="suite-script text-3xl">Reception</h3>
                <div className="space-y-3 text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 mt-1 shrink-0 text-sage" />
                    <p className="font-medium text-foreground">Saturday, October 24, 2026</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 mt-1 shrink-0 text-sage" />
                    <p>5:00 PM - 10:30 PM</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 mt-1 shrink-0 text-sage" />
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

      <FloralDivider />

      {/* Weekend Events */}
      <section id="events" className="py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16 space-y-3">
            <p className="suite-label text-sage-deep">Join Us All Weekend</p>
            <h2 className="font-serif text-4xl md:text-5xl">Weekend Events</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Welcome Drinks */}
            <div className="suite-frame p-8 sm:p-10 space-y-4">
              <div className="relative space-y-4">
                <Wine className="w-7 h-7 text-hydrangea" aria-hidden="true" />
                <h3 className="suite-script text-3xl">Welcome Drinks</h3>
                <div className="space-y-3 text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 mt-1 shrink-0 text-sage" />
                    <p className="font-medium text-foreground">Friday, October 23, 2026</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 mt-1 shrink-0 text-sage" />
                    <p>7:30 PM - 9:30 PM</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 mt-1 shrink-0 text-sage" />
                    <div>
                      <p className="font-medium text-foreground">Balboa Yacht Club</p>
                      <p className="text-sm">Newport Beach, CA</p>
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Come say hello the night before and kick off the weekend with us.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <span className="font-medium text-foreground">Attire:</span> Yacht Club Casual —{" "}
                  <Link
                    href="/#attire"
                    className="text-hydrangea-deep underline underline-offset-4"
                  >
                    see the details
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Wedding Walk */}
            <div className="suite-frame p-8 sm:p-10 space-y-4">
              <div className="relative space-y-4">
                <Coffee className="w-7 h-7 text-hydrangea" aria-hidden="true" />
                <h3 className="suite-script text-3xl">
                  Wedding Walk{" "}
                  <span className="font-sans text-base italic text-muted-foreground">
                    (optional)
                  </span>
                </h3>
                <div className="space-y-3 text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 mt-1 shrink-0 text-sage" />
                    <p className="font-medium text-foreground">Saturday, October 24, 2026</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 mt-1 shrink-0 text-sage" />
                    <p>8:00 AM - 11:00 AM</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 mt-1 shrink-0 text-sage" />
                    <div>
                      <p className="font-medium text-foreground">Reborn Coffee</p>
                      <p className="text-sm">Newport Beach, CA</p>
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Stop by any time that morning for complimentary coffee and a map of our favorite
                  walk. Come and go as you please.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FloralDivider />

      {/* Attire */}
      <section id="attire" className="py-24">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="space-y-3 mb-10">
            <p className="suite-label text-sage-deep">Attire</p>
            <h2 className="font-serif text-4xl md:text-5xl">What to Wear</h2>
          </div>

          <div className="space-y-6 md:space-y-8">
            <div className="suite-frame p-8 sm:p-10 text-left">
              <div className="relative space-y-3">
                <p className="suite-label text-muted-foreground">Friday &middot; Welcome Drinks</p>
                <h3 className="font-serif text-3xl md:text-4xl">Yacht Club Casual</h3>
                <div className="space-y-4 leading-relaxed text-muted-foreground">
                  <p>Dress for an easy evening on the harbor.</p>
                  <p>
                    We hope you&rsquo;ll embrace the classic, preppy feel of the evening with
                    relaxed attire in Nantucket reds, deep navies, and crisp stripes.
                  </p>
                  <p>Blazers, sundresses, and boat shoes are warmly welcomed.</p>
                </div>
              </div>
            </div>

            <div className="suite-frame p-8 sm:p-10 text-left">
              <div className="relative space-y-3">
                <p className="suite-label text-muted-foreground">Saturday &middot; The Wedding</p>
                <h3 className="font-serif text-3xl md:text-4xl">Black Tie Optional</h3>
                <div className="space-y-4 leading-relaxed text-muted-foreground">
                  <p>Dress for an elegant evening by the ocean.</p>
                  <p>
                    We hope you&rsquo;ll embrace the vibrant, coastal feel of the celebration with
                    formal attire in joyful colors, beautiful prints, and elevated textures.
                  </p>
                  <p>Tuxedos or dark suits are warmly welcomed.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FloralDivider />

      {/* RSVP */}
      <section id="rsvp" className="py-24">
        <div className="container mx-auto px-4 max-w-xl">
          <div className="suite-frame px-8 py-12 sm:px-12 text-center">
            <div className="relative space-y-6">
              <FloralSprig />
              <h2 className="font-serif text-4xl md:text-5xl">RSVP</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Kindly reply for each member of your party, and let us know your dinner selection.
              </p>
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/rsvp">Reply to Our Invitation</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <FloralDivider />

      {/* Travel & Accommodations */}
      <section id="travel" className="py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12 space-y-3">
            <p className="suite-label text-sage-deep">Getting to Newport</p>
            <h2 className="font-serif text-4xl md:text-5xl">Travel &amp; Stay</h2>
          </div>
          <div className="space-y-10">
            <div className="space-y-4">
              <h3 className="suite-script text-3xl">Getting There</h3>
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
              <h3 className="suite-script text-3xl">Where to Stay</h3>
              <p className="text-muted-foreground leading-relaxed">
                We have a limited room block at the Newport Beach Marriott. Use the link below to
                reserve your room under the Corley/Colleran wedding rate.
              </p>
              <Button asChild className="w-full md:w-auto">
                <a
                  href="https://app.marriott.com/resview2?id=1778187461300&key=GRP&app=resvlink"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Book the Marriott Block
                </a>
              </Button>
              <p className="text-muted-foreground leading-relaxed">
                Additional nearby options include:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• VEA Newport Beach (Marriott)</li>
                <li>
                  • Airbnb or VRBO on Balboa Island, Newport Peninsula, or anywhere in Newport Beach
                  proper.
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                We recommend booking early, as October is a popular time in Newport.
              </p>
            </div>
          </div>
        </div>
      </section>

      <FloralDivider />

      {/* Registry */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-md text-center space-y-6">
          <p className="suite-label text-sage-deep">With Gratitude</p>
          <h2 className="font-serif text-4xl md:text-5xl">Registry</h2>
          <Link
            href="https://www.crateandbarrel.com/gift-registry/Dexter-Corley-and-Sami-Colleran/r7550856"
            target="_blank"
            rel="noopener noreferrer"
            className="suite-frame block p-8 transition-colors hover:bg-accent/40"
          >
            <span className="relative block space-y-2">
              <span className="block suite-script text-3xl">Crate &amp; Barrel</span>
              <span className="block text-sm text-muted-foreground">
                Curated home + kitchen favorites
              </span>
            </span>
          </Link>
        </div>
      </section>

      <FloralDivider />

      {/* FAQ */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12 space-y-3">
            <p className="suite-label text-sage-deep">Good to Know</p>
            <h2 className="font-serif text-4xl md:text-5xl">FAQ</h2>
          </div>
          <div className="space-y-8">
            <div>
              <h3 className="suite-script text-2xl mb-2">When should I RSVP?</h3>
              <p className="text-muted-foreground">
                As soon as you&rsquo;re able! You can{" "}
                <Link href="/rsvp" className="text-hydrangea-deep underline underline-offset-4">
                  reply online here
                </Link>
                , including your dinner selection.
              </p>
            </div>
            <div>
              <h3 className="suite-script text-2xl mb-2">Can I bring a plus one?</h3>
              <p className="text-muted-foreground">
                Plus ones will be named on your invitation if included.
              </p>
            </div>
            <div>
              <h3 className="suite-script text-2xl mb-2">What should I wear?</h3>
              <p className="text-muted-foreground">
                Black tie optional for the wedding, and yacht club casual for Friday&rsquo;s welcome
                drinks — see{" "}
                <Link href="/#attire" className="text-hydrangea-deep underline underline-offset-4">
                  Attire
                </Link>{" "}
                for the full details.
              </p>
            </div>
            <div>
              <h3 className="suite-script text-2xl mb-2">What will the weather be like?</h3>
              <p className="text-muted-foreground">
                Newport Beach in October is typically sunny and mild, with cooler evenings.
              </p>
            </div>
          </div>
        </div>
      </section>

      <FloralDivider />

      {/* Engagement photos */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12 space-y-3">
            <p className="suite-label text-sage-deep">How It Started</p>
            <h2 className="font-serif text-4xl md:text-5xl">Our Engagement</h2>
            <p className="text-lg text-muted-foreground pt-1">
              A few photos from our engagement in Maui, HI
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { src: "/IMG_4371.JPG", alt: "Proposal moment 1" },
              { src: "/IMG_4373.JPG", alt: "Proposal moment 2" },
              { src: "/IMG_4370 (2).jpg", alt: "Proposal moment 3" },
            ].map((photo) => (
              <div
                key={photo.src}
                className="relative aspect-square bg-muted overflow-hidden ring-1 ring-sage/25"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover"
                  loading="lazy"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-14 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground space-y-3">
          <FloralSprig />
          <p>We can&rsquo;t wait to celebrate with you!</p>
          <p className="suite-label">Sami &amp; Dexter — October 24, 2026</p>
        </div>
      </footer>
    </div>
  );
}
