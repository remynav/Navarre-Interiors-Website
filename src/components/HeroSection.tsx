import { Link } from "react-router-dom";

import heroImage from "@/assets/hero-living-room.webp";

const linkClass =
  "group link-underline inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-foreground/80 hover:text-gold animate-reveal-up [animation-fill-mode:both]";

const HeroSection = () => {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Luxurious modern living room interior"
          className="h-full w-full object-cover"
          style={{ objectPosition: "10% 80%" }}
          fetchPriority="high"
          decoding="async"
        />
        {/* Darker on the right, fading to nearly clear on the left */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/0 via-background/25 to-background/80" />
        <div
          className="animate-hero-ui-fade pointer-events-none absolute inset-0 bg-white/10"
          aria-hidden
        />
      </div>

      {/* Content — right-aligned headline block */}
      <div className="relative container mx-auto px-6 py-32">
        <div className="ml-auto max-w-xl text-left md:max-w-2xl md:pr-4 lg:pr-8">
          <h1 className="animate-hero-ui-fade font-serif text-4xl leading-[1.1] text-foreground sm:text-5xl md:text-6xl lg:text-[4.25rem]">
            Thoughtful design.
            <br />
            Transparent pricing.
            <br />
            <span className="italic text-gold/90">A clearer way to create home.</span>
          </h1>
        </div>
      </div>

      {/* Bottom row: CTAs */}
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
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
