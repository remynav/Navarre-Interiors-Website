import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import PageMeta from "@/components/PageMeta";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageMeta title={SITE_NAME} description={SITE_TAGLINE} path="/" />
      <Header />
      <main id="main-content">
        <HeroSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
