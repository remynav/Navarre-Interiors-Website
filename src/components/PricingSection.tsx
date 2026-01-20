import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
const pricingTiers = [{
  name: "Essentials",
  tagline: "Perfect for single rooms",
  price: "2,500",
  features: ["Single room design", "Color palette & mood board", "Furniture layout plan", "Shopping list with links", "2 revision rounds", "Email support"]
}, {
  name: "Signature",
  tagline: "Our most popular package",
  price: "7,500",
  featured: true,
  features: ["Up to 3 rooms", "Full design concept", "3D renderings", "Custom furniture sourcing", "Project management", "Unlimited revisions", "Priority support"]
}, {
  name: "Bespoke",
  tagline: "Complete home transformation",
  price: "25,000",
  features: ["Whole home design", "Architectural consultation", "Custom millwork design", "Vendor coordination", "On-site visits", "Dedicated project manager", "White-glove installation"]
}];
const PricingSection = () => {
  return <section id="pricing" className="py-24 bg-card">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
            Design Packages
          </h2>
          <p className="text-muted-foreground">
            Choose the level of service that fits your vision and budget. Every package includes our signature attention to detail.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map(tier => <div key={tier.name} className={`relative p-8 rounded-lg transition-all duration-300 hover:-translate-y-1 ${tier.featured ? "bg-primary text-primary-foreground shadow-medium scale-105" : "bg-background shadow-soft hover:shadow-medium"}`}>
              {tier.featured && <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gold text-primary px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>}
              
              <div className="text-center mb-8">
                <h3 className={`font-display text-2xl font-semibold mb-2 ${tier.featured ? "text-primary-foreground" : "text-foreground"}`}>
                  {tier.name}
                </h3>
                <p className={`text-sm mb-4 ${tier.featured ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {tier.tagline}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className={`text-sm ${tier.featured ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    From
                  </span>
                  <span className={`font-display text-4xl font-semibold ${tier.featured ? "text-primary-foreground" : "text-foreground"}`}>
                    ${tier.price}
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {tier.features.map(feature => <li key={feature} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${tier.featured ? "text-gold" : "text-gold"}`} />
                    <span className={`text-sm ${tier.featured ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                      {feature}
                    </span>
                  </li>)}
              </ul>

              <Button variant={tier.featured ? "gold" : "gold-outline"} className="w-full">
                Get Started
              </Button>
            </div>)}
        </div>
      </div>
    </section>;
};
export default PricingSection;