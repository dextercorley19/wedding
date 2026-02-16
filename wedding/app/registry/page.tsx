import { Gift, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/common/Navigation";

export default function RegistryPage() {
  const registries = [
    {
      name: "Amazon",
      description: "Home essentials and everyday items",
      url: "https://amazon.com",
      icon: "📦",
    },
    {
      name: "Crate & Barrel",
      description: "Kitchen and dining favorites",
      url: "https://crateandbarrel.com",
      icon: "🏺",
    },
    {
      name: "Zola",
      description: "Our complete registry",
      url: "https://zola.com",
      icon: "💝",
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
            <h1 className="font-serif text-5xl md:text-6xl mb-4">Registry</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Your presence at our wedding is the greatest gift of all. However, if you wish to
              honor us with a gift, we've registered at the following stores.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {registries.map((registry) => (
              <div
                key={registry.name}
                className="p-8 bg-muted/30 rounded-lg border hover:border-foreground/20 transition-colors"
              >
                <div className="text-4xl mb-4">{registry.icon}</div>
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

          <div className="mt-16 p-8 bg-muted/30 rounded-lg text-center">
            <h3 className="font-serif text-2xl mb-4">Honeymoon Fund</h3>
            <p className="text-muted-foreground leading-relaxed">
              We're also saving for our dream honeymoon to Japan. If you'd like to contribute, we've
              set up a honeymoon fund through our Zola registry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
