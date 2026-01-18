import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-living-room.jpg";
import heroLogo from "@/assets/navarre-hero-logo.png";

const HeroSection = () => {
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Luxurious modern living room interior" className="w-full h-full object-cover" style={{ objectPosition: '10% 80%' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-6 py-32">
        <div className="max-w-2xl mx-auto text-center animate-slide-up">
          
          <img src={heroLogo} alt="Navarre Interiors Design Studio" className="h-56 md:h-72 lg:h-96 w-auto mb-6 mx-auto" />
          <p className="text-lg text-muted-foreground mb-8">
            Your Local Palisades Design Studio
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#contact">
              <Button variant="hero" size="xl">
                Start Your Project
              </Button>
            </a>
            <a href="#portfolio">
              <Button variant="hero-outline" size="xl">
                View Portfolio
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-muted-foreground/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-muted-foreground/50 rounded-full mt-2" />
        </div>
      </div>
    </section>;
};
export default HeroSection;