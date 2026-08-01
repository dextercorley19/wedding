import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/common/Navigation";
import { FloralDivider, FloralSprig } from "@/components/common/Floral";

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

      <div className="pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12 space-y-3">
            <FloralSprig />
            <p className="suite-label text-sage-deep">With Gratitude</p>
            <h1 className="font-serif text-5xl md:text-6xl">Registry</h1>
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

          <FloralDivider className="mt-16" />
        </div>
      </div>
    </div>
  );
}
