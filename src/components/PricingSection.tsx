import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { cn } from "@/lib/utils";

const pricingTiers = [
  {
    name: "Essentials",
    tagline: "Perfect for single rooms",
    price: "2,500",
    features: [
      "Single room design",
      "Color palette & mood board",
      "Furniture layout plan",
      "Shopping list with links",
      "2 revision rounds",
      "Email support",
    ],
  },
  {
    name: "Signature",
    tagline: "Our most popular package",
    price: "7,500",
    featured: true,
    features: [
      "Up to 3 rooms",
      "Full design concept",
      "3D renderings",
      "Custom furniture sourcing",
      "Project management",
      "Unlimited revisions",
      "Priority support",
    ],
  },
  {
    name: "Bespoke",
    tagline: "Complete home transformation",
    price: "25,000",
    features: [
      "Whole home design",
      "Architectural consultation",
      "Custom millwork design",
      "Vendor coordination",
      "On-site visits",
      "Dedicated project manager",
      "White-glove installation",
    ],
  },
];

function PricingCard({
  tier,
  index,
}: {
  tier: (typeof pricingTiers)[number];
  index: number;
}) {
  const { ref, inView } = useScrollReveal<HTMLDivElement>({ threshold: 0.08 });

  return (
    <div
      ref={ref}
      className={cn(
        "relative rounded-lg p-8 transition-all duration-300 ease-quiet hover:-translate-y-0.5",
        tier.featured
          ? "scale-[1.02] bg-primary text-primary-foreground shadow-elev2 md:scale-105"
          : "bg-background shadow-elev1 hover:shadow-elev2",
        "scroll-reveal",
        inView && "scroll-reveal-visible",
      )}
      style={{ transitionDelay: inView ? `${index * 100}ms` : "0ms" }}
    >
      {tier.featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-gold px-4 py-1 text-sm font-medium text-primary-foreground shadow-goldSoft">
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-8 text-center">
        <h3
          className={cn(
            "font-display mb-2 text-2xl font-semibold tracking-display",
            tier.featured ? "text-primary-foreground" : "text-foreground",
          )}
        >
          {tier.name}
        </h3>
        <p className={cn("mb-4 text-sm", tier.featured ? "text-primary-foreground/80" : "text-muted-foreground")}>
          {tier.tagline}
        </p>
        <div className="flex items-baseline justify-center gap-1">
          <span className={cn("text-sm", tier.featured ? "text-primary-foreground/80" : "text-muted-foreground")}>
            From
          </span>
          <span
            className={cn(
              "font-display text-4xl font-semibold",
              tier.featured ? "text-primary-foreground" : "text-foreground",
            )}
          >
            ${tier.price}
          </span>
        </div>
      </div>

      <ul className="mb-8 space-y-4">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <Check className={cn("mt-0.5 h-5 w-5 flex-shrink-0 text-gold")} />
            <span className={cn("text-sm", tier.featured ? "text-primary-foreground/90" : "text-muted-foreground")}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <Button variant={tier.featured ? "gold" : "gold-outline"} className="group w-full gap-2">
        Get Started
        <span className="inline-block transition-transform duration-500 ease-elegant group-hover:translate-x-1">→</span>
      </Button>
    </div>
  );
}

const PricingSection = () => {
  const headerReveal = useScrollReveal({ threshold: 0.12 });

  return (
    <section id="pricing" className="bg-card py-24">
      <div className="container mx-auto px-6">
        <div
          ref={headerReveal.ref}
          className={cn(
            "mx-auto mb-16 max-w-2xl text-center",
            "scroll-reveal",
            headerReveal.inView && "scroll-reveal-visible",
          )}
        >
          <h2 className="font-display mb-4 text-display-lg font-semibold text-foreground text-balance tracking-tighter md:text-display-xl">
            Design Packages
          </h2>
          <p className="text-muted-foreground">
            Choose the level of service that fits your vision and budget. Every package includes our signature attention
            to detail.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
          {pricingTiers.map((tier, index) => (
            <PricingCard key={tier.name} tier={tier} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
