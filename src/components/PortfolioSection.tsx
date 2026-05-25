import { Link } from "react-router-dom";
import { projects } from "@/lib/projectsData";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { cn } from "@/lib/utils";

function PortfolioCard({
  project,
  index,
}: {
  project: (typeof projects)[number];
  index: number;
}) {
  const { ref, inView } = useScrollReveal<HTMLAnchorElement>({ threshold: 0.08, rootMargin: "0px 0px -32px 0px" });

  return (
    <Link
      ref={ref}
      to={`/project/${project.id}`}
      className={cn("group block cursor-pointer", "scroll-reveal", inView && "scroll-reveal-visible")}
      style={{
        transitionDelay: inView ? `${Math.min(index * 95, 450)}ms` : "0ms",
      }}
    >
      <div className="hover-image-wrap mb-4 aspect-[4/5] rounded-lg">
        <img
          src={project.image}
          alt={project.title}
          className="h-full w-full object-cover"
          style={{ objectPosition: project.objectPosition || "center" }}
        />
      </div>
      <div className="transition-colors duration-300 group-hover:text-gold">
        <p className="text-sm font-medium text-gold">{project.category}</p>
        <h3 className="font-display text-xl font-semibold text-foreground transition-colors duration-300 group-hover:text-gold">
          {project.title}
        </h3>
        <p className="text-sm text-muted-foreground">{project.location}</p>
      </div>
    </Link>
  );
}

const PortfolioSection = () => {
  const { ref: headerRef, inView: headerInView } = useScrollReveal({ threshold: 0.15 });

  return (
    <section id="portfolio" className="bg-background py-24">
      <div className="container mx-auto px-6">
        <div
          ref={headerRef}
          className={cn(
            "mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end",
            "scroll-reveal",
            headerInView && "scroll-reveal-visible",
          )}
        >
          <div>
            <p className="eyebrow mb-4">Our Work</p>
            <h2 className="font-display text-display-lg md:text-display-xl font-semibold text-foreground text-balance tracking-tighter">
              Featured Projects
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <PortfolioCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
