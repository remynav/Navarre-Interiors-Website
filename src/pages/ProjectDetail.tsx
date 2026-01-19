import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getProjectById } from "@/lib/projectsData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const project = projectId ? getProjectById(projectId) : undefined;

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-24">
          <Link
            to="/#portfolio"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portfolio
          </Link>
          <h1 className="font-display text-4xl font-semibold text-foreground">
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
      <main className="container mx-auto px-6 py-24">
        <Link
          to="/#portfolio"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Portfolio
        </Link>

        <div className="mb-8">
          <p className="text-gold font-medium tracking-widest uppercase text-sm mb-2">
            {project.category}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-2">
            {project.title}
          </h1>
          <p className="text-muted-foreground">{project.location}</p>
        </div>

        {/* Photo Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {project.photos.map((photo, index) => (
            <div
              key={index}
              className={`overflow-hidden rounded-lg ${
                index === 0 && project.photos.length === 1
                  ? "md:col-span-2"
                  : ""
              }`}
            >
              <img
                src={photo}
                alt={`${project.title} - Photo ${index + 1}`}
                className="w-full h-auto object-cover"
                style={{ objectPosition: project.objectPosition || "center" }}
              />
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="max-w-3xl">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
            About This Project
          </h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            {project.description}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProjectDetail;
