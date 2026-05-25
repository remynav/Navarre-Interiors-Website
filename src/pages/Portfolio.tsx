import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PortfolioSection from "@/components/PortfolioSection";
import PageMeta from "@/components/PageMeta";

const Portfolio = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Portfolio"
        description="Explore residential interior design projects by Navarre Interiors in Pacific Palisades and beyond."
        path="/portfolio"
      />
      <Header />
      <main id="main-content" className="pt-20">
        <PortfolioSection />
      </main>
      <Footer />
    </div>
  );
};

export default Portfolio;
