import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import heroImage from "@/assets/hero-living-room.jpg";
import heroLogo from "@/assets/navarre-hero-logo.png";

const HeroSection = () => {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Luxurious modern living room interior"
          className="h-full w-full object-cover"
          style={{ objectPosition: "10% 80%" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/82 via-background/48 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-6 py-32">
        <div className="mx-auto max-w-2xl text-center">
          <img
            src={heroLogo}
            alt="Navarre Interiors Design Studio"
            className="animate-reveal-fade mx-auto mb-6 h-56 w-auto md:h-72 lg:h-96"
          />

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <a href="#contact" className="inline-flex justify-center">
              <Button variant="hero" size="xl" className="group min-w-[200px] animate-reveal-up gap-3">
                <span>Start Your Project</span>
                <span className="inline-block transition-transform duration-500 ease-elegant group-hover:translate-x-1">
                  →
                </span>
              </Button>
            </a>
            <a href="#portfolio" className="inline-flex justify-center">
              <Button
                variant="hero-outline"
                size="xl"
                className="group min-w-[200px] animate-reveal-up gap-3 [animation-delay:140ms] [animation-fill-mode:both]"
              >
                <span>View Portfolio</span>
                <span className="inline-block transition-transform duration-500 ease-elegant group-hover:translate-x-1">
                  →
                </span>
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground"
        aria-hidden
      >
        <div className="h-10 w-px bg-gradient-to-b from-transparent via-border to-gold/60" />
        <ChevronDown className="h-5 w-5 animate-scroll-cue text-gold/80" strokeWidth={1.25} />
      </div>
    </section>
  );
};

export default HeroSection;
