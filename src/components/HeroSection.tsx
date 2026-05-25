import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import heroImage from "@/assets/hero-living-room.jpg";
import heroLogo from "@/assets/navarre-hero-logo.png";

const linkClass =
  "group link-underline inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-foreground/80 hover:text-gold animate-reveal-up [animation-fill-mode:both]";

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
        <div
          className="animate-hero-ui-fade pointer-events-none absolute inset-0 bg-white/35"
          aria-hidden
        />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-6 py-32">
        <div className="mx-auto max-w-2xl text-center">
          <img
            src={heroLogo}
            alt="Navarre Interiors Design Studio"
            className="animate-hero-ui-fade mx-auto mb-6 h-56 w-auto md:h-72 lg:h-96"
          />
        </div>
      </div>

      {/* Bottom row: CTAs + scroll cue — grid stacks on small screens */}
      <div className="absolute inset-x-0 bottom-8 px-6 md:bottom-10 md:px-10">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 grid-rows-[auto_auto] gap-x-8 gap-y-6 md:grid-cols-[1fr_auto_1fr] md:grid-rows-1 md:items-end md:gap-x-8 md:gap-y-0">
          <Link
            to="/contact"
            className={`${linkClass} col-start-1 row-start-1 justify-self-start [animation-delay:300ms]`}
          >
            Start a project
            <span className="inline-block transition-transform duration-500 ease-elegant group-hover:translate-x-1">→</span>
          </Link>
          <Link
            to="/portfolio"
            className={`${linkClass} col-start-2 row-start-1 justify-self-end md:col-start-3 md:justify-self-end [animation-delay:400ms]`}
          >
            View portfolio
            <span className="inline-block transition-transform duration-500 ease-elegant group-hover:translate-x-1">→</span>
          </Link>
          <div
            className="col-span-2 row-start-2 flex flex-col items-center gap-2 text-muted-foreground md:col-span-1 md:col-start-2 md:row-start-1"
            aria-hidden
          >
            <div className="h-10 w-px bg-gradient-to-b from-transparent via-border to-gold/60" />
            <ChevronDown className="h-5 w-5 animate-scroll-cue text-gold/80" strokeWidth={1.25} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
