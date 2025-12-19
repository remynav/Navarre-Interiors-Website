import { Palette, Home, Lightbulb, Ruler } from "lucide-react";

const services = [
  {
    icon: Palette,
    title: "Interior Design",
    description: "Complete room transformations with curated furnishings, color palettes, and decor that reflect your personal style.",
  },
  {
    icon: Home,
    title: "Space Planning",
    description: "Optimize your floor plan for functionality and flow, making the most of every square foot.",
  },
  {
    icon: Lightbulb,
    title: "Lighting Design",
    description: "Create ambiance and highlight architectural features with strategic lighting solutions.",
  },
  {
    icon: Ruler,
    title: "Custom Furnishings",
    description: "Bespoke furniture and millwork designed specifically for your space and lifestyle.",
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-24 bg-card">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-gold font-medium tracking-widest uppercase text-sm mb-4">
            What We Offer
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
            Our Services
          </h2>
          <p className="text-muted-foreground">
            From concept to completion, we offer comprehensive design services tailored to your unique needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group p-8 bg-background rounded-lg shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 bg-gold/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
                <service.icon className="w-7 h-7 text-gold" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                {service.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
