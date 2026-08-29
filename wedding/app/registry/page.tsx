import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/common/Navigation";
import { FloralDivider, FloralSprig } from "@/components/common/Floral";
import { VENMO_HANDLE, venmoPaymentUrl } from "@/lib/venmo";

export default function RegistryPage() {
  const registries = [
    {
      name: "Crate & Barrel",
      description: "Our full registry of home + kitchen favorites",
      url: "https://www.crateandbarrel.com/gift-registry/Dexter-Corley-and-Sami-Colleran/r7550856",
    },
  ];

  // Both funds land on the same Venmo account; the note is what tells us
  // which one a gift was meant for.
  const funds = [
    {
      name: "Honeymoon Fund",
      description: "Help send us somewhere warm, with a long flight and no alarm clocks",
      note: "Honeymoon Fund",
    },
    {
      name: "House Fund",
      description: "A little something toward the first home we'll fill together",
      note: "House Fund",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation />

      <div className="pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12 space-y-3">
            <FloralSprig />
            <p className="suite-label text-sage-deep">With Gratitude</p>
            <h1 className="font-serif text-5xl md:text-6xl">Registry</h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Your presence is the gift. If you&apos;d like to give something more, here&apos;s
              where to find us.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            {registries.map((registry) => (
              <div key={registry.name} className="suite-frame p-8 text-center">
                <div className="relative space-y-6">
                  <div className="space-y-2">
                    <h3 className="suite-script text-3xl">{registry.name}</h3>
                    <p className="text-sm text-muted-foreground">{registry.description}</p>
                  </div>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <a
                      href={registry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      Visit Registry
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <FloralDivider className="my-16" />

          <div className="text-center mb-10 space-y-3">
            <p className="suite-label text-sage-deep">In Lieu of a Box</p>
            <h2 className="font-serif text-4xl md:text-5xl">Honeymoon &amp; Home</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 max-w-3xl mx-auto">
            {funds.map((fund) => (
              <div key={fund.name} className="suite-frame p-8 text-center">
                <div className="relative space-y-6">
                  <div className="space-y-2">
                    <h3 className="suite-script text-3xl">{fund.name}</h3>
                    <p className="text-sm text-muted-foreground">{fund.description}</p>
                  </div>
                  <div className="space-y-3">
                    <Button asChild variant="outline" className="w-full bg-transparent">
                      <a
                        href={venmoPaymentUrl(fund.note)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        Give via Venmo
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                    {/* Shown as text too: the deep link only opens the app on
                        mobile, so desktop guests need something to search for. */}
                    <p className="text-sm text-muted-foreground">
                      or search <span className="text-foreground">{VENMO_HANDLE}</span> on Venmo
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <FloralDivider className="mt-16" />
        </div>
      </div>
    </div>
  );
}
