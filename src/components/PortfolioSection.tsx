
import bedroomImage from "@/assets/portfolio-bedroom.jpg";
import kitchenImage from "@/assets/portfolio-kitchen.jpg";
import amalfiImage from "@/assets/portfolio-amalfi.webp";

const projects = [
  {
    image: amalfiImage,
    title: "Amalfi",
    category: "Residential",
    location: "Manhattan, NY",
    link: "https://example.com/amalfi",
  },
  {
    image: bedroomImage,
    title: "Serene Retreat",
    category: "Bedroom",
    location: "Brooklyn, NY",
  },
  {
    image: kitchenImage,
    title: "Chef's Kitchen",
    category: "Kitchen",
    location: "The Hamptons",
  },
];

const PortfolioSection = () => {
  return (
    <section id="portfolio" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div>
            <p className="text-gold font-medium tracking-widest uppercase text-sm mb-4">
              Our Work
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground">
              Featured Projects
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => {
            const CardWrapper = project.link ? 'a' : 'div';
            const cardProps = project.link ? { href: project.link, target: "_blank", rel: "noopener noreferrer" } : {};
            
            return (
              <CardWrapper
                key={project.title}
                className="group cursor-pointer block"
                style={{ animationDelay: `${index * 150}ms` }}
                {...cardProps}
              >
                <div className="relative overflow-hidden rounded-lg aspect-[4/5] mb-4">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-gold text-sm font-medium">{project.category}</p>
                    <h3 className="font-display text-2xl font-semibold text-primary-foreground">
                      {project.title}
                    </h3>
                  </div>
                </div>
                <div className="opacity-100 group-hover:opacity-0 transition-opacity">
                  <p className="text-gold text-sm font-medium">{project.category}</p>
                  <h3 className="font-display text-xl font-semibold text-foreground">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">{project.location}</p>
                </div>
              </CardWrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
