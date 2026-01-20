import { Link } from "react-router-dom";
import { projects } from "@/lib/projectsData";

const PortfolioSection = () => {
  return (
    <section id="portfolio" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div>
            <p className="text-gold font-medium tracking-widest uppercase text-sm mb-4">Our Work</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground">Featured Projects</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <Link
              key={project.id}
              to={`/project/${project.id}`}
              className="group cursor-pointer block"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="relative overflow-hidden rounded-lg aspect-[4/5] mb-4">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  style={{ objectPosition: project.objectPosition || "center" }}
                />
              </div>
              <div>
                <p className="text-gold text-sm font-medium">{project.category}</p>
                <h3 className="font-display text-xl font-semibold text-foreground">{project.title}</h3>
                <p className="text-muted-foreground text-sm">{project.location}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
