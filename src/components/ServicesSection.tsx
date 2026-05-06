import { Palette, Home, Lightbulb, Ruler } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { cn } from "@/lib/utils";

const services = [
  {
    icon: Palette,
    title: "Interior Design",
    description:
      "Complete room transformations with curated furnishings, color palettes, and decor that reflect your personal style.",
  },
  {
    icon: Home,
    title: "Space Planning",
    description:
      "Optimize your floor plan for functionality and flow, making the most of every square foot.",
  },
  {
    icon: Lightbulb,
    title: "Lighting Design",
    description:
      "Create ambiance and highlight architectural features with strategic lighting solutions.",
  },
  {
    icon: Ruler,
    title: "Custom Furnishings",
    description:
      "Bespoke furniture and millwork designed specifically for your space and lifestyle.",
  },
];

function ServiceCard({
  service,
  index,
}: {
  service: (typeof services)[number];
  index: number;
}) {
  const { ref, inView } = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className={cn(
        "group rounded-lg bg-background p-8 shadow-elev1 transition-all duration-300 ease-quiet hover:-translate-y-0.5 hover:shadow-elev2",
        "scroll-reveal",
        inView && "scroll-reveal-visible",
      )}
      style={{ transitionDelay: inView ? `${Math.min(index * 85, 400)}ms` : "0ms" }}
    >
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-gold/10 transition-all duration-300 ease-quiet group-hover:rotate-3 group-hover:scale-105 group-hover:bg-gold/20">
        <service.icon className="h-7 w-7 text-gold transition-transform duration-300 group-hover:scale-110" />
      </div>
      <h3 className="font-display mb-3 text-xl font-semibold tracking-display text-foreground transition-colors duration-300 group-hover:text-gold">
        {service.title}
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{service.description}</p>
    </div>
  );
}

const ServicesSection = () => {
  const headerReveal = useScrollReveal({ threshold: 0.15 });

  return (
    <section id="services" className="bg-card py-24">
      <div className="container mx-auto px-6">
        <div
          ref={headerReveal.ref}
          className={cn(
            "mx-auto mb-16 max-w-2xl text-center",
            "scroll-reveal",
            headerReveal.inView && "scroll-reveal-visible",
          )}
        >
          <p className="eyebrow mb-4 justify-center">What We Offer</p>
          <h2 className="font-display mb-4 text-display-lg font-semibold text-foreground text-balance tracking-tighter md:text-display-xl">
            Our Services
          </h2>
          <p className="text-muted-foreground">
            From concept to completion, we offer comprehensive design services tailored to your unique needs.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <ServiceCard key={service.title} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
