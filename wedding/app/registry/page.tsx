import { Gift, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/common/Navigation";

export default function RegistryPage() {
  const registries = [
    {
      name: "Crate & Barrel",
      description: "Our full registry of home + kitchen favorites",
      url: "https://www.crateandbarrel.com/gift-registry/Dexter-Corley-and-Sami-Colleran/r7550856",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <Gift className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
            <h1 className="font-serif text-5xl md:text-6xl">Registry</h1>
          </div>

          <div className="max-w-md mx-auto">
            {registries.map((registry) => (
              <div
                key={registry.name}
                className="p-8 bg-muted/30 rounded-lg border text-center"
              >
                <h3 className="font-serif text-2xl mb-2">{registry.name}</h3>
                <p className="text-sm text-muted-foreground mb-6">{registry.description}</p>
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
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
