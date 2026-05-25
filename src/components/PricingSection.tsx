import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { cn } from "@/lib/utils";

type PricingTier = {
  name: string;
  price: string;
  hourlyRate: string;
  scopeLine: string;
  summary?: string;
  includes: string[];
  term: string;
  hours: string;
  meetings: string;
  storeVisits: string;
};

const pricingTiers: PricingTier[] = [
  {
    name: "Petit Package",
    price: "50k",
    hourlyRate: "$200/hr",
    scopeLine: "Up to 4 bedrooms/5 baths or 5000 sq ft",
    summary: "Finishes only (no furnishings or window treatments)",
    includes: [
      "Flooring (wood, stone, tile)",
      "Slab + countertop selections",
      "Tile layouts (bathrooms, backsplashes)",
      "Cabinet finishes, profiles, hardware",
      "Plumbing fixtures (finish/color/style)",
      "Paint colors, wall treatments",
      "Door styles, trim details",
      "Lighting selection (sometimes overlaps with lighting designer)",
      "Coordination with architect + builder",
    ],
    term: "12 months' term",
    hours: "250 hours",
    meetings: "20 in-person meetings",
    storeVisits: "3 store visits",
  },
  {
    name: "Signature package",
    packageLabel: "PACKAGE 2",
    price: "65k",
    hourlyRate: "$185/hr",
    scopeLine: "Up to 6 bedrooms/7 baths or 5000+ sq ft",
    summary: "Pre-planning + finishes",
    includes: [
      "All Petit Package finishes scope",
      "Lighting pre-plan",
      "Window and door choices/casings",
      "Baseboards/mouldings",
      "Layout fixes",
      "Exterior material/color choices",
      "Roofing choices",
    ],
    term: "18 months' term",
    hours: "350 hours",
    meetings: "30 in-person meetings",
    storeVisits: "5 store visits",
  },
  {
    name: "Atelier package",
    packageLabel: "PACKAGE 3",
    price: "125k",
    hourlyRate: "$156/hr",
    scopeLine: "Up to 7000+ sq ft",
    summary: "Pre-planning + finishes + furnishing",
    includes: [
      "All Signature package scope",
      "All furnishings",
      "Window treatments",
    ],
    term: "24 months' term",
    hours: "800 hours",
    meetings: "50 in-person meetings",
    storeVisits: "20 store visits",
  },
];

function FeatureList({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={cn("space-y-3", className)}>
      {items.map((feature) => (
        <li key={feature} className="flex items-start gap-3">
          <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold" />
          <span className="text-sm text-muted-foreground">{feature}</span>
        </li>
      ))}
    </ul>
  );
}

function PricingCard({ tier, index }: { tier: PricingTier; index: number }) {
  const { ref, inView } = useScrollReveal<HTMLDivElement>({ threshold: 0.08 });

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-full flex-col rounded-lg bg-background p-8 shadow-elev1 transition-shadow duration-300 ease-quiet hover:shadow-elev2",
        "scroll-reveal",
        inView && "scroll-reveal-visible",
      )}
      style={{ transitionDelay: inView ? `${index * 100}ms` : "0ms" }}
    >
      <div className="mb-6 text-center">
        <p className="eyebrow mb-2 text-gold">{tier.packageLabel}</p>
        <h3 className="font-display mb-2 text-2xl font-semibold tracking-display text-foreground">{tier.name}</h3>
        <p className="mb-1 text-sm text-muted-foreground">{tier.scopeLine}</p>
        {tier.summary && <p className="text-sm font-medium text-foreground/90">{tier.summary}</p>}
      </div>

      <div className="mb-6 text-center">
        <div className="flex items-baseline justify-center gap-2">
          <span className="font-display text-4xl font-semibold text-foreground">${tier.price}</span>
          <span className="text-sm text-muted-foreground">({tier.hourlyRate})</span>
        </div>
      </div>

      <div className="mb-6 flex-1 space-y-6">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/70">Includes</p>
          <FeatureList items={tier.includes} />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border/50 pt-6 text-sm text-muted-foreground">
        <span>{tier.term}</span>
        <span>{tier.hours}</span>
        <span>{tier.meetings}</span>
        <span>{tier.storeVisits}</span>
      </div>

      <Button variant="gold-outline" className="group w-full gap-2">
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
            Full-home interior design services from finishes through furnishing. Choose the package that matches your
            home&apos;s scale and the level of planning you need.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-8 md:grid-cols-3">
          {pricingTiers.map((tier, index) => (
            <PricingCard key={tier.packageLabel} tier={tier} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
