import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { getProjectById } from "@/lib/projectsData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const project = projectId ? getProjectById(projectId) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [projectId]);

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-24">
          <Link
            to="/portfolio"
            className="link-underline mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Portfolio
          </Link>
          <h1 className="font-display text-display-md font-semibold text-foreground md:text-display-lg">
            Project not found
          </h1>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-24 pt-28">
        <Link
          to="/portfolio"
          className="link-underline mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Portfolio
        </Link>

        <div className="mb-10">
          <p className="eyebrow mb-4">{project.category}</p>
          <h1 className="font-display mb-2 text-display-lg font-semibold text-foreground text-balance tracking-tighter md:text-display-xl">
            {project.title}
          </h1>
          <p className="text-muted-foreground">{project.location}</p>
        </div>

        {/* Photo Gallery */}
        <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          {project.photos.map((photo, index) => (
            <div
              key={index}
              className={cn(
                "hover-image-wrap group rounded-lg",
                index === 0 && project.photos.length === 1 ? "md:col-span-2" : "",
              )}
            >
              <img
                src={photo}
                alt={`${project.title} - Photo ${index + 1}`}
                className="h-full w-full object-cover"
                style={{ objectPosition: project.objectPosition || "center" }}
              />
              <div className="hover-image-caption">
                <div className="hover-image-caption-inner">
                  <div className="flex items-end justify-between gap-3">
                    <span className="font-display text-xl font-semibold text-primary-foreground">{project.title}</span>
                    <span className="text-2xl font-light text-primary-foreground transition-transform duration-500 ease-elegant group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-primary-foreground/75">
                    {index + 1} / {project.photos.length}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="max-w-3xl">
          <h2 className="font-display mb-4 text-2xl font-semibold tracking-display text-foreground md:text-display-md">
            About This Project
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">{project.description}</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProjectDetail;
