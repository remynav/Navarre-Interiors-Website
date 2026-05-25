import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <PageMeta title="Page not found" description="The page you requested could not be found." />
      <Header />
      <main id="main-content" className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-6 py-24 pt-28 text-center">
        <p className="eyebrow mb-4">404</p>
        <h1 className="font-display mb-4 text-display-md font-semibold text-foreground md:text-display-lg">
          Page not found
        </h1>
        <p className="mb-8 max-w-md text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="gold" asChild>
            <Link to="/">Return home</Link>
          </Button>
          <Button variant="gold-outline" asChild>
            <Link to="/portfolio">View portfolio</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
