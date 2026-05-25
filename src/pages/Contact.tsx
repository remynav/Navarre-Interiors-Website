import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import PageMeta from "@/components/PageMeta";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Contact"
        description="Start your interior design project with Navarre Interiors. Schedule a consultation in Pacific Palisades."
        path="/contact"
      />
      <Header />
      <main id="main-content" className="pt-20">
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
