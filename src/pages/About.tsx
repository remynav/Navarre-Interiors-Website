import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AboutSection from "@/components/AboutSection";
import PageMeta from "@/components/PageMeta";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="About"
        description="Meet Navarre Interiors — a Pacific Palisades design studio focused on thoughtful, full-home residential interiors."
        path="/about"
      />
      <Header />
      <main id="main-content" className="pt-20">
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
};

export default About;
