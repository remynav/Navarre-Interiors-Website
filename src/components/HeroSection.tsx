import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-interior.jpg";
const HeroSection = () => {
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Luxurious modern living room interior" className="w-full h-full object-cover" style={{ objectPosition: '10% 50%' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-6 py-32">
        <div className="max-w-2xl animate-slide-up">
          
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-foreground leading-tight mb-6">Your Local Palisades Design Studio</h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-lg">
            We create bespoke interiors that blend timeless elegance with modern sophistication. Your vision, our expertise.
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