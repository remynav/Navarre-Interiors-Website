import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PricingSection from "@/components/PricingSection";
import PageMeta from "@/components/PageMeta";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Services"
        description="Interior design packages from finishes-only to full furnishing — Petit, Signature, and Atelier tiers."
        path="/services"
      />
      <Header />
      <main id="main-content" className="pt-20">
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
